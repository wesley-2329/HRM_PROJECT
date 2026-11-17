import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../api';
import { downloadPdfDocument } from '../../utils/pdfGenerator';

const DOC_MAX_BYTES = 4 * 1024 * 1024; // same limit the API enforces

const StatutoryComplianceModule = ({ searchQuery = '' }) => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();

  // Employees see only their own PF/ESI/PT/LWF records; filings, notices and audits are HR only (API enforces it too)
  const EMPLOYEE_TABS = ['pf', 'esi', 'pt', 'lwf'];
  const [activeTab, setActiveTab] = useState(user?.role === 'hr' ? 'dashboard' : 'pf');

  // Filters
  const [filterState, setFilterState] = useState('All');
  const [filterAct, setFilterAct] = useState('All');

  // Data States
  const [kpis, setKpis] = useState({
    overallComplianceStatus: '',
    compliancePercentage: null,
    pendingActivities: 0,
    upcomingDueDates: 0,
    completedActivities: 0,
    overdueItems: 0,
    monthlyStatutoryLiability: 0,
    totalStatutoryPayments: 0,
    openGovernmentNotices: 0,
    pfEligibleEmployees: 0,
    esiInsuredEmployees: 0,
    ptApplicableEmployees: 0,
    lwfApplicableEmployees: 0
  });

  const [overviewActs, setOverviewActs] = useState([]);

  const [calendarEvents, setCalendarEvents] = useState([]);

  const [pfProfiles, setPfProfiles] = useState([]);

  const [esiProfiles, setEsiProfiles] = useState([]);

  const [challans, setChallans] = useState([]);

  const [returns, setReturns] = useState([]);

  const [notices, setNotices] = useState([]);

  const [inspections, setInspections] = useState([]);

  const [documents, setDocuments] = useState([]);

  const [historyLogs, setHistoryLogs] = useState([]);

  // Modals
  const [showChallanModal, setShowChallanModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showDocViewerModal, setShowDocViewerModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [docViewerLoading, setDocViewerLoading] = useState(false);
  const [docViewerError, setDocViewerError] = useState(null);
  const [docPreviewUrl, setDocPreviewUrl] = useState(null);
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);

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
      if (k.includes('amount') || k.includes('fee') || k.includes('penalty') || k.includes('tax') || k.includes('total') || k.includes('wage')) {
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

  // Inputs
  const [newChallan, setNewChallan] = useState({ statutoryType: 'PF', wageMonth: '', totalAmount: '', employeeCount: '', state: '', dueDate: '' });
  const [newNotice, setNewNotice] = useState({ noticeNumber: '', department: 'EPFO', priority: 'Normal', issueDate: '', dueDate: '', description: '' });
  const [newInspection, setNewInspection] = useState({ authority: '', location: '', inspectorName: '', inspectionDate: '', closureStatus: 'Observations Open', findings: '' });
  const [newDoc, setNewDoc] = useState({ title: '', category: '' });
  const [docFile, setDocFile] = useState(null);
  const [docUploading, setDocUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // The page shows placeholder bars (.is-loading in index.css) while this runs, not zeros.
  const [loading, setLoading] = useState(true);
  const fetchData = async () => {
    setLoading(true);
    try { await fetchDataInner(); } finally { setLoading(false); }
  };
  const fetchDataInner = async () => {
    try {
      if (activeTab === 'dashboard' || activeTab === 'executive') {
        const res = await api.get('/compliance/dashboard');
        if (res.data && res.data.kpis) setKpis(res.data.kpis);
      } else if (activeTab === 'overview') {
        const res = await api.get('/compliance/overview');
        if (Array.isArray(res.data)) setOverviewActs(res.data);
      } else if (activeTab === 'calendar') {
        const res = await api.get('/compliance/calendar');
        if (Array.isArray(res.data)) setCalendarEvents(res.data);
      } else if (activeTab === 'pf') {
        const res = await api.get('/compliance/pf');
        if (res.data && res.data.profiles) setPfProfiles(res.data.profiles);
      } else if (activeTab === 'esi') {
        const res = await api.get('/compliance/esi');
        if (res.data && res.data.profiles) setEsiProfiles(res.data.profiles);
      } else if (activeTab === 'challans') {
        const res = await api.get('/compliance/challans');
        if (Array.isArray(res.data)) setChallans(res.data);
      } else if (activeTab === 'returns') {
        const res = await api.get('/compliance/returns');
        if (Array.isArray(res.data)) setReturns(res.data);
      } else if (activeTab === 'notices') {
        const res = await api.get('/compliance/notices');
        if (Array.isArray(res.data)) setNotices(res.data);
      } else if (activeTab === 'inspections') {
        const res = await api.get('/compliance/inspections');
        if (Array.isArray(res.data)) setInspections(res.data);
      } else if (activeTab === 'documents') {
        const res = await api.get('/compliance/documents');
        if (Array.isArray(res.data)) setDocuments(res.data);
      } else if (activeTab === 'history') {
        const res = await api.get('/compliance/history');
        if (Array.isArray(res.data)) {
          const parsedLogs = res.data.map((item) => {
            const rawChanges = item.changes || item.details;
            if (typeof rawChanges === 'string') {
              try {
                const parsed = JSON.parse(rawChanges);
                if (typeof parsed === 'object' && parsed !== null) {
                  return { ...item, changes: parsed, rawChanges };
                }
              } catch (e) {}
            }
            return item;
          });
          setHistoryLogs(parsedLogs);
        }
      }
    } catch (err) {
      showToast('Could not load statutory compliance module data. Please refresh.', 'error');
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
      showToast(err.response?.data?.message || 'Could not save. Please check the details and try again.', 'error');
    }
  };

  // Payment happens at the bank; this only records it, so the bank's reference is required.
  const handleMarkChallanPaid = async (c) => {
    const bankReferenceNo = window.prompt(`Bank reference number for the payment of ${c.challanNumber}:`);
    if (!bankReferenceNo?.trim()) return;
    try {
      const res = await api.post(`/compliance/challans/${c.challanId}/pay`, { bankReferenceNo });
      setChallans(challans.map(x => x.challanId === c.challanId ? res.data : x));
      showToast(`${c.challanNumber} marked as paid.`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not record the payment. Please try again.', 'error');
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
      showToast(err.response?.data?.message || 'Could not save. Please check the details and try again.', 'error');
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
      showToast(err.response?.data?.message || 'Could not save. Please check the details and try again.', 'error');
    }
  };

  const handleCreateDoc = async (e) => {
    e.preventDefault();
    if (!docFile) return showToast('Attach the document file.', 'error');
    if (docFile.size > DOC_MAX_BYTES) return showToast('File is too large. Maximum size is 4 MB.', 'error');
    const body = new FormData();
    body.append('title', newDoc.title);
    body.append('category', newDoc.category);
    body.append('file', docFile);
    setDocUploading(true);
    try {
      const res = await api.post('/compliance/documents', body);
      showToast('Document uploaded to compliance repository.', 'success');
      setDocuments([res.data, ...documents]);
      setShowDocModal(false);
      setNewDoc({ title: '', category: '' });
      setDocFile(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not upload. Please check the file and try again.', 'error');
    } finally {
      setDocUploading(false);
    }
  };

  // The file routes need the login token, so the file is fetched and shown from a blob URL
  // instead of being linked to directly.
  const fetchDocFile = async (doc, mode) => {
    const res = await api.get(`/compliance/documents/${doc.docId}/${mode}`, { responseType: 'blob', timeout: 60000 });
    return URL.createObjectURL(res.data);
  };

  const closeDocViewer = () => {
    setShowDocViewerModal(false);
    if (docPreviewUrl) URL.revokeObjectURL(docPreviewUrl);
    setDocPreviewUrl(null);
  };

  const handleViewDocument = async (doc) => {
    setDocViewerError(null);
    setDocPreviewUrl(null);
    setViewingDoc(doc);
    setShowDocViewerModal(true);
    if (!doc.fileId) return setDocViewerError('No file was uploaded for this record.');
    setDocViewerLoading(true);
    try {
      setDocPreviewUrl(await fetchDocFile(doc, 'preview'));
    } catch {
      setDocViewerError('Could not load the file. Please try again.');
    } finally {
      setDocViewerLoading(false);
    }
  };

  const handleOpenDocInNewTab = async (doc) => {
    const tab = window.open('', '_blank'); // opened before the await, or the browser blocks it as a pop-up
    try {
      const url = await fetchDocFile(doc, 'preview');
      if (tab) tab.location = url; else window.location.assign(url);
    } catch {
      if (tab) tab.close();
      showToast('Could not open the file. Please try again.', 'error');
    }
  };

  const handleDownloadDoc = async (doc) => {
    try {
      const url = await fetchDocFile(doc, 'download');
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      showToast('Could not download the file. Please try again.', 'error');
    }
  };

  const [docToDelete, setDocToDelete] = useState(null);
  const [docDeleting, setDocDeleting] = useState(false);
  const handleDeleteDoc = async () => {
    setDocDeleting(true);
    try {
      await api.delete(`/compliance/documents/${docToDelete.docId}`);
      setDocuments((prev) => prev.filter((d) => d.docId !== docToDelete.docId));
      if (viewingDoc?.docId === docToDelete.docId) closeDocViewer();
      showToast(`"${docToDelete.title}" deleted.`, 'success');
      setDocToDelete(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete the document. Please try again.', 'error');
    } finally {
      setDocDeleting(false);
    }
  };

  const isPreviewable = (doc) => /\.(pdf|jpe?g|png|webp)$/i.test(doc?.fileName || '');
  const formatBytes = (n) => n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;


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
    <div className={`module-container p-6${loading ? ' is-loading' : ''}`} aria-busy={loading} style={{ background: 'hsl(var(--bg-main))', minHeight: '100vh', color: 'hsl(var(--text-primary))' }}>
      
      {/* Module Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-scale-balanced" style={{ fontSize: '1.6rem', color: 'hsl(var(--primary))' }}></i>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Statutory Compliance Monitor</h1>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
            {user?.role === 'hr' ? 'Enterprise statutory governance for PF, ESI, Professional Tax, Labour Welfare Fund, Challans, Returns, Notices, and Labour Inspections.' : 'Your PF, ESI, Professional Tax and Labour Welfare Fund records.'}
          </p>
        </div>

        {/* Global Controls & Actions (HR only) */}
        {user?.role === 'hr' && <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => setShowNoticeModal(true)}>
            <i className="fa-solid fa-building-flag" style={{ marginRight: '6px' }}></i> Log Govt Notice
          </button>
          <button className="btn btn-primary" onClick={() => setShowChallanModal(true)}>
            <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i> Generate Challan
          </button>
        </div>}
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '12px', marginBottom: '24px', overflowX: 'auto' }}>
        {menuTabs.filter((t) => user?.role === 'hr' || EMPLOYEE_TABS.includes(t.id)).map((t) => (
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>COMPLIANCE %</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0', color: kpis.overdueItems > 0 ? '#ef4444' : '#10b981' }}>{kpis.compliancePercentage ?? '—'}</h2>
              <span style={{ fontSize: '0.75rem', color: kpis.overdueItems > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>{kpis.overallComplianceStatus}</span>
            </div>

            <div className="card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>OVERDUE ITEMS</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>{kpis.overdueItems}</h2>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Past their due date</span>
            </div>

            <div className="card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>CHALLAN LIABILITY</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>₹{(kpis.monthlyStatutoryLiability || 0).toLocaleString()}</h2>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>PF, ESI, PT & LWF</span>
            </div>

            <div className="card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>UPCOMING DUE DATES</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>{kpis.upcomingDueDates}</h2>
              <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>Next 15 Days</span>
            </div>

            <div className="card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>OPEN GOVT NOTICES</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>{kpis.openGovernmentNotices}</h2>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Not yet closed</span>
            </div>

            <div className="card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>PF MEMBERS</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>{kpis.pfEligibleEmployees}</h2>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>PF profiles on record</span>
            </div>
          </div>

          {/* Visual Progress & State Compliance */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Due Date Status</span>
                <i className="fa-solid fa-calendar-check" style={{ color: 'hsl(var(--primary))' }}></i>
              </div>
              {(kpis.completedActivities + kpis.pendingActivities + kpis.overdueItems) === 0 ? (
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', marginTop: '16px' }}>No statutory due dates are being tracked yet.</p>
              ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {[
                  { label: 'Completed', n: kpis.completedActivities, color: '#10b981' },
                  { label: 'Pending', n: kpis.pendingActivities, color: '#3b82f6' },
                  { label: 'Overdue', n: kpis.overdueItems, color: '#ef4444' }
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', fontWeight: 600 }}>
                      <span>{item.label}</span>
                      <span>{item.n}</span>
                    </div>
                    <div style={{ height: '8px', background: 'hsl(var(--border))', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.n / (kpis.completedActivities + kpis.pendingActivities + kpis.overdueItems) * 100}%`, height: '100%', background: item.color, borderRadius: '4px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Employee Statutory Profiles</span>
                <i className="fa-solid fa-scale-balanced" style={{ color: 'hsl(var(--primary))' }}></i>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {[
                  { label: 'Provident Fund (EPFO)', count: kpis.pfEligibleEmployees, icon: 'fa-piggy-bank' },
                  { label: 'Employee State Insurance (ESIC)', count: kpis.esiInsuredEmployees, icon: 'fa-hospital-user' },
                  { label: 'Professional Tax (PT)', count: kpis.ptApplicableEmployees, icon: 'fa-coins' },
                  { label: 'Labour Welfare Fund (LWF)', count: kpis.lwfApplicableEmployees, icon: 'fa-hands-holding-child' }
                ].map((c) => (
                  <div key={c.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <i className={`fa-solid ${c.icon}`} style={{ color: 'hsl(var(--primary))' }}></i>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.label}</div>
                      </div>
                    </div>
                    <strong style={{ fontSize: '0.9rem' }}>{c.count} <span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>employee profiles</span></strong>
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
                {overviewActs.length === 0 && (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'hsl(var(--text-secondary))' }}>No statutory acts have been set up yet.</td></tr>
                )}
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
                    <td><span className={`badge ${p.kycStatus === 'Verified' ? 'badge-success' : p.kycStatus === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{p.kycStatus}</span></td>
                    <td><span className={`badge ${p.nominationStatus === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{p.nominationStatus}</span></td>
                    <td><span className={`badge ${p.status === 'Inactive' ? 'badge-secondary' : 'badge-success'}`}>{p.status === 'Inactive' ? 'Inactive' : 'Active Member'}</span></td>
                  </tr>
                ))}
                {pfProfiles.length === 0 && (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: 'hsl(var(--text-secondary))' }}>No records on file yet.</td></tr>
                )}
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
                {esiProfiles.length === 0 && (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: 'hsl(var(--text-secondary))' }}>No records on file yet.</td></tr>
                )}
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
                    <td>{c.dueDate ? new Date(c.dueDate).toLocaleDateString() : '—'}</td>
                    <td><span className={`badge ${c.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{c.paymentStatus}</span></td>
                    <td>
                      {c.paymentStatus !== 'Paid' ? (
                        <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleMarkChallanPaid(c)}>
                          Mark as Paid
                        </button>
                      ) : (
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => {
                          showToast(`Downloading receipt PDF for ${c.challanNumber}...`, 'info');
                          downloadPdfDocument({
                            title: `STATUTORY CHALLAN RECEIPT - ${c.challanNumber}`,
                            subtitle: `Statutory Type: ${c.statutoryType} | Wage Month: ${c.wageMonth}`,
                            docNumber: c.challanNumber,
                            recipient: `Employee Count: ${c.employeeCount}`,
                            metadata: [
                              { label: 'Challan ID', value: c.challanId },
                              { label: 'Amount Paid', value: `INR ${(c.totalAmount || 0).toLocaleString()}` },
                              { label: 'Payment Status', value: c.paymentStatus },
                              { label: 'Due Date', value: c.dueDate }
                            ],
                            sections: [
                              {
                                heading: 'Statutory Verification & Bank Acknowledgement',
                                paragraphs: [
                                  `This is an electronically generated official statutory challan receipt for ${c.challanNumber}.`,
                                  `Payment has been verified and settled for ${c.employeeCount} eligible employees under ${c.statutoryType} regulations.`
                                ]
                              }
                            ]
                          }, `${c.challanNumber}_receipt.pdf`);
                        }}>
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
                <div key={n.noticeId} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
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
                <div key={i.inspectionId} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{i.authority} ({i.location})</strong>
                    <span className={`badge ${i.closureStatus === 'Closed' ? 'badge-success' : 'badge-warning'}`}>{i.closureStatus}</span>
                  </div>
                  <p style={{ margin: '6px 0', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>{i.findings}</p>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Inspected on {i.inspectionDate ? new Date(i.inspectionDate).toLocaleDateString() : '—'} by {i.inspectorName}</div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontWeight: 700 }}>Statutory Compliance Document Vault</h3>
            {user?.role === 'hr' && (
              <button className="btn btn-primary" onClick={() => setShowDocModal(true)}>
                <i className="fa-solid fa-upload"></i> Upload Certificate / Receipt
              </button>
            )}
          </div>
          {documents.length === 0 && (
            <p style={{ margin: 0, color: 'hsl(var(--text-secondary))', fontSize: '0.88rem' }}>No documents uploaded yet.</p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '16px' }}>
            {documents.map((d) => (
              <div key={d.docId} className="card-document-item" style={{ padding: '16px', border: '1px solid hsl(var(--border))', borderRadius: '8px', background: 'hsl(var(--bg-card))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <i className={`fa-solid ${/\.pdf$/i.test(d.fileName || '') ? 'fa-file-pdf' : 'fa-file-lines'}`} style={{ fontSize: '1.4rem', color: '#f43f5e' }}></i>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.title}>{d.title}</h4>
                    <span className="badge" style={{ fontSize: '0.72rem', background: 'rgba(99,102,241,0.1)', color: '#6366f1', marginTop: '4px', display: 'inline-block' }}>{d.category}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', margin: '8px 0 12px 0' }}>
                  <div>Ref: <strong style={{ color: 'hsl(var(--text-primary))' }}>{d.docId}</strong></div>
                  <div>Uploaded By: {d.uploadedBy}</div>
                  <div>{d.fileId ? `${d.fileName} · ${formatBytes(d.fileSize)}` : 'No file attached'}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <button
                    className="btn btn-secondary"
                    id={`btn-view-doc-${d.docId}`}
                    style={{ padding: '5px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => handleViewDocument(d)}
                  >
                    <i className="fa-solid fa-eye"></i> View
                  </button>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-outline"
                      title="Open in new window"
                      aria-label="Open in new window"
                      disabled={!d.fileId || !isPreviewable(d)}
                      id={`btn-tab-doc-${d.docId}`}
                      style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                      onClick={() => handleOpenDocInNewTab(d)}
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    </button>
                    <button
                      className="btn btn-outline"
                      title="Download"
                      aria-label="Download"
                      disabled={!d.fileId}
                      id={`btn-download-doc-${d.docId}`}
                      style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                      onClick={() => handleDownloadDoc(d)}
                    >
                      <i className="fa-solid fa-download"></i>
                    </button>
                    {user?.role === 'hr' && (
                      <button
                        className="btn btn-outline"
                        title="Delete"
                        aria-label={`Delete ${d.title}`}
                        id={`btn-delete-doc-${d.docId}`}
                        style={{ padding: '5px 10px', fontSize: '0.78rem', color: '#ef4444' }}
                        onClick={() => setDocToDelete(d)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    )}
                  </div>
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
        <div className="card p-5" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, fontWeight: 700, whiteSpace: 'normal', overflowWrap: 'break-word' }}>
              {activeTab === 'masters' ? 'Statutory Masters & Rule Configurations' : activeTab === 'reports' ? 'Downloadable Compliance Reports' : activeTab === 'history' ? 'Immutable Statutory Audit Logs' : 'Compliance Analytics & Risk Metrics'}
            </h3>
            {activeTab === 'history' && (
              <span className="badge badge-secondary" style={{ fontSize: '0.78rem' }}>
                <i className="fa-solid fa-shield-halved" style={{ marginRight: '6px' }}></i>
                Statutory Immutable Trail
              </span>
            )}
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
                  <th style={{ padding: '10px 8px', wordBreak: 'break-word' }}>Details</th>
                  <th style={{ padding: '10px 8px', wordBreak: 'break-word' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {historyLogs.map((h) => {
                  const rawChanges = h.changes || h.details;
                  const parsed = parseAuditChanges(rawChanges);

                  return (
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
                        {parsed && typeof parsed === 'object' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.82rem', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                              {String(rawChanges || '-')}
                            </span>
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ fontSize: '0.72rem', padding: '2px 8px', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', marginTop: '2px' }}
                              onClick={() => setSelectedAuditLog(h)}
                            >
                              <i className="fa-solid fa-eye" style={{ fontSize: '0.7rem' }}></i> View Details
                            </button>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', wordBreak: 'break-word', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                        {h.timestamp}
                      </td>
                    </tr>
                  );
                })}
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
        <div className="modal-backdrop active" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
          <div className="modal-content" style={{ width: '480px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', background: 'hsl(var(--bg-card))', padding: '24px', borderRadius: '12px', color: 'hsl(var(--text-primary))' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Generate Statutory Challan</h3>
            <form onSubmit={handleCreateChallan}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Statutory Type *</label>
                <select className="form-control" value={newChallan.statutoryType} onChange={(e) => setNewChallan({ ...newChallan, statutoryType: e.target.value })}>
                  <option>PF</option>
                  <option>ESI</option>
                  <option>PT</option>
                  <option>LWF</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Wage Month *</label>
                <input type="text" className="form-control" placeholder="e.g. Jul 2026" value={newChallan.wageMonth} onChange={(e) => setNewChallan({ ...newChallan, wageMonth: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Total Amount (₹) *</label>
                <input type="number" min="0" className="form-control" value={newChallan.totalAmount} onChange={(e) => setNewChallan({ ...newChallan, totalAmount: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Covered Employees Count *</label>
                <input type="number" min="1" className="form-control" value={newChallan.employeeCount} onChange={(e) => setNewChallan({ ...newChallan, employeeCount: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>State *</label>
                <input type="text" className="form-control" value={newChallan.state} onChange={(e) => setNewChallan({ ...newChallan, state: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Payment Due Date *</label>
                <input type="date" className="form-control" value={newChallan.dueDate} onChange={(e) => setNewChallan({ ...newChallan, dueDate: e.target.value })} required />
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
        <div className="modal-backdrop active" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
          <div className="modal-content" style={{ width: '480px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', background: 'hsl(var(--bg-card))', padding: '24px', borderRadius: '12px', color: 'hsl(var(--text-primary))' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Log Government Notice</h3>
            <form onSubmit={handleCreateNotice}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Notice Reference Number *</label>
                <input type="text" className="form-control" value={newNotice.noticeNumber} onChange={(e) => setNewNotice({ ...newNotice, noticeNumber: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Issuing Department *</label>
                <select className="form-control" value={newNotice.department} onChange={(e) => setNewNotice({ ...newNotice, department: e.target.value })}>
                  <option>EPFO</option>
                  <option>ESIC</option>
                  <option>Labor Department</option>
                  <option>Factory Inspectorate</option>
                  <option>Tax Authority</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Priority *</label>
                <select className="form-control" value={newNotice.priority} onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}>
                  <option>Normal</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Issue Date *</label>
                <input type="date" className="form-control" value={newNotice.issueDate} onChange={(e) => setNewNotice({ ...newNotice, issueDate: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Reply Due Date *</label>
                <input type="date" className="form-control" min={newNotice.issueDate} value={newNotice.dueDate} onChange={(e) => setNewNotice({ ...newNotice, dueDate: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Description / Clarification Needed *</label>
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
        <div className="modal-backdrop active" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
          <div className="modal-content" style={{ width: '480px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', background: 'hsl(var(--bg-card))', padding: '24px', borderRadius: '12px', color: 'hsl(var(--text-primary))' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Log Labour Inspection Record</h3>
            <form onSubmit={handleCreateInspection}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Authority Name *</label>
                <input type="text" className="form-control" value={newInspection.authority} onChange={(e) => setNewInspection({ ...newInspection, authority: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Plant / Location *</label>
                <input type="text" className="form-control" value={newInspection.location} onChange={(e) => setNewInspection({ ...newInspection, location: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Inspector Name *</label>
                <input type="text" className="form-control" value={newInspection.inspectorName} onChange={(e) => setNewInspection({ ...newInspection, inspectorName: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Inspection Date *</label>
                <input type="date" className="form-control" value={newInspection.inspectionDate} onChange={(e) => setNewInspection({ ...newInspection, inspectionDate: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Status *</label>
                <select className="form-control" value={newInspection.closureStatus} onChange={(e) => setNewInspection({ ...newInspection, closureStatus: e.target.value })}>
                  <option>Scheduled</option>
                  <option>In Progress</option>
                  <option>Observations Open</option>
                  <option>Closed</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Inspection Findings Summary *</label>
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

      {/* Delete confirmation */}
      {docToDelete && (
        <div className="modal-backdrop active" role="dialog" aria-modal="true" aria-labelledby="del-doc-title" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
          <div className="modal-content" style={{ width: '420px', maxWidth: '95vw', background: 'hsl(var(--bg-card))', padding: '24px', borderRadius: '12px', color: 'hsl(var(--text-primary))' }}>
            <h3 id="del-doc-title" style={{ margin: '0 0 10px 0' }}>Delete this document?</h3>
            <p style={{ margin: '0 0 18px 0', fontSize: '0.88rem', color: 'hsl(var(--text-secondary))', overflowWrap: 'anywhere' }}>
              <strong style={{ color: 'hsl(var(--text-primary))' }}>{docToDelete.title}</strong>{docToDelete.fileName ? ` (${docToDelete.fileName})` : ''} and its file will be removed permanently.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDocToDelete(null)} disabled={docDeleting}>Cancel</button>
              <button type="button" id="btn-confirm-delete-doc" className="btn btn-primary" style={{ background: '#dc2626', borderColor: '#dc2626' }} onClick={handleDeleteDoc} disabled={docDeleting}>
                {docDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Modal */}
      {showDocModal && (
        <div className="modal-backdrop active" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
          <div className="modal-content" style={{ width: '480px', maxWidth: '95vw', background: 'hsl(var(--bg-card))', padding: '24px', borderRadius: '12px', color: 'hsl(var(--text-primary))' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Upload Compliance Certificate / Document</h3>
            <form onSubmit={handleCreateDoc}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label htmlFor="comp-doc-title" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Document Title *</label>
                <input id="comp-doc-title" type="text" className="form-control" maxLength={120} value={newDoc.title} onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label htmlFor="comp-doc-category" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Category *</label>
                <select id="comp-doc-category" className="form-control" value={newDoc.category} onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })} required>
                  <option value="">Select a category</option>
                  <option>Challan Receipt</option>
                  <option>Return Receipt</option>
                  <option>Registration Certificate</option>
                  <option>Labour License</option>
                  <option>Government Notice</option>
                  <option>Inspection Report</option>
                  <option>Compliance Certificate</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="comp-doc-file" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>File *</label>
                <input id="comp-doc-file" type="file" className="form-control" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" onChange={(e) => setDocFile(e.target.files[0] || null)} required />
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>PDF, DOC, DOCX, JPG, PNG or WEBP, up to 4 MB.</div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowDocModal(false); setDocFile(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={docUploading}>{docUploading ? 'Uploading…' : 'Upload Document'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STATUTORY COMPLIANCE DOCUMENT VIEWER MODAL               */}
      {/* ======================================================== */}
      {/* Bug 039: 'active' un-hides the backdrop (global .modal-backdrop is opacity:0/pointer-events:none); portalled so the transformed .portal-container ancestor can't offset it */}
      {showDocViewerModal && viewingDoc && createPortal(
        <div
          className="modal-backdrop active"
          id="modal-compliance-doc-viewer"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDocViewer();
          }}
        >
          <div
            className="modal-content"
            style={{
              width: '840px',
              maxWidth: '96vw',
              maxHeight: '92vh',
              background: 'hsl(var(--bg-card))',
              padding: '0',
              borderRadius: '12px',
              color: 'hsl(var(--text-primary))',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid hsl(var(--border))',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'hsl(var(--bg-card))'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-file-shield" style={{ fontSize: '1.2rem', color: '#6366f1' }}></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{viewingDoc.title}</h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                    <span className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '0.72rem' }}>{viewingDoc.category}</span>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Ref: {viewingDoc.docId}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="btn btn-secondary"
                  id="btn-viewer-open-tab"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => handleOpenDocInNewTab(viewingDoc)}
                  disabled={!viewingDoc.fileId || !isPreviewable(viewingDoc)}
                  title="Open document in new browser tab"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square"></i> Open in New Tab
                </button>
                <button
                  className="btn btn-primary"
                  id="btn-viewer-download-pdf"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => handleDownloadDoc(viewingDoc)}
                  disabled={!viewingDoc.fileId}
                  title="Download the uploaded file"
                >
                  <i className="fa-solid fa-download"></i> Download
                </button>
                <button
                  className="btn btn-outline"
                  id="btn-viewer-close"
                  style={{ padding: '6px 10px', fontSize: '1rem', border: 'none' }}
                  onClick={() => closeDocViewer()}
                  title="Close viewer"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {docViewerError && (
                <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '1.2rem' }}></i>
                  <div>
                    {docViewerError}
                  </div>
                </div>
              )}

              {/* Document Overview Metadata */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', padding: '14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid hsl(var(--border))' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))' }}>Document Reference</div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{viewingDoc.docId}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))' }}>Document Category</div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{viewingDoc.category}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))' }}>Uploaded By</div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{viewingDoc.uploadedBy || 'Compliance Officer'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))' }}>Uploaded On</div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{viewingDoc.createdAt ? new Date(viewingDoc.createdAt).toLocaleDateString() : '—'}</div>
                </div>
                {viewingDoc.fileId && (
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))' }}>File</div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', overflowWrap: 'anywhere' }}>{viewingDoc.fileName} · {formatBytes(viewingDoc.fileSize)}</div>
                  </div>
                )}
              </div>

              {/* Embedded Document Reading Canvas */}
              {viewingDoc.fileId && !docViewerError && (
                <div style={{ width: '100%', height: '420px', maxHeight: '55vh', borderRadius: '8px', border: '1px solid hsl(var(--border))', overflow: 'auto', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  {docViewerLoading || !docPreviewUrl ? (
                    <span role="status"><i className="fa-solid fa-spinner fa-spin"></i> Loading file…</span>
                  ) : !isPreviewable(viewingDoc) ? (
                    <span style={{ padding: '16px', textAlign: 'center' }}>This file type has no in-page preview. Use Download to open it.</span>
                  ) : /\.pdf$/i.test(viewingDoc.fileName) ? (
                    <iframe src={docPreviewUrl} title={viewingDoc.title} style={{ width: '100%', height: '100%', border: 'none' }} />
                  ) : (
                    <img src={docPreviewUrl} alt={viewingDoc.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '12px 24px',
                borderTop: '1px solid hsl(var(--border))',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'hsl(var(--bg-card))'
              }}
            >
              <span></span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => closeDocViewer()}
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* AUDIT LOG DETAILS MODAL */}
      {selectedAuditLog && (
        <div
          id="modal-statutory-audit-details"
          className="modal-backdrop active"
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
            zIndex: 99999,
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
                  {selectedAuditLog.performedBy} ({selectedAuditLog.userRole || 'Compliance Officer'})
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
                Statutory Change Details
              </h4>
              {(() => {
                const changes = parseAuditChanges(selectedAuditLog.changes || selectedAuditLog.details);
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
                  <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', fontSize: '0.85rem', wordBreak: 'break-word' }}>
                    {String(selectedAuditLog.changes || selectedAuditLog.details || 'No structured details recorded')}
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
                      : JSON.stringify(selectedAuditLog.changes || selectedAuditLog.details, null, 2);
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
                    : JSON.stringify(selectedAuditLog.changes || selectedAuditLog.details, null, 2)}
                </code>
              </pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StatutoryComplianceModule;
