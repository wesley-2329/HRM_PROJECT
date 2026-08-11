import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      transition: 'opacity 0.25s ease'
    }}>
      <div 
        className="emp-card" 
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'hsl(var(--bg-card))',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid hsl(var(--border))',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          transform: 'translateY(0)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid hsl(var(--border))'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'hsl(var(--text-primary))' }}>
            {title}
          </h3>
          <button 
            onClick={onClose} 
            style={{
              background: 'transparent',
              border: 'none',
              color: 'hsl(var(--text-secondary))',
              cursor: 'pointer',
              fontSize: '1.1rem',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background 0.2s'
            }}
            className="hover-bg-slate"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          flex: 1
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
