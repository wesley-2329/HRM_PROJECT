const express = require('express');
const router = express.Router();
const CompanyPolicy = require('../models/CompanyPolicy');
const PolicyAcknowledgement = require('../models/PolicyAcknowledgement');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/policies
// @desc    Get all policies (HR gets all; employees get active only)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let policies;
    if (req.user.role === 'hr') {
      policies = await CompanyPolicy.find({}).sort({ updatedAt: -1 });
    } else {
      policies = await CompanyPolicy.find({ status: 'Active' }).sort({ updatedAt: -1 });
    }
    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/policies/employee-status
// @desc    Get current employee's acknowledgement status for all active policies
// @access  Private
router.get('/employee-status', protect, async (req, res) => {
  try {
    const activePolicies = await CompanyPolicy.find({ status: 'Active' });
    const result = [];
    let pendingCount = 0;

    for (const policy of activePolicies) {
      let ack = await PolicyAcknowledgement.findOne({
        employeeId: req.user.id,
        policyId: policy._id,
        policyVersion: policy.version
      });

      // Self-healing: if no acknowledgement record exists for this active policy version, initialize as Pending
      if (!ack) {
        ack = await PolicyAcknowledgement.create({
          employeeId: req.user.id,
          employeeName: req.user.name,
          department: req.user.dept || 'General',
          policyId: policy._id,
          policyName: policy.name,
          policyVersion: policy.version,
          status: 'Pending'
        });
      }

      if (ack.status === 'Pending') {
        pendingCount++;
      }

      result.push({
        _id: policy._id,
        name: policy.name,
        content: policy.content,
        version: policy.version,
        effectiveDate: policy.effectiveDate,
        lastUpdatedDate: policy.lastUpdatedDate,
        status: ack.status,
        acceptedAt: ack.acceptedAt
      });
    }

    res.json({
      policies: result,
      pendingCount,
      onboardingCompleted: req.user.onboardingCompleted
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/policies
// @desc    Create a new policy (HR only)
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
  const { name, content, effectiveDate, status } = req.body;

  try {
    const existing = await CompanyPolicy.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'A policy with this name already exists' });
    }

    const policy = await CompanyPolicy.create({
      name,
      content,
      effectiveDate: effectiveDate || new Date(),
      lastUpdatedDate: new Date(),
      status: status || 'Active',
      version: 1
    });

    // Create pending acknowledgements for all approved employees
    const employees = await Employee.find({ status: 'Approved' });
    const pendingAcks = employees.map(emp => ({
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.dept || 'General',
      policyId: policy._id,
      policyName: policy.name,
      policyVersion: 1,
      status: 'Pending'
    }));

    if (pendingAcks.length > 0) {
      await PolicyAcknowledgement.insertMany(pendingAcks, { ordered: false }).catch(() => {});
    }

    // Set onboardingCompleted to false for new or unacknowledged non-HR employees
    await Employee.updateMany(
      { role: { $ne: 'hr' }, status: 'Approved' },
      { $set: { onboardingCompleted: false } }
    );

    // Create Notification in database
    const notif = await Notification.create({
      type: 'reminder',
      title: 'New Policy Published',
      desc: `A new company policy "${name}" has been published. Read and acknowledge it.`,
      empId: '' // Global
    });

    // Broadcast socket notification
    if (req.io) {
      req.io.emit('notification', {
        _id: notif._id,
        type: 'reminder',
        title: 'New Policy Published',
        desc: `A new company policy "${name}" has been published.`,
        createdAt: notif.createdAt
      });
    }

    res.status(201).json(policy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/policies/:id
// @desc    Update an existing policy & increment version (HR only)
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  const { name, content, effectiveDate, status, changeSummary } = req.body;

  try {
    const policy = await CompanyPolicy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    // Capture history log of the current active state
    policy.history.push({
      version: policy.version,
      content: policy.content,
      effectiveDate: policy.effectiveDate,
      lastUpdatedDate: policy.lastUpdatedDate,
      updatedBy: req.user.name,
      changeSummary: changeSummary || 'Standard updates applied',
      updatedAt: new Date()
    });

    // Update values & increment version
    policy.name = name || policy.name;
    policy.content = content || policy.content;
    policy.effectiveDate = effectiveDate || policy.effectiveDate;
    policy.lastUpdatedDate = new Date();
    policy.status = status || policy.status;
    policy.version = policy.version + 1;

    await policy.save();

    // Reset compliance acknowledgements for all approved employees for the new version
    const employees = await Employee.find({ status: 'Approved' });
    const pendingAcks = employees.map(emp => ({
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.dept || 'General',
      policyId: policy._id,
      policyName: policy.name,
      policyVersion: policy.version,
      status: 'Pending'
    }));

    if (pendingAcks.length > 0) {
      await PolicyAcknowledgement.insertMany(pendingAcks, { ordered: false }).catch(() => {});
    }

    // Set onboardingCompleted to false for non-HR employees to trigger re-acknowledgement
    await Employee.updateMany(
      { role: { $ne: 'hr' }, status: 'Approved' },
      { $set: { onboardingCompleted: false } }
    );

    // Create Notification in database
    const notif = await Notification.create({
      type: 'reminder',
      title: 'Policy Updated',
      desc: `Company policy "${policy.name}" has been updated to v${policy.version}. Re-acknowledgement is required.`,
      empId: '' // Global
    });

    // Broadcast socket notification
    if (req.io) {
      req.io.emit('notification', {
        _id: notif._id,
        type: 'reminder',
        title: 'Policy Updated',
        desc: `Policy "${policy.name}" has been updated to v${policy.version}.`,
        createdAt: notif.createdAt
      });
    }

    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/policies/:id/status
// @desc    Toggle policy active / inactive status (HR only)
// @access  Private/Admin
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  const { status } = req.body;

  try {
    const policy = await CompanyPolicy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    policy.status = status;
    policy.lastUpdatedDate = new Date();
    await policy.save();

    res.json({ message: `Policy status updated to ${status}`, policy });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/policies/:id/acknowledge
// @desc    Acknowledge a policy version (Employee flow)
// @access  Private
router.post('/:id/acknowledge', protect, async (req, res) => {
  try {
    const policy = await CompanyPolicy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    // Find and update the acknowledgement record to Accepted
    let ack = await PolicyAcknowledgement.findOne({
      employeeId: req.user.id,
      policyId: policy._id,
      policyVersion: policy.version
    });

    if (!ack) {
      ack = new PolicyAcknowledgement({
        employeeId: req.user.id,
        employeeName: req.user.name,
        department: req.user.dept || 'General',
        policyId: policy._id,
        policyName: policy.name,
        policyVersion: policy.version
      });
    }

    ack.status = 'Accepted';
    ack.acceptedAt = new Date();
    await ack.save();

    // Check if the employee has completed onboarding (accepted all active policies)
    const activePolicies = await CompanyPolicy.find({ status: 'Active' });
    let pendingCount = 0;

    for (const p of activePolicies) {
      const pAck = await PolicyAcknowledgement.findOne({
        employeeId: req.user.id,
        policyId: p._id,
        policyVersion: p.version,
        status: 'Accepted'
      });
      if (!pAck) {
        pendingCount++;
      }
    }

    let onboardingCompleted = req.user.onboardingCompleted;
    if (pendingCount === 0) {
      onboardingCompleted = true;
      await Employee.findOneAndUpdate({ id: req.user.id }, { onboardingCompleted: true });
    }

    res.json({
      message: 'Acknowledgement stored successfully.',
      ack,
      pendingCount,
      onboardingCompleted
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/policies/compliance-reports
// @desc    Get policy compliance reports (HR only)
// @access  Private/Admin
router.get('/compliance-reports', protect, adminOnly, async (req, res) => {
  try {
    const activePolicies = await CompanyPolicy.find({});
    const acceptedList = await PolicyAcknowledgement.find({ status: 'Accepted' }).sort({ acceptedAt: -1 });
    const pendingList = await PolicyAcknowledgement.find({ status: 'Pending' }).sort({ updatedAt: -1 });
    const totalEmployeesCount = await Employee.countDocuments({ status: 'Approved' });

    // Compute Policy-wise Compliance
    const policyCompliance = [];
    for (const policy of activePolicies) {
      const acceptedCount = await PolicyAcknowledgement.countDocuments({
        policyId: policy._id,
        policyVersion: policy.version,
        status: 'Accepted'
      });

      const rate = totalEmployeesCount > 0 ? (acceptedCount / totalEmployeesCount) * 100 : 0;
      policyCompliance.push({
        policyId: policy._id,
        name: policy.name,
        version: policy.version,
        acceptedCount,
        totalCount: totalEmployeesCount,
        complianceRate: Math.round(rate * 10) / 10
      });
    }

    // Compute Department-wise Compliance
    const depts = await Employee.distinct('dept', { status: 'Approved' });
    const departmentCompliance = [];

    for (const dept of depts) {
      const deptEmployeesCount = await Employee.countDocuments({ dept, status: 'Approved' });
      if (deptEmployeesCount === 0) continue;

      // Total acks required for active policies in this department
      let totalRequired = 0;
      let totalAccepted = 0;

      for (const policy of activePolicies.filter(p => p.status === 'Active')) {
        const reqCount = deptEmployeesCount;
        const accCount = await PolicyAcknowledgement.countDocuments({
          policyId: policy._id,
          policyVersion: policy.version,
          status: 'Accepted',
          department: dept
        });

        totalRequired += reqCount;
        totalAccepted += accCount;
      }

      const rate = totalRequired > 0 ? (totalAccepted / totalRequired) * 100 : 0;
      departmentCompliance.push({
        department: dept,
        acceptedCount: totalAccepted,
        requiredCount: totalRequired,
        complianceRate: Math.round(rate * 10) / 10
      });
    }

    // Version history logs
    const versionHistory = activePolicies.map(p => ({
      policyId: p._id,
      name: p.name,
      currentVersion: p.version,
      history: p.history
    }));

    res.json({
      acceptedList,
      pendingList,
      policyCompliance,
      departmentCompliance,
      versionHistory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
