import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { useToast } from './Toast';

const GradeManagement = () => {
  const { user } = useContext(AuthContext);
  const { employees } = useContext(DataContext);
  const { showToast } = useToast();

  const [dashboard, setDashboard] = useState({ gradesCount: 0, bandsCount: 0, activeEmployees: 0, gradeDistribution: [] });
  const [grades, setGrades] = useState([]);
  const [bands, setBands] = useState([]);
  const [movements, setMovements] = useState([]);
  const [reports, setReports] = useState({ gradeReport: [], bandReport: [], movementsHistory: [] });
  const [loading, setLoading] = useState(false);
  
  const [innerTab, setInnerTab] = useState('dashboard'); // 'dashboard', 'grades', 'bands', 'assign', 'movements', 'reports'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Grade Form
  const [gradeForm, setGradeForm] = useState({
    gradeCode: '',
    gradeName: '',
    gradeDescription: '',
    gradeLevel: 1,
    status: 'Active'
  });

  // Band Form
  const [bandForm, setBandForm] = useState({
    bandCode: '',
    bandName: '',
    bandDescription: '',
    parentGrade: '',
    careerLevel: 1,
    status: 'Active'
  });

  // Assign Form
  const [assignForm, setAssignForm] = useState({
    employeeId: '',
    gradeCode: '',
    bandCode: '',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  // Movement Request Form
  const [moveForm, setMoveForm] = useState({
    employeeId: '',
    proposedGrade: '',
    proposedBand: '',
    reason: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    attachmentUrl: ''
  });

  const [decisionComments, setDecisionComments] = useState('');

  const isHr = user?.role === 'hr';

  const fetchData = async () => {
    setLoading(true);
    try {
      const dbRes = await api.get('/grades/dashboard');
      setDashboard(dbRes.data);

      const grRes = await api.get('/grades');
      setGrades(grRes.data);

      const bdRes = await api.get('/grades/bands');
      setBands(bdRes.data);

      const mvRes = await api.get('/grades/movements');
      setMovements(mvRes.data);

      const repRes = await api.get('/grades/reports');
      setReports(repRes.data);
    } catch (err) {
      console.error('Error fetching grades structure:', err);
      showToast('Error loading grade structure database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/grades', gradeForm);
      showToast('New Grade master code created.', 'success');
      fetchData();
      setGradeForm({ gradeCode: '', gradeName: '', gradeDescription: '', gradeLevel: 1, status: 'Active' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating grade.', 'error');
    }
  };

  const handleBandSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/grades/bands', bandForm);
      showToast('New Band mapped to grade hierarchy.', 'success');
      fetchData();
      setBandForm({ bandCode: '', bandName: '', bandDescription: '', parentGrade: '', careerLevel: 1, status: 'Active' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating band.', 'error');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/grades/assign', assignForm);
      showToast('Employee grade structure mapped successfully.', 'success');
      fetchData();
      setAssignForm({ employeeId: '', gradeCode: '', bandCode: '', effectiveDate: new Date().toISOString().split('T')[0] });
    } catch (err) {
      showToast(err.response?.data?.message || 'Error assigning grade.', 'error');
    }
  };

  const handleMoveSubmit = async (e) => {
    e.preventDefault();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(moveForm.effectiveDate) < today) {
      showToast('Effective Date cannot be backdated.', 'warning');
      return;
    }

    try {
      await api.post('/grades/movements', moveForm);
      showToast('Grade movement request submitted successfully.', 'success');
      setInnerTab('dashboard');
      fetchData();
      setMoveForm({ employeeId: '', proposedGrade: '', proposedBand: '', reason: '', effectiveDate: new Date().toISOString().split('T')[0], attachmentUrl: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Error requesting movement.', 'error');
    }
  };

  const handleAction = async (id, decision) => {
    try {
      await api.put(`/grades/movements/${id}/action`, { decision, comments: decisionComments });
      showToast(`Verdict registered: ${decision}`, 'success');
      setDecisionComments('');
      fetchData();
    } catch (err) {
      showToast('Error registering decision.', 'error');
    }
  };

  const ownEmpInfo = employees.find(emp => emp.id === user.id);
  const ownMovements = movements.filter(m => m.employeeId === user.id);

  return (
    <div className="portal-container" style={{ padding: '0 0 24px 0' }}>
      
      {/* Banner */}
      <div className="welcome-card-banner" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #1e1b4b 100%)', color: '#fff', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>Grade & Band Hub</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {isHr 
              ? 'Define grade levels, map career bands, assign structures, and approve grade movements.' 
              : 'Review your career progression hierarchy, check mappings, and track pending grade movements.'}
          </p>
        </div>
        <div style={{ fontSize: '2.5rem', opacity: 0.2 }}><i className="fa-solid fa-layer-group"></i></div>
      </div>

      {isHr ? (
        /* HR VIEW WORKSPACE */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Sub Navbar */}
          <div className="card" style={{ padding: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap', border: '1px solid var(--border-color)' }}>
            <button 
              className={`btn ${innerTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setInnerTab('dashboard')}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-gauge-high"></i> Dashboard & Movements
            </button>
            <button 
              className={`btn ${innerTab === 'grades' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setInnerTab('grades')}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-folder-open"></i> Grade Masters
            </button>
            <button 
              className={`btn ${innerTab === 'bands' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setInnerTab('bands')}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-sitemap"></i> Band Masters
            </button>
            <button 
              className={`btn ${innerTab === 'assign' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setInnerTab('assign')}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-user-tag"></i> Employee Assignment
            </button>
            <button 
              className={`btn ${innerTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setInnerTab('reports')}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-print"></i> Hierarchy Reports
            </button>
          </div>

          {/* SCREEN 1: GRADE DASHBOARD */}
          {innerTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Metrics */}
              <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div className="metric-card primary">
                  <div>
                    <span className="metric-label">Total Grades Defined</span>
                    <div className="metric-val">{dashboard.gradesCount} Levels</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-layer-group"></i></div>
                </div>
                <div className="metric-card success">
                  <div>
                    <span className="metric-label">Bands Configured</span>
                    <div className="metric-val">{dashboard.bandsCount} Bands</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-sitemap"></i></div>
                </div>
                <div className="metric-card info">
                  <div>
                    <span className="metric-label">Mapped Employees</span>
                    <div className="metric-val">{dashboard.activeEmployees} Staff</div>
                  </div>
                  <div className="metric-icon-box"><i className="fa-solid fa-users"></i></div>
                </div>
              </div>

              {/* Active movement requests register */}
              <div className="card">
                <div className="card-title">Pending Grade Movement Requests</div>
                <div className="table-responsive">
                  <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Current Grade</th>
                        <th>Proposed Grade</th>
                        <th>Effective Date</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.filter(m => m.status === 'Pending Approval').map(m => (
                        <tr key={m._id}>
                          <td><strong>{m.employeeName}</strong></td>
                          <td>{m.department}</td>
                          <td>{m.currentGrade}</td>
                          <td><strong style={{ color: 'hsl(var(--primary))' }}>{m.proposedGrade}</strong></td>
                          <td>{new Date(m.effectiveDate).toLocaleDateString()}</td>
                          <td>{m.reason}</td>
                          <td><span className="badge badge-warning">{m.status}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                                onClick={() => handleAction(m._id, 'Approved')}
                              >
                                Approve
                              </button>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--rose-500)' }} 
                                onClick={() => handleAction(m._id, 'Rejected')}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {movements.filter(m => m.status === 'Pending Approval').length === 0 && (
                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>No pending grade transition requests.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Form to raise movement */}
              <div className="card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                <div className="card-title">Recommend Employee Grade Movement</div>
                <form onSubmit={handleMoveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label>Select Target Employee</label>
                    <select 
                      className="form-control"
                      value={moveForm.employeeId}
                      onChange={(e) => setMoveForm(prev => ({ ...prev, employeeId: e.target.value }))}
                      required
                    >
                      <option value="">Select Employee...</option>
                      {employees.filter(emp => emp.status === 'Approved').map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} (Grade: {emp.grade || 'Unmapped'} | ID: {emp.id})</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>Proposed Grade Level</label>
                      <select 
                        className="form-control"
                        value={moveForm.proposedGrade}
                        onChange={(e) => setMoveForm(prev => ({ ...prev, proposedGrade: e.target.value }))}
                        required
                      >
                        <option value="">Select grade...</option>
                        {grades.filter(g => g.status === 'Active').map(g => (
                          <option key={g._id} value={g.gradeCode}>{g.gradeName} ({g.gradeCode})</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Proposed Band</label>
                      <select 
                        className="form-control"
                        value={moveForm.proposedBand}
                        onChange={(e) => setMoveForm(prev => ({ ...prev, proposedBand: e.target.value }))}
                        required
                      >
                        <option value="">Select band...</option>
                        {bands.filter(b => b.status === 'Active').map(b => (
                          <option key={b._id} value={b.bandCode}>{b.bandName} ({b.bandCode})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Effective Date Target</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={moveForm.effectiveDate}
                      onChange={(e) => setMoveForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Remarks & Rationale</label>
                    <textarea 
                      className="form-control" 
                      rows="2" 
                      placeholder="Justify change request..."
                      value={moveForm.reason}
                      onChange={(e) => setMoveForm(prev => ({ ...prev, reason: e.target.value }))}
                      required 
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Submit Grade Movement Request
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* SCREEN 2: GRADE MASTER SETUP */}
          {innerTab === 'grades' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'start' }}>
              
              <div className="card">
                <div className="card-title">Grade Registry</div>
                <div className="table-responsive">
                  <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Level</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map(g => (
                        <tr key={g._id}>
                          <td><strong>{g.gradeCode}</strong></td>
                          <td>{g.gradeName}</td>
                          <td>{g.gradeDescription}</td>
                          <td>{g.gradeLevel}</td>
                          <td><span className={`badge ${g.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{g.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Create Grade Level</div>
                <form onSubmit={handleGradeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group">
                    <label>Grade Code (Unique)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. M1, A1"
                      value={gradeForm.gradeCode}
                      onChange={(e) => setGradeForm(prev => ({ ...prev, gradeCode: e.target.value }))}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Grade Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Executive, Senior Manager"
                      value={gradeForm.gradeName}
                      onChange={(e) => setGradeForm(prev => ({ ...prev, gradeName: e.target.value }))}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Grade Level (Hierarchy Ordering)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={gradeForm.gradeLevel}
                      onChange={(e) => setGradeForm(prev => ({ ...prev, gradeLevel: parseInt(e.target.value) || 1 }))}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={gradeForm.gradeDescription}
                      onChange={(e) => setGradeForm(prev => ({ ...prev, gradeDescription: e.target.value }))}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Save Grade Master
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* SCREEN 3: BAND MASTER SETUP */}
          {innerTab === 'bands' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'start' }}>
              
              <div className="card">
                <div className="card-title">Band Registry</div>
                <div className="table-responsive">
                  <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Band Code</th>
                        <th>Band Name</th>
                        <th>Parent Grade</th>
                        <th>Career Level</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bands.map(b => (
                        <tr key={b._id}>
                          <td><strong>{b.bandCode}</strong></td>
                          <td>{b.bandName}</td>
                          <td>{b.parentGrade}</td>
                          <td>{b.careerLevel}</td>
                          <td><span className={`badge ${b.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{b.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Map Band Structure</div>
                <form onSubmit={handleBandSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group">
                    <label>Band Code (Unique)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. B1-01, B2-02"
                      value={bandForm.bandCode}
                      onChange={(e) => setBandForm(prev => ({ ...prev, bandCode: e.target.value }))}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Band Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Band 1, Band 2"
                      value={bandForm.bandName}
                      onChange={(e) => setBandForm(prev => ({ ...prev, bandName: e.target.value }))}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Parent Grade Code Mapping</label>
                    <select 
                      className="form-control"
                      value={bandForm.parentGrade}
                      onChange={(e) => setBandForm(prev => ({ ...prev, parentGrade: e.target.value }))}
                      required
                    >
                      <option value="">Select Grade Code...</option>
                      {grades.map(g => <option key={g._id} value={g.gradeCode}>{g.gradeCode} - {g.gradeName}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Career Progression Level</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={bandForm.careerLevel}
                      onChange={(e) => setBandForm(prev => ({ ...prev, careerLevel: parseInt(e.target.value) || 1 }))}
                      required 
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Save Band Master
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* SCREEN 5: DIRECT EMPLOYEE GRADE ASSIGNMENT */}
          {innerTab === 'assign' && (
            <div className="card" style={{ maxWidth: '500px', margin: '0 auto', width: '100%' }}>
              <div className="card-title">Employee Direct Grade Assignment Mapping</div>
              <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label>Select Target Employee</label>
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

                <div className="form-group">
                  <label>Target Grade Code</label>
                  <select 
                    className="form-control"
                    value={assignForm.gradeCode}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, gradeCode: e.target.value }))}
                    required
                  >
                    <option value="">Select Grade...</option>
                    {grades.map(g => <option key={g._id} value={g.gradeCode}>{g.gradeCode} - {g.gradeName}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Target Band Code</label>
                  <select 
                    className="form-control"
                    value={assignForm.bandCode}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, bandCode: e.target.value }))}
                    required
                  >
                    <option value="">Select Band...</option>
                    {bands.map(b => <option key={b._id} value={b.bandCode}>{b.bandCode} - {b.bandName}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Effective Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={assignForm.effectiveDate}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Save Mapped Assignment
                </button>
              </form>
            </div>
          )}

          {/* REPORTS PANEL */}
          {innerTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Grade & Band Structure Reports</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>Review employee distribution pyramids and grade movement history logs.</p>
                </div>
                <button className="btn btn-primary" onClick={() => window.print()}>
                  <i className="fa-solid fa-print" style={{ marginRight: '6px' }}></i> Print Report Data
                </button>
              </div>

              {/* Grade distribution */}
              <div className="card">
                <div className="card-title">Report 1: Grade-wise Mapped Employee Distributions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                  {reports.gradeReport?.map((gr, idx) => (
                    <div key={idx} style={{ fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>{gr.grade}</span>
                        <strong>{gr.count} Employees</strong>
                      </div>
                      <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        <div style={{ width: `${(gr.count / (dashboard.activeEmployees || 1)) * 100}%`, height: '100%', backgroundColor: 'hsl(var(--primary))' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grade movements history list */}
              <div className="card">
                <div className="card-title">Report 2: Grade Movement Transaction Reports</div>
                <div className="table-responsive">
                  <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Old Grade</th>
                        <th>New Grade</th>
                        <th>Reason</th>
                        <th>Effective Date</th>
                        <th>Approved By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.movementsHistory?.map((h, i) => (
                        <tr key={i}>
                          <td><strong>{h.employeeName}</strong></td>
                          <td>{h.currentGrade}</td>
                          <td><strong>{h.proposedGrade}</strong></td>
                          <td>{h.reason}</td>
                          <td>{new Date(h.effectiveDate).toLocaleDateString()}</td>
                          <td>{h.approvedBy}</td>
                        </tr>
                      ))}
                      {(!reports.movementsHistory || reports.movementsHistory.length === 0) && (
                        <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No movements approved yet.</td></tr>
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
          
          <div className="card">
            <div className="card-title">My Assigned Structure Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
              <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CURRENT GRADE MAPPING</span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'hsl(var(--primary))', margin: '6px 0' }}>
                  {ownEmpInfo?.grade || 'A1'}
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Career Level Position hierarchy</span>
              </div>

              <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CURRENT BAND MAPPING</span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '6px 0' }}>
                  {ownEmpInfo?.grade ? `Band-${ownEmpInfo.grade}` : 'Band 1'}
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Career classification group mapping</span>
              </div>
            </div>
          </div>

          {/* Career progression visual paths map */}
          <div className="card">
            <div className="card-title"><i className="fa-solid fa-road"></i> Career progression roadmap</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              {grades.map((g, idx) => {
                const isCurrent = ownEmpInfo?.grade === g.gradeCode;
                return (
                  <div 
                    key={g._id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: isCurrent ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
                      border: isCurrent ? '1.5px solid hsl(var(--primary))' : '1px solid var(--border-color)',
                      borderRadius: '8px'
                    }}
                  >
                    <div>
                      <strong>{g.gradeCode} - {g.gradeName}</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Level: {g.gradeLevel} | {g.gradeDescription}</span>
                    </div>
                    {isCurrent && (
                      <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Your Current Level</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Employee own movements requests */}
          <div className="card">
            <div className="card-title">My Grade Movement Status Logs</div>
            <div className="table-responsive">
              <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Target Grade</th>
                    <th>Reason</th>
                    <th>Effective Date</th>
                    <th>Status</th>
                    <th>Verdict Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {ownMovements.map(m => (
                    <tr key={m._id}>
                      <td><strong>{m.proposedGrade}</strong></td>
                      <td>{m.reason}</td>
                      <td>{new Date(m.effectiveDate).toLocaleDateString()}</td>
                      <td><span className="badge badge-info">{m.status}</span></td>
                      <td>{m.remarks || 'No remarks recorded'}</td>
                    </tr>
                  ))}
                  {ownMovements.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No grade movements raised yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default GradeManagement;
