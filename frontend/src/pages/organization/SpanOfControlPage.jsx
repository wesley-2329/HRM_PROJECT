import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { OrganizationToolbar } from './components/SharedComponents';
import api from '../../api';

const SpanOfControlPage = ({ mode }) => {
  const {
    employees,
    departments,
    fetchEmployees,
    fetchDepartments
  } = useContext(DataContext);

  const { showToast } = useToast();
  const [spanList, setSpanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');
  const [viewMode, setViewMode] = useState('dept'); // 'list' or 'dept'
  const [expandedManagers, setExpandedManagers] = useState({});

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchSpanData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSpanData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/org/span-of-control');
      setSpanList(res.data || []);
    } catch (err) {
      console.error(err);
      showToast('Error loading Span of Control data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (mgr) => {
    return mgr.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(mgr.name)}`;
  };

  const toggleExpand = (id) => {
    setExpandedManagers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculations for dashboard metrics
  const totalManagers = spanList.length;
  const avgDirectSpan = totalManagers 
    ? (spanList.reduce((sum, m) => sum + m.directCount, 0) / totalManagers).toFixed(1) 
    : 0;
  const maxDirectSpan = spanList.length 
    ? Math.max(...spanList.map(m => m.directCount)) 
    : 0;
  const minDirectSpan = spanList.length 
    ? Math.min(...spanList.map(m => m.directCount)) 
    : 0;

  // Filtered List
  const filteredList = spanList.filter(s => selectedDept === 'All' || s.dept === selectedDept);

  // Grouped by department
  const groupedManagers = {};
  filteredList.forEach(s => {
    const dName = s.dept || 'Unassigned';
    if (!groupedManagers[dName]) groupedManagers[dName] = [];
    groupedManagers[dName].push(s);
  });

  // Organizational recommendations based on direct span count
  const recommendations = spanList.map(mgr => {
    if (mgr.directCount > 8) {
      return {
        manager: mgr.name,
        dept: mgr.dept,
        count: mgr.directCount,
        type: 'danger',
        message: 'High direct span. Suggest delegating/creating sub-lead roles to reduce communication bottleneck.'
      };
    }
    if (mgr.directCount > 0 && mgr.directCount < 3) {
      return {
        manager: mgr.name,
        dept: mgr.dept,
        count: mgr.directCount,
        type: 'warning',
        message: 'Low direct span. Potential under-utilization of manager capacity. Evaluate structural integration.'
      };
    }
    return null;
  }).filter(Boolean);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <OrganizationToolbar 
        title="Span of Control Analytics" 
        description="Inspect manager reportees counts, structural levels, heat map metrics, and organizational recommendations."
      />

      {/* Analytics Dashboard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Total Managers', value: totalManagers, icon: 'fa-user-tie', color: 'hsl(var(--primary))' },
          { label: 'Average Direct Span', value: `${avgDirectSpan} reportees`, icon: 'fa-users', color: '#10b981' },
          { label: 'Maximum Direct Span', value: `${maxDirectSpan} reportees`, icon: 'fa-arrow-trend-up', color: '#f43f5e' },
          { label: 'Minimum Direct Span', value: `${minDirectSpan} reportees`, icon: 'fa-arrow-trend-down', color: '#f59e0b' },
          { label: 'Anomalies Identified', value: `${recommendations.length} cases`, icon: 'fa-triangle-exclamation', color: '#ef4444' }
        ].map((stat, idx) => (
          <div key={idx} style={{ background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
              <i className={`fa-solid ${stat.icon}`}></i>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', display: 'block', fontWeight: 600 }}>{stat.label}</span>
              <strong style={{ fontSize: '1.05rem', color: 'hsl(var(--text-primary))' }}>{stat.value}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and View Layout controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>Filter Department:</span>
          <select 
            className="form-control" 
            style={{ width: '200px', height: '36px', padding: '0 12px' }} 
            value={selectedDept} 
            onChange={e => setSelectedDept(e.target.value)}
          >
            <option value="All">All Departments</option>
            {departments.map(d => (
              <option key={d._id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '6px', background: 'hsl(var(--bg-main))', padding: '4px', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}>
          <button 
            className="btn" 
            style={{ padding: '6px 12px', fontSize: '0.75rem', background: viewMode === 'dept' ? 'hsl(var(--primary))' : 'transparent', color: viewMode === 'dept' ? '#fff' : 'hsl(var(--text-secondary))', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => setViewMode('dept')}
          >
            Department-wise View
          </button>
          <button 
            className="btn" 
            style={{ padding: '6px 12px', fontSize: '0.75rem', background: viewMode === 'list' ? 'hsl(var(--primary))' : 'transparent', color: viewMode === 'list' ? '#fff' : 'hsl(var(--text-secondary))', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => setViewMode('list')}
          >
            Flat List View
          </button>
        </div>
      </div>

      {/* Main Content Grid: Views & Recommendations */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Left Side: Selected View Layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-secondary))' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading manager span datasets...
            </div>
          ) : viewMode === 'list' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {filteredList.map(mgr => {
                const total = mgr.directCount + mgr.indirectCount;
                return (
                  <div key={mgr.managerId} className="emp-card" style={{ padding: '16px', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={getAvatarUrl(mgr)} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ display: 'block', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mgr.name}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))' }}>{mgr.designation || 'Manager'} • {mgr.dept}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.72rem', background: 'hsl(var(--bg-main))', padding: '8px', borderRadius: '6px' }}>
                      <div><strong>Direct:</strong> {mgr.directCount}</div>
                      <div><strong>Indirect:</strong> {mgr.indirectCount}</div>
                      <div style={{ gridColumn: '1/-1', color: 'hsl(var(--primary))', fontWeight: 600 }}>Total Span of Control: {total}</div>
                    </div>

                    {mgr.directCount > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <button className="btn btn-secondary" style={{ width: '100%', padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => toggleExpand(mgr.managerId)}>
                          <i className={`fa-solid ${expandedManagers[mgr.managerId] ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ marginRight: '6px' }}></i>
                          <span>{expandedManagers[mgr.managerId] ? 'Hide Reportees' : 'View Reportees'}</span>
                        </button>
                        {expandedManagers[mgr.managerId] && mgr.directReports && (
                          <div style={{ background: 'hsl(var(--bg-main))', border: '1px solid hsl(var(--border))', borderRadius: '6px', padding: '6px', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {mgr.directReports.map(d => (
                              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed hsl(var(--border))', paddingBottom: '2px' }}>
                                <span style={{ fontWeight: 600 }}>{d.name}</span>
                                <span style={{ color: 'hsl(var(--text-secondary))' }}>{d.role}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredList.length === 0 && (
                <div style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
                  No managers found matching search criteria.
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {Object.keys(groupedManagers).map(dName => (
                <div key={dName} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'hsl(var(--bg-card))', padding: '20px', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}>
                  <h4 style={{ margin: 0, paddingBottom: '6px', borderBottom: '2px solid hsl(var(--primary))', color: 'hsl(var(--primary))', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-folder-closed"></i>
                    <span>{dName} ({groupedManagers[dName].length} Manager{groupedManagers[dName].length !== 1 ? 's' : ''})</span>
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px', marginTop: '6px' }}>
                    {groupedManagers[dName].map(mgr => {
                      const total = mgr.directCount + mgr.indirectCount;
                      return (
                        <div key={mgr.managerId} style={{ background: 'hsl(var(--bg-main))', border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src={getAvatarUrl(mgr)} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                            <div style={{ minWidth: 0 }}>
                              <strong style={{ display: 'block', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mgr.name}</strong>
                              <span style={{ fontSize: '0.68rem', color: 'hsl(var(--text-secondary))' }}>{mgr.designation || 'Manager'}</span>
                            </div>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.7rem', background: 'hsl(var(--bg-card))', padding: '6px', borderRadius: '6px' }}>
                            <div><strong>Direct:</strong> {mgr.directCount}</div>
                            <div><strong>Indirect:</strong> {mgr.indirectCount}</div>
                            <div style={{ gridColumn: '1/-1', color: 'hsl(var(--primary))', fontWeight: 600 }}>Total Span: {total}</div>
                          </div>

                          {mgr.directCount > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <button className="btn btn-secondary" style={{ width: '100%', padding: '2px 6px', fontSize: '0.68rem' }} onClick={() => toggleExpand(mgr.managerId)}>
                                <span>{expandedManagers[mgr.managerId] ? 'Hide Reportees' : 'View Reportees'}</span>
                              </button>
                              {expandedManagers[mgr.managerId] && mgr.directReports && (
                                <div style={{ background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', padding: '6px', fontSize: '0.65rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  {mgr.directReports.map(d => (
                                    <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed hsl(var(--border))', paddingBottom: '2px' }}>
                                      <span>{d.name}</span>
                                      <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.6rem' }}>{d.role}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {Object.keys(groupedManagers).length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
                  No managers matching search criteria.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Structural recommendations insights panel */}
        <div className="emp-card" style={{ padding: '20px', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-lightbulb" style={{ color: '#f59e0b' }}></i>
            <span>Structure Insights</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recommendations.length > 0 ? recommendations.map((rec, index) => (
              <div key={index} style={{ padding: '12px', borderLeft: `3px solid ${rec.type === 'danger' ? '#ef4444' : '#f59e0b'}`, background: 'hsl(var(--bg-main))', borderRadius: '0 8px 8px 0', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>
                  <span>{rec.manager}</span>
                  <span style={{ color: rec.type === 'danger' ? '#ef4444' : '#f59e0b' }}>Span: {rec.count}</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'hsl(var(--text-secondary))', margin: '2px 0 6px 0' }}>Dept: {rec.dept}</div>
                <p style={{ margin: 0, color: 'hsl(var(--text-secondary))', lineHeight: '1.3' }}>{rec.message}</p>
              </div>
            )) : (
              <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', textAlign: 'center', padding: '16px 0' }}>
                All manager spans look balanced (between 3 and 8 direct reportees).
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default SpanOfControlPage;
