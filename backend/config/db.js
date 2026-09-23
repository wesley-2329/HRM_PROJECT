const mongoose = require('mongoose');

// Enable command buffering (default) so queries wait for cold start connection instead of throwing MongooseError 500
mongoose.set('bufferCommands', true);

let cachedConn = null;
let cachedPromise = null;

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
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  try {
    cachedConn = await cachedPromise;
    console.log(`[MongoDB Connected] Host: ${cachedConn.connection.host}, DB: ${cachedConn.connection.name}`);
    return cachedConn;
  } catch (error) {
    cachedPromise = null;
    cachedConn = null;
    console.error(`[MongoDB Connection Error] ${error.message}`);
    return null;
  }
};

module.exports = connectDB;
