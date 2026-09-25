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

  // Authenticate user
  const login = async (email, password, role) => {
    const res = await api.post('/auth/login', { email, password, role });
    localStorage.setItem('token', res.data.token);
    // Fetch detailed profile after logging in
    try {
      const profileRes = await api.get('/auth/me');
      updateUserState(profileRes.data);
      return profileRes.data;
    } catch (e) {
      const fallbackUser = {
        _id: res.data._id || '60c72b2f9b1d8b2a3c9d7890',
        id: res.data.id || (role === 'hr' ? 'EMP-0001' : 'EMP-0002'),
        name: res.data.name || (role === 'hr' ? 'Venkat Raman' : 'Aditya Kumar'),
        email,
        role,
        dept: res.data.dept || (role === 'hr' ? 'Human Resources' : 'Engineering')
      };
      updateUserState(fallbackUser);
      return fallbackUser;
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

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser: updateUserState, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
