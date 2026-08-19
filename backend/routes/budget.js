const express = require('express');
const router = express.Router();
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

const { protect } = require('../middleware/auth');

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
router.get('/dashboard', protect, async (req, res) => {
  try {
    const budgets = await HrBudget.find();
    const allocations = await BudgetAllocation.find();
    const recruitmentCosts = await RecruitmentExpense.find();
    const welfareCosts = await WelfareExpense.find();

    const totalBudget = budgets.reduce((acc, b) => acc + (b.approvedBudget || b.proposedBudget || 0), 0) || 12500000;
    const totalUtilized = budgets.reduce((acc, b) => acc + (b.utilizedBudget || 0), 0) || 7850000;
    const totalRemaining = Math.max(0, totalBudget - totalUtilized);
    const budgetVariance = ((totalBudget - totalUtilized) / totalBudget * 100).toFixed(1);

    const recruitmentTotal = recruitmentCosts.reduce((acc, r) => acc + (r.totalAmount || 0), 0) || 1850000;
    const welfareTotal = welfareCosts.reduce((acc, w) => acc + (w.totalAmount || 0), 0) || 1420000;
    const trainingTotal = 950000;
    const payrollTotal = 24500000;
    const overtimeTotal = 680000;

    res.json({
      kpis: {
        totalBudget,
        totalUtilized,
        totalRemaining,
        budgetVariance: `${budgetVariance}%`,
        recruitmentBudget: recruitmentTotal,
        welfareBudget: welfareTotal,
        trainingBudget: trainingTotal,
        payrollCost: payrollTotal,
        overtimeCost: overtimeTotal,
        costPerEmployee: 18500,
        costPerDepartment: 1560000,
        utilizationPercentage: ((totalUtilized / totalBudget) * 100).toFixed(1)
      },
      charts: {
        budgetVsActual: [
          { month: 'Apr', budget: 1000000, actual: 920000 },
          { month: 'May', budget: 1000000, actual: 980000 },
          { month: 'Jun', budget: 1100000, actual: 1050000 },
          { month: 'Jul', budget: 1100000, actual: 1120000 },
          { month: 'Aug', budget: 1200000, actual: 1150000 },
          { month: 'Sep', budget: 1200000, actual: 1180000 }
        ],
        departmentUtilization: [
          { department: 'Engineering', budget: 4500000, actual: 3800000 },
          { department: 'Sales & Marketing', budget: 2800000, actual: 2100000 },
          { department: 'Operations', budget: 2200000, actual: 1850000 },
          { department: 'Human Resources', budget: 1500000, actual: 1100000 },
          { department: 'Finance & Legal', budget: 1500000, actual: 1000000 }
        ]
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 2. BUDGET PLANNING
// ==========================================
router.get('/planning', protect, async (req, res) => {
  try {
    const list = await HrBudget.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/planning', protect, async (req, res) => {
  try {
    const body = req.body;
    const budgetId = 'BDG-' + Date.now();
    const newBudget = await HrBudget.create({
      budgetId,
      financialYear: body.financialYear || 'FY 2026-2027',
      company: body.company || 'Enterprise Corp',
      businessUnit: body.businessUnit || 'Global HR',
      branch: body.branch || 'HQ Bangalore',
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/planning/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const updated = await HrBudget.findOneAndUpdate({ budgetId: id }, update, { new: true });
    await logAudit(req, 'UPDATE_BUDGET', 'HrBudget', id, update);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 3. BUDGET ALLOCATION
// ==========================================
router.get('/allocation', protect, async (req, res) => {
  try {
    const list = await BudgetAllocation.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/allocation', protect, async (req, res) => {
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 4. COST ANALYTICS
// ==========================================
router.get('/analytics', protect, async (req, res) => {
  try {
    const analytics = await CostAnalytics.find();
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 5. FORECAST & VARIANCE
// ==========================================
router.get('/forecast', protect, async (req, res) => {
  try {
    const forecasts = await ForecastData.find();
    const variances = await VarianceAnalysis.find();
    res.json({ forecasts, variances });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 6. BUDGET HISTORY & AUDIT LOGS
// ==========================================
router.get('/history', protect, async (req, res) => {
  try {
    const logs = await BudgetAuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 7. MANPOWER BUDGET & WORKFORCE PLANNING
// ==========================================
router.get('/manpower', protect, async (req, res) => {
  try {
    const manpower = await ManpowerBudget.find().sort({ createdAt: -1 });
    const plans = await HeadcountPlanning.find();
    res.json({ manpower, plans });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/manpower', protect, async (req, res) => {
  try {
    const body = req.body;
    const budgetId = 'MPB-' + Date.now();
    const newManpower = await ManpowerBudget.create({
      budgetId,
      financialYear: body.financialYear || 'FY 2026-2027',
      company: body.company || 'Enterprise Corp',
      department: body.department,
      costCenter: body.costCenter,
      grade: body.grade || 'G-3',
      designation: body.designation,
      employmentType: body.employmentType || 'Full Time',
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 8. RECRUITMENT BUDGET & EXPENSE TRACKING
// ==========================================
router.get('/recruitment', protect, async (req, res) => {
  try {
    const budgets = await RecruitmentBudget.find();
    const expenses = await RecruitmentExpense.find().sort({ expenseDate: -1 });
    const cph = await CostPerHire.find();
    res.json({ budgets, expenses, costPerHire: cph });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/recruitment-expense', protect, async (req, res) => {
  try {
    const body = req.body;
    const expenseId = 'RCX-' + Date.now();
    const newExpense = await RecruitmentExpense.create({
      expenseId,
      expenseCategory: body.expenseCategory,
      vendorName: body.vendorName || '',
      invoiceNumber: body.invoiceNumber || '',
      expenseDate: body.expenseDate || new Date(),
      amount: Number(body.amount) || 0,
      taxAmount: Number(body.taxAmount) || 0,
      totalAmount: (Number(body.amount) || 0) + (Number(body.taxAmount) || 0),
      paymentStatus: body.paymentStatus || 'Paid',
      hiringSource: body.hiringSource || 'Agency',
      supportingDocUrl: body.supportingDocUrl || ''
    });
    await logAudit(req, 'ADD_RECRUITMENT_EXPENSE', 'RecruitmentExpense', expenseId, newExpense);
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 9. WELFARE BUDGET & EXPENSE TRACKING
// ==========================================
router.get('/welfare', protect, async (req, res) => {
  try {
    const budgets = await WelfareBudget.find();
    const expenses = await WelfareExpense.find().sort({ expenseDate: -1 });
    const activities = await WelfareActivity.find();
    res.json({ budgets, expenses, activities });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/welfare-expense', protect, async (req, res) => {
  try {
    const body = req.body;
    const expenseId = 'WFX-' + Date.now();
    const newExpense = await WelfareExpense.create({
      expenseId,
      welfareActivity: body.welfareActivity,
      welfareCategory: body.welfareCategory,
      vendorName: body.vendorName || '',
      expenseDate: body.expenseDate || new Date(),
      invoiceNumber: body.invoiceNumber || '',
      invoiceAmount: Number(body.invoiceAmount) || 0,
      taxAmount: Number(body.taxAmount) || 0,
      totalAmount: (Number(body.invoiceAmount) || 0) + (Number(body.taxAmount) || 0),
      beneficiariesCount: Number(body.beneficiariesCount) || 0,
      paymentStatus: body.paymentStatus || 'Paid'
    });
    await logAudit(req, 'ADD_WELFARE_EXPENSE', 'WelfareExpense', expenseId, newExpense);
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 10. BUDGET MASTERS & APPROVAL MATRIX
// ==========================================
router.get('/masters', protect, async (req, res) => {
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
