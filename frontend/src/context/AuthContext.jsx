import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_user');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => !localStorage.getItem('cached_user'));

  // Save user changes to cached_user
  const updateUserState = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('cached_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('cached_user');
    }
  };

  // Authenticate user with real database credentials
  const login = async (email, password, role) => {
    const res = await api.post('/auth/login', { email, password, role });
    localStorage.setItem('token', res.data.token);

    // Fetch full real user profile from MongoDB Atlas
    try {
      const profileRes = await api.get('/auth/me');
      const realUser = profileRes.data || res.data;
      updateUserState(realUser);
      return realUser;
    } catch (e) {
      updateUserState(res.data);
      return res.data;
    }
  };

  // Register request
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  };

  // Secure sign out
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('cached_user');
    setUser(null);
  };

  // Load current user profile from cached token
  const loadUser = async () => {
    try {
      const res = await api.get('/auth/me');
      updateUserState(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('cached_user');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      loadUser();
      // Safety timer: ensure loading never hangs past 1.5s
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      if (localStorage.getItem('token')) {
        loadUser();
      }
    };
    window.addEventListener('userProfileUpdated', handleUpdate);
    window.addEventListener('avatarUpdated', handleUpdate);
    return () => {
      window.removeEventListener('userProfileUpdated', handleUpdate);
      window.removeEventListener('avatarUpdated', handleUpdate);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser: updateUserState, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
