import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { useToast } from './Toast';

const SalaryRevisionManagement = () => {
  const { user } = useContext(AuthContext);
  const { employees } = useContext(DataContext);
  const { showToast } = useToast();

  const [revisions, setRevisions] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, totalCostImpact: 0 });
  const [loading, setLoading] = useState(false);
  const [innerTab, setInnerTab] = useState('dashboard'); // 'dashboard', 'recommend', 'approve', 'history', 'reports'
  
  const [selectedRev, setSelectedRev] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [reportsData, setReportsData] = useState({ approvedList: [], historyList: [] });

  // Recommend Form
  const [recommendForm, setRecommendForm] = useState({
    employeeId: '',
    revisionType: 'Annual Increment',
    effectiveDate: new Date().toISOString().split('T')[0],
    reason: '',
    attachmentUrl: '',
    currentCtc: 50000,
    currentGross: 45000,
    currentBasic: 25000,
    currentAllowances: 20000,
    revisedCtc: 65000,
    revisedGross: 58500,
    revisedBasic: 32500,
    revisedAllowances: 26000
  });

  const [approvalForm, setApprovalForm] = useState({
    decision: 'Approved',
    comments: ''
  });

  const [generatedLetter, setGeneratedLetter] = useState('');

  const isHr = user?.role === 'hr';

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/salary-revisions');
      setRevisions(res.data.data);
      setSummary(res.data.summary);

      const repRes = await api.get('/salary-revisions/reports');
      setReportsData(repRes.data);
    } catch (err) {
      console.error('Error fetching salary revisions:', err);
      showToast('Error loading compensation tracker.', 'error');
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
      await api.post('/salary-revisions', recommendForm);
      showToast('Compensation revision workflow recommendation created.', 'success');
      setInnerTab('dashboard');
      fetchData();
      setRecommendForm({
        employeeId: '',
        revisionType: 'Annual Increment',
        effectiveDate: new Date().toISOString().split('T')[0],
        reason: '',
        attachmentUrl: '',
        currentCtc: 50000,
        currentGross: 45000,
        currentBasic: 25000,
        currentAllowances: 20000,
        revisedCtc: 65000,
        revisedGross: 58500,
        revisedBasic: 32500,
        revisedAllowances: 26000
      });
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating recommendation request.', 'error');
    }
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRev) return;

    if (!approvalForm.comments.trim()) {
      showToast('Decision comments are mandatory.', 'warning');
      return;
    }

    try {
      const res = await api.put(`/salary-revisions/${selectedRev._id}/action`, approvalForm);
      showToast(`Request processed successfully: ${approvalForm.decision}`, 'success');
      if (approvalForm.decision === 'Approved') {
        setGeneratedLetter('SALARY REVISION ADVISORY\n\nRequest ID: ' + selectedRev.requestId + '\n\nDear ' + selectedRev.employeeName + ',\n\nWe are pleased to inform you that your compensation structure has been officially revised. Details:\n\n• Revision Type: ' + selectedRev.revisionType + '\n• New Revised CTC: ' + selectedRev.revisedCtc + ' INR\n• Increment Amount: ' + selectedRev.incrementAmount + ' INR (' + selectedRev.incrementPercentage + '% Increase)\n• Effective Date: ' + new Date(selectedRev.effectiveDate).toLocaleDateString() + '\n\nSincerely,\nHR & Finance Management');
      }
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error processing approval decision.', 'error');
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await api.put(`/salary-revisions/${id}/acknowledge`);
      showToast('Salary revision letter terms acknowledged.', 'success');
      fetchData();
    } catch (err) {
      showToast('Error signing acknowledgement.', 'error');
    }
  };

  const ownRev = !isHr ? revisions.find(r => r.employeeId === user.id) : null;
  const ownHistory = reportsData.historyList?.filter(h => h.employeeId === user.id) || [];

  return (
    <div className="portal-container" style={{ padding: '0 0 24px 0' }}>
      
      {/* Banner */}
      <div className="welcome-card-banner" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #1e1b4b 100%)', color: '#fff', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>Salary Revision Hub</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {isHr 
              ? 'Evaluate annual compensation reviews, audit revisions, and link updates directly with payroll modules.' 
              : 'View your revised CTC breakdown, download revision letters, and sign confirmation acknowledgements.'}
          </p>
        </div>
        <div style={{ fontSize: '2.5rem', opacity: 0.2 }}><i className="fa-solid fa-money-bill-trend-up"></i></div>
      </div>

      {isHr ? (
        /* HR VIEW WORKSPACE */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Sub Navbar */}
          <div className="card" style={{ padding: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap', border: '1px solid var(--border-color)' }}>
            <button 
              className={`btn ${innerTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => { setInnerTab('dashboard'); setSelectedRev(null); setGeneratedLetter(''); }}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-gauge-high"></i> Dashboard
            </button>
            <button 
              className={`btn ${innerTab === 'recommend' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => { setInnerTab('recommend'); setSelectedRev(null); setGeneratedLetter(''); }}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-circle-plus"></i> Recommend Revision
            </button>
            {selectedRev && (
              <button 
                className={`btn ${innerTab === 'approve' ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => setInnerTab('approve')}
                style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <i className="fa-solid fa-signature"></i> Final Verdict
              </button>
            )}
            <button 
              className={`btn ${innerTab === 'history' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => { setInnerTab('history'); setSelectedRev(null); setGeneratedLetter(''); }}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-timeline"></i> Revision Logs
            </button>
          </div>

          {/* SCREEN 1: HR DASHBOARD */}
          {innerTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Metrics */}
              <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="metric-card primary">
                  <div>
                    <span className="metric-label">Active Revisions</span>
                    <div className="metric-val">{summary.pending} Request(s)</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-hourglass-half"></i></div>
                </div>
                <div className="metric-card success">
                  <div>
                    <span className="metric-label">Total Approved CTC Changes</span>
                    <div className="metric-val">{summary.approved} Case(s)</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-circle-check"></i></div>
                </div>
                <div className="metric-card info">
                  <div>
                    <span className="metric-label">Cumulative Monthly Cost Impact</span>
                    <div className="metric-val">{summary.totalCostImpact?.toLocaleString()} INR</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-wallet"></i></div>
                </div>
              </div>

              {/* Table requests */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div className="card-title" style={{ margin: 0 }}>Salary Revision Request Register</div>
                  <input 
                    type="text" 
                    placeholder="Search name..." 
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
                        <th>Revision Type</th>
                        <th>Current CTC</th>
                        <th>Revised CTC</th>
                        <th>Increment Amount</th>
                        <th>Increment %</th>
                        <th>Effective Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revisions
                        .filter(r => r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(r => {
                          const statusColors = {
                            'Pending Verification': 'badge-secondary',
                            'Pending Approval': 'badge-warning',
                            'Approved': 'badge-success',
                            'Rejected': 'badge-danger',
                            'Hold': 'badge-primary',
                            'Sent Back': 'badge-primary'
                          };
                          return (
                            <tr key={r._id}>
                              <td style={{ fontWeight: 'bold', color: 'hsl(var(--primary))' }}>{r.requestId}</td>
                              <td><strong>{r.employeeName}</strong></td>
                              <td><span className="badge badge-info">{r.revisionType}</span></td>
                              <td>{r.currentCtc?.toLocaleString()}</td>
                              <td><strong>{r.revisedCtc?.toLocaleString()}</strong></td>
                              <td>+{r.incrementAmount?.toLocaleString()}</td>
                              <td><strong style={{ color: 'var(--emerald-500)' }}>+{r.incrementPercentage}%</strong></td>
                              <td>{new Date(r.effectiveDate).toLocaleDateString()}</td>
                              <td><span className={`badge ${statusColors[r.status]}`}>{r.status}</span></td>
                              <td>
                                <button 
                                  className="btn btn-secondary" 
                                  style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                                  onClick={() => {
                                    setSelectedRev(r);
                                    setApprovalForm({
                                      decision: 'Approved',
                                      comments: ''
                                    });
                                    setInnerTab('approve');
                                  }}
                                >
                                  Process
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      {revisions.length === 0 && (
                        <tr><td colSpan="10" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>No compensation revisions active.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: SALARY REVISION RECOMMENDATION FORM */}
          {innerTab === 'recommend' && (
            <div className="card" style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }}>
              <div className="card-title">Create Salary Revision Request</div>
              <form onSubmit={handleRecommendSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div className="form-group">
                  <label>Select Target Employee</label>
                  <select 
                    className="form-control"
                    value={recommendForm.employeeId}
                    onChange={(e) => {
                      const empId = e.target.value;
                      setRecommendForm(prev => ({ 
                        ...prev, 
                        employeeId: empId,
                        // benchmark fallback values
                        currentCtc: 50000,
                        revisedCtc: 62000
                      }));
                    }}
                    required
                  >
                    <option value="">Select Employee...</option>
                    {employees.filter(emp => emp.status === 'Approved').map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept} | ID: {emp.id})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Revision Type Category</label>
                    <select 
                      className="form-control"
                      value={recommendForm.revisionType}
                      onChange={(e) => setRecommendForm(prev => ({ ...prev, revisionType: e.target.value }))}
                    >
                      <option value="Annual Increment">Annual Increment</option>
                      <option value="Promotion">Promotion</option>
                      <option value="Confirmation">Confirmation</option>
                      <option value="Transfer">Transfer</option>
                      <option value="Market Correction">Market Correction</option>
                      <option value="Special Adjustment">Special Adjustment</option>
                      <option value="Retention Increase">Retention Increase</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Effective Date Target</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={recommendForm.effectiveDate}
                      onChange={(e) => setRecommendForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Salary breakdown values */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                  <div>
                    <h5 style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: '10px' }}>Current Component Details</h5>
                    <div className="form-group" style={{ marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.75rem' }}>Current Monthly CTC</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={recommendForm.currentCtc}
                        onChange={(e) => setRecommendForm(prev => ({ ...prev, currentCtc: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.75rem' }}>Current Basic Salary</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={recommendForm.currentBasic}
                        onChange={(e) => setRecommendForm(prev => ({ ...prev, currentBasic: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div>
                    <h5 style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: '10px' }}>Proposed Component Details</h5>
                    <div className="form-group" style={{ marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.75rem' }}>Revised Monthly CTC</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={recommendForm.revisedCtc}
                        onChange={(e) => setRecommendForm(prev => ({ ...prev, revisedCtc: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.75rem' }}>Revised Basic Salary</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={recommendForm.revisedBasic}
                        onChange={(e) => setRecommendForm(prev => ({ ...prev, revisedBasic: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Auto Calculated Display */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '6px', border: '1px dashed var(--border-color)', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Auto-Calculated Increment: <strong>{recommendForm.revisedCtc - recommendForm.currentCtc} INR</strong></span>
                  <span>Percentage Increase: <strong style={{ color: 'var(--emerald-500)' }}>+{Math.round(((recommendForm.revisedCtc - recommendForm.currentCtc) / (recommendForm.currentCtc || 1)) * 100)}%</strong></span>
                </div>

                <div className="form-group">
                  <label>Revision Reason / Justification</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="Provide justification reason details..."
                    value={recommendForm.reason}
                    onChange={(e) => setRecommendForm(prev => ({ ...prev, reason: e.target.value }))}
                    required 
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Initiate Salary Revision Request
                </button>
              </form>
            </div>
          )}

          {/* SCREEN 3: VERIFICATION & APPROVAL SCREEN */}
          {innerTab === 'approve' && selectedRev && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              
              <div className="card">
                <div className="card-title">Process Salary Revision Approval: {selectedRev.requestId}</div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
                  <div><strong>Employee:</strong> {selectedRev.employeeName} | <strong>Current Designation:</strong> {selectedRev.currentDesignation}</div>
                  <div><strong>Current CTC:</strong> {selectedRev.currentCtc?.toLocaleString()} INR | <strong>Proposed CTC:</strong> {selectedRev.revisedCtc?.toLocaleString()} INR</div>
                  <div><strong>Increment amount:</strong> +{selectedRev.incrementAmount?.toLocaleString()} INR (<strong>+{selectedRev.incrementPercentage}%</strong> Increase)</div>
                  <div><strong>Justification:</strong> {selectedRev.reason}</div>
                </div>

                <form onSubmit={handleApproveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label>Approval Decision Verdict</label>
                    <select 
                      className="form-control"
                      value={approvalForm.decision}
                      onChange={(e) => setApprovalForm(prev => ({ ...prev, decision: e.target.value }))}
                    >
                      <option value="Approved">Approve & Generate Letter</option>
                      <option value="Rejected">Reject Revision</option>
                      <option value="Hold">Hold</option>
                      <option value="Sent Back">Send Back</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Decision Remarks (Mandatory) <span style={{ color: 'red' }}>*</span></label>
                    <textarea 
                      className="form-control" 
                      rows="2" 
                      placeholder="Remarks are required to process change..."
                      value={approvalForm.comments}
                      onChange={(e) => setApprovalForm(prev => ({ ...prev, comments: e.target.value }))}
                      required 
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Confirm Revision Decision
                  </button>
                </form>
              </div>

              {/* Letters Preview */}
              {generatedLetter && (
                <div className="card" style={{ background: '#090d16', border: '1px solid var(--border-color)', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '14px' }}>
                    <h4 style={{ margin: 0, fontWeight: 700, color: 'hsl(var(--primary))' }}><i className="fa-solid fa-envelope-open-text"></i> Official Revision Document</h4>
                    <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => window.print()}>
                      Print / Download PDF
                    </button>
                  </div>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Courier, monospace', fontSize: '0.85rem', color: '#ccc', lineHeight: 1.6 }}>
                    {generatedLetter}
                  </pre>
                </div>
              )}

            </div>
          )}

          {/* SCREEN 5: SALARY REVISION HISTORY TABLE */}
          {innerTab === 'history' && (
            <div className="card">
              <div className="card-title">Salary revision transaction logs history</div>
              <div className="table-responsive">
                <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Previous CTC</th>
                      <th>Revised CTC</th>
                      <th>Difference Amount</th>
                      <th>Difference %</th>
                      <th>Effective Date</th>
                      <th>Approved By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportsData.historyList?.map((h, i) => {
                      const diff = h.newSalary - h.oldSalary;
                      const pct = Math.round((diff / (h.oldSalary || 1)) * 100) || 0;
                      return (
                        <tr key={i}>
                          <td><strong>{h.employeeName}</strong></td>
                          <td>{h.oldSalary?.toLocaleString()}</td>
                          <td><strong>{h.newSalary?.toLocaleString()}</strong></td>
                          <td>+{diff?.toLocaleString()}</td>
                          <td><strong style={{ color: 'var(--emerald-500)' }}>+{pct}%</strong></td>
                          <td>{new Date(h.effectiveDate).toLocaleDateString()}</td>
                          <td>{h.approvedBy}</td>
                        </tr>
                      );
                    })}
                    {(!reportsData.historyList || reportsData.historyList.length === 0) && (
                      <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No compensation revisions logged.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* EMPLOYEE VIEW WORKSPACE (ESS) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card">
            <div className="card-title">My compensation structure (Monthly CTC breakdown)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '10px' }}>
              <div style={{ border: '1px solid var(--border-color)', padding: '14px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MONTHLY BASIC SALARY</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0' }}>25,000 INR</h4>
              </div>
              <div style={{ border: '1px solid var(--border-color)', padding: '14px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MONTHLY ALLOWANCES</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0' }}>20,000 INR</h4>
              </div>
              <div style={{ border: '1px solid var(--border-color)', padding: '14px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TOTAL MONTHLY CTC</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'hsl(var(--primary))', margin: '4px 0' }}>45,000 INR</h4>
              </div>
            </div>
          </div>

          {/* Revision history checklist */}
          <div className="card">
            <div className="card-title">My Salary Revision History logs</div>
            <div className="table-responsive">
              <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Revision Type</th>
                    <th>Previous CTC</th>
                    <th>Revised CTC</th>
                    <th>Increment Value</th>
                    <th>Effective Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ownHistory.map((h, i) => {
                    const diff = h.newSalary - h.oldSalary;
                    return (
                      <tr key={i}>
                        <td><strong>{h.reason}</strong></td>
                        <td>{h.oldSalary?.toLocaleString()}</td>
                        <td><strong>{h.newSalary?.toLocaleString()}</strong></td>
                        <td>+{diff?.toLocaleString()}</td>
                        <td>{new Date(h.effectiveDate).toLocaleDateString()}</td>
                        <td><span className="badge badge-success">Approved</span></td>
                      </tr>
                    );
                  })}
                  {ownRev && (
                    <tr>
                      <td><strong>{ownRev.revisionType}</strong></td>
                      <td>{ownRev.currentCtc?.toLocaleString()}</td>
                      <td><strong>{ownRev.revisedCtc?.toLocaleString()}</strong></td>
                      <td>+{ownRev.incrementAmount?.toLocaleString()}</td>
                      <td>{new Date(ownRev.effectiveDate).toLocaleDateString()}</td>
                      <td><span className="badge badge-info">{ownRev.status}</span></td>
                    </tr>
                  )}
                  {ownHistory.length === 0 && !ownRev && (
                    <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No compensation changes on your record.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revision letter signoff */}
          {ownRev?.status === 'Approved' && (
            <div className="card">
              <div className="card-title"><i className="fa-solid fa-file-signature"></i> Salary Revision letter Signoff</div>
              <div className="card" style={{ background: '#090d16', border: '1px solid var(--border-color)', padding: '20px', marginBottom: '16px' }}>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Courier, monospace', fontSize: '0.8rem', color: '#ccc' }}>
                  {`SALARY REVISION ADVISORY\n\nRequest ID: ${ownRev.requestId}\n\nDear ${ownRev.employeeName},\n\nWe are pleased to inform you that your compensation structure has been officially revised.\n• New CTC: ${ownRev.revisedCtc} INR\n• Increment: ${ownRev.incrementAmount} INR (${ownRev.incrementPercentage}%)\n• Effective Date: ${new Date(ownRev.effectiveDate).toLocaleDateString()}\n\nAccepted and Signed electronically on: ${ownRev.acknowledged ? new Date(ownRev.acceptanceDate).toLocaleString() : 'PENDING SIGNATURE'}`}
                </pre>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  {ownRev.acknowledged ? (
                    <span style={{ color: 'var(--emerald-500)', fontWeight: 700, fontSize: '0.85rem' }}>
                      <i className="fa-solid fa-circle-check"></i> Terms accepted on: {new Date(ownRev.acceptanceDate).toLocaleString()}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--rose-500)', fontWeight: 700, fontSize: '0.85rem' }}>
                      <i className="fa-solid fa-triangle-exclamation"></i> Signature / Acceptance Pending
                    </span>
                  )}
                </div>
                {!ownRev.acknowledged ? (
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleAcknowledge(ownRev._id)}
                  >
                    Accept & Sign Terms
                  </button>
                ) : (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      showToast('Downloading revision letter.', 'success');
                      const element = document.createElement("a");
                      const file = new Blob([
                        `SALARY REVISION LETTER\n\nTransaction ID: ${ownRev.requestId}\n\nDear ${ownRev.employeeName},\n\nYour compensation has been revised to ${ownRev.revisedCtc} INR effective ${new Date(ownRev.effectiveDate).toLocaleDateString()}.\n\nAccepted and Signed electronically: ${new Date(ownRev.acceptanceDate).toLocaleString()}`
                      ], {type: 'text/plain'});
                      element.href = URL.createObjectURL(file);
                      element.download = "SalaryRevisionLetter_" + ownRev.requestId + ".txt";
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                  >
                    Download Letter
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default SalaryRevisionManagement;
