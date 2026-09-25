import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 8000,
});

// Attach Authorization Bearer token and browser mock database state
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const mockState = localStorage.getItem('mock_database_state');
    if (mockState) {
      config.headers['x-mock-state'] = mockState;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept response to capture state changes and DB connection health events
api.interceptors.response.use(
  (response) => {
    const dataSource = response.headers['x-data-source'];
    if (dataSource === 'fallback') {
      window.dispatchEvent(new CustomEvent('offline-fallback-detected'));
    } else if (dataSource === 'live') {
      window.dispatchEvent(new CustomEvent('offline-fallback-cleared'));
    }

    const mockState = response.headers['x-mock-state'];
    if (mockState) {
      localStorage.setItem('mock_database_state', mockState);
    }
    return response;
  },
  (error) => {
    const dataSource = error.response?.headers?.['x-data-source'];
    if (dataSource === 'fallback') {
      window.dispatchEvent(new CustomEvent('offline-fallback-detected'));
    } else if (dataSource === 'live') {
      window.dispatchEvent(new CustomEvent('offline-fallback-cleared'));
    }

    const mockState = error.response?.headers?.['x-mock-state'];
    if (mockState) {
      localStorage.setItem('mock_database_state', mockState);
    }
    return Promise.reject(error);
  }
);

export default api;
