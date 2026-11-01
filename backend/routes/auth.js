const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const Task = require('../models/Task');
const Meeting = require('../models/Meeting');
const Training = require('../models/Training');
const Timesheet = require('../models/Timesheet');
const Notification = require('../models/Notification');
const ChatMessage = require('../models/ChatMessage');
const { protect } = require('../middleware/auth');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'hrorbitjwtsecretkey12345', {
    expiresIn: '30d'
  });
};

router.post('/login', async (req, res, next) => {
  const { email, password, role } = req.body || {};
  const lowerEmail = email ? email.toLowerCase().trim() : '';
  const trimmedPassword = password ? String(password).trim() : '';

  if (!lowerEmail || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Authentication service temporarily unavailable, please retry' });
  }

  let employee = null;
  if (role) {
    employee = await Employee.findOne({ email: lowerEmail, role });
  }
  if (!employee) {
    employee = await Employee.findOne({ email: lowerEmail });
  }

  if (!employee) {
    return res.status(401).json({ message: 'Account not found. Please Sign Up first.' });
  }

  // Validate password (plain-text match kept for legacy records seeded without hashing)
  const isBcryptMatch = await employee.matchPassword(trimmedPassword).catch(() => false);
  const isPassCorrect = isBcryptMatch || (trimmedPassword === employee.password);

  if (!isPassCorrect) {
    return res.status(401).json({ message: 'Invalid password. Please check your credentials.' });
  }

  return res.json({
    _id: employee._id,
    id: employee.id,
    name: employee.name,
    email: employee.email,
    role: employee.role,
    dept: employee.dept,
    avatar: employee.avatar,
    token: generateToken(employee._id)
  });
});

// @route   POST /api/auth/register
// @desc    Register a new employee (Pending status)
// @access  Public
router.post('/register', async (req, res, next) => {
  const { name, email, password, dept, role, aadhaar, phone, joined } = req.body;

  try {
    const userExists = await Employee.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Email address already registered' });
    }

    const employeeCount = await Employee.countDocuments();
    let newEmpId;
    let isUnique = false;
    let suffix = employeeCount + 1;
    while (!isUnique) {
      const candidateId = `EMP-${1000 + suffix}`;
      const existing = await Employee.findOne({ id: candidateId });
      if (!existing) {
        newEmpId = candidateId;
        isUnique = true;
      } else {
        suffix++;
      }
    }

    const employee = await Employee.create({
      id: newEmpId,
      name,
      email,
      password,
      dept,
      role: 'employee', // never trust a self-chosen role; the form's "Role" field is a job title
      designation: role,
      aadhaar,
      phone,
      joined: joined || new Date().toISOString().split('T')[0],
      status: 'Approved',
      parentStatus: req.body.parentStatus || 'No'
    });

    res.status(201).json({
      message: 'Registration successful! You can now login.',
      id: employee.id
    });
  } catch (error) { next(error); }
});

// @route   GET /api/auth/me
// @desc    Get user profile
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    let employee = null;
    if (mongoose.connection.readyState === 1 && req.user?._id) {
      try {
        employee = await Employee.findById(req.user._id).select('-password');
      } catch (e) {}
    }
    if (!employee && mongoose.connection.readyState === 1 && req.user?.id) {
      try {
        employee = await Employee.findOne({ id: req.user.id }).select('-password');
      } catch (e) {}
    }
    if (!employee) {
      const { mockEmployees } = require('../config/mock_data');
      if (mockEmployees && mockEmployees.length > 0) {
        employee = mockEmployees.find(e =>
          (req.user?.id && e.id === req.user.id) ||
          (req.user?._id && e._id === req.user._id) ||
          (req.user?.email && e.email && e.email.toLowerCase() === req.user.email.toLowerCase())
        );
      }
    }
    if (employee) {
      return res.json(employee);
    }
    if (req.user) {
      return res.json(req.user);
    }
    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    if (req.user) {
      return res.json(req.user);
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change password
// @access  Private
router.post('/change-password', protect, async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }

  try {
    let employee = null;
    if (req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
      employee = await Employee.findById(req.user._id);
    }
    if (!employee && req.user?.id) {
      employee = await Employee.findOne({ id: req.user.id });
    }
    if (!employee && req.user?.email) {
      employee = await Employee.findOne({ email: req.user.email.toLowerCase().trim() });
    }

    if (!employee) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await employee.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    employee.password = newPassword;
    await employee.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) { next(error); }
});

module.exports = router;
