import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../api';
import SubmoduleHeader from './SubmoduleHeader';
import Modal from '../../components/Modal';

const DesignationsPage = ({ mode }) => {
  const {
    designations,
    gradeBands,
    departments,
    fetchDesignations,
    fetchGradeBands
  } = useContext(DataContext);

  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const isHr = mode === 'hr' || user?.role === 'hr';
  const location = useLocation();
  const navigate = useNavigate();

  // --- Sub-tab Selector based on Path ---
  let desgSubTab = 'desg';
  if (location.pathname === '/organization/designations/grade-bands') {
    desgSubTab = 'grade';
  }

  // --- Modal Visibility States ---
  const [showDesgModal, setShowDesgModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);

  // --- Designation Setup States ---
  const [desgName, setDesgName] = useState('');
  const [desgCode, setDesgCode] = useState('');
  const [desgDept, setDesgDept] = useState('');
  const [desgGrade, setDesgGrade] = useState('');
  const [desgLimit, setDesgLimit] = useState(0);
  const [desgStatus, setDesgStatus] = useState('Active');
  const [editingDesg, setEditingDesg] = useState(null);

  // --- Grade Bands Setup States ---
  const [gradeName, setGradeName] = useState('');
  const [gradeDesc, setGradeDesc] = useState('');
  const [gradeStatus, setGradeStatus] = useState('Active');
  const [editingGrade, setEditingGrade] = useState(null);

  useEffect(() => {
    fetchDesignations();
    fetchGradeBands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Save / Edit Designation ---
  const handleSaveDesignation = async (e) => {
    e.preventDefault();
    if (!desgName || !desgCode) return showToast('Name and code are required', 'error');
    const payload = { name: desgName, code: desgCode, deptMapping: desgDept, gradeMapping: desgGrade, positionLimit: desgLimit, status: desgStatus };
    try {
      if (editingDesg) {
        await api.put(`/org/designations/${editingDesg._id}`, payload);
        showToast('Designation updated successfully', 'success');
      } else {
        await api.post('/org/designations', payload);
        showToast('Designation registered successfully', 'success');
      }
      fetchDesignations();
      setEditingDesg(null);
      resetDesgForm();
      setShowDesgModal(false);
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save designation', 'error'); }
  };

  const resetDesgForm = () => {
    setDesgName(''); setDesgCode(''); setDesgDept(''); setDesgGrade(''); setDesgLimit(0); setDesgStatus('Active');
  };

  // --- Save / Edit Grade Band ---
  const handleSaveGradeBand = async (e) => {
    e.preventDefault();
    if (!gradeName) return showToast('Grade name is required', 'error');
    const payload = { name: gradeName, description: gradeDesc, status: gradeStatus };
    try {
      if (editingGrade) {
        await api.put(`/org/grade-bands/${editingGrade._id}`, payload);
        showToast('Grade/Band updated successfully', 'success');
      } else {
        await api.post('/org/grade-bands', payload);
        showToast('Grade/Band registered successfully', 'success');
      }
      fetchGradeBands();
      setEditingGrade(null);
      resetGradeForm();
      setShowGradeModal(false);
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save Grade/Band', 'error'); }
  };

  const resetGradeForm = () => {
    setGradeName(''); setGradeDesc(''); setGradeStatus('Active');
  };

  const handleDeleteGradeBand = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Grade/Band?')) return;
    try {
      await api.delete(`/org/grade-bands/${id}`);
      showToast('Grade/Band deleted successfully', 'success');
      fetchGradeBands();
    } catch (err) { showToast(err.response?.data?.message || 'Failed to delete Grade/Band', 'error'); }
  };

  const headerActionLabel = desgSubTab === 'desg' ? 'Add Designation' : 'Add Grade/Band';
  const handleHeaderActionClick = () => {
    if (desgSubTab === 'desg') {
      setEditingDesg(null);
      resetDesgForm();
      setShowDesgModal(true);
    } else {
      setEditingGrade(null);
      resetGradeForm();
      setShowGradeModal(true);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <SubmoduleHeader 
        title="Designations & Grades" 
        description="Define employee designations, role job titles, and administrative grade bands."
        actionLabel={headerActionLabel}
        onActionClick={handleHeaderActionClick}
        isHr={isHr}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Sub Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid hsl(var(--border))', marginBottom: '8px' }}>
          {[
            { id: 'desg', label: 'Designations', icon: 'fa-id-badge', route: '/organization/designations' },
            { id: 'grade', label: 'Grade & Bands', icon: 'fa-graduation-cap', route: '/organization/designations/grade-bands' }
          ].map(tab => {
            const isActive = desgSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.route)}
                style={{
                  background: isActive ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '3px solid hsl(var(--primary))' : '3px solid transparent',
                  color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
                  padding: '10px 18px',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '6px 6px 0 0',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
              >
                <i className={`fa-solid ${tab.icon}`} style={{ fontSize: '0.85rem' }}></i>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {desgSubTab === 'desg' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            <div className="emp-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Company Role Designations</h3>
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                      <th style={{ padding: '12px' }}>Designation Title</th>
                      <th style={{ padding: '12px' }}>Designation Code</th>
                      <th style={{ padding: '12px' }}>Department Mapping</th>
                      <th style={{ padding: '12px' }}>Grade / Band</th>
                      <th style={{ padding: '12px' }}>Approved Headcount limit</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      {isHr && <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {designations.map(d => (
                      <tr key={d._id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.875rem' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{d.name}</td>
                        <td style={{ padding: '12px' }}>{d.code}</td>
                        <td style={{ padding: '12px' }}>{d.deptMapping || 'General'}</td>
                        <td style={{ padding: '12px' }}>{d.gradeMapping || 'General'}</td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{d.positionLimit || 'Unlimited'}</td>
                        <td style={{ padding: '12px' }}><span className={`badge ${d.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{d.status}</span></td>
                        {isHr && (
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => { setEditingDesg(d); setDesgName(d.name); setDesgCode(d.code); setDesgDept(d.deptMapping || ''); setDesgGrade(d.gradeMapping || ''); setDesgLimit(d.positionLimit || 0); setDesgStatus(d.status); setShowDesgModal(true); }}>Edit</button>
                              <button className="btn btn-secondary" style={{ padding: '4px 8px', color: 'red' }} onClick={async () => { if (window.confirm('Delete designation?')) { await api.delete(`/org/designations/${d._id}`); fetchDesignations(); } }}>Delete</button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {designations.length === 0 && (
                      <tr>
                        <td colSpan={isHr ? 7 : 6} style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>No designations found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {desgSubTab === 'grade' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            <div className="emp-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Grade & Bands Setup</h3>
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                      <th style={{ padding: '12px' }}>Grade Name</th>
                      <th style={{ padding: '12px' }}>Description</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      {isHr && <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {gradeBands.map(gb => (
                      <tr key={gb._id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.875rem' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{gb.name}</td>
                        <td style={{ padding: '12px' }}>{gb.description || 'N/A'}</td>
                        <td style={{ padding: '12px' }}><span className={`badge ${gb.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{gb.status}</span></td>
                        {isHr && (
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => { setEditingGrade(gb); setGradeName(gb.name); setGradeDesc(gb.description || ''); setGradeStatus(gb.status); setShowGradeModal(true); }}>Edit</button>
                              <button className="btn btn-secondary" style={{ padding: '4px 8px', color: 'red' }} onClick={() => handleDeleteGradeBand(gb._id)}>Delete</button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {gradeBands.length === 0 && (
                      <tr>
                        <td colSpan={isHr ? 4 : 3} style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>No grade bands found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Designation Modal */}
      <Modal isOpen={showDesgModal} onClose={() => setShowDesgModal(false)} title={editingDesg ? 'Modify Designation' : 'Register New Designation'}>
        <form onSubmit={handleSaveDesignation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label>Designation Title*</label>
            <input type="text" className="form-control" value={desgName} onChange={e => setDesgName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Designation Code*</label>
            <input type="text" className="form-control" value={desgCode} onChange={e => setDesgCode(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Department Mapping</label>
            <select className="form-control" value={desgDept} onChange={e => setDesgDept(e.target.value)}>
              <option value="">Select Department...</option>
              {departments.map(d => (
                <option key={d._id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Grade / Band Mapping</label>
            <select className="form-control" value={desgGrade} onChange={e => setDesgGrade(e.target.value)}>
              <option value="">Select Grade...</option>
              {gradeBands.map(gb => (
                <option key={gb._id} value={gb.name}>{gb.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Headcount Limit</label>
            <input type="number" className="form-control" value={desgLimit} onChange={e => setDesgLimit(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={desgStatus} onChange={e => setDesgStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingDesg ? 'Update Designation' : 'Register Designation'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowDesgModal(false); setEditingDesg(null); resetDesgForm(); }}>Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Grade/Band Modal */}
      <Modal isOpen={showGradeModal} onClose={() => setShowGradeModal(false)} title={editingGrade ? 'Modify Grade/Band' : 'Register Grade/Band'}>
        <form onSubmit={handleSaveGradeBand} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label>Grade Name*</label>
            <input type="text" className="form-control" value={gradeName} onChange={e => setGradeName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input type="text" className="form-control" value={gradeDesc} onChange={e => setGradeDesc(e.target.value)} placeholder="e.g. Senior Professional" />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={gradeStatus} onChange={e => setGradeStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingGrade ? 'Update Grade' : 'Register Grade'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowGradeModal(false); setEditingGrade(null); resetGradeForm(); }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DesignationsPage;
