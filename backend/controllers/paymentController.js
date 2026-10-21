const Payment = require('../models/paymentModel');
const Booking = require('../models/bookingModel');

// @desc    Process payment in secure sandbox mode
// @route   POST /api/payments/checkout
// @access  Private
const checkout = async (req, res) => {
  try {
    const {
      bookingId,
      cardBrand = 'Visa',
      cardLast4 = '4242',
      simulateOutcome = 'success' // 'success' or 'fail'
    } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required.'
      });
    }

    // Support lookup by either MongoDB _id or human-readable bookingId
    let booking;
    if (bookingId.toString().startsWith('HP-')) {
      booking = await Booking.findOne({ bookingId }).populate('room');
    } else {
      booking = await Booking.findById(bookingId).populate('room');
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Ownership check
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to pay for this reservation.'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot process payment for a cancelled booking.'
      });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This reservation has already been paid and confirmed.'
      });
    }

    // Sandbox failure simulation
    if (simulateOutcome === 'fail' || simulateOutcome === 'decline') {
      const failedTxnId = `FAIL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      await Payment.create({
        booking: booking._id,
        user: req.user._id,
        amount: booking.totalAmount,
        provider: 'HotelPro Payment Sandbox',
        transactionId: failedTxnId,
        paymentMethod: 'Sandbox Simulated Card',
        cardLast4: cardLast4.slice(-4),
        cardBrand,
        status: 'failed',
        failureReason: 'Transaction declined by issuer (Sandbox Simulation)'
      });

      booking.paymentStatus = 'failed';
      await booking.save();

      return res.status(402).json({
        success: false,
        message: 'Payment simulation failed: The transaction was declined by the simulated card issuer.',
        transactionId: failedTxnId
      });
    }

    // Process successful sandbox transaction
    const transactionId = `TXN-HP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: booking.totalAmount,
      currency: 'USD',
      provider: 'HotelPro Payment Sandbox',
      transactionId,
      paymentMethod: 'Sandbox Simulated Card',
      cardLast4: cardLast4.slice(-4),
      cardBrand,
      status: 'successful'
    });

    // Mark booking confirmed and paid
    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.paymentId = transactionId;
    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Payment processed successfully! Your reservation is now confirmed.',
      payment: {
        transactionId: payment.transactionId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        provider: payment.provider,
        cardBrand: payment.cardBrand,
        cardLast4: payment.cardLast4,
        createdAt: payment.createdAt
      },
      booking
    });
  } catch (error) {
    console.error('checkout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing payment.'
    });
  }
};

// @desc    Payment webhook endpoint for external PSP integration
// @route   POST /api/payments/webhook
// @access  Public
const webhook = async (req, res) => {
  try {
    const event = req.body;
    console.log('[Payment Webhook] Received webhook event:', event.type || 'generic_event');

    // Acknowledge receipt
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('webhook error:', error);
    return res.status(400).json({ error: 'Webhook processing error' });
  }
};

// @desc    Get payment status for a specific booking
// @route   GET /api/payments/:bookingId/status
// @access  Private
const getPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;

    let booking;
    if (bookingId.startsWith('HP-')) {
      booking = await Booking.findOne({ bookingId });
    } else {
      booking = await Booking.findById(bookingId);
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized.'
      });
    }

    const payments = await Payment.find({ booking: booking._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bookingStatus: booking.status,
      paymentStatus: booking.paymentStatus,
      payments
    });
  } catch (error) {
    console.error('getPaymentStatus error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving payment status.'
    });
  }
};

module.exports = {
  checkout,
  webhook,
  getPaymentStatus
};
