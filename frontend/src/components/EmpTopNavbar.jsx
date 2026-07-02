import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { getAvatarUrl, encodeId } from '../App';

const EmpTopNavbar = ({ currentModule, darkMode, setDarkMode, navbarTheme = 'indigo', onSearch }) => {
  const { user, logout } = useContext(AuthContext);
  const { notifications } = useContext(DataContext);
  const [profileDropdownActive, setProfileDropdownActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-dropdown-btn') && !e.target.closest('.dropdown-menu')) {
        setProfileDropdownActive(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.read).length;
  const hashId = encodeId(user.id);

  const handleNavClick = (mod) => {
    if (mod === 'org-structure') {
      navigate('/organization');
    } else {
      navigate(`/employee/${hashId}/${mod}`);
    }
    setProfileDropdownActive(false);
  };

  const isTabActive = (modId) => {
    if (modId === 'org-structure') {
      return location.pathname.startsWith('/organization');
    }
    return currentModule === modId;
  };

  const isGroupActive = (modules) => {
    return modules.some(mod => isTabActive(mod));
  };

  const openFunZone = () => {
    const gamesOverlay = document.getElementById('games-overlay');
    if (gamesOverlay) {
      gamesOverlay.style.display = 'flex';
      if (window.switchGameTab) window.switchGameTab('puzzle');
    }
    setProfileDropdownActive(false);
  };

  return (
    <header className={`emp-header theme-${navbarTheme}`}>
      <div className="emp-header-left">
        <div className="emp-logo" onClick={() => navigate(`/employee/${hashId}/emp-dashboard`)}>
          <i className="fa-solid fa-graduation-cap"></i>
          <span>TalentSphere</span>
        </div>

        <nav className="emp-nav-menu">
          {/* Dashboard Link */}
          <div className="emp-menu-item">
            <a
              className={`emp-menu-link ${isTabActive('emp-dashboard') ? 'active' : ''}`}
              onClick={() => handleNavClick('emp-dashboard')}
            >
              <i className="fa-solid fa-house"></i>
              My Dashboard
            </a>
          </div>

          {/* Directory Dropdown */}
          <div className="emp-menu-item">
            <a className={`emp-menu-link ${isGroupActive(['org-structure', 'emp-policies']) ? 'active' : ''}`}>
              <i className="fa-solid fa-sitemap"></i>
              Directory
              <i className="fa-solid fa-chevron-down"></i>
            </a>
            <div className="emp-dropdown-panel">
              <a
                className={`emp-dropdown-item ${isTabActive('org-structure') ? 'active' : ''}`}
                onClick={() => handleNavClick('org-structure')}
              >
                <i className="fa-solid fa-hierarchy"></i>
                <div>
                  Org Structure
                  <span className="emp-dropdown-item-desc">Browse reporting charts and direct reports</span>
                </div>
              </a>
              <a
                className={`emp-dropdown-item ${isTabActive('emp-policies') ? 'active' : ''}`}
                onClick={() => handleNavClick('emp-policies')}
              >
                <i className="fa-solid fa-building-columns"></i>
                <div>
                  Company Policies
                  <span className="emp-dropdown-item-desc">Read code of conduct guidelines and manuals</span>
                </div>
              </a>
            </div>
          </div>

          {/* My Operations Dropdown */}
          <div className="emp-menu-item">
            <a className={`emp-menu-link ${isGroupActive(['emp-attendance', 'emp-payroll', 'emp-documents']) ? 'active' : ''}`}>
              <i className="fa-solid fa-briefcase"></i>
              Operations
              <i className="fa-solid fa-chevron-down"></i>
            </a>
            <div className="emp-dropdown-panel" style={{ minWidth: '320px' }}>
              <a
                className={`emp-dropdown-item ${isTabActive('emp-attendance') ? 'active' : ''}`}
                onClick={() => handleNavClick('emp-attendance')}
              >
                <i className="fa-solid fa-calendar-days"></i>
                <div>
                  Attendance
                  <span className="emp-dropdown-item-desc">Log your work shifts and check leave schedules</span>
                </div>
              </a>
              <a
                className={`emp-dropdown-item ${isTabActive('emp-payroll') ? 'active' : ''}`}
                onClick={() => handleNavClick('emp-payroll')}
              >
                <i className="fa-solid fa-indian-rupee-sign"></i>
                <div>
                  Payroll & Salary
                  <span className="emp-dropdown-item-desc">Download payslips and verify benefits payouts</span>
                </div>
              </a>
              <a
                className={`emp-dropdown-item ${isTabActive('emp-documents') ? 'active' : ''}`}
                onClick={() => handleNavClick('emp-documents')}
              >
                <i className="fa-solid fa-vault"></i>
                <div>
                  My Document Vault
                  <span className="emp-dropdown-item-desc">Securely access credentials, IDs and agreements</span>
                </div>
              </a>
            </div>
          </div>

          {/* Growth Dropdown */}
          <div className="emp-menu-item">
            <a className={`emp-menu-link ${isGroupActive(['emp-pip', 'emp-learning']) ? 'active' : ''}`}>
              <i className="fa-solid fa-graduation-cap"></i>
              Growth
              <i className="fa-solid fa-chevron-down"></i>
            </a>
            <div className="emp-dropdown-panel">
              <a
                className={`emp-dropdown-item ${isTabActive('emp-pip') ? 'active' : ''}`}
                onClick={() => handleNavClick('emp-pip')}
              >
                <i className="fa-solid fa-star-half-stroke"></i>
                <div>
                  Performance & PIP
                  <span className="emp-dropdown-item-desc">Check appraisal reviews and feedback metrics</span>
                </div>
              </a>
              <a
                className={`emp-dropdown-item ${isTabActive('emp-learning') ? 'active' : ''}`}
                onClick={() => handleNavClick('emp-learning')}
              >
                <i className="fa-solid fa-book-open"></i>
                <div>
                  Learning & Dev
                  <span className="emp-dropdown-item-desc">Access training courses and build career skills</span>
                </div>
              </a>
            </div>
          </div>

          {/* Workplace Dropdown */}
          <div className="emp-menu-item">
            <a className={`emp-menu-link ${isGroupActive(['emp-tasks', 'emp-meetings', 'emp-reports']) ? 'active' : ''}`}>
              <i className="fa-solid fa-desktop"></i>
              Workplace
              <i className="fa-solid fa-chevron-down"></i>
            </a>
            <div className="emp-dropdown-panel" style={{ minWidth: '320px' }}>
              <a
                className={`emp-dropdown-item ${isTabActive('emp-tasks') ? 'active' : ''}`}
                onClick={() => handleNavClick('emp-tasks')}
              >
                <i className="fa-solid fa-list-check"></i>
                <div>
                  Tasks
                  <span className="emp-dropdown-item-desc">Organize, schedule, and mark daily checklist cards</span>
                </div>
              </a>
              <a
                className={`emp-dropdown-item ${isTabActive('emp-meetings') ? 'active' : ''}`}
                onClick={() => handleNavClick('emp-meetings')}
              >
                <i className="fa-solid fa-video"></i>
                <div>
                  Meetings
                  <span className="emp-dropdown-item-desc">View calendar appointments and join online rooms</span>
                </div>
              </a>
              <a
                className={`emp-dropdown-item ${isTabActive('emp-reports') ? 'active' : ''}`}
                onClick={() => handleNavClick('emp-reports')}
              >
                <i className="fa-solid fa-clipboard-list"></i>
                <div>
                  Daily Reports
                  <span className="emp-dropdown-item-desc">Submit timesheets and verify log activity reviews</span>
                </div>
              </a>
            </div>
          </div>

          {/* Hub Dropdown */}
          <div className="emp-menu-item">
            <a className={`emp-menu-link ${isGroupActive(['emp-engagement', 'emp-helpdesk']) ? 'active' : ''}`}>
              <i className="fa-solid fa-comments"></i>
              Hub
              <i className="fa-solid fa-chevron-down"></i>
            </a>
            <div className="emp-dropdown-panel">
              <a
                className={`emp-dropdown-item ${isTabActive('emp-engagement') ? 'active' : ''}`}
                onClick={() => handleNavClick('emp-engagement')}
              >
                <i className="fa-solid fa-gamepad"></i>
                <div>
                  Engagement Hub
                  <span className="emp-dropdown-item-desc">Participate in team events and check announcements</span>
                </div>
              </a>
              <a
                className={`emp-dropdown-item ${isTabActive('emp-helpdesk') ? 'active' : ''}`}
                onClick={() => handleNavClick('emp-helpdesk')}
              >
                <i className="fa-solid fa-headset"></i>
                <div>
                  Helpdesk Support
                  <span className="emp-dropdown-item-desc">Open tickets for technical or facilities assistance</span>
                </div>
              </a>
            </div>
          </div>
        </nav>
      </div>

      <div className="emp-header-right">
        {/* Global Search */}
        <div className="emp-search">
          <i className="fa-solid fa-search"></i>
          <input
            type="text"
            placeholder="Search features, tools or docs..."
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
        </div>

        {/* Notifications */}
        <button
          className="nav-icon-btn"
          onClick={() => handleNavClick('emp-notifications')}
          style={{ position: 'relative' }}
        >
          <i className="fa-solid fa-bell"></i>
          {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
        </button>

        {/* Dark Mode Toggle */}
        <button
          className="theme-toggle-btn"
          onClick={() => {
            const nextMode = !darkMode;
            setDarkMode(nextMode);
            if (window.triggerModeAnimation) {
              window.triggerModeAnimation(nextMode);
            }
          }}
          aria-label="Toggle dark mode"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <svg className={`theme-toggle-svg ${darkMode ? 'dark' : 'light'}`} viewBox="0 0 24 24" width="22" height="22">
            <mask id="moon-mask-emp">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <circle className="moon-mask-circle" cx="24" cy="0" r="9" fill="black" />
            </mask>
            <circle className="sun-center" cx="12" cy="12" r="5" fill="currentColor" mask="url(#moon-mask-emp)" />
            <g className="sun-rays" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </g>
          </svg>
        </button>

        {/* User Dropdown */}
        <div style={{ position: 'relative' }}>
          <div className="user-dropdown-btn" onClick={() => setProfileDropdownActive(prev => !prev)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <img src={getAvatarUrl(user)} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>
              {user.name.split(' ')[0]}
            </span>
            <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))' }}></i>
          </div>
          <div className={`dropdown-menu ${profileDropdownActive ? 'active' : ''}`} style={{ right: 0, top: '48px' }}>
            <a className="dropdown-item" onClick={() => handleNavClick('emp-profile')}>
              <i className="fa-solid fa-user"></i> My Profile
            </a>
            <a className="dropdown-item" onClick={() => handleNavClick('emp-settings')}>
              <i className="fa-solid fa-gear"></i> Settings
            </a>
            <a className="dropdown-item" onClick={openFunZone}>
              <i className="fa-solid fa-gamepad"></i> Fun Zone
            </a>
            <a className="dropdown-item" onClick={() => handleNavClick('emp-notifications')}>
              <i className="fa-solid fa-bell"></i> Alerts Center
            </a>
            <hr style={{ margin: '4px 0', opacity: 0.1 }} />
            <a className="dropdown-item signout" onClick={logout}>
              <i className="fa-solid fa-right-from-bracket"></i> Secure Sign Out
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default EmpTopNavbar;
