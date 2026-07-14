import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import { OrganizationToolbar, SearchFilterBar, DataTable, EmptyState } from './components/SharedComponents';

const DepartmentHistoryPage = () => {
  const {
    departments,
    transferHistory,
    fetchDepartments,
    fetchTransferHistory
  } = useContext(DataContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline', 'transfers', 'creations'

  useEffect(() => {
    fetchDepartments();
    fetchTransferHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1. Construct creation events
  const creationEvents = departments.map(d => ({
    id: d._id,
    code: d.code,
    name: d.name,
    parentDept: d.parentDept || 'Root / None',
    location: d.location || 'HQ',
    costCenter: d.costCenter || 'N/A',
    date: new Date(d.createdAt || new Date())
  })).sort((a, b) => b.date - a.date);

  // 2. Construct transfers list
  const transferEvents = transferHistory.map(t => ({
    id: t._id,
    employeeId: t.employeeId,
    employeeName: t.employeeName,
    oldDept: t.oldDept || 'Unassigned',
    newDept: t.newDept,
    date: new Date(t.effectiveDate || t.createdAt),
    reason: t.reason || 'Structural realignment'
  })).sort((a, b) => b.date - a.date);

  // 3. Consolidated Timeline Events
  const timelineEvents = [
    ...creationEvents.map(c => ({
      id: `setup-${c.id}`,
      type: 'Setup',
      title: `${c.name} (${c.code}) Registered`,
      desc: `Department added under parent: ${c.parentDept}, Location: ${c.location}, Cost Center: ${c.costCenter}.`,
      date: c.date,
      icon: 'fa-folder-plus',
      color: '#3b82f6',
      reason: 'Initial setup'
    })),
    ...transferEvents.map(t => ({
      id: `trans-${t.id}`,
      type: 'Transfer',
      title: `${t.employeeName} Transferred`,
      desc: `Moved department: ${t.oldDept} ➔ ${t.newDept}.`,
      date: t.date,
      icon: 'fa-exchange-alt',
      color: '#8b5cf6',
      reason: t.reason
    }))
  ].sort((a, b) => b.date - a.date);

  // Filters based on tab and search term
  const getFilteredData = () => {
    if (activeTab === 'timeline') {
      return timelineEvents.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (activeTab === 'transfers') {
      return transferEvents.filter(t => 
        t.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.oldDept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.newDept.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (activeTab === 'creations') {
      return creationEvents.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return [];
  };

  const currentList = getFilteredData();

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <OrganizationToolbar 
        title="Department History & Audit"
        description="Unified historical logs of department setup creations, HOD manager adjustments, and employee transfers."
      />

      {/* Tabs Selector Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid hsl(var(--border))', gap: '8px' }}>
        {[
          { id: 'timeline', label: 'Chronological Timeline', icon: 'fa-timeline' },
          { id: 'transfers', label: 'Employee Transfers Log', icon: 'fa-right-from-bracket' },
          { id: 'creations', label: 'Department Registrations', icon: 'fa-folder-tree' }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid hsl(var(--primary))' : '3px solid transparent',
                color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.88rem',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              <i className={`fa-solid ${tab.icon}`} style={{ fontSize: '0.9rem' }}></i>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <SearchFilterBar 
        placeholder="Filter records..."
        searchValue={searchTerm}
        onSearchChange={e => setSearchTerm(e.target.value)}
      />

      <div className="emp-card" style={{ padding: '24px', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}>
        
        {/* Render Tab Content */}
        {activeTab === 'timeline' && (
          <div>
            {currentList.length === 0 ? (
              <EmptyState message="No timeline logs found matching criteria." icon="fa-timeline" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '32px' }}>
                <div style={{ position: 'absolute', left: '12px', top: '8px', bottom: '8px', width: '2px', background: 'hsl(var(--border))' }}></div>
                {currentList.map(item => (
                  <div key={item.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div 
                      style={{ 
                        position: 'absolute', 
                        left: '-32px', 
                        top: '2px', 
                        width: '26px', 
                        height: '26px', 
                        borderRadius: '50%', 
                        background: `${item.color}15`, 
                        color: item.color, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        border: `1.5px solid ${item.color}`
                      }}
                    >
                      <i className={`fa-solid ${item.icon}`}></i>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'hsl(var(--text-primary))', margin: 0 }}>
                        {item.title}
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                        {item.date.toLocaleDateString()} {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>
                      {item.desc}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', opacity: 0.8 }}>
                      <i className="fa-solid fa-note-sticky" style={{ opacity: 0.5 }}></i>
                      <span>Reason: {item.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'transfers' && (
          <div>
            {currentList.length === 0 ? (
              <EmptyState message="No employee department transfers logged." icon="fa-right-from-bracket" />
            ) : (
              <DataTable 
                headers={['Transfer Date', 'Employee Name & ID', 'Old Department', 'New Department', 'Reason']}
                rows={currentList}
                renderRow={(t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.9rem' }}>
                    <td style={{ padding: '14px 12px' }}>
                      {t.date.toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: 600 }}>
                      {t.employeeName} <span style={{ fontWeight: 400, opacity: 0.6, fontSize: '0.78rem' }}>(ID: {t.employeeId})</span>
                    </td>
                    <td style={{ padding: '14px 12px', color: 'hsl(var(--text-secondary))' }}>
                      {t.oldDept}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span className="badge badge-success" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 600 }}>
                        {t.newDept}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', fontSize: '0.82rem', color: 'hsl(var(--text-secondary))' }}>
                      {t.reason}
                    </td>
                  </tr>
                )}
              />
            )}
          </div>
        )}

        {activeTab === 'creations' && (
          <div>
            {currentList.length === 0 ? (
              <EmptyState message="No registered departments logged." icon="fa-folder-tree" />
            ) : (
              <DataTable 
                headers={['Registration Date', 'Code', 'Department Name', 'Parent Department', 'Location', 'Cost Center']}
                rows={currentList}
                renderRow={(c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.9rem' }}>
                    <td style={{ padding: '14px 12px' }}>
                      {c.date.toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 12px', fontFamily: 'monospace' }}>
                      {c.code}
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: 600 }}>
                      {c.name}
                    </td>
                    <td style={{ padding: '14px 12px', color: 'hsl(var(--text-secondary))' }}>
                      {c.parentDept}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      {c.location}
                    </td>
                    <td style={{ padding: '14px 12px', color: 'hsl(var(--text-secondary))' }}>
                      {c.costCenter}
                    </td>
                  </tr>
                )}
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default DepartmentHistoryPage;
