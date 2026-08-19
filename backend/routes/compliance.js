const express = require('express');
const router = express.Router();

const PlantMaster = require('../models/PlantMaster');
const LocationMaster = require('../models/LocationMaster');
const StateMaster = require('../models/StateMaster');
const CountryMaster = require('../models/CountryMaster');
const StatutoryActMaster = require('../models/StatutoryActMaster');
const ComplianceCategoryMaster = require('../models/ComplianceCategoryMaster');
const StatutoryRuleMaster = require('../models/StatutoryRuleMaster');
const PfRuleMaster = require('../models/PfRuleMaster');
const EsiRuleMaster = require('../models/EsiRuleMaster');
const PtRuleMaster = require('../models/PtRuleMaster');
const LwfRuleMaster = require('../models/LwfRuleMaster');
const ContributionRateMaster = require('../models/ContributionRateMaster');
const SalarySlabMaster = require('../models/SalarySlabMaster');
const DueDateMaster = require('../models/DueDateMaster');
const StatutoryNotificationTemplateMaster = require('../models/StatutoryNotificationTemplateMaster');
const StatutoryApprovalWorkflowMaster = require('../models/StatutoryApprovalWorkflowMaster');
const StatutoryDocumentCategoryMaster = require('../models/StatutoryDocumentCategoryMaster');

const EmployeeStatutoryProfile = require('../models/EmployeeStatutoryProfile');
const EmployeePfProfile = require('../models/EmployeePfProfile');
const EmployeeEsiProfile = require('../models/EmployeeEsiProfile');
const EmployeePtProfile = require('../models/EmployeePtProfile');
const EmployeeLwfProfile = require('../models/EmployeeLwfProfile');
const PfContribution = require('../models/PfContribution');
const EsiContribution = require('../models/EsiContribution');
const PtCalculation = require('../models/PtCalculation');
const LwfContribution = require('../models/LwfContribution');
const StatutoryChallan = require('../models/StatutoryChallan');
const StatutoryPayment = require('../models/StatutoryPayment');
const StatutoryReturn = require('../models/StatutoryReturn');
const ComplianceCalendar = require('../models/ComplianceCalendar');
const DueDateTracker = require('../models/DueDateTracker');
const GovernmentNotice = require('../models/GovernmentNotice');
const InspectionRecord = require('../models/InspectionRecord');
const ComplianceDocument = require('../models/ComplianceDocument');
const ComplianceAlert = require('../models/ComplianceAlert');
const StatutoryNotificationLog = require('../models/StatutoryNotificationLog');
const StatutoryAuditLog = require('../models/StatutoryAuditLog');

const { protect } = require('../middleware/auth');

// Audit logger helper
const logAudit = async (req, action, entityType, entityId, changes) => {
  try {
    const user = req.user || { id: 'SYSTEM', name: 'Compliance Officer', role: 'Compliance Officer' };
    await StatutoryAuditLog.create({
      auditId: 'AUD-COMP-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      action,
      module: 'Statutory Compliance Monitor',
      entityId: entityId || '',
      entityType: entityType || '',
      performedBy: user.name || user.id || 'Compliance Officer',
      userRole: user.role || 'Compliance Officer',
      changes: typeof changes === 'string' ? changes : JSON.stringify(changes || {})
    });
  } catch (e) {
    console.error('Compliance Audit Log Error:', e);
  }
};

