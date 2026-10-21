const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Room description is required'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Room type is required'],
      enum: {
        values: ['Single', 'Double', 'Deluxe', 'Suite', 'Family'],
        message: '{VALUE} is not a valid room type'
      }
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [0, 'Price must be greater than or equal to 0']
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1 guest'],
      default: 2
    },
    amenities: {
      type: [String],
      default: []
    },
    images: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Helpful index for fast queries
roomSchema.index({ type: 1, isActive: 1, pricePerNight: 1 });

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
