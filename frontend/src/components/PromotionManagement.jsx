import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { useToast } from './Toast';

const PromotionManagement = () => {
  const { user } = useContext(AuthContext);
  const { employees } = useContext(DataContext);
  const { showToast } = useToast();

  const [promotions, setPromotions] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, eligibleCount: 0 });
  const [loading, setLoading] = useState(false);
  const [innerTab, setInnerTab] = useState('dashboard'); // 'dashboard', 'recommend', 'verify', 'approve', 'history', 'reports'
  
  const [selectedProm, setSelectedProm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [depts, setDepts] = useState([]);
  const [grades, setGrades] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [reportsData, setReportsData] = useState({ approvedList: [], pendingList: [], totalCostImpact: 0, departmentReport: [], historyList: [] });

  // Recommend Form
  const [recommendForm, setRecommendForm] = useState({
    employeeId: '',
    proposedDesignation: 'Senior Developer',
    proposedGrade: 'B2',
    proposedDepartment: '',
    proposedManagerId: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    justification: '',
    performanceSummary: 'A-grade rating overall.',
    keyAchievements: 'Delivered CRM core models.',
    attachmentUrl: '',
    currentSalary: 50000,
    proposedSalary: 65000
  });

  const [verificationForm, setVerificationForm] = useState({
    status: 'Pending Approval',
    comments: ''
  });

  const [approvalForm, setApprovalForm] = useState({
    status: 'Approved',
    comments: ''
  });

  const [generatedLetter, setGeneratedLetter] = useState('');

  const isHr = user?.role === 'hr';

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/promotions');
      setPromotions(res.data.data);
      setSummary(res.data.summary);

      const repRes = await api.get('/promotions/reports');
      setReportsData(repRes.data);

      const deptsRes = await api.get('/org/departments');
      setDepts(deptsRes.data);

      const desgRes = await api.get('/org/designations');
      setDesignations(desgRes.data);
    } catch (err) {
      console.error('Error fetching promotions data:', err);
      showToast('Error loading promotions tracker.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecommendSubmit = async (e) => {
    e.preventDefault();
    
    // Validate effective date cannot be backdated
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(recommendForm.effectiveDate) < today) {
      showToast('Effective Date cannot be set in the past.', 'warning');
      return;
    }

    try {
      await api.post('/promotions', recommendForm);
      showToast('Promotion recommendation request initiated.', 'success');
      setInnerTab('dashboard');
      fetchData();
      setRecommendForm({
        employeeId: '',
        proposedDesignation: 'Senior Developer',
        proposedGrade: 'B2',
        proposedDepartment: '',
        proposedManagerId: '',
        effectiveDate: new Date().toISOString().split('T')[0],
        justification: '',
        performanceSummary: 'A-grade rating overall.',
        keyAchievements: 'Delivered CRM core models.',
        attachmentUrl: '',
        currentSalary: 50000,
        proposedSalary: 65000
      });
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating recommendation request.', 'error');
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!selectedProm) return;
    try {
      await api.put(`/promotions/${selectedProm._id}/verify`, verificationForm);
      showToast(`Eligibility checklist saved: ${verificationForm.status}`, 'success');
      setInnerTab('dashboard');
      setSelectedProm(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error submitting verification.', 'error');
    }
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProm) return;

    if (!approvalForm.comments.trim()) {
      showToast('Decision comments/remarks are mandatory.', 'warning');
      return;
    }

    try {
      const res = await api.put(`/promotions/${selectedProm._id}/approve`, approvalForm);
      showToast(`Request processed successfully: ${approvalForm.status}`, 'success');
      if (approvalForm.status === 'Approved') {
        setGeneratedLetter('PROMOTION & INCREMENT ADVISORY\n\nRequest ID: ' + selectedProm.requestId + '\n\nDear ' + selectedProm.employeeName + ',\n\nWe are pleased to inform you that you have been promoted. Details:\n\n• New Designation: ' + selectedProm.proposedDesignation + '\n• New Grade/Band: ' + selectedProm.proposedGrade + '\n• New Department: ' + (selectedProm.proposedDepartment || selectedProm.currentDepartment) + '\n• Effective Date: ' + new Date(selectedProm.effectiveDate).toLocaleDateString() + '\n\nAdditionally, your salary has been revised to ' + selectedProm.proposedSalary + ' INR.\n\nCongratulations!\nHR & Management');
      }
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error processing approval decision.', 'error');
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await api.put(`/promotions/${id}/acknowledge`);
      showToast('Promotion letter terms successfully acknowledged.', 'success');
      fetchData();
    } catch (err) {
      showToast('Error signing acknowledgement.', 'error');
    }
  };

  const ownProm = !isHr ? promotions.find(p => p.employeeId === user.id) : null;

  return (
    <div className="portal-container" style={{ padding: '0 0 24px 0' }}>
      
      {/* Banner */}
      <div className="welcome-card-banner" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #1e1b4b 100%)', color: '#fff', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>Promotion Workflow</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {isHr 
              ? 'Evaluate employee eligibility ratings, verify compliance metrics, and approve salary/designation revisions.' 
              : 'View recommendation status, review new designation terms, and download/sign confirmation letters.'}
          </p>
        </div>
        <div style={{ fontSize: '2.5rem', opacity: 0.2 }}><i className="fa-solid fa-angles-up"></i></div>
      </div>

      {isHr ? (
        /* HR VIEW WORKSPACE */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Sub Navbar */}
          <div className="card" style={{ padding: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap', border: '1px solid var(--border-color)' }}>
            <button 
              className={`btn ${innerTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => { setInnerTab('dashboard'); setSelectedProm(null); setGeneratedLetter(''); }}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-gauge-high"></i> Dashboard
            </button>
            <button 
              className={`btn ${innerTab === 'recommend' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => { setInnerTab('recommend'); setSelectedProm(null); setGeneratedLetter(''); }}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-circle-plus"></i> Recommend Promotion
            </button>
            {selectedProm && (
              <>
                <button 
                  className={`btn ${innerTab === 'verify' ? 'btn-primary' : 'btn-secondary'}`} 
                  onClick={() => setInnerTab('verify')}
                  style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <i className="fa-solid fa-circle-check"></i> Eligibility Verification
                </button>
                <button 
                  className={`btn ${innerTab === 'approve' ? 'btn-primary' : 'btn-secondary'}`} 
                  onClick={() => setInnerTab('approve')}
                  style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <i className="fa-solid fa-signature"></i> Final Approval
                </button>
              </>
            )}
            <button 
              className={`btn ${innerTab === 'history' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => { setInnerTab('history'); setSelectedProm(null); setGeneratedLetter(''); }}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-timeline"></i> Promotion History
            </button>
            <button 
              className={`btn ${innerTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => { setInnerTab('reports'); setSelectedProm(null); setGeneratedLetter(''); }}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-print"></i> Cost Impact Reports
            </button>
          </div>

          {/* SCREEN 1: HR DASHBOARD */}
          {innerTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Metrics */}
              <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="metric-card primary">
                  <div>
                    <span className="metric-label">Confirmed Eligible</span>
                    <div className="metric-val">{summary.eligibleCount} Staff</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-users-viewfinder"></i></div>
                </div>
                <div className="metric-card warning">
                  <div>
                    <span className="metric-label">Pending Reviews</span>
                    <div className="metric-val">{summary.pending}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-hourglass-half"></i></div>
                </div>
                <div className="metric-card success">
                  <div>
                    <span className="metric-label">Approved Promotions</span>
                    <div className="metric-val">{summary.approved}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-circle-check"></i></div>
                </div>
                <div className="metric-card danger">
                  <div>
                    <span className="metric-label">Rejected Reviews</span>
                    <div className="metric-val">{summary.rejected}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-circle-xmark"></i></div>
                </div>
              </div>

              {/* Table requests */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div className="card-title" style={{ margin: 0 }}>Active Recommendation Registry</div>
                  <input 
                    type="text" 
                    placeholder="Search employee..." 
                    className="form-control" 
                    style={{ width: '220px', padding: '6px 12px', fontSize: '0.8rem' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Request ID</th>
                        <th>Employee</th>
                        <th>Current Desg</th>
                        <th>Proposed Desg</th>
                        <th>Proposed Grade</th>
                        <th>Effective Date</th>
                        <th>Status</th>
                        <th>Action Steps</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promotions
                        .filter(p => p.employeeName.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(p => {
                          const statusColors = {
                            'Pending Verification': 'badge-secondary',
                            'Pending Approval': 'badge-warning',
                            'Under Management Review': 'badge-info',
                            'Approved': 'badge-success',
                            'Rejected': 'badge-danger',
                            'Hold': 'badge-primary',
                            'Sent Back': 'badge-primary'
                          };
                          return (
                            <tr key={p._id}>
                              <td style={{ fontWeight: 'bold', color: 'hsl(var(--primary))' }}>{p.requestId}</td>
                              <td><strong>{p.employeeName}</strong></td>
                              <td>{p.currentDesignation}</td>
                              <td><strong>{p.proposedDesignation}</strong></td>
                              <td>{p.proposedGrade}</td>
                              <td>{new Date(p.effectiveDate).toLocaleDateString()}</td>
                              <td><span className={`badge ${statusColors[p.status]}`}>{p.status}</span></td>
                              <td style={{ display: 'flex', gap: '6px' }}>
                                <button 
                                  className="btn btn-secondary" 
                                  style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                                  onClick={() => {
                                    setSelectedProm(p);
                                    setVerificationForm({
                                      status: 'Pending Approval',
                                      comments: p.eligibilityChecked?.disciplinaryRecords || ''
                                    });
                                    setInnerTab('verify');
                                  }}
                                >
                                  Verify
                                </button>
                                <button 
                                  className="btn btn-secondary" 
                                  style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                                  onClick={() => {
                                    setSelectedProm(p);
                                    setApprovalForm({
                                      status: 'Approved',
                                      comments: ''
                                    });
                                    setInnerTab('approve');
                                  }}
                                >
                                  Decide
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      {promotions.length === 0 && (
                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>No active promotion recommendations logged.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: RECOMMENDATION FORM */}
          {innerTab === 'recommend' && (
            <div className="card" style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }}>
              <div className="card-title">Recommend Employee Promotion</div>
              <form onSubmit={handleRecommendSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div className="form-group">
                  <label>Select Target Employee (Must be Confirmed Permanent)</label>
                  <select 
                    className="form-control"
                    value={recommendForm.employeeId}
                    onChange={(e) => {
                      const empId = e.target.value;
                      const emp = employees.find(x => x.id === empId);
                      setRecommendForm(prev => ({ 
                        ...prev, 
                        employeeId: empId,
                        // autofill default current salary if available, or keep default
                        currentSalary: 60000,
                        proposedSalary: 78000
                      }));
                    }}
                    required
                  >
                    <option value="">Select Employee...</option>
                    {employees.filter(emp => emp.status === 'Approved' && emp.employeeCategory === 'Permanent').map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept} | Current Grade: {emp.grade || 'A1'})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Proposed New Designation</label>
                    <select 
                      className="form-control"
                      value={recommendForm.proposedDesignation}
                      onChange={(e) => setRecommendForm(prev => ({ ...prev, proposedDesignation: e.target.value }))}
                    >
                      {designations.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Proposed New Grade/Band</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. B2, C1"
                      value={recommendForm.proposedGrade}
                      onChange={(e) => setRecommendForm(prev => ({ ...prev, proposedGrade: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Proposed Department (Optional)</label>
                    <select 
                      className="form-control"
                      value={recommendForm.proposedDepartment}
                      onChange={(e) => setRecommendForm(prev => ({ ...prev, proposedDepartment: e.target.value }))}
                    >
                      <option value="">Keep current...</option>
                      {depts.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Proposed Manager (Optional)</label>
                    <select 
                      className="form-control"
                      value={recommendForm.proposedManagerId}
                      onChange={(e) => setRecommendForm(prev => ({ ...prev, proposedManagerId: e.target.value }))}
                    >
                      <option value="">Keep current...</option>
                      {employees.filter(emp => emp.status === 'Approved').map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Current Salary (INR/Month)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={recommendForm.currentSalary}
                      onChange={(e) => setRecommendForm(prev => ({ ...prev, currentSalary: parseInt(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Proposed Salary (INR/Month)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={recommendForm.proposedSalary}
                      onChange={(e) => setRecommendForm(prev => ({ ...prev, proposedSalary: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Effective Date Target <span style={{ color: 'red' }}>*</span></label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={recommendForm.effectiveDate}
                    onChange={(e) => setRecommendForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Business Justification & Key Achievements</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="Enter promotion rationale, goals met, and justifications..."
                    value={recommendForm.justification}
                    onChange={(e) => setRecommendForm(prev => ({ ...prev, justification: e.target.value }))}
                    required 
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Submit Promotion Request Recommendation
                </button>
              </form>
            </div>
          )}

          {/* SCREEN 3: ELIGIBILITY VERIFICATION SCREEN */}
          {innerTab === 'verify' && selectedProm && (
            <div className="card" style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }}>
              <div className="card-title">Eligibility Verification checklist: {selectedProm.employeeName}</div>
              
              {/* System Validations Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  <span>Active Onboarded Profile Status</span>
                  <strong style={{ color: 'var(--emerald-500)' }}><i className="fa-solid fa-circle-check"></i> Active (Active Status)</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  <span>Employment Confirmation Type</span>
                  <strong style={{ color: 'var(--emerald-500)' }}><i className="fa-solid fa-circle-check"></i> Confirmed (Permanent status)</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  <span>Performance Rating Score</span>
                  <strong style={{ color: 'var(--emerald-500)' }}><i className="fa-solid fa-circle-check"></i> A-Grade / Satisfactory</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  <span>Open Disciplinary / Warning Records</span>
                  <strong style={{ color: 'var(--emerald-500)' }}><i className="fa-solid fa-circle-check"></i> Clear (No Warnings)</strong>
                </div>
              </div>

              <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label>HR Verification Verdict</label>
                  <select 
                    className="form-control"
                    value={verificationForm.status}
                    onChange={(e) => setVerificationForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Pending Approval">Verify & Forward (Meets Eligibility)</option>
                    <option value="Rejected">Reject Request (Ineligible)</option>
                    <option value="Hold">Hold Request (Verification Pending)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>HR Remarks & Comments</label>
                  <textarea 
                    className="form-control" 
                    rows="2" 
                    placeholder="Enter compliance checks remarks..."
                    value={verificationForm.comments}
                    onChange={(e) => setVerificationForm(prev => ({ ...prev, comments: e.target.value }))}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Save Eligibility Checklist Status
                </button>
              </form>
            </div>
          )}

          {/* SCREEN 4 & 5: APPROVAL SCREEN & PROMOTION LETTER PREVIEW */}
          {innerTab === 'approve' && selectedProm && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              
              <div className="card">
                <div className="card-title">Review Decision & Approvals: {selectedProm.requestId}</div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
                  <div><strong>Employee:</strong> {selectedProm.employeeName} | <strong>Current Desg:</strong> {selectedProm.currentDesignation}</div>
                  <div><strong>Proposed Desg:</strong> {selectedProm.proposedDesignation} | <strong>New Grade:</strong> {selectedProm.proposedGrade}</div>
                  <div><strong>Proposed Salary:</strong> {selectedProm.proposedSalary} INR (Revision Difference: {selectedProm.proposedSalary - selectedProm.currentSalary} INR)</div>
                </div>

                <form onSubmit={handleApproveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>Approval Action</label>
                      <select 
                        className="form-control"
                        value={approvalForm.status}
                        onChange={(e) => setApprovalForm(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="Approved">Final Approve & Update Master</option>
                        <option value="Rejected">Reject Recommendation</option>
                        <option value="Sent Back">Send Back to Manager</option>
                        <option value="Hold">Hold</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Effective Date Target</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={new Date(selectedProm.effectiveDate).toISOString().split('T')[0]} 
                        disabled
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Remarks / Decision Rationale (Mandatory) <span style={{ color: 'red' }}>*</span></label>
                    <textarea 
                      className="form-control" 
                      rows="2" 
                      placeholder="Remarks are required to document decision..."
                      value={approvalForm.comments}
                      onChange={(e) => setApprovalForm(prev => ({ ...prev, comments: e.target.value }))}
                      required 
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Execute Verdict & Generate Promotion Details
                  </button>
                </form>
              </div>

              {/* Promotion Letter preview */}
              {generatedLetter && (
                <div className="card" style={{ background: '#090d16', border: '1px solid var(--border-color)', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '14px' }}>
                    <h4 style={{ margin: 0, fontWeight: 700, color: 'hsl(var(--primary))' }}><i className="fa-solid fa-envelope-open-text"></i> Generated Promotion letter</h4>
                    <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => window.print()}>
                      Print / Download PDF
                    </button>
                  </div>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Courier, monospace', fontSize: '0.85rem', color: '#ccc', lineHeight: 1.6 }}>
                    {generatedLetter}
                  </pre>
                </div>
              )}

              {/* Approval timeline history list */}
              <div className="card">
                <div className="card-title">Approval Trails Log</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedProm.approvalHistory?.map((a, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                      <div>
                        <strong>{a.status}</strong>
                        <span style={{ display: 'block', color: 'var(--text-secondary)' }}>Remarks: "{a.comments || 'No remarks recorded'}"</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span>Approved By: {a.actorName}</span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(a.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* SCREEN 6: PROMOTION HISTORY SCREEN */}
          {innerTab === 'history' && (
            <div className="card">
              <div className="card-title">Designation & Grade revision histories</div>
              <div className="table-responsive">
                <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Old Designation</th>
                      <th>New Designation</th>
                      <th>Old Grade</th>
                      <th>New Grade</th>
                      <th>Effective Date</th>
                      <th>Justification / Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportsData.historyList?.map((h, i) => (
                      <tr key={i}>
                        <td><strong>{h.employeeName}</strong></td>
                        <td>{h.oldDesignation}</td>
                        <td><strong>{h.newDesignation}</strong></td>
                        <td>{h.oldGrade}</td>
                        <td><strong>{h.newGrade}</strong></td>
                        <td>{new Date(h.effectiveDate).toLocaleDateString()}</td>
                        <td>{h.reason}</td>
                      </tr>
                    ))}
                    {(!reportsData.historyList || reportsData.historyList.length === 0) && (
                      <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No designation or grade changes logged.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORTS PANEL */}
          {innerTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Promotion Cost Impact Reports</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>Review financial cost additions and salary increments resulting from promotions.</p>
                </div>
                <button className="btn btn-primary" onClick={() => window.print()}>
                  <i className="fa-solid fa-print" style={{ marginRight: '6px' }}></i> Print Report Data
                </button>
              </div>

              {/* Cost Impact aggregate card */}
              <div className="metric-card info" style={{ padding: '20px' }}>
                <div>
                  <span className="metric-label">Total Promotional Cost Addition (Monthly Budget Impact)</span>
                  <div className="metric-val" style={{ color: 'hsl(var(--primary))', fontSize: '2rem', fontWeight: 850 }}>
                    {reportsData.totalCostImpact?.toLocaleString()} INR
                  </div>
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Accumulated increment salary revision difference for approved promotions.</span>
                </div>
              </div>

              {/* Departmentwise breakdown */}
              <div className="card">
                <div className="card-title">Department-wise Mapped Promotions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                  {reportsData.departmentReport?.map((dr, i) => (
                    <div key={i} style={{ fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>{dr.department}</span>
                        <strong>{dr.count} Promotions</strong>
                      </div>
                      <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, (dr.count / (promotions.filter(p=>p.status==='Approved').length || 1)) * 100)}%`, height: '100%', backgroundColor: 'hsl(var(--primary))' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      ) : (
        /* EMPLOYEE VIEW WORKSPACE */
        <div className="card">
          <div className="card-title">My Promotion Status & Progress Timeline</div>
          
          {ownProm ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PROPOSED DESIGNATION</div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0', color: 'hsl(var(--primary))' }}>
                    {ownProm.proposedDesignation}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Proposed Grade: {ownProm.proposedGrade}</span>
                </div>

                <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>WORKFLOW STATUS</div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0' }}>
                    <span className="badge badge-info">{ownProm.status}</span>
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Effective Date: {new Date(ownProm.effectiveDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Justification details */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', fontSize: '0.85rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}><i className="fa-solid fa-circle-info"></i> Justification & Performance Highlights</h4>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-color)', padding: '12px', borderRadius: '8px' }}>
                  <div><strong>Rationales:</strong> {ownProm.justification}</div>
                  <div style={{ marginTop: '6px' }}><strong>Achievements:</strong> {ownProm.keyAchievements}</div>
                </div>
              </div>

              {/* Promotion letter & Acknowledgement */}
              {ownProm.status === 'Approved' && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}><i className="fa-solid fa-file-signature"></i> Promotion Letter Signoff Acknowledgement</h4>
                  
                  <div className="card" style={{ background: '#090d16', border: '1px solid var(--border-color)', padding: '20px', marginBottom: '16px' }}>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Courier, monospace', fontSize: '0.8rem', color: '#ccc' }}>
                      {`PROMOTION & INCREMENT ADVISORY\n\nRequest ID: ${ownProm.requestId}\n\nDear ${ownProm.employeeName},\n\nWe are pleased to inform you that you have been promoted.\n• New Designation: ${ownProm.proposedDesignation}\n• New Grade/Band: ${ownProm.proposedGrade}\n• Effective Date: ${new Date(ownProm.effectiveDate).toLocaleDateString()}\n\nCongratulations!\nHR & Management`}
                    </pre>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      {ownProm.acknowledged ? (
                        <span style={{ color: 'var(--emerald-500)', fontWeight: 700, fontSize: '0.85rem' }}>
                          <i className="fa-solid fa-circle-check"></i> Acknowledged on: {new Date(ownProm.acceptanceDate).toLocaleString()}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--rose-500)', fontWeight: 700, fontSize: '0.85rem' }}>
                          <i className="fa-solid fa-triangle-exclamation"></i> Signature / Acknowledgement Pending
                        </span>
                      )}
                    </div>
                    {!ownProm.acknowledged ? (
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleAcknowledge(ownProm._id)}
                      >
                        Accept & Sign Terms
                      </button>
                    ) : (
                      <button 
                        className="btn btn-secondary"
                        onClick={() => {
                          showToast('Downloading promotion letter PDF.', 'success');
                          const element = document.createElement("a");
                          const file = new Blob([
                            `PROMOTION LETTER ADVISORY\n\nTransaction ID: ${ownProm.requestId}\n\nDear ${ownProm.employeeName},\n\nYou have been promoted to ${ownProm.proposedDesignation} (${ownProm.proposedGrade}) effective ${new Date(ownProm.effectiveDate).toLocaleDateString()}.\n\nAccepted and Signed electronically on: ${new Date(ownProm.acceptanceDate).toLocaleString()}\nTalent Sphere Enterprise.`
                          ], {type: 'text/plain'});
                          element.href = URL.createObjectURL(file);
                          element.download = "PromotionLetter_" + ownProm.requestId + ".txt";
                          document.body.appendChild(element);
                          element.click();
                          document.body.removeChild(element);
                        }}
                      >
                        Download PDF Letter
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: '2.5rem', color: 'var(--emerald-500)', opacity: 0.8, marginBottom: '12px' }}></i>
              <h4 style={{ fontWeight: 700, color: 'hsl(var(--text-primary))' }}>Dashboard Clear</h4>
              <p style={{ fontSize: '0.85rem' }}>No active promotion request is currently mapped to your record.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default PromotionManagement;