// ==========================================
// 1. COMPLIANCE DASHBOARD & EXECUTIVE KPIS
// ==========================================
router.get('/dashboard', protect, async (req, res) => {
  try {
    const challans = await StatutoryChallan.find();
    const notices = await GovernmentNotice.find();
    const dueDates = await DueDateTracker.find();

    const totalLiability = challans.reduce((acc, c) => acc + (c.totalAmount || 0), 0) || 4850000;
    const paidChallans = challans.filter(c => c.paymentStatus === 'Paid').reduce((acc, c) => acc + (c.totalAmount || 0), 0) || 4200000;
    const openNoticesCount = notices.filter(n => n.status !== 'Closed').length || 2;
    const overdueCount = dueDates.filter(d => d.status === 'Overdue').length || 1;

    res.json({
      kpis: {
        overallComplianceStatus: 'Compliant',
        compliancePercentage: '96.8%',
        complianceRiskScore: 'Low (12/100)',
        pendingActivities: 4,
        upcomingDueDates: 8,
        completedActivities: 42,
        overdueItems: overdueCount,
        monthlyStatutoryLiability: totalLiability,
        totalStatutoryPayments: paidChallans,
        openGovernmentNotices: openNoticesCount,
        pfEligibleEmployees: 480,
        esiInsuredEmployees: 210,
        ptApplicableEmployees: 520,
        lwfApplicableEmployees: 520
      },
      charts: {
        monthlyComplianceTrend: [
          { month: 'Mar', compliancePct: 94.2 },
          { month: 'Apr', compliancePct: 95.8 },
          { month: 'May', compliancePct: 96.1 },
          { month: 'Jun', compliancePct: 97.4 },
          { month: 'Jul', compliancePct: 96.8 }
        ],
        stateCompliance: [
          { state: 'Karnataka', pct: 98.2, status: 'Compliant' },
          { state: 'Maharashtra', pct: 96.5, status: 'Compliant' },
          { state: 'Tamil Nadu', pct: 95.0, status: 'Compliant' },
          { state: 'Telangana', pct: 97.1, status: 'Compliant' }
        ]
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 2. STATUTORY OVERVIEW
// ==========================================
router.get('/overview', protect, async (req, res) => {
  try {
    const list = await StatutoryActMaster.find();
    res.json(list.length > 0 ? list : [
      { actId: 'ACT-PF', actCode: 'EPF-1952', actName: 'Employees Provident Fund Act 1952', governingBody: 'EPFO', frequency: 'Monthly', nextDueDate: '2026-08-15', currentStatus: 'Compliant', riskLevel: 'Low' },
      { actId: 'ACT-ESI', actCode: 'ESI-1948', actName: 'Employees State Insurance Act 1948', governingBody: 'ESIC', frequency: 'Monthly', nextDueDate: '2026-08-15', currentStatus: 'Compliant', riskLevel: 'Low' },
      { actId: 'ACT-PT', actCode: 'PT-ACT', actName: 'Karnataka Professional Tax Act', governingBody: 'Commercial Tax Dept', frequency: 'Monthly', nextDueDate: '2026-08-20', currentStatus: 'Compliant', riskLevel: 'Low' },
      { actId: 'ACT-LWF', actCode: 'LWF-ACT', actName: 'Labour Welfare Fund Act', governingBody: 'Labour Welfare Board', frequency: 'Half-Yearly', nextDueDate: '2026-12-31', currentStatus: 'Compliant', riskLevel: 'Low' }
    ]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 3. COMPLIANCE CALENDAR
// ==========================================
router.get('/calendar', protect, async (req, res) => {
  try {
    const list = await ComplianceCalendar.find().sort({ dueDate: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 4. PROVIDENT FUND (PF)
// ==========================================
router.get('/pf', protect, async (req, res) => {
  try {
    const pfProfiles = await EmployeePfProfile.find();
    const contributions = await PfContribution.find().sort({ createdAt: -1 });
    res.json({ profiles: pfProfiles, contributions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/pf/ecr', protect, async (req, res) => {
  try {
    const body = req.body;
    const contribId = 'PFC-' + Date.now();
    const newContrib = await PfContribution.create({
      contributionId: contribId,
      wageMonth: body.wageMonth || 'Jul 2026',
      employeeId: body.employeeId || 'EMP-1001',
      employeeName: body.employeeName || 'Gara Nandini',
      uan: body.uan || '100988776655',
      pfWage: Number(body.pfWage) || 15000,
      employeePfShare: Number(body.employeePfShare) || 1800,
      vpfShare: Number(body.vpfShare) || 0,
      employerPfShare: Number(body.employerPfShare) || 550,
      employerEpsShare: Number(body.employerEpsShare) || 1250,
      edliShare: Number(body.edliShare) || 75,
      adminCharges: Number(body.adminCharges) || 75,
      totalContribution: Number(body.totalContribution) || 3750,
      status: 'ECR Generated'
    });
    await logAudit(req, 'GENERATE_PF_ECR', 'PfContribution', contribId, newContrib);
    res.status(201).json(newContrib);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 5. EMPLOYEE STATE INSURANCE (ESI)
// ==========================================
router.get('/esi', protect, async (req, res) => {
  try {
    const esiProfiles = await EmployeeEsiProfile.find();
    const contributions = await EsiContribution.find().sort({ createdAt: -1 });
    res.json({ profiles: esiProfiles, contributions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 6. PROFESSIONAL TAX (PT)
// ==========================================
router.get('/pt', protect, async (req, res) => {
  try {
    const profiles = await EmployeePtProfile.find();
    const calculations = await PtCalculation.find();
    const rules = await PtRuleMaster.find();
    res.json({ profiles, calculations, rules });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 7. LABOUR WELFARE FUND (LWF)
// ==========================================
router.get('/lwf', protect, async (req, res) => {
  try {
    const profiles = await EmployeeLwfProfile.find();
    const contributions = await LwfContribution.find();
    const rules = await LwfRuleMaster.find();
    res.json({ profiles, contributions, rules });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 8. CHALLANS & PAYMENTS
// ==========================================
router.get('/challans', protect, async (req, res) => {
  try {
    const list = await StatutoryChallan.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/challans', protect, async (req, res) => {
  try {
    const body = req.body;
    const challanId = 'CHL-' + Date.now();
    const newChallan = await StatutoryChallan.create({
      challanId,
      challanNumber: 'CHL-NO-' + Math.floor(Math.random() * 900000 + 100000),
      statutoryType: body.statutoryType || 'PF',
      wageMonth: body.wageMonth || 'Jul 2026',
      state: body.state || 'Karnataka',
      dueDate: body.dueDate || new Date('2026-08-15'),
      totalAmount: Number(body.totalAmount) || 0,
      employeeCount: Number(body.employeeCount) || 1,
      paymentStatus: 'Generated',
      createdBy: req.user?.name || 'Payroll Executive'
    });
    await logAudit(req, 'CREATE_STATUTORY_CHALLAN', 'StatutoryChallan', challanId, newChallan);
    res.status(201).json(newChallan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/challans/:id/pay', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const updated = await StatutoryChallan.findOneAndUpdate(
      { challanId: id },
      { paymentStatus: 'Paid', paymentDate: new Date(), bankReferenceNo: body.bankReferenceNo || ('REF-' + Date.now()) },
      { new: true }
    );
    await logAudit(req, 'PAY_STATUTORY_CHALLAN', 'StatutoryChallan', id, updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 9. RETURN FILING
// ==========================================
router.get('/returns', protect, async (req, res) => {
  try {
    const list = await StatutoryReturn.find().sort({ filingDueDate: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/returns', protect, async (req, res) => {
  try {
    const body = req.body;
    const returnId = 'RET-' + Date.now();
    const newReturn = await StatutoryReturn.create({
      returnId,
      returnType: body.returnType,
      frequency: body.frequency || 'Monthly',
      period: body.period || 'Jul 2026',
      state: body.state || 'Karnataka',
      filingDueDate: body.filingDueDate || new Date(),
      filingDate: new Date(),
      ackNumber: body.ackNumber || ('ACK-' + Math.floor(Math.random() * 899999 + 100000)),
      filingStatus: 'Filed'
    });
    await logAudit(req, 'FILE_STATUTORY_RETURN', 'StatutoryReturn', returnId, newReturn);
    res.status(201).json(newReturn);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 10. DUE DATE TRACKER
// ==========================================
router.get('/due-dates', protect, async (req, res) => {
  try {
    const list = await DueDateTracker.find().sort({ dueDate: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 11. GOVERNMENT NOTICES & INSPECTIONS
// ==========================================
router.get('/notices', protect, async (req, res) => {
  try {
    const notices = await GovernmentNotice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/notices', protect, async (req, res) => {
  try {
    const body = req.body;
    const noticeId = 'NTC-' + Date.now();
    const newNotice = await GovernmentNotice.create({
      noticeId,
      noticeNumber: body.noticeNumber || ('NOT-' + Math.floor(Math.random() * 90000)),
      department: body.department || 'EPFO',
      issueDate: body.issueDate || new Date(),
      dueDate: body.dueDate || new Date(),
      priority: body.priority || 'High',
      description: body.description || '',
      status: 'Received'
    });
    await logAudit(req, 'CREATE_GOVERNMENT_NOTICE', 'GovernmentNotice', noticeId, newNotice);
    res.status(201).json(newNotice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/inspections', protect, async (req, res) => {
  try {
    const list = await InspectionRecord.find().sort({ inspectionDate: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/inspections', protect, async (req, res) => {
  try {
    const body = req.body;
    const inspectionId = 'INS-' + Date.now();
    const newIns = await InspectionRecord.create({
      inspectionId,
      authority: body.authority || 'Factory Inspectorate',
      location: body.location || 'Bangalore Plant 1',
      inspectorName: body.inspectorName || 'Mr. K. Sharma',
      inspectionDate: body.inspectionDate || new Date(),
      findings: body.findings || 'All safety & statutory registers inspected cleanly.',
      closureStatus: body.closureStatus || 'Closed'
    });
    await logAudit(req, 'LOG_LABOUR_INSPECTION', 'InspectionRecord', inspectionId, newIns);
    res.status(201).json(newIns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 12. COMPLIANCE DOCUMENTS REPOSITORY
// ==========================================
router.get('/documents', protect, async (req, res) => {
  try {
    const docs = await ComplianceDocument.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/documents', protect, async (req, res) => {
  try {
    const body = req.body;
    const docId = 'DOC-COMP-' + Date.now();
    const newDoc = await ComplianceDocument.create({
      docId,
      title: body.title,
      category: body.category || 'Challan Receipt',
      fileUrl: body.fileUrl || '/uploads/compliance/sample.pdf',
      uploadedBy: req.user?.name || 'Compliance Officer'
    });
    await logAudit(req, 'UPLOAD_COMPLIANCE_DOC', 'ComplianceDocument', docId, newDoc);
    res.status(201).json(newDoc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 13. MASTERS & AUDIT HISTORY
// ==========================================
router.get('/masters', protect, async (req, res) => {
  try {
    const acts = await StatutoryActMaster.find();
    const categories = await ComplianceCategoryMaster.find();
    const states = await StateMaster.find();
    const plants = await PlantMaster.find();

    res.json({ acts, categories, states, plants });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/history', protect, async (req, res) => {
  try {
    const logs = await StatutoryAuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
