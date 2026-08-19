const express = require('express');
const router = express.Router();
const TrainingNeedsAnalysis = require('../models/TrainingNeedsAnalysis');
const AnnualTrainingPlan = require('../models/AnnualTrainingPlan');
const TrainingProgram = require('../models/TrainingProgram');
const TrainerVenue = require('../models/TrainerVenue');
const SkillMatrix = require('../models/SkillMatrix');
const CompetencyMatrix = require('../models/CompetencyMatrix');
const AssessmentCertification = require('../models/AssessmentCertification');
const LearningHistory = require('../models/LearningHistory');
const TrainingAuditLog = require('../models/TrainingAuditLog');
const { protect } = require('../middleware/auth');

// Audit logger helper
const logAudit = async (req, entityType, entityId, action, previousState, newState, comments) => {
  try {
    const user = req.user || { id: 'SYSTEM', name: 'System User', role: 'system' };
    await TrainingAuditLog.create({
      entityType,
      entityId,
      action,
      performedBy: {
        id: user.id || user._id || 'SYSTEM',
        name: user.name || 'User',
        role: user.role || 'employee'
      },
      previousState: previousState || '',
      newState: newState || '',
      comments: comments || ''
    });
  } catch (e) {
    console.error('M8 Audit Log Error:', e);
  }
};

