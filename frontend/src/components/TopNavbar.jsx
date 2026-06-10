import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';

const TopNavbar = ({ currentModule, setCurrentModule, setMobileActive, darkMode, setDarkMode, onSearch }) => {
  const { user, logout } = useContext(AuthContext);
  const { notifications } = useContext(DataContext);
  const [dropdownActive, setDropdownActive] = useState(false);

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
    setCurrentModule(mod);
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
        <button className="nav-icon-btn" onClick={() => setDarkMode(!darkMode)}>
          <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
        </button>
        <div className="user-dropdown-btn" onClick={() => setDropdownActive(prev => !prev)}>
          <img src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt="Profile" />
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
