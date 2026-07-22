const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hrorbitjwtsecretkey12345');
      
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1) {
        req.user = await Employee.findById(decoded.id).select('-password');
        if (req.user) {
          return next();
        }
        // Database is online but user document was not found (e.g. user was deleted from MongoDB Atlas)
        return res.status(401).json({ message: 'User account no longer exists.' });
      }

      if (decoded.id && decoded.id.startsWith('60c72b2f9b1d8b2a3c9')) {
        let name = 'John Wesley';
        let id = 'EMP-1004';
        let email = 'johnwesley.290305@gmail.com';
        let role = 'hr';
        let dept = 'Human Resources';
        
        if (decoded.id === '60c72b2f9b1d8b2a3c9d8001') {
          name = 'Gara Nandini';
          id = 'EMP-1001';
          email = 'garanandini067@gmail.com';
        } else if (decoded.id === '60c72b2f9b1d8b2a3c9d8002') {
          name = 'Akhil Sirivella';
          id = 'EMP-1002';
          email = 'akhilsirivella510@gmail.com';
        } else if (decoded.id === '60c72b2f9b1d8b2a3c9d8003') {
          name = 'Karthik Potur';
          id = 'EMP-1003';
          email = 'karthikpotur@gmail.com';
        } else if (decoded.id === '60c72b2f9b1d8b2a3c9d8005') {
          name = 'Priyanka';
          id = 'EMP-2001';
          email = 'priyanka@qbkartitsolutions.com';
          role = 'employee';
          dept = 'Engineering';
        } else if (decoded.id === '60c72b2f9b1d8b2a3c9d8006') {
          name = 'Pranitha';
          id = 'EMP-2002';
          email = 'pranitha@qbkartitsolutions.com';
          role = 'employee';
          dept = 'Engineering';
        } else if (decoded.id === '60c72b2f9b1d8b2a3c9d8007') {
          name = 'Dhanush Goud';
          id = 'EMP-2003';
          email = 'dhanushgoud58@gmail.com';
          role = 'employee';
          dept = 'Engineering';
        } else if (decoded.id === '60c72b2f9b1d8b2a3c9d8008') {
          name = 'John Wesley';
          id = 'EMP-2004';
          email = 'johnwesley.290305@gmail.com';
          role = 'employee';
          dept = 'Engineering';
        } else if (decoded.id === '60c72b2f9b1d8b2a3c9d7890') {
          name = 'Venkat Raman';
          id = 'EMP-0001';
          email = 'hr@company.com';
        } else if (decoded.id === '60c72b2f9b1d8b2a3c9d7891') {
          name = 'Aditya Kumar';
          id = 'EMP-0002';
          email = 'employee@company.com';
          role = 'employee';
          dept = 'Engineering';
        }
        
        req.user = {
          _id: decoded.id,
          id,
          name,
          email,
          role,
          status: 'Approved',
          dept
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
