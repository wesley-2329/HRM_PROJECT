const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadToCloudinary } = require('../utils/cloudinary');

const ensureEmployeesSeeded = async () => {
  try {
    const count = await Employee.countDocuments({});
    if (count === 0) {
      const { mockEmployees } = require('../config/mock_data');
      if (mockEmployees && mockEmployees.length > 0) {
        await Employee.insertMany(mockEmployees);
      }
    }
  } catch (e) {
    console.error('Error auto-seeding employees:', e.message);
  }
};

// @route   GET /api/employees
// @desc    Get all employees
// @access  Private/HR only
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    await ensureEmployeesSeeded();
    const employees = await Employee.find({}).select('-password');
    res.json(employees);
  } catch (error) { next(error); }
});

// @route   GET /api/employees/public
// @desc    Get basic info of all active employees for public org directory / org chart
// @access  Private
router.get('/public', protect, async (req, res, next) => {
  try {
    await ensureEmployeesSeeded();
    const list = await Employee.find({ status: 'Approved' }).select('id name role dept teamLeadId isTeamLead avatar gender designation functionalManagerId branch businessUnit grade');
    res.json(list);
  } catch (error) { next(error); }
});

// @route   GET /api/employees/:id
// @desc    Get employee details
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
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
  } catch (error) { next(error); }
});

// @route   POST /api/employees
// @desc    Add employee manually
// @access  Private/HR only
router.post('/', protect, adminOnly, async (req, res, next) => {
  const { name, email, dept, role, aadhaar, phone, joined, gender, address, emergency, parentStatus } = req.body;

  try {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanAadhaar = (aadhaar || '').replace(/\D/g, '');

    if (cleanPhone && cleanPhone.length !== 10) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 numeric digits' });
    }
    if (cleanAadhaar && cleanAadhaar.length !== 12) {
      return res.status(400).json({ message: 'Aadhaar number must be exactly 12 numeric digits' });
    }

    const userExists = await Employee.findOne({ 
      email: email.trim().toLowerCase(),
      status: { $ne: 'Deleted' }
    });
    if (userExists) {
      return res.status(400).json({ message: 'Active employee with this email address already exists' });
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

    // Set default password as defaultPass123
    const employee = await Employee.create({
      id: newEmpId,
      name,
      email: email.trim().toLowerCase(),
      password: 'defaultPass123',
      dept,
      role,
      joined,
      aadhaar,
      phone,
      gender: gender || 'Male',
      parentStatus: parentStatus || 'No',
      address: address || {},
      emergency: emergency || {},
      status: 'Approved'
    });

    res.status(201).json(employee);
  } catch (error) { next(error); }
});

// @route   PUT /api/employees/:id
// @desc    Update employee details
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
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

    const setPayload = {};

    if (isHr) {
      if (req.body.name !== undefined) setPayload.name = req.body.name;
      if (req.body.email !== undefined) setPayload.email = req.body.email;
      if (req.body.dept !== undefined) setPayload.dept = req.body.dept;
      if (req.body.role !== undefined) setPayload.role = req.body.role;
      if (req.body.aadhaar !== undefined) setPayload.aadhaar = req.body.aadhaar;
      if (req.body.joined !== undefined) setPayload.joined = req.body.joined;
      if (req.body.phone !== undefined) setPayload.phone = req.body.phone;
      if (req.body.isTeamLead !== undefined) setPayload.isTeamLead = req.body.isTeamLead;
      if (req.body.teamLeadId !== undefined) setPayload.teamLeadId = req.body.teamLeadId;
    }

    if (req.body.address) {
      if (req.body.address.door !== undefined) setPayload['address.door'] = req.body.address.door;
      if (req.body.address.street !== undefined) setPayload['address.street'] = req.body.address.street;
      if (req.body.address.city !== undefined) setPayload['address.city'] = req.body.address.city;
      if (req.body.address.state !== undefined) setPayload['address.state'] = req.body.address.state;
      if (req.body.address.pin !== undefined) setPayload['address.pin'] = req.body.address.pin;
    }

    if (req.body.emergency) {
      if (req.body.emergency.name !== undefined) setPayload['emergency.name'] = req.body.emergency.name;
      if (req.body.emergency.relation !== undefined) setPayload['emergency.relation'] = req.body.emergency.relation;
      if (req.body.emergency.phone !== undefined) setPayload['emergency.phone'] = req.body.emergency.phone;
    }

    if (req.body.blood !== undefined) setPayload.blood = req.body.blood;
    if (req.body.dob !== undefined) setPayload.dob = req.body.dob;
    if (req.body.gender !== undefined) setPayload.gender = req.body.gender;
    if (req.body.phone !== undefined) setPayload.phone = req.body.phone;
    if (req.body.name !== undefined) setPayload.name = req.body.name;
    if (req.body.email !== undefined) setPayload.email = req.body.email;
    if (req.body.parentStatus !== undefined) setPayload.parentStatus = req.body.parentStatus;
    if (req.body.licenseNumber !== undefined) setPayload.licenseNumber = req.body.licenseNumber;
    if (req.body.licenseExpiry !== undefined) setPayload.licenseExpiry = req.body.licenseExpiry;
    if (req.body.certifications !== undefined) setPayload.certifications = req.body.certifications;

    const updatedEmployee = await Employee.findByIdAndUpdate(
      employee._id,
      { $set: setPayload },
      { new: true, runValidators: false }
    );

    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee record:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee
