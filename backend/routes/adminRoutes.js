const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllBookings,
  updateBookingStatus,
  getAllRoomsAdmin,
  getAllUsers
} = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeAdmin } = require('../middlewares/adminMiddleware');

// All admin routes require authentication and admin authorization
router.use(protect);
router.use(authorizeAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/bookings', getAllBookings);
router.patch('/bookings/:id/status', updateBookingStatus);
router.get('/rooms', getAllRoomsAdmin);
router.get('/users', getAllUsers);

module.exports = router;
