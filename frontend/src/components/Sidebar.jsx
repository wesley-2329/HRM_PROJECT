import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { encodeId, getAvatarUrl } from '../App';

const Sidebar = ({ collapsed, setCollapsed, currentModule, mobileActive, setMobileActive }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return null;

  const hrMenu = [
    { id: 'dashboard', label: 'Overview', icon: 'fa-chart-line' },
    { id: 'hr-profile', label: 'My Profile', icon: 'fa-circle-user' },
    { id: 'employee-management', label: 'Employee Directory', icon: 'fa-user-group' },
    { id: 'attendance-leave', label: 'Attendance & Shift', icon: 'fa-calendar-check' },
    { id: 'payroll-management', label: 'Payroll Hub', icon: 'fa-wallet' },
    { id: 'recruitment-ats', label: 'Recruitment ATS', icon: 'fa-magnifying-glass-chart' },
    { id: 'compliance-management', label: 'Compliance Hub', icon: 'fa-shield-halved' },
    { id: 'hr-tickets', label: 'Support Tickets', icon: 'fa-headset' },
    { id: 'reports-analytics', label: 'Reports & Audits', icon: 'fa-chart-pie' },
    { id: 'notification-system', label: 'Alert Center', icon: 'fa-bell' },
    { id: 'settings-profile', label: 'System Settings', icon: 'fa-gears' },
  ];

  const empMenu = [
    { id: 'emp-dashboard', label: 'My Dashboard', icon: 'fa-gauge-high' },
    { id: 'emp-profile', label: 'My Profile', icon: 'fa-circle-user' },
    { id: 'emp-documents', label: 'My Documents', icon: 'fa-folder-open' },
    { id: 'emp-attendance', label: 'Attendance', icon: 'fa-calendar-check' },
    { id: 'emp-payroll', label: 'Payroll & Salary', icon: 'fa-indian-rupee-sign' },
    { id: 'emp-pip', label: 'Performance & Appraisals', icon: 'fa-star-half-stroke' },
    { id: 'emp-learning', label: 'Learning & Dev', icon: 'fa-book-open' },
    { id: 'emp-tasks', label: 'Tasks', icon: 'fa-list-check' },
    { id: 'emp-meetings', label: 'Meetings', icon: 'fa-video' },
    { id: 'emp-engagement', label: 'Engagement Hub', icon: 'fa-gamepad' },
    { id: 'emp-reports', label: 'Daily Reports', icon: 'fa-clipboard-list' },
    { id: 'emp-notifications', label: 'Notifications', icon: 'fa-bell' },
    { id: 'emp-helpdesk', label: 'Helpdesk / Support', icon: 'fa-headset' },
    { id: 'emp-policies', label: 'Company Policies', icon: 'fa-building-columns' },
    { id: 'emp-settings', label: 'Settings', icon: 'fa-gear' },
  ];

  const menu = user.role === 'hr' ? hrMenu : empMenu;

  const handleNavClick = (id) => {
    if (user.role === 'hr') {
      navigate(`/hr/${id}`);
    } else {
      navigate(`/employee/${encodeId(user.id)}/${id}`);
    }
    setMobileActive(false); // Close sidebar on mobile
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileActive ? 'active' : ''}`}>
      <div className="sidebar-top">
        <div className="sidebar-header">
          <i className="fa-solid fa-layer-group"></i>
          <span className="logo-text">TalentSphere</span>
        </div>
        <div className="profile-card">
          <img src={getAvatarUrl(user)} alt="Avatar" />
          <div className="profile-info">
            <h4>{user.name}</h4>
            <p>{user.role === 'hr' ? 'HR Director' : user.role}</p>
          </div>
        </div>
        <nav className="nav-list">
          {menu.map((item) => (
            <a
              key={item.id}
              className={`nav-item ${currentModule === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              <span className="nav-text">{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
      <div className="sidebar-bottom">
        {user.role === 'employee' && (
          <a className="nav-item" id="fun-zone-nav" onClick={() => {
            const gamesOverlay = document.getElementById('games-overlay');
            if (gamesOverlay) {
              gamesOverlay.style.display = 'flex';
              if (window.switchGameTab) window.switchGameTab('puzzle');
            }
          }}>
            <i className="fa-solid fa-gamepad"></i>
            <span className="nav-text">Fun Zone</span>
          </a>
        )}
        <a className="nav-item signout" onClick={logout}>
          <i className="fa-solid fa-right-from-bracket"></i>
          <span className="nav-text">Secure Sign Out</span>
        </a>
        <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
          <i className={`fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
