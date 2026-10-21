const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    provider: {
      type: String,
      default: 'HotelPro Payment Sandbox'
    },
    transactionId: {
      type: String,
      required: true,
      unique: true
    },
    paymentMethod: {
      type: String,
      default: 'Simulated Card'
    },
    cardLast4: {
      type: String,
      default: '4242'
    },
    cardBrand: {
      type: String,
      default: 'Visa'
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'successful', 'failed', 'refunded'],
        message: '{VALUE} is not a valid payment status'
      },
      default: 'pending'
    },
    failureReason: {
      type: String,
      default: null
    },
    refundTransactionId: {
      type: String,
      default: null
    },
    refundAmount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

paymentSchema.index({ booking: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
