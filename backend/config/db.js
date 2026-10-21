const mongoose = require('mongoose');
const path = require('path');

// Safely mask credentials in MongoDB URI for logging
const maskMongoUri = (uri) => {
  if (!uri) return '';
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/i, '$1*****$3');
};

// Register connection lifecycle events once
let listenersRegistered = false;
let hasEverConnected = false;
const registerConnectionEvents = () => {
  if (listenersRegistered) return;
  listenersRegistered = true;

  mongoose.connection.on('connected', () => {
    hasEverConnected = true;
    console.log('[MongoDB] Connection established.');
  });

  mongoose.connection.on('error', (err) => {
    if (hasEverConnected) {
      console.error('[MongoDB] Runtime error:', err.message);
    }
  });

  mongoose.connection.on('disconnected', () => {
    if (hasEverConnected) {
      console.warn('[MongoDB] Connection lost. Waiting for automatic reconnect...');
    }
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB] Reconnected successfully.');
  });
};

// Formatted actionable diagnostics on failure
const logConnectionDiagnostic = (error, mongoUri) => {
  const maskedUri = maskMongoUri(mongoUri);
  console.error('\n' + '='.repeat(70));
  console.error('[MongoDB] DATABASE CONNECTION FAILED');
  console.error('='.repeat(70));
  console.error(`Target URI:    ${maskedUri}`);
  console.error(`Error Code:    ${error.code || 'N/A'}`);
  console.error(`Error Message: ${error.message}`);
  console.error('-'.repeat(70));

  if (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) {
    console.error('DIAGNOSIS FOR LOCAL MONGODB (Windows):');
    console.error('  The local MongoDB service is not currently running or reachable on port 27017.');
    console.error('\n  HOW TO FIX:');
    console.error('  1. Open PowerShell as Administrator (Right-Click -> "Run as Administrator").');
    console.error('  2. Run the command:');
    console.error('       Start-Service MongoDB');
    console.error('     (Or: net start MongoDB)');
    console.error('  3. Note: Running Start-Service in a normal (non-admin) terminal will fail with:');
    console.error('     "Cannot open MongoDB service on computer \'.\'" due to Windows UAC permissions.');
    console.error('  4. To check service status:');
    console.error('       Get-Service MongoDB');
  } else if (mongoUri.startsWith('mongodb+srv://') || mongoUri.includes('.mongodb.net')) {
    console.error('DIAGNOSIS FOR MONGODB ATLAS:');
    console.error('  Unable to reach MongoDB Atlas cluster.');
    console.error('\n  HOW TO FIX:');
    console.error('  1. In Atlas Dashboard, navigate to Network Access -> Ensure your IP is whitelisted (or 0.0.0.0/0).');
    console.error('  2. Verify database username and password in backend/.env MONGODB_URI.');
    console.error('  3. Ensure your network allows outbound traffic on port 27017.');
  }
  console.error('='.repeat(70) + '\n');
};

const connectDB = async () => {
  // Ensure environment variables are loaded
  if (!process.env.MONGODB_URI) {
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotelpro';
  registerConnectionEvents();

  try {
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      family: 4 // Prefer IPv4 to avoid localhost IPv6 mismatch with 127.0.0.1
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    logConnectionDiagnostic(error, mongoUri);
    throw error;
  }
};

module.exports = connectDB;

