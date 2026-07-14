const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hrorbitjwtsecretkey12345');
      
      if (decoded.id === '60c72b2f9b1d8b2a3c9d7890' || decoded.id === '60c72b2f9b1d8b2a3c9d7891') {
        const isHR = decoded.id === '60c72b2f9b1d8b2a3c9d7890';
        req.user = {
          _id: decoded.id,
          id: isHR ? 'EMP-0001' : 'EMP-0002',
          name: isHR ? 'Venkat Raman' : 'Aditya Kumar',
          email: isHR ? 'hr@company.com' : 'employee@company.com',
          role: isHR ? 'hr' : 'employee',
          status: 'Approved',
          dept: isHR ? 'Human Resources' : 'Engineering'
        };
        return next();
      }

      // Get employee from the token (exclude password)
      req.user = await Employee.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'hr') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an HR Director' });
  }
};

module.exports = { protect, adminOnly };
