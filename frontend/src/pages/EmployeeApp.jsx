import { useContext, useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../api';
import OrgStructure from './OrgStructure';
import DocumentVault from './DocumentVault';
import {
  RaiseTicketModal,
  JoinMeetingModal,
  AddTaskModal,
  PayslipModal
} from '../components/Modals';
import { getAvatarUrl } from '../App';

const SubjectSparkline = ({ progress }) => {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!window.Chart || !canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    const ctx = canvasRef.current.getContext('2d');
    
    // Draw micro sparkline
    const mockData = Array.from({ length: 6 }, (_, i) => Math.min(100, Math.max(0, progress - 15 + Math.random() * 30)));
    mockData[mockData.length - 1] = progress; // ensure final matches

    chartInstanceRef.current = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: ['', '', '', '', '', ''],
        datasets: [{
          data: mockData,
          borderColor: 'hsl(var(--primary))',
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [progress]);

  return (
    <div style={{ width: '80px', height: '24px' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

const EmployeeApp = ({ currentModule, setCurrentModule }) => {
  const {
    employees,
    leaves,
    tasks,
    tickets,
    meetings,
    trainings,
    timesheets,
    chatMessages,
    notifications,
    discussionMessages,
    warningLetters,
    fetchAllData,
    fetchLeaves,
    fetchTasks,
    fetchTickets,
    fetchMeetings,
    fetchTrainings,
    fetchTimesheets,
    fetchChatMessages,
    fetchNotifications,
    fetchDiscussionMessages,
    fetchWarningLetters
  } = useContext(DataContext);
  
  const { user: authUser, loadUser } = useContext(AuthContext);
  const { id } = useParams();
  const user = (authUser?.role === 'hr' && id) ? (employees.find(e => e.id === id) || authUser) : authUser;

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
    const other = 5000;
    const gross = basic + hra + other;
    
    const pf = Math.round(basic * 0.12);
    const profTax = 250;
    const tds = Math.round(basic * 0.0723);
    const deductions = pf + profTax + tds;
    const net = gross - deductions;
    
    return { basic, hra, other, gross, pf, profTax, tds, deductions, net };
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
  const [profileParentStatus, setProfileParentStatus] = useState(user?.parentStatus || 'No');
  
  // Discussion Input State
  const [discussionInput, setDiscussionInput] = useState('');
  const discussionMessagesEndRef = useRef(null);

  // Trivia states
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [triviaSelected, setTriviaSelected] = useState('');
  const [triviaScore, setTriviaScore] = useState(0);
  const [triviaChecked, setTriviaChecked] = useState(false);
  const [triviaComplete, setTriviaComplete] = useState(false);

  const triviaQuestions = [
    {
      question: "Which of the following is NOT a core value of clean code?",
      options: ["Readability", "Complexity", "Maintainability", "Testability"],
      answer: "Complexity"
    },
    {
      question: "What does HTML stand for?",
      options: ["Hyper Text Markup Language", "High Tech Multi Language", "Hyperlink and Text Markup Language", "Home Tool Markup Language"],
      answer: "Hyper Text Markup Language"
    },
    {
      question: "What is the primary benefit of version control systems like Git?",
      options: ["Tracking code changes & collaboration", "Compiling code faster", "Writing code automatically", "Designing database schemas"],
      answer: "Tracking code changes & collaboration"
    },
    {
      question: "In CSS, what does HSL stand for?",
      options: ["Hue, Saturation, Lightness", "High-level Style Language", "Heading, Section, Layout", "Horizontal Styling Lines"],
      answer: "Hue, Saturation, Lightness"
    },
    {
      question: "Which of the following is a key feature of glassmorphism?",
      options: ["Solid bright backgrounds", "Backdrop blur effect", "Fuzzy borders", "3D rotated frames"],
      answer: "Backdrop blur effect"
    }
  ];

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
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // New Meeting Form States
  const [meetingMode, setMeetingMode] = useState('schedule');
  const [newMeetTitle, setNewMeetTitle] = useState('');
  const [newMeetDate, setNewMeetDate] = useState('');
  const [newMeetTime, setNewMeetTime] = useState('');
  const [newMeetLink, setNewMeetLink] = useState('');
  const [newMeetEmpIds, setNewMeetEmpIds] = useState('');
  const [newMeetAgenda, setNewMeetAgenda] = useState('');
  const [newMeetFromTime, setNewMeetFromTime] = useState('');
  const [newMeetToTime, setNewMeetToTime] = useState('');
  const [newMeetPoints, setNewMeetPoints] = useState('');
  const [newMeetAttendeesCount, setNewMeetAttendeesCount] = useState(1);
  const [newMeetTopics, setNewMeetTopics] = useState('');

  // Daily Reports State
  const [dailyReports, setDailyReports] = useState([]);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportTasks, setReportTasks] = useState('');
  const [reportBlockers, setReportBlockers] = useState('');
  const [reportHours, setReportHours] = useState(8);
  const [reportTab, setReportTab] = useState('submit'); // 'submit' or 'reviews'
  const [selectedReportForReview, setSelectedReportForReview] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState('');

  // Profile upload input ref
  const fileInputRef = useRef(null);

  const getAvailableSlots = () => {
    if (!newMeetDate) return [];
    const standardSlots = [
      { id: '1', label: '09:00 AM - 10:00 AM', from: '09:00', to: '10:00' },
      { id: '2', label: '10:00 AM - 11:00 AM', from: '10:00', to: '11:00' },
      { id: '3', label: '11:00 AM - 12:00 PM', from: '11:00', to: '12:00' },
      { id: '4', label: '01:00 PM - 02:00 PM', from: '13:00', to: '14:00' },
      { id: '5', label: '02:00 PM - 03:00 PM', from: '14:00', to: '15:00' },
      { id: '6', label: '03:00 PM - 04:00 PM', from: '15:00', to: '16:00' },
      { id: '7', label: '04:00 PM - 05:00 PM', from: '16:00', to: '17:00' },
      { id: '8', label: '05:00 PM - 06:00 PM', from: '17:00', to: '18:00' }
    ];

    const dateMeetings = meetings.filter(m => m.date === newMeetDate && m.status === 'Scheduled');
    
    return standardSlots.map(slot => {
      const isBooked = dateMeetings.some(m => {
        if (m.fromTime && m.toTime) {
          return (slot.from >= m.fromTime && slot.from < m.toTime) || 
                 (slot.to > m.fromTime && slot.to <= m.toTime) ||
                 (m.fromTime >= slot.from && m.fromTime < slot.to);
        }
        return false;
      });
      return { ...slot, isBooked };
    });
  };

  const handleDocUpload = async (docName, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('docName', docName);

    try {
      showToast(`Uploading ${docName}...`, 'info');
      await api.post('/employees/upload-doc', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      showToast(`${docName} uploaded successfully.`, 'success');
      if (loadUser) {
        await loadUser();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to upload document.', 'error');
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

  const fetchDailyReports = async () => {
    try {
      const res = await api.get('/daily-reports');
      setDailyReports(res.data);
    } catch (err) {
      console.error('Error fetching daily reports:', err);
    }
  };

  // Sync data
  useEffect(() => {
    fetchAllData();
    if (currentModule === 'emp-reports') {
      fetchDailyReports();
    }
  }, [currentModule]);

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

  // Scroll chat messages (scrollTop method prevents page-level scrolling on load)
  useEffect(() => {
    const container = chatMessagesEndRef.current?.parentElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    const container = discussionMessagesEndRef.current?.parentElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [discussionMessages]);

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
        const curMonthRate = timesheets.length > 0 ? Math.round((presentDaysCount / timesheets.length) * 100) : 95;
        chartsInstanceRef.current.dashboardDonut = new window.Chart(ctxDonut, {
          type: 'bar',
          data: {
            labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
            datasets: [{
              label: 'Attendance Rate (%)',
              data: [92, 94, 96, 93, 97, curMonthRate],
              backgroundColor: 'rgba(16, 185, 129, 0.85)',
              borderColor: '#10b981',
              borderWidth: 1
            }]
          },
          options: { 
            responsive: true, 
            maintainAspectRatio: false,
            scales: {
              y: {
                min: 0,
                max: 100,
                ticks: {
                  callback: function(value) { return value + "%" }
                }
              }
            }
          }
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
            labels: ['Basic', 'HRA', 'Other'],
            datasets: [{
              label: 'Monthly Breakup',
              data: [salary.basic, salary.hra, salary.other],
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
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
            datasets: [{
              label: 'Course Completion Progress (%)',
              data: [10, 25, 40, 55, 68, 75, 88, 95],
              borderColor: 'hsl(158, 64%, 42%)',
              tension: 0.2,
              fill: false
            }]
          },
          options: { 
            responsive: true, 
            maintainAspectRatio: false,
            scales: {
              y: {
                reverse: true, // Inverted Y-axis
                min: 0,
                max: 100,
                ticks: {
                  callback: function(value) { return value + "%" }
                }
              }
            }
          }
        });
      }
    }
  }, [currentModule, attSubTab]);

  // Trigger count-up and module entry animations
  useEffect(() => {
    const moduleTimer = setTimeout(() => {
      const el = document.querySelector('.emp-module');
      if (el && window.animateModuleIn) {
        window.animateModuleIn(el);
      }
    }, 50);

    const countTimer = setTimeout(() => {
      const countElements = document.querySelectorAll('.emp-module .count-up');
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

  // Dinosaur Runner Game engine
  useEffect(() => {
    if (currentModule !== 'emp-engagement') return;

    const canvas = document.getElementById('runner-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let raf = null;
    let running = false;
    let score = 0;
    let speed = 4;
    let frame = 0;
    let obstacles = [];
    const ground = 160;
    const player = { x: 80, y: 110, width: 40, height: 50, vy: 0, onGround: true };

    const jump = () => {
      if (player.onGround) {
        player.vy = -14;
        player.onGround = false;
      }
    };

    const handleKeyDown = (e) => {
      // Ignore keystrokes if typing inside text fields
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
        return;
      }

      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    const handleCanvasClick = (e) => {
      e.preventDefault();
      if (!running) {
        startGame();
      } else {
        jump();
      }
    };

    const spawnObstacle = () => {
      const types = [
        { label: '📋 Task', w: 30, h: 40 },
        { label: '📧 Email', w: 25, h: 35 },
        { label: '📊 Report', w: 35, h: 45 }
      ];
      const t = types[Math.floor(Math.random() * types.length)];
      obstacles.push({ x: 700, y: ground - t.h, width: t.w, height: t.h, label: t.label });
    };

    const draw = () => {
      ctx.clearRect(0, 0, 680, 200);

      // Ground line
      ctx.strokeStyle = 'rgba(99,102,241,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, ground + 10);
      ctx.lineTo(680, ground + 10);
      ctx.stroke();

      // Score
      ctx.fillStyle = '#C7D2FE';
      ctx.font = '14px Plus Jakarta Sans, sans-serif';
      ctx.fillText(`Score: ${score}`, 560, 30);
      ctx.fillText('SPACE / tap to jump', 20, 30);

      // Player (stick figure HR person)
      ctx.fillStyle = '#818CF8';
      // Body
      ctx.fillRect(player.x + 10, player.y + 15, 20, 25);
      // Head
      ctx.beginPath();
      ctx.arc(player.x + 20, player.y + 10, 10, 0, Math.PI * 2);
      ctx.fill();

      // Legs (animated)
      ctx.strokeStyle = '#818CF8';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      const legSwing = player.onGround ? Math.sin(frame * 0.3) * 15 : 0;
      ctx.beginPath();
      ctx.moveTo(player.x + 15, player.y + 40);
      ctx.lineTo(player.x + 10, player.y + 55 + legSwing);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(player.x + 25, player.y + 40);
      ctx.lineTo(player.x + 30, player.y + 55 - legSwing);
      ctx.stroke();

      // Briefcase
      ctx.fillStyle = '#4338CA';
      ctx.fillRect(player.x + 32, player.y + 25, 12, 10);

      // Obstacles
      obstacles.forEach(obs => {
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.fillStyle = '#FEF2F2';
        ctx.font = '11px sans-serif';
        ctx.fillText(obs.label, obs.x - 10, obs.y - 5);
      });
    };

    const update = () => {
      frame++;
      // Gravity
      player.vy += 0.8;
      player.y += player.vy;
      if (player.y >= ground - player.height) {
        player.y = ground - player.height;
        player.vy = 0;
        player.onGround = true;
      }

      // Spawn
      if (frame % Math.max(60, Math.floor(100 - score / 10)) === 0) {
        spawnObstacle();
      }

      // Move
      obstacles = obstacles.filter(o => {
        o.x -= speed;
        return o.x > -50;
      });

      // Collision
      obstacles.forEach(obs => {
        if (player.x + 8 < obs.x + obs.width && player.x + 32 > obs.x &&
            player.y + 8 < obs.y + obs.height && player.y + player.height > obs.y) {
          gameOver();
        }
      });

      score++;
      speed = 4 + Math.floor(score / 200) * 0.5;
    };

    const gameOver = () => {
      running = false;
      cancelAnimationFrame(raf);
      ctx.fillStyle = 'rgba(15,23,42,0.85)';
      ctx.fillRect(0, 0, 680, 200);
      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 28px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OVERLOADED! 😵', 340, 80);
      ctx.fillStyle = '#C7D2FE';
      ctx.font = '18px Plus Jakarta Sans, sans-serif';
      ctx.fillText(`Final Score: ${score}`, 340, 115);
      ctx.fillStyle = '#818CF8';
      ctx.font = '14px Plus Jakarta Sans, sans-serif';
      ctx.fillText('Click canvas to restart', 340, 145);
      ctx.textAlign = 'left';
    };

    const loop = () => {
      if (!running) return;
      update();
      draw();
      raf = requestAnimationFrame(loop);
    };

    const startGame = () => {
      running = true;
      score = 0;
      speed = 4;
      frame = 0;
      obstacles = [];
      player.y = ground - player.height;
      player.vy = 0;
      player.onGround = true;
      loop();
    };

    // Draw initial cover screen
    ctx.fillStyle = 'rgba(15,23,42,0.9)';
    ctx.fillRect(0, 0, 680, 200);
    ctx.fillStyle = '#818CF8';
    ctx.font = 'bold 22px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Dino Runner: Avoid Work Overload!', 340, 75);
    ctx.fillStyle = '#C7D2FE';
    ctx.font = '14px Plus Jakarta Sans, sans-serif';
    ctx.fillText('Press SPACE, UP Arrow, or Tap to jump', 340, 115);
    ctx.fillStyle = '#10B981';
    ctx.fillText('Click canvas or the button to START', 340, 150);
    ctx.textAlign = 'left';

    document.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('click', handleCanvasClick);

    const startBtn = document.getElementById('start-runner-btn');
    if (startBtn) {
      startBtn.addEventListener('click', startGame);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handleKeyDown);
      if (canvas) canvas.removeEventListener('click', handleCanvasClick);
      if (startBtn) startBtn.removeEventListener('click', startGame);
    };
  }, [currentModule]);

  // Edit personal profile details
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
      showToast('Error updating profile.', 'error');
    }
  };

  const handleSendDiscussion = async (e) => {
    e.preventDefault();
    if (!discussionInput.trim()) return;
    try {
      await api.post('/discussion', { message: discussionInput });
      setDiscussionInput('');
    } catch (err) {
      showToast('Error sending message to discussion board.', 'error');
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
      setTicketSubmitted(true);
      fetchTickets();
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

    let durationHours = 0;
    if (newMeetFromTime && newMeetToTime) {
      const [fromH, fromM] = newMeetFromTime.split(':').map(Number);
      const [toH, toM] = newMeetToTime.split(':').map(Number);
      const diffMins = (toH * 60 + toM) - (fromH * 60 + fromM);
      if (diffMins > 0) {
        durationHours = Number((diffMins / 60).toFixed(2));
      }
    }

    try {
      await api.post('/meetings', {
        title,
        host: user?.name || 'Employee',
        date,
        time: newMeetFromTime && newMeetToTime ? `${newMeetFromTime} - ${newMeetToTime}` : time,
        type: 'Online',
        empId: newMeetEmpIds.trim() || user?.id,
        link,
        agenda: newMeetAgenda,
        fromTime: newMeetFromTime || time,
        toTime: newMeetToTime || time,
        points: newMeetPoints,
        durationHours,
        attendeesCount: Number(newMeetAttendeesCount) || 1,
        topics: newMeetTopics
      });

      showToast(meetingMode === 'instant' ? 'Instant meeting started successfully.' : 'Meeting scheduled successfully.', 'success');
      
      // Reset form
      setNewMeetTitle('');
      setNewMeetDate('');
      setNewMeetTime('');
      setNewMeetLink('');
      setNewMeetEmpIds('');
      setNewMeetAgenda('');
      setNewMeetFromTime('');
      setNewMeetToTime('');
      setNewMeetPoints('');
      setNewMeetAttendeesCount(1);
      setNewMeetTopics('');

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

  const handleDailyReportSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/daily-reports', {
        date: reportDate,
        tasksCompleted: reportTasks,
        blockers: reportBlockers,
        hoursWorked: reportHours
      });
      showToast('Daily work report submitted successfully.', 'success');
      setReportTasks('');
      setReportBlockers('');
      setReportHours(8);
      fetchDailyReports();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error submitting report.', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReportForReview) return;
    try {
      await api.put(`/daily-reports/${selectedReportForReview._id}/review`, {
        reviewFeedback
      });
      showToast('Review feedback submitted.', 'success');
      setSelectedReportForReview(null);
      setReviewFeedback('');
      fetchDailyReports();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error submitting review.', 'error');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);
    if (authUser?.role === 'hr' && id) {
      formData.append('empId', id);
    }

    try {
      showToast('Uploading profile picture...', 'info');
      await api.post('/employees/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      showToast('Profile picture uploaded successfully.', 'success');
      if (loadUser) {
        await loadUser(); // refresh navbar and context user
      }
      fetchAllData(); // refresh employee records
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to upload profile picture.', 'error');
    } finally {
      e.target.value = null; // reset file input
    }
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    Welcome to TalentSphere Employee Portal
                    <span className={`badge ${activeShift ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '12px', color: '#fff', verticalAlign: 'middle' }}>
                      <i className={`fa-solid ${activeShift ? 'fa-circle-check' : 'fa-circle-xmark'}`} style={{ marginRight: '4px' }}></i>
                      {activeShift ? 'Clocked In' : 'Clocked Out'}
                    </span>
                  </h3>
                  <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>Today is {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
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
                <div className="metric-val"><span className="count-up" data-target={presentDaysCount}>{presentDaysCount}</span>/<span className="count-up" data-target={timesheets.length || 24}>{timesheets.length || 24}</span> Days</div>
                <span className="badge badge-success">Punctual</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-calendar-check"></i></div>
            </div>
            <div className="metric-card success">
              <div>
                <span className="metric-label">Leave Balance</span>
                <div className="metric-val"><span className="count-up" data-target={Math.max(0, 15 - leavesTakenDays)}>{Math.max(0, 15 - leavesTakenDays)}</span> Days</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Earned & Casual</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-plane"></i></div>
            </div>
            <div className="metric-card info">
              <div>
                <span className="metric-label">Pending Tasks</span>
                <div className="metric-val"><span className="count-up" data-target={activeTasksCount}>{activeTasksCount}</span></div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Assigned tasks</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-list-check"></i></div>
            </div>
            <div className="metric-card warning">
              <div>
                <span className="metric-label">Upcoming Meetings</span>
                <div className="metric-val"><span className="count-up" data-target={meetings.filter(m => m.status === 'Scheduled').length}>{meetings.filter(m => m.status === 'Scheduled').length}</span> Meetings</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Scheduled for today</span>
              </div>
              <div className="metric-icon-box"><i className="fa-solid fa-video"></i></div>
            </div>
          </div>

          <div className="dashboard-layout">
            <div>
              {renderPunchClockCard()}
              <div className="card">
                <div className="card-title">Monthly Attendance Ratio (%)</div>
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

              {/* Group Discussion Chat Widget */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '380px' }}>
                <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Group Discussion Board</span>
                  <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setCurrentModule('emp-engagement')}>Open Full Hub</button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '12px', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {discussionMessages.slice(-6).map((msg) => (
                    <div key={msg._id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.8rem' }}>
                      <img src={msg.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} style={{ width: '28px', height: '28px', borderRadius: '50%' }} alt="Avatar" />
                      <div style={{ background: 'hsl(var(--bg-main))', padding: '8px 12px', borderRadius: '12px', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.75rem', marginBottom: '2px' }}>
                          <span>{msg.senderName} ({msg.senderRole})</span>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{msg.time}</span>
                        </div>
                        <div style={{ wordBreak: 'break-word' }}>{msg.message}</div>
                      </div>
                    </div>
                  ))}
                  {discussionMessages.length === 0 && (
                    <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '20px' }}>No messages posted yet. Be the first to start the discussion!</div>
                  )}
                  <div ref={discussionMessagesEndRef} />
                </div>
                <form onSubmit={handleSendDiscussion} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type a message..."
                    value={discussionInput}
                    onChange={(e) => setDiscussionInput(e.target.value)}
                    style={{ flex: 1 }}
                    required
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }}><i className="fa-solid fa-paper-plane"></i></button>
                </form>
              </div>
            </div>

            <div>
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
                <div className="card-title">Performance Standing Summary</div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                    <span>Current Rating: 4.2 / 5.0</span>
                    <span className="badge badge-success">Standing: Excellent</span>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid hsl(var(--border))' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={getAvatarUrl(user)} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid hsl(var(--primary))' }} alt="profile" />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()} 
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
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*" 
                    onChange={handleAvatarUpload} 
                  />
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
                    <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>Upload Profile Picture</button>
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
                      <td><span className={`badge ${getTicketStatusBadgeClass(t.status)}`}>{t.status}</span></td>
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
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {warningLetters.map(warning => (
                    <tr key={warning._id}>
                      <td><strong>{warning.date}</strong></td>
                      <td>{warning.subject}</td>
                      <td>{warning.reason}</td>
                      <td>
                        <span className={`badge ${warning.status === 'Acknowledged' ? 'badge-success' : 'badge-danger'}`}>
                          {warning.status}
                        </span>
                      </td>
                      <td>
                        {warning.status === 'Issued' ? (
                          <button
                            className="btn btn-primary"
                            type="button"
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                            onClick={async () => {
                              try {
                                await api.put(`/warning-letters/${warning._id}/acknowledge`);
                                showToast('Warning letter acknowledged.', 'success');
                                fetchWarningLetters();
                              } catch (err) {
                                showToast('Error acknowledging warning letter.', 'error');
                              }
                            }}
                          >
                            Acknowledge Letter
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Acknowledged</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {warningLetters.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: 'center' }}>No compliance warning letters issued.</td></tr>
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
          <DocumentVault mode="employee" />
        </section>
      )}

      {/* Org Structure View */}
      {currentModule === 'org-structure' && (
        <section id="emp-mod-org-structure" className="emp-module">
          <OrgStructure mode="employee" />
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

      {/* 6. PIP / Performance View */}
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
              <div className="card-title">Development & Performance Standing</div>
              <div style={{ padding: '15px', borderRadius: '10px', background: 'hsla(var(--success), 0.1)', border: '1px solid hsla(var(--success), 0.2)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Performance Level</strong>
                  <span className="badge badge-success">Meeting Expectations</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>You are in good standing. No special improvement plans are active. Keep up the high standards!</p>
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
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-crown" style={{ color: 'var(--warning)' }}></i> Learning Progress
            </div>
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
                <SubjectSparkline progress={tr.progress} />
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
                      const assignee = employees.find(e => e.id === t.empId);
                      return (
                        <div key={t._id} className="ats-cand-card" style={{ cursor: 'pointer' }} onClick={() => {
                          const nextState = t.status === 'todo' ? 'in-progress' : t.status === 'in-progress' ? 'done' : 'todo';
                          handleMoveTaskStatus(t._id, nextState);
                        }}>
                          <h5 style={{ marginBottom: '6px' }}>{t.title}</h5>
                          <p>{t.project}</p>
                          {assignee && assignee.id !== user.id && (
                            <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <i className="fa-solid fa-circle-user"></i>
                              <span>{assignee.name}</span>
                            </div>
                          )}
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

          <div className="card" style={{ marginTop: '24px' }}>
            <div className="card-title">Task Deadline Tracker</div>
            <div className="table-responsive">
              <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Task Title</th>
                    <th>Project</th>
                    <th>Assignee</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '16px' }}>No tasks registered.</td>
                    </tr>
                  ) : (
                    tasks.map((t, idx) => {
                      const assignee = employees.find(e => e.id === t.empId);
                      return (
                        <tr key={idx} style={t.priority === 'High' ? { background: 'rgba(244,63,94,0.05)' } : {}}>
                          <td><strong>{t.title}</strong></td>
                          <td>{t.project}</td>
                          <td>
                            {assignee ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img src={getAvatarUrl(assignee)} style={{ width: '22px', height: '22px', borderRadius: '50%' }} alt="avatar" />
                                <span>{assignee.name}</span>
                              </div>
                            ) : 'Unassigned'}
                          </td>
                          <td><span className={`badge ${t.priority === 'High' ? 'badge-danger' : t.priority === 'Medium' ? 'badge-warning' : 'badge-success'}`}>{t.priority}</span></td>
                          <td>{t.due}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
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
                <>
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div className="form-group">
                        <label>From Time</label>
                        <input 
                          type="time" 
                          className="form-control" 
                          value={newMeetFromTime}
                          onChange={(e) => { setNewMeetFromTime(e.target.value); setNewMeetTime(e.target.value); }}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>To Time</label>
                        <input 
                          type="time" 
                          className="form-control" 
                          value={newMeetToTime}
                          onChange={(e) => setNewMeetToTime(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {newMeetDate && (
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                        Available Time Slots on {newMeetDate}:
                      </label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {getAvailableSlots().map(slot => (
                          <button
                            key={slot.id}
                            type="button"
                            className={`btn ${slot.isBooked ? 'btn-secondary' : 'btn-primary'}`}
                            style={{ 
                              padding: '4px 10px', 
                              fontSize: '0.75rem', 
                              opacity: slot.isBooked ? 0.4 : 1,
                              cursor: slot.isBooked ? 'not-allowed' : 'pointer'
                            }}
                            disabled={slot.isBooked}
                            onClick={() => {
                              setNewMeetFromTime(slot.from);
                              setNewMeetToTime(slot.to);
                              setNewMeetTime(slot.from);
                            }}
                          >
                            {slot.label} {slot.isBooked ? '(Booked)' : '(Available)'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                    <div className="form-group">
                      <label>Meeting Agenda</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Sprint planning review" 
                        value={newMeetAgenda}
                        onChange={(e) => setNewMeetAgenda(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Topics to Discuss</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Architecture, Design" 
                        value={newMeetTopics}
                        onChange={(e) => setNewMeetTopics(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                    <div className="form-group">
                      <label>Expected Attendees Count</label>
                      <input 
                        type="number" 
                        min="1"
                        className="form-control" 
                        value={newMeetAttendeesCount}
                        onChange={(e) => setNewMeetAttendeesCount(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Meeting Notes / Points</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Bring laptop and research materials" 
                        value={newMeetPoints}
                        onChange={(e) => setNewMeetPoints(e.target.value)}
                      />
                    </div>
                  </div>
                </>
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

              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', width: '100%' }}>
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
                  <div key={idx} className="emp-card" style={{ textAlign: 'left', ...cardStyle, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <strong>{m.title}</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0' }}>Host: {m.host} | Date: {m.date} | Time: {m.time}</p>
                    {m.agenda && <p style={{ fontSize: '0.8rem', margin: '0' }}><strong>Agenda:</strong> {m.agenda}</p>}
                    {m.topics && <p style={{ fontSize: '0.8rem', margin: '0' }}><strong>Topics:</strong> {m.topics}</p>}
                    {m.points && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0' }}><strong>Notes:</strong> {m.points}</p>}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', fontSize: '0.75rem', marginTop: '4px' }}>
                      <span className="badge badge-info">Duration: {m.durationHours || 1.0}h</span>
                      <span className="badge badge-primary">Attendees: {m.attendeesCount || 1}</span>
                    </div>
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
              {ticketSubmitted ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <i className="fa-solid fa-circle-check" style={{ fontSize: '3rem', color: '#10B981', marginBottom: '16px' }}></i>
                  <h4 style={{ color: '#fff', marginBottom: '8px' }}>Ticket Submitted!</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>Your ticket has been logged and sent to HR.</p>
                  <button className="btn btn-secondary" onClick={() => setTicketSubmitted(false)}>Raise a New Ticket</button>
                </div>
              ) : (
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
              )}
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

 
      {/* 14. Engagement Hub View */}
      {currentModule === 'emp-engagement' && (
        <section id="emp-mod-emp-engagement" className="emp-module">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Dino Runner Game */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="card-title" style={{ width: '100%' }}>
                <i className="fa-solid fa-person-running" style={{ marginRight: '8px', color: 'hsl(var(--primary))' }}></i>
                HR Dino Runner (Overload Dodge)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
                <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
                  <canvas id="runner-canvas" width="680" height="200" style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.4)', display: 'block' }}></canvas>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="button" className="btn btn-primary" id="start-runner-btn">Start / Restart Game</button>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            {/* Global Chat Board */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
              <div className="card-title">
                <i className="fa-solid fa-comments" style={{ marginRight: '8px', color: 'hsl(var(--primary))' }}></i>
                Global Discussion Board
              </div>
              <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {discussionMessages.map((msg) => (
                  <div key={msg._id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem' }}>
                    <img src={msg.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} alt="Avatar" />
                    <div style={{ background: 'hsl(var(--bg-main))', padding: '10px 14px', borderRadius: '12px', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.8rem', marginBottom: '4px' }}>
                        <span>{msg.senderName} <span style={{ opacity: 0.7, fontWeight: 400, fontSize: '0.75rem', marginLeft: '4px' }}>({msg.senderRole})</span></span>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '0.75rem' }}>{msg.time}</span>
                      </div>
                      <div style={{ wordBreak: 'break-word', lineHeight: '1.4' }}>{msg.message}</div>
                    </div>
                  </div>
                ))}
                {discussionMessages.length === 0 && (
                  <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>No messages posted yet. Be the first to start the discussion!</div>
                )}
                <div ref={discussionMessagesEndRef} />
              </div>
              <form onSubmit={handleSendDiscussion} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type a message to broadcast..."
                  value={discussionInput}
                  onChange={(e) => setDiscussionInput(e.target.value)}
                  style={{ flex: 1 }}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}><i className="fa-solid fa-paper-plane"></i> Send</button>
              </form>
            </div>

            {/* Interactive Trivia Challenge */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-title">
                <i className="fa-solid fa-gamepad" style={{ marginRight: '8px', color: 'hsl(var(--warning))' }}></i>
                TalentSphere Trivia Challenge
              </div>
              
              {!triviaComplete ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Question {triviaIndex + 1} of {triviaQuestions.length}</span>
                    <span>Score: {triviaScore} / {triviaQuestions.length}</span>
                  </div>
                  
                  <div style={{ height: '6px', background: 'hsl(var(--border))', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${((triviaIndex) / triviaQuestions.length) * 100}%`, height: '100%', backgroundColor: 'hsl(var(--primary))', transition: 'width 0.3s' }}></div>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '10px 0', lineHeight: '1.4' }}>
                    {triviaQuestions[triviaIndex].question}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {triviaQuestions[triviaIndex].options.map((opt) => {
                      let btnStyle = {
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        padding: '12px 16px',
                        border: '1px solid hsl(var(--border))',
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        width: '100%',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                      };

                      if (triviaSelected === opt) {
                        btnStyle.border = '2px solid hsl(var(--primary))';
                        btnStyle.background = 'hsla(var(--primary), 0.1)';
                      }

                      if (triviaChecked) {
                        btnStyle.cursor = 'not-allowed';
                        if (opt === triviaQuestions[triviaIndex].answer) {
                          btnStyle.border = '2px solid hsl(var(--success))';
                          btnStyle.background = 'hsla(var(--success), 0.1)';
                          btnStyle.color = 'hsl(var(--success))';
                        } else if (triviaSelected === opt) {
                          btnStyle.border = '2px solid hsl(var(--danger))';
                          btnStyle.background = 'hsla(var(--danger), 0.1)';
                          btnStyle.color = 'hsl(var(--danger))';
                        }
                      }

                      return (
                        <button
                          key={opt}
                          type="button"
                          className="btn"
                          style={btnStyle}
                          disabled={triviaChecked}
                          onClick={() => setTriviaSelected(opt)}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    {!triviaChecked ? (
                      <button
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={!triviaSelected}
                        onClick={() => {
                          setTriviaChecked(true);
                          if (triviaSelected === triviaQuestions[triviaIndex].answer) {
                            setTriviaScore(prev => prev + 1);
                          }
                        }}
                      >
                        Check Answer
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        onClick={() => {
                          if (triviaIndex < triviaQuestions.length - 1) {
                            setTriviaIndex(prev => prev + 1);
                            setTriviaSelected('');
                            setTriviaChecked(false);
                          } else {
                            setTriviaComplete(true);
                          }
                        }}
                      >
                        {triviaIndex < triviaQuestions.length - 1 ? 'Next Question' : 'Finish Challenge'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                  <i className="fa-solid fa-trophy" style={{ fontSize: '4rem', color: 'hsl(var(--warning))' }}></i>
                  <div>
                    <h2 style={{ fontWeight: 700 }}>Challenge Completed!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Your final score is: <strong>{triviaScore} / {triviaQuestions.length}</strong></p>
                  </div>
                  <div style={{ background: 'hsl(var(--bg-main))', padding: '15px 25px', borderRadius: '10px', fontSize: '0.85rem' }}>
                    {triviaScore === triviaQuestions.length ? (
                      <span style={{ color: 'hsl(var(--success))', fontWeight: 600 }}>🏆 Perfect Score! You are a TalentSphere Expert!</span>
                    ) : triviaScore >= 3 ? (
                      <span style={{ color: 'hsl(var(--primary))', fontWeight: 600 }}>🌟 Great job! Excellent knowledge.</span>
                    ) : (
                      <span>Keep learning and try again to beat your score!</span>
                    )}
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setTriviaIndex(0);
                      setTriviaSelected('');
                      setTriviaChecked(false);
                      setTriviaScore(0);
                      setTriviaComplete(false);
                    }}
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Daily Work Reports Module */}
      {currentModule === 'emp-reports' && (
        <section id="emp-mod-emp-reports" className="emp-module">
          {user.isTeamLead && (
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button className={`btn ${reportTab === 'submit' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setReportTab('submit')}>Submit My Report</button>
              <button className={`btn ${reportTab === 'reviews' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setReportTab('reviews'); setSelectedReportForReview(null); }}>Teammate Reports</button>
            </div>
          )}

          {(!user.isTeamLead || reportTab === 'submit') && (
            <div className="dashboard-layout">
              <div>
                <div className="card">
                  <div className="card-title">Submit Daily Work Report</div>
                  <form onSubmit={handleDailyReportSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Report Date</label>
                        <input type="date" className="form-control" value={reportDate} onChange={(e) => setReportDate(e.target.value)} required />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Hours Worked</label>
                        <input type="number" className="form-control" min="1" max="24" value={reportHours} onChange={(e) => setReportHours(parseInt(e.target.value))} required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Tasks Completed Today</label>
                      <textarea className="form-control" style={{ height: '100px' }} placeholder="Detail your daily achievements..." value={reportTasks} onChange={(e) => setReportTasks(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Blockers (Optional)</label>
                      <textarea className="form-control" style={{ height: '70px' }} placeholder="Any issues or blockers you faced..." value={reportBlockers} onChange={(e) => setReportBlockers(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit to Reporting Lead</button>
                  </form>
                </div>
              </div>

              <div>
                <div className="card">
                  <div className="card-title">My Past Reports</div>
                  <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                    <table className="custom-table" style={{ fontSize: '0.825rem' }}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Hours</th>
                          <th>Tasks</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyReports.filter(r => r.empId === user.id).length === 0 ? (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '16px' }}>No reports submitted yet.</td>
                          </tr>
                        ) : (
                          dailyReports.filter(r => r.empId === user.id).map(r => (
                            <tr key={r._id}>
                              <td>{r.date}</td>
                              <td>{r.hoursWorked} hrs</td>
                              <td>
                                <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.tasksCompleted}>
                                  {r.tasksCompleted}
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <span className={`badge ${r.status === 'Reviewed' ? 'badge-success' : 'badge-warning'}`}>{r.status}</span>
                                  {r.reviewFeedback && (
                                    <div style={{ 
                                      fontSize: '0.75rem', 
                                      background: 'hsla(var(--success), 0.08)', 
                                      padding: '6px', 
                                      borderRadius: '4px',
                                      border: '1px solid hsla(var(--success), 0.2)',
                                      color: 'var(--text-primary)',
                                      marginTop: '4px',
                                      whiteSpace: 'pre-wrap',
                                      lineHeight: '1.3'
                                    }}>
                                      <strong>Review:</strong> {r.reviewFeedback}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {user.isTeamLead && reportTab === 'reviews' && (
            <div className="dashboard-layout">
              <div style={{ flex: 1.5 }}>
                <div className="card">
                  <div className="card-title">Teammate Work Reports Received</div>
                  <div className="table-responsive">
                    <table className="custom-table" style={{ fontSize: '0.825rem' }}>
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th>Date</th>
                          <th>Tasks Completed</th>
                          <th>Blockers</th>
                          <th>Hours</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyReports.filter(r => r.empId !== user.id).length === 0 ? (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '16px' }}>No reports received from teammates yet.</td>
                          </tr>
                        ) : (
                          dailyReports.filter(r => r.empId !== user.id).map(r => (
                            <tr key={r._id} style={r.blockers ? { background: 'hsla(var(--danger), 0.02)' } : {}}>
                              <td>
                                <strong>{r.empName}</strong>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{r.empEmail}</div>
                              </td>
                              <td>{r.date}</td>
                              <td>
                                <div style={{ maxWidth: '250px', maxHeight: '60px', overflowY: 'auto', whiteSpace: 'pre-wrap', lineHeight: '1.3' }}>
                                  {r.tasksCompleted}
                                </div>
                              </td>
                              <td>
                                {r.blockers ? (
                                  <span style={{ color: 'hsl(var(--danger))', fontWeight: 600 }}>
                                    ⚠️ {r.blockers}
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--text-secondary)' }}>None</span>
                                )}
                              </td>
                              <td>{r.hoursWorked} hrs</td>
                              <td>
                                <span className={`badge ${r.status === 'Reviewed' ? 'badge-success' : 'badge-warning'}`}>{r.status}</span>
                              </td>
                              <td>
                                <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => { setSelectedReportForReview(r); setReviewFeedback(r.reviewFeedback || ''); }}>Review</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {selectedReportForReview && (
                <div style={{ flex: 1 }}>
                  <div className="card" style={{ borderLeft: '4px solid hsl(var(--primary))' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div className="card-title" style={{ marginBottom: 0 }}>Reviewing Report</div>
                      <button className="close-modal" type="button" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setSelectedReportForReview(null)}>
                        <i className="fa-solid fa-xmark" style={{ fontSize: '1rem' }}></i>
                      </button>
                    </div>
                    <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <strong>From:</strong> {selectedReportForReview.empName} ({selectedReportForReview.empId})
                      </div>
                      <div>
                        <strong>Date:</strong> {selectedReportForReview.date} | <strong>Hours:</strong> {selectedReportForReview.hoursWorked} hrs
                      </div>
                      <div style={{ background: 'hsl(var(--bg-main))', padding: '10px', borderRadius: '6px' }}>
                        <strong>Tasks Completed:</strong>
                        <p style={{ marginTop: '4px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{selectedReportForReview.tasksCompleted}</p>
                      </div>
                      {selectedReportForReview.blockers && (
                        <div style={{ background: 'hsla(var(--danger), 0.05)', border: '1px solid hsla(var(--danger), 0.2)', padding: '10px', borderRadius: '6px', color: 'hsl(var(--danger))' }}>
                          <strong>Blockers reported:</strong>
                          <p style={{ marginTop: '4px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{selectedReportForReview.blockers}</p>
                        </div>
                      )}
                      <form onSubmit={handleReviewSubmit}>
                        <div className="form-group">
                          <label>Review Feedback</label>
                          <textarea 
                            className="form-control" 
                            style={{ height: '90px' }} 
                            placeholder="Type feedback, approval comments or guidance..." 
                            value={reviewFeedback} 
                            onChange={(e) => setReviewFeedback(e.target.value)} 
                            required 
                          />
                        </div>
                        <button type="submit" className="btn btn-success" style={{ width: '100%' }}>Submit Review & Feedback</button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
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
        teammates={user.isTeamLead ? employees.filter(e => e.teamLeadId === user.id) : []}
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
