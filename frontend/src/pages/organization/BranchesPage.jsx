import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../api';
import SubmoduleHeader from './SubmoduleHeader';
import Modal from '../../components/Modal';

const BranchesPage = ({ mode }) => {
  const {
    branches,
    employees,
    fetchBranches
  } = useContext(DataContext);

  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const isHr = mode === 'hr' || user?.role === 'hr';

  // --- Modal Open State ---
  const [showModal, setShowModal] = useState(false);

  // --- Branch Setup States ---
  const [brName, setBrName] = useState('');
  const [brCode, setBrCode] = useState('');
  const [brLoc, setBrLoc] = useState('');
  const [brHead, setBrHead] = useState('');
  const [brStatus, setBrStatus] = useState('Active');
  const [editingBranch, setEditingBranch] = useState(null);

  useEffect(() => {
    fetchBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEmpById = (id) => employees.find(e => e.id === id);

  // --- Save / Edit Branch ---
  const handleSaveBranch = async (e) => {
    e.preventDefault();
    if (!brName || !brCode) return showToast('Name and code are required', 'error');
    const payload = { name: brName, code: brCode, location: brLoc, branchHead: brHead, status: brStatus };
    try {
      if (editingBranch) {
        await api.put(`/org/branches/${editingBranch._id}`, payload);
        showToast('Branch updated successfully', 'success');
      } else {
        await api.post('/org/branches', payload);
        showToast('Branch registered successfully', 'success');
      }
      fetchBranches();
      setEditingBranch(null);
      resetBranchForm();
      setShowModal(false);
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save branch', 'error'); }
  };

  const resetBranchForm = () => {
    setBrName(''); setBrCode(''); setBrLoc(''); setBrHead(''); setBrStatus('Active');
  };

  return (
    <div style={{ padding: '24px' }}>
      <SubmoduleHeader 
        title="Branches & Locations" 
        description="Manage geographical office locations, branch offices, and assign branch heads."
        actionLabel="Register Branch"
        onActionClick={() => {
          setEditingBranch(null);
          resetBranchForm();
          setShowModal(true);
        }}
        isHr={isHr}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <div className="emp-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Company Locations & Branches</h3>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px' }}>Branch Name</th>
                  <th style={{ padding: '12px' }}>Branch Code</th>
                  <th style={{ padding: '12px' }}>Address Location</th>
                  <th style={{ padding: '12px' }}>Branch Head Manager</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  {isHr && <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {branches.map(b => (
                  <tr key={b._id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.9rem' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{b.name}</td>
                    <td style={{ padding: '12px' }}>{b.code}</td>
                    <td style={{ padding: '12px' }}>{b.location || 'HQ'}</td>
                    <td style={{ padding: '12px' }}>{getEmpById(b.branchHead)?.name || 'Unassigned'}</td>
                    <td style={{ padding: '12px' }}><span className={`badge ${b.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{b.status}</span></td>
                    {isHr && (
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => { setEditingBranch(b); setBrName(b.name); setBrCode(b.code); setBrLoc(b.location || ''); setBrHead(b.branchHead || ''); setBrStatus(b.status); setShowModal(true); }}>Edit</button>
                          <button className="btn btn-secondary" style={{ padding: '4px 8px', color: 'red' }} onClick={async () => { if (window.confirm('Delete branch?')) { await api.delete(`/org/branches/${b._id}`); fetchBranches(); } }}>Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {branches.length === 0 && (
                  <tr>
                    <td colSpan={isHr ? 6 : 5} style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>No branch offices found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Branch Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingBranch ? 'Modify Branch Office' : 'Register New Branch'}>
        <form onSubmit={handleSaveBranch} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label>Branch Name*</label>
            <input type="text" className="form-control" value={brName} onChange={e => setBrName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Branch Code*</label>
            <input type="text" className="form-control" value={brCode} onChange={e => setBrCode(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Physical Address Location</label>
            <input type="text" className="form-control" value={brLoc} onChange={e => setBrLoc(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Assign Branch Head</label>
            <select className="form-control" value={brHead} onChange={e => setBrHead(e.target.value)}>
              <option value="">Select Head...</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={brStatus} onChange={e => setBrStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingBranch ? 'Update Branch' : 'Register Branch'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingBranch(null); resetBranchForm(); }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BranchesPage;