// @access  Private/HR only
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ id: req.params.id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await Employee.deleteOne({ id: req.params.id });
    res.json({ message: 'Employee removed successfully' });
  } catch (error) { next(error); }
});

// @route   PUT /api/employees/:id/status
// @desc    Approve or Reject registration application
// @access  Private/HR only
router.put('/:id/status', protect, adminOnly, async (req, res, next) => {
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
  } catch (error) { next(error); }
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
  } catch (error) { next(error); }
});

// @route   POST /api/employees/upload-avatar
// @desc    Upload employee profile picture (avatar)
// @access  Private
router.post('/upload-avatar', protect, upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const targetEmpId = (req.user.role === 'hr' && req.body.empId) ? req.body.empId : (req.user.id || req.user._id);

    let employee = null;
    if (mongoose.connection.readyState === 1) {
      try {
        if (targetEmpId) {
          employee = await Employee.findOne({ id: targetEmpId });
          if (!employee && mongoose.Types.ObjectId.isValid(targetEmpId)) {
            employee = await Employee.findById(targetEmpId);
          }
          if (!employee) {
            employee = await Employee.findOne({ id: new RegExp('^' + targetEmpId + '$', 'i') });
          }
          if (!employee) {
            employee = await Employee.findOne({ email: String(targetEmpId).toLowerCase().trim() });
          }
        }
        if (!employee && !req.body.empId && req.user.email) {
          employee = await Employee.findOne({ email: req.user.email });
        }
      } catch (dbErr) {
        console.warn('DB lookup failed in upload-avatar, falling back to mockEmployees:', dbErr.message);
      }
    }

    if (!employee) {
      const { mockEmployees } = require('../config/mock_data');
      if (mockEmployees && mockEmployees.length > 0) {
        employee = mockEmployees.find(e =>
          (targetEmpId && (e.id === targetEmpId || e._id === targetEmpId || (e.email && e.email.toLowerCase() === String(targetEmpId).toLowerCase()))) ||
          (req.user?.email && e.email && e.email.toLowerCase() === req.user.email.toLowerCase()) ||
          (req.user?.id && e.id === req.user.id)
        );
      }
    }

    if (!employee) {
      employee = req.user;
    }

    let finalAvatarUrl = `/uploads/${req.file.filename}`;

    // Also ensure copy exists in local uploads if saved to /tmp
    try {
      const localUploadDir = path.join(__dirname, '../uploads');
      if (req.file.destination !== localUploadDir && fs.existsSync(localUploadDir)) {
        fs.copyFileSync(req.file.path, path.join(localUploadDir, req.file.filename));
      }
    } catch (copyErr) {}

    // Upload to Cloudinary using product environment credentials (bounded to 4000ms)
    try {
      const publicId = `avatar_${(employee && (employee.id || employee._id)) || targetEmpId}_${Date.now()}`;
      const cldPromise = uploadToCloudinary(req.file.path, publicId);
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 4000));
      const cldResult = await Promise.race([cldPromise, timeoutPromise]);
      if (cldResult && cldResult.secure_url) {
        finalAvatarUrl = cldResult.secure_url;
      }
    } catch (cldErr) {
      console.warn('[Cloudinary Notice] Upload fell back to local storage:', cldErr.message);
    }

    if (employee) {
      employee.avatar = finalAvatarUrl;
      employee.profilePicture = finalAvatarUrl;
      employee.profileImage = finalAvatarUrl;
      if (typeof employee.save === 'function') {
        try {
          await employee.save();
        } catch (saveErr) {
          console.warn('Could not persist avatar to MongoDB, saved to state:', saveErr.message);
        }
      }
    }

    if (req.user) {
      req.user.avatar = finalAvatarUrl;
      req.user.profilePicture = finalAvatarUrl;
      req.user.profileImage = finalAvatarUrl;
    }

    res.json({
      message: 'Profile picture uploaded successfully',
      avatar: finalAvatarUrl,
      profilePicture: finalAvatarUrl,
      empId: (employee && (employee.id || employee._id)) || targetEmpId
    });
  } catch (error) { next(error); }
});

module.exports = router;
