import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../api';
import SubmoduleHeader from './SubmoduleHeader';
import Modal from '../../components/Modal';

const ReportingMatrixPage = ({ mode }) => {
  const {
    employees,
    departments,
    reportingHistory,
    transferHistory,
    positions,
    vacancies,
    fetchEmployees,
    fetchDepartments,
    fetchReportingHistory,
    fetchTransferHistory,
    fetchPositions,
    fetchVacancies
  } = useContext(DataContext);

  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const isHr = mode === 'hr' || user?.role === 'hr';

  // --- Modal Open States ---
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);

  // --- Reporting Matrix States ---
  const [matrixEmpId, setMatrixEmpId] = useState('');
  const [matrixMgrId, setMatrixMgrId] = useState('');
  const [matrixFuncId, setMatrixFuncId] = useState('');
  const [secondaryMgrId, setSecondaryMgrId] = useState('');
  const [projectMgrId, setProjectMgrId] = useState('');
  const [hrMgrId, setHrMgrId] = useState('');
  const [mentorId, setMentorId] = useState('');
  const [buddyId, setBuddyId] = useState('');
  const [skipMgrId, setSkipMgrId] = useState('');
  const [escalationMgrId, setEscalationMgrId] = useState('');
  const [matrixIsLead, setMatrixIsLead] = useState(false);
  const [matrixEffDate, setMatrixEffDate] = useState('');
  const [matrixReason, setMatrixReason] = useState('');

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchReportingHistory();
    fetchTransferHistory();
    fetchPositions();
    fetchVacancies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEmpById = (id) => employees.find(e => e.id === id);

  const handleUpdateReporting = async (e) => {
    e.preventDefault();
    if (!matrixEmpId) return showToast('Please select target employee', 'error');
    try {
      await api.put('/org/reporting-manager', {
        employeeId: matrixEmpId,
        newManagerId: matrixMgrId,
        functionalManagerId: matrixFuncId,
        secondaryManagerId: secondaryMgrId,
        projectManagerId: projectMgrId,
        hrManagerId: hrMgrId,
        mentorId: mentorId,
        buddyId: buddyId,
        skipManagerId: skipMgrId,
        escalationManagerId: escalationMgrId,
        isTeamLead: matrixIsLead,
        effectiveDate: matrixEffDate,
        reason: matrixReason
      });
      showToast('Reporting relationships reassigned successfully', 'success');
      fetchEmployees();
      fetchReportingHistory();
      setMatrixEmpId(''); setMatrixMgrId(''); setMatrixFuncId(''); 
      setSecondaryMgrId(''); setProjectMgrId(''); setHrMgrId(''); 
      setMentorId(''); setBuddyId(''); setSkipMgrId(''); setEscalationMgrId('');
      setMatrixReason(''); setMatrixEffDate(''); setMatrixIsLead(false);
      setShowAssignModal(false);
    } catch (err) { 
      showToast(err.response?.data?.message || 'Error updating reporting lines', 'error'); 
    }
  };

  const headerActions = [
    ...(isHr ? [{
      label: 'Reassign Reporting Lines',
      onClick: () => setShowAssignModal(true),
      icon: 'fa-people-arrows'
    }] : []),
    {
      label: 'View Changes Log',
      onClick: () => setShowLogModal(true),
      icon: 'fa-history'
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <SubmoduleHeader 
        title="Reporting Structure & Matrix" 
        description="Reassign reporting structures, solid/dotted manager lines, and team lead flags."
        actions={headerActions}
        isHr={isHr}
      />

      {/* Overview Statistics Ribbon */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', minWidth: '150px' }}>
          <i className="fa-solid fa-folder-tree" style={{ color: 'hsl(var(--primary))' }}></i>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', display: 'block' }}>Total Departments</span>
            <strong style={{ fontSize: '1rem' }}>{departments.length}</strong>
          </div>
        </div>
        <div style={{ background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', minWidth: '150px' }}>
          <i className="fa-solid fa-users" style={{ color: 'hsl(var(--primary))' }}></i>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', display: 'block' }}>Total Employees</span>
            <strong style={{ fontSize: '1rem' }}>{employees.length}</strong>
          </div>
        </div>
        <div style={{ background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', minWidth: '150px' }}>
          <i className="fa-solid fa-user-tie" style={{ color: 'hsl(var(--primary))' }}></i>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', display: 'block' }}>Total Managers</span>
            <strong style={{ fontSize: '1rem' }}>{employees.filter(e => e.isTeamLead || employees.some(x => x.teamLeadId === e.id)).length}</strong>
          </div>
        </div>
        <div style={{ background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', minWidth: '150px' }}>
          <i className="fa-solid fa-chair" style={{ color: '#f43f5e' }}></i>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', display: 'block' }}>Vacant Positions</span>
            <strong style={{ fontSize: '1rem' }}>{positions.filter(p => p.status === 'Vacant' || p.status === 'Open').length}</strong>
          </div>
        </div>
        <div style={{ background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', minWidth: '150px' }}>
          <i className="fa-solid fa-clock-rotate-left" style={{ color: '#f59e0b' }}></i>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', display: 'block' }}>Pending Approvals</span>
            <strong style={{ fontSize: '1rem' }}>{vacancies.filter(v => v.status === 'Pending Approval' || v.status === 'Pending').length}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* Main Employee Matrix Table */}
        <div className="emp-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Current Reporting Mappings</h3>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px' }}>Employee ID</th>
                  <th style={{ padding: '12px' }}>Employee Name</th>
                  <th style={{ padding: '12px' }}>Department</th>
                  <th style={{ padding: '12px' }}>Reporting Manager (Primary Manager)</th>
                  <th style={{ padding: '12px' }}>Functional Manager</th>
                  <th style={{ padding: '12px' }}>Department Head</th>
                  <th style={{ padding: '12px' }}>Effective Date</th>
                  <th style={{ padding: '12px' }}>Role Type</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => {
                  const primaryMgr = getEmpById(emp.teamLeadId);
                  const funcMgr = getEmpById(emp.functionalManagerId);

                  // Department Head Lookup
                  const empDept = departments.find(d => d.name === emp.dept);
                  const hodEmp = empDept ? employees.find(e => e.id === empDept.managerId) : null;
                  const deptHeadStr = hodEmp ? `${hodEmp.name} (${hodEmp.id})` : 'Unassigned';

                  // Effective Date Lookup from reportingHistory
                  const latestChange = reportingHistory
                    .filter(h => h.employeeId === emp.id)
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                  const effDateStr = latestChange 
                    ? new Date(latestChange.effectiveDate).toLocaleDateString() 
                    : (emp.joined ? new Date(emp.joined).toLocaleDateString() : (emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : new Date().toLocaleDateString()));

                  return (
                    <tr key={emp.id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.9rem' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{emp.id}</td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{emp.name}</td>
                      <td style={{ padding: '12px' }}>{emp.dept}</td>
                      <td style={{ padding: '12px' }}>
                        {primaryMgr ? `${primaryMgr.name} (${primaryMgr.id})` : <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>Direct to Board</span>}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {funcMgr ? `${funcMgr.name} (${funcMgr.id})` : <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>None</span>}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 500 }}>
                        {deptHeadStr}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {effDateStr}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {emp.isManager ? (
                          <span className="badge badge-success">Team Lead / HOD</span>
                        ) : (
                          <span className="badge badge-secondary">Individual Contributor</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>No employees registered.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reassign Reporting Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Reassign Reporting relationships">
        <form onSubmit={handleUpdateReporting} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label>Select Target Employee*</label>
            <select className="form-control" value={matrixEmpId} onChange={e => { setMatrixEmpId(e.target.value); setMatrixMgrId(''); setMatrixFuncId(''); }} required>
              <option value="">Choose Employee...</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Primary Reporting Manager (Solid Line)*</label>
            <select className="form-control" value={matrixMgrId} onChange={e => setMatrixMgrId(e.target.value)}>
              <option value="">None (Top Level)</option>
              {employees.filter(e => e.id !== matrixEmpId).map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Functional Reporting Manager (Dotted Line)</label>
            <select className="form-control" value={matrixFuncId} onChange={e => setMatrixFuncId(e.target.value)}>
              <option value="">None</option>
              {employees.filter(e => e.id !== matrixEmpId).map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Secondary / Dotted-Line Manager</label>
            <select className="form-control" value={secondaryMgrId} onChange={e => setSecondaryMgrId(e.target.value)}>
              <option value="">None</option>
              {employees.filter(e => e.id !== matrixEmpId).map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Project Delivery Manager</label>
            <select className="form-control" value={projectMgrId} onChange={e => setProjectMgrId(e.target.value)}>
              <option value="">None</option>
              {employees.filter(e => e.id !== matrixEmpId).map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>HR Business Partner (HRBP)</label>
            <select className="form-control" value={hrMgrId} onChange={e => setHrMgrId(e.target.value)}>
              <option value="">None</option>
              {employees.filter(e => e.id !== matrixEmpId).map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Onboarding Buddy / Peer Mentor</label>
            <select className="form-control" value={buddyId} onChange={e => setBuddyId(e.target.value)}>
              <option value="">None</option>
              {employees.filter(e => e.id !== matrixEmpId).map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Professional Mentor</label>
            <select className="form-control" value={mentorId} onChange={e => setMentorId(e.target.value)}>
              <option value="">None</option>
              {employees.filter(e => e.id !== matrixEmpId).map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Skip-Level Manager (Validated)</label>
            <select className="form-control" value={skipMgrId} onChange={e => setSkipMgrId(e.target.value)}>
              <option value="">None</option>
              {employees.filter(e => e.id !== matrixEmpId).map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Escalation Contact Manager</label>
            <select className="form-control" value={escalationMgrId} onChange={e => setEscalationMgrId(e.target.value)}>
              <option value="">None</option>
              {employees.filter(e => e.id !== matrixEmpId).map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Effective Date*</label>
            <input type="date" className="form-control" value={matrixEffDate} onChange={e => setMatrixEffDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Change Reason*</label>
            <input type="text" className="form-control" value={matrixReason} onChange={e => setMatrixReason(e.target.value)} placeholder="e.g. Org restructure, departmental shift" required />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" id="matrixLeadCheck" checked={matrixIsLead} onChange={e => setMatrixIsLead(e.target.checked)} style={{ width: '18px', height: '18px' }} />
            <label htmlFor="matrixLeadCheck" style={{ margin: 0, fontWeight: 600 }}>Mark Employee as Team Lead / Manager</label>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Apply Reassignment</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowAssignModal(false); setMatrixEmpId(''); setMatrixMgrId(''); setMatrixFuncId(''); setMatrixReason(''); setMatrixEffDate(''); setMatrixIsLead(false); }}>Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Changes Log Modal */}
      <Modal isOpen={showLogModal} onClose={() => setShowLogModal(false)} title="Organization History Log (Reporting & Transfers)">
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {(() => {
            const combinedHistory = [
              ...reportingHistory.map(h => ({
                id: h._id || Math.random().toString(),
                employeeName: h.employeeName,
                employeeId: h.employeeId,
                title: 'Reporting Manager Shift',
                desc: `Manager: ${h.oldManagerId || 'None'} → ${h.newManagerId || 'None'}`,
                reason: h.reason,
                date: new Date(h.effectiveDate || h.createdAt)
              })),
              ...(transferHistory || []).map(t => ({
                id: t._id || Math.random().toString(),
                employeeName: t.employeeName,
                employeeId: t.employeeId,
                title: 'Department Transfer',
                desc: `Dept: ${t.oldDept || 'None'} → ${t.newDept || 'None'}`,
                reason: t.reason,
                date: new Date(t.effectiveDate || t.createdAt)
              }))
            ].sort((a, b) => b.date - a.date);

            return combinedHistory.length > 0 ? (
              combinedHistory.map(h => (
                <div key={h.id} style={{ fontSize: '0.85rem', borderBottom: '1px solid hsl(var(--border))', padding: '12px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{h.employeeName} ({h.employeeId})</strong>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{h.title}</span>
                  </div>
                  <div style={{ margin: '4px 0', fontWeight: 500 }}>{h.desc}</div>
                  <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem' }}>Reason: {h.reason || 'Restructuring'} | Effective Date: {h.date.toLocaleDateString()}</div>
                </div>
              ))
            ) : <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', textAlign: 'center', padding: '24px 0' }}>No organization change history records found.</p>;
          })()}
        </div>
      </Modal>
    </div>
  );
};

export default ReportingMatrixPage;
