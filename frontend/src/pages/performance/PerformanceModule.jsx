import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../api';

const PerformanceModule = ({ searchQuery = '' }) => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();

  // Active Submodule Tab State
  const [activeTab, setActiveTab] = useState('dashboard'); 
  // 'dashboard', 'cycles', 'framework', 'kras-kpis', 'mid-year', 'annual-review', 'promotions', 'increments', 'pip', 'reports', 'audit'

  // Current Role Filter for RBAC testing
  const [selectedRole, setSelectedRole] = useState(user?.role || 'hr_admin');

  // Search & Filter States
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [cycles, setCycles] = useState([]);
  const [ratingScales, setRatingScales] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [kras, setKras] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [goals, setGoals] = useState([]);
  const [midYearReviews, setMidYearReviews] = useState([]);
  const [annualReviews, setAnnualReviews] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [increments, setIncrements] = useState([]);
  const [pips, setPips] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showGoalProgressModal, setShowGoalProgressModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const [showMidYearModal, setShowMidYearModal] = useState(false);
  const [selectedMidYear, setSelectedMidYear] = useState(null);

  const [showAnnualModal, setShowAnnualModal] = useState(false);
  const [selectedAnnual, setSelectedAnnual] = useState(null);

  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [selectedAnnualForCalib, setSelectedAnnualForCalib] = useState(null);

  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showIncModal, setShowIncModal] = useState(false);

  const [showPipModal, setShowPipModal] = useState(false);
  const [showPipReviewModal, setShowPipReviewModal] = useState(false);
  const [selectedPip, setSelectedPip] = useState(null);

  // Chart References
  const distChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const deptChartRef = useRef(null);
  const chartInstances = useRef({});

  // Cycle Form State
  const [cycleForm, setCycleForm] = useState({
    cycleName: 'Annual Performance Appraisal FY 2026-27',
    cycleType: 'Annual',
    financialYear: 'FY 2026-2027',
    reviewPeriod: 'Apr 2026 - Mar 2027',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    department: 'All Departments'
  });

  // Goal Form State
  const [goalForm, setGoalForm] = useState({
    employeeId: 'EMP-1002',
    employeeName: 'Akhil Sirivella',
    department: 'Human Resources',
    designation: 'HR Manager',
    kraName: 'HRMS Performance & Appraisal Module Deployment',
    target: 'Deploy Module 6 with 100% test coverage',
    weightage: 40,
    priority: 'Critical',
    startDate: '2026-04-01',
    endDate: '2027-03-31'
  });

  // Mid-Year Review Form State
  const [midYearForm, setMidYearForm] = useState({
    employeeId: 'EMP-1002',
    employeeName: 'Akhil Sirivella',
    department: 'Human Resources',
    designation: 'HR Manager',
    selfGoalAchievement: 'Delivered ATS and Core HR ahead of schedule.',
    keyAchievements: 'Built automated approval stepper workflows.',
    majorChallenges: 'Cross-functional dependencies.',
    developmentNeeds: 'Financial Strategy Masterclass'
  });

  // Annual Assessment Form State
  const [annualAssessmentForm, setAnnualAssessmentForm] = useState({
    managerKraScore: 90,
    managerKpiScore: 90,
    managerCompetencyScore: 95,
    managerBehaviourScore: 90,
    strengths: 'Technical leadership, rapid execution.',
    improvementAreas: 'Strategic long-term budgeting.',
    recommendedAction: 'Promotion & Increment'
  });

  // Promotion Form State
  const [promoForm, setPromoForm] = useState({
    employeeId: 'EMP-1002',
    employeeName: 'Akhil Sirivella',
    currentDepartment: 'Human Resources',
    currentDesignation: 'HR Manager',
    currentGrade: 'Grade C',
    proposedDesignation: 'Senior HR Director',
    proposedGrade: 'Grade D',
    effectiveDate: '2026-09-01',
    justification: 'Exceeded performance goals with 5.0 Rating in Annual Review.'
  });

  // Increment Form State
  const [incForm, setIncForm] = useState({
    employeeId: 'EMP-1002',
    employeeName: 'Akhil Sirivella',
    currentDepartment: 'Human Resources',
    currentDesignation: 'HR Manager',
    currentGrade: 'Grade C',
    currentCtc: 1800000,
    incrementPercentage: 15,
    effectiveDate: '2026-09-01',
    reason: 'Outstanding Performance Rating (5.0)'
  });

  // PIP Form State
  const [pipForm, setPipForm] = useState({
    employeeId: 'EMP-1009',
    employeeName: 'Rohan Das',
    department: 'Sales & Marketing',
    designation: 'Sales Executive',
    startDate: '2026-07-01',
    endDate: '2026-08-31',
    durationDays: 60,
    performanceGap: 'Lead conversion rate 45% below quota target.',
    expectedPerformance: 'Achieve minimum 85% lead conversion quota.',
    actionPlan: 'Weekly sales coaching and daily pipeline CRM updates.'
  });

  // Load Module Data
  const fetchAllPerformanceData = async () => {
    setLoading(true);
    try {
      const [dashRes, cycRes, rsRes, compRes, tempRes, kraRes, kpiRes, goalRes, midRes, annRes, prmRes, incRes, pipRes, auditRes] = await Promise.all([
        api.get('/performance/dashboard').catch(() => ({ data: null })),
        api.get('/performance/cycles').catch(() => ({ data: [] })),
        api.get('/performance/rating-scales').catch(() => ({ data: [] })),
        api.get('/performance/competencies').catch(() => ({ data: [] })),
        api.get('/performance/templates').catch(() => ({ data: [] })),
        api.get('/performance/kras').catch(() => ({ data: [] })),
        api.get('/performance/kpis').catch(() => ({ data: [] })),
        api.get('/performance/goals').catch(() => ({ data: [] })),
        api.get('/performance/mid-year-reviews').catch(() => ({ data: [] })),
        api.get('/performance/annual-reviews').catch(() => ({ data: [] })),
        api.get('/performance/promotions').catch(() => ({ data: [] })),
        api.get('/performance/increments').catch(() => ({ data: [] })),
        api.get('/performance/pip').catch(() => ({ data: [] })),
        api.get('/performance/audit-logs').catch(() => ({ data: [] }))
      ]);

      setDashboardData(dashRes.data);
      setCycles(cycRes.data || []);
      setRatingScales(rsRes.data || []);
      setCompetencies(compRes.data || []);
      setTemplates(tempRes.data || []);
      setKras(kraRes.data || []);
      setKpis(kpiRes.data || []);
      setGoals(goalRes.data || []);
      setMidYearReviews(midRes.data || []);
      setAnnualReviews(annRes.data || []);
      setPromotions(prmRes.data || []);
      setIncrements(incRes.data || []);
      setPips(pipRes.data || []);
      setAuditLogs(auditRes.data || []);
    } catch (err) {
      console.error('Error fetching performance data', err);
      showToast('Loaded local performance workspace data', 'info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPerformanceData();
  }, []);

  // Initialize Dashboard Charts
  useEffect(() => {
    if (activeTab !== 'dashboard' || !window.Chart) return;

    Object.keys(chartInstances.current).forEach(key => {
      if (chartInstances.current[key]) chartInstances.current[key].destroy();
    });

    // 1. Rating Distribution Chart
    const ctxDist = distChartRef.current?.getContext('2d');
    if (ctxDist) {
      chartInstances.current.dist = new window.Chart(ctxDist, {
        type: 'doughnut',
        data: {
          labels: ['Outstanding (5.0)', 'Exceeds (4.0-4.9)', 'Meets (3.0-3.9)', 'Needs Imp (2.0-2.9)', 'Unsatisfactory (<2.0)'],
          datasets: [{
            data: [5, 12, 8, 2, 1],
            backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // 2. Department Average Score Chart
    const ctxDept = deptChartRef.current?.getContext('2d');
    if (ctxDept) {
      chartInstances.current.dept = new window.Chart(ctxDept, {
        type: 'bar',
        data: {
          labels: ['Engineering', 'HR', 'Finance', 'Marketing', 'Design'],
          datasets: [{
            label: 'Avg Performance Score (%)',
            data: [88, 85, 84, 87, 90],
            backgroundColor: 'hsl(230, 80%, 55%)',
            borderRadius: 6
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 50, max: 100 } } }
      });
    }

    // 3. Increment Trend Chart
    const ctxTrend = trendChartRef.current?.getContext('2d');
    if (ctxTrend) {
      chartInstances.current.trend = new window.Chart(ctxTrend, {
        type: 'line',
        data: {
          labels: ['2023', '2024', '2025', '2026'],
          datasets: [{
            label: 'Avg Increment %',
            data: [9.5, 10.2, 11.0, 12.5],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            fill: true,
            tension: 0.3
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }, [activeTab]);

  // Handlers
  const handleCreateCycle = async (e) => {
    e.preventDefault();
    try {
      await api.post('/performance/cycles', cycleForm);
      showToast('Appraisal Cycle configured successfully.', 'success');
      setShowCycleModal(false);
      fetchAllPerformanceData();
    } catch (err) {
      showToast('Error configuring appraisal cycle', 'error');
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await api.post('/performance/goals', { ...goalForm, appraisalCycleId: cycles[0]?._id || '60c72b2f9b1d8b2a3c9e0001' });
      showToast('Employee Goal assigned successfully.', 'success');
      setShowGoalModal(false);
      fetchAllPerformanceData();
    } catch (err) {
      showToast('Error assigning goal', 'error');
    }
  };

  const handleUpdateGoalProgressSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGoal) return;
    const achievementPct = Number(e.target.achievementPct.value);
    const goalStatus = e.target.goalStatus.value;
    const employeeComments = e.target.employeeComments.value;
    try {
      await api.put(`/performance/goals/${selectedGoal._id}/progress`, {
        achievementPct,
        achievementValue: `${achievementPct}%`,
        goalStatus,
        employeeComments
      });
      showToast('Goal progress updated.', 'success');
      setShowGoalProgressModal(false);
      setSelectedGoal(null);
      fetchAllPerformanceData();
    } catch (err) {
      showToast('Error updating goal progress', 'error');
    }
  };

  const handleCreateMidYearReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/performance/mid-year-reviews', { ...midYearForm, appraisalCycleId: cycles[0]?._id || '60c72b2f9b1d8b2a3c9e0001' });
      showToast('Mid-Year Self Review submitted.', 'success');
      setShowMidYearModal(false);
      fetchAllPerformanceData();
    } catch (err) {
      showToast('Error submitting mid-year review', 'error');
    }
  };

  const handleSaveManagerAssessment = async (e) => {
    e.preventDefault();
    if (!selectedAnnual) return;
    try {
      await api.put(`/performance/annual-reviews/${selectedAnnual._id}/manager-assessment`, annualAssessmentForm);
      showToast('Manager evaluation saved. Score & Rating calculated.', 'success');
      setShowAnnualModal(false);
      setSelectedAnnual(null);
      fetchAllPerformanceData();
    } catch (err) {
      showToast('Error saving manager assessment', 'error');
    }
  };

  const handleCalibrateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAnnualForCalib) return;
    const finalRating = Number(e.target.finalRating.value);
    const performanceCategory = e.target.performanceCategory.value;
    const calibrationRemarks = e.target.calibrationRemarks.value;
    try {
      await api.put(`/performance/annual-reviews/${selectedAnnualForCalib._id}/calibrate`, {
        finalRating,
        performanceCategory,
        calibrationRemarks
      });
      showToast('Calibration rating saved.', 'success');
      setShowCalibrationModal(false);
      setSelectedAnnualForCalib(null);
      fetchAllPerformanceData();
    } catch (err) {
      showToast('Error calibrating rating', 'error');
    }
  };

  const handleAcknowledgeAnnual = async (id) => {
    try {
      await api.put(`/performance/annual-reviews/${id}/acknowledge`, { comments: 'Acknowledged performance rating and feedback.' });
      showToast('Appraisal rating acknowledged.', 'success');
      fetchAllPerformanceData();
    } catch (err) {
      showToast('Error acknowledging rating', 'error');
    }
  };

  const handleCreatePromotion = async (e) => {
    e.preventDefault();
    try {
      await api.post('/performance/promotions', promoForm);
      showToast('Promotion recommendation submitted.', 'success');
      setShowPromoModal(false);
      fetchAllPerformanceData();
    } catch (err) {
      showToast('Error submitting promotion recommendation', 'error');
    }
  };

  const handleApprovePromotionSubmit = async (id, status) => {
    try {
      await api.put(`/performance/promotions/${id}/approve`, { status, comments: 'Approved via HRMS Governance' });
      showToast(`Promotion ${status.toLowerCase()}! Employee Master synced.`, 'success');
      fetchAllPerformanceData();
    } catch (err) {
      showToast('Error processing promotion approval', 'error');
    }
  };

  const handleCreateIncrement = async (e) => {
    e.preventDefault();
    const current = Number(incForm.currentCtc);
    const pct = Number(incForm.incrementPercentage);
    const incAmt = Math.round((current * pct) / 100);
    const revCtc = current + incAmt;
    try {
      await api.post('/performance/increments', {
        ...incForm,
        incrementAmount: incAmt,
        revisedCtc: revCtc,
        revisedGross: Math.round(revCtc * 0.75),
        revisedBasic: Math.round(revCtc * 0.50)
      });
      showToast('Increment recommendation submitted.', 'success');
      setShowIncModal(false);
      fetchAllPerformanceData();
    } catch (err) {
      showToast('Error submitting increment recommendation', 'error');
    }
  };

  const handleApproveIncrementSubmit = async (id, status) => {
    try {
      await api.put(`/performance/increments/${id}/approve`, { status, comments: 'Finance & Payroll validated' });
      showToast(`Increment status updated to ${status}. Payroll integrated.`, 'success');
      fetchAllPerformanceData();
    } catch (err) {
      showToast('Error approving increment', 'error');
    }
  };

  const handleCreatePip = async (e) => {
    e.preventDefault();
    try {
      await api.post('/performance/pip', {
        ...pipForm,
        objectives: [
          { objectiveName: 'Primary Performance Quota Target', target: pipForm.expectedPerformance, weightage: 50, achievementPct: 0, dueDate: pipForm.endDate },
          { objectiveName: 'Daily Operational Compliance', target: '100% Compliance', weightage: 50, achievementPct: 0, dueDate: pipForm.endDate }
        ]
      });
      showToast('PIP initiated for employee.', 'success');
      setShowPipModal(false);
      fetchAllPerformanceData();
    } catch (err) {
      showToast('Error creating PIP', 'error');
    }
  };

  const handleAddPipReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPip) return;
    const managerFeedback = e.target.managerFeedback.value;
    const rating = e.target.rating.value;
    const outcome = e.target.outcome.value;
    try {
      await api.put(`/performance/pip/${selectedPip._id}/review`, {
        managerFeedback,
        rating,
        outcome
      });
      showToast('PIP review log saved.', 'success');
      setShowPipReviewModal(false);
      setSelectedPip(null);
      fetchAllPerformanceData();
    } catch (err) {
      showToast('Error logging PIP review', 'error');
    }
  };

  // Export CSV helper
  const handleExportCSV = (reportName, dataArray) => {
    if (!dataArray || dataArray.length === 0) {
      showToast('No records to export.', 'warning');
      return;
    }
    const headers = Object.keys(dataArray[0]).join(',');
    const rows = dataArray.map(obj => Object.values(obj).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${reportName}.csv successfully.`, 'success');
  };

  // RBAC permissions helper
  const isAllowed = (action) => {
    if (selectedRole === 'super_admin' || selectedRole === 'hr' || selectedRole === 'hr_admin' || selectedRole === 'admin') return true;
    if (selectedRole === 'manager' || selectedRole === 'reporting_manager' || selectedRole === 'dept_head') {
      return ['create_goal', 'review_midyear', 'review_annual', 'recommend_promo', 'recommend_inc', 'manage_pip'].includes(action);
    }
    if (selectedRole === 'finance') {
      return ['validate_inc', 'view_reports'].includes(action);
    }
    if (selectedRole === 'payroll') {
      return ['payroll_sync', 'view_reports'].includes(action);
    }
    if (selectedRole === 'employee') {
      return ['self_review', 'acknowledge'].includes(action);
    }
    return true;
  };

  return (
    <div className="performance-module-container" style={{ padding: '20px', minHeight: '85vh', background: 'hsl(var(--bg-main))' }}>
      
      {/* Enterprise Header & Role Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-award"></i> Module 6: Appraisal, Increments & PIP Lifecycle
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Framework Config, KRA/KPI Goal Setting, Mid-Year & Annual Reviews, Calculated Rating Engine, Calibration, Promotion & Increment Workflows, PIP & Analytics.
          </p>
        </div>

        {/* Role Access Test Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'hsl(var(--bg-card))', padding: '8px 14px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Current Role RBAC View:</span>
          <select 
            value={selectedRole} 
            onChange={(e) => setSelectedRole(e.target.value)}
            className="form-control"
            style={{ width: '180px', padding: '4px 8px', fontSize: '0.8rem' }}
          >
            <option value="super_admin">Super Admin / HR Admin</option>
            <option value="reporting_manager">Reporting Manager</option>
            <option value="dept_head">Department Head</option>
            <option value="hr_executive">HR Executive</option>
            <option value="finance">Finance Manager</option>
            <option value="payroll">Payroll Administrator</option>
            <option value="management">Executive Management</option>
            <option value="employee">Employee (Self Service)</option>
            <option value="admin">System Administrator</option>
          </select>
        </div>
      </div>

      {/* Submodule Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', borderBottom: '1px solid hsl(var(--border))', marginBottom: '24px' }}>
        {[
          { id: 'dashboard', label: 'Performance Dashboard', icon: 'fa-chart-pie' },
          { id: 'cycles', label: 'Appraisal Cycles', icon: 'fa-calendar-check' },
          { id: 'framework', label: 'Framework & Templates', icon: 'fa-sliders' },
          { id: 'kras-kpis', label: 'KRAs, KPIs & Goal Setting', icon: 'fa-bullseye' },
          { id: 'mid-year', label: 'Mid-Year Review', icon: 'fa-hourglass-half' },
          { id: 'annual-review', label: 'Annual Review & Calibration', icon: 'fa-ranking-star' },
          { id: 'promotions', label: 'Promotion Recommendations', icon: 'fa-chart-line-up' },
          { id: 'increments', label: 'Increment & Payroll Sync', icon: 'fa-sack-dollar' },
          { id: 'pip', label: 'PIP Lifecycle Engine', icon: 'fa-user-gear' },
          { id: 'reports', label: 'Performance Reports', icon: 'fa-file-csv' },
          { id: 'audit', label: 'Audit Logs', icon: 'fa-shield-halved' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: PERFORMANCE DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="animate-fade-in-up">
          {/* KPI Cards */}
          <div className="metric-grid" style={{ marginBottom: '24px' }}>
            <div className="metric-card primary">
              <div>
                <span className="metric-label">Active Appraisal Cycles</span>
                <div className="metric-val">{cycles.filter(c => c.status === 'Active').length || 1}</div>
                <span className="metric-trend up"><i className="fa-solid fa-check"></i> FY 2026-27 Active</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-calendar-days"></i></div>
            </div>

            <div className="metric-card success">
              <div>
                <span className="metric-label">Completed Reviews</span>
                <div className="metric-val">{annualReviews.filter(r => ['Published & Acknowledged', 'Completed'].includes(r.status)).length || 14}</div>
                <span className="metric-trend up"><i className="fa-solid fa-check"></i> Acknowledged</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-circle-check"></i></div>
            </div>

            <div className="metric-card warning">
              <div>
                <span className="metric-label">Approved Promotions</span>
                <div className="metric-val">{promotions.filter(p => p.status === 'Approved').length || 4}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Master Updated</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-award"></i></div>
            </div>

            <div className="metric-card info">
              <div>
                <span className="metric-label">Approved Increments</span>
                <div className="metric-val">{increments.filter(i => i.status === 'Approved').length || 18}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Payroll Synced</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-wallet"></i></div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="dashboard-layout" style={{ marginBottom: '24px' }}>
            <div className="card">
              <div className="card-title"><i className="fa-solid fa-chart-pie"></i> Annual Performance Rating Distribution</div>
              <div className="chart-container" style={{ height: '280px' }}>
                <canvas ref={distChartRef}></canvas>
              </div>
            </div>

            <div className="card">
              <div className="card-title"><i className="fa-solid fa-chart-bar"></i> Department Average Performance Score (%)</div>
              <div className="chart-container" style={{ height: '280px' }}>
                <canvas ref={deptChartRef}></canvas>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="dashboard-layout">
            <div className="card">
              <div className="card-title"><i className="fa-solid fa-chart-line"></i> Historical Increment Trend (%)</div>
              <div className="chart-container" style={{ height: '280px' }}>
                <canvas ref={trendChartRef}></canvas>
              </div>
            </div>

            <div className="card">
              <div className="card-title"><i className="fa-solid fa-circle-nodes"></i> Performance Framework Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div style={{ padding: '12px', background: 'hsla(var(--primary), 0.05)', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Active PIPs</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'hsl(var(--warning))' }}>{pips.filter(p => p.outcome === 'In Progress').length || 1}</div>
                </div>
                <div style={{ padding: '12px', background: 'hsla(142, 72%, 29%, 0.05)', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Avg Performance Score</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'hsl(var(--success))' }}>86.5%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPRAISAL CYCLES MASTER */}
      {activeTab === 'cycles' && (
        <div className="animate-fade-in-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Appraisal Cycle Master Configuration</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Configure Annual, Half-Yearly, and Quarterly Appraisal review windows.</p>
            </div>
            {isAllowed('config') && (
              <button className="btn btn-primary" onClick={() => setShowCycleModal(true)}>
                <i className="fa-solid fa-plus"></i> Configure New Cycle
              </button>
            )}
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Cycle Name</th>
                    <th>Type</th>
                    <th>Financial Year</th>
                    <th>Review Period</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Target Dept</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cycles.map(c => (
                    <tr key={c._id}>
                      <td><strong>{c.cycleName}</strong></td>
                      <td><span className="badge badge-info">{c.cycleType}</span></td>
                      <td>{c.financialYear}</td>
                      <td>{c.reviewPeriod}</td>
                      <td>{new Date(c.startDate).toLocaleDateString()}</td>
                      <td>{new Date(c.endDate).toLocaleDateString()}</td>
                      <td>{c.department}</td>
                      <td>
                        <span className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {cycles.length === 0 && (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No active cycles found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FRAMEWORK & TEMPLATES */}
      {activeTab === 'framework' && (
        <div className="animate-fade-in-up">
          <div className="dashboard-layout" style={{ marginBottom: '24px' }}>
            
            {/* Rating Scales */}
            <div className="card">
              <div className="card-title"><i className="fa-solid fa-star"></i> Configurable Rating Scales</div>
              <table className="custom-table">
                <thead>
                  <tr><th>Rating</th><th>Label</th><th>Min Score</th><th>Max Score</th><th>Category</th></tr>
                </thead>
                <tbody>
                  {ratingScales.map(rs => (
                    <tr key={rs._id}>
                      <td><strong style={{ color: 'hsl(var(--primary))' }}>{rs.ratingValue}.0 ★</strong></td>
                      <td>{rs.ratingLabel}</td>
                      <td>{rs.minScore}%</td>
                      <td>{rs.maxScore}%</td>
                      <td><span className="badge badge-primary">{rs.performanceCategory}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Performance Templates */}
            <div className="card">
              <div className="card-title"><i className="fa-solid fa-sliders"></i> Performance Template Breakdown</div>
              <table className="custom-table">
                <thead>
                  <tr><th>Template</th><th>KRA %</th><th>KPI %</th><th>Competency %</th><th>Behaviour %</th><th>Total</th></tr>
                </thead>
                <tbody>
                  {templates.map(pt => (
                    <tr key={pt._id}>
                      <td><strong>{pt.templateName}</strong></td>
                      <td>{pt.kraWeightage}%</td>
                      <td>{pt.kpiWeightage}%</td>
                      <td>{pt.competencyWeightage}%</td>
                      <td>{pt.behaviourWeightage}%</td>
                      <td><span className="badge badge-success">100%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Competency Master Table */}
          <div className="card">
            <div className="card-title"><i className="fa-solid fa-brain"></i> Competency Master Index</div>
            <table className="custom-table">
              <thead>
                <tr><th>Code</th><th>Competency Name</th><th>Type</th><th>Description</th><th>Weightage</th><th>Status</th></tr>
              </thead>
              <tbody>
                {competencies.map(comp => (
                  <tr key={comp._id}>
                    <td><strong>{comp.competencyCode}</strong></td>
                    <td>{comp.competencyName}</td>
                    <td><span className="badge badge-info">{comp.competencyType}</span></td>
                    <td>{comp.description}</td>
                    <td>{comp.weightage}%</td>
                    <td><span className="badge badge-success">{comp.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: KRA, KPI & GOAL SETTING */}
      {activeTab === 'kras-kpis' && (
        <div className="animate-fade-in-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>KRAs, KPIs & Goal Setting Hub</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Assign KRA/KPI objectives to employees and track milestone progress.</p>
            </div>
            {isAllowed('create_goal') && (
              <button className="btn btn-primary" onClick={() => setShowGoalModal(true)}>
                <i className="fa-solid fa-plus"></i> Assign Employee Goal
              </button>
            )}
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Goal Code</th>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>KRA / Objective Title</th>
                    <th>Target</th>
                    <th>Weightage</th>
                    <th>Progress %</th>
                    <th>Goal Status</th>
                    <th>Approval Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {goals.map(g => (
                    <tr key={g._id}>
                      <td><strong>{g.goalCode}</strong></td>
                      <td>{g.employeeName}</td>
                      <td>{g.department}</td>
                      <td>{g.kraName}</td>
                      <td>{g.target}</td>
                      <td>{g.weightage}%</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '0.85rem' }}>{g.achievementPct || 0}%</strong>
                          <div style={{ width: '60px', height: '6px', background: 'hsl(var(--border))', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${g.achievementPct || 0}%`, height: '100%', background: 'hsl(var(--primary))' }}></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${g.goalStatus === 'On Track' || g.goalStatus === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                          {g.goalStatus}
                        </span>
                      </td>
                      <td><span className="badge badge-success">{g.status}</span></td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => { setSelectedGoal(g); setShowGoalProgressModal(true); }}>
                          <i className="fa-solid fa-pen-to-square"></i> Update Progress
                        </button>
                      </td>
                    </tr>
                  ))}
                  {goals.length === 0 && (
                    <tr><td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>No employee goals assigned yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MID-YEAR REVIEW */}
      {activeTab === 'mid-year' && (
        <div className="animate-fade-in-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Mid-Year Review & Development Plan</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mid-year check-in for self review, manager feedback, and skill gap development plans.</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowMidYearModal(true)}>
              <i className="fa-solid fa-file-pen"></i> Submit Mid-Year Self Review
            </button>
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Review Period</th>
                    <th>Self Rating</th>
                    <th>Manager Rating</th>
                    <th>Key Achievements</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {midYearReviews.map(my => (
                    <tr key={my._id}>
                      <td><strong>{my.employeeName}</strong></td>
                      <td>{my.department}</td>
                      <td>{my.reviewPeriod}</td>
                      <td><span style={{ color: '#f59e0b', fontWeight: 700 }}>{my.selfRating} ★</span></td>
                      <td><span style={{ color: '#10b981', fontWeight: 700 }}>{my.managerRating} ★</span></td>
                      <td>{my.keyAchievements}</td>
                      <td><span className="badge badge-success">{my.status}</span></td>
                    </tr>
                  ))}
                  {midYearReviews.length === 0 && (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No mid-year reviews logged.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ANNUAL REVIEW & CALIBRATION */}
      {activeTab === 'annual-review' && (
        <div className="animate-fade-in-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Annual Review, Calculated Rating Engine & Calibration</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Automated calculation engine: 40% KRA + 30% KPI + 20% Competency + 10% Behaviour.</p>
            </div>
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>KRA / KPI Score</th>
                    <th>Calculated Overall Score</th>
                    <th>Final Rating</th>
                    <th>Performance Category</th>
                    <th>Recommended Action</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {annualReviews.map(ar => (
                    <tr key={ar._id}>
                      <td><strong>{ar.employeeName}</strong></td>
                      <td>{ar.department}</td>
                      <td>{ar.managerKraScore || 85}% / {ar.managerKpiScore || 85}%</td>
                      <td><strong style={{ color: 'hsl(var(--primary))', fontSize: '1rem' }}>{ar.calculatedOverallScore}%</strong></td>
                      <td><span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '1rem' }}>{ar.finalRating} ★</span></td>
                      <td><span className="badge badge-success">{ar.performanceCategory}</span></td>
                      <td><span className="badge badge-info">{ar.recommendedAction}</span></td>
                      <td><span className="badge badge-success">{ar.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => { setSelectedAnnual(ar); setShowAnnualModal(true); }}
                          >
                            <i className="fa-solid fa-calculator"></i> Assessment
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => { setSelectedAnnualForCalib(ar); setShowCalibrationModal(true); }}
                          >
                            <i className="fa-solid fa-scale-balanced"></i> Calibrate
                          </button>
                          {!ar.acknowledgedByEmployee && (
                            <button 
                              className="btn btn-primary" 
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => handleAcknowledgeAnnual(ar._id)}
                            >
                              Acknowledge
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {annualReviews.length === 0 && (
                    <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>No annual reviews generated.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: PROMOTION RECOMMENDATIONS */}
      {activeTab === 'promotions' && (
        <div className="animate-fade-in-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Promotion Recommendations & Employee Master Sync</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Automated eligibility verification. Final approval updates Designation, Grade, and Position in Employee Master.</p>
            </div>
            {isAllowed('recommend_promo') && (
              <button className="btn btn-primary" onClick={() => setShowPromoModal(true)}>
                <i className="fa-solid fa-plus"></i> Recommend Promotion
              </button>
            )}
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Current Designation & Grade</th>
                    <th>Proposed Designation & Grade</th>
                    <th>Effective Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map(p => (
                    <tr key={p._id}>
                      <td><strong>{p.requestId}</strong></td>
                      <td>{p.employeeName}</td>
                      <td>{p.currentDepartment}</td>
                      <td>{p.currentDesignation} ({p.currentGrade})</td>
                      <td><strong style={{ color: 'hsl(var(--primary))' }}>{p.proposedDesignation} ({p.proposedGrade})</strong></td>
                      <td>{new Date(p.effectiveDate).toLocaleDateString()}</td>
                      <td><span className={`badge ${p.status === 'Approved' ? 'badge-success' : 'badge-warning'}`}>{p.status}</span></td>
                      <td>
                        {p.status !== 'Approved' ? (
                          <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleApprovePromotionSubmit(p._id, 'Approved')}>
                            Approve Promotion
                          </button>
                        ) : <span className="badge badge-success">Employee Master Updated</span>}
                      </td>
                    </tr>
                  ))}
                  {promotions.length === 0 && (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No promotion recommendations logged.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: INCREMENT RECOMMENDATIONS */}
      {activeTab === 'increments' && (
        <div className="animate-fade-in-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Increment Recommendations & Payroll Integration</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>CTC & Salary Component calculation engine. Finance sign-off updates Payroll structure atomically.</p>
            </div>
            {isAllowed('recommend_inc') && (
              <button className="btn btn-primary" onClick={() => setShowIncModal(true)}>
                <i className="fa-solid fa-plus"></i> Recommend Increment
              </button>
            )}
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Employee Name</th>
                    <th>Current CTC</th>
                    <th>Increment %</th>
                    <th>Increment Amount</th>
                    <th>Revised CTC</th>
                    <th>Effective Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {increments.map(inc => (
                    <tr key={inc._id}>
                      <td><strong>{inc.requestId}</strong></td>
                      <td>{inc.employeeName}</td>
                      <td>₹{(inc.currentCtc || 0).toLocaleString()}</td>
                      <td><span className="badge badge-primary">+{inc.incrementPercentage}%</span></td>
                      <td>₹{(inc.incrementAmount || 0).toLocaleString()}</td>
                      <td><strong style={{ color: 'hsl(var(--success))' }}>₹{(inc.revisedCtc || 0).toLocaleString()}</strong></td>
                      <td>{new Date(inc.effectiveDate).toLocaleDateString()}</td>
                      <td><span className={`badge ${inc.status === 'Approved' ? 'badge-success' : 'badge-warning'}`}>{inc.status}</span></td>
                      <td>
                        {inc.status !== 'Approved' ? (
                          <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleApproveIncrementSubmit(inc._id, 'Approved')}>
                            Finance Sign-off
                          </button>
                        ) : <span className="badge badge-success">Payroll Synced</span>}
                      </td>
                    </tr>
                  ))}
                  {increments.length === 0 && (
                    <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>No increment recommendations recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: PIP LIFECYCLE ENGINE */}
      {activeTab === 'pip' && (
        <div className="animate-fade-in-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Performance Improvement Plan (PIP) Lifecycle</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Initiate PIP, track multi-objective progress, log periodic review feedback, and sign off outcomes.</p>
            </div>
            {isAllowed('manage_pip') && (
              <button className="btn btn-primary" onClick={() => setShowPipModal(true)}>
                <i className="fa-solid fa-plus"></i> Initiate New PIP
              </button>
            )}
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>PIP Code</th>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Duration</th>
                    <th>Performance Gap</th>
                    <th>Review Frequency</th>
                    <th>Outcome Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pips.map(p => (
                    <tr key={p._id}>
                      <td><strong>{p.pipCode}</strong></td>
                      <td>{p.employeeName}</td>
                      <td>{p.department}</td>
                      <td>{p.durationDays} Days</td>
                      <td>{p.performanceGap}</td>
                      <td><span className="badge badge-info">{p.reviewFrequency}</span></td>
                      <td>
                        <span className={`badge ${p.outcome === 'Successfully Completed' ? 'badge-success' : p.outcome === 'Unsuccessful' ? 'badge-danger' : 'badge-warning'}`}>
                          {p.outcome}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => { setSelectedPip(p); setShowPipReviewModal(true); }}>
                          <i className="fa-solid fa-clipboard-user"></i> Periodic Review
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pips.length === 0 && (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No active PIP records.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: REPORTS & EXPORTS */}
      {activeTab === 'reports' && (
        <div className="animate-fade-in-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Performance Reports & Export Center</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" onClick={() => handleExportCSV('Annual_Performance_Appraisal_Report', annualReviews)}>
                <i className="fa-solid fa-file-excel"></i> Export Excel (CSV)
              </button>
              <button className="btn btn-secondary" onClick={() => window.print()}>
                <i className="fa-solid fa-print"></i> Print Report
              </button>
            </div>
          </div>

          <div className="metric-grid" style={{ marginBottom: '20px' }}>
            <div className="card" onClick={() => handleExportCSV('Annual_Appraisal_Report', annualReviews)} style={{ cursor: 'pointer' }}>
              <i className="fa-solid fa-ranking-star" style={{ fontSize: '1.5rem', color: 'hsl(var(--primary))' }}></i>
              <h4 style={{ margin: '8px 0 4px 0', fontSize: '1rem' }}>Annual Review Summary</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Click to download full rating distribution CSV</p>
            </div>

            <div className="card" onClick={() => handleExportCSV('Promotion_Register_Report', promotions)} style={{ cursor: 'pointer' }}>
              <i className="fa-solid fa-award" style={{ fontSize: '1.5rem', color: 'hsl(var(--success))' }}></i>
              <h4 style={{ margin: '8px 0 4px 0', fontSize: '1rem' }}>Promotion Register Report</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Click to download approved promotion log CSV</p>
            </div>

            <div className="card" onClick={() => handleExportCSV('Increment_Cost_Report', increments)} style={{ cursor: 'pointer' }}>
              <i className="fa-solid fa-sack-dollar" style={{ fontSize: '1.5rem', color: 'hsl(var(--warning))' }}></i>
              <h4 style={{ margin: '8px 0 4px 0', fontSize: '1rem' }}>Increment Cost Analysis</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Click to download payroll revision impact CSV</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 11: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Performance Audit Logs & Governance Trail</h3>
          <div className="card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Entity Type</th>
                    <th>Entity ID</th>
                    <th>Action</th>
                    <th>Performed By</th>
                    <th>Role</th>
                    <th>Comments / Details</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log, idx) => (
                    <tr key={log._id || idx}>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td><span className="badge badge-info">{log.entityType}</span></td>
                      <td><strong>{log.entityId}</strong></td>
                      <td><span className="badge badge-primary">{log.action}</span></td>
                      <td>{log.performedByName}</td>
                      <td>{log.performedByRole}</td>
                      <td>{log.comments || '--'}</td>
                      <td>{log.ipAddress}</td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No performance audit logs recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIGURE APPRAISAL CYCLE */}
      {showCycleModal && (
        <div className="modal-backdrop active" onClick={() => setShowCycleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h4>Configure Appraisal Cycle</h4>
              <button className="close-btn" onClick={() => setShowCycleModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateCycle}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Cycle Name *</label>
                  <input type="text" className="form-control" value={cycleForm.cycleName} onChange={(e) => setCycleForm({ ...cycleForm, cycleName: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Cycle Type</label>
                  <select className="form-control" value={cycleForm.cycleType} onChange={(e) => setCycleForm({ ...cycleForm, cycleType: e.target.value })}>
                    <option value="Annual">Annual</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Financial Year</label>
                  <input type="text" className="form-control" value={cycleForm.financialYear} onChange={(e) => setCycleForm({ ...cycleForm, financialYear: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Start Date *</label>
                  <input type="date" className="form-control" value={cycleForm.startDate} onChange={(e) => setCycleForm({ ...cycleForm, startDate: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">End Date *</label>
                  <input type="date" className="form-control" value={cycleForm.endDate} onChange={(e) => setCycleForm({ ...cycleForm, endDate: e.target.value })} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCycleModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Appraisal Cycle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN GOAL */}
      {showGoalModal && (
        <div className="modal-backdrop active" onClick={() => setShowGoalModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h4>Assign Employee KRA / Goal</h4>
              <button className="close-btn" onClick={() => setShowGoalModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateGoal}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Employee ID *</label>
                  <input type="text" className="form-control" value={goalForm.employeeId} onChange={(e) => setGoalForm({ ...goalForm, employeeId: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Employee Name *</label>
                  <input type="text" className="form-control" value={goalForm.employeeName} onChange={(e) => setGoalForm({ ...goalForm, employeeName: e.target.value })} required />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">KRA / Objective Title *</label>
                  <input type="text" className="form-control" value={goalForm.kraName} onChange={(e) => setGoalForm({ ...goalForm, kraName: e.target.value })} required />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Target & Success Criteria *</label>
                  <input type="text" className="form-control" value={goalForm.target} onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Weightage (%) *</label>
                  <input type="number" className="form-control" value={goalForm.weightage} onChange={(e) => setGoalForm({ ...goalForm, weightage: Number(e.target.value) })} required />
                </div>
                <div>
                  <label className="form-label">Priority</label>
                  <select className="form-control" value={goalForm.priority} onChange={(e) => setGoalForm({ ...goalForm, priority: e.target.value })}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowGoalModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Assign Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE GOAL PROGRESS */}
      {showGoalProgressModal && selectedGoal && (
        <div className="modal-backdrop active" onClick={() => setShowGoalProgressModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h4>Update Goal Progress: {selectedGoal.goalCode}</h4>
              <button className="close-btn" onClick={() => setShowGoalProgressModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleUpdateGoalProgressSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Achievement Percentage (%) *</label>
                  <input type="number" name="achievementPct" className="form-control" defaultValue={selectedGoal.achievementPct || 50} min="0" max="100" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Goal Status</label>
                  <select name="goalStatus" className="form-control" defaultValue={selectedGoal.goalStatus || 'In Progress'}>
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Track">On Track</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Progress Notes / Evidence</label>
                  <textarea name="employeeComments" className="form-control" rows="3" placeholder="Provide progress updates..." required></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowGoalProgressModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Progress</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT MID-YEAR REVIEW */}
      {showMidYearModal && (
        <div className="modal-backdrop active" onClick={() => setShowMidYearModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h4>Mid-Year Self Review Form</h4>
              <button className="close-btn" onClick={() => setShowMidYearModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateMidYearReview}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Self Goal Achievement Summary *</label>
                  <textarea className="form-control" rows="2" value={midYearForm.selfGoalAchievement} onChange={(e) => setMidYearForm({ ...midYearForm, selfGoalAchievement: e.target.value })} required></textarea>
                </div>
                <div className="form-group">
                  <label className="form-label">Key Accomplishments *</label>
                  <textarea className="form-control" rows="2" value={midYearForm.keyAchievements} onChange={(e) => setMidYearForm({ ...midYearForm, keyAchievements: e.target.value })} required></textarea>
                </div>
                <div className="form-group">
                  <label className="form-label">Major Challenges & Development Needs</label>
                  <textarea className="form-control" rows="2" value={midYearForm.developmentNeeds} onChange={(e) => setMidYearForm({ ...midYearForm, developmentNeeds: e.target.value })}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMidYearModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Mid-Year Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANAGER ANNUAL ASSESSMENT */}
      {showAnnualModal && selectedAnnual && (
        <div className="modal-backdrop active" onClick={() => setShowAnnualModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h4>Annual Manager Evaluation: {selectedAnnual.employeeName}</h4>
              <button className="close-btn" onClick={() => setShowAnnualModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveManagerAssessment}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">KRA Score (0-100%) *</label>
                  <input type="number" className="form-control" value={annualAssessmentForm.managerKraScore} onChange={(e) => setAnnualAssessmentForm({ ...annualAssessmentForm, managerKraScore: Number(e.target.value) })} required />
                </div>
                <div>
                  <label className="form-label">KPI Score (0-100%) *</label>
                  <input type="number" className="form-control" value={annualAssessmentForm.managerKpiScore} onChange={(e) => setAnnualAssessmentForm({ ...annualAssessmentForm, managerKpiScore: Number(e.target.value) })} required />
                </div>
                <div>
                  <label className="form-label">Competency Score (0-100%) *</label>
                  <input type="number" className="form-control" value={annualAssessmentForm.managerCompetencyScore} onChange={(e) => setAnnualAssessmentForm({ ...annualAssessmentForm, managerCompetencyScore: Number(e.target.value) })} required />
                </div>
                <div>
                  <label className="form-label">Behaviour Score (0-100%) *</label>
                  <input type="number" className="form-control" value={annualAssessmentForm.managerBehaviourScore} onChange={(e) => setAnnualAssessmentForm({ ...annualAssessmentForm, managerBehaviourScore: Number(e.target.value) })} required />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Strengths</label>
                  <input type="text" className="form-control" value={annualAssessmentForm.strengths} onChange={(e) => setAnnualAssessmentForm({ ...annualAssessmentForm, strengths: e.target.value })} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Recommended Action</label>
                  <select className="form-control" value={annualAssessmentForm.recommendedAction} onChange={(e) => setAnnualAssessmentForm({ ...annualAssessmentForm, recommendedAction: e.target.value })}>
                    <option value="None">None</option>
                    <option value="Promotion">Promotion Only</option>
                    <option value="Increment">Increment Only</option>
                    <option value="Promotion & Increment">Promotion & Increment</option>
                    <option value="PIP">PIP (Performance Improvement Plan)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAnnualModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Calculate Rating & Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CALIBRATION COMMITTEE */}
      {showCalibrationModal && selectedAnnualForCalib && (
        <div className="modal-backdrop active" onClick={() => setShowCalibrationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h4>Calibration Review: {selectedAnnualForCalib.employeeName}</h4>
              <button className="close-btn" onClick={() => setShowCalibrationModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCalibrateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Calibrated Rating (1.0 - 5.0) *</label>
                  <input type="number" step="0.1" name="finalRating" className="form-control" defaultValue={selectedAnnualForCalib.finalRating || 5.0} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Performance Category</label>
                  <select name="performanceCategory" className="form-control" defaultValue={selectedAnnualForCalib.performanceCategory || 'Outstanding'}>
                    <option value="Outstanding">Outstanding</option>
                    <option value="Exceeds Expectations">Exceeds Expectations</option>
                    <option value="Meets Expectations">Meets Expectations</option>
                    <option value="Needs Improvement">Needs Improvement</option>
                    <option value="Unsatisfactory">Unsatisfactory</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Committee Calibration Remarks</label>
                  <textarea name="calibrationRemarks" className="form-control" rows="3" placeholder="State justification for calibration adjustment..." required></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCalibrationModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Calibrated Rating</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECOMMEND PROMOTION */}
      {showPromoModal && (
        <div className="modal-backdrop active" onClick={() => setShowPromoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h4>Submit Promotion Recommendation</h4>
              <button className="close-btn" onClick={() => setShowPromoModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreatePromotion}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Employee ID *</label>
                  <input type="text" className="form-control" value={promoForm.employeeId} onChange={(e) => setPromoForm({ ...promoForm, employeeId: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Employee Name *</label>
                  <input type="text" className="form-control" value={promoForm.employeeName} onChange={(e) => setPromoForm({ ...promoForm, employeeName: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Proposed Designation *</label>
                  <input type="text" className="form-control" value={promoForm.proposedDesignation} onChange={(e) => setPromoForm({ ...promoForm, proposedDesignation: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Proposed Grade *</label>
                  <input type="text" className="form-control" value={promoForm.proposedGrade} onChange={(e) => setPromoForm({ ...promoForm, proposedGrade: e.target.value })} required />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Business Justification *</label>
                  <textarea className="form-control" rows="3" value={promoForm.justification} onChange={(e) => setPromoForm({ ...promoForm, justification: e.target.value })} required></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPromoModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Recommendation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECOMMEND INCREMENT */}
      {showIncModal && (
        <div className="modal-backdrop active" onClick={() => setShowIncModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h4>Submit Increment Recommendation</h4>
              <button className="close-btn" onClick={() => setShowIncModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateIncrement}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Employee Name *</label>
                  <input type="text" className="form-control" value={incForm.employeeName} onChange={(e) => setIncForm({ ...incForm, employeeName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Current CTC (₹) *</label>
                  <input type="number" className="form-control" value={incForm.currentCtc} onChange={(e) => setIncForm({ ...incForm, currentCtc: Number(e.target.value) })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Increment Percentage (%) *</label>
                  <input type="number" className="form-control" value={incForm.incrementPercentage} onChange={(e) => setIncForm({ ...incForm, incrementPercentage: Number(e.target.value) })} required />
                </div>
                <div style={{ padding: '10px', background: 'hsla(var(--primary), 0.05)', borderRadius: '6px', fontSize: '0.85rem' }}>
                  <strong>Revised Estimated CTC:</strong> ₹{Math.round(incForm.currentCtc * (1 + incForm.incrementPercentage / 100)).toLocaleString()}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowIncModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Increment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INITIATE PIP */}
      {showPipModal && (
        <div className="modal-backdrop active" onClick={() => setShowPipModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h4>Initiate Performance Improvement Plan (PIP)</h4>
              <button className="close-btn" onClick={() => setShowPipModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreatePip}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Employee ID *</label>
                  <input type="text" className="form-control" value={pipForm.employeeId} onChange={(e) => setPipForm({ ...pipForm, employeeId: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Employee Name *</label>
                  <input type="text" className="form-control" value={pipForm.employeeName} onChange={(e) => setPipForm({ ...pipForm, employeeName: e.target.value })} required />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Performance Gap Identified *</label>
                  <textarea className="form-control" rows="2" value={pipForm.performanceGap} onChange={(e) => setPipForm({ ...pipForm, performanceGap: e.target.value })} required></textarea>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Expected Performance Target *</label>
                  <textarea className="form-control" rows="2" value={pipForm.expectedPerformance} onChange={(e) => setPipForm({ ...pipForm, expectedPerformance: e.target.value })} required></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPipModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Initiate PIP</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PERIODIC PIP REVIEW */}
      {showPipReviewModal && selectedPip && (
        <div className="modal-backdrop active" onClick={() => setShowPipReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h4>Periodic PIP Review Log: {selectedPip.pipCode}</h4>
              <button className="close-btn" onClick={() => setShowPipReviewModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddPipReviewSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Progress Rating</label>
                  <select name="rating" className="form-control" defaultValue="Satisfactory Progress">
                    <option value="Satisfactory Progress">Satisfactory Progress</option>
                    <option value="Needs Accelerated Effort">Needs Accelerated Effort</option>
                    <option value="Unsatisfactory">Unsatisfactory</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">PIP Outcome Status</label>
                  <select name="outcome" className="form-control" defaultValue={selectedPip.outcome || 'In Progress'}>
                    <option value="In Progress">In Progress</option>
                    <option value="Successfully Completed">Successfully Completed</option>
                    <option value="Extended">Extended</option>
                    <option value="Unsuccessful">Unsuccessful</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Manager Feedback Notes *</label>
                  <textarea name="managerFeedback" className="form-control" rows="3" placeholder="Detail employee progress during review window..." required></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPipReviewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save PIP Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PerformanceModule;
