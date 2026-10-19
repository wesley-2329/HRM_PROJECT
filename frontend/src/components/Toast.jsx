import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [mounted, setMounted] = useState(false);
  const timeoutsRef = useRef({});

  useEffect(() => {
    setMounted(true);
    return () => {
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  const dismissToast = (id) => {
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id]);
      delete timeoutsRef.current[id];
    }
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: false } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  };

  const showToast = (message, type = 'info', options = {}) => {
    const toastId = options.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = options.duration || 3500;

    // Clear any existing auto-remove timer for this specific toast
    if (timeoutsRef.current[toastId]) {
      clearTimeout(timeoutsRef.current[toastId]);
      delete timeoutsRef.current[toastId];
    }

    setToasts((prev) => {
      const existingIdx = prev.findIndex((t) => t.id === toastId);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          message,
          type,
          active: true
        };
        return updated;
      }

      // Deduplicate identical active message and type to prevent vertical stacking
      if (prev.some((t) => t.message === message && t.type === type)) {
        return prev;
      }

      // Mutual exclusion between contradictory notification types (e.g. success vs error/danger)
      let cleaned = prev;
      if (type === 'success') {
        const removed = prev.filter((t) => t.type === 'error' || t.type === 'danger');
        removed.forEach((t) => {
          if (timeoutsRef.current[t.id]) {
            clearTimeout(timeoutsRef.current[t.id]);
            delete timeoutsRef.current[t.id];
          }
        });
        cleaned = prev.filter((t) => t.type !== 'error' && t.type !== 'danger');
      } else if (type === 'error' || type === 'danger') {
        const removed = prev.filter((t) => t.type === 'success');
        removed.forEach((t) => {
          if (timeoutsRef.current[t.id]) {
            clearTimeout(timeoutsRef.current[t.id]);
            delete timeoutsRef.current[t.id];
          }
        });
        cleaned = prev.filter((t) => t.type !== 'success');
      }

      // Limit concurrent visible toasts to 3 to prevent clutter
      const list = cleaned.length >= 3 ? cleaned.slice(cleaned.length - 2) : cleaned;
      return [...list, { id: toastId, message, type, active: false }];
    });

    // Trigger slide-in animation
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === toastId ? { ...t, active: true } : t))
      );
    }, 10);

    // Auto-remove toast after duration
    timeoutsRef.current[toastId] = setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === toastId ? { ...t, active: false } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
        delete timeoutsRef.current[toastId];
      }, 300);
    }, duration);

    return toastId;
  };

  useEffect(() => {
    window.showToast = showToast;
  }, []);

  const toastContainer = (
    <div
      className="toast-container"
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999999,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
    >
      {toasts.map((t) => {
        let icon = 'fa-info-circle';
        if (t.type === 'success') icon = 'fa-circle-check';
        if (t.type === 'error' || t.type === 'danger') icon = 'fa-circle-exclamation';
        if (t.type === 'warning') icon = 'fa-triangle-exclamation';
        return (
          <div
            key={t.id}
            className={`toast ${t.type === 'danger' ? 'error' : t.type} ${t.active ? 'active' : ''}`}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className={`fa-solid ${icon}`}></i>
              <span>{t.message}</span>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                opacity: 0.6,
                color: 'inherit',
                fontSize: '0.85rem',
                padding: '2px 4px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Close"
              aria-label="Close notification"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="toast-progress"></div>
          </div>
        );
      })}
    </div>
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {mounted && typeof document !== 'undefined' ? createPortal(toastContainer, document.body) : toastContainer}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
export default ToastProvider;
