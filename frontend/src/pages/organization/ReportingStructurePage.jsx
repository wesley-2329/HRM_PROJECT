import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { OrganizationToolbar } from './components/SharedComponents';
import Modal from '../../components/Modal';
import api from '../../api';

const ReportingStructurePage = ({ mode }) => {
  const {
    employees,
    departments,
    reportingHistory,
    fetchEmployees,
    fetchDepartments,
    fetchReportingHistory
  } = useContext(DataContext);

  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const isHr = mode === 'hr' || user?.role === 'hr';

  const [selectedEmp, setSelectedEmp] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Form states
  const [teamLeadId, setTeamLeadId] = useState('');
  const [functionalManagerId, setFunctionalManagerId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchReportingHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set initial selected employee
  useEffect(() => {
    if (employees.length > 0 && !selectedEmp) {
      setSelectedEmp(employees[0]);
    }
  }, [employees, selectedEmp]);

  // Set form defaults when modal opens or selectedEmp changes
  useEffect(() => {
    if (selectedEmp) {
      setTeamLeadId(selectedEmp.teamLeadId || '');
      setFunctionalManagerId(selectedEmp.functionalManagerId || '');
      setEffectiveDate(new Date().toISOString().split('T')[0]);
      setReason('');
    }
  }, [selectedEmp, showAssignModal]);

  const getEmpById = (id) => employees.find(e => e.id === id);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.dept && emp.dept.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleUpdateReporting = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;

    try {
      const res = await api.put('/org/reporting-manager', {
        employeeId: selectedEmp.id,
        teamLeadId,
        functionalManagerId,
        effectiveDate,
        reason: reason || 'Routine realignment'
      });

      showToast(res.data.message || 'Reporting line updated successfully!', 'success');
      setShowAssignModal(false);

      // Refresh context
      await fetchEmployees();
      await fetchReportingHistory();

      // Re-select updated employee
      const updated = employees.find(emp => emp.id === selectedEmp.id);
      if (updated) setSelectedEmp(updated);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error updating reporting lines.', 'error');
    }
  };

  // Get dynamic department head
  const getDeptHead = (deptName) => {
    const dept = departments.find(d => d.name === deptName);
    return dept ? getEmpById(dept.managerId) : null;
  };

  // Get timeline events for selected employee
  const employeeTimeline = reportingHistory
    .filter(h => h.employeeId === selectedEmp?.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getAvatarUrl = (emp) => {
    if (!emp) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80';
    return emp.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(emp.name)}`;
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <OrganizationToolbar
        title="Reporting Structure Setup"
        description="Preview active direct reportees, assign reporting lines, and manage team lead hierarchies."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: '24px', flexWrap: 'wrap' }}>

        {/* Left Side: Employee Directory Panel */}
        <div className="emp-card" style={{ padding: '20px', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '75vh', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Workforce Directory</h3>

          <div className="nav-search" style={{ margin: 0, width: '100%', position: 'relative' }}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Search ID, name, dept..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1 }}>
            {filteredEmployees.map(emp => {
              const isActive = selectedEmp?.id === emp.id;
              return (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmp(emp)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isActive ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                    border: isActive ? '1px solid hsl(var(--primary))' : '1px solid transparent',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = 'rgba(59, 130, 246, 0.03)')}
                  onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
                >
                  <img src={getAvatarUrl(emp)} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: 'hsl(var(--text-primary))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {emp.name}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))' }}>{emp.id} | {emp.dept || 'Unassigned'}</span>
                  </div>
                </div>
              );
            })}
            {filteredEmployees.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                No employees match search query.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Selected Employee Interactive Reporting Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {selectedEmp ? (
            <>
              {/* Employee Overview Card */}
              <div className="emp-card" style={{ padding: '24px', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img src={getAvatarUrl(selectedEmp)} alt="" style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid hsl(var(--primary))', objectFit: 'cover' }} />
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'hsl(var(--text-primary))', margin: 0 }}>{selectedEmp.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', display: 'block', marginTop: '2px' }}>
                      {selectedEmp.designation || 'Specialist'} • {selectedEmp.dept || 'General'}
                    </span>
                    <span className="badge badge-info" style={{ marginTop: '6px', fontSize: '0.68rem' }}>ID: {selectedEmp.id}</span>
                  </div>
                </div>

                {isHr && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowAssignModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <i className="fa-solid fa-user-pen"></i>
                    <span>Modify Reporting Line</span>
                  </button>
                )}
              </div>

              {/* Reporting Stack Map Visual */}
              <div className="emp-card" style={{ padding: '24px', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 20px 0' }}>Current Reporting Stack</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '24px' }}>
                  {/* Vertical connect line */}
                  <div style={{ position: 'absolute', left: '8px', top: '20px', bottom: '20px', width: '2px', background: 'hsl(var(--border))' }}></div>

                  {/* Primary Manager */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-20px', width: '10px', height: '10px', borderRadius: '50%', background: 'hsl(var(--primary))' }}></div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-secondary))', width: '140px', flexShrink: 0 }}>Reporting Manager</div>
                    {selectedEmp.teamLeadId ? (() => {
                      const mgr = getEmpById(selectedEmp.teamLeadId);
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'hsl(var(--bg-main))', padding: '8px 14px', borderRadius: '8px', border: '1px solid hsl(var(--border))', flex: 1 }}>
                          <img src={getAvatarUrl(mgr)} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                          <div>
                            <strong style={{ display: 'block', fontSize: '0.8rem' }}>{mgr ? mgr.name : 'Unknown'}</strong>
                            <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))' }}>ID: {selectedEmp.teamLeadId}</span>
                          </div>
                        </div>
                      );
                    })() : (
                      <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontStyle: 'italic' }}>No primary manager assigned</div>
                    )}
                  </div>

                  {/* Functional Manager */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-20px', width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-secondary))', width: '140px', flexShrink: 0 }}>Functional Manager</div>
                    {selectedEmp.functionalManagerId ? (() => {
                      const mgr = getEmpById(selectedEmp.functionalManagerId);
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'hsl(var(--bg-main))', padding: '8px 14px', borderRadius: '8px', border: '1px solid hsl(var(--border))', flex: 1 }}>
                          <img src={getAvatarUrl(mgr)} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                          <div>
                            <strong style={{ display: 'block', fontSize: '0.8rem' }}>{mgr ? mgr.name : 'Unknown'}</strong>
                            <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))' }}>ID: {selectedEmp.functionalManagerId}</span>
                          </div>
                        </div>
                      );
                    })() : (
                      <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontStyle: 'italic' }}>No functional manager assigned</div>
                    )}
                  </div>

                  {/* Department HOD */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-20px', width: '10px', height: '10px', borderRadius: '50%', background: '#8b5cf6' }}></div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-secondary))', width: '140px', flexShrink: 0 }}>Department Head (HOD)</div>
                    {selectedEmp.dept ? (() => {
                      const hod = getDeptHead(selectedEmp.dept);
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'hsl(var(--bg-main))', padding: '8px 14px', borderRadius: '8px', border: '1px solid hsl(var(--border))', flex: 1 }}>
                          <img src={getAvatarUrl(hod)} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                          <div>
                            <strong style={{ display: 'block', fontSize: '0.8rem' }}>{hod ? hod.name : 'Unassigned Head'}</strong>
                            <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))' }}>{hod ? `ID: ${hod.id}` : `HOD of ${selectedEmp.dept}`}</span>
                          </div>
                        </div>
                      );
                    })() : (
                      <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontStyle: 'italic' }}>Unassigned Department</div>
                    )}
                  </div>

                </div>
              </div>

              {/* Individual History Timeline */}
              <div className="emp-card" style={{ padding: '24px', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 20px 0' }}>Hierarchy Changes Timeline</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '24px' }}>
                  {employeeTimeline.length > 0 ? (
                    <>
                      {/* connector line */}
                      <div style={{ position: 'absolute', left: '8px', top: '10px', bottom: '10px', width: '2px', background: 'hsl(var(--border))' }}></div>

                      {employeeTimeline.map((log) => (
                        <div key={log._id} style={{ position: 'relative', fontSize: '0.8rem' }}>
                          <div style={{ position: 'absolute', left: '-20px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(var(--primary))' }}></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ color: 'hsl(var(--text-primary))' }}>Change Registered</strong>
                            <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))' }}>
                              Effective Date: {new Date(log.effectiveDate || log.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div style={{ marginTop: '4px', color: 'hsl(var(--text-secondary))', fontWeight: 500 }}>
                            Manager shifted from {log.oldManagerId || 'None'} → {log.newManagerId || 'None'}
                          </div>
                          <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.75rem', marginTop: '2px' }}>Reason: {log.reason}</div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontStyle: 'italic' }}>
                      No reporting history modifications found. Defaults to joined date: {selectedEmp.joined ? new Date(selectedEmp.joined).toLocaleDateString() : 'Creation date fallback'}.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
              Select an employee from the workforce directory to inspect reporting.
            </div>
          )}

        </div>

      </div>

      {/* Modify Reporting Modal Drawer */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title={`Modify Reporting: ${selectedEmp?.name}`}>
        <form onSubmit={handleUpdateReporting} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Reporting Manager (Primary Manager)</label>
            <select
              className="form-control"
              value={teamLeadId}
              onChange={e => setTeamLeadId(e.target.value)}
            >
              <option value="">None</option>
              {employees.filter(e => e.id !== selectedEmp?.id).map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.id}) - {emp.designation}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Functional Manager</label>
            <select
              className="form-control"
              value={functionalManagerId}
              onChange={e => setFunctionalManagerId(e.target.value)}
            >
              <option value="">None</option>
              {employees.filter(e => e.id !== selectedEmp?.id).map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.id}) - {emp.designation}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Effective Date</label>
            <input
              type="date"
              className="form-control"
              value={effectiveDate}
              onChange={e => setEffectiveDate(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Change Reason</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., Annual Restructuring, Team Alignment"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Assignment</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReportingStructurePage;
