import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../../context/DataContext';
import { OrganizationToolbar } from './components/SharedComponents';

const CompanySetupLanding = ({ mode }) => {
  const navigate = useNavigate();
  const {
    branches,
    departments,
    designations,
    employees,
    fetchBranches,
    fetchDepartments,
    fetchDesignations,
    fetchEmployees
  } = useContext(DataContext);

  useEffect(() => {
    fetchBranches();
    fetchDepartments();
    fetchDesignations();
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = [
    {
      title: 'Company Setup',
      icon: 'fa-building',
      description: 'Configure corporate profiles, business type, name, codes, and operational status.',
      route: '/organization/company',
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Branch Setup',
      icon: 'fa-map-location-dot',
      description: 'Manage geographical office locations, branch codes, and assign branch heads.',
      route: '/organization/branches',
      color: 'from-teal-500/20 to-cyan-500/10 text-teal-600 dark:text-teal-400',
    },
    {
      title: 'Department Setup',
      icon: 'fa-folder-tree',
      description: 'Configure active departments, nested hierarchies, parents, and assign HOD heads.',
      route: '/organization/departments',
      color: 'from-purple-500/20 to-pink-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Designation Setup',
      icon: 'fa-id-badge',
      description: 'Define corporate designations, department mappings, grade bands, and levels.',
      route: '/organization/designations',
      color: 'from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Reporting Structure',
      icon: 'fa-sitemap',
      description: 'Preview reporting stacks, manage manager assignments, and view history timeline.',
      route: '/organization/reporting-structure',
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Organization Chart',
      icon: 'fa-network-wired',
      description: 'Explore the visual hierarchy tree, department grids, and download mappings.',
      route: '/organization/org-chart',
      color: 'from-rose-500/20 to-pink-500/10 text-rose-600 dark:text-rose-400',
    }
  ];

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <OrganizationToolbar 
        title="Company Setup & Hierarchy"
        description="Unified hub for corporate setup: edit legal entity settings, configure branches, departments, designations, reporting manager structures, and visualize the company chart."
      />

      {/* Mini dashboard banner */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {[
          { label: 'Registered Branches', value: branches.length, color: 'hsl(var(--primary))' },
          { label: 'Active Departments', value: departments.length, color: '#10b981' },
          { label: 'Staff Designations', value: designations.length, color: '#f59e0b' },
          { label: 'Total Strength', value: employees.length, color: '#ec4899' }
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

export default CompanySetupLanding;
