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

let consecutiveFallbackCount = 0;
let debounceFallbackTimer = null;
let isCurrentlyOffline = false;

const notifyOfflineState = (isFallback) => {
  if (isFallback) {
    consecutiveFallbackCount++;
    // Only trigger offline if at least 2 consecutive requests return fallback,
    // and debounce by 1500ms to eliminate cold-start glitching
    if (consecutiveFallbackCount >= 2 && !isCurrentlyOffline && !debounceFallbackTimer) {
      debounceFallbackTimer = setTimeout(() => {
        isCurrentlyOffline = true;
        window.dispatchEvent(new CustomEvent('offline-fallback-detected'));
      }, 1500);
    }
  } else {
    consecutiveFallbackCount = 0;
    if (debounceFallbackTimer) {
      clearTimeout(debounceFallbackTimer);
      debounceFallbackTimer = null;
    }
    if (isCurrentlyOffline) {
      isCurrentlyOffline = false;
      window.dispatchEvent(new CustomEvent('offline-fallback-cleared'));
    }
  }
};

// Intercept response to capture state changes and DB connection health events
api.interceptors.response.use(
  (response) => {
    const dataSource = response.headers['x-data-source'];
    if (dataSource === 'fallback') {
      notifyOfflineState(true);
    } else if (dataSource === 'live') {
      notifyOfflineState(false);
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
      notifyOfflineState(true);
    } else if (dataSource === 'live') {
      notifyOfflineState(false);
    }

    const mockState = error.response?.headers?.['x-mock-state'];
    if (mockState) {
      localStorage.setItem('mock_database_state', mockState);
    }
    return Promise.reject(error);
  }
);

export default api;
