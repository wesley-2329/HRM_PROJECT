import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 8000,
});

// Attach Authorization Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

const verifyHealthAndNotify = async () => {
  try {
    const healthRes = await axios.get((import.meta.env.VITE_API_BASE_URL || '/api') + '/health', { timeout: 5000 });
    if (healthRes.data?.dataSource === 'live' || healthRes.headers['x-data-source'] === 'live') {
      notifyOfflineState(false);
      return;
    }
  } catch (err) {
    // Confirmed offline or health check unreachable
  }
  isCurrentlyOffline = true;
  window.dispatchEvent(new CustomEvent('offline-fallback-detected'));
};

const notifyOfflineState = (isFallback) => {
  if (isFallback) {
    consecutiveFallbackCount++;
    // Only trigger offline if at least 2 consecutive requests return fallback,
    // and debounce by 1500ms to eliminate cold-start glitching
    if (consecutiveFallbackCount >= 2 && !isCurrentlyOffline && !debounceFallbackTimer) {
      debounceFallbackTimer = setTimeout(async () => {
        debounceFallbackTimer = null;
        if (consecutiveFallbackCount >= 2) {
          await verifyHealthAndNotify();
        }
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

    return response;
  },
  (error) => {
    // Distinguish individual request timeout/cancellation from DB outage
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || axios.isCancel(error)) {
      // Individual timeout: do NOT falsely treat as database offline
      return Promise.reject(error);
    }

    // Expired/invalid session: clear it and go to login (wrong-password 401s on /auth/* are left to the form)
    if (error.response?.status === 401 && error.config?.headers?.Authorization && !error.config.url?.startsWith('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('cached_user');
      if (window.location.pathname !== '/login') window.location.assign('/login');
      return Promise.reject(error);
    }

    const dataSource = error.response?.headers?.['x-data-source'];
    if (dataSource === 'fallback') {
      notifyOfflineState(true);
    } else if (dataSource === 'live') {
      notifyOfflineState(false);
    }

    return Promise.reject(error);
  }
);

export default api;
