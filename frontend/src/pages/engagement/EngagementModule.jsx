import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../api';

const EngagementModule = ({ searchQuery = '' }) => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');

  // Module Data States
  const [dashboardMetrics, setDashboardMetrics] = useState({
    activeCommunications: 3,
    openGrievances: 1,
    openHelpdeskTickets: 2,
    welfareRequestsPending: 1,
    recognitionPosts: 4,
    suggestionCount: 5,
    employeeEngagementScore: '94.2%',
    slaPerformanceScore: '98.5%'
  });

  const [suggestions, setSuggestions] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [welfares, setWelfares] = useState([]);
  const [recognitions, setRecognitions] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Modals & Form States
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [showHelpdeskModal, setShowHelpdeskModal] = useState(false);
  const [showWelfareModal, setShowWelfareModal] = useState(false);
  const [showRecognitionModal, setShowRecognitionModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);

  // Form Fields
  const [newSuggestion, setNewSuggestion] = useState({ title: '', category: 'Process Improvement', description: '', businessImpact: '', estimatedBenefit: '', priority: 'Medium' });
  const [newGrievance, setNewGrievance] = useState({ category: 'Workplace Environment', subject: '', description: '', severity: 'Medium', isConfidential: false });
  const [newTicket, setNewTicket] = useState({ category: 'IT Support', subcategory: 'General', subject: '', description: '', priority: 'Medium' });
  const [newWelfare, setNewWelfare] = useState({ welfareType: 'Medical Assistance', description: '', amount: 10000 });
  const [newRecognition, setNewRecognition] = useState({ recipientName: '', recipientId: 'EMP-1003', category: 'Spot Award', badge: '🏆 Outstanding Execution', appreciationMessage: '' });
  const [newComm, setNewComm] = useState({ title: '', category: 'Announcement', content: '', targetAudience: 'All Employees', acknowledgementRequired: true });

  // Status Action Modals
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusActionModal, setStatusActionModal] = useState(''); // 'review_sug', 'resolve_grv', 'resolve_hd', 'approve_wel'
  const [actionComments, setActionComments] = useState('');
  const [actionStatus, setActionStatus] = useState('');

  // Comment input state for Recognition Wall
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    fetchModuleData();
  }, [activeTab]);

  const fetchModuleData = async () => {
    try {
      const [dashRes, sugRes, grvRes, hdRes, welRes, recRes, commRes, auditRes] = await Promise.allSettled([
        api.get('/engagement/dashboard'),
        api.get('/engagement/suggestions'),
        api.get('/engagement/grievances'),
        api.get('/engagement/helpdesk'),
        api.get('/engagement/welfare'),
        api.get('/engagement/recognition'),
        api.get('/engagement/communications'),
        api.get('/engagement/audit')
      ]);

      if (dashRes.status === 'fulfilled') setDashboardMetrics(dashRes.value.data);
      if (sugRes.status === 'fulfilled') setSuggestions(sugRes.value.data);
      if (grvRes.status === 'fulfilled') setGrievances(grvRes.value.data);
      if (hdRes.status === 'fulfilled') setTickets(hdRes.value.data);
      if (welRes.status === 'fulfilled') setWelfares(welRes.value.data);
      if (recRes.status === 'fulfilled') setRecognitions(recRes.value.data);
      if (commRes.status === 'fulfilled') setCommunications(commRes.value.data);
      if (auditRes.status === 'fulfilled') setAuditLogs(auditRes.value.data);
    } catch (e) {
      console.error('Failed to load engagement module data:', e);
    }
  };

  // Handler: Submit Suggestion
  const handleCreateSuggestion = async (e) => {
    e.preventDefault();
    try {
      await api.post('/engagement/suggestions', newSuggestion);
      showToast('Suggestion submitted successfully!', 'success');
      setShowSuggestionModal(false);
      setNewSuggestion({ title: '', category: 'Process Improvement', description: '', businessImpact: '', estimatedBenefit: '', priority: 'Medium' });
      fetchModuleData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit suggestion', 'error');
    }
  };

  // Handler: Update Suggestion Status
  const handleUpdateSuggestionStatus = async () => {
    if (!selectedItem) return;
    try {
      await api.put(`/engagement/suggestions/${selectedItem._id}/status`, {
        status: actionStatus,
        reviewerComments: actionComments,
        rewardBadge: actionStatus === 'Approved' ? '💡 Innovator Badge' : '',
        rewardPoints: actionStatus === 'Approved' ? 250 : 0
      });
      showToast(`Suggestion marked as ${actionStatus}`, 'success');
      setStatusActionModal('');
      setSelectedItem(null);
      fetchModuleData();
    } catch (err) {
      showToast('Failed to update suggestion status', 'error');
    }
  };

  // Handler: Raise Grievance
  const handleCreateGrievance = async (e) => {
    e.preventDefault();
    try {
      await api.post('/engagement/grievances', newGrievance);
      showToast('Grievance recorded confidentially', 'success');
      setShowGrievanceModal(false);
      setNewGrievance({ category: 'Workplace Environment', subject: '', description: '', severity: 'Medium', isConfidential: false });
      fetchModuleData();
    } catch (err) {
      showToast('Failed to raise grievance', 'error');
    }
  };

  // Handler: Resolve Grievance
  const handleResolveGrievance = async () => {
    if (!selectedItem) return;
    try {
      await api.put(`/engagement/grievances/${selectedItem._id}`, {
        status: actionStatus,
        resolution: actionComments
      });
      showToast(`Grievance updated to ${actionStatus}`, 'success');
      setStatusActionModal('');
      setSelectedItem(null);
      fetchModuleData();
    } catch (err) {
      showToast('Failed to update grievance', 'error');
    }
  };

  // Handler: Raise Helpdesk Ticket
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await api.post('/engagement/helpdesk', newTicket);
      showToast('Helpdesk ticket opened', 'success');
      setShowHelpdeskModal(false);
      setNewTicket({ category: 'IT Support', subcategory: 'General', subject: '', description: '', priority: 'Medium' });
      fetchModuleData();
    } catch (err) {
      showToast('Failed to open helpdesk ticket', 'error');
    }
  };

  // Handler: Resolve Helpdesk Ticket
  const handleResolveTicket = async () => {
    if (!selectedItem) return;
    try {
      await api.put(`/engagement/helpdesk/${selectedItem._id}`, {
        status: actionStatus,
        resolutionNotes: actionComments
      });
      showToast(`Ticket status updated to ${actionStatus}`, 'success');
      setStatusActionModal('');
      setSelectedItem(null);
      fetchModuleData();
    } catch (err) {
      showToast('Failed to update ticket status', 'error');
    }
  };

  // Handler: Submit Welfare Request
  const handleCreateWelfare = async (e) => {
    e.preventDefault();
    try {
      await api.post('/engagement/welfare', newWelfare);
      showToast('Welfare request submitted', 'success');
      setShowWelfareModal(false);
      setNewWelfare({ welfareType: 'Medical Assistance', description: '', amount: 10000 });
      fetchModuleData();
    } catch (err) {
      showToast('Failed to submit welfare request', 'error');
    }
  };

  // Handler: Approve Welfare Request
  const handleApproveWelfare = async () => {
    if (!selectedItem) return;
    try {
      await api.put(`/engagement/welfare/${selectedItem._id}/status`, {
        status: actionStatus,
        approvalRemarks: actionComments
      });
      showToast(`Welfare request marked as ${actionStatus}`, 'success');
      setStatusActionModal('');
      setSelectedItem(null);
      fetchModuleData();
    } catch (err) {
      showToast('Failed to update welfare request', 'error');
    }
  };

  // Handler: Post Recognition
  const handleCreateRecognition = async (e) => {
    e.preventDefault();
    try {
      await api.post('/engagement/recognition', {
        recipient: { id: newRecognition.recipientId, name: newRecognition.recipientName || 'Karthik Potur', dept: 'Engineering' },
        category: newRecognition.category,
        badge: newRecognition.badge,
        appreciationMessage: newRecognition.appreciationMessage
      });
      showToast('Kudos published on Recognition Wall!', 'success');
      setShowRecognitionModal(false);
      setNewRecognition({ recipientName: '', recipientId: 'EMP-1003', category: 'Spot Award', badge: '🏆 Outstanding Execution', appreciationMessage: '' });
      fetchModuleData();
    } catch (err) {
      showToast('Failed to post recognition', 'error');
    }
  };

  // Handler: Like / Comment Recognition
  const handleInteractRecognition = async (postId, action) => {
    try {
      const text = commentInputs[postId] || '';
      await api.post(`/engagement/recognition/${postId}/interact`, { action, commentText: text });
      if (action === 'comment') {
        setCommentInputs({ ...commentInputs, [postId]: '' });
      }
      fetchModuleData();
    } catch (err) {
      showToast('Interaction failed', 'error');
    }
  };

  // Handler: Publish Communication
  const handleCreateComm = async (e) => {
    e.preventDefault();
    try {
      await api.post('/engagement/communications', newComm);
      showToast('Communication broadcasted to organization', 'success');
      setShowCommunicationModal(false);
      setNewComm({ title: '', category: 'Announcement', content: '', targetAudience: 'All Employees', acknowledgementRequired: true });
      fetchModuleData();
    } catch (err) {
      showToast('Failed to publish communication', 'error');
    }
  };

  // Handler: Acknowledge Communication
  const handleAcknowledgeComm = async (commId) => {
    try {
      await api.post(`/engagement/communications/${commId}/read`, { acknowledge: true });
      showToast('Communication acknowledged', 'success');
      fetchModuleData();
    } catch (err) {
      showToast('Failed to record acknowledgement', 'error');
    }
  };

  return (
    <div className="engagement-module-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div className="glass-card mb-6" style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
        border: '1px solid rgba(168, 85, 247, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'hsl(var(--foreground))', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: '#fff',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '1.25rem'
            }}>
              <i className="fa-solid fa-heart-pulse"></i>
            </span>
            Module 7: Employee Experience & Engagement
          </h1>
          <p style={{ margin: '6px 0 0 0', color: 'hsl(var(--muted-foreground))', fontSize: '0.95rem' }}>
            Enterprise workplace culture suite — Suggestions, Grievances, IT/HR Helpdesk, Welfare, Kudos Wall & Broadcasts.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={fetchModuleData} style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="fa-solid fa-rotate"></i> Refresh Data
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="sub-nav-tabs" style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: 'fa-chart-pie' },
          { id: 'suggestions', label: 'Suggestion Scheme', icon: 'fa-lightbulb' },
          { id: 'grievances', label: 'Grievance Desk', icon: 'fa-shield-heart' },
          { id: 'helpdesk', label: 'IT/HR Helpdesk', icon: 'fa-headset' },
          { id: 'welfare', label: 'Welfare Support', icon: 'fa-hand-holding-hand' },
          { id: 'recognition', label: 'Recognition Wall', icon: 'fa-award' },
          { id: 'communications', label: 'Company Bulletins', icon: 'fa-bullhorn' },
          { id: 'reports', label: 'Reports & Audits', icon: 'fa-file-invoice' },
          { id: 'framework', label: 'Framework Config', icon: 'fa-gears' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              background: activeTab === tab.id ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab.id ? '#ffffff' : 'hsl(var(--muted-foreground))',
              boxShadow: activeTab === tab.id ? '0 4px 14px rgba(99,102,241,0.35)' : 'none'
            }}
          >
            <i className={`fa-solid ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'overview' && (
        <div>
          {/* KPI Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="glass-card" style={{ padding: '20px', borderRadius: '14px', borderLeft: '4px solid #6366f1' }}>
              <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>EMPLOYEE ENGAGEMENT</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: '#6366f1' }}>{dashboardMetrics.employeeEngagementScore}</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>↑ 2.4% vs last quarter</div>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '14px', borderLeft: '4px solid #a855f7' }}>
              <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>ACTIVE BULLETINS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: '#a855f7' }}>{dashboardMetrics.activeCommunications}</div>
              <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>Broadcast announcements</div>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '14px', borderLeft: '4px solid #ef4444' }}>
              <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>OPEN GRIEVANCES</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: '#ef4444' }}>{dashboardMetrics.openGrievances}</div>
              <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>Under investigation</div>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '14px', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>OPEN HELPDESK TICKETS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: '#3b82f6' }}>{dashboardMetrics.openHelpdeskTickets}</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>SLA Compliance: {dashboardMetrics.slaPerformanceScore}</div>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '14px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>RECOGNITION KUDOS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: '#f59e0b' }}>{dashboardMetrics.recognitionPosts}</div>
              <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>Spot awards & Badges</div>
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="glass-card mb-6" style={{ padding: '20px', borderRadius: '14px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', marginRight: '8px' }}><i className="fa-solid fa-bolt text-warning"></i> Quick Actions:</span>
            <button className="btn btn-primary" onClick={() => setShowSuggestionModal(true)} style={{ borderRadius: '8px', fontSize: '0.85rem' }}>
              <i className="fa-solid fa-lightbulb"></i> Submit Suggestion
            </button>
            <button className="btn btn-secondary" onClick={() => setShowHelpdeskModal(true)} style={{ borderRadius: '8px', fontSize: '0.85rem' }}>
              <i className="fa-solid fa-headset"></i> Raise IT/HR Ticket
            </button>
            <button className="btn btn-outline" onClick={() => setShowGrievanceModal(true)} style={{ borderRadius: '8px', fontSize: '0.85rem' }}>
              <i className="fa-solid fa-shield-heart"></i> Raise Grievance
            </button>
            <button className="btn btn-outline" onClick={() => setShowWelfareModal(true)} style={{ borderRadius: '8px', fontSize: '0.85rem' }}>
              <i className="fa-solid fa-hand-holding-hand"></i> Request Welfare Benefit
            </button>
            <button className="btn btn-outline" onClick={() => setShowRecognitionModal(true)} style={{ borderRadius: '8px', fontSize: '0.85rem' }}>
              <i className="fa-solid fa-award"></i> Give Kudos
            </button>
          </div>

          {/* Recent Communications Feed */}
          <div className="glass-card mb-6" style={{ padding: '20px', borderRadius: '14px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>📌 Company Announcements & Bulletins</h3>
            {communications.length === 0 ? (
              <p style={{ color: 'hsl(var(--muted-foreground))' }}>No announcements published yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {communications.slice(0, 3).map(c => (
                  <div key={c._id} style={{
                    padding: '16px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-info">{c.category}</span>
                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>{c.title}</span>
                      </div>
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.88rem', color: 'hsl(var(--muted-foreground))' }}>{c.content}</p>
                    </div>
                    {c.acknowledgementRequired && (
                      <button
                        className={`btn ${c.isAcknowledged ? 'btn-success' : 'btn-primary'}`}
                        disabled={c.isAcknowledged}
                        onClick={() => handleAcknowledgeComm(c.communicationId)}
                        style={{ borderRadius: '8px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                      >
                        {c.isAcknowledged ? '✓ Acknowledged' : 'Acknowledge Read'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SUGGESTIONS */}
      {activeTab === 'suggestions' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>💡 Innovation & Suggestion Scheme</h3>
            <button className="btn btn-primary" onClick={() => setShowSuggestionModal(true)} style={{ borderRadius: '8px' }}>
              <i className="fa-solid fa-plus"></i> Submit Suggestion
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Title & Category</th>
                <th style={{ padding: '12px' }}>Impact / Benefit</th>
                <th style={{ padding: '12px' }}>Submitted By</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>No suggestions recorded yet.</td></tr>
              ) : suggestions.map(s => (
                <tr key={s._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', fontWeight: 700 }}>{s.suggestionId}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 600 }}>{s.title}</div>
                    <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>{s.category}</span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                    <div>{s.businessImpact || s.description}</div>
                    {s.estimatedBenefit && <span style={{ color: '#10b981', fontWeight: 600 }}>Val: {s.estimatedBenefit}</span>}
                  </td>
                  <td style={{ padding: '12px', fontSize: '0.85rem' }}>{s.submittedBy?.name}</td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${s.status === 'Approved' || s.status === 'Implemented' ? 'badge-success' : s.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {user?.role === 'hr' && (
                      <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => {
                        setSelectedItem(s);
                        setActionStatus('Approved');
                        setStatusActionModal('review_sug');
                      }}>
                        Evaluate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: GRIEVANCES */}
      {activeTab === 'grievances' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>🛡️ Confidential Grievance Management Desk</h3>
            <button className="btn btn-primary" onClick={() => setShowGrievanceModal(true)} style={{ borderRadius: '8px' }}>
              <i className="fa-solid fa-plus"></i> Raise Grievance
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Category & Subject</th>
                <th style={{ padding: '12px' }}>Severity</th>
                <th style={{ padding: '12px' }}>Confidential</th>
                <th style={{ padding: '12px' }}>Assigned Officer</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {grievances.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>No grievances on record.</td></tr>
              ) : grievances.map(g => (
                <tr key={g._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', fontWeight: 700 }}>{g.grievanceId}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 600 }}>{g.subject}</div>
                    <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>{g.category}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${g.severity === 'Critical' || g.severity === 'High' ? 'badge-danger' : 'badge-warning'}`}>
                      {g.severity}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {g.isConfidential ? <span style={{ color: '#ef4444', fontWeight: 700 }}>🔒 Confidential</span> : 'Standard'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '0.85rem' }}>{g.assignedOfficer?.name || 'Unassigned'}</td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${g.status === 'Resolved' || g.status === 'Closed' ? 'badge-success' : 'badge-warning'}`}>
                      {g.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {user?.role === 'hr' && (
                      <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => {
                        setSelectedItem(g);
                        setActionStatus('Resolved');
                        setStatusActionModal('resolve_grv');
                      }}>
                        Investigate / Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: HELPDESK TICKETS */}
      {activeTab === 'helpdesk' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>🎧 IT & HR Helpdesk Support Desk</h3>
            <button className="btn btn-primary" onClick={() => setShowHelpdeskModal(true)} style={{ borderRadius: '8px' }}>
              <i className="fa-solid fa-plus"></i> Open New Ticket
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
                <th style={{ padding: '12px' }}>Ticket ID</th>
                <th style={{ padding: '12px' }}>Subject & Category</th>
                <th style={{ padding: '12px' }}>Priority</th>
                <th style={{ padding: '12px' }}>Raised By</th>
                <th style={{ padding: '12px' }}>Assigned To</th>
                <th style={{ padding: '12px' }}>SLA Target</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr><td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>No support tickets active.</td></tr>
              ) : tickets.map(t => (
                <tr key={t._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', fontWeight: 700 }}>{t.ticketId}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 600 }}>{t.subject}</div>
                    <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>{t.category} ({t.subcategory})</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${t.priority === 'Critical' ? 'badge-danger' : 'badge-info'}`}>{t.priority}</span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '0.85rem' }}>{t.raisedBy?.name}</td>
                  <td style={{ padding: '12px', fontSize: '0.85rem' }}>{t.assignedTo?.name}</td>
                  <td style={{ padding: '12px', fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>{t.slaHours}h SLA</td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${t.status === 'Resolved' || t.status === 'Closed' ? 'badge-success' : 'badge-warning'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => {
                      setSelectedItem(t);
                      setActionStatus('Resolved');
                      setStatusActionModal('resolve_hd');
                    }}>
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: WELFARE REQUESTS */}
      {activeTab === 'welfare' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>🤝 Employee Welfare & Benefit Grants</h3>
            <button className="btn btn-primary" onClick={() => setShowWelfareModal(true)} style={{ borderRadius: '8px' }}>
              <i className="fa-solid fa-plus"></i> Request Welfare Benefit
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
                <th style={{ padding: '12px' }}>Request ID</th>
                <th style={{ padding: '12px' }}>Welfare Benefit Type</th>
                <th style={{ padding: '12px' }}>Requested Amount</th>
                <th style={{ padding: '12px' }}>Employee</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {welfares.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>No welfare requests recorded.</td></tr>
              ) : welfares.map(w => (
                <tr key={w._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', fontWeight: 700 }}>{w.requestId}</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{w.welfareType}</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#10b981' }}>₹{w.amount?.toLocaleString()}</td>
                  <td style={{ padding: '12px', fontSize: '0.85rem' }}>{w.requestedBy?.name}</td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${w.status === 'Benefit Issued' || w.status === 'Management Approved' ? 'badge-success' : 'badge-warning'}`}>
                      {w.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {user?.role === 'hr' && (
                      <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => {
                        setSelectedItem(w);
                        setActionStatus('Benefit Issued');
                        setStatusActionModal('approve_wel');
                      }}>
                        Approve / Issue
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 6: RECOGNITION WALL */}
      {activeTab === 'recognition' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>🏆 Organization Wall of Honor & Kudos</h3>
            <button className="btn btn-primary" onClick={() => setShowRecognitionModal(true)} style={{ borderRadius: '8px' }}>
              <i className="fa-solid fa-award"></i> Give Kudos
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            {recognitions.map(r => (
              <div key={r._id} className="glass-card" style={{ padding: '20px', borderRadius: '14px', borderTop: '4px solid #f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge badge-warning" style={{ fontSize: '0.8rem' }}>{r.badge}</span>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>{new Date(r.date).toLocaleDateString()}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>
                    {r.recipient?.name?.charAt(0) || 'E'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{r.recipient?.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Recognized by {r.recognizedBy?.name}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
                  "{r.appreciationMessage}"
                </p>

                {/* Interactions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                  <button onClick={() => handleInteractRecognition(r._id, 'like')} style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fa-solid fa-thumbs-up"></i> {r.likes?.length || 0} Likes
                  </button>
                  <span style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>💬 {r.comments?.length || 0} Comments</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: COMPANY BULLETINS */}
      {activeTab === 'communications' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>📢 Enterprise Communication & Circulars</h3>
            {user?.role === 'hr' && (
              <button className="btn btn-primary" onClick={() => setShowCommunicationModal(true)} style={{ borderRadius: '8px' }}>
                <i className="fa-solid fa-bullhorn"></i> Publish Bulletin
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {communications.map(c => (
              <div key={c._id} style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-info">{c.category}</span>
                  <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Published: {new Date(c.publishDate).toLocaleDateString()}</span>
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700 }}>{c.title}</h4>
                <p style={{ margin: 0, fontSize: '0.92rem', color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>{c.content}</p>
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Audience: {c.targetAudience}</span>
                  {c.acknowledgementRequired && (
                    <button
                      className={`btn ${c.isAcknowledged ? 'btn-success' : 'btn-primary'}`}
                      disabled={c.isAcknowledged}
                      onClick={() => handleAcknowledgeComm(c.communicationId)}
                      style={{ borderRadius: '8px', fontSize: '0.8rem' }}
                    >
                      {c.isAcknowledged ? '✓ Acknowledged' : 'Acknowledge Document'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: REPORTS & AUDITS */}
      {activeTab === 'reports' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '14px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 700 }}>📊 Audit Trail & Governance Logs</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
                <th style={{ padding: '12px' }}>Timestamp</th>
                <th style={{ padding: '12px' }}>Entity Type</th>
                <th style={{ padding: '12px' }}>Entity ID</th>
                <th style={{ padding: '12px' }}>Action</th>
                <th style={{ padding: '12px' }}>Performed By</th>
                <th style={{ padding: '12px' }}>Comments</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(l => (
                <tr key={l._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                  <td style={{ padding: '12px' }}>{new Date(l.timestamp).toLocaleString()}</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{l.entityType}</td>
                  <td style={{ padding: '12px', fontWeight: 700 }}>{l.entityId}</td>
                  <td style={{ padding: '12px' }}><span className="badge badge-info">{l.action}</span></td>
                  <td style={{ padding: '12px' }}>{l.performedBy?.name} ({l.performedBy?.role})</td>
                  <td style={{ padding: '12px', color: 'hsl(var(--muted-foreground))' }}>{l.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 9: FRAMEWORK CONFIG */}
      {activeTab === 'framework' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '14px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 700 }}>⚙️ Employee Experience Framework Settings</h3>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>Configure SLAs, categories, escalation metrics, and notification rules for Module 7.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '20px' }}>
            <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h4 style={{ margin: '0 0 8px 0' }}>Helpdesk SLA Matrix</h4>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>Critical: 4 Hours | High: 12 Hours | Medium: 24 Hours</p>
            </div>
            <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h4 style={{ margin: '0 0 8px 0' }}>Grievance Escalation SLA</h4>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>HR Investigation SLA: 48 Hours | Resolution SLA: 7 Days</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT SUGGESTION */}
      {showSuggestionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '500px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ marginTop: 0 }}>💡 Submit Innovation Suggestion</h3>
            <form onSubmit={handleCreateSuggestion}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Title</label>
                <input type="text" className="input" required value={newSuggestion.title} onChange={e => setNewSuggestion({ ...newSuggestion, title: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Description</label>
                <textarea className="input" required rows="3" value={newSuggestion.description} onChange={e => setNewSuggestion({ ...newSuggestion, description: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px' }}></textarea>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Business Impact</label>
                <input type="text" className="input" placeholder="e.g. Saves 10 hours weekly" value={newSuggestion.businessImpact} onChange={e => setNewSuggestion({ ...newSuggestion, businessImpact: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowSuggestionModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Suggestion</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RAISE GRIEVANCE */}
      {showGrievanceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '500px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ marginTop: 0 }}>🛡️ Confidential Grievance Form</h3>
            <form onSubmit={handleCreateGrievance}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Subject</label>
                <input type="text" className="input" required value={newGrievance.subject} onChange={e => setNewGrievance({ ...newGrievance, subject: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Description</label>
                <textarea className="input" required rows="3" value={newGrievance.description} onChange={e => setNewGrievance({ ...newGrievance, description: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px' }}></textarea>
              </div>
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="conf" checked={newGrievance.isConfidential} onChange={e => setNewGrievance({ ...newGrievance, isConfidential: e.target.checked })} />
                <label htmlFor="conf" style={{ fontSize: '0.85rem' }}>Mark as Confidential Case</label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowGrievanceModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Grievance</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: HELPDESK TICKET */}
      {showHelpdeskModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '500px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ marginTop: 0 }}>🎧 Open Helpdesk Ticket</h3>
            <form onSubmit={handleCreateTicket}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Subject</label>
                <input type="text" className="input" required value={newTicket.subject} onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Description</label>
                <textarea className="input" required rows="3" value={newTicket.description} onChange={e => setNewTicket({ ...newTicket, description: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px' }}></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowHelpdeskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Open Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WELFARE REQUEST */}
      {showWelfareModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '500px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ marginTop: 0 }}>🤝 Request Welfare Support</h3>
            <form onSubmit={handleCreateWelfare}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Welfare Type</label>
                <select className="input" value={newWelfare.welfareType} onChange={e => setNewWelfare({ ...newWelfare, welfareType: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px' }}>
                  <option>Medical Assistance</option>
                  <option>Education Support</option>
                  <option>Travel Support</option>
                  <option>Emergency Fund</option>
                  <option>Festival Benefits</option>
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Requested Amount (₹)</label>
                <input type="number" className="input" required value={newWelfare.amount} onChange={e => setNewWelfare({ ...newWelfare, amount: Number(e.target.value) })} style={{ width: '100%', padding: '8px', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Description</label>
                <textarea className="input" required rows="3" value={newWelfare.description} onChange={e => setNewWelfare({ ...newWelfare, description: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px' }}></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowWelfareModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECOGNITION POST */}
      {showRecognitionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '500px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ marginTop: 0 }}>🏆 Give Recognition & Kudos</h3>
            <form onSubmit={handleCreateRecognition}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Recipient Name</label>
                <input type="text" className="input" required placeholder="e.g. Karthik Potur" value={newRecognition.recipientName} onChange={e => setNewRecognition({ ...newRecognition, recipientName: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Badge Award</label>
                <input type="text" className="input" required value={newRecognition.badge} onChange={e => setNewRecognition({ ...newRecognition, badge: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Appreciation Message</label>
                <textarea className="input" required rows="3" value={newRecognition.appreciationMessage} onChange={e => setNewRecognition({ ...newRecognition, appreciationMessage: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px' }}></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowRecognitionModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Kudos</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMMUNICATION BULLETIN */}
      {showCommunicationModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '500px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ marginTop: 0 }}>📢 Broadcast Announcement Bulletin</h3>
            <form onSubmit={handleCreateComm}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Bulletin Title</label>
                <input type="text" className="input" required value={newComm.title} onChange={e => setNewComm({ ...newComm, title: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Content Body</label>
                <textarea className="input" required rows="3" value={newComm.content} onChange={e => setNewComm({ ...newComm, content: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px' }}></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowCommunicationModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Broadcast</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATUS EVALUATION MODAL */}
      {statusActionModal && selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '450px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ marginTop: 0 }}>Action Case #{selectedItem.suggestionId || selectedItem.grievanceId || selectedItem.ticketId || selectedItem.requestId}</h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Select Target Status</label>
              <select className="input" value={actionStatus} onChange={e => setActionStatus(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px' }}>
                {statusActionModal === 'review_sug' && (
                  <>
                    <option value="Approved">Approved</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Implemented">Implemented</option>
                    <option value="Rejected">Rejected</option>
                  </>
                )}
                {statusActionModal === 'resolve_grv' && (
                  <>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </>
                )}
                {statusActionModal === 'resolve_hd' && (
                  <>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </>
                )}
                {statusActionModal === 'approve_wel' && (
                  <>
                    <option value="HR Verified">HR Verified</option>
                    <option value="Management Approved">Management Approved</option>
                    <option value="Benefit Issued">Benefit Issued</option>
                    <option value="Rejected">Rejected</option>
                  </>
                )}
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Notes / Remarks</label>
              <textarea className="input" rows="3" value={actionComments} onChange={e => setActionComments(e.target.value)} placeholder="Provide resolution or evaluation comments..." style={{ width: '100%', padding: '8px', borderRadius: '6px' }}></textarea>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-outline" onClick={() => { setStatusActionModal(''); setSelectedItem(null); }}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                if (statusActionModal === 'review_sug') handleUpdateSuggestionStatus();
                else if (statusActionModal === 'resolve_grv') handleResolveGrievance();
                else if (statusActionModal === 'resolve_hd') handleResolveTicket();
                else if (statusActionModal === 'approve_wel') handleApproveWelfare();
              }}>Confirm Update</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EngagementModule;
