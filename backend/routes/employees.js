const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/employees
// @desc    Get all employees
// @access  Private/HR only
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const employees = await Employee.find({}).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/employees/public
// @desc    Get basic info of all active employees for public org directory / org chart
// @access  Private
router.get('/public', protect, async (req, res) => {
  try {
    const list = await Employee.find({ status: 'Approved' }).select('id name role dept teamLeadId isTeamLead avatar gender designation functionalManagerId branch businessUnit grade');
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/employees/:id
// @desc    Get employee details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const employee = await Employee.findOne({ id: req.params.id }).select('-password');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Permit if HR or self
    if (req.user.role !== 'hr' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to view this profile' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/employees
// @desc    Add employee manually
// @access  Private/HR only
router.post('/', protect, adminOnly, async (req, res) => {
  const { name, email, dept, role, aadhaar, phone, joined, gender } = req.body;

  try {
    const userExists = await Employee.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const employeeCount = await Employee.countDocuments();
    const newEmpId = `EMP-${1000 + employeeCount + 1}`;

    // Set default password as defaultPass123
    const employee = await Employee.create({
      id: newEmpId,
      name,
      email,
      password: 'defaultPass123',
      dept,
      role,
      joined,
      aadhaar,
      phone,
      gender: gender || 'Male',
      status: 'Approved'
    });

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee details
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    let employee = await Employee.findOne({ id: req.params.id });
    if (!employee && mongoose.Types.ObjectId.isValid(req.params.id)) {
      employee = await Employee.findById(req.params.id);
    }
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if HR or self
    const isHr = req.user.role === 'hr';
    const isSelf = req.user.id === req.params.id || req.user._id?.toString() === employee._id?.toString();

    if (!isHr && !isSelf) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (isHr) {
      // HR can edit anything
      if (req.body.name !== undefined) employee.name = req.body.name;
      if (req.body.email !== undefined) employee.email = req.body.email;
      if (req.body.dept !== undefined) employee.dept = req.body.dept;
      if (req.body.role !== undefined) employee.role = req.body.role;
      if (req.body.aadhaar !== undefined) employee.aadhaar = req.body.aadhaar;
      if (req.body.joined !== undefined) employee.joined = req.body.joined;
      if (req.body.phone !== undefined) employee.phone = req.body.phone;
      if (req.body.isTeamLead !== undefined) employee.isTeamLead = req.body.isTeamLead;
      if (req.body.teamLeadId !== undefined) employee.teamLeadId = req.body.teamLeadId;
    }

    // Both HR and Self can update personal fields safely
    if (req.body.address) {
      const currentAddr = employee.address || {};
      employee.address = {
        door: req.body.address.door !== undefined ? req.body.address.door : (currentAddr.door || ''),
        street: req.body.address.street !== undefined ? req.body.address.street : (currentAddr.street || ''),
        city: req.body.address.city !== undefined ? req.body.address.city : (currentAddr.city || ''),
        state: req.body.address.state !== undefined ? req.body.address.state : (currentAddr.state || ''),
        pin: req.body.address.pin !== undefined ? req.body.address.pin : (currentAddr.pin || '')
      };
    }

    if (req.body.emergency) {
      const currentEmg = employee.emergency || {};
      employee.emergency = {
        name: req.body.emergency.name !== undefined ? req.body.emergency.name : (currentEmg.name || ''),
        relation: req.body.emergency.relation !== undefined ? req.body.emergency.relation : (currentEmg.relation || ''),
        phone: req.body.emergency.phone !== undefined ? req.body.emergency.phone : (currentEmg.phone || '')
      };
    }

    if (req.body.blood !== undefined) employee.blood = req.body.blood;
    if (req.body.dob !== undefined) employee.dob = req.body.dob;
    if (req.body.gender !== undefined) employee.gender = req.body.gender;
    if (req.body.phone !== undefined) employee.phone = req.body.phone;
    if (req.body.name !== undefined) employee.name = req.body.name;
    if (req.body.email !== undefined) employee.email = req.body.email;
    if (req.body.parentStatus !== undefined) employee.parentStatus = req.body.parentStatus;
    if (req.body.licenseNumber !== undefined) employee.licenseNumber = req.body.licenseNumber;
    if (req.body.licenseExpiry !== undefined) employee.licenseExpiry = req.body.licenseExpiry;
    if (req.body.certifications !== undefined) employee.certifications = req.body.certifications;

    const updatedEmployee = await employee.save();
    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee record:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee
// @access  Private/HR only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const employee = await Employee.findOne({ id: req.params.id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await Employee.deleteOne({ id: req.params.id });
    res.json({ message: 'Employee removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/employees/:id/status
// @desc    Approve or Reject registration application
// @access  Private/HR only
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  const { status } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const employee = await Employee.findOne({ id: req.params.id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.status = status;
    await employee.save();
    res.json({ message: `Employee status set to ${status}`, employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Multer Storage Configuration
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = process.env.NODE_ENV === 'production' 
  ? '/tmp/uploads' 
  : path.join(__dirname, '../uploads');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn('Warning: Could not create upload directory:', err.message);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const cleanDocName = (req.body.docName || 'document').replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${req.user.id}-${cleanDocName}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// @route   POST /api/employees/upload-doc
// @desc    Upload employee document
// @access  Private
router.post('/upload-doc', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { docName } = req.body;
    if (!docName) {
      return res.status(400).json({ message: 'Document name is required' });
    }

    const employee = await Employee.findOne({ id: req.user.id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (!employee.documents) {
      employee.documents = new Map();
    }

    const fileRelativePath = `uploads/${req.file.filename}`;
    employee.documents.set(docName, fileRelativePath);
    employee.markModified('documents');
    await employee.save();

    res.json({
      message: 'File uploaded successfully',
      docName,
      filePath: fileRelativePath,
      fileName: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/employees/upload-avatar
// @desc    Upload employee profile picture (avatar)
// @access  Private
router.post('/upload-avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // HR can upload for another employee by passing empId
    const targetEmpId = (req.user.role === 'hr' && req.body.empId) ? req.body.empId : req.user.id;

    const employee = await Employee.findOne({ id: targetEmpId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const fileRelativePath = `/uploads/${req.file.filename}`;
    employee.avatar = fileRelativePath;
    await employee.save();

    res.json({
      message: 'Profile picture uploaded successfully',
      avatar: fileRelativePath,
      empId: targetEmpId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
