import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
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
    { auditId: 'AUD-901', action: 'BUDGET_APPROVED', module: 'HR Budgeting', entityId: 'BDG-1001', performedBy: 'Finance Manager', userRole: 'Finance Manager', changes: 'Approved budget of ₹4,200,000 for Engineering', timestamp: '2026-08-01 10:30 AM' },
    { auditId: 'AUD-902', action: 'ALLOCATION_TRANSFERRED', module: 'HR Budgeting', entityId: 'ALLOC-202', performedBy: 'HR Director', userRole: 'HR Manager', changes: 'Transferred ₹150,000 from Operations to Sales Recruitment', timestamp: '2026-08-10 02:15 PM' }
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

  // Modal States
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [showRecruitmentModal, setShowRecruitmentModal] = useState(false);
  const [showWelfareModal, setShowWelfareModal] = useState(false);
  const [showManpowerModal, setShowManpowerModal] = useState(false);

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
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setHistoryLogs(res.data);
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
                  <tr key={b.budgetId}>
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
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => showToast(`Version ${b.version} selected`, 'info')}>
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
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => showToast('Transfer allocation request initiated', 'info')}>
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
      {/* 4. MANPOWER BUDGET & WORKFORCE PLANNING VIEWS            */}
      {/* ======================================================== */}
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
      {/* 6. WELFARE EXPENSE & WELFARE BUDGET VIEWS                */}
      {/* ======================================================== */}
      {(activeTab === 'welfare-expense' || activeTab === 'welfare-budget') && (
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
        <div className="card p-5">
          <h3 style={{ margin: '0 0 16px 0', fontWeight: 700 }}>Immutable Budget Audit Logs & Revision Timeline</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Audit ID</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Entity ID</th>
                  <th>Performed By</th>
                  <th>Changes / Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {historyLogs.map((h) => (
                  <tr key={h.auditId}>
                    <td><strong>{h.auditId}</strong></td>
                    <td><span className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>{h.action}</span></td>
                    <td>{h.module}</td>
                    <td>{h.entityId}</td>
                    <td>{h.performedBy} ({h.userRole})</td>
                    <td>{h.changes}</td>
                    <td>{h.timestamp}</td>
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
      {activeTab === 'reports' && (
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
                <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem' }} onClick={() => showToast(`Generating ${rep.title}...`, 'success')}>
                  <i className="fa-solid fa-download" style={{ marginRight: '6px' }}></i> Export ({rep.format})
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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

    </div>
  );
};

export default BudgetingModule;
