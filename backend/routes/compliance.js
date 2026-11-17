const express = require('express');
const router = express.Router();
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const { requireFields } = require('../utils/validate');
const { uploadFileFilter, setSafeHeaders, UPLOAD_MAX_BYTES } = require('../utils/gridStore');

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

const { protect, adminOnly } = require('../middleware/auth');

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
router.get('/dashboard', protect, adminOnly, async (req, res, next) => {
  try {
    const challans = await StatutoryChallan.find();
    const notices = await GovernmentNotice.find();
    const dueDates = await DueDateTracker.find();

    // Every figure is counted from stored records; with no records the dashboard shows zeros.
    const now = new Date();
    const in15Days = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    const completed = dueDates.filter(d => d.status === 'Completed').length;
    const open = dueDates.filter(d => d.status !== 'Completed');
    const overdue = open.filter(d => d.status === 'Overdue' || d.dueDate < now).length;
    const upcoming = open.filter(d => d.dueDate >= now && d.dueDate <= in15Days).length;
    const [pf, esi, pt, lwf] = await Promise.all([EmployeePfProfile, EmployeeEsiProfile, EmployeePtProfile, EmployeeLwfProfile].map(M => M.countDocuments()));

    res.json({
      kpis: {
        overallComplianceStatus: overdue > 0 ? 'Action required' : dueDates.length ? 'On track' : 'No due dates tracked',
        // share of closed-out obligations among those already due; null until something has fallen due
        compliancePercentage: completed + overdue > 0 ? `${(completed / (completed + overdue) * 100).toFixed(1)}%` : null,
        pendingActivities: open.length - overdue,
        upcomingDueDates: upcoming,
        completedActivities: completed,
        overdueItems: overdue,
        monthlyStatutoryLiability: challans.reduce((acc, c) => acc + (c.totalAmount || 0), 0),
        totalStatutoryPayments: challans.filter(c => c.paymentStatus === 'Paid').reduce((acc, c) => acc + (c.totalAmount || 0), 0),
        openGovernmentNotices: notices.filter(n => n.status !== 'Closed').length,
        pfEligibleEmployees: pf,
        esiInsuredEmployees: esi,
        ptApplicableEmployees: pt,
        lwfApplicableEmployees: lwf
      }
    });
  } catch (err) { next(err); }
});

// ==========================================
// 2. STATUTORY OVERVIEW
// ==========================================
router.get('/overview', protect, adminOnly, async (req, res, next) => {
  try {
    res.json(await StatutoryActMaster.find());
  } catch (err) { next(err); }
});

// ==========================================
// 3. COMPLIANCE CALENDAR
// ==========================================
router.get('/calendar', protect, adminOnly, async (req, res, next) => {
  try {
    const list = await ComplianceCalendar.find().sort({ dueDate: 1 });
    res.json(list);
  } catch (err) { next(err); }
});

// ==========================================
// 4. PROVIDENT FUND (PF)
// ==========================================
// PF/ESI hold each employee's UAN, wages and contributions: HR sees all, an employee only their own
const ownScope = (req) => req.user.role === 'hr' ? {} : { employeeId: req.user.id };

router.get('/pf', protect, async (req, res, next) => {
  try {
    const pfProfiles = await EmployeePfProfile.find(ownScope(req));
    const contributions = await PfContribution.find(ownScope(req)).sort({ createdAt: -1 });
    res.json({ profiles: pfProfiles, contributions });
  } catch (err) { next(err); }
});

router.post('/pf/ecr', protect, adminOnly, async (req, res, next) => {
  try {
    const body = req.body;
    requireFields(body, { wageMonth: 'Wage month', employeeId: 'Employee ID', employeeName: 'Employee name', uan: 'UAN', pfWage: 'PF wage',
      employeePfShare: 'Employee PF share', employerPfShare: 'Employer PF share', employerEpsShare: 'Employer EPS share', totalContribution: 'Total contribution' });
    const contribId = 'PFC-' + Date.now();
    const newContrib = await PfContribution.create({
      contributionId: contribId,
      wageMonth: body.wageMonth,
      employeeId: body.employeeId,
      employeeName: body.employeeName,
      uan: body.uan,
      pfWage: Number(body.pfWage),
      employeePfShare: Number(body.employeePfShare),
      vpfShare: Number(body.vpfShare) || 0,
      employerPfShare: Number(body.employerPfShare),
      employerEpsShare: Number(body.employerEpsShare),
      edliShare: Number(body.edliShare) || 0,
      adminCharges: Number(body.adminCharges) || 0,
      totalContribution: Number(body.totalContribution),
      status: 'ECR Generated'
    });
    await logAudit(req, 'GENERATE_PF_ECR', 'PfContribution', contribId, newContrib);
    res.status(201).json(newContrib);
  } catch (err) { next(err); }
});

