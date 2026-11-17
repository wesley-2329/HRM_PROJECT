const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const FinancialYearMaster = require('../models/FinancialYearMaster');
const BudgetCategoryMaster = require('../models/BudgetCategoryMaster');
const BudgetTypeMaster = require('../models/BudgetTypeMaster');
const RecruitmentTypeMaster = require('../models/RecruitmentTypeMaster');
const RecruitmentSourceMaster = require('../models/RecruitmentSourceMaster');
const ExpenseCategoryMaster = require('../models/ExpenseCategoryMaster');
const WelfareCategoryMaster = require('../models/WelfareCategoryMaster');
const WelfareActivityMaster = require('../models/WelfareActivityMaster');
const VendorMaster = require('../models/VendorMaster');
const ForecastRuleMaster = require('../models/ForecastRuleMaster');
const BudgetApprovalMatrixMaster = require('../models/BudgetApprovalMatrixMaster');
const BudgetNotificationTemplateMaster = require('../models/BudgetNotificationTemplateMaster');

const HrBudget = require('../models/HrBudget');
const Employee = require('../models/Employee');
const BudgetAllocation = require('../models/BudgetAllocation');
const BudgetRevision = require('../models/BudgetRevision');
const BudgetUtilization = require('../models/BudgetUtilization');
const CostAnalytics = require('../models/CostAnalytics');
const ForecastData = require('../models/ForecastData');
const VarianceAnalysis = require('../models/VarianceAnalysis');
const BudgetApproval = require('../models/BudgetApproval');
const ManpowerBudget = require('../models/ManpowerBudget');
const HeadcountPlanning = require('../models/HeadcountPlanning');
const SalaryBudget = require('../models/SalaryBudget');
const VacancyBudget = require('../models/VacancyBudget');
const RecruitmentBudget = require('../models/RecruitmentBudget');
const RecruitmentExpense = require('../models/RecruitmentExpense');
const VendorInvoice = require('../models/VendorInvoice');
const CostPerHire = require('../models/CostPerHire');
const WelfareBudget = require('../models/WelfareBudget');
const WelfareExpense = require('../models/WelfareExpense');
const WelfareActivity = require('../models/WelfareActivity');
const WelfareBeneficiary = require('../models/WelfareBeneficiary');
const BudgetNotificationLog = require('../models/BudgetNotificationLog');
const BudgetAuditLog = require('../models/BudgetAuditLog');

const { protect, adminOnly } = require('../middleware/auth');
const { requireFields } = require('../utils/validate');

// Audit logger helper
const logAudit = async (req, action, entityType, entityId, changes) => {
  try {
    const user = req.user || { id: 'SYSTEM', name: 'System User', role: 'HR Manager' };
    await BudgetAuditLog.create({
      auditId: 'AUD-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      action,
      module: 'HR Budgeting & Cost Analytics',
      entityId: entityId || '',
      entityType: entityType || '',
      performedBy: user.name || user.id || 'HR Manager',
      userRole: user.role || 'HR Manager',
      changes: typeof changes === 'string' ? changes : JSON.stringify(changes || {})
    });
  } catch (e) {
    console.error('Budget Audit Log Error:', e);
  }
};

// ==========================================
// 1. DASHBOARD & EXECUTIVE KPIS
// ==========================================
router.get('/dashboard', protect, async (req, res, next) => {
  try {
    const budgets = await HrBudget.find();
    const allocations = await BudgetAllocation.find();
    const recruitmentCosts = await RecruitmentExpense.find();
    const welfareCosts = await WelfareExpense.find();

    // Every figure is summed from stored budgets and expenses; with none recorded the dashboard shows zeros.
    const sum = (rows, pick) => rows.reduce((acc, r) => acc + (pick(r) || 0), 0);
    const pct = (n, d) => (d > 0 ? `${(n / d * 100).toFixed(1)}%` : null);
    const planned = b => b.approvedBudget || b.proposedBudget;
    const groupBy = (key) => Object.values(budgets.reduce((acc, b) => {
      const k = b[key] || 'Unassigned';
      acc[k] = acc[k] || { name: k, budget: 0, actual: 0 };
      acc[k].budget += planned(b) || 0;
      acc[k].actual += b.utilizedBudget || 0;
      return acc;
    }, {})).sort((x, y) => y.budget - x.budget);

    const totalBudget = sum(budgets, planned);
    const totalUtilized = sum(budgets, b => b.utilizedBudget);
    const byDepartment = groupBy('department');
    const headcount = await Employee.countDocuments();

    res.json({
      kpis: {
        totalBudget,
        totalUtilized,
        totalRemaining: Math.max(0, totalBudget - totalUtilized),
        budgetVariance: pct(totalBudget - totalUtilized, totalBudget),
        recruitmentBudget: sum(recruitmentCosts, r => r.totalAmount),
        welfareBudget: sum(welfareCosts, w => w.totalAmount),
        costPerEmployee: headcount ? Math.round(totalUtilized / headcount) : 0,
        costPerDepartment: byDepartment.length ? Math.round(totalUtilized / byDepartment.length) : 0,
        departmentCount: byDepartment.length,
        utilizationPercentage: pct(totalUtilized, totalBudget)
      },
      charts: {
        departmentUtilization: byDepartment.map(d => ({ department: d.name, budget: d.budget, actual: d.actual })),
        categoryBreakdown: groupBy('budgetCategory').map(c => ({ category: c.name, budget: c.budget, actual: c.actual }))
      }
    });
  } catch (err) { next(err); }
});

