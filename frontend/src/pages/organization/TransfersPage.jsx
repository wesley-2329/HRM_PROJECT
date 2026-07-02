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
    fetchEmployees,
    fetchDepartments,
    fetchDesignations,
    fetchGradeBands,
    fetchTransferHistory,
    fetchDesignationHistory
  } = useContext(DataContext);

  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const isHr = mode === 'hr' || user?.role === 'hr';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Department Transfers Log */}
        <div className="emp-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>Department Transfers History</h3>
          <div style={{ flex: 1, maxHeight: '550px', overflowY: 'auto' }}>
            {transferHistory.length > 0 ? (
              transferHistory.map(h => (
                <div key={h._id} style={{ fontSize: '0.875rem', borderBottom: '1px solid hsl(var(--border))', padding: '12px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                    <span>{h.employeeName}</span>
                    <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>Dept Shift</span>
                  </div>
                  <div style={{ marginTop: '4px', color: 'hsl(var(--text-primary))' }}>
                    <strong>{h.oldDept || 'None'}</strong> &rarr; <strong>{h.newDept}</strong>
                  </div>
                  <div style={{ color: 'hsl(var(--text-secondary))', marginTop: '6px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Reason: {h.reason}</span>
                    <span>Effective: {new Date(h.effectiveDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', padding: '24px 0', textAlign: 'center' }}>No department transfers registered.</p>
            )}
          </div>
        </div>

        {/* Designation Promotions Log */}
        <div className="emp-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>Designation Promotions History</h3>
          <div style={{ flex: 1, maxHeight: '550px', overflowY: 'auto' }}>
            {designationHistory.length > 0 ? (
              designationHistory.map(h => (
                <div key={h._id} style={{ fontSize: '0.875rem', borderBottom: '1px solid hsl(var(--border))', padding: '12px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                    <span>{h.employeeName}</span>
                    <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>Promotion</span>
                  </div>
                  <div style={{ marginTop: '4px', color: 'hsl(var(--text-primary))' }}>
                    <strong>{h.oldDesignation || 'None'}</strong> &rarr; <strong>{h.newDesignation}</strong> {h.newGrade && `(Grade: ${h.newGrade})`}
                  </div>
                  <div style={{ color: 'hsl(var(--text-secondary))', marginTop: '6px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Reason: {h.reason}</span>
                    <span>Effective: {new Date(h.effectiveDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', padding: '24px 0', textAlign: 'center' }}>No designations promotions registered.</p>
            )}
          </div>
        </div>
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