// ==========================================
// 5. EMPLOYEE STATE INSURANCE (ESI)
// ==========================================
router.get('/esi', protect, async (req, res, next) => {
  try {
    const esiProfiles = await EmployeeEsiProfile.find(ownScope(req));
    const contributions = await EsiContribution.find(ownScope(req)).sort({ createdAt: -1 });
    res.json({ profiles: esiProfiles, contributions });
  } catch (err) { next(err); }
});

// ==========================================
// 6. PROFESSIONAL TAX (PT)
// ==========================================
router.get('/pt', protect, async (req, res, next) => {
  try {
    const profiles = await EmployeePtProfile.find(ownScope(req));
    const calculations = await PtCalculation.find(ownScope(req));
    const rules = await PtRuleMaster.find();
    res.json({ profiles, calculations, rules });
  } catch (err) { next(err); }
});

// ==========================================
// 7. LABOUR WELFARE FUND (LWF)
// ==========================================
router.get('/lwf', protect, async (req, res, next) => {
  try {
    const profiles = await EmployeeLwfProfile.find(ownScope(req));
    const contributions = await LwfContribution.find(ownScope(req));
    const rules = await LwfRuleMaster.find();
    res.json({ profiles, contributions, rules });
  } catch (err) { next(err); }
});

// ==========================================
// 8. CHALLANS & PAYMENTS
// ==========================================
router.get('/challans', protect, adminOnly, async (req, res, next) => {
  try {
    const list = await StatutoryChallan.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { next(err); }
});

router.post('/challans', protect, adminOnly, async (req, res, next) => {
  try {
    const body = req.body;
    requireFields(body, { statutoryType: 'Statutory type', wageMonth: 'Wage month', state: 'State', dueDate: 'Due date', totalAmount: 'Total amount', employeeCount: 'Covered employees' });
    const challanId = 'CHL-' + Date.now();
    const newChallan = await StatutoryChallan.create({
      challanId,
      challanNumber: 'CHL-NO-' + Math.floor(Math.random() * 900000 + 100000),
      statutoryType: body.statutoryType,
      wageMonth: body.wageMonth,
      state: body.state,
      dueDate: body.dueDate,
      totalAmount: Number(body.totalAmount),
      employeeCount: Number(body.employeeCount),
      paymentStatus: 'Generated',
      createdBy: req.user?.name || 'Payroll Executive'
    });
    await logAudit(req, 'CREATE_STATUTORY_CHALLAN', 'StatutoryChallan', challanId, newChallan);
    res.status(201).json(newChallan);
  } catch (err) { next(err); }
});

router.post('/challans/:id/pay', protect, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;
    requireFields(body, { bankReferenceNo: 'Bank reference number' });
    const updated = await StatutoryChallan.findOneAndUpdate(
      { challanId: id },
      { paymentStatus: 'Paid', paymentDate: new Date(), bankReferenceNo: String(body.bankReferenceNo).trim() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Challan not found.' });
    await logAudit(req, 'PAY_STATUTORY_CHALLAN', 'StatutoryChallan', id, updated);
    res.json(updated);
  } catch (err) { next(err); }
});

// ==========================================
// 9. RETURN FILING
// ==========================================
router.get('/returns', protect, adminOnly, async (req, res, next) => {
  try {
    const list = await StatutoryReturn.find().sort({ filingDueDate: 1 });
    res.json(list);
  } catch (err) { next(err); }
});

router.post('/returns', protect, adminOnly, async (req, res, next) => {
  try {
    const body = req.body;
    requireFields(body, { returnType: 'Return type', period: 'Period', state: 'State', filingDueDate: 'Filing due date', ackNumber: 'Acknowledgement number' });
    const returnId = 'RET-' + Date.now();
    const newReturn = await StatutoryReturn.create({
      returnId,
      returnType: body.returnType,
      frequency: body.frequency || 'Monthly',
      period: body.period,
      state: body.state,
      filingDueDate: body.filingDueDate,
      filingDate: new Date(),
      ackNumber: body.ackNumber,
      filingStatus: 'Filed'
    });
    await logAudit(req, 'FILE_STATUTORY_RETURN', 'StatutoryReturn', returnId, newReturn);
    res.status(201).json(newReturn);
  } catch (err) { next(err); }
});

// ==========================================
// 10. DUE DATE TRACKER
// ==========================================
router.get('/due-dates', protect, adminOnly, async (req, res, next) => {
  try {
    const list = await DueDateTracker.find().sort({ dueDate: 1 });
    res.json(list);
  } catch (err) { next(err); }
});

// ==========================================
// 11. GOVERNMENT NOTICES & INSPECTIONS
// ==========================================
router.get('/notices', protect, adminOnly, async (req, res, next) => {
  try {
    const notices = await GovernmentNotice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) { next(err); }
});

router.post('/notices', protect, adminOnly, async (req, res, next) => {
  try {
    const body = req.body;
    requireFields(body, { noticeNumber: 'Notice reference number', department: 'Issuing department', issueDate: 'Issue date', dueDate: 'Reply due date', description: 'Description' });
    const noticeId = 'NTC-' + Date.now();
    const newNotice = await GovernmentNotice.create({
      noticeId,
      noticeNumber: body.noticeNumber,
      department: body.department,
      issueDate: body.issueDate,
      dueDate: body.dueDate,
      priority: body.priority || 'Normal',
      description: body.description,
      status: 'Received'
    });
    await logAudit(req, 'CREATE_GOVERNMENT_NOTICE', 'GovernmentNotice', noticeId, newNotice);
    res.status(201).json(newNotice);
  } catch (err) { next(err); }
});

router.get('/inspections', protect, adminOnly, async (req, res, next) => {
  try {
    const list = await InspectionRecord.find().sort({ inspectionDate: -1 });
    res.json(list);
  } catch (err) { next(err); }
});

router.post('/inspections', protect, adminOnly, async (req, res, next) => {
  try {
    const body = req.body;
    requireFields(body, { authority: 'Authority', location: 'Plant / location', inspectorName: 'Inspector name', inspectionDate: 'Inspection date', findings: 'Findings', closureStatus: 'Status' });
    const inspectionId = 'INS-' + Date.now();
    const newIns = await InspectionRecord.create({
      inspectionId,
      authority: body.authority,
      location: body.location,
      inspectorName: body.inspectorName,
      inspectionDate: body.inspectionDate,
      findings: body.findings,
      closureStatus: body.closureStatus
    });
    await logAudit(req, 'LOG_LABOUR_INSPECTION', 'InspectionRecord', inspectionId, newIns);
    res.status(201).json(newIns);
  } catch (err) { next(err); }
});

// ==========================================
// 12. COMPLIANCE DOCUMENTS REPOSITORY
// ==========================================

// Compliance files live in their own GridFS bucket. Unlike the 'uploads' bucket it has no public
// /uploads URL, so every read goes through `protect` below.
const complianceFiles = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'compliance_files' });
const docUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: uploadFileFilter,
  limits: { fileSize: UPLOAD_MAX_BYTES, files: 1 }
}).single('file');

