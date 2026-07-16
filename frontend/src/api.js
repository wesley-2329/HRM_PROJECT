import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
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

// Intercept response to capture state changes sent back from the backend
api.interceptors.response.use(
  (response) => {
    const mockState = response.headers['x-mock-state'];
    if (mockState) {
      localStorage.setItem('mock_database_state', mockState);
    }
    return response;
  },
  (error) => {
    const mockState = error.response?.headers?.['x-mock-state'];
    if (mockState) {
      localStorage.setItem('mock_database_state', mockState);
    }
    return Promise.reject(error);
  }
);

export default api;
