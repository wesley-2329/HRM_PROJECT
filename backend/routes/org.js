const express = require('express');
const router = express.Router();
const CompanyMaster = require('../models/CompanyMaster');
const BranchMaster = require('../models/BranchMaster');
const BusinessUnitMaster = require('../models/BusinessUnitMaster');
const CostCenterMaster = require('../models/CostCenterMaster');
const Department = require('../models/Department');
const SubDepartmentMaster = require('../models/SubDepartmentMaster');
const DesignationMaster = require('../models/DesignationMaster');
const GradeBandMaster = require('../models/GradeBandMaster');

const Employee = require('../models/Employee');
const Vacancy = require('../models/Vacancy');
const OrgAuditLog = require('../models/OrgAuditLog');
const Notification = require('../models/Notification');

const EmployeeReportingHistory = require('../models/EmployeeReportingHistory');
const DepartmentTransferHistory = require('../models/DepartmentTransferHistory');
const DesignationHistory = require('../models/DesignationHistory');

// New Enterprise Models
const LegalEntityMaster = require('../models/LegalEntityMaster');
const RegionMaster = require('../models/RegionMaster');
const BuildingMaster = require('../models/BuildingMaster');
const FloorMaster = require('../models/FloorMaster');
const TeamMaster = require('../models/TeamMaster');
const PositionMaster = require('../models/PositionMaster');
const OrgPolicy = require('../models/OrgPolicy');
const OrgDocument = require('../models/OrgDocument');
const SuccessionPlan = require('../models/SuccessionPlan');
const HeadcountPlan = require('../models/HeadcountPlan');

const { protect, adminOnly } = require('../middleware/auth');

// Unified Auditing & Live State Trigger
const createAuditLog = async (req, action, details, oldValues = null, newValues = null) => {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection.remoteAddress || '';
    const reason = req.body.reason || 'Direct Admin Update';
    
    await OrgAuditLog.create({
      actorId: req.user.id,
      actorName: req.user.name,
      action,
      details,
      oldValues,
      newValues,
      browser: userAgent,
      ipAddress: ip,
      reason
    });

    if (req.io) {
      req.io.emit('org_update', { action, details });
      console.log(`Socket broadcast 'org_update' emitted for action: ${action}`);
    }
  } catch (err) {
    console.error('Error logging org audit log:', err);
  }
};

