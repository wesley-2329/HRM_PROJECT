import React, { useState, useContext, useEffect } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './components/Toast';
import LoginGateway from './pages/LoginGateway';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import HRApp from './pages/HRApp';
import EmployeeApp from './pages/EmployeeApp';

const AppContent = () => {
  const { user, loading } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileActive, setMobileActive] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle module default reset when role changes
  useEffect(() => {
    if (user) {
      setCurrentModule(user.role === 'hr' ? 'dashboard' : 'emp-dashboard');
    }
  }, [user]);

  // Apply dark mode class to document body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

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

  if (!user) {
    return <LoginGateway />;
  }

  return (
    <div className={`app-layout ${mobileActive ? 'mobile-active' : ''}`}>
      {/* Sidebar navigation */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        currentModule={currentModule}
        setCurrentModule={setCurrentModule}
        mobileActive={mobileActive}
        setMobileActive={setMobileActive}
      />

      {/* Main dashboard viewport */}
      <main className="main-content">
        <TopNavbar
          currentModule={currentModule}
          setCurrentModule={setCurrentModule}
          setMobileActive={setMobileActive}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onSearch={setSearchQuery}
        />

        <div className="module-viewport">
          {user.role === 'hr' ? (
            <HRApp
              currentModule={currentModule}
              setCurrentModule={setCurrentModule}
              searchQuery={searchQuery}
            />
          ) : (
            <EmployeeApp
              currentModule={currentModule}
              setCurrentModule={setCurrentModule}
            />
          )}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
