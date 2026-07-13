import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../../context/DataContext';
import { OrganizationToolbar } from './components/SharedComponents';

const VacancyMappingLanding = ({ mode }) => {
  const navigate = useNavigate();
  const {
    employees,
    departments,
    designations,
    positions,
    vacancies,
    fetchEmployees,
    fetchDepartments,
    fetchDesignations,
    fetchPositions,
    fetchVacancies
  } = useContext(DataContext);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchDesignations();
    fetchPositions();
    fetchVacancies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = [
    {
      title: 'Structure Dashboard',
      icon: 'fa-gauge-high',
      description: 'Review total departments, staff strength, vacant positions, and pending approvals.',
      route: '/organization/structure-dashboard',
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Department Setup',
      icon: 'fa-folder-tree',
      description: 'Configure departments, assign HOD heads, and active/inactive operational status.',
      route: '/organization/departments',
      color: 'from-teal-500/20 to-cyan-500/10 text-teal-600 dark:text-teal-400',
    },
    {
      title: 'Designation Mapping',
      icon: 'fa-id-badge',
      description: 'Define designations, map departments, grades, bands, and track position limits.',
      route: '/organization/designations',
      color: 'from-purple-500/20 to-pink-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Vacancy Mapping Setup',
      icon: 'fa-user-plus',
      description: 'Manage position headcount limits, vacant slots, requirement dates, and reasons.',
      route: '/organization/vacancy-mapping/setup',
      color: 'from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Vacancy Request Approval',
      icon: 'fa-circle-check',
      description: 'Approve, reject, or hold raised vacancy manpower requests with budget verification logs.',
      route: '/organization/vacancy-mapping/setup?mode=approval',
      color: 'from-rose-500/20 to-pink-500/10 text-rose-600 dark:text-rose-400',
    },
    {
      title: 'Organization Chart',
      icon: 'fa-network-wired',
      description: 'Explore active hierarchies, direct lead links, and employee structure trees.',
      route: '/organization/org-chart',
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400',
    }
  ];

  const totalApproved = positions.reduce((sum, p) => sum + (p.positionLimit || 1), 0);
  const totalFilled = employees.length;
  const vacantPositions = positions.filter(p => p.status === 'Vacant' || p.status === 'Open').length;

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <OrganizationToolbar 
        title="Vacancy Mapping Hub"
        description="Unified tracking system: manage approved manpower limits, vacant positions, recruitment workflows, and budget validations."
      />

      {/* Mini dashboard banner */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {[
          { label: 'Approved Headcount', value: totalApproved || 120, color: 'hsl(var(--primary))' },
          { label: 'Filled Positions', value: totalFilled, color: '#10b981' },
          { label: 'Vacant Slots', value: vacantPositions || 14, color: '#f59e0b' },
          { label: 'Pending Approvals', value: vacancies.filter(v => v.status === 'Pending').length, color: '#ec4899' }
        ].map((stat, idx) => (
          <div key={idx} style={{ background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', minWidth: '150px' }}>
            <div style={{ width: '4px', height: '24px', background: stat.color, borderRadius: '2px' }}></div>
            <div>
              <span style={{ fontSize: '0.68rem', color: 'hsl(var(--text-secondary))', display: 'block', fontWeight: 600 }}>{stat.label}</span>
              <strong style={{ fontSize: '1rem', color: 'hsl(var(--text-primary))' }}>{stat.value}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* 6 Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '10px' }}>
        {cards.map((card, idx) => (
          <div 
            key={idx}
            onClick={() => navigate(card.route)}
            className="emp-card hover:scale-[1.03] transition-all duration-300"
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid hsl(var(--border))',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '190px',
              background: 'hsl(var(--bg-card))',
              boxShadow: '0 4px 20px rgba(0,0,0,0.015)'
            }}
          >
            <div>
              <div 
                className={`bg-gradient-to-br ${card.color}`} 
                style={{ 
                  width: '46px', 
                  height: '46px', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  marginBottom: '16px'
                }}
              >
                <i className={`fa-solid ${card.icon}`}></i>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'hsl(var(--text-primary))', marginBottom: '8px', margin: 0 }}>
                {card.title}
              </h3>
              
              <p style={{ fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4', margin: '6px 0 0 0' }}>
                {card.description}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: 'hsl(var(--primary))', marginTop: '16px' }}>
              <span>Configure Screen</span>
              <i className="fa-solid fa-arrow-right-long"></i>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default VacancyMappingLanding;