// ==========================================
// 2. BUDGET PLANNING
// ==========================================
router.get('/planning', protect, async (req, res, next) => {
  try {
    const list = await HrBudget.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { next(err); }
});

router.post('/planning', protect, adminOnly, async (req, res, next) => {
  try {
    const body = req.body;
    requireFields(body, { financialYear: 'Financial year', department: 'Department', costCenter: 'Cost center', budgetCategory: 'Budget category', proposedBudget: 'Proposed amount' });
    const budgetId = 'BDG-' + Date.now();
    const newBudget = await HrBudget.create({
      budgetId,
      financialYear: body.financialYear,
      company: body.company,
      businessUnit: body.businessUnit,
      branch: body.branch,
      department: body.department,
      costCenter: body.costCenter,
      budgetCategory: body.budgetCategory,
      budgetType: body.budgetType || 'Operational',
      proposedBudget: Number(body.proposedBudget) || 0,
      approvedBudget: Number(body.approvedBudget) || Number(body.proposedBudget) || 0,
      forecastBudget: Number(body.forecastBudget) || Number(body.proposedBudget) || 0,
      utilizedBudget: 0,
      remainingBudget: Number(body.approvedBudget) || Number(body.proposedBudget) || 0,
      status: body.status || 'Draft',
      remarks: body.remarks || '',
      createdBy: req.user?.name || 'HR Manager'
    });

    await logAudit(req, 'CREATE_BUDGET', 'HrBudget', budgetId, newBudget);
    res.status(201).json(newBudget);
  } catch (err) { next(err); }
});

router.put('/planning/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const updated = await HrBudget.findOneAndUpdate({ budgetId: id }, update, { new: true });
    await logAudit(req, 'UPDATE_BUDGET', 'HrBudget', id, update);
    res.json(updated);
  } catch (err) { next(err); }
});

// ==========================================
// 3. BUDGET ALLOCATION
// ==========================================
router.get('/allocation', protect, async (req, res, next) => {
  try {
    const list = await BudgetAllocation.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { next(err); }
});

// Move unspent budget from one department's allocation to another's in the same financial year (Bug 052).
router.post('/allocation/:id/transfer', protect, adminOnly, async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);
    const reason = String(req.body.reason || '').trim();
    if (!(amount > 0)) return res.status(400).json({ message: 'Enter a transfer amount greater than zero.' });
    if (!req.body.targetAllocationId) return res.status(400).json({ message: 'Choose the department to transfer to.' });
    if (!reason) return res.status(400).json({ message: 'Please fill in: Transfer reason.' });
    const source = await BudgetAllocation.findOne({ allocationId: req.params.id });
    const target = await BudgetAllocation.findOne({ allocationId: req.body.targetAllocationId });
    if (!source || !target) return res.status(404).json({ message: 'Budget allocation not found.' });
    if (source.allocationId === target.allocationId) return res.status(400).json({ message: 'Choose a different department to transfer to.' });
    if (source.financialYear !== target.financialYear) return res.status(400).json({ message: 'Budget can only move between allocations of the same financial year.' });
    // Conditional decrement: a double click or a second tab cannot overdraw the source.
    // shortcut: two separate updates, not a transaction; upgrade to a session transaction if the DB runs as a replica set everywhere.
    const from = await BudgetAllocation.findOneAndUpdate(
      { allocationId: source.allocationId, remainingAmount: { $gte: amount } },
      { $inc: { allocatedAmount: -amount, remainingAmount: -amount } }, { new: true });
    if (!from) return res.status(409).json({ message: `Only ₹${(source.remainingAmount || 0).toLocaleString('en-IN')} is left in ${source.department}'s allocation.` });
    const to = await BudgetAllocation.findOneAndUpdate({ allocationId: target.allocationId }, { $inc: { allocatedAmount: amount, remainingAmount: amount } }, { new: true });
    for (const a of [from, to]) {
      a.utilizationPercentage = a.allocatedAmount > 0 ? Math.round((a.utilizedAmount / a.allocatedAmount) * 1000) / 10 : 0;
      await a.save();
    }
    await logAudit(req, 'TRANSFER_BUDGET', 'BudgetAllocation', from.allocationId, { to: to.allocationId, toDepartment: to.department, amount, reason });
    res.json({ from, to });
  } catch (err) { next(err); }
});

