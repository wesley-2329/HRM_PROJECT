const express = require('express');
const router = express.Router();
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
  return jwt.sign({ id }, process.env.JWT_SECRET || 'talentspherejwtsecretkey12345', {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const employee = await Employee.findOne({ email });

    if (!employee) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (employee.status !== 'Approved') {
      return res.status(403).json({ message: `Access denied. Your profile status is: ${employee.status}` });
    }

    const isMatch = await employee.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify portal selection compatibility
    if (role) {
      if (role === 'hr' && employee.role !== 'hr') {
        return res.status(403).json({ message: `Incorrect portal selection for this account.` });
      }
      if (role === 'employee' && employee.role === 'hr') {
        return res.status(403).json({ message: `Incorrect portal selection for this account.` });
      }
    }

    res.json({
      _id: employee._id,
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      dept: employee.dept,
      avatar: employee.avatar,
      token: generateToken(employee._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/register
// @desc    Register a new employee (Pending status)
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, dept, role, aadhaar, phone, joined } = req.body;

  try {
    const userExists = await Employee.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Email address already registered' });
    }

    const employeeCount = await Employee.countDocuments();
    const newEmpId = `EMP-${1000 + employeeCount + 1}`;

    const employee = await Employee.create({
      id: newEmpId,
      name,
      email,
      password,
      dept,
      role,
      aadhaar,
      phone,
      joined: joined || new Date().toISOString().split('T')[0],
      status: 'Approved'
    });

    res.status(201).json({
      message: 'Registration successful! You can now login.',
      id: employee.id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const employee = await Employee.findById(req.user._id).select('-password');
    if (employee) {
      res.json(employee);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change password
// @access  Private
router.post('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const employee = await Employee.findById(req.user._id);

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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
