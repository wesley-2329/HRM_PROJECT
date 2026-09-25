const mongoose = require('mongoose');

// Disable command buffering so queries fail immediately when disconnected instead of hanging until 8s client timeout
mongoose.set('bufferCommands', false);

let cachedConn = null;
let cachedPromise = null;
let lastFailedTime = 0;
const FAIL_COOLDOWN_MS = 15000; // 15-second cooldown if connection failed to prevent blocking subsequent HTTP requests

const cleanUri = (rawUri) => {
  if (!rawUri) return '';
  let uri = rawUri.trim();
  // Strip duplicate variable prefix if present
  while (uri.startsWith('MONGODB_URI=')) {
    uri = uri.substring(12).trim();
  }
  // Strip surrounding quotes
  uri = uri.replace(/^["']|["']$/g, '').trim();
  // Strip angle brackets around password if user copied template literal <password>
  uri = uri.replace(/<([^>]+)>/g, '$1');
  return uri;
};

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedConn && mongoose.connection.readyState === 1) {
    return cachedConn;
  }

  // Skip waiting for timeout if connection failed recently
  if (Date.now() - lastFailedTime < FAIL_COOLDOWN_MS) {
    return null;
  }

  if (cachedPromise) {
    try {
      cachedConn = await cachedPromise;
      if (mongoose.connection.readyState >= 1) {
        return cachedConn;
      }
    } catch (e) {
      cachedPromise = null;
    }
  }

  const rawUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrorbit';
  const connUri = cleanUri(rawUri);

  if (!connUri) {
    console.warn('[DB Warning] MONGODB_URI environment variable is missing.');
    return null;
  }

  cachedPromise = mongoose.connect(connUri, {
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 10000,
    serverSelectionTimeoutMS: 1500,
    connectTimeoutMS: 1500,
  });

  try {
    cachedConn = await cachedPromise;
    console.log(`[MongoDB Connected] Host: ${cachedConn.connection.host}, DB: ${cachedConn.connection.name}`);
    return cachedConn;
  } catch (error) {
    cachedPromise = null;
    cachedConn = null;
    lastFailedTime = Date.now();
    console.error(`[MongoDB Connection Error] ${error.message}`);
    return null;
  }
};

module.exports = connectDB;