router.post('/allocation', protect, adminOnly, async (req, res, next) => {
  try {
    const body = req.body;
    const allocationId = 'ALLOC-' + Date.now();
    const newAlloc = await BudgetAllocation.create({
      allocationId,
      budgetId: body.budgetId || ('BDG-' + Date.now()),
      financialYear: body.financialYear || 'FY 2026-2027',
      department: body.department,
      costCenter: body.costCenter,
      category: body.category,
      allocatedAmount: Number(body.allocatedAmount) || 0,
      utilizedAmount: Number(body.utilizedAmount) || 0,
      remainingAmount: (Number(body.allocatedAmount) || 0) - (Number(body.utilizedAmount) || 0),
      utilizationPercentage: Number(body.allocatedAmount) ? ((Number(body.utilizedAmount) || 0) / Number(body.allocatedAmount) * 100).toFixed(1) : 0,
      status: body.status || 'Active'
    });
    await logAudit(req, 'ALLOCATE_BUDGET', 'BudgetAllocation', allocationId, newAlloc);
    res.status(201).json(newAlloc);
  } catch (err) { next(err); }
});

// ==========================================
// 4. COST ANALYTICS
// ==========================================
router.get('/analytics', protect, async (req, res, next) => {
  try {
    const stored = await CostAnalytics.find();
    if (stored.length) return res.json(stored);
    // No analytics rows saved: derive one row per budget line from the budgets themselves.
    const budgets = await HrBudget.find();
    res.json(budgets.map(b => {
      const budgetAmount = b.approvedBudget || b.proposedBudget || 0;
      const actualCost = b.utilizedBudget || 0;
      return {
        analyticsId: b.budgetId, financialYear: b.financialYear, department: b.department, costCenter: b.costCenter,
        category: b.budgetCategory, budgetAmount, actualCost, variance: budgetAmount - actualCost,
        burnRate: budgetAmount > 0 ? Math.round(actualCost / budgetAmount * 1000) / 10 : 0
      };
    }));
  } catch (err) { next(err); }
});

// ==========================================
// 5. FORECAST & VARIANCE
// ==========================================
router.get('/forecast', protect, async (req, res, next) => {
  try {
    const [forecasts, variances] = await Promise.all([ForecastData.find(), VarianceAnalysis.find()]);
    res.json({ forecasts, variances });
  } catch (err) { next(err); }
});

// ==========================================
// 6. BUDGET HISTORY & AUDIT LOGS
// ==========================================
router.get('/history', protect, async (req, res, next) => {
  try {
    const logs = await BudgetAuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) { next(err); }
});

// ==========================================
// 7. MANPOWER BUDGET & WORKFORCE PLANNING
// ==========================================
router.get('/manpower', protect, async (req, res, next) => {
  try {
    const manpower = await ManpowerBudget.find().sort({ createdAt: -1 });
    const plans = await HeadcountPlanning.find();
    res.json({ manpower, plans });
  } catch (err) { next(err); }
});

router.post('/manpower', protect, adminOnly, async (req, res, next) => {
  try {
    const body = req.body;
    requireFields(body, { financialYear: 'Financial year', department: 'Department', costCenter: 'Cost center', designation: 'Designation',
      currentHeadcount: 'Current headcount', approvedHeadcount: 'Approved headcount', proposedHeadcount: 'Proposed headcount', avgMonthlySalary: 'Average monthly salary' });
    const budgetId = 'MPB-' + Date.now();
    const newManpower = await ManpowerBudget.create({
      budgetId,
      financialYear: body.financialYear,
      company: body.company,
      department: body.department,
      costCenter: body.costCenter,
      grade: body.grade,
      designation: body.designation,
      employmentType: body.employmentType,
      currentHeadcount: Number(body.currentHeadcount) || 0,
      approvedHeadcount: Number(body.approvedHeadcount) || 0,
      proposedHeadcount: Number(body.proposedHeadcount) || 0,
      vacancyCount: Number(body.vacancyCount) || 0,
      avgMonthlySalary: Number(body.avgMonthlySalary) || 0,
      annualSalaryBudget: Number(body.annualSalaryBudget) || 0,
      recruitmentBudget: Number(body.recruitmentBudget) || 0,
      replacementBudget: Number(body.replacementBudget) || 0,
      justification: body.justification || '',
      status: body.status || 'Submitted'
    });
    await logAudit(req, 'SUBMIT_MANPOWER_BUDGET', 'ManpowerBudget', budgetId, newManpower);
    res.status(201).json(newManpower);
  } catch (err) { next(err); }
});

