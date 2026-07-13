import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../../context/DataContext';
import { OrganizationToolbar } from './components/SharedComponents';

const OrgStructureDashboard = ({ mode }) => {
  const navigate = useNavigate();
  const {
    departments,
    employees,
    positions,
    vacancies,
    fetchDepartments,
    fetchEmployees,
    fetchPositions,
    fetchVacancies
  } = useContext(DataContext);

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
    fetchPositions();
    fetchVacancies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute Core Metrics
  const totalDepts = departments.length;
  const totalEmps = employees.length;
  const vacantPositions = positions.filter(p => p.status === 'Vacant' || p.status === 'Open').length;
  const totalApproved = vacancies.reduce((sum, v) => sum + (v.approvedHeadcount || 0), 0) || (totalEmps + vacantPositions);
  
  // Vacancy Status count
  const openCount = vacancies.filter(v => v.status === 'Open').length;
  const holdCount = vacancies.filter(v => v.status === 'Hold').length;
  const pendingCount = vacancies.filter(v => v.status === 'Pending Approval' || v.status === 'Pending').length;

  // Department-wise Manpower Summary list
  const deptManpower = departments.map(d => {
    const filled = employees.filter(e => e.dept === d.name).length;
    const matchingVacancies = vacancies.filter(v => v.dept === d.name);
    const approved = matchingVacancies.reduce((sum, v) => sum + (v.approvedHeadcount || 0), 0) || (filled + (d.status === 'Inactive' ? 0 : 2));
    const vacant = Math.max(0, approved - filled);
    return { name: d.name, approved, filled, vacant };
  }).sort((a, b) => b.approved - a.approved);

  // Vacancy Priority distribution
  const highPriority = vacancies.filter(v => v.priorityLevel === 'High').length;
  const medPriority = vacancies.filter(v => v.priorityLevel === 'Medium').length;
  const lowPriority = vacancies.filter(v => v.priorityLevel === 'Low').length;

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <OrganizationToolbar 
        title="Organizational Structure Dashboard"
        description="Comprehensive manpower analysis: review approved department headcounts, active vacancy tracking, priority filters, and budget limits."
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {[
          { label: 'Total Departments', value: totalDepts, icon: 'fa-folder-tree', color: '#8b5cf6' },
          { label: 'Approved Headcount', value: totalApproved, icon: 'fa-user-check', color: '#3b82f6' },
          { label: 'Filled Positions', value: totalEmps, icon: 'fa-users', color: '#10b981' },
          { label: 'Vacant Positions', value: vacantPositions, icon: 'fa-chair', color: '#ef4444' },
        ].map((stat, idx) => (
          <div 
            key={idx}
            className="emp-card"
            style={{
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--bg-card))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                {stat.label}
              </span>
              <strong style={{ fontSize: '1.75rem', fontWeight: 800, color: 'hsl(var(--text-primary))' }}>
                {stat.value}
              </strong>
            </div>
            <div 
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                background: `${stat.color}12`,
                color: stat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}
            >
              <i className={`fa-solid ${stat.icon}`}></i>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Manpower list & Priorities */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Left Side: Department Manpower Progress */}
        <div className="emp-card" style={{ padding: '24px', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 16px 0', color: 'hsl(var(--text-primary))', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-chart-column" style={{ color: 'hsl(var(--primary))' }}></i>
            <span>Department-wise Manpower Summary</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {deptManpower.length > 0 ? deptManpower.map((item, index) => {
              const filledPerc = item.approved > 0 ? (item.filled / item.approved) * 100 : 0;
              const vacantPerc = item.approved > 0 ? (item.vacant / item.approved) * 100 : 0;
              return (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600, color: 'hsl(var(--text-primary))' }}>{item.name}</span>
                    <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>
                      Approved: <strong>{item.approved}</strong> | Filled: <strong style={{ color: '#10b981' }}>{item.filled}</strong> | Vacant: <strong style={{ color: '#ef4444' }}>{item.vacant}</strong>
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: 'hsl(var(--bg-main))', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${filledPerc}%`, height: '100%', background: '#10b981', title: 'Filled' }}></div>
                    <div style={{ width: `${vacantPerc}%`, height: '100%', background: '#ef4444', title: 'Vacant' }}></div>
                  </div>
                </div>
              );
            }) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'hsl(var(--text-secondary))' }}>No department mappings active.</div>
            )}
          </div>
        </div>

        {/* Right Side: Vacancy Status & Priority distributions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Vacancy Status Breakdown */}
          <div className="emp-card" style={{ padding: '24px', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px 0', color: 'hsl(var(--text-primary))' }}>Vacancy Statuses</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Active Open Roles', count: openCount, color: '#10b981' },
                { label: 'On Hold Roles', count: holdCount, color: '#f59e0b' },
                { label: 'Pending Approval', count: pendingCount, color: '#3b82f6' }
              ].map((status, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'hsl(var(--bg-main))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}>
                  <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: 500 }}>{status.label}</span>
                  <strong style={{ fontSize: '1rem', color: status.color }}>{status.count}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="emp-card" style={{ padding: '24px', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px 0', color: 'hsl(var(--text-primary))' }}>Urgency Priority Levels</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'High Priority (Urgent)', count: highPriority, percentage: vacancies.length > 0 ? (highPriority / vacancies.length) * 100 : 0, color: '#ef4444' },
                { label: 'Medium Priority', count: medPriority, percentage: vacancies.length > 0 ? (medPriority / vacancies.length) * 100 : 0, color: '#f59e0b' },
                { label: 'Low Priority', count: lowPriority, percentage: vacancies.length > 0 ? (lowPriority / vacancies.length) * 100 : 0, color: '#3b82f6' }
              ].map((prio, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'hsl(var(--text-secondary))' }}>{prio.label}</span>
                    <strong>{prio.count}</strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'hsl(var(--bg-main))', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${prio.percentage}%`, height: '100%', background: prio.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default OrgStructureDashboard;
