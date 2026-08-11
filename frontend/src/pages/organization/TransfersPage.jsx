import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../api';
import SubmoduleHeader from './SubmoduleHeader';
import Modal from '../../components/Modal';

const TransfersPage = ({ mode }) => {
  const {
    employees,
    departments,
    designations,
    gradeBands,
    transferHistory,
    designationHistory,
    reportingHistory,
    fetchEmployees,
    fetchDepartments,
    fetchDesignations,
    fetchGradeBands,
    fetchTransferHistory,
    fetchDesignationHistory,
    fetchReportingHistory
  } = useContext(DataContext);

  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const isHr = mode === 'hr' || user?.role === 'hr';

  // --- Sub Tab State ---
  const [transSubTab, setTransSubTab] = useState('dept');

  // --- Modal Visibility States ---
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);

  // --- Transfers & Promotion States ---
  const [transEmpId, setTransEmpId] = useState('');
  const [transDept, setTransDept] = useState('');
  const [transEffDate, setTransEffDate] = useState('');
  const [transReason, setTransReason] = useState('');

  const [promoEmpId, setPromoEmpId] = useState('');
  const [promoDesg, setPromoDesg] = useState('');
  const [promoGrade, setPromoGrade] = useState('');
  const [promoEffDate, setPromoEffDate] = useState('');
  const [promoReason, setPromoReason] = useState('');

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchDesignations();
    fetchGradeBands();
    fetchTransferHistory();
    fetchDesignationHistory();
    fetchReportingHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEmpById = (id) => employees.find(e => e.id === id);

  const handleDeptTransfer = async (e) => {
    e.preventDefault();
    if (!transEmpId || !transDept) return showToast('Employee and new department are required', 'error');
    try {
      await api.put('/org/department-transfer', {
        employeeId: transEmpId,
        newDept: transDept,
        effectiveDate: transEffDate,
        reason: transReason
      });
      showToast('Department transfer processed successfully', 'success');
      fetchEmployees();
      fetchTransferHistory();
      setTransEmpId(''); setTransDept(''); setTransReason(''); setTransEffDate('');
      setShowTransferModal(false);
    } catch (err) { 
      showToast(err.response?.data?.message || 'Error processing transfer', 'error'); 
    }
  };

  const handlePromoTransfer = async (e) => {
    e.preventDefault();
    if (!promoEmpId || !promoDesg) return showToast('Employee and new designation are required', 'error');
    try {
      await api.put('/org/designation-transfer', {
        employeeId: promoEmpId,
        newDesignation: promoDesg,
        newGrade: promoGrade,
        effectiveDate: promoEffDate,
        reason: promoReason
      });
      showToast('Designation role movement processed successfully', 'success');
      fetchEmployees();
      fetchDesignationHistory();
      setPromoEmpId(''); setPromoDesg(''); setPromoGrade(''); setPromoReason(''); setPromoEffDate('');
      setShowPromoModal(false);
    } catch (err) { 
      showToast(err.response?.data?.message || 'Error processing role assignment', 'error'); 
    }
  };

  const headerActions = isHr ? [
    {
      label: 'Initiate Transfer',
      onClick: () => setShowTransferModal(true),
      icon: 'fa-exchange-alt'
    },
    {
      label: 'Initiate Promotion',
      onClick: () => setShowPromoModal(true),
      icon: 'fa-arrow-trend-up'
    }
  ] : [];

  return (
    <div style={{ padding: '24px' }}>
      <SubmoduleHeader 
        title="Transfers & History" 
        description="Process departmental transfers and track employee career movement logs."
        actions={headerActions}
        isHr={isHr}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Sub Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid hsl(var(--border))', marginBottom: '8px' }}>
          {[
            { id: 'dept', label: 'Department Transfers', icon: 'fa-exchange-alt' },
            { id: 'reporting', label: 'Reporting Manager History', icon: 'fa-people-arrows' },
            { id: 'promo', label: 'Designations & Promotions', icon: 'fa-arrow-trend-up' }
          ].map(tab => {
            const isActive = transSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTransSubTab(tab.id)}
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

        {/* Tab 1: Department Transfers Table */}
        {transSubTab === 'dept' && (
          <div className="emp-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.20rem', fontWeight: 700, marginBottom: '16px' }}>Department Transfers History</h3>
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                    <th style={{ padding: '12px' }}>Employee ID</th>
                    <th style={{ padding: '12px' }}>Employee Name</th>
                    <th style={{ padding: '12px' }}>Previous Department</th>
                    <th style={{ padding: '12px' }}>New Department</th>
                    <th style={{ padding: '12px' }}>Change Date</th>
                    <th style={{ padding: '12px' }}>Change Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {transferHistory.map(h => (
                    <tr key={h._id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.9rem' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{h.employeeId}</td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{h.employeeName}</td>
                      <td style={{ padding: '12px', color: 'hsl(var(--text-secondary))' }}>{h.oldDept || 'None'}</td>
                      <td style={{ padding: '12px', fontWeight: 600, color: 'hsl(var(--primary))' }}>{h.newDept}</td>
                      <td style={{ padding: '12px' }}>{new Date(h.effectiveDate).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>{h.reason}</td>
                    </tr>
                  ))}
                  {transferHistory.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>No department transfers registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Reporting Manager History Table */}
        {transSubTab === 'reporting' && (
          <div className="emp-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.20rem', fontWeight: 700, marginBottom: '16px' }}>Reporting Manager Assignment History</h3>
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                    <th style={{ padding: '12px' }}>Employee ID</th>
                    <th style={{ padding: '12px' }}>Employee Name</th>
                    <th style={{ padding: '12px' }}>Previous Primary Manager</th>
                    <th style={{ padding: '12px' }}>New Primary Manager</th>
                    <th style={{ padding: '12px' }}>Previous Functional Manager</th>
                    <th style={{ padding: '12px' }}>New Functional Manager</th>
                    <th style={{ padding: '12px' }}>Change Date</th>
                    <th style={{ padding: '12px' }}>Change Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {reportingHistory.map(h => {
                    const prevMgr = getEmpById(h.oldManagerId);
                    const newMgr = getEmpById(h.newManagerId);
                    const prevFunc = getEmpById(h.oldFunctionalManagerId);
                    const newFunc = getEmpById(h.newFunctionalManagerId);
                    
                    return (
                      <tr key={h._id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.9rem' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{h.employeeId}</td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{h.employeeName}</td>
                        <td style={{ padding: '12px', color: 'hsl(var(--text-secondary))' }}>
                          {prevMgr ? `${prevMgr.name} (${prevMgr.id})` : (h.oldManagerId || 'None')}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>
                          {newMgr ? `${newMgr.name} (${newMgr.id})` : (h.newManagerId || 'None')}
                        </td>
                        <td style={{ padding: '12px', color: 'hsl(var(--text-secondary))' }}>
                          {prevFunc ? `${prevFunc.name} (${prevFunc.id})` : (h.oldFunctionalManagerId || 'None')}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>
                          {newFunc ? `${newFunc.name} (${newFunc.id})` : (h.newFunctionalManagerId || 'None')}
                        </td>
                        <td style={{ padding: '12px' }}>{new Date(h.effectiveDate).toLocaleDateString()}</td>
                        <td style={{ padding: '12px' }}>{h.reason}</td>
                      </tr>
                    );
                  })}
                  {reportingHistory.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>No reporting manager movements registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Designation & Promotion Table */}
        {transSubTab === 'promo' && (
          <div className="emp-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.20rem', fontWeight: 700, marginBottom: '16px' }}>Designation Promotions History</h3>
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                    <th style={{ padding: '12px' }}>Employee ID</th>
                    <th style={{ padding: '12px' }}>Employee Name</th>
                    <th style={{ padding: '12px' }}>Previous Designation</th>
                    <th style={{ padding: '12px' }}>New Designation</th>
                    <th style={{ padding: '12px' }}>Previous Grade</th>
                    <th style={{ padding: '12px' }}>New Grade</th>
                    <th style={{ padding: '12px' }}>Change Date</th>
                    <th style={{ padding: '12px' }}>Change Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {designationHistory.map(h => (
                    <tr key={h._id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.9rem' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{h.employeeId}</td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{h.employeeName}</td>
                      <td style={{ padding: '12px', color: 'hsl(var(--text-secondary))' }}>{h.oldDesignation || 'None'}</td>
                      <td style={{ padding: '12px', fontWeight: 600, color: 'hsl(var(--primary))' }}>{h.newDesignation}</td>
                      <td style={{ padding: '12px', color: 'hsl(var(--text-secondary))' }}>{h.oldGrade || 'None'}</td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{h.newGrade || 'None'}</td>
                      <td style={{ padding: '12px' }}>{new Date(h.effectiveDate).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>{h.reason}</td>
                    </tr>
                  ))}
                  {designationHistory.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>No designations promotions registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Dept Transfer Modal */}
      <Modal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} title="Initiate Department Transfer">
        <form onSubmit={handleDeptTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label>Select Target Employee*</label>
            <select className="form-control" value={transEmpId} onChange={e => setTransEmpId(e.target.value)} required>
              <option value="">Choose Employee...</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Select New Department*</label>
            <select className="form-control" value={transDept} onChange={e => setTransDept(e.target.value)} required>
              <option value="">Choose Department...</option>
              {departments.map(d => (
                <option key={d._id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Effective Date*</label>
            <input type="date" className="form-control" value={transEffDate} onChange={e => setTransEffDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Transfer Reason*</label>
            <input type="text" className="form-control" value={transReason} onChange={e => setTransReason(e.target.value)} placeholder="e.g. Relocation, Project allocation" required />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Transfer</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowTransferModal(false); setTransEmpId(''); setTransDept(''); setTransReason(''); setTransEffDate(''); }}>Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Designation Promotion Modal */}
      <Modal isOpen={showPromoModal} onClose={() => setShowPromoModal(false)} title="Initiate Designation Promotion">
        <form onSubmit={handlePromoTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label>Select Target Employee*</label>
            <select className="form-control" value={promoEmpId} onChange={e => setPromoEmpId(e.target.value)} required>
              <option value="">Choose Employee...</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>New Designation Mapping*</label>
            <select className="form-control" value={promoDesg} onChange={e => setPromoDesg(e.target.value)} required>
              <option value="">Choose Designation...</option>
              {designations.map(d => (
                <option key={d._id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>New Grade Mapping</label>
            <select className="form-control" value={promoGrade} onChange={e => setPromoGrade(e.target.value)}>
              <option value="">Choose Grade...</option>
              {gradeBands.map(gb => (
                <option key={gb._id} value={gb.name}>{gb.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Effective Date*</label>
            <input type="date" className="form-control" value={promoEffDate} onChange={e => setPromoEffDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Promotion Reason*</label>
            <input type="text" className="form-control" value={promoReason} onChange={e => setPromoReason(e.target.value)} placeholder="e.g. Annual appraisal, Meritorious performance" required />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Process Promotion</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowPromoModal(false); setPromoEmpId(''); setPromoDesg(''); setPromoGrade(''); setPromoReason(''); setPromoEffDate(''); }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TransfersPage;
