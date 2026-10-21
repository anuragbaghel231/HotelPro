const express = require('express');
const router = express.Router();
const { checkout, webhook, getPaymentStatus } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/checkout', protect, checkout);
router.post('/webhook', webhook);
router.get('/:bookingId/status', protect, getPaymentStatus);

module.exports = router;
