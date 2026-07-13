import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../api';
import SubmoduleHeader from './SubmoduleHeader';
import Modal from '../../components/Modal';

const VacancyMappingPage = ({ mode }) => {
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

  // --- Modal States ---
  const [showModal, setShowModal] = useState(false);
  const [editingVac, setEditingVac] = useState(null);

  // --- Form States ---
  const [vacTitle, setVacTitle] = useState('');
  const [vacDept, setVacDept] = useState('');
  const [vacManager, setVacManager] = useState('');
  const [vacBudget, setVacBudget] = useState(0);
  const [vacPriority, setVacPriority] = useState('Medium');
  const [vacCount, setVacCount] = useState(1);
  const [vacFilledCount, setVacFilledCount] = useState(0);
  const [vacStatus, setVacStatus] = useState('Open');
  const [vacDesc, setVacDesc] = useState('');
  const [vacReason, setVacReason] = useState('New Position Request');

  useEffect(() => {
    fetchVacancies();
    fetchDepartments();
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEmpById = (id) => employees.find(e => e.id === id);

  const handleSaveVacancy = async (e) => {
    e.preventDefault();
    if (!vacTitle || !vacDept) return showToast('Job Title and Department are required', 'error');

    const payload = {
      jobTitle: vacTitle,
      dept: vacDept,
      managerId: vacManager,
      budget: Number(vacBudget),
      priorityLevel: vacPriority,
      approvedHeadcount: Number(vacCount),
      vacancyCount: Number(vacCount),
      filledCount: Number(vacFilledCount),
      status: vacStatus,
      description: vacDesc,
      vacancyReason: vacReason
    };

    try {
      if (editingVac) {
        await api.put(`/org/vacancies/${editingVac._id}`, payload);
        showToast('Vacancy updated successfully', 'success');
      } else {
        await api.post('/org/vacancies', payload);
        showToast('Vacancy mapping registered successfully', 'success');
      }
      fetchVacancies();
      setEditingVac(null);
      resetForm();
      setShowModal(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save vacancy', 'error');
    }
  };

  const handleDeleteVacancy = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vacancy?')) return;
    try {
      await api.delete(`/org/vacancies/${id}`);
      showToast('Vacancy deleted successfully', 'success');
      fetchVacancies();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete vacancy', 'error');
    }
  };

  const resetForm = () => {
    setVacTitle('');
    setVacDept('');
    setVacManager('');
    setVacBudget(0);
    setVacPriority('Medium');
    setVacCount(1);
    setVacFilledCount(0);
    setVacStatus('Open');
    setVacDesc('');
    setVacReason('New Position Request');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return 'badge-success';
      case 'Filled':
        return 'badge-info';
      case 'Hold':
        return 'badge-warning';
      case 'Cancelled':
        return 'badge-danger';
      case 'Pending Approval':
      default:
        return 'badge-secondary';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <SubmoduleHeader 
        title="Vacancy & Headcount Mapping" 
        description="Map approved department headcounts to active job vacancies, assign hiring managers, and update budget allocations."
        actionLabel={isHr ? "Register Vacancy" : null}
        onActionClick={() => {
          setEditingVac(null);
          resetForm();
          setShowModal(true);
        }}
        isHr={isHr}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <div className="emp-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Active Vacancy Matrix</h3>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px' }}>Position ID</th>
                  <th style={{ padding: '12px' }}>Job Title</th>
                  <th style={{ padding: '12px' }}>Department</th>
                  <th style={{ padding: '12px' }}>Hiring HOD Manager</th>
                  <th style={{ padding: '12px' }}>Budget</th>
                  <th style={{ padding: '12px' }}>Priority</th>
                  <th style={{ padding: '12px' }}>Counts (Headcount / Filled)</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  {isHr && <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {vacancies.map(v => (
                  <tr key={v._id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.9rem' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{v.positionId || 'Pending'}</td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{v.jobTitle}</td>
                    <td style={{ padding: '12px' }}>{v.dept}</td>
                    <td style={{ padding: '12px' }}>{getEmpById(v.managerId)?.name || 'Unassigned'}</td>
                    <td style={{ padding: '12px' }}>${v.budget?.toLocaleString() || 0}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${v.priorityLevel === 'High' ? 'badge-danger' : (v.priorityLevel === 'Medium' ? 'badge-warning' : 'badge-secondary')}`}>
                        {v.priorityLevel}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <strong>{v.vacancyCount || v.approvedHeadcount || 1}</strong> Target / <strong>{v.filledCount || 0}</strong> Filled
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${getStatusBadge(v.status)}`}>{v.status}</span>
                    </td>
                    {isHr && (
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px' }} 
                            onClick={() => {
                              setEditingVac(v);
                              setVacTitle(v.jobTitle);
                              setVacDept(v.dept);
                              setVacManager(v.managerId || '');
                              setVacBudget(v.budget || 0);
                              setVacPriority(v.priorityLevel || 'Medium');
                              setVacCount(v.vacancyCount || v.approvedHeadcount || 1);
                              setVacFilledCount(v.filledCount || 0);
                              setVacStatus(v.status);
                              setVacDesc(v.description || '');
                              setVacReason(v.vacancyReason || 'New Position Request');
                              setShowModal(true);
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', color: 'red' }} 
                            onClick={() => handleDeleteVacancy(v._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {vacancies.length === 0 && (
                  <tr>
                    <td colSpan={isHr ? 9 : 8} style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
                      No vacancies registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Vacancy Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingVac ? 'Edit Vacancy Mapping' : 'Register New Vacancy'}>
        <form onSubmit={handleSaveVacancy} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label>Job Title*</label>
            <input 
              type="text" 
              className="form-control" 
              value={vacTitle} 
              onChange={e => setVacTitle(e.target.value)} 
              placeholder="e.g. Senior Frontend Engineer" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Department Mapping*</label>
            <select 
              className="form-control" 
              value={vacDept} 
              onChange={e => setVacDept(e.target.value)} 
              required
            >
              <option value="">Choose Department...</option>
              {departments.map(d => (
                <option key={d._id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Assigned HOD / Hiring Manager</label>
            <select 
              className="form-control" 
              value={vacManager} 
              onChange={e => setVacManager(e.target.value)}
            >
              <option value="">Unassigned</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Budget Allocation (USD)</label>
            <input 
              type="number" 
              className="form-control" 
              value={vacBudget} 
              onChange={e => setVacBudget(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Priority Level</label>
            <select 
              className="form-control" 
              value={vacPriority} 
              onChange={e => setVacPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="form-group">
            <label>Vacancy Count*</label>
            <input 
              type="number" 
              className="form-control" 
              value={vacCount} 
              onChange={e => setVacCount(e.target.value)} 
              min="1" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Filled Count</label>
            <input 
              type="number" 
              className="form-control" 
              value={vacFilledCount} 
              onChange={e => setVacFilledCount(e.target.value)} 
              min="0" 
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select 
              className="form-control" 
              value={vacStatus} 
              onChange={e => setVacStatus(e.target.value)}
            >
              <option value="Pending Approval">Pending Approval</option>
              <option value="Open">Open</option>
              <option value="Filled">Filled</option>
              <option value="Hold">Hold</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="form-group">
            <label>Job Description</label>
            <textarea 
              className="form-control" 
              value={vacDesc} 
              onChange={e => setVacDesc(e.target.value)} 
              rows="3" 
            />
          </div>
          <div className="form-group">
            <label>Reason for Vacancy</label>
            <input 
              type="text" 
              className="form-control" 
              value={vacReason} 
              onChange={e => setVacReason(e.target.value)} 
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              {editingVac ? 'Update Vacancy' : 'Create Vacancy'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VacancyMappingPage;
