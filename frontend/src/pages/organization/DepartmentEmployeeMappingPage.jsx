import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { OrganizationToolbar, SearchFilterBar, DataTable } from './components/SharedComponents';
import Modal from '../../components/Modal';
import api from '../../api';

const DepartmentEmployeeMappingPage = () => {
  const {
    employees,
    departments,
    designations,
    gradeBands,
    fetchEmployees,
    fetchDepartments,
    fetchDesignations,
    fetchGradeBands
  } = useContext(DataContext);

  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const isHr = user?.role === 'hr';

  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  
  // Mapping Modal Form states
  const [showModal, setShowModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  
  const [newDept, setNewDept] = useState('');
  const [newDesg, setNewDesg] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [newManagerId, setNewManagerId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchDesignations();
    fetchGradeBands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEmpById = (id) => employees.find(e => e.id === id);

  const handleOpenModal = (emp) => {
    setSelectedEmp(emp);
    setNewDept(emp.dept || '');
    setNewDesg(emp.designation || '');
    setNewGrade(emp.grade || '');
    setNewManagerId(emp.teamLeadId || '');
    setEffectiveDate(new Date().toISOString().split('T')[0]);
    setReason('');
    setShowModal(true);
  };

  const handleSaveMapping = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setSubmitting(true);

    try {
      // 1. Process Department Transfer if changed
      if (newDept !== selectedEmp.dept) {
        await api.put('/org/department-transfer', {
          employeeId: selectedEmp.id,
          newDept,
          effectiveDate,
          reason: reason || 'Department reassignment mapping'
        });
      }

      // 2. Process Designation Update if changed
      if (newDesg !== selectedEmp.designation || newGrade !== selectedEmp.grade) {
        await api.put('/org/designation-transfer', {
          employeeId: selectedEmp.id,
          newDesignation: newDesg,
          newGrade,
          effectiveDate,
          reason: reason || 'Role alignment mapping'
        });
      }

      // 3. Process Reporting Manager update if changed
      if (newManagerId !== selectedEmp.teamLeadId) {
        await api.put('/org/reporting-manager', {
          employeeId: selectedEmp.id,
          teamLeadId: newManagerId,
          functionalManagerId: selectedEmp.functionalManagerId || '',
          effectiveDate,
          reason: reason || 'Manager reassignment mapping'
        });
      }

      showToast('Employee department and reporting mapping updated successfully!', 'success');
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error processing mapping update', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (emp.designation && emp.designation.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = deptFilter === 'All' || emp.dept === deptFilter;
    return matchesSearch && matchesDept;
  });

  const deptFilterOptions = [
    { value: 'All', label: 'All Departments' },
    ...departments.map(d => ({ value: d.name, label: d.name }))
  ];

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <OrganizationToolbar 
        title="Department Employee Mapping" 
        description="Allocate company personnel to departments, update job roles, and assign primary reporting managers."
      />

      <SearchFilterBar 
        placeholder="Search employee by name, ID or role..."
        searchValue={searchTerm}
        onSearchChange={e => setSearchTerm(e.target.value)}
        filterValue={deptFilter}
        onFilterChange={e => setDeptFilter(e.target.value)}
        filterOptions={deptFilterOptions}
      />

      <div className="emp-card" style={{ padding: '24px', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}>
        <DataTable 
          headers={['Employee Name & ID', 'Department', 'Designation', 'Reporting Manager', 'Actions']}
          rows={filteredEmployees}
          renderRow={(emp) => {
            const manager = getEmpById(emp.teamLeadId);
            return (
              <tr key={emp.id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.9rem' }}>
                <td style={{ padding: '14px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img 
                      src={emp.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(emp.name)}`} 
                      alt="" 
                      style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                    />
                    <div>
                      <strong style={{ display: 'block', color: 'hsl(var(--text-primary))' }}>{emp.name}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))' }}>ID: {emp.id}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 12px' }}>
                  <span className="badge badge-secondary" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', fontWeight: 600 }}>
                    {emp.dept || 'Unassigned'}
                  </span>
                </td>
                <td style={{ padding: '14px 12px', color: 'hsl(var(--text-secondary))' }}>
                  {emp.designation || 'Staff'}
                </td>
                <td style={{ padding: '14px 12px' }}>
                  {manager ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-user-tie" style={{ opacity: 0.6 }}></i>
                      <span>{manager.name}</span>
                    </div>
                  ) : (
                    <span style={{ fontStyle: 'italic', opacity: 0.5 }}>None</span>
                  )}
                </td>
                <td style={{ padding: '14px 12px' }}>
                  {isHr ? (
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => handleOpenModal(emp)}
                      style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <i className="fa-solid fa-user-gear"></i>
                      <span>Assign / Map</span>
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>Read Only</span>
                  )}
                </td>
              </tr>
            );
          }}
        />
      </div>

      {/* Mapping Modal Dialog */}
      {showModal && selectedEmp && (
        <Modal onClose={() => setShowModal(false)} title={`Update Mapping: ${selectedEmp.name}`}>
          <form onSubmit={handleSaveMapping} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px' }}>
            
            {/* Department Selector */}
            <div>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Department Mapping</label>
              <select 
                className="form-control"
                value={newDept}
                onChange={e => setNewDept(e.target.value)}
                style={{ width: '100%', height: '38px', marginTop: '6px' }}
                required
              >
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d._id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Designation Selector */}
            <div>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Designation</label>
              <select 
                className="form-control"
                value={newDesg}
                onChange={e => setNewDesg(e.target.value)}
                style={{ width: '100%', height: '38px', marginTop: '6px' }}
                required
              >
                <option value="">Select Designation</option>
                {designations.map(d => (
                  <option key={d._id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Grade Band Selector */}
            <div>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Grade / Band</label>
              <select 
                className="form-control"
                value={newGrade}
                onChange={e => setNewGrade(e.target.value)}
                style={{ width: '100%', height: '38px', marginTop: '6px' }}
              >
                <option value="">Select Grade</option>
                {gradeBands.map(gb => (
                  <option key={gb._id} value={gb.name}>{gb.name}</option>
                ))}
              </select>
            </div>

            {/* Reporting Manager Selector */}
            <div>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Primary Reporting Manager</label>
              <select 
                className="form-control"
                value={newManagerId}
                onChange={e => setNewManagerId(e.target.value)}
                style={{ width: '100%', height: '38px', marginTop: '6px' }}
              >
                <option value="">No Manager (Root Node)</option>
                {employees
                  .filter(e => e.id !== selectedEmp.id) // Cannot report to self
                  .map(e => (
                    <option key={e.id} value={e.id}>{e.name} (ID: {e.id})</option>
                  ))
                }
              </select>
            </div>

            {/* Effective Date */}
            <div>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Effective Date</label>
              <input 
                type="date"
                className="form-control"
                value={effectiveDate}
                onChange={e => setEffectiveDate(e.target.value)}
                style={{ width: '100%', height: '38px', marginTop: '6px', padding: '0 12px' }}
                required
              />
            </div>

            {/* Reason */}
            <div>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Change Reason</label>
              <input 
                type="text"
                className="form-control"
                placeholder="e.g. Annual structural reorganization, promotion..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                style={{ width: '100%', height: '38px', marginTop: '6px', padding: '0 12px' }}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowModal(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Applying Changes...' : 'Save Mapping'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DepartmentEmployeeMappingPage;
