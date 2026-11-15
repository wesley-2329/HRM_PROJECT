const mongoose = require('mongoose');

// Disable command buffering so queries fail immediately when disconnected instead of hanging until 8s client timeout
mongoose.set('bufferCommands', false);

let cachedConn = null;
let cachedPromise = null;
let lastFailedTime = 0;
let lastDbError = null;
let demoSeedStatus = null;
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

// Production and Preview must never share a database. Vercel sets VERCEL_ENV on every deployment.
const dbNameOf = (uri) => { try { return decodeURIComponent(new URL(uri).pathname.replace(/^\//, '')); } catch { return ''; } };
const checkDbConfig = (uri, vercelEnv) => {
  const name = dbNameOf(uri);
  if (!name) return 'MONGODB_URI must include the database name, e.g. ...mongodb.net/hrorbit?retryWrites=true';
  if (vercelEnv === 'preview' && !name.endsWith('_demo')) return `Preview deployments must use a *_demo database (got "${name}").`;
  if (vercelEnv === 'production' && name.endsWith('_demo')) return `Production must not use a demo database (got "${name}").`;
  return null;
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

  const connUri = cleanUri(process.env.MONGODB_URI);

  if (!connUri) {
    lastDbError = 'MONGODB_URI environment variable is missing.';
    console.warn('[DB Warning] ' + lastDbError);
    return null;
  }

  const configError = checkDbConfig(connUri, process.env.VERCEL_ENV);
  if (configError) {
    lastDbError = configError;
    console.error('[DB Config Error] ' + configError);
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
    // Preview self-setup: an empty demo database gets the demo data once.
    if (process.env.VERCEL_ENV === 'preview' || process.env.DEMO_AUTO_SEED === 'true') {
      try {
        demoSeedStatus = await require('../scripts/seed_demo').ensureDemoSeeded();
      } catch (e) {
        demoSeedStatus = 'failed: ' + e.message;
        console.error('[Demo Seed Error] ' + e.message);
      }
    }
    return cachedConn;
  } catch (error) {
    lastDbError = error.message;
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
connectDB.checkDbConfig = checkDbConfig;
connectDB.getDemoSeedStatus = () => demoSeedStatus;

module.exports = connectDB;
