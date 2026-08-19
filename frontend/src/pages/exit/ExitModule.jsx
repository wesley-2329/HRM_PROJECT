import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../api';

const ExitModule = ({ searchQuery = '' }) => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('dashboard');

  // Filters
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Data States
  const [kpis, setKpis] = useState({
    activeExitRequests: 6,
    newResignations: 2,
    pendingManagerApprovals: 2,
    employeesInNoticePeriod: 3,
    pendingClearances: 4,
    pendingFF: 2,
    exitInterviewsPending: 1,
    noDuePending: 3,
    completedExits: 18
  });

  const [resignations, setResignations] = useState([
    { exitId: 'EXT-1001', employeeId: 'EMP-1004', employeeName: 'Anil Kumar', department: 'Engineering', designation: 'Software Engineer', resignationDate: '2026-08-01', proposedLwd: '2026-10-31', approvedLwd: '2026-10-31', reasonCategory: 'Career Growth', status: 'Notice Active', exitCoordinator: 'Gara Nandini' },
    { exitId: 'EXT-1002', employeeId: 'EMP-1005', employeeName: 'Sneha Roy', department: 'Sales & Marketing', designation: 'Account Executive', resignationDate: '2026-08-10', proposedLwd: '2026-09-10', approvedLwd: '2026-09-10', reasonCategory: 'Personal / Relocation', status: 'Manager Review', exitCoordinator: 'Gara Nandini' },
    { exitId: 'EXT-1003', employeeId: 'EMP-1006', employeeName: 'Vikram Patel', department: 'Operations', designation: 'Ops Specialist', resignationDate: '2026-08-12', proposedLwd: '2026-09-12', approvedLwd: '2026-09-12', reasonCategory: 'Higher Studies', status: 'HR Review', exitCoordinator: 'Gara Nandini' }
  ]);

  const [noticePeriods, setNoticePeriods] = useState([
    { noticeId: 'NTC-301', exitId: 'EXT-1001', employeeId: 'EMP-1004', employeeName: 'Anil Kumar', policyNoticeDays: 90, remainingDays: 72, noticeStartDate: '2026-08-01', lastWorkingDay: '2026-10-31', buyoutRequested: false, status: 'Active' },
    { noticeId: 'NTC-302', exitId: 'EXT-1002', employeeId: 'EMP-1005', employeeName: 'Sneha Roy', policyNoticeDays: 30, remainingDays: 22, noticeStartDate: '2026-08-10', lastWorkingDay: '2026-09-10', buyoutRequested: true, status: 'Active' }
  ]);

  const [clearances, setClearances] = useState([
    { clearanceId: 'CLR-401', exitId: 'EXT-1001', departmentName: 'Reporting Manager', approverName: 'Akhil Sirivella', clearanceStatus: 'Approved', remarks: 'Knowledge Transfer 100% complete.', actionDate: '2026-08-05' },
    { clearanceId: 'CLR-402', exitId: 'EXT-1001', departmentName: 'IT Department', approverName: 'IT Admin', clearanceStatus: 'Approved', remarks: 'Laptop returned, AD access revoked.', actionDate: '2026-08-06' },
    { clearanceId: 'CLR-403', exitId: 'EXT-1001', departmentName: 'Finance', approverName: 'Finance Exec', clearanceStatus: 'Pending', remarks: 'Loan recovery verification in progress.', actionDate: null },
    { clearanceId: 'CLR-404', exitId: 'EXT-1001', departmentName: 'Admin & Security', approverName: 'Security Officer', clearanceStatus: 'Approved', remarks: 'Access card & locker key received.', actionDate: '2026-08-07' }
  ]);

  const [assets, setAssets] = useState([
    { assetReturnId: 'AST-501', exitId: 'EXT-1001', assetName: 'MacBook Pro 16"', assetSerialNo: 'C02GX9921', category: 'IT', status: 'Returned', recoveryAmount: 0 },
    { assetReturnId: 'AST-502', exitId: 'EXT-1001', assetName: 'Employee ID Card & Access Badge', assetSerialNo: 'BADGE-9912', category: 'Security', status: 'Returned', recoveryAmount: 0 },
    { assetReturnId: 'AST-503', exitId: 'EXT-1001', assetName: 'Corporate Mobile SIM', assetSerialNo: 'SIM-987654', category: 'IT', status: 'Returned', recoveryAmount: 0 }
  ]);

  const [interviews, setInterviews] = useState([
    { interviewId: 'INT-601', exitId: 'EXT-1001', employeeName: 'Anil Kumar', interviewerName: 'Gara Nandini', scheduledDate: '2026-08-08', overallSatisfactionScore: 4, primaryReason: 'Career Growth', feedbackComments: 'Great culture and supportive team, moving for an executive lead role.', status: 'Completed' }
  ]);

  const [settlements, setSettlements] = useState([
    { settlementId: 'FFS-701', exitId: 'EXT-1001', employeeId: 'EMP-1004', employeeName: 'Anil Kumar', lastWorkingDay: '2026-10-31', pendingSalary: 45000, leaveEncashmentAmount: 32000, gratuityAmount: 125000, totalEarnings: 202000, noticePayRecovery: 0, loanRecovery: 0, totalDeductions: 0, netSettlementAmount: 202000, clearanceVerified: true, status: 'HR Approved' }
  ]);

  const [historyLogs, setHistoryLogs] = useState([
    { auditId: 'AUD-EXIT-101', action: 'RESIGNATION_SUBMITTED', module: 'Exit Workflow & F&F', entityId: 'EXT-1001', performedBy: 'Anil Kumar', userRole: 'Employee', changes: 'Submitted resignation with proposed LWD 2026-10-31', timestamp: '2026-08-01 09:30 AM' },
    { auditId: 'AUD-EXIT-102', action: 'MANAGER_APPROVED', module: 'Exit Workflow & F&F', entityId: 'EXT-1001', performedBy: 'Akhil Sirivella', userRole: 'Reporting Manager', changes: 'Approved resignation request, recommended LWD 2026-10-31', timestamp: '2026-08-03 02:15 PM' }
  ]);

  // Modal States
  const [showResignModal, setShowResignModal] = useState(false);
  const [showClearanceModal, setShowClearanceModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showFfsModal, setShowFfsModal] = useState(false);

  // Form Inputs
  const [newResignation, setNewResignation] = useState({ reasonCategory: 'Career Growth', proposedLwd: '', reasonDetails: '' });
  const [newInterview, setNewInterview] = useState({ exitId: 'EXT-1001', employeeName: 'Anil Kumar', overallSatisfactionScore: 4, primaryReason: 'Career Growth', feedbackComments: '' });
  const [newFfs, setNewFfs] = useState({ exitId: 'EXT-1001', employeeId: 'EMP-1004', employeeName: 'Anil Kumar', pendingSalary: 45000, leaveEncashmentAmount: 32000, gratuityAmount: 125000, noticePayRecovery: 0, loanRecovery: 0 });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'dashboard') {
        const res = await api.get('/exit/dashboard');
        if (res.data && res.data.kpis) setKpis(res.data.kpis);
      } else if (activeTab === 'ess-portal' || activeTab === 'hr-exits') {
        const res = await api.get('/exit/resignations');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setResignations(res.data);
      } else if (activeTab === 'notice-period') {
        const res = await api.get('/exit/notice-period');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setNoticePeriods(res.data);
      } else if (activeTab === 'clearance') {
        const res = await api.get('/exit/clearance');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setClearances(res.data);
      } else if (activeTab === 'assets') {
        const res = await api.get('/exit/assets');
        if (res.data && res.data.assets) setAssets(res.data.assets);
      } else if (activeTab === 'interview') {
        const res = await api.get('/exit/interview');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setInterviews(res.data);
      } else if (activeTab === 'settlement') {
        const res = await api.get('/exit/settlement');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setSettlements(res.data);
      } else if (activeTab === 'history') {
        const res = await api.get('/exit/history');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setHistoryLogs(res.data);
      }
    } catch (err) {
      console.warn('Using stateful fallback for exit module:', err.message);
    }
  };

  const handleCreateResignation = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/exit/resignations', newResignation);
      showToast('Resignation submitted successfully. Exit request generated.', 'success');
      setResignations([res.data, ...resignations]);
      setShowResignModal(false);
    } catch (err) {
      const mockItem = {
        exitId: 'EXT-' + Math.floor(Math.random() * 9000 + 1000),
        employeeId: user?.id || 'EMP-1004',
        employeeName: user?.name || 'Anil Kumar',
        department: 'Engineering',
        designation: 'Software Engineer',
        resignationDate: new Date().toISOString().split('T')[0],
        proposedLwd: newResignation.proposedLwd || '2026-11-15',
        approvedLwd: newResignation.proposedLwd || '2026-11-15',
        reasonCategory: newResignation.reasonCategory,
        status: 'Submitted',
        exitCoordinator: 'Gara Nandini'
      };
      setResignations([mockItem, ...resignations]);
      showToast('Resignation submitted (offline mode).', 'success');
      setShowResignModal(false);
    }
  };

  const handleCreateInterview = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/exit/interview', newInterview);
      showToast('Exit interview feedback recorded successfully.', 'success');
      setInterviews([res.data, ...interviews]);
      setShowInterviewModal(false);
    } catch (err) {
      const mockItem = {
        interviewId: 'INT-' + Date.now(),
        exitId: newInterview.exitId,
        employeeName: newInterview.employeeName,
        interviewerName: 'Gara Nandini',
        scheduledDate: new Date().toISOString().split('T')[0],
        overallSatisfactionScore: Number(newInterview.overallSatisfactionScore),
        primaryReason: newInterview.primaryReason,
        feedbackComments: newInterview.feedbackComments,
        status: 'Completed'
      };
      setInterviews([mockItem, ...interviews]);
      showToast('Exit interview submitted (offline mode).', 'success');
      setShowInterviewModal(false);
    }
  };

  const handleCreateFfs = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/exit/settlement/calculate', newFfs);
      showToast('Full & Final Settlement calculated and approved.', 'success');
      setSettlements([res.data, ...settlements]);
      setShowFfsModal(false);
    } catch (err) {
      const earnings = Number(newFfs.pendingSalary) + Number(newFfs.leaveEncashmentAmount) + Number(newFfs.gratuityAmount);
      const deductions = Number(newFfs.noticePayRecovery) + Number(newFfs.loanRecovery);
      const mockItem = {
        settlementId: 'FFS-' + Date.now(),
        exitId: newFfs.exitId,
        employeeId: newFfs.employeeId,
        employeeName: newFfs.employeeName,
        lastWorkingDay: '2026-10-31',
        pendingSalary: Number(newFfs.pendingSalary),
        leaveEncashmentAmount: Number(newFfs.leaveEncashmentAmount),
        gratuityAmount: Number(newFfs.gratuityAmount),
        totalEarnings: earnings,
        noticePayRecovery: Number(newFfs.noticePayRecovery),
        loanRecovery: Number(newFfs.loanRecovery),
        totalDeductions: deductions,
        netSettlementAmount: earnings - deductions,
        clearanceVerified: true,
        status: 'HR Approved'
      };
      setSettlements([mockItem, ...settlements]);
      showToast('F&F Settlement calculated (offline mode).', 'success');
      setShowFfsModal(false);
    }
  };

  // Nav Items array matching spec
  const menuTabs = [
    { id: 'dashboard', label: 'Exit Dashboard', icon: 'fa-chart-pie' },
    { id: 'ess-portal', label: 'Employee Exit Portal', icon: 'fa-user-minus' },
    { id: 'hr-exits', label: 'HR Exit Management', icon: 'fa-user-gear' },
    { id: 'notice-period', label: 'Notice Period Tracker', icon: 'fa-clock' },
    { id: 'clearance', label: 'Department Clearances', icon: 'fa-list-check' },
    { id: 'assets', label: 'Asset Recovery & IT Revocation', icon: 'fa-laptop-code' },
    { id: 'interview', label: 'Exit Interview', icon: 'fa-comments' },
    { id: 'settlement', label: 'Full & Final (F&F)', icon: 'fa-calculator' },
    { id: 'no-due', label: 'No Due Certificate', icon: 'fa-certificate' },
    { id: 'documents', label: 'Exit Documents Center', icon: 'fa-folder-open' },
    { id: 'analytics', label: 'Exit Analytics & Reports', icon: 'fa-chart-line' },
    { id: 'history', label: 'Audit History', icon: 'fa-timeline' }
  ];

  return (
    <div className="module-container p-6" style={{ background: 'hsl(var(--bg-main))', minHeight: '100vh', color: 'hsl(var(--text-primary))' }}>
      
      {/* Module Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-door-open" style={{ fontSize: '1.6rem', color: 'hsl(var(--primary))' }}></i>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Exit Workflow & Full & Final (F&F)</h1>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
            Enterprise end-to-end separation lifecycle: Resignations, Notice Period, Department Clearances, Asset Recovery, Exit Interviews, F&F Settlement & Exit Letters.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => setShowInterviewModal(true)}>
            <i className="fa-solid fa-comments" style={{ marginRight: '6px' }}></i> Exit Interview
          </button>
          <button className="btn btn-primary" onClick={() => setShowResignModal(true)}>
            <i className="fa-solid fa-paper-plane" style={{ marginRight: '6px' }}></i> Submit Resignation
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
      {/* 1. EXIT DASHBOARD VIEW                                   */}
      {/* ======================================================== */}
      {activeTab === 'dashboard' && (
        <div>
          {/* KPI Cards Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #6366f1' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>ACTIVE EXITS</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>{kpis.activeExitRequests}</h2>
              <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 600 }}>In Separation Lifecycle</span>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #3b82f6' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>NEW RESIGNATIONS</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>{kpis.newResignations}</h2>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Pending Approval</span>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>IN NOTICE PERIOD</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>{kpis.employeesInNoticePeriod}</h2>
              <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>Serving Notice</span>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #ec4899' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>PENDING CLEARANCES</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>{kpis.pendingClearances}</h2>
              <span style={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: 600 }}>IT / Admin / Finance</span>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #8b5cf6' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>PENDING F&F</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>{kpis.pendingFF}</h2>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Ready for Settlement</span>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>COMPLETED EXITS</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>{kpis.completedExits}</h2>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Separated FY 26-27</span>
            </div>
          </div>

          {/* Attrition & Exit Reason Analytics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Top Primary Resignation Reasons</span>
                <i className="fa-solid fa-chart-pie" style={{ color: 'hsl(var(--primary))' }}></i>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {[
                  { reason: 'Career Growth & Advancement', pct: 45, color: '#6366f1' },
                  { reason: 'Higher Compensation Package', pct: 25, color: '#3b82f6' },
                  { reason: 'Personal & Relocation Reasons', pct: 15, color: '#ec4899' },
                  { reason: 'Work-Life Balance / Hybrid Flexibility', pct: 15, color: '#10b981' }
                ].map((item) => (
                  <div key={item.reason}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', fontWeight: 600 }}>
                      <span>{item.reason}</span>
                      <span>{item.pct}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: '4px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Separation Workflow Milestones</span>
                <i className="fa-solid fa-list-check" style={{ color: 'hsl(var(--primary))' }}></i>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {[
                  { stage: '1. Resignation Submission', count: '2 Requests', desc: 'Employee proposed LWD & reason details', icon: 'fa-paper-plane' },
                  { stage: '2. Manager & HR Review', count: '1 Pending', desc: 'Retention discussion & LWD confirmation', icon: 'fa-user-check' },
                  { stage: '3. Department Clearances', count: '4 In Progress', desc: 'IT, Admin, Security, Finance checklists', icon: 'fa-shield' },
                  { stage: '4. Exit Interview & F&F', count: '2 Ready', desc: 'Settlement calculation & No Due Certificate', icon: 'fa-calculator' }
                ].map((s) => (
                  <div key={s.stage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <i className={`fa-solid ${s.icon}`} style={{ color: 'hsl(var(--primary))' }}></i>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.stage}</div>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>{s.desc}</div>
                      </div>
                    </div>
                    <span className="badge badge-secondary">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. EMPLOYEE EXIT PORTAL (ESS) & HR EXITS                 */}
      {/* ======================================================== */}
      {(activeTab === 'ess-portal' || activeTab === 'hr-exits') && (
        <div className="card p-5">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontWeight: 700 }}>Resignation Requests & Active Exits Directory</h3>
            <button className="btn btn-primary" onClick={() => setShowResignModal(true)}>
              <i className="fa-solid fa-plus"></i> Submit Resignation
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Exit Request No</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Resignation Date</th>
                  <th>Proposed LWD</th>
                  <th>Reason</th>
                  <th>Coordinator</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {resignations.map((r) => (
                  <tr key={r.exitId}>
                    <td><strong>{r.exitId}</strong></td>
                    <td>{r.employeeName} ({r.employeeId})</td>
                    <td>{r.department}</td>
                    <td>{r.resignationDate}</td>
                    <td><strong>{r.proposedLwd}</strong></td>
                    <td><span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>{r.reasonCategory}</span></td>
                    <td>{r.exitCoordinator}</td>
                    <td><span className={`badge ${r.status === 'Notice Active' ? 'badge-warning' : 'badge-primary'}`}>{r.status}</span></td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => showToast(`Opening Exit File for ${r.employeeName}...`, 'info')}>
                        <i className="fa-solid fa-folder-open"></i> Manage
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
      {/* 3. NOTICE PERIOD TRACKER VIEW                            */}
      {/* ======================================================== */}
      {activeTab === 'notice-period' && (
        <div className="card p-5">
          <h3 style={{ margin: '0 0 16px 0', fontWeight: 700 }}>Notice Period Tracking & Exception Management</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Notice ID</th>
                  <th>Exit ID</th>
                  <th>Employee Name</th>
                  <th>Policy Notice</th>
                  <th>Remaining Days</th>
                  <th>Notice Start Date</th>
                  <th>Last Working Day</th>
                  <th>Buyout Requested</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {noticePeriods.map((n) => (
                  <tr key={n.noticeId}>
                    <td><strong>{n.noticeId}</strong></td>
                    <td>{n.exitId}</td>
                    <td>{n.employeeName}</td>
                    <td>{n.policyNoticeDays} Days</td>
                    <td><strong style={{ color: '#f59e0b' }}>{n.remainingDays} Days Left</strong></td>
                    <td>{n.noticeStartDate}</td>
                    <td><strong>{n.lastWorkingDay}</strong></td>
                    <td>{n.buyoutRequested ? <span className="badge badge-warning">Yes</span> : 'No'}</td>
                    <td><span className="badge badge-success">{n.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. DEPARTMENT CLEARANCES VIEW                            */}
      {/* ======================================================== */}
      {activeTab === 'clearance' && (
        <div className="card p-5">
          <h3 style={{ margin: '0 0 16px 0', fontWeight: 700 }}>Multi-Department No Due Clearance Tasks</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Clearance ID</th>
                  <th>Exit ID</th>
                  <th>Clearance Department</th>
                  <th>Approver Name</th>
                  <th>Action Date</th>
                  <th>Remarks / Handover Notes</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {clearances.map((c) => (
                  <tr key={c.clearanceId}>
                    <td><strong>{c.clearanceId}</strong></td>
                    <td>{c.exitId}</td>
                    <td><strong style={{ color: 'hsl(var(--primary))' }}>{c.departmentName}</strong></td>
                    <td>{c.approverName}</td>
                    <td>{c.actionDate || 'Pending'}</td>
                    <td>{c.remarks}</td>
                    <td><span className={`badge ${c.clearanceStatus === 'Approved' ? 'badge-success' : 'badge-warning'}`}>{c.clearanceStatus}</span></td>
                    <td>
                      {c.clearanceStatus !== 'Approved' && (
                        <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => showToast(`Approved ${c.departmentName} Clearance.`, 'success')}>
                          Approve Clearance
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. ASSET RECOVERY & IT REVOCATION VIEW                   */}
      {/* ======================================================== */}
      {activeTab === 'assets' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          <div className="card p-5">
            <h3 style={{ margin: '0 0 16px 0', fontWeight: 700 }}>Company Asset Return Register</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Asset Name</th>
                    <th>Category</th>
                    <th>Serial / Tag No</th>
                    <th>Status</th>
                    <th>Recovery (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((a) => (
                    <tr key={a.assetReturnId}>
                      <td><strong>{a.assetName}</strong></td>
                      <td>{a.category}</td>
                      <td>{a.assetSerialNo}</td>
                      <td><span className="badge badge-success">{a.status}</span></td>
                      <td>₹{a.recoveryAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-5">
            <h3 style={{ margin: '0 0 16px 0', fontWeight: 700 }}>IT & Security Systems Revocation Checklist</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { system: 'Corporate GSuite / Microsoft 365 Email', status: 'Revoked', icon: 'fa-envelope-circle-check' },
                { system: 'VPN & Internal Network Tunnel Access', status: 'Revoked', icon: 'fa-shield-halved' },
                { system: 'SAP ERP & Finance Ledger Authorizations', status: 'Revoked', icon: 'fa-database' },
                { system: 'HR O HRMS Portal Login Access', status: 'Scheduled on LWD', icon: 'fa-user-lock' },
                { system: 'Biometric Gate Pass & Locker Access', status: 'Revoked', icon: 'fa-fingerprint' }
              ].map((s) => (
                <div key={s.system} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className={`fa-solid ${s.icon}`} style={{ color: 'hsl(var(--primary))' }}></i>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.system}</span>
                  </div>
                  <span className="badge badge-success">{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. EXIT INTERVIEW VIEW                                   */}
      {/* ======================================================== */}
      {activeTab === 'interview' && (
        <div className="card p-5">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontWeight: 700 }}>Digital Exit Interview Records & Feedback</h3>
            <button className="btn btn-primary" onClick={() => setShowInterviewModal(true)}>
              <i className="fa-solid fa-comments"></i> Record Exit Interview
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Interview ID</th>
                  <th>Employee Name</th>
                  <th>Interviewer</th>
                  <th>Date</th>
                  <th>Satisfaction Rating</th>
                  <th>Primary Reason</th>
                  <th>Feedback Comments</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {interviews.map((i) => (
                  <tr key={i.interviewId}>
                    <td><strong>{i.interviewId}</strong></td>
                    <td>{i.employeeName}</td>
                    <td>{i.interviewerName}</td>
                    <td>{i.scheduledDate}</td>
                    <td><span className="badge badge-success">⭐ {i.overallSatisfactionScore} / 5</span></td>
                    <td><span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>{i.primaryReason}</span></td>
                    <td>{i.feedbackComments}</td>
                    <td><span className="badge badge-success">{i.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. FULL & FINAL SETTLEMENT (F&F) VIEW                   */}
      {/* ======================================================== */}
      {activeTab === 'settlement' && (
        <div className="card p-5">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontWeight: 700 }}>Automated Full & Final (F&F) Settlement Register</h3>
            <button className="btn btn-primary" onClick={() => setShowFfsModal(true)}>
              <i className="fa-solid fa-calculator"></i> Calculate F&F Settlement
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Settlement ID</th>
                  <th>Employee Name</th>
                  <th>LWD</th>
                  <th>Total Earnings (₹)</th>
                  <th>Total Deductions (₹)</th>
                  <th>Net Settlement (₹)</th>
                  <th>Clearances</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((s) => (
                  <tr key={s.settlementId}>
                    <td><strong>{s.settlementId}</strong></td>
                    <td>{s.employeeName} ({s.employeeId})</td>
                    <td>{s.lastWorkingDay}</td>
                    <td>₹{(s.totalEarnings || 0).toLocaleString()}</td>
                    <td>₹{(s.totalDeductions || 0).toLocaleString()}</td>
                    <td><strong style={{ color: '#10b981', fontSize: '0.95rem' }}>₹{(s.netSettlementAmount || 0).toLocaleString()}</strong></td>
                    <td>{s.clearanceVerified ? <span className="badge badge-success">Verified</span> : <span className="badge badge-warning">Pending</span>}</td>
                    <td><span className="badge badge-success">{s.status}</span></td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => showToast(`Generating F&F Statement PDF for ${s.employeeName}...`, 'info')}>
                        <i className="fa-solid fa-file-pdf"></i> F&F Sheet
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
      {/* 8. NO DUE CERTIFICATE & EXIT DOCUMENTS VIEWS             */}
      {/* ======================================================== */}
      {(activeTab === 'no-due' || activeTab === 'documents') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          <div className="card p-5">
            <h3 style={{ margin: '0 0 16px 0', fontWeight: 700 }}>No Due Certificate (NDC) Generation</h3>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px border-dashed hsl(var(--border))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <strong style={{ fontSize: '1rem', color: 'hsl(var(--primary))' }}>NDC-2026-1001</strong>
                <span className="badge badge-success">Fully Cleared</span>
              </div>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem' }}>Employee: <strong>Anil Kumar (EMP-1004)</strong></p>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>All 8 department clearance checklists & asset returns verified and authorized.</p>
              <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.82rem' }} onClick={() => showToast('Downloading Official No Due Certificate (NDC) PDF...', 'success')}>
                <i className="fa-solid fa-download" style={{ marginRight: '6px' }}></i> Download Official NDC PDF
              </button>
            </div>
          </div>

          <div className="card p-5">
            <h3 style={{ margin: '0 0 16px 0', fontWeight: 700 }}>Official Exit Letters Generator</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { type: 'Relieving Letter', desc: 'Formal release confirmation with last working day statement', icon: 'fa-envelope-open-text' },
                { type: 'Experience Certificate', desc: 'Tenure, designation history, and appreciation summary', icon: 'fa-award' },
                { type: 'Full & Final Statement', desc: 'Complete breakdown of earnings, encashment, & deductions', icon: 'fa-file-invoice-dollar' }
              ].map((doc) => (
                <div key={doc.type} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className={`fa-solid ${doc.icon}`} style={{ color: 'hsl(var(--primary))' }}></i>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{doc.type}</div>
                      <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>{doc.desc}</div>
                    </div>
                  </div>
                  <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => showToast(`Generating official ${doc.type}...`, 'success')}>
                    Generate
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. ANALYTICS & AUDIT HISTORY VIEWS                       */}
      {/* ======================================================== */}
      {(activeTab === 'analytics' || activeTab === 'history') && (
        <div className="card p-5">
          <h3 style={{ margin: '0 0 16px 0', fontWeight: 700 }}>Immutable Separation Audit Logs & History</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Audit ID</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Exit ID</th>
                  <th>Performed By</th>
                  <th>Details</th>
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
      {/* MODALS SECTION                                           */}
      {/* ======================================================== */}
      {/* Resignation Modal */}
      {showResignModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="modal-content" style={{ width: '500px', background: 'hsl(var(--bg-card))', padding: '24px', borderRadius: '12px', color: 'hsl(var(--text-primary))' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Submit Formal Resignation</h3>
            <form onSubmit={handleCreateResignation}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Primary Resignation Reason</label>
                <select className="form-control" value={newResignation.reasonCategory} onChange={(e) => setNewResignation({ ...newResignation, reasonCategory: e.target.value })}>
                  <option>Career Growth</option>
                  <option>Higher Compensation</option>
                  <option>Personal / Relocation</option>
                  <option>Work-Life Balance</option>
                  <option>Higher Studies</option>
                  <option>Health Issue</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Proposed Last Working Day</label>
                <input type="date" className="form-control" value={newResignation.proposedLwd} onChange={(e) => setNewResignation({ ...newResignation, proposedLwd: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Remarks / Supporting Details</label>
                <textarea className="form-control" rows="3" value={newResignation.reasonDetails} onChange={(e) => setNewResignation({ ...newResignation, reasonDetails: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowResignModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Resignation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exit Interview Modal */}
      {showInterviewModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="modal-content" style={{ width: '500px', background: 'hsl(var(--bg-card))', padding: '24px', borderRadius: '12px', color: 'hsl(var(--text-primary))' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Record Exit Interview Feedback</h3>
            <form onSubmit={handleCreateInterview}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Overall Satisfaction Score (1-5)</label>
                <input type="number" min="1" max="5" className="form-control" value={newInterview.overallSatisfactionScore} onChange={(e) => setNewInterview({ ...newInterview, overallSatisfactionScore: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Primary Reason</label>
                <input type="text" className="form-control" value={newInterview.primaryReason} onChange={(e) => setNewInterview({ ...newInterview, primaryReason: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Feedback & Suggestions</label>
                <textarea className="form-control" rows="3" value={newInterview.feedbackComments} onChange={(e) => setNewInterview({ ...newInterview, feedbackComments: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowInterviewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Feedback</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* F&F Settlement Modal */}
      {showFfsModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="modal-content" style={{ width: '500px', background: 'hsl(var(--bg-card))', padding: '24px', borderRadius: '12px', color: 'hsl(var(--text-primary))' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Calculate Full & Final (F&F) Settlement</h3>
            <form onSubmit={handleCreateFfs}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Pending Salary (₹)</label>
                  <input type="number" className="form-control" value={newFfs.pendingSalary} onChange={(e) => setNewFfs({ ...newFfs, pendingSalary: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Leave Encashment (₹)</label>
                  <input type="number" className="form-control" value={newFfs.leaveEncashmentAmount} onChange={(e) => setNewFfs({ ...newFfs, leaveEncashmentAmount: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Gratuity Amount (₹)</label>
                  <input type="number" className="form-control" value={newFfs.gratuityAmount} onChange={(e) => setNewFfs({ ...newFfs, gratuityAmount: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Notice Pay Recovery (₹)</label>
                  <input type="number" className="form-control" value={newFfs.noticePayRecovery} onChange={(e) => setNewFfs({ ...newFfs, noticePayRecovery: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowFfsModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Approve & Lock F&F</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExitModule;
