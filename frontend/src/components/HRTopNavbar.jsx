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
  const [activeDropdown, setActiveDropdown] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-dropdown-btn') && !e.target.closest('.dropdown-menu')) {
        setProfileDropdownActive(false);
      }
      if (!e.target.closest('.hr-menu-item')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!user) return null;

  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;

  const handleNavClick = (mod) => {
    setActiveDropdown(null);
    setProfileDropdownActive(false);
    if (mod === 'org-structure') {
      navigate('/organization');
    } else {
      navigate(`/hr/${mod}`);
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

  return (
    <header className="hr-header">
      <div className="hr-header-left">
        {/* Brand Logo */}
        <div className="hr-logo" onClick={() => navigate('/hr/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}>
          <img src={hrorbitLogo} alt="HR O Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'hsl(var(--primary))', letterSpacing: '0.5px' }}>HR O</span>
        </div>

        {/* Navigation Back / Forward */}
        <div style={{ display: 'flex', gap: '6px', marginRight: '6px', flexShrink: 0 }}>
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
        <nav className="hr-nav-menu">
          
          {/* 1. Overview */}
          <div className="hr-menu-item">
            <a
              className={`hr-menu-link ${isTabActive('dashboard') ? 'active' : ''}`}
              onClick={() => handleNavClick('dashboard')}
            >
              <i className="fa-solid fa-chart-line"></i>
              Overview
            </a>
          </div>

          {/* 2. Workforce Dropdown */}
          <div className="hr-menu-item" onMouseEnter={() => setActiveDropdown('workforce')} onMouseLeave={() => setActiveDropdown(null)}>
            <a 
              className={`hr-menu-link ${isGroupActive(['employee-management', 'org-structure']) ? 'active' : ''}`}
              onClick={() => toggleDropdown('workforce')}
            >
              <i className="fa-solid fa-user-gear"></i>
              Workforce
              <i className="fa-solid fa-chevron-down" style={{ transform: activeDropdown === 'workforce' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}></i>
            </a>
            <div className={`hr-dropdown-panel ${activeDropdown === 'workforce' ? 'open' : ''}`} style={{ minWidth: '300px' }}>
              <a
                className={`hr-dropdown-item ${isTabActive('employee-management') ? 'active' : ''}`}
                onClick={() => handleNavClick('employee-management')}
              >
                <i className="fa-solid fa-user-group"></i>
                <div>
                  <div className="hr-dropdown-title">Employee Directory</div>
                  <span className="hr-dropdown-item-desc">Manage employee profiles and document sets</span>
                </div>
              </a>
              <a
                className={`hr-dropdown-item ${isTabActive('org-structure') ? 'active' : ''}`}
                onClick={() => handleNavClick('org-structure')}
              >
                <i className="fa-solid fa-sitemap"></i>
                <div>
                  <div className="hr-dropdown-title">Org Structure</div>
                  <span className="hr-dropdown-item-desc">Visualize reporting hierarchy and organizational design</span>
                </div>
              </a>
            </div>
          </div>

          {/* 3. Operations Dropdown */}
          <div className="hr-menu-item" onMouseEnter={() => setActiveDropdown('operations')} onMouseLeave={() => setActiveDropdown(null)}>
            <a 
              className={`hr-menu-link ${isGroupActive(['attendance-leave', 'payroll-management', 'document-vault']) ? 'active' : ''}`}
              onClick={() => toggleDropdown('operations')}
            >
              <i className="fa-solid fa-gears"></i>
              Operations
              <i className="fa-solid fa-chevron-down" style={{ transform: activeDropdown === 'operations' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}></i>
            </a>
            <div className={`hr-dropdown-panel ${activeDropdown === 'operations' ? 'open' : ''}`} style={{ minWidth: '320px' }}>
              <a
                className={`hr-dropdown-item ${isTabActive('attendance-leave') ? 'active' : ''}`}
                onClick={() => handleNavClick('attendance-leave')}
              >
                <i className="fa-solid fa-calendar-check"></i>
                <div>
                  <div className="hr-dropdown-title">Attendance & Shift</div>
                  <span className="hr-dropdown-item-desc">Monitor shift logs, leave approvals and rosters</span>
                </div>
              </a>
              <a
                className={`hr-dropdown-item ${isTabActive('payroll-management') ? 'active' : ''}`}
                onClick={() => handleNavClick('payroll-management')}
              >
                <i className="fa-solid fa-wallet"></i>
                <div>
                  <div className="hr-dropdown-title">Payroll Hub</div>
                  <span className="hr-dropdown-item-desc">Handle payouts, tax deductions, and salary sheets</span>
                </div>
              </a>
              <a
                className={`hr-dropdown-item ${isTabActive('document-vault') ? 'active' : ''}`}
                onClick={() => handleNavClick('document-vault')}
              >
                <i className="fa-solid fa-vault"></i>
                <div>
                  <div className="hr-dropdown-title">Document Vault</div>
                  <span className="hr-dropdown-item-desc">Access encrypted document records and certificates</span>
                </div>
              </a>
            </div>
          </div>

          {/* 4. Talent & Growth Dropdown */}
          <div className="hr-menu-item" onMouseEnter={() => setActiveDropdown('talent')} onMouseLeave={() => setActiveDropdown(null)}>
            <a 
              className={`hr-menu-link ${isGroupActive(['recruitment-ats', 'performance-appraisal', 'training-competency', 'employee-experience']) ? 'active' : ''}`}
              onClick={() => toggleDropdown('talent')}
            >
              <i className="fa-solid fa-award"></i>
              Talent & Growth
              <i className="fa-solid fa-chevron-down" style={{ transform: activeDropdown === 'talent' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}></i>
            </a>
            <div className={`hr-dropdown-panel ${activeDropdown === 'talent' ? 'open' : ''}`} style={{ minWidth: '320px' }}>
              <a
                className={`hr-dropdown-item ${isTabActive('recruitment-ats') ? 'active' : ''}`}
                onClick={() => handleNavClick('recruitment-ats')}
              >
                <i className="fa-solid fa-magnifying-glass-chart"></i>
                <div>
                  <div className="hr-dropdown-title">Recruitment ATS</div>
                  <span className="hr-dropdown-item-desc">Role requisitions, applicant tracking and interviews</span>
                </div>
              </a>
              <a
                className={`hr-dropdown-item ${isTabActive('performance-appraisal') ? 'active' : ''}`}
                onClick={() => handleNavClick('performance-appraisal')}
              >
                <i className="fa-solid fa-chart-line"></i>
                <div>
                  <div className="hr-dropdown-title">Performance & Appraisal</div>
                  <span className="hr-dropdown-item-desc">Appraisals, KRAs, increments & PIP management</span>
                </div>
              </a>
              <a
                className={`hr-dropdown-item ${isTabActive('training-competency') ? 'active' : ''}`}
                onClick={() => handleNavClick('training-competency')}
              >
                <i className="fa-solid fa-graduation-cap"></i>
                <div>
                  <div className="hr-dropdown-title">Training & Competency</div>
                  <span className="hr-dropdown-item-desc">Skills matrix, course enrollments and certifications</span>
                </div>
              </a>
              <a
                className={`hr-dropdown-item ${isTabActive('employee-experience') ? 'active' : ''}`}
                onClick={() => handleNavClick('employee-experience')}
              >
                <i className="fa-solid fa-heart-pulse"></i>
                <div>
                  <div className="hr-dropdown-title">Employee Experience</div>
                  <span className="hr-dropdown-item-desc">Survey analytics, recognitions, and welfare programs</span>
                </div>
              </a>
            </div>
          </div>

          {/* 5. Finance & Separation Dropdown */}
          <div className="hr-menu-item" onMouseEnter={() => setActiveDropdown('finance')} onMouseLeave={() => setActiveDropdown(null)}>
            <a 
              className={`hr-menu-link ${isGroupActive(['hr-budgeting', 'statutory-compliance', 'exit-management']) ? 'active' : ''}`}
              onClick={() => toggleDropdown('finance')}
            >
              <i className="fa-solid fa-calculator"></i>
              Finance & Exit
              <i className="fa-solid fa-chevron-down" style={{ transform: activeDropdown === 'finance' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}></i>
            </a>
            <div className={`hr-dropdown-panel ${activeDropdown === 'finance' ? 'open' : ''}`} style={{ minWidth: '320px' }}>
              <a
                className={`hr-dropdown-item ${isTabActive('hr-budgeting') ? 'active' : ''}`}
                onClick={() => handleNavClick('hr-budgeting')}
              >
                <i className="fa-solid fa-coins"></i>
                <div>
                  <div className="hr-dropdown-title">HR Budgeting & Cost Analytics</div>
                  <span className="hr-dropdown-item-desc">Workforce cost planning, allocations and forecasts</span>
                </div>
              </a>
              <a
                className={`hr-dropdown-item ${isTabActive('statutory-compliance') ? 'active' : ''}`}
                onClick={() => handleNavClick('statutory-compliance')}
              >
                <i className="fa-solid fa-scale-balanced"></i>
                <div>
                  <div className="hr-dropdown-title">Statutory Compliance</div>
                  <span className="hr-dropdown-item-desc">PF, ESI, PT, LWF, challans, notices and returns</span>
                </div>
              </a>
              <a
                className={`hr-dropdown-item ${isTabActive('exit-management') ? 'active' : ''}`}
                onClick={() => handleNavClick('exit-management')}
              >
                <i className="fa-solid fa-door-open"></i>
                <div>
                  <div className="hr-dropdown-title">Exit Workflow & F&F</div>
                  <span className="hr-dropdown-item-desc">Resignations, clearances, F&F settlements & letters</span>
                </div>
              </a>
            </div>
          </div>

          {/* 6. HR Governance & Audit Dropdown */}
          <div className="hr-menu-item" onMouseEnter={() => setActiveDropdown('governance')} onMouseLeave={() => setActiveDropdown(null)}>
            <a 
              className={`hr-menu-link ${isGroupActive(['hr-audit', 'compliance-calendar', 'approval-matrix', 'policy-repository', 'observation-tracker', 'action-closure', 'internal-audit']) ? 'active' : ''}`}
              onClick={() => toggleDropdown('governance')}
            >
              <i className="fa-solid fa-shield-halved"></i>
              Governance
              <i className="fa-solid fa-chevron-down" style={{ transform: activeDropdown === 'governance' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}></i>
            </a>
            <div className={`hr-dropdown-panel ${activeDropdown === 'governance' ? 'open' : ''}`} style={{ minWidth: '320px' }}>
              <a
                className={`hr-dropdown-item ${isTabActive('policy-repository') ? 'active' : ''}`}
                onClick={() => handleNavClick('policy-repository')}
              >
                <i className="fa-solid fa-book-bookmark"></i>
                <div>
                  <div className="hr-dropdown-title">Policy Repository</div>
                  <span className="hr-dropdown-item-desc">Publish policies and track acknowledgements</span>
                </div>
              </a>
              <a
                className={`hr-dropdown-item ${isTabActive('hr-audit') ? 'active' : ''}`}
                onClick={() => handleNavClick('hr-audit')}
              >
                <i className="fa-solid fa-clipboard-check"></i>
                <div>
                  <div className="hr-dropdown-title">Statutory & HR Audit</div>
                  <span className="hr-dropdown-item-desc">Statutory audits and compliance registry</span>
                </div>
              </a>
              <a
                className={`hr-dropdown-item ${isTabActive('compliance-calendar') ? 'active' : ''}`}
                onClick={() => handleNavClick('compliance-calendar')}
              >
                <i className="fa-solid fa-calendar-days"></i>
                <div>
                  <div className="hr-dropdown-title">Compliance Calendar</div>
                  <span className="hr-dropdown-item-desc">PF, ESI, TDS filing schedules</span>
                </div>
              </a>
              <a
                className={`hr-dropdown-item ${isTabActive('approval-matrix') ? 'active' : ''}`}
                onClick={() => handleNavClick('approval-matrix')}
              >
                <i className="fa-solid fa-sitemap"></i>
                <div>
                  <div className="hr-dropdown-title">Approval Matrix</div>
                  <span className="hr-dropdown-item-desc">Multi-level authorization workflows</span>
                </div>
              </a>
              <a
                className={`hr-dropdown-item ${isTabActive('observation-tracker') ? 'active' : ''}`}
                onClick={() => handleNavClick('observation-tracker')}
              >
                <i className="fa-solid fa-magnifying-glass"></i>
                <div>
                  <div className="hr-dropdown-title">HR Observation Tracker</div>
                  <span className="hr-dropdown-item-desc">Track and resolve audit observations</span>
                </div>
              </a>
              <a
                className={`hr-dropdown-item ${isTabActive('action-closure') ? 'active' : ''}`}
                onClick={() => handleNavClick('action-closure')}
              >
                <i className="fa-solid fa-square-check"></i>
                <div>
                  <div className="hr-dropdown-title">Action Closure Tracker</div>
                  <span className="hr-dropdown-item-desc">CAPA closure checklist and status</span>
                </div>
              </a>
              <a
                className={`hr-dropdown-item ${isTabActive('internal-audit') ? 'active' : ''}`}
                onClick={() => handleNavClick('internal-audit')}
              >
                <i className="fa-solid fa-file-invoice"></i>
                <div>
                  <div className="hr-dropdown-title">Internal Audit Reports</div>
                  <span className="hr-dropdown-item-desc">Quarterly audit logs and analytics</span>
                </div>
              </a>
            </div>
          </div>

          {/* 7. Support & Analytics Dropdown */}
          <div className="hr-menu-item" onMouseEnter={() => setActiveDropdown('support')} onMouseLeave={() => setActiveDropdown(null)}>
            <a 
              className={`hr-menu-link ${isGroupActive(['hr-tickets', 'reports-analytics', 'notification-system']) ? 'active' : ''}`}
              onClick={() => toggleDropdown('support')}
            >
              <i className="fa-solid fa-circle-info"></i>
              Support & Reports
              <i className="fa-solid fa-chevron-down" style={{ transform: activeDropdown === 'support' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}></i>
            </a>
            <div className={`hr-dropdown-panel ${activeDropdown === 'support' ? 'open' : ''}`} style={{ minWidth: '280px' }}>
              <a
                className={`hr-dropdown-item ${isTabActive('hr-tickets') ? 'active' : ''}`}
                onClick={() => handleNavClick('hr-tickets')}
              >
                <i className="fa-solid fa-headset"></i>
                <div>
                  <div className="hr-dropdown-title">Support Tickets</div>
                  <span className="hr-dropdown-item-desc">Resolve employee issues and manage SLA tickets</span>
                </div>
              </a>
              <a
                className={`hr-dropdown-item ${isTabActive('reports-analytics') ? 'active' : ''}`}
                onClick={() => handleNavClick('reports-analytics')}
              >
                <i className="fa-solid fa-chart-pie"></i>
                <div>
                  <div className="hr-dropdown-title">Reports & Audits</div>
                  <span className="hr-dropdown-item-desc">View department cost indices and compliance summaries</span>
                </div>
              </a>
              <a
                className={`hr-dropdown-item ${isTabActive('notification-system') ? 'active' : ''}`}
                onClick={() => handleNavClick('notification-system')}
              >
                <i className="fa-solid fa-bell"></i>
                <div>
                  <div className="hr-dropdown-title">Alert Center</div>
                  <span className="hr-dropdown-item-desc">System notifications, broadcast alerts & logs</span>
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
