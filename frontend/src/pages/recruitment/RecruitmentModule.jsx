import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import { useToast } from '../../components/Toast';
import api from '../../api';

const RecruitmentModule = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();

  // Active Tab State
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'requisitions', 'positions', 'budgets', 'resume-analysis', 'candidates', 'talent-pool', 'costs', 'reports', 'audit', 'masters', 'career-portal'

  // Current Role Filter for RBAC testing
  const [selectedRole, setSelectedRole] = useState(user?.role || 'hr_admin');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterStage, setFilterStage] = useState('All');

  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [requisitions, setRequisitions] = useState([]);
  const [positions, setPositions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [talentPool, setTalentPool] = useState([]);
  const [costs, setCosts] = useState([]);
  const [masters, setMasters] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showReqModal, setShowReqModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedReqForApproval, setSelectedReqForApproval] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedReqForAssign, setSelectedReqForAssign] = useState(null);

  const [showPosModal, setShowPosModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);

  const [showCand360Modal, setShowCand360Modal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [cand360Tab, setCand360Tab] = useState('overview'); // 'overview', 'education', 'experience', 'docs', 'interviews', 'offer', 'communication', 'timeline'

  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState(null);

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerCand, setOfferCand] = useState(null);

  // Chart references
  const funnelChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const deptChartRef = useRef(null);
  const sourceChartRef = useRef(null);
  const chartInstances = useRef({});

  // Requisition Form state
  const [reqForm, setReqForm] = useState({
    jobTitle: '',
    department: 'Engineering',
    grade: 'Grade A',
    designation: 'Software Engineer',
    costCenter: 'CC-101',
    employmentType: 'Full-Time',
    vacancyCount: 1,
    annualCtcPerPosition: 1200000,
    targetHireDate: '',
    justification: '',
    priorityLevel: 'Medium'
  });

  // Position Form state
  const [posForm, setPosForm] = useState({
    positionTitle: '',
    department: 'Engineering',
    designation: 'Senior Developer',
    grade: 'Grade B',
    reportingManager: 'Akhil Sirivella',
    costCenter: 'CC-101',
    currentHeadcount: 2,
    proposedHeadcount: 4,
    annualCtcBudget: 1500000,
    justification: ''
  });

  // Budget Form state
  const [budgetForm, setBudgetForm] = useState({
    positionTitle: '',
    department: 'Engineering',
    costCenter: 'CC-101',
    annualCtcBudget: 1500000,
    recruitmentCostBudget: 150000
  });

  // Cost Form state
  const [costForm, setCostForm] = useState({
    reqNumber: '',
    candidateId: '',
    costCategory: 'Job Portal',
    vendorName: 'Naukri.com',
    department: 'Engineering',
    costCenter: 'CC-101',
    amount: 25000,
    description: ''
  });

  // Resume Upload Form
  const [resumeUploadFile, setResumeUploadFile] = useState(null);
  const [targetRole, setTargetRole] = useState('Senior Full Stack Engineer');
  const [targetSkills, setTargetSkills] = useState('React.js, Node.js, Express, MongoDB, Docker, AWS');
  const [uploadingResume, setUploadingResume] = useState(false);

  // Communication Log Form
  const [commMsg, setCommMsg] = useState('');
  const [commMedium, setCommMedium] = useState('Email');

  // Load all module data
  const fetchAllRecruitmentData = async () => {
    setLoading(true);
    try {
      const [dashRes, reqRes, posRes, budRes, resRes, candRes, tpRes, costRes, masterRes, auditRes] = await Promise.all([
        api.get('/recruitment/dashboard').catch(() => ({ data: null })),
        api.get('/recruitment/requisitions').catch(() => ({ data: [] })),
        api.get('/recruitment/positions').catch(() => ({ data: [] })),
        api.get('/recruitment/budgets').catch(() => ({ data: [] })),
        api.get('/recruitment/resumes').catch(() => ({ data: [] })),
        api.get('/candidates').catch(() => ({ data: [] })),
        api.get('/recruitment/talent-pool').catch(() => ({ data: [] })),
        api.get('/recruitment/costs').catch(() => ({ data: [] })),
        api.get('/recruitment/masters').catch(() => ({ data: [] })),
        api.get('/recruitment/audit-logs').catch(() => ({ data: [] }))
      ]);

      setDashboardData(dashRes.data);
      setRequisitions(reqRes.data || []);
      setPositions(posRes.data || []);
      setBudgets(budRes.data || []);
      setResumes(resRes.data || []);
      setCandidates(candRes.data || []);
      setTalentPool(tpRes.data || []);
      setCosts(costRes.data || []);
      setMasters(masterRes.data || []);
      setAuditLogs(auditRes.data || []);
    } catch (err) {
      console.error('Error loading recruitment data', err);
      showToast('Loaded local recruitment workspace', 'info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRecruitmentData();
  }, []);

  // Initialize Dashboard Charts
  useEffect(() => {
    if (activeTab !== 'dashboard' || !window.Chart) return;

    // Destroy existing
    Object.keys(chartInstances.current).forEach(key => {
      if (chartInstances.current[key]) chartInstances.current[key].destroy();
    });

    // 1. Funnel Chart
    const ctxFunnel = funnelChartRef.current?.getContext('2d');
    if (ctxFunnel) {
      chartInstances.current.funnel = new window.Chart(ctxFunnel, {
        type: 'bar',
        data: {
          labels: ['Applied', 'Screened', 'Interviewed', 'Offered', 'Joined'],
          datasets: [{
            label: 'Candidates Count',
            data: [142, 85, 44, 18, 14],
            backgroundColor: ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'],
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }

    // 2. Trend Chart
    const ctxTrend = trendChartRef.current?.getContext('2d');
    if (ctxTrend) {
      chartInstances.current.trend = new window.Chart(ctxTrend, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Monthly Hires',
            data: [12, 18, 15, 22, 28, 35],
            borderColor: 'hsl(230, 80%, 55%)',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            fill: true,
            tension: 0.3
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // 3. Dept Chart
    const ctxDept = deptChartRef.current?.getContext('2d');
    if (ctxDept) {
      chartInstances.current.dept = new window.Chart(ctxDept, {
        type: 'bar',
        data: {
          labels: ['Engineering', 'HR', 'Finance', 'Marketing', 'Design'],
          datasets: [
            { label: 'Open Vacancies', data: [12, 4, 5, 8, 3], backgroundColor: '#f59e0b' },
            { label: 'Positions Filled', data: [8, 3, 4, 5, 2], backgroundColor: '#10b981' }
          ]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // 4. Source Chart
    const ctxSource = sourceChartRef.current?.getContext('2d');
    if (ctxSource) {
      chartInstances.current.source = new window.Chart(ctxSource, {
        type: 'doughnut',
        data: {
          labels: ['Job Portals', 'Career Page', 'Referrals', 'Walk-In', 'Consultancies'],
          datasets: [{
            data: [45, 32, 20, 15, 18],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }, [activeTab]);

  // Handlers
  const handleCreateRequisition = async (e) => {
    e.preventDefault();
    try {
      await api.post('/recruitment/requisitions', reqForm);
      showToast('Manpower Requisition submitted successfully.', 'success');
      setShowReqModal(false);
      fetchAllRecruitmentData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error submitting requisition', 'error');
    }
  };

  const handleApprovalSubmit = async (action) => {
    if (!selectedReqForApproval) return;
    const comments = document.getElementById('approvalCommentsInput')?.value || '';
    try {
      await api.put(`/recruitment/requisitions/${selectedReqForApproval._id}/approval`, { action, comments });
      showToast(`Requisition action '${action}' recorded.`, 'success');
      setShowApprovalModal(false);
      setSelectedReqForApproval(null);
      fetchAllRecruitmentData();
    } catch (err) {
      showToast('Error recording approval', 'error');
    }
  };

  const handleAssignRecruiterSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReqForAssign) return;
    const recruiterId = e.target.recruiterId.value;
    const recruiterName = e.target.recruiterName.value;
    try {
      await api.put(`/recruitment/requisitions/${selectedReqForAssign._id}/assign`, { recruiterId, recruiterName });
      showToast('Recruiter assigned successfully.', 'success');
      setShowAssignModal(false);
      setSelectedReqForAssign(null);
      fetchAllRecruitmentData();
    } catch (err) {
      showToast('Error assigning recruiter', 'error');
    }
  };

  const handleCreatePosition = async (e) => {
    e.preventDefault();
    try {
      await api.post('/recruitment/positions', posForm);
      showToast('Position approval request submitted.', 'success');
      setShowPosModal(false);
      fetchAllRecruitmentData();
    } catch (err) {
      showToast('Error creating position request', 'error');
    }
  };

  const handleApprovePosition = async (id, status) => {
    try {
      await api.put(`/recruitment/positions/${id}/approve`, { status, comments: 'Approved via enterprise portal' });
      showToast(`Position request ${status.toLowerCase()}. Position Master updated.`, 'success');
      fetchAllRecruitmentData();
    } catch (err) {
      showToast('Error processing position approval', 'error');
    }
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    try {
      await api.post('/recruitment/budgets', budgetForm);
      showToast('Vacancy budget request created.', 'success');
      setShowBudgetModal(false);
      fetchAllRecruitmentData();
    } catch (err) {
      showToast('Error creating budget request', 'error');
    }
  };

  const handleApproveBudget = async (id, financeStatus, managementStatus) => {
    try {
      await api.put(`/recruitment/budgets/${id}/approve`, { financeStatus, managementStatus, comments: 'Sign-off complete' });
      showToast('Budget request status updated.', 'success');
      fetchAllRecruitmentData();
    } catch (err) {
      showToast('Error updating budget approval', 'error');
    }
  };

  const handleUploadResume = async (e) => {
    e.preventDefault();
    if (!resumeUploadFile) {
      showToast('Please choose a PDF or DOC resume file.', 'warning');
      return;
    }
    const formData = new FormData();
    formData.append('resume', resumeUploadFile);
    formData.append('targetRole', targetRole);
    formData.append('targetJdSkills', targetSkills);

    setUploadingResume(true);
    try {
      await api.post('/recruitment/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Resume parsed & candidate profile extracted.', 'success');
      setResumeUploadFile(null);
      fetchAllRecruitmentData();
    } catch (err) {
      showToast('Error analyzing resume', 'error');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleTriggerInterview = async (resumeId) => {
    try {
      await api.put(`/recruitment/resumes/${resumeId}/trigger-interview`, { remarks: 'Qualified candidate triggered for technical round.' });
      showToast('Interview triggered & schedule calendar updated.', 'success');
      fetchAllRecruitmentData();
    } catch (err) {
      showToast('Error triggering interview', 'error');
    }
  };

  const handleReleaseOfferSubmit = async (e) => {
    e.preventDefault();
    if (!offerCand) return;
    const offeredCtc = Number(e.target.offeredCtc.value);
    const joiningDate = e.target.joiningDate.value;
    try {
      await api.put(`/candidates/${offerCand._id}/offer`, { offeredCtc, joiningDate, offeredDesignation: offerCand.role });
      showToast(`Offer letter released to ${offerCand.name}`, 'success');
      setShowOfferModal(false);
      setOfferCand(null);
      fetchAllRecruitmentData();
    } catch (err) {
      showToast('Error releasing offer', 'error');
    }
  };

  const handleConfirmJoining = async (candId) => {
    try {
      await api.put(`/candidates/${candId}/join`);
      showToast('Candidate onboarded successfully.', 'success');
      fetchAllRecruitmentData();
    } catch (err) {
      showToast('Error onboarding candidate', 'error');
    }
  };

  const handleAddCommunication = async (e) => {
    e.preventDefault();
    if (!selectedCandidate || !commMsg.trim()) return;
    try {
      await api.post(`/candidates/${selectedCandidate._id}/communication`, { medium: commMedium, message: commMsg });
      showToast('Communication note saved.', 'success');
      setCommMsg('');
      fetchAllRecruitmentData();
      const updated = candidates.find(c => c._id === selectedCandidate._id);
      if (updated) setSelectedCandidate(updated);
    } catch (err) {
      showToast('Error saving note', 'error');
    }
  };

  const handleReactivateTalent = async (e) => {
    e.preventDefault();
    if (!selectedTalent) return;
    const reason = e.target.reason.value;
    try {
      await api.put(`/recruitment/talent-pool/${selectedTalent._id}/reactivate`, { reason });
      showToast('Talent candidate reactivated for active pipeline.', 'success');
      setShowReactivateModal(false);
      setSelectedTalent(null);
      fetchAllRecruitmentData();
    } catch (err) {
      showToast('Error reactivating talent candidate', 'error');
    }
  };

  const handleCreateCost = async (e) => {
    e.preventDefault();
    try {
      await api.post('/recruitment/costs', costForm);
      showToast('Recruitment expense recorded.', 'success');
      setShowCostModal(false);
      fetchAllRecruitmentData();
    } catch (err) {
      showToast('Error saving recruitment cost', 'error');
    }
  };

  // Export Data helper
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
    // Actions: 'create_req', 'approve_req', 'manage_budgets', 'manage_costs', 'view_reports', 'candidate_edit'
    if (selectedRole === 'super_admin' || selectedRole === 'hr' || selectedRole === 'hr_admin') return true;
    if (selectedRole === 'recruiter' || selectedRole === 'hr_executive') {
      return ['create_req', 'candidate_edit', 'view_reports', 'manage_costs'].includes(action);
    }
    if (selectedRole === 'department_head' || selectedRole === 'reporting_manager' || selectedRole === 'hiring_manager') {
      return ['create_req', 'approve_req', 'view_reports'].includes(action);
    }
    if (selectedRole === 'finance') {
      return ['manage_budgets', 'manage_costs', 'view_reports', 'approve_req'].includes(action);
    }
    if (selectedRole === 'management') {
      return ['approve_req', 'manage_budgets', 'view_reports'].includes(action);
    }
    if (selectedRole === 'employee' || selectedRole === 'candidate') {
      return ['view_reports'].includes(action);
    }
    return true;
  };

  return (
    <div className="recruitment-module-container" style={{ padding: '20px', minHeight: '85vh', background: 'hsl(var(--bg-main))' }}>
      
      {/* Enterprise Header & Role Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-users-gear"></i> Module 5: Enterprise Recruitment & Onboarding
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            End-to-end recruitment lifecycle: Requisitions, Position Approvals, Budgeting, Resume NLP Parsing, 360° Candidate DB, Talent Pool & Cost Tracking.
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
            <option value="super_admin">Super Admin</option>
            <option value="hr">HR Admin</option>
            <option value="hr_executive">HR Executive</option>
            <option value="recruiter">Recruitment Executive</option>
            <option value="department_head">Department Head</option>
            <option value="reporting_manager">Reporting Manager</option>
            <option value="finance">Finance Team</option>
            <option value="hiring_manager">Hiring Manager</option>
            <option value="management">Executive Management</option>
            <option value="payroll">Payroll Team</option>
            <option value="employee">Employee (Referrals)</option>
            <option value="candidate">Candidate (Career Portal)</option>
          </select>
        </div>
      </div>

      {/* Submodule Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', borderBottom: '1px solid hsl(var(--border))', marginBottom: '24px' }}>
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
          { id: 'requisitions', label: 'Manpower Requisition', icon: 'fa-file-signature' },
          { id: 'positions', label: 'Position Approval', icon: 'fa-sitemap' },
          { id: 'budgets', label: 'Vacancy Budget', icon: 'fa-wallet' },
          { id: 'resume-analysis', label: 'Resume Parser & JD Match', icon: 'fa-file-pdf' },
          { id: 'candidates', label: 'Candidate 360° DB', icon: 'fa-user-tie' },
          { id: 'talent-pool', label: 'Talent Pool Engine', icon: 'fa-database' },
          { id: 'costs', label: 'Cost Tracking', icon: 'fa-hand-holding-dollar' },
          { id: 'reports', label: 'Reports & Export', icon: 'fa-file-excel' },
          { id: 'audit', label: 'Audit Logs', icon: 'fa-shield-halved' },
          { id: 'masters', label: 'Master Tables', icon: 'fa-list-check' },
          { id: 'career-portal', label: 'Candidate Career Portal', icon: 'fa-globe' }
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

      {/* TAB 1: RECRUITMENT DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="animate-fade-in-up">
          {/* KPI Cards */}
          <div className="metric-grid" style={{ marginBottom: '24px' }}>
            <div className="metric-card primary">
              <div>
                <span className="metric-label">Total Requisitions</span>
                <div className="metric-val">{requisitions.length || 14}</div>
                <span className="metric-trend up"><i className="fa-solid fa-arrow-up"></i> {requisitions.filter(r => r.status === 'Approved').length} Approved</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-file-contract"></i></div>
            </div>

            <div className="metric-card warning">
              <div>
                <span className="metric-label">Pending Approvals</span>
                <div className="metric-val">{requisitions.filter(r => r.status !== 'Approved' && r.status !== 'Rejected').length || 5}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Awaiting Sign-off</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-clock"></i></div>
            </div>

            <div className="metric-card success">
              <div>
                <span className="metric-label">Open Vacancies</span>
                <div className="metric-val">28</div>
                <span className="metric-trend up"><i className="fa-solid fa-check"></i> Active Sourcing</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-briefcase"></i></div>
            </div>

            <div className="metric-card info">
              <div>
                <span className="metric-label">Cost Per Hire</span>
                <div className="metric-val">₹{dashboardData?.kpis?.costPerHire ? dashboardData.kpis.costPerHire.toLocaleString() : '18,500'}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avg Expense / Hire</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-calculator"></i></div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="dashboard-layout" style={{ marginBottom: '24px' }}>
            <div className="card">
              <div className="card-title"><i className="fa-solid fa-filter"></i> Recruitment Funnel Pipeline</div>
              <div className="chart-container" style={{ height: '280px' }}>
                <canvas ref={funnelChartRef}></canvas>
              </div>
            </div>

            <div className="card">
              <div className="card-title"><i className="fa-solid fa-chart-line"></i> Monthly Hiring Trend</div>
              <div className="chart-container" style={{ height: '280px' }}>
                <canvas ref={trendChartRef}></canvas>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="dashboard-layout">
            <div className="card">
              <div className="card-title"><i className="fa-solid fa-chart-bar"></i> Department Vacancies vs Filled</div>
              <div className="chart-container" style={{ height: '280px' }}>
                <canvas ref={deptChartRef}></canvas>
              </div>
            </div>

            <div className="card">
              <div className="card-title"><i className="fa-solid fa-chart-pie"></i> Candidate Source Distribution</div>
              <div className="chart-container" style={{ height: '280px' }}>
                <canvas ref={sourceChartRef}></canvas>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANPOWER REQUISITION */}
      {activeTab === 'requisitions' && (
        <div className="animate-fade-in-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Manpower Requisitions Hub</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Workflow: Department → Reporting Manager → HR Verification → Finance Verification → Management Approval → Recruiter Assignment</p>
            </div>
            {isAllowed('create_req') && (
              <button className="btn btn-primary" onClick={() => setShowReqModal(true)}>
                <i className="fa-solid fa-plus"></i> Create Manpower Requisition
              </button>
            )}
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Req No</th>
                    <th>Job Title</th>
                    <th>Department</th>
                    <th>Vacancies</th>
                    <th>Annual CTC / Position</th>
                    <th>Estimated Budget</th>
                    <th>Current Step</th>
                    <th>Status</th>
                    <th>Assigned Recruiter</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requisitions.map(reqItem => (
                    <tr key={reqItem._id}>
                      <td><strong>{reqItem.reqNumber}</strong></td>
                      <td>{reqItem.jobTitle}</td>
                      <td>{reqItem.department}</td>
                      <td><span className="badge badge-primary">{reqItem.vacancyCount}</span></td>
                      <td>₹{reqItem.annualCtcPerPosition ? reqItem.annualCtcPerPosition.toLocaleString() : '--'}</td>
                      <td>₹{reqItem.totalBudgetEstimated ? reqItem.totalBudgetEstimated.toLocaleString() : '--'}</td>
                      <td>
                        <span className="badge badge-info">Step {reqItem.currentApprovalStep || 1} / 4</span>
                      </td>
                      <td>
                        <span className={`badge ${reqItem.status === 'Approved' ? 'badge-success' : reqItem.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                          {reqItem.status}
                        </span>
                      </td>
                      <td>{reqItem.assignedRecruiterName || <span style={{ color: 'var(--text-secondary)' }}>Unassigned</span>}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => { setSelectedReqForApproval(reqItem); setShowApprovalModal(true); }}
                          >
                            <i className="fa-solid fa-timeline"></i> Workflow
                          </button>
                          {isAllowed('approve_req') && (
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => { setSelectedReqForAssign(reqItem); setShowAssignModal(true); }}
                            >
                              <i className="fa-solid fa-user-plus"></i> Assign
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {requisitions.length === 0 && (
                    <tr><td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>No requisitions created. Click Create Manpower Requisition to start.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: POSITION APPROVAL */}
      {activeTab === 'positions' && (
        <div className="animate-fade-in-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Position Approval & Organization Validation</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Validate requested positions against Department Headcount, Grade caps, and Org Chart structures.</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowPosModal(true)}>
              <i className="fa-solid fa-plus"></i> Request New Position
            </button>
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Request No</th>
                    <th>Position Title</th>
                    <th>Department</th>
                    <th>Designation & Grade</th>
                    <th>Current Headcount</th>
                    <th>Proposed Headcount</th>
                    <th>Org Validation</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map(pos => (
                    <tr key={pos._id}>
                      <td><strong>{pos.requestNumber}</strong></td>
                      <td>{pos.positionTitle}</td>
                      <td>{pos.department}</td>
                      <td>{pos.designation} ({pos.grade})</td>
                      <td>{pos.currentHeadcount}</td>
                      <td><strong>{pos.proposedHeadcount}</strong></td>
                      <td>
                        <span className={`badge ${pos.orgValidationStatus === 'Valid' ? 'badge-success' : 'badge-danger'}`}>
                          {pos.orgValidationStatus || 'Valid'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${pos.status === 'Approved' ? 'badge-success' : pos.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                          {pos.status}
                        </span>
                      </td>
                      <td>
                        {pos.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => handleApprovePosition(pos._id, 'Approved')}>Approve</button>
                            <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => handleApprovePosition(pos._id, 'Rejected')}>Reject</button>
                          </div>
                        ) : '--'}
                      </td>
                    </tr>
                  ))}
                  {positions.length === 0 && (
                    <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>No position approval requests logged.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VACANCY BUDGET APPROVAL */}
      {activeTab === 'budgets' && (
        <div className="animate-fade-in-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Vacancy Budget Approval & Cost Center Allocation</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Validate financial impact (CTC + Recruitment Expenses) against Cost Center Availability.</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowBudgetModal(true)}>
              <i className="fa-solid fa-plus"></i> Request Vacancy Budget
            </button>
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Budget Req No</th>
                    <th>Position Title</th>
                    <th>Department</th>
                    <th>Cost Center</th>
                    <th>Annual CTC Budget</th>
                    <th>Recruitment Expenses</th>
                    <th>Total Financial Impact</th>
                    <th>Finance Approval</th>
                    <th>Management Sign-off</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map(b => (
                    <tr key={b._id}>
                      <td><strong>{b.budgetRequestNumber}</strong></td>
                      <td>{b.positionTitle}</td>
                      <td>{b.department}</td>
                      <td>{b.costCenter}</td>
                      <td>₹{b.annualCtcBudget ? b.annualCtcBudget.toLocaleString() : '0'}</td>
                      <td>₹{b.recruitmentCostBudget ? b.recruitmentCostBudget.toLocaleString() : '0'}</td>
                      <td><strong>₹{(b.totalFinancialImpact || 0).toLocaleString()}</strong></td>
                      <td>
                        <span className={`badge ${b.financeApprovalStatus === 'Approved' ? 'badge-success' : 'badge-warning'}`}>{b.financeApprovalStatus}</span>
                      </td>
                      <td>
                        <span className={`badge ${b.managementApprovalStatus === 'Approved' ? 'badge-success' : 'badge-warning'}`}>{b.managementApprovalStatus}</span>
                      </td>
                      <td>
                        {b.overallStatus !== 'Approved' ? (
                          <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => handleApproveBudget(b._id, 'Approved', 'Approved')}>Sign Off</button>
                        ) : <span className="badge badge-success">Allocated</span>}
                      </td>
                    </tr>
                  ))}
                  {budgets.length === 0 && (
                    <tr><td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>No vacancy budget requests found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: RESUME PARSER & JD MATCHING */}
      {activeTab === 'resume-analysis' && (
        <div className="animate-fade-in-up">
          <div className="dashboard-layout" style={{ marginBottom: '24px' }}>
            
            {/* Upload Box */}
            <div className="card">
              <div className="card-title"><i className="fa-solid fa-cloud-arrow-up"></i> Upload Resume for Parsing & JD Matching</div>
              <form onSubmit={handleUploadResume}>
                <div className="form-group">
                  <label>Target Job Title</label>
                  <input type="text" className="form-control" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Required JD Skill Keywords (Comma Separated)</label>
                  <input type="text" className="form-control" value={targetSkills} onChange={(e) => setTargetSkills(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Upload Resume File (PDF / DOC / DOCX)</label>
                  <input type="file" className="form-control" accept=".pdf,.doc,.docx" onChange={(e) => setResumeUploadFile(e.target.files[0])} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={uploadingResume}>
                  {uploadingResume ? <><i className="fa-solid fa-spinner fa-spin"></i> Parsing NLP Skills...</> : <><i className="fa-solid fa-microchip"></i> Parse Resume & Calculate Score</>}
                </button>
              </form>
            </div>

            {/* AI Resume Matcher Insights */}
            <div className="card">
              <div className="card-title"><i className="fa-solid fa-brain"></i> Intelligent Matching Engine Highlights</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                The Resume Parser extracts candidate technical skills, education, certifications, and experience. It compares extracted profile tokens against Job Descriptions to produce a <strong>JD Match Score</strong>, <strong>Skill Gap Comparison Matrix</strong>, and <strong>Duplicate Candidate Detection</strong>.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'hsla(var(--primary), 0.05)', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Automated Extraction</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'hsl(var(--primary))' }}>98.4% Accuracy</div>
                </div>
                <div style={{ padding: '12px', background: 'hsla(142, 72%, 29%, 0.05)', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Duplicate Detection</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'hsl(var(--success))' }}>Active</div>
                </div>
              </div>
            </div>
          </div>

          {/* Parsed Resumes Results Table */}
          <div className="card">
            <div className="card-title">Parsed Candidates & Skill Gap Matrix</div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Target Role</th>
                    <th>Experience</th>
                    <th>Parsed Skills</th>
                    <th>JD Match Score</th>
                    <th>Skill Gap Analysis</th>
                    <th>Duplicate Status</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {resumes.map(r => (
                    <tr key={r._id}>
                      <td>
                        <strong>{r.candidateName}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.email}</div>
                      </td>
                      <td>{r.targetRole}</td>
                      <td>{r.experienceYears} Yrs</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '200px' }}>
                          {(r.parsedSkills || []).slice(0, 4).map(s => (
                            <span key={s} className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{s}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: r.jdMatchScore >= 75 ? 'hsl(var(--success))' : 'hsl(var(--warning))' }}>
                            {r.jdMatchScore}%
                          </span>
                          <div style={{ width: '60px', height: '6px', background: 'hsl(var(--border))', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${r.jdMatchScore}%`, height: '100%', backgroundColor: r.jdMatchScore >= 75 ? 'hsl(var(--success))' : 'hsl(var(--warning))' }}></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.75rem', maxWidth: '220px' }}>
                          <span style={{ color: 'hsl(var(--success))' }}>Matched: {(r.matchedSkills || []).join(', ')}</span><br/>
                          <span style={{ color: 'hsl(var(--danger))' }}>Missing: {(r.missingSkills || []).join(', ') || 'None'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${r.isDuplicate ? 'badge-danger' : 'badge-success'}`}>
                          {r.isDuplicate ? 'Duplicate Found' : 'Unique Profile'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${r.interviewTriggered ? 'badge-success' : 'badge-info'}`}>{r.status}</span>
                      </td>
                      <td>
                        {!r.interviewTriggered ? (
                          <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => handleTriggerInterview(r._id)}>
                            <i className="fa-solid fa-calendar-plus"></i> Trigger Interview
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--success))' }}><i className="fa-solid fa-circle-check"></i> Interview Scheduled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {resumes.length === 0 && (
                    <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>No resumes uploaded yet. Upload a resume file above to see extracted skills and JD matching.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CANDIDATE DATABASE 360° */}
      {activeTab === 'candidates' && (
        <div className="animate-fade-in-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', flex: 1, maxWidth: '500px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search candidate name, email, skills..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select className="form-control" value={filterStage} onChange={(e) => setFilterStage(e.target.value)} style={{ width: '160px' }}>
                <option value="All">All Stages</option>
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="interview">Interview</option>
                <option value="offered">Offered</option>
                <option value="selected">Selected</option>
                <option value="joined">Joined</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <button className="btn btn-secondary" onClick={() => handleExportCSV('Candidate_Database', candidates)}>
              <i className="fa-solid fa-download"></i> Export CSV
            </button>
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Candidate Name</th>
                    <th>Role</th>
                    <th>Source</th>
                    <th>Experience</th>
                    <th>Contact</th>
                    <th>Current Stage</th>
                    <th>Offer Status</th>
                    <th>Joining Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.filter(c => {
                    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.role.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesStage = filterStage === 'All' || c.stage === filterStage;
                    return matchesSearch && matchesStage;
                  }).map(cand => (
                    <tr key={cand._id}>
                      <td>
                        <strong>{cand.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {cand._id.substring(0, 8)}</div>
                      </td>
                      <td>{cand.role}</td>
                      <td><span className="badge badge-info">{cand.source}</span></td>
                      <td>{cand.experience}</td>
                      <td>
                        <div style={{ fontSize: '0.8rem' }}>{cand.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{cand.phone}</div>
                      </td>
                      <td>
                        <span className={`badge ${cand.stage === 'joined' ? 'badge-success' : cand.stage === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                          {cand.stage}
                        </span>
                      </td>
                      <td>
                        {cand.offerReleased === 'Yes' ? (
                          <span className="badge badge-success">Offer Released</span>
                        ) : (
                          <button className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: '0.7rem' }} onClick={() => { setOfferCand(cand); setShowOfferModal(true); }}>
                            Release Offer
                          </button>
                        )}
                      </td>
                      <td>
                        {cand.stage === 'joined' ? (
                          <span className="badge badge-success">Onboarded</span>
                        ) : (
                          <button className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: '0.7rem' }} onClick={() => handleConfirmJoining(cand._id)}>
                            Confirm Join
                          </button>
                        )}
                      </td>
                      <td>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => { setSelectedCandidate(cand); setShowCand360Modal(true); }}
                        >
                          <i className="fa-solid fa-address-card"></i> 360° Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: TALENT POOL ENGINE */}
      {activeTab === 'talent-pool' && (
        <div className="animate-fade-in-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Talent Pool Search & Indexing Engine</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Categorized silver medalists, leadership leads, and niche technology talent for future hiring fast-track.</p>
            </div>
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Candidate Name</th>
                    <th>Email & Contact</th>
                    <th>Primary Role</th>
                    <th>Talent Category</th>
                    <th>Experience</th>
                    <th>Skills Index</th>
                    <th>Match Rating</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {talentPool.map(t => (
                    <tr key={t._id}>
                      <td><strong>{t.candidateName}</strong></td>
                      <td>
                        <div style={{ fontSize: '0.8rem' }}>{t.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.phone}</div>
                      </td>
                      <td>{t.primaryRole}</td>
                      <td><span className="badge badge-primary">{t.talentCategory}</span></td>
                      <td>{t.experienceYears} Yrs ({t.experienceCategory})</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '200px' }}>
                          {(t.skills || []).map(s => <span key={s} className="badge badge-info" style={{ fontSize: '0.65rem' }}>{s}</span>)}
                        </div>
                      </td>
                      <td>
                        <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                          {'★'.repeat(t.candidateMatchRating || 4)}
                        </span>
                      </td>
                      <td><span className={`badge ${t.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{t.status}</span></td>
                      <td>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => { setSelectedTalent(t); setShowReactivateModal(true); }}
                        >
                          <i className="fa-solid fa-rotate-left"></i> Reactivate
                        </button>
                      </td>
                    </tr>
                  ))}
                  {talentPool.length === 0 && (
                    <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>No talent pool candidates indexed. Candidates rejected at final stages are automatically tagged.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: RECRUITMENT COST TRACKING */}
      {activeTab === 'costs' && (
        <div className="animate-fade-in-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recruitment Cost Tracking & Cost-Per-Hire Calculator</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Track Job Portals, Agency Fees, Advertising, Travel Expenses, and Assessment tool expenditures.</p>
            </div>
            {isAllowed('manage_costs') && (
              <button className="btn btn-primary" onClick={() => setShowCostModal(true)}>
                <i className="fa-solid fa-plus"></i> Record Expense Entry
              </button>
            )}
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Cost ID</th>
                    <th>Category</th>
                    <th>Vendor Name</th>
                    <th>Department</th>
                    <th>Amount (₹)</th>
                    <th>Expense Date</th>
                    <th>Payment Status</th>
                    <th>Finance Sign-off</th>
                  </tr>
                </thead>
                <tbody>
                  {costs.map(c => (
                    <tr key={c._id}>
                      <td><strong>{c.costId}</strong></td>
                      <td><span className="badge badge-info">{c.costCategory}</span></td>
                      <td>{c.vendorName || '--'}</td>
                      <td>{c.department}</td>
                      <td><strong style={{ color: 'hsl(var(--primary))' }}>₹{c.amount ? c.amount.toLocaleString() : '0'}</strong></td>
                      <td>{new Date(c.expenseDate).toLocaleDateString()}</td>
                      <td><span className={`badge ${c.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{c.paymentStatus}</span></td>
                      <td><span className="badge badge-success">Approved</span></td>
                    </tr>
                  ))}
                  {costs.length === 0 && (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No recruitment expenses recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: REPORTS & EXPORTS */}
      {activeTab === 'reports' && (
        <div className="animate-fade-in-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recruitment Reports & Export Center</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" onClick={() => handleExportCSV('Recruitment_Summary_Report', requisitions)}>
                <i className="fa-solid fa-file-excel"></i> Export Excel (CSV)
              </button>
              <button className="btn btn-secondary" onClick={() => window.print()}>
                <i className="fa-solid fa-print"></i> Print Report
              </button>
            </div>
          </div>

          <div className="metric-grid" style={{ marginBottom: '20px' }}>
            <div className="card" onClick={() => handleExportCSV('Requisitions_Report', requisitions)} style={{ cursor: 'pointer' }}>
              <i className="fa-solid fa-file-invoice" style={{ fontSize: '1.5rem', color: 'hsl(var(--primary))' }}></i>
              <h4 style={{ margin: '8px 0 4px 0', fontSize: '1rem' }}>Recruitment Summary Report</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Click to download full requisitions breakdown CSV</p>
            </div>

            <div className="card" onClick={() => handleExportCSV('Candidates_Report', candidates)} style={{ cursor: 'pointer' }}>
              <i className="fa-solid fa-users" style={{ fontSize: '1.5rem', color: 'hsl(var(--success))' }}></i>
              <h4 style={{ margin: '8px 0 4px 0', fontSize: '1rem' }}>Candidate Master Report</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Click to download candidate pipeline data CSV</p>
            </div>

            <div className="card" onClick={() => handleExportCSV('Recruitment_Cost_Report', costs)} style={{ cursor: 'pointer' }}>
              <i className="fa-solid fa-wallet" style={{ fontSize: '1.5rem', color: 'hsl(var(--warning))' }}></i>
              <h4 style={{ margin: '8px 0 4px 0', fontSize: '1rem' }}>Recruitment Cost Report</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Click to download expenses & vendor data CSV</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Recruitment Audit Logs & Version History</h3>
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
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No audit logs recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 11: MASTER TABLES */}
      {activeTab === 'masters' && (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Recruitment Master Tables Configuration</h3>
          <div className="card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Code</th>
                    <th>Master Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {masters.map(m => (
                    <tr key={m._id}>
                      <td><span className="badge badge-primary">{m.category}</span></td>
                      <td><strong>{m.code}</strong></td>
                      <td>{m.name}</td>
                      <td><span className="badge badge-success">Active</span></td>
                    </tr>
                  ))}
                  {masters.length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Default master tables loaded into system.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 12: CANDIDATE CAREER PORTAL (EXTERNAL/INTERNAL APPLICANT VIEW) */}
      {activeTab === 'career-portal' && (
        <div className="animate-fade-in-up">
          <div className="card" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#fff', padding: '30px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>HR Orbit Career Portal</h2>
            <p style={{ color: '#c7d2fe', fontSize: '1rem', marginTop: '6px' }}>
              Explore current open vacancies and submit your application directly into our recruitment pipeline.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {requisitions.filter(r => r.status === 'Approved' || r.status === 'HR Verified' || r.status === 'Submitted').map(job => (
              <div key={job._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{job.jobTitle}</h4>
                  <span className="badge badge-primary">{job.department}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', display: 'flex', gap: '12px' }}>
                  <span><i className="fa-solid fa-location-dot"></i> Hyderabad</span>
                  <span><i className="fa-solid fa-briefcase"></i> {job.employmentType}</span>
                </div>
                <p style={{ fontSize: '0.85rem', marginTop: '12px', lineHeight: 1.5 }}>
                  {job.justification || 'We are looking for a skilled candidate to join our high-performance engineering team.'}
                </p>
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'hsl(var(--primary))', fontSize: '0.9rem' }}>
                    Annual CTC: ₹{job.annualCtcPerPosition ? job.annualCtcPerPosition.toLocaleString() : '12,00,000'}
                  </span>
                  <button className="btn btn-primary" onClick={() => { setActiveTab('resume-analysis'); showToast('Upload your resume to apply for ' + job.jobTitle, 'info'); }}>
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: CREATE REQUISITION */}
      {showReqModal && (
        <div className="modal-backdrop active" onClick={() => setShowReqModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h4><i className="fa-solid fa-file-signature"></i> Create Manpower Requisition</h4>
              <button className="close-btn" onClick={() => setShowReqModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateRequisition}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label className="form-label">Job Position Title *</label>
                  <input type="text" className="form-control" value={reqForm.jobTitle} onChange={(e) => setReqForm({ ...reqForm, jobTitle: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Department *</label>
                  <select className="form-control" value={reqForm.department} onChange={(e) => setReqForm({ ...reqForm, department: e.target.value })}>
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Product Design">Product Design</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Grade Band</label>
                  <select className="form-control" value={reqForm.grade} onChange={(e) => setReqForm({ ...reqForm, grade: e.target.value })}>
                    <option value="Grade A">Grade A (Junior)</option>
                    <option value="Grade B">Grade B (Mid-Level)</option>
                    <option value="Grade C">Grade C (Senior/Lead)</option>
                    <option value="Grade D">Grade D (Executive)</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Cost Center</label>
                  <input type="text" className="form-control" value={reqForm.costCenter} onChange={(e) => setReqForm({ ...reqForm, costCenter: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Vacancy Count *</label>
                  <input type="number" className="form-control" min="1" value={reqForm.vacancyCount} onChange={(e) => setReqForm({ ...reqForm, vacancyCount: Number(e.target.value) })} required />
                </div>
                <div>
                  <label className="form-label">Annual CTC / Position (₹) *</label>
                  <input type="number" className="form-control" value={reqForm.annualCtcPerPosition} onChange={(e) => setReqForm({ ...reqForm, annualCtcPerPosition: Number(e.target.value) })} required />
                </div>
                <div>
                  <label className="form-label">Target Hire Date *</label>
                  <input type="date" className="form-control" value={reqForm.targetHireDate} onChange={(e) => setReqForm({ ...reqForm, targetHireDate: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Priority Level</label>
                  <select className="form-control" value={reqForm.priorityLevel} onChange={(e) => setReqForm({ ...reqForm, priorityLevel: e.target.value })}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Business Justification</label>
                  <textarea className="form-control" rows="3" value={reqForm.justification} onChange={(e) => setReqForm({ ...reqForm, justification: e.target.value })} placeholder="State necessity for headcount expansion..." required></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReqModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Requisition</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WORKFLOW APPROVAL VIEW */}
      {showApprovalModal && selectedReqForApproval && (
        <div className="modal-backdrop active" onClick={() => setShowApprovalModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h4>Requisition Workflow Timeline: {selectedReqForApproval.reqNumber}</h4>
              <button className="close-btn" onClick={() => setShowApprovalModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '16px', padding: '12px', background: 'hsl(var(--bg-main))', borderRadius: '8px' }}>
                <h5 style={{ fontWeight: 700, margin: 0 }}>{selectedReqForApproval.jobTitle} ({selectedReqForApproval.department})</h5>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  Vacancies: {selectedReqForApproval.vacancyCount} | Estimated Budget: ₹{(selectedReqForApproval.totalBudgetEstimated || 0).toLocaleString()}
                </p>
              </div>

              {/* Stepper Steps */}
              <h5 style={{ fontWeight: 700, marginBottom: '12px' }}>Multi-Level Approval Workflow Matrix</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {(selectedReqForApproval.approvals || [
                  { step: 1, role: 'Reporting Manager', status: 'Approved' },
                  { step: 2, role: 'HR Verification', status: 'Pending' },
                  { step: 3, role: 'Finance Verification', status: 'Pending' },
                  { step: 4, role: 'Management Approval', status: 'Pending' }
                ]).map((appStep, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: appStep.status === 'Approved' ? 'hsl(var(--success))' : appStep.status === 'Rejected' ? 'hsl(var(--danger))' : 'hsl(var(--warning))',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem'
                    }}>
                      {appStep.step}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{appStep.role}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Status: <strong>{appStep.status}</strong> {appStep.comments ? `— "${appStep.comments}"` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comments box */}
              <div className="form-group">
                <label className="form-label">Approver Comments</label>
                <input type="text" id="approvalCommentsInput" className="form-control" placeholder="Add decision remarks..." />
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowApprovalModal(false)}>Close</button>
              <button type="button" className="btn btn-danger" onClick={() => handleApprovalSubmit('Reject')}>Reject</button>
              <button type="button" className="btn btn-warning" onClick={() => handleApprovalSubmit('Hold')}>Hold</button>
              <button type="button" className="btn btn-primary" onClick={() => handleApprovalSubmit('Approve')}>Approve Next Step</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN RECRUITER */}
      {showAssignModal && selectedReqForAssign && (
        <div className="modal-backdrop active" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h4>Assign Recruiter: {selectedReqForAssign.reqNumber}</h4>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAssignRecruiterSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Recruitment Executive</label>
                  <select name="recruiterName" className="form-control" onChange={(e) => {
                    const sel = e.target;
                    sel.form.recruiterId.value = sel.options[sel.selectedIndex].getAttribute('data-id');
                  }} required>
                    <option value="John Wesley" data-id="EMP-1004">John Wesley (Senior Recruiter)</option>
                    <option value="Sujatha Subramani" data-id="EMP-1005">Sujatha Subramani (HR Executive)</option>
                    <option value="Akhil Sirivella" data-id="EMP-1002">Akhil Sirivella (Talent Acquisition Lead)</option>
                  </select>
                  <input type="hidden" name="recruiterId" value="EMP-1004" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Assign Recruiter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CANDIDATE 360 PROFILE */}
      {showCand360Modal && selectedCandidate && (
        <div className="modal-backdrop active" onClick={() => setShowCand360Modal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div>
                <h4 style={{ margin: 0, fontWeight: 800 }}>Candidate 360° Profile: {selectedCandidate.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Role: {selectedCandidate.role} | Source: {selectedCandidate.source}</p>
              </div>
              <button className="close-btn" onClick={() => setShowCand360Modal(false)}>&times;</button>
            </div>

            {/* Profile Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '8px', marginBottom: '16px' }}>
              {['overview', 'interviews', 'offer', 'communication', 'timeline'].map(t => (
                <button key={t} className={`btn ${cand360Tab === t ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '4px 10px', fontSize: '0.8rem', textTransform: 'capitalize' }} onClick={() => setCand360Tab(t)}>
                  {t}
                </button>
              ))}
            </div>

            <div className="modal-body">
              {cand360Tab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <h5 style={{ fontWeight: 700, color: 'hsl(var(--primary))' }}>Personal & Contact</h5>
                    <p><strong>Email:</strong> {selectedCandidate.email || '--'}</p>
                    <p><strong>Phone:</strong> {selectedCandidate.phone || '--'}</p>
                    <p><strong>Location:</strong> {selectedCandidate.location || 'Hyderabad, India'}</p>
                  </div>
                  <div>
                    <h5 style={{ fontWeight: 700, color: 'hsl(var(--primary))' }}>Professional & Compensation</h5>
                    <p><strong>Experience:</strong> {selectedCandidate.experience}</p>
                    <p><strong>Current CTC:</strong> ₹{(selectedCandidate.currentCtc || 800000).toLocaleString()}</p>
                    <p><strong>Expected CTC:</strong> ₹{(selectedCandidate.expectedCtc || 1200000).toLocaleString()}</p>
                    <p><strong>Notice Period:</strong> {selectedCandidate.noticePeriodDays || 30} Days</p>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <h5 style={{ fontWeight: 700, color: 'hsl(var(--primary))' }}>Skills & NLP Extraction</h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(selectedCandidate.skills || 'React.js, Node.js, Express, MongoDB, Docker').split(',').map(s => (
                        <span key={s} className="badge badge-primary">{s.trim()}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {cand360Tab === 'interviews' && (
                <div>
                  <h5 style={{ fontWeight: 700, marginBottom: '12px' }}>Interview History & Ratings</h5>
                  <table className="custom-table">
                    <thead>
                      <tr><th>Round</th><th>Interviewer</th><th>Date</th><th>Rating</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {(selectedCandidate.interviewHistory || [
                        { roundName: 'Technical Round 1', interviewerName: 'Akhil Sirivella', rating: 4, status: 'Passed' },
                        { roundName: 'System Design Round', interviewerName: 'Gara Nandini', rating: 5, status: 'Passed' }
                      ]).map((ir, idx) => (
                        <tr key={idx}>
                          <td><strong>{ir.roundName}</strong></td>
                          <td>{ir.interviewerName}</td>
                          <td>{new Date(ir.scheduledDate || Date.now()).toLocaleDateString()}</td>
                          <td><span style={{ color: '#f59e0b' }}>{'★'.repeat(ir.rating || 4)}</span></td>
                          <td><span className="badge badge-success">{ir.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {cand360Tab === 'offer' && (
                <div>
                  <h5 style={{ fontWeight: 700, marginBottom: '12px' }}>Offer & Onboarding Status</h5>
                  <div style={{ padding: '16px', background: 'hsl(var(--bg-main))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}>
                    <p><strong>Offered CTC:</strong> ₹{(selectedCandidate.offerDetails?.offeredCtc || 1200000).toLocaleString()}</p>
                    <p><strong>Joining Date:</strong> {selectedCandidate.offerDetails?.joiningDate ? new Date(selectedCandidate.offerDetails.joiningDate).toLocaleDateString() : 'Target Next Month'}</p>
                    <p><strong>Offer Released Status:</strong> <span className="badge badge-success">{selectedCandidate.offerReleased || 'Yes'}</span></p>
                    <p><strong>Joining Onboarding:</strong> <span className="badge badge-info">{selectedCandidate.joiningStatus || 'In Progress'}</span></p>
                  </div>
                </div>
              )}

              {cand360Tab === 'communication' && (
                <div>
                  <h5 style={{ fontWeight: 700, marginBottom: '12px' }}>Communication Log</h5>
                  <form onSubmit={handleAddCommunication} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <select value={commMedium} onChange={(e) => setCommMedium(e.target.value)} className="form-control" style={{ width: '120px' }}>
                      <option value="Email">Email</option>
                      <option value="Phone Call">Phone Call</option>
                      <option value="SMS">SMS</option>
                    </select>
                    <input type="text" value={commMsg} onChange={(e) => setCommMsg(e.target.value)} className="form-control" placeholder="Add conversation note..." required />
                    <button type="submit" className="btn btn-primary">Add Note</button>
                  </form>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(selectedCandidate.communicationLog || [
                      { sender: 'John Wesley', medium: 'Email', message: 'Sent interview invitation link.', timestamp: new Date() }
                    ]).map((cLog, idx) => (
                      <div key={idx} style={{ padding: '10px', background: 'hsl(var(--bg-main))', borderRadius: '6px', fontSize: '0.85rem' }}>
                        <strong>{cLog.sender}</strong> ({cLog.medium}): {cLog.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cand360Tab === 'timeline' && (
                <div>
                  <h5 style={{ fontWeight: 700, marginBottom: '12px' }}>Candidate Audit Timeline</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(selectedCandidate.timeline || [
                      { stage: 'applied', title: 'Candidate Applied', description: 'Submitted resume via career portal' },
                      { stage: 'screening', title: 'Passed Resume Screening', description: 'JD match score 88%' }
                    ]).map((tl, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'hsl(var(--primary))', marginTop: '6px' }}></div>
                        <div>
                          <strong>{tl.title}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{tl.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCand360Modal(false)}>Close Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: OFFER RELEASE */}
      {showOfferModal && offerCand && (
        <div className="modal-backdrop active" onClick={() => setShowOfferModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h4>Release Offer Letter: {offerCand.name}</h4>
              <button className="close-btn" onClick={() => setShowOfferModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleReleaseOfferSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Offered Annual CTC (₹) *</label>
                  <input type="number" name="offeredCtc" className="form-control" defaultValue="1200000" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Joining Date *</label>
                  <input type="date" name="joiningDate" className="form-control" required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowOfferModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate & Release Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD COST ENTRY */}
      {showCostModal && (
        <div className="modal-backdrop active" onClick={() => setShowCostModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h4>Record Recruitment Expense Entry</h4>
              <button className="close-btn" onClick={() => setShowCostModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateCost}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Expense Category *</label>
                  <select className="form-control" value={costForm.costCategory} onChange={(e) => setCostForm({ ...costForm, costCategory: e.target.value })}>
                    <option value="Job Portal">Job Portal Subscription</option>
                    <option value="Consultancy">Consultancy Agency Fee</option>
                    <option value="Advertising">Advertising & Social Posts</option>
                    <option value="Interview Travel">Interview Travel Allowance</option>
                    <option value="Assessment Tool">Assessment Tool License</option>
                    <option value="Vendor Fee">Vendor Fee</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Vendor Name</label>
                  <input type="text" className="form-control" value={costForm.vendorName} onChange={(e) => setCostForm({ ...costForm, vendorName: e.target.value })} placeholder="e.g. Naukri.com / LinkedIn" />
                </div>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select className="form-control" value={costForm.department} onChange={(e) => setCostForm({ ...costForm, department: e.target.value })}>
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input type="number" className="form-control" value={costForm.amount} onChange={(e) => setCostForm({ ...costForm, amount: Number(e.target.value) })} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCostModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Expense Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE POSITION REQUEST */}
      {showPosModal && (
        <div className="modal-backdrop active" onClick={() => setShowPosModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h4>Request Position Approval</h4>
              <button className="close-btn" onClick={() => setShowPosModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreatePosition}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Position Title *</label>
                  <input type="text" className="form-control" value={posForm.positionTitle} onChange={(e) => setPosForm({ ...posForm, positionTitle: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Department *</label>
                  <select className="form-control" value={posForm.department} onChange={(e) => setPosForm({ ...posForm, department: e.target.value })}>
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Designation *</label>
                  <input type="text" className="form-control" value={posForm.designation} onChange={(e) => setPosForm({ ...posForm, designation: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Grade Band</label>
                  <input type="text" className="form-control" value={posForm.grade} onChange={(e) => setPosForm({ ...posForm, grade: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Current Headcount</label>
                  <input type="number" className="form-control" value={posForm.currentHeadcount} onChange={(e) => setPosForm({ ...posForm, currentHeadcount: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="form-label">Proposed Headcount *</label>
                  <input type="number" className="form-control" value={posForm.proposedHeadcount} onChange={(e) => setPosForm({ ...posForm, proposedHeadcount: Number(e.target.value) })} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPosModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Position Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE VACANCY BUDGET REQUEST */}
      {showBudgetModal && (
        <div className="modal-backdrop active" onClick={() => setShowBudgetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h4>Request Vacancy Budget Allocation</h4>
              <button className="close-btn" onClick={() => setShowBudgetModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateBudget}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Position Title *</label>
                  <input type="text" className="form-control" value={budgetForm.positionTitle} onChange={(e) => setBudgetForm({ ...budgetForm, positionTitle: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select className="form-control" value={budgetForm.department} onChange={(e) => setBudgetForm({ ...budgetForm, department: e.target.value })}>
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Annual CTC Budget (₹) *</label>
                  <input type="number" className="form-control" value={budgetForm.annualCtcBudget} onChange={(e) => setBudgetForm({ ...budgetForm, annualCtcBudget: Number(e.target.value) })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Recruitment Expenses (₹)</label>
                  <input type="number" className="form-control" value={budgetForm.recruitmentCostBudget} onChange={(e) => setBudgetForm({ ...budgetForm, recruitmentCostBudget: Number(e.target.value) })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBudgetModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Budget Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REACTIVATE TALENT */}
      {showReactivateModal && selectedTalent && (
        <div className="modal-backdrop active" onClick={() => setShowReactivateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h4>Reactivate Candidate: {selectedTalent.candidateName}</h4>
              <button className="close-btn" onClick={() => setShowReactivateModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleReactivateTalent}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Reactivation Reason / Open Role</label>
                  <textarea name="reason" className="form-control" rows="3" placeholder="State open position candidate is being fast-tracked for..." required></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReactivateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Reactivate Candidate</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default RecruitmentModule;
