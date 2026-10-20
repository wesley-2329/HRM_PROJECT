const mongoose = require('mongoose');

// Disable command buffering so queries fail immediately when disconnected instead of hanging until 8s client timeout
mongoose.set('bufferCommands', false);

let cachedConn = null;
let cachedPromise = null;
let lastFailedTime = 0;
let lastDbError = null;
const FAIL_COOLDOWN_MS = 1000; // 1-second cooldown if connection failed to retry quickly

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
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedConn && mongoose.connection.readyState === 1) {
    return cachedConn;
  }

  // Skip waiting for timeout if connection failed within last 1s
  if (Date.now() - lastFailedTime < FAIL_COOLDOWN_MS) {
    return null;
  }

  if (cachedPromise) {
    try {
      cachedConn = await cachedPromise;
      if (mongoose.connection.readyState === 1) {
        return cachedConn;
      }
    } catch (e) {
      cachedPromise = null;
    }
  }

  const DEFAULT_MONGODB_URI = 'mongodb+srv://johnwesley290305_db_user:bnani.290305@cluster0.nlkbuna.mongodb.net/hrorbit?retryWrites=true&w=majority';
  const rawUri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
  const connUri = cleanUri(rawUri);

  if (!connUri) {
    console.warn('[DB Warning] MONGODB_URI environment variable is missing.');
    return null;
  }

  const attemptConnect = (uri) => {
    return mongoose.connect(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 60000,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
  };

  try {
    cachedPromise = attemptConnect(connUri);
    cachedConn = await cachedPromise;
    console.log(`[MongoDB Connected] Host: ${cachedConn.connection.host}, DB: ${cachedConn.connection.name}`);
    lastDbError = null;
    return cachedConn;
  } catch (error) {
    if (connUri !== DEFAULT_MONGODB_URI && (error.message.includes('auth') || error.message.includes('Authentication') || error.message.includes('password'))) {
      console.warn('[DB Warning] Provided MONGODB_URI failed authentication. Retrying with verified working Atlas URI.');
      try {
        cachedPromise = attemptConnect(DEFAULT_MONGODB_URI);
        cachedConn = await cachedPromise;
        console.log(`[MongoDB Connected via Fallback URI] Host: ${cachedConn.connection.host}, DB: ${cachedConn.connection.name}`);
        lastDbError = null;
        return cachedConn;
      } catch (fallbackError) {
        lastDbError = fallbackError.message;
      }
    } else {
      lastDbError = error.message;
    }
    cachedPromise = null;
    cachedConn = null;
    lastFailedTime = Date.now();
    console.error(`[MongoDB Connection Error] ${lastDbError}`);
    return null;
  }
};

mongoose.connection.on('disconnected', () => {
  cachedConn = null;
  cachedPromise = null;
});

mongoose.connection.on('reconnected', () => {
  cachedConn = mongoose.connection;
});

connectDB.getLastError = () => lastDbError;

module.exports = connectDB;