// ==========================================
// 8. RECRUITMENT BUDGET & EXPENSE TRACKING
// ==========================================
router.get('/recruitment', protect, async (req, res, next) => {
  try {
    const budgets = await RecruitmentBudget.find();
    const expenses = await RecruitmentExpense.find().sort({ expenseDate: -1 });
    const cph = await CostPerHire.find();
    res.json({ budgets, expenses, costPerHire: cph });
  } catch (err) { next(err); }
});

router.post('/recruitment-expense', protect, adminOnly, async (req, res, next) => {
  try {
    const body = req.body;
    requireFields(body, { expenseCategory: 'Expense category', vendorName: 'Vendor name', expenseDate: 'Expense date', amount: 'Amount', paymentStatus: 'Payment status' });
    const expenseId = 'RCX-' + Date.now();
    const newExpense = await RecruitmentExpense.create({
      expenseId,
      expenseCategory: body.expenseCategory,
      vendorName: body.vendorName || '',
      invoiceNumber: body.invoiceNumber || '',
      expenseDate: body.expenseDate,
      amount: Number(body.amount) || 0,
      taxAmount: Number(body.taxAmount) || 0,
      totalAmount: (Number(body.amount) || 0) + (Number(body.taxAmount) || 0),
      paymentStatus: body.paymentStatus,
      hiringSource: body.hiringSource,
      supportingDocUrl: body.supportingDocUrl || ''
    });
    await logAudit(req, 'ADD_RECRUITMENT_EXPENSE', 'RecruitmentExpense', expenseId, newExpense);
    res.status(201).json(newExpense);
  } catch (err) { next(err); }
});

// ==========================================
// 9. WELFARE BUDGET & EXPENSE TRACKING
// ==========================================
router.get('/welfare', protect, async (req, res, next) => {
  try {
    const budgets = await WelfareBudget.find();
    const expenses = await WelfareExpense.find().sort({ expenseDate: -1 });
    const activities = await WelfareActivity.find();
    res.json({ budgets, expenses, activities });
  } catch (err) { next(err); }
});

router.post('/welfare-expense', protect, adminOnly, async (req, res, next) => {
  try {
    const body = req.body;
    const expenseId = 'WFX-' + Date.now();
    requireFields(body, { welfareActivity: 'Welfare activity', welfareCategory: 'Category', expenseDate: 'Expense date', invoiceAmount: 'Invoice amount', beneficiariesCount: 'Beneficiaries', paymentStatus: 'Payment status' });
    const newExpense = await WelfareExpense.create({
      expenseId,
      welfareActivity: body.welfareActivity,
      welfareCategory: body.welfareCategory,
      vendorName: body.vendorName || '',
      expenseDate: body.expenseDate,
      invoiceNumber: body.invoiceNumber || '',
      invoiceAmount: Number(body.invoiceAmount) || 0,
      taxAmount: Number(body.taxAmount) || 0,
      totalAmount: (Number(body.invoiceAmount) || 0) + (Number(body.taxAmount) || 0),
      beneficiariesCount: Number(body.beneficiariesCount) || 0,
      paymentStatus: body.paymentStatus
    });
    await logAudit(req, 'ADD_WELFARE_EXPENSE', 'WelfareExpense', expenseId, newExpense);
    res.status(201).json(newExpense);
  } catch (err) { next(err); }
});

// ==========================================
// 10. BUDGET MASTERS & APPROVAL MATRIX
// ==========================================
router.get('/masters', protect, async (req, res, next) => {
  try {
    const years = await FinancialYearMaster.find();
    const categories = await BudgetCategoryMaster.find();
    const types = await BudgetTypeMaster.find();
    const vendors = await VendorMaster.find();
    const welfareCats = await WelfareCategoryMaster.find();
    const approvalMatrices = await BudgetApprovalMatrixMaster.find();

    res.json({
      financialYears: years,
      categories,
      types,
      vendors,
      welfareCategories: welfareCats,
      approvalMatrices
    });
  } catch (err) { next(err); }
});

module.exports = router;