// ================= 1. Company Setup =================
router.get('/companies', protect, async (req, res) => {
  try {
    const list = await CompanyMaster.find({});
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/companies', protect, adminOnly, async (req, res) => {
  const { name, code, logo, businessType, status } = req.body;
  try {
    const exists = await CompanyMaster.findOne({ code });
    if (exists) return res.status(400).json({ message: 'Company code already exists' });
    const rec = await CompanyMaster.create({ name, code, logo, businessType, status });
    await OrgAuditLog.create({ actorId: req.user.id, actorName: req.user.name, action: 'CREATE_COMPANY', details: `Created Company Master: ${name} (${code})` });
    res.status(201).json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/companies/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await CompanyMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Company not found' });
    Object.assign(rec, req.body);
    await rec.save();
    await OrgAuditLog.create({ actorId: req.user.id, actorName: req.user.name, action: 'UPDATE_COMPANY', details: `Updated Company Master: ${rec.name} (${rec.code})` });
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/companies/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await CompanyMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Company not found' });
    await CompanyMaster.findByIdAndDelete(req.params.id);
    await OrgAuditLog.create({ actorId: req.user.id, actorName: req.user.name, action: 'DELETE_COMPANY', details: `Deleted Company Master: ${rec.name}` });
    res.json({ message: 'Company deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= 2. Branch Setup =================
router.get('/branches', protect, async (req, res) => {
  try {
    const list = await BranchMaster.find({});
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/branches', protect, adminOnly, async (req, res) => {
  const { name, code, location, branchHead, status } = req.body;
  try {
    const exists = await BranchMaster.findOne({ code });
    if (exists) return res.status(400).json({ message: 'Branch code already exists' });
    const rec = await BranchMaster.create({ name, code, location, branchHead, status });
    await OrgAuditLog.create({ actorId: req.user.id, actorName: req.user.name, action: 'CREATE_BRANCH', details: `Created Branch Master: ${name} (${code})` });
    res.status(201).json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/branches/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await BranchMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Branch not found' });
    Object.assign(rec, req.body);
    await rec.save();
    await OrgAuditLog.create({ actorId: req.user.id, actorName: req.user.name, action: 'UPDATE_BRANCH', details: `Updated Branch Master: ${rec.name} (${rec.code})` });
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/branches/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await BranchMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Branch not found' });
    await BranchMaster.findByIdAndDelete(req.params.id);
    await OrgAuditLog.create({ actorId: req.user.id, actorName: req.user.name, action: 'DELETE_BRANCH', details: `Deleted Branch Master: ${rec.name}` });
    res.json({ message: 'Branch deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= 3. Business Unit Setup =================
router.get('/business-units', protect, async (req, res) => {
  try {
    const { page, limit, search = '', status = '', parentCompany = '', sortBy = 'name', sortOrder = 'asc', includeDeleted = 'false' } = req.query;
    const query = includeDeleted === 'true' ? {} : { deletedAt: null };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }
    if (parentCompany) {
      query.parentCompany = parentCompany;
    }

    if (page && limit) {
      const count = await BusinessUnitMaster.countDocuments(query);
      const list = await BusinessUnitMaster.find(query)
        .populate('parentCompany')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      return res.json({
        data: list,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      });
    }

    const list = await BusinessUnitMaster.find(query).populate('parentCompany').sort({ name: 1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/business-units', protect, adminOnly, async (req, res) => {
  const { name, code, status, parentCompany, description, headOfUnit, email, phone, costCenter } = req.body;
  try {
    const exists = await BusinessUnitMaster.findOne({ code });
    if (exists) return res.status(400).json({ message: 'Business Unit code already exists' });
    const rec = await BusinessUnitMaster.create({
      name,
      code,
      status,
      parentCompany: parentCompany || null,
      description,
      headOfUnit,
      email,
      phone,
      costCenter,
      created_by: req.user.name,
      updated_by: req.user.name
    });
    await createAuditLog(req, 'CREATE_BU', `Created Business Unit: ${name} (${code})`, null, rec);
    res.status(201).json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/business-units/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await BusinessUnitMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Business Unit not found' });
    
    // Duplicate Name prevention check
    if (req.body.name && req.body.name !== rec.name) {
      const exists = await BusinessUnitMaster.findOne({ name: req.body.name });
      if (exists) return res.status(400).json({ message: 'Business Unit name already exists' });
    }

    const oldValues = rec.toObject();
    Object.assign(rec, req.body, { updated_by: req.user.name });
    await rec.save();
    await createAuditLog(req, 'UPDATE_BU', `Updated Business Unit: ${rec.name} (${rec.code})`, oldValues, rec);
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/business-units/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await BusinessUnitMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Business Unit not found' });

    // Child Validation: Block if Departments are mapped to this BU
    const deptsExist = await Department.countDocuments({ businessUnit: rec.name });
    if (deptsExist > 0) {
      return res.status(400).json({ message: `Cannot delete Business Unit '${rec.name}'. ${deptsExist} active departments are currently mapped to it.` });
    }

    const oldValues = rec.toObject();
    rec.deletedAt = new Date();
    rec.status = 'Inactive';
    rec.is_active = false;
    rec.updated_by = req.user.name;
    await rec.save();

    await createAuditLog(req, 'DELETE_BU', `Soft deleted Business Unit: ${rec.name}`, oldValues, rec);
    res.json({ message: 'Business Unit soft deleted successfully', rec });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/business-units/:id/restore', protect, adminOnly, async (req, res) => {
  try {
    const rec = await BusinessUnitMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Business Unit not found' });
    rec.deletedAt = null;
    rec.status = 'Active';
    rec.is_active = true;
    rec.updated_by = req.user.name;
    await rec.save();
    await createAuditLog(req, 'RESTORE_BU', `Restored Business Unit: ${rec.name}`, null, rec);
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/business-units/bulk-delete', protect, adminOnly, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'IDs array is required' });

    for (const id of ids) {
      const bu = await BusinessUnitMaster.findById(id);
      if (bu) {
        const deptsExist = await Department.countDocuments({ businessUnit: bu.name });
        if (deptsExist > 0) {
          return res.status(400).json({ message: `Cannot bulk delete. Business Unit '${bu.name}' is actively referenced by ${deptsExist} departments.` });
        }
      }
    }

    const result = await BusinessUnitMaster.updateMany(
      { _id: { $in: ids } },
      { $set: { deletedAt: new Date(), status: 'Inactive', is_active: false, updated_by: req.user.name } }
    );
    await createAuditLog(req, 'BULK_DELETE_BU', `Bulk soft deleted ${ids.length} Business Units`);
    res.json({ message: `Bulk deleted ${result.modifiedCount} records successfully` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/business-units/bulk-status', protect, adminOnly, async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!ids || !Array.isArray(ids) || !status) return res.status(400).json({ message: 'IDs array and status are required' });

    const result = await BusinessUnitMaster.updateMany(
      { _id: { $in: ids } },
      { $set: { status, is_active: status === 'Active', updated_by: req.user.name } }
    );
    await createAuditLog(req, 'BULK_STATUS_BU', `Bulk updated status of ${ids.length} Business Units to ${status}`);
    res.json({ message: `Bulk updated status of ${result.modifiedCount} records successfully` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= 4. Cost Center Setup =================
router.get('/cost-centers', protect, async (req, res) => {
  try {
    const list = await CostCenterMaster.find({});
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/cost-centers', protect, adminOnly, async (req, res) => {
  const { name, code, status } = req.body;
  try {
    const exists = await CostCenterMaster.findOne({ code });
    if (exists) return res.status(400).json({ message: 'Cost Center code already exists' });
    const rec = await CostCenterMaster.create({ name, code, status });
    await OrgAuditLog.create({ actorId: req.user.id, actorName: req.user.name, action: 'CREATE_CC', details: `Created Cost Center: ${name} (${code})` });
    res.status(201).json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/cost-centers/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await CostCenterMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Cost Center not found' });
    Object.assign(rec, req.body);
    await rec.save();
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/cost-centers/:id', protect, adminOnly, async (req, res) => {
  try {
    await CostCenterMaster.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cost Center deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= 5. Department Master Setup (Upgraded CRUD) =================
router.get('/departments', protect, async (req, res) => {
  try {
    const list = await Department.find({}).sort({ name: 1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/departments', protect, adminOnly, async (req, res) => {
  const { name, code, description, parentDept, managerId, businessUnit, location, costCenter, status } = req.body;
  try {
    const exists = await Department.findOne({ code });
    if (exists) return res.status(400).json({ message: 'Department code already exists' });
    const rec = await Department.create({ name, code, description, parentDept, managerId, businessUnit, location, costCenter, status });
    await OrgAuditLog.create({ actorId: req.user.id, actorName: req.user.name, action: 'CREATE_DEPT', details: `Created Department: ${name} (${code})` });
    res.status(201).json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/departments/:id', protect, adminOnly, async (req, res) => {
  const { name, code, description, parentDept, managerId, businessUnit, location, costCenter, status } = req.body;
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });

    // Business Rule Check: Cannot deactivate if active employees exist in this department
    if (status === 'Inactive') {
      const activeEmps = await Employee.countDocuments({ dept: dept.name, status: 'Approved' });
      if (activeEmps > 0) {
        return res.status(400).json({ message: `Cannot deactivate department. ${activeEmps} employees are currently assigned to it.` });
      }
    }

    Object.assign(dept, req.body);
    await dept.save();
    await OrgAuditLog.create({ actorId: req.user.id, actorName: req.user.name, action: 'UPDATE_DEPT', details: `Updated Department: ${dept.name} (${dept.code})` });
    res.json(dept);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/departments/:id', protect, adminOnly, async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });

    // Business Rule Check: Cannot delete if employees are mapped
    const empCount = await Employee.countDocuments({ dept: dept.name });
    if (empCount > 0) {
      return res.status(400).json({ message: `Cannot delete department. ${empCount} employees are currently assigned to it.` });
    }

    await Department.findByIdAndDelete(req.params.id);
    await OrgAuditLog.create({ actorId: req.user.id, actorName: req.user.name, action: 'DELETE_DEPT', details: `Deleted Department: ${dept.name}` });
    res.json({ message: 'Department deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= 6. Sub Department Setup =================
router.get('/sub-departments', protect, async (req, res) => {
  try {
    const list = await SubDepartmentMaster.find({});
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/sub-departments', protect, adminOnly, async (req, res) => {
  const { name, code, parentDept, managerId, status } = req.body;
  try {
    const exists = await SubDepartmentMaster.findOne({ code });
    if (exists) return res.status(400).json({ message: 'Sub-department code already exists' });
    const rec = await SubDepartmentMaster.create({ name, code, parentDept, managerId, status });
    await OrgAuditLog.create({ actorId: req.user.id, actorName: req.user.name, action: 'CREATE_SUBDEPT', details: `Created Sub-department: ${name} (${code})` });
    res.status(201).json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/sub-departments/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await SubDepartmentMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Sub-department not found' });
    Object.assign(rec, req.body);
    await rec.save();
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/sub-departments/:id', protect, adminOnly, async (req, res) => {
  try {
    await SubDepartmentMaster.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sub-department deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= 7. Designation Setup =================
router.get('/designations', protect, async (req, res) => {
  try {
    const list = await DesignationMaster.find({});
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/designations', protect, adminOnly, async (req, res) => {
  const { name, code, deptMapping, gradeMapping, positionLimit, status } = req.body;
  try {
    const exists = await DesignationMaster.findOne({ code });
    if (exists) return res.status(400).json({ message: 'Designation code already exists' });
    const rec = await DesignationMaster.create({ name, code, deptMapping, gradeMapping, positionLimit, status });
    await OrgAuditLog.create({ actorId: req.user.id, actorName: req.user.name, action: 'CREATE_DESG', details: `Created Designation: ${name} (${code})` });
    res.status(201).json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/designations/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await DesignationMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Designation not found' });
    Object.assign(rec, req.body);
    await rec.save();
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/designations/:id', protect, adminOnly, async (req, res) => {
  try {
    await DesignationMaster.findByIdAndDelete(req.params.id);
    res.json({ message: 'Designation deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= 8. Grade Band Setup =================
router.get('/grade-bands', protect, async (req, res) => {
  try {
    const list = await GradeBandMaster.find({});
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/grade-bands', protect, adminOnly, async (req, res) => {
  const { name, description, status } = req.body;
  try {
    const exists = await GradeBandMaster.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Grade Band name already exists' });
    const rec = await GradeBandMaster.create({ name, description, status });
    await OrgAuditLog.create({ actorId: req.user.id, actorName: req.user.name, action: 'CREATE_GRADE', details: `Created Grade/Band: ${name}` });
    res.status(201).json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/grade-bands/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await GradeBandMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Grade/Band not found' });
    Object.assign(rec, req.body);
    await rec.save();
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/grade-bands/:id', protect, adminOnly, async (req, res) => {
  try {
    await GradeBandMaster.findByIdAndDelete(req.params.id);
    res.json({ message: 'Grade/Band deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= 9. Reporting Manager Matrix (With Circular Check) =================

// Recursive checking helper
const hasCircularReporting = async (startEmpId, targetManagerId) => {
  let currentId = targetManagerId;
  const visited = new Set();
  while (currentId) {
    if (currentId === startEmpId) return true;
    if (visited.has(currentId)) break; // Break reference loops
    visited.add(currentId);
    const parent = await Employee.findOne({ id: currentId });
    currentId = parent ? parent.teamLeadId : null;
  }
  return false;
};

// Recursive hierarchy depth calculator
const getHierarchyDepth = async (managerId, depth = 1) => {
  if (!managerId || managerId.trim() === '') return depth;
  if (depth > 10) return depth;
  const mgr = await Employee.findOne({ id: managerId });
  if (mgr && mgr.teamLeadId && mgr.teamLeadId.trim() !== '') {
    return getHierarchyDepth(mgr.teamLeadId, depth + 1);
  }
  return depth;
};

router.put('/reporting-manager', protect, adminOnly, async (req, res) => {
  const {
    employeeId,
    newManagerId,
    secondaryManagerId,
    functionalManagerId,
    projectManagerId,
    hrManagerId,
    mentorId,
    buddyId,
    skipManagerId,
    escalationManagerId,
    isTeamLead,
    effectiveDate,
    reason
  } = req.body;

  try {
    const emp = await Employee.findOne({ id: employeeId });
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    // Helper to check inactive managers
    const checkActiveManager = async (mgrId, roleName) => {
      if (mgrId && mgrId.trim() !== '') {
        const mgr = await Employee.findOne({ id: mgrId });
        if (!mgr) throw new Error(`${roleName} (${mgrId}) not found.`);
        if (mgr.status !== 'Approved') {
          throw new Error(`${roleName} (${mgr.name}) is inactive or pending approval.`);
        }
        return mgr;
      }
      return null;
    };

    // Validate Active Status & Cross-Entity rules
    try {
      const pMgr = await checkActiveManager(newManagerId, 'Primary Manager');
      await checkActiveManager(secondaryManagerId, 'Secondary Manager');
      await checkActiveManager(functionalManagerId, 'Functional Manager');
      await checkActiveManager(projectManagerId, 'Project Manager');
      await checkActiveManager(hrManagerId, 'HR Manager');
      await checkActiveManager(mentorId, 'Mentor');
      await checkActiveManager(buddyId, 'Buddy');
      await checkActiveManager(skipManagerId, 'Skip Manager');
      await checkActiveManager(escalationManagerId, 'Escalation Manager');

      // Cross-company validation
      if (pMgr && emp.companyCode && pMgr.companyCode && emp.companyCode !== pMgr.companyCode) {
        return res.status(400).json({ message: `Cross-company reporting violated! Employee company (${emp.companyCode}) does not match Manager company (${pMgr.companyCode}).` });
      }
      // Cross-region validation
      if (pMgr && emp.regionCode && pMgr.regionCode && emp.regionCode !== pMgr.regionCode) {
        return res.status(400).json({ message: `Cross-region reporting violated! Employee region (${emp.regionCode}) does not match Manager region (${pMgr.regionCode}).` });
      }
    } catch (valErr) {
      return res.status(400).json({ message: valErr.message });
    }

    // Validate Circular Reporting loop
    if (newManagerId && newManagerId !== '') {
      const isCircular = await hasCircularReporting(employeeId, newManagerId);
      if (isCircular) {
        return res.status(400).json({ message: 'Circular reporting detected! The reporting manager cannot report to this employee recursively.' });
      }
    }

    // Validate Maximum Hierarchy Depth (Limit to 10)
    if (newManagerId && newManagerId !== '') {
      const depth = await getHierarchyDepth(newManagerId, 1);
      if (depth >= 10) {
        return res.status(400).json({ message: `Hierarchy depth violation! Reporting line exceeds the maximum limit of 10 levels (Current: ${depth + 1}).` });
      }
    }

    const oldValues = {
      teamLeadId: emp.teamLeadId,
      secondaryManagerId: emp.secondaryManagerId,
      functionalManagerId: emp.functionalManagerId,
      projectManagerId: emp.projectManagerId,
      hrManagerId: emp.hrManagerId,
      mentorId: emp.mentorId,
      buddyId: emp.buddyId,
      skipManagerId: emp.skipManagerId,
      escalationManagerId: emp.escalationManagerId,
      isTeamLead: emp.isTeamLead
    };

    if (newManagerId !== undefined) emp.teamLeadId = newManagerId;
    if (secondaryManagerId !== undefined) emp.secondaryManagerId = secondaryManagerId;
    if (functionalManagerId !== undefined) emp.functionalManagerId = functionalManagerId;
    if (projectManagerId !== undefined) emp.projectManagerId = projectManagerId;
    if (hrManagerId !== undefined) emp.hrManagerId = hrManagerId;
    if (mentorId !== undefined) emp.mentorId = mentorId;
    if (buddyId !== undefined) emp.buddyId = buddyId;
    if (skipManagerId !== undefined) emp.skipManagerId = skipManagerId;
    if (escalationManagerId !== undefined) emp.escalationManagerId = escalationManagerId;
    if (isTeamLead !== undefined) emp.isTeamLead = isTeamLead;

    await emp.save();

    const newValues = {
      teamLeadId: emp.teamLeadId,
      secondaryManagerId: emp.secondaryManagerId,
      functionalManagerId: emp.functionalManagerId,
      projectManagerId: emp.projectManagerId,
      hrManagerId: emp.hrManagerId,
      mentorId: emp.mentorId,
      buddyId: emp.buddyId,
      skipManagerId: emp.skipManagerId,
      escalationManagerId: emp.escalationManagerId,
      isTeamLead: emp.isTeamLead
    };

    // Save transaction reporting history record
    await EmployeeReportingHistory.create({
      employeeId,
      employeeName: emp.name,
      oldManagerId: oldValues.teamLeadId || '',
      newManagerId: newValues.teamLeadId || '',
      oldFunctionalManagerId: oldValues.functionalManagerId || '',
      newFunctionalManagerId: newValues.functionalManagerId || '',
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      reason: reason || 'Reporting hierarchy re-mapping'
    });

    await createAuditLog(
      req,
      'UPDATE_REPORTING',
      `Upgraded reporting structure for ${emp.name} (${employeeId}). Primary Mgr: ${newManagerId || 'None'}`,
      oldValues,
      newValues
    );

    // Notify employee via socket and notification document
    const notif = await Notification.create({
      type: 'reminder',
      title: 'Reporting Manager Assigned',
      desc: `Your reporting structure was updated. Manager: ${newManagerId || 'None'}, Functional: ${functionalManagerId || 'None'}`,
      empId: employeeId
    });
    if (req.io) req.io.to(employeeId).emit('notification', notif);

    res.json({ message: 'Reporting manager details updated successfully', employee: emp });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= 10. Department Transfers =================
router.put('/department-transfer', protect, adminOnly, async (req, res) => {
  const { employeeId, newDept, effectiveDate, reason } = req.body;
  try {
    const emp = await Employee.findOne({ id: employeeId });
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    const oldDept = emp.dept;
    emp.dept = newDept;
    await emp.save();

    await DepartmentTransferHistory.create({
      employeeId,
      employeeName: emp.name,
      oldDept: oldDept || '',
      newDept: newDept,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      reason: reason || 'Internal transfer request'
    });

    await OrgAuditLog.create({
      actorId: req.user.id,
      actorName: req.user.name,
      action: 'TRANSFER_DEPT',
      details: `Transferred employee ${emp.name} (${employeeId}) from ${oldDept} to ${newDept}`
    });

    res.json({ message: 'Department transfer processed successfully', employee: emp });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= 11. Designation Movements =================
router.put('/designation-transfer', protect, adminOnly, async (req, res) => {
  const { employeeId, newDesignation, newGrade, effectiveDate, reason } = req.body;
  try {
    const emp = await Employee.findOne({ id: employeeId });
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    const oldDesignation = emp.designation;
    const oldGrade = emp.grade;

    emp.designation = newDesignation;
    if (newGrade) emp.grade = newGrade;
    await emp.save();

    await DesignationHistory.create({
      employeeId,
      employeeName: emp.name,
      oldDesignation: oldDesignation || '',
      newDesignation: newDesignation,
      oldGrade: oldGrade || '',
      newGrade: newGrade || '',
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      reason: reason || 'Role promotion/reassignment'
    });

    await OrgAuditLog.create({
      actorId: req.user.id,
      actorName: req.user.name,
      action: 'TRANSFER_ROLE',
      details: `Updated role designations of ${emp.name} (${employeeId}) to ${newDesignation} (Grade: ${newGrade || 'N/A'})`
    });

    res.json({ message: 'Designation updated successfully', employee: emp });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= 12. History Records Fetching =================
router.get('/reporting-history', protect, async (req, res) => {
  try {
    const list = await EmployeeReportingHistory.find({}).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/transfer-history', protect, async (req, res) => {
  try {
    const list = await DepartmentTransferHistory.find({}).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/designation-history', protect, async (req, res) => {
  try {
    const list = await DesignationHistory.find({}).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= 13. Vacancy Mapping & Approvals =================
router.get('/vacancies', protect, async (req, res) => {
  try {
    const list = await Vacancy.find({}).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/vacancies', protect, adminOnly, async (req, res) => {
  const { jobTitle, dept, managerId, budget, description, priorityLevel, requiredDate, vacancyReason, approvedHeadcount } = req.body;
  try {
    // Generate unique position ID
    const count = await Vacancy.countDocuments();
    const positionId = `POS-${1000 + count + 1}`;

    const rec = await Vacancy.create({
      positionId,
      jobTitle,
      dept,
      managerId: managerId || '',
      budget: budget || 0,
      description: description || '',
      priorityLevel: priorityLevel || 'Medium',
      requiredDate: requiredDate ? new Date(requiredDate) : undefined,
      vacancyReason: vacancyReason || 'New Position Request',
      approvedHeadcount: approvedHeadcount || 1,
      vacancyCount: approvedHeadcount || 1,
      status: 'Pending Approval'
    });

    await OrgAuditLog.create({ actorId: req.user.id, actorName: req.user.name, action: 'REQUEST_VACANCY', details: `Raised manpower request: ${jobTitle} (${positionId})` });
    res.status(201).json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/vacancies/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await Vacancy.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Vacancy not found' });
    Object.assign(rec, req.body);
    await rec.save();
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// HR / Management Vacancy Review Approvals (Screen 5 Approval flow)
router.put('/vacancies/:id/approve', protect, adminOnly, async (req, res) => {
  const { comments } = req.body;
  try {
    const rec = await Vacancy.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Vacancy not found' });

    rec.status = 'Open';
    rec.approvals.push({
      approverId: req.user.id,
      approverName: req.user.name,
      status: 'Approved',
      comments: comments || 'Manpower Budget Verified'
    });

    await rec.save();
    await OrgAuditLog.create({ actorId: req.user.id, actorName: req.user.name, action: 'APPROVE_VACANCY', details: `Approved vacancy headcount request for POS: ${rec.positionId}` });
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/vacancies/:id/reject', protect, adminOnly, async (req, res) => {
  const { comments } = req.body;
  try {
    const rec = await Vacancy.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Vacancy not found' });

    rec.status = 'Cancelled';
    rec.approvals.push({
      approverId: req.user.id,
      approverName: req.user.name,
      status: 'Rejected',
      comments: comments || 'Request denied'
    });

    await rec.save();
    await OrgAuditLog.create({ actorId: req.user.id, actorName: req.user.name, action: 'REJECT_VACANCY', details: `Rejected vacancy request for POS: ${rec.positionId}` });
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/vacancies/:id', protect, adminOnly, async (req, res) => {
  try {
    await Vacancy.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vacancy removed successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= 14. Span of Control & Audits =================
router.get('/span-of-control', protect, async (req, res) => {
  try {
    const allEmployees = await Employee.find({ status: 'Approved' }).select('id name role dept teamLeadId isTeamLead avatar gender designation');
    const directReportsMap = {};
    
    allEmployees.forEach(e => {
      if (e.teamLeadId) {
        if (!directReportsMap[e.teamLeadId]) directReportsMap[e.teamLeadId] = [];
        directReportsMap[e.teamLeadId].push(e);
      }
    });

    const getIndirectReports = (mgrId, visited = new Set()) => {
      let reports = [];
      const directs = directReportsMap[mgrId] || [];
      directs.forEach(d => {
        if (!visited.has(d.id)) {
          visited.add(d.id);
          reports.push(d);
          reports = reports.concat(getIndirectReports(d.id, visited));
        }
      });
      return reports;
    };

    const list = allEmployees
      .filter(e => e.isTeamLead || directReportsMap[e.id])
      .map(e => {
        const directs = directReportsMap[e.id] || [];
        const allReports = getIndirectReports(e.id);
        const directCount = directs.length;
        const indirectCount = Math.max(0, allReports.length - directCount);
        return {
          managerId: e.id,
          name: e.name,
          role: e.role,
          designation: e.designation || e.role,
          dept: e.dept,
          avatar: e.avatar,
          gender: e.gender,
          directCount,
          indirectCount,
          directReports: directs.map(d => ({ id: d.id, name: d.name, role: d.role, dept: d.dept }))
        };
      });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= Rollback Support =================
router.post('/audit-logs/:id/rollback', protect, adminOnly, async (req, res) => {
  try {
    const log = await OrgAuditLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Audit log not found' });
    if (!log.oldValues) return res.status(400).json({ message: 'No rollback data available for this log' });

    let restored = null;
    const old = log.oldValues;

    if (log.action.includes('COMPANY')) {
      restored = await CompanyMaster.findOneAndUpdate({}, old, { new: true });
    } else if (log.action.includes('BRANCH')) {
      restored = await BranchMaster.findByIdAndUpdate(old._id || log.details.match(/[a-f\d]{24}/i)?.[0], old, { new: true });
    } else if (log.action.includes('DEPT') && !log.action.includes('SUBDEPT')) {
      restored = await Department.findByIdAndUpdate(old._id || old.id, old, { new: true });
    } else if (log.action.includes('SUBDEPT')) {
      restored = await SubDepartmentMaster.findByIdAndUpdate(old._id, old, { new: true });
    } else if (log.action.includes('DESG')) {
      restored = await DesignationMaster.findByIdAndUpdate(old._id, old, { new: true });
    } else if (log.action.includes('GRADE')) {
      restored = await GradeBandMaster.findByIdAndUpdate(old._id, old, { new: true });
    } else if (log.action.includes('REPORTING')) {
      const empId = log.details.match(/\((.*?)\)/)?.[1];
      if (empId) {
        restored = await Employee.findOneAndUpdate({ id: empId }, old, { new: true });
      }
    } else if (log.action.includes('LEGAL_ENTITY')) {
      restored = await LegalEntityMaster.findByIdAndUpdate(old._id, old, { new: true });
    } else if (log.action.includes('REGION')) {
      restored = await RegionMaster.findByIdAndUpdate(old._id, old, { new: true });
    } else if (log.action.includes('TEAM')) {
      restored = await TeamMaster.findByIdAndUpdate(old._id, old, { new: true });
    } else if (log.action.includes('POSITION')) {
      restored = await PositionMaster.findByIdAndUpdate(old._id, old, { new: true });
    }

    if (!restored) {
      return res.status(400).json({ message: `Rollback not supported or entity not found for action ${log.action}` });
    }

    await createAuditLog(req, 'ROLLBACK_ACTION', `Rolled back action: ${log.action} (Original Log ID: ${log._id})`, log.newValues, log.oldValues);
    res.json({ message: 'Rollback executed successfully', restored });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= Legal Entity Management =================
router.get('/legal-entities', protect, async (req, res) => {
  try {
    const { page, limit, search = '', status = '', sortBy = 'name', sortOrder = 'asc', includeDeleted = 'false' } = req.query;
    const query = includeDeleted === 'true' ? {} : { deletedAt: null };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { gst: { $regex: search, $options: 'i' } },
        { pan: { $regex: search, $options: 'i' } },
        { cin: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    if (page && limit) {
      const count = await LegalEntityMaster.countDocuments(query);
      const list = await LegalEntityMaster.find(query)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      return res.json({
        data: list,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      });
    }

    const list = await LegalEntityMaster.find(query).sort({ name: 1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/legal-entities', protect, adminOnly, async (req, res) => {
  try {
    const { name, code, gst, pan, cin } = req.body;
    // Check duplicates
    const codeExists = await LegalEntityMaster.findOne({ code });
    if (codeExists) return res.status(400).json({ message: 'Legal Entity code already exists' });
    const nameExists = await LegalEntityMaster.findOne({ name });
    if (nameExists) return res.status(400).json({ message: 'Legal Entity name already exists' });
    const gstExists = await LegalEntityMaster.findOne({ gst });
    if (gstExists) return res.status(400).json({ message: 'GST Number already registered' });
    const panExists = await LegalEntityMaster.findOne({ pan });
    if (panExists) return res.status(400).json({ message: 'PAN Number already registered' });
    const cinExists = await LegalEntityMaster.findOne({ cin });
    if (cinExists) return res.status(400).json({ message: 'CIN Number already registered' });

    const rec = await LegalEntityMaster.create(Object.assign({}, req.body, { created_by: req.user.name, updated_by: req.user.name }));
    await createAuditLog(req, 'CREATE_LEGAL_ENTITY', `Created Legal Entity: ${rec.name} (${rec.code})`, null, rec);
    res.status(201).json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/legal-entities/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await LegalEntityMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Legal Entity not found' });
    const oldValues = rec.toObject();

    // Check duplicates
    if (req.body.name && req.body.name !== rec.name) {
      const exists = await LegalEntityMaster.findOne({ name: req.body.name });
      if (exists) return res.status(400).json({ message: 'Legal Entity name already exists' });
    }
    if (req.body.code && req.body.code !== rec.code) {
      const exists = await LegalEntityMaster.findOne({ code: req.body.code });
      if (exists) return res.status(400).json({ message: 'Legal Entity code already exists' });
    }
    if (req.body.gst && req.body.gst !== rec.gst) {
      const exists = await LegalEntityMaster.findOne({ gst: req.body.gst });
      if (exists) return res.status(400).json({ message: 'GST Number already registered' });
    }
    if (req.body.pan && req.body.pan !== rec.pan) {
      const exists = await LegalEntityMaster.findOne({ pan: req.body.pan });
      if (exists) return res.status(400).json({ message: 'PAN Number already registered' });
    }
    if (req.body.cin && req.body.cin !== rec.cin) {
      const exists = await LegalEntityMaster.findOne({ cin: req.body.cin });
      if (exists) return res.status(400).json({ message: 'CIN Number already registered' });
    }

    Object.assign(rec, req.body, { updated_by: req.user.name });
    await rec.save();
    await createAuditLog(req, 'UPDATE_LEGAL_ENTITY', `Updated Legal Entity: ${rec.name} (${rec.code})`, oldValues, rec);
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/legal-entities/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await LegalEntityMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Legal Entity not found' });

    // Child Validation: Block if Business Units reference this Legal Entity
    const buExist = await BusinessUnitMaster.countDocuments({ parentCompany: rec._id, deletedAt: null });
    if (buExist > 0) {
      return res.status(400).json({ message: `Cannot delete Legal Entity '${rec.name}'. ${buExist} active Business Units reference it.` });
    }

    const oldValues = rec.toObject();
    rec.deletedAt = new Date();
    rec.status = 'Inactive';
    rec.is_active = false;
    rec.updated_by = req.user.name;
    await rec.save();

    await createAuditLog(req, 'DELETE_LEGAL_ENTITY', `Soft deleted Legal Entity: ${rec.name}`, oldValues, rec);
    res.json({ message: 'Legal Entity soft deleted successfully', rec });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/legal-entities/:id/restore', protect, adminOnly, async (req, res) => {
  try {
    const rec = await LegalEntityMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Legal Entity not found' });
    rec.deletedAt = null;
    rec.status = 'Active';
    rec.is_active = true;
    rec.updated_by = req.user.name;
    await rec.save();
    await createAuditLog(req, 'RESTORE_LEGAL_ENTITY', `Restored Legal Entity: ${rec.name}`, null, rec);
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/legal-entities/bulk-delete', protect, adminOnly, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'IDs array is required' });

    for (const id of ids) {
      const buExist = await BusinessUnitMaster.countDocuments({ parentCompany: id, deletedAt: null });
      if (buExist > 0) {
        const rec = await LegalEntityMaster.findById(id);
        return res.status(400).json({ message: `Cannot bulk delete. Legal Entity '${rec ? rec.name : id}' is actively referenced by Business Units.` });
      }
    }

    const result = await LegalEntityMaster.updateMany(
      { _id: { $in: ids } },
      { $set: { deletedAt: new Date(), status: 'Inactive', is_active: false, updated_by: req.user.name } }
    );
    await createAuditLog(req, 'BULK_DELETE_LEGAL_ENTITY', `Bulk soft deleted ${ids.length} Legal Entities`);
    res.json({ message: `Bulk deleted ${result.modifiedCount} records successfully` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/legal-entities/bulk-status', protect, adminOnly, async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!ids || !Array.isArray(ids) || !status) return res.status(400).json({ message: 'IDs array and status are required' });

    const result = await LegalEntityMaster.updateMany(
      { _id: { $in: ids } },
      { $set: { status, is_active: status === 'Active', updated_by: req.user.name } }
    );
    await createAuditLog(req, 'BULK_STATUS_LEGAL_ENTITY', `Bulk updated status of ${ids.length} Legal Entities to ${status}`);
    res.json({ message: `Bulk updated status of ${result.modifiedCount} records successfully` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= Region Management =================
router.get('/regions', protect, async (req, res) => {
  try {
    const list = await RegionMaster.find({}).sort({ name: 1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/regions', protect, adminOnly, async (req, res) => {
  try {
    const exists = await RegionMaster.findOne({ code: req.body.code });
    if (exists) return res.status(400).json({ message: 'Region code already exists' });
    const rec = await RegionMaster.create(req.body);
    await createAuditLog(req, 'CREATE_REGION', `Created Region: ${rec.name} (${rec.code})`, null, rec);
    res.status(201).json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/regions/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await RegionMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Region not found' });
    const oldValues = rec.toObject();
    Object.assign(rec, req.body);
    await rec.save();
    await createAuditLog(req, 'UPDATE_REGION', `Updated Region: ${rec.name} (${rec.code})`, oldValues, rec);
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/regions/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await RegionMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Region not found' });
    const oldValues = rec.toObject();
    await RegionMaster.findByIdAndDelete(req.params.id);
    await createAuditLog(req, 'DELETE_REGION', `Deleted Region: ${rec.name}`, oldValues, null);
    res.json({ message: 'Region deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= Building Management =================
router.get('/buildings', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.branchId) filter.branchId = req.query.branchId;
    const list = await BuildingMaster.find(filter).populate('branchId').sort({ name: 1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/buildings', protect, adminOnly, async (req, res) => {
  try {
    const exists = await BuildingMaster.findOne({ code: req.body.code });
    if (exists) return res.status(400).json({ message: 'Building code already exists' });
    const rec = await BuildingMaster.create(req.body);
    await createAuditLog(req, 'CREATE_BUILDING', `Created Building: ${rec.name} (${rec.code})`, null, rec);
    res.status(201).json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/buildings/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await BuildingMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Building not found' });
    const oldValues = rec.toObject();
    Object.assign(rec, req.body);
    await rec.save();
    await createAuditLog(req, 'UPDATE_BUILDING', `Updated Building: ${rec.name} (${rec.code})`, oldValues, rec);
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/buildings/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await BuildingMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Building not found' });
    const oldValues = rec.toObject();
    await BuildingMaster.findByIdAndDelete(req.params.id);
    await createAuditLog(req, 'DELETE_BUILDING', `Deleted Building: ${rec.name}`, oldValues, null);
    res.json({ message: 'Building deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= Floor Management =================
router.get('/floors', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.buildingId) filter.buildingId = req.query.buildingId;
    const list = await FloorMaster.find(filter).populate('buildingId').sort({ floorNumber: 1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/floors', protect, adminOnly, async (req, res) => {
  try {
    const rec = await FloorMaster.create(req.body);
    await createAuditLog(req, 'CREATE_FLOOR', `Created Floor: ${rec.name} (Building ref: ${rec.buildingId})`, null, rec);
    res.status(201).json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/floors/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await FloorMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Floor not found' });
    const oldValues = rec.toObject();
    Object.assign(rec, req.body);
    await rec.save();
    await createAuditLog(req, 'UPDATE_FLOOR', `Updated Floor: ${rec.name}`, oldValues, rec);
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/floors/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await FloorMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Floor not found' });
    const oldValues = rec.toObject();
    await FloorMaster.findByIdAndDelete(req.params.id);
    await createAuditLog(req, 'DELETE_FLOOR', `Deleted Floor: ${rec.name}`, oldValues, null);
    res.json({ message: 'Floor deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= Team Management =================
router.get('/teams', protect, async (req, res) => {
  try {
    const { page, limit, search = '', status = '', parentDeptId = '', sortBy = 'name', sortOrder = 'asc', includeDeleted = 'false' } = req.query;
    const query = includeDeleted === 'true' ? {} : { deletedAt: null };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }
    if (parentDeptId) {
      query.parentDeptId = parentDeptId;
    }

    if (page && limit) {
      const count = await TeamMaster.countDocuments(query);
      const list = await TeamMaster.find(query)
        .populate('parentDeptId')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      return res.json({
        data: list,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      });
    }

    const list = await TeamMaster.find(query).populate('parentDeptId').sort({ name: 1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/teams', protect, adminOnly, async (req, res) => {
  try {
    const exists = await TeamMaster.findOne({ code: req.body.code });
    if (exists) return res.status(400).json({ message: 'Team code already exists' });
    const nameExists = await TeamMaster.findOne({ name: req.body.name });
    if (nameExists) return res.status(400).json({ message: 'Team name already exists' });

    const rec = await TeamMaster.create(Object.assign({}, req.body, { created_by: req.user.name, updated_by: req.user.name }));
    await createAuditLog(req, 'CREATE_TEAM', `Created Team: ${rec.name} (${rec.code})`, null, rec);
    res.status(201).json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/teams/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await TeamMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Team not found' });

    if (req.body.name && req.body.name !== rec.name) {
      const exists = await TeamMaster.findOne({ name: req.body.name });
      if (exists) return res.status(400).json({ message: 'Team name already exists' });
    }
    if (req.body.code && req.body.code !== rec.code) {
      const exists = await TeamMaster.findOne({ code: req.body.code });
      if (exists) return res.status(400).json({ message: 'Team code already exists' });
    }

    const oldValues = rec.toObject();
    Object.assign(rec, req.body, { updated_by: req.user.name });
    await rec.save();
    await createAuditLog(req, 'UPDATE_TEAM', `Updated Team: ${rec.name} (${rec.code})`, oldValues, rec);
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/teams/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await TeamMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Team not found' });

    // Child Validation: Block if Team has active members
    if (rec.currentMembers > 0) {
      return res.status(400).json({ message: `Cannot delete Team '${rec.name}' because it currently has ${rec.currentMembers} assigned members.` });
    }

    const oldValues = rec.toObject();
    rec.deletedAt = new Date();
    rec.status = 'Inactive';
    rec.is_active = false;
    rec.updated_by = req.user.name;
    await rec.save();

    await createAuditLog(req, 'DELETE_TEAM', `Soft deleted Team: ${rec.name}`, oldValues, rec);
    res.json({ message: 'Team soft deleted successfully', rec });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/teams/:id/restore', protect, adminOnly, async (req, res) => {
  try {
    const rec = await TeamMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Team not found' });
    rec.deletedAt = null;
    rec.status = 'Active';
    rec.is_active = true;
    rec.updated_by = req.user.name;
    await rec.save();
    await createAuditLog(req, 'RESTORE_TEAM', `Restored Team: ${rec.name}`, null, rec);
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/teams/bulk-delete', protect, adminOnly, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'IDs array is required' });

    for (const id of ids) {
      const team = await TeamMaster.findById(id);
      if (team && team.currentMembers > 0) {
        return res.status(400).json({ message: `Cannot bulk delete. Team '${team.name}' is actively occupied by ${team.currentMembers} members.` });
      }
    }

    const result = await TeamMaster.updateMany(
      { _id: { $in: ids } },
      { $set: { deletedAt: new Date(), status: 'Inactive', is_active: false, updated_by: req.user.name } }
    );
    await createAuditLog(req, 'BULK_DELETE_TEAM', `Bulk soft deleted ${ids.length} Teams`);
    res.json({ message: `Bulk deleted ${result.modifiedCount} records successfully` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/teams/bulk-status', protect, adminOnly, async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!ids || !Array.isArray(ids) || !status) return res.status(400).json({ message: 'IDs array and status are required' });

    const result = await TeamMaster.updateMany(
      { _id: { $in: ids } },
      { $set: { status, is_active: status === 'Active', updated_by: req.user.name } }
    );
    await createAuditLog(req, 'BULK_STATUS_TEAM', `Bulk updated status of ${ids.length} Teams to ${status}`);
    res.json({ message: `Bulk updated status of ${result.modifiedCount} records successfully` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= Position Management =================
router.get('/positions', protect, async (req, res) => {
  try {
    const { page, limit, search = '', status = '', department = '', grade = '', employmentType = '', sortBy = 'positionCode', sortOrder = 'asc', includeDeleted = 'false' } = req.query;
    const query = includeDeleted === 'true' ? {} : { deletedAt: null };

    if (search) {
      query.$or = [
        { positionName: { $regex: search, $options: 'i' } },
        { positionCode: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }
    if (department) {
      query.department = department;
    }
    if (grade) {
      query.grade = grade;
    }
    if (employmentType) {
      query.employmentType = employmentType;
    }

    if (page && limit) {
      const count = await PositionMaster.countDocuments(query);
      const list = await PositionMaster.find(query)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      return res.json({
        data: list,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      });
    }

    const list = await PositionMaster.find(query).sort({ positionCode: 1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/positions', protect, adminOnly, async (req, res) => {
  try {
    const exists = await PositionMaster.findOne({ positionCode: req.body.positionCode });
    if (exists) return res.status(400).json({ message: 'Position code already exists' });
    const rec = await PositionMaster.create(Object.assign({}, req.body, { created_by: req.user.name, updated_by: req.user.name }));
    await createAuditLog(req, 'CREATE_POSITION', `Created Position: ${rec.positionName} (${rec.positionCode})`, null, rec);
    res.status(201).json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/positions/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await PositionMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Position not found' });
    const oldValues = rec.toObject();
    Object.assign(rec, req.body, { updated_by: req.user.name });
    await rec.save();
    await createAuditLog(req, 'UPDATE_POSITION', `Updated Position: ${rec.positionName} (${rec.positionCode})`, oldValues, rec);
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/positions/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await PositionMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Position not found' });
    
    // Child Validation: Block if occupied
    if (rec.filledPositions > 0) {
      return res.status(400).json({ message: `Cannot delete position '${rec.positionName}' because it currently has ${rec.filledPositions} filled headcount.` });
    }

    const oldValues = rec.toObject();
    rec.deletedAt = new Date();
    rec.status = 'Closed';
    rec.is_active = false;
    rec.updated_by = req.user.name;
    await rec.save();

    await createAuditLog(req, 'DELETE_POSITION', `Soft deleted Position: ${rec.positionName} (${rec.positionCode})`, oldValues, rec);
    res.json({ message: 'Position soft deleted successfully', rec });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/positions/:id/restore', protect, adminOnly, async (req, res) => {
  try {
    const rec = await PositionMaster.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Position not found' });
    rec.deletedAt = null;
    rec.status = rec.filledPositions > 0 ? 'Filled' : 'Vacant';
    rec.is_active = true;
    rec.updated_by = req.user.name;
    await rec.save();
    await createAuditLog(req, 'RESTORE_POSITION', `Restored Position: ${rec.positionName}`, null, rec);
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/positions/bulk-delete', protect, adminOnly, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'IDs array is required' });

    for (const id of ids) {
      const pos = await PositionMaster.findById(id);
      if (pos && pos.filledPositions > 0) {
        return res.status(400).json({ message: `Cannot bulk delete. Position '${pos.positionName}' is occupied.` });
      }
    }

    const result = await PositionMaster.updateMany(
      { _id: { $in: ids } },
      { $set: { deletedAt: new Date(), status: 'Closed', is_active: false, updated_by: req.user.name } }
    );
    await createAuditLog(req, 'BULK_DELETE_POSITION', `Bulk soft deleted ${ids.length} Positions`);
    res.json({ message: `Bulk deleted ${result.modifiedCount} records successfully` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/positions/bulk-status', protect, adminOnly, async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!ids || !Array.isArray(ids) || !status) return res.status(400).json({ message: 'IDs array and status are required' });

    const result = await PositionMaster.updateMany(
      { _id: { $in: ids } },
      { $set: { status, is_active: status !== 'Closed', updated_by: req.user.name } }
    );
    await createAuditLog(req, 'BULK_STATUS_POSITION', `Bulk updated status of ${ids.length} Positions to ${status}`);
    res.json({ message: `Bulk updated status of ${result.modifiedCount} records successfully` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= Organization Policies =================
router.get('/policies', protect, async (req, res) => {
  try {
    const list = await OrgPolicy.find({}).sort({ category: 1, name: 1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/policies', protect, adminOnly, async (req, res) => {
  try {
    const rec = await OrgPolicy.create(req.body);
    await createAuditLog(req, 'CREATE_POLICY', `Created Org Policy: ${rec.name} [Category: ${rec.category}]`, null, rec);
    res.status(201).json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/policies/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await OrgPolicy.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Policy not found' });
    const oldValues = rec.toObject();

    rec.history.push({
      version: rec.version,
      updatedBy: req.user.name,
      rules: rec.rules,
      changeLog: req.body.changeLog || 'Version bump'
    });

    rec.version += 1;
    rec.rules = req.body.rules || rec.rules;
    rec.name = req.body.name || rec.name;
    rec.active = req.body.active !== undefined ? req.body.active : rec.active;

    await rec.save();
    await createAuditLog(req, 'UPDATE_POLICY', `Updated Policy: ${rec.name} to Version ${rec.version}`, oldValues, rec);
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/policies/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await OrgPolicy.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Policy not found' });
    const oldValues = rec.toObject();
    await OrgPolicy.findByIdAndDelete(req.params.id);
    await createAuditLog(req, 'DELETE_POLICY', `Deleted Policy: ${rec.name}`, oldValues, null);
    res.json({ message: 'Policy deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= Organization Documents =================
router.get('/documents', protect, async (req, res) => {
  try {
    const list = await OrgDocument.find({}).sort({ category: 1, title: 1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/documents', protect, adminOnly, async (req, res) => {
  try {
    const { title, category, filePath } = req.body;
    const rec = await OrgDocument.create({
      title,
      category,
      filePath,
      uploadedBy: req.user.name
    });
    await createAuditLog(req, 'CREATE_DOCUMENT', `Uploaded document: ${rec.title} (${rec.category})`, null, rec);
    res.status(201).json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/documents/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await OrgDocument.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Document not found' });
    const oldValues = rec.toObject();

    rec.versions.push({
      version: rec.version,
      filePath: rec.filePath,
      changeSummary: req.body.changeSummary || 'File updated',
      uploadedBy: req.user.name
    });

    rec.version += 1;
    rec.filePath = req.body.filePath || rec.filePath;
    rec.title = req.body.title || rec.title;

    await rec.save();
    await createAuditLog(req, 'UPDATE_DOCUMENT', `Updated Document: ${rec.title} (New Version: ${rec.version})`, oldValues, rec);
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/documents/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await OrgDocument.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Document not found' });
    const oldValues = rec.toObject();
    await OrgDocument.findByIdAndDelete(req.params.id);
    await createAuditLog(req, 'DELETE_DOCUMENT', `Deleted Document: ${rec.title}`, oldValues, null);
    res.json({ message: 'Document deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= Succession Planning =================
router.get('/succession-plans', protect, async (req, res) => {
  try {
    const list = await SuccessionPlan.find({}).populate('positionId').sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/succession-plans', protect, adminOnly, async (req, res) => {
  try {
    const { positionId, criticalLevel, riskLevel, successors } = req.body;
    let rec = await SuccessionPlan.findOne({ positionId });
    let oldValues = null;

    if (rec) {
      oldValues = rec.toObject();
      rec.criticalLevel = criticalLevel || rec.criticalLevel;
      rec.riskLevel = riskLevel || rec.riskLevel;
      rec.successors = successors || rec.successors;
      await rec.save();
      await createAuditLog(req, 'UPDATE_SUCCESSION', `Updated succession plan for Position: ${positionId}`, oldValues, rec);
    } else {
      rec = await SuccessionPlan.create({ positionId, criticalLevel, riskLevel, successors });
      await createAuditLog(req, 'CREATE_SUCCESSION', `Created succession plan for Position: ${positionId}`, null, rec);
    }
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/succession-plans/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await SuccessionPlan.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Succession Plan not found' });
    const oldValues = rec.toObject();
    await SuccessionPlan.findByIdAndDelete(req.params.id);
    await createAuditLog(req, 'DELETE_SUCCESSION', `Deleted succession plan for position ID: ${rec.positionId}`, oldValues, null);
    res.json({ message: 'Succession plan deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ================= Headcount Planning =================
router.get('/headcount-plans', protect, async (req, res) => {
  try {
    const list = await HeadcountPlan.find({}).populate('deptId').sort({ year: -1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/headcount-plans', protect, adminOnly, async (req, res) => {
  try {
    const exists = await HeadcountPlan.findOne({ deptId: req.body.deptId, year: req.body.year });
    if (exists) return res.status(400).json({ message: 'Headcount plan for this department and year already exists' });
    
    const rec = await HeadcountPlan.create({
      deptId: req.body.deptId,
      year: req.body.year,
      budgetedHeadcount: req.body.budgetedHeadcount,
      forecastHeadcount: req.body.forecastHeadcount || 0,
      approvalStatus: 'Draft'
    });

    rec.history.push({
      actorId: req.user.id,
      actorName: req.user.name,
      action: 'DRAFT_CREATE',
      budgetedHeadcount: rec.budgetedHeadcount,
      forecastHeadcount: rec.forecastHeadcount,
      status: 'Draft',
      comments: 'Draft headcount initialization'
    });
    await rec.save();

    await createAuditLog(req, 'CREATE_HEADCOUNT', `Created headcount plan for Year ${rec.year}`, null, rec);
    res.status(201).json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/headcount-plans/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await HeadcountPlan.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Headcount plan not found' });
    const oldValues = rec.toObject();

    rec.budgetedHeadcount = req.body.budgetedHeadcount || rec.budgetedHeadcount;
    rec.forecastHeadcount = req.body.forecastHeadcount || rec.forecastHeadcount;
    rec.approvalStatus = req.body.approvalStatus || rec.approvalStatus;

    rec.history.push({
      actorId: req.user.id,
      actorName: req.user.name,
      action: 'UPDATE',
      budgetedHeadcount: rec.budgetedHeadcount,
      forecastHeadcount: rec.forecastHeadcount,
      status: rec.approvalStatus,
      comments: req.body.comments || 'Plan updated'
    });
    await rec.save();

    await createAuditLog(req, 'UPDATE_HEADCOUNT', `Updated headcount plan for ID: ${rec._id}`, oldValues, rec);
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/headcount-plans/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const rec = await HeadcountPlan.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Headcount plan not found' });
    const oldValues = rec.toObject();

    rec.approvalStatus = 'Approved';
    rec.history.push({
      actorId: req.user.id,
      actorName: req.user.name,
      action: 'APPROVE',
      budgetedHeadcount: rec.budgetedHeadcount,
      forecastHeadcount: rec.forecastHeadcount,
      status: 'Approved',
      comments: req.body.comments || 'Budget verified'
    });
    await rec.save();

    await createAuditLog(req, 'APPROVE_HEADCOUNT', `Approved headcount plan for ID: ${rec._id}`, oldValues, rec);
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/headcount-plans/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const rec = await HeadcountPlan.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Headcount plan not found' });
    const oldValues = rec.toObject();

    rec.approvalStatus = 'Rejected';
    rec.history.push({
      actorId: req.user.id,
      actorName: req.user.name,
      action: 'REJECT',
      budgetedHeadcount: rec.budgetedHeadcount,
      forecastHeadcount: rec.forecastHeadcount,
      status: 'Rejected',
      comments: req.body.comments || 'Rejected headcount limit'
    });
    await rec.save();

    await createAuditLog(req, 'REJECT_HEADCOUNT', `Rejected headcount plan for ID: ${rec._id}`, oldValues, rec);
    res.json(rec);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/headcount-plans/:id', protect, adminOnly, async (req, res) => {
  try {
    const rec = await HeadcountPlan.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: 'Headcount plan not found' });
    const oldValues = rec.toObject();
    await HeadcountPlan.findByIdAndDelete(req.params.id);
    await createAuditLog(req, 'DELETE_HEADCOUNT', `Deleted headcount plan for year ${rec.year}`, oldValues, null);
    res.json({ message: 'Headcount plan deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/audit-logs', protect, adminOnly, async (req, res) => {
  try {
    const logs = await OrgAuditLog.find({}).sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
