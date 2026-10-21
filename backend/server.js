require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://127.0.0.1:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve static uploaded room images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'healthy',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    service: 'HotelPro API'
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found on endpoint: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[HotelPro Server Error]', err);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Uploaded file exceeds the maximum allowed size of 5MB.'
    });
  }

  if (err.message && err.message.includes('Only JPEG, PNG, and WebP')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `An entry with this ${field} already exists.`
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', ')
    });
  }

  // Mongoose CastError (bad ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid record ID format.'
    });
  }

  // Generic fallback without leaking stack traces in production
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message
  });
});

// Start Server strictly AFTER MongoDB connection
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[HotelPro API] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[HotelPro API] Base API URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error(`[HotelPro API] Server startup aborted: Database connection must be established before accepting requests.`);
    process.exit(1);
  }
};

startServer();

module.exports = app;
