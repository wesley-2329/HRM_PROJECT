import { useContext, useState, useEffect, useRef } from 'react';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../api';
import {
  AddEmployeeModal,
  LedgerModal,
  StatsModal,
  PayslipModal,
  AddWalkinModal
} from '../components/Modals';

const HRApp = ({ currentModule, setCurrentModule, searchQuery }) => {
  const {
    employees,
    leaves,
    timesheets,
    candidates,
    notifications,
    fetchAllData,
    fetchEmployees,
    fetchLeaves,
    fetchTimesheets,
    fetchCandidates,
    fetchNotifications
  } = useContext(DataContext);
  
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();

  // Modals state
  const [addEmpActive, setAddEmpActive] = useState(false);
  const [selectedEmpForEdit, setSelectedEmpForEdit] = useState(null);
  const [ledgerActive, setLedgerActive] = useState(false);
  const [selectedEmpForLedger, setSelectedEmpForLedger] = useState(null);
  const [statsActive, setStatsActive] = useState(false);
  const [selectedEmpForStats, setSelectedEmpForStats] = useState(null);
  const [payslipActive, setPayslipActive] = useState(false);
  const [selectedEmpForPayslip, setSelectedEmpForPayslip] = useState(null);
  const [payslipMonth, setPayslipMonth] = useState('May 2026');
  const [walkinActive, setWalkinActive] = useState(false);

  // Filters and inner states
  const [empDeptFilter, setEmpDeptFilter] = useState('All');
  const [selectedAtsSource, setSelectedAtsSource] = useState('All Sources');
  const [payslipEmpSelect, setPayslipEmpSelect] = useState('');

  // Clock In/Out state
  const [clockRunning, setClockRunning] = useState(false);
  const [clockInTime, setClockInTime] = useState('');
  const [clockOutTime, setClockOutTime] = useState('');
  const [stopwatchVal, setStopwatchVal] = useState('00:00:00');
  const [timeSeconds, setTimeSeconds] = useState(0);
  const timerRef = useRef(null);

  // Charts references
  const hrAttendanceTrendsRef = useRef(null);
  const hrAttendanceByDayRef = useRef(null);
  const hrDeptDonutRef = useRef(null);
  const hrPayrollBarRef = useRef(null);
  
  const chartsInstanceRef = useRef({});

  // Sync data on load and module change
  useEffect(() => {
    fetchAllData();
  }, [currentModule]);

  // Set default selected employee for payslip once employees load
  useEffect(() => {
    if (employees.length > 0 && !payslipEmpSelect) {
      setPayslipEmpSelect(employees[0].id);
    }
  }, [employees]);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Initialize and redraw charts
  useEffect(() => {
    if (!window.Chart) return;
    
    // Destroy previous instances
    Object.keys(chartsInstanceRef.current).forEach(key => {
      if (chartsInstanceRef.current[key]) {
        chartsInstanceRef.current[key].destroy();
      }
    });

    if (currentModule === 'dashboard') {
      const ctxLine = hrAttendanceTrendsRef.current?.getContext('2d');
      if (ctxLine) {
        chartsInstanceRef.current.trends = new window.Chart(ctxLine, {
          type: 'line',
          data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            datasets: [{
              label: 'Attendance Rate %',
              data: [92, 94, 91, 95, 96, 94, 95, 93, 94, 75],
              borderColor: 'hsl(230, 80%, 55%)',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              fill: true,
              tension: 0.3
            }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
      }

      const ctxBar = hrAttendanceByDayRef.current?.getContext('2d');
      if (ctxBar) {
        chartsInstanceRef.current.byDay = new window.Chart(ctxBar, {
          type: 'bar',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            datasets: [
              { label: 'Present', data: [22, 21, 23, 22, 20, 15], backgroundColor: 'rgba(16, 185, 129, 0.85)' },
              { label: 'Absent', data: [2, 3, 1, 2, 4, 9], backgroundColor: 'rgba(244, 63, 94, 0.85)' }
            ]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
    }

    if (currentModule === 'reports-analytics') {
      const ctxDonut = hrDeptDonutRef.current?.getContext('2d');
      if (ctxDonut) {
        // Calculate dynamic department headcount
        const depts = ['Engineering', 'Human Resources', 'Finance', 'Design', 'Marketing'];
        const counts = depts.map(d => employees.filter(e => e.dept === d && e.status === 'Approved').length);
        
        chartsInstanceRef.current.deptDonut = new window.Chart(ctxDonut, {
          type: 'doughnut',
          data: {
            labels: depts,
            datasets: [{
              data: counts.some(c => c > 0) ? counts : [2, 1, 1, 1, 1], // fallback
              backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4']
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }

      const ctxPay = hrPayrollBarRef.current?.getContext('2d');
      if (ctxPay) {
        chartsInstanceRef.current.payrollBar = new window.Chart(ctxPay, {
          type: 'bar',
          data: {
            labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
            datasets: [{
              label: 'Payroll Spent (₹)',
              data: [420000, 450000, 450000, 480000, 490000, 510000],
              backgroundColor: 'rgba(99, 102, 241, 0.8)'
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
    }
  }, [currentModule, employees]);

  // Clock in/out Shift Stopwatch
  const handleClockToggle = async () => {
    if (!clockRunning) {
      try {
        const res = await api.post('/timesheet/clock-in');
        setClockInTime(res.data.clockIn);
        setClockRunning(true);
        setTimeSeconds(0);
        showToast('Clocked In successfully.', 'success');

        timerRef.current = setInterval(() => {
          setTimeSeconds(prev => {
            const nextSecs = prev + 1;
            const hrs = String(Math.floor(nextSecs / 3600)).padStart(2, '0');
            const mins = String(Math.floor((nextSecs % 3600) / 60)).padStart(2, '0');
            const secs = String(nextSecs % 60).padStart(2, '0');
            setStopwatchVal(`${hrs}:${mins}:${secs}`);
            return nextSecs;
          });
        }, 1000);
      } catch (err) {
        showToast(err.response?.data?.message || 'Error clocking in', 'error');
      }
    } else {
      try {
        const res = await api.post('/timesheet/clock-out');
        setClockOutTime(res.data.clockOut);
        setClockRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
        setStopwatchVal('00:00:00');
        showToast('Clocked Out successfully.', 'info');
        fetchTimesheets();
      } catch (err) {
        showToast(err.response?.data?.message || 'Error clocking out', 'error');
      }
    }
  };

  // CRUD Employee operations
  const handleAddOrEditEmployee = async (formData) => {
    try {
      if (selectedEmpForEdit) {
        await api.put(`/employees/${selectedEmpForEdit.id}`, formData);
        showToast('Employee details updated.', 'success');
      } else {
        await api.post('/employees', formData);
        showToast('New employee registered.', 'success');
      }
      setAddEmpActive(false);
      setSelectedEmpForEdit(null);
      fetchEmployees();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving employee record', 'error');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        showToast('Employee deleted.', 'danger');
        fetchEmployees();
      } catch (err) {
        showToast('Error deleting employee', 'error');
      }
    }
  };

  const handleUpdateEmployeeStatus = async (id, status) => {
    try {
      await api.put(`/employees/${id}/status`, { status });
      showToast(`Employee status set to ${status}.`, 'success');
      fetchEmployees();
    } catch (err) {
      showToast('Error updating status', 'error');
    }
  };

  // Leave approvals
  const handleUpdateLeaveStatus = async (id, status) => {
    try {
      await api.put(`/leaves/${id}`, { status });
      showToast(`Leave request ${status.toLowerCase()}ed successfully.`, 'success');
      fetchLeaves();
    } catch (err) {
      showToast('Error updating leave', 'error');
    }
  };

  // ATS Pipeline
  const handleMoveCandidate = async (id, currentStage) => {
    const stages = ['applied', 'screening', 'interview', 'offered', 'selected'];
    const currentIdx = stages.indexOf(currentStage);
    if (currentIdx < stages.length - 1) {
      const nextStage = stages[currentIdx + 1];
      const updateData = { stage: nextStage };
      if (nextStage === 'interview') {
        updateData.interviewStage = 'Technical Round';
      }
      try {
        await api.put(`/candidates/${id}/stage`, updateData);
        showToast('Candidate moved forward.', 'success');
        fetchCandidates();
      } catch (err) {
        showToast('Error updating candidate', 'error');
      }
    }
  };

  const handleRejectCandidate = async (id, stage) => {
    try {
      await api.put(`/candidates/${id}/stage`, {
        stage: 'rejected',
        stageRejectedAt: stage,
        rejectionReason: 'Skill alignment deficit'
      });
      showToast('Candidate rejected.', 'danger');
      fetchCandidates();
    } catch (err) {
      showToast('Error rejecting candidate', 'error');
    }
  };

  const handleReleaseOffer = async (id) => {
    try {
      await api.put(`/candidates/${id}/offer`);
      showToast('Offer letter released.', 'success');
      fetchCandidates();
    } catch (err) {
      showToast('Error releasing offer', 'error');
    }
  };

  const handleAddWalkinCandidate = async (formData) => {
    try {
      await api.post('/candidates', formData);
      showToast('Walk-in candidate added.', 'success');
      setWalkinActive(false);
      fetchCandidates();
    } catch (err) {
      showToast('Error adding candidate', 'error');
    }
  };

  // Helper selectors and filters
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = empDeptFilter === 'All' || emp.dept === empDeptFilter;
    return matchesSearch && matchesDept;
  });

  const pendingLeavesCount = leaves.filter(l => l.status === 'Pending').length;

  return (
    <>
      {/* Overview Module */}
      {currentModule === 'dashboard' && (
        <section id="hr-mod-dashboard" className="hr-module">
          <div className="metric-grid">
            <div className="metric-card primary">
              <div>
                <span className="metric-label">Total Employees</span>
                <div className="metric-val">{employees.length}</div>
                <span className="metric-trend up"><i className="fa-solid fa-arrow-up"></i> +12% this quarter</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-user-group"></i></div>
            </div>
            <div className="metric-card success">
              <div>
                <span className="metric-label">Present Today</span>
                <div className="metric-val">{timesheets.filter(t => t.date === new Date().toISOString().split('T')[0]).length}</div>
                <span className="metric-trend up"><i className="fa-solid fa-check"></i> Live check-in</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-user-check"></i></div>
            </div>
            <div className="metric-card info">
              <div>
                <span className="metric-label">Total Employee Count</span>
                <div className="metric-val">{employees.length}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Across all departments</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-users"></i></div>
            </div>
            <div className="metric-card warning">
              <div>
                <span className="metric-label">Pending Leaves</span>
                <div className="metric-val">{pendingLeavesCount}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Awaiting approval</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-clock-rotate-left"></i></div>
            </div>
          </div>

          <div className="dashboard-layout">
            <div>
              <div className="card">
                <div className="card-title">Monthly Attendance Trends</div>
                <div className="chart-container">
                  <canvas ref={hrAttendanceTrendsRef}></canvas>
                </div>
              </div>
              <div className="card">
                <div className="card-title">Monthly Attendance by Day</div>
                <div className="chart-container">
                  <canvas ref={hrAttendanceByDayRef}></canvas>
                </div>
              </div>
            </div>
            <div>
              <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', color: '#fff', border: 'none' }}>
                <div className="card-title" style={{ color: '#fff' }}>TalentSphere AI™ Insights</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <i className="fa-solid fa-wand-magic-sparkles" style={{ color: '#a5b4fc', fontSize: '1.2rem', marginTop: '3px' }}></i>
                    <p>Attendance is up 4% compared to this day last week. Friday drop is stabilized.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ color: '#fdba74', fontSize: '1.2rem', marginTop: '3px' }}></i>
                    <p>{pendingLeavesCount} employees have pending leave requests. Resolve soon.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <i className="fa-solid fa-circle-check" style={{ color: '#6ee7b7', fontSize: '1.2rem', marginTop: '3px' }}></i>
                    <p>All candidates in <strong>Screening</strong> have completed HR screening calls.</p>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-title">Upcoming Tasks & Actions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                  {leaves.filter(l => l.status === 'Pending').map(l => (
                    <div key={l._id} style={{ padding: '10px', background: 'hsl(var(--bg-main))', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>Approve Leave for {l.empName}</strong>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Type: {l.type} | Date: {l.start}</div>
                      </div>
                      <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setCurrentModule('attendance-leave')}>Review</button>
                    </div>
                  ))}
                  {leaves.filter(l => l.status === 'Pending').length === 0 && (
                    <div style={{ color: 'var(--text-secondary)' }}>No immediate action items.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Employee Management Module */}
      {currentModule === 'employee-management' && (
        <section id="hr-mod-employee-management" className="hr-module">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select className="form-control" style={{ width: '180px' }} value={empDeptFilter} onChange={(e) => setEmpDeptFilter(e.target.value)}>
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={() => { setSelectedEmpForEdit(null); setAddEmpActive(true); }}><i className="fa-solid fa-plus"></i> Add Employee</button>
          </div>
          
          <h3 style={{ marginBottom: '16px' }}>Core Employees Grid</h3>
          <div className="emp-grid">
            {filteredEmployees.map(emp => (
              <div key={emp.id} className="emp-card">
                <img src={emp.avatar} alt={emp.name} />
                <div className="emp-card-name">{emp.name}</div>
                <div className="emp-card-role">{emp.role}</div>
                <div className="emp-card-badges">
                  <span className="badge badge-primary">{emp.dept}</span>
                  <span className={`badge ${emp.status === 'Approved' ? 'badge-success' : emp.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{emp.status}</span>
                </div>
                <button className="btn btn-secondary" style={{ width: '100%', marginTop: '8px' }} onClick={() => { setSelectedEmpForLedger(emp); setLedgerActive(true); }}>View Ledger</button>
                <div className="emp-card-actions">
                  <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => { setSelectedEmpForEdit(emp); setAddEmpActive(true); }}><i className="fa-solid fa-pen"></i></button>
                  <button className="btn btn-secondary" style={{ padding: '6px 10px', color: 'hsl(var(--danger))' }} onClick={() => handleDeleteEmployee(emp.id)}><i className="fa-solid fa-trash"></i></button>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title">Comprehensive Employee Roster</div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Profile</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Joining Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(emp => (
                    <tr key={emp.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={emp.avatar} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} alt="avatar" />
                          <div>
                            <strong>{emp.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{emp.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>{emp.dept}</td>
                      <td>{emp.role}</td>
                      <td>{emp.email}</td>
                      <td>{emp.joined}</td>
                      <td><span className={`badge ${emp.status === 'Approved' ? 'badge-success' : emp.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{emp.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {emp.status !== 'Approved' && <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem' }} onClick={() => handleUpdateEmployeeStatus(emp.id, 'Approved')}>Approve</button>}
                          {emp.status !== 'Rejected' && <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'hsl(var(--danger))' }} onClick={() => handleUpdateEmployeeStatus(emp.id, 'Rejected')}>Reject</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Attendance & Shift Module */}
      {currentModule === 'attendance-leave' && (
        <section id="hr-mod-attendance-leave" className="hr-module">
          <div className="dashboard-layout">
            <div>
              <div className="card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff' }}>
                <div className="card-title" style={{ color: '#fff' }}>Shift Attendance Ticker</div>
                <div style={{ textAlign: 'center', padding: '15px 0' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'monospace', marginBottom: '10px', color: '#38bdf8' }}>{stopwatchVal}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '15px' }}>
                    <button className="btn btn-primary" onClick={handleClockToggle} disabled={clockRunning}>Clock In</button>
                    <button className="btn btn-secondary" style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }} onClick={handleClockToggle} disabled={!clockRunning}>Clock Out</button>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-around' }}>
                    <span>Login: {clockInTime || '--'}</span>
                    <span>Logout: {clockOutTime || '--'}</span>
                  </div>
                  <div style={{ marginTop: '15px', fontSize: '0.85rem' }}>
                    Status: <span className={`badge ${clockRunning ? 'badge-success' : 'badge-danger'}`}>{clockRunning ? 'Active Shift' : 'Logged Out'}</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Attendance Quality Breakdown</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span>Punctuality Rate</span><strong>94%</strong>
                    </div>
                    <div style={{ height: '8px', background: 'hsl(var(--border))', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '94%', height: '100%', backgroundColor: 'hsl(var(--success))' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span>Late Arrivals</span><strong>4%</strong>
                    </div>
                    <div style={{ height: '8px', background: 'hsl(var(--border))', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '4%', height: '100%', backgroundColor: 'hsl(var(--warning))' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span>Absenteeism</span><strong>2%</strong>
                    </div>
                    <div style={{ height: '8px', background: 'hsl(var(--border))', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '2%', height: '100%', backgroundColor: 'hsl(var(--danger))' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="card">
                <div className="card-title">Employee Leave Approvals</div>
                <div className="table-responsive">
                  <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Applicant</th>
                        <th>Type</th>
                        <th>Dates</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.map(l => (
                        <tr key={l._id}>
                          <td><strong>{l.empName}</strong></td>
                          <td>{l.type}</td>
                          <td>{l.start} to {l.end}</td>
                          <td><span className={`badge ${l.status === 'Approved' ? 'badge-success' : l.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{l.status}</span></td>
                          <td>
                            {l.status === 'Pending' ? (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => handleUpdateLeaveStatus(l._id, 'Approved')}>Approve</button>
                                <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => handleUpdateLeaveStatus(l._id, 'Rejected')}>Reject</button>
                              </div>
                            ) : '--'}
                          </td>
                        </tr>
                      ))}
                      {leaves.length === 0 && (
                        <tr><td colSpan="5" style={{ textAlign: 'center' }}>No leave applications.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Current Week's Shift Ledger</div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Date</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Shift Hours</th>
                    <th>Punctuality</th>
                  </tr>
                </thead>
                <tbody>
                  {timesheets.slice(0, 10).map((t, idx) => (
                    <tr key={idx}>
                      <td><strong>{t.empId}</strong></td>
                      <td>{t.date}</td>
                      <td>{t.clockIn}</td>
                      <td>{t.clockOut || 'Active Shift'}</td>
                      <td>{t.hours} Hrs</td>
                      <td><span className={`badge ${t.status === 'Punctual' ? 'badge-success' : t.status === 'Late Entry' ? 'badge-warning' : 'badge-danger'}`}>{t.status}</span></td>
                    </tr>
                  ))}
                  {timesheets.length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>No shift logs recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Weekly Attendance Report (All Staff)</div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Mon</th>
                    <th>Tue</th>
                    <th>Wed</th>
                    <th>Thu</th>
                    <th>Fri</th>
                    <th>Sat</th>
                    <th>Sun</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.filter(e => e.status === 'Approved').map(emp => (
                    <tr key={emp.id}>
                      <td><strong>{emp.name}</strong></td>
                      <td><span className="badge badge-success">P</span></td>
                      <td><span className="badge badge-success">P</span></td>
                      <td><span className="badge badge-success">P</span></td>
                      <td><span className="badge badge-success">P</span></td>
                      <td><span className="badge badge-success">P</span></td>
                      <td><span className="badge badge-danger">A</span></td>
                      <td><span className="badge badge-info">H</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Payroll Hub Module */}
      {currentModule === 'payroll-management' && (
        <section id="hr-mod-payroll-management" className="hr-module">
          <div className="dashboard-layout">
            <div>
              <div className="card">
                <div className="card-title">Payslip & Salary Dispatcher</div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const targetEmp = employees.find(emp => emp.id === payslipEmpSelect);
                  if (targetEmp) {
                    setSelectedEmpForPayslip(targetEmp);
                    setPayslipActive(true);
                  }
                }}>
                  <div className="form-group">
                    <label>Select Employee</label>
                    <select className="form-control" value={payslipEmpSelect} onChange={(e) => setPayslipEmpSelect(e.target.value)}>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Payment Cycle Month</label>
                    <select className="form-control" value={payslipMonth} onChange={(e) => setPayslipMonth(e.target.value)}>
                      <option value="May 2026">May 2026</option>
                      <option value="April 2026">April 2026</option>
                      <option value="March 2026">March 2026</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Generate Payslip & Review</button>
                </form>
              </div>

              <div className="card">
                <div className="card-title">Corporate Bank & Tax Policies</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Disbursal Bank</span><strong>HDFC Bank Core</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Provident Fund (PF)</span><strong>12% Employee / 12% Employer</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Corporate TDS Rate</span><strong>Dynamic (Slab Based)</strong>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="card">
                <div className="card-title">Employee Performance Stats Page</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {employees.filter(e => e.status === 'Approved').map(emp => (
                    <div key={emp.id} style={{ padding: '15px', border: '1px solid hsl(var(--border))', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{emp.name}</strong>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Department: {emp.dept}</div>
                      </div>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => { setSelectedEmpForStats(emp); setStatsActive(true); }}>View Stats</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recruitment ATS Module */}
      {currentModule === 'recruitment-ats' && (
        <section id="hr-mod-recruitment-ats" className="hr-module">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['All Sources', 'Job Portals', 'Career Page', 'Walk-In', 'Referrals'].map(src => {
                let count;
                if (src === 'All Sources') count = candidates.length;
                else if (src === 'Job Portals') count = candidates.filter(c => c.source === 'Job Portal').length;
                else if (src === 'Referrals') count = candidates.filter(c => c.source === 'Referral').length;
                else count = candidates.filter(c => c.source === src).length;
                
                return (
                  <button key={src} className={`btn ${selectedAtsSource === src ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelectedAtsSource(src)}>
                    {src} <span className={`badge ${selectedAtsSource === src ? 'badge-info' : 'badge-primary'}`}>{count}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => setWalkinActive(true)}><i className="fa-solid fa-walking"></i> + Add Walk-In Candidate</button>
            </div>
          </div>

          <h3 style={{ marginBottom: '16px' }}>Corporate ATS Pipelines</h3>
          <div className="ats-pipeline">
            {['applied', 'screening', 'interview', 'offered', 'selected', 'rejected'].map(col => {
              let colCandidates = candidates.filter(c => c.stage === col);
              if (selectedAtsSource !== 'All Sources') {
                let filterValue = selectedAtsSource;
                if (filterValue === 'Job Portals') filterValue = 'Job Portal';
                if (filterValue === 'Referrals') filterValue = 'Referral';
                colCandidates = colCandidates.filter(c => c.source === filterValue);
              }

              return (
                <div key={col} className="ats-col">
                  <div className="ats-col-header">
                    <span>{col}</span>
                    <span className="badge badge-primary">{colCandidates.length}</span>
                  </div>
                  <div className="ats-card-list">
                    {colCandidates.map(cand => (
                      <div key={cand._id} className="ats-cand-card">
                        <h5>{cand.name}</h5>
                        <p>{cand.role}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className={`badge ${cand.source === 'Walk-In' ? 'badge-success' : cand.source === 'Referral' ? 'badge-warning' : 'badge-info'}`}>{cand.source}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{cand.experience}</span>
                        </div>
                        {col === 'interview' && cand.interviewStage && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}><i className="fa-solid fa-clock"></i> {cand.interviewStage}</div>
                        )}
                        <div className="ats-cand-actions">
                          {col !== 'selected' && col !== 'rejected' && <a onClick={() => handleMoveCandidate(cand._id, cand.stage)}>Move Forward →</a>}
                          {col !== 'rejected' && col !== 'selected' && <a className="reject-link" onClick={() => handleRejectCandidate(cand._id, cand.stage)}>Reject</a>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card">
            <div className="card-title">ATS Pipeline Selections</div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Role</th>
                    <th>Source</th>
                    <th>Stage</th>
                    <th>Offer Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.filter(c => c.stage === 'selected').map(cand => (
                    <tr key={cand._id}>
                      <td><strong>{cand.name}</strong></td>
                      <td>{cand.role}</td>
                      <td>{cand.source}</td>
                      <td>Final HR & Offer</td>
                      <td>
                        <span className={`badge ${cand.offerReleased === 'Yes' ? 'badge-success' : 'badge-warning'}`}>{cand.offerReleased === 'Yes' ? 'Released' : 'Pending'}</span>
                        {cand.offerReleased !== 'Yes' && <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', marginLeft: '10px' }} onClick={() => handleReleaseOffer(cand._id)}>Release Offer</button>}
                      </td>
                      <td>{cand.notes || '--'}</td>
                    </tr>
                  ))}
                  {candidates.filter(c => c.stage === 'selected').length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>No selected candidates.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-title">ATS Pipeline Rejections</div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Role</th>
                    <th>Source</th>
                    <th>Rejected At</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.filter(c => c.stage === 'rejected').map(cand => (
                    <tr key={cand._id}>
                      <td><strong>{cand.name}</strong></td>
                      <td>{cand.role}</td>
                      <td>{cand.source}</td>
                      <td>{cand.stageRejectedAt || 'Screening'}</td>
                      <td>{cand.rejectionReason || 'Under-qualified'}</td>
                    </tr>
                  ))}
                  {candidates.filter(c => c.stage === 'rejected').length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: 'center' }}>No rejected candidates.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Reports & Audits Module */}
      {currentModule === 'reports-analytics' && (
        <section id="hr-mod-reports-analytics" className="hr-module">
          <div className="dashboard-layout">
            <div className="card">
              <div className="card-title">Headcount by Department</div>
              <div className="chart-container">
                <canvas ref={hrDeptDonutRef}></canvas>
              </div>
            </div>
            <div className="card">
              <div className="card-title">Payroll Expenditure by Month (₹ Values)</div>
              <div className="chart-container">
                <canvas ref={hrPayrollBarRef}></canvas>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-title">Corporate Audit Table (All Metrics)</div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Headcount</th>
                    <th>Avg Salary YTD</th>
                    <th>Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Engineering</td>
                    <td>{employees.filter(e => e.dept === 'Engineering' && e.status === 'Approved').length}</td>
                    <td>₹1,02,000</td>
                    <td>96.5%</td>
                  </tr>
                  <tr>
                    <td>Human Resources</td>
                    <td>{employees.filter(e => e.dept === 'Human Resources' && e.status === 'Approved').length}</td>
                    <td>₹85,000</td>
                    <td>95%</td>
                  </tr>
                  <tr>
                    <td>Finance</td>
                    <td>{employees.filter(e => e.dept === 'Finance' && e.status === 'Approved').length}</td>
                    <td>₹90,000</td>
                    <td>97.2%</td>
                  </tr>
                  <tr>
                    <td>Design</td>
                    <td>{employees.filter(e => e.dept === 'Design' && e.status === 'Approved').length}</td>
                    <td>₹78,000</td>
                    <td>94%</td>
                  </tr>
                  <tr>
                    <td>Marketing</td>
                    <td>{employees.filter(e => e.dept === 'Marketing' && e.status === 'Approved').length}</td>
                    <td>₹80,000</td>
                    <td>93%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Alert Center Module */}
      {currentModule === 'notification-system' && (
        <section id="hr-mod-notification-system" className="hr-module">
          <div className="card">
            <div className="card-title">HR Notification & Warning Center</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notifications.map(n => (
                <div key={n._id} style={{ padding: '15px', background: 'hsl(var(--bg-main))', borderRadius: '10px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <i className="fa-solid fa-bell" style={{ fontSize: '1.25rem', color: 'hsl(var(--primary))' }}></i>
                  <div>
                    <strong>{n.title}</strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.desc}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div style={{ color: 'var(--text-secondary)' }}>No alerts logged.</div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* System Settings Module */}
      {currentModule === 'settings-profile' && (
        <section id="hr-mod-settings-profile" className="hr-module">
          <div className="card">
            <div className="card-title">System Settings</div>
            <form onSubmit={(e) => { e.preventDefault(); showToast('Settings saved successfully.', 'success'); }}>
              <div className="form-group">
                <label>Portal Primary Access Name</label>
                <input type="text" className="form-control" defaultValue="TalentSphere HR Portal" />
              </div>
              <div className="form-group">
                <label>Automatic Payslip Release Date</label>
                <select className="form-control" defaultValue="1st of every Month">
                  <option>1st of every Month</option>
                  <option>30th of every Month</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Save Config</button>
            </form>
          </div>
        </section>
      )}

      {/* Modals Mounting */}
      <AddEmployeeModal
        active={addEmpActive}
        onClose={() => setAddEmpActive(false)}
        onSubmit={handleAddOrEditEmployee}
        employee={selectedEmpForEdit}
      />

      <LedgerModal
        active={ledgerActive}
        onClose={() => setLedgerActive(false)}
        employee={selectedEmpForLedger}
        timesheets={timesheets}
        leaves={leaves}
      />

      <StatsModal
        active={statsActive}
        onClose={() => setStatsActive(false)}
        employee={selectedEmpForStats}
        timesheets={timesheets}
        leaves={leaves}
      />

      <PayslipModal
        active={payslipActive}
        onClose={() => setPayslipActive(false)}
        employee={selectedEmpForPayslip}
        month={payslipMonth}
        onPrint={() => { showToast(`Payslip invoice sent to printer!`, 'success'); setPayslipActive(false); }}
      />

      <AddWalkinModal
        active={walkinActive}
        onClose={() => setWalkinActive(false)}
        onSubmit={handleAddWalkinCandidate}
      />
    </>
  );
};

export default HRApp;
