import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { getAvatarUrl } from '../App';
import hrorbitLogo from '../assets/hrorbit_logo.png';

const HRTopNavbar = ({ currentModule, darkMode, setDarkMode, onSearch }) => {
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

  const handleNavClick = (mod) => {
    if (mod === 'org-structure') {
      navigate('/organization');
    } else {
      navigate(`/hr/${mod}`);
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

  return (
    <header className="hr-header">
      <div className="hr-header-left">
        <div className="hr-logo" onClick={() => navigate('/hr/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <img src={hrorbitLogo} alt="HR O Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'hsl(var(--primary))', letterSpacing: '0.5px' }}>HR O</span>
        </div>

        {/* Back and Forward Navigation Controls */}
        <div style={{ display: 'flex', gap: '8px', marginRight: '16px', marginLeft: '8px' }}>
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-secondary"
            title="Navigate Back"
            style={{ padding: '6px 10px', height: '32px', minWidth: '32px', borderRadius: '6px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--bg-card))', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <i className="fa-solid fa-chevron-left" style={{ fontSize: '0.8rem' }}></i>
          </button>
          <button 
            onClick={() => navigate(1)} 
            className="btn btn-secondary"
            title="Navigate Forward"
            style={{ padding: '6px 10px', height: '32px', minWidth: '32px', borderRadius: '6px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--bg-card))', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.8rem' }}></i>
          </button>
        </div>

        <nav className="hr-nav-menu">
          {/* Overview Link */}
          <div className="hr-menu-item">
            <a
              className={`hr-menu-link ${isTabActive('dashboard') ? 'active' : ''}`}
              onClick={() => handleNavClick('dashboard')}
            >
              <i className="fa-solid fa-chart-line"></i>
              Overview
            </a>
          </div>

          {/* Workforce Dropdown */}
          <div className="hr-menu-item">
            <a className={`hr-menu-link ${isGroupActive(['employee-management', 'org-structure']) ? 'active' : ''}`}>
              <i className="fa-solid fa-user-gear"></i>
              Workforce
              <i className="fa-solid fa-chevron-down"></i>
            </a>
            <div className="hr-dropdown-panel">
              <a
                className={`hr-dropdown-item ${isTabActive('employee-management') ? 'active' : ''}`}
                onClick={() => handleNavClick('employee-management')}
              >
                <i className="fa-solid fa-user-group"></i>
                <div>
                  Employee Directory
                  <span className="hr-dropdown-item-desc">Manage employee profiles and document sets</span>
                </div>
              </a>
              <a
                className={`hr-dropdown-item ${isTabActive('org-structure') ? 'active' : ''}`}
                onClick={() => handleNavClick('org-structure')}
              >
                <i className="fa-solid fa-sitemap"></i>
                <div>
                  Org Structure
                  <span className="hr-dropdown-item-desc">Visualize reporting charts and design divisions</span>
                </div>
              </a>
            </div>
          </div>

          {/* Core HR Operations Dropdown */}
          <div className="hr-menu-item">
            <a className={`hr-menu-link ${isGroupActive(['attendance-leave', 'payroll-management', 'document-vault']) ? 'active' : ''}`}>
              <i className="fa-solid fa-gears"></i>
              Operations
              <i className="fa-solid fa-chevron-down"></i>
            </a>
            <div className="hr-dropdown-panel" style={{ minWidth: '320px' }}>
              <a
                className={`hr-dropdown-item ${isTabActive('attendance-leave') ? 'active' : ''}`}
                onClick={() => handleNavClick('attendance-leave')}
              >
                <i className="fa-solid fa-calendar-check"></i>
                <div>
                  Attendance & Shift
                  <span className="hr-dropdown-item-desc">Monitor shift logs, leave approvals and roster calendars</span>
                </div>
              </a>
              <a
                className={`hr-dropdown-item ${isTabActive('payroll-management') ? 'active' : ''}`}
                onClick={() => handleNavClick('payroll-management')}
              >
                <i className="fa-solid fa-wallet"></i>
                <div>
                  Payroll Hub
                  <span className="hr-dropdown-item-desc">Handle payouts, tax deductions, and salary sheets</span>
                </div>
              </a>
              <a
                className={`hr-dropdown-item ${isTabActive('document-vault') ? 'active' : ''}`}
                onClick={() => handleNavClick('document-vault')}
              >
                <i className="fa-solid fa-vault"></i>
                <div>
                  Document Vault
                  <span className="hr-dropdown-item-desc">Access encrypted document records and certificates</span>
                </div>
              </a>
            </div>
          </div>

          {/* Recruitment Dropdown */}
          <div className="hr-menu-item">
            <a className={`hr-menu-link ${isGroupActive(['recruitment-ats']) ? 'active' : ''}`}>
              <i className="fa-solid fa-user-plus"></i>
              Recruitment
              <i className="fa-solid fa-chevron-down"></i>
            </a>
            <div className="hr-dropdown-panel">
              <a
                className={`hr-dropdown-item ${isTabActive('recruitment-ats') ? 'active' : ''}`}
                onClick={() => handleNavClick('recruitment-ats')}
              >
                <i className="fa-solid fa-magnifying-glass-chart"></i>
                <div>
                  Recruitment ATS
                  <span className="hr-dropdown-item-desc">Track role requisitions and applicant screenings</span>
                </div>
              </a>
            </div>
          </div>

          {/* Governance & Support Dropdown */}
          <div className="hr-menu-item">
            <a className={`hr-menu-link ${isGroupActive(['compliance-management', 'hr-tickets', 'reports-analytics']) ? 'active' : ''}`}>
              <i className="fa-solid fa-shield-halved"></i>
              Compliance & Support
              <i className="fa-solid fa-chevron-down"></i>
            </a>
            <div className="hr-dropdown-panel" style={{ minWidth: '320px' }}>
              <a
                className={`hr-dropdown-item ${isTabActive('compliance-management') ? 'active' : ''}`}
                onClick={() => handleNavClick('compliance-management')}
              >
                <i className="fa-solid fa-circle-check"></i>
                <div>
                  Compliance Hub
                  <span className="hr-dropdown-item-desc">Monitor statutory PF/ESI metrics and audit items</span>
                </div>
              </a>
              <a
                className={`hr-dropdown-item ${isTabActive('hr-tickets') ? 'active' : ''}`}
                onClick={() => handleNavClick('hr-tickets')}
              >
                <i className="fa-solid fa-headset"></i>
                <div>
                  Support Tickets
                  <span className="hr-dropdown-item-desc">Resolve employee issues and manage SLA tickets</span>
                </div>
              </a>
              <a
                className={`hr-dropdown-item ${isTabActive('reports-analytics') ? 'active' : ''}`}
                onClick={() => handleNavClick('reports-analytics')}
              >
                <i className="fa-solid fa-chart-pie"></i>
                <div>
                  Reports & Audits
                  <span className="hr-dropdown-item-desc">View department cost indices and compliance summaries</span>
                </div>
              </a>
            </div>
          </div>
        </nav>
      </div>

      <div className="hr-header-right">
        {/* Global Search */}
        <div className="hr-search">
          <i className="fa-solid fa-search"></i>
          <input
            type="text"
            placeholder="Search staff, cards or codes..."
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
        </div>

        {/* Notifications */}
        <button
          className="nav-icon-btn"
          onClick={() => handleNavClick('notification-system')}
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
            <mask id="moon-mask-hr">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <circle className="moon-mask-circle" cx="24" cy="0" r="9" fill="black" />
            </mask>
            <circle className="sun-center" cx="12" cy="12" r="5" fill="currentColor" mask="url(#moon-mask-hr)" />
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
            <img src={getAvatarUrl(user)} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: 'full' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>
              {user.name.split(' ')[0]}
            </span>
            <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))' }}></i>
          </div>
          <div className={`dropdown-menu ${profileDropdownActive ? 'active' : ''}`} style={{ right: 0, top: '48px' }}>
            <a className="dropdown-item" onClick={() => handleNavClick('hr-profile')}>
              <i className="fa-solid fa-user"></i> My Profile
            </a>
            <a className="dropdown-item" onClick={() => handleNavClick('settings-profile')}>
              <i className="fa-solid fa-gear"></i> System Settings
            </a>
            <a className="dropdown-item" onClick={() => handleNavClick('notification-system')}>
              <i className="fa-solid fa-bell"></i> Alert Center
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

export default HRTopNavbar;
