import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { encodeId, getAvatarUrl } from '../App';

const TopNavbar = ({ currentModule, setMobileActive, darkMode, setDarkMode, onSearch }) => {
  const { user, logout } = useContext(AuthContext);
  const { notifications } = useContext(DataContext);
  const [dropdownActive, setDropdownActive] = useState(false);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.nav-actions')) {
        setDropdownActive(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleModuleChange = (mod) => {
    if (user.role === 'hr') {
      navigate(`/hr/${mod}`);
    } else {
      navigate(`/employee/${encodeId(user.id)}/${mod}`);
    }
    setDropdownActive(false);
  };

  const getPageTitle = () => {
    if (user.role === 'hr') {
      if (currentModule === 'dashboard') return 'Dashboard';
      return currentModule.replace('-', ' ').toUpperCase();
    } else {
      if (currentModule === 'emp-dashboard') return 'My Dashboard';
      return currentModule.replace('emp-', '').replace('-', ' ').toUpperCase();
    }
  };

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          className="nav-icon-btn hamburger-btn"
          onClick={() => setMobileActive(prev => !prev)}
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        {/* Back and Forward Navigation Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
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

        <h2 style={{ fontWeight: 700, fontSize: '1.25rem' }}>{getPageTitle()}</h2>
      </div>

      <div className="nav-search">
        <i className="fa-solid fa-search"></i>
        <input
          type="text"
          placeholder="Global search for staff or codes..."
          onChange={(e) => onSearch && onSearch(e.target.value)}
        />
      </div>

      <div className="nav-actions">
        <button
          className="nav-icon-btn"
          onClick={() => handleModuleChange(user.role === 'hr' ? 'notification-system' : 'emp-notifications')}
        >
          <i className="fa-solid fa-bell"></i>
          {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
        </button>
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
          <svg className={`theme-toggle-svg ${darkMode ? 'dark' : 'light'}`} viewBox="0 0 24 24" width="24" height="24">
            <mask id="moon-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <circle className="moon-mask-circle" cx="24" cy="0" r="9" fill="black" />
            </mask>
            <circle className="sun-center" cx="12" cy="12" r="5" fill="currentColor" mask="url(#moon-mask)" />
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
        <div className="user-dropdown-btn" onClick={() => setDropdownActive(prev => !prev)}>
          <img src={getAvatarUrl(user)} alt="Profile" />
          <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.75rem' }}></i>
        </div>
        <div className={`dropdown-menu ${dropdownActive ? 'active' : ''}`}>
          <a className="dropdown-item" onClick={() => handleModuleChange(user.role === 'hr' ? 'settings-profile' : 'emp-profile')}>
            <i className="fa-solid fa-user"></i> My Profile
          </a>
          <a className="dropdown-item" onClick={() => handleModuleChange(user.role === 'hr' ? 'settings-profile' : 'emp-settings')}>
            <i className="fa-solid fa-gear"></i> Settings
          </a>
          <a className="dropdown-item" onClick={logout}>
            <i className="fa-solid fa-right-from-bracket"></i> Log Out
          </a>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
