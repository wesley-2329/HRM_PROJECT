import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { encodeId, getAvatarUrl } from '../App';
import hrorbitLogo from '../assets/hrorbit_logo.png';

const Sidebar = ({ collapsed, setCollapsed, currentModule, mobileActive, setMobileActive }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const hrMenu = [
    { id: 'dashboard', label: 'Overview', icon: 'fa-chart-line' },
    { id: 'hr-profile', label: 'My Profile', icon: 'fa-circle-user' },
    { id: 'approvals-inbox', label: 'Approvals Inbox', icon: 'fa-stamp' },
    { id: 'employee-management', label: 'Employee Directory', icon: 'fa-user-group' },
    { id: 'probation-management', label: 'Probation Hub', icon: 'fa-user-clock' },
    { id: 'transfer-management', label: 'Transfer Hub', icon: 'fa-right-left' },
    { id: 'promotion-management', label: 'Promotion Hub', icon: 'fa-angles-up' },
    { id: 'grade-management', label: 'Grade & Band Hub', icon: 'fa-layer-group' },
    { id: 'salary-revision-management', label: 'Salary Revision Hub', icon: 'fa-money-bill-trend-up' },
    { id: 'org-structure', label: 'Org Structure', icon: 'fa-sitemap' },
    { id: 'document-vault', label: 'Document Vault', icon: 'fa-vault' },
    { id: 'attendance-leave', label: 'Attendance & Shift', icon: 'fa-calendar-check' },
    { id: 'payroll-management', label: 'Payroll Hub', icon: 'fa-wallet' },
    { id: 'recruitment-ats', label: 'Recruitment ATS', icon: 'fa-magnifying-glass-chart' },
    { id: 'policy-repository', label: 'HR Governance', icon: 'fa-shield-halved' },
    { id: 'hr-tickets', label: 'Support Tickets', icon: 'fa-headset' },
    { id: 'reports-analytics', label: 'Reports & Audits', icon: 'fa-chart-pie' },
    { id: 'notification-system', label: 'Alert Center', icon: 'fa-bell' },
    { id: 'settings-profile', label: 'System Settings', icon: 'fa-gears' },
  ];

  const empMenu = [
    { id: 'emp-dashboard', label: 'My Dashboard', icon: 'fa-gauge-high' },
    { id: 'approvals-inbox', label: 'Approvals Inbox', icon: 'fa-stamp' },
    { id: 'probation-management', label: 'My Probation Tracker', icon: 'fa-user-clock' },
    { id: 'transfer-management', label: 'My Transfer Hub', icon: 'fa-right-left' },
    { id: 'promotion-management', label: 'My Promotion Tracker', icon: 'fa-angles-up' },
    { id: 'grade-management', label: 'My Grade & Band Info', icon: 'fa-layer-group' },
    { id: 'salary-revision-management', label: 'My Salary Revisions', icon: 'fa-money-bill-trend-up' },
    { id: 'org-structure', label: 'Org Structure', icon: 'fa-sitemap' },
    { id: 'emp-profile', label: 'My Profile', icon: 'fa-circle-user' },
    { id: 'emp-documents', label: 'My Document Vault', icon: 'fa-vault' },
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
    { id: 'emp-policies', label: 'Policy Repository', icon: 'fa-building-columns' },
    { id: 'emp-settings', label: 'Settings', icon: 'fa-gear' },
  ];

  const menu = user.role === 'hr' ? hrMenu : empMenu;

  const handleNavClick = (id) => {
    if (id === 'org-structure') {
      navigate('/organization');
    } else if (user.role === 'hr') {
      navigate(`/hr/${id}`);
    } else {
      navigate(`/employee/${encodeId(user.id)}/${id}`);
    }
    setMobileActive(false); // Close sidebar on mobile
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileActive ? 'active' : ''}`}>
      <div className="sidebar-top">
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={hrorbitLogo} alt="HR O Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
          <span className="logo-text" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'hsl(var(--primary))', letterSpacing: '0.5px' }}>HR O</span>
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
              className={`nav-item ${
                currentModule === item.id || (item.id === 'org-structure' && location.pathname.startsWith('/organization'))
                  ? 'active'
                  : ''
              }`}
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
        <div style={{ padding: collapsed ? '12px 0' : '12px 16px', display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start', alignItems: 'center', gap: '10px', fontSize: '0.7rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          {!collapsed && <span style={{ transition: 'opacity 0.2s', fontWeight: 600 }}>Atlas Node Active</span>}
        </div>
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
