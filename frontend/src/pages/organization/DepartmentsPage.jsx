import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../api';
import SubmoduleHeader from './SubmoduleHeader';
import Modal from '../../components/Modal';

const DepartmentsPage = ({ mode }) => {
  const {
    departments,
    subDepartments,
    employees,
    businessUnits,
    branches,
    costCenters,
    fetchDepartments,
    fetchSubDepartments
  } = useContext(DataContext);

  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const isHr = mode === 'hr' || user?.role === 'hr';
  const location = useLocation();
  const navigate = useNavigate();

  // --- Sub-tab Selector based on Path ---
  let deptSubTab = 'dept';
  if (location.pathname === '/organization/departments/sub-departments') {
    deptSubTab = 'subdept';
  } else if (location.pathname === '/organization/departments/hierarchy') {
    deptSubTab = 'hierarchy';
  }

  // --- Search & Filters States ---
  const [deptSearch, setDeptSearch] = useState('');
  const [deptStatusFilter, setDeptStatusFilter] = useState('All');

  // --- Modal Open States ---
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showSubDeptModal, setShowSubDeptModal] = useState(false);

  // --- Department Setup States ---
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptParent, setDeptParent] = useState('');
  const [deptManager, setDeptManager] = useState('');
  const [deptBU, setDeptBU] = useState('');
  const [deptLoc, setDeptLoc] = useState('');
  const [deptCC, setDeptCC] = useState('');
  const [deptStatus, setDeptStatus] = useState('Active');
  const [editingDept, setEditingDept] = useState(null);

  // --- Sub Departments States ---
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subParent, setSubParent] = useState('');
  const [subManager, setSubManager] = useState('');
  const [subStatus, setSubStatus] = useState('Active');
  const [editingSubDept, setEditingSubDept] = useState(null);

  useEffect(() => {
    fetchDepartments();
    fetchSubDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEmpById = (id) => employees.find(e => e.id === id);

  // --- Save / Edit Department ---
  const handleSaveDept = async (e) => {
    e.preventDefault();
    if (!deptName || !deptCode) return showToast('Name and code are required', 'error');
    const payload = { name: deptName, code: deptCode, description: '', parentDept: deptParent, managerId: deptManager, businessUnit: deptBU, location: deptLoc, costCenter: deptCC, status: deptStatus };
    try {
      if (editingDept) {
        await api.put(`/org/departments/${editingDept._id}`, payload);
        showToast('Department updated successfully', 'success');
      } else {
        await api.post('/org/departments', payload);
        showToast('Department registered successfully', 'success');
      }
      fetchDepartments();
      setEditingDept(null);
      resetDeptForm();
      setShowDeptModal(false);
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save department', 'error'); }
  };

  const resetDeptForm = () => {
    setDeptName(''); setDeptCode(''); setDeptParent(''); setDeptManager(''); setDeptBU(''); setDeptLoc(''); setDeptCC(''); setDeptStatus('Active');
  };

  // --- Save / Edit Sub Department ---
  const handleSaveSubDept = async (e) => {
    e.preventDefault();
    if (!subName || !subCode || !subParent) return showToast('Name, code and parent department are required', 'error');
    const payload = { name: subName, code: subCode, parentDept: subParent, managerId: subManager, status: subStatus };
    try {
      if (editingSubDept) {
        await api.put(`/org/sub-departments/${editingSubDept._id}`, payload);
        showToast('Sub-department updated successfully', 'success');
      } else {
        await api.post('/org/sub-departments', payload);
        showToast('Sub-department registered successfully', 'success');
      }
      fetchSubDepartments();
      setEditingSubDept(null);
      resetSubDeptForm();
      setShowSubDeptModal(false);
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save Sub-department', 'error'); }
  };

  const resetSubDeptForm = () => {
    setSubName(''); setSubCode(''); setSubParent(''); setSubManager(''); setSubStatus('Active');
  };

  const handleDeleteSubDept = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Sub-department?')) return;
    try {
      await api.delete(`/org/sub-departments/${id}`);
      showToast('Sub-department deleted successfully', 'success');
      fetchSubDepartments();
    } catch (err) { showToast(err.response?.data?.message || 'Failed to delete Sub-department', 'error'); }
  };

  const headerActionLabel = deptSubTab === 'dept' ? 'Add Department' : (deptSubTab === 'subdept' ? 'Add Sub-Department' : null);
  const handleHeaderActionClick = () => {
    if (deptSubTab === 'dept') {
      setEditingDept(null);
      resetDeptForm();
      setShowDeptModal(true);
    } else if (deptSubTab === 'subdept') {
      setEditingSubDept(null);
      resetSubDeptForm();
      setShowSubDeptModal(true);
    }
  };

  // Apply Department Search & Filters
  const filteredDepts = departments.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(deptSearch.toLowerCase()) || 
                          d.code.toLowerCase().includes(deptSearch.toLowerCase()) ||
                          (getEmpById(d.managerId)?.name || '').toLowerCase().includes(deptSearch.toLowerCase());
    const matchesStatus = deptStatusFilter === 'All' ? true : d.status === deptStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '24px' }}>
      <SubmoduleHeader 
        title="Department Setup" 
        description="Organize functional business departments and nested sub-department structures."
        actionLabel={headerActionLabel}
        onActionClick={handleHeaderActionClick}
        isHr={isHr}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Sub Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid hsl(var(--border))', marginBottom: '8px' }}>
          {[
            { id: 'dept', label: 'Departments', icon: 'fa-sitemap', route: '/organization/departments' },
            { id: 'subdept', label: 'Sub-Departments', icon: 'fa-network-wired', route: '/organization/departments/sub-departments' },
            { id: 'hierarchy', label: 'Reporting Hierarchy', icon: 'fa-folder-tree', route: '/organization/departments/hierarchy' }
          ].map(tab => {
            const isActive = deptSubTab === tab.id;
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

        {deptSubTab === 'dept' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            <div className="emp-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Business Departments Matrix</h3>
                
                {/* Search & Active/Inactive Dropdown */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div className="nav-search" style={{ margin: 0, width: '220px' }}>
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input 
                      type="text" 
                      placeholder="Search department..." 
                      value={deptSearch} 
                      onChange={e => setDeptSearch(e.target.value)} 
                    />
                  </div>
                  <select 
                    className="form-control" 
                    style={{ width: '150px', height: '38px', padding: '0 12px' }} 
                    value={deptStatusFilter} 
                    onChange={e => setDeptStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                      <th style={{ padding: '12px' }}>Name (Code)</th>
                      <th style={{ padding: '12px' }}>Parent Dept</th>
                      <th style={{ padding: '12px' }}>Head of Dept</th>
                      <th style={{ padding: '12px' }}>Employee Count</th>
                      <th style={{ padding: '12px' }}>Business Unit</th>
                      <th style={{ padding: '12px' }}>Location</th>
                      <th style={{ padding: '12px' }}>Cost Center</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      {isHr && <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDepts.map(d => {
                      const empCount = employees.filter(e => e.dept === d.name).length;
                      return (
                        <tr key={d._id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.875rem' }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}>{d.name} ({d.code})</td>
                          <td style={{ padding: '12px' }}>{d.parentDept || 'None'}</td>
                          <td style={{ padding: '12px' }}>{getEmpById(d.managerId)?.name || 'Unassigned'}</td>
                          <td style={{ padding: '12px', fontWeight: 600, color: 'hsl(var(--primary))' }}>{empCount} Employees</td>
                          <td style={{ padding: '12px' }}>{d.businessUnit || 'General'}</td>
                          <td style={{ padding: '12px' }}>{d.location || 'General'}</td>
                          <td style={{ padding: '12px' }}>{d.costCenter || 'N/A'}</td>
                          <td style={{ padding: '12px' }}><span className={`badge ${d.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{d.status}</span></td>
                          {isHr && (
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => { setEditingDept(d); setDeptName(d.name); setDeptCode(d.code); setDeptParent(d.parentDept || ''); setDeptManager(d.managerId || ''); setDeptBU(d.businessUnit || ''); setDeptLoc(d.location || ''); setDeptCC(d.costCenter || ''); setDeptStatus(d.status); setShowDeptModal(true); }}>Edit</button>
                                <button className="btn btn-secondary" style={{ padding: '4px 8px', color: 'red' }} onClick={async () => { try { const res = await api.delete(`/org/departments/${d._id}`); showToast(res.data.message, 'success'); fetchDepartments(); } catch (err) { showToast(err.response?.data?.message || 'Error deleting department', 'error'); } }}>Delete</button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {filteredDepts.length === 0 && (
                      <tr>
                        <td colSpan={isHr ? 9 : 8} style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>No departments found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {deptSubTab === 'subdept' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            <div className="emp-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Sub-Departments Setup</h3>
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                      <th style={{ padding: '12px' }}>Sub-department Name</th>
                      <th style={{ padding: '12px' }}>Code</th>
                      <th style={{ padding: '12px' }}>Parent Department</th>
                      <th style={{ padding: '12px' }}>Manager Head</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      {isHr && <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {subDepartments.map(sd => (
                      <tr key={sd._id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.875rem' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{sd.name}</td>
                        <td style={{ padding: '12px' }}>{sd.code}</td>
                        <td style={{ padding: '12px' }}>{sd.parentDept}</td>
                        <td style={{ padding: '12px' }}>{getEmpById(sd.managerId)?.name || 'Unassigned'}</td>
                        <td style={{ padding: '12px' }}><span className={`badge ${sd.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{sd.status}</span></td>
                        {isHr && (
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => { setEditingSubDept(sd); setSubName(sd.name); setSubCode(sd.code); setSubParent(sd.parentDept); setSubManager(sd.managerId || ''); setSubStatus(sd.status); setShowSubDeptModal(true); }}>Edit</button>
                              <button className="btn btn-secondary" style={{ padding: '4px 8px', color: 'red' }} onClick={() => handleDeleteSubDept(sd._id)}>Delete</button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {subDepartments.length === 0 && (
                      <tr>
                        <td colSpan={isHr ? 6 : 5} style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>No sub-departments found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {deptSubTab === 'hierarchy' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {departments.map(d => {
              const hod = getEmpById(d.managerId);
              const deptEmps = employees.filter(e => e.dept === d.name);
              
              // Find HOD's direct reports within this department
              const directToHod = deptEmps.filter(e => e.teamLeadId === d.managerId);
              // Find other employees in department who report to someone else or no one
              const others = deptEmps.filter(e => e.id !== d.managerId && e.teamLeadId !== d.managerId);

              return (
                <div key={d._id} className="emp-card" style={{ padding: '24px', borderTop: '4px solid hsl(var(--primary))', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>{d.name}</h4>
                    <span className="badge badge-primary">{deptEmps.length} Employees</span>
                  </div>
                  
                  <div style={{ background: 'hsl(var(--bg-main))', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', fontWeight: 600, textTransform: 'uppercase' }}>Department Head (HOD)</div>
                    {hod ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                        <img src={hod.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <strong style={{ fontSize: '0.85rem', display: 'block' }}>{hod.name}</strong>
                          <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))' }}>ID: {hod.id} | {hod.designation || hod.role}</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '6px' }}>No HOD Assigned</div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 600, color: 'hsl(var(--text-secondary))', marginBottom: '8px' }}>Reporting Structure:</div>
                    {directToHod.length > 0 && (
                      <div style={{ borderLeft: '2px solid hsl(var(--border))', marginLeft: '6px', paddingLeft: '10px', marginBottom: '10px' }}>
                        <div style={{ fontSize: '0.72rem', color: 'hsl(var(--primary))', fontWeight: 600, marginBottom: '6px' }}>Direct Reports to HOD:</div>
                        {directToHod.map(e => (
                          <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                            <i className="fa-solid fa-angle-right" style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))' }}></i>
                            <span>{e.name} ({e.id}) - <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.75rem' }}>{e.designation || e.role}</span></span>
                          </div>
                        ))}
                      </div>
                    )}
                    {others.length > 0 && (
                      <div style={{ borderLeft: '2px solid hsl(var(--border))', marginLeft: '6px', paddingLeft: '10px' }}>
                        <div style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', fontWeight: 600, marginBottom: '6px' }}>Other Members:</div>
                        {others.map(e => {
                          const manager = getEmpById(e.teamLeadId);
                          return (
                            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                              <i className="fa-solid fa-circle-user" style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))' }}></i>
                              <span>
                                {e.name} ({e.id})
                                {manager && <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.75rem' }}> (Reports to {manager.name})</span>}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {directToHod.length === 0 && others.length === 0 && (
                      <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.75rem', fontStyle: 'italic' }}>No other department members found.</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Department Modal */}
      <Modal isOpen={showDeptModal} onClose={() => setShowDeptModal(false)} title={editingDept ? 'Modify Department' : 'Register Department'}>
        <form onSubmit={handleSaveDept} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label>Department Name*</label>
            <input type="text" className="form-control" value={deptName} onChange={e => setDeptName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Department Code*</label>
            <input type="text" className="form-control" value={deptCode} onChange={e => setDeptCode(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Parent Department</label>
            <select className="form-control" value={deptParent} onChange={e => setDeptParent(e.target.value)}>
              <option value="">None (Top Level)</option>
              {departments.filter(d => d.name !== deptName).map(d => (
                <option key={d._id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Department Head (HOD)</label>
            <select className="form-control" value={deptManager} onChange={e => setDeptManager(e.target.value)}>
              <option value="">Choose Head...</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Business Unit</label>
            <select className="form-control" value={deptBU} onChange={e => setDeptBU(e.target.value)}>
              <option value="">Choose BU...</option>
              {businessUnits.map(b => (
                <option key={b._id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Branch Location</label>
            <select className="form-control" value={deptLoc} onChange={e => setDeptLoc(e.target.value)}>
              <option value="">Choose Branch...</option>
              {branches.map(b => (
                <option key={b._id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Cost Center</label>
            <select className="form-control" value={deptCC} onChange={e => setDeptCC(e.target.value)}>
              <option value="">Choose Cost Center...</option>
              {costCenters.map(cc => (
                <option key={cc._id} value={cc.name}>{cc.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={deptStatus} onChange={e => setDeptStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingDept ? 'Update Department' : 'Register Department'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowDeptModal(false); setEditingDept(null); resetDeptForm(); }}>Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Sub-department Modal */}
      <Modal isOpen={showSubDeptModal} onClose={() => setShowSubDeptModal(false)} title={editingSubDept ? 'Modify Sub-department' : 'Register Sub-department'}>
        <form onSubmit={handleSaveSubDept} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label>Sub-department Name*</label>
            <input type="text" className="form-control" value={subName} onChange={e => setSubName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Sub-department Code*</label>
            <input type="text" className="form-control" value={subCode} onChange={e => setSubCode(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Parent Department*</label>
            <select className="form-control" value={subParent} onChange={e => setSubParent(e.target.value)} required>
              <option value="">Select Department...</option>
              {departments.map(d => (
                <option key={d._id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Assign Manager Head</label>
            <select className="form-control" value={subManager} onChange={e => setSubManager(e.target.value)}>
              <option value="">Choose Head...</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={subStatus} onChange={e => setSubStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingSubDept ? 'Update Sub-dept' : 'Register Sub-dept'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowSubDeptModal(false); setEditingSubDept(null); resetSubDeptForm(); }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentsPage;
