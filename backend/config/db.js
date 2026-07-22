const mongoose = require('mongoose');

let cachedConn = null;
let cachedPromise = null;

const connectDB = async () => {
  if (cachedConn && mongoose.connection.readyState === 1) {
    return cachedConn;
  }

  if (cachedPromise) {
    try {
      cachedConn = await cachedPromise;
      return cachedConn;
    } catch (e) {
      cachedPromise = null;
    }
  }

  const connUri = process.env.MONGODB_URI;

  if (!connUri) {
    console.warn('[DB Warning] MONGODB_URI environment variable is missing.');
    return null;
  }

  cachedPromise = mongoose.connect(connUri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
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
