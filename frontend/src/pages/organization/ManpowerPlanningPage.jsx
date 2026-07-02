import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../api';
import SubmoduleHeader from './SubmoduleHeader';
import Modal from '../../components/Modal';

const ManpowerPlanningPage = ({ mode }) => {
  const {
    vacancies,
    departments,
    employees,
    fetchVacancies,
    fetchDepartments,
    fetchEmployees
  } = useContext(DataContext);

  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const isHr = mode === 'hr' || user?.role === 'hr';

  // --- Modal Open State ---
  const [showModal, setShowModal] = useState(false);

  // --- Vacancies States ---
  const [vacTitle, setVacTitle] = useState('');
  const [vacDept, setVacDept] = useState('');
  const [vacManager, setVacManager] = useState('');
  const [vacBudget, setVacBudget] = useState(0);
  const [vacDesc, setVacDesc] = useState('');
  const [vacPriority, setVacPriority] = useState('Medium');
  const [vacReqDate, setVacReqDate] = useState('');
  const [vacReason, setVacReason] = useState('');
  const [vacHeadcount, setVacHeadcount] = useState(1);
  const [editingVac, setEditingVac] = useState(null);

  useEffect(() => {
    fetchVacancies();
    fetchDepartments();
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveVacancy = async (e) => {
    e.preventDefault();
    if (!vacTitle || !vacDept) return showToast('Job title and department are required', 'error');
    const payload = {
      jobTitle: vacTitle,
      dept: vacDept,
      managerId: vacManager || undefined,
      budget: Number(vacBudget),
      description: vacDesc,
      priorityLevel: vacPriority,
      requiredDate: vacReqDate ? new Date(vacReqDate) : undefined,
      vacancyReason: vacReason,
      approvedHeadcount: Number(vacHeadcount)
    };
    try {
      if (editingVac) {
        await api.put(`/org/vacancies/${editingVac._id}`, payload);
        showToast('Manpower request updated successfully', 'success');
      } else {
        await api.post('/org/vacancies', payload);
        showToast('Manpower request raised successfully', 'success');
      }
      fetchVacancies();
      setEditingVac(null);
      resetVacancyForm();
      setShowModal(false);
    } catch (err) { 
      showToast(err.response?.data?.message || 'Failed to save manpower request', 'error'); 
    }
  };

  const resetVacancyForm = () => {
    setVacTitle(''); setVacDept(''); setVacManager(''); setVacBudget(0); setVacDesc(''); setVacPriority('Medium'); setVacReqDate(''); setVacReason(''); setVacHeadcount(1);
  };

  const handleApproveVacancy = async (id, comments) => {
    try {
      await api.put(`/org/vacancies/${id}/approve`, { comments });
      showToast('Vacancy approved successfully', 'success');
      fetchVacancies();
    } catch (err) { 
      showToast(err.response?.data?.message || 'Failed to approve vacancy', 'error'); 
    }
  };

  const handleRejectVacancy = async (id, comments) => {
    try {
      await api.put(`/org/vacancies/${id}/reject`, { comments });
      showToast('Vacancy rejected successfully', 'success');
      fetchVacancies();
    } catch (err) { 
      showToast(err.response?.data?.message || 'Failed to reject vacancy', 'error'); 
    }
  };

  const handleDeleteVacancy = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vacancy request?')) return;
    try {
      await api.delete(`/org/vacancies/${id}`);
      showToast('Vacancy request deleted successfully', 'success');
      fetchVacancies();
    } catch (err) { 
      showToast(err.response?.data?.message || 'Failed to delete vacancy request', 'error'); 
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <SubmoduleHeader 
        title="Manpower Planning" 
        description="Raise manpower headcount requests, track vacancies, and manage HR approvals."
        actionLabel="Raise Request"
        onActionClick={() => {
          setEditingVac(null);
          resetVacancyForm();
          setShowModal(true);
        }}
        isHr={isHr}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <div className="emp-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Manpower Planning & Headcount Requests</h3>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px' }}>Pos ID / Job Title</th>
                  <th style={{ padding: '12px' }}>Department</th>
                  <th style={{ padding: '12px' }}>Limit</th>
                  <th style={{ padding: '12px' }}>Priority</th>
                  <th style={{ padding: '12px' }}>Target Date</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Approvals History</th>
                  {isHr && <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {vacancies.map(v => (
                  <tr key={v._id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.875rem' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600 }}>{v.positionId}</div>
                      <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>{v.jobTitle}</div>
                    </td>
                    <td style={{ padding: '12px' }}>{v.dept}</td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{v.approvedHeadcount}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${
                        v.priorityLevel === 'Critical' ? 'badge-danger' :
                        v.priorityLevel === 'High' ? 'badge-warning' :
                        v.priorityLevel === 'Medium' ? 'badge-primary' : 'badge-info'
                      }`}>{v.priorityLevel}</span>
                    </td>
                    <td style={{ padding: '12px' }}>{v.requiredDate ? new Date(v.requiredDate).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${
                        v.status === 'Open' ? 'badge-success' :
                        v.status === 'Pending Approval' ? 'badge-warning' : 'badge-danger'
                      }`}>{v.status}</span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                      {v.approvals && v.approvals.length > 0 ? (
                        v.approvals.map((app, i) => (
                          <div key={i} style={{ borderBottom: '1px dashed hsl(var(--border))', paddingBottom: '2px', marginBottom: '2px' }}>
                            <strong>{app.approverName}</strong>: {app.status}
                            {app.comments && <div style={{ fontStyle: 'italic' }}>"{app.comments}"</div>}
                          </div>
                        ))
                      ) : 'No approvals recorded'}
                    </td>
                    {isHr && (
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {v.status === 'Pending Approval' && (
                            <>
                              <button className="btn btn-secondary" style={{ padding: '4px 8px', color: 'green' }} onClick={() => {
                                const comment = window.prompt('Enter verification / approval comments:');
                                if (comment !== null) handleApproveVacancy(v._id, comment);
                              }}>Approve</button>
                              <button className="btn btn-secondary" style={{ padding: '4px 8px', color: 'orange' }} onClick={() => {
                                const comment = window.prompt('Enter rejection reason comments:');
                                if (comment !== null) handleRejectVacancy(v._id, comment);
                              }}>Reject</button>
                            </>
                          )}
                          <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => {
                            setEditingVac(v);
                            setVacTitle(v.jobTitle);
                            setVacDept(v.dept);
                            setVacManager(v.managerId || '');
                            setVacBudget(v.budget || 0);
                            setVacDesc(v.description || '');
                            setVacPriority(v.priorityLevel || 'Medium');
                            setVacReqDate(v.requiredDate ? v.requiredDate.substring(0,10) : '');
                            setVacReason(v.vacancyReason || '');
                            setVacHeadcount(v.approvedHeadcount || 1);
                            setShowModal(true);
                          }}>Edit</button>
                          <button className="btn btn-secondary" style={{ padding: '4px 8px', color: 'red' }} onClick={() => handleDeleteVacancy(v._id)}>Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {vacancies.length === 0 && (
                  <tr>
                    <td colSpan={isHr ? 8 : 7} style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>No manpower requests or vacancies registered.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Raise / Modify Request Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingVac ? 'Modify Headcount Request' : 'Raise Headcount Request'}>
        <form onSubmit={handleSaveVacancy} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label>Job Title*</label>
            <input type="text" className="form-control" value={vacTitle} onChange={e => setVacTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Department*</label>
            <select className="form-control" value={vacDept} onChange={e => setVacDept(e.target.value)} required>
              <option value="">Select Department...</option>
              {departments.map(d => (
                <option key={d._id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Assign Hiring Manager</label>
            <select className="form-control" value={vacManager} onChange={e => setVacManager(e.target.value)}>
              <option value="">Select Manager...</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label>Approved Headcount*</label>
              <input type="number" className="form-control" value={vacHeadcount} onChange={e => setVacHeadcount(Number(e.target.value))} min={1} required />
            </div>
            <div className="form-group">
              <label>Priority Level</label>
              <select className="form-control" value={vacPriority} onChange={e => setVacPriority(e.target.value)}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label>Required Date</label>
              <input type="date" className="form-control" value={vacReqDate} onChange={e => setVacReqDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Budget Plan ($)</label>
              <input type="number" className="form-control" value={vacBudget} onChange={e => setVacBudget(Number(e.target.value))} />
            </div>
          </div>
          <div className="form-group">
            <label>Business / Vacancy Reason*</label>
            <input type="text" className="form-control" value={vacReason} onChange={e => setVacReason(e.target.value)} placeholder="e.g. Workload increase, new client project" required />
          </div>
          <div className="form-group">
            <label>Job Description / Skills</label>
            <textarea className="form-control" value={vacDesc} onChange={e => setVacDesc(e.target.value)} rows={3} placeholder="Describe requirements..."></textarea>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingVac ? 'Update Request' : 'Raise Request'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingVac(null); resetVacancyForm(); }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManpowerPlanningPage;
