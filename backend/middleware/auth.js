const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const connectDB = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hrorbitjwtsecretkey12345');
      
      // Ensure DB connection is active before inspecting user record
      if (mongoose.connection.readyState !== 1) {
        await connectDB();
      }

      // Look up user in MongoDB Atlas
      // lookupCompleted: true only when the lookup actually ran and succeeded (found or not)
      let lookupCompleted = false;
      if (mongoose.connection.readyState === 1) {
        try {
          req.user = await Employee.findById(decoded.id).select('-password');
          lookupCompleted = true;
          if (req.user) {
            return next();
          }
        } catch (e) {
          console.warn('[Auth Middleware Warning] Atlas findById failed:', e.message);
        }
      }

      // DB unreachable or lookup failed: the token may be perfectly valid, so don't answer 401
      // (the frontend logs the user out on 401). Still deny the request.
      if (!lookupCompleted) {
        return res.status(503).json({ message: 'Authentication service temporarily unavailable. Please retry.' });
      }

      return res.status(401).json({ message: 'User not found.' });
    } catch (error) {
      console.error('Auth protect error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token provided' });
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'hr') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an HR Director' });
  }
};

module.exports = { protect, adminOnly };
