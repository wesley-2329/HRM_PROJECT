import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { useToast } from './Toast';

const TransferManagement = () => {
  const { user } = useContext(AuthContext);
  const { employees } = useContext(DataContext);
  const { showToast } = useToast();

  const [transfers, setTransfers] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);
  const [innerTab, setInnerTab] = useState('dashboard'); // 'dashboard', 'raise', 'process', 'history', 'reports'
  
  const [selectedTrn, setSelectedTrn] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [depts, setDepts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [histories, setHistories] = useState({ deptHistory: [], managerHistory: [] });

  // Raise Form
  const [raiseForm, setRaiseForm] = useState({
    employeeId: '',
    transferType: 'Inter-Department Transfer',
    transferReason: 'Professional Growth',
    effectiveDate: new Date().toISOString().split('T')[0],
    remarks: '',
    attachmentUrl: ''
  });

  // Processing Form
  const [processForm, setProcessForm] = useState({
    newDepartment: 'Engineering',
    newLocation: 'Bangalore Head Office',
    newManagerId: '',
    newCostCenter: 'CC-ENG-01',
    newGrade: 'B2'
  });

  const [generatedLetter, setGeneratedLetter] = useState('');
  const [actionComments, setActionComments] = useState('');

  const isHr = user?.role === 'hr';

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transfers');
      setTransfers(res.data.data);
      setSummary(res.data.summary);

      const histRes = await api.get('/transfers/history');
      setHistories(histRes.data);

      const deptsRes = await api.get('/org/departments');
      setDepts(deptsRes.data);

      const branchesRes = await api.get('/org/branches');
      setBranches(branchesRes.data);
    } catch (err) {
      console.error('Error fetching transfers data:', err);
      showToast('Error loading transfers tracker.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRaiseSubmit = async (e) => {
    e.preventDefault();
    const empId = isHr ? raiseForm.employeeId : user.id;
    
    // Check backdate
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(raiseForm.effectiveDate) < today) {
      showToast('Effective Date cannot be backdated.', 'warning');
      return;
    }

    try {
      await api.post('/transfers', {
        ...raiseForm,
        employeeId: empId
      });
      showToast('Transfer request initiated successfully.', 'success');
      setInnerTab('dashboard');
      fetchData();
      // reset
      setRaiseForm({
        employeeId: '',
        transferType: 'Inter Department Transfer',
        transferReason: 'Professional Growth',
        effectiveDate: new Date().toISOString().split('T')[0],
        remarks: '',
        attachmentUrl: ''
      });
    } catch (err) {
      showToast(err.response?.data?.message || 'Error raising request.', 'error');
    }
  };

  const handleAction = async (id, decision) => {
    try {
      await api.put(`/transfers/${id}/action`, { decision, comments: actionComments });
      showToast(`Request ${decision.toLowerCase()} successfully.`, 'success');
      setActionComments('');
      fetchData();
    } catch (err) {
      showToast('Error processing decision.', 'error');
    }
  };

  const handleProcessSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTrn) return;
    try {
      const res = await api.post(`/transfers/${selectedTrn._id}/process`, processForm);
      showToast('Transfer completed and records updated successfully.', 'success');
      setGeneratedLetter(res.data.letter);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error processing transfer.', 'error');
    }
  };

  // Find standard employee's own transfers
  const ownTransfers = !isHr ? transfers.filter(t => t.employeeId === user.id) : [];

  return (
    <div className="portal-container" style={{ padding: '0 0 24px 0' }}>
      
      {/* Banner */}
      <div className="welcome-card-banner" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #1e1b4b 100%)', color: '#fff', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>Transfer Hub</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {isHr 
              ? 'Manage organizational movements, department/location changes, and update reporting structures.' 
              : 'Submit inter-department or location transfer requests and track validation status.'}
          </p>
        </div>
        <div style={{ fontSize: '2.5rem', opacity: 0.2 }}><i className="fa-solid fa-right-left"></i></div>
      </div>

      {isHr ? (
        /* HR VIEW WORKSPACE */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Sub Navbar */}
          <div className="card" style={{ padding: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap', border: '1px solid var(--border-color)' }}>
            <button 
              className={`btn ${innerTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => { setInnerTab('dashboard'); setSelectedTrn(null); setGeneratedLetter(''); }}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-gauge-high"></i> Dashboard & Requests
            </button>
            <button 
              className={`btn ${innerTab === 'raise' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => { setInnerTab('raise'); setSelectedTrn(null); setGeneratedLetter(''); }}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-circle-plus"></i> Raise Request
            </button>
            {selectedTrn && (
              <button 
                className={`btn ${innerTab === 'process' ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => setInnerTab('process')}
                style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <i className="fa-solid fa-cogs"></i> Process Transfer
              </button>
            )}
            <button 
              className={`btn ${innerTab === 'history' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => { setInnerTab('history'); setSelectedTrn(null); setGeneratedLetter(''); }}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-timeline"></i> Movement Histories
            </button>
            <button 
              className={`btn ${innerTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => { setInnerTab('reports'); setSelectedTrn(null); setGeneratedLetter(''); }}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-print"></i> Operational Reports
            </button>
          </div>

          {/* SCREEN 1 & 2: DASHBOARD & REQUESTS LIST */}
          {innerTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Metrics */}
              <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="metric-card primary">
                  <div>
                    <span className="metric-label">Active Requests</span>
                    <div className="metric-val">{summary.pending}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-folder-open"></i></div>
                </div>
                <div className="metric-card success">
                  <div>
                    <span className="metric-label">Processed Transfers</span>
                    <div className="metric-val">{summary.approved}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-circle-check"></i></div>
                </div>
                <div className="metric-card danger">
                  <div>
                    <span className="metric-label">Rejected Requests</span>
                    <div className="metric-val">{summary.rejected}</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-circle-xmark"></i></div>
                </div>
              </div>

              {/* Table requests */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div className="card-title" style={{ margin: 0 }}>Transfer Applications Register</div>
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
                        <th>TRN Number</th>
                        <th>Employee</th>
                        <th>Current Dept</th>
                        <th>Current Location</th>
                        <th>Transfer Type</th>
                        <th>Effective Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transfers
                        .filter(t => t.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || t.employeeId.includes(searchQuery))
                        .map(t => {
                          const statusColors = {
                            'Pending Recommendation': 'badge-secondary',
                            'Pending Approval': 'badge-warning',
                            'Under HR Review': 'badge-info',
                            'Approved': 'badge-success',
                            'Rejected': 'badge-danger',
                            'Sent Back': 'badge-primary'
                          };
                          return (
                            <tr key={t._id}>
                              <td style={{ fontWeight: 'bold', color: 'hsl(var(--primary))' }}>{t.transferNumber}</td>
                              <td><strong>{t.employeeName}</strong></td>
                              <td>{t.currentDepartment}</td>
                              <td>{t.currentLocation}</td>
                              <td><span className="badge badge-info">{t.transferType}</span></td>
                              <td>{new Date(t.effectiveDate).toLocaleDateString()}</td>
                              <td><span className={`badge ${statusColors[t.status]}`}>{t.status}</span></td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button 
                                    className="btn btn-secondary" 
                                    style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                                    onClick={() => {
                                      setSelectedTrn(t);
                                      setProcessForm({
                                        newDepartment: t.newDepartment || 'Engineering',
                                        newLocation: t.newLocation || 'Bangalore Head Office',
                                        newManagerId: t.newManagerId || '',
                                        newCostCenter: t.newCostCenter || 'CC-ENG-01',
                                        newGrade: t.newGrade || 'B2'
                                      });
                                      setInnerTab('process');
                                    }}
                                  >
                                    Process
                                  </button>
                                  <button 
                                    className="btn btn-secondary" 
                                    style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--rose-500)' }} 
                                    onClick={() => handleAction(t._id, 'Reject')}
                                  >
                                    Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      {transfers.length === 0 && (
                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>No transfer requests filed.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 1: RAISE REQUEST */}
          {innerTab === 'raise' && (
            <div className="card" style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }}>
              <div className="card-title">Initiate Transfer Application</div>
              <form onSubmit={handleRaiseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div className="form-group">
                  <label>Select Employee Target</label>
                  <select 
                    className="form-control"
                    value={raiseForm.employeeId}
                    onChange={(e) => setRaiseForm(prev => ({ ...prev, employeeId: e.target.value }))}
                    required
                  >
                    <option value="">Choose Employee...</option>
                    {employees.filter(emp => emp.status === 'Approved').map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept} | ID: {emp.id})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Transfer Type</label>
                    <select 
                      className="form-control"
                      value={raiseForm.transferType}
                      onChange={(e) => setRaiseForm(prev => ({ ...prev, transferType: e.target.value }))}
                    >
                      <option value="Promotion Transfer">Promotion Transfer</option>
                      <option value="Lateral Transfer">Lateral Transfer</option>
                      <option value="Temporary Transfer">Temporary Transfer</option>
                      <option value="Permanent Transfer">Permanent Transfer</option>
                      <option value="Inter-Department Transfer">Inter-Department Transfer</option>
                      <option value="Cost Center Transfer">Cost Center Transfer</option>
                      <option value="Organization Restructure">Organization Restructure</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Effective Date Target</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={raiseForm.effectiveDate}
                      onChange={(e) => setRaiseForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Reason Selection</label>
                  <select 
                    className="form-control"
                    value={raiseForm.transferReason}
                    onChange={(e) => setRaiseForm(prev => ({ ...prev, transferReason: e.target.value }))}
                  >
                    <option value="Professional Growth">Professional Growth</option>
                    <option value="Business Relocation">Business Relocation</option>
                    <option value="Structural Redesign">Structural Redesign</option>
                    <option value="Temporary Project Assignment">Temporary Project Assignment</option>
                    <option value="Personal Relocation Request">Personal Relocation Request</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Remarks</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="Enter additional comments or remarks..."
                    value={raiseForm.remarks}
                    onChange={(e) => setRaiseForm(prev => ({ ...prev, remarks: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Attachment Document (Optional)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Provide document link or attachment URL..."
                    value={raiseForm.attachmentUrl}
                    onChange={(e) => setRaiseForm(prev => ({ ...prev, attachmentUrl: e.target.value }))}
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Submit Transfer Request
                </button>
              </form>
            </div>
          )}

          {/* SCREEN 3: TRANSFER PROCESSING SCREEN */}
          {innerTab === 'process' && selectedTrn && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              
              <div className="card">
                <div className="card-title">Process Transfer Framework: {selectedTrn.transferNumber}</div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
                  <div><strong>Employee:</strong> {selectedTrn.employeeName} | <strong>Current Dept:</strong> {selectedTrn.currentDepartment}</div>
                  <div><strong>Reason:</strong> {selectedTrn.transferReason}</div>
                </div>

                <form onSubmit={handleProcessSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>New Target Department</label>
                      <select 
                        className="form-control"
                        value={processForm.newDepartment}
                        onChange={(e) => setProcessForm(prev => ({ ...prev, newDepartment: e.target.value }))}
                      >
                        {depts.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>New Location Branch</label>
                      <select 
                        className="form-control"
                        value={processForm.newLocation}
                        onChange={(e) => setProcessForm(prev => ({ ...prev, newLocation: e.target.value }))}
                      >
                        {branches.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>New Reporting Manager</label>
                      <select 
                        className="form-control"
                        value={processForm.newManagerId}
                        onChange={(e) => setProcessForm(prev => ({ ...prev, newManagerId: e.target.value }))}
                        required
                      >
                        <option value="">Select manager...</option>
                        {employees.filter(emp => emp.status === 'Approved').map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept})</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>New Cost Center</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={processForm.newCostCenter}
                        onChange={(e) => setProcessForm(prev => ({ ...prev, newCostCenter: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>New Grade/Band (Optional)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={processForm.newGrade}
                      onChange={(e) => setProcessForm(prev => ({ ...prev, newGrade: e.target.value }))}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Confirm Transfer & Generate Letter
                  </button>
                </form>
              </div>

              {/* Generated Letter Preview */}
              {generatedLetter && (
                <div className="card" style={{ background: '#090d16', border: '1px solid var(--border-color)', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '14px' }}>
                    <h4 style={{ margin: 0, fontWeight: 700, color: 'hsl(var(--primary))' }}><i className="fa-solid fa-envelope-open-text"></i> Generated Transfer letter</h4>
                    <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => window.print()}>
                      Print / Download
                    </button>
                  </div>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Courier, monospace', fontSize: '0.85rem', color: '#ccc', lineHeight: 1.6 }}>
                    {generatedLetter}
                  </pre>
                </div>
              )}

            </div>
          )}

          {/* SCREEN 4: TRANSFER HISTORY SCREEN */}
          {innerTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div className="card">
                <div className="card-title">Department Change History Logs</div>
                <div className="table-responsive">
                  <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Old Department</th>
                        <th>New Department</th>
                        <th>Effective Date</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {histories.deptHistory?.map((h, i) => (
                        <tr key={i}>
                          <td><strong>{h.employeeName}</strong></td>
                          <td>{h.oldDept}</td>
                          <td><strong>{h.newDept}</strong></td>
                          <td>{new Date(h.effectiveDate).toLocaleDateString()}</td>
                          <td>{h.reason}</td>
                        </tr>
                      ))}
                      {(!histories.deptHistory || histories.deptHistory.length === 0) && (
                        <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No department transfers logged.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Reporting Manager Change History Logs</div>
                <div className="table-responsive">
                  <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Old Manager</th>
                        <th>New Manager</th>
                        <th>Effective Date</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {histories.managerHistory?.map((h, i) => {
                        const oldMgr = employees.find(e => e.id === h.oldManagerId)?.name || h.oldManagerId || 'None';
                        const newMgr = employees.find(e => e.id === h.newManagerId)?.name || h.newManagerId || 'None';
                        return (
                          <tr key={i}>
                            <td><strong>{h.employeeName}</strong></td>
                            <td>{oldMgr}</td>
                            <td><strong>{newMgr}</strong></td>
                            <td>{new Date(h.effectiveDate).toLocaleDateString()}</td>
                            <td>{h.reason}</td>
                          </tr>
                        );
                      })}
                      {(!histories.managerHistory || histories.managerHistory.length === 0) && (
                        <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No manager changes logged.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* REPORTS PANEL */}
          {innerTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Transfer Operational & Compliance Reports</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>Review employee movements across departments and branches.</p>
                </div>
                <button className="btn btn-primary" onClick={() => window.print()}>
                  <i className="fa-solid fa-print" style={{ marginRight: '6px' }}></i> Print Report Data
                </button>
              </div>

              {/* Department movement report */}
              <div className="card">
                <div className="card-title">Report 2: Department Movement Report</div>
                <div className="table-responsive">
                  <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Origin Dept</th>
                        <th>Destination Dept</th>
                        <th>Effective Date</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {histories.deptHistory?.map((h, i) => (
                        <tr key={i}>
                          <td><strong>{h.employeeName}</strong></td>
                          <td>{h.oldDept}</td>
                          <td><strong>{h.newDept}</strong></td>
                          <td>{new Date(h.effectiveDate).toLocaleDateString()}</td>
                          <td>{h.reason}</td>
                        </tr>
                      ))}
                      {(!histories.deptHistory || histories.deptHistory.length === 0) && (
                        <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No movement logged.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      ) : (
        /* EMPLOYEE VIEW WORKSPACE */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card" style={{ padding: '8px', display: 'flex', gap: '8px', border: '1px solid var(--border-color)' }}>
            <button 
              className={`btn ${innerTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setInnerTab('dashboard')}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              My Request Tracker
            </button>
            <button 
              className={`btn ${innerTab === 'raise' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setInnerTab('raise')}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              File Transfer Request
            </button>
          </div>

          {innerTab === 'dashboard' && (
            <div className="card">
              <div className="card-title">My Filed Transfer Requests</div>
              <div className="table-responsive">
                <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>TRN Number</th>
                      <th>Transfer Type</th>
                      <th>Reason</th>
                      <th>Effective Date</th>
                      <th>Status</th>
                      <th>Letter</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ownTransfers.map(t => (
                      <tr key={t._id}>
                        <td><strong>{t.transferNumber}</strong></td>
                        <td>{t.transferType}</td>
                        <td>{t.transferReason}</td>
                        <td>{new Date(t.effectiveDate).toLocaleDateString()}</td>
                        <td><span className="badge badge-info">{t.status}</span></td>
                        <td>
                          {t.status === 'Approved' ? (
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                              onClick={() => {
                                showToast('Downloading Transfer Letter.', 'success');
                                const element = document.createElement("a");
                                const file = new Blob([
                                  `TRANSFER CONFIRMATION LETTER\n\nTransaction ID: ${t.transferNumber}\n\nDear ${t.employeeName},\n\nWe are pleased to inform you that your transfer request has been officially approved.\nEffective Date: ${new Date(t.effectiveDate).toLocaleDateString()}\nNew Department: ${t.newDepartment}\nNew Location: ${t.newLocation}\nNew Manager: ${t.newManagerName}\n\nSincerely,\nHR Department`
                                ], {type: 'text/plain'});
                                element.href = URL.createObjectURL(file);
                                element.download = "TransferLetter_" + t.transferNumber + ".txt";
                                document.body.appendChild(element);
                                element.click();
                                document.body.removeChild(element);
                              }}
                            >
                              Download Letter
                            </button>
                          ) : 'Pending Approval'}
                        </td>
                      </tr>
                    ))}
                    {ownTransfers.length === 0 && (
                      <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>You have no transfer requests active.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {innerTab === 'raise' && (
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
              <div className="card-title">File Transfer Request</div>
              <form onSubmit={handleRaiseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label>Transfer Type</label>
                  <select 
                    className="form-control"
                    value={raiseForm.transferType}
                    onChange={(e) => setRaiseForm(prev => ({ ...prev, transferType: e.target.value }))}
                  >
                    <option value="Promotion Transfer">Promotion Transfer</option>
                    <option value="Lateral Transfer">Lateral Transfer</option>
                    <option value="Temporary Transfer">Temporary Transfer</option>
                    <option value="Permanent Transfer">Permanent Transfer</option>
                    <option value="Inter-Department Transfer">Inter-Department Transfer</option>
                    <option value="Cost Center Transfer">Cost Center Transfer</option>
                    <option value="Organization Restructure">Organization Restructure</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Effective Date Target</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={raiseForm.effectiveDate}
                    onChange={(e) => setRaiseForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Reason Details</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="State details regarding reason for transfer request..."
                    value={raiseForm.remarks}
                    onChange={(e) => setRaiseForm(prev => ({ ...prev, remarks: e.target.value }))}
                    required 
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Submit Transfer request
                </button>
              </form>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default TransferManagement;
