import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './components/Toast';
import LoginGateway from './pages/LoginGateway';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import HRTopNavbar from './components/HRTopNavbar';
import EmpTopNavbar from './components/EmpTopNavbar';
import HRApp from './pages/HRApp';
import EmployeeApp from './pages/EmployeeApp';
import LandingPage from './pages/LandingPage';
import api from './api';

export const encodeId = (id) => {
  if (!id) return '';
  try {
    return btoa(id).replace(/=/g, '');
  } catch (e) {
    return id;
  }
};

export const decodeId = (hash) => {
  if (!hash) return '';
  try {
    let str = hash;
    while (str.length % 4) {
      str += '=';
    }
    return atob(str);
  } catch (e) {
    return hash;
  }
};

export const getAvatarUrl = (emp) => {
  const avatarVal = emp?.avatar || emp?.profilePicture || emp?.profileImage;
  if (avatarVal && typeof avatarVal === 'string' && avatarVal.trim() !== '') {
    const avatar = avatarVal.trim();
    if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:')) {
      return avatar;
    }
    const apiBase = import.meta.env.VITE_API_BASE_URL || '';
    const origin = apiBase ? apiBase.replace(/\/api\/?$/, '') : '';
    return `${origin}${avatar.startsWith('/') ? '' : '/'}${avatar}`;
  }
  const gender = (emp?.gender || 'Male').toLowerCase();
  if (gender === 'female') {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ec4899"><circle cx="12" cy="8" r="4"/><path d="M12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/></svg>';
  }
  if (gender === 'other') {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2364748b"><circle cx="12" cy="8" r="4"/><path d="M12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/></svg>';
  }
  return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233b82f6"><circle cx="12" cy="8" r="4"/><path d="M12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/></svg>';
};

import ErrorBoundary from './components/ErrorBoundary';

