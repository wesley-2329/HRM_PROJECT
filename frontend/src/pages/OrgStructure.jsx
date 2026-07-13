import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OrgLandingDashboard from './organization/OrgLandingDashboard';
import CompanySetupPage from './organization/CompanySetupPage';
import LegalEntitiesPage from './organization/LegalEntitiesPage';
import BusinessUnitsPage from './organization/BusinessUnitsPage';
import BranchesPage from './organization/BranchesPage';
import DepartmentsPage from './organization/DepartmentsPage';
import TeamsPage from './organization/TeamsPage';
import DesignationsPage from './organization/DesignationsPage';
import PositionsPage from './organization/PositionsPage';
import OrgChartPage from './organization/OrgChartPage';
import ReportingMatrixPage from './organization/ReportingMatrixPage';
import TransfersPage from './organization/TransfersPage';
import ManpowerPlanningPage from './organization/ManpowerPlanningPage';
import VacancyMappingPage from './organization/VacancyMappingPage';
import ReportingStructurePage from './organization/ReportingStructurePage';
import SpanOfControlPage from './organization/SpanOfControlPage';
import OrganizationHistoryPage from './organization/OrganizationHistoryPage';
import CompanyHierarchyLanding from './organization/CompanyHierarchyLanding';
import DepartmentStructureLanding from './organization/DepartmentStructureLanding';
import DepartmentEmployeeMappingPage from './organization/DepartmentEmployeeMappingPage';
import DepartmentHistoryPage from './organization/DepartmentHistoryPage';
import ReportingManagerMatrixLanding from './organization/ReportingManagerMatrixLanding';
import SpanOfControlLanding from './organization/SpanOfControlLanding';
import VacancyMappingLanding from './organization/VacancyMappingLanding';
import OrgStructureDashboard from './organization/OrgStructureDashboard';

