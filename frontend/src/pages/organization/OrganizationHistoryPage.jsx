import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import { OrganizationToolbar, SearchFilterBar } from './components/SharedComponents';

const OrganizationHistoryPage = () => {
  const {
    reportingHistory,
    transferHistory,
    designationHistory,
    fetchReportingHistory,
    fetchTransferHistory,
    fetchDesignationHistory
  } = useContext(DataContext);

  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline', 'managers', 'transfers', 'designations'
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchReportingHistory();
    fetchTransferHistory();
    fetchDesignationHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Seed fallback demo data if backend arrays are empty to assist presentation
  const finalReportingHistory = reportingHistory.length > 0 ? reportingHistory : [
    {
      _id: 'demo-rep-1',
      employeeId: 'EMP001',
      employeeName: 'Jane Smith',
      oldManagerId: 'David Lee (MGR004)',
      newManagerId: 'Sarah Connor (MGR001)',
      reason: 'Department restructuring for alignment',
      effectiveDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'demo-rep-2',
      employeeId: 'EMP014',
      employeeName: 'Alex Mercer',
      oldManagerId: 'Sarah Connor (MGR001)',
      newManagerId: 'Elena Rostova (MGR003)',
      reason: 'Project delegation expansion',
      effectiveDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const finalTransferHistory = transferHistory.length > 0 ? transferHistory : [
    {
      _id: 'demo-tf-1',
      employeeId: 'EMP001',
      employeeName: 'Jane Smith',
      oldDept: 'Marketing',
      newDept: 'Product Engineering',
      reason: 'Strategic reassignment to core product line',
      effectiveDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'demo-tf-2',
      employeeId: 'EMP009',
      employeeName: 'John Doe',
      oldDept: 'Sales Support',
      newDept: 'Customer Experience',
      reason: 'Internal support function consolidation',
      effectiveDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const finalDesignationHistory = designationHistory && designationHistory.length > 0 ? designationHistory : [
    {
      _id: 'demo-desg-1',
      employeeId: 'EMP001',
      employeeName: 'Jane Smith',
      oldDesignation: 'Senior Developer',
      newDesignation: 'Product Lead Manager',
      reason: 'Annual Performance Appraisal Promotion',
      effectiveDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'demo-desg-2',
      employeeId: 'EMP005',
      employeeName: 'Ryan Reynolds',
      oldDesignation: 'HR Coordinator',
      newDesignation: 'Talent Acquisition Manager',
      reason: 'Role scope expansion',
      effectiveDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Normalize timelines
  const normalizedManagers = finalReportingHistory.map(h => ({
    id: h._id || Math.random().toString(),
    employeeId: h.employeeId,
    employeeName: h.employeeName,
    type: 'Reporting Manager Shift',
    desc: `Manager reassignment: ${h.oldManagerId || 'None'} ➔ ${h.newManagerId || 'None'}`,
    details: {
      from: h.oldManagerId || 'None',
      to: h.newManagerId || 'None',
      label: 'Manager'
    },
    reason: h.reason || 'Restructuring',
    date: new Date(h.effectiveDate || h.createdAt),
    icon: 'fa-user-tie',
    color: '#3b82f6'
  }));

  const normalizedTransfers = finalTransferHistory.map(t => ({
    id: t._id || Math.random().toString(),
    employeeId: t.employeeId,
    employeeName: t.employeeName,
    type: 'Department Transfer',
    desc: `Department transfer: ${t.oldDept || 'None'} ➔ ${t.newDept || 'None'}`,
    details: {
      from: t.oldDept || 'None',
      to: t.newDept || 'None',
      label: 'Department'
    },
    reason: t.reason || 'Role realignment',
    date: new Date(t.effectiveDate || t.createdAt),
    icon: 'fa-exchange-alt',
    color: '#8b5cf6'
  }));

  const normalizedDesignations = finalDesignationHistory.map(d => ({
    id: d._id || Math.random().toString(),
    employeeId: d.employeeId,
    employeeName: d.employeeName,
    type: 'Designation Change',
    desc: `Designation update: ${d.oldDesignation || 'None'} ➔ ${d.newDesignation || 'None'}`,
    details: {
      from: d.oldDesignation || 'None',
      to: d.newDesignation || 'None',
      label: 'Designation'
    },
    reason: d.reason || 'Promotion',
    date: new Date(d.effectiveDate || d.createdAt),
    icon: 'fa-id-badge',
    color: '#10b981'
  }));

  // Combine for timeline
  const combinedList = [...normalizedManagers, ...normalizedTransfers, ...normalizedDesignations].sort((a, b) => b.date - a.date);

  // Filters mapping helper
  const filterRecord = (item) => {
    const matchesSearch = 
      item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || item.date.toISOString().split('T')[0] === dateFilter;
    return matchesSearch && matchesDate;
  };

  const getFilteredList = () => {
    switch (activeTab) {
      case 'managers':
        return normalizedManagers.filter(filterRecord);
      case 'transfers':
        return normalizedTransfers.filter(filterRecord);
      case 'designations':
        return normalizedDesignations.filter(filterRecord);
      case 'timeline':
      default:
        return combinedList.filter(filterRecord);
    }
  };

  const currentList = getFilteredList();

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = ['Date', 'Employee ID', 'Employee Name', 'Audit Event', 'Description', 'Reason'];
    const rows = currentList.map(h => [
      h.date.toLocaleDateString(),
      h.employeeId,
      h.employeeName,
      h.type,
      h.desc,
      h.reason
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Organization_History_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <OrganizationToolbar 
        title="Organization Audit History" 
        description="Unified historical logs: inspect manager reassignments, designation updates, and department transfers."
        actions={[{ label: 'Export Selection', icon: 'fa-file-export', onClick: handleExportCSV }]}
      />

      {/* Interactive Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid hsl(var(--border))', gap: '20px' }}>
        {[
          { id: 'timeline', label: 'Chronological Timeline', count: combinedList.length, color: '#3b82f6' },
          { id: 'managers', label: 'Manager Reassignments', count: normalizedManagers.length, color: '#8b5cf6' },
          { id: 'transfers', label: 'Department Transfers', count: normalizedTransfers.length, color: '#10b981' },
          { id: 'designations', label: 'Designations & Band shifts', count: normalizedDesignations.length, color: '#ec4899' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 6px',
              fontSize: '0.85rem',
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid hsl(var(--primary))' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{tab.label}</span>
            <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '10px', background: `${tab.color}15`, color: tab.color, fontWeight: 700 }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div className="nav-search" style={{ margin: 0, width: '100%' }}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <input 
              type="text" 
              placeholder="Search by employee name, ID, or change notes..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>Filter Date:</span>
          <input 
            type="date" 
            className="form-control" 
            style={{ width: '170px', height: '38px', padding: '0 12px' }} 
            value={dateFilter} 
            onChange={e => setDateFilter(e.target.value)} 
          />
        </div>
      </div>

      {/* Tab Panel Renderings */}
      {activeTab === 'timeline' ? (
        <div className="emp-card" style={{ padding: '24px', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 24px 0' }}>Audit Trail Timeline</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', paddingLeft: '32px' }}>
            {currentList.length > 0 ? (
              <>
                <div style={{ position: 'absolute', left: '11px', top: '12px', bottom: '12px', width: '2px', background: 'hsl(var(--border))' }}></div>
                {currentList.map((item) => (
                  <div key={item.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div 
                      style={{ 
                        position: 'absolute', 
                        left: '-28px', 
                        top: '2px', 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        background: 'hsl(var(--bg-card))', 
                        border: `2px solid ${item.color}`, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: item.color,
                        fontSize: '0.7rem',
                        zIndex: 2
                      }}
                    >
                      <i className={`fa-solid ${item.icon}`}></i>
                    </div>

                    <div style={{ background: 'hsl(var(--bg-main))', border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '14px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: 'hsl(var(--text-primary))' }}>{item.employeeName} ({item.employeeId})</strong>
                          <span className="badge" style={{ marginLeft: '8px', fontSize: '0.65rem', background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}30` }}>
                            {item.type}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>
                          {item.date.toLocaleDateString()}
                        </span>
                      </div>

                      <div style={{ margin: '8px 0', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700, color: 'hsl(var(--text-secondary))', width: '90px' }}>
                          {item.details.label} Shift:
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ textDecoration: 'line-through', opacity: 0.65 }}>{item.details.from}</span>
                          <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.7rem' }}></i>
                          <strong style={{ color: 'hsl(var(--primary))' }}>{item.details.to}</strong>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', fontStyle: 'italic', borderTop: '1px dashed hsl(var(--border))', paddingTop: '6px', marginTop: '6px' }}>
                        Reason for modification: {item.reason}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                No chronological logs matched selection filters.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Table Grid View for structured logs */
        <div className="emp-card" style={{ padding: '24px', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px' }}>Effective Date</th>
                  <th style={{ padding: '12px' }}>Employee Name</th>
                  <th style={{ padding: '12px' }}>Employee ID</th>
                  <th style={{ padding: '12px' }}>Old Value</th>
                  <th style={{ padding: '12px' }}>New Value</th>
                  <th style={{ padding: '12px' }}>Change Reason</th>
                </tr>
              </thead>
              <tbody>
                {currentList.length > 0 ? (
                  currentList.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.88rem' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{item.date.toLocaleDateString()}</td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{item.employeeName}</td>
                      <td style={{ padding: '12px' }}>{item.employeeId}</td>
                      <td style={{ padding: '12px', textDecoration: 'line-through', opacity: 0.65 }}>{item.details.from}</td>
                      <td style={{ padding: '12px', color: 'hsl(var(--primary))', fontWeight: 700 }}>{item.details.to}</td>
                      <td style={{ padding: '12px', fontStyle: 'italic' }}>{item.reason}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px 0', color: 'hsl(var(--text-secondary))' }}>
                      No record details matched search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrganizationHistoryPage;