// First bytes each accepted type must start with, so a renamed file is rejected.
const FILE_SIGNATURES = { '.pdf': '25504446', '.png': '89504e47', '.jpg': 'ffd8ff', '.jpeg': 'ffd8ff', '.webp': '52494646', '.doc': 'd0cf11e0', '.docx': '504b0304' };
const DOC_CATEGORIES = ComplianceDocument.schema.path('category').enumValues;

const findComplianceDoc = async (rawId) => {
  const id = String(rawId || '').trim();
  if (!id || id === 'undefined') return null;
  if (mongoose.isValidObjectId(id)) {
    const byId = await ComplianceDocument.findById(id);
    if (byId) return byId;
  }
  return ComplianceDocument.findOne({ docId: id });
};

router.get('/documents', protect, adminOnly, async (req, res, next) => {
  try {
    res.json(await ComplianceDocument.find().sort({ createdAt: -1 }));
  } catch (err) { next(err); }
});

router.get('/documents/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const doc = await findComplianceDoc(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Compliance document not found.' });
    res.json(doc);
  } catch (err) { next(err); }
});

router.get(['/documents/:id/preview', '/documents/:id/download', '/documents/:id/view'], protect, adminOnly, async (req, res, next) => {
  try {
    const doc = await findComplianceDoc(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Compliance document not found.' });
    if (!doc.fileId) return res.status(404).json({ message: 'No file was uploaded for this record.' });

    setSafeHeaders(res, doc.fileName);
    const inline = !req.path.endsWith('/download') && /\.(pdf|jpe?g|png|webp)$/i.test(doc.fileName);
    res.set('Content-Disposition', `${inline ? 'inline' : 'attachment'}; filename="${doc.fileName.replace(/[^\w.-]/g, '_')}"`);
    res.set('Cache-Control', 'private, no-store');
    complianceFiles().openDownloadStream(doc.fileId)
      .on('error', () => res.headersSent ? res.end() : res.status(404).json({ message: 'Stored file is missing.' }))
      .pipe(res);
  } catch (err) { next(err); }
});

router.post('/documents', protect, adminOnly, docUpload, async (req, res, next) => {
  try {
    const title = String(req.body.title || '').trim();
    const { category } = req.body;
    const file = req.file;
    if (!title) return res.status(400).json({ message: 'Document title is required.' });
    if (!DOC_CATEGORIES.includes(category)) return res.status(400).json({ message: 'Choose a document category.' });
    if (!file) return res.status(400).json({ message: 'Attach the document file (PDF, DOC, DOCX, JPG, PNG or WEBP, up to 4 MB).' });
    const ext = path.extname(file.originalname).toLowerCase();
    if (!file.buffer.subarray(0, 4).toString('hex').startsWith(FILE_SIGNATURES[ext])) {
      return res.status(400).json({ message: 'The file content does not match its type. Upload the original file.' });
    }

    const docId = 'DOC-COMP-' + Date.now();
    const fileName = path.basename(file.originalname).replace(/[^\w.\- ]/g, '_');
    const stream = complianceFiles().openUploadStream(`${docId}${ext}`);
    await new Promise((resolve, reject) => stream.on('finish', resolve).on('error', reject).end(file.buffer));
    const newDoc = await ComplianceDocument.create({
      docId,
      title,
      category,
      fileId: stream.id,
      fileName,
      fileSize: file.size,
      fileUrl: `/api/compliance/documents/${docId}/download`,
      uploadedBy: req.user.name
    });
    await logAudit(req, 'UPLOAD_COMPLIANCE_DOC', 'ComplianceDocument', docId, newDoc);
    res.status(201).json(newDoc);
  } catch (err) { next(err); }
});


// Removes a wrongly uploaded document: the record first, so it can never point at a deleted file;
// then its file. A file left behind by a failed second step is private and is logged for cleanup.
router.delete('/documents/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const doc = await findComplianceDoc(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Compliance document not found.' });
    await ComplianceDocument.deleteOne({ _id: doc._id });
    if (doc.fileId) {
      await complianceFiles().delete(doc.fileId).catch((e) => console.error(`[Compliance] file ${doc.fileId} of ${doc.docId} not deleted: ${e.message}`));
    }
    await logAudit(req, 'DELETE_COMPLIANCE_DOC', 'ComplianceDocument', doc.docId, { title: doc.title, fileName: doc.fileName });
    res.json({ deleted: doc.docId });
  } catch (err) { next(err); }
});

// ==========================================
// 13. MASTERS & AUDIT HISTORY
// ==========================================
router.get('/masters', protect, async (req, res, next) => {
  try {
    const acts = await StatutoryActMaster.find();
    const categories = await ComplianceCategoryMaster.find();
    const states = await StateMaster.find();
    const plants = await PlantMaster.find();

    res.json({ acts, categories, states, plants });
  } catch (err) { next(err); }
});

router.get('/history', protect, adminOnly, async (req, res, next) => {
  try {
    const logs = await StatutoryAuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) { next(err); }
});

module.exports = router;
