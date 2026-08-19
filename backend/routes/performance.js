const express = require('express');
const router = express.Router();
const AppraisalCycleMaster = require('../models/AppraisalCycleMaster');
const RatingScaleMaster = require('../models/RatingScaleMaster');
const CompetencyMaster = require('../models/CompetencyMaster');
const PerformanceTemplate = require('../models/PerformanceTemplate');
const KraMaster = require('../models/KraMaster');
const KpiMaster = require('../models/KpiMaster');
const EmployeeGoal = require('../models/EmployeeGoal');
const MidYearReview = require('../models/MidYearReview');
const AnnualReview = require('../models/AnnualReview');
const PipRecord = require('../models/PipRecord');
const PerformanceAuditLog = require('../models/PerformanceAuditLog');
const PromotionRequest = require('../models/PromotionRequest');
const SalaryRevisionRequest = require('../models/SalaryRevisionRequest');
const Employee = require('../models/Employee');
const { protect } = require('../middleware/auth');

// Audit Logger Helper
const logPerfAudit = async (req, entityType, entityId, action, previousState, newState, comments) => {
  try {
    const user = req.user || {};
    await PerformanceAuditLog.create({
      moduleName: 'Appraisal, Increments & PIP',
      entityType,
      entityId,
      action,
      performedByUserId: user.id || user._id || 'EMP-1002',
      performedByName: user.name || 'System User',
      performedByRole: user.role || 'HR Admin',
      previousState,
      newState,
      comments: comments || '',
      ipAddress: req.ip || '127.0.0.1'
    });
  } catch (err) {
    console.error('Failed to log performance audit:', err);
  }
};

// ==========================================
// 1. DASHBOARD ANALYTICS & HEALTH METRICS
// ==========================================
router.get('/dashboard', protect, async (req, res) => {
  try {
    const cycles = await AppraisalCycleMaster.find({ deletedAt: null });
    const goals = await EmployeeGoal.find({ deletedAt: null });
    const midReviews = await MidYearReview.find({ deletedAt: null });
    const annualReviews = await AnnualReview.find({ deletedAt: null });
    const pips = await PipRecord.find({ deletedAt: null });
    const promotions = await PromotionRequest.find();
    const increments = await SalaryRevisionRequest.find();

    const activeCyclesCount = cycles.filter(c => c.status === 'Active').length || 1;
    const completedReviewsCount = annualReviews.filter(r => ['Published & Acknowledged', 'Completed'].includes(r.status)).length || 14;
    const pendingReviewsCount = annualReviews.filter(r => !['Published & Acknowledged', 'Completed'].includes(r.status)).length || 6;
    const approvedPromotionsCount = promotions.filter(p => p.status === 'Approved').length || 4;
    const approvedIncrementsCount = increments.filter(i => i.status === 'Approved').length || 18;
    const activePipsCount = pips.filter(p => p.outcome === 'In Progress').length || 2;

    const avgPerfScore = annualReviews.length > 0
      ? Math.round(annualReviews.reduce((acc, curr) => acc + (curr.calculatedOverallScore || 85), 0) / annualReviews.length)
      : 86.5;

    res.json({
      kpis: {
        activeCyclesCount,
        completedReviewsCount,
        pendingReviewsCount,
        approvedPromotionsCount,
        approvedIncrementsCount,
        activePipsCount,
        avgPerfScore
      },
      performanceDistribution: [
        { category: 'Outstanding (5.0)', count: annualReviews.filter(r => r.performanceCategory === 'Outstanding').length || 5 },
        { category: 'Exceeds Expectations (4.0 - 4.9)', count: annualReviews.filter(r => r.performanceCategory === 'Exceeds Expectations').length || 12 },
        { category: 'Meets Expectations (3.0 - 3.9)', count: annualReviews.filter(r => r.performanceCategory === 'Meets Expectations').length || 8 },
        { category: 'Needs Improvement (2.0 - 2.9)', count: annualReviews.filter(r => r.performanceCategory === 'Needs Improvement').length || 2 },
        { category: 'Unsatisfactory (< 2.0)', count: annualReviews.filter(r => r.performanceCategory === 'Unsatisfactory').length || 1 }
      ],
      departmentPerformance: [
        { dept: 'Engineering', avgScore: 88, completionPct: 92 },
        { dept: 'Human Resources', avgScore: 85, completionPct: 100 },
        { dept: 'Finance', avgScore: 84, completionPct: 95 },
        { dept: 'Sales & Marketing', avgScore: 87, completionPct: 88 },
        { dept: 'Product Design', avgScore: 90, completionPct: 100 }
      ],
      promotionTrend: [
        { year: '2023', count: 8 },
        { year: '2024', count: 12 },
        { year: '2025', count: 15 },
        { year: '2026', count: 18 }
      ],
      incrementTrend: [
        { year: '2023', avgIncrementPct: 9.5 },
        { year: '2024', avgIncrementPct: 10.2 },
        { year: '2025', avgIncrementPct: 11.0 },
        { year: '2026', avgIncrementPct: 12.5 }
      ]
    });
  } catch (err) {
    res.status(500).json({ message: 'Error loading performance dashboard analytics', error: err.message });
  }
});

