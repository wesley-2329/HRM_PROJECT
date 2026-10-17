import React, { useContext, useState, useEffect, useRef } from 'react';
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
  const dropdownTimeoutRef = useRef(null);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const optionsScrollRef = useRef(null);
  const searchContainerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (optionsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = optionsScrollRef.current;
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = optionsScrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      const t1 = setTimeout(checkScroll, 100);
      const t2 = setTimeout(checkScroll, 500);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, []);

  const scrollOptions = (direction) => {
    if (optionsScrollRef.current) {
      optionsScrollRef.current.scrollBy({ left: direction * 240, behavior: 'smooth' });
      setTimeout(checkScroll, 350);
    }
  };

  const searchIndex = [
    { title: 'Overview Dashboard', desc: 'HR executive KPIs, live analytics & attendance', path: '/hr/dashboard', icon: 'fa-chart-line', category: 'Overview', keywords: 'dashboard home kpis overview hr executive analytics stats punch clock' },
    { title: 'Employee Master', desc: 'Manage employees, documents & status', path: '/hr/employee-management', icon: 'fa-users', category: 'Workforce', keywords: 'employees staff workforce directory profiles add employee master user list' },
    { title: 'Org Structure', desc: 'Organization hierarchy & reporting lines', path: '/organization', icon: 'fa-sitemap', category: 'Workforce', keywords: 'org structure hierarchy chart departments reporting lines leadership team directory' },
    { title: 'Attendance Log', desc: 'Real-time punches, biometric logs & regularization', path: '/hr/attendance', icon: 'fa-clipboard-user', category: 'Operations', keywords: 'attendance punch clock clock-in clock-out shift timer logs regularization biometric daily present absent hours' },
    { title: 'Leave Management', desc: 'Leave requests, quota balances & approvals', path: '/hr/leave-management', icon: 'fa-calendar-check', category: 'Operations', keywords: 'leave leaves time off holiday vacation sick casual requests quota balances approvals' },
    { title: 'Timesheet Records', desc: 'Daily work logs, project hours & activity', path: '/hr/timesheet-records', icon: 'fa-clock', category: 'Operations', keywords: 'timesheet timesheets work logs hours project activity shifts daily records' },
    { title: 'Shift Roster', desc: 'Shift scheduling, rotation plans & assignments', path: '/hr/shift-roster', icon: 'fa-calendar-week', category: 'Operations', keywords: 'shifts roster shift scheduling rotation timing assignment schedule' },
    { title: 'Payroll Processing', desc: 'Salary computation, pay slips & tax deductions', path: '/hr/payroll-processing', icon: 'fa-file-invoice-dollar', category: 'Operations', keywords: 'payroll salary payslips wages allowances deductions net pay earnings ctc compensation form 16 pay slips payroll processing' },
    { title: 'Recruitment & ATS', desc: 'Job postings, applicant pipeline & stages', path: '/hr/recruitment-ats', icon: 'fa-briefcase', category: 'Talent & Growth', keywords: 'recruitment ats jobs openings applicants candidates hiring pipeline interviews vacancy manpower requisition expense cost' },
    { title: 'Onboarding Workflow', desc: 'New hire checklists, asset handover & IT tasks', path: '/hr/onboarding-workflow', icon: 'fa-user-plus', category: 'Talent & Growth', keywords: 'onboarding new hire checklists asset handover induction joining tasks welcome' },
    { title: 'Performance & Goals', desc: 'OKRs, KPIs, appraisals, 360 reviews & PIP', path: '/hr/performance-goals', icon: 'fa-bullseye', category: 'Talent & Growth', keywords: 'performance goals okrs kpis appraisals reviews pip ratings evaluation 360' },
    { title: 'Training Programs', desc: 'L&D courses, certifications & attendance', path: '/hr/training-programs', icon: 'fa-graduation-cap', category: 'Talent & Growth', keywords: 'training learning development l&d courses certifications skills modules' },
    { title: 'Employee Engagement', desc: 'Surveys, polls, rewards & town hall discussions', path: '/hr/employee-engagement', icon: 'fa-heart', category: 'Talent & Growth', keywords: 'engagement welfare rewards recognition surveys polls shout-outs town hall' },
    { title: 'HR Budgeting & Cost', desc: 'Workforce cost planning, allocations & analytics', path: '/hr/hr-budgeting', icon: 'fa-coins', category: 'Finance & Exit', keywords: 'budgeting cost workforce finance expense planning allocations compensation' },
    { title: 'Statutory Compliance', desc: 'PF, ESI, PT, LWF, challans & statutory returns', path: '/hr/statutory-compliance', icon: 'fa-scale-balanced', category: 'Finance & Exit', keywords: 'statutory compliance pf esi pt lwf challans returns labor laws regulations' },
    { title: 'Exit Workflow & F&F', desc: 'Resignations, clearances & full-final settlement', path: '/hr/exit-management', icon: 'fa-door-open', category: 'Finance & Exit', keywords: 'exit resignation clearance full final settlement f&f ndc no due certificate handover' },
    { title: 'Policy Repository', desc: 'Company policies & employee acknowledgements', path: '/hr/policy-repository', icon: 'fa-book-bookmark', category: 'Governance', keywords: 'policies policy handbook compliance code of conduct rules governance guidelines' },
    { title: 'Statutory & HR Audit', desc: 'Compliance audit trails & regulatory registry', path: '/hr/hr-audit', icon: 'fa-clipboard-check', category: 'Governance', keywords: 'audit statutory hr compliance audit trails verification regulatory' },
    { title: 'Compliance Calendar', desc: 'Filing schedules & statutory deadlines', path: '/hr/compliance-calendar', icon: 'fa-calendar-days', category: 'Governance', keywords: 'compliance calendar deadlines filings dates schedule statutory' },
    { title: 'Approval Matrix', desc: 'Multi-level workflow authorizations', path: '/hr/approval-matrix', icon: 'fa-sitemap', category: 'Governance', keywords: 'approval matrix workflow authorizations sign off hierarchy delegation' },
    { title: 'Observation Tracker', desc: 'Audit observations, corrective actions & closures', path: '/hr/observation-tracker', icon: 'fa-magnifying-glass', category: 'Governance', keywords: 'observation tracker audit issues corrective actions closures capa' },
    { title: 'HR Analytics', desc: 'Headcount metrics, turnover & compensation', path: '/hr/hr-analytics', icon: 'fa-chart-pie', category: 'Analytics', keywords: 'analytics metrics turnover attrition headcount compensation graphs charts' },
    { title: 'Reports & Audits', desc: 'Department cost indices & compliance summaries', path: '/hr/reports-audits', icon: 'fa-chart-pie', category: 'Analytics', keywords: 'reports audits downloads exports summaries indices department' },
    { title: 'Alert Center', desc: 'System notifications, broadcast alerts & logs', path: '/hr/notification-system', icon: 'fa-bell', category: 'Analytics', keywords: 'alerts notifications broadcast messages logs system updates' },
    { title: 'My Profile', desc: 'Account details, contact info & security', path: '/hr/hr-profile', icon: 'fa-user', category: 'Account', keywords: 'profile account personal contact email password details' },
    { title: 'System Settings', desc: 'Platform configuration & access preferences', path: '/hr/settings-profile', icon: 'fa-gear', category: 'Account', keywords: 'settings system configuration access theme preferences dark mode' }
  ];

  const cleanQuery = searchQuery.trim().toLowerCase();
  const searchTokens = cleanQuery.split(/[\s,+/&|]+/).filter(t => t.length > 0 && t !== 'and' && t !== 'or' && t !== '&');

  const filteredSuggestions = searchTokens.length === 0 ? searchIndex.slice(0, 6) : searchIndex.filter(item => {
    const fullText = `${item.title} ${item.desc} ${item.category} ${item.keywords || ''}`.toLowerCase();
    if (fullText.includes(cleanQuery)) return true;
    return searchTokens.some(tok => fullText.includes(tok));
  }).sort((a, b) => {
    const aFull = `${a.title} ${a.desc} ${a.keywords || ''}`.toLowerCase();
    const bFull = `${b.title} ${b.desc} ${b.keywords || ''}`.toLowerCase();
    const aExact = aFull.includes(cleanQuery) ? 3 : 0;
    const bExact = bFull.includes(cleanQuery) ? 3 : 0;
    const aTokenMatches = searchTokens.filter(t => aFull.includes(t)).length;
    const bTokenMatches = searchTokens.filter(t => bFull.includes(t)).length;
    return (bExact + bTokenMatches) - (aExact + aTokenMatches);
  }).slice(0, 7);

  const handleMouseEnter = (name) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
    dropdownTimeoutRef.current = timeout;
    setDropdownTimeout(timeout);
  };

  const navigate = useNavigate();
  const location = useLocation();

  const handleSelectSuggestion = (path) => {
    navigate(path);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && filteredSuggestions.length > 0) {
      handleSelectSuggestion(filteredSuggestions[0].path);
    } else if (e.key === 'Escape') {
      setShowSearchDropdown(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-dropdown-btn') && !e.target.closest('.dropdown-menu')) {
        setProfileDropdownActive(false);
      }
      if (!e.target.closest('.hr-menu-item')) {
        setActiveDropdown(null);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
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
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setActiveDropdown(prev => prev === name ? null : name);
  };

  return (
    <header className="hr-header">
      {/* 1. Fixed Brand Logo & Navigation Arrows (Never Scrolls) */}
      <div className="hr-brand-section">
        <div className="hr-logo" onClick={() => navigate('/hr/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}>
          <img src={hrorbitLogo} alt="HR O Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'hsl(var(--primary))', letterSpacing: '0.5px' }}>HR O</span>
        </div>

        <div style={{ display: 'flex', gap: '6px', marginRight: '6px', flexShrink: 0 }}>
          <button 
            type="button"
            onClick={() => scrollOptions(-1)} 
            disabled={!canScrollLeft}
            className="btn btn-secondary nav-scroll-btn nav-scroll-left"
            title="Scroll Navigation Left"
            style={{ 
              padding: '6px 10px', 
              height: '32px', 
              minWidth: '32px', 
              borderRadius: '6px', 
              border: '1px solid hsl(var(--border))', 
              background: 'hsl(var(--bg-card))', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: canScrollLeft ? 'pointer' : 'not-allowed',
              opacity: canScrollLeft ? 1 : 0.4
            }}
          >
            <i className="fa-solid fa-chevron-left" style={{ fontSize: '0.8rem' }}></i>
          </button>
          <button 
            type="button"
            onClick={() => scrollOptions(1)} 
            disabled={!canScrollRight}
            className="btn btn-secondary nav-scroll-btn nav-scroll-right"
            title="Scroll Navigation Right"
            style={{ 
              padding: '6px 10px', 
              height: '32px', 
              minWidth: '32px', 
              borderRadius: '6px', 
              border: '1px solid hsl(var(--border))', 
              background: 'hsl(var(--bg-card))', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: canScrollRight ? 'pointer' : 'not-allowed',
              opacity: canScrollRight ? 1 : 0.4
            }}
          >
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.8rem' }}></i>
          </button>
        </div>
      </div>

      {/* 2. Scrollable Navigation Options ONLY */}
      <div className="hr-options-scroll-section" ref={optionsScrollRef} onScroll={checkScroll}>
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
          <div className="hr-menu-item" onMouseEnter={() => handleMouseEnter('workforce')} onMouseLeave={handleMouseLeave}>
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
          <div className="hr-menu-item" onMouseEnter={() => handleMouseEnter('operations')} onMouseLeave={handleMouseLeave}>
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
          <div className="hr-menu-item" onMouseEnter={() => handleMouseEnter('talent')} onMouseLeave={handleMouseLeave}>
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
          <div className="hr-menu-item" onMouseEnter={() => handleMouseEnter('finance')} onMouseLeave={handleMouseLeave}>
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
          <div className="hr-menu-item" onMouseEnter={() => handleMouseEnter('governance')} onMouseLeave={handleMouseLeave}>
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
          <div 
            className="hr-menu-item" 
            id="nav-item-support"
            onMouseEnter={() => handleMouseEnter('support')} 
            onMouseLeave={handleMouseLeave}
          >
            <a 
              className={`hr-menu-link ${isGroupActive(['hr-tickets', 'reports-analytics', 'notification-system']) ? 'active' : ''}`}
              id="nav-support-trigger"
              onClick={() => toggleDropdown('support')}
            >
              <i className="fa-solid fa-circle-info"></i>
              Support & Reports
              <i className="fa-solid fa-chevron-down" style={{ transform: activeDropdown === 'support' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}></i>
            </a>
            <div 
              className={`hr-dropdown-panel ${activeDropdown === 'support' ? 'open' : ''}`} 
              id="nav-support-dropdown-panel"
              style={{ minWidth: '280px' }}
              onMouseEnter={() => handleMouseEnter('support')}
              onMouseLeave={handleMouseLeave}
            >
              <a
                className={`hr-dropdown-item ${isTabActive('hr-tickets') ? 'active' : ''}`}
                id="nav-dropdown-hr-tickets"
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
                id="nav-dropdown-reports-analytics"
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
                id="nav-dropdown-notification-system"
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
        <div className="hr-search" ref={searchContainerRef} style={{ position: 'relative', minWidth: '220px', flexShrink: 0 }}>
          <i className="fa-solid fa-search"></i>
          <input
            type="text"
            placeholder="Search features, tools or docs..."
            value={searchQuery}
            onFocus={() => setShowSearchDropdown(true)}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              setShowSearchDropdown(true);
              if (onSearch) onSearch(val);
            }}
            onKeyDown={handleSearchKeyDown}
          />
          {showSearchDropdown && (filteredSuggestions.length > 0 || searchQuery.trim() !== '') && (
            <div
              className="search-suggestions-dropdown"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '320px',
                background: 'hsl(var(--bg-card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.25)',
                zIndex: 99999,
                overflow: 'hidden',
                padding: '4px'
              }}
            >
              {filteredSuggestions.length > 0 ? (
                <>
                  <div style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {searchQuery.trim() ? `Search Results (${filteredSuggestions.length})` : `Quick Navigation (${filteredSuggestions.length})`}
                  </div>
                  {filteredSuggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSuggestion(item.path)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--accent-hover, var(--border)))'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'hsl(var(--primary) / 0.12)', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className={`fa-solid ${item.icon}`} style={{ fontSize: '0.85rem' }}></i>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--text-primary))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.desc}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'hsl(var(--border))', color: 'hsl(var(--text-secondary))' }}>
                        {item.category}
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="search-no-results" style={{ padding: '20px 16px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
                  <i className="fa-solid fa-circle-question" style={{ fontSize: '1.4rem', marginBottom: '8px', opacity: 0.6, display: 'block', color: 'hsl(var(--text-secondary))' }}></i>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--text-primary))' }}>No results found</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                    No features or tools matching &ldquo;{searchQuery}&rdquo;
                  </div>
                  <div style={{ fontSize: '0.72rem', marginTop: '8px', opacity: 0.85 }}>
                    Try searching for <strong>payroll</strong>, <strong>leave</strong>, or <strong>attendance</strong>
                  </div>
                </div>
              )}
            </div>
          )}
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