const MainLayoutWrapper = ({ role, overrideModule }) => {
  const { user } = useContext(AuthContext);
  const { id: hashId, module } = useParams();
  const id = decodeId(hashId);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileActive, setMobileActive] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [navbarTheme, setNavbarTheme] = useState(localStorage.getItem('hrorbit-navbar-theme') || 'indigo');

  useEffect(() => {
    window.changeNavbarTheme = (theme) => {
      setNavbarTheme(theme);
    };
    return () => {
      delete window.changeNavbarTheme;
    };
  }, []);

  // Apply dark mode class to document body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const isHRUser = user && (user.role === 'hr' || user.role === 'hr_admin' || user.role === 'super_admin' || user.role === 'recruiter' || user.role === 'hr_executive');

  // Authorization checks
  useEffect(() => {
    if (!user) return;
    if (role === 'hr' && !isHRUser) {
      navigate(`/employee/${encodeId(user.id)}/emp-dashboard`, { replace: true });
    } else if (role === 'employee' && overrideModule !== 'org-structure') {
      const matchUserId = user?.id || user?._id || user?.employeeId;
      if (!isHRUser && matchUserId && id && id !== user?.id && id !== user?._id && id !== user?.employeeId) {
        navigate(`/employee/${encodeId(user.id || user._id)}/emp-dashboard`, { replace: true });
      }
    }
  }, [user, role, id, navigate, overrideModule, isHRUser]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isHR = isHRUser;
  const isEmployee = !isHR;

  return (
    <div className={isHR ? 'hr-top-layout' : 'emp-top-layout'}>
      {/* Main dashboard viewport */}
      <main className="main-content">
        {isHR ? (
          <HRTopNavbar
            currentModule={overrideModule || module}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            navbarTheme={navbarTheme}
            onSearch={setSearchQuery}
          />
        ) : (
          <EmpTopNavbar
            currentModule={overrideModule || module}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            navbarTheme={navbarTheme}
            onSearch={setSearchQuery}
          />
        )}

        <div className="module-viewport">
          <ErrorBoundary resetKey={overrideModule || module}>
            {isHR ? (
              <HRApp
                currentModule={overrideModule || module}
                searchQuery={searchQuery}
              />
            ) : (
              <EmployeeApp
                currentModule={overrideModule || module}
                setCurrentModule={(mod) => navigate(`/employee/${hashId || encodeId(user?.id || user?._id)}/${mod}`)}
              />
            )}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
};

const AppContent = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('offline_banner_dismissed') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [lastUpdatedTime, setLastUpdatedTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    let retryTimer = null;
    const handleOffline = () => {
      try {
        if (sessionStorage.getItem('offline_banner_dismissed') === 'true') {
          return;
        }
      } catch (e) {}
      setIsOfflineFallback(true);
      setLastUpdatedTime(new Date().toLocaleTimeString());
      // Auto-probe after 2s via dedicated /health endpoint to check for connection recovery
      clearTimeout(retryTimer);
      retryTimer = setTimeout(async () => {
        try {
          const res = await api.get('/health');
          setLastUpdatedTime(new Date().toLocaleTimeString());
          if (res.data?.dataSource === 'live' || res.headers['x-data-source'] === 'live') {
            setIsOfflineFallback(false);
            setIsBannerDismissed(false);
            try { sessionStorage.removeItem('offline_banner_dismissed'); } catch (err) {}
            window.dispatchEvent(new CustomEvent('offline-fallback-cleared'));
            window.dispatchEvent(new CustomEvent('refresh-app-data'));
          }
        } catch (e) {
          // keep offline if still disconnected
        }
      }, 2000);
    };

    const handleLive = () => {
      clearTimeout(retryTimer);
      setIsOfflineFallback(false);
      setIsBannerDismissed(false);
      try { sessionStorage.removeItem('offline_banner_dismissed'); } catch (err) {}
      setLastUpdatedTime(new Date().toLocaleTimeString());
    };

    window.addEventListener('offline-fallback-detected', handleOffline);
    window.addEventListener('offline-fallback-cleared', handleLive);

    return () => {
      clearTimeout(retryTimer);
      window.removeEventListener('offline-fallback-detected', handleOffline);
      window.removeEventListener('offline-fallback-cleared', handleLive);
    };
  }, []);

  // Redirect unauthenticated users away from protected paths
  useEffect(() => {
    if (loading) return;
    if (!user) {
      const isProtectedRoute = location.pathname.startsWith('/hr') || location.pathname.startsWith('/employee') || location.pathname.startsWith('/organization');
      if (isProtectedRoute) {
        navigate('/login', { replace: true });
      }
    }
  }, [user, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'hsl(var(--bg-main))', color: 'hsl(var(--text-primary))' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'hsl(var(--primary))' }}></i>
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Verifying Authentication...</span>
        </div>
      </div>
    );
  }

  const isHRUser = user && (user.role === 'hr' || user.role === 'hr_admin' || user.role === 'super_admin' || user.role === 'recruiter' || user.role === 'hr_executive');
  const defaultDashboard = isHRUser ? '/hr/dashboard' : `/employee/${encodeId(user?.id)}/emp-dashboard`;

  return (
    <>
      {isOfflineFallback && !isBannerDismissed && (
        <div style={{
          background: '#f59e0b',
          color: '#1a1a1a',
          padding: '8px 16px',
          textAlign: 'center',
          fontWeight: 600,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          zIndex: 99999,
          position: 'sticky',
          top: 0,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>Database Disconnected — Showing cached offline data</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 500 }}>(Last checked: {lastUpdatedTime})</span>
          </div>
          <button
            onClick={async () => {
              try {
                const res = await api.get('/health');
                setLastUpdatedTime(new Date().toLocaleTimeString());
                if (res.data?.dataSource === 'live' || res.headers['x-data-source'] === 'live') {
                  setIsOfflineFallback(false);
                  setIsBannerDismissed(false);
                  try { sessionStorage.removeItem('offline_banner_dismissed'); } catch (err) {}
                  window.dispatchEvent(new CustomEvent('offline-fallback-cleared'));
                  window.dispatchEvent(new CustomEvent('refresh-app-data'));
                }
              } catch (e) {
                setLastUpdatedTime(new Date().toLocaleTimeString());
              }
            }}
            style={{
              background: '#1a1a1a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '3px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reconnect
          </button>
          <button
            onClick={() => {
              setIsOfflineFallback(false);
              setIsBannerDismissed(true);
              try {
                sessionStorage.setItem('offline_banner_dismissed', 'true');
              } catch (e) {}
            }}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              color: '#1a1a1a',
              lineHeight: 1,
              marginLeft: '4px'
            }}
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={!user ? <LoginGateway /> : <Navigate to={defaultDashboard} replace />} />
        <Route path="/hr/:module" element={<MainLayoutWrapper role="hr" />} />
        <Route path="/employee/:id/:module" element={<MainLayoutWrapper role="employee" />} />
        <Route path="/organization/*" element={<MainLayoutWrapper role={isHRUser ? 'hr' : 'employee'} overrideModule="org-structure" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <DataProvider>
            <AppContent />
          </DataProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
