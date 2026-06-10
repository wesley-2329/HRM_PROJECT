import { useContext, useState, useEffect, useRef } from 'react';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../api';
import {
  RaiseTicketModal,
  JoinMeetingModal,
  AddTaskModal,
  PayslipModal
} from '../components/Modals';

const EmployeeApp = ({ currentModule, setCurrentModule }) => {
  const {
    leaves,
    tasks,
    tickets,
    meetings,
    trainings,
    timesheets,
    chatMessages,
    notifications,
    fetchAllData,
    fetchLeaves,
    fetchTasks,
    fetchTickets,
    fetchMeetings,
    fetchTrainings,
    fetchTimesheets,
    fetchChatMessages,
    fetchNotifications
  } = useContext(DataContext);
  
  const { user, loadUser } = useContext(AuthContext);
  const { showToast } = useToast();
  const [selectedEmpForPayslip, setSelectedEmpForPayslip] = useState(user);

  const getDuration = (startStr, endStr) => {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) ? 1 : diffDays;
  };

  const getSalaryDetails = (empRole) => {
    let basic = 65000;
    const lowerRole = (empRole || '').toLowerCase();
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
    const medical = 5000;
    const gross = basic + hra + medical;
    
    const pf = Math.round(basic * 0.12);
    const profTax = 250;
    const tds = Math.round(basic * 0.0723);
    const deductions = pf + profTax + tds;
    const net = gross - deductions;
    
    return { basic, hra, medical, gross, pf, profTax, tds, deductions, net };
  };

  const presentDaysCount = timesheets.filter(t => t.status === 'Punctual' || t.status === 'Late Entry').length;
  const leavesTakenDays = leaves
    .filter(l => l.status === 'Approved')
    .reduce((total, l) => total + getDuration(l.start, l.end), 0);

  const salary = getSalaryDetails(user?.role);

  // Profile Edit State
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileDoor, setProfileDoor] = useState(user?.address?.door || '');
  const [profileStreet, setProfileStreet] = useState(user?.address?.street || '');
  const [profileCity, setProfileCity] = useState(user?.address?.city || '');
  const [profileState, setProfileState] = useState(user?.address?.state || '');
  const [profilePin, setProfilePin] = useState(user?.address?.pin || '');
  const [profileEmgName, setProfileEmgName] = useState(user?.emergency?.name || '');
  const [profileEmgRel, setProfileEmgRel] = useState(user?.emergency?.relation || '');
  const [profileEmgPhone, setProfileEmgPhone] = useState(user?.emergency?.phone || '');

  const [aadhaarMasked, setAadhaarMasked] = useState(true);
  const [profileTab, setProfileTab] = useState('personal'); // 'personal' or 'professional'

  // Modals state
  const [raiseTicketActive, setRaiseTicketActive] = useState(false);
  const [joinMeetingActive, setJoinMeetingActive] = useState(false);
  const [addTaskActive, setAddTaskActive] = useState(false);
  const [payslipActive, setPayslipActive] = useState(false);
  const [payslipMonth, setPayslipMonth] = useState('May 2026');

  // Inner sub-tabs
  const [attSubTab, setAttSubTab] = useState('overview'); // 'overview', 'apply', 'history', 'timesheet', 'analysis'
  const [notifCategoryFilter, setNotifCategoryFilter] = useState('All');

  // Input states
  const [leaveType, setLeaveType] = useState('Casual');
  const [leaveFrom, setLeaveFrom] = useState('');
  const [leaveTo, setLeaveTo] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketCategory, setTicketCategory] = useState('HR Query');
  const [ticketPriority, setTicketPriority] = useState('Low');
  const [ticketDesc, setTicketDesc] = useState('');

  // New Meeting Form States
  const [meetingMode, setMeetingMode] = useState('schedule');
  const [newMeetTitle, setNewMeetTitle] = useState('');
  const [newMeetDate, setNewMeetDate] = useState('');
  const [newMeetTime, setNewMeetTime] = useState('');
  const [newMeetLink, setNewMeetLink] = useState('');
  const [newMeetEmpIds, setNewMeetEmpIds] = useState('');

  // Documents Upload State
  const [uploadedDocs, setUploadedDocs] = useState({});

  const handleDocUpload = (docName, file) => {
    if (file) {
      setUploadedDocs(prev => ({
        ...prev,
        [docName]: file.name
      }));
      showToast(`${docName} uploaded successfully.`, 'success');
    }
  };

  const [chatInput, setChatInput] = useState('');
  const [chatTyping, setChatTyping] = useState(false);
  const chatMessagesEndRef = useRef(null);

  const [dailyReportVal, setDailyReportVal] = useState('');
  const [activePolicies, setActivePolicies] = useState({});

  // Live Punch Clock Timer
  const activeShift = timesheets.find(t => t.clockOut === '');
  const [elapsedTimeStr, setElapsedTimeStr] = useState('00:00:00');

  const getClockInDateTime = (shift) => {
    if (!shift || !shift.date || !shift.clockIn) return null;
    const [year, month, day] = shift.date.split('-').map(Number);
    const cleanTime = shift.clockIn.replace(/[.]/g, ':').trim();
    const match = cleanTime.match(/^(\d+):(\d+)(?:\s*(AM|PM))?$/i);
    if (!match) return new Date(shift.date);
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3];
    if (ampm) {
      if (ampm.toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    return new Date(year, month - 1, day, hours, minutes, 0);
  };

  useEffect(() => {
    if (!activeShift) {
      setElapsedTimeStr('00:00:00');
      return;
    }

    const updateTimer = () => {
      const clockInDate = getClockInDateTime(activeShift);
      if (!clockInDate) return;
      const diffMs = new Date() - clockInDate;
      if (diffMs < 0) {
        setElapsedTimeStr('00:00:00');
        return;
      }
      const diffSecs = Math.floor(diffMs / 1000);
      const hrs = Math.floor(diffSecs / 3600);
      const mins = Math.floor((diffSecs % 3600) / 60);
      const secs = diffSecs % 60;
      const pad = (n) => String(n).padStart(2, '0');
      setElapsedTimeStr(`${pad(hrs)}:${pad(mins)}:${pad(secs)}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeShift]);

  const handleClockIn = async () => {
    try {
      await api.post('/timesheet/clock-in');
      showToast('Successfully clocked in for today.', 'success');
      fetchTimesheets();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error clocking in.', 'error');
    }
  };

  const handleClockOut = async () => {
    try {
      await api.post('/timesheet/clock-out');
      showToast('Successfully clocked out.', 'success');
      fetchTimesheets();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error clocking out.', 'error');
    }
  };

  const renderPunchClockCard = () => (
    <div className="card punch-clock-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="card-title" style={{ marginBottom: 0 }}>Attendance Punch Clock</div>
        {activeShift ? (
          <span className="badge badge-success" style={{ animation: 'pulse 2s infinite' }}>
            <i className="fa-solid fa-circle-dot" style={{ marginRight: '6px' }}></i> Active Shift
          </span>
        ) : (
          <span className="badge badge-secondary">Logged Out</span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', margin: '15px 0' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current Status</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '5px' }}>
            {activeShift ? 'Clocked In' : 'Clocked Out'}
          </div>
        </div>
        <div style={{ width: '1px', height: '40px', background: 'var(--border)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Shift Timer</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'monospace', color: activeShift ? 'hsl(var(--success))' : 'var(--text-primary)', marginTop: '5px' }}>
            {elapsedTimeStr}
          </div>
        </div>
      </div>

      {activeShift && (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '-5px' }}>
          <i className="fa-solid fa-arrow-right-to-bracket" style={{ marginRight: '6px' }}></i> Clocked in at {activeShift.clockIn}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          className="btn btn-primary" 
          style={{ flex: 1, padding: '12px' }} 
          disabled={!!activeShift} 
          onClick={handleClockIn}
        >
          <i className="fa-solid fa-fingerprint" style={{ marginRight: '8px' }}></i> Punch In
        </button>
        <button 
          className="btn btn-danger" 
          style={{ flex: 1, padding: '12px' }} 
          disabled={!activeShift} 
          onClick={handleClockOut}
        >
          <i className="fa-solid fa-arrow-right-from-bracket" style={{ marginRight: '8px' }}></i> Punch Out
        </button>
      </div>
    </div>
  );

  const renderCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const calendarDays = [];
    for (let i = 0; i < startOffset; i++) {
      calendarDays.push({ day: null, dateStr: '' });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      calendarDays.push({ day: i, dateStr });
    }
    
    return (
      <div className="card">
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Monthly Calendar ({today.toLocaleString('default', { month: 'long', year: 'numeric' })})</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>* Clock in/out indicator</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontWeight: 600 }}>
          {['M','T','W','T','F','S','S'].map((w, idx) => (
            <div key={idx} style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '4px' }}>{w}</div>
          ))}
          {calendarDays.map((cell, idx) => {
            if (!cell.day) {
              return <div key={idx} style={{ padding: '8px' }}></div>;
            }
            
            const log = timesheets.find(t => t.date === cell.dateStr);
            let cellStyle = {};
            let tooltip = '';
            const isToday = cell.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            
            if (isToday) {
              cellStyle.border = '2px solid hsl(var(--primary))';
            }
            
            if (log) {
              if (log.clockOut) {
                cellStyle.background = 'hsla(var(--success), 0.15)';
                cellStyle.color = 'hsl(var(--success))';
                tooltip = `Worked: ${log.hours}h (${log.clockIn} - ${log.clockOut})`;
              } else {
                cellStyle.background = 'hsla(var(--warning), 0.15)';
                cellStyle.color = 'hsl(var(--warning))';
                tooltip = `Active Shift since ${log.clockIn}`;
              }
            } else {
              const dayOfWeek = new Date(year, month, cell.day).getDay();
              if (dayOfWeek === 0 || dayOfWeek === 6) {
                cellStyle.background = 'hsl(var(--border))';
                cellStyle.color = 'var(--text-secondary)';
                tooltip = 'Weekend';
              } else if (new Date(year, month, cell.day) < today) {
                cellStyle.background = 'hsla(var(--danger), 0.1)';
                cellStyle.color = 'hsl(var(--danger))';
                tooltip = 'Absent';
              }
            }
            
            return (
              <div 
                key={idx} 
                title={tooltip}
                style={{ 
                  padding: '8px', 
                  borderRadius: '50%', 
                  fontSize: '0.85rem', 
                  cursor: tooltip ? 'pointer' : 'default',
                  position: 'relative',
                  ...cellStyle 
                }}
              >
                {cell.day}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMeetingsCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const calendarDays = [];
    for (let i = 0; i < startOffset; i++) {
      calendarDays.push({ day: null, dateStr: '' });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      calendarDays.push({ day: i, dateStr });
    }
    
    return (
      <div className="card">
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Meetings Calendar ({today.toLocaleString('default', { month: 'long', year: 'numeric' })})</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>* Click day to join meetings</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontWeight: 600 }}>
          {['M','T','W','T','F','S','S'].map((w, idx) => (
            <div key={idx} style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '4px' }}>{w}</div>
          ))}
          {calendarDays.map((cell, idx) => {
            if (!cell.day) {
              return <div key={idx} style={{ padding: '8px' }}></div>;
            }
            
            const dayMeetings = meetings.filter(m => m.date === cell.dateStr);
            let cellStyle = {};
            let tooltip = '';
            
            const isToday = cell.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            
            if (isToday) {
              cellStyle.border = '2px solid hsl(var(--primary))';
            }
            
            if (dayMeetings.length > 0) {
              cellStyle.background = 'hsla(var(--warning), 0.15)';
              cellStyle.color = 'hsl(var(--warning))';
              cellStyle.fontWeight = 'bold';
              tooltip = dayMeetings.map(m => `${m.title} at ${m.time}`).join('\n');
            }
            
            return (
              <div 
                key={idx} 
                title={tooltip}
                onClick={() => {
                  if (dayMeetings.length > 0) {
                    handleJoinMeetingCheck(dayMeetings[0]);
                  }
                }}
                style={{ 
                  padding: '8px', 
                  borderRadius: '50%', 
                  fontSize: '0.85rem', 
                  cursor: dayMeetings.length > 0 ? 'pointer' : 'default',
                  position: 'relative',
                  ...cellStyle 
                }}
              >
                {cell.day}
                {dayMeetings.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    bottom: '2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: 'hsl(var(--warning))'
                  }}></span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Canvas references for charts
  const empAttendanceDonutRef = useRef(null);
  const empHoursLineRef = useRef(null);
  const empAnalysisBarRef = useRef(null);
  const empDeductionPieRef = useRef(null);
  const empEarningsBarRef = useRef(null);
  const empLearningLineRef = useRef(null);
  
  const chartsInstanceRef = useRef({});

  // Sync data
  useEffect(() => {
    fetchAllData();
  }, [currentModule]);

  // Set Profile Fields once user context loads
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileEmail(user.email || '');
      setProfilePhone(user.phone || '');
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

  // Scroll chat messages
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handle charts rendering
  useEffect(() => {
    if (!window.Chart) return;

    // Destroy previous chart instances to prevent canvas reuse errors
    Object.keys(chartsInstanceRef.current).forEach(key => {
      if (chartsInstanceRef.current[key]) chartsInstanceRef.current[key].destroy();
    });

    if (currentModule === 'emp-dashboard') {
      const ctxDonut = empAttendanceDonutRef.current?.getContext('2d');
      if (ctxDonut) {
        chartsInstanceRef.current.dashboardDonut = new window.Chart(ctxDonut, {
          type: 'doughnut',
          data: {
            labels: ['Present', 'Absent', 'Leave'],
            datasets: [{
              data: [
                presentDaysCount || 22,
                timesheets.filter(t => t.status === 'Absent').length || 1,
                leavesTakenDays || 1
              ],
              backgroundColor: ['#10b981', '#f4637e', '#f59e0b']
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }

      const ctxLine = empHoursLineRef.current?.getContext('2d');
      if (ctxLine) {
        chartsInstanceRef.current.dashboardLine = new window.Chart(ctxLine, {
          type: 'line',
          data: {
            labels: timesheets.length > 0 ? timesheets.slice(-7).map(t => new Date(t.date).toLocaleDateString(undefined, { weekday: 'short' })) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              label: 'Working Hours',
              data: timesheets.length > 0 ? timesheets.slice(-7).map(t => t.hours) : [9.0, 8.8, 9.1, 8.9, 8.8, 0, 0],
              borderColor: 'hsl(230, 80%, 55%)',
              tension: 0.2,
              fill: true,
              backgroundColor: 'rgba(99, 102, 241, 0.05)'
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
    }

    if (currentModule === 'emp-attendance' && attSubTab === 'analysis') {
      const ctxBar = empAnalysisBarRef.current?.getContext('2d');
      if (ctxBar) {
        chartsInstanceRef.current.attendanceAnalysis = new window.Chart(ctxBar, {
          type: 'bar',
          data: {
            labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
            datasets: [{
              label: 'Attendance rate %',
              data: [95, 96, 94, 98, 92, 95],
              backgroundColor: 'rgba(99, 102, 241, 0.8)'
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
    }

    if (currentModule === 'emp-payroll') {
      const ctxPie = empDeductionPieRef.current?.getContext('2d');
      if (ctxPie) {
        chartsInstanceRef.current.payrollPie = new window.Chart(ctxPie, {
          type: 'pie',
          data: {
            labels: ['Provident Fund', 'Professional Tax', 'Income Tax (TDS)'],
            datasets: [{
              data: [salary.pf, salary.profTax, salary.tds],
              backgroundColor: ['#6366f1', '#f59e0b', '#f4637e']
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }

      const ctxBar = empEarningsBarRef.current?.getContext('2d');
      if (ctxBar) {
        chartsInstanceRef.current.payrollBar = new window.Chart(ctxBar, {
          type: 'bar',
          data: {
            labels: ['Basic', 'HRA', 'Medical'],
            datasets: [{
              label: 'Monthly Breakup',
              data: [salary.basic, salary.hra, salary.medical],
              backgroundColor: 'rgba(16, 185, 129, 0.8)'
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
    }

    if (currentModule === 'emp-learning') {
      const ctxLine = empLearningLineRef.current?.getContext('2d');
      if (ctxLine) {
        chartsInstanceRef.current.learningLine = new window.Chart(ctxLine, {
          type: 'line',
          data: {
            labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Wk 8'],
            datasets: [{
              label: 'Completed Modules',
              data: [1, 2, 4, 4, 6, 7, 9, 12],
              borderColor: 'hsl(158, 64%, 42%)',
              tension: 0.2
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
    }
  }, [currentModule, attSubTab]);

  // Edit personal profile details
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
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
      showToast('Error updating profile.', 'error');
    }
  };

  // Leave Submit
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves', {
        type: leaveType,
        start: leaveFrom,
        end: leaveTo,
        reason: leaveReason
      });
      showToast('Leave request submitted successfully.', 'success');
      setLeaveFrom(''); setLeaveTo(''); setLeaveReason('');
      fetchLeaves();
      setAttSubTab('history');
    } catch (err) {
      showToast('Error applying for leave.', 'error');
    }
  };

  const handleCancelLeave = async (id) => {
    try {
      await api.delete(`/leaves/${id}`);
      showToast('Leave request cancelled.', 'info');
      fetchLeaves();
    } catch (err) {
      showToast('Error cancelling leave request.', 'error');
    }
  };

  // Ticket submissions
  const handleRaiseTicketSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tickets', {
        title: ticketTitle,
        category: ticketCategory,
        priority: ticketPriority,
        description: ticketDesc
      });
      showToast('Support ticket raised.', 'success');
      setTicketTitle(''); setTicketDesc('');
      setRaiseTicketActive(false);
      fetchTickets();
      if (currentModule !== 'emp-profile') {
        setCurrentModule('emp-profile');
      }
    } catch (err) {
      showToast('Error raising ticket.', 'error');
    }
  };

  const getMeetingDateTime = (m) => {
    if (!m || !m.date || !m.time) return null;
    const [year, month, day] = m.date.split('-').map(Number);
    const cleanTime = m.time.replace(/[.]/g, ':').trim();
    const match = cleanTime.match(/^(\d+):(\d+)(?:\s*(AM|PM))?$/i);
    if (!match) return new Date(m.date);
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3];
    if (ampm) {
      if (ampm.toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    return new Date(year, month - 1, day, hours, minutes, 0);
  };

  const handleJoinMeetingCheck = (m) => {
    const meetingDate = getMeetingDateTime(m);
    if (!meetingDate) {
      showToast('Invalid meeting date or time.', 'error');
      return;
    }

    const now = new Date();
    
    // Within 15 minutes before (15 * 60 * 1000 = 900000 ms)
    // Up to 2 hours after (2 * 60 * 60 * 1000 = 7200000 ms)
    const startTime = new Date(meetingDate.getTime() - 15 * 60 * 1000);
    const endTime = new Date(meetingDate.getTime() + 2 * 60 * 60 * 1000);

    if (now < startTime) {
      showToast(`Meeting is not active yet. You can only join from 15 minutes before the scheduled time (${m.time}).`, 'warning');
      return;
    }

    if (now > endTime) {
      showToast('This meeting session has already ended.', 'error');
      return;
    }

    const link = m.link || "https://meet.talentsphere.company/join/tck-standup";
    showToast(`Joining meeting: ${m.title}...`, 'success');
    window.open(link, '_blank');
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();

    let title = newMeetTitle;
    let date = newMeetDate;
    let time = newMeetTime;
    
    const today = new Date();
    const YYYY = today.getFullYear();
    const MM = String(today.getMonth() + 1).padStart(2, '0');
    const DD = String(today.getDate()).padStart(2, '0');
    const hh = String(today.getHours()).padStart(2, '0');
    const mm = String(today.getMinutes()).padStart(2, '0');

    if (meetingMode === 'instant') {
      title = `Instant Sync by ${user?.name || 'Employee'}`;
      date = `${YYYY}-${MM}-${DD}`;
      time = `${hh}:${mm}`;
    }

    if (!title.trim() && meetingMode === 'schedule') {
      showToast('Please specify a meeting title.', 'error');
      return;
    }
    if (!date && meetingMode === 'schedule') {
      showToast('Please specify a scheduled date.', 'error');
      return;
    }
    if (!time && meetingMode === 'schedule') {
      showToast('Please specify a scheduled time.', 'error');
      return;
    }

    const link = newMeetLink.trim() || `https://meet.talentsphere.company/join/sync-${Math.random().toString(36).substring(7)}`;

    try {
      await api.post('/meetings', {
        title,
        host: user?.name || 'Employee',
        date,
        time,
        type: 'Online',
        empId: newMeetEmpIds.trim() || user?.id,
        link
      });

      showToast(meetingMode === 'instant' ? 'Instant meeting started successfully.' : 'Meeting scheduled successfully.', 'success');
      
      // Reset form
      setNewMeetTitle('');
      setNewMeetDate('');
      setNewMeetTime('');
      setNewMeetLink('');
      setNewMeetEmpIds('');

      fetchMeetings();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error creating meeting.', 'error');
    }
  };

  // Chat message submit
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const msg = chatInput.trim();
    setChatInput('');
    setChatTyping(true);

    try {
      await api.post('/chat', { message: msg });
      fetchChatMessages();
    } catch (err) {
      showToast('Error sending chat.', 'error');
    } finally {
      setChatTyping(false);
    }
  };

  // Task Kanban Status Update (Drag & Drop mock or click move)
  const handleMoveTaskStatus = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      showToast(`Task status updated to ${status.toUpperCase()}`, 'success');
      fetchTasks();
    } catch (err) {
      showToast('Error updating task status.', 'error');
    }
  };

  const handleAddTaskSubmit = async (formData) => {
    try {
      await api.post('/tasks', formData);
      showToast('New task added.', 'success');
      setAddTaskActive(false);
      fetchTasks();
    } catch (err) {
      showToast('Error creating task.', 'error');
    }
  };

  const handleDailyReportSubmit = (e) => {
    e.preventDefault();
    showToast('Daily work report submitted successfully.', 'success');
    setDailyReportVal('');
  };

  // Notifications
  const handleMarkAllNotifsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      showToast('All notifications marked read.', 'success');
      fetchNotifications();
    } catch (err) {
      showToast('Error updating alerts.', 'error');
    }
  };

  const togglePolicyAccordion = (idx) => {
    setActivePolicies(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Filter lists
  const filteredNotifs = notifications.filter(n => {
    if (notifCategoryFilter === 'All') return true;
    return n.type === notifCategoryFilter;
  });

  const activeTasksCount = tasks.filter(t => t.status !== 'done').length;

  return (
    <>
      {/* 1. Dashboard View */}
      {currentModule === 'emp-dashboard' && (
        <section id="emp-mod-emp-dashboard" className="emp-module">
          <div className="card" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #4f46e5 100%)', color: '#fff', border: 'none', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '4px' }}>Welcome to TalentSphere Employee Portal</h3>
                <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>Today is {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }} className="quick-links">
                <button className="btn btn-secondary" style={{ color: '#fff', background: 'rgba(255,255,255,0.15)', border: 'none' }} onClick={() => setCurrentModule('emp-profile')}>My Profile</button>
                <button className="btn btn-secondary" style={{ color: '#fff', background: 'rgba(255,255,255,0.15)', border: 'none' }} onClick={() => setRaiseTicketActive(true)}>Raise Ticket</button>
                <button className="btn btn-secondary" style={{ color: '#fff', background: 'rgba(255,255,255,0.15)', border: 'none' }} onClick={() => { setCurrentModule('emp-attendance'); setAttSubTab('apply'); }}>Apply Leave</button>
                <button className="btn btn-secondary" style={{ color: '#fff', background: 'rgba(255,255,255,0.15)', border: 'none' }} onClick={() => { setSelectedEmpForPayslip(user); setPayslipActive(true); }}>View Payslip</button>
              </div>
            </div>
          </div>

          <div className="metric-grid">
            <div className="metric-card primary">
              <div>
                <span className="metric-label">Attendance This Month</span>
                <div className="metric-val">{presentDaysCount}/{timesheets.length || 24} Days</div>
                <span className="badge badge-success">Punctual</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-calendar-check"></i></div>
            </div>
            <div className="metric-card success">
              <div>
                <span className="metric-label">Leave Balance</span>
                <div className="metric-val">{Math.max(0, 15 - leavesTakenDays)} Days</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Earned & Casual</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-plane"></i></div>
            </div>
            <div className="metric-card info">
              <div>
                <span className="metric-label">Pending Tasks</span>
                <div className="metric-val">{activeTasksCount}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Assigned tasks</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-list-check"></i></div>
            </div>
            <div className="metric-card warning">
              <div>
                <span className="metric-label">Upcoming Meetings</span>
                <div className="metric-val">{meetings.filter(m => m.status === 'Scheduled').length} Meetings</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Scheduled for today</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-video"></i></div>
            </div>
          </div>

          <div className="dashboard-layout">
            <div>
              {renderPunchClockCard()}
              <div className="card">
                <div className="card-title">Attendance Ratio Breakdown</div>
                <div className="chart-container">
                  <canvas ref={empAttendanceDonutRef}></canvas>
                </div>
              </div>
              <div className="card">
                <div className="card-title">Working Hours Trend (Last 7 Days)</div>
                <div className="chart-container">
                  <canvas ref={empHoursLineRef}></canvas>
                </div>
              </div>
              <div className="card">
                <div className="card-title">Assigned Tasks</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {tasks.slice(0, 3).map(t => {
                    const priorityColor = t.priority === 'High' ? 'badge-danger' : t.priority === 'Medium' ? 'badge-warning' : 'badge-success';
                    return (
                      <div key={t._id} style={{ padding: '12px', background: 'hsl(var(--bg-main))', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{t.title}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Due: {t.due} | Project: {t.project}</div>
                        </div>
                        <span className={`badge ${priorityColor}`}>{t.priority}</span>
                      </div>
                    );
                  })}
                  {tasks.length === 0 && (
                    <div style={{ color: 'var(--text-secondary)' }}>No tasks assigned.</div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="card">
                <div className="card-title">Upcoming Meetings</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {meetings.map(m => {
                    let cardStyle = {
                      background: 'hsla(var(--warning), 0.15)',
                      borderLeft: '4px solid hsl(var(--warning))'
                    };
                    if (m.status === 'Attended') {
                      cardStyle = {
                        background: 'hsla(var(--success), 0.15)',
                        borderLeft: '4px solid hsl(var(--success))'
                      };
                    } else if (m.status === 'Missed') {
                      cardStyle = {
                        background: 'hsla(var(--danger), 0.15)',
                        borderLeft: '4px solid hsl(var(--danger))'
                      };
                    }

                    return (
                      <div key={m._id} style={{ padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...cardStyle }}>
                        <div>
                          <strong>{m.title}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Host: {m.host} | Time: {m.time}</div>
                        </div>
                        <span className="badge badge-primary">{m.type}</span>
                      </div>
                    );
                  })}
                  {meetings.length === 0 && (
                    <div style={{ color: 'var(--text-secondary)' }}>No meetings scheduled.</div>
                  )}
                </div>
              </div>
              <div className="card">
                <div className="card-title">Training Reminders</div>
                {trainings.length > 0 ? (
                  <div style={{ background: 'hsl(var(--bg-main))', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                    <strong>{trainings[0].name}</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 12px 0' }}>Assigned by {trainings[0].assignedBy} | Due: {trainings[0].deadline}</p>
                    <div style={{ height: '6px', background: 'hsl(var(--border))', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
                      <div style={{ width: `${trainings[0].progress}%`, height: '100%', backgroundColor: 'hsl(var(--primary))' }}></div>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setCurrentModule('emp-learning')}>View Course</button>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-secondary)' }}>No active trainings assigned.</div>
                )}
              </div>
              <div className="card">
                <div className="card-title">Latest Notifications</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {notifications.slice(0, 3).map(n => (
                    <div key={n._id} style={{ padding: '8px', borderBottom: '1px solid hsl(var(--border))', fontSize: '0.8rem' }}>
                      <strong>{n.title}</strong> - <span style={{ color: 'var(--text-secondary)' }}>{n.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-title">Performance & PIP Overview</div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                    <span>Current Rating: 4.2 / 5.0</span>
                    <span className="badge badge-success">PIP Status: Not Initiated</span>
                  </div>
                  <div style={{ color: 'var(--warning)', fontSize: '0.95rem', marginBottom: '12px' }}>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star-half-stroke"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Profile View */}
      {currentModule === 'emp-profile' && (
        <section id="emp-mod-emp-profile" className="emp-module">
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <button className={`btn ${profileTab === 'personal' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setProfileTab('personal')}>Personal Info</button>
            <button className={`btn ${profileTab === 'professional' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setProfileTab('professional')}>Professional Info</button>
          </div>

          {profileTab === 'personal' && (
            <div id="profile-tab-personal">
              <div className="card">
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
                      <p style={{ fontWeight: 700, marginTop: '4px' }}>{user?.blood}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Aadhaar Number</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p style={{ fontWeight: 700 }}>{aadhaarMasked ? 'XXXX-XXXX-XXXX' : user?.aadhaar}</p>
                        <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setAadhaarMasked(!aadhaarMasked)}><i className="fa-solid fa-eye"></i></button>
                      </div>
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
                    <button type="button" className="btn btn-secondary" onClick={() => showToast('Profile image updated.', 'success')}>Upload Profile Picture</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setRaiseTicketActive(true)}>Raise Ticket</button>
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
                    <p style={{ fontWeight: 600, marginTop: '4px' }}>Priya Nair</p>
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

          <div className="card">
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
                  {tickets.map(t => (
                    <tr key={t._id}>
                      <td><strong>{t.id}</strong></td>
                      <td>{t.title}</td>
                      <td>{t.category}</td>
                      <td><span className={`badge ${t.status === 'Open' ? 'badge-warning' : 'badge-success'}`}>{t.status}</span></td>
                      <td>{t.raisedOn}</td>
                      <td>{t.response || '--'}</td>
                    </tr>
                  ))}
                  {tickets.length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>No tickets raised.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 3. Documents View */}
      {currentModule === 'emp-documents' && (
        <section id="emp-mod-emp-documents" className="emp-module">
          <div className="emp-grid">
            {[
              { name: 'Offer Letter', status: 'Available', icon: 'fa-file-contract', givenByHr: true },
              { name: 'Appointment Letter', status: 'Available', icon: 'fa-file-signature', givenByHr: true },
              { name: 'Experience Letters', status: 'Available', icon: 'fa-file-circle-check', givenByHr: true },
              { name: 'Salary Slips', status: 'Available', icon: 'fa-file-invoice-dollar', link: 'emp-payroll', givenByHr: true },
              { name: 'Tax Documents', status: 'Upload Required', icon: 'fa-receipt', upload: true },
              { name: 'ID Proof — Aadhaar Card', status: 'Upload Required', icon: 'fa-id-card', upload: true },
              { name: 'PAN Card', status: 'Upload Required', icon: 'fa-credit-card', upload: true },
              { name: 'Driving License', status: 'Upload Required', icon: 'fa-car', upload: true },
              { name: 'Previous Company Relieving Letter', status: 'Upload Required', icon: 'fa-briefcase', upload: true },
              { name: 'Certifications Log', status: 'Upload Required', icon: 'fa-certificate', upload: true }
            ].map((d, idx) => {
              const isUploaded = !!uploadedDocs[d.name];
              const docStatus = isUploaded ? `Uploaded (${uploadedDocs[d.name]})` : d.status;
              return (
                <div key={idx} className="emp-card" style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div className="metric-icon-box" style={{ background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', width: '40px', height: '40px' }}><i className={`fa-solid ${d.icon}`}></i></div>
                    <div>
                      <strong>{d.name}</strong>
                      <p style={{ fontSize: '0.75rem', color: isUploaded ? 'hsl(var(--success))' : 'var(--text-secondary)' }}>{docStatus}</p>
                    </div>
                  </div>
                  {d.upload ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                      <input 
                        type="file" 
                        id={`upload-${idx}`} 
                        style={{ display: 'none' }} 
                        onChange={(e) => handleDocUpload(d.name, e.target.files[0])} 
                      />
                      <button 
                        className="btn btn-primary" 
                        style={{ width: '100%' }} 
                        onClick={() => document.getElementById(`upload-${idx}`).click()}
                      >
                        {isUploaded ? 'Re-upload File' : 'Upload File'}
                      </button>
                      {isUploaded && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ width: '100%' }} 
                          onClick={() => showToast(`Downloading ${uploadedDocs[d.name]}...`, 'info')}
                        >
                          Download Uploaded
                        </button>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ width: '100%' }} 
                        onClick={() => showToast(`Downloading ${d.name}...`, 'info')}
                      >
                        Download
                      </button>
                      {d.link && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ width: '100%' }} 
                          onClick={() => setCurrentModule(d.link)}
                        >
                          View Payslips
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Attendance View */}
      {currentModule === 'emp-attendance' && (
        <section id="emp-mod-emp-attendance" className="emp-module">
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button className={`btn ${attSubTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttSubTab('overview')}>Overview</button>
            <button className={`btn ${attSubTab === 'apply' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttSubTab('apply')}>Apply Leave</button>
            <button className={`btn ${attSubTab === 'history' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttSubTab('history')}>Leave History</button>
            <button className={`btn ${attSubTab === 'timesheet' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttSubTab('timesheet')}>Timesheet</button>
            <button className={`btn ${attSubTab === 'analysis' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttSubTab('analysis')}>Analysis</button>
          </div>

          {attSubTab === 'overview' && (
            <div id="emp-att-sect-overview">
              <div className="dashboard-layout">
                <div>
                  {renderPunchClockCard()}
                  {renderCalendar()}
                </div>
                <div>
                  <div className="card">
                    <div className="card-title">Upcoming Holidays</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { name: 'Republic Day', date: '26 Jan 2026' },
                        { name: 'Good Friday', date: '18 Apr 2026' },
                        { name: 'Labour Day', date: '01 May 2026' },
                        { name: 'Independence Day', date: '15 Aug 2026' },
                        { name: 'Gandhi Jayanti', date: '02 Oct 2026' }
                      ].map((h, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '8px' }}>
                          <span>{h.name}</span><strong style={{ color: 'hsl(var(--primary))' }}>{h.date}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {attSubTab === 'apply' && (
            <div id="emp-att-sect-apply">
              <div className="card">
                <div className="card-title">Request Leave</div>
                <form onSubmit={handleApplyLeave}>
                  <div className="form-group">
                    <label>Leave Type</label>
                    <select className="form-control" value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                      <option value="Casual">Casual Leave</option>
                      <option value="Sick">Sick Leave</option>
                      <option value="Earned">Earned Leave</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label>From Date</label>
                      <input type="date" className="form-control" value={leaveFrom} onChange={(e) => setLeaveFrom(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>To Date</label>
                      <input type="date" className="form-control" value={leaveTo} onChange={(e) => setLeaveTo(e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Reason</label>
                    <textarea className="form-control" style={{ height: '80px' }} value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary">Submit Application</button>
                </form>
              </div>
            </div>
          )}

          {attSubTab === 'history' && (
            <div id="emp-att-sect-history">
              <div className="card">
                <div className="card-title">My Leave History</div>
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date Range</th>
                        <th>Type</th>
                        <th>Days</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.map((l) => (
                        <tr key={l._id}>
                          <td>{l.start} to {l.end}</td>
                          <td>{l.type}</td>
                          <td>{getDuration(l.start, l.end)} Days</td>
                          <td>{l.reason}</td>
                          <td><span className={`badge ${l.status === 'Approved' ? 'badge-success' : l.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{l.status}</span></td>
                          <td>
                            {l.status === 'Pending' ? <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleCancelLeave(l._id)}>Cancel</button> : '--'}
                          </td>
                        </tr>
                      ))}
                      {leaves.length === 0 && (
                        <tr><td colSpan="6" style={{ textAlign: 'center' }}>No leave history.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {attSubTab === 'timesheet' && (
            <div id="emp-att-sect-timesheet">
              <div className="card">
                <div className="card-title">Weekly Timesheet</div>
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Clock In</th>
                        <th>Clock Out</th>
                        <th>Hours Worked</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timesheets.map((t, idx) => (
                        <tr key={idx}>
                          <td>{t.date}</td>
                          <td>{t.clockIn}</td>
                          <td>{t.clockOut || 'Active Shift'}</td>
                          <td>{t.hours} Hrs</td>
                          <td><span className={`badge ${t.status === 'Punctual' ? 'badge-success' : 'badge-warning'}`}>{t.status}</span></td>
                        </tr>
                      ))}
                      {timesheets.length === 0 && (
                        <tr><td colSpan="5" style={{ textAlign: 'center' }}>No shift logs found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {attSubTab === 'analysis' && (
            <div id="emp-att-sect-analysis">
              <div className="card">
                <div className="card-title">Monthly Attendance Rate (%)</div>
                <div className="chart-container">
                  <canvas ref={empAnalysisBarRef}></canvas>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 5. Payroll View */}
      {currentModule === 'emp-payroll' && (
        <section id="emp-mod-emp-payroll" className="emp-module">
          <div className="metric-grid">
            <div className="metric-card primary">
              <div>
                <span className="metric-label">Gross Salary</span>
                <div className="metric-val">₹{salary.gross.toLocaleString()}</div>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-money-bill-wave"></i></div>
            </div>
            <div className="metric-card danger">
              <div>
                <span className="metric-label">Total Deductions</span>
                <div className="metric-val">₹{salary.deductions.toLocaleString()}</div>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-file-invoice-dollar"></i></div>
            </div>
            <div className="metric-card success">
              <div>
                <span className="metric-label">Net Salary</span>
                <div className="metric-val">₹{salary.net.toLocaleString()}</div>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-wallet"></i></div>
            </div>
          </div>

          <div className="dashboard-layout">
            <div>
              <div className="card">
                <div className="card-title">Deductions Proportion</div>
                <div className="chart-container">
                  <canvas ref={empDeductionPieRef}></canvas>
                </div>
              </div>
              <div className="card">
                <div className="card-title">Monthly Earnings Breakdown</div>
                <div className="chart-container">
                  <canvas ref={empEarningsBarRef}></canvas>
                </div>
              </div>
            </div>
            <div>
              <div className="card">
                <div className="card-title">Monthly Payslips</div>
                <div className="table-responsive">
                  <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Net Paid</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['May 2026', 'April 2026', 'March 2026'].map((m, idx) => (
                        <tr key={idx}>
                          <td><strong>{m}</strong></td>
                          <td>₹{salary.net.toLocaleString()}</td>
                          <td><button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => { setPayslipMonth(m); setSelectedEmpForPayslip(user); setPayslipActive(true); }}>View payslip</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. PIP View */}
      {currentModule === 'emp-pip' && (
        <section id="emp-mod-emp-pip" className="emp-module">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div className="card">
              <div className="card-title">Current Performance Rating</div>
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ fontSize: '3.5rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>4.2</div>
                <div style={{ color: 'var(--warning)', fontSize: '1.25rem' }}>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star-half-stroke"></i>
                </div>
                <p style={{ marginTop: '10px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Review Period: FY 2025-2026</p>
              </div>
            </div>
            <div className="card">
              <div className="card-title">Performance Improvement Plan (PIP)</div>
              <div style={{ padding: '15px', borderRadius: '10px', background: 'hsla(var(--success), 0.1)', border: '1px solid hsla(var(--success), 0.2)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>PIP Status</strong>
                  <span className="badge badge-success">Not Initiated</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>No performance plans are currently active. Keep up the high standards!</p>
              </div>
            </div>
          </div>

          <div className="dashboard-layout">
            <div>
              <div className="card">
                <div className="card-title">Submit Self-Assessment Feedback</div>
                <form onSubmit={(e) => { e.preventDefault(); showToast('Self assessment submitted.', 'success'); }}>
                  <div className="form-group">
                    <label>Assessment Subject</label>
                    <input type="text" className="form-control" placeholder="Mid-year Review" required />
                  </div>
                  <div className="form-group">
                    <label>Rating (Self Evaluation)</label>
                    <input type="range" min="1" max="5" className="form-control" style={{ padding: 0 }} />
                  </div>
                  <div className="form-group">
                    <label>Comments / Rationale</label>
                    <textarea className="form-control" style={{ height: '80px' }} required></textarea>
                  </div>
                  <button className="btn btn-primary">Submit Feedback</button>
                </form>
              </div>
            </div>
            <div>
              <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', color: '#fff', border: 'none' }}>
                <div className="card-title" style={{ color: '#fff' }}>AI Skill Suggestions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: '#e2e8f0' }}>
                  <div>🚀 Improve TypeScript proficiency via targeted exercises.</div>
                  <div>🎯 Attend peer leadership coding workshops.</div>
                  <div>💻 Enhance code review response latency metrics.</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. Learning View */}
      {currentModule === 'emp-learning' && (
        <section id="emp-mod-emp-learning" className="emp-module">
          <div className="card">
            <div className="card-title">Learning Progress</div>
            <div className="chart-container">
              <canvas ref={empLearningLineRef}></canvas>
            </div>
          </div>
          
          <h3 style={{ marginBottom: '16px' }}>Assigned Training Courses</h3>
          <div className="emp-grid">
            {trainings.filter(t => t.status === 'assigned').map(tr => (
              <div key={tr._id} className="emp-card" style={{ textAlign: 'left' }}>
                <span className="badge badge-info" style={{ marginBottom: '8px' }}>{tr.category}</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px' }}>{tr.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Assigned by {tr.assignedBy}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span>Progress</span><strong>{tr.progress}%</strong>
                </div>
                <div style={{ height: '6px', background: 'hsl(var(--border))', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
                  <div style={{ width: `${tr.progress}%`, height: '100%', backgroundColor: 'hsl(var(--primary))' }}></div>
                </div>
                <button className="btn btn-secondary" style={{ width: '100%' }} onClick={async () => {
                  try {
                    await api.put(`/trainings/${tr._id}/progress`, { progress: Math.min(tr.progress + 20, 100) });
                    showToast('Module progress updated.', 'success');
                    fetchTrainings();
                  } catch (err) {
                    showToast('Error updating course.', 'error');
                  }
                }}>Continue Learning</button>
              </div>
            ))}
            {trainings.filter(t => t.status === 'assigned').length === 0 && (
              <div style={{ color: 'var(--text-secondary)' }}>No assigned training courses.</div>
            )}
          </div>

          <div className="card">
            <div className="card-title">Attended Training Programs</div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Program Name</th>
                    <th>Trainer</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Mode</th>
                    <th>Review & Rating</th>
                    <th>Certificate</th>
                  </tr>
                </thead>
                <tbody>
                  {trainings.filter(t => t.status === 'attended').map((at, idx) => (
                    <tr key={idx}>
                      <td><strong>{at.name}</strong></td>
                      <td>{at.trainer || 'In-house'}</td>
                      <td>{at.date || '2026-05-10'}</td>
                      <td>{at.duration}</td>
                      <td>Online</td>
                      <td>
                        {at.rating ? (
                          <>
                            <span style={{ color: 'var(--warning)' }}><i className="fa-solid fa-star"></i> {at.rating}/5</span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{at.review}</div>
                          </>
                        ) : (
                          <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={async () => {
                            try {
                              await api.put(`/trainings/${at._id}/review`, { rating: 5, review: 'Amazing training!', trainer: 'E-learning module' });
                              showToast('Review submitted.', 'success');
                              fetchTrainings();
                            } catch (err) {
                              showToast('Error submitting review.', 'error');
                            }
                          }}>Submit Rating</button>
                        )}
                      </td>
                      <td><span className="badge badge-success">{at.certificate}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 8. Tasks Kanban Board View */}
      {currentModule === 'emp-tasks' && (
        <section id="emp-mod-emp-tasks" className="emp-module">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <button className="btn btn-primary" onClick={() => setAddTaskActive(true)}><i className="fa-solid fa-plus"></i> Add New Task</button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            {['todo', 'in-progress', 'done'].map(status => {
              const statusTasks = tasks.filter(t => t.status === status);
              const borderStyles = status === 'todo' ? { borderBottom: '2px solid hsl(var(--info))' } : status === 'in-progress' ? { borderBottom: '2px solid hsl(var(--warning))' } : { borderBottom: '2px solid hsl(var(--success))' };
              return (
                <div key={status} className="card">
                  <div className="card-title" style={{ fontSize: '0.95rem', paddingBottom: '8px', ...borderStyles }}>
                    {status === 'todo' ? 'To Do' : status === 'in-progress' ? 'In Progress' : 'Done'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '200px' }}>
                    {statusTasks.map(t => {
                      const priorityColor = t.priority === 'High' ? 'badge-danger' : t.priority === 'Medium' ? 'badge-warning' : 'badge-success';
                      return (
                        <div key={t._id} className="ats-cand-card" style={{ cursor: 'pointer' }} onClick={() => {
                          const nextState = t.status === 'todo' ? 'in-progress' : t.status === 'in-progress' ? 'done' : 'todo';
                          handleMoveTaskStatus(t._id, nextState);
                        }}>
                          <h5 style={{ marginBottom: '6px' }}>{t.title}</h5>
                          <p>{t.project}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                            <span className={`badge ${priorityColor}`}>{t.priority}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Due: {t.due}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="dashboard-layout">
            <div>
              <div className="card">
                <div className="card-title">Daily Work Report</div>
                <form onSubmit={handleDailyReportSubmit}>
                  <div className="form-group">
                    <label>What did you work on today?</label>
                    <textarea className="form-control" style={{ height: '90px' }} value={dailyReportVal} onChange={(e) => setDailyReportVal(e.target.value)} required></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">Submit Report</button>
                </form>
              </div>
            </div>
            <div>
              <div className="card">
                <div className="card-title">Task Deadline Tracker</div>
                <div className="table-responsive">
                  <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((t, idx) => (
                        <tr key={idx} style={t.priority === 'High' ? { background: 'rgba(244,63,94,0.05)' } : {}}>
                          <td><strong>{t.title}</strong></td>
                          <td>{t.due}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 9. Meetings View */}
      {currentModule === 'emp-meetings' && (
        <section id="emp-mod-emp-meetings" className="emp-module">
          
          {/* New Meeting Hub Card */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-title">New Meeting Hub</div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <button 
                type="button"
                className={`btn ${meetingMode === 'instant' ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => setMeetingMode('instant')}
              >
                Instant Sync
              </button>
              <button 
                type="button"
                className={`btn ${meetingMode === 'schedule' ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => setMeetingMode('schedule')}
              >
                Schedule Meeting
              </button>
            </div>
            
            <form onSubmit={handleCreateMeeting}>
              {meetingMode === 'schedule' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Meeting Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Sprint Standup" 
                      value={newMeetTitle}
                      onChange={(e) => setNewMeetTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Meeting Link (optional)</label>
                    <input 
                      type="url" 
                      className="form-control" 
                      placeholder="https://meet.google.com/abc-defg-hij" 
                      value={newMeetLink}
                      onChange={(e) => setNewMeetLink(e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              {meetingMode === 'schedule' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Scheduled Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={newMeetDate}
                      onChange={(e) => setNewMeetDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Scheduled Time</label>
                    <input 
                      type="time" 
                      className="form-control" 
                      value={newMeetTime}
                      onChange={(e) => setNewMeetTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {meetingMode === 'instant' && (
                <div className="form-group">
                  <label>Instant Meeting Link (optional)</label>
                  <input 
                    type="url" 
                    className="form-control" 
                    placeholder="https://meet.google.com/abc-defg-hij" 
                    value={newMeetLink}
                    onChange={(e) => setNewMeetLink(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Add Attendees (Comma-separated Employee IDs)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. EMP-1001, EMP-1002" 
                  value={newMeetEmpIds}
                  onChange={(e) => setNewMeetEmpIds(e.target.value)}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Leave blank to add only yourself. Enter comma-separated IDs to invite others.
                </span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                {meetingMode === 'instant' ? 'Start Instant Meeting' : 'Schedule Meeting'}
              </button>
            </form>
          </div>

          <div className="card">
            <div className="card-title">Upcoming Schedule</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {meetings.map((m, idx) => {
                let cardStyle = {
                  background: 'hsla(var(--warning), 0.1)',
                  border: '1px solid hsla(var(--warning), 0.2)'
                };
                let actBtn = <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', marginTop: '12px' }} onClick={() => handleJoinMeetingCheck(m)}>Join Session</button>;
                
                if (m.status === 'Attended') {
                  cardStyle = {
                    background: 'hsla(var(--success), 0.1)',
                    border: '1px solid hsla(var(--success), 0.2)'
                  };
                  actBtn = <span className="badge badge-success" style={{ marginTop: '12px' }}>Attended</span>;
                }
                if (m.status === 'Missed') {
                  cardStyle = {
                    background: 'hsla(var(--danger), 0.1)',
                    border: '1px solid hsla(var(--danger), 0.2)'
                  };
                  actBtn = <span className="badge badge-danger" style={{ marginTop: '12px' }}>Missed</span>;
                }

                return (
                  <div key={idx} className="emp-card" style={{ textAlign: 'left', ...cardStyle }}>
                    <strong>{m.title}</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0' }}>Host: {m.host} | Time: {m.time}</p>
                    {actBtn}
                  </div>
                );
              })}
              {meetings.length === 0 && (
                <div style={{ color: 'var(--text-secondary)', padding: '10px 0' }}>No meetings scheduled.</div>
              )}
            </div>
          </div>

          <div className="dashboard-layout">
            {renderMeetingsCalendar()}
            <div className="card">
              <div className="card-title">Client Calls & Reminder Settings</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Sprint Review Call (9:00 PM)</span>
                  <label><input type="checkbox" defaultChecked /> Reminder</label>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>HR Standup sync (10:00 AM)</span>
                  <label><input type="checkbox" /> Reminder</label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-title">Meeting Summary Logs</div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Host</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.map((m, idx) => (
                    <tr key={idx}>
                      <td>{m.date}</td>
                      <td><strong>{m.title}</strong></td>
                      <td>{m.host}</td>
                      <td>45 Mins</td>
                      <td><span className={`badge ${m.status === 'Attended' ? 'badge-success' : m.status === 'Missed' ? 'badge-danger' : 'badge-warning'}`}>{m.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 10. Notifications Full List View */}
      {currentModule === 'emp-notifications' && (
        <section id="emp-mod-emp-notifications" className="emp-module">
          <div className="card">
            <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span>Alert Notifications</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" onClick={handleMarkAllNotifsRead}>Mark All Read</button>
                <select className="form-control" style={{ width: '180px' }} value={notifCategoryFilter} onChange={(e) => setNotifCategoryFilter(e.target.value)}>
                  <option value="All">All Categories</option>
                  <option value="salary">Salary</option>
                  <option value="leave">Leave</option>
                  <option value="meeting">Meetings</option>
                  <option value="reminder">Reminders</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredNotifs.map(n => (
                <div key={n._id} style={{ padding: '15px', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: n.read ? 0.6 : 1 }}>
                  <div>
                    <strong>{n.title}</strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.desc}</p>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{n.time}</span>
                </div>
              ))}
              {filteredNotifs.length === 0 && (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No notifications found.</div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 11. Support / Chat View */}
      {currentModule === 'emp-helpdesk' && (
        <section id="emp-mod-emp-helpdesk" className="emp-module">
          <div className="dashboard-layout">
            <div className="card">
              <div className="card-title">Raise Support Ticket</div>
              <form onSubmit={handleRaiseTicketSubmit}>
                <div className="form-group">
                  <label>Ticket Subject</label>
                  <input type="text" className="form-control" value={ticketTitle} onChange={(e) => setTicketTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-control" value={ticketCategory} onChange={(e) => setTicketCategory(e.target.value)}>
                    <option value="HR Query">HR Query</option>
                    <option value="IT Support">IT Support</option>
                    <option value="Payroll Issue">Payroll Issue</option>
                    <option value="Leave Related">Leave Related</option>
                    <option value="Purchase Request">Purchase Request</option>
                    <option value="Store / Inventory Requirement">Store / Inventory Requirement</option>
                    <option value="Advance Amount Request">Advance Amount Request</option>
                    <option value="Employee Feedback">Employee Feedback</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <label><input type="radio" name="ticketPriority" value="Low" checked={ticketPriority === 'Low'} onChange={() => setTicketPriority('Low')} /> Low</label>
                    <label><input type="radio" name="ticketPriority" value="Medium" checked={ticketPriority === 'Medium'} onChange={() => setTicketPriority('Medium')} /> Medium</label>
                    <label><input type="radio" name="ticketPriority" value="High" checked={ticketPriority === 'High'} onChange={() => setTicketPriority('High')} /> High</label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" style={{ height: '80px' }} value={ticketDesc} onChange={(e) => setTicketDesc(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary">Submit Ticket</button>
              </form>
            </div>

            <div className="card">
              <div className="card-title">AI Department Support Chat</div>
              <div className="chat-container">
                <div className="chat-messages">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`chat-msg ${msg.sender === 'hr' ? 'hr' : 'emp'}`}>
                      {msg.message}
                      <div style={{ fontSize: '0.65rem', textAlign: 'right', opacity: 0.8, marginTop: '4px' }}>{msg.time}</div>
                    </div>
                  ))}
                  {chatTyping && (
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  )}
                  <div ref={chatMessagesEndRef} />
                </div>
                <form onSubmit={handleSendChat} className="chat-input-area">
                  <input type="text" placeholder="Ask AI HR support..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} required />
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px' }}><i className="fa-solid fa-paper-plane"></i></button>
                </form>
              </div>
              <div style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '8px', color: 'var(--text-secondary)' }}>AI Department Support — Powered by TalentSphere AI™</div>
            </div>
          </div>
        </section>
      )}

      {/* 12. Company Policies Accordion View */}
      {currentModule === 'emp-policies' && (
        <section id="emp-mod-emp-policies" className="emp-module">
          <div className="policy-accordion">
            {[
              { title: 'Holiday Calendar', icon: 'fa-calendar-days', details: 'Full List of 15 Holidays: Republic Day: 26 Jan, Holi: 14 Mar, Good Friday: 18 Apr, Ambedkar Jayanti: 14 Apr, Labour Day: 1 May, Eid: 31 Mar, Independence Day: 15 Aug, Janmashtami: 16 Aug, Gandhi Jayanti: 2 Oct, Dussehra: 2 Oct, Diwali: 20 Oct, Diwali (Laxmi Puja): 21 Oct, Christmas: 25 Dec, New Year: 1 Jan, Regional Holiday (Pongal): 14 Jan.' },
              { title: 'Leave Policies', icon: 'fa-umbrella-beach', details: 'Casual Leave: 12 days/year, Sick Leave: 12 days/year, Earned Leave: 15 days/year, Maternity: 26 weeks, Paternity: 5 days, Compensatory Off: as earned.' },
              { title: 'Working Hours & Flex', icon: 'fa-clock', details: 'Standard Shift: Mon-Fri 9:00 AM - 6:00 PM (9 hrs including 1 hr lunch). Optional Saturday: 9:00 AM - 1:00 PM. Remote work policy: Up to 2 days/week WFH upon approval.' },
              { title: 'Employee Handbook', icon: 'fa-book', details: 'Contains full HR code of conduct guidelines. Click "Download" to fetch the complete PDF book from corporate repository.' },
              { title: 'Company Guidelines', icon: 'fa-scale-balanced', details: 'Dress Code, Device Usage security policies, Confidentiality & NDAs, Anti-Harassment workplace regulations, Conflict of interest policies.' },
              { title: 'Common Company Policies', icon: 'fa-building', details: 'Probation Period: 3 months, Notice Period: 30 days (junior) / 60 days (senior), Travel & Expense Reimbursement rules, Performance reviews (bi-annual), Increment Cycle (April).' }
            ].map((p, idx) => (
              <div key={idx} className={`policy-item ${activePolicies[idx] ? 'active' : ''}`}>
                <div className="policy-trigger" onClick={() => togglePolicyAccordion(idx)}>
                  <span><i className={`fa-solid ${p.icon}`} style={{ marginRight: '12px', color: 'hsl(var(--primary))' }}></i> {p.title}</span>
                  <i className="fa-solid fa-chevron-down"></i>
                </div>
                <div className="policy-content" style={activePolicies[idx] ? { maxHeight: '600px', padding: '0 24px 20px 24px', overflowY: 'auto' } : {}}>
                  <p>{p.details}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 13. Settings View */}
      {currentModule === 'emp-settings' && (
        <section id="emp-mod-emp-settings" className="emp-module">
          <div className="card">
            <div className="card-title">Change Password</div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const cur = e.target.elements[0].value;
              const nxt = e.target.elements[1].value;
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
                <input type="password" className="form-control" required />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" className="form-control" required />
              </div>
              <button className="btn btn-primary">Update Password</button>
            </form>
          </div>
          <div className="card">
            <div className="card-title">Portal Preferences</div>
            <div className="form-group">
              <label>System Display Language</label>
              <select className="form-control" defaultValue="English">
                <option>English</option>
                <option>Hindi</option>
                <option>Tamil</option>
                <option>Telugu</option>
                <option>Kannada</option>
                <option>Gujarati</option>
              </select>
            </div>
            <div className="form-group">
              <label><input type="checkbox" defaultChecked /> Email notifications</label>
            </div>
            <div className="form-group">
              <label><input type="checkbox" defaultChecked /> SMS notifications</label>
            </div>
            <button className="btn btn-secondary" onClick={() => showToast('Preferences updated.', 'success')}>Save Preferences</button>
          </div>
        </section>
      )}

      {/* Modals Mounting */}
      <RaiseTicketModal
        active={raiseTicketActive}
        onClose={() => setRaiseTicketActive(false)}
        onSubmit={handleRaiseTicketSubmit}
      />

      <JoinMeetingModal
        active={joinMeetingActive}
        onClose={() => setJoinMeetingActive(false)}
        onJoin={() => { showToast('Connecting to meeting...', 'info'); setJoinMeetingActive(false); }}
      />

      <AddTaskModal
        active={addTaskActive}
        onClose={() => setAddTaskActive(false)}
        onSubmit={handleAddTaskSubmit}
      />

      <PayslipModal
        active={payslipActive}
        onClose={() => setPayslipActive(false)}
        employee={selectedEmpForPayslip}
        month={payslipMonth}
        onPrint={() => { showToast('Payslip invoice sent to printer!', 'success'); setPayslipActive(false); }}
      />
    </>
  );
};

export default EmployeeApp;
