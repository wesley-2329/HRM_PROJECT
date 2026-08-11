import React from 'react';

// 1. KPIStatCard: Renders a styled dashboard card for organization metrics
export const KPIStatCard = ({ label, value, icon, color, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="emp-card hover:scale-[1.02] transition-all duration-300"
      style={{ 
        padding: '20px', 
        background: 'hsl(var(--bg-card))', 
        border: '1px solid hsl(var(--border))', 
        borderRadius: '12px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 4px 15px rgba(0,0,0,0.01)'
      }}
    >
      <div>
        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>{label}</span>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'hsl(var(--text-primary))', marginTop: '6px', margin: 0 }}>{value}</h3>
      </div>
      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
    </div>
  );
};

// 2. OrganizationToolbar: Unified breadcrumbs and action button container
export const OrganizationToolbar = ({ title, description, actions = [] }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>Enterprise HRMS</span>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.65rem' }}></i>
          <span style={{ color: 'hsl(var(--primary))' }}>{title}</span>
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'hsl(var(--text-primary))', marginTop: '6px', margin: 0 }}>
          {title}
        </h2>
        {description && (
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', margin: '4px 0 0 0' }}>
            {description}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        {actions.map((act, idx) => (
          <button 
            key={idx} 
            onClick={act.onClick} 
            className={`btn ${act.primary ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {act.icon && <i className={`fa-solid ${act.icon}`}></i>}
            <span>{act.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// 3. SearchFilterBar: Reusable search field and filter controls
export const SearchFilterBar = ({ searchValue, onSearchChange, placeholder = 'Search...', filterValue, onFilterChange, filterOptions = [], children }) => {
  return (
    <div className="emp-card" style={{ padding: '16px 20px', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
        <div className="nav-search" style={{ margin: 0, width: '240px' }}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input 
            type="text" 
            placeholder={placeholder} 
            value={searchValue} 
            onChange={onSearchChange} 
          />
        </div>

        {filterOptions.length > 0 && (
          <select 
            className="form-control" 
            style={{ width: '180px', height: '38px', padding: '0 12px' }} 
            value={filterValue} 
            onChange={onFilterChange}
          >
            {filterOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}

        {children}
      </div>
    </div>
  );
};

// 4. DataTable: Enterprise list table
export const DataTable = ({ headers = [], rows = [], renderRow }) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: '12px' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => renderRow(row, i))}
        </tbody>
      </table>
    </div>
  );
};

// 5. EmptyState: Visual empty state container
export const EmptyState = ({ message = 'No records found.', icon = 'fa-folder-open' }) => {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'hsl(var(--text-secondary))' }}>
      <i className={`fa-solid ${icon}`} style={{ fontSize: '2.5rem', opacity: 0.4, marginBottom: '16px', display: 'block' }}></i>
      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>{message}</p>
    </div>
  );
};

// 6. SkeletonLoader: Loading skeleton feedback
export const SkeletonLoader = ({ count = 3 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          style={{ 
            height: '70px', 
            background: 'linear-gradient(90deg, hsl(var(--bg-card)) 25%, hsl(var(--bg-main)) 37%, hsl(var(--bg-card)) 63%)', 
            backgroundSize: '400% 100%', 
            animation: 'pulse 1.8s infinite', 
            borderRadius: '8px', 
            border: '1px solid hsl(var(--border))' 
          }}
        ></div>
      ))}
    </div>
  );
};
