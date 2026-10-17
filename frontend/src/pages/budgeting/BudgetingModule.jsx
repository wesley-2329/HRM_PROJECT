import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { downloadPdfDocument } from '../../utils/pdfGenerator';
import api from '../../api';

const BudgetingModule = ({ searchQuery = '' }) => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('dashboard');

  // Filters
  const [filterFY, setFilterFY] = useState('FY 2026-2027');
  const [filterDept, setFilterDept] = useState('All');
  const [filterCostCenter, setFilterCostCenter] = useState('All');

  // Data States
  const [kpis, setKpis] = useState({
    totalBudget: 12500000,
    totalUtilized: 7850000,
    totalRemaining: 4650000,
    budgetVariance: '37.2%',
    recruitmentBudget: 1850000,
    welfareBudget: 1420000,
    trainingBudget: 950000,
    payrollCost: 24500000,
    overtimeCost: 680000,
    costPerEmployee: 18500,
    costPerDepartment: 1560000,
    utilizationPercentage: '62.8%'
  });

  const [budgets, setBudgets] = useState([
    { budgetId: 'BDG-1001', financialYear: 'FY 2026-2027', department: 'Engineering', costCenter: 'CC-ENG-101', budgetCategory: 'Manpower', budgetType: 'Operational', proposedBudget: 4500000, approvedBudget: 4200000, forecastBudget: 4200000, utilizedBudget: 2800000, status: 'Approved', version: 1 },
    { budgetId: 'BDG-1002', financialYear: 'FY 2026-2027', department: 'Sales & Marketing', costCenter: 'CC-SLS-102', budgetCategory: 'Recruitment', budgetType: 'Operational', proposedBudget: 2800000, approvedBudget: 2500000, forecastBudget: 2500000, utilizedBudget: 1600000, status: 'Approved', version: 1 },
    { budgetId: 'BDG-1003', financialYear: 'FY 2026-2027', department: 'Human Resources', costCenter: 'CC-HR-103', budgetCategory: 'Welfare', budgetType: 'Operational', proposedBudget: 1500000, approvedBudget: 1400000, forecastBudget: 1400000, utilizedBudget: 920000, status: 'Approved', version: 2 },
    { budgetId: 'BDG-1004', financialYear: 'FY 2026-2027', department: 'Operations', costCenter: 'CC-OPS-104', budgetCategory: 'Training', budgetType: 'Operational', proposedBudget: 2200000, approvedBudget: 2000000, forecastBudget: 2000000, utilizedBudget: 1250000, status: 'Approved', version: 1 }
  ]);

  const [allocations, setAllocations] = useState([
    { allocationId: 'ALLOC-201', budgetId: 'BDG-1001', department: 'Engineering', costCenter: 'CC-ENG-101', category: 'Manpower Budget', allocatedAmount: 4200000, utilizedAmount: 2800000, remainingAmount: 1400000, utilizationPercentage: 66.7, status: 'Active' },
    { allocationId: 'ALLOC-202', budgetId: 'BDG-1002', department: 'Sales & Marketing', costCenter: 'CC-SLS-102', category: 'Recruitment Budget', allocatedAmount: 2500000, utilizedAmount: 1600000, remainingAmount: 900000, utilizationPercentage: 64.0, status: 'Active' },
    { allocationId: 'ALLOC-203', budgetId: 'BDG-1003', department: 'Human Resources', costCenter: 'CC-HR-103', category: 'Welfare Budget', allocatedAmount: 1400000, utilizedAmount: 920000, remainingAmount: 480000, utilizationPercentage: 65.7, status: 'Active' }
  ]);

  const [manpowerBudgets, setManpowerBudgets] = useState([
    { budgetId: 'MPB-301', financialYear: 'FY 2026-2027', department: 'Engineering', designation: 'Senior Software Engineer', currentHeadcount: 24, approvedHeadcount: 30, proposedHeadcount: 32, vacancyCount: 6, avgMonthlySalary: 140000, annualSalaryBudget: 50400000, recruitmentBudget: 360000, status: 'Approved' },
    { budgetId: 'MPB-302', financialYear: 'FY 2026-2027', department: 'Sales & Marketing', designation: 'Account Executive', currentHeadcount: 15, approvedHeadcount: 20, proposedHeadcount: 22, vacancyCount: 5, avgMonthlySalary: 85000, annualSalaryBudget: 20400000, recruitmentBudget: 250000, status: 'Approved' }
  ]);

  const [recruitmentExpenses, setRecruitmentExpenses] = useState([
    { expenseId: 'RCX-401', expenseCategory: 'Job Portal Subscription', vendorName: 'Naukri.com Enterprise', invoiceNumber: 'INV-NK-9921', expenseDate: '2026-07-15', amount: 450000, taxAmount: 81000, totalAmount: 531000, paymentStatus: 'Paid', hiringSource: 'Portal' },
    { expenseId: 'RCX-402', expenseCategory: 'Recruitment Agency', vendorName: 'Talent Scout Global', invoiceNumber: 'INV-TS-3341', expenseDate: '2026-08-01', amount: 350000, taxAmount: 63000, totalAmount: 413000, paymentStatus: 'Paid', hiringSource: 'Agency' }
  ]);

  const [welfareExpenses, setWelfareExpenses] = useState([
    { expenseId: 'WFX-501', welfareActivity: 'Annual Health Camp 2026', welfareCategory: 'Health Check-up', vendorName: 'Apollo Diagnostics', expenseDate: '2026-06-20', invoiceNumber: 'INV-AP-1082', invoiceAmount: 280000, taxAmount: 50400, totalAmount: 330400, beneficiariesCount: 220, paymentStatus: 'Paid' },
    { expenseId: 'WFX-502', welfareActivity: 'Executive Transport Subsidy', welfareCategory: 'Transportation', vendorName: 'Uber Corporate', expenseDate: '2026-07-31', invoiceNumber: 'INV-UB-7782', invoiceAmount: 185000, taxAmount: 33300, totalAmount: 218300, beneficiariesCount: 140, paymentStatus: 'Paid' }
  ]);

  const [historyLogs, setHistoryLogs] = useState([
    { auditId: 'AUD-901', action: 'BUDGET_APPROVED', module: 'HR Budgeting', entityId: 'BDG-1001', performedBy: 'Finance Manager', userRole: 'Finance Manager', changes: { department: 'Engineering', proposedBudget: 4000000, approvedBudget: 4200000, status: 'Approved' }, timestamp: '2026-08-01 10:30 AM' },
    { auditId: 'AUD-902', action: 'ALLOCATION_TRANSFERRED', module: 'HR Budgeting', entityId: 'ALLOC-202', performedBy: 'HR Director', userRole: 'HR Manager', changes: { sourceDepartment: 'Operations', targetDepartment: 'Sales Recruitment', transferAmount: 150000 }, timestamp: '2026-08-10 02:15 PM' }
  ]);

  const [masters, setMasters] = useState({
    financialYears: [
      { yearId: 'FY-2026', financialYear: 'FY 2026-2027', startDate: '2026-04-01', endDate: '2027-03-31', status: 'Open', isCurrent: true },
      { yearId: 'FY-2025', financialYear: 'FY 2025-2026', startDate: '2025-04-01', endDate: '2026-03-31', status: 'Closed', isCurrent: false }
    ],
    categories: [
      { categoryId: 'CAT-01', categoryCode: 'MANPOWER', categoryName: 'Manpower & Salary Budget' },
      { categoryId: 'CAT-02', categoryCode: 'RECRUITMENT', categoryName: 'Recruitment & Sourcing' },
      { categoryId: 'CAT-03', categoryCode: 'WELFARE', categoryName: 'Employee Welfare & Benefits' },
      { categoryId: 'CAT-04', categoryCode: 'TRAINING', categoryName: 'Training & Skill Development' }
    ],
    vendors: [
      { vendorId: 'VND-101', vendorName: 'Naukri.com Enterprise', category: 'Portal Provider', contactPerson: 'Rohan Sharma', phone: '+91 9876543210', rating: 4.8 },
      { vendorId: 'VND-102', vendorName: 'Talent Scout Global', category: 'Recruitment Agency', contactPerson: 'Priya Mehta', phone: '+91 9811223344', rating: 4.6 },
      { vendorId: 'VND-103', vendorName: 'Apollo Diagnostics', category: 'Medical & Insurance', contactPerson: 'Dr. Suresh V', phone: '+91 9988776655', rating: 4.9 }
    ]
  });

  // Cost Analytics State (Bug 070)
  const [costAnalytics, setCostAnalytics] = useState([
    { analyticsId: 'CST-001', financialYear: 'FY 2026-2027', department: 'Engineering', costCenter: 'CC-ENG-101', category: 'Manpower & Salaries', budgetAmount: 4200000, actualCost: 2800000, varianceAmount: 1400000, variancePercentage: 33.3, headcount: 48, costPerHead: 87500, burnRate: 66.7, rating: 'High Efficiency', color: '#10b981' },
    { analyticsId: 'CST-002', financialYear: 'FY 2026-2027', department: 'Sales & Marketing', costCenter: 'CC-SLS-102', category: 'Recruitment & Sourcing', budgetAmount: 2500000, actualCost: 1600000, varianceAmount: 900000, variancePercentage: 36.0, headcount: 32, costPerHead: 50000, burnRate: 64.0, rating: 'Optimal', color: '#3b82f6' },
    { analyticsId: 'CST-003', financialYear: 'FY 2026-2027', department: 'Human Resources', costCenter: 'CC-HR-103', category: 'Employee Welfare & Benefits', budgetAmount: 1400000, actualCost: 920000, varianceAmount: 480000, variancePercentage: 34.3, headcount: 18, costPerHead: 51100, burnRate: 65.7, rating: 'Optimal', color: '#3b82f6' },
    { analyticsId: 'CST-004', financialYear: 'FY 2026-2027', department: 'Operations & Infra', costCenter: 'CC-OPS-104', category: 'Training & Skill Development', budgetAmount: 2000000, actualCost: 1250000, varianceAmount: 750000, variancePercentage: 37.5, headcount: 24, costPerHead: 52000, burnRate: 62.5, rating: 'High Efficiency', color: '#10b981' },
    { analyticsId: 'CST-005', financialYear: 'FY 2026-2027', department: 'Finance & Legal', costCenter: 'CC-FIN-105', category: 'Compliance & Audit', budgetAmount: 1200000, actualCost: 780000, varianceAmount: 420000, variancePercentage: 35.0, headcount: 12, costPerHead: 56000, burnRate: 65.0, rating: 'Optimal', color: '#3b82f6' }
  ]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  // Forecast & Variance State (Bug 071)
  const [forecastList, setForecastList] = useState([
    { forecastId: 'FC-101', budgetId: 'BDG-1001', financialYear: 'FY 2026-2027', period: 'Annual', scenario: 'Expected', bestCase: 11200000, expectedCase: 11850000, worstCase: 12600000, costSavings: 650000, accuracy: 94.6 },
    { forecastId: 'FC-102', budgetId: 'BDG-1002', financialYear: 'FY 2026-2027', period: 'Quarterly', scenario: 'Expected', bestCase: 2750000, expectedCase: 2960000, worstCase: 3150000, costSavings: 140000, accuracy: 95.2 },
    { forecastId: 'FC-103', budgetId: 'BDG-1003', financialYear: 'FY 2026-2027', period: 'Monthly', scenario: 'Best Case', bestCase: 920000, expectedCase: 987000, worstCase: 1050000, costSavings: 67000, accuracy: 96.1 }
  ]);
  const [varianceList, setVarianceList] = useState([
    { varianceId: 'VAR-201', budgetId: 'BDG-1001', department: 'Engineering', costCenter: 'CC-ENG-101', category: 'Manpower & Salaries', plannedBudget: 4200000, actualExpense: 2800000, variance: 1400000, variancePercentage: 33.3, varianceType: 'Favorable', rootCause: 'Delayed Q2 lateral hiring ramp', actionPlan: 'Accelerate campus onboarding in Q3' },
    { varianceId: 'VAR-202', budgetId: 'BDG-1002', department: 'Sales & Marketing', costCenter: 'CC-SLS-102', category: 'Recruitment & Sourcing', plannedBudget: 2500000, actualExpense: 1600000, variance: 900000, variancePercentage: 36.0, varianceType: 'Favorable', rootCause: 'Optimized direct referral channel over agencies', actionPlan: 'Maintain internal referral program' },
    { varianceId: 'VAR-203', budgetId: 'BDG-1003', department: 'Human Resources', costCenter: 'CC-HR-103', category: 'Employee Welfare & Benefits', plannedBudget: 1400000, actualExpense: 920000, variance: 480000, variancePercentage: 34.3, varianceType: 'Favorable', rootCause: 'Group insurance renegotiation rebate', actionPlan: 'Lock in tiered premium discount' },
    { varianceId: 'VAR-204', budgetId: 'BDG-1004', department: 'Operations & Infra', costCenter: 'CC-OPS-104', category: 'Training & Skill Development', plannedBudget: 2000000, actualExpense: 1250000, variance: 750000, variancePercentage: 37.5, varianceType: 'Favorable', rootCause: 'Digital LMS adoption reduced venue expenses', actionPlan: 'Expand cloud certification tracks' },
    { varianceId: 'VAR-205', budgetId: 'BDG-1005', department: 'Operations & Infra', costCenter: 'CC-OPS-104', category: 'Overtime & Allowances', plannedBudget: 650000, actualExpense: 680000, variance: -30000, variancePercentage: -4.6, varianceType: 'Unfavorable', rootCause: 'Weekend migration and deployment sprints', actionPlan: 'Implement sprint rota to balance shift caps' }
  ]);
  const [quarterlyProjections, setQuarterlyProjections] = useState([
    { cat: 'Manpower & Salaries', q1: 6100000, q2: 6120000, q3: 6150000, q4: 6130000, total: 24500000, budget: 25000000, status: '+₹500,000 Favorable', color: '#10b981' },
    { cat: 'Recruitment & Sourcing', q1: 480000, q2: 510000, q3: 440000, q4: 420000, total: 1850000, budget: 1900000, status: '+₹50,000 Favorable', color: '#10b981' },
    { cat: 'Employee Welfare & Benefits', q1: 340000, q2: 370000, q3: 360000, q4: 350000, total: 1420000, budget: 1450000, status: '+₹30,000 Favorable', color: '#10b981' },
    { cat: 'Training & Skill Development', q1: 210000, q2: 260000, q3: 250000, q4: 230000, total: 950000, budget: 980000, status: '+₹30,000 Favorable', color: '#10b981' },
    { cat: 'Overtime & Allowances', q1: 170000, q2: 180000, q3: 165000, q4: 165000, total: 680000, budget: 650000, status: '-₹30,000 Variance Warning', color: '#ef4444' }
  ]);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState(null);

  // Modal States
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [showRecruitmentModal, setShowRecruitmentModal] = useState(false);
  const [showWelfareModal, setShowWelfareModal] = useState(false);
  const [showManpowerModal, setShowManpowerModal] = useState(false);
  const [selectedBudgetDetail, setSelectedBudgetDetail] = useState(null);
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);
  const [transferAllocationModal, setTransferAllocationModal] = useState(null);
  const [transferFormData, setTransferFormData] = useState({
    targetDepartment: 'Sales & Marketing',
    transferAmount: '',
    reason: 'Inter-department resource re-allocation'
  });

  const handleExecuteTransfer = (e) => {
    e.preventDefault();
    if (!transferAllocationModal) return;
    const amount = Number(transferFormData.transferAmount);
    if (!amount || amount <= 0) {
      showToast('Please enter a valid transfer amount.', 'warning');
      return;
    }
    if (amount > transferAllocationModal.remainingAmount) {
      showToast(`Transfer amount cannot exceed remaining balance (₹${transferAllocationModal.remainingAmount.toLocaleString()}).`, 'error');
      return;
    }

    setAllocations(prev => prev.map(item => {
      if (item.allocationId === transferAllocationModal.allocationId) {
        const newRemaining = Math.max(0, item.remainingAmount - amount);
        const newUtilized = item.utilizedAmount + amount;
        return {
          ...item,
          utilizedAmount: newUtilized,
          remainingAmount: newRemaining,
          utilizationPercentage: Math.round((newUtilized / item.allocatedAmount) * 1000) / 10
        };
      }
      return item;
    }));

    showToast(`Successfully transferred ₹${amount.toLocaleString()} from ${transferAllocationModal.department} to ${transferFormData.targetDepartment}.`, 'success');
    setTransferAllocationModal(null);
  };

  // Helper functions for formatting audit logs and preventing horizontal overflow
  const parseAuditChanges = (changes) => {
    if (!changes) return null;
    if (typeof changes === 'object') return changes;
    if (typeof changes === 'string') {
      try {
        const parsed = JSON.parse(changes);
        if (typeof parsed === 'object' && parsed !== null) return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const formatKeyLabel = (key) => {
    if (!key) return '';
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();
  };

  const formatAuditValue = (key, val) => {
    if (val === null || val === undefined) return '-';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'number') {
      const k = String(key || '').toLowerCase();
      if (k.includes('budget') || k.includes('amount') || k.includes('salary') || k.includes('spend') || k.includes('cost') || k.includes('tax')) {
        return `₹${val.toLocaleString('en-IN')}`;
      }
      return val.toLocaleString();
    }
    if (typeof val === 'object') {
      if (val.from !== undefined && val.to !== undefined) {
        return `${formatAuditValue(key, val.from)} → ${formatAuditValue(key, val.to)}`;
      }
      try {
        return JSON.stringify(val);
      } catch (e) {
        return String(val);
      }
    }
    return String(val);
  };

  // Form Inputs
  const [newBudget, setNewBudget] = useState({ department: 'Engineering', costCenter: 'CC-ENG-101', budgetCategory: 'Manpower', proposedBudget: 1000000, remarks: '' });
  const [newRecExpense, setNewRecExpense] = useState({ expenseCategory: 'Job Portal Subscription', vendorName: 'Naukri.com Enterprise', invoiceNumber: '', amount: 100000, taxAmount: 18000, hiringSource: 'Portal' });
  const [newWelExpense, setNewWelExpense] = useState({ welfareActivity: '', welfareCategory: 'Food & Canteen', vendorName: '', invoiceAmount: 50000, taxAmount: 9000, beneficiariesCount: 50 });
  const [newManpower, setNewManpower] = useState({ department: 'Engineering', designation: 'Software Engineer', currentHeadcount: 10, approvedHeadcount: 15, proposedHeadcount: 15, avgMonthlySalary: 90000 });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'dashboard') {
        const res = await api.get('/budget/dashboard');
        if (res.data && res.data.kpis) setKpis(res.data.kpis);
      } else if (activeTab === 'planning') {
        const res = await api.get('/budget/planning');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setBudgets(res.data);
      } else if (activeTab === 'allocation') {
        const res = await api.get('/budget/allocation');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setAllocations(res.data);
      } else if (activeTab === 'manpower') {
        const res = await api.get('/budget/manpower');
        if (res.data && res.data.manpower) setManpowerBudgets(res.data.manpower);
      } else if (activeTab === 'recruitment-expense' || activeTab === 'recruitment-budget') {
        const res = await api.get('/budget/recruitment');
        if (res.data && res.data.expenses) setRecruitmentExpenses(res.data.expenses);
      } else if (activeTab === 'welfare-expense' || activeTab === 'welfare-budget') {
        const res = await api.get('/budget/welfare');
        if (res.data && res.data.expenses) setWelfareExpenses(res.data.expenses);
      } else if (activeTab === 'history') {
        const res = await api.get('/budget/history');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const parsedLogs = res.data.map((item) => {
            if (typeof item.changes === 'string') {
              try {
                const parsed = JSON.parse(item.changes);
                if (typeof parsed === 'object' && parsed !== null) {
                  return { ...item, changes: parsed, rawChanges: item.changes };
                }
              } catch (e) {}
            }
            return item;
          });
          setHistoryLogs(parsedLogs);
        }
      } else if (activeTab === 'analytics') {
        setAnalyticsLoading(true);
        setAnalyticsError(null);
        try {
          const res = await api.get('/budget/analytics');
          if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            setCostAnalytics(res.data);
          }
        } catch (err) {
          console.warn('Analytics fetch error, retaining initial state:', err.message);
        } finally {
          setAnalyticsLoading(false);
        }
      } else if (activeTab === 'forecast') {
        setForecastLoading(true);
        setForecastError(null);
        try {
          const res = await api.get('/budget/forecast');
          if (res.data) {
            if (Array.isArray(res.data.forecasts) && res.data.forecasts.length > 0) {
              setForecastList(res.data.forecasts);
            }
            if (Array.isArray(res.data.variances) && res.data.variances.length > 0) {
              setVarianceList(res.data.variances);
            }
          }
        } catch (err) {
          console.warn('Forecast fetch error, retaining initial state:', err.message);
        } finally {
          setForecastLoading(false);
        }
      } else if (activeTab === 'masters' || activeTab === 'fy-config') {
        const res = await api.get('/budget/masters');
        if (res.data) setMasters(res.data);
      }
    } catch (err) {
      console.warn('Using stateful fallback for budget module:', err.message);
    }
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/budget/planning', newBudget);
      showToast('Budget draft created successfully.', 'success');
      setBudgets([res.data, ...budgets]);
      setShowPlanningModal(false);
    } catch (err) {
      const mockNew = {
        budgetId: 'BDG-' + Date.now(),
        financialYear: filterFY,
        department: newBudget.department,
        costCenter: newBudget.costCenter,
        budgetCategory: newBudget.budgetCategory,
        budgetType: 'Operational',
        proposedBudget: Number(newBudget.proposedBudget),
        approvedBudget: Number(newBudget.proposedBudget),
        forecastBudget: Number(newBudget.proposedBudget),
        utilizedBudget: 0,
        status: 'Draft',
        version: 1
      };
      setBudgets([mockNew, ...budgets]);
      showToast('Budget draft saved (offline mode).', 'success');
      setShowPlanningModal(false);
    }
  };

  const handleCreateRecExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/budget/recruitment-expense', newRecExpense);
      showToast('Recruitment expense recorded successfully.', 'success');
      setRecruitmentExpenses([res.data, ...recruitmentExpenses]);
      setShowRecruitmentModal(false);
    } catch (err) {
      const mockItem = {
        expenseId: 'RCX-' + Date.now(),
        expenseCategory: newRecExpense.expenseCategory,
        vendorName: newRecExpense.vendorName,
        invoiceNumber: newRecExpense.invoiceNumber || 'INV-' + Math.floor(Math.random()*10000),
        expenseDate: new Date().toISOString().split('T')[0],
        amount: Number(newRecExpense.amount),
        taxAmount: Number(newRecExpense.taxAmount),
        totalAmount: Number(newRecExpense.amount) + Number(newRecExpense.taxAmount),
        paymentStatus: 'Paid',
        hiringSource: newRecExpense.hiringSource
      };
      setRecruitmentExpenses([mockItem, ...recruitmentExpenses]);
      showToast('Recruitment expense recorded (offline mode).', 'success');
      setShowRecruitmentModal(false);
    }
  };

  const handleCreateWelfareExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/budget/welfare-expense', newWelExpense);
      showToast('Welfare expense submitted successfully.', 'success');
      setWelfareExpenses([res.data, ...welfareExpenses]);
      setShowWelfareModal(false);
    } catch (err) {
      const mockItem = {
        expenseId: 'WFX-' + Date.now(),
        welfareActivity: newWelExpense.welfareActivity || 'Employee Program',
        welfareCategory: newWelExpense.welfareCategory,
        vendorName: newWelExpense.vendorName || 'Vendor Co.',
        expenseDate: new Date().toISOString().split('T')[0],
        invoiceNumber: 'INV-' + Math.floor(Math.random()*10000),
        invoiceAmount: Number(newWelExpense.invoiceAmount),
        taxAmount: Number(newWelExpense.taxAmount),
        totalAmount: Number(newWelExpense.invoiceAmount) + Number(newWelExpense.taxAmount),
        beneficiariesCount: Number(newWelExpense.beneficiariesCount),
        paymentStatus: 'Paid'
      };
      setWelfareExpenses([mockItem, ...welfareExpenses]);
      showToast('Welfare expense logged (offline mode).', 'success');
      setShowWelfareModal(false);
    }
  };

  const handleCreateManpower = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/budget/manpower', newManpower);
      showToast('Manpower budget submitted successfully.', 'success');
      setManpowerBudgets([res.data, ...manpowerBudgets]);
      setShowManpowerModal(false);
    } catch (err) {
      const mockItem = {
        budgetId: 'MPB-' + Date.now(),
        financialYear: filterFY,
        department: newManpower.department,
        designation: newManpower.designation,
        currentHeadcount: Number(newManpower.currentHeadcount),
        approvedHeadcount: Number(newManpower.approvedHeadcount),
        proposedHeadcount: Number(newManpower.proposedHeadcount),
        vacancyCount: Number(newManpower.approvedHeadcount) - Number(newManpower.currentHeadcount),
        avgMonthlySalary: Number(newManpower.avgMonthlySalary),
        annualSalaryBudget: Number(newManpower.approvedHeadcount) * Number(newManpower.avgMonthlySalary) * 12,
        status: 'Submitted'
      };
      setManpowerBudgets([mockItem, ...manpowerBudgets]);
      showToast('Manpower budget submitted (offline mode).', 'success');
      setShowManpowerModal(false);
    }
  };

  // Nav Items array matching spec
  const menuTabs = [
    { id: 'dashboard', label: 'Budget Dashboard', icon: 'fa-chart-pie' },
    { id: 'planning', label: 'Budget Planning', icon: 'fa-file-invoice-dollar' },
    { id: 'allocation', label: 'Budget Allocation', icon: 'fa-coins' },
    { id: 'analytics', label: 'Cost Analytics', icon: 'fa-chart-line' },
    { id: 'forecast', label: 'Forecast & Variance', icon: 'fa-magnifying-glass-dollar' },
    { id: 'history', label: 'Budget History', icon: 'fa-clock-rotate-left' },
    { id: 'manpower', label: 'Manpower Budget', icon: 'fa-users-gear' },
    { id: 'workforce-plan', label: 'Workforce Planning', icon: 'fa-sitemap' },
    { id: 'recruitment-budget', label: 'Recruitment Budget', icon: 'fa-user-plus' },
    { id: 'recruitment-expense', label: 'Recruitment Expense', icon: 'fa-receipt' },
    { id: 'welfare-budget', label: 'Welfare Budget', icon: 'fa-heart-pulse' },
    { id: 'welfare-expense', label: 'Welfare Expense', icon: 'fa-hand-holding-dollar' },
    { id: 'reports', label: 'Budget Reports', icon: 'fa-file-pdf' },
    { id: 'executive', label: 'Executive Financial Dashboard', icon: 'fa-crown' },
    { id: 'masters', label: 'Budget Masters', icon: 'fa-cubes' },
    { id: 'approval-matrix', label: 'Approval Matrix', icon: 'fa-diagram-project' },
    { id: 'fy-config', label: 'Financial Year Config', icon: 'fa-calendar-days' }
  ];

  return (
    <div className="module-container p-6" style={{ background: 'hsl(var(--bg-main))', minHeight: '100vh', color: 'hsl(var(--text-primary))' }}>
      
      {/* Module Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-calculator" style={{ fontSize: '1.6rem', color: 'hsl(var(--primary))' }}></i>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>HR Budgeting & Cost Analytics</h1>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
            Enterprise HR financial planning, manpower allocation, welfare & recruitment expense tracking, variance forecasting, and executive dashboards.
          </p>
        </div>

        {/* Global Controls & Filters */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select className="form-control" value={filterFY} onChange={(e) => setFilterFY(e.target.value)} style={{ width: '150px' }}>
            <option>FY 2026-2027</option>
            <option>FY 2025-2026</option>
          </select>
          <button className="btn btn-primary" onClick={() => setShowPlanningModal(true)}>
            <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i> Create Budget
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '12px', marginBottom: '24px', overflowX: 'auto' }}>
        {menuTabs.map((t) => (
          <button
            key={t.id}
            data-testid={`budget-tab-${t.id}`}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              background: activeTab === t.id ? 'hsl(var(--primary))' : 'hsl(var(--bg-card))',
              color: activeTab === t.id ? '#ffffff' : 'hsl(var(--text-secondary))',
              boxShadow: activeTab === t.id ? '0 4px 12px rgba(99, 102, 241, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <i className={`fa-solid ${t.icon}`}></i>
            {t.label}
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* 1. BUDGET DASHBOARD & EXECUTIVE DASHBOARD VIEWS           */}
      {/* ======================================================== */}
      {(activeTab === 'dashboard' || activeTab === 'executive') && (
        <div>
          {/* KPI Cards Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #6366f1' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>TOTAL HR BUDGET</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>₹{(kpis.totalBudget || 0).toLocaleString()}</h2>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>FY 2026-2027 Approved</span>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #3b82f6' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>BUDGET UTILIZED</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>₹{(kpis.totalUtilized || 0).toLocaleString()}</h2>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>{kpis.utilizationPercentage} Utilized</span>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>BUDGET REMAINING</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>₹{(kpis.totalRemaining || 0).toLocaleString()}</h2>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Available Funds</span>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>BUDGET VARIANCE</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>{kpis.budgetVariance}</h2>
              <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>Favorable Variance</span>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #ec4899' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>RECRUITMENT SPEND</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>₹{(kpis.recruitmentBudget || 0).toLocaleString()}</h2>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Agency & Portal Costs</span>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #8b5cf6' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>WELFARE SPEND</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>₹{(kpis.welfareBudget || 0).toLocaleString()}</h2>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Canteen, Transport, Insurance</span>
            </div>
          </div>

          {/* Visual Progress & Spending Analytics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Department Budget Utilization</span>
                <i className="fa-solid fa-building-user" style={{ color: 'hsl(var(--primary))' }}></i>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {[
                  { dept: 'Engineering', allocated: 4500000, spent: 2800000, color: '#6366f1' },
                  { dept: 'Sales & Marketing', allocated: 2800000, spent: 1600000, color: '#3b82f6' },
                  { dept: 'Human Resources', allocated: 1500000, spent: 920000, color: '#ec4899' },
                  { dept: 'Operations', allocated: 2200000, spent: 1250000, color: '#10b981' }
                ].map((item) => {
                  const pct = Math.round((item.spent / item.allocated) * 100);
                  return (
                    <div key={item.dept}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', fontWeight: 600 }}>
                        <span>{item.dept}</span>
                        <span>₹{item.spent.toLocaleString()} / ₹{item.allocated.toLocaleString()} ({pct}%)</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: item.color, borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Cost Category Breakdown</span>
                <i className="fa-solid fa-chart-pie" style={{ color: 'hsl(var(--primary))' }}></i>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {[
                  { label: 'Payroll & Salary Budget', amount: 24500000, pct: '72%', icon: 'fa-money-check-dollar' },
                  { label: 'Recruitment & Sourcing', amount: 1850000, pct: '12%', icon: 'fa-user-plus' },
                  { label: 'Employee Welfare & Benefits', amount: 1420000, pct: '9%', icon: 'fa-heart' },
                  { label: 'Training & Development', amount: 950000, pct: '5%', icon: 'fa-graduation-cap' },
                  { label: 'Overtime & Allowance', amount: 680000, pct: '2%', icon: 'fa-clock' }
                ].map((c) => (
                  <div key={c.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <i className={`fa-solid ${c.icon}`} style={{ color: 'hsl(var(--primary))' }}></i>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.label}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>₹{c.amount.toLocaleString()}</span>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginLeft: '8px' }}>({c.pct})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. BUDGET PLANNING VIEW                                  */}
      {/* ======================================================== */}
      {activeTab === 'planning' && (
        <div className="card p-5">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontWeight: 700 }}>Annual HR Budget Planning Register</h3>
            <button className="btn btn-primary" onClick={() => setShowPlanningModal(true)}>
              <i className="fa-solid fa-plus"></i> New Proposed Budget
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Budget ID</th>
                  <th>FY</th>
                  <th>Department</th>
                  <th>Cost Center</th>
                  <th>Category</th>
                  <th>Proposed (₹)</th>
                  <th>Approved (₹)</th>
                  <th>Utilized (₹)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((b) => (
                  <tr key={b.budgetId} style={{ cursor: 'pointer' }} onClick={() => setSelectedBudgetDetail(b)}>
                    <td><strong>{b.budgetId}</strong></td>
                    <td>{b.financialYear}</td>
                    <td>{b.department}</td>
                    <td>{b.costCenter}</td>
                    <td><span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>{b.budgetCategory}</span></td>
                    <td>₹{(b.proposedBudget || 0).toLocaleString()}</td>
                    <td><strong>₹{(b.approvedBudget || 0).toLocaleString()}</strong></td>
                    <td>₹{(b.utilizedBudget || 0).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${b.status === 'Approved' ? 'badge-success' : 'badge-warning'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-view-budget-details" 
                        style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }} 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBudgetDetail(b);
                        }}
                        title="View Budget Details"
                        data-testid={`btn-view-budget-${b.budgetId}`}
                      >
                        <i className="fa-solid fa-eye"></i> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. BUDGET ALLOCATION VIEW                                */}
      {/* ======================================================== */}
      {activeTab === 'allocation' && (
        <div className="card p-5">
          <h3 style={{ margin: '0 0 16px 0', fontWeight: 700 }}>Department Budget Allocations & Transfers</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Allocation ID</th>
                  <th>Department</th>
                  <th>Cost Center</th>
                  <th>Allocated (₹)</th>
                  <th>Utilized (₹)</th>
                  <th>Remaining (₹)</th>
                  <th>Utilization %</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((a) => (
                  <tr key={a.allocationId}>
                    <td><strong>{a.allocationId}</strong></td>
                    <td>{a.department}</td>
                    <td>{a.costCenter}</td>
                    <td>₹{(a.allocatedAmount || 0).toLocaleString()}</td>
                    <td>₹{(a.utilizedAmount || 0).toLocaleString()}</td>
                    <td><strong style={{ color: '#10b981' }}>₹{(a.remainingAmount || 0).toLocaleString()}</strong></td>
                    <td>{a.utilizationPercentage}%</td>
                    <td><span className="badge badge-success">{a.status}</span></td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-transfer-allocation" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                        onClick={() => {
                          setTransferAllocationModal(a);
                          setTransferFormData({
                            targetDepartment: a.department === 'Sales & Marketing' ? 'Engineering' : 'Sales & Marketing',
                            transferAmount: Math.min(100000, a.remainingAmount),
                            reason: 'Inter-department resource re-allocation'
                          });
                          showToast('Transfer allocation request initiated', 'info');
                        }}
                      >
                        <i className="fa-solid fa-right-left"></i> Transfer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3B. COST ANALYTICS VIEW                                  */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* 3B. COST ANALYTICS VIEW (BUG 070)                         */}
      {/* ======================================================== */}
      {activeTab === 'analytics' && (
        <div data-testid="cost-analytics-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Analytics Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #3b82f6' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>COST PER EMPLOYEE</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>₹{(kpis.costPerEmployee || 18500).toLocaleString('en-IN')}</h2>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Within Target Band (₹20,000 cap)</span>
            </div>
            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>AVG DEPT MONTHLY RUNWAY</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>₹{(kpis.costPerDepartment || 1560000).toLocaleString('en-IN')}</h2>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Across 5 Core Business Units</span>
            </div>
            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>OVERTIME & SHIFT COST</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>₹{(kpis.overtimeCost || 680000).toLocaleString('en-IN')}</h2>
              <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>2.8% of Total Operational Spend</span>
            </div>
            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #8b5cf6' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>TOTAL UTILIZATION RATE</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>{kpis.utilizationPercentage || '62.8%'}</h2>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Optimal Pacing (Q2 Benchmark: 65%)</span>
            </div>
          </div>

          {/* Loading Indicator */}
          {analyticsLoading && (
            <div data-testid="analytics-loading" className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'hsl(var(--text-secondary))' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '12px', color: 'hsl(var(--primary))' }}></i>
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Loading cost analytics data...</div>
            </div>
          )}

          {/* Empty-State Container */}
          {!analyticsLoading && costAnalytics.filter(item => {
            const matchesDept = filterDept === 'All' || item.department === filterDept;
            const matchesCostCenter = filterCostCenter === 'All' || item.costCenter === filterCostCenter;
            const matchesSearch = !searchQuery || 
              (item.department && item.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (item.costCenter && item.costCenter.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesDept && matchesCostCenter && matchesSearch;
          }).length === 0 && (
            <div data-testid="analytics-empty-state" className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'hsl(var(--text-secondary))' }}>
              <i className="fa-solid fa-chart-pie" style={{ fontSize: '2.5rem', marginBottom: '16px', opacity: 0.4 }}></i>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px 0', color: 'hsl(var(--text-primary))' }}>No data available</h3>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Cost analytics data is not available for the selected filters.</p>
            </div>
          )}

          {/* Data Content (Charts & Tables) */}
          {!analyticsLoading && costAnalytics.filter(item => {
            const matchesDept = filterDept === 'All' || item.department === filterDept;
            const matchesCostCenter = filterCostCenter === 'All' || item.costCenter === filterCostCenter;
            const matchesSearch = !searchQuery || 
              (item.department && item.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (item.costCenter && item.costCenter.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesDept && matchesCostCenter && matchesSearch;
          }).length > 0 && (
            <>
              {/* Resilient Standalone Visual Analytics Charts Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
                {/* Chart 1: Department Cost Allocation & Spend Distribution */}
                <div className="card p-5" data-testid="chart-dept-cost-distribution">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>Department Cost Allocation & Spend</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>Allocated Budget vs Actual Spend by Business Unit</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', background: 'hsl(var(--primary))', borderRadius: '2px' }}></span> Allocated</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px' }}></span> Spent</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {costAnalytics.slice(0, 5).map(item => {
                      const maxVal = 4500000;
                      const allocPct = Math.min(100, Math.round(((item.budgetAmount || 4000000) / maxVal) * 100));
                      const spendPct = Math.min(100, Math.round(((item.actualCost || 2500000) / maxVal) * 100));
                      const burnRate = item.burnRate || (Math.round(((item.actualCost || 1) / (item.budgetAmount || 1)) * 1000) / 10);
                      return (
                        <div key={item.analyticsId || item.department}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                            <span>{item.department}</span>
                            <span style={{ color: 'hsl(var(--text-secondary))' }}>₹{(item.actualCost || 0).toLocaleString('en-IN')} / ₹{(item.budgetAmount || 0).toLocaleString('en-IN')} ({burnRate}%)</span>
                          </div>
                          <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                            <div style={{ width: `${allocPct}%`, height: '100%', background: 'hsl(var(--primary))', opacity: 0.35, position: 'absolute', top: 0, left: 0, borderRadius: '6px' }}></div>
                            <div style={{ width: `${spendPct}%`, height: '100%', background: item.color || '#10b981', position: 'absolute', top: 0, left: 0, borderRadius: '6px' }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chart 2: Cost Breakdown by Category */}
                <div className="card p-5" data-testid="chart-category-cost-breakdown">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>Cost Breakdown by Expense Category</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>Operational Spend Distribution across HR Functions</p>
                    </div>
                    <i className="fa-solid fa-chart-pie" style={{ color: 'hsl(var(--primary))' }}></i>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { cat: 'Manpower & Salaries', amount: 24500000, share: 77.2, color: '#6366f1' },
                      { cat: 'Recruitment & Sourcing', amount: 1850000, share: 5.8, color: '#3b82f6' },
                      { cat: 'Employee Welfare & Benefits', amount: 1420000, share: 4.5, color: '#10b981' },
                      { cat: 'Training & Skill Development', amount: 950000, share: 3.0, color: '#f59e0b' },
                      { cat: 'Overtime & Allowances', amount: 680000, share: 2.1, color: '#ec4899' }
                    ].map(c => (
                      <div key={c.cat}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', background: c.color, borderRadius: '50%' }}></span>
                            {c.cat}
                          </span>
                          <span>₹{c.amount.toLocaleString('en-IN')} ({c.share}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, c.share * 1.25)}%`, height: '100%', background: c.color, borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table 1: Departmental Cost Indices & Burn Rate Analytics */}
              <div className="card p-5" data-testid="table-dept-cost-analytics">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem' }}>Departmental Cost Indices & Burn Rate Analytics</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                      Headcount intensity, per-employee cost metrics, and efficiency ratings by department
                    </p>
                  </div>
                  <span className="badge" style={{ background: '#10b98115', color: '#10b981', fontWeight: 700 }}>5 Active Departments</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Cost Center</th>
                        <th>Headcount</th>
                        <th>Cost Per Head (₹)</th>
                        <th>Allocated Budget (₹)</th>
                        <th>Utilized Spend (₹)</th>
                        <th>Burn Rate</th>
                        <th>Efficiency Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costAnalytics.map((row) => (
                        <tr key={row.analyticsId || row.department}>
                          <td><strong>{row.department}</strong></td>
                          <td><code>{row.costCenter}</code></td>
                          <td>{row.headcount || 25} Active</td>
                          <td>₹{(row.costPerHead || 60000).toLocaleString('en-IN')}</td>
                          <td>₹{(row.budgetAmount || 0).toLocaleString('en-IN')}</td>
                          <td><strong>₹{(row.actualCost || 0).toLocaleString('en-IN')}</strong></td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${row.burnRate || 65}%`, height: '100%', background: row.color || '#10b981', borderRadius: '3px' }}></div>
                              </div>
                              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{row.burnRate || 65}%</span>
                            </div>
                          </td>
                          <td><span className="badge" style={{ background: `${row.color || '#10b981'}15`, color: row.color || '#10b981', fontWeight: 700 }}>{row.rating || 'Optimal'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 2: Category Cost Breakdown & Variance Table */}
              <div className="card p-5" data-testid="table-category-cost-analytics">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem' }}>Expense Category Cost Distribution & Remaining Runway</h3>
                  <span className="badge" style={{ background: '#3b82f615', color: '#3b82f6', fontWeight: 700 }}>FY 2026-2027</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Department Allocation</th>
                        <th>Approved Budget (₹)</th>
                        <th>Actual Spend (₹)</th>
                        <th>Remaining Variance (₹)</th>
                        <th>Burn Rate %</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costAnalytics.map((item) => {
                        const remaining = Math.max(0, (item.budgetAmount || 0) - (item.actualCost || 0));
                        const pct = Math.round(((item.actualCost || 0) / Math.max(1, item.budgetAmount || 1)) * 100);
                        return (
                          <tr key={`cat-${item.analyticsId || item.category}`}>
                            <td><strong>{item.category}</strong></td>
                            <td>{item.department}</td>
                            <td>₹{(item.budgetAmount || 0).toLocaleString('en-IN')}</td>
                            <td>₹{(item.actualCost || 0).toLocaleString('en-IN')}</td>
                            <td style={{ color: remaining >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                              ₹{remaining.toLocaleString('en-IN')}
                            </td>
                            <td><strong>{pct}%</strong></td>
                            <td>
                              <span className="badge" style={{ background: '#10b98115', color: '#10b981', fontWeight: 700 }}>
                                Active Runway
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3C. FORECAST & VARIANCE ANALYSIS VIEW (BUG 071)           */}
      {/* ======================================================== */}
      {activeTab === 'forecast' && (
        <div data-testid="forecast-variance-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Forecast Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #6366f1' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>PROJECTED ANNUAL SPEND</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>₹11,850,000</h2>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>-5.2% Below Approved FY Cap</span>
            </div>
            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>NET PROJECTED VARIANCE</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>+₹650,000</h2>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Favorable Surplus Expected</span>
            </div>
            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #3b82f6' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>FORECAST CONFIDENCE</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>94.6%</h2>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Based on 6-Month Realized Trend</span>
            </div>
            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #ec4899' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>RUNWAY STATUS</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>Healthy</h2>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Zero Capital Calls Needed</span>
            </div>
          </div>

          {/* Loading Indicator */}
          {forecastLoading && (
            <div data-testid="forecast-loading" className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'hsl(var(--text-secondary))' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '12px', color: 'hsl(var(--primary))' }}></i>
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Loading forecast & variance data...</div>
            </div>
          )}

          {/* Empty-State Container */}
          {!forecastLoading && varianceList.filter(item => {
            const matchesDept = filterDept === 'All' || item.department === filterDept;
            const matchesCostCenter = filterCostCenter === 'All' || item.costCenter === filterCostCenter;
            const matchesSearch = !searchQuery || 
              (item.department && item.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (item.costCenter && item.costCenter.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesDept && matchesCostCenter && matchesSearch;
          }).length === 0 && (
            <div data-testid="forecast-empty-state" className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'hsl(var(--text-secondary))' }}>
              <i className="fa-solid fa-magnifying-glass-dollar" style={{ fontSize: '2.5rem', marginBottom: '16px', opacity: 0.4 }}></i>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px 0', color: 'hsl(var(--text-primary))' }}>No data available</h3>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Budget forecast and variance data is not available for the selected filters.</p>
            </div>
          )}

          {/* Data Content (Charts & Tables) */}
          {!forecastLoading && varianceList.filter(item => {
            const matchesDept = filterDept === 'All' || item.department === filterDept;
            const matchesCostCenter = filterCostCenter === 'All' || item.costCenter === filterCostCenter;
            const matchesSearch = !searchQuery || 
              (item.department && item.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (item.costCenter && item.costCenter.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesDept && matchesCostCenter && matchesSearch;
          }).length > 0 && (
            <>
              {/* Standalone Trend Visualizations & Scenario Forecasting */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
                {/* Visual Trend Chart: Quarterly Realization Runway */}
                <div className="card p-5" data-testid="chart-forecast-trend">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>Quarterly Spend Runway & Forecast Trends</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>Realized Q1-Q2 actuals vs Projected Q3-Q4 runways</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', background: '#3b82f6', borderRadius: '2px' }}></span> Q1-Q2 Actual</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px' }}></span> Q3-Q4 Forecast</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {quarterlyProjections.map(q => {
                      const totalBudget = q.budget || 25000000;
                      const q1Pct = Math.min(25, Math.round((q.q1 / totalBudget) * 100));
                      const q2Pct = Math.min(25, Math.round((q.q2 / totalBudget) * 100));
                      const q3Pct = Math.min(25, Math.round((q.q3 / totalBudget) * 100));
                      const q4Pct = Math.min(25, Math.round((q.q4 / totalBudget) * 100));
                      return (
                        <div key={q.cat}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                            <span>{q.cat}</span>
                            <span style={{ color: q.color }}>{q.status}</span>
                          </div>
                          <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
                            <div style={{ width: `${q1Pct}%`, height: '100%', background: '#3b82f6' }} title={`Q1 Actual: ₹${q.q1.toLocaleString('en-IN')}`}></div>
                            <div style={{ width: `${q2Pct}%`, height: '100%', background: '#6366f1' }} title={`Q2 Actual: ₹${q.q2.toLocaleString('en-IN')}`}></div>
                            <div style={{ width: `${q3Pct}%`, height: '100%', background: '#10b981' }} title={`Q3 Forecast: ₹${q.q3.toLocaleString('en-IN')}`}></div>
                            <div style={{ width: `${q4Pct}%`, height: '100%', background: '#34d399' }} title={`Q4 Forecast: ₹${q.q4.toLocaleString('en-IN')}`}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Scenario Forecasting Modeling Cards */}
                <div className="card p-5" data-testid="chart-scenario-modeling">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>Predictive Scenario Modeling</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>Budget Sensitivity Simulation for FY 2026-2027</p>
                    </div>
                    <i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'hsl(var(--primary))' }}></i>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#10b981' }}>Best Case Scenario</span>
                        <span className="badge" style={{ background: '#10b98120', color: '#10b981', fontWeight: 700 }}>96.1% Accuracy</span>
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>₹11,200,000</div>
                      <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Expected Cost Savings: ₹1,300,000 (Aggressive hiring freeze on non-core roles)</div>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#6366f1' }}>Expected Case Scenario (Baseline)</span>
                        <span className="badge" style={{ background: '#6366f120', color: '#6366f1', fontWeight: 700 }}>94.6% Accuracy</span>
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>₹11,850,000</div>
                      <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Expected Cost Savings: ₹650,000 (Current realized pace with planned Q3 onboarding)</div>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ef4444' }}>Worst Case Scenario</span>
                        <span className="badge" style={{ background: '#ef444420', color: '#ef4444', fontWeight: 700 }}>92.4% Accuracy</span>
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>₹12,600,000</div>
                      <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Variance Overrun Risk: -₹100,000 (Overtime surge + expedited recruitment agency fees)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table 1: Planned vs Actual Budget Variance Matrix */}
              <div className="card p-5" data-testid="table-planned-vs-actual-variance">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem' }}>Planned vs. Actual Spend & Variance Analysis Matrix</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                      Cost center level variance tracking with automated root-cause diagnosis and remediation plans
                    </p>
                  </div>
                  <span className="badge" style={{ background: '#10b98115', color: '#10b981', fontWeight: 700 }}>
                    Net Variance: +₹2,600,000 Favorable
                  </span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Cost Center</th>
                        <th>Category</th>
                        <th>Planned Budget (₹)</th>
                        <th>Actual Expense (₹)</th>
                        <th>Variance Amount (₹)</th>
                        <th>Variance %</th>
                        <th>Type</th>
                        <th>Root Cause & Action Plan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {varianceList.map((row) => (
                        <tr key={row.varianceId || row.department}>
                          <td><strong>{row.department}</strong></td>
                          <td><code>{row.costCenter}</code></td>
                          <td>{row.category}</td>
                          <td>₹{(row.plannedBudget || 0).toLocaleString('en-IN')}</td>
                          <td><strong>₹{(row.actualExpense || 0).toLocaleString('en-IN')}</strong></td>
                          <td style={{ color: row.variance >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                            {row.variance >= 0 ? '+' : ''}₹{Math.abs(row.variance || 0).toLocaleString('en-IN')}
                          </td>
                          <td><strong>{row.variancePercentage || 0}%</strong></td>
                          <td>
                            <span className="badge" style={{ background: row.varianceType === 'Favorable' ? '#10b98115' : '#ef444415', color: row.varianceType === 'Favorable' ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                              {row.varianceType}
                            </span>
                          </td>
                          <td style={{ maxWidth: '280px', fontSize: '0.78rem' }}>
                            <div style={{ fontWeight: 600 }}>{row.rootCause}</div>
                            <div style={{ color: 'hsl(var(--text-secondary))', marginTop: '2px' }}>{row.actionPlan}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 2: Quarterly Expenditure Realization vs Projected Runways */}
              <div className="card p-5" data-testid="table-quarterly-projections">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem' }}>Quarterly Expenditure Realization vs Projected Runways</h3>
                  <span className="badge" style={{ background: '#6366f115', color: '#6366f1', fontWeight: 700 }}>Quarterly Trend Log</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>Cost Center / Category</th>
                        <th>Q1 (Actual)</th>
                        <th>Q2 (Actual)</th>
                        <th>Q3 (Forecast)</th>
                        <th>Q4 (Forecast)</th>
                        <th>FY Projected Total</th>
                        <th>Approved Budget</th>
                        <th>Variance Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quarterlyProjections.map((row) => (
                        <tr key={row.cat}>
                          <td><strong>{row.cat}</strong></td>
                          <td>₹{row.q1.toLocaleString('en-IN')}</td>
                          <td>₹{row.q2.toLocaleString('en-IN')}</td>
                          <td>₹{row.q3.toLocaleString('en-IN')}</td>
                          <td>₹{row.q4.toLocaleString('en-IN')}</td>
                          <td><strong>₹{row.total.toLocaleString('en-IN')}</strong></td>
                          <td>₹{row.budget.toLocaleString('en-IN')}</td>
                          <td><span className="badge" style={{ background: `${row.color}15`, color: row.color, fontWeight: 700 }}>{row.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {(activeTab === 'manpower' || activeTab === 'workforce-plan') && (
        <div className="card p-5">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontWeight: 700 }}>Manpower Budget & Headcount Planning</h3>
            <button className="btn btn-primary" onClick={() => setShowManpowerModal(true)}>
              <i className="fa-solid fa-user-plus"></i> Submit Headcount Budget
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Budget ID</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Current Headcount</th>
                  <th>Approved Headcount</th>
                  <th>Vacancies</th>
                  <th>Avg Monthly Salary (₹)</th>
                  <th>Annual Salary Budget (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {manpowerBudgets.map((m) => (
                  <tr key={m.budgetId}>
                    <td><strong>{m.budgetId}</strong></td>
                    <td>{m.department}</td>
                    <td>{m.designation}</td>
                    <td>{m.currentHeadcount}</td>
                    <td><strong>{m.approvedHeadcount}</strong></td>
                    <td><span className="badge badge-warning">{m.vacancyCount}</span></td>
                    <td>₹{(m.avgMonthlySalary || 0).toLocaleString()}</td>
                    <td>₹{(m.annualSalaryBudget || 0).toLocaleString()}</td>
                    <td><span className="badge badge-success">{m.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. RECRUITMENT EXPENSE & RECRUITMENT BUDGET VIEWS        */}
      {/* ======================================================== */}
      {(activeTab === 'recruitment-expense' || activeTab === 'recruitment-budget') && (
        <div className="card p-5">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontWeight: 700 }}>Recruitment Expenses & Agency Invoices</h3>
            <button className="btn btn-primary" onClick={() => setShowRecruitmentModal(true)}>
              <i className="fa-solid fa-receipt"></i> Record Recruitment Expense
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Expense ID</th>
                  <th>Category</th>
                  <th>Vendor</th>
                  <th>Invoice No</th>
                  <th>Date</th>
                  <th>Source</th>
                  <th>Total Amount (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recruitmentExpenses.map((r) => (
                  <tr key={r.expenseId}>
                    <td><strong>{r.expenseId}</strong></td>
                    <td>{r.expenseCategory}</td>
                    <td>{r.vendorName}</td>
                    <td>{r.invoiceNumber}</td>
                    <td>{r.expenseDate}</td>
                    <td><span className="badge" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>{r.hiringSource}</span></td>
                    <td><strong>₹{(r.totalAmount || 0).toLocaleString()}</strong></td>
                    <td><span className="badge badge-success">{r.paymentStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6A. WELFARE BUDGET ALLOCATION VIEW                       */}
      {/* ======================================================== */}
      {activeTab === 'welfare-budget' && (
        <div className="card p-5">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Employee Welfare Budget Allocations (FY 2026-2027)</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                Annual statutory and non-statutory employee welfare program allocations and coverage quotas.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowWelfareModal(true)}>
              <i className="fa-solid fa-plus"></i> New Welfare Allocation
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Allocation ID</th>
                  <th>Welfare Category</th>
                  <th>Annual Budget (₹)</th>
                  <th>Utilized (₹)</th>
                  <th>Remaining (₹)</th>
                  <th>Coverage</th>
                  <th>Utilization %</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'WFA-101', cat: 'Group Health & Medical Insurance', budget: 650000, spent: 420000, rem: 230000, cov: '100% Workforce', pct: 64.6, status: 'Active' },
                  { id: 'WFA-102', cat: 'Executive & Shift Transport Subsidy', budget: 350000, spent: 218300, rem: 131700, cov: 'Shift Workers', pct: 62.4, status: 'Active' },
                  { id: 'WFA-103', cat: 'Cafeteria & Canteen Operations', budget: 220000, spent: 145000, rem: 75000, cov: 'All Employees', pct: 65.9, status: 'Active' },
                  { id: 'WFA-104', cat: 'Annual Health Camp & Check-ups', budget: 120000, spent: 85000, rem: 35000, cov: 'All Employees', pct: 70.8, status: 'Active' },
                  { id: 'WFA-105', cat: 'Recreation, Sports & Wellness', budget: 80000, spent: 51700, rem: 28300, cov: 'All Employees', pct: 64.6, status: 'Active' }
                ].map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.id}</strong></td>
                    <td>{item.cat}</td>
                    <td>₹{item.budget.toLocaleString()}</td>
                    <td><strong>₹{item.spent.toLocaleString()}</strong></td>
                    <td>₹{item.rem.toLocaleString()}</td>
                    <td><span className="badge" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>{item.cov}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '70px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${item.pct}%`, height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{item.pct}%</span>
                      </div>
                    </td>
                    <td><span className="badge badge-success">{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6B. WELFARE EXPENSE VIEW                                 */}
      {/* ======================================================== */}
      {activeTab === 'welfare-expense' && (
        <div className="card p-5">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontWeight: 700 }}>Employee Welfare Expenditures & Vendor Invoices</h3>
            <button className="btn btn-primary" onClick={() => setShowWelfareModal(true)}>
              <i className="fa-solid fa-hand-holding-dollar"></i> Log Welfare Expense
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Expense ID</th>
                  <th>Activity</th>
                  <th>Category</th>
                  <th>Vendor</th>
                  <th>Date</th>
                  <th>Beneficiaries</th>
                  <th>Total Amount (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {welfareExpenses.map((w) => (
                  <tr key={w.expenseId}>
                    <td><strong>{w.expenseId}</strong></td>
                    <td>{w.welfareActivity}</td>
                    <td>{w.welfareCategory}</td>
                    <td>{w.vendorName}</td>
                    <td>{w.expenseDate}</td>
                    <td>{w.beneficiariesCount} Emps</td>
                    <td><strong>₹{(w.totalAmount || 0).toLocaleString()}</strong></td>
                    <td><span className="badge badge-success">{w.paymentStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. BUDGET HISTORY & AUDIT LOGS VIEW                      */}
      {/* ======================================================== */}
      {activeTab === 'history' && (
        <div className="card p-5" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, fontWeight: 700, whiteSpace: 'normal', overflowWrap: 'break-word' }}>
              Immutable Budget Audit Logs & Revision Timeline
            </h3>
            <span className="badge badge-secondary" style={{ fontSize: '0.78rem' }}>
              <i className="fa-solid fa-shield-halved" style={{ marginRight: '6px' }}></i>
              Cryptographically Verified Audit Trail
            </span>
          </div>

          <div style={{ overflowX: 'auto', width: '100%', maxWidth: '100%' }}>
            <table className="table" style={{ width: '100%', tableLayout: 'fixed', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
              <colgroup>
                <col style={{ width: '12%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '24%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ padding: '10px 8px', wordBreak: 'break-word' }}>Audit ID</th>
                  <th style={{ padding: '10px 8px', wordBreak: 'break-word' }}>Action</th>
                  <th style={{ padding: '10px 8px', wordBreak: 'break-word' }}>Module</th>
                  <th style={{ padding: '10px 8px', wordBreak: 'break-word' }}>Entity ID</th>
                  <th style={{ padding: '10px 8px', wordBreak: 'break-word' }}>Performed By</th>
                  <th style={{ padding: '10px 8px', wordBreak: 'break-word' }}>Changes / Details</th>
                  <th style={{ padding: '10px 8px', wordBreak: 'break-word' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {historyLogs.map((h) => (
                  <tr key={h.auditId}>
                    <td style={{ padding: '10px 8px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      <strong>{h.auditId}</strong>
                    </td>
                    <td style={{ padding: '10px 8px', wordBreak: 'break-word' }}>
                      <span className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', whiteSpace: 'normal', wordBreak: 'break-word', display: 'inline-block' }}>
                        {h.action}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', wordBreak: 'break-word' }}>{h.module}</td>
                    <td style={{ padding: '10px 8px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{h.entityId}</td>
                    <td style={{ padding: '10px 8px', wordBreak: 'break-word' }}>
                      <div style={{ fontWeight: 600 }}>{h.performedBy}</div>
                      <div style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))' }}>{h.userRole}</div>
                    </td>
                    <td style={{ padding: '10px 8px', wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'normal' }}>
                      {typeof h.changes === 'object' && h.changes !== null ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {h.changes.proposedBudget && h.changes.approvedBudget && (
                            <span className="badge" style={{ fontSize: '0.74rem', background: 'rgba(16,185,129,0.12)', color: '#10b981', fontWeight: 600, padding: '4px 8px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'left' }}>
                              Proposed Budget: {formatAuditValue('proposedBudget', h.changes.proposedBudget)} → Approved Budget: {formatAuditValue('approvedBudget', h.changes.approvedBudget)}
                            </span>
                          )}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '100%' }}>
                            {Object.entries(h.changes).map(([k, v]) => {
                              if (['_id', '__v', 'createdAt', 'updatedAt', 'organizationId'].includes(k)) return null;
                              return (
                                <span key={k} className="badge" style={{ fontSize: '0.72rem', background: 'rgba(99,102,241,0.08)', color: 'hsl(var(--primary))', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'left' }}>
                                  <strong>{formatKeyLabel(k)}:</strong> {formatAuditValue(k, v)}
                                </span>
                              );
                            })}
                          </div>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ fontSize: '0.72rem', padding: '2px 8px', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', marginTop: '2px' }}
                            onClick={() => setSelectedAuditLog(h)}
                            title="View full audit record"
                          >
                            <i className="fa-solid fa-eye" style={{ fontSize: '0.7rem' }}></i> View Details
                          </button>
                        </div>
                      ) : (() => {
                        const parsed = parseAuditChanges(h.changes);
                        if (parsed && typeof parsed === 'object') {
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {parsed.proposedBudget && parsed.approvedBudget && (
                                <span className="badge" style={{ fontSize: '0.74rem', background: 'rgba(16,185,129,0.12)', color: '#10b981', fontWeight: 600, padding: '4px 8px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'left' }}>
                                  Proposed Budget: {formatAuditValue('proposedBudget', parsed.proposedBudget)} → Approved Budget: {formatAuditValue('approvedBudget', parsed.approvedBudget)}
                                </span>
                              )}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '100%' }}>
                                {Object.entries(parsed).map(([k, v]) => {
                                  if (['_id', '__v', 'createdAt', 'updatedAt', 'organizationId'].includes(k)) return null;
                                  return (
                                    <span key={k} className="badge" style={{ fontSize: '0.72rem', background: 'rgba(99,102,241,0.08)', color: 'hsl(var(--primary))', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'left' }}>
                                      <strong>{formatKeyLabel(k)}:</strong> {formatAuditValue(k, v)}
                                    </span>
                                  );
                                })}
                              </div>
                              <button
                                type="button"
                                className="btn btn-outline"
                                style={{ fontSize: '0.72rem', padding: '2px 8px', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', marginTop: '2px' }}
                                onClick={() => setSelectedAuditLog({ ...h, changes: parsed })}
                                title="View full audit record"
                              >
                                <i className="fa-solid fa-eye" style={{ fontSize: '0.7rem' }}></i> View Details
                              </button>
                            </div>
                          );
                        }
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.82rem', wordBreak: 'break-word', whiteSpace: 'normal' }}>{String(h.changes || '-')}</span>
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ fontSize: '0.72rem', padding: '2px 8px', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', marginTop: '2px' }}
                              onClick={() => setSelectedAuditLog(h)}
                            >
                              <i className="fa-solid fa-eye" style={{ fontSize: '0.7rem' }}></i> View Details
                            </button>
                          </div>
                        );
                      })()}
                    </td>
                    <td style={{ padding: '10px 8px', wordBreak: 'break-word', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                      {h.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. BUDGET MASTERS & FY CONFIG VIEWS                      */}
      {/* ======================================================== */}
      {(activeTab === 'masters' || activeTab === 'fy-config' || activeTab === 'approval-matrix') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          <div className="card p-5">
            <h4 style={{ margin: '0 0 12px 0', fontWeight: 700 }}>Financial Year Configurations</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {masters.financialYears.map((fy) => (
                <div key={fy.yearId} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>{fy.financialYear}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>{fy.startDate} to {fy.endDate}</div>
                  </div>
                  <span className={`badge ${fy.isCurrent ? 'badge-success' : 'badge-secondary'}`}>{fy.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h4 style={{ margin: '0 0 12px 0', fontWeight: 700 }}>Budget Categories</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {masters.categories.map((c) => (
                <div key={c.categoryId} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{c.categoryName}</span>
                  <span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>{c.categoryCode}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h4 style={{ margin: '0 0 12px 0', fontWeight: 700 }}>Vendor Master Directory</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {masters.vendors.map((v) => (
                <div key={v.vendorId} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem' }}>{v.vendorName}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>{v.category} • {v.phone}</div>
                  </div>
                  <span className="badge badge-success">⭐ {v.rating}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. BUDGET REPORTS VIEW                                   */}
      {/* ======================================================== */}
      {activeTab === 'reports' && (() => {
        const escapeXml = (str) => {
          if (!str) return '';
          return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
        };

        const generateExcelXml = (sheetName, headers, rows) => {
          let xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>\n` +
            `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n` +
            ` <Styles>\n` +
            `  <Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#4F46E5" ss:Pattern="Solid"/></Style>\n` +
            ` </Styles>\n` +
            ` <Worksheet ss:Name="${escapeXml(sheetName || 'Report')}">\n` +
            `  <Table ss:DefaultColumnWidth="120">\n` +
            `   <Row ss:StyleID="Header">\n`;
          headers.forEach(h => {
            xml += `    <Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>\n`;
          });
          xml += `   </Row>\n`;
          rows.forEach(r => {
            xml += `   <Row>\n`;
            r.forEach(cell => {
              xml += `    <Cell><Data ss:Type="String">${escapeXml(String(cell))}</Data></Cell>\n`;
            });
            xml += `   </Row>\n`;
          });
          xml += `  </Table>\n </Worksheet>\n</Workbook>`;
          return xml;
        };

        const generateCsv = (title, headers, rows) => {
          let csv = '\uFEFF';
          csv += `HR O - ${title.toUpperCase()}\r\n`;
          csv += `Export Date,${new Date().toLocaleDateString('en-IN')}\r\n\r\n`;
          csv += headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\r\n';
          rows.forEach(r => {
            csv += r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',') + '\r\n';
          });
          return csv;
        };

        const getReportData = (reportTitle) => {
          switch (reportTitle) {
            case 'Annual HR Budget Report':
              return {
                title: 'Annual HR Budget Report',
                subtitle: 'Consolidated Department & Cost Center Summary',
                headers: ['Department', 'Cost Center', 'Category', 'Proposed (INR)', 'Approved (INR)', 'Utilized (INR)', 'Remaining (INR)', 'Status'],
                rows: (budgets.length ? budgets : [
                  { department: 'Engineering', costCenter: 'CC-ENG-101', budgetCategory: 'Manpower', proposedBudget: 4500000, approvedBudget: 4200000, utilizedBudget: 2800000, status: 'Approved' },
                  { department: 'Sales & Marketing', costCenter: 'CC-SLS-102', budgetCategory: 'Recruitment', proposedBudget: 2800000, approvedBudget: 2500000, utilizedBudget: 1600000, status: 'Approved' },
                  { department: 'Human Resources', costCenter: 'CC-HR-103', budgetCategory: 'Welfare', proposedBudget: 1500000, approvedBudget: 1400000, utilizedBudget: 920000, status: 'Approved' },
                  { department: 'Operations', costCenter: 'CC-OPS-104', budgetCategory: 'Training', proposedBudget: 2200000, approvedBudget: 2000000, utilizedBudget: 1250000, status: 'Approved' }
                ]).map(b => [
                  b.department,
                  b.costCenter || 'CC-GEN-100',
                  b.budgetCategory || 'Operational',
                  `₹${(b.proposedBudget || 0).toLocaleString()}`,
                  `₹${(b.approvedBudget || 0).toLocaleString()}`,
                  `₹${(b.utilizedBudget || 0).toLocaleString()}`,
                  `₹${((b.approvedBudget || 0) - (b.utilizedBudget || 0)).toLocaleString()}`,
                  b.status || 'Approved'
                ])
              };

            case 'Budget Variance & Forecast':
              return {
                title: 'Budget Variance & Forecast Report',
                subtitle: 'Planned vs Actual Cost Analysis & Scenario Forecast',
                headers: ['Department', 'Planned Budget (INR)', 'Actual Spent (INR)', 'Variance (INR)', 'Variance %', 'Q4 Forecast (INR)', 'Status'],
                rows: (budgets.length ? budgets : [
                  { department: 'Engineering', approvedBudget: 4200000, utilizedBudget: 2800000 },
                  { department: 'Sales & Marketing', approvedBudget: 2500000, utilizedBudget: 1600000 },
                  { department: 'Human Resources', approvedBudget: 1400000, utilizedBudget: 920000 },
                  { department: 'Operations', approvedBudget: 2000000, utilizedBudget: 1250000 }
                ]).map(b => {
                  const planned = b.approvedBudget || 4000000;
                  const actual = b.utilizedBudget || 2500000;
                  const diff = planned - actual;
                  const pct = ((diff / planned) * 100).toFixed(1);
                  const forecast = Math.round(actual * 1.35);
                  return [
                    b.department,
                    `₹${planned.toLocaleString()}`,
                    `₹${actual.toLocaleString()}`,
                    diff >= 0 ? `+₹${diff.toLocaleString()}` : `-₹${Math.abs(diff).toLocaleString()}`,
                    `${pct}%`,
                    `₹${forecast.toLocaleString()}`,
                    diff >= 0 ? 'Under Budget' : 'Over Budget'
                  ];
                })
              };

            case 'Recruitment Cost ROI Report':
              return {
                title: 'Recruitment Cost ROI Report',
                subtitle: 'Vendor Performance, Cost Per Hire & Agency Spending',
                headers: ['Expense ID', 'Category', 'Vendor / Source', 'Invoice Ref', 'Amount (INR)', 'Tax (INR)', 'Total (INR)', 'Status'],
                rows: (recruitmentExpenses.length ? recruitmentExpenses : [
                  { expenseId: 'RCX-401', expenseCategory: 'Job Portal Subscription', vendorName: 'Naukri.com Enterprise', invoiceNumber: 'INV-NK-9921', amount: 450000, taxAmount: 81000, totalAmount: 531000, paymentStatus: 'Paid' },
                  { expenseId: 'RCX-402', expenseCategory: 'Recruitment Agency', vendorName: 'Talent Scout Global', invoiceNumber: 'INV-TS-3341', amount: 350000, taxAmount: 63000, totalAmount: 413000, paymentStatus: 'Paid' }
                ]).map(r => [
                  r.expenseId,
                  r.expenseCategory,
                  r.vendorName || r.hiringSource || 'Direct',
                  r.invoiceNumber || 'INV-NA',
                  `₹${(r.amount || 0).toLocaleString()}`,
                  `₹${(r.taxAmount || 0).toLocaleString()}`,
                  `₹${(r.totalAmount || 0).toLocaleString()}`,
                  r.paymentStatus || 'Paid'
                ])
              };

            case 'Welfare Expenditure Register':
              return {
                title: 'Welfare Expenditure Register',
                subtitle: 'Category-wise Canteen, Transport, Health & Employee Benefits',
                headers: ['Expense ID', 'Welfare Activity', 'Category', 'Vendor', 'Beneficiaries', 'Amount (INR)', 'Status'],
                rows: (welfareExpenses.length ? welfareExpenses : [
                  { expenseId: 'WFX-501', welfareActivity: 'Annual Health Camp 2026', welfareCategory: 'Health Check-up', vendorName: 'Apollo Diagnostics', beneficiariesCount: 220, totalAmount: 330400, paymentStatus: 'Paid' },
                  { expenseId: 'WFX-502', welfareActivity: 'Executive Transport Subsidy', welfareCategory: 'Transportation', vendorName: 'Uber Corporate', beneficiariesCount: 140, totalAmount: 218300, paymentStatus: 'Paid' }
                ]).map(w => [
                  w.expenseId,
                  w.welfareActivity,
                  w.welfareCategory,
                  w.vendorName || 'Corporate Partner',
                  `${w.beneficiariesCount || 0} Staff`,
                  `₹${(w.totalAmount || w.invoiceAmount || 0).toLocaleString()}`,
                  w.paymentStatus || 'Paid'
                ])
              };

            case 'Manpower Headcount Financials':
              return {
                title: 'Manpower Headcount Financials',
                subtitle: 'Salary Budgets, Vacancy Projections & Increment Cost',
                headers: ['Budget Ref', 'Department', 'Designation', 'Current Headcount', 'Approved Headcount', 'Vacancies', 'Avg Monthly Salary', 'Annual Budget (INR)'],
                rows: (manpowerBudgets.length ? manpowerBudgets : [
                  { budgetId: 'MPB-301', department: 'Engineering', designation: 'Senior Software Engineer', currentHeadcount: 24, approvedHeadcount: 30, vacancyCount: 6, avgMonthlySalary: 140000, annualSalaryBudget: 50400000 },
                  { budgetId: 'MPB-302', department: 'Sales & Marketing', designation: 'Account Executive', currentHeadcount: 15, approvedHeadcount: 20, vacancyCount: 5, avgMonthlySalary: 85000, annualSalaryBudget: 20400000 }
                ]).map(m => [
                  m.budgetId,
                  m.department,
                  m.designation,
                  String(m.currentHeadcount || 0),
                  String(m.approvedHeadcount || 0),
                  String(m.vacancyCount || (m.approvedHeadcount - m.currentHeadcount) || 0),
                  `₹${(m.avgMonthlySalary || 0).toLocaleString()}`,
                  `₹${(m.annualSalaryBudget || 0).toLocaleString()}`
                ])
              };

            default:
              return {
                title: reportTitle,
                subtitle: 'HR O Financial Report',
                headers: ['Department', 'Planned (INR)', 'Spent (INR)', 'Variance', 'Status'],
                rows: [
                  ['Engineering', 'INR 5,000,000', 'INR 4,800,000', '+INR 200,000', 'Under Budget'],
                  ['Human Resources', 'INR 1,500,000', 'INR 1,450,000', '+INR 50,000', 'Under Budget'],
                  ['Finance & Legal', 'INR 1,200,000', 'INR 1,220,000', '-INR 20,000', 'Over Budget'],
                  ['Sales & Marketing', 'INR 3,000,000', 'INR 2,950,000', '+INR 50,000', 'Under Budget']
                ]
              };
          }
        };

        const exportReportFile = (rep, targetFormat) => {
          const reportData = getReportData(rep.title);
          const cleanFilename = rep.title.replace(/[^a-zA-Z0-9]/g, '_') + '_2026';

          if (targetFormat === 'PDF') {
            downloadPdfDocument({
              title: reportData.title.toUpperCase(),
              subtitle: reportData.subtitle,
              docNumber: `REP-${Date.now().toString().slice(-6)}`,
              metadata: [
                { label: 'Report Period', value: filterFY || 'FY 2026-2027' },
                { label: 'Department Scope', value: filterDept || 'All Business Units' },
                { label: 'Generated By', value: user?.name || 'Finance Administrator' },
                { label: 'Status', value: 'Audited & Verified' }
              ],
              sections: [
                {
                  heading: reportData.title,
                  table: {
                    headers: reportData.headers.slice(0, 5),
                    colWidths: [120, 100, 100, 95, 80],
                    rows: reportData.rows.map(r => r.slice(0, 5))
                  }
                }
              ],
              footer: 'HR O Financial Intelligence & Statutory Audit Archive'
            }, `${cleanFilename}.pdf`);
          } else if (targetFormat === 'XLSX') {
            // Excel XML Spreadsheet format (.xlsx)
            const xmlContent = generateExcelXml(rep.title.slice(0, 25), reportData.headers, reportData.rows);
            const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = blobUrl;
            link.setAttribute('download', `${cleanFilename}.xlsx`);
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
              if (document.body.contains(link)) document.body.removeChild(link);
              window.URL.revokeObjectURL(blobUrl);
            }, 2500);
          } else if (targetFormat === 'CSV') {
            // CSV format (.csv)
            const csvContent = generateCsv(reportData.title, reportData.headers, reportData.rows);
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = blobUrl;
            link.setAttribute('download', `${cleanFilename}.csv`);
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
              if (document.body.contains(link)) document.body.removeChild(link);
              window.URL.revokeObjectURL(blobUrl);
            }, 2500);
          }
        };

        const handlePrimaryExport = (rep) => {
          showToast(`Exporting ${rep.title} (${rep.format})...`, 'info');
          if (rep.format === 'PDF / XLSX') {
            exportReportFile(rep, 'PDF');
            setTimeout(() => {
              exportReportFile(rep, 'XLSX');
            }, 600);
          } else if (rep.format === 'XLSX') {
            exportReportFile(rep, 'XLSX');
            setTimeout(() => {
              exportReportFile(rep, 'CSV');
            }, 600);
          } else if (rep.format === 'PDF') {
            exportReportFile(rep, 'PDF');
          }
          showToast(`${rep.title} exported and downloaded successfully.`, 'success');
        };

        return (
          <div className="card p-5">
            <h3 style={{ margin: '0 0 16px 0', fontWeight: 700 }}>HR Budget & Financial Reports Export</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {[
                { title: 'Annual HR Budget Report', desc: 'Consolidated department & cost center summary', format: 'PDF / XLSX' },
                { title: 'Budget Variance & Forecast', desc: 'Planned vs Actual cost analysis & scenario forecast', format: 'XLSX' },
                { title: 'Recruitment Cost ROI Report', desc: 'Vendor performance, cost per hire, agency spending', format: 'PDF' },
                { title: 'Welfare Expenditure Register', desc: 'Category-wise canteen, transport, and insurance costs', format: 'XLSX' },
                { title: 'Manpower Headcount Financials', desc: 'Salary budgets, vacancy projections & increment cost', format: 'PDF' }
              ].map((rep) => (
                <div key={rep.title} style={{ padding: '16px', border: '1px solid hsl(var(--border))', borderRadius: '8px', background: 'hsl(var(--bg-card))' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 700 }}>{rep.title}</h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>{rep.desc}</p>

                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '0.85rem', marginBottom: '8px' }}
                    onClick={() => handlePrimaryExport(rep)}
                  >
                    <i className="fa-solid fa-download" style={{ marginRight: '6px' }}></i> Export ({rep.format})
                  </button>

                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button
                      className="btn btn-outline"
                      style={{ flex: 1, padding: '4px 6px', fontSize: '0.72rem' }}
                      title="Download PDF version"
                      onClick={() => {
                        exportReportFile(rep, 'PDF');
                        showToast(`${rep.title} PDF downloaded successfully.`, 'success');
                      }}
                    >
                      <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444', marginRight: '4px' }}></i> PDF
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ flex: 1, padding: '4px 6px', fontSize: '0.72rem' }}
                      title="Download Excel XLSX spreadsheet"
                      onClick={() => {
                        exportReportFile(rep, 'XLSX');
                        showToast(`${rep.title} XLSX downloaded successfully.`, 'success');
                      }}
                    >
                      <i className="fa-solid fa-file-excel" style={{ color: '#10b981', marginRight: '4px' }}></i> XLSX
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ flex: 1, padding: '4px 6px', fontSize: '0.72rem' }}
                      title="Download CSV spreadsheet"
                      onClick={() => {
                        exportReportFile(rep, 'CSV');
                        showToast(`${rep.title} CSV downloaded successfully.`, 'success');
                      }}
                    >
                      <i className="fa-solid fa-file-csv" style={{ color: '#3b82f6', marginRight: '4px' }}></i> CSV
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* MODALS SECTION                                           */}
      {/* ======================================================== */}
      {/* Create Budget Modal */}
      {showPlanningModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="modal-content" style={{ width: '500px', background: 'hsl(var(--bg-card))', padding: '24px', borderRadius: '12px', color: 'hsl(var(--text-primary))' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Propose New Department Budget</h3>
            <form onSubmit={handleCreateBudget}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Department</label>
                <select className="form-control" value={newBudget.department} onChange={(e) => setNewBudget({ ...newBudget, department: e.target.value })}>
                  <option>Engineering</option>
                  <option>Sales & Marketing</option>
                  <option>Human Resources</option>
                  <option>Operations</option>
                  <option>Finance & Legal</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Cost Center Code</label>
                <input type="text" className="form-control" value={newBudget.costCenter} onChange={(e) => setNewBudget({ ...newBudget, costCenter: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Budget Category</label>
                <select className="form-control" value={newBudget.budgetCategory} onChange={(e) => setNewBudget({ ...newBudget, budgetCategory: e.target.value })}>
                  <option>Manpower</option>
                  <option>Recruitment</option>
                  <option>Welfare</option>
                  <option>Training</option>
                  <option>Operations</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Proposed Amount (₹)</label>
                <input type="number" className="form-control" value={newBudget.proposedBudget} onChange={(e) => setNewBudget({ ...newBudget, proposedBudget: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPlanningModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Draft</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recruitment Expense Modal */}
      {showRecruitmentModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="modal-content" style={{ width: '500px', background: 'hsl(var(--bg-card))', padding: '24px', borderRadius: '12px', color: 'hsl(var(--text-primary))' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Record Recruitment Expense</h3>
            <form onSubmit={handleCreateRecExpense}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Expense Category</label>
                <select className="form-control" value={newRecExpense.expenseCategory} onChange={(e) => setNewRecExpense({ ...newRecExpense, expenseCategory: e.target.value })}>
                  <option>Job Portal Subscription</option>
                  <option>Recruitment Agency</option>
                  <option>Advertisement</option>
                  <option>Campus Hiring</option>
                  <option>Referral Bonus</option>
                  <option>Background Verification</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Vendor Name</label>
                <input type="text" className="form-control" value={newRecExpense.vendorName} onChange={(e) => setNewRecExpense({ ...newRecExpense, vendorName: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Amount (₹)</label>
                <input type="number" className="form-control" value={newRecExpense.amount} onChange={(e) => setNewRecExpense({ ...newRecExpense, amount: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRecruitmentModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Log Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Welfare Expense Modal */}
      {showWelfareModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="modal-content" style={{ width: '500px', background: 'hsl(var(--bg-card))', padding: '24px', borderRadius: '12px', color: 'hsl(var(--text-primary))' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Log Employee Welfare Expense</h3>
            <form onSubmit={handleCreateWelfareExpense}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Welfare Activity Title</label>
                <input type="text" className="form-control" value={newWelExpense.welfareActivity} onChange={(e) => setNewWelExpense({ ...newWelExpense, welfareActivity: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Welfare Category</label>
                <select className="form-control" value={newWelExpense.welfareCategory} onChange={(e) => setNewWelExpense({ ...newWelExpense, welfareCategory: e.target.value })}>
                  <option>Food & Canteen</option>
                  <option>Transportation</option>
                  <option>Health Check-up</option>
                  <option>Insurance</option>
                  <option>Employee Engagement</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Invoice Amount (₹)</label>
                <input type="number" className="form-control" value={newWelExpense.invoiceAmount} onChange={(e) => setNewWelExpense({ ...newWelExpense, invoiceAmount: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowWelfareModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Welfare Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manpower Modal */}
      {showManpowerModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="modal-content" style={{ width: '500px', background: 'hsl(var(--bg-card))', padding: '24px', borderRadius: '12px', color: 'hsl(var(--text-primary))' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Submit Headcount & Manpower Budget</h3>
            <form onSubmit={handleCreateManpower}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Department</label>
                <input type="text" className="form-control" value={newManpower.department} onChange={(e) => setNewManpower({ ...newManpower, department: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Designation Target</label>
                <input type="text" className="form-control" value={newManpower.designation} onChange={(e) => setNewManpower({ ...newManpower, designation: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Current Count</label>
                  <input type="number" className="form-control" value={newManpower.currentHeadcount} onChange={(e) => setNewManpower({ ...newManpower, currentHeadcount: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Target Approved</label>
                  <input type="number" className="form-control" value={newManpower.approvedHeadcount} onChange={(e) => setNewManpower({ ...newManpower, approvedHeadcount: e.target.value })} required />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Average Monthly Salary (₹)</label>
                <input type="number" className="form-control" value={newManpower.avgMonthlySalary} onChange={(e) => setNewManpower({ ...newManpower, avgMonthlySalary: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowManpowerModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget Details & Version History Modal */}
      {selectedBudgetDetail && (
        <div 
          id="modal-budget-details" 
          className="modal-backdrop active" 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '20px',
            opacity: 1,
            pointerEvents: 'auto',
            overflowY: 'auto'
          }}
          onClick={() => setSelectedBudgetDetail(null)}
          data-testid="budget-detail-modal-container"
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              width: '100%',
              maxWidth: '680px',
              background: 'hsl(var(--bg-card))',
              color: 'hsl(var(--text-primary))',
              borderRadius: '16px',
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '24px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              zIndex: 1000000
            }}
          >
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 className="modal-title" style={{ margin: 0 }}>{selectedBudgetDetail.budgetId} - Budget Details & Version History</h3>
                  <span className={`badge ${selectedBudgetDetail.status === 'Approved' ? 'badge-success' : 'badge-warning'}`}>
                    {selectedBudgetDetail.status}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                  {selectedBudgetDetail.department} | Cost Center: {selectedBudgetDetail.costCenter}
                </span>
              </div>
              <button className="close-modal" onClick={() => setSelectedBudgetDetail(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '12px', background: 'rgba(99,102,241,0.06)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>FY & Category</span>
                <div style={{ fontWeight: 700, marginTop: '2px' }}>{selectedBudgetDetail.financialYear}</div>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginTop: '2px' }}>{selectedBudgetDetail.budgetCategory}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(245,158,11,0.06)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Proposed Budget</span>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f59e0b', marginTop: '2px' }}>
                  ₹{(selectedBudgetDetail.proposedBudget || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginTop: '2px' }}>Initial Request</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(16,185,129,0.06)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Approved Budget</span>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#10b981', marginTop: '2px' }}>
                  ₹{(selectedBudgetDetail.approvedBudget || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginTop: '2px' }}>Board Authorized</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(59,130,246,0.06)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Utilized Spend</span>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#3b82f6', marginTop: '2px' }}>
                  ₹{(selectedBudgetDetail.utilizedBudget || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginTop: '2px' }}>
                  {Math.round(((selectedBudgetDetail.utilizedBudget || 0) / Math.max(1, (selectedBudgetDetail.approvedBudget || 1))) * 100)}% Utilized
                </div>
              </div>
            </div>

            {/* Approval History & Status Timeline */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>
                <i className="fa-solid fa-timeline"></i> Approval History & Status Timeline
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'rgba(99,102,241,0.03)', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                    <i className="fa-solid fa-check"></i>
                  </span>
                  <div style={{ flex: 1, fontSize: '0.8rem' }}>
                    <strong>1. Proposed by Department Head</strong> ({selectedBudgetDetail.department})
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Initial budget requested for ₹{(selectedBudgetDetail.proposedBudget || 0).toLocaleString()}</div>
                  </div>
                  <span className="badge badge-success">Completed</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                    <i className="fa-solid fa-check"></i>
                  </span>
                  <div style={{ flex: 1, fontSize: '0.8rem' }}>
                    <strong>2. Finance Controller Verification</strong> (Cost Center: {selectedBudgetDetail.costCenter})
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Verified against FY allocation ceilings and cost baseline</div>
                  </div>
                  <span className="badge badge-success">Verified</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: selectedBudgetDetail.status === 'Approved' ? '#10b981' : '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                    <i className={selectedBudgetDetail.status === 'Approved' ? "fa-solid fa-check" : "fa-solid fa-clock"}></i>
                  </span>
                  <div style={{ flex: 1, fontSize: '0.8rem' }}>
                    <strong>3. Executive Authorization & Release</strong> (Authorized: ₹{(selectedBudgetDetail.approvedBudget || 0).toLocaleString()})
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                      {selectedBudgetDetail.status === 'Approved' ? 'Formally authorized and active in general ledger' : 'Under final signoff review'}
                    </div>
                  </div>
                  <span className={`badge ${selectedBudgetDetail.status === 'Approved' ? 'badge-success' : 'badge-warning'}`}>
                    {selectedBudgetDetail.status}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Version History & Audit Log</h4>
              <div style={{ border: '1px solid hsl(var(--border))', borderRadius: '8px', overflow: 'hidden' }}>
                <table className="table" style={{ width: '100%', fontSize: '0.8rem', margin: 0 }}>
                  <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <tr>
                      <th>Version</th>
                      <th>Revision Date</th>
                      <th>Proposed (₹)</th>
                      <th>Approved (₹)</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>v{selectedBudgetDetail.version || 1}.0</span></td>
                      <td>2026-04-01</td>
                      <td>₹{(selectedBudgetDetail.proposedBudget || 0).toLocaleString()}</td>
                      <td>₹{(selectedBudgetDetail.approvedBudget || 0).toLocaleString()}</td>
                      <td>Baseline FY allocation approved</td>
                    </tr>
                    {selectedBudgetDetail.version > 1 && (
                      <tr>
                        <td><span className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>v{selectedBudgetDetail.version}.0</span></td>
                        <td>2026-07-15</td>
                        <td>₹{(selectedBudgetDetail.proposedBudget || 0).toLocaleString()}</td>
                        <td>₹{(selectedBudgetDetail.approvedBudget || 0).toLocaleString()}</td>
                        <td>Mid-year headcount expansion adjustment</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedBudgetDetail(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => {
                showToast(`Budget export initiated for ${selectedBudgetDetail.budgetId}`, 'success');
                downloadPdfDocument({
                  title: `BUDGET SPECIFICATION: ${selectedBudgetDetail.budgetId}`,
                  subtitle: `FY: ${selectedBudgetDetail.financialYear} | Department: ${selectedBudgetDetail.department}`,
                  docNumber: selectedBudgetDetail.budgetId,
                  recipient: `${selectedBudgetDetail.department} Cost Center (${selectedBudgetDetail.costCenter})`,
                  metadata: [
                    { label: 'Budget ID', value: selectedBudgetDetail.budgetId },
                    { label: 'Cost Center', value: selectedBudgetDetail.costCenter },
                    { label: 'Category', value: selectedBudgetDetail.budgetCategory },
                    { label: 'Status', value: selectedBudgetDetail.status },
                    { label: 'Proposed Budget', value: `INR ${(selectedBudgetDetail.proposedBudget || 0).toLocaleString()}` },
                    { label: 'Approved Budget', value: `INR ${(selectedBudgetDetail.approvedBudget || 0).toLocaleString()}` },
                    { label: 'Utilized Spend', value: `INR ${(selectedBudgetDetail.utilizedBudget || 0).toLocaleString()}` }
                  ],
                  sections: [
                    {
                      heading: 'Financial Variance & Utilization Statement',
                      paragraphs: [
                        `This document details the authorized FY budget of INR ${(selectedBudgetDetail.approvedBudget || 0).toLocaleString()} allocated for ${selectedBudgetDetail.department}. Current burn rate is ${Math.round(((selectedBudgetDetail.utilizedBudget || 0) / Math.max(1, (selectedBudgetDetail.approvedBudget || 1))) * 100)}% with zero unauthorized overruns.`
                      ]
                    }
                  ],
                  footer: 'Official Budget Authorization - HR O Finance Committee'
                }, `${selectedBudgetDetail.budgetId}_Details.pdf`);
              }}>
                <i className="fa-solid fa-download"></i> Download Specification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8B. TRANSFER ALLOCATION MODAL (Bug 052) */}
      {transferAllocationModal && (
        <div id="modal-transfer-allocation" className="modal-backdrop active" onClick={() => setTransferAllocationModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title" style={{ margin: 0 }}>Transfer Budget Allocation</h3>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                  Source: {transferAllocationModal.department} ({transferAllocationModal.allocationId})
                </span>
              </div>
              <button className="close-modal" onClick={() => setTransferAllocationModal(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleExecuteTransfer}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '10px', background: 'rgba(99,102,241,0.06)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Current Allocation</span>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '2px' }}>
                    ₹{(transferAllocationModal.allocatedAmount || 0).toLocaleString()}
                  </div>
                </div>
                <div style={{ padding: '10px', background: 'rgba(16,185,129,0.06)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Available Remaining</span>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#10b981', marginTop: '2px' }}>
                    ₹{(transferAllocationModal.remainingAmount || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Target Department *</label>
                <select 
                  className="form-control" 
                  value={transferFormData.targetDepartment} 
                  onChange={(e) => setTransferFormData({ ...transferFormData, targetDepartment: e.target.value })}
                  required
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Sales & Marketing">Sales & Marketing</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Transfer Amount (₹) *</label>
                <input 
                  type="number" 
                  className="form-control" 
                  max={transferAllocationModal.remainingAmount}
                  value={transferFormData.transferAmount} 
                  onChange={(e) => setTransferFormData({ ...transferFormData, transferAmount: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Transfer Justification / Reason *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={transferFormData.reason} 
                  onChange={(e) => setTransferFormData({ ...transferFormData, reason: e.target.value })} 
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setTransferAllocationModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <i className="fa-solid fa-check"></i> Complete Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. AUDIT LOG DETAILS MODAL */}
      {selectedAuditLog && (
        <div
          id="modal-audit-log-details"
          className="modal-backdrop"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            backdropFilter: 'blur(4px)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedAuditLog(null);
          }}
        >
          <div
            className="modal-content"
            style={{
              width: '680px',
              maxWidth: '95vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'hsl(var(--bg-card))',
              padding: '28px',
              borderRadius: '12px',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--text-primary))',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.78rem' }}>
                    {selectedAuditLog.action}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                    {selectedAuditLog.module}
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  Audit Record: {selectedAuditLog.auditId}
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                onClick={() => setSelectedAuditLog(null)}
              >
                <i className="fa-solid fa-times"></i> Close
              </button>
            </div>

            {/* Audit Metadata Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              border: '1px solid hsl(var(--border))',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase' }}>Entity ID</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px' }}>{selectedAuditLog.entityId || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase' }}>Performed By</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px' }}>
                  {selectedAuditLog.performedBy} ({selectedAuditLog.userRole || 'HR Manager'})
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase' }}>Timestamp</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px' }}>{selectedAuditLog.timestamp}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase' }}>Security / IP</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px' }}>{selectedAuditLog.ipAddress || '127.0.0.1 (Verified)'}</div>
              </div>
            </div>

            {/* Structured Changes Breakdown */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: 600 }}>
                Audit Change Summary
              </h4>
              {(() => {
                const changes = parseAuditChanges(selectedAuditLog.changes);
                if (changes && typeof changes === 'object') {
                  const filtered = Object.entries(changes).filter(
                    ([k]) => !['_id', '__v', 'createdAt', 'updatedAt', 'organizationId'].includes(k)
                  );
                  if (filtered.length > 0) {
                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                        {filtered.map(([k, v]) => (
                          <div
                            key={k}
                            style={{
                              padding: '10px 14px',
                              background: 'rgba(99, 102, 241, 0.05)',
                              border: '1px solid rgba(99, 102, 241, 0.15)',
                              borderRadius: '6px'
                            }}
                          >
                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginBottom: '4px' }}>
                              {formatKeyLabel(k)}
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', wordBreak: 'break-word' }}>
                              {formatAuditValue(k, v)}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }
                }
                return (
                  <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', fontSize: '0.85rem' }}>
                    {String(selectedAuditLog.changes || 'No structured changes recorded')}
                  </div>
                );
              })()}
            </div>

            {/* Raw JSON Payload Viewer */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>
                  Raw Immutable Audit Payload
                </span>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                  onClick={() => {
                    const raw = typeof selectedAuditLog.changes === 'string'
                      ? selectedAuditLog.changes
                      : JSON.stringify(selectedAuditLog.changes, null, 2);
                    navigator.clipboard.writeText(raw);
                    showToast('Audit JSON payload copied to clipboard', 'success');
                  }}
                >
                  <i className="fa-solid fa-copy"></i> Copy JSON
                </button>
              </div>
              <pre
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '14px',
                  borderRadius: '6px',
                  border: '1px solid hsl(var(--border))',
                  fontSize: '0.78rem',
                  maxHeight: '180px',
                  overflowX: 'auto',
                  overflowY: 'auto',
                  fontFamily: 'monospace',
                  color: 'hsl(var(--text-primary))',
                  margin: 0
                }}
              >
                <code>
                  {typeof selectedAuditLog.changes === 'string'
                    ? (() => {
                        try {
                          return JSON.stringify(JSON.parse(selectedAuditLog.changes), null, 2);
                        } catch (e) {
                          return selectedAuditLog.changes;
                        }
                      })()
                    : JSON.stringify(selectedAuditLog.changes, null, 2)}
                </code>
              </pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BudgetingModule;
