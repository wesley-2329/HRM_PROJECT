import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../api';
import SubmoduleHeader from './SubmoduleHeader';
import Modal from '../../components/Modal';

const CompanySetupPage = ({ mode }) => {
  const {
    companies,
    businessUnits,
    costCenters,
    fetchCompanies,
    fetchBusinessUnits,
    fetchCostCenters
  } = useContext(DataContext);

  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const isHr = mode === 'hr' || user?.role === 'hr';
  const location = useLocation();
  const navigate = useNavigate();

  // --- Sub-tab Selector based on Path ---
  let compSubTab = 'profile';
  if (location.pathname === '/organization/company/business-units') {
    compSubTab = 'bu';
  } else if (location.pathname === '/organization/company/cost-centers') {
    compSubTab = 'cc';
  }

  // --- Modal Visibility States ---
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showBUModal, setShowBUModal] = useState(false);
  const [showCCModal, setShowCCModal] = useState(false);

  // --- Company Setup States ---
  const [compName, setCompName] = useState('');
  const [compCode, setCompCode] = useState('');
  const [compLogo, setCompLogo] = useState('');
  const [compType, setCompType] = useState('');
  const [compStatus, setCompStatus] = useState('Active');
  const [editingComp, setEditingComp] = useState(null);

  // --- Business Units States ---
  const [buName, setBuName] = useState('');
  const [buCode, setBuCode] = useState('');
  const [buStatus, setBuStatus] = useState('Active');
  const [editingBu, setEditingBu] = useState(null);

  // --- Cost Centers States ---
  const [ccName, setCcName] = useState('');
  const [ccCode, setCcCode] = useState('');
  const [ccStatus, setCcStatus] = useState('Active');
  const [editingCc, setEditingCc] = useState(null);

  // Fetch data on load
  useEffect(() => {
    fetchCompanies();
    fetchBusinessUnits();
    fetchCostCenters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Company Submit Handlers ---
  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!compName || !compCode) return showToast('Name and code are required', 'error');
    const payload = { name: compName, code: compCode, logo: compLogo, businessType: compType, status: compStatus };
    try {
      if (editingComp) {
        await api.put(`/org/companies/${editingComp._id}`, payload);
        showToast('Company updated successfully', 'success');
      } else {
        await api.post('/org/companies', payload);
        showToast('Company registered successfully', 'success');
      }
      fetchCompanies();
      setEditingComp(null);
      resetCompanyForm();
      setShowCompanyModal(false);
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save company', 'error'); }
  };

  const resetCompanyForm = () => {
    setCompName(''); setCompCode(''); setCompLogo(''); setCompType(''); setCompStatus('Active');
  };

  // --- Business Units Handlers ---
  const handleSaveBU = async (e) => {
    e.preventDefault();
    if (!buName || !buCode) return showToast('Name and code are required', 'error');
    const payload = { name: buName, code: buCode, status: buStatus };
    try {
      if (editingBu) {
        await api.put(`/org/business-units/${editingBu._id}`, payload);
        showToast('Business Unit updated successfully', 'success');
      } else {
        await api.post('/org/business-units', payload);
        showToast('Business Unit registered successfully', 'success');
      }
      fetchBusinessUnits();
      setEditingBu(null);
      resetBUForm();
      setShowBUModal(false);
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save Business Unit', 'error'); }
  };

  const resetBUForm = () => {
    setBuName(''); setBuCode(''); setBuStatus('Active');
  };

  const handleDeleteBU = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Business Unit?')) return;
    try {
      await api.delete(`/org/business-units/${id}`);
      showToast('Business Unit deleted successfully', 'success');
      fetchBusinessUnits();
    } catch (err) { showToast(err.response?.data?.message || 'Failed to delete Business Unit', 'error'); }
  };

  // --- Cost Centers Handlers ---
  const handleSaveCC = async (e) => {
    e.preventDefault();
    if (!ccName || !ccCode) return showToast('Name and code are required', 'error');
    const payload = { name: ccName, code: ccCode, status: ccStatus };
    try {
      if (editingCc) {
        await api.put(`/org/cost-centers/${editingCc._id}`, payload);
        showToast('Cost Center updated successfully', 'success');
      } else {
        await api.post('/org/cost-centers', payload);
        showToast('Cost Center registered successfully', 'success');
      }
      fetchCostCenters();
      setEditingCc(null);
      resetCCForm();
      setShowCCModal(false);
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save Cost Center', 'error'); }
  };

  const resetCCForm = () => {
    setCcName(''); setCcCode(''); setCcStatus('Active');
  };

  const handleDeleteCC = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Cost Center?')) return;
    try {
      await api.delete(`/org/cost-centers/${id}`);
      showToast('Cost Center deleted successfully', 'success');
      fetchCostCenters();
    } catch (err) { showToast(err.response?.data?.message || 'Failed to delete Cost Center', 'error'); }
  };

  // Get action details based on active tab
  const getHeaderActionProps = () => {
    if (compSubTab === 'profile') {
      return {
        actionLabel: 'Register Company',
        onActionClick: () => {
          setEditingComp(null);
          resetCompanyForm();
          setShowCompanyModal(true);
        }
      };
    } else if (compSubTab === 'bu') {
      return {
        actionLabel: 'Add Business Unit',
        onActionClick: () => {
          setEditingBu(null);
          resetBUForm();
          setShowBUModal(true);
        }
      };
    } else {
      return {
        actionLabel: 'Add Cost Center',
        onActionClick: () => {
          setEditingCc(null);
          resetCCForm();
          setShowCCModal(true);
        }
      };
    }
  };

  const actionProps = getHeaderActionProps();

  return (
    <div style={{ padding: '24px' }}>
      <SubmoduleHeader 
        title="Company Setup" 
        description="Configure company master profiles, business units, and operational cost centers."
        actionLabel={actionProps.actionLabel}
        onActionClick={actionProps.onActionClick}
        isHr={isHr}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Sub Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid hsl(var(--border))', marginBottom: '8px' }}>
          {[
            { id: 'profile', label: 'Company Profile', icon: 'fa-building-user', route: '/organization/company' },
            { id: 'bu', label: 'Business Units', icon: 'fa-briefcase', route: '/organization/company/business-units' },
            { id: 'cc', label: 'Cost Centers', icon: 'fa-coins', route: '/organization/company/cost-centers' }
          ].map(tab => {
            const isActive = compSubTab === tab.id;
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

        {compSubTab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            <div className="emp-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Company Master Profiles</h3>
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                      <th style={{ padding: '12px' }}>Company Name</th>
                      <th style={{ padding: '12px' }}>Code</th>
                      <th style={{ padding: '12px' }}>Business Type</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      {isHr && <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map(c => (
                      <tr key={c._id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.9rem' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {c.logo && <img src={c.logo} alt="" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />}
                            {c.name}
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>{c.code}</td>
                        <td style={{ padding: '12px' }}>{c.businessType || 'General'}</td>
                        <td style={{ padding: '12px' }}><span className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{c.status}</span></td>
                        {isHr && (
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => { setEditingComp(c); setCompName(c.name); setCompCode(c.code); setCompLogo(c.logo); setCompType(c.businessType || ''); setCompStatus(c.status); setShowCompanyModal(true); }}>
                                Edit
                              </button>
                              <button className="btn btn-secondary" style={{ padding: '4px 8px', color: 'red' }} onClick={async () => { if (window.confirm('Delete company?')) { await api.delete(`/org/companies/${c._id}`); fetchCompanies(); } }}>
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {companies.length === 0 && (
                      <tr>
                        <td colSpan={isHr ? 5 : 4} style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>No company profiles found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {compSubTab === 'bu' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            <div className="emp-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Business Units Setup</h3>
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                      <th style={{ padding: '12px' }}>Business Unit Name</th>
                      <th style={{ padding: '12px' }}>Code</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      {isHr && <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {businessUnits.map(bu => (
                      <tr key={bu._id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.9rem' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{bu.name}</td>
                        <td style={{ padding: '12px' }}>{bu.code}</td>
                        <td style={{ padding: '12px' }}><span className={`badge ${bu.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{bu.status}</span></td>
                        {isHr && (
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => { setEditingBu(bu); setBuName(bu.name); setBuCode(bu.code); setBuStatus(bu.status); setShowBUModal(true); }}>
                                Edit
                              </button>
                              <button className="btn btn-secondary" style={{ padding: '4px 8px', color: 'red' }} onClick={() => handleDeleteBU(bu._id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {businessUnits.length === 0 && (
                      <tr>
                        <td colSpan={isHr ? 4 : 3} style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>No business units found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {compSubTab === 'cc' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            <div className="emp-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Cost Centers Setup</h3>
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                      <th style={{ padding: '12px' }}>Cost Center Name</th>
                      <th style={{ padding: '12px' }}>Code</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      {isHr && <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {costCenters.map(cc => (
                      <tr key={cc._id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.9rem' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{cc.name}</td>
                        <td style={{ padding: '12px' }}>{cc.code}</td>
                        <td style={{ padding: '12px' }}><span className={`badge ${cc.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{cc.status}</span></td>
                        {isHr && (
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => { setEditingCc(cc); setCcName(cc.name); setCcCode(cc.code); setCcStatus(cc.status); setShowCCModal(true); }}>
                                Edit
                              </button>
                              <button className="btn btn-secondary" style={{ padding: '4px 8px', color: 'red' }} onClick={() => handleDeleteCC(cc._id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {costCenters.length === 0 && (
                      <tr>
                        <td colSpan={isHr ? 4 : 3} style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>No cost centers found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Register / Edit Company Modal */}
      <Modal isOpen={showCompanyModal} onClose={() => setShowCompanyModal(false)} title={editingComp ? 'Modify Company Profile' : 'Register New Company'}>
        <form onSubmit={handleSaveCompany} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label>Company Name*</label>
            <input type="text" className="form-control" value={compName} onChange={e => setCompName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Company Code*</label>
            <input type="text" className="form-control" value={compCode} onChange={e => setCompCode(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Business Logo URL</label>
            <input type="text" className="form-control" value={compLogo} onChange={e => setCompLogo(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Business Type</label>
            <input type="text" className="form-control" value={compType} onChange={e => setCompType(e.target.value)} placeholder="e.g. IT Services, Logistics" />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={compStatus} onChange={e => setCompStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingComp ? 'Update Profile' : 'Register Company'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowCompanyModal(false); setEditingComp(null); resetCompanyForm(); }}>Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Register / Edit Business Unit Modal */}
      <Modal isOpen={showBUModal} onClose={() => setShowBUModal(false)} title={editingBu ? 'Modify Business Unit' : 'Create Business Unit'}>
        <form onSubmit={handleSaveBU} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label>Business Unit Name*</label>
            <input type="text" className="form-control" value={buName} onChange={e => setBuName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Business Unit Code*</label>
            <input type="text" className="form-control" value={buCode} onChange={e => setBuCode(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={buStatus} onChange={e => setBuStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingBu ? 'Update Unit' : 'Create Unit'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowBUModal(false); setEditingBu(null); resetBUForm(); }}>Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Register / Edit Cost Center Modal */}
      <Modal isOpen={showCCModal} onClose={() => setShowCCModal(false)} title={editingCc ? 'Modify Cost Center' : 'Create Cost Center'}>
        <form onSubmit={handleSaveCC} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label>Cost Center Name*</label>
            <input type="text" className="form-control" value={ccName} onChange={e => setCcName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Cost Center Code*</label>
            <input type="text" className="form-control" value={ccCode} onChange={e => setCcCode(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={ccStatus} onChange={e => setCcStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingCc ? 'Update Center' : 'Create Center'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowCCModal(false); setEditingCc(null); resetCCForm(); }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CompanySetupPage;
