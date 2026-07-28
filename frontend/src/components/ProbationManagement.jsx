import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { useToast } from './Toast';

const ProbationManagement = () => {
  const { user } = useContext(AuthContext);
  const { employees } = useContext(DataContext);
  const { showToast } = useToast();

  const [probationData, setProbationData] = useState([]);
  const [summary, setSummary] = useState({ total: 0, underProbation: 0, reviewPending: 0, confirmed: 0, extended: 0, separated: 0, overdueReviews: 0 });
  const [loading, setLoading] = useState(false);
  const [innerTab, setInnerTab] = useState('dashboard'); // 'dashboard', 'assign', 'review', 'decision', 'reports'
  
  const [selectedProb, setSelectedProb] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Assign Form
  const [assignForm, setAssignForm] = useState({
    employeeId: '',
    employeeCategory: 'Probationer',
    probationDuration: 90,
    reportingManagerId: '',
    kpis: [{ title: 'Deliverables Alignment', target: 'Deliver all sprint tasks on schedule.', weight: 50 }]
  });

  // Review Form
  const [reviewForm, setReviewForm] = useState({
    goalAchievement: '',
    attendanceReview: 'Satisfactory',
    behaviorReview: 'Excellent',
    managerComments: '',
    recommendation: 'Confirm'
  });

  // Decision Form
  const [decisionForm, setDecisionForm] = useState({
    action: 'Confirm',
    remarks: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    extensionDays: 30
  });

  const [generatedLetter, setGeneratedLetter] = useState('');
  const [reportsData, setReportsData] = useState({
    underProbationList: [],
    upcomingConfirmationList: [],
    overdueList: [],
    extendedList: [],
    deptReport: []
  });

  const isHr = user?.role === 'hr';

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/probation');
      setProbationData(res.data.data);
      setSummary(res.data.summary);

      const repRes = await api.get('/probation/reports');
      setReportsData(repRes.data);
    } catch (err) {
      console.error('Error fetching probation data:', err);
      showToast('Error loading probation tracker.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddKpi = () => {
    setAssignForm(prev => ({
      ...prev,
      kpis: [...prev.kpis, { title: '', target: '', weight: 0 }]
    }));
  };

  const handleKpiChange = (index, field, val) => {
    setAssignForm(prev => {
      const copy = [...prev.kpis];
      copy[index][field] = field === 'weight' ? parseInt(val) || 0 : val;
      return { ...prev, kpis: copy };
    });
  };

  const handleRemoveKpi = (index) => {
    setAssignForm(prev => ({
      ...prev,
      kpis: prev.kpis.filter((_, i) => i !== index)
    }));
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/probation/assign', assignForm);
      showToast('Probation assigned successfully.', 'success');
      setInnerTab('dashboard');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error assigning probation.', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProb) return;
    try {
      await api.put(`/probation/${selectedProb._id}/review`, reviewForm);
      showToast('Evaluation review submitted.', 'success');
      setInnerTab('dashboard');
      setSelectedProb(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error submitting review.', 'error');
    }
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProb) return;
    try {
      const res = await api.put(`/probation/${selectedProb._id}/decision`, decisionForm);
      showToast(`Final decision processed: ${decisionForm.action}`, 'success');
      setGeneratedLetter(res.data.letter);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error processing decision.', 'error');
    }
  };

  // Find standard employee's own probation record
  const ownRecord = !isHr ? probationData.find(p => p.employeeId === user.id) : null;

  return (
    <div className="portal-container" style={{ padding: '0 0 24px 0' }}>
      
      {/* Banner */}
      <div className="welcome-card-banner" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #1e1b4b 100%)', color: '#fff', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>Probation & Confirmation Hub</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {isHr 
              ? 'Monitor probation timelines, complete evaluations, and process final employment confirmations.' 
              : 'View your probation roadmap, target goals, evaluation status, and confirmation progress.'}
          </p>
        </div>
        <div style={{ fontSize: '2.5rem', opacity: 0.2 }}><i className="fa-solid fa-user-clock"></i></div>
      </div>

      {isHr ? (
        /* HR VIEW WORKSPACE */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Sub navbar */}
          <div className="card" style={{ padding: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap', border: '1px solid var(--border-color)' }}>
            <button 
              className={`btn ${innerTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => { setInnerTab('dashboard'); setSelectedProb(null); setGeneratedLetter(''); }}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-gauge-high"></i> Probation Dashboard
            </button>
            <button 
              className={`btn ${innerTab === 'assign' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => { setInnerTab('assign'); setSelectedProb(null); setGeneratedLetter(''); }}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-circle-plus"></i> Assign Probation
            </button>
            {selectedProb && (
              <>
                <button 
                  className={`btn ${innerTab === 'review' ? 'btn-primary' : 'btn-secondary'}`} 
                  onClick={() => setInnerTab('review')}
                  style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <i className="fa-solid fa-clipboard-check"></i> Evaluate Review
                </button>
                <button 
                  className={`btn ${innerTab === 'decision' ? 'btn-primary' : 'btn-secondary'}`} 
                  onClick={() => setInnerTab('decision')}
                  style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <i className="fa-solid fa-stamp"></i> Confirmation Decision
                </button>
              </>
            )}
            <button 
              className={`btn ${innerTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => { setInnerTab('reports'); setSelectedProb(null); setGeneratedLetter(''); }}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-print"></i> Reports & Reminders
            </button>
          </div>

          {/* SCREEN 1: PROBATION DASHBOARD */}
          {innerTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Metric grid */}
              <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                <div className="metric-card primary">
                  <div>
                    <span className="metric-label">Under Probation</span>
                    <div className="metric-val">{summary.underProbation}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-business-time"></i></div>
                </div>
                <div className="metric-card warning">
                  <div>
                    <span className="metric-label">Review Pending</span>
                    <div className="metric-val">{summary.reviewPending}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-hourglass-half"></i></div>
                </div>
                <div className="metric-card success">
                  <div>
                    <span className="metric-label">Confirmed Staff</span>
                    <div className="metric-val">{summary.confirmed}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-user-check"></i></div>
                </div>
                <div className="metric-card danger">
                  <div>
                    <span className="metric-label">Reviews Overdue</span>
                    <div className="metric-val">{summary.overdueReviews}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-clock"></i></div>
                </div>
              </div>

              {/* Table list */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div className="card-title" style={{ margin: 0 }}>Active Trainees & Probationers</div>
                  <input 
                    type="text" 
                    placeholder="Search name or ID..." 
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
                        <th>Employee ID</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Designation</th>
                        <th>Joining Date</th>
                        <th>Probation End</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {probationData
                        .filter(p => p.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || p.employeeCode.includes(searchQuery))
                        .map(p => {
                          const statusColors = {
                            'Under Probation': 'badge-info',
                            'Review Pending': 'badge-warning',
                            'Confirmed': 'badge-success',
                            'Extended': 'badge-primary',
                            'Separated': 'badge-danger'
                          };
                          return (
                            <tr key={p._id}>
                              <td style={{ fontWeight: 'bold' }}>{p.employeeCode}</td>
                              <td><strong>{p.employeeName}</strong></td>
                              <td>{p.department}</td>
                              <td>{p.designation}</td>
                              <td>{new Date(p.joiningDate).toLocaleDateString()}</td>
                              <td>{new Date(p.probationEndDate).toLocaleDateString()}</td>
                              <td><span className={`badge ${statusColors[p.status] || 'badge-secondary'}`}>{p.status}</span></td>
                              <td style={{ display: 'flex', gap: '6px' }}>
                                <button 
                                  className="btn btn-secondary" 
                                  style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                                  onClick={() => {
                                    setSelectedProb(p);
                                    setReviewForm({
                                      goalAchievement: p.review?.goalAchievement || '',
                                      attendanceReview: p.review?.attendanceReview || 'Satisfactory',
                                      behaviorReview: p.review?.behaviorReview || 'Excellent',
                                      managerComments: p.review?.managerComments || '',
                                      recommendation: p.review?.recommendation || 'Confirm'
                                    });
                                    setInnerTab('review');
                                  }}
                                >
                                  Evaluate
                                </button>
                                <button 
                                  className="btn btn-secondary" 
                                  style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                                  onClick={() => {
                                    setSelectedProb(p);
                                    setDecisionForm({
                                      action: p.decision?.action || 'Confirm',
                                      remarks: p.decision?.remarks || '',
                                      effectiveDate: p.decision?.effectiveDate ? new Date(p.decision.effectiveDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                                      extensionDays: p.decision?.extensionDays || 30
                                    });
                                    setInnerTab('decision');
                                  }}
                                >
                                  Finalize
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      {probationData.length === 0 && (
                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>No probation mappings found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: PROBATION ASSIGNMENT */}
          {innerTab === 'assign' && (
            <div className="card" style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }}>
              <div className="card-title">Assign Probation Framework</div>
              <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div className="form-group">
                  <label>Select Employee</label>
                  <select 
                    className="form-control"
                    value={assignForm.employeeId}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, employeeId: e.target.value }))}
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
                    <label>Employee Category</label>
                    <select 
                      className="form-control"
                      value={assignForm.employeeCategory}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, employeeCategory: e.target.value }))}
                    >
                      <option value="Probationer">Probationer</option>
                      <option value="Trainee">Trainee</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Probation Duration (Days)</label>
                    <select 
                      className="form-control"
                      value={assignForm.probationDuration}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, probationDuration: parseInt(e.target.value) || 90 }))}
                    >
                      <option value="30">30 Days</option>
                      <option value="60">60 Days</option>
                      <option value="90">90 Days</option>
                      <option value="180">180 Days</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Reporting Manager / Reviewer</label>
                  <select 
                    className="form-control"
                    value={assignForm.reportingManagerId}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, reportingManagerId: e.target.value }))}
                    required
                  >
                    <option value="">Select manager...</option>
                    {employees.filter(emp => emp.status === 'Approved').map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept})</option>
                    ))}
                  </select>
                </div>

                {/* KPI Assignment Section */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h5 style={{ fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>KPI Goals & Metrics Target</h5>
                    <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={handleAddKpi}>
                      + Add KPI
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {assignForm.kpis.map((kpi, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <input 
                          type="text" 
                          placeholder="Goal/KPI Title" 
                          className="form-control" 
                          value={kpi.title}
                          onChange={(e) => handleKpiChange(idx, 'title', e.target.value)}
                          style={{ flex: 1, fontSize: '0.8rem' }}
                          required
                        />
                        <input 
                          type="text" 
                          placeholder="Target Target Metrics" 
                          className="form-control" 
                          value={kpi.target}
                          onChange={(e) => handleKpiChange(idx, 'target', e.target.value)}
                          style={{ flex: 2, fontSize: '0.8rem' }}
                          required
                        />
                        <button type="button" className="btn btn-secondary" style={{ padding: '8px 12px', color: 'var(--rose-500)' }} onClick={() => handleRemoveKpi(idx)}>
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                  Publish Assignment & Calculations
                </button>
              </form>
            </div>
          )}

          {/* SCREEN 3: PROBATION REVIEW FORM */}
          {innerTab === 'review' && selectedProb && (
            <div className="card" style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }}>
              <div className="card-title">Conduct Probation Review: {selectedProb.employeeName}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                Verify performance goals and behaviors to recommend confirmation or extensions.
              </p>

              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label>Goal & KPI Achievement Summary</label>
                  <textarea 
                    className="form-control" 
                    rows="2" 
                    placeholder="Summarize target achievements during probation period..."
                    value={reviewForm.goalAchievement}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, goalAchievement: e.target.value }))}
                    required 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Attendance & Punch Review</label>
                    <select 
                      className="form-control"
                      value={reviewForm.attendanceReview}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, attendanceReview: e.target.value }))}
                    >
                      <option value="Excellent">Excellent (95%+ Presence)</option>
                      <option value="Satisfactory">Satisfactory (85%-95% Presence)</option>
                      <option value="Unsatisfactory">Needs Improvement (&lt;85% Presence)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Behavior & Team Collaboration</label>
                    <select 
                      className="form-control"
                      value={reviewForm.behaviorReview}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, behaviorReview: e.target.value }))}
                    >
                      <option value="Excellent">Excellent / Role Model</option>
                      <option value="Good">Good Collaboration</option>
                      <option value="Average">Average / Standard</option>
                      <option value="Unsatisfactory">Unsatisfactory Remarks</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Manager Evaluation Remarks</label>
                  <textarea 
                    className="form-control" 
                    rows="2" 
                    placeholder="Detailed comments from the evaluator..."
                    value={reviewForm.managerComments}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, managerComments: e.target.value }))}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Evaluator Recommendation</label>
                  <select 
                    className="form-control"
                    value={reviewForm.recommendation}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, recommendation: e.target.value }))}
                  >
                    <option value="Confirm">Confirm Employment (Promote to Permanent)</option>
                    <option value="Extend Probation">Extend Probation Period</option>
                    <option value="Transfer">Transfer to another Team/Department</option>
                    <option value="Separation">Separation / Terminate Contract</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary">
                  Submit Manager Review Evaluation
                </button>
              </form>
            </div>
          )}

          {/* SCREEN 4 & 5: CONFIRMATION DECISION & TRACKER */}
          {innerTab === 'decision' && selectedProb && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
              
              <div className="card">
                <div className="card-title">Final Confirmation Decision: {selectedProb.employeeName}</div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
                  <div><strong>KPI Target:</strong> {selectedProb.kpis?.map((k, i) => <div key={i}>• {k.title}: {k.target}</div>)}</div>
                  <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                    <strong>Manager Recommendation:</strong> <span className="badge badge-info">{selectedProb.review?.recommendation || 'No review completed'}</span>
                  </div>
                  {selectedProb.review?.managerComments && (
                    <div style={{ fontStyle: 'italic', opacity: 0.8, marginTop: '4px' }}>"{selectedProb.review.managerComments}"</div>
                  )}
                </div>

                <form onSubmit={handleDecisionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>Confirmation Action</label>
                      <select 
                        className="form-control"
                        value={decisionForm.action}
                        onChange={(e) => setDecisionForm(prev => ({ ...prev, action: e.target.value }))}
                      >
                        <option value="Confirm">Confirm Employee</option>
                        <option value="Extend Probation">Extend Probation</option>
                        <option value="Transfer">Transfer Employee</option>
                        <option value="Separation">Exit/Separation</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Effective Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={decisionForm.effectiveDate}
                        onChange={(e) => setDecisionForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  {decisionForm.action === 'Extend Probation' && (
                    <div className="form-group">
                      <label>Extension Period Duration (Days)</label>
                      <select 
                        className="form-control"
                        value={decisionForm.extensionDays}
                        onChange={(e) => setDecisionForm(prev => ({ ...prev, extensionDays: parseInt(e.target.value) || 30 }))}
                      >
                        <option value="30">30 Days Extension</option>
                        <option value="60">60 Days Extension</option>
                        <option value="90">90 Days Extension</option>
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Decision Remarks / Rationale</label>
                    <textarea 
                      className="form-control" 
                      rows="2" 
                      placeholder="Remarks to log in history..."
                      value={decisionForm.remarks}
                      onChange={(e) => setDecisionForm(prev => ({ ...prev, remarks: e.target.value }))}
                      required 
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Process & Generate Official Letter
                  </button>
                </form>
              </div>

              {/* Generated Confirmation/Extension Letter */}
              {generatedLetter && (
                <div className="card" style={{ background: '#090d16', border: '1px solid var(--border-color)', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '14px' }}>
                    <h4 style={{ margin: 0, fontWeight: 700, color: 'hsl(var(--primary))' }}><i className="fa-solid fa-envelope-open-text"></i> Official Generated Document Letter</h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => window.print()}>
                        Print / Download PDF
                      </button>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '4px 12px', fontSize: '0.75rem' }} 
                        onClick={async () => {
                          try {
                            await api.post(`/probation/${selectedProb._id}/email-letter`);
                            showToast('Confirmation Letter successfully emailed to employee.', 'success');
                          } catch (err) {
                            showToast('Error sending confirmation email.', 'error');
                          }
                        }}
                      >
                        Email Employee
                      </button>
                    </div>
                  </div>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Courier, monospace', fontSize: '0.85rem', color: '#ccc', lineHeight: 1.6 }}>
                    {generatedLetter}
                  </pre>
                </div>
              )}

              {/* Approval History / Timeline Tracker */}
              <div className="card">
                <div className="card-title">Timeline History & Approval Logs</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedProb.lifecycleHistory?.map((h, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', borderLeft: '2px solid hsl(var(--primary))', paddingLeft: '16px', position: 'relative' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'hsl(var(--primary))', position: 'absolute', left: '-5px', top: '4px' }}></div>
                      <div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.85rem' }}>{h.status}</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{new Date(h.timestamp).toLocaleString()}</span>
                        </div>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{h.notes} (By: {h.updatedBy})</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* REPORTS PANEL */}
          {innerTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Probation Operational Reports</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>Review regulatory confirmations list and upcoming review due sheets.</p>
                </div>
                <button className="btn btn-primary" onClick={() => window.print()}>
                  <i className="fa-solid fa-print" style={{ marginRight: '6px' }}></i> Print Report Data
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Upcoming Confirmations */}
                <div className="card">
                  <div className="card-title">Upcoming Confirmations (Next 30 Days)</div>
                  <div className="table-responsive">
                    <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                      <thead>
                        <tr>
                          <th>Emp Code</th>
                          <th>Name</th>
                          <th>End Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportsData.upcomingConfirmationList?.map(r => (
                          <tr key={r._id}>
                            <td>{r.employeeCode}</td>
                            <td><strong>{r.employeeName}</strong></td>
                            <td>{new Date(r.probationEndDate).toLocaleDateString()}</td>
                            <td><span className="badge badge-info">{r.status}</span></td>
                          </tr>
                        ))}
                        {(!reportsData.upcomingConfirmationList || reportsData.upcomingConfirmationList.length === 0) && (
                          <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No confirmations due in the next 30 days.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Overdue reviews */}
                <div className="card">
                  <div className="card-title">Overdue Evaluations & Reviews</div>
                  <div className="table-responsive">
                    <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Manager</th>
                          <th>End Date</th>
                          <th>Overdue Days</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportsData.overdueList?.map(r => {
                          const delayMs = now - new Date(r.probationEndDate);
                          const delayDays = Math.round(delayMs / (1000 * 60 * 60 * 24));
                          return (
                            <tr key={r._id}>
                              <td><strong>{r.employeeName}</strong></td>
                              <td>{r.reportingManagerName}</td>
                              <td style={{ color: 'var(--rose-500)', fontWeight: 600 }}>{new Date(r.probationEndDate).toLocaleDateString()}</td>
                              <td><span className="badge badge-danger">{delayDays} Days Overdue</span></td>
                            </tr>
                          );
                        })}
                        {(!reportsData.overdueList || reportsData.overdueList.length === 0) && (
                          <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>All evaluations completed on time.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      ) : (
        /* EMPLOYEE VIEW WORKSPACE */
        <div className="card">
          <div className="card-title">My Probation Progress Timeline</div>
          
          {ownRecord ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PROBATION END DATE</div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0', color: 'hsl(var(--primary))' }}>
                    {new Date(ownRecord.probationEndDate).toLocaleDateString()}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Duration: {ownRecord.probationDuration} Days ({ownRecord.employeeCategory})</span>
                </div>

                <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CURRENT TRACK STATUS</div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0' }}>
                    <span className={`badge ${ownRecord.status === 'Confirmed' ? 'badge-success' : 'badge-info'}`}>
                      {ownRecord.status}
                    </span>
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reviewer: {ownRecord.reportingManagerName}</span>
                </div>
              </div>

              {/* KPIs & Goals Targets */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}><i className="fa-solid fa-bullseye"></i> My Performance KPI Mappings</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {ownRecord.kpis?.map((kpi, idx) => (
                    <div key={idx} style={{ padding: '12px', border: '1px dashed var(--border-color)', borderRadius: '6px', fontSize: '0.85rem' }}>
                      <strong>{kpi.title}</strong>
                      <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>{kpi.target} (Weight: {kpi.weight}%)</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manager Remarks if submitted */}
              {ownRecord.review?.goalAchievement && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', fontSize: '0.85rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}><i className="fa-solid fa-comment-dots"></i> Manager Evaluation Feedback</h4>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-color)', padding: '12px', borderRadius: '8px' }}>
                    <div><strong>Goal Achievements:</strong> {ownRecord.review.goalAchievement}</div>
                    <div style={{ marginTop: '6px' }}><strong>Attendance:</strong> {ownRecord.review.attendanceReview} | <strong>Collaboration:</strong> {ownRecord.review.behaviorReview}</div>
                    <div style={{ marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                      <strong>Comments:</strong> <span style={{ fontStyle: 'italic', opacity: 0.9 }}>"{ownRecord.review.managerComments}"</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Letter Confirmation Download */}
              {ownRecord.decision?.letterUrl && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', textAlign: 'center' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      showToast('Downloading Confirmation / Extension Letter.', 'success');
                      // Mock file download
                      const element = document.createElement("a");
                      const file = new Blob([
                        `CONFIRMATION & COMPLIANCE LETTER\n\nDear ${ownRecord.employeeName},\n\nThis is to notify that the final employment lifecycle decision processed: ${ownRecord.decision.action}.\nRemarks: ${ownRecord.decision.remarks || 'None'}\nEffective Date: ${new Date(ownRecord.decision.effectiveDate).toLocaleDateString()}\n\nVerified by: ${ownRecord.decision.approvedBy}\nTalent Sphere Enterprise HRMS.`
                      ], {type: 'text/plain'});
                      element.href = URL.createObjectURL(file);
                      element.download = "ConfirmationLetter_" + ownRecord.employeeCode + ".txt";
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                  >
                    <i className="fa-solid fa-download"></i> Download Official Confirmation Letter
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: '2.5rem', color: 'var(--emerald-500)', opacity: 0.8, marginBottom: '12px' }}></i>
              <h4 style={{ fontWeight: 700, color: 'hsl(var(--text-primary))' }}>Confirmed Status</h4>
              <p style={{ fontSize: '0.85rem' }}>You are currently not mapped under a probation framework (Confirmed Permanent status).</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default ProbationManagement;
