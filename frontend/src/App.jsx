import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './components/Toast';
import LoginGateway from './pages/LoginGateway';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import HRApp from './pages/HRApp';
import EmployeeApp from './pages/EmployeeApp';

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
  if (emp?.avatar && emp.avatar.trim() !== '' && !emp.avatar.includes('unsplash.com')) {
    return emp.avatar;
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

const MainLayoutWrapper = ({ role, overrideModule }) => {
  const { user } = useContext(AuthContext);
  const { id: hashId, module } = useParams();
  const id = decodeId(hashId);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileActive, setMobileActive] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Apply dark mode class to document body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Authorization checks
  useEffect(() => {
    if (!user) return;
    if (role === 'hr' && user.role !== 'hr') {
      navigate(`/employee/${encodeId(user.id)}/emp-dashboard`, { replace: true });
    } else if (role === 'employee' && overrideModule !== 'org-structure') {
      if (user.role !== 'hr' && user.id !== id) {
        navigate(`/employee/${encodeId(user.id)}/emp-dashboard`, { replace: true });
      }
    }
  }, [user, role, id, navigate, overrideModule]);

  if (!user) return null;

  return (
    <div className={`app-layout ${mobileActive ? 'mobile-active' : ''}`}>
      {/* Sidebar navigation */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        currentModule={overrideModule || module}
        mobileActive={mobileActive}
        setMobileActive={setMobileActive}
      />

      {/* Main dashboard viewport */}
      <main className="main-content">
        <TopNavbar
          currentModule={overrideModule || module}
          setMobileActive={setMobileActive}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onSearch={setSearchQuery}
        />

        <div className="module-viewport">
          {role === 'hr' ? (
            <HRApp
              currentModule={overrideModule || module}
              searchQuery={searchQuery}
            />
          ) : (
            <EmployeeApp
              currentModule={overrideModule || module}
            />
          )}
        </div>
      </main>
    </div>
  );
};

const AppContent = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect logic on load / auth change
  useEffect(() => {
    if (loading) return;
    if (!user) {
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    } else {
      if (location.pathname === '/login' || location.pathname === '/') {
        if (user.role === 'hr') {
          navigate('/hr/dashboard', { replace: true });
        } else {
          navigate(`/employee/${encodeId(user.id)}/emp-dashboard`, { replace: true });
        }
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

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? (user.role === 'hr' ? '/hr/dashboard' : `/employee/${encodeId(user.id)}/emp-dashboard`) : '/login'} replace />} />
      <Route path="/login" element={!user ? <LoginGateway /> : <Navigate to="/" replace />} />
      <Route path="/hr/:module" element={<MainLayoutWrapper role="hr" />} />
      <Route path="/employee/:id/:module" element={<MainLayoutWrapper role="employee" />} />
      <Route path="/organization/*" element={<MainLayoutWrapper role={user?.role === 'hr' ? 'hr' : 'employee'} overrideModule="org-structure" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