const OrgStructure = ({ mode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Reorganized Sidebar Menu
  const menuSections = [
    {
      title: 'General Overview',
      items: [
        { label: 'Dashboard', path: '/organization', icon: 'fa-gauge-high' }
      ]
    },
    {
      title: 'Hierarchy Setup',
      items: [
        { label: 'Company Hierarchy', path: '/organization/company-hierarchy', icon: 'fa-cubes' },
        { label: 'Department Structure', path: '/organization/department-structure', icon: 'fa-folder-tree' }
      ]
    },
    {
      title: 'Management & Control',
      items: [
        { label: 'Reporting Manager Matrix', path: '/organization/reporting-matrix', icon: 'fa-people-arrows' },
        { label: 'Span of Control', path: '/organization/span-of-control', icon: 'fa-users-viewfinder' },
        { label: 'Vacancy Mapping', path: '/organization/vacancy-mapping', icon: 'fa-user-plus' }
      ]
    },
    {
      title: 'Audit & Records',
      items: [
        { label: 'Organization History', path: '/organization/history', icon: 'fa-clock-rotate-left' }
      ]
    }
  ];

  // Helper to determine the active page component
  const renderActivePage = () => {
    if (path === '/organization' || path === '/organization/') {
      return <OrgLandingDashboard mode={mode} />;
    }
    if (path.startsWith('/organization/structure-dashboard')) {
      return <OrgStructureDashboard mode={mode} />;
    }
    if (path.startsWith('/organization/company-hierarchy') || path.startsWith('/organization/company-setup')) {
      return <CompanyHierarchyLanding mode={mode} />;
    }
    if (path.startsWith('/organization/company')) {
      return <CompanySetupPage mode={mode} />;
    }
    if (path.startsWith('/organization/department-structure/mapping')) {
      return <DepartmentEmployeeMappingPage mode={mode} />;
    }
    if (path.startsWith('/organization/department-structure/history')) {
      return <DepartmentHistoryPage mode={mode} />;
    }
    if (path.startsWith('/organization/department-structure')) {
      return <DepartmentStructureLanding mode={mode} />;
    }
    if (path.startsWith('/organization/vacancy-mapping/setup')) {
      return <VacancyMappingPage mode={mode} />;
    }
    if (path.startsWith('/organization/vacancy-mapping')) {
      return <VacancyMappingLanding mode={mode} />;
    }
    if (path.startsWith('/organization/legal-entities')) {
      return <LegalEntitiesPage mode={mode} />;
    }
    if (path.startsWith('/organization/business-units')) {
      return <BusinessUnitsPage mode={mode} />;
    }
    if (path.startsWith('/organization/branches')) {
      return <BranchesPage mode={mode} />;
    }
    if (path.startsWith('/organization/departments')) {
      return <DepartmentsPage mode={mode} />;
    }
    if (path.startsWith('/organization/teams')) {
      return <TeamsPage mode={mode} />;
    }
    if (path.startsWith('/organization/designations')) {
      return <DesignationsPage mode={mode} />;
    }
    if (path.startsWith('/organization/positions')) {
      return <PositionsPage mode={mode} />;
    }
    if (path.startsWith('/organization/reporting-structure')) {
      return <ReportingStructurePage mode={mode} />;
    }
    if (path.startsWith('/organization/org-chart')) {
      return <OrgChartPage mode={mode} />;
    }
    if (path.startsWith('/organization/reporting-matrix/setup')) {
      return <ReportingMatrixPage mode={mode} />;
    }
    if (path.startsWith('/organization/reporting-matrix')) {
      return <ReportingManagerMatrixLanding mode={mode} />;
    }
    if (path.startsWith('/organization/span-of-control/details')) {
      return <SpanOfControlPage mode={mode} />;
    }
    if (path.startsWith('/organization/span-of-control')) {
      return <SpanOfControlLanding mode={mode} />;
    }
    if (path.startsWith('/organization/history')) {
      return <OrganizationHistoryPage mode={mode} />;
    }
    if (path.startsWith('/organization/transfers')) {
      return <TransfersPage mode={mode} />;
    }
    if (path.startsWith('/organization/manpower-planning')) {
      return <ManpowerPlanningPage mode={mode} />;
    }
    return <OrgLandingDashboard mode={mode} />;
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', background: 'hsl(var(--bg-main))' }}>
      {/* Persistent Sub-Navigation Sidebar */}
      <div 
        style={{ 
          width: '260px', 
          background: 'hsl(var(--bg-card))', 
          borderRight: '1px solid hsl(var(--border))', 
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflowY: 'auto',
          flexShrink: 0,
          position: 'sticky',
          top: '64px',
          height: 'calc(100vh - 64px)',
          zIndex: 10
        }}
      >
        <div style={{ padding: '0 8px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-layer-group"></i>
            <span>Org Structure Hub</span>
          </h4>
          <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', display: 'block', marginTop: '4px' }}>Unified Setup & Controls</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
          {menuSections.map((sec, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--text-secondary))', letterSpacing: '0.05em', padding: '0 8px', marginBottom: '4px' }}>
                {sec.title}
              </span>
              {sec.items.map((item, itemIdx) => {
                // Determine active status: company-hierarchy handles all the submodules
                let isActive = false;
                if (item.path === '/organization') {
                  isActive = path === '/organization' || path === '/organization/';
                } else if (item.path === '/organization/company-hierarchy') {
                  isActive = path.startsWith('/organization/company-hierarchy') ||
                             path.startsWith('/organization/company-setup') ||
                             path.startsWith('/organization/company') ||
                             path.startsWith('/organization/branches') ||
                             path.startsWith('/organization/designations') ||
                             path.startsWith('/organization/reporting-structure');
                } else if (item.path === '/organization/department-structure') {
                  isActive = path.startsWith('/organization/department-structure') ||
                             path.startsWith('/organization/departments') ||
                             path.startsWith('/organization/org-chart');
                } else {
                  isActive = path.startsWith(item.path);
                }

                return (
                  <button
                    key={itemIdx}
                    onClick={() => navigate(item.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      background: isActive ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                      border: 'none',
                      color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-primary))',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 700 : 500,
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      outline: 'none',
                      width: '100%'
                    }}
                  >
                    <i className={`fa-solid ${item.icon}`} style={{ width: '16px', fontSize: '0.85rem', color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))' }}></i>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Right Content Panel */}
      <div style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        {renderActivePage()}
      </div>
    </div>
  );
};

export default OrgStructure;