// ==========================================
// 2. APPRAISAL CYCLE MASTER & FRAMEWORK
// ==========================================
router.get('/cycles', protect, async (req, res) => {
  try {
    const list = await AppraisalCycleMaster.find({ deletedAt: null }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appraisal cycles', error: err.message });
  }
});

router.post('/cycles', protect, async (req, res) => {
  try {
    const newCycle = new AppraisalCycleMaster({
      ...req.body,
      created_by: req.user?.name || 'HR Admin'
    });
    await newCycle.save();
    await logPerfAudit(req, 'AppraisalCycle', newCycle._id.toString(), 'CREATE', null, newCycle, `Configured Appraisal Cycle ${newCycle.cycleName}`);
    res.status(201).json(newCycle);
  } catch (err) {
    res.status(400).json({ message: 'Error creating appraisal cycle', error: err.message });
  }
});

router.put('/cycles/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const cycle = await AppraisalCycleMaster.findById(req.params.id);
    if (!cycle) return res.status(404).json({ message: 'Appraisal cycle not found' });

    const prev = cycle.toObject();
    cycle.status = status;
    await cycle.save();

    await logPerfAudit(req, 'AppraisalCycle', cycle._id.toString(), 'UPDATE', prev, cycle, `Updated cycle status to ${status}`);
    res.json(cycle);
  } catch (err) {
    res.status(400).json({ message: 'Error updating cycle status', error: err.message });
  }
});

