const Booking = require('../models/bookingModel');
const Room = require('../models/roomModel');
const Payment = require('../models/paymentModel');

// Concurrency mutex lock map for in-flight room reservation requests
const roomLocks = new Map();

const acquireLock = async (roomId, timeoutMs = 5000) => {
  const startTime = Date.now();
  while (roomLocks.has(roomId)) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error('Server is busy processing reservations for this room. Please try again.');
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  roomLocks.set(roomId, Date.now());
};

const releaseLock = (roomId) => {
  roomLocks.delete(roomId);
};

// @desc    Create a new room booking (Server calculates nights and total price)
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  const { roomId, checkIn, checkOut, guestName, guestPhone, guestCount, specialRequests } = req.body;

  if (!roomId || !checkIn || !checkOut || !guestName || !guestPhone) {
    return res.status(400).json({
      success: false,
      message: 'Please provide roomId, checkIn date, checkOut date, guestName, and guestPhone.'
    });
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid check-in or check-out date format.'
    });
  }

  if (checkInDate < now) {
    return res.status(400).json({
      success: false,
      message: 'Check-in date cannot be in the past.'
    });
  }

  if (checkOutDate <= checkInDate) {
    return res.status(400).json({
      success: false,
      message: 'Check-out date must be at least one day after check-in date.'
    });
  }

  // Calculate total nights strictly on the server
  const msPerDay = 1000 * 60 * 60 * 24;
  const totalNights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / msPerDay);
  if (totalNights < 1) {
    return res.status(400).json({
      success: false,
      message: 'Minimum reservation is 1 night.'
    });
  }

  try {
    // Acquire mutex lock on roomId to ensure concurrency-safe booking creation
    await acquireLock(roomId.toString());

    // 1. Fetch room
    const room = await Room.findById(roomId);
    if (!room || !room.isActive) {
      releaseLock(roomId.toString());
      return res.status(404).json({
        success: false,
        message: 'The selected room is inactive or no longer available.'
      });
    }

    // 2. Validate capacity
    if (guestCount && Number(guestCount) > room.capacity) {
      releaseLock(roomId.toString());
      return res.status(400).json({
        success: false,
        message: `The selected room has a maximum capacity of ${room.capacity} guest(s).`
      });
    }

    // 3. Concurrency check: overlapping active bookings
    const overlappingBooking = await Booking.findOne({
      room: room._id,
      status: { $in: ['pending', 'confirmed'] },
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate }
    });

    if (overlappingBooking) {
      releaseLock(roomId.toString());
      return res.status(409).json({
        success: false,
        message: 'This room has already been reserved by another guest for the selected dates.'
      });
    }

    // 4. Calculate total amount strictly on server
    const pricePerNight = room.pricePerNight;
    const totalAmount = totalNights * pricePerNight;

    // 5. Generate human-readable unique booking ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const bookingId = `HP-${datePrefix}-${randomSuffix}`;

    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      room: room._id,
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalNights,
      pricePerNight,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      specialRequests: specialRequests ? specialRequests.trim() : ''
    });

    // Populate room info before sending back
    const populatedBooking = await Booking.findById(booking._id).populate('room');

    releaseLock(roomId.toString());

    return res.status(201).json({
      success: true,
      message: 'Reservation initiated. Please proceed to payment to confirm your booking.',
      booking: populatedBooking
    });
  } catch (error) {
    releaseLock(roomId.toString());
    console.error('createBooking error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating booking.'
    });
  }
};

// @desc    Get all bookings for the logged-in customer
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('room')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('getMyBookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving your reservations.'
    });
  }
};

// @desc    Get a specific booking by ID (only owner or admin)
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('room')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Access control: customer can only view their own booking
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this booking.'
      });
    }

    return res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('getBookingById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving booking details.'
    });
  }
};

// @desc    Cancel a booking with policy enforcement and refund processing
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Authorization check
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this reservation.'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled.'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed reservations cannot be cancelled.'
      });
    }

    // Cancellation policy: check if reservation has already started
    const now = new Date();
    if (new Date(booking.checkIn) <= now) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation policy: Bookings cannot be cancelled on or after the scheduled check-in date.'
      });
    }

    const previousPaymentStatus = booking.paymentStatus;
    booking.status = 'cancelled';

    let refundDetails = null;
    if (previousPaymentStatus === 'paid') {
      booking.paymentStatus = 'refunded';

      // Process sandbox refund
      const refundTxId = `REF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const paymentRecord = await Payment.findOne({ booking: booking._id });

      if (paymentRecord) {
        paymentRecord.status = 'refunded';
        paymentRecord.refundTransactionId = refundTxId;
        paymentRecord.refundAmount = booking.totalAmount;
        await paymentRecord.save();
      }

      refundDetails = {
        refundedAmount: booking.totalAmount,
        refundTransactionId: refundTxId,
        message: 'Refund has been successfully processed to the original payment method.'
      };
    }

    await booking.save();
    const updated = await Booking.findById(booking._id).populate('room');

    return res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully.',
      booking: updated,
      refund: refundDetails
    });
  } catch (error) {
    console.error('cancelBooking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing cancellation.'
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking
};
