import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const OrgLandingDashboard = ({ mode }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const cards = [
    {
      id: 'company',
      title: 'Company Setup',
      icon: 'fa-building',
      description: 'Configure corporate master profiles, operational settings, calendars, and details.',
      route: '/organization/company',
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'legal-entities',
      title: 'Legal Entities',
      icon: 'fa-scale-balanced',
      description: 'Manage legal corporation registrations, tax GST/PAN/CIN IDs, and contact registry.',
      route: '/organization/legal-entities',
      color: 'from-violet-500/20 to-indigo-500/10 text-violet-600 dark:text-violet-400',
    },
    {
      id: 'business-units',
      title: 'Business Units',
      icon: 'fa-briefcase',
      description: 'Manage corporate divisions, parent entities, email contacts, and cost centers.',
      route: '/organization/business-units',
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'branch',
      title: 'Branches & Locations',
      icon: 'fa-map-location-dot',
      description: 'Manage geographical office locations, branch offices, and assign branch heads.',
      route: '/organization/branches',
      color: 'from-teal-500/20 to-cyan-500/10 text-teal-600 dark:text-teal-400',
    },
    {
      id: 'dept',
      title: 'Departments & Sub Departments',
      icon: 'fa-folder-tree',
      description: 'Organize functional business departments and nested sub-department structures.',
      route: '/organization/departments',
      color: 'from-purple-500/20 to-pink-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      id: 'teams',
      title: 'Team Setup',
      icon: 'fa-people-group',
      description: 'Define operational teams, assign leaders, and manage max member thresholds.',
      route: '/organization/teams',
      color: 'from-indigo-500/20 to-blue-500/10 text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'desg',
      title: 'Designations & Grades',
      icon: 'fa-id-badge',
      description: 'Define employee designations, role job titles, and administrative grade bands.',
      route: '/organization/designations',
      color: 'from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'positions',
      title: 'Position Control',
      icon: 'fa-user-tie',
      description: 'Control vacancies, headcount limits, grades, budgets, and occupation limits.',
      route: '/organization/positions',
      color: 'from-rose-500/20 to-red-500/10 text-rose-600 dark:text-rose-400',
    },
    {
      id: 'chart',
      title: 'Organization Chart',
      icon: 'fa-network-wired',
      description: 'Interactive visual hierarchy tree showing direct functional reporting lines.',
      route: '/organization/org-chart',
      color: 'from-rose-500/20 to-pink-500/10 text-rose-600 dark:text-rose-400',
    },
    {
      id: 'matrix',
      title: 'Reporting Matrix',
      icon: 'fa-people-arrows',
      description: 'Reassign reporting structures, solid/dotted manager lines, and team lead flags.',
      route: '/organization/reporting-matrix',
      color: 'from-sky-500/20 to-cyan-500/10 text-sky-600 dark:text-sky-400',
    },
    {
      id: 'transfers',
      title: 'Transfers & History',
      icon: 'fa-exchange-alt',
      description: 'Process departmental transfers and track employee career movement logs.',
      route: '/organization/transfers',
      color: 'from-violet-500/20 to-purple-500/10 text-violet-600 dark:text-violet-400',
    },
    {
      id: 'manpower',
      title: 'Manpower Planning',
      icon: 'fa-users-gear',
      description: 'Raise manpower headcount requests, track vacancies, and manage HR approvals.',
      route: '/organization/manpower-planning',
      color: 'from-teal-500/20 to-emerald-500/10 text-teal-600 dark:text-teal-400',
    }
  ];

  return (
    <div className="org-landing-container" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'hsl(var(--text-primary))', marginBottom: '8px' }}>
          Organization Structure Directory
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'hsl(var(--text-secondary))', maxWidth: '800px' }}>
          Welcome to the enterprise organization setup directory. Select any submodule to manage setups, locations, teams, roles, reporting lines, and workforce requests.
        </p>
      </div>

      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '24px' 
        }}
      >
        {cards.map(card => (
          <div 
            key={card.id}
            onClick={() => navigate(card.route)}
            className="emp-card hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid hsl(var(--border))',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '200px',
              background: 'hsl(var(--bg-card))',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div>
              <div 
                className={`bg-gradient-to-br ${card.color}`} 
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '14px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  marginBottom: '20px'
                }}
              >
                <i className={`fa-solid ${card.icon}`}></i>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'hsl(var(--text-primary))', marginBottom: '8px' }}>
                {card.title}
              </h3>
              
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>
                {card.description}
              </p>
            </div>

            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                color: 'hsl(var(--primary))', 
                marginTop: '16px' 
              }}
            >
              <span>Manage Setup</span>
              <i className="fa-solid fa-arrow-right-long" style={{ transition: 'transform 0.2s' }}></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrgLandingDashboard;
