const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  getRoomById,
  checkAvailability,
  createRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom
} = require('../controllers/roomController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeAdmin } = require('../middlewares/adminMiddleware');
const { uploadRoomImages } = require('../middlewares/uploadMiddleware');

// Public routes
router.get('/', getAllRooms);
router.get('/availability', checkAvailability);
router.get('/:id', getRoomById);

// Admin-protected routes
router.post('/', protect, authorizeAdmin, uploadRoomImages.array('images', 8), createRoom);
router.put('/:id', protect, authorizeAdmin, uploadRoomImages.array('images', 8), updateRoom);
router.patch('/:id/status', protect, authorizeAdmin, updateRoomStatus);
router.delete('/:id', protect, authorizeAdmin, deleteRoom);

module.exports = router;
