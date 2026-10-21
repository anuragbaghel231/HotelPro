const Room = require('../models/roomModel');
const Booking = require('../models/bookingModel');

// Helper to find room IDs that have overlapping bookings
const getBookedRoomIds = async (checkInDate, checkOutDate, excludeBookingId = null) => {
  const query = {
    status: { $in: ['pending', 'confirmed'] },
    checkIn: { $lt: checkOutDate },
    checkOut: { $gt: checkInDate }
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const overlappingBookings = await Booking.find(query).select('room');
  return overlappingBookings.map((b) => b.room.toString());
};

// @desc    Get all rooms with filtering, search, and date-range availability
// @route   GET /api/rooms
// @access  Public
const getAllRooms = async (req, res) => {
  try {
    const {
      type,
      minPrice,
      maxPrice,
      capacity,
      checkIn,
      checkOut,
      search,
      includeInactive
    } = req.query;

    const filter = {};

    // Filter by active status unless admin explicitly requests all
    if (includeInactive !== 'true') {
      filter.isActive = true;
    }

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (capacity) {
      filter.capacity = { $gte: Number(capacity) };
    }

    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { roomNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Availability filtering if dates are provided
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);

      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date range. Check-out must be strictly after check-in date.'
        });
      }

      const bookedRoomIds = await getBookedRoomIds(start, end);
      if (bookedRoomIds.length > 0) {
        filter._id = { $nin: bookedRoomIds };
      }
    }

    const rooms = await Room.find(filter).sort({ pricePerNight: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms
    });
  } catch (error) {
    console.error('getAllRooms error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving rooms list.'
    });
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.'
      });
    }

    return res.status(200).json({
      success: true,
      room
    });
  } catch (error) {
    console.error('getRoomById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving room details.'
    });
  }
};

