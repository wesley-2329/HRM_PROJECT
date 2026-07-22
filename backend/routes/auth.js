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
  return jwt.sign({ id }, process.env.JWT_SECRET || 'hrorbitjwtsecretkey12345', {
    expiresIn: '30d'
  });
};

router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  const lowerEmail = email ? email.toLowerCase().trim() : '';

  // 1. Prioritize authenticating real user document from MongoDB Atlas
  try {
    const employee = await Employee.findOne({ email: lowerEmail });

    if (employee) {
      // Validate password (allow bcrypt match or demo master passwords)
      const isMasterPass = (password === 'admin123' || password === 'employee123');
      const isMatch = await employee.matchPassword(password).catch(() => false);

      if (!isMatch && !isMasterPass) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      if (employee.status !== 'Approved') {
        return res.status(403).json({ message: `Access denied. Your profile status is: ${employee.status}` });
      }

      // Verify portal selection compatibility if specified
      if (role) {
        if (role === 'hr' && employee.role !== 'hr') {
          return res.status(403).json({ message: 'Incorrect portal selection for this account.' });
        }
        if (role === 'employee' && employee.role === 'hr') {
          return res.status(403).json({ message: 'Incorrect portal selection for this account.' });
        }
      }

      console.log(`[MongoDB Auth Success] Authenticated ${employee.email} (${employee.name}) with _id: ${employee._id}`);

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
    }
  } catch (dbErr) {
    console.warn('[Offline Mode] Database lookup failed during login:', dbErr.message);
  }

  // 2. Offline Fallback OR Seed Account Fallback (only if user not found in database)
  const hrEmails = [
    'garanandini067@gmail.com',
    'akhilsirivella510@gmail.com',
    'karthikpotur@gmail.com',
    'johnwesley.290305@gmail.com',
    'hr@company.com'
  ];

  const employeeEmails = [
    'priyanka@qbkartitsolutions.com',
    'pranitha@qbkartitsolutions.com',
    'dhanushgoud58@gmail.com',
    'johnwesley.290305@gmail.com',
    'employee@company.com'
  ];

  const isHR = hrEmails.includes(lowerEmail);
  const isEmployee = employeeEmails.includes(lowerEmail);

  if (role === 'employee' && isEmployee) {
    if (password !== 'employee123' && password !== 'admin123') {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    let name = 'Dhanush Goud';
    let id = 'EMP-2003';
    let _id = '60c72b2f9b1d8b2a3c9d8007';

    if (lowerEmail === 'priyanka@qbkartitsolutions.com') {
      name = 'Priyanka';
      id = 'EMP-2001';
      _id = '60c72b2f9b1d8b2a3c9d8005';
    } else if (lowerEmail === 'pranitha@qbkartitsolutions.com') {
      name = 'Pranitha';
      id = 'EMP-2002';
      _id = '60c72b2f9b1d8b2a3c9d8006';
    } else if (lowerEmail === 'johnwesley.290305@gmail.com') {
      name = 'John Wesley';
      id = 'EMP-2004';
      _id = '60c72b2f9b1d8b2a3c9d8008';
    } else if (lowerEmail === 'employee@company.com') {
      name = 'Aditya Kumar';
      id = 'EMP-0002';
      _id = '60c72b2f9b1d8b2a3c9d7891';
    }

    console.log('Master Employee fallback login triggered for:', lowerEmail);
    return res.json({
      _id,
      id,
      name,
      email: lowerEmail,
      role: 'employee',
      dept: 'Engineering',
      token: generateToken(_id)
    });
  } else if (role !== 'employee' && isHR) {
    if (password !== 'admin123' && password !== 'employee123') {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    let name = 'John Wesley';
    let id = 'EMP-1004';
    let _id = '60c72b2f9b1d8b2a3c9d8004';
    
    if (lowerEmail === 'garanandini067@gmail.com') {
      name = 'Gara Nandini';
      id = 'EMP-1001';
      _id = '60c72b2f9b1d8b2a3c9d8001';
    } else if (lowerEmail === 'akhilsirivella510@gmail.com') {
      name = 'Akhil Sirivella';
      id = 'EMP-1002';
      _id = '60c72b2f9b1d8b2a3c9d8002';
    } else if (lowerEmail === 'karthikpotur@gmail.com') {
      name = 'Karthik Potur';
      id = 'EMP-1003';
      _id = '60c72b2f9b1d8b2a3c9d8003';
    } else if (lowerEmail === 'hr@company.com') {
      name = 'Venkat Raman';
      id = 'EMP-0001';
      _id = '60c72b2f9b1d8b2a3c9d7890';
    }

    console.log('Master HR fallback login triggered for:', lowerEmail);
    return res.json({
      _id,
      id,
      name,
      email: lowerEmail,
      role: 'hr',
      dept: 'Human Resources',
      token: generateToken(_id)
    });
  }

  res.status(401).json({ message: 'Invalid email or password' });
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
      status: 'Approved',
      parentStatus: req.body.parentStatus || 'No'
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
      return res.json(employee);
    }
    if (req.user && req.user._id && req.user._id.toString().startsWith('60c72b2f9b1d8b2a3c9')) {
      return res.json(req.user);
    }
    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    if (req.user && req.user._id && req.user._id.toString().startsWith('60c72b2f9b1d8b2a3c9')) {
      console.warn('[Offline Mode] Database query failed for /me. Returning fallback mock user.');
      return res.json(req.user);
    }
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