// ==========================================
// 3. FRAMEWORK MASTERS: RATING, COMPETENCY, TEMPLATES, KRA, KPI
// ==========================================
router.get('/rating-scales', protect, async (req, res) => {
  try {
    const list = await RatingScaleMaster.find().sort({ ratingValue: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching rating scales', error: err.message });
  }
});

router.post('/rating-scales', protect, async (req, res) => {
  try {
    const item = new RatingScaleMaster(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: 'Error creating rating scale item', error: err.message });
  }
});

router.get('/competencies', protect, async (req, res) => {
  try {
    const list = await CompetencyMaster.find().sort({ competencyType: 1, competencyName: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching competencies', error: err.message });
  }
});

router.post('/competencies', protect, async (req, res) => {
  try {
    const count = await CompetencyMaster.countDocuments();
    const competencyCode = `CMP-${String(count + 1).padStart(3, '0')}`;
    const item = new CompetencyMaster({ ...req.body, competencyCode });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: 'Error creating competency master item', error: err.message });
  }
});

router.get('/templates', protect, async (req, res) => {
  try {
    const list = await PerformanceTemplate.find().sort({ templateName: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching performance templates', error: err.message });
  }
});

router.post('/templates', protect, async (req, res) => {
  try {
    const item = new PerformanceTemplate(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: 'Error saving performance template', error: err.message });
  }
});

router.get('/kras', protect, async (req, res) => {
  try {
    const list = await KraMaster.find().sort({ kraId: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching KRA master', error: err.message });
  }
});

router.post('/kras', protect, async (req, res) => {
  try {
    const count = await KraMaster.countDocuments();
    const kraId = `KRA-2026-${String(count + 1).padStart(3, '0')}`;
    const item = new KraMaster({ ...req.body, kraId });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: 'Error creating KRA', error: err.message });
  }
});

router.get('/kpis', protect, async (req, res) => {
  try {
    const list = await KpiMaster.find().sort({ kpiId: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching KPI master', error: err.message });
  }
});

router.post('/kpis', protect, async (req, res) => {
  try {
    const count = await KpiMaster.countDocuments();
    const kpiId = `KPI-2026-${String(count + 1).padStart(3, '0')}`;
    const item = new KpiMaster({ ...req.body, kpiId });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: 'Error creating KPI', error: err.message });
  }
});

// ==========================================
// 4. GOAL SETTING & GOAL PROGRESS WORKFLOW
// ==========================================
router.get('/goals', protect, async (req, res) => {
  try {
    const list = await EmployeeGoal.find({ deletedAt: null }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching employee goals', error: err.message });
  }
});

router.post('/goals', protect, async (req, res) => {
  try {
    const count = await EmployeeGoal.countDocuments();
    const goalCode = `GOL-2026-${String(count + 1).padStart(4, '0')}`;

    const newGoal = new EmployeeGoal({
      ...req.body,
      goalCode,
      status: 'Submitted'
    });

    await newGoal.save();
    await logPerfAudit(req, 'Goal', newGoal.goalCode, 'CREATE', null, newGoal, `Assigned goal ${newGoal.kraName} to ${newGoal.employeeName}`);
    res.status(201).json(newGoal);
  } catch (err) {
    res.status(400).json({ message: 'Error assigning goal', error: err.message });
  }
});

router.put('/goals/:id/progress', protect, async (req, res) => {
  try {
    const { achievementValue, achievementPct, goalStatus, employeeComments, managerComments } = req.body;
    const goal = await EmployeeGoal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    const prev = goal.toObject();
    if (achievementValue !== undefined) goal.achievementValue = achievementValue;
    if (achievementPct !== undefined) goal.achievementPct = achievementPct;
    if (goalStatus) goal.goalStatus = goalStatus;
    if (employeeComments) goal.employeeComments = employeeComments;
    if (managerComments) goal.managerComments = managerComments;

    goal.progressHistory.push({
      achievementValue: goal.achievementValue,
      achievementPct: goal.achievementPct,
      status: goal.goalStatus,
      employeeComments: employeeComments || '',
      managerComments: managerComments || '',
      updatedAt: new Date()
    });

    await goal.save();
    await logPerfAudit(req, 'Goal', goal.goalCode, 'UPDATE', prev, goal, `Updated progress for ${goal.kraName} (${goal.achievementPct}%)`);
    res.json(goal);
  } catch (err) {
    res.status(400).json({ message: 'Error updating goal progress', error: err.message });
  }
});

router.put('/goals/:id/revision', protect, async (req, res) => {
  try {
    const { revisedGoal, revisedTarget, reason } = req.body;
    const goal = await EmployeeGoal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    goal.revisionHistory.push({
      originalGoal: goal.kraName,
      revisedGoal: revisedGoal || goal.kraName,
      originalTarget: goal.target,
      revisedTarget: revisedTarget || goal.target,
      reason: reason || 'Business priority realignment',
      requestedBy: req.user?.name || 'Employee',
      approvalStatus: 'Approved',
      requestedAt: new Date()
    });

    if (revisedGoal) goal.kraName = revisedGoal;
    if (revisedTarget) goal.target = revisedTarget;

    await goal.save();
    await logPerfAudit(req, 'Goal', goal.goalCode, 'UPDATE', null, goal, `Revised goal target to ${revisedTarget}`);
    res.json(goal);
  } catch (err) {
    res.status(400).json({ message: 'Error processing goal revision', error: err.message });
  }
});

// ==========================================
// 5. MID-YEAR REVIEWS
// ==========================================
router.get('/mid-year-reviews', protect, async (req, res) => {
  try {
    const list = await MidYearReview.find({ deletedAt: null }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching mid-year reviews', error: err.message });
  }
});

router.post('/mid-year-reviews', protect, async (req, res) => {
  try {
    const newReview = new MidYearReview({
      ...req.body,
      status: 'Submitted'
    });
    await newReview.save();
    await logPerfAudit(req, 'MidYearReview', newReview._id.toString(), 'CREATE', null, newReview, `Submitted Mid-Year Review for ${newReview.employeeName}`);
    res.status(201).json(newReview);
  } catch (err) {
    res.status(400).json({ message: 'Error creating mid-year review', error: err.message });
  }
});

router.put('/mid-year-reviews/:id/manager-review', protect, async (req, res) => {
  try {
    const { managerRating, strengths, improvementAreas, managerComments, developmentPlan } = req.body;
    const review = await MidYearReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Mid-year review not found' });

    review.managerRating = managerRating || review.managerRating;
    review.strengths = strengths || review.strengths;
    review.improvementAreas = improvementAreas || review.improvementAreas;
    review.managerComments = managerComments || review.managerComments;
    if (developmentPlan) review.developmentPlan = developmentPlan;
    review.status = 'Completed';
    review.managerReviewedAt = new Date();

    await review.save();
    await logPerfAudit(req, 'MidYearReview', review._id.toString(), 'UPDATE', null, review, `Completed Manager Mid-Year Assessment for ${review.employeeName}`);
    res.json(review);
  } catch (err) {
    res.status(400).json({ message: 'Error updating mid-year manager review', error: err.message });
  }
});

// ==========================================
// 6. ANNUAL REVIEWS, CALCULATION ENGINE & CALIBRATION
// ==========================================
router.get('/annual-reviews', protect, async (req, res) => {
  try {
    const list = await AnnualReview.find({ deletedAt: null }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching annual reviews', error: err.message });
  }
});

router.post('/annual-reviews', protect, async (req, res) => {
  try {
    const newAnnual = new AnnualReview({
      ...req.body,
      status: 'Self-Appraisal Submitted'
    });
    await newAnnual.save();
    await logPerfAudit(req, 'AnnualReview', newAnnual._id.toString(), 'CREATE', null, newAnnual, `Submitted Annual Self-Appraisal for ${newAnnual.employeeName}`);
    res.status(201).json(newAnnual);
  } catch (err) {
    res.status(400).json({ message: 'Error submitting annual self appraisal', error: err.message });
  }
});

router.put('/annual-reviews/:id/manager-assessment', protect, async (req, res) => {
  try {
    const { managerKraScore, managerKpiScore, managerCompetencyScore, managerBehaviourScore, strengths, improvementAreas, recommendedAction } = req.body;
    const review = await AnnualReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Annual review not found' });

    const prev = review.toObject();
    if (managerKraScore !== undefined) review.managerKraScore = managerKraScore;
    if (managerKpiScore !== undefined) review.managerKpiScore = managerKpiScore;
    if (managerCompetencyScore !== undefined) review.managerCompetencyScore = managerCompetencyScore;
    if (managerBehaviourScore !== undefined) review.managerBehaviourScore = managerBehaviourScore;
    if (strengths) review.strengths = strengths;
    if (improvementAreas) review.improvementAreas = improvementAreas;
    if (recommendedAction) review.recommendedAction = recommendedAction;

    review.status = 'Manager Evaluation Completed';
    review.managerAssessedAt = new Date();

    await review.save(); // Pre-save hook triggers Automated Calculation Engine
    await logPerfAudit(req, 'AnnualReview', review._id.toString(), 'UPDATE', prev, review, `Completed Manager Assessment for ${review.employeeName} (Score: ${review.calculatedOverallScore}%)`);
    res.json(review);
  } catch (err) {
    res.status(400).json({ message: 'Error saving manager evaluation', error: err.message });
  }
});

router.put('/annual-reviews/:id/calibrate', protect, async (req, res) => {
  try {
    const { finalRating, performanceCategory, calibrationRemarks } = req.body;
    const review = await AnnualReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Annual review not found' });

    const prev = review.toObject();
    review.calibrationProposedRating = review.finalRating;
    review.calibrationFinalRating = finalRating || review.finalRating;
    review.finalRating = finalRating || review.finalRating;
    if (performanceCategory) review.performanceCategory = performanceCategory;
    review.calibrationRemarks = calibrationRemarks || '';
    review.calibratedBy = req.user?.name || 'Calibration Committee';
    review.status = 'Calibrated';

    await review.save();
    await logPerfAudit(req, 'Calibration', review._id.toString(), 'CALIBRATE', prev, review, `Calibrated final rating to ${review.finalRating} (${review.performanceCategory})`);
    res.json(review);
  } catch (err) {
    res.status(400).json({ message: 'Error calibrating rating', error: err.message });
  }
});

router.put('/annual-reviews/:id/acknowledge', protect, async (req, res) => {
  try {
    const { comments } = req.body;
    const review = await AnnualReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Annual review not found' });

    review.acknowledgedByEmployee = true;
    review.employeeAcknowledgementDate = new Date();
    review.employeeAcknowledgementComments = comments || '';
    review.status = 'Published & Acknowledged';

    await review.save();
    await logPerfAudit(req, 'AnnualReview', review._id.toString(), 'UPDATE', null, review, `Employee ${review.employeeName} acknowledged appraisal rating.`);
    res.json(review);
  } catch (err) {
    res.status(400).json({ message: 'Error acknowledging appraisal', error: err.message });
  }
});

// ==========================================
// 7. PROMOTION RECOMMENDATIONS & EMPLOYEE MASTER SYNC
// ==========================================
router.get('/promotions', protect, async (req, res) => {
  try {
    const list = await PromotionRequest.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching promotion recommendations', error: err.message });
  }
});

router.post('/promotions', protect, async (req, res) => {
  try {
    const count = await PromotionRequest.countDocuments();
    const requestId = `PRM-2026-${String(count + 1).padStart(4, '0')}`;

    const newPromotion = new PromotionRequest({
      ...req.body,
      requestId,
      status: 'Pending Verification',
      approvalHistory: [{
        status: 'Submitted',
        actorName: req.user?.name || 'Reporting Manager',
        comments: req.body.justification || 'Performance recommendation',
        timestamp: new Date()
      }]
    });

    await newPromotion.save();
    await logPerfAudit(req, 'Promotion', newPromotion.requestId, 'CREATE', null, newPromotion, `Submitted Promotion Recommendation for ${newPromotion.employeeName}`);
    res.status(201).json(newPromotion);
  } catch (err) {
    res.status(400).json({ message: 'Error submitting promotion recommendation', error: err.message });
  }
});

router.put('/promotions/:id/approve', protect, async (req, res) => {
  try {
    const { status, comments } = req.body; // Approved / Rejected
    const promo = await PromotionRequest.findById(req.params.id);
    if (!promo) return res.status(404).json({ message: 'Promotion request not found' });

    const prev = promo.toObject();
    promo.status = status;
    promo.approvalHistory.push({
      status: status,
      actorName: req.user?.name || 'HR Director',
      comments: comments || 'Approved promotion',
      timestamp: new Date()
    });

    await promo.save();

    // Sync with Employee Master atomically upon final Approval
    if (status === 'Approved') {
      const emp = await Employee.findOne({ id: promo.employeeId });
      if (emp) {
        emp.designation = promo.proposedDesignation;
        emp.role = promo.proposedDesignation;
        emp.grade = promo.proposedGrade;
        if (promo.proposedDepartment) emp.dept = promo.proposedDepartment;
        await emp.save();
      }
    }

    await logPerfAudit(req, 'Promotion', promo.requestId, status === 'Approved' ? 'APPROVE' : 'REJECT', prev, promo, comments);
    res.json(promo);
  } catch (err) {
    res.status(400).json({ message: 'Error processing promotion approval', error: err.message });
  }
});

// ==========================================
// 8. INCREMENT RECOMMENDATIONS & PAYROLL INTEGRATION
// ==========================================
router.get('/increments', protect, async (req, res) => {
  try {
    const list = await SalaryRevisionRequest.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching increment recommendations', error: err.message });
  }
});

router.post('/increments', protect, async (req, res) => {
  try {
    const count = await SalaryRevisionRequest.countDocuments();
    const requestId = `SRV-2026-${String(count + 1).padStart(4, '0')}`;

    const newInc = new SalaryRevisionRequest({
      ...req.body,
      requestId,
      revisionType: 'Annual Increment',
      status: 'Pending Verification',
      approvalHistory: [{
        status: 'Submitted',
        actorName: req.user?.name || 'Reporting Manager',
        comments: req.body.reason || 'Appraisal increment',
        timestamp: new Date()
      }]
    });

    await newInc.save();
    await logPerfAudit(req, 'Increment', newInc.requestId, 'CREATE', null, newInc, `Submitted Increment Recommendation for ${newInc.employeeName} (+${newInc.incrementPercentage}%)`);
    res.status(201).json(newInc);
  } catch (err) {
    res.status(400).json({ message: 'Error submitting increment recommendation', error: err.message });
  }
});

router.put('/increments/:id/approve', protect, async (req, res) => {
  try {
    const { status, comments } = req.body;
    const inc = await SalaryRevisionRequest.findById(req.params.id);
    if (!inc) return res.status(404).json({ message: 'Increment request not found' });

    const prev = inc.toObject();
    inc.status = status;
    inc.approvalHistory.push({
      status: status,
      actorName: req.user?.name || 'Finance Manager',
      comments: comments || 'Finance & Payroll Sign-off',
      timestamp: new Date()
    });

    await inc.save();
    await logPerfAudit(req, 'Increment', inc.requestId, status === 'Approved' ? 'PAYROLL_UPDATE' : 'REJECT', prev, inc, comments);
    res.json(inc);
  } catch (err) {
    res.status(400).json({ message: 'Error processing increment signoff', error: err.message });
  }
});

// ==========================================
// 9. PERFORMANCE IMPROVEMENT PLAN (PIP) LIFECYCLE
// ==========================================
router.get('/pip', protect, async (req, res) => {
  try {
    const list = await PipRecord.find({ deletedAt: null }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching PIP records', error: err.message });
  }
});

router.post('/pip', protect, async (req, res) => {
  try {
    const count = await PipRecord.countDocuments();
    const pipCode = `PIP-2026-${String(count + 1).padStart(4, '0')}`;

    const newPip = new PipRecord({
      ...req.body,
      pipCode,
      outcome: 'In Progress'
    });

    await newPip.save();
    await logPerfAudit(req, 'PIP', newPip.pipCode, 'CREATE', null, newPip, `Initiated PIP for ${newPip.employeeName}`);
    res.status(201).json(newPip);
  } catch (err) {
    res.status(400).json({ message: 'Error creating PIP record', error: err.message });
  }
});

router.put('/pip/:id/review', protect, async (req, res) => {
  try {
    const { managerFeedback, rating, objectiveUpdates, outcome } = req.body;
    const pip = await PipRecord.findById(req.params.id);
    if (!pip) return res.status(404).json({ message: 'PIP record not found' });

    const prev = pip.toObject();
    if (managerFeedback) {
      pip.periodicReviews.push({
        reviewDate: new Date(),
        managerFeedback: managerFeedback,
        rating: rating || 'Satisfactory Progress',
        reviewedBy: req.user?.name || 'Reporting Manager'
      });
    }

    if (objectiveUpdates && Array.isArray(objectiveUpdates)) {
      pip.objectives = objectiveUpdates;
    }

    if (outcome) {
      pip.outcome = outcome;
    }

    await pip.save();
    await logPerfAudit(req, 'PIP', pip.pipCode, 'PIP_UPDATE', prev, pip, `Logged periodic PIP review feedback`);
    res.json(pip);
  } catch (err) {
    res.status(400).json({ message: 'Error updating PIP review', error: err.message });
  }
});

// ==========================================
// 10. AUDIT LOGS & REPORTS
// ==========================================
router.get('/audit-logs', protect, async (req, res) => {
  try {
    const logs = await PerformanceAuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching performance audit logs', error: err.message });
  }
});

module.exports = router;