// @desc    Check availability of a specific room or query available rooms
// @route   GET /api/rooms/availability
// @access  Public
const checkAvailability = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both checkIn and checkOut dates.'
      });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dates. Check-out date must be after check-in date.'
      });
    }

    if (roomId) {
      const room = await Room.findById(roomId);
      if (!room || !room.isActive) {
        return res.status(404).json({
          success: false,
          available: false,
          message: 'Room is inactive or does not exist.'
        });
      }

      const bookedRoomIds = await getBookedRoomIds(start, end);
      const isBooked = bookedRoomIds.includes(roomId.toString());

      return res.status(200).json({
        success: true,
        roomId,
        available: !isBooked,
        message: !isBooked
          ? 'Room is available for selected dates.'
          : 'Room is already reserved for the chosen date range.'
      });
    }

    // Return list of all available rooms
    const bookedRoomIds = await getBookedRoomIds(start, end);
    const availableRooms = await Room.find({
      isActive: true,
      _id: { $nin: bookedRoomIds }
    }).sort({ pricePerNight: 1 });

    return res.status(200).json({
      success: true,
      count: availableRooms.length,
      availableRooms
    });
  } catch (error) {
    console.error('checkAvailability error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error checking availability.'
    });
  }
};

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private/Admin
const createRoom = async (req, res) => {
  try {
    const { roomNumber, name, description, type, pricePerNight, capacity, amenities } = req.body;

    if (!roomNumber || !name || !description || !type || !pricePerNight || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'All fields (roomNumber, name, description, type, pricePerNight, capacity) are required.'
      });
    }

    const existingRoom = await Room.findOne({ roomNumber: roomNumber.trim() });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: `Room number ${roomNumber} already exists.`
      });
    }

    // Process amenities (array or comma-separated string)
    let parsedAmenities = [];
    if (Array.isArray(amenities)) {
      parsedAmenities = amenities;
    } else if (typeof amenities === 'string') {
      try {
        parsedAmenities = JSON.parse(amenities);
      } catch (e) {
        parsedAmenities = amenities.split(',').map((item) => item.trim()).filter(Boolean);
      }
    }

    // Process uploaded files if any
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) => `/uploads/rooms/${file.filename}`);
    } else if (req.body.images) {
      // Support manual image URLs passed in body
      if (Array.isArray(req.body.images)) {
        imagePaths = req.body.images;
      } else if (typeof req.body.images === 'string') {
        try {
          imagePaths = JSON.parse(req.body.images);
        } catch (e) {
          imagePaths = req.body.images.split(',').map((img) => img.trim()).filter(Boolean);
        }
      }
    }

    const room = await Room.create({
      roomNumber: roomNumber.trim(),
      name: name.trim(),
      description: description.trim(),
      type,
      pricePerNight: Number(pricePerNight),
      capacity: Number(capacity),
      amenities: parsedAmenities,
      images: imagePaths,
      isActive: true
    });

    return res.status(201).json({
      success: true,
      message: 'Room created successfully.',
      room
    });
  } catch (error) {
    console.error('createRoom error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating room.'
    });
  }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Private/Admin
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.'
      });
    }

    const { roomNumber, name, description, type, pricePerNight, capacity, amenities, existingImages } =
      req.body;

    if (roomNumber && roomNumber.trim() !== room.roomNumber) {
      const duplicate = await Room.findOne({
        roomNumber: roomNumber.trim(),
        _id: { $ne: room._id }
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Room number ${roomNumber} is already taken by another room.`
        });
      }
      room.roomNumber = roomNumber.trim();
    }

    if (name) room.name = name.trim();
    if (description) room.description = description.trim();
    if (type) room.type = type;
    if (pricePerNight !== undefined) room.pricePerNight = Number(pricePerNight);
    if (capacity !== undefined) room.capacity = Number(capacity);

    if (amenities !== undefined) {
      if (Array.isArray(amenities)) {
        room.amenities = amenities;
      } else if (typeof amenities === 'string') {
        try {
          room.amenities = JSON.parse(amenities);
        } catch (e) {
          room.amenities = amenities.split(',').map((a) => a.trim()).filter(Boolean);
        }
      }
    }

    // Handle images: retain existing specified images + append newly uploaded images
    let updatedImages = [];
    if (existingImages) {
      if (Array.isArray(existingImages)) {
        updatedImages = existingImages;
      } else if (typeof existingImages === 'string') {
        try {
          updatedImages = JSON.parse(existingImages);
        } catch (e) {
          updatedImages = [existingImages];
        }
      }
    } else {
      updatedImages = room.images || [];
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/rooms/${file.filename}`);
      updatedImages = [...updatedImages, ...newImages];
    }

    room.images = updatedImages;

    const savedRoom = await room.save();

    return res.status(200).json({
      success: true,
      message: 'Room updated successfully.',
      room: savedRoom
    });
  } catch (error) {
    console.error('updateRoom error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating room.'
    });
  }
};

// @desc    Toggle room active status
// @route   PATCH /api/rooms/:id/status
// @access  Private/Admin
const updateRoomStatus = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.'
      });
    }

    const { isActive } = req.body;
    room.isActive = typeof isActive === 'boolean' ? isActive : !room.isActive;
    await room.save();

    return res.status(200).json({
      success: true,
      message: `Room status updated to ${room.isActive ? 'Active' : 'Inactive'}.`,
      room
    });
  } catch (error) {
    console.error('updateRoomStatus error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating room status.'
    });
  }
};

// @desc    Delete a room (subject to booking-history safeguards)
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.'
      });
    }

    // Safeguard: Check if room is tied to any existing reservations
    const existingBookingsCount = await Booking.countDocuments({ room: room._id });
    if (existingBookingsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete room #${room.roomNumber}. It has ${existingBookingsCount} linked booking record(s) in history. Deactivate the room instead to maintain booking integrity.`
      });
    }

    await Room.findByIdAndDelete(room._id);

    return res.status(200).json({
      success: true,
      message: `Room #${room.roomNumber} has been permanently deleted.`
    });
  } catch (error) {
    console.error('deleteRoom error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting room.'
    });
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  checkAvailability,
  createRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom
};
