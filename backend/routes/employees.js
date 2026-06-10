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
  const { name, email, dept, role, aadhaar, phone, joined } = req.body;

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
    const employee = await Employee.findOne({ id: req.params.id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if HR or self
    const isHr = req.user.role === 'hr';
    const isSelf = req.user.id === req.params.id;

    if (!isHr && !isSelf) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (isHr) {
      // HR can edit anything
      employee.name = req.body.name || employee.name;
      employee.email = req.body.email || employee.email;
      employee.dept = req.body.dept || employee.dept;
      employee.role = req.body.role || employee.role;
      employee.aadhaar = req.body.aadhaar || employee.aadhaar;
      employee.joined = req.body.joined || employee.joined;
      employee.phone = req.body.phone || employee.phone;
    }

    // Both HR and Self can update personal fields
    if (req.body.address) {
      employee.address = {
        door: req.body.address.door || employee.address.door,
        street: req.body.address.street || employee.address.street,
        city: req.body.address.city || employee.address.city,
        state: req.body.address.state || employee.address.state,
        pin: req.body.address.pin || employee.address.pin
      };
    }

    if (req.body.emergency) {
      employee.emergency = {
        name: req.body.emergency.name || employee.emergency.name,
        relation: req.body.emergency.relation || employee.emergency.relation,
        phone: req.body.emergency.phone || employee.emergency.phone
      };
    }

    employee.blood = req.body.blood || employee.blood;
    employee.dob = req.body.dob || employee.dob;
    employee.gender = req.body.gender || employee.gender;
    employee.phone = req.body.phone || employee.phone;
    employee.name = req.body.name || employee.name;
    employee.email = req.body.email || employee.email;

    const updatedEmployee = await employee.save();
    res.json(updatedEmployee);
  } catch (error) {
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

module.exports = router;
