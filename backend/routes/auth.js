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

    // Seed default tasks
    await Task.create([
      { title: "Refactor Dashboard UI", project: "TalentSphere", priority: "High", due: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], progress: 65, status: "in-progress", empId: newEmpId },
      { title: "Configure Chart.js Data Integration", project: "TalentSphere", priority: "Medium", due: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], progress: 20, status: "todo", empId: newEmpId },
      { title: "Draft Corporate Policy Updates", project: "Operations", priority: "Low", due: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], progress: 100, status: "done", empId: newEmpId }
    ]);

    // Seed default trainings
    await Training.create([
      { name: "AWS Cloud Practitioner", assignedBy: "HR Director", deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], progress: 45, category: "Tech", duration: "10 Hours", rating: 4.8, empId: newEmpId, status: "assigned" },
      { name: "Emotional Intelligence at Work", assignedBy: "HR Director", deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], progress: 90, category: "Soft Skills", duration: "4 Hours", rating: 4.5, empId: newEmpId, status: "assigned" },
      { name: "Git and GitHub Collaboration", trainer: "In-house", date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], duration: "6 Hours", rating: 5, review: "Great hands-on labs", certificate: "Yes", empId: newEmpId, status: "attended", category: "Tech" }
    ]);

    // Seed default timesheets (last 5 days)
    const timesheetsToCreate = [];
    for (let i = 5; i > 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        timesheetsToCreate.push({
          date: d.toISOString().split('T')[0],
          clockIn: "09:00 AM",
          clockOut: "06:00 PM",
          hours: 9.0,
          status: "Punctual",
          empId: newEmpId
        });
      }
    }
    if (timesheetsToCreate.length > 0) {
      await Timesheet.create(timesheetsToCreate);
    }

    // Seed default meetings
    const todayStr = new Date().toISOString().split('T')[0];
    const meetingTime = new Date(Date.now() + 5 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await Meeting.create([
      { title: "Team Welcome Sync", host: "HR Director", date: todayStr, time: meetingTime, type: "Online", status: "Scheduled", empId: newEmpId, link: "https://meet.talentsphere.company/join/welcome" },
      { title: "Sprint Planning", host: "Project Manager", date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: "11:00 AM", type: "Online", status: "Attended", notes: "Introductory team alignment", empId: newEmpId, link: "https://meet.talentsphere.company/join/planning" }
    ]);

    // Seed default notifications
    await Notification.create([
      { type: "salary", title: "Welcome Package", desc: "Your default welcome salary structure has been generated in payslips.", time: "Just now", read: false, empId: newEmpId },
      { type: "training", title: "Training Assigned", desc: "New course assigned: AWS Cloud Practitioner.", time: "Just now", read: false, empId: newEmpId }
    ]);

    // Seed welcome chat message
    await ChatMessage.create({
      sender: "hr",
      message: `Welcome to TalentSphere, ${name}! How can I assist you today with any HR policies or onboarding questions?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      empId: newEmpId
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
