import React, { useContext, useState, useEffect, useRef } from 'react';
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
  const dropdownTimeoutRef = useRef(null);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const optionsScrollRef = useRef(null);
  const searchContainerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

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

  const hashId = user?.id ? encodeId(user.id) : '';

  const searchIndex = [
    { title: 'My Dashboard', desc: 'Punch clock, tasks, announcements & upcoming events', path: `/employee/${hashId}/emp-dashboard`, icon: 'fa-house', category: 'Overview', keywords: 'dashboard home overview punch clock events announcements metrics' },
    { title: 'Payroll & Salary Slips', desc: 'Download PDF salary slips & tax breakdown', path: `/employee/${hashId}/emp-payslips`, icon: 'fa-file-invoice-dollar', category: 'Finance', keywords: 'payroll salary payslips wages allowances deductions net pay earnings ctc compensation form 16 pay slips' },
    { title: 'Attendance Tracker', desc: 'Clock-in timestamps, monthly hours & logs', path: `/employee/${hashId}/emp-attendance`, icon: 'fa-fingerprint', category: 'Operations', keywords: 'attendance punch clock clock-in clock-out shift timer hours calendar punctual biometric logs overview' },
    { title: 'Leave Management', desc: 'Apply for leaves, view balances & manager decisions', path: `/employee/${hashId}/emp-leaves`, icon: 'fa-calendar-day', category: 'Operations', keywords: 'leave leaves apply casual sick earned time off holiday absence balance vacation quota' },
    { title: 'Daily Timesheets', desc: 'Log work hours, project tasks & review shifts', path: `/employee/${hashId}/emp-timesheet`, icon: 'fa-clock-rotate-left', category: 'Operations', keywords: 'timesheet timesheets daily hours project activity work log shifts logs' },
    { title: 'Tasks & Checklists', desc: 'Organize, schedule, and mark daily checklist cards', path: `/employee/${hashId}/emp-tasks`, icon: 'fa-list-check', category: 'Workplace', keywords: 'tasks task checklist todo assigned deadlines priority workplace' },
    { title: 'Meetings & Calendar', desc: 'View calendar appointments and join online rooms', path: `/employee/${hashId}/emp-meetings`, icon: 'fa-video', category: 'Workplace', keywords: 'meetings meeting video call schedule calendar appointments sync room' },
    { title: 'Daily Reports', desc: 'Submit daily accomplishments & blockers', path: `/employee/${hashId}/emp-reports`, icon: 'fa-clipboard-list', category: 'Workplace', keywords: 'daily reports report blockers updates accomplishments timesheet summary work' },
    { title: 'Helpdesk Support', desc: 'Raise IT, HR or facilities support tickets', path: `/employee/${hashId}/emp-helpdesk`, icon: 'fa-headset', category: 'Workplace', keywords: 'helpdesk support ticket tickets query complaint assist it hr facilities technical' },
    { title: 'Policy Repository', desc: 'Acknowledge company code of conduct & guidelines', path: `/employee/${hashId}/emp-policies`, icon: 'fa-building-columns', category: 'Governance', keywords: 'policies policy rules compliance conduct handbook policy repository governance guidelines' },
    { title: 'Org Structure', desc: 'Browse company hierarchy & direct reporting tree', path: '/organization', icon: 'fa-sitemap', category: 'Governance', keywords: 'org structure hierarchy chart departments reporting lines leadership team directory' },
    { title: 'Performance & PIP', desc: 'Check appraisal reviews and feedback metrics', path: `/employee/${hashId}/emp-pip`, icon: 'fa-star-half-stroke', category: 'Growth', keywords: 'performance pip appraisal okr kpi goals reviews feedback ratings evaluations' },
    { title: 'Learning & Dev', desc: 'Access training courses and build career skills', path: `/employee/${hashId}/emp-learning`, icon: 'fa-book-open', category: 'Growth', keywords: 'learning training courses certifications l&d development skills workshops modules' },
    { title: 'Career Portal', desc: 'Internal job postings and referral tracking', path: `/employee/${hashId}/recruitment`, icon: 'fa-user-plus', category: 'Growth', keywords: 'career recruitment jobs internal postings openings referrals vacancy applicant' },
    { title: 'Engagement & Welfare', desc: 'Recognitions, employee benefits & surveys', path: `/employee/${hashId}/emp-engagement`, icon: 'fa-heart-pulse', category: 'Growth', keywords: 'engagement welfare rewards recognition surveys shout-outs benefits town hall polls' },
    { title: 'Claims & Advances', desc: 'Submit reimbursement claims & advance requests', path: `/employee/${hashId}/emp-expenses`, icon: 'fa-receipt', category: 'Finance', keywords: 'expenses claims reimbursement advances receipts money travel bills finance' },
    { title: 'Statutory Compliance', desc: 'PF, ESI, PT, and compliance details', path: `/employee/${hashId}/statutory-compliance`, icon: 'fa-scale-balanced', category: 'Finance', keywords: 'statutory compliance pf esi pt provident fund tax labor laws challans' },
    { title: 'Exit & F&F Portal', desc: 'Resignations, clearances, & No Due Certificate', path: `/employee/${hashId}/exit-management`, icon: 'fa-door-open', category: 'Finance', keywords: 'exit resignation clearance full final settlement ndc no due certificate handover' },
    { title: 'My Profile', desc: 'Personal info, emergency contacts & avatar', path: `/employee/${hashId}/emp-profile`, icon: 'fa-user', category: 'Account', keywords: 'profile personal info avatar emergency contacts address details account' },
    { title: 'Account Settings', desc: 'Theme colors, security preferences & notifications', path: `/employee/${hashId}/emp-settings`, icon: 'fa-gear', category: 'Account', keywords: 'settings password change security preferences theme dark mode navbar' },
    { title: 'Alerts Center', desc: 'Direct messages, status changes & system alerts', path: `/employee/${hashId}/emp-notifications`, icon: 'fa-bell', category: 'Alerts', keywords: 'alerts notifications messages inbox updates reminders system' }
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

  const handleSelectSuggestion = (path) => {
    navigate(path);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (filteredSuggestions.length > 0) {
        handleSelectSuggestion(filteredSuggestions[0].path);
      }
    } else if (e.key === 'Escape') {
      setShowSearchDropdown(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-dropdown-btn') && !e.target.closest('.dropdown-menu')) {
        setProfileDropdownActive(false);
      }
      if (!e.target.closest('.emp-menu-item')) {
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
      {/* 1. Fixed Brand Logo & Navigation Arrows (Never Scrolls) */}
      <div className="emp-brand-section">
        <div className="emp-logo" onClick={() => navigate(`/employee/${hashId}/emp-dashboard`)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}>
          <img src={hrorbitLogo} alt="HR O Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'hsl(var(--primary))', letterSpacing: '0.5px' }}>HR O</span>
        </div>

        <div style={{ display: 'flex', gap: '6px', marginRight: '8px', marginLeft: '4px', flexShrink: 0 }}>
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
      <div className="emp-options-scroll-section" ref={optionsScrollRef} onScroll={checkScroll}>
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
          <div className="emp-menu-item" onMouseEnter={() => handleMouseEnter('governance')} onMouseLeave={handleMouseLeave}>
            <a 
              className={`emp-menu-link ${isGroupActive(['org-structure', 'emp-policies']) ? 'active' : ''}`}
              onClick={() => toggleDropdown('governance')}
            >
              <i className="fa-solid fa-shield-halved"></i>
              Governance
              <i className="fa-solid fa-chevron-down" style={{ transform: activeDropdown === 'governance' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}></i>
            </a>
            <div 
              className={`emp-dropdown-panel ${activeDropdown === 'governance' ? 'open' : ''}`} 
              style={{ minWidth: '300px' }}
              onMouseEnter={() => handleMouseEnter('governance')}
              onMouseLeave={handleMouseLeave}
            >
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
          <div className="emp-menu-item" onMouseEnter={() => handleMouseEnter('operations')} onMouseLeave={handleMouseLeave}>
            <a 
              className={`emp-menu-link ${isGroupActive(['emp-attendance', 'emp-payroll', 'emp-documents']) ? 'active' : ''}`}
              onClick={() => toggleDropdown('operations')}
            >
              <i className="fa-solid fa-briefcase"></i>
              Operations
              <i className="fa-solid fa-chevron-down" style={{ transform: activeDropdown === 'operations' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}></i>
            </a>
            <div 
              className={`emp-dropdown-panel ${activeDropdown === 'operations' ? 'open' : ''}`} 
              style={{ minWidth: '320px' }}
              onMouseEnter={() => handleMouseEnter('operations')}
              onMouseLeave={handleMouseLeave}
            >
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
          <div className="emp-menu-item" onMouseEnter={() => handleMouseEnter('growth')} onMouseLeave={handleMouseLeave}>
            <a 
              className={`emp-menu-link ${isGroupActive(['emp-pip', 'emp-learning', 'recruitment', 'emp-engagement']) ? 'active' : ''}`}
              onClick={() => toggleDropdown('growth')}
            >
              <i className="fa-solid fa-graduation-cap"></i>
              Growth & Talent
              <i className="fa-solid fa-chevron-down" style={{ transform: activeDropdown === 'growth' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}></i>
            </a>
            <div 
              className={`emp-dropdown-panel ${activeDropdown === 'growth' ? 'open' : ''}`} 
              style={{ minWidth: '320px' }}
              onMouseEnter={() => handleMouseEnter('growth')}
              onMouseLeave={handleMouseLeave}
            >
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
          <div className="emp-menu-item" onMouseEnter={() => handleMouseEnter('finance')} onMouseLeave={handleMouseLeave}>
            <a 
              className={`emp-menu-link ${isGroupActive(['hr-budgeting', 'statutory-compliance', 'exit-management']) ? 'active' : ''}`}
              onClick={() => toggleDropdown('finance')}
            >
              <i className="fa-solid fa-calculator"></i>
              Finance & Exit
              <i className="fa-solid fa-chevron-down" style={{ transform: activeDropdown === 'finance' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}></i>
            </a>
            <div 
              className={`emp-dropdown-panel ${activeDropdown === 'finance' ? 'open' : ''}`} 
              style={{ minWidth: '320px' }}
              onMouseEnter={() => handleMouseEnter('finance')}
              onMouseLeave={handleMouseLeave}
            >
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
          <div 
            className="emp-menu-item" 
            id="nav-item-workplace"
            onMouseEnter={() => handleMouseEnter('workplace')} 
            onMouseLeave={handleMouseLeave}
          >
            <a 
              className={`emp-menu-link ${isGroupActive(['emp-tasks', 'emp-meetings', 'emp-reports', 'emp-helpdesk']) ? 'active' : ''}`}
              id="nav-workplace-trigger"
              onClick={() => toggleDropdown('workplace')}
            >
              <i className="fa-solid fa-desktop"></i>
              Workplace
              <i className="fa-solid fa-chevron-down" style={{ transform: activeDropdown === 'workplace' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}></i>
            </a>
            <div 
              className={`emp-dropdown-panel ${activeDropdown === 'workplace' ? 'open' : ''}`} 
              id="nav-workplace-dropdown-panel"
              style={{ minWidth: '320px', left: 0 }}
              onMouseEnter={() => handleMouseEnter('workplace')}
              onMouseLeave={handleMouseLeave}
            >
              <a
                className={`emp-dropdown-item ${isTabActive('emp-tasks') ? 'active' : ''}`}
                id="nav-dropdown-emp-tasks"
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
                id="nav-dropdown-emp-meetings"
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
                id="nav-dropdown-emp-reports"
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
                id="nav-dropdown-emp-helpdesk"
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
        <div className="emp-search" ref={searchContainerRef} style={{ position: 'relative', minWidth: '220px', flexShrink: 0 }}>
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
