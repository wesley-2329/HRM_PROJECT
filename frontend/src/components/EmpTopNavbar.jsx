import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { getAvatarUrl, encodeId } from '../App';
import hrorbitLogo from '../assets/hrorbit_logo.png';

const EmpTopNavbar = ({ currentModule, darkMode, setDarkMode, navbarTheme = 'indigo', onSearch }) => {
  const { user, logout } = useContext(AuthContext);
  const { notifications } = useContext(DataContext);
  const [profileDropdownActive, setProfileDropdownActive] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-dropdown-btn') && !e.target.closest('.dropdown-menu')) {
        setProfileDropdownActive(false);
      }
      if (!e.target.closest('.emp-menu-item')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!user) return null;

  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;
  const hashId = encodeId(user.id);

  const handleNavClick = (mod) => {
    setActiveDropdown(null);
    setProfileDropdownActive(false);
    if (mod === 'org-structure') {
      navigate('/organization');
    } else {
      navigate(`/employee/${hashId}/${mod}`);
    }
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

  const toggleDropdown = (name) => {
    setActiveDropdown(prev => prev === name ? null : name);
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
        {/* Brand Logo */}
        <div className="emp-logo" onClick={() => navigate(`/employee/${hashId}/emp-dashboard`)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}>
          <img src={hrorbitLogo} alt="HR O Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'hsl(var(--primary))', letterSpacing: '0.5px' }}>HR O</span>
        </div>

        {/* Navigation Controls */}
        <div style={{ display: 'flex', gap: '6px', marginRight: '8px', marginLeft: '4px', flexShrink: 0 }}>
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

        {/* Navigation Menu */}
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

          {/* Directory & Governance Dropdown */}
          <div className="emp-menu-item" onMouseEnter={() => setActiveDropdown('governance')} onMouseLeave={() => setActiveDropdown(null)}>
            <a 
              className={`emp-menu-link ${isGroupActive(['org-structure', 'emp-policies']) ? 'active' : ''}`}
              onClick={() => toggleDropdown('governance')}
            >
              <i className="fa-solid fa-shield-halved"></i>
              Governance
              <i className="fa-solid fa-chevron-down" style={{ transform: activeDropdown === 'governance' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}></i>
            </a>
            <div className={`emp-dropdown-panel ${activeDropdown === 'governance' ? 'open' : ''}`} style={{ minWidth: '300px' }}>
              <a
                className={`emp-dropdown-item ${isTabActive('org-structure') ? 'active' : ''}`}
                onClick={() => handleNavClick('org-structure')}
              >
                <i className="fa-solid fa-sitemap"></i>
                <div>
                  <div className="emp-dropdown-title">Org Structure</div>
                  <span className="emp-dropdown-item-desc">Browse reporting hierarchy and direct reports</span>
                </div>
              </a>
              <a
                className={`emp-dropdown-item ${isTabActive('emp-policies') ? 'active' : ''}`}
                onClick={() => handleNavClick('emp-policies')}
              >
                <i className="fa-solid fa-building-columns"></i>
                <div>
                  <div className="emp-dropdown-title">Policy Repository</div>
                  <span className="emp-dropdown-item-desc">Read and accept company policies to ensure compliance</span>
                </div>
              </a>
            </div>
          </div>

          {/* My Operations Dropdown */}
          <div className="emp-menu-item" onMouseEnter={() => setActiveDropdown('operations')} onMouseLeave={() => setActiveDropdown(null)}>
            <a 
              className={`emp-menu-link ${isGroupActive(['emp-attendance', 'emp-payroll', 'emp-documents']) ? 'active' : ''}`}
              onClick={() => toggleDropdown('operations')}
            >
              <i className="fa-solid fa-briefcase"></i>
              Operations
              <i className="fa-solid fa-chevron-down" style={{ transform: activeDropdown === 'operations' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}></i>
            </a>
            <div className={`emp-dropdown-panel ${activeDropdown === 'operations' ? 'open' : ''}`} style={{ minWidth: '320px' }}>
              <a
                className={`emp-dropdown-item ${isTabActive('emp-attendance') ? 'active' : ''}`}
                onClick={() => handleNavClick('emp-attendance')}
              >
                <i className="fa-solid fa-calendar-days"></i>
                <div>
                  <div className="emp-dropdown-title">Attendance & Shifts</div>
                  <span className="emp-dropdown-item-desc">Log your work shifts and check leave schedules</span>
                </div>
              </a>
              <a
                className={`emp-dropdown-item ${isTabActive('emp-payroll') ? 'active' : ''}`}
                onClick={() => handleNavClick('emp-payroll')}
              >
                <i className="fa-solid fa-indian-rupee-sign"></i>
                <div>
                  <div className="emp-dropdown-title">Payroll & Salary</div>
                  <span className="emp-dropdown-item-desc">Download payslips and verify benefits payouts</span>
                </div>
              </a>
              <a
                className={`emp-dropdown-item ${isTabActive('emp-documents') ? 'active' : ''}`}
                onClick={() => handleNavClick('emp-documents')}
              >
                <i className="fa-solid fa-vault"></i>
                <div>
                  <div className="emp-dropdown-title">My Document Vault</div>
                  <span className="emp-dropdown-item-desc">Securely access credentials, IDs and agreements</span>
                </div>
              </a>
            </div>
          </div>

          {/* Growth & Performance Dropdown */}
          <div className="emp-menu-item" onMouseEnter={() => setActiveDropdown('growth')} onMouseLeave={() => setActiveDropdown(null)}>
            <a 
              className={`emp-menu-link ${isGroupActive(['emp-pip', 'emp-learning', 'recruitment', 'emp-engagement']) ? 'active' : ''}`}
              onClick={() => toggleDropdown('growth')}
            >
              <i className="fa-solid fa-graduation-cap"></i>
              Growth & Talent
              <i className="fa-solid fa-chevron-down" style={{ transform: activeDropdown === 'growth' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}></i>
            </a>
            <div className={`emp-dropdown-panel ${activeDropdown === 'growth' ? 'open' : ''}`} style={{ minWidth: '320px' }}>
              <a
                className={`emp-dropdown-item ${isTabActive('emp-pip') ? 'active' : ''}`}
                onClick={() => handleNavClick('emp-pip')}
              >
                <i className="fa-solid fa-star-half-stroke"></i>
                <div>
                  <div className="emp-dropdown-title">Performance & PIP</div>
                  <span className="emp-dropdown-item-desc">Check appraisal reviews and feedback metrics</span>
                </div>
              </a>
              <a
                className={`emp-dropdown-item ${isTabActive('emp-learning') ? 'active' : ''}`}
                onClick={() => handleNavClick('emp-learning')}
              >
                <i className="fa-solid fa-book-open"></i>
                <div>
                  <div className="emp-dropdown-title">Learning & Dev</div>
                  <span className="emp-dropdown-item-desc">Access training courses and build career skills</span>
                </div>
              </a>
              <a
                className={`emp-dropdown-item ${isTabActive('recruitment') ? 'active' : ''}`}
                onClick={() => handleNavClick('recruitment')}
              >
                <i className="fa-solid fa-user-plus"></i>
                <div>
                  <div className="emp-dropdown-title">Career Portal</div>
                  <span className="emp-dropdown-item-desc">Internal job postings and referral tracking</span>
                </div>
              </a>
              <a
                className={`emp-dropdown-item ${isTabActive('emp-engagement') ? 'active' : ''}`}
                onClick={() => handleNavClick('emp-engagement')}
              >
                <i className="fa-solid fa-heart-pulse"></i>
                <div>
                  <div className="emp-dropdown-title">Engagement & Welfare</div>
                  <span className="emp-dropdown-item-desc">Recognitions, employee benefits & surveys</span>
                </div>
              </a>
            </div>
          </div>

          {/* Finance & Exit Dropdown */}
          <div className="emp-menu-item" onMouseEnter={() => setActiveDropdown('finance')} onMouseLeave={() => setActiveDropdown(null)}>
            <a 
              className={`emp-menu-link ${isGroupActive(['hr-budgeting', 'statutory-compliance', 'exit-management']) ? 'active' : ''}`}
              onClick={() => toggleDropdown('finance')}
            >
              <i className="fa-solid fa-calculator"></i>
              Finance & Exit
              <i className="fa-solid fa-chevron-down" style={{ transform: activeDropdown === 'finance' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}></i>
            </a>
            <div className={`emp-dropdown-panel ${activeDropdown === 'finance' ? 'open' : ''}`} style={{ minWidth: '320px' }}>
              <a
                className={`emp-dropdown-item ${isTabActive('hr-budgeting') ? 'active' : ''}`}
                onClick={() => handleNavClick('hr-budgeting')}
              >
                <i className="fa-solid fa-coins"></i>
                <div>
                  <div className="emp-dropdown-title">HR Budgeting</div>
                  <span className="emp-dropdown-item-desc">Department headcount costs & budget insights</span>
                </div>
              </a>
              <a
                className={`emp-dropdown-item ${isTabActive('statutory-compliance') ? 'active' : ''}`}
                onClick={() => handleNavClick('statutory-compliance')}
              >
                <i className="fa-solid fa-scale-balanced"></i>
                <div>
                  <div className="emp-dropdown-title">Statutory Compliance</div>
                  <span className="emp-dropdown-item-desc">PF, ESI, PT, and compliance details</span>
                </div>
              </a>
              <a
                className={`emp-dropdown-item ${isTabActive('exit-management') ? 'active' : ''}`}
                onClick={() => handleNavClick('exit-management')}
              >
                <i className="fa-solid fa-door-open"></i>
                <div>
                  <div className="emp-dropdown-title">Exit & F&F Portal</div>
                  <span className="emp-dropdown-item-desc">Resignations, clearances, & No Due Certificate</span>
                </div>
              </a>
            </div>
          </div>

          {/* Workplace & Hub Dropdown */}
          <div className="emp-menu-item" onMouseEnter={() => setActiveDropdown('workplace')} onMouseLeave={() => setActiveDropdown(null)}>
            <a 
              className={`emp-menu-link ${isGroupActive(['emp-tasks', 'emp-meetings', 'emp-reports', 'emp-helpdesk']) ? 'active' : ''}`}
              onClick={() => toggleDropdown('workplace')}
            >
              <i className="fa-solid fa-desktop"></i>
              Workplace
              <i className="fa-solid fa-chevron-down" style={{ transform: activeDropdown === 'workplace' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}></i>
            </a>
            <div className={`emp-dropdown-panel ${activeDropdown === 'workplace' ? 'open' : ''}`} style={{ minWidth: '320px' }}>
              <a
                className={`emp-dropdown-item ${isTabActive('emp-tasks') ? 'active' : ''}`}
                onClick={() => handleNavClick('emp-tasks')}
              >
                <i className="fa-solid fa-list-check"></i>
                <div>
                  <div className="emp-dropdown-title">Tasks</div>
                  <span className="emp-dropdown-item-desc">Organize, schedule, and mark daily checklist cards</span>
                </div>
              </a>
              <a
                className={`emp-dropdown-item ${isTabActive('emp-meetings') ? 'active' : ''}`}
                onClick={() => handleNavClick('emp-meetings')}
              >
                <i className="fa-solid fa-video"></i>
                <div>
                  <div className="emp-dropdown-title">Meetings</div>
                  <span className="emp-dropdown-item-desc">View calendar appointments and join online rooms</span>
                </div>
              </a>
              <a
                className={`emp-dropdown-item ${isTabActive('emp-reports') ? 'active' : ''}`}
                onClick={() => handleNavClick('emp-reports')}
              >
                <i className="fa-solid fa-clipboard-list"></i>
                <div>
                  <div className="emp-dropdown-title">Daily Reports</div>
                  <span className="emp-dropdown-item-desc">Submit timesheets and verify log activity reviews</span>
                </div>
              </a>
              <a
                className={`emp-dropdown-item ${isTabActive('emp-helpdesk') ? 'active' : ''}`}
                onClick={() => handleNavClick('emp-helpdesk')}
              >
                <i className="fa-solid fa-headset"></i>
                <div>
                  <div className="emp-dropdown-title">Helpdesk Support</div>
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
          title="Notifications"
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

        {/* User Profile Dropdown */}
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
