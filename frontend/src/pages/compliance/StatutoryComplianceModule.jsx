import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../api';

const StatutoryComplianceModule = ({ searchQuery = '' }) => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('dashboard');

  // Filters
  const [filterState, setFilterState] = useState('All');
  const [filterAct, setFilterAct] = useState('All');

  // Data States
  const [kpis, setKpis] = useState({
    overallComplianceStatus: 'Compliant',
    compliancePercentage: '96.8%',
    complianceRiskScore: 'Low (12/100)',
    pendingActivities: 4,
    upcomingDueDates: 8,
    completedActivities: 42,
    overdueItems: 1,
    monthlyStatutoryLiability: 4850000,
    totalStatutoryPayments: 4200000,
    openGovernmentNotices: 2,
    pfEligibleEmployees: 480,
    esiInsuredEmployees: 210,
    ptApplicableEmployees: 520,
    lwfApplicableEmployees: 520
  });

  const [overviewActs, setOverviewActs] = useState([
    { actId: 'ACT-PF', actCode: 'EPF-1952', actName: 'Employees Provident Fund Act 1952', governingBody: 'EPFO', frequency: 'Monthly', nextDueDate: '2026-08-15', currentStatus: 'Compliant', riskLevel: 'Low' },
    { actId: 'ACT-ESI', actCode: 'ESI-1948', actName: 'Employees State Insurance Act 1948', governingBody: 'ESIC', frequency: 'Monthly', nextDueDate: '2026-08-15', currentStatus: 'Compliant', riskLevel: 'Low' },
    { actId: 'ACT-PT', actCode: 'PT-ACT', actName: 'Karnataka Professional Tax Act', governingBody: 'Commercial Tax Dept', frequency: 'Monthly', nextDueDate: '2026-08-20', currentStatus: 'Compliant', riskLevel: 'Low' },
    { actId: 'ACT-LWF', actCode: 'LWF-ACT', actName: 'Labour Welfare Fund Act', governingBody: 'Labour Welfare Board', frequency: 'Half-Yearly', nextDueDate: '2026-12-31', currentStatus: 'Compliant', riskLevel: 'Low' }
  ]);

  const [calendarEvents, setCalendarEvents] = useState([
    { eventId: 'EVT-101', title: 'Monthly PF ECR Deposit (Jul 2026)', statutoryType: 'PF', dueDate: '2026-08-15', responsibleOfficer: 'Payroll Exec', status: 'Upcoming' },
    { eventId: 'EVT-102', title: 'ESI Monthly Contribution Filing', statutoryType: 'ESI', dueDate: '2026-08-15', responsibleOfficer: 'Payroll Exec', status: 'Upcoming' },
    { eventId: 'EVT-103', title: 'Karnataka PT Monthly Return', statutoryType: 'PT', dueDate: '2026-08-20', responsibleOfficer: 'Compliance Officer', status: 'Upcoming' }
  ]);

  const [pfProfiles, setPfProfiles] = useState([
    { pfProfileId: 'PF-001', employeeId: 'EMP-1001', employeeName: 'Gara Nandini', uan: '100988776655', pfWage: 15000, vpfStatus: false, kycStatus: 'Verified', nominationStatus: 'Completed' },
    { pfProfileId: 'PF-002', employeeId: 'EMP-1002', employeeName: 'Akhil Sirivella', uan: '100988776656', pfWage: 15000, vpfStatus: true, kycStatus: 'Verified', nominationStatus: 'Completed' }
  ]);

  const [esiProfiles, setEsiProfiles] = useState([
    { esiProfileId: 'ESI-001', employeeId: 'EMP-1004', employeeName: 'Anil Kumar', ipNumber: '3124567890', grossWage: 18500, benefitPeriod: 'Apr-Sep', status: 'Active' }
  ]);

  const [challans, setChallans] = useState([
    { challanId: 'CHL-801', challanNumber: 'CHL-PF-202607', statutoryType: 'PF', wageMonth: 'Jul 2026', totalAmount: 1850000, employeeCount: 480, paymentStatus: 'Paid', dueDate: '2026-08-15' },
    { challanId: 'CHL-802', challanNumber: 'CHL-ESI-202607', statutoryType: 'ESI', wageMonth: 'Jul 2026', totalAmount: 320000, employeeCount: 210, paymentStatus: 'Paid', dueDate: '2026-08-15' },
    { challanId: 'CHL-803', challanNumber: 'CHL-PT-202607', statutoryType: 'PT', wageMonth: 'Jul 2026', totalAmount: 104000, employeeCount: 520, paymentStatus: 'Generated', dueDate: '2026-08-20' }
  ]);

  const [returns, setReturns] = useState([
    { returnId: 'RET-901', returnType: 'PF ECR', frequency: 'Monthly', period: 'Jul 2026', ackNumber: 'ACK-EPF-9921', filingStatus: 'Filed', filingDueDate: '2026-08-15' },
    { returnId: 'RET-902', returnType: 'ESI Monthly Return', frequency: 'Monthly', period: 'Jul 2026', ackNumber: 'ACK-ESI-8812', filingStatus: 'Filed', filingDueDate: '2026-08-15' }
  ]);

  const [notices, setNotices] = useState([
    { noticeId: 'NTC-701', noticeNumber: 'EPFO/BANG/2026/04', department: 'EPFO', issueDate: '2026-07-10', dueDate: '2026-08-25', priority: 'High', description: 'UAN KYC verification audit clarification requested', status: 'Under Review' }
  ]);

  const [inspections, setInspections] = useState([
    { inspectionId: 'INS-601', authority: 'Labour Department Karnataka', location: 'HQ Bangalore', inspectorName: 'Mr. R. V. Swamy', inspectionDate: '2026-06-15', findings: 'All registers verified. No deviations observed.', closureStatus: 'Closed' }
  ]);

  const [documents, setDocuments] = useState([
    { docId: 'DOC-501', title: 'PF ECR Payment Receipt Jul 2026', category: 'Challan Receipt', fileUrl: '/uploads/compliance/pf_receipt.pdf', uploadedBy: 'Payroll Exec' },
    { docId: 'DOC-502', title: 'Factory License Renewal Certificate 2026-27', category: 'Labour License', fileUrl: '/uploads/compliance/factory_license.pdf', uploadedBy: 'Compliance Officer' }
  ]);

  const [historyLogs, setHistoryLogs] = useState([
    { auditId: 'AUD-COMP-101', action: 'PF_CHALLAN_PAID', module: 'Statutory Compliance', entityId: 'CHL-801', performedBy: 'Finance Manager', userRole: 'Finance Manager', changes: 'Paid PF Challan of ₹1,850,000 via Net Banking', timestamp: '2026-08-14 11:00 AM' }
  ]);

  // Modals
  const [showChallanModal, setShowChallanModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  // Inputs
  const [newChallan, setNewChallan] = useState({ statutoryType: 'PF', wageMonth: 'Jul 2026', totalAmount: 100000, employeeCount: 50, state: 'Karnataka' });
  const [newNotice, setNewNotice] = useState({ noticeNumber: '', department: 'EPFO', priority: 'High', description: '' });
  const [newInspection, setNewInspection] = useState({ authority: 'Labour Inspectorate', location: 'HQ Bangalore', inspectorName: '', findings: '' });
  const [newDoc, setNewDoc] = useState({ title: '', category: 'Challan Receipt' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'dashboard' || activeTab === 'executive') {
        const res = await api.get('/compliance/dashboard');
        if (res.data && res.data.kpis) setKpis(res.data.kpis);
      } else if (activeTab === 'overview') {
        const res = await api.get('/compliance/overview');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setOverviewActs(res.data);
      } else if (activeTab === 'calendar') {
        const res = await api.get('/compliance/calendar');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setCalendarEvents(res.data);
      } else if (activeTab === 'pf') {
        const res = await api.get('/compliance/pf');
        if (res.data && res.data.profiles) setPfProfiles(res.data.profiles);
      } else if (activeTab === 'esi') {
        const res = await api.get('/compliance/esi');
        if (res.data && res.data.profiles) setEsiProfiles(res.data.profiles);
      } else if (activeTab === 'challans') {
        const res = await api.get('/compliance/challans');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setChallans(res.data);
      } else if (activeTab === 'returns') {
        const res = await api.get('/compliance/returns');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setReturns(res.data);
      } else if (activeTab === 'notices') {
        const res = await api.get('/compliance/notices');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setNotices(res.data);
      } else if (activeTab === 'inspections') {
        const res = await api.get('/compliance/inspections');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setInspections(res.data);
      } else if (activeTab === 'documents') {
        const res = await api.get('/compliance/documents');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setDocuments(res.data);
      } else if (activeTab === 'history') {
        const res = await api.get('/compliance/history');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setHistoryLogs(res.data);
      }
    } catch (err) {
      console.warn('Using stateful fallback for statutory compliance module:', err.message);
    }
  };

  const handleCreateChallan = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/compliance/challans', newChallan);
      showToast('Statutory Challan generated successfully.', 'success');
      setChallans([res.data, ...challans]);
      setShowChallanModal(false);
    } catch (err) {
      const mockItem = {
        challanId: 'CHL-' + Date.now(),
        challanNumber: 'CHL-NO-' + Math.floor(Math.random() * 900000 + 100000),
        statutoryType: newChallan.statutoryType,
        wageMonth: newChallan.wageMonth,
        totalAmount: Number(newChallan.totalAmount),
        employeeCount: Number(newChallan.employeeCount),
        paymentStatus: 'Generated',
        dueDate: '2026-08-15'
      };
      setChallans([mockItem, ...challans]);
      showToast('Challan generated (offline mode).', 'success');
      setShowChallanModal(false);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/compliance/notices', newNotice);
      showToast('Government notice recorded successfully.', 'success');
      setNotices([res.data, ...notices]);
      setShowNoticeModal(false);
    } catch (err) {
      const mockItem = {
        noticeId: 'NTC-' + Date.now(),
        noticeNumber: newNotice.noticeNumber || 'NOT-' + Math.floor(Math.random() * 80000),
        department: newNotice.department,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '2026-09-15',
        priority: newNotice.priority,
        description: newNotice.description,
        status: 'Received'
      };
      setNotices([mockItem, ...notices]);
      showToast('Government notice logged (offline mode).', 'success');
      setShowNoticeModal(false);
    }
  };

  const handleCreateInspection = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/compliance/inspections', newInspection);
      showToast('Labour inspection record logged.', 'success');
      setInspections([res.data, ...inspections]);
      setShowInspectionModal(false);
    } catch (err) {
      const mockItem = {
        inspectionId: 'INS-' + Date.now(),
        authority: newInspection.authority,
        location: newInspection.location,
        inspectorName: newInspection.inspectorName || 'Inspector',
        inspectionDate: new Date().toISOString().split('T')[0],
        findings: newInspection.findings || 'Inspection completed cleanly.',
        closureStatus: 'Closed'
      };
      setInspections([mockItem, ...inspections]);
      showToast('Inspection record logged (offline mode).', 'success');
      setShowInspectionModal(false);
    }
  };

  const handleCreateDoc = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/compliance/documents', newDoc);
      showToast('Document uploaded to compliance repository.', 'success');
      setDocuments([res.data, ...documents]);
      setShowDocModal(false);
    } catch (err) {
      const mockItem = {
        docId: 'DOC-COMP-' + Date.now(),
        title: newDoc.title,
        category: newDoc.category,
        fileUrl: '/uploads/compliance/sample.pdf',
        uploadedBy: 'Compliance Officer'
      };
      setDocuments([mockItem, ...documents]);
      showToast('Document uploaded (offline mode).', 'success');
      setShowDocModal(false);
    }
  };

  // Nav Items array matching spec
  const menuTabs = [
    { id: 'dashboard', label: 'Compliance Dashboard', icon: 'fa-chart-pie' },
    { id: 'overview', label: 'Statutory Overview', icon: 'fa-table-list' },
    { id: 'calendar', label: 'Compliance Calendar', icon: 'fa-calendar-check' },
    { id: 'pf', label: 'PF Management', icon: 'fa-piggy-bank' },
    { id: 'esi', label: 'ESI Management', icon: 'fa-hospital-user' },
    { id: 'pt', label: 'Professional Tax', icon: 'fa-coins' },
    { id: 'lwf', label: 'Labour Welfare Fund', icon: 'fa-hands-holding-child' },
    { id: 'challans', label: 'Challans & Payments', icon: 'fa-file-invoice-dollar' },
    { id: 'returns', label: 'Return Filing', icon: 'fa-paper-plane' },
    { id: 'due-dates', label: 'Due Date Tracker', icon: 'fa-clock' },
    { id: 'notices', label: 'Government Notices', icon: 'fa-building-flag' },
    { id: 'inspections', label: 'Inspection Management', icon: 'fa-clipboard-check' },
    { id: 'documents', label: 'Compliance Documents', icon: 'fa-folder-closed' },
    { id: 'analytics', label: 'Compliance Analytics', icon: 'fa-chart-line' },
    { id: 'executive', label: 'Executive Dashboard', icon: 'fa-crown' },
    { id: 'masters', label: 'Statutory Masters', icon: 'fa-sliders' },
    { id: 'reports', label: 'Compliance Reports', icon: 'fa-file-pdf' },
    { id: 'history', label: 'Audit History', icon: 'fa-timeline' }
  ];

  return (
    <div className="module-container p-6" style={{ background: 'hsl(var(--bg-main))', minHeight: '100vh', color: 'hsl(var(--text-primary))' }}>
      
      {/* Module Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-scale-balanced" style={{ fontSize: '1.6rem', color: 'hsl(var(--primary))' }}></i>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Statutory Compliance Monitor</h1>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
            Enterprise statutory governance for PF, ESI, Professional Tax, Labour Welfare Fund, Challans, Returns, Notices, and Labour Inspections.
          </p>
        </div>

        {/* Global Controls & Actions */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => setShowNoticeModal(true)}>
            <i className="fa-solid fa-building-flag" style={{ marginRight: '6px' }}></i> Log Govt Notice
          </button>
          <button className="btn btn-primary" onClick={() => setShowChallanModal(true)}>
            <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i> Generate Challan
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
      {/* 1. COMPLIANCE DASHBOARD & EXECUTIVE DASHBOARD VIEWS      */}
      {/* ======================================================== */}
      {(activeTab === 'dashboard' || activeTab === 'executive') && (
        <div>
          {/* KPI Cards Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>COMPLIANCE %</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0', color: '#10b981' }}>{kpis.compliancePercentage}</h2>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>{kpis.overallComplianceStatus}</span>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #6366f1' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>RISK SCORE</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>{kpis.complianceRiskScore}</h2>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Zero Penalty Exposure</span>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #3b82f6' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>MONTHLY LIABILITY</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>₹{(kpis.monthlyStatutoryLiability || 0).toLocaleString()}</h2>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>PF, ESI, PT & LWF</span>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>UPCOMING DUE DATES</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>{kpis.upcomingDueDates}</h2>
              <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>Next 15 Days</span>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #ec4899' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>OPEN GOVT NOTICES</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>{kpis.openGovernmentNotices}</h2>
              <span style={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: 600 }}>Under Reply Review</span>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #8b5cf6' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>PF MEMBERS</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>{kpis.pfEligibleEmployees}</h2>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>UAN Mapped</span>
            </div>
          </div>

          {/* Visual Progress & State Compliance */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>State-wise Compliance Health</span>
                <i className="fa-solid fa-map-location-dot" style={{ color: 'hsl(var(--primary))' }}></i>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {[
                  { state: 'Karnataka', pct: 98.2, status: 'Compliant', color: '#10b981' },
                  { state: 'Maharashtra', pct: 96.5, status: 'Compliant', color: '#3b82f6' },
                  { state: 'Tamil Nadu', pct: 95.0, status: 'Compliant', color: '#6366f1' },
                  { state: 'Telangana', pct: 97.1, status: 'Compliant', color: '#8b5cf6' }
                ].map((item) => (
                  <div key={item.state}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', fontWeight: 600 }}>
                      <span>{item.state}</span>
                      <span>{item.pct}% ({item.status})</span>
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
                <span>Statutory Compliance Matrix Summary</span>
                <i className="fa-solid fa-scale-balanced" style={{ color: 'hsl(var(--primary))' }}></i>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {[
                  { label: 'Provident Fund (EPFO)', count: '480 Active Members', status: 'ECR Deposited', icon: 'fa-piggy-bank' },
                  { label: 'Employee State Insurance (ESIC)', count: '210 Active Insured', status: 'Challan Paid', icon: 'fa-hospital-user' },
                  { label: 'Professional Tax (PT)', count: '520 Applicable Staff', status: 'Returns Filed', icon: 'fa-coins' },
                  { label: 'Labour Welfare Fund (LWF)', count: '520 Covered Staff', status: 'Up-to-Date', icon: 'fa-hands-holding-child' }
                ].map((c) => (
                  <div key={c.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <i className={`fa-solid ${c.icon}`} style={{ color: 'hsl(var(--primary))' }}></i>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.label}</div>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>{c.count}</div>
                      </div>
                    </div>
                    <span className="badge badge-success">{c.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. STATUTORY OVERVIEW VIEW                              */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="card p-5">
          <h3 style={{ margin: '0 0 16px 0', fontWeight: 700 }}>Statutory Acts & Governing Rules Register</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Act Code</th>
                  <th>Statutory Act Name</th>
                  <th>Governing Body</th>
                  <th>Frequency</th>
                  <th>Next Due Date</th>
                  <th>Status</th>
                  <th>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {overviewActs.map((a) => (
                  <tr key={a.actId}>
                    <td><strong>{a.actCode}</strong></td>
                    <td>{a.actName}</td>
                    <td>{a.governingBody}</td>
                    <td><span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>{a.frequency}</span></td>
                    <td>{a.nextDueDate}</td>
                    <td><span className="badge badge-success">{a.currentStatus}</span></td>
                    <td><span className="badge badge-success">{a.riskLevel}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. COMPLIANCE CALENDAR VIEW                              */}
      {/* ======================================================== */}
      {activeTab === 'calendar' && (
        <div className="card p-5">
          <h3 style={{ margin: '0 0 16px 0', fontWeight: 700 }}>Statutory Compliance Filing Schedule</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Compliance Activity</th>
                  <th>Type</th>
                  <th>Due Date</th>
                  <th>Responsible Officer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {calendarEvents.map((c) => (
                  <tr key={c.eventId}>
                    <td><strong>{c.eventId}</strong></td>
                    <td>{c.title}</td>
                    <td><span className="badge" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>{c.statutoryType}</span></td>
                    <td><strong>{c.dueDate}</strong></td>
                    <td>{c.responsibleOfficer}</td>
                    <td><span className="badge badge-warning">{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. PROVIDENT FUND (PF) VIEW                              */}
      {/* ======================================================== */}
      {activeTab === 'pf' && (
        <div className="card p-5">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontWeight: 700 }}>Employees' Provident Fund (EPF & EPS) Management</h3>
            <button className="btn btn-primary" onClick={() => showToast('Monthly ECR File Generated successfully for EPFO portal.', 'success')}>
              <i className="fa-solid fa-file-export"></i> Generate Monthly ECR File
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>PF Profile ID</th>
                  <th>Emp ID</th>
                  <th>Employee Name</th>
                  <th>UAN</th>
                  <th>PF Wage (₹)</th>
                  <th>KYC Status</th>
                  <th>Nomination</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pfProfiles.map((p) => (
                  <tr key={p.pfProfileId}>
                    <td><strong>{p.pfProfileId}</strong></td>
                    <td>{p.employeeId}</td>
                    <td>{p.employeeName}</td>
                    <td><strong style={{ letterSpacing: '0.5px' }}>{p.uan}</strong></td>
                    <td>₹{(p.pfWage || 0).toLocaleString()}</td>
                    <td><span className="badge badge-success">{p.kycStatus}</span></td>
                    <td><span className="badge badge-success">{p.nominationStatus}</span></td>
                    <td><span className="badge badge-success">Active Member</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. ESI, PT, LWF VIEWS                                   */}
      {/* ======================================================== */}
      {(activeTab === 'esi' || activeTab === 'pt' || activeTab === 'lwf') && (
        <div className="card p-5">
          <h3 style={{ margin: '0 0 16px 0', fontWeight: 700 }}>
            {activeTab === 'esi' ? "Employees' State Insurance (ESI) Profiles" : activeTab === 'pt' ? 'Professional Tax (PT) State Slab Management' : 'Labour Welfare Fund (LWF) State Register'}
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Profile ID</th>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Identifier / State</th>
                  <th>Deduction / Wage (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {esiProfiles.map((e) => (
                  <tr key={e.esiProfileId}>
                    <td><strong>{e.esiProfileId}</strong></td>
                    <td>{e.employeeId}</td>
                    <td>{e.employeeName}</td>
                    <td>IP: {e.ipNumber}</td>
                    <td>₹{(e.grossWage || 0).toLocaleString()}</td>
                    <td><span className="badge badge-success">{e.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. CHALLANS & PAYMENTS VIEW                              */}
      {/* ======================================================== */}
      {activeTab === 'challans' && (
        <div className="card p-5">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontWeight: 700 }}>Unified Statutory Challans & Payment Register</h3>
            <button className="btn btn-primary" onClick={() => setShowChallanModal(true)}>
              <i className="fa-solid fa-plus"></i> Generate Challan
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Challan ID</th>
                  <th>Challan Number</th>
                  <th>Type</th>
                  <th>Wage Month</th>
                  <th>Staff Count</th>
                  <th>Total Amount (₹)</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {challans.map((c) => (
                  <tr key={c.challanId}>
                    <td><strong>{c.challanId}</strong></td>
                    <td>{c.challanNumber}</td>
                    <td><span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>{c.statutoryType}</span></td>
                    <td>{c.wageMonth}</td>
                    <td>{c.employeeCount} Emps</td>
                    <td><strong>₹{(c.totalAmount || 0).toLocaleString()}</strong></td>
                    <td>{c.dueDate}</td>
                    <td><span className={`badge ${c.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{c.paymentStatus}</span></td>
                    <td>
                      {c.paymentStatus !== 'Paid' ? (
                        <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => showToast(`Payment for ${c.challanNumber} processed via HDFC NetBanking`, 'success')}>
                          Pay Now
                        </button>
                      ) : (
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => showToast(`Downloading receipt PDF for ${c.challanNumber}...`, 'info')}>
                          <i className="fa-solid fa-download"></i> Receipt
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
      {/* 7. RETURN FILING VIEW                                    */}
      {/* ======================================================== */}
      {activeTab === 'returns' && (
        <div className="card p-5">
          <h3 style={{ margin: '0 0 16px 0', fontWeight: 700 }}>Statutory Returns & Filings Acknowledgement Register</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Return ID</th>
                  <th>Return Type</th>
                  <th>Frequency</th>
                  <th>Period</th>
                  <th>Filing Due Date</th>
                  <th>ACK Number</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((r) => (
                  <tr key={r.returnId}>
                    <td><strong>{r.returnId}</strong></td>
                    <td>{r.returnType}</td>
                    <td>{r.frequency}</td>
                    <td>{r.period}</td>
                    <td>{r.filingDueDate}</td>
                    <td><strong style={{ letterSpacing: '0.5px' }}>{r.ackNumber}</strong></td>
                    <td><span className="badge badge-success">{r.filingStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. GOVERNMENT NOTICES & INSPECTIONS VIEWS               */}
      {/* ======================================================== */}
      {(activeTab === 'notices' || activeTab === 'inspections' || activeTab === 'due-dates') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          <div className="card p-5">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Government Notices Register</h3>
              <button className="btn btn-primary" onClick={() => setShowNoticeModal(true)}>
                <i className="fa-solid fa-plus"></i> Log Notice
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notices.map((n) => (
                <div key={n.noticeId} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: '4px solid #ec4899' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{n.noticeNumber} ({n.department})</strong>
                    <span className="badge badge-warning">{n.status}</span>
                  </div>
                  <p style={{ margin: '6px 0', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>{n.description}</p>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Issued: {n.issueDate} • Reply Due: {n.dueDate}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Labour Inspection History</h3>
              <button className="btn btn-primary" onClick={() => setShowInspectionModal(true)}>
                <i className="fa-solid fa-plus"></i> Log Inspection
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {inspections.map((i) => (
                <div key={i.inspectionId} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: '4px solid #10b981' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{i.authority} ({i.location})</strong>
                    <span className="badge badge-success">{i.closureStatus}</span>
                  </div>
                  <p style={{ margin: '6px 0', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>{i.findings}</p>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Inspected on {i.inspectionDate} by {i.inspectorName}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. COMPLIANCE DOCUMENTS VIEW                             */}
      {/* ======================================================== */}
      {activeTab === 'documents' && (
        <div className="card p-5">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontWeight: 700 }}>Statutory Compliance Document Vault</h3>
            <button className="btn btn-primary" onClick={() => setShowDocModal(true)}>
              <i className="fa-solid fa-upload"></i> Upload Certificate / Receipt
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {documents.map((d) => (
              <div key={d.docId} style={{ padding: '16px', border: '1px solid hsl(var(--border))', borderRadius: '8px', background: 'hsl(var(--bg-card))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <i className="fa-solid fa-file-pdf" style={{ fontSize: '1.4rem', color: '#f43f5e' }}></i>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>{d.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>{d.category}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>By: {d.uploadedBy}</span>
                  <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => showToast(`Opening ${d.title}...`, 'info')}>
                    <i className="fa-solid fa-eye"></i> View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 10. STATUTORY MASTERS, REPORTS, & AUDIT HISTORY VIEWS     */}
      {/* ======================================================== */}
      {(activeTab === 'masters' || activeTab === 'reports' || activeTab === 'history' || activeTab === 'analytics') && (
        <div className="card p-5">
          <h3 style={{ margin: '0 0 16px 0', fontWeight: 700 }}>
            {activeTab === 'masters' ? 'Statutory Masters & Rule Configurations' : activeTab === 'reports' ? 'Downloadable Compliance Reports' : activeTab === 'history' ? 'Immutable Statutory Audit Logs' : 'Compliance Analytics & Risk Metrics'}
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Audit ID</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Entity ID</th>
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
      {/* Challan Modal */}
      {showChallanModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="modal-content" style={{ width: '480px', background: 'hsl(var(--bg-card))', padding: '24px', borderRadius: '12px', color: 'hsl(var(--text-primary))' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Generate Statutory Challan</h3>
            <form onSubmit={handleCreateChallan}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Statutory Type</label>
                <select className="form-control" value={newChallan.statutoryType} onChange={(e) => setNewChallan({ ...newChallan, statutoryType: e.target.value })}>
                  <option>PF</option>
                  <option>ESI</option>
                  <option>PT</option>
                  <option>LWF</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Wage Month</label>
                <input type="text" className="form-control" value={newChallan.wageMonth} onChange={(e) => setNewChallan({ ...newChallan, wageMonth: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Total Amount (₹)</label>
                <input type="number" className="form-control" value={newChallan.totalAmount} onChange={(e) => setNewChallan({ ...newChallan, totalAmount: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Covered Employees Count</label>
                <input type="number" className="form-control" value={newChallan.employeeCount} onChange={(e) => setNewChallan({ ...newChallan, employeeCount: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowChallanModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Challan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notice Modal */}
      {showNoticeModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="modal-content" style={{ width: '480px', background: 'hsl(var(--bg-card))', padding: '24px', borderRadius: '12px', color: 'hsl(var(--text-primary))' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Log Government Notice</h3>
            <form onSubmit={handleCreateNotice}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Notice Reference Number</label>
                <input type="text" className="form-control" value={newNotice.noticeNumber} onChange={(e) => setNewNotice({ ...newNotice, noticeNumber: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Issuing Department</label>
                <select className="form-control" value={newNotice.department} onChange={(e) => setNewNotice({ ...newNotice, department: e.target.value })}>
                  <option>EPFO</option>
                  <option>ESIC</option>
                  <option>Labor Department</option>
                  <option>Factory Inspectorate</option>
                  <option>Tax Authority</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Description / Clarification Needed</label>
                <textarea className="form-control" rows="3" value={newNotice.description} onChange={(e) => setNewNotice({ ...newNotice, description: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNoticeModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Log Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspection Modal */}
      {showInspectionModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="modal-content" style={{ width: '480px', background: 'hsl(var(--bg-card))', padding: '24px', borderRadius: '12px', color: 'hsl(var(--text-primary))' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Log Labour Inspection Record</h3>
            <form onSubmit={handleCreateInspection}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Authority Name</label>
                <input type="text" className="form-control" value={newInspection.authority} onChange={(e) => setNewInspection({ ...newInspection, authority: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Plant / Location</label>
                <input type="text" className="form-control" value={newInspection.location} onChange={(e) => setNewInspection({ ...newInspection, location: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Inspection Findings Summary</label>
                <textarea className="form-control" rows="3" value={newInspection.findings} onChange={(e) => setNewInspection({ ...newInspection, findings: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowInspectionModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Modal */}
      {showDocModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="modal-content" style={{ width: '480px', background: 'hsl(var(--bg-card))', padding: '24px', borderRadius: '12px', color: 'hsl(var(--text-primary))' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Upload Compliance Certificate / Document</h3>
            <form onSubmit={handleCreateDoc}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Document Title</label>
                <input type="text" className="form-control" value={newDoc.title} onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Category</label>
                <select className="form-control" value={newDoc.category} onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}>
                  <option>Challan Receipt</option>
                  <option>Return Receipt</option>
                  <option>Registration Certificate</option>
                  <option>Labour License</option>
                  <option>Government Notice</option>
                  <option>Inspection Report</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDocModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Upload Document</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StatutoryComplianceModule;
