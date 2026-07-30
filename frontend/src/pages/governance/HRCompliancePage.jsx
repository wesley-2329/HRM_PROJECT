import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useToast } from '../../components/Toast';
import { DataContext } from '../../context/DataContext';

const HRCompliancePage = ({ currentSubModule }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { employees } = useContext(DataContext);

  // Audits state
  const [audits, setAudits] = useState([]);
  const [loadingAudits, setLoadingAudits] = useState(false);
  const [auditStats, setAuditStats] = useState({ totalAudits: 0, openAudits: 0, closedAudits: 0, overdueAudits: 0, pendingActions: 0 });
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [auditSubTab, setAuditSubTab] = useState('dashboard'); // 'dashboard', 'plan', 'conduct', 'actions', 'reports'

  // Audit forms state
  const [auditForm, setAuditForm] = useState({ name: '', type: 'Internal', category: 'HR', date: '', department: 'Engineering', auditorName: '' });
  const [obsForm, setObsForm] = useState({ observation: '', severity: 'Medium', evidenceUrl: '' });
  const [capaForm, setCapaForm] = useState({ description: '', responsiblePerson: '', targetDate: '' });
  const [closureForm, setClosureForm] = useState({ closureRemarks: '', verificationNotes: '' });

  // Policies state
  const [policies, setPolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  // Form states
  const [policyForm, setPolicyForm] = useState({ name: '', content: '', effectiveDate: '', status: 'Active', changeSummary: '' });
  const [isEditMode, setIsEditMode] = useState(false);

  // Report statistics state
  const [reports, setReports] = useState({
    acceptedList: [],
    pendingList: [],
    policyCompliance: [],
    departmentCompliance: [],
    versionHistory: []
  });

  // Approval Matrix State variables
  const [matrixSubTab, setMatrixSubTab] = useState('dashboard'); // 'dashboard', 'matrices', 'design', 'setup', 'reports'
  const [matrices, setMatrices] = useState([]);
  const [masters, setMasters] = useState({ processes: [], roles: [], levels: [] });
  const [assignments, setAssignments] = useState([]);
  const [matrixReports, setMatrixReports] = useState({
    summary: { totalRequests: 0, pendingCount: 0, approvedCount: 0, rejectedCount: 0, escalationsCount: 0, overdueCount: 0 },
    turnaroundTimes: [],
    histories: [],
    escalations: []
  });
  const [depts, setDepts] = useState([]);
  const [designations, setDesignations] = useState([]);
  
  // Matrix Design Form State
  const [matrixForm, setMatrixForm] = useState({
    _id: '',
    moduleName: 'HR',
    processName: 'Leave Claim',
    department: 'All',
    effectiveDate: new Date().toISOString().split('T')[0],
    levels: [
      { levelNumber: 1, approverRole: 'Reporting Manager', approvalType: 'Single', slaDays: 3 }
    ],
    changeSummary: ''
  });
  const [isEditingMatrix, setIsEditingMatrix] = useState(false);
  const [viewingMatrixHistory, setViewingMatrixHistory] = useState(null);
  const [viewingAssignmentDetails, setViewingAssignmentDetails] = useState(null);
  const [searchMatrixQuery, setSearchMatrixQuery] = useState('');
  const [filterMatrixProcess, setFilterMatrixProcess] = useState('All');

  const fetchMatrixData = async () => {
    try {
      const mastersRes = await api.get('/approval-matrix/masters');
      setMasters(mastersRes.data);

      const matricesRes = await api.get('/approval-matrix/matrices');
      setMatrices(matricesRes.data);

      const assignmentsRes = await api.get('/approval-matrix/assignments');
      setAssignments(assignmentsRes.data);

      const reportsRes = await api.get('/approval-matrix/reports');
      setMatrixReports(reportsRes.data);

      const deptsRes = await api.get('/org/departments');
      setDepts(deptsRes.data);

      const desgRes = await api.get('/org/designations');
      setDesignations(desgRes.data);
    } catch (err) {
      console.error('Error fetching Approval Matrix data:', err);
    }
  };

  // Observation Tracker states
  const [obsList, setObsList] = useState([]);
  const [obsSummary, setObsSummary] = useState({ total: 0, open: 0, closed: 0, underReview: 0, overdue: 0 });
  const [obsInnerTab, setObsInnerTab] = useState('dashboard');
  const [selectedObs, setSelectedObs] = useState(null);
  const [obsFormState, setObsFormState] = useState({
    title: '',
    description: '',
    department: 'Engineering',
    category: 'HR',
    priority: 'Medium',
    assigneeId: '',
    dueDate: ''
  });
  const [obsActionForm, setObsActionForm] = useState({
    correctiveAction: '',
    rootCause: '',
    preventiveAction: '',
    evidenceUrl: ''
  });
  const [obsVerifyForm, setObsVerifyForm] = useState({
    comments: '',
    status: 'Closed',
    reopenReason: ''
  });
  const [obsReportsData, setObsReportsData] = useState({
    departmentReport: [],
    priorityReport: { Low: 0, Medium: 0, High: 0, Critical: 0 },
    overdueReport: [],
    pendingReport: []
  });

  // Action Closure Tracker states
  const [actionList, setActionList] = useState([]);
  const [actionSummary, setActionSummary] = useState({ total: 0, open: 0, inProgress: 0, pendingVerification: 0, closed: 0, overdue: 0, averageClosureDays: 0 });
  const [actionInnerTab, setActionInnerTab] = useState('dashboard');
  const [selectedAction, setSelectedAction] = useState(null);
  const [actionFormState, setActionFormState] = useState({
    observationType: 'Audit Observation',
    department: 'Engineering',
    description: '',
    priority: 'Medium',
    dueDate: ''
  });
  const [actionAssignForm, setActionAssignForm] = useState({
    assignedToId: '',
    responsibleDepartment: 'Engineering',
    dueDate: '',
    reviewerId: '',
    remarks: ''
  });
  const [actionProgressForm, setActionProgressForm] = useState({
    progressStatus: 'In Progress',
    completionPercentage: 0,
    updateNotes: '',
    evidenceUrl: ''
  });
  const [actionVerifyForm, setActionVerifyForm] = useState({
    comments: '',
    status: 'Closed',
    reopenReason: ''
  });
  const [actionReportsData, setActionReportsData] = useState({
    openList: [],
    overdueList: [],
    deptReport: []
  });

  const fetchObservations = async () => {
    try {
      const res = await api.get('/observations');
      setObsList(res.data.data);
      setObsSummary(res.data.summary);

      const repRes = await api.get('/observations/reports');
      setObsReportsData(repRes.data);
    } catch (err) {
      console.error('Error fetching observations:', err);
    }
  };

  const fetchActionClosures = async () => {
    try {
      const res = await api.get('/action-closures');
      setActionList(res.data.data);
      setActionSummary(res.data.summary);

      const repRes = await api.get('/action-closures/reports');
      setActionReportsData(repRes.data);
    } catch (err) {
      console.error('Error fetching action closures:', err);
    }
  };

  // Calendar dates mock
  const complianceEvents = [
    { id: 1, date: '2026-07-07', title: 'TDS Deposit Submission', type: 'Statutory', status: 'Completed', color: 'bg-emerald-500' },
    { id: 2, date: '2026-07-15', title: 'Provident Fund (PF) E-Return Filing', type: 'Statutory', status: 'Completed', color: 'bg-emerald-500' },
    { id: 3, date: '2026-07-15', title: 'Employee State Insurance (ESI) Payment', type: 'Statutory', status: 'Completed', color: 'bg-emerald-500' },
    { id: 4, date: '2026-07-25', title: 'Quarterly TDS Return (Form 24Q)', type: 'Taxation', status: 'Pending', color: 'bg-amber-500' },
    { id: 5, date: '2026-07-31', title: 'Professional Tax (PT) Deposit', type: 'Statutory', status: 'Pending', color: 'bg-amber-500' },
    { id: 6, date: '2026-08-05', title: 'Internal Audit Review Cycle Q2', type: 'Audit', status: 'Upcoming', color: 'bg-blue-500' }
  ];

  // Audit Logs mock
  const [auditLogs, setAuditLogs] = useState([
    { id: 'AUD-021', auditName: 'Quarterly Financial Statutory Review', auditor: 'Deloitte India LLP', date: '2026-06-18', score: '98%', status: 'Passed' },
    { id: 'AUD-022', auditName: 'ISO 27001 Data Security Certification', auditor: 'TÜV SÜD Group', date: '2026-05-10', score: '95%', status: 'Passed' },
    { id: 'AUD-023', auditName: 'National Labor Law Compliance Sweep', auditor: 'Govt Joint Commissioner of Labor', date: '2026-04-12', score: '100%', status: 'Passed' }
  ]);

  // Observations mock
  const [observations, setObservations] = useState([
    { id: 'OBS-102', area: 'Access Controls', severity: 'High', desc: 'Active employee list includes 2 accounts with missing active designations in system logs.', observer: 'TÜV SÜD Group', targetDate: '2026-08-15', status: 'Open' },
    { id: 'OBS-103', area: 'ESI Registers', severity: 'Medium', desc: 'Manual registers at Branch Bangalore not signed off for May payroll cycle logs.', observer: 'Internal Governance Team', targetDate: '2026-07-30', status: 'Resolved' },
    { id: 'OBS-104', area: 'Fire Safety Code', severity: 'Low', desc: 'Evacuation route signage at floor 2 needs replacement with photoluminescent materials.', observer: 'National Safety Inspectors', targetDate: '2026-09-01', status: 'Open' }
  ]);

  // Action Closures mock
  const [actions, setActions] = useState([
    { id: 'ACT-901', sourceObs: 'OBS-103', CAPA: 'Implement dual-authorization digital signature for monthly ESI registers.', owner: 'Finance Lead (Arjun Mehta)', targetDate: '2026-07-15', status: 'Closed', closureDate: '2026-07-14' },
    { id: 'ACT-902', sourceObs: 'OBS-102', CAPA: 'Run automatic script sweep to crosscheck Employee database against Designation master records daily.', owner: 'Sys Admin Team', targetDate: '2026-08-01', status: 'In Progress', closureDate: '-' },
    { id: 'ACT-903', sourceObs: 'OBS-104', CAPA: 'Procure and install Glow-in-Dark directional signage templates.', owner: 'Facilities Manager (Rohan Sen)', targetDate: '2026-08-20', status: 'Pending', closureDate: '-' }
  ]);

  // Internal Audit Reports mock
  const auditReports = [
    { filename: 'Q1_Statutory_Compliance_Report_2026.pdf', date: '2026-04-15', size: '1.4 MB', author: 'Anjali Sharma (Internal Auditor)' },
    { filename: 'ISO_27001_Compliance_Statement_2026.pdf', date: '2026-05-15', size: '890 KB', author: 'Vipul Shah (CISO)' },
    { filename: 'POSH_Annual_Compliance_Audit_2026.pdf', date: '2026-06-30', size: '2.1 MB', author: 'POSH ICC Committee' }
  ];

  // Load Audits
  const fetchAudits = async () => {
    setLoadingAudits(true);
    try {
      const res = await api.get('/audits');
      setAudits(res.data);
    } catch (err) {
      showToast('Error loading audits.', 'error');
    } finally {
      setLoadingAudits(false);
    }
  };

  const fetchAuditStats = async () => {
    try {
      const res = await api.get('/audits/stats');
      setAuditStats(res.data);
    } catch (err) {
      console.error('Error fetching audit stats:', err);
    }
  };

  const handleCreateAudit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/audits', auditForm);
      showToast('New audit plan created successfully', 'success');
      setAuditForm({ name: '', type: 'Internal', category: 'HR', date: '', department: 'Engineering', auditorName: '' });
      setAuditSubTab('dashboard');
      fetchAudits();
      fetchAuditStats();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating audit plan', 'error');
    }
  };

  const handleChecklistStatusChange = async (itemId, newStatus) => {
    if (!selectedAudit) return;
    try {
      const updatedChecklist = selectedAudit.checklist.map(item => 
        item._id === itemId ? { ...item, status: newStatus } : item
      );
      const res = await api.put(`/audits/${selectedAudit._id}/checklist`, { checklist: updatedChecklist });
      setSelectedAudit(res.data);
      setAudits(prev => prev.map(a => a._id === res.data._id ? res.data : a));
      fetchAuditStats();
    } catch (err) {
      showToast('Error updating checklist status.', 'error');
    }
  };

  const handleAddObservation = async (e) => {
    e.preventDefault();
    if (!selectedAudit) return;
    try {
      const res = await api.put(`/audits/${selectedAudit._id}/observations`, obsForm);
      setSelectedAudit(res.data);
      setAudits(prev => prev.map(a => a._id === res.data._id ? res.data : a));
      showToast('Observation recorded successfully.', 'success');
      setObsForm({ observation: '', severity: 'Medium', evidenceUrl: '' });
      fetchAuditStats();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error recording observation.', 'error');
    }
  };

  const handleMockUpload = () => {
    const mockUrls = [
      'https://talentsphere-vault.s3.amazonaws.com/evidence/fire_safety_signage_proof.jpg',
      'https://talentsphere-vault.s3.amazonaws.com/evidence/employee_handbook_signoffs.pdf',
      'https://talentsphere-vault.s3.amazonaws.com/evidence/tds_return_receipt_q1.pdf',
      'https://talentsphere-vault.s3.amazonaws.com/evidence/bg_verification_sample.pdf'
    ];
    const randomUrl = mockUrls[Math.floor(Math.random() * mockUrls.length)];
    setObsForm(prev => ({ ...prev, evidenceUrl: randomUrl }));
    showToast('Mock Evidence file uploaded successfully.', 'success');
  };

  const handleAddCAPA = async (e) => {
    e.preventDefault();
    if (!selectedAudit) return;
    try {
      const res = await api.put(`/audits/${selectedAudit._id}/actions`, capaForm);
      setSelectedAudit(res.data);
      setAudits(prev => prev.map(a => a._id === res.data._id ? res.data : a));
      showToast('CAPA action assigned successfully.', 'success');
      setCapaForm({ description: '', responsiblePerson: '', targetDate: '' });
      fetchAuditStats();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error assigning action.', 'error');
    }
  };

  const handleActionStatusUpdate = async (actionId, nextStatus, remarks) => {
    if (!selectedAudit) return;
    try {
      const res = await api.put(`/audits/${selectedAudit._id}/action-status/${actionId}`, { status: nextStatus, closureRemarks: remarks });
      setSelectedAudit(res.data);
      setAudits(prev => prev.map(a => a._id === res.data._id ? res.data : a));
      showToast(`Action status updated to ${nextStatus}`, 'success');
      fetchAuditStats();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating action status', 'error');
    }
  };

  const handleVerifyCloseAudit = async (e) => {
    e.preventDefault();
    if (!selectedAudit) return;
    try {
      const res = await api.put(`/audits/${selectedAudit._id}/verify-close`, closureForm);
      setSelectedAudit(res.data);
      setAudits(prev => prev.map(a => a._id === res.data._id ? res.data : a));
      showToast(`Audit ${res.data.auditNumber} closed successfully.`, 'success');
      setClosureForm({ closureRemarks: '', verificationNotes: '' });
      setAuditSubTab('dashboard');
      fetchAudits();
      fetchAuditStats();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error closing audit.', 'error');
    }
  };

  // Load Policies
  const fetchPolicies = async () => {
    setLoadingPolicies(true);
    try {
      const res = await api.get('/policies');
      setPolicies(res.data);
    } catch (err) {
      showToast('Error loading policies.', 'error');
    } finally {
      setLoadingPolicies(false);
    }
  };

  // Load Compliance Reports
  const fetchReports = async () => {
    try {
      const res = await api.get('/policies/compliance-reports');
      setReports(res.data);
    } catch (err) {
      showToast('Error loading compliance reports.', 'error');
    }
  };

  useEffect(() => {
    fetchPolicies();
    fetchReports();
    if (currentSubModule === 'hr-audit') {
      fetchAudits();
      fetchAuditStats();
    }
    if (currentSubModule === 'approval-matrix') {
      fetchMatrixData();
    }
    if (currentSubModule === 'observation-tracker') {
      fetchObservations();
    }
    if (currentSubModule === 'action-closure') {
      fetchActionClosures();
    }
  }, [currentSubModule]);

  // Toggle Policy Active/Inactive Status
  const togglePolicyStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.put(`/policies/${id}/status`, { status: nextStatus });
      showToast(`Policy status updated to ${nextStatus}`, 'success');
      fetchPolicies();
      fetchReports();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating status', 'error');
    }
  };

  // Submit Policy form (Create/Update)
  const handleSubmitPolicy = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/policies/${selectedPolicy._id}`, policyForm);
        showToast('Policy updated and new version published successfully', 'success');
      } else {
        await api.post('/policies', policyForm);
        showToast('New policy published successfully', 'success');
      }
      setShowCreateModal(false);
      setPolicyForm({ name: '', content: '', effectiveDate: '', status: 'Active', changeSummary: '' });
      fetchPolicies();
      fetchReports();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving policy', 'error');
    }
  };

  const handleEditClick = (policy) => {
    setSelectedPolicy(policy);
    setPolicyForm({
      name: policy.name,
      content: policy.content,
      effectiveDate: policy.effectiveDate ? new Date(policy.effectiveDate).toISOString().split('T')[0] : '',
      status: policy.status,
      changeSummary: ''
    });
    setIsEditMode(true);
    setShowCreateModal(true);
  };

  const handleCreateClick = () => {
    setIsEditMode(false);
    setPolicyForm({ name: '', content: '', effectiveDate: '', status: 'Active', changeSummary: '' });
    setShowCreateModal(true);
  };

  const viewHistory = (policy) => {
    setSelectedPolicy(policy);
    setShowHistoryModal(true);
  };

  const viewReports = (policy) => {
    setSelectedPolicy(policy);
    setShowReportModal(true);
  };

  // Approval Matrix Handlers
  const handleAddDesignerLevel = () => {
    const nextLevelNum = matrixForm.levels.length + 1;
    setMatrixForm(prev => ({
      ...prev,
      levels: [
        ...prev.levels,
        { levelNumber: nextLevelNum, approverRole: 'Reporting Manager', approvalType: 'Single', slaDays: 3 }
      ]
    }));
  };

  const handleRemoveDesignerLevel = (idx) => {
    const updated = matrixForm.levels
      .filter((_, i) => i !== idx)
      .map((lvl, i) => ({ ...lvl, levelNumber: i + 1 }));
    setMatrixForm(prev => ({ ...prev, levels: updated }));
  };

  const handleDesignerLevelChange = (idx, field, value) => {
    const updated = matrixForm.levels.map((lvl, i) => {
      if (i === idx) {
        return { ...lvl, [field]: value };
      }
      return lvl;
    });
    setMatrixForm(prev => ({ ...prev, levels: updated }));
  };

  const handleSaveMatrix = async (e) => {
    e.preventDefault();
    if (matrixForm.levels.length === 0) {
      showToast('You must add at least one level to the approval workflow.', 'error');
      return;
    }
    try {
      if (isEditingMatrix) {
        await api.put(`/approval-matrix/matrices/${matrixForm._id}`, matrixForm);
        showToast('Approval Matrix updated and new version published successfully.', 'success');
      } else {
        await api.post('/approval-matrix/matrices', matrixForm);
        showToast('Approval Matrix configuration created and published successfully.', 'success');
      }
      setMatrixForm({
        _id: '',
        moduleName: 'HR',
        processName: 'Leave Claim',
        department: 'All',
        effectiveDate: new Date().toISOString().split('T')[0],
        levels: [{ levelNumber: 1, approverRole: 'Reporting Manager', approvalType: 'Single', slaDays: 3 }],
        changeSummary: ''
      });
      setIsEditingMatrix(false);
      setMatrixSubTab('matrices');
      fetchMatrixData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving approval matrix.', 'error');
    }
  };

  const handleEditMatrixClick = (matrix) => {
    setMatrixForm({
      _id: matrix._id,
      moduleName: matrix.moduleName,
      processName: matrix.processName,
      department: matrix.department,
      effectiveDate: matrix.effectiveDate ? new Date(matrix.effectiveDate).toISOString().split('T')[0] : '',
      levels: matrix.levels,
      changeSummary: ''
    });
    setIsEditingMatrix(true);
    setMatrixSubTab('design');
  };

  const toggleMatrixActiveStatus = async (id) => {
    try {
      await api.put(`/approval-matrix/matrices/${id}/status`);
      showToast('Matrix status updated successfully.', 'success');
      fetchMatrixData();
    } catch (err) {
      showToast('Error changing matrix status.', 'error');
    }
  };

  const handleDeleteMatrix = async (id) => {
    if (!window.confirm('Are you sure you want to delete this approval matrix configuration?')) return;
    try {
      await api.delete(`/approval-matrix/matrices/${id}`);
      showToast('Approval Matrix deleted successfully.', 'success');
      fetchMatrixData();
    } catch (err) {
      showToast('Error deleting approval matrix.', 'error');
    }
  };

  // Quick navigation helper
  const handleTabChange = (tabId) => {
    navigate(`/hr/${tabId}`);
  };

  const tabsList = [
    { id: 'hr-audit', label: 'HR Audit', icon: 'fa-clipboard-check' },
    { id: 'compliance-calendar', label: 'Compliance Calendar', icon: 'fa-calendar-days' },
    { id: 'approval-matrix', label: 'Approval Matrix', icon: 'fa-sitemap' },
    { id: 'policy-repository', label: 'Policy Repository', icon: 'fa-book-bookmark' },
    { id: 'observation-tracker', label: 'Observation Tracker', icon: 'fa-magnifying-glass' },
    { id: 'action-closure', label: 'Action Closure Tracker', icon: 'fa-square-check' },
    { id: 'internal-audit', label: 'Internal Audit Reports', icon: 'fa-file-invoice' }
  ];

  return (
    <div className="portal-container" style={{ padding: '0 0 24px 0' }}>
      {/* Header Info Panel */}
      <div className="welcome-card-banner" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #1e1b4b 100%)', color: '#fff', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px', marginBottom: '24px' }}>
        <div style={{ maxWidth: '70%' }}>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>HR Governance & Compliance Hub</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Ensure policy standardizations, maintain audit histories, schedule compliance returns, and review company regulatory standings.
          </p>
        </div>
        <div style={{ fontSize: '2.5rem', opacity: 0.2 }}><i className="fa-solid fa-shield-halved"></i></div>
      </div>

      {/* Top Horizontal Sub-tab bar */}
      <div className="card" style={{ padding: '8px', marginBottom: '24px', overflowX: 'auto', display: 'flex', gap: '6px' }}>
        {tabsList.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`btn ${currentSubModule === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              backgroundColor: currentSubModule === tab.id ? 'hsl(var(--primary))' : 'transparent',
              color: currentSubModule === tab.id ? '#fff' : 'hsl(var(--text-secondary))',
              border: 'none',
              borderRadius: '8px'
            }}
          >
            <i className={`fa-solid ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* -------------------- TAB 1: HR AUDIT -------------------- */}
      {currentSubModule === 'hr-audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          
          {/* HR Audit Sub-Tabs */}
          <div className="card" style={{ padding: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap', border: '1px solid var(--border-color)' }}>
            <button className={`btn ${auditSubTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setAuditSubTab('dashboard'); setSelectedAudit(null); }} style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fa-solid fa-chart-simple"></i> Dashboard & Plans
            </button>
            <button className={`btn ${auditSubTab === 'plan' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setAuditSubTab('plan'); setSelectedAudit(null); }} style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fa-solid fa-calendar-plus"></i> Plan New Audit
            </button>
            {selectedAudit && (
              <button className={`btn ${auditSubTab === 'conduct' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAuditSubTab('conduct')} style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fa-solid fa-clipboard-check"></i> Conduct: {selectedAudit.auditNumber}
              </button>
            )}
            <button className={`btn ${auditSubTab === 'actions' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setAuditSubTab('actions'); setSelectedAudit(null); }} style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fa-solid fa-list-check"></i> CAPA Action Tracker
            </button>
            <button className={`btn ${auditSubTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setAuditSubTab('reports'); setSelectedAudit(null); }} style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fa-solid fa-file-pdf"></i> Audit Reports
            </button>
          </div>

          {/* Sub-tab 1: Dashboard overview and active planned list */}
          {auditSubTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Metrics Grid */}
              <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="metric-card primary">
                  <div>
                    <span className="metric-label">Total Audits</span>
                    <div className="metric-val">{auditStats.totalAudits}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-clipboard-list"></i></div>
                </div>
                <div className="metric-card warning">
                  <div>
                    <span className="metric-label">Open Audits</span>
                    <div className="metric-val">{auditStats.openAudits}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-folder-open"></i></div>
                </div>
                <div className="metric-card danger">
                  <div>
                    <span className="metric-label">Overdue Audits</span>
                    <div className="metric-val">{auditStats.overdueAudits}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-circle-exclamation"></i></div>
                </div>
                <div className="metric-card info">
                  <div>
                    <span className="metric-label">Pending CAPA Actions</span>
                    <div className="metric-val">{auditStats.pendingActions}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-clock-rotate-left"></i></div>
                </div>
              </div>

              {/* Active Audit Registries Table */}
              <div className="card">
                <div className="card-title">Corporate Audit Registry Plans</div>
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Audit ID</th>
                        <th>Audit Name</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Scheduled Date</th>
                        <th>Department</th>
                        <th>Auditor</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingAudits ? (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center', padding: '24px' }}>
                            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '1.5rem', color: 'hsl(var(--primary))' }}></i>
                          </td>
                        </tr>
                      ) : audits.length === 0 ? (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>No audits scheduled. Plan a new audit to start.</td>
                        </tr>
                      ) : (
                        audits.map(a => {
                          const statusColors = {
                            'Planned': 'badge-info',
                            'In Progress': 'badge-warning',
                            'Observations Recorded': 'badge-primary',
                            'Actions Pending': 'badge-danger',
                            'Verification Pending': 'badge-warning',
                            'Closed': 'badge-success'
                          };
                          return (
                            <tr key={a._id}>
                              <td style={{ fontWeight: 'bold', color: 'hsl(var(--primary))' }}>{a.auditNumber}</td>
                              <td><strong>{a.name}</strong></td>
                              <td>{a.type}</td>
                              <td><span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{a.category}</span></td>
                              <td>{new Date(a.date).toLocaleDateString()}</td>
                              <td>{a.department}</td>
                              <td>{a.auditorName}</td>
                              <td>
                                <span className={`badge ${statusColors[a.status] || 'badge-secondary'}`}>{a.status}</span>
                              </td>
                              <td>
                                {a.status !== 'Closed' ? (
                                  <button
                                    onClick={() => { setSelectedAudit(a); setAuditSubTab('conduct'); }}
                                    className="btn btn-primary"
                                    style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <i className="fa-solid fa-play"></i> Conduct
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => { setSelectedAudit(a); setAuditSubTab('conduct'); }}
                                    className="btn btn-secondary"
                                    style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <i className="fa-solid fa-eye"></i> View Record
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 2: Plan Audit Form */}
          {auditSubTab === 'plan' && (
            <div className="card" style={{ maxWidth: '700px', margin: '0 auto', width: '100%' }}>
              <div className="card-title">Schedule New Regulatory Audit</div>
              <form onSubmit={handleCreateAudit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Audit Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Q3 Labor Law Compliance Audit" 
                      value={auditForm.name}
                      onChange={(e) => setAuditForm(prev => ({ ...prev, name: e.target.value }))}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Audit Type</label>
                    <select 
                      className="form-control" 
                      value={auditForm.type}
                      onChange={(e) => setAuditForm(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="Internal">Internal Audit</option>
                      <option value="Statutory">Statutory Audit</option>
                      <option value="External">External Certification</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Audit Category</label>
                    <select 
                      className="form-control" 
                      value={auditForm.category}
                      onChange={(e) => setAuditForm(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="HR">HR Governance & Files</option>
                      <option value="Payroll">Payroll & PT Compliance</option>
                      <option value="Attendance">Attendance & Roster Logs</option>
                      <option value="Compliance">POSH & Corporate Policies</option>
                      <option value="Recruitment">Recruitment & ATS Logs</option>
                      <option value="Statutory">Statutory Filing Registers</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Audit Target Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={auditForm.date}
                      onChange={(e) => setAuditForm(prev => ({ ...prev, date: e.target.value }))}
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Department Target</label>
                    <select 
                      className="form-control" 
                      value={auditForm.department}
                      onChange={(e) => setAuditForm(prev => ({ ...prev, department: e.target.value }))}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Finance & Payroll">Finance & Payroll</option>
                      <option value="Sales & Marketing">Sales & Marketing</option>
                      <option value="Operations & Facilities">Operations & Facilities</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Auditor Entity / Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. KPMG India / Internal Auditor" 
                      value={auditForm.auditorName}
                      onChange={(e) => setAuditForm(prev => ({ ...prev, auditorName: e.target.value }))}
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                  <i className="fa-solid fa-calendar-check" style={{ marginRight: '6px' }}></i> Create Audit Plan Document
                </button>
              </form>
            </div>
          )}

          {/* Sub-tab 3: Conduct Audit Workspace */}
          {auditSubTab === 'conduct' && selectedAudit && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left side: Checklist & Observation entry */}
              <div className="md:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Audit Context Details */}
                <div className="card" style={{ borderLeft: '4px solid hsl(var(--primary))' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedAudit.name}</h3>
                    <span className="badge badge-primary">{selectedAudit.auditNumber}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', flexWrap: 'wrap' }}>
                    <span><strong>Auditor:</strong> {selectedAudit.auditorName}</span>
                    <span><strong>Target Dept:</strong> {selectedAudit.department}</span>
                    <span><strong>Type:</strong> {selectedAudit.type} | <strong>Category:</strong> {selectedAudit.category}</span>
                    <span><strong>Scheduled:</strong> {new Date(selectedAudit.date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Checklist Questions */}
                <div className="card">
                  <div className="card-title">Step 3: Verification Checklist Items</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {selectedAudit.checklist.map((item, idx) => (
                      <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px', borderBottom: '1px solid var(--border-color)', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{idx + 1}. {item.question}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                            Requirement: {item.complianceRequirement}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {['Compliant', 'Non-Compliant', 'N/A'].map(opt => {
                            let btnStyle = { padding: '4px 8px', fontSize: '0.7rem' };
                            let activeClass = 'btn-secondary';
                            if (item.status === opt) {
                              activeClass = opt === 'Compliant' ? 'btn-success' : opt === 'Non-Compliant' ? 'btn-danger' : 'btn-info';
                            }
                            return (
                              <button
                                key={opt}
                                disabled={selectedAudit.status === 'Closed'}
                                onClick={() => handleChecklistStatusChange(item._id, opt)}
                                className={`btn ${activeClass}`}
                                style={btnStyle}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Observation entries */}
                <div className="card">
                  <div className="card-title">Step 4 & 5: Record Observations</div>
                  
                  {/* List of current recorded observations */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {selectedAudit.observations.map((obs, idx) => {
                      const sevColors = {
                        'Low': 'badge-info',
                        'Medium': 'badge-warning',
                        'High': 'badge-danger',
                        'Critical': 'badge-danger'
                      };
                      return (
                        <div key={idx} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className={`badge ${sevColors[obs.severity] || 'badge-secondary'}`}>{obs.severity} Finding</span>
                            {obs.evidenceUrl && (
                              <a href={obs.evidenceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <i className="fa-solid fa-paperclip"></i> Evidence Uploaded
                              </a>
                            )}
                          </div>
                          <p style={{ fontSize: '0.85rem', marginTop: '6px', color: 'hsl(var(--text-primary))' }}>{obs.observation}</p>
                        </div>
                      );
                    })}
                    {selectedAudit.observations.length === 0 && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '10px' }}>No observations recorded. Use form below to enter logs.</div>
                    )}
                  </div>

                  {/* Add Observation Form */}
                  {selectedAudit.status !== 'Closed' && (
                    <form onSubmit={handleAddObservation} style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <div className="form-group">
                        <label>Observation Log Details</label>
                        <textarea
                          className="form-control"
                          style={{ height: '70px' }}
                          placeholder="e.g. Employee folders missing signed NDA contracts under HR directory..."
                          value={obsForm.observation}
                          onChange={(e) => setObsForm(prev => ({ ...prev, observation: e.target.value }))}
                          required
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'end' }}>
                        <div className="form-group">
                          <label>Severity Level</label>
                          <select
                            className="form-control"
                            value={obsForm.severity}
                            onChange={(e) => setObsForm(prev => ({ ...prev, severity: e.target.value }))}
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label>Supporting Evidence Upload</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={handleMockUpload}
                              className="btn btn-secondary"
                              style={{ padding: '8px 12px', fontSize: '0.75rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                              <i className="fa-solid fa-cloud-arrow-up"></i>
                              {obsForm.evidenceUrl ? 'Uploaded!' : 'Upload File'}
                            </button>
                            {obsForm.evidenceUrl && (
                              <div style={{ color: 'var(--emerald-500)', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>
                                <i className="fa-solid fa-circle-check"></i>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '6px 14px', fontSize: '0.8rem' }}>
                        <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i> Log Observation
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Right side: Corrective action assign & Audit Closure */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Assign CAPA Form */}
                <div className="card">
                  <div className="card-title">Step 6: Assign Corrective Action (CAPA)</div>
                  
                  {/* Current Assigned Actions List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    {selectedAudit.actions.map((act, idx) => (
                      <div key={act._id} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                          <span>Owner: {act.responsiblePerson}</span>
                          <span className={`badge ${act.status === 'Closed' ? 'badge-success' : act.status === 'Resolved' ? 'badge-warning' : 'badge-danger'}`}>{act.status}</span>
                        </div>
                        <p style={{ marginTop: '4px' }}>{act.description}</p>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                          Target: {new Date(act.targetDate).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {selectedAudit.actions.length === 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>No corrective actions assigned.</div>
                    )}
                  </div>

                  {selectedAudit.status !== 'Closed' && (
                    <form onSubmit={handleAddCAPA} style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                      <div className="form-group">
                        <label>Action Checklist Item / CAPA</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="CAPA action item description" 
                          value={capaForm.description}
                          onChange={(e) => setCapaForm(prev => ({ ...prev, description: e.target.value }))}
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label>Responsible Owner</label>
                        <select 
                          className="form-control"
                          value={capaForm.responsiblePerson}
                          onChange={(e) => setCapaForm(prev => ({ ...prev, responsiblePerson: e.target.value }))}
                          required
                        >
                          <option value="">Select Assignee...</option>
                          {employees.filter(e => e.status === 'Approved').map(emp => (
                            <option key={emp.id} value={`${emp.name} (${emp.id})`}>{emp.name} ({emp.dept})</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>CAPA Target Date</label>
                        <input 
                          type="date" 
                          className="form-control" 
                          value={capaForm.targetDate}
                          onChange={(e) => setCapaForm(prev => ({ ...prev, targetDate: e.target.value }))}
                          required 
                        />
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '0.8rem' }}>
                        <i className="fa-solid fa-user-plus" style={{ marginRight: '6px' }}></i> Assign Action Item
                      </button>
                    </form>
                  )}
                </div>

                {/* Audit Closure panel */}
                <div className="card">
                  <div className="card-title">Step 8 & 9: HR Verification & Audit Closure</div>
                  
                  {selectedAudit.status === 'Closed' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald-500)', backgroundColor: 'rgba(16,185,129,0.06)', padding: '10px', borderRadius: '6px', fontSize: '0.8rem' }}>
                        <i className="fa-solid fa-circle-check"></i>
                        <strong>Audit Closed Successfully</strong>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                        <span><strong>Approved By:</strong> {selectedAudit.approvedBy}</span>
                        <span><strong>Closed Date:</strong> {new Date(selectedAudit.closedAt).toLocaleString()}</span>
                        <span><strong>Verification Notes:</strong> {selectedAudit.verificationNotes}</span>
                        <span><strong>Remarks:</strong> {selectedAudit.closureRemarks}</span>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleVerifyCloseAudit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="form-group">
                        <label>Verification Notes</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Summary check details..." 
                          value={closureForm.verificationNotes}
                          onChange={(e) => setClosureForm(prev => ({ ...prev, verificationNotes: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Closure Remarks</label>
                        <textarea 
                          className="form-control" 
                          style={{ height: '60px' }} 
                          placeholder="Remarks regarding compliance closure..." 
                          value={closureForm.closureRemarks}
                          onChange={(e) => setClosureForm(prev => ({ ...prev, closureRemarks: e.target.value }))}
                          required
                        />
                      </div>

                      {/* Display lock reminder if outstanding actions exist */}
                      {selectedAudit.actions.filter(a => a.status !== 'Closed').length > 0 && (
                        <div style={{ color: 'var(--rose-500)', fontSize: '0.75rem', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                          <i className="fa-solid fa-lock" style={{ marginTop: '2px' }}></i>
                          <span>Closure locked. You must close all CAPA action items in the action tracker first.</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="btn btn-success"
                        style={{ width: '100%', fontSize: '0.8rem' }}
                        disabled={selectedAudit.actions.filter(a => a.status !== 'Closed').length > 0}
                      >
                        <i className="fa-solid fa-square-check" style={{ marginRight: '6px' }}></i> Approve Audit Closure
                      </button>
                    </form>
                  )}
                </div>

                {/* Audit history logs */}
                <div className="card" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <div className="card-title" style={{ fontSize: '0.8rem' }}>Audit Trail History Log</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.725rem' }}>
                    {selectedAudit.historyLog.map((log, i) => (
                      <div key={i} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                          <span>Status: {log.status}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{new Date(log.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)' }}>{log.notes}</p>
                        <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>By: {log.updatedBy}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Sub-tab 4: CAPA Action Tracker Dashboard */}
          {auditSubTab === 'actions' && (
            <div className="card">
              <div className="card-title">Corrective & Preventive Action (CAPA) Log Tracker</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
                Track statutory gaps, CAPA owners, and approve action closures.
              </p>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Audit Ref</th>
                      <th>Action Description</th>
                      <th>Assigned Owner</th>
                      <th>Target Date</th>
                      <th>Status</th>
                      <th>Update Status / Resolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audits.every(a => a.actions.length === 0) ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>No corrective actions assigned in current audits.</td>
                      </tr>
                    ) : (
                      audits.flatMap(a => a.actions.map(act => (
                        <tr key={act._id}>
                          <td><strong style={{ color: 'hsl(var(--primary))' }}>{a.auditNumber}</strong></td>
                          <td><strong>{act.description}</strong></td>
                          <td>{act.responsiblePerson}</td>
                          <td>{new Date(act.targetDate).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${act.status === 'Closed' ? 'badge-success' : act.status === 'Resolved' ? 'badge-warning' : 'badge-danger'}`}>{act.status}</span>
                          </td>
                          <td>
                            {act.status === 'Pending' ? (
                              <form onSubmit={(e) => {
                                e.preventDefault();
                                const remarks = e.target.elements.remarks.value;
                                handleActionStatusUpdate(act._id, 'Resolved', remarks);
                              }} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input type="text" name="remarks" className="form-control" placeholder="Resolution comments..." style={{ padding: '4px 8px', fontSize: '0.75rem', width: '160px' }} required />
                                <button type="submit" className="btn btn-warning" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>Resolve</button>
                              </form>
                            ) : act.status === 'Resolved' ? (
                              <form onSubmit={(e) => {
                                e.preventDefault();
                                const remarks = e.target.elements.remarks.value;
                                handleActionStatusUpdate(act._id, 'Closed', remarks);
                              }} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input type="text" name="remarks" className="form-control" placeholder="Verification notes..." style={{ padding: '4px 8px', fontSize: '0.75rem', width: '160px' }} defaultValue={act.closureRemarks} required />
                                <button type="submit" className="btn btn-success" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>HR Close</button>
                              </form>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Resolved on {act.closureDate ? new Date(act.closureDate).toLocaleDateString() : 'N/A'}. Closed.
                              </span>
                            )}
                          </td>
                        </tr>
                      )))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-tab 5: Audit Reports print & preview */}
          {auditSubTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Regulatory Compliance & Audit Reports</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>Generate printable audit records and compliance standing sheets.</p>
                </div>
                <button className="btn btn-primary" onClick={() => window.print()}>
                  <i className="fa-solid fa-print" style={{ marginRight: '6px' }}></i> Print Audit Report
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Summary card */}
                <div className="card">
                  <div className="card-title">YTD Audit Summary Report</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      <span>Total Planned Audits:</span>
                      <strong>{auditStats.totalAudits}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      <span>Closed & Verified Audits:</span>
                      <strong style={{ color: 'var(--emerald-500)' }}>{auditStats.closedAudits}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      <span>Active In-Progress Audits:</span>
                      <strong style={{ color: 'var(--amber-500)' }}>{auditStats.openAudits - auditStats.overdueAudits}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      <span>Overdue Statutory Audits:</span>
                      <strong style={{ color: 'var(--rose-500)' }}>{auditStats.overdueAudits}</strong>
                    </div>
                  </div>
                </div>

                {/* Compliance rate */}
                <div className="card">
                  <div className="card-title">Corrective & Preventive Action Status</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      <span>Outstanding CAPA actions:</span>
                      <strong style={{ color: 'var(--rose-500)' }}>{auditStats.pendingActions}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      <span>Major Observations Severity Breakdown:</span>
                      <strong>
                        {audits.reduce((acc, a) => acc + a.observations.filter(o => o.severity === 'High' || o.severity === 'Critical').length, 0)} High Severity findings
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      <span>Department Closure Rate:</span>
                      <strong style={{ color: 'var(--emerald-500)' }}>
                        {Math.round(((audits.flatMap(a => a.actions).filter(a => a.status === 'Closed').length || 0) / (audits.flatMap(a => a.actions).length || 1)) * 100)}%
                      </strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Reports Preview Table */}
              <div className="card">
                <div className="card-title">Preview: Open Observation Compliance Register</div>
                <div className="table-responsive">
                  <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>Audit ID</th>
                        <th>Department</th>
                        <th>Observation details</th>
                        <th>Severity</th>
                        <th>Assigned Action</th>
                        <th>CAPA Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {audits.every(a => a.observations.length === 0) ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>No open observations registered.</td>
                        </tr>
                      ) : (
                        audits.flatMap(a => a.observations.map((obs, idx) => {
                          const action = a.actions[idx] || { description: 'No action assigned', status: 'N/A' };
                          const sevColors = {
                            'Low': 'badge-info',
                            'Medium': 'badge-warning',
                            'High': 'badge-danger',
                            'Critical': 'badge-danger'
                          };
                          return (
                            <tr key={idx}>
                              <td><strong>{a.auditNumber}</strong></td>
                              <td>{a.department}</td>
                              <td>{obs.observation}</td>
                              <td><span className={`badge ${sevColors[obs.severity] || 'badge-secondary'}`}>{obs.severity}</span></td>
                              <td>{action.description}</td>
                              <td><span className="badge badge-secondary">{action.status}</span></td>
                            </tr>
                          );
                        }))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* -------------------- TAB 2: COMPLIANCE CALENDAR -------------------- */}
      {currentSubModule === 'compliance-calendar' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card md:col-span-2">
            <div className="card-title">Compliance Filings Schedule</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
              Key statutory, labor registry, and tax filing timelines for corporate offices.
            </p>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Category</th>
                    <th>Due Date</th>
                    <th>Filing Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceEvents.map(ev => (
                    <tr key={ev.id}>
                      <td style={{ fontWeight: 600 }}>{ev.title}</td>
                      <td>{ev.type}</td>
                      <td>{new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td>
                        <span className={`badge ${ev.status === 'Completed' ? 'badge-success' : ev.status === 'Pending' ? 'badge-warning' : 'badge-info'}`}>
                          {ev.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Filing Calendar Insights</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--emerald-500)' }}></div>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>3 Completed</strong> this month.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--amber-500)' }}></div>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>2 Action Required</strong>. TDS Quarter 1 and PT returns.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--blue-500)' }}></div>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>1 Upcoming Review</strong>. Internal Audit Cycle Q2 in Aug.
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '16px' }}>
              <button className="btn btn-primary w-full" onClick={() => showToast('Syncing with statutory portal...', 'info')}>
                <i className="fa-solid fa-sync" style={{ marginRight: '6px' }}></i> Sync Govt Portal Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB 3: APPROVAL MATRIX -------------------- */}
      {currentSubModule === 'approval-matrix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          
          {/* Inner Approval Matrix Navigation Tab Bar */}
          <div className="card" style={{ padding: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap', border: '1px solid var(--border-color)' }}>
            <button 
              className={`btn ${matrixSubTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setMatrixSubTab('dashboard')} 
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-chart-pie"></i> Tracking Dashboard
            </button>
            <button 
              className={`btn ${matrixSubTab === 'matrices' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setMatrixSubTab('matrices')} 
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-sitemap"></i> Configured Matrices
            </button>
            <button 
              className={`btn ${matrixSubTab === 'design' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => {
                setMatrixForm({
                  _id: '',
                  moduleName: 'HR',
                  processName: 'Leave Claim',
                  department: 'All',
                  effectiveDate: new Date().toISOString().split('T')[0],
                  levels: [{ levelNumber: 1, approverRole: 'Reporting Manager', approvalType: 'Single', slaDays: 3 }],
                  changeSummary: ''
                });
                setIsEditingMatrix(false);
                setMatrixSubTab('design');
              }} 
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-pen-ruler"></i> Workflow Designer
            </button>
            <button 
              className={`btn ${matrixSubTab === 'setup' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setMatrixSubTab('setup')} 
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-users-gear"></i> Dept & Designation Setup
            </button>
            <button 
              className={`btn ${matrixSubTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setMatrixSubTab('reports')} 
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-file-invoice-dollar"></i> Governance Reports
            </button>
          </div>

          {/* ==================== SUBTAB 1: TRACKING DASHBOARD ==================== */}
          {matrixSubTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Metrics cards */}
              <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="metric-card primary">
                  <div>
                    <span className="metric-label">Total Workflows</span>
                    <div className="metric-val">{matrixReports.summary.totalRequests}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-network-wired"></i></div>
                </div>
                <div className="metric-card warning">
                  <div>
                    <span className="metric-label">Pending Decision</span>
                    <div className="metric-val">{matrixReports.summary.pendingCount}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-hourglass-half"></i></div>
                </div>
                <div className="metric-card success">
                  <div>
                    <span className="metric-label">Fully Approved</span>
                    <div className="metric-val">{matrixReports.summary.approvedCount}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-circle-check"></i></div>
                </div>
                <div className="metric-card danger">
                  <div>
                    <span className="metric-label">SLA Breaches</span>
                    <div className="metric-val">{matrixReports.summary.escalationsCount}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-circle-exclamation"></i></div>
                </div>
              </div>

              {/* Assignments active table */}
              <div className="card">
                <div className="card-title">Live Routed Transactions & Workflow Progress</div>
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Workflow ID</th>
                        <th>Transaction Source</th>
                        <th>Requester</th>
                        <th>Department</th>
                        <th>Current Step</th>
                        <th>Workflow Status</th>
                        <th>Date Initiated</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>No active routed transactions found.</td>
                        </tr>
                      ) : (
                        assignments.map(a => {
                          const statusColors = {
                            'Pending': 'badge-warning',
                            'Approved': 'badge-success',
                            'Rejected': 'badge-danger',
                            'Escalated': 'badge-danger',
                            'Overdue': 'badge-warning'
                          };
                          return (
                            <tr key={a._id}>
                              <td style={{ fontWeight: 'bold', color: 'hsl(var(--primary))' }}>{a._id.substring(18).toUpperCase()}</td>
                              <td><strong>{a.processName}</strong></td>
                              <td>{a.requesterName} ({a.requesterRole})</td>
                              <td>{a.requesterDept}</td>
                              <td>
                                <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                                  Step {a.currentLevel} of {a.levels.length}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${statusColors[a.status] || 'badge-secondary'}`}>{a.status}</span>
                              </td>
                              <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                              <td>
                                <button 
                                  className="btn btn-primary" 
                                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                  onClick={() => setViewingAssignmentDetails(a)}
                                >
                                  <i className="fa-solid fa-magnifying-glass"></i> Track Flow
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SUBTAB 2: CONFIGURATION MATRIX LIST ==================== */}
          {matrixSubTab === 'matrices' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div className="card-title" style={{ margin: 0 }}>Approval Matrices Register</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Search process..." 
                    className="form-control" 
                    style={{ width: '200px', padding: '6px 12px', fontSize: '0.8rem' }}
                    value={searchMatrixQuery}
                    onChange={(e) => setSearchMatrixQuery(e.target.value)}
                  />
                  <select 
                    className="form-control" 
                    style={{ width: '150px', padding: '6px 12px', fontSize: '0.8rem' }}
                    value={filterMatrixProcess}
                    onChange={(e) => setFilterMatrixProcess(e.target.value)}
                  >
                    <option value="All">All Processes</option>
                    {masters.processes.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th>Process Name</th>
                      <th>Scope (Dept)</th>
                      <th>Active Levels</th>
                      <th>Current Version</th>
                      <th>Effective Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matrices
                      .filter(m => {
                        const matchesSearch = m.processName.toLowerCase().includes(searchMatrixQuery.toLowerCase());
                        const matchesFilter = filterMatrixProcess === 'All' || m.processName === filterMatrixProcess;
                        return matchesSearch && matchesFilter;
                      })
                      .map(m => (
                        <tr key={m._id}>
                          <td><strong>{m.moduleName}</strong></td>
                          <td><strong>{m.processName}</strong></td>
                          <td><span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{m.department}</span></td>
                          <td>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {m.levels.map(lvl => (
                                <span key={lvl.levelNumber} className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>
                                  L{lvl.levelNumber}: {lvl.approverRole}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>v{m.version}</td>
                          <td>{new Date(m.effectiveDate).toLocaleDateString()}</td>
                          <td>
                            <button
                              onClick={() => toggleMatrixActiveStatus(m._id)}
                              className={`badge ${m.status === 'Active' ? 'badge-success' : 'badge-danger'}`}
                              style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                            >
                              {m.status}
                            </button>
                          </td>
                          <td style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleEditMatrixClick(m)}>
                              Edit
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setViewingMatrixHistory(m)}>
                              History
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', backgroundColor: 'rgba(244,63,94,0.06)', color: 'var(--rose-500)', border: 'none' }} onClick={() => handleDeleteMatrix(m._id)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    {matrices.length === 0 && (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>No approval matrices configured yet. Use designer to build one.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== SUBTAB 3: INTERACTIVE VISUAL WORKFLOW DESIGNER ==================== */}
          {matrixSubTab === 'design' && (
            <div className="card">
              <div className="card-title">{isEditingMatrix ? `Modify Workflow Configuration: v${matrixForm.version || 1} -> v${(matrixForm.version || 1) + 1}` : 'Create Multi-Level Approval Authority Matrix'}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
                Design custom sequential workflows mapping department-specific request routing, approval types, and SLA limits.
              </p>

              <form onSubmit={handleSaveMatrix} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div className="form-group">
                    <label>Applicable Department Module</label>
                    <select 
                      className="form-control"
                      value={matrixForm.moduleName}
                      onChange={(e) => setMatrixForm(prev => ({ ...prev, moduleName: e.target.value }))}
                      required
                    >
                      <option value="HR">HR Governance</option>
                      <option value="Finance">Finance & Auditing</option>
                      <option value="Production">Production & Factory</option>
                      <option value="Purchase">Purchase & Assets</option>
                      <option value="Quality">Quality Assurance</option>
                      <option value="Maintenance">Maintenance & Operations</option>
                      <option value="Stores">Stores & Inventory</option>
                      <option value="Admin">Admin & Facilities</option>
                      <option value="Management">Management Core</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Transaction / Process Name</label>
                    <select
                      className="form-control"
                      value={matrixForm.processName}
                      onChange={(e) => setMatrixForm(prev => ({ ...prev, processName: e.target.value }))}
                      required
                    >
                      {masters.processes.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Scoped Department Mappings</label>
                    <select
                      className="form-control"
                      value={matrixForm.department}
                      onChange={(e) => setMatrixForm(prev => ({ ...prev, department: e.target.value }))}
                      required
                    >
                      <option value="All">All Departments (Global)</option>
                      {depts.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Effective Commencement Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={matrixForm.effectiveDate}
                      onChange={(e) => setMatrixForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {isEditingMatrix && (
                  <div className="form-group">
                    <label>Reason for Modification (Logged in Version History) <span style={{ color: 'red' }}>*</span></label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Adding Department Head checks as requested by management audits..."
                      value={matrixForm.changeSummary}
                      onChange={(e) => setMatrixForm(prev => ({ ...prev, changeSummary: e.target.value }))}
                      required={isEditingMatrix}
                    />
                  </div>
                )}

                {/* VISUAL WORKFLOW TIMELINE DESIGNER */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.9rem', color: 'hsl(var(--primary))' }}>Sequential Approval Hierarchy Designer</label>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
                    {matrixForm.levels.map((lvl, idx) => (
                      <div key={idx} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {idx > 0 && (
                          <div style={{ margin: '8px 0', color: 'hsl(var(--primary))', fontSize: '1.25rem' }}>
                            <i className="fa-solid fa-circle-chevron-down"></i>
                          </div>
                        )}
                        
                        <div className="card" style={{ width: '100%', maxWidth: '650px', border: '1px dashed hsl(var(--primary))', background: 'hsla(var(--primary), 0.01)', margin: 0, padding: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'hsl(var(--primary))' }}>LEVEL {lvl.levelNumber} APPROVAL</span>
                            {matrixForm.levels.length > 1 && (
                              <button 
                                type="button" 
                                className="btn" 
                                style={{ background: 'transparent', border: 'none', color: 'var(--rose-500)', fontSize: '0.9rem', cursor: 'pointer' }}
                                onClick={() => handleRemoveDesignerLevel(idx)}
                              >
                                <i className="fa-solid fa-trash-can"></i> Remove
                              </button>
                            )}
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                            <div className="form-group">
                              <label style={{ fontSize: '0.75rem' }}>Approver Role</label>
                              <select
                                className="form-control"
                                style={{ padding: '6px', fontSize: '0.8rem' }}
                                value={lvl.approverRole}
                                onChange={(e) => handleDesignerLevelChange(idx, 'approverRole', e.target.value)}
                              >
                                {masters.roles.map(r => <option key={r._id} value={r.name}>{r.name}</option>)}
                                <option value="" disabled>--- Custom Designations ---</option>
                                {designations.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                              </select>
                            </div>

                            <div className="form-group">
                              <label style={{ fontSize: '0.75rem' }}>Approval Type</label>
                              <select
                                className="form-control"
                                style={{ padding: '6px', fontSize: '0.8rem' }}
                                value={lvl.approvalType}
                                onChange={(e) => handleDesignerLevelChange(idx, 'approvalType', e.target.value)}
                              >
                                <option value="Single">Single Approver (Any one signoff)</option>
                                <option value="Multiple">Multiple (Parallel routing requirement)</option>
                              </select>
                            </div>

                            <div className="form-group">
                              <label style={{ fontSize: '0.75rem' }}>SLA Target limit (Days)</label>
                              <input 
                                type="number" 
                                className="form-control" 
                                style={{ padding: '6px', fontSize: '0.8rem' }}
                                min="1" 
                                max="30"
                                value={lvl.slaDays}
                                onChange={(e) => handleDesignerLevelChange(idx, 'slaDays', parseInt(e.target.value) || 3)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                      onClick={handleAddDesignerLevel}
                    >
                      <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i> Add Sequential Level
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ padding: '8px 24px', fontSize: '0.8rem', fontWeight: 'bold' }}
                    >
                      <i className="fa-solid fa-circle-check" style={{ marginRight: '6px' }}></i> Publish Matrix Configurations
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ==================== SUBTAB 4: DEPARTMENT & DESIGNATION SETUP ==================== */}
          {matrixSubTab === 'setup' && (
            <div className="split-layout-2col">
              {/* Department Table */}
              <div className="card">
                <div className="card-title">Corporate Departments Registry</div>
                <div className="table-responsive">
                  <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Department Name</th>
                        <th>Dept Head / Manager ID</th>
                        <th>Location</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {depts.map(d => (
                        <tr key={d._id}>
                          <td><strong>{d.code}</strong></td>
                          <td><strong>{d.name}</strong></td>
                          <td>{d.departmentHead || d.managerId || 'Unassigned'}</td>
                          <td>{d.location}</td>
                          <td>
                            <span className={`badge ${d.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                              {d.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Designations Table */}
              <div className="card">
                <div className="card-title">Administrative Roles & Designations</div>
                <div className="table-responsive">
                  <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Role / Designation</th>
                        <th>Grade Band</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {designations.map(d => (
                        <tr key={d._id}>
                          <td><strong>{d.code}</strong></td>
                          <td><strong>{d.name}</strong></td>
                          <td>{d.gradeBand || 'N/A'}</td>
                          <td>
                            <span className="badge badge-success">Active</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SUBTAB 5: COMPLIANCE REPORTS ==================== */}
          {matrixSubTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                
                {/* TAT Turnaround report */}
                <div className="card">
                  <div className="card-title">Report 3: Turnaround Time (TAT) Analysis</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '12px' }}>
                    Average completion speeds logged per completed transaction.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
                    {matrixReports.turnaroundTimes.slice(0, 5).map((tat, i) => (
                      <div key={i} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                          <span>{tat.requesterName} ({tat.processName})</span>
                          <span>{tat.durationDays} Days</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', borderRadius: '3px', backgroundColor: 'rgba(0,0,0,0.06)', overflow: 'hidden', marginTop: '4px' }}>
                          <div style={{ width: `${Math.min(100, (tat.durationDays / 10) * 100)}%`, height: '100%', backgroundColor: tat.durationDays <= 3 ? 'var(--emerald-500)' : tat.durationDays <= 7 ? 'var(--amber-500)' : 'var(--rose-500)' }}></div>
                        </div>
                      </div>
                    ))}
                    {matrixReports.turnaroundTimes.length === 0 && (
                      <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No turnaround logs compiled yet.</div>
                    )}
                  </div>
                </div>

                {/* Escalations report */}
                <div className="card">
                  <div className="card-title">Report 4: SLA Escalations Log</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '12px' }}>
                    Breached SLA deadlines resulting in automatic workflow escalations.
                  </p>
                  <div className="table-responsive" style={{ maxHeight: '200px' }}>
                    <table className="custom-table" style={{ fontSize: '0.75rem' }}>
                      <thead>
                        <tr>
                          <th>Lv</th>
                          <th>Breached Approver</th>
                          <th>Escalated To</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matrixReports.escalations.map((esc, i) => (
                          <tr key={i}>
                            <td>L{esc.levelNumber}</td>
                            <td><strong>{esc.originalApproverId}</strong></td>
                            <td><strong>{esc.escalatedToId}</strong></td>
                            <td>{new Date(esc.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {matrixReports.escalations.length === 0 && (
                          <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No SLA breaches logged.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Audit trail list */}
              <div className="card">
                <div className="card-title">Report 5: Approval Actions Audit Trail</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '16px' }}>
                  Veritable chronological log of every manager action, rejection summary comments, and status revision.
                </p>
                <div className="table-responsive">
                  <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Workflow Ref</th>
                        <th>Process</th>
                        <th>Approver Name</th>
                        <th>Action</th>
                        <th>Comments</th>
                        <th>Status Transition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matrixReports.histories.map((h, i) => (
                        <tr key={i}>
                          <td>{new Date(h.createdAt).toLocaleString()}</td>
                          <td><strong>{h.assignmentId.substring(18).toUpperCase()}</strong></td>
                          <td>{h.processName} (L{h.levelNumber})</td>
                          <td>{h.approverName} ({h.approverRole})</td>
                          <td>
                            <span className={`badge ${h.action === 'Approved' ? 'badge-success' : 'badge-danger'}`}>
                              {h.action}
                            </span>
                          </td>
                          <td><em>"{h.comments || 'No comments'}"</em></td>
                          <td>{h.oldStatus} <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.7rem' }}></i> {h.newStatus}</td>
                        </tr>
                      ))}
                      {matrixReports.histories.length === 0 && (
                        <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No logs registered.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== WORKFLOW DETAILS / TRACK VISUAL DIALOG ==================== */}
          {viewingAssignmentDetails && (
            <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="card" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Workflow Tracking: {viewingAssignmentDetails._id.substring(18).toUpperCase()}</h3>
                  <button className="btn" style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => setViewingAssignmentDetails(null)}>×</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem' }}>
                    <div><strong>Request Type:</strong> {viewingAssignmentDetails.processName}</div>
                    <div><strong>Submitted By:</strong> {viewingAssignmentDetails.requesterName}</div>
                    <div><strong>Department:</strong> {viewingAssignmentDetails.requesterDept} ({viewingAssignmentDetails.requesterRole})</div>
                    <div><strong>Current Status:</strong> <span className={`badge ${viewingAssignmentDetails.status === 'Approved' ? 'badge-success' : viewingAssignmentDetails.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{viewingAssignmentDetails.status}</span></div>
                  </div>

                  {/* VISUAL HIERARCHY TIMELINE */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '10px' }}>
                    <h5 style={{ fontWeight: 700, marginBottom: '14px', fontSize: '0.85rem' }}>Visual Approvals Path Progress</h5>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {viewingAssignmentDetails.levels.map((lvl) => {
                        let statusColor = 'hsl(var(--border))'; // Upcoming
                        let statusLabel = 'Upcoming';
                        let icon = 'fa-circle-dot';

                        if (lvl.status === 'Approved') {
                          statusColor = 'var(--emerald-500)';
                          statusLabel = 'Approved';
                          icon = 'fa-circle-check';
                        } else if (lvl.status === 'Rejected') {
                          statusColor = 'var(--rose-500)';
                          statusLabel = 'Rejected';
                          icon = 'fa-circle-xmark';
                        } else if (viewingAssignmentDetails.currentLevel === lvl.levelNumber && (viewingAssignmentDetails.status === 'Pending' || viewingAssignmentDetails.status === 'Escalated')) {
                          statusColor = 'var(--amber-500)';
                          statusLabel = 'Pending Action';
                          icon = 'fa-spinner fa-spin';
                        } else if (lvl.status === 'Skipped') {
                          statusColor = 'var(--slate-500)';
                          statusLabel = 'Skipped / Escalated';
                          icon = 'fa-circle-chevron-right';
                        }

                        return (
                          <div key={lvl.levelNumber} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div style={{ color: statusColor, fontSize: '1.2rem' }}>
                                <i className={`fa-solid ${icon}`}></i>
                              </div>
                              {lvl.levelNumber < viewingAssignmentDetails.levels.length && (
                                <div style={{ width: '2px', height: '35px', backgroundColor: 'var(--border-color)', margin: '4px 0' }}></div>
                              )}
                            </div>
                            
                            <div style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: `1px solid ${statusColor}`, background: 'hsla(0,0%,100%,0.01)', fontSize: '0.8rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                                <span>Level {lvl.levelNumber}: {lvl.approverRole}</span>
                                <span style={{ color: statusColor }}>{statusLabel}</span>
                              </div>
                              <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                Assigned Approvers: {lvl.assignedApprovers.join(', ') || 'Auto-resolved'}
                              </div>
                              {lvl.decisionDate && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                  Action taken on: {new Date(lvl.decisionDate).toLocaleString()}
                                </div>
                              )}
                              {lvl.comments && (
                                <div style={{ fontSize: '0.75rem', marginTop: '4px', fontStyle: 'italic', color: 'hsl(var(--text-primary))' }}>
                                  "{lvl.comments}"
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                  <button className="btn btn-secondary" onClick={() => setViewingAssignmentDetails(null)}>Close Tracker</button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== CONFIGURATION HISTORY VISUAL DIALOG ==================== */}
          {viewingMatrixHistory && (
            <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="card" style={{ width: '90%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Version Logs: {viewingMatrixHistory.processName}</h3>
                  <button className="btn" style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => setViewingMatrixHistory(null)}>×</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '0.8rem' }}>
                    <strong>Process Scope:</strong> {viewingMatrixHistory.processName} | Mapped Dept: {viewingMatrixHistory.department}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {viewingMatrixHistory.history.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '16px' }}>No prior version histories logged. This configuration is on its initial version (v1).</div>
                    ) : (
                      viewingMatrixHistory.history.map((log, i) => (
                        <div key={i} className="card" style={{ border: '1px solid var(--border-color)', margin: 0, padding: '12px', fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, borderBottom: '1px dashed var(--border-color)', paddingBottom: '6px', marginBottom: '8px' }}>
                            <span>Version v{log.version}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{new Date(log.updatedAt).toLocaleDateString()}</span>
                          </div>
                          <div><strong>Modified By:</strong> {log.updatedBy}</div>
                          <div><strong>Change Reason:</strong> <em>"{log.changeSummary}"</em></div>
                          
                          <div style={{ marginTop: '8px', padding: '6px 10px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.02)', fontSize: '0.75rem' }}>
                            <strong style={{ display: 'block', marginBottom: '4px' }}>Previous Levels Schema:</strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {log.oldValues?.levels?.map(l => (
                                <span key={l.levelNumber} className="badge badge-secondary">
                                  L{l.levelNumber}: {l.approverRole} ({l.slaDays}d)
                                </span>
                              )) || 'No levels log recorded'}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                  <button className="btn btn-secondary" onClick={() => setViewingMatrixHistory(null)}>Close Log</button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* -------------------- TAB 4: POLICY REPOSITORY -------------------- */}
      {currentSubModule === 'policy-repository' && (
        <div className="grid grid-cols-1 gap-6">
          {/* Controls Bar */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Company Policy Master</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>Create and manage standard policy templates, trigger employee acceptance checks.</p>
            </div>
            <button className="btn btn-primary" onClick={handleCreateClick}>
              <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i> Create Policy Document
            </button>
          </div>

          {/* Table List of Policies */}
          <div className="card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Policy Document Name</th>
                    <th>Current Version</th>
                    <th>Effective Date</th>
                    <th>Last Updated Date</th>
                    <th>Compliance Status</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPolicies ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '1.5rem', color: 'hsl(var(--primary))' }}></i>
                      </td>
                    </tr>
                  ) : policies.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No policies available. Create one to begin.</td>
                    </tr>
                  ) : (
                    policies.map(p => {
                      const complianceRate = reports.policyCompliance.find(pc => pc.policyId === p._id)?.complianceRate || 0;
                      return (
                        <tr key={p._id}>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td>v{p.version}</td>
                          <td>{new Date(p.effectiveDate).toLocaleDateString()}</td>
                          <td>{new Date(p.lastUpdatedDate).toLocaleDateString()}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '80px', height: '6px', borderRadius: '3px', backgroundColor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                                <div style={{ width: `${complianceRate}%`, height: '100%', backgroundColor: complianceRate > 80 ? 'var(--emerald-500)' : complianceRate > 50 ? 'var(--amber-500)' : 'var(--rose-500)' }}></div>
                              </div>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{complianceRate}%</span>
                            </div>
                          </td>
                          <td>
                            <button
                              onClick={() => togglePolicyStatus(p._id, p.status)}
                              className={`badge ${p.status === 'Active' ? 'badge-success' : 'badge-danger'}`}
                              style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                              title="Click to toggle active status"
                            >
                              {p.status}
                            </button>
                          </td>
                          <td style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleEditClick(p)}>
                              Edit
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => viewHistory(p)}>
                              History
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => viewReports(p)}>
                              Compliance Reports
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department-wise Compliance chart */}
          <div className="card">
            <div className="card-title">Department-wise Overall Policy Compliance</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '16px' }}>Showing completion rate percentage of active policies by department.</p>
            {reports.departmentCompliance.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No department statistics compiled. Ensure active policies and employee accounts exist.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports.departmentCompliance.map((dc, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                      <span>{dc.department}</span>
                      <span>{dc.complianceRate}% ({dc.acceptedCount} / {dc.requiredCount})</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', borderRadius: '5px', backgroundColor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                      <div style={{ width: `${dc.complianceRate}%`, height: '100%', background: 'linear-gradient(90deg, hsl(var(--primary)) 0%, #1e1b4b 100%)', borderRadius: '5px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------- TAB 5: OBSERVATION TRACKER -------------------- */}
      {currentSubModule === 'observation-tracker' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          
          {/* Tracker Sub-Tabs */}
          <div className="card" style={{ padding: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap', border: '1px solid var(--border-color)' }}>
            <button 
              className={`btn ${obsInnerTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => { setObsInnerTab('dashboard'); setSelectedObs(null); }}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-table-list"></i> Observation Dashboard
            </button>
            <button 
              className={`btn ${obsInnerTab === 'create' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => { setObsInnerTab('create'); setSelectedObs(null); }}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-circle-plus"></i> Create Observation
            </button>
            {selectedObs && (
              <>
                <button 
                  className={`btn ${obsInnerTab === 'action' ? 'btn-primary' : 'btn-secondary'}`} 
                  onClick={() => setObsInnerTab('action')}
                  style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <i className="fa-solid fa-wrench"></i> Action Closure Form
                </button>
                <button 
                  className={`btn ${obsInnerTab === 'verify' ? 'btn-primary' : 'btn-secondary'}`} 
                  onClick={() => setObsInnerTab('verify')}
                  style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <i className="fa-solid fa-signature"></i> Verification Review
                </button>
              </>
            )}
            <button 
              className={`btn ${obsInnerTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => { setObsInnerTab('analytics'); setSelectedObs(null); }}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-chart-line"></i> Analytics Dashboard
            </button>
            <button 
              className={`btn ${obsInnerTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => { setObsInnerTab('reports'); setSelectedObs(null); }}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-file-invoice"></i> Reports Panel
            </button>
          </div>

          {/* SCREEN 1: OBSERVATION DASHBOARD */}
          {obsInnerTab === 'dashboard' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div className="card-title" style={{ margin: 0 }}>Active Observations Register</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Search Title/Description..." 
                    className="form-control" 
                    style={{ width: '220px', padding: '6px 12px', fontSize: '0.8rem' }}
                    value={searchMatrixQuery} // reuse state
                    onChange={(e) => setSearchMatrixQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Obs ID</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Department</th>
                      <th>Assignee</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {obsList
                      .filter(o => o.title.toLowerCase().includes(searchMatrixQuery.toLowerCase()) || o.description.toLowerCase().includes(searchMatrixQuery.toLowerCase()))
                      .map(o => {
                        const prioColors = { Low: 'badge-secondary', Medium: 'badge-info', High: 'badge-warning', Critical: 'badge-danger' };
                        const statusColors = { Open: 'badge-secondary', Assigned: 'badge-info', 'In Progress': 'badge-warning', 'Under Review': 'badge-primary', Closed: 'badge-success', Reopened: 'badge-danger' };
                        return (
                          <tr key={o._id}>
                            <td style={{ fontWeight: 'bold', color: 'hsl(var(--primary))' }}>{o.observationId}</td>
                            <td>
                              <strong>{o.title}</strong>
                              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Created: {new Date(o.createdAt).toLocaleDateString()}</span>
                            </td>
                            <td><span className="badge badge-info">{o.category}</span></td>
                            <td><span className={`badge ${prioColors[o.priority]}`}>{o.priority}</span></td>
                            <td>{o.department}</td>
                            <td>{o.assigneeName || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Unassigned</span>}</td>
                            <td>{new Date(o.dueDate).toLocaleDateString()}</td>
                            <td><span className={`badge ${statusColors[o.status]}`}>{o.status}</span></td>
                            <td style={{ display: 'flex', gap: '6px' }}>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                                onClick={() => {
                                  setSelectedObs(o);
                                  setObsActionForm({
                                    correctiveAction: o.correctiveAction || '',
                                    rootCause: o.rootCause || '',
                                    preventiveAction: o.preventiveAction || '',
                                    evidenceUrl: o.evidenceUrl || ''
                                  });
                                  setObsInnerTab('action');
                                }}
                              >
                                Action Form
                              </button>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                                onClick={() => {
                                  setSelectedObs(o);
                                  setObsVerifyForm({
                                    comments: o.verificationComments || '',
                                    status: 'Closed',
                                    reopenReason: ''
                                  });
                                  setObsInnerTab('verify');
                                }}
                              >
                                Verify
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    {obsList.length === 0 && (
                      <tr><td colSpan="9" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>No compliance observations registered.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SCREEN 2: CREATE OBSERVATION */}
          {obsInnerTab === 'create' && (
            <div className="card" style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }}>
              <div className="card-title">Record Compliance Observation</div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api.post('/observations', obsFormState);
                  showToast('Observation recorded successfully.', 'success');
                  setObsFormState({ title: '', description: '', department: 'Engineering', category: 'HR', priority: 'Medium', assigneeId: '', dueDate: '' });
                  setObsInnerTab('dashboard');
                  fetchObservations();
                } catch (err) {
                  showToast(err.response?.data?.message || 'Error recording observation.', 'error');
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label>Observation Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Broken Fire Extinguisher seals floor 2" 
                    value={obsFormState.title}
                    onChange={(e) => setObsFormState(prev => ({ ...prev, title: e.target.value }))}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Description Details</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="Explain the compliance finding / observation details..."
                    value={obsFormState.description}
                    onChange={(e) => setObsFormState(prev => ({ ...prev, description: e.target.value }))}
                    required 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Department</label>
                    <select 
                      className="form-control"
                      value={obsFormState.department}
                      onChange={(e) => setObsFormState(prev => ({ ...prev, department: e.target.value }))}
                    >
                      {depts.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select 
                      className="form-control"
                      value={obsFormState.category}
                      onChange={(e) => setObsFormState(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="HR">HR & Labor Policies</option>
                      <option value="Compliance">Regulatory Compliance</option>
                      <option value="Safety">Safety & Inspections</option>
                      <option value="Quality">Quality Standards</option>
                      <option value="Production">Production Audits</option>
                      <option value="Admin">Admin Protocols</option>
                      <option value="Finance">Finance Gaps</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Priority</label>
                    <select 
                      className="form-control"
                      value={obsFormState.priority}
                      onChange={(e) => setObsFormState(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Critical">Critical Findings</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Assign to Responsible Employee</label>
                    <select 
                      className="form-control"
                      value={obsFormState.assigneeId}
                      onChange={(e) => setObsFormState(prev => ({ ...prev, assigneeId: e.target.value }))}
                    >
                      <option value="">Choose owner...</option>
                      {employees.filter(emp => emp.status === 'Approved').map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Due Date Target <span style={{ color: 'red' }}>*</span></label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={obsFormState.dueDate}
                    onChange={(e) => setObsFormState(prev => ({ ...prev, dueDate: e.target.value }))}
                    required 
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                  <i className="fa-solid fa-circle-check" style={{ marginRight: '6px' }}></i> Create Audit Observation
                </button>
              </form>
            </div>
          )}

          {/* SCREEN 3: ACTION CLOSURE FORM */}
          {obsInnerTab === 'action' && selectedObs && (
            <div className="card" style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }}>
              <div className="card-title">Observation Actions Taken: {selectedObs.observationId}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                <strong>Finding Details:</strong> {selectedObs.description}
              </p>

              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api.put(`/observations/${selectedObs._id}/action`, obsActionForm);
                  showToast('Corrective action and evidence submitted for review.', 'success');
                  setObsInnerTab('dashboard');
                  setSelectedObs(null);
                  fetchObservations();
                } catch (err) {
                  showToast(err.response?.data?.message || 'Error submitting action.', 'error');
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label>Corrective Action Taken</label>
                  <textarea 
                    className="form-control" 
                    rows="2" 
                    placeholder="Details regarding actions executed to resolve finding..."
                    value={obsActionForm.correctiveAction}
                    onChange={(e) => setObsActionForm(prev => ({ ...prev, correctiveAction: e.target.value }))}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Root Cause Analysis</label>
                  <textarea 
                    className="form-control" 
                    rows="2" 
                    placeholder="Why did this compliance finding occur..."
                    value={obsActionForm.rootCause}
                    onChange={(e) => setObsActionForm(prev => ({ ...prev, rootCause: e.target.value }))}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Preventive Action Plan</label>
                  <textarea 
                    className="form-control" 
                    rows="2" 
                    placeholder="Action logs proposed to ensure this does not repeat..."
                    value={obsActionForm.preventiveAction}
                    onChange={(e) => setObsActionForm(prev => ({ ...prev, preventiveAction: e.target.value }))}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Supporting Evidence (Document Link/Proof URL)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="https://s3.aws.com/talentsphere/evidence.pdf" 
                      value={obsActionForm.evidenceUrl}
                      onChange={(e) => setObsActionForm(prev => ({ ...prev, evidenceUrl: e.target.value }))}
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        const mockUrls = [
                          'https://talentsphere-gov.s3.amazonaws.com/evidence/fire_drill_conducted.pdf',
                          'https://talentsphere-gov.s3.amazonaws.com/evidence/safety_certificates.jpg',
                          'https://talentsphere-gov.s3.amazonaws.com/evidence/labor_contracts_signed.pdf'
                        ];
                        const url = mockUrls[Math.floor(Math.random() * mockUrls.length)];
                        setObsActionForm(prev => ({ ...prev, evidenceUrl: url }));
                        showToast('Evidence link attached.', 'info');
                      }}
                    >
                      Attach Mock File
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary">
                  Submit Resolution for Verification Review
                </button>
              </form>
            </div>
          )}

          {/* SCREEN 4: VERIFICATION REVIEW */}
          {obsInnerTab === 'verify' && selectedObs && (
            <div className="card" style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }}>
              <div className="card-title">Verification & Closure: {selectedObs.observationId}</div>
              
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.825rem' }}>
                <div><strong>Finding Details:</strong> {selectedObs.description}</div>
                <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                  <strong>Action Executed:</strong> {selectedObs.correctiveAction || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>No actions submitted yet.</span>}
                </div>
                {selectedObs.evidenceUrl && (
                  <div style={{ marginTop: '4px' }}>
                    <strong>Evidence URL:</strong> <a href={selectedObs.evidenceUrl} target="_blank" rel="noopener noreferrer">{selectedObs.evidenceUrl}</a>
                  </div>
                )}
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api.put(`/observations/${selectedObs._id}/verify`, obsVerifyForm);
                  showToast(`Observation status updated to: ${obsVerifyForm.status}`, 'success');
                  setObsInnerTab('dashboard');
                  setSelectedObs(null);
                  fetchObservations();
                } catch (err) {
                  showToast(err.response?.data?.message || 'Error processing verification.', 'error');
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div className="form-group">
                  <label>Closure Status Decision</label>
                  <select 
                    className="form-control"
                    value={obsVerifyForm.status}
                    onChange={(e) => setObsVerifyForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Closed">Approved Closure (Resolved)</option>
                    <option value="Reopened">Reopen Finding (Insufficient Actions)</option>
                  </select>
                </div>

                {obsVerifyForm.status === 'Reopened' && (
                  <div className="form-group">
                    <label>Reason to Reopen (Mandatory) <span style={{ color: 'red' }}>*</span></label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="e.g. Evidence photo is blurred, seals are still unchecked..." 
                      value={obsVerifyForm.reopenReason}
                      onChange={(e) => setObsVerifyForm(prev => ({ ...prev, reopenReason: e.target.value }))}
                      required={obsVerifyForm.status === 'Reopened'}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Verification Remarks / Comments</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="Enter review comments for audit logs..."
                    value={obsVerifyForm.comments}
                    onChange={(e) => setObsVerifyForm(prev => ({ ...prev, comments: e.target.value }))}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Save Verification Verdict
                </button>
              </form>

              {/* Complete Audit Log details */}
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h5 style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>Observation Progress History Logs</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', fontSize: '0.75rem' }}>
                  {selectedObs.history?.map((h, i) => (
                    <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                        <span>Status: {h.status}</span>
                        <span style={{ opacity: 0.6 }}>{new Date(h.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>{h.notes}</div>
                      <div style={{ opacity: 0.8, fontSize: '0.7rem' }}>By: {h.updatedBy}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* SCREEN 5: ANALYTICS DASHBOARD */}
          {obsInnerTab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="metric-card primary">
                  <div>
                    <span className="metric-label">Open Findings</span>
                    <div className="metric-val">{obsSummary.open}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-folder-open"></i></div>
                </div>
                <div className="metric-card success">
                  <div>
                    <span className="metric-label">Closed Findings</span>
                    <div className="metric-val">{obsSummary.closed}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-circle-check"></i></div>
                </div>
                <div className="metric-card danger">
                  <div>
                    <span className="metric-label">Overdue Target</span>
                    <div className="metric-val">{obsSummary.overdue}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-clock-rotate-left"></i></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Department Wise Status */}
                <div className="card">
                  <div className="card-title">Department Wise Observation Findings</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {obsReportsData.departmentReport?.map((dr, i) => (
                      <div key={i} style={{ fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span>{dr.department}</span>
                          <strong>{dr.count} Mapped</strong>
                        </div>
                        <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, (dr.count / (obsList.length || 1)) * 100)}%`, height: '100%', backgroundColor: 'hsl(var(--primary))' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority distribution */}
                <div className="card">
                  <div className="card-title">Priority Wise Status Breakdown</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {Object.keys(obsReportsData.priorityReport || {}).map((key) => {
                      const count = obsReportsData.priorityReport[key];
                      const colors = { Low: 'var(--emerald-500)', Medium: 'var(--blue-500)', High: 'var(--amber-500)', Critical: 'var(--rose-500)' };
                      return (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: colors[key] }}></div>
                            <span>{key}</span>
                          </div>
                          <strong>{count} Findings</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* REPORTS PANEL */}
          {obsInnerTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>HR Observations Compliance Reports</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>Review regulatory standalone lists and audit-ready closure histories.</p>
                </div>
                <button className="btn btn-primary" onClick={() => window.print()}>
                  <i className="fa-solid fa-print" style={{ marginRight: '6px' }}></i> Print Report Sheet
                </button>
              </div>

              {/* Overdue report */}
              <div className="card">
                <div className="card-title">Report 4: Overdue Target Observations</div>
                <div className="table-responsive">
                  <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Obs ID</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Responsible Person</th>
                        <th>Due Date</th>
                        <th>Priority</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {obsReportsData.overdueReport?.map(o => (
                        <tr key={o._id}>
                          <td><strong>{o.observationId}</strong></td>
                          <td><strong>{o.title}</strong></td>
                          <td>{o.category}</td>
                          <td>{o.assigneeName}</td>
                          <td style={{ color: 'var(--rose-500)', fontWeight: 600 }}>{new Date(o.dueDate).toLocaleDateString()}</td>
                          <td><span className="badge badge-danger">{o.priority}</span></td>
                          <td><span className="badge badge-warning">{o.status}</span></td>
                        </tr>
                      ))}
                      {(!obsReportsData.overdueReport || obsReportsData.overdueReport.length === 0) && (
                        <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No overdue findings logged.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pending report */}
              <div className="card">
                <div className="card-title">Report 3: Pending Verification Closure Review</div>
                <div className="table-responsive">
                  <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Obs ID</th>
                        <th>Title</th>
                        <th>Department</th>
                        <th>Completed Date</th>
                        <th>Priority</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {obsReportsData.pendingReport?.map(o => (
                        <tr key={o._id}>
                          <td><strong>{o.observationId}</strong></td>
                          <td><strong>{o.title}</strong></td>
                          <td>{o.department}</td>
                          <td>{o.completionDate ? new Date(o.completionDate).toLocaleDateString() : 'N/A'}</td>
                          <td><span className="badge badge-info">{o.priority}</span></td>
                          <td><span className="badge badge-primary">{o.status}</span></td>
                        </tr>
                      ))}
                      {(!obsReportsData.pendingReport || obsReportsData.pendingReport.length === 0) && (
                        <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No action closures pending verification.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* -------------------- TAB 6: ACTION CLOSURE TRACKER -------------------- */}
      {currentSubModule === 'action-closure' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          
          {/* Action Tracker Sub-Tabs */}
          <div className="card" style={{ padding: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap', border: '1px solid var(--border-color)' }}>
            <button 
              className={`btn ${actionInnerTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => { setActionInnerTab('dashboard'); setSelectedAction(null); }}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-table-list"></i> Action Dashboard
            </button>
            <button 
              className={`btn ${actionInnerTab === 'create' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => { setActionInnerTab('create'); setSelectedAction(null); }}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-circle-plus"></i> Create Action request
            </button>
            {selectedAction && (
              <>
                <button 
                  className={`btn ${actionInnerTab === 'assign' ? 'btn-primary' : 'btn-secondary'}`} 
                  onClick={() => setActionInnerTab('assign')}
                  style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <i className="fa-solid fa-user-tag"></i> Assign Task
                </button>
                <button 
                  className={`btn ${actionInnerTab === 'progress' ? 'btn-primary' : 'btn-secondary'}`} 
                  onClick={() => setActionInnerTab('progress')}
                  style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <i className="fa-solid fa-bars-progress"></i> Update Progress
                </button>
                <button 
                  className={`btn ${actionInnerTab === 'verify' ? 'btn-primary' : 'btn-secondary'}`} 
                  onClick={() => setActionInnerTab('verify')}
                  style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <i className="fa-solid fa-stamp"></i> Closure Approval
                </button>
              </>
            )}
            <button 
              className={`btn ${actionInnerTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => { setActionInnerTab('analytics'); setSelectedAction(null); }}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-chart-line"></i> Dashboard Metrics
            </button>
            <button 
              className={`btn ${actionInnerTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => { setActionInnerTab('reports'); setSelectedAction(null); }}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-file-invoice"></i> Reports Panel
            </button>
          </div>

          {/* SCREEN 1: ACTION DASHBOARD */}
          {actionInnerTab === 'dashboard' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div className="card-title" style={{ margin: 0 }}>Action Items Registry</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Search description..." 
                    className="form-control" 
                    style={{ width: '220px', padding: '6px 12px', fontSize: '0.8rem' }}
                    value={searchMatrixQuery} // reuse state
                    onChange={(e) => setSearchMatrixQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Action ID</th>
                      <th>Type</th>
                      <th>Department</th>
                      <th>Priority</th>
                      <th>Assigned To</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actionList
                      .filter(a => a.description.toLowerCase().includes(searchMatrixQuery.toLowerCase()))
                      .map(a => {
                        const prioColors = { Critical: 'badge-danger', High: 'badge-warning', Medium: 'badge-info', Low: 'badge-secondary' };
                        const statusColors = { Open: 'badge-secondary', 'In Progress': 'badge-info', 'Pending Verification': 'badge-primary', Closed: 'badge-success', Reopened: 'badge-danger' };
                        return (
                          <tr key={a._id}>
                            <td style={{ fontWeight: 'bold', color: 'hsl(var(--primary))' }}>{a.observationId}</td>
                            <td><strong>{a.observationType}</strong></td>
                            <td>{a.department}</td>
                            <td><span className={`badge ${prioColors[a.priority]}`}>{a.priority}</span></td>
                            <td>{a.assignedToName || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Unassigned</span>}</td>
                            <td>{new Date(a.dueDate).toLocaleDateString()}</td>
                            <td><span className={`badge ${statusColors[a.status]}`}>{a.status}</span></td>
                            <td style={{ display: 'flex', gap: '6px' }}>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                                onClick={() => {
                                  setSelectedAction(a);
                                  setActionAssignForm({
                                    assignedToId: a.assignedToId || '',
                                    responsibleDepartment: a.responsibleDepartment || a.department,
                                    dueDate: a.dueDate ? new Date(a.dueDate).toISOString().split('T')[0] : '',
                                    reviewerId: a.reviewerId || '',
                                    remarks: a.remarks || ''
                                  });
                                  setActionInnerTab('assign');
                                }}
                              >
                                Assign
                              </button>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                                onClick={() => {
                                  setSelectedAction(a);
                                  setActionProgressForm({
                                    progressStatus: 'In Progress',
                                    completionPercentage: 0,
                                    updateNotes: '',
                                    evidenceUrl: ''
                                  });
                                  setActionInnerTab('progress');
                                }}
                              >
                                Update
                              </button>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                                onClick={() => {
                                  setSelectedAction(a);
                                  setActionVerifyForm({
                                    comments: a.verificationRemarks || '',
                                    status: 'Closed',
                                    reopenReason: ''
                                  });
                                  setActionInnerTab('verify');
                                }}
                              >
                                Approve
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    {actionList.length === 0 && (
                      <tr><td colSpan="8" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>No Action Items recorded yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SCREEN 1: CREATE ACTION ENTRY */}
          {actionInnerTab === 'create' && (
            <div className="card" style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }}>
              <div className="card-title">Record Compliance Action Observation</div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api.post('/action-closures', actionFormState);
                  showToast('Action Observation recorded successfully.', 'success');
                  setActionFormState({ observationType: 'Audit Observation', department: 'Engineering', description: '', priority: 'Medium', dueDate: '' });
                  setActionInnerTab('dashboard');
                  fetchActionClosures();
                } catch (err) {
                  showToast(err.response?.data?.message || 'Error creating action request.', 'error');
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label>Observation Type</label>
                  <select 
                    className="form-control"
                    value={actionFormState.observationType}
                    onChange={(e) => setActionFormState(prev => ({ ...prev, observationType: e.target.value }))}
                  >
                    <option value="Audit Observation">Audit Observation</option>
                    <option value="Compliance Observation">Compliance Observation</option>
                    <option value="Safety Observation">Safety Observation</option>
                    <option value="HR Observation">HR Observation</option>
                    <option value="Employee Complaint">Employee Complaint</option>
                    <option value="Improve Suggestion">Improvement Suggestion</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <select 
                    className="form-control"
                    value={actionFormState.department}
                    onChange={(e) => setActionFormState(prev => ({ ...prev, department: e.target.value }))}
                  >
                    {depts.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Finding / Observation Description</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="Provide details regarding the observation..."
                    value={actionFormState.description}
                    onChange={(e) => setActionFormState(prev => ({ ...prev, description: e.target.value }))}
                    required 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Priority</label>
                    <select 
                      className="form-control"
                      value={actionFormState.priority}
                      onChange={(e) => setActionFormState(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Target Due Date <span style={{ color: 'red' }}>*</span></label>
                    <input 
                      type="date" 
                      className="form-control"
                      value={actionFormState.dueDate}
                      onChange={(e) => setActionFormState(prev => ({ ...prev, dueDate: e.target.value }))}
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                  <i className="fa-solid fa-circle-check" style={{ marginRight: '6px' }}></i> Record Observation Entry
                </button>
              </form>
            </div>
          )}

          {/* SCREEN 2: ACTION ASSIGNMENT */}
          {actionInnerTab === 'assign' && selectedAction && (
            <div className="card" style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }}>
              <div className="card-title">Assign Ownership: {selectedAction.observationId}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                <strong>Finding Details:</strong> {selectedAction.description}
              </p>

              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api.put(`/action-closures/${selectedAction._id}/assign`, actionAssignForm);
                  showToast('Action item assigned successfully.', 'success');
                  setActionInnerTab('dashboard');
                  setSelectedAction(null);
                  fetchActionClosures();
                } catch (err) {
                  showToast(err.response?.data?.message || 'Error assigning owner.', 'error');
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Assign to Employee</label>
                    <select 
                      className="form-control"
                      value={actionAssignForm.assignedToId}
                      onChange={(e) => setActionAssignForm(prev => ({ ...prev, assignedToId: e.target.value }))}
                      required
                    >
                      <option value="">Select owner...</option>
                      {employees.filter(emp => emp.status === 'Approved').map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Responsible Department</label>
                    <select 
                      className="form-control"
                      value={actionAssignForm.responsibleDepartment}
                      onChange={(e) => setActionAssignForm(prev => ({ ...prev, responsibleDepartment: e.target.value }))}
                    >
                      {depts.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Due Date Target</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={actionAssignForm.dueDate}
                      onChange={(e) => setActionAssignForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Designated Reviewer / Approver</label>
                    <select 
                      className="form-control"
                      value={actionAssignForm.reviewerId}
                      onChange={(e) => setActionAssignForm(prev => ({ ...prev, reviewerId: e.target.value }))}
                      required
                    >
                      <option value="">Choose reviewer...</option>
                      {employees.filter(emp => emp.status === 'Approved').map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Assigner Remarks</label>
                  <textarea 
                    className="form-control" 
                    rows="2" 
                    placeholder="Enter notes or remarks regarding assignment task..."
                    value={actionAssignForm.remarks}
                    onChange={(e) => setActionAssignForm(prev => ({ ...prev, remarks: e.target.value }))}
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Publish Assignment Details
                </button>
              </form>
            </div>
          )}

          {/* SCREEN 3: ACTION PROGRESS TRACKER */}
          {actionInnerTab === 'progress' && selectedAction && (
            <div className="card" style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }}>
              <div className="card-title">Update Actions Progress: {selectedAction.observationId}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                <strong>Finding Details:</strong> {selectedAction.description}
              </p>

              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api.put(`/action-closures/${selectedAction._id}/progress`, actionProgressForm);
                  showToast('Action progress logs updated.', 'success');
                  setActionInnerTab('dashboard');
                  setSelectedAction(null);
                  fetchActionClosures();
                } catch (err) {
                  showToast(err.response?.data?.message || 'Error updating progress.', 'error');
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
                  <div className="form-group">
                    <label>Progress Status</label>
                    <select 
                      className="form-control"
                      value={actionProgressForm.progressStatus}
                      onChange={(e) => setActionProgressForm(prev => ({ ...prev, progressStatus: e.target.value }))}
                    >
                      <option value="In Progress">In Progress (Active)</option>
                      <option value="Pending Verification">Pending Verification (Submit for review)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Completion Percentage: {actionProgressForm.completionPercentage}%</label>
                    <input 
                      type="range" 
                      className="form-control"
                      min="0" 
                      max="100" 
                      step="5"
                      value={actionProgressForm.completionPercentage}
                      onChange={(e) => setActionProgressForm(prev => ({ ...prev, completionPercentage: parseInt(e.target.value) || 0 }))}
                      style={{ height: '36px', padding: '0' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Update Notes (Action Details log)</label>
                  <textarea 
                    className="form-control" 
                    rows="2" 
                    placeholder="Details regarding progress made..."
                    value={actionProgressForm.updateNotes}
                    onChange={(e) => setActionProgressForm(prev => ({ ...prev, updateNotes: e.target.value }))}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Supporting Evidence Attachment (Document / Image URL)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="https://s3.aws.com/talentsphere/progress.jpg" 
                      value={actionProgressForm.evidenceUrl}
                      onChange={(e) => setActionProgressForm(prev => ({ ...prev, evidenceUrl: e.target.value }))}
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        const mockUrls = [
                          'https://talentsphere-gov.s3.amazonaws.com/evidence/action_resolved_floor2.jpg',
                          'https://talentsphere-gov.s3.amazonaws.com/evidence/noise_levels_inspected.pdf'
                        ];
                        const url = mockUrls[Math.floor(Math.random() * mockUrls.length)];
                        setActionProgressForm(prev => ({ ...prev, evidenceUrl: url }));
                        showToast('Evidence link attached.', 'info');
                      }}
                    >
                      Attach Mock File
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary">
                  Save Progress Update Logs
                </button>
              </form>

              {/* Mapped updates logs timeline */}
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h5 style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>Historical Updates Timeline Logs</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', fontSize: '0.75rem' }}>
                  {selectedAction.updates?.map((u, i) => (
                    <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                        <span>Completion: {u.completionPercentage}% ({u.progressStatus})</span>
                        <span style={{ opacity: 0.6 }}>{new Date(u.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>{u.updateNotes}</div>
                      {u.evidenceUrl && <div style={{ fontSize: '0.7rem' }}>Evidence: <a href={u.evidenceUrl} target="_blank" rel="noreferrer">Attached link</a></div>}
                      <div style={{ opacity: 0.8, fontSize: '0.7rem' }}>By: {u.updatedBy}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* SCREEN 4: CLOSURE VERIFICATION */}
          {actionInnerTab === 'verify' && selectedAction && (
            <div className="card" style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }}>
              <div className="card-title">Closure Verification Approval: {selectedAction.observationId}</div>
              
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.825rem' }}>
                <div><strong>Finding Details:</strong> {selectedAction.description}</div>
                <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                  <strong>Responsible Dept:</strong> {selectedAction.responsibleDepartment} | <strong>Owner:</strong> {selectedAction.assignedToName}
                </div>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api.put(`/action-closures/${selectedAction._id}/verify`, actionVerifyForm);
                  showToast(`Action status updated to: ${actionVerifyForm.status}`, 'success');
                  setActionInnerTab('dashboard');
                  setSelectedAction(null);
                  fetchActionClosures();
                } catch (err) {
                  showToast(err.response?.data?.message || 'Error processing verification.', 'error');
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div className="form-group">
                  <label>Verification Verdict</label>
                  <select 
                    className="form-control"
                    value={actionVerifyForm.status}
                    onChange={(e) => setActionVerifyForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Closed">Approve Closure (Resolved)</option>
                    <option value="Reopened">Reopen Action Item (Unresolved Gaps)</option>
                  </select>
                </div>

                {actionVerifyForm.status === 'Reopened' && (
                  <div className="form-group">
                    <label>Reason to Reopen (Mandatory) <span style={{ color: 'red' }}>*</span></label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="Explain what is missing from resolution..." 
                      value={actionVerifyForm.reopenReason}
                      onChange={(e) => setActionVerifyForm(prev => ({ ...prev, reopenReason: e.target.value }))}
                      required={actionVerifyForm.status === 'Reopened'}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Verification Remarks / Comments</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="Enter audit check verification logs..."
                    value={actionVerifyForm.comments}
                    onChange={(e) => setActionVerifyForm(prev => ({ ...prev, comments: e.target.value }))}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Submit Verification Signoff
                </button>
              </form>
            </div>
          )}

          {/* SCREEN 5: DASHBOARD & METRICS */}
          {actionInnerTab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="metric-card primary">
                  <div>
                    <span className="metric-label">Open Actions</span>
                    <div className="metric-val">{actionSummary.open}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-spinner"></i></div>
                </div>
                <div className="metric-card info">
                  <div>
                    <span className="metric-label">Avg Closure Days</span>
                    <div className="metric-val">{actionSummary.averageClosureDays} Days</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-calendar-day"></i></div>
                </div>
                <div className="metric-card success">
                  <div>
                    <span className="metric-label">Closed Actions</span>
                    <div className="metric-val">{actionSummary.closed}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-circle-check"></i></div>
                </div>
                <div className="metric-card danger">
                  <div>
                    <span className="metric-label">Overdue Targets</span>
                    <div className="metric-val">{actionSummary.overdue}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-triangle-exclamation"></i></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Department Wise Status */}
                <div className="card">
                  <div className="card-title">Department Wise Closure Rates %</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {actionReportsData.deptReport?.map((dr, i) => (
                      <div key={i} style={{ fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span>{dr.department}</span>
                          <strong>{dr.rate}% ({dr.closed}/{dr.total})</strong>
                        </div>
                        <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                          <div style={{ width: `${dr.rate}%`, height: '100%', backgroundColor: 'hsl(var(--primary))' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority status */}
                <div className="card">
                  <div className="card-title">Critical Open Action Items</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                    {actionList.filter(a => a.priority === 'Critical' && a.status !== 'Closed').map(a => (
                      <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderLeft: '4px solid var(--rose-500)', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                        <div>
                          <strong style={{ fontSize: '0.8rem' }}>{a.observationId} - {a.observationType}</strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dept: {a.department} | Owner: {a.assignedToName}</span>
                        </div>
                        <span className="badge badge-danger" style={{ alignSelf: 'center' }}>Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                      </div>
                    ))}
                    {actionList.filter(a => a.priority === 'Critical' && a.status !== 'Closed').length === 0 && (
                      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '16px' }}>No critical open action items pending.</div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* REPORTS PANEL */}
          {actionInnerTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Action Item Closure Reports</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>Review CAPA resolution compliance summary details.</p>
                </div>
                <button className="btn btn-primary" onClick={() => window.print()}>
                  <i className="fa-solid fa-print" style={{ marginRight: '6px' }}></i> Print Action Reports
                </button>
              </div>

              {/* Open actions */}
              <div className="card">
                <div className="card-title">Report 1: Open Action Compliance List</div>
                <div className="table-responsive">
                  <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Action ID</th>
                        <th>Type</th>
                        <th>Department</th>
                        <th>Owner</th>
                        <th>Due Date</th>
                        <th>Priority</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {actionReportsData.openList?.map(a => (
                        <tr key={a._id}>
                          <td><strong>{a.observationId}</strong></td>
                          <td><strong>{a.observationType}</strong></td>
                          <td>{a.department}</td>
                          <td>{a.assignedToName}</td>
                          <td>{new Date(a.dueDate).toLocaleDateString()}</td>
                          <td><span className="badge badge-info">{a.priority}</span></td>
                          <td><span className="badge badge-warning">{a.status}</span></td>
                        </tr>
                      ))}
                      {(!actionReportsData.openList || actionReportsData.openList.length === 0) && (
                        <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No open action items pending.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Overdue actions */}
              <div className="card">
                <div className="card-title">Report 2: Overdue Action items</div>
                <div className="table-responsive">
                  <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Action ID</th>
                        <th>Type</th>
                        <th>Owner</th>
                        <th>Reviewer</th>
                        <th>Target Date</th>
                        <th>Priority</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {actionReportsData.overdueList?.map(a => (
                        <tr key={a._id}>
                          <td><strong>{a.observationId}</strong></td>
                          <td><strong>{a.observationType}</strong></td>
                          <td>{a.assignedToName}</td>
                          <td>{a.reviewerName}</td>
                          <td style={{ color: 'var(--rose-500)', fontWeight: 600 }}>{new Date(a.dueDate).toLocaleDateString()}</td>
                          <td><span className="badge badge-danger">{a.priority}</span></td>
                          <td><span className="badge badge-warning">{a.status}</span></td>
                        </tr>
                      ))}
                      {(!actionReportsData.overdueList || actionReportsData.overdueList.length === 0) && (
                        <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No overdue action items logged.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* -------------------- TAB 7: INTERNAL AUDIT REPORTS -------------------- */}
      {currentSubModule === 'internal-audit' && (
        <div className="card">
          <div className="card-title">Internal Regulatory Audit Archives</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Browse and download final approved quarterly internal audit reports and statements.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {auditReports.map((rep, idx) => (
              <div key={idx} className="card" style={{ border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
                <div style={{ fontSize: '2.5rem', color: 'hsl(var(--primary))', opacity: 0.8 }}><i className="fa-solid fa-file-pdf"></i></div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '4px 0', wordBreak: 'break-all' }}>{rep.filename}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Filing Date: {new Date(rep.date).toLocaleDateString()}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Size: {rep.size} | Prepared by: {rep.author}</p>
                </div>
                <button
                  className="btn btn-secondary w-full"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={() => showToast(`Initiating download: ${rep.filename}`, 'info')}
                >
                  <i className="fa-solid fa-download"></i> Download Report
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT POLICY ================= */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} className="animate-fade-in">
          <div className="card" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{isEditMode ? `Edit Policy Document: v${selectedPolicy.version + 1}` : 'Create Policy Document'}</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-secondary)' }}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleSubmitPolicy} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Policy Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={policyForm.name}
                  onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })}
                  placeholder="e.g. Employee Devices Security NDA"
                  required
                  disabled={isEditMode}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Effective Commencement Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={policyForm.effectiveDate}
                  onChange={(e) => setPolicyForm({ ...policyForm, effectiveDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Regulatory Policy Status</label>
                <select
                  className="form-control"
                  value={policyForm.status}
                  onChange={(e) => setPolicyForm({ ...policyForm, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Policy Text Content (HTML or Markdown Plaintext)</label>
                <textarea
                  className="form-control"
                  style={{ height: '160px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                  value={policyForm.content}
                  onChange={(e) => setPolicyForm({ ...policyForm, content: e.target.value })}
                  placeholder="Insert company policies details, code guidelines, terms or procedures here..."
                  required
                />
              </div>

              {isEditMode && (
                <div className="form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Update Revision Log Summary (for audit history)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={policyForm.changeSummary}
                    onChange={(e) => setPolicyForm({ ...policyForm, changeSummary: e.target.value })}
                    placeholder="e.g. Clarified section 3 remote hours allowance guidelines"
                    required={isEditMode}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{isEditMode ? 'Publish Update (Increment Version)' : 'Publish Policy Document'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: POLICY VERSION HISTORY ================= */}
      {showHistoryModal && selectedPolicy && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '700px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Audit Version History: {selectedPolicy.name}</h3>
              <button onClick={() => setShowHistoryModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-secondary)' }}><i className="fa-solid fa-xmark"></i></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '12px', backgroundColor: 'rgba(99,102,241,0.06)', borderRadius: '8px', borderLeft: '3px solid hsl(var(--primary))' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Current Version Status: v{selectedPolicy.version}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Effective Commencement Date: {new Date(selectedPolicy.effectiveDate).toLocaleDateString()} | Active Status: {selectedPolicy.status}
                </div>
              </div>

              <div className="table-responsive">
                <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Ver</th>
                      <th>Update Log Summary</th>
                      <th>Updated By</th>
                      <th>Revision Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPolicy.history && selectedPolicy.history.length > 0 ? (
                      selectedPolicy.history.map((hist, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 'bold' }}>v{hist.version}</td>
                          <td>{hist.changeSummary}</td>
                          <td>{hist.updatedBy}</td>
                          <td>{new Date(hist.updatedAt).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No previous version history available. This is the initial version (v1).</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowHistoryModal(false)}>Close Log</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: COMPLIANCE REPORTS ================= */}
      {showReportModal && selectedPolicy && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '800px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px', flexShrink: 0 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Acceptance Compliance Report: {selectedPolicy.name}</h3>
              <button onClick={() => setShowReportModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-secondary)' }}><i className="fa-solid fa-xmark"></i></button>
            </div>

            <div style={{ overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '20px' }} className="pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ flexShrink: 0 }}>
                {/* Accepted column summary */}
                <div className="card" style={{ padding: '16px', backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--emerald-500)', fontWeight: 600 }}>Acknowledge Completions</div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>
                    {reports.acceptedList.filter(a => a.policyId === selectedPolicy._id && a.policyVersion === selectedPolicy.version).length} Employees
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Accepted latest version v{selectedPolicy.version}</span>
                </div>
                {/* Pending column summary */}
                <div className="card" style={{ padding: '16px', backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--amber-500)', fontWeight: 600 }}>Unacknowledged Pending</div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>
                    {reports.pendingList.filter(a => a.policyId === selectedPolicy._id && a.policyVersion === selectedPolicy.version).length} Employees
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Outstanding signatures required</span>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px' }}>Accepted Employees List</h4>
                <div className="table-responsive" style={{ maxHeight: '180px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Employee ID</th>
                        <th>Employee Name</th>
                        <th>Department</th>
                        <th>Acknowledged Version</th>
                        <th>Acceptance Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.acceptedList.filter(a => a.policyId === selectedPolicy._id && a.policyVersion === selectedPolicy.version).length > 0 ? (
                        reports.acceptedList.filter(a => a.policyId === selectedPolicy._id && a.policyVersion === selectedPolicy.version).map((ack, i) => (
                          <tr key={i}>
                            <td>{ack.employeeId}</td>
                            <td style={{ fontWeight: 600 }}>{ack.employeeName}</td>
                            <td>{ack.department}</td>
                            <td>v{ack.policyVersion}</td>
                            <td>{new Date(ack.acceptedAt).toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '12px' }}>No accepted signatures on record.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px' }}>Pending Employees List</h4>
                <div className="table-responsive" style={{ maxHeight: '180px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Employee ID</th>
                        <th>Employee Name</th>
                        <th>Department</th>
                        <th>Required Version</th>
                        <th>Compliance Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.pendingList.filter(a => a.policyId === selectedPolicy._id && a.policyVersion === selectedPolicy.version).length > 0 ? (
                        reports.pendingList.filter(a => a.policyId === selectedPolicy._id && a.policyVersion === selectedPolicy.version).map((ack, i) => (
                          <tr key={i}>
                            <td>{ack.employeeId}</td>
                            <td style={{ fontWeight: 600 }}>{ack.employeeName}</td>
                            <td>{ack.department}</td>
                            <td>v{ack.policyVersion}</td>
                            <td style={{ color: 'var(--amber-500)', fontWeight: 600 }}>{ack.status}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '12px' }}>100% Policy compliant! No pending employee signatures.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', flexShrink: 0 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Close Reports</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRCompliancePage;
