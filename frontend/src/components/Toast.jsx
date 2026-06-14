import React, { createContext, useState, useContext } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, active: false }]);
    
    // Trigger slide-in animation
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, active: true } : t))
      );
    }, 10);

    // Auto-remove toast after 3.5s
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, active: false } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 3500);
  };

  React.useEffect(() => {
    window.showToast = showToast;
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => {
          let icon = 'fa-info-circle';
          if (t.type === 'success') icon = 'fa-circle-check';
          if (t.type === 'error' || t.type === 'danger') icon = 'fa-circle-exclamation';
          if (t.type === 'warning') icon = 'fa-triangle-exclamation';
          return (
            <div key={t.id} className={`toast ${t.type === 'danger' ? 'error' : t.type} ${t.active ? 'active' : ''}`}>
              <i className={`fa-solid ${icon}`}></i>
              <span>{t.message}</span>
              <div className="toast-progress"></div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
export default ToastProvider;
