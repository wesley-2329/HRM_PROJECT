import React from 'react';
import { useLocation } from 'react-router-dom';
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

const OrgStructure = ({ mode }) => {
  const location = useLocation();
  const path = location.pathname;

  if (path === '/organization' || path === '/organization/') {
    return <OrgLandingDashboard mode={mode} />;
  }
  if (path.startsWith('/organization/company')) {
    return <CompanySetupPage mode={mode} />;
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
  if (path.startsWith('/organization/org-chart')) {
    return <OrgChartPage mode={mode} />;
  }
  if (path.startsWith('/organization/reporting-matrix')) {
    return <ReportingMatrixPage mode={mode} />;
  }
  if (path.startsWith('/organization/transfers')) {
    return <TransfersPage mode={mode} />;
  }
  if (path.startsWith('/organization/manpower-planning')) {
    return <ManpowerPlanningPage mode={mode} />;
  }

  return <OrgLandingDashboard mode={mode} />;
};

export default OrgStructure;