// ==========================================
// 1. TRAINING NEEDS ANALYSIS (TNA)
// ==========================================
router.get('/tna', protect, async (req, res) => {
  try {
    const { status, search } = req.query;
    let filter = {};
    if (req.user.role !== 'hr') {
      filter['employee.id'] = req.user.id;
    }
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { requestedSkill: { $regex: search, $options: 'i' } },
        { 'employee.name': { $regex: search, $options: 'i' } }
      ];
    }
    const tnaList = await TrainingNeedsAnalysis.find(filter).sort({ createdAt: -1 });
    res.json(tnaList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/tna', protect, async (req, res) => {
  try {
    const count = await TrainingNeedsAnalysis.countDocuments();
    const tnaId = `TNA-${1000 + count + 1}`;

    const newTna = new TrainingNeedsAnalysis({
      tnaId,
      employee: {
        id: req.user.id,
        name: req.user.name,
        dept: req.user.dept || 'Engineering',
        designation: req.user.designation || 'Software Engineer'
      },
      skillGapCategory: req.body.skillGapCategory || 'Technical',
      requestedSkill: req.body.requestedSkill,
      currentProficiency: req.body.currentProficiency || 2,
      targetProficiency: req.body.targetProficiency || 4,
      priority: req.body.priority || 'Medium',
      targetQuarter: req.body.targetQuarter || 'Q3-2026',
      justification: req.body.justification
    });

    await newTna.save();
    await logAudit(req, 'TNA', tnaId, 'Created', '', 'Requested', req.body.requestedSkill);
    res.status(201).json(newTna);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/tna/:id/status', protect, async (req, res) => {
  try {
    const tna = await TrainingNeedsAnalysis.findById(req.params.id);
    if (!tna) return res.status(404).json({ message: 'TNA request not found' });

    const prevStatus = tna.status;
    const { status, managerComments, hrComments } = req.body;

    if (status) tna.status = status;
    if (managerComments) tna.managerComments = managerComments;
    if (hrComments) tna.hrComments = hrComments;

    await tna.save();
    await logAudit(req, 'TNA', tna.tnaId, 'Status Update', prevStatus, status, managerComments || hrComments || '');
    res.json(tna);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// 2. ANNUAL TRAINING PLAN
// ==========================================
router.get('/annual-plan', protect, async (req, res) => {
  try {
    const plans = await AnnualTrainingPlan.find().sort({ year: -1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/annual-plan', protect, async (req, res) => {
  try {
    const count = await AnnualTrainingPlan.countDocuments();
    const planId = `ATP-${2026 + count}`;

    const newPlan = new AnnualTrainingPlan({
      planId,
      year: req.body.year || 2026,
      title: req.body.title,
      allocatedBudget: req.body.allocatedBudget || 500000,
      targetDepartments: req.body.targetDepartments || ['Engineering', 'Product', 'HR'],
      plannedCoursesCount: req.body.plannedCoursesCount || 6
    });

    await newPlan.save();
    await logAudit(req, 'AnnualPlan', planId, 'Created', '', 'Approved', req.body.title);
    res.status(201).json(newPlan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// 3. TRAINING PROGRAMS & CALENDAR
// ==========================================
router.get('/programs', protect, async (req, res) => {
  try {
    const { category, status } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const programs = await TrainingProgram.find(filter).sort({ scheduleDate: 1 });
    res.json(programs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/programs', protect, async (req, res) => {
  try {
    const count = await TrainingProgram.countDocuments();
    const programId = `TRN-${1000 + count + 1}`;

    const newProg = new TrainingProgram({
      programId,
      title: req.body.title,
      category: req.body.category || 'Technical & Engineering',
      mode: req.body.mode || 'Classroom',
      durationHours: req.body.durationHours || 8,
      trainer: req.body.trainer || { name: 'Internal SME Lead', type: 'Internal' },
      venue: req.body.venue || { name: 'Conference Room Alpha', location: 'HQ Bangalore' },
      capacity: req.body.capacity || 25,
      scheduleDate: req.body.scheduleDate || new Date(Date.now() + 7 * 24 * 3600000)
    });

    await newProg.save();
    await logAudit(req, 'Program', programId, 'Scheduled', '', 'Scheduled', req.body.title);
    res.status(201).json(newProg);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/programs/:id/enroll', protect, async (req, res) => {
  try {
    const prog = await TrainingProgram.findById(req.params.id);
    if (!prog) return res.status(404).json({ message: 'Program not found' });

    const exists = prog.enrolledEmployees.some(e => e.id === req.user.id);
    if (!exists) {
      prog.enrolledEmployees.push({
        id: req.user.id,
        name: req.user.name,
        dept: req.user.dept || 'Engineering',
        status: 'Confirmed'
      });
      await prog.save();
      await logAudit(req, 'Program', prog.programId, 'Enrolled', '', 'Confirmed', `Enrolled ${req.user.name}`);
    }
    res.json(prog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// 4. TRAINERS & VENUES
// ==========================================
router.get('/trainers-venues', protect, async (req, res) => {
  try {
    const items = await TrainerVenue.find({ isActive: true });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/trainers-venues', protect, async (req, res) => {
  try {
    const newItem = new TrainerVenue(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// 5. SKILL & COMPETENCY MATRIX
// ==========================================
router.get('/skill-matrix', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'hr') {
      filter['employee.id'] = req.user.id;
    }
    const skills = await SkillMatrix.find(filter).sort({ createdAt: -1 });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/skill-matrix', protect, async (req, res) => {
  try {
    const count = await SkillMatrix.countDocuments();
    const skillId = `SKL-${1000 + count + 1}`;
    const gapScore = (req.body.requiredLevel || 4) - (req.body.currentLevel || 2);

    const newSkill = new SkillMatrix({
      skillId,
      skillName: req.body.skillName,
      category: req.body.category || 'Core Technical',
      department: req.body.department || 'Engineering',
      employee: req.body.employee || { id: req.user.id, name: req.user.name },
      requiredLevel: req.body.requiredLevel || 4,
      currentLevel: req.body.currentLevel || 2,
      gapScore: gapScore > 0 ? gapScore : 0
    });

    await newSkill.save();
    await logAudit(req, 'SkillMatrix', skillId, 'Evaluated', '', 'Evaluated', req.body.skillName);
    res.status(201).json(newSkill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/competency-matrix', protect, async (req, res) => {
  try {
    const comps = await CompetencyMatrix.find().sort({ createdAt: -1 });
    res.json(comps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 6. ASSESSMENTS & CERTIFICATIONS
// ==========================================
router.get('/assessments', protect, async (req, res) => {
  try {
    const items = await AssessmentCertification.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/assessments/:id/issue-certificate', protect, async (req, res) => {
  try {
    const cert = await AssessmentCertification.findById(req.params.id);
    if (!cert) return res.status(404).json({ message: 'Assessment not found' });

    const score = req.body.score || 85;
    const certUrl = `https://hrorbit.cert.verify/${cert.assessmentId}/${req.user.id}`;

    cert.issuedCertificates.push({
      employeeId: req.user.id,
      employeeName: req.user.name,
      score,
      issueDate: new Date(),
      certificateUrl: certUrl
    });

    await cert.save();

    // Create Learning History Record
    await LearningHistory.create({
      employeeId: req.user.id,
      employeeName: req.user.name,
      programId: cert.programId || 'TRN-1001',
      programTitle: cert.title,
      scoreObtained: score,
      status: score >= cert.passingMarks ? 'Passed with Distinction' : 'Completed',
      certificateUrl: certUrl
    });

    await logAudit(req, 'Certificate', cert.assessmentId, 'Issued', '', 'Issued', `Issued to ${req.user.name}`);
    res.json(cert);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// 7. LEARNING HISTORY & PORTAL
// ==========================================
router.get('/learning-history', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'hr') {
      filter.employeeId = req.user.id;
    }
    const history = await LearningHistory.find(filter).sort({ completionDate: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 8. DASHBOARD METRICS
// ==========================================
router.get('/dashboard', protect, async (req, res) => {
  try {
    const totalPrograms = await TrainingProgram.countDocuments();
    const completedPrograms = await TrainingProgram.countDocuments({ status: 'Completed' });
    const totalTnas = await TrainingNeedsAnalysis.countDocuments();
    const approvedTnas = await TrainingNeedsAnalysis.countDocuments({ status: 'HR Approved' });
    const certificatesCount = await LearningHistory.countDocuments({ status: { $in: ['Completed', 'Passed with Distinction'] } });

    res.json({
      totalTrainingPrograms: totalPrograms,
      completedPrograms,
      tnaRequestsTotal: totalTnas,
      approvedTnaRequests: approvedTnas,
      issuedCertificates: certificatesCount,
      skillGapClosurePercentage: '88.4%',
      averageAssessmentScore: '86.2%',
      trainingBudgetUtilization: '74.5%'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 9. AUDIT LOGS
// ==========================================
router.get('/audit', protect, async (req, res) => {
  try {
    const logs = await TrainingAuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
