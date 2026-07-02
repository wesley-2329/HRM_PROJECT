import React, { useContext, useState, useEffect, useRef } from 'react';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../api';
import { getAvatarUrl } from '../App';
import OrgStructure from './OrgStructure';
import DocumentVault from './DocumentVault';
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
    tickets,
    warningLetters,
    fetchAllData,
    fetchEmployees,
    fetchLeaves,
    fetchTimesheets,
    fetchCandidates,
    fetchNotifications,
    fetchTickets,
    fetchWarningLetters
  } = useContext(DataContext);
  
  const { user, loadUser } = useContext(AuthContext);
  const { showToast } = useToast();

  // Expanded employee details dropdowns
  const [expandedEmpIds, setExpandedEmpIds] = useState({});
  const [ticketReplies, setTicketReplies] = useState({});

  // Profile states (for HR profile tab)
  const [profileTab, setProfileTab] = useState('personal');
  const [profileEditing, setProfileEditing] = useState(false);
  const [aadhaarMasked, setAadhaarMasked] = useState(true);

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileParentStatus, setProfileParentStatus] = useState(user?.parentStatus || 'No');
  const [profileDoor, setProfileDoor] = useState(user?.address?.door || '');
  const [profileStreet, setProfileStreet] = useState(user?.address?.street || '');
  const [profileCity, setProfileCity] = useState(user?.address?.city || '');
  const [profileState, setProfileState] = useState(user?.address?.state || '');
  const [profilePin, setProfilePin] = useState(user?.address?.pin || '');
  const [profileEmgName, setProfileEmgName] = useState(user?.emergency?.name || '');
  const [profileEmgRel, setProfileEmgRel] = useState(user?.emergency?.relation || '');
  const [profileEmgPhone, setProfileEmgPhone] = useState(user?.emergency?.phone || '');

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

  const fileInputRef = useRef(null);
  const [uploadTargetEmpId, setUploadTargetEmpId] = useState(null);

  // Filters and inner states
  const [empDeptFilter, setEmpDeptFilter] = useState('All');
  const [empRoleFilter, setEmpRoleFilter] = useState('All');
  const [selectedAtsSource, setSelectedAtsSource] = useState('All Sources');
  const [payslipEmpSelect, setPayslipEmpSelect] = useState('');

  // Clock In/Out state
  const [clockRunning, setClockRunning] = useState(false);
  const [clockInTime, setClockInTime] = useState('');
  const [clockOutTime, setClockOutTime] = useState('');
  const [stopwatchVal, setStopwatchVal] = useState('00:00:00');
  const [timeSeconds, setTimeSeconds] = useState(0);
  const timerRef = useRef(null);

  // HR Notes State
  const [hrNotes, setHrNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('General');
  const [editingNoteId, setEditingNoteId] = useState(null);

  // Charts references
  const hrAttendanceTrendsRef = useRef(null);
  const hrAttendanceByDayRef = useRef(null);
  const hrDeptDonutRef = useRef(null);
  const hrPayrollBarRef = useRef(null);
  const hrTotalOperationsRef = useRef(null);
  const hrLateArrivalsRef = useRef(null);
  
  const chartsInstanceRef = useRef({});

  // Sync data on load and module change
  useEffect(() => {
    fetchAllData();
    if (user && user.role === 'hr') {
      fetchHrNotes();
    }
  }, [currentModule]);

  // Set default selected employee for payslip once employees load
  useEffect(() => {
    if (employees.length > 0 && !payslipEmpSelect) {
      setPayslipEmpSelect(employees[0].id);
    }
  }, [employees]);

  // Set Profile Fields once user context loads
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileEmail(user.email || '');
      setProfilePhone(user.phone || '');
      setProfileParentStatus(user.parentStatus || 'No');
      setProfileDoor(user.address?.door || '');
      setProfileStreet(user.address?.street || '');
      setProfileCity(user.address?.city || '');
      setProfileState(user.address?.state || '');
      setProfilePin(user.address?.pin || '');
      setProfileEmgName(user.emergency?.name || '');
      setProfileEmgRel(user.emergency?.relation || '');
      setProfileEmgPhone(user.emergency?.phone || '');
    }
  }, [user]);

  const renderEmpProfileDetailsDropdown = (emp) => {
    return (
      <div className="emp-dropdown-details-panel" style={{
        marginTop: '12px',
        padding: '16px',
        background: 'hsl(var(--bg-main))',
        borderRadius: '8px',
        border: '1px solid hsl(var(--border))',
        fontSize: '0.8rem',
        textAlign: 'left',
        color: 'hsl(var(--text-primary))'
      }}>
        <h5 style={{ fontWeight: 700, marginBottom: '10px', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '6px', color: 'hsl(var(--primary))' }}>
          <i className="fa-solid fa-circle-info"></i> Personal Details
        </h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          <div><strong style={{ color: 'var(--text-secondary)' }}>Gender:</strong> {emp.gender || 'Not specified'}</div>
          <div><strong style={{ color: 'var(--text-secondary)' }}>Phone:</strong> {emp.phone || '--'}</div>
          <div><strong style={{ color: 'var(--text-secondary)' }}>Blood Group:</strong> {emp.blood || '--'}</div>
          <div><strong style={{ color: 'var(--text-secondary)' }}>Aadhaar:</strong> {emp.aadhaar || '--'}</div>
          <div><strong style={{ color: 'var(--text-secondary)' }}>Parent Status:</strong> {emp.parentStatus || 'No'}</div>
          <div style={{ gridColumn: 'span 2' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Address:</strong> {emp.address ? `${emp.address.door || ''}, ${emp.address.street || ''}, ${emp.address.city || ''}, ${emp.address.state || ''} - ${emp.address.pin || ''}` : '--'}
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Emergency Contact:</strong> {emp.emergency ? `${emp.emergency.name || ''} (${emp.emergency.relation || ''}) - ${emp.emergency.phone || ''}` : '--'}
          </div>
        </div>
        
        <h5 style={{ fontWeight: 700, marginBottom: '10px', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '6px', color: 'hsl(var(--primary))' }}>
          <i className="fa-solid fa-folder-open"></i> Employee Documents
        </h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
          {[
            'Offer Letter',
            'Appointment Letter',
            'Experience Letters',
            'Salary Slips',
            'Tax Documents',
            'ID Proof — Aadhaar Card',
            'PAN Card',
            'Driving License',
            'Previous Company Relieving Letter',
            'Certifications Log'
          ].map(docName => {
            const filePath = emp.documents ? (
              emp.documents instanceof Map ? emp.documents.get(docName) : emp.documents[docName]
            ) : null;
            return (
              <div key={docName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: 'hsla(var(--primary), 0.03)', border: '1px solid hsl(var(--border))', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.75rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px', fontWeight: 500 }} title={docName}>{docName}</span>
                {filePath ? (
                  <a 
                    href={`/${filePath}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn btn-primary" 
                    style={{ padding: '2px 8px', fontSize: '0.7rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <i className="fa-solid fa-file-arrow-down"></i> View
                  </a>
                ) : (
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Not uploaded</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Trigger count-up and module entry animations
  useEffect(() => {
    const moduleTimer = setTimeout(() => {
      const el = document.querySelector('.hr-module');
      if (el && window.animateModuleIn) {
        window.animateModuleIn(el);
      }
    }, 50);

    const countTimer = setTimeout(() => {
      const countElements = document.querySelectorAll('.hr-module .count-up');
      countElements.forEach(item => {
        const targetVal = parseFloat(item.getAttribute('data-target'));
        if (!isNaN(targetVal) && window.animateCountUp) {
          window.animateCountUp(item, targetVal);
        }
      });
    }, 150);

    return () => {
      clearTimeout(moduleTimer);
      clearTimeout(countTimer);
    };
  }, [currentModule]);

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
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
              { label: 'Present', data: [22, 21, 23, 22, 20, 15, 6], backgroundColor: 'rgba(16, 185, 129, 0.85)' },
              { label: 'Absent', data: [2, 3, 1, 2, 4, 9, 19], backgroundColor: 'rgba(244, 63, 94, 0.85)' }
            ]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }

      const ctxOps = hrTotalOperationsRef.current?.getContext('2d');
      if (ctxOps) {
        chartsInstanceRef.current.ops = new window.Chart(ctxOps, {
          type: 'line',
          data: {
            labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
            datasets: [{
              label: 'Total Operations Completed',
              data: [120, 145, 130, 165, 180, 210],
              borderColor: 'hsl(142, 72%, 29%)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.3
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }

      const ctxLate = hrLateArrivalsRef.current?.getContext('2d');
      if (ctxLate) {
        chartsInstanceRef.current.late = new window.Chart(ctxLate, {
          type: 'bar',
          data: {
            labels: ['Engineering', 'HR', 'Finance', 'Design', 'Marketing'],
            datasets: [{
              label: 'Late Entry Count',
              data: [4, 1, 2, 5, 8],
              backgroundColor: 'rgba(239, 68, 68, 0.85)'
            }]
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

  async function fetchHrNotes() {
    try {
      const res = await api.get('/hr-notes');
      setHrNotes(res.data);
    } catch (err) {
      console.error('Error fetching HR notes:', err);
    }
  }

  const handleCreateOrUpdateNote = async (e) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    try {
      if (editingNoteId) {
        await api.put(`/hr-notes/${editingNoteId}`, { title: newNoteTitle, content: newNoteContent, category: newNoteCategory });
        showToast('Confidential note updated successfully.', 'success');
      } else {
        await api.post('/hr-notes', { title: newNoteTitle, content: newNoteContent, category: newNoteCategory });
        showToast('Confidential note created successfully.', 'success');
      }
      setNewNoteTitle('');
      setNewNoteContent('');
      setNewNoteCategory('General');
      setEditingNoteId(null);
      fetchHrNotes();
    } catch (err) {
      showToast('Error saving confidential note.', 'error');
    }
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Are you sure you want to delete this confidential note?')) {
      try {
        await api.delete(`/hr-notes/${id}`);
        showToast('Confidential note deleted.', 'danger');
        fetchHrNotes();
      } catch (err) {
        showToast('Error deleting note.', 'error');
      }
    }
  };

  const getTicketStatusBadgeClass = (status) => {
    switch (status) {
      case 'Approved':
      case 'Closed':
        return 'badge-success';
      case 'Cancelled':
        return 'badge-danger';
      case 'Raised':
      case 'Open':
      default:
        return 'badge-warning';
    }
  };

  const getSalaryDetails = (role) => {
    let basic = 65000;
    const lowerRole = (role || '').toLowerCase();
    if (lowerRole.includes('director') || lowerRole === 'hr') {
      basic = 95000;
    } else if (lowerRole.includes('lead') || lowerRole.includes('manager')) {
      basic = 80000;
    } else if (lowerRole.includes('senior') || lowerRole.includes('analyst')) {
      basic = 70000;
    } else if (lowerRole.includes('engineer') || lowerRole.includes('developer')) {
      basic = 65000;
    }
    
    const hra = 15000;
    const other = 5000;
    const gross = basic + hra + other;
    
    const pf = Math.round(basic * 0.12);
    const profTax = 200;
    const tds = Math.round(gross * 0.10);
    const deductions = pf + profTax + tds;
    
    const net = gross - deductions;
    
    return { basic, hra, other, gross, pf, profTax, tds, deductions, net };
  };

  const triggerAvatarUpload = (empId) => {
    setUploadTargetEmpId(empId);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadTargetEmpId) return;

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('empId', uploadTargetEmpId);

    try {
      showToast('Uploading profile picture...', 'info');
      await api.post('/employees/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      showToast('Profile picture uploaded successfully.', 'success');
      fetchEmployees();
      if (uploadTargetEmpId === user.id && loadUser) {
        await loadUser();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to upload profile picture.', 'error');
    } finally {
      e.target.value = null;
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
        parentStatus: profileParentStatus,
        address: {
          door: profileDoor,
          street: profileStreet,
          city: profileCity,
          state: profileState,
          pin: profilePin
        },
        emergency: {
          name: profileEmgName,
          relation: profileEmgRel,
          phone: profileEmgPhone
        }
      };

      await api.put(`/employees/${user.id}`, updateData);
      showToast('Profile details updated.', 'success');
      setProfileEditing(false);
      loadUser();
    } catch (err) {
      console.error(err);
      showToast('Error updating profile.', 'error');
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

  const handleToggleTeamLead = async (id, isLead) => {
    try {
      await api.put(`/employees/${id}`, { isTeamLead: isLead });
      showToast(`Role power updated.`, 'success');
      fetchEmployees();
    } catch (err) {
      showToast('Error updating lead status', 'error');
    }
  };

  const handleChangeTeam = async (id, dept) => {
    try {
      await api.put(`/employees/${id}`, { dept });
      showToast(`Team updated to ${dept}.`, 'success');
      fetchEmployees();
    } catch (err) {
      showToast('Error changing team', 'error');
    }
  };

  const handleAssignTeamLead = async (id, leadId) => {
    try {
      await api.put(`/employees/${id}`, { teamLeadId: leadId });
      showToast(`Reports-to lead updated.`, 'success');
      fetchEmployees();
    } catch (err) {
      showToast('Error assigning team lead', 'error');
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
    const matchesRole = empRoleFilter === 'All' || (empRoleFilter === 'Leads' && emp.isTeamLead);
    return matchesSearch && matchesDept && matchesRole;
  });

  const pendingLeavesCount = leaves.filter(l => l.status === 'Pending').length;

  return (
    <div className="portal-container animate-fade-in-up">
      {/* Overview Module */}
      {currentModule === 'dashboard' && (
        <section id="hr-mod-dashboard" className="hr-module">
          <div className="welcome-card-banner">
            <div className="welcome-banner-text">
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'hsl(var(--text-primary))', marginBottom: '8px' }}>
                Welcome back, {user ? user.name.split(' ')[0] : 'HR Administrator'}!
              </h2>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem', lineHeight: 1.5 }}>
                You have administrative access to monitor employee directories, manage statutory PF/ESI compliance, approve timesheets, and review candidate applications.
              </p>
            </div>
            <div className="welcome-banner-img-container">
              <img src="/src/assets/welcome_banner_workspace.jpg" alt="Workspace Illustration" className="welcome-banner-img" />
            </div>
          </div>
          <div className="metric-grid">
            <div className="metric-card primary">
              <div>
                <span className="metric-label">Total Employees</span>
                <div className="metric-val"><span className="count-up" data-target={employees.length}>{employees.length}</span></div>
                <span className="metric-trend up"><i className="fa-solid fa-arrow-up"></i> +12% this quarter</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-user-group"></i></div>
            </div>
            <div className="metric-card success">
              <div>
                <span className="metric-label">Present Today</span>
                <div className="metric-val"><span className="count-up" data-target={timesheets.filter(t => t.date === new Date().toISOString().split('T')[0]).length}>{timesheets.filter(t => t.date === new Date().toISOString().split('T')[0]).length}</span></div>
                <span className="metric-trend up"><i className="fa-solid fa-check"></i> Live check-in</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-user-check"></i></div>
            </div>
            <div className="metric-card info">
              <div>
                <span className="metric-label">Total Employee Count</span>
                <div className="metric-val"><span className="count-up" data-target={employees.length}>{employees.length}</span></div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Across all departments</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-users"></i></div>
            </div>
            <div className="metric-card warning">
              <div>
                <span className="metric-label">Pending Leaves</span>
                <div className="metric-val"><span className="count-up" data-target={pendingLeavesCount}>{pendingLeavesCount}</span></div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Awaiting approval</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-clock-rotate-left"></i></div>
            </div>
          </div>

          <div className="dashboard-layout">
            <div className="lg:col-span-2">
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
            <div className="lg:col-span-1">
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

              {/* Secure HR Notepad Widget */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
                <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><i className="fa-solid fa-user-shield" style={{ marginRight: '8px', color: 'hsl(var(--primary))' }}></i>Secure HR Notepad</span>
                  {editingNoteId && <button className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: '0.7rem' }} onClick={() => { setEditingNoteId(null); setNewNoteTitle(''); setNewNoteContent(''); }}>Cancel</button>}
                </div>
                <form onSubmit={handleCreateOrUpdateNote} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
                    <input type="text" className="form-control" placeholder="Note Title..." value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} style={{ padding: '6px 10px', fontSize: '0.8rem' }} required />
                    <select className="form-control" value={newNoteCategory} onChange={(e) => setNewNoteCategory(e.target.value)} style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
                      <option value="General">General</option>
                      <option value="Review">Review</option>
                      <option value="Warning">Warning</option>
                      <option value="Legal">Legal</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" className="form-control" placeholder="Write confidential note here..." value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} style={{ padding: '6px 10px', fontSize: '0.8rem', flex: 1 }} required />
                    <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      {editingNoteId ? 'Update' : 'Save'}
                    </button>
                  </div>
                </form>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                  {hrNotes.map(note => (
                    <div key={note._id} style={{ padding: '8px 12px', background: 'hsl(var(--bg-main))', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '0.8rem' }}>
                      <div style={{ flex: 1, marginRight: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <strong>{note.title}</strong>
                          <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>{note.category}</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: '1.3' }}>{note.content}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-secondary" style={{ padding: '4px 6px', fontSize: '0.7rem' }} onClick={() => { setEditingNoteId(note._id); setNewNoteTitle(note.title); setNewNoteContent(note.content); setNewNoteCategory(note.category); }}><i className="fa-solid fa-pen"></i></button>
                        <button className="btn btn-secondary" style={{ padding: '4px 6px', fontSize: '0.7rem', color: 'hsl(var(--danger))' }} onClick={() => handleDeleteNote(note._id)}><i className="fa-solid fa-trash"></i></button>
                      </div>
                    </div>
                  ))}
                  {hrNotes.length === 0 && (
                    <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '20px', fontSize: '0.8rem' }}>No confidential notes saved.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* New Analytical Charts Row */}
          <div className="dashboard-layout" style={{ marginTop: '20px' }}>
            <div>
              <div className="card">
                <div className="card-title">Total Operations Completed (Last 6 Months)</div>
                <div className="chart-container">
                  <canvas ref={hrTotalOperationsRef}></canvas>
                </div>
              </div>
            </div>
            <div>
              <div className="card">
                <div className="card-title">Late Arrivals by Department</div>
                <div className="chart-container">
                  <canvas ref={hrLateArrivalsRef}></canvas>
                </div>
              </div>
            </div>
          </div>

          {/* Competitor Analysis Report Overview */}
          <div className="card" style={{ marginTop: '20px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-square-poll-horizontal" style={{ color: 'hsl(var(--primary))' }}></i>
              HR Intelligence: Competitive Benchmarking Overview
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', fontSize: '0.85rem' }}>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '10px' }}>TalentSphere vs Market Leaders</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '12px' }}>
                  Comparing core structures against leading HRMS platforms (Workday, BambooHR, Rippling, Gusto, and Personio).
                </p>
                <div className="table-responsive">
                  <table className="custom-table" style={{ fontSize: '0.75rem' }}>
                    <thead>
                      <tr>
                        <th>Brand</th>
                        <th>Target Segment</th>
                        <th>Core Edge</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Workday</strong></td>
                        <td>Enterprise</td>
                        <td>Deep analytics & planning</td>
                      </tr>
                      <tr>
                        <td><strong>BambooHR</strong></td>
                        <td>SMB</td>
                        <td>Employee onboarding & culture</td>
                      </tr>
                      <tr>
                        <td><strong>Rippling</strong></td>
                        <td>Tech Mid-market</td>
                        <td>App & device provisioning</td>
                      </tr>
                      <tr>
                        <td><strong>Gusto</strong></td>
                        <td>Small Business</td>
                        <td>1-click automated payroll</td>
                      </tr>
                      <tr>
                        <td><strong>Personio</strong></td>
                        <td>European SME</td>
                        <td>Localized compliance logs</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontWeight: 700 }}>Key Competitive Insights</h4>
                <div style={{ padding: '10px', background: 'hsl(var(--bg-main))', borderRadius: '8px' }}>
                  <strong>Compliance Automation:</strong> Localized credential alerts (inspired by Personio) keep organizations risk-free.
                </div>
                <div style={{ padding: '10px', background: 'hsl(var(--bg-main))', borderRadius: '8px' }}>
                  <strong>Engagement Focus:</strong> Integrated social chat & interactive trivia (inspired by BambooHR) drives daily active usage.
                </div>
                <div style={{ padding: '10px', background: 'hsl(var(--bg-main))', borderRadius: '8px' }}>
                  <strong>Clean Payroll:</strong> Focus on simplicity (inspired by Gusto) using a transparent HRA + Allowances structure.
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Org Structure Module */}
      {currentModule === 'org-structure' && (
        <section id="hr-mod-org-structure" className="hr-module">
          <OrgStructure mode="hr" />
        </section>
      )}

      {/* Document Vault Module */}
      {currentModule === 'document-vault' && (
        <section id="hr-mod-document-vault" className="hr-module">
          <DocumentVault mode="hr" />
        </section>
      )}

      {/* Employee Management Module */}
      {currentModule === 'employee-management' && (
        <section id="hr-mod-employee-management" className="hr-module">
          {/* Employee Directory Headcount Summary */}
          <div className="metric-grid" style={{ marginBottom: '20px' }}>
            <div className="metric-card primary" style={{ padding: '16px' }}>
              <div>
                <span className="metric-label">Total Staff Headcount</span>
                <div className="metric-val" style={{ fontSize: '1.8rem' }}>{employees.length}</div>
              </div>
              <div className="metric-icon-box" style={{ width: '40px', height: '40px' }}><i className="fa-solid fa-users"></i></div>
            </div>
            {['Engineering', 'Human Resources', 'Finance', 'Design', 'Marketing'].map(dept => {
              const count = employees.filter(e => e.dept === dept).length;
              return (
                <div key={dept} className="metric-card info" style={{ padding: '16px' }}>
                  <div>
                    <span className="metric-label">{dept}</span>
                    <div className="metric-val" style={{ fontSize: '1.8rem' }}>{count}</div>
                  </div>
                  <div className="metric-icon-box" style={{ width: '40px', height: '40px' }}><i className="fa-solid fa-sitemap"></i></div>
                </div>
              );
            })}
          </div>

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
              <select className="form-control" style={{ width: '180px' }} value={empRoleFilter} onChange={(e) => setEmpRoleFilter(e.target.value)}>
                <option value="All">All Staff</option>
                <option value="Leads">Team Leads Only</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={() => { setSelectedEmpForEdit(null); setAddEmpActive(true); }}><i className="fa-solid fa-plus"></i> Add Employee</button>
          </div>
          
          <h3 style={{ marginBottom: '16px' }}>Core Employees Grid</h3>
          <div className="emp-grid">
            {filteredEmployees.map(emp => (
              <div key={emp.id} className="emp-card">
                <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto' }}>
                  <img src={getAvatarUrl(emp)} alt={emp.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                  <button 
                    type="button"
                    onClick={() => triggerAvatarUpload(emp.id)} 
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      background: 'hsl(var(--primary))',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}
                    title="Upload picture"
                  >
                    <i className="fa-solid fa-camera" style={{ fontSize: '0.75rem' }}></i>
                  </button>
                </div>
                <div className="emp-card-name" style={{ marginTop: '12px' }}>{emp.name}</div>
                <div className="emp-card-role">{emp.role}</div>
                <div className="emp-card-badges" style={{ flexWrap: 'wrap', justifyContent: 'center', gap: '4px' }}>
                  <span className="badge badge-primary">{emp.dept}</span>
                  <span className={`badge ${emp.status === 'Approved' ? 'badge-success' : emp.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{emp.status}</span>
                  {emp.isTeamLead && (
                    <span className="badge" style={{
                      background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #a855f7 100%)',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      <i className="fa-solid fa-crown" style={{ fontSize: '0.65rem' }}></i> Lead
                    </span>
                  )}
                  {!emp.isTeamLead && emp.teamLeadId && (
                    <span className="badge" style={{
                      background: 'hsl(var(--bg-main))',
                      color: 'var(--text-secondary)',
                      border: '1px solid hsl(var(--border))',
                      fontSize: '0.65rem',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      <i className="fa-solid fa-user-tie" style={{ fontSize: '0.6rem' }}></i> Lead: {employees.find(e => e.id === emp.teamLeadId)?.name || emp.teamLeadId}
                    </span>
                  )}
                </div>

                <div className="team-mgmt-panel" style={{
                  marginTop: '12px',
                  padding: '10px',
                  background: 'hsl(var(--bg-main))',
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Power:</span>
                    <select 
                      value={emp.isTeamLead ? 'lead' : 'regular'} 
                      onChange={(e) => handleToggleTeamLead(emp.id, e.target.value === 'lead')}
                      className="form-control"
                      style={{ padding: '2px 6px', fontSize: '0.75rem', width: '100px', height: '24px', background: 'transparent', border: '1px solid hsl(var(--border))', borderRadius: '4px' }}
                    >
                      <option value="regular">Regular</option>
                      <option value="lead">Team Lead</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Team:</span>
                    <select 
                      value={emp.dept} 
                      onChange={(e) => handleChangeTeam(emp.id, e.target.value)}
                      className="form-control"
                      style={{ padding: '2px 6px', fontSize: '0.75rem', width: '100px', height: '24px', background: 'transparent', border: '1px solid hsl(var(--border))', borderRadius: '4px' }}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Human Resources">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>

                  {!emp.isTeamLead && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Lead:</span>
                      <select 
                        value={emp.teamLeadId || ''} 
                        onChange={(e) => handleAssignTeamLead(emp.id, e.target.value)}
                        className="form-control"
                        style={{ padding: '2px 6px', fontSize: '0.75rem', width: '100px', height: '24px', background: 'transparent', border: '1px solid hsl(var(--border))', borderRadius: '4px' }}
                      >
                        <option value="">None</option>
                        {employees
                          .filter(e => e.isTeamLead && e.id !== emp.id)
                          .map(lead => (
                            <option key={lead.id} value={lead.id}>{lead.name}</option>
                          ))
                        }
                      </select>
                    </div>
                  )}
                </div>

                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} 
                  onClick={() => setExpandedEmpIds(prev => ({ ...prev, [emp.id]: !prev[emp.id] }))}
                >
                  <i className={`fa-solid ${expandedEmpIds[emp.id] ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                  {expandedEmpIds[emp.id] ? 'Hide Details' : 'View Details & Docs'}
                </button>
                {expandedEmpIds[emp.id] && renderEmpProfileDetailsDropdown(emp)}

                <button className="btn btn-secondary" style={{ width: '100%', marginTop: '8px' }} onClick={() => { setSelectedEmpForLedger(emp); setLedgerActive(true); }}>View Ledger</button>
                <div className="emp-card-actions">
                  <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => { setSelectedEmpForEdit(emp); setAddEmpActive(true); }}><i className="fa-solid fa-pen"></i></button>
                  <button className="btn btn-secondary" style={{ padding: '6px 10px', color: 'hsl(var(--danger))' }} onClick={() => handleDeleteEmployee(emp.id)}><i className="fa-solid fa-trash"></i></button>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: '30px', marginBottom: '16px' }}>Comprehensive Employee Roster</h3>
          {(() => {
            const leadsToRender = employees.filter(lead => {
              if (!lead.isTeamLead) return false;
              const matchesLead = filteredEmployees.some(e => e.id === lead.id);
              const matchesReports = filteredEmployees.some(e => e.teamLeadId === lead.id && !e.isTeamLead);
              return matchesLead || matchesReports;
            });
            const unassignedEmployees = filteredEmployees.filter(e => !e.isTeamLead && !e.teamLeadId);

            return (
              <>
                {leadsToRender.map(lead => {
                  const reports = filteredEmployees.filter(e => e.teamLeadId === lead.id && !e.isTeamLead);
                  
                  return (
                    <div key={lead.id} className="card" style={{ 
                      borderLeft: '4px solid hsl(var(--primary))', 
                      marginBottom: '24px', 
                      padding: '20px',
                      background: 'hsl(var(--bg-card))',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '12px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <img src={getAvatarUrl(lead)} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} alt="lead" />
                          <div>
                            <h4 style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {lead.name}
                              <span className="badge" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #a855f7 100%)', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px' }}>TEAM LEAD</span>
                            </h4>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {lead.id} | Department: {lead.dept} | Role: {lead.role}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Lead Management:</span>
                          <select 
                            value="lead"
                            onChange={(e) => handleToggleTeamLead(lead.id, e.target.value === 'lead')}
                            className="form-control"
                            style={{ padding: '2px 4px', fontSize: '0.7rem', width: '90px', height: '24px', background: 'transparent', border: '1px solid hsl(var(--border))', borderRadius: '4px' }}
                          >
                            <option value="regular">Regular</option>
                            <option value="lead">Lead</option>
                          </select>
                          <select 
                            value={lead.dept}
                            onChange={(e) => handleChangeTeam(lead.id, e.target.value)}
                            className="form-control"
                            style={{ padding: '2px 4px', fontSize: '0.7rem', width: '90px', height: '24px', background: 'transparent', border: '1px solid hsl(var(--border))', borderRadius: '4px' }}
                          >
                            <option value="Engineering">Engineering</option>
                            <option value="Human Resources">HR</option>
                            <option value="Finance">Finance</option>
                            <option value="Design">Design</option>
                            <option value="Marketing">Marketing</option>
                          </select>
                        </div>
                      </div>
                      <div className="table-responsive">
                        <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                          <thead>
                            <tr>
                              <th>Profile</th>
                              <th>Department</th>
                              <th>Role</th>
                              <th>Email</th>
                              <th>Joining Date</th>
                              <th>Status</th>
                              <th>Team Management</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reports.length === 0 ? (
                              <tr>
                                <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '16px' }}>
                                  No direct reports found matching filters.
                                </td>
                              </tr>
                            ) : (
                              reports.map(emp => (
                                <React.Fragment key={emp.id}>
                                  <tr style={{ background: expandedEmpIds[emp.id] ? 'hsla(var(--primary), 0.02)' : 'transparent' }}>
                                    <td>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <img src={getAvatarUrl(emp)} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} alt="avatar" />
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
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '180px' }}>
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'space-between' }}>
                                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Power:</span>
                                          <select 
                                            value={emp.isTeamLead ? 'lead' : 'regular'} 
                                            onChange={(e) => handleToggleTeamLead(emp.id, e.target.value === 'lead')}
                                            className="form-control"
                                            style={{ padding: '2px 4px', fontSize: '0.7rem', width: '90px', height: '22px', background: 'transparent', border: '1px solid hsl(var(--border))', borderRadius: '4px' }}
                                          >
                                            <option value="regular">Regular</option>
                                            <option value="lead">Lead</option>
                                          </select>
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'space-between' }}>
                                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Team:</span>
                                          <select 
                                            value={emp.dept} 
                                            onChange={(e) => handleChangeTeam(emp.id, e.target.value)}
                                            className="form-control"
                                            style={{ padding: '2px 4px', fontSize: '0.7rem', width: '90px', height: '22px', background: 'transparent', border: '1px solid hsl(var(--border))', borderRadius: '4px' }}
                                          >
                                            <option value="Engineering">Engineering</option>
                                            <option value="Human Resources">HR</option>
                                            <option value="Finance">Finance</option>
                                            <option value="Design">Design</option>
                                            <option value="Marketing">Marketing</option>
                                          </select>
                                        </div>
 
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'space-between' }}>
                                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lead:</span>
                                          <select 
                                            value={emp.teamLeadId || ''} 
                                            onChange={(e) => handleAssignTeamLead(emp.id, e.target.value)}
                                            className="form-control"
                                            style={{ padding: '2px 4px', fontSize: '0.7rem', width: '90px', height: '22px', background: 'transparent', border: '1px solid hsl(var(--border))', borderRadius: '4px' }}
                                          >
                                            <option value="">None</option>
                                            {employees
                                              .filter(e => e.isTeamLead && e.id !== emp.id)
                                              .map(lead => (
                                                <option key={lead.id} value={lead.id}>{lead.name}</option>
                                              ))
                                            }
                                          </select>
                                        </div>
                                      </div>
                                    </td>
                                    <td>
                                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                        {emp.status !== 'Approved' && <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem' }} onClick={() => handleUpdateEmployeeStatus(emp.id, 'Approved')}>Approve</button>}
                                        {emp.status !== 'Rejected' && <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'hsl(var(--danger))' }} onClick={() => handleUpdateEmployeeStatus(emp.id, 'Rejected')}>Reject</button>}
                                        <button 
                                          className="btn btn-secondary" 
                                          style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} 
                                          onClick={() => setExpandedEmpIds(prev => ({ ...prev, [emp.id]: !prev[emp.id] }))}
                                          title="View details & documents"
                                        >
                                          <i className={`fa-solid ${expandedEmpIds[emp.id] ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                                          Details
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                  {expandedEmpIds[emp.id] && (
                                    <tr>
                                      <td colSpan="8" style={{ padding: '15px', background: 'hsla(var(--primary), 0.01)', borderTop: 'none' }}>
                                        {renderEmpProfileDetailsDropdown(emp)}
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}

                {unassignedEmployees.length > 0 && (
                  <div className="card" style={{ 
                    borderLeft: '4px solid hsl(var(--border))', 
                    marginBottom: '24px', 
                    padding: '20px',
                    background: 'hsl(var(--bg-card))',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ borderBottom: '1px solid hsl(var(--border))', paddingBottom: '12px', marginBottom: '16px' }}>
                      <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--text-secondary)' }}>Independent / General Staff</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Staff members not assigned to any team lead.</span>
                    </div>
                    <div className="table-responsive">
                      <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                        <thead>
                          <tr>
                            <th>Profile</th>
                            <th>Department</th>
                            <th>Role</th>
                            <th>Email</th>
                            <th>Joining Date</th>
                            <th>Status</th>
                            <th>Team Management</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {unassignedEmployees.map(emp => (
                            <React.Fragment key={emp.id}>
                              <tr style={{ background: expandedEmpIds[emp.id] ? 'hsla(var(--primary), 0.02)' : 'transparent' }}>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <img src={getAvatarUrl(emp)} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} alt="avatar" />
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
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '180px' }}>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Power:</span>
                                      <select 
                                        value={emp.isTeamLead ? 'lead' : 'regular'} 
                                        onChange={(e) => handleToggleTeamLead(emp.id, e.target.value === 'lead')}
                                        className="form-control"
                                        style={{ padding: '2px 4px', fontSize: '0.7rem', width: '90px', height: '22px', background: 'transparent', border: '1px solid hsl(var(--border))', borderRadius: '4px' }}
                                      >
                                        <option value="regular">Regular</option>
                                        <option value="lead">Lead</option>
                                      </select>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Team:</span>
                                      <select 
                                        value={emp.dept} 
                                        onChange={(e) => handleChangeTeam(emp.id, e.target.value)}
                                        className="form-control"
                                        style={{ padding: '2px 4px', fontSize: '0.7rem', width: '90px', height: '22px', background: 'transparent', border: '1px solid hsl(var(--border))', borderRadius: '4px' }}
                                      >
                                        <option value="Engineering">Engineering</option>
                                        <option value="Human Resources">HR</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Design">Design</option>
                                        <option value="Marketing">Marketing</option>
                                      </select>
                                    </div>

                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lead:</span>
                                      <select 
                                        value={emp.teamLeadId || ''} 
                                        onChange={(e) => handleAssignTeamLead(emp.id, e.target.value)}
                                        className="form-control"
                                        style={{ padding: '2px 4px', fontSize: '0.7rem', width: '90px', height: '22px', background: 'transparent', border: '1px solid hsl(var(--border))', borderRadius: '4px' }}
                                      >
                                        <option value="">None</option>
                                        {employees
                                          .filter(e => e.isTeamLead && e.id !== emp.id)
                                          .map(lead => (
                                            <option key={lead.id} value={lead.id}>{lead.name}</option>
                                          ))
                                        }
                                      </select>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    {emp.status !== 'Approved' && <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem' }} onClick={() => handleUpdateEmployeeStatus(emp.id, 'Approved')}>Approve</button>}
                                    {emp.status !== 'Rejected' && <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'hsl(var(--danger))' }} onClick={() => handleUpdateEmployeeStatus(emp.id, 'Rejected')}>Reject</button>}
                                    <button 
                                      className="btn btn-secondary" 
                                      style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} 
                                      onClick={() => setExpandedEmpIds(prev => ({ ...prev, [emp.id]: !prev[emp.id] }))}
                                      title="View details & documents"
                                    >
                                      <i className={`fa-solid ${expandedEmpIds[emp.id] ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                                      Details
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              {expandedEmpIds[emp.id] && (
                                <tr>
                                  <td colSpan="8" style={{ padding: '15px', background: 'hsla(var(--primary), 0.01)', borderTop: 'none' }}>
                                    {renderEmpProfileDetailsDropdown(emp)}
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
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
                <div className="card-title">Salary & Parent Status Audit Roster</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {employees.filter(e => e.status === 'Approved').map(emp => {
                    const sal = getSalaryDetails(emp.role);
                    return (
                      <div key={emp.id} style={{ padding: '15px', border: '1px solid hsl(var(--border))', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{emp.name}</strong>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>
                            Dept: {emp.dept} | Parent Status: {emp.parentStatus || 'No'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 700, color: 'hsl(var(--primary))', display: 'block' }}>₹{sal.net.toLocaleString()}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Net Disbursed</span>
                        </div>
                      </div>
                    );
                  })}
                  {employees.filter(e => e.status === 'Approved').length === 0 && (
                    <div style={{ color: 'var(--text-secondary)' }}>No approved employees available.</div>
                  )}
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
                <div key={n._id} style={{ padding: '15px', background: 'hsl(var(--bg-main))', borderRadius: '10px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <i className="fa-solid fa-bell" style={{ fontSize: '1.25rem', color: 'hsl(var(--primary))', marginTop: '3px' }}></i>
                  <div style={{ flex: 1 }}>
                    <strong>{n.title}</strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.desc}</p>
                    {n.ticketId && (
                      <div style={{ marginTop: '8px', paddingLeft: '10px', borderLeft: '2px solid hsl(var(--primary))' }}>
                        {(() => {
                          const relatedTicket = tickets.find(t => t.id === n.ticketId);
                          const isClosed = relatedTicket ? relatedTicket.status === 'Closed' : false;
                          if (isClosed) {
                            return (
                              <div style={{ fontSize: '0.8rem', color: 'hsl(var(--success))' }}>
                                <i className="fa-solid fa-circle-check"></i> Ticket Closed. HR Response: <em>"{relatedTicket.response}"</em>
                              </div>
                            );
                          }
                          return (
                            <form onSubmit={async (e) => {
                              e.preventDefault();
                              const replyText = ticketReplies[n.ticketId] || '';
                              if (!replyText.trim()) {
                                showToast('Please enter a response.', 'error');
                                return;
                              }
                              try {
                                await api.put(`/tickets/${n.ticketId}`, { response: replyText, status: 'Closed' });
                                showToast('Ticket replied and closed successfully.', 'success');
                                setTicketReplies(prev => ({ ...prev, [n.ticketId]: '' }));
                                fetchAllData(); // refresh tickets and notifications
                              } catch (err) {
                                showToast('Error replying to ticket.', 'error');
                              }
                            }} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginTop: '8px', flexWrap: 'wrap' }}>
                              <div style={{ flex: '1', minWidth: '200px' }}>
                                <textarea
                                  className="form-control"
                                  placeholder="Type reply to employee..."
                                  rows="2"
                                  style={{ width: '100%', fontSize: '0.8rem', padding: '6px', borderRadius: '4px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                                  value={ticketReplies[n.ticketId] || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setTicketReplies(prev => ({ ...prev, [n.ticketId]: val }));
                                  }}
                                  required
                                />
                              </div>
                              <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', height: 'fit-content' }}>
                                <i className="fa-solid fa-reply"></i> Send & Close
                              </button>
                            </form>
                          );
                        })()}
                      </div>
                    )}
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

      {/* Compliance Hub Module */}
      {currentModule === 'compliance-management' && (
        <section id="hr-mod-compliance-management" className="hr-module">
          <div className="dashboard-layout">
            {/* Warning Letter Form */}
            <div className="card">
              <div className="card-title">Issue Formal Warning Letter</div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const empId = e.target.elements.warningEmpId.value;
                const subject = e.target.elements.warningSubject.value;
                const reason = e.target.elements.warningReason.value;
                try {
                  await api.post('/warning-letters', { empId, subject, reason });
                  showToast('Warning letter issued successfully.', 'success');
                  e.target.reset();
                  fetchWarningLetters();
                } catch (err) {
                  showToast(err.response?.data?.message || 'Error issuing warning letter.', 'error');
                }
              }}>
                <div className="form-group">
                  <label>Select Employee</label>
                  <select name="warningEmpId" className="form-control" required>
                    <option value="">Choose Employee...</option>
                    {employees.filter(e => e.status === 'Approved').map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Violation Subject</label>
                  <input type="text" name="warningSubject" className="form-control" placeholder="e.g. Repeated Late Attendance" required />
                </div>
                <div className="form-group">
                  <label>Detailed Reason</label>
                  <textarea name="warningReason" className="form-control" style={{ height: '100px' }} placeholder="e.g. Employee failed to log hours punctually despite repeated notifications." required />
                </div>
                <button type="submit" className="btn btn-primary">Issue Warning</button>
              </form>
            </div>

            {/* License Expiry Alerts */}
            <div className="card">
              <div className="card-title">License & Professional Credentials Tracking</div>
              <div className="table-responsive">
                <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>License Number</th>
                      <th>Expiry Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.filter(e => e.status === 'Approved').map(emp => {
                      const hasLicense = emp.licenseNumber && emp.licenseExpiry;
                      const isExpired = hasLicense && new Date(emp.licenseExpiry) < new Date();
                      return (
                        <tr key={emp.id}>
                          <td><strong>{emp.name}</strong></td>
                          <td>{emp.licenseNumber || 'Not Uploaded'}</td>
                          <td>{emp.licenseExpiry || 'N/A'}</td>
                          <td>
                            {hasLicense ? (
                              <span className={`badge ${isExpired ? 'badge-danger' : 'badge-success'}`}>
                                {isExpired ? 'Expired' : 'Active'}
                              </span>
                            ) : (
                              <span className="badge badge-secondary">Pending</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Certifications Tracker */}
          <div className="card" style={{ marginTop: '20px' }}>
            <div className="card-title">Employee Certifications Roster</div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Certifications Count</th>
                    <th>Certification Names</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.filter(e => e.status === 'Approved').map(emp => {
                    const certs = emp.certifications || [];
                    return (
                      <tr key={emp.id}>
                        <td><strong>{emp.id}</strong></td>
                        <td>{emp.name}</td>
                        <td><span className="badge badge-primary">{certs.length}</span></td>
                        <td>{certs.map(c => c.name).join(', ') || 'No certifications registered'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Issued Warning Letters History */}
          <div className="card" style={{ marginTop: '20px' }}>
            <div className="card-title">Warning Letter Issue Logs</div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Subject</th>
                    <th>Issue Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {warningLetters.map(wl => (
                    <tr key={wl._id}>
                      <td><strong>{wl.empName} ({wl.empId})</strong></td>
                      <td>{wl.subject}</td>
                      <td>{wl.date}</td>
                      <td>
                        <span className={`badge ${wl.status === 'Acknowledged' ? 'badge-success' : 'badge-danger'}`}>
                          {wl.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {warningLetters.length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: 'center' }}>No warning letters logged.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Support Tickets Module */}
      {currentModule === 'hr-tickets' && (
        <section id="hr-mod-support-tickets" className="hr-module">
          <div className="card">
            <div className="card-title">Support Ticket Review Board</div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Employee</th>
                    <th>Subject</th>
                    <th>Priority</th>
                    <th>Raised On</th>
                    <th>Status</th>
                    <th>Actions / Response</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket._id}>
                      <td><strong>{ticket.id}</strong></td>
                      <td>{ticket.empName || ticket.empId}</td>
                      <td>{ticket.title}</td>
                      <td>
                        <span className={`badge ${ticket.priority === 'High' ? 'badge-danger' : ticket.priority === 'Medium' ? 'badge-warning' : 'badge-success'}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td>{ticket.raisedOn}</td>
                      <td>
                        <span className={`badge ${getTicketStatusBadgeClass(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td>
                        {ticket.status === 'Raised' || ticket.status === 'Open' ? (
                          <form onSubmit={async (e) => {
                            e.preventDefault();
                            const responseText = e.target.elements.responseText.value;
                            const action = e.target.elements.action.value; // 'Approved' or 'Cancelled'
                            try {
                              await api.put(`/tickets/${ticket._id}`, { status: action, response: responseText });
                              showToast(`Ticket status updated to ${action}.`, 'success');
                              fetchTickets();
                            } catch (err) {
                              showToast('Error updating ticket.', 'error');
                            }
                          }} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input type="text" name="responseText" className="form-control" placeholder="HR Response Comment" style={{ padding: '4px 8px', fontSize: '0.8rem', width: '150px' }} required />
                            <select name="action" className="form-control" style={{ padding: '4px 8px', fontSize: '0.8rem', width: '100px' }}>
                              <option value="Approved">Approve</option>
                              <option value="Cancelled">Cancel</option>
                            </select>
                            <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Submit</button>
                          </form>
                        ) : (
                          <div style={{ fontSize: '0.85rem' }}>
                            <strong>HR Response:</strong> {ticket.response || '--'}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {tickets.length === 0 && (
                    <tr><td colSpan="7" style={{ textAlign: 'center' }}>No support tickets logged.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* HR Profile View */}
      {currentModule === 'hr-profile' && (
        <section id="hr-mod-hr-profile" className="hr-module">
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <button className={`btn ${profileTab === 'personal' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setProfileTab('personal')}>Personal Info</button>
            <button className={`btn ${profileTab === 'professional' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setProfileTab('professional')}>Professional Info</button>
          </div>

          {profileTab === 'personal' && (
            <div id="profile-tab-personal">
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid hsl(var(--border))' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={getAvatarUrl(user)} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid hsl(var(--primary))' }} alt="profile" />
                    <button 
                      type="button"
                      onClick={() => triggerAvatarUpload(user.id)} 
                      style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        background: 'hsl(var(--primary))',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                      }}
                      title="Upload picture"
                    >
                      <i className="fa-solid fa-camera" style={{ fontSize: '0.85rem' }}></i>
                    </button>
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.25rem', margin: 0 }}>{user?.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '4px 0 0 0' }}>{user?.role} | {user?.dept}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '2px 0 0 0' }}>Emp ID: {user?.id}</p>
                  </div>
                </div>

                <div className="card-title">Personal Details</div>
                <form onSubmit={handleUpdateProfile}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Employee ID</label>
                      <p style={{ fontWeight: 700, marginTop: '4px' }}>{user?.id}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Full Name</label>
                      <input type="text" className="form-control" value={profileName} onChange={(e) => setProfileName(e.target.value)} readOnly={!profileEditing} style={{ marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Email Address</label>
                      <input type="email" className="form-control" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} readOnly={!profileEditing} style={{ marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Phone Number</label>
                      <input type="text" className="form-control" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} readOnly={!profileEditing} style={{ marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Door / Flat No</label>
                      <input type="text" className="form-control" value={profileDoor} onChange={(e) => setProfileDoor(e.target.value)} readOnly={!profileEditing} style={{ marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Street / Area</label>
                      <input type="text" className="form-control" value={profileStreet} onChange={(e) => setProfileStreet(e.target.value)} readOnly={!profileEditing} style={{ marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>City</label>
                      <input type="text" className="form-control" value={profileCity} onChange={(e) => setProfileCity(e.target.value)} readOnly={!profileEditing} style={{ marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>State</label>
                      <input type="text" className="form-control" value={profileState} onChange={(e) => setProfileState(e.target.value)} readOnly={!profileEditing} style={{ marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PIN Code</label>
                      <input type="text" className="form-control" value={profilePin} onChange={(e) => setProfilePin(e.target.value)} readOnly={!profileEditing} style={{ marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Emergency Contact</label>
                      <input type="text" className="form-control" value={profileEmgName} onChange={(e) => setProfileEmgName(e.target.value)} readOnly={!profileEditing} style={{ marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Relation</label>
                      <input type="text" className="form-control" value={profileEmgRel} onChange={(e) => setProfileEmgRel(e.target.value)} readOnly={!profileEditing} style={{ marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Blood Group</label>
                      <p style={{ fontWeight: 700, marginTop: '4px' }}>{user?.blood || '--'}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Aadhaar Number</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p style={{ fontWeight: 700 }}>{aadhaarMasked ? 'XXXX-XXXX-XXXX' : user?.aadhaar}</p>
                        <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setAadhaarMasked(!aadhaarMasked)}><i className="fa-solid fa-eye"></i></button>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Parent Status</label>
                      {profileEditing ? (
                        <select className="form-control" value={profileParentStatus} onChange={(e) => setProfileParentStatus(e.target.value)} style={{ marginTop: '4px' }}>
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      ) : (
                        <p style={{ fontWeight: 700, marginTop: '4px' }}>{user?.parentStatus || 'No'}</p>
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                    {!profileEditing ? (
                      <button type="button" className="btn btn-primary" onClick={() => setProfileEditing(true)}>Edit Profile</button>
                    ) : (
                      <>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setProfileEditing(false)}>Cancel</button>
                      </>
                    )}
                    <button type="button" className="btn btn-secondary" onClick={() => triggerAvatarUpload(user.id)}>Upload Profile Picture</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {profileTab === 'professional' && (
            <div id="profile-tab-professional">
              <div className="card">
                <div className="card-title">Professional Context (Read Only)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Department</span>
                    <p style={{ fontWeight: 600, marginTop: '4px' }}>{user?.dept}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Designation</span>
                    <p style={{ fontWeight: 600, marginTop: '4px' }}>{user?.role}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Reporting Manager</span>
                    <p style={{ fontWeight: 600, marginTop: '4px' }}>--</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Joining Date</span>
                    <p style={{ fontWeight: 600, marginTop: '4px' }}>{user?.joined}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Employment Type</span>
                    <p style={{ fontWeight: 600, marginTop: '4px' }}>Full-Time (Permanent)</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>HR Status</span>
                    <p style={{ marginTop: '4px' }}><span className="badge badge-success">{user?.status}</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card" style={{ marginTop: '20px' }}>
            <div className="card-title">My Tickets</div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Subject</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Raised On</th>
                    <th>HR Response</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.filter(t => user && t.empId === user.id).map(t => (
                    <tr key={t._id}>
                      <td><strong>{t.id}</strong></td>
                      <td>{t.title}</td>
                      <td>{t.category}</td>
                      <td><span className={`badge ${getTicketStatusBadgeClass(t.status)}`}>{t.status}</span></td>
                      <td>{t.raisedOn}</td>
                      <td>{t.response || '--'}</td>
                    </tr>
                  ))}
                  {tickets.filter(t => user && t.empId === user.id).length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>No tickets raised.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ marginTop: '20px' }}>
            <div className="card-title">Warning Letters / Compliance Logs</div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {warningLetters.filter(warning => user && warning.empId === user.id).map(warning => (
                    <tr key={warning._id}>
                      <td><strong>{warning.date}</strong></td>
                      <td>{warning.subject}</td>
                      <td>{warning.reason}</td>
                      <td>
                        <span className={`badge ${warning.status === 'Acknowledged' ? 'badge-success' : 'badge-danger'}`}>
                          {warning.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {warningLetters.filter(warning => user && warning.empId === user.id).length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: 'center' }}>No compliance warning letters issued.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* System Settings Module */}
      {currentModule === 'settings-profile' && (
        <section id="hr-mod-settings-profile" className="hr-module">
          <div className="split-layout-2col">
            {/* Left Info Panel */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="card-title">System Settings & Safety</div>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '20px' }}>
                Configure global settings, define automated payslip cycles, select header highlighting color themes, and update administrative credentials.
              </p>
              <img src="/src/assets/secure_vault_illustration.jpg" alt="Security Illustration" className="illustration-card-img" />
            </div>

            {/* Right Forms Column */}
            <div>
              <div className="card">
                <div className="card-title">System Settings</div>
                <form onSubmit={(e) => { e.preventDefault(); showToast('Settings saved successfully.', 'success'); }}>
                  <div className="form-group">
                    <label>Portal Primary Access Name</label>
                    <input type="text" className="form-control" defaultValue="TalentSphere HR Portal" />
                  </div>
                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label>Automatic Payslip Release Date</label>
                    <select className="form-control" defaultValue="1st of every Month">
                      <option>1st of every Month</option>
                      <option>30th of every Month</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginTop: '16px', marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Navbar Color Theme</label>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      {['indigo', 'slate', 'emerald', 'rose', 'amber', 'violet'].map(t => {
                        const currentTheme = localStorage.getItem('talentsphere-navbar-theme') || 'indigo';
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              localStorage.setItem('talentsphere-navbar-theme', t);
                              if (window.changeNavbarTheme) window.changeNavbarTheme(t);
                              showToast(`Navbar theme changed to ${t.toUpperCase()}`, 'success');
                              // Force re-render of settings panel to update selection outline
                              setCurrentModule('');
                              setTimeout(() => setCurrentModule('settings-profile'), 5);
                            }}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              border: currentTheme === t ? '3px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                              boxShadow: currentTheme === t ? '0 0 0 3px #6366f1' : '0 0 0 1px rgba(0,0,0,0.15)',
                              cursor: 'pointer',
                              background: t === 'indigo' ? '#6366f1' :
                                          t === 'slate' ? '#64748b' :
                                          t === 'emerald' ? '#10b981' :
                                          t === 'rose' ? '#f43f5e' :
                                          t === 'amber' ? '#f59e0b' : '#8b5cf6',
                              transition: 'all 0.2s ease',
                              transform: currentTheme === t ? 'scale(1.1)' : 'scale(1)'
                            }}
                            title={t.toUpperCase()}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Save Config</button>
                </form>
              </div>

              <div className="card">
                <div className="card-title">Change HR Password</div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const cur = e.target.elements.currentPassword.value;
                  const nxt = e.target.elements.newPassword.value;
                  try {
                    await api.post('/auth/change-password', { currentPassword: cur, newPassword: nxt });
                    showToast('Password updated successfully.', 'success');
                    e.target.reset();
                  } catch (err) {
                    showToast(err.response?.data?.message || 'Error updating password.', 'error');
                  }
                }}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input type="password" name="currentPassword" className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input type="password" name="newPassword" className="form-control" required />
                  </div>
                  <button className="btn btn-primary">Update Password</button>
                </form>
              </div>
            </div>
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

      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleAvatarFileChange} 
      />
    </div>
  );
};

export default HRApp;
