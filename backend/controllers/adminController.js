const Room = require('../models/roomModel');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const Payment = require('../models/paymentModel');

// @desc    Get dashboard metrics & summary statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const activeRooms = await Room.countDocuments({ isActive: true });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });

    // Calculate revenue from all successfully paid bookings
    const revenueAggregation = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;

    // Retrieve recent bookings
    const recentBookings = await Booking.find()
      .populate('room', 'name roomNumber type pricePerNight')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(6);

    // Group bookings by room type for insights
    const roomTypeStats = await Booking.aggregate([
      {
        $lookup: {
          from: 'rooms',
          localField: 'room',
          foreignField: '_id',
          as: 'roomData'
        }
      },
      { $unwind: '$roomData' },
      {
        $group: {
          _id: '$roomData.type',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalRooms,
        activeRooms,
        totalCustomers,
        totalBookings,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        completedBookings,
        totalRevenue
      },
      recentBookings,
      roomTypeStats
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving dashboard statistics.'
    });
  }
};

// @desc    Get all bookings with filtering and search
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const { search, status, paymentStatus, page = 1, limit = 50 } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { guestName: { $regex: search, $options: 'i' } },
        { guestPhone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('room')
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      bookings
    });
  } catch (error) {
    console.error('getAllBookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving admin bookings.'
    });
  }
};

// @desc    Update booking status by admin (e.g. check-in, complete, cancel, refund)
// @route   PATCH /api/admin/bookings/:id/status
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const booking = await Booking.findById(req.params.id).populate('room');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking status.'
      });
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status.'
      });
    }

    // Process refund workflow if cancelled
    if (status === 'cancelled' && booking.paymentStatus === 'paid' && paymentStatus !== 'paid') {
      booking.paymentStatus = 'refunded';
      const paymentRecord = await Payment.findOne({ booking: booking._id });
      if (paymentRecord) {
        paymentRecord.status = 'refunded';
        paymentRecord.refundTransactionId = `REF-ADM-${Date.now()}`;
        paymentRecord.refundAmount = booking.totalAmount;
        await paymentRecord.save();
      }
    } else if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    if (status) {
      booking.status = status;
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking status updated successfully.',
      booking
    });
  } catch (error) {
    console.error('updateBookingStatus error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating booking status.'
    });
  }
};

// @desc    Get all rooms for admin management (including inactive)
// @route   GET /api/admin/rooms
// @access  Private/Admin
const getAllRoomsAdmin = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });

    // Enhance each room with count of active bookings
    const roomsWithStats = await Promise.all(
      rooms.map(async (room) => {
        const activeBookingsCount = await Booking.countDocuments({
          room: room._id,
          status: { $in: ['pending', 'confirmed'] },
          checkOut: { $gte: new Date() }
        });
        const totalBookingsCount = await Booking.countDocuments({ room: room._id });
        return {
          ...room.toObject(),
          activeBookingsCount,
          totalBookingsCount
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms: roomsWithStats
    });
  } catch (error) {
    console.error('getAllRoomsAdmin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving rooms for admin.'
    });
  }
};

// @desc    Get all registered users for admin
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    // Attach booking stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const bookingsCount = await Booking.countDocuments({ user: u._id });
        const spentAggregation = await Booking.aggregate([
          { $match: { user: u._id, paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        return {
          ...u.toObject(),
          totalBookings: bookingsCount,
          totalSpent: spentAggregation[0]?.total || 0
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: users.length,
      users: usersWithStats
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving users.'
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllBookings,
  updateBookingStatus,
  getAllRoomsAdmin,
  getAllUsers
};
