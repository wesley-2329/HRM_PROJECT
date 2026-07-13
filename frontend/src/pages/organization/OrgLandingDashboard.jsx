import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import { KPIStatCard, OrganizationToolbar } from './components/SharedComponents';

const OrgLandingDashboard = ({ mode }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    companies,
    branches,
    departments,
    designations,
    employees,
    positions,
    vacancies,
    reportingHistory,
    transferHistory,
    fetchCompanies,
    fetchBranches,
    fetchDepartments,
    fetchDesignations,
    fetchEmployees,
    fetchPositions,
    fetchVacancies,
    fetchReportingHistory,
    fetchTransferHistory
  } = useContext(DataContext);

  useEffect(() => {
    fetchCompanies();
    fetchBranches();
    fetchDepartments();
    fetchDesignations();
    fetchEmployees();
    fetchPositions();
    fetchVacancies();
    fetchReportingHistory();
    fetchTransferHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute Stats
  const totalCompanies = companies.length || 1;
  const totalBranches = branches.length;
  const totalDepts = departments.length;
  const totalDesgs = designations.length;
  const totalEmps = employees.length;
  const totalManagers = employees.filter(e => e.isTeamLead || employees.some(x => x.teamLeadId === e.id)).length;
  const vacantPositions = positions.filter(p => p.status === 'Vacant' || p.status === 'Open').length;
  const pendingApprovals = vacancies.filter(v => v.status === 'Pending Approval' || v.status === 'Pending').length;

  // Department Distribution
  const deptDistribution = departments.map(d => {
    const count = employees.filter(e => e.dept === d.name).length;
    return { name: d.name, count };
  }).sort((a, b) => b.count - a.count).slice(0, 5);

  // Designation Distribution
  const desgDistribution = designations.map(d => {
    const count = employees.filter(e => e.designation === d.name).length;
    return { name: d.name, count };
  }).sort((a, b) => b.count - a.count).slice(0, 5);

  // Recent Activities
  const recentActivities = [
    ...reportingHistory.map(h => ({
      id: h._id,
      title: 'Reporting Shift',
      desc: `${h.employeeName} (${h.employeeId}) reassigned to manager ${h.newManagerId || 'None'}`,
      date: new Date(h.effectiveDate || h.createdAt),
      icon: 'fa-user-tie',
      color: '#3b82f6'
    })),
    ...transferHistory.map(t => ({
      id: t._id,
      title: 'Dept Transfer',
      desc: `${t.employeeName} (${t.employeeId}) transferred to ${t.newDept}`,
      date: new Date(t.effectiveDate || t.createdAt),
      icon: 'fa-exchange-alt',
      color: '#8b5cf6'
    }))
  ].sort((a, b) => b.date - a.date).slice(0, 5);

  // Quick Action Handler helper
  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Employee Name', 'Department', 'Designation', 'Primary Manager'];
    const rows = employees.map(emp => [
      emp.id,
      emp.name,
      emp.dept || 'N/A',
      emp.designation || 'N/A',
      emp.teamLeadId || 'None'
    ]);
    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Enterprise_Org_Structure_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const headerActions = [
    { label: 'Export Structure', icon: 'fa-file-export', onClick: handleExportCSV },
    { label: 'Interactive Chart', icon: 'fa-network-wired', onClick: () => navigate('/organization/org-chart'), primary: true }
  ];

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <OrganizationToolbar
        title="Organization Dashboard"
        description="Real-time visual insights, workforce statistics, active headcount tracking, and quick setup configurations."
        actions={headerActions}
      />

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {[
          { label: 'Total Companies', value: totalCompanies, icon: 'fa-building', color: '#3b82f6', route: '/organization/company' },
          { label: 'Total Branches', value: totalBranches, icon: 'fa-map-location-dot', color: '#06b6d4', route: '/organization/branches' },
          { label: 'Total Departments', value: totalDepts, icon: 'fa-folder-tree', color: '#8b5cf6', route: '/organization/departments' },
          { label: 'Total Designations', value: totalDesgs, icon: 'fa-id-badge', color: '#f59e0b', route: '/organization/designations' },
          { label: 'Total Employees', value: totalEmps, icon: 'fa-users', color: '#10b981', route: '/organization/reporting-structure' },
          { label: 'Total Managers', value: totalManagers, icon: 'fa-user-tie', color: '#ec4899', route: '/organization/span-of-control' },
          { label: 'Vacant Positions', value: vacantPositions, icon: 'fa-chair', color: '#ef4444', route: '/organization/vacancy-mapping' },
          { label: 'Pending Approvals', value: pendingApprovals, icon: 'fa-circle-check', color: '#64748b', route: '/organization/vacancy-mapping' },
        ].map((stat, idx) => (
          <KPIStatCard
            key={idx}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            onClick={() => navigate(stat.route)}
          />
        ))}
      </div>

      {/* Main Panel: Charts & Activities Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '24px', flexWrap: 'wrap' }}>

        {/* Analytics Distribution Graphs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <div className="emp-card" style={{ padding: '24px', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'hsl(var(--text-primary))' }}>
              <i className="fa-solid fa-chart-simple" style={{ color: 'hsl(var(--primary))' }}></i>
              <span>Department Distribution & Staff Strength</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {deptDistribution.length > 0 ? deptDistribution.map((item, index) => {
                const maxCount = Math.max(...deptDistribution.map(d => d.count)) || 1;
                const percentage = (item.count / maxCount) * 100;
                return (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600, color: 'hsl(var(--text-primary))' }}>{item.name}</span>
                      <strong style={{ color: 'hsl(var(--primary))' }}>{item.count} Employee{item.count !== 1 ? 's' : ''}</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'hsl(var(--bg-main))', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, hsl(var(--primary)), #8b5cf6)', borderRadius: '4px', transition: 'width 1s ease-out' }}></div>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>No department statistics available.</div>
              )}
            </div>
          </div>

          <div className="emp-card" style={{ padding: '24px', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'hsl(var(--text-primary))' }}>
              <i className="fa-solid fa-chart-pie" style={{ color: 'hsl(var(--primary))' }}></i>
              <span>Designation Headcount Distribution</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {desgDistribution.length > 0 ? desgDistribution.map((item, index) => {
                const maxCount = Math.max(...desgDistribution.map(d => d.count)) || 1;
                const percentage = (item.count / maxCount) * 100;
                return (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600, color: 'hsl(var(--text-primary))' }}>{item.name}</span>
                      <strong style={{ color: 'hsl(var(--primary))' }}>{item.count} Position{item.count !== 1 ? 's' : ''} Filled</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'hsl(var(--bg-main))', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #06b6d4)', borderRadius: '4px', transition: 'width 1s ease-out' }}></div>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>No designation statistics available.</div>
              )}
            </div>
          </div>

        </div>

        {/* Quick Links & Chronological activities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Quick Actions Panel */}
          <div className="emp-card" style={{ padding: '24px', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px 0', color: 'hsl(var(--text-primary))' }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              {[
                { label: 'Add Company Profile', route: '/organization/company', icon: 'fa-building' },
                { label: 'Register Branch Office', route: '/organization/branches', icon: 'fa-map-location-dot' },
                { label: 'Create Department', route: '/organization/departments', icon: 'fa-folder-tree' },
                { label: 'Map Designation Settings', route: '/organization/designations', icon: 'fa-id-badge' },
                { label: 'Assign Reporting Manager', route: '/organization/reporting-structure', icon: 'fa-sitemap' }
              ].map((act, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(act.route)}
                  className="btn btn-secondary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', fontSize: '0.85rem', textAlign: 'left', justifyContent: 'flex-start' }}
                >
                  <i className={`fa-solid ${act.icon}`} style={{ color: 'hsl(var(--primary))', width: '16px' }}></i>
                  <span>{act.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chronological changes log feed */}
          <div className="emp-card" style={{ padding: '24px', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', flex: 1 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px 0', color: 'hsl(var(--text-primary))' }}>Recent Organization Movements</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
              {recentActivities.length > 0 ? recentActivities.map((act) => (
                <div key={act.id} style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${act.color}15`, color: act.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`fa-solid ${act.icon}`} style={{ fontSize: '0.75rem' }}></i>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: 'hsl(var(--text-primary))' }}>{act.title}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))' }}>{act.date.toLocaleDateString()}</span>
                    </div>
                    <p style={{ margin: '4px 0 0 0', color: 'hsl(var(--text-secondary))', lineHeight: '1.3' }}>{act.desc}</p>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>No recent activities logged.</div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default OrgLandingDashboard;
