import React from 'react';
import { useNavigate } from 'react-router-dom';

const SubmoduleHeader = ({ title, description, actions, onActionClick, actionLabel, isHr }) => {
  const navigate = useNavigate();

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Title block with back to directory and action button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'hsl(var(--text-primary))', marginBottom: '4px' }}>
            {title}
          </h2>
          {description && (
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', margin: 0 }}>
              {description}
            </p>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {isHr && actions && actions.map((act, idx) => (
            <button 
              key={idx}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: 'none',
                background: 'hsl(var(--primary))',
                color: 'white'
              }}
              onClick={act.onClick}
            >
              {act.icon ? <i className={`fa-solid ${act.icon}`} style={{ fontSize: '0.75rem' }}></i> : <i className="fa-solid fa-plus" style={{ fontSize: '0.75rem' }}></i>}
              <span>{act.label}</span>
            </button>
          ))}

          {isHr && !actions && onActionClick && actionLabel && (
            <button 
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: 'none',
                background: 'hsl(var(--primary))',
                color: 'white'
              }}
              onClick={onActionClick}
            >
              <i className="fa-solid fa-plus" style={{ fontSize: '0.75rem' }}></i>
              <span>{actionLabel}</span>
            </button>
          )}

        </div>
      </div>
      <div style={{ borderBottom: '1px solid hsl(var(--border))', marginTop: '16px' }}></div>
    </div>
  );
};

export default SubmoduleHeader;
