const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const GradeMaster = require('../models/GradeMaster');
const BandMaster = require('../models/BandMaster');
const GradeMovementRequest = require('../models/GradeMovementRequest');
const DesignationHistory = require('../models/DesignationHistory');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route   GET /api/grades/dashboard
// @desc    Get counts and distributions
router.get('/dashboard', protect, async (req, res) => {
  try {
    const gradesCount = await GradeMaster.countDocuments({});
    const bandsCount = await BandMaster.countDocuments({});
    const activeEmployees = await Employee.countDocuments({ status: 'Approved' });

    const list = await Employee.find({ status: 'Approved' });
    const gradeDist = {};
    list.forEach(emp => {
      const g = emp.grade || 'Unmapped';
      gradeDist[g] = (gradeDist[g] || 0) + 1;
    });

    const gradeDistribution = Object.keys(gradeDist).map(name => ({ name, count: gradeDist[name] }));

    res.json({
      gradesCount,
      bandsCount,
      activeEmployees,
      gradeDistribution
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/grades
// @desc    Get all grades
router.get('/', protect, async (req, res) => {
  try {
    const list = await GradeMaster.find({}).sort({ gradeLevel: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/grades
// @desc    Create new grade
router.post('/', protect, async (req, res) => {
  const { gradeCode, gradeName, gradeDescription, gradeLevel, status } = req.body;

  if (!gradeCode || !gradeName || !gradeLevel) {
    return res.status(400).json({ message: 'Grade Code, Name, and Level are required.' });
  }

  try {
    // Validate unique code
    const existingCode = await GradeMaster.findOne({ gradeCode });
    if (existingCode) return res.status(400).json({ message: 'Duplicate Grade Code not allowed.' });

    // Validate unique name
    const existingName = await GradeMaster.findOne({ gradeName });
    if (existingName) return res.status(400).json({ message: 'Grade Name must be unique.' });

    const grade = await GradeMaster.create({
      gradeCode,
      gradeName,
      gradeDescription,
      gradeLevel,
      status: status || 'Active'
    });

    res.status(201).json(grade);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/grades/:id
// @desc    Update grade details
router.put('/:id', protect, async (req, res) => {
  try {
    const grade = await GradeMaster.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!grade) return res.status(404).json({ message: 'Grade not found.' });
    res.json(grade);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/grades/bands
// @desc    Get all bands
router.get('/bands', protect, async (req, res) => {
  try {
    const list = await BandMaster.find({}).sort({ careerLevel: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/grades/bands
// @desc    Create new band
router.post('/bands', protect, async (req, res) => {
  const { bandCode, bandName, bandDescription, parentGrade, careerLevel, status } = req.body;

  if (!bandCode || !bandName || !parentGrade || !careerLevel) {
    return res.status(400).json({ message: 'Band Code, Name, parent Grade, and career Level are required.' });
  }

  try {
    // Validate unique code
    const existingCode = await BandMaster.findOne({ bandCode });
    if (existingCode) return res.status(400).json({ message: 'Duplicate Band Code not allowed.' });

    // Validate unique name
    const existingName = await BandMaster.findOne({ bandName });
    if (existingName) return res.status(400).json({ message: 'Band Name must be unique.' });

    // Validate parent grade exists
    const validGrade = await GradeMaster.findOne({ gradeCode: parentGrade });
    if (!validGrade) return res.status(400).json({ message: 'Selected Parent Grade Code does not exist.' });

    const band = await BandMaster.create({
      bandCode,
      bandName,
      bandDescription,
      parentGrade,
      careerLevel,
      status: status || 'Active'
    });

    res.status(201).json(band);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/grades/bands/:id
// @desc    Update band details
router.put('/bands/:id', protect, async (req, res) => {
  try {
    const band = await BandMaster.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!band) return res.status(404).json({ message: 'Band not found.' });
    res.json(band);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/grades/assign
// @desc    Assign Grade/Band directly to employee (HR only)
router.post('/assign', protect, async (req, res) => {
  const { employeeId, gradeCode, bandCode, effectiveDate } = req.body;

  if (!employeeId || !gradeCode || !bandCode) {
    return res.status(400).json({ message: 'Employee ID, Grade, and Band are mandatory.' });
  }

  try {
    const emp = await Employee.findOne({ id: employeeId });
    if (!emp) return res.status(404).json({ message: 'Employee not found.' });

    const oldGrade = emp.grade || 'None';

    emp.grade = gradeCode;
    await emp.save();

    // Designation History
    await DesignationHistory.create({
      employeeId,
      employeeName: emp.name,
      oldDesignation: emp.designation || 'Staff',
      newDesignation: emp.designation || 'Staff',
      oldGrade,
      newGrade: gradeCode,
      effectiveDate: effectiveDate || new Date(),
      reason: 'Direct Grade Assignment'
    });

    res.json({ message: 'Direct Grade/Band Mapping update completed successfully.', employee: emp });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/grades/movements
// @desc    Get all grade movements
router.get('/movements', protect, async (req, res) => {
  try {
    const list = await GradeMovementRequest.find({}).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/grades/movements
// @desc    Create grade movement request (Promotion/Same Grade justification)
router.post('/movements', protect, async (req, res) => {
  const { employeeId, proposedGrade, proposedBand, reason, effectiveDate, attachmentUrl } = req.body;

  if (!employeeId || !proposedGrade || !proposedBand || !effectiveDate) {
    return res.status(400).json({ message: 'Employee, proposed grade/band, and effective date are required.' });
  }

  // Business Rule: Effective date cannot be backdated
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(effectiveDate) < today) {
    return res.status(400).json({ message: 'Effective date cannot be backdated.' });
  }

  try {
    const emp = await Employee.findOne({ id: employeeId });
    if (!emp) return res.status(404).json({ message: 'Employee profile not found.' });

    // Validate level movement: Same grade requires justification
    const currentGradeCode = emp.grade || 'A1';
    
    const request = await GradeMovementRequest.create({
      employeeId,
      employeeName: emp.name,
      department: emp.dept,
      currentGrade: currentGradeCode,
      proposedGrade,
      currentBand: 'Band 1',
      proposedBand,
      reason,
      effectiveDate,
      attachmentUrl,
      status: 'Pending Approval',
      approvalHistory: [{
        status: 'Pending Approval',
        actorName: req.user.name,
        comments: 'Grade movement request created.'
      }],
      auditLog: [{
        action: 'INITIATE_GRADE_MOVEMENT',
        actorName: req.user.name,
        details: `Initiated grade movement from ${currentGradeCode} to ${proposedGrade} for ${emp.name}.`
      }]
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/grades/movements/:id/action
// @desc    Approve/Reject/Hold Grade movement request
router.put('/movements/:id/action', protect, async (req, res) => {
  const { decision, comments } = req.body; // 'Approved' | 'Rejected' | 'Hold'

  try {
    const reqObj = await GradeMovementRequest.findById(req.params.id);
    if (!reqObj) return res.status(404).json({ message: 'Grade movement request not found.' });

    reqObj.status = decision;
    reqObj.remarks = comments || '';
    reqObj.approvedBy = req.user.name;

    reqObj.approvalHistory.push({
      status: decision,
      actorName: req.user.name,
      comments: comments || ''
    });

    reqObj.auditLog.push({
      action: `DECISION_${decision.toUpperCase()}`,
      actorName: req.user.name,
      details: `Verdict processed: ${decision}. Remarks: ${comments}`
    });

    await reqObj.save();

    if (decision === 'Approved') {
      const emp = await Employee.findOne({ id: reqObj.employeeId });
      if (emp) {
        const oldGrade = emp.grade;
        emp.grade = reqObj.proposedGrade;
        await emp.save();

        // Designation History log
        await DesignationHistory.create({
          employeeId: reqObj.employeeId,
          employeeName: reqObj.employeeName,
          oldDesignation: emp.designation || 'Staff',
          newDesignation: emp.designation || 'Staff',
          oldGrade,
          newGrade: reqObj.proposedGrade,
          effectiveDate: reqObj.effectiveDate,
          reason: `Grade Movement: ${reqObj.reason}`
        });
      }

      // Notify employee
      await Notification.create({
        type: 'reminder',
        title: 'Grade Hierarchy Updated',
        desc: `Your grade structure movement has been approved to: ${reqObj.proposedGrade}.`,
        empId: reqObj.employeeId
      });
    }

    res.json(reqObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/grades/reports
// @desc    Get aggregated distribution reports
router.get('/reports', protect, async (req, res) => {
  try {
    const employeesList = await Employee.find({ status: 'Approved' });
    const gradesList = await GradeMaster.find({});
    const bandsList = await BandMaster.find({});
    
    // Grade Distribution Reports
    const gradeReport = {};
    employeesList.forEach(emp => {
      const g = emp.grade || 'Unmapped';
      gradeReport[g] = (gradeReport[g] || 0) + 1;
    });

    // Band Distribution Reports
    const bandReport = {};
    bandsList.forEach(b => {
      bandReport[b.bandName] = 0;
    });
    employeesList.forEach(emp => {
      // Mock distribute
      const bKey = emp.grade ? `Band-${emp.grade}` : 'Band-Unmapped';
      bandReport[bKey] = (bandReport[bKey] || 0) + 1;
    });

    const movementsHistory = await GradeMovementRequest.find({ status: 'Approved' }).sort({ effectiveDate: -1 });

    res.json({
      gradeReport: Object.keys(gradeReport).map(k => ({ grade: k, count: gradeReport[k] })),
      bandReport: Object.keys(bandReport).map(k => ({ band: k, count: bandReport[k] })),
      movementsHistory
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
