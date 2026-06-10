import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authenticate user
  const login = async (email, password, role) => {
    const res = await api.post('/auth/login', { email, password, role });
    localStorage.setItem('token', res.data.token);
    // Fetch detailed profile after logging in
    const profileRes = await api.get('/auth/me');
    setUser(profileRes.data);
    return profileRes.data;
  };

  // Register request
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  };

  // Secure sign out
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Load current user profile from cached token
  const loadUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
