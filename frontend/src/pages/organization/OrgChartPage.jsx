import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { getAvatarUrl } from '../../App';
import api from '../../api';
import SubmoduleHeader from './SubmoduleHeader';

const OrgChartPage = ({ mode }) => {
  const {
    employees,
    departments,
    fetchEmployees,
    fetchDepartments
  } = useContext(DataContext);

  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const isHr = mode === 'hr' || user?.role === 'hr';
  const location = useLocation();
  const navigate = useNavigate();

  // View settings
  let chartSubView = 'hierarchy';
  if (location.pathname === '/organization/org-chart/departments') {
    chartSubView = 'department';
  } else if (location.pathname === '/organization/org-chart/span-of-control') {
    chartSubView = 'manager';
  }

  const [chartSearch, setChartSearch] = useState('');
  const [selectedNodeEmp, setSelectedNodeEmp] = useState(null);
  const [spanOfControlList, setSpanOfControlList] = useState([]);

  // Zoom / Pan states
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchSpanOfControl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSpanOfControl = async () => {
    try {
      const res = await api.get('/org/span-of-control');
      setSpanOfControlList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getEmpById = (id) => employees.find(e => e.id === id);

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Employee ID,Name,Department,Designation,Branch,Business Unit,Primary Manager,Functional Manager\n';
    
    employees.forEach(e => {
      const mgr = getEmpById(e.teamLeadId);
      const func = getEmpById(e.functionalManagerId);
      const row = `"${e.id}","${e.name}","${e.dept}","${e.designation || e.role}","${e.branch || 'None'}","${e.businessUnit || 'None'}","${mgr ? mgr.name : 'None'}","${func ? func.name : 'None'}"`;
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'TalentSphere_Organizational_Hierarchy.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Hierarchy structure CSV downloaded successfully', 'success');
  };

  // HTML5 Drag & Drop handlers to change reporting manager
  const handleDragStart = (e, empId) => {
    if (!isHr) return;
    e.dataTransfer.setData('text/plain', empId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    if (!isHr) return;
    e.preventDefault();
  };

  const handleDrop = async (e, targetEmpId) => {
    if (!isHr) return;
    e.preventDefault();
    const draggedEmpId = e.dataTransfer.getData('text/plain');
    if (!draggedEmpId || draggedEmpId === targetEmpId) return;

    const draggedEmp = getEmpById(draggedEmpId);
    const targetEmp = getEmpById(targetEmpId);

    if (!draggedEmp || !targetEmp) return;

    const confirmed = window.confirm(`Change primary reporting manager of ${draggedEmp.name} (${draggedEmpId}) to ${targetEmp.name} (${targetEmpId})?`);
    if (!confirmed) return;

    const reason = window.prompt('Please enter the reason for this reporting line change:');
    if (reason === null) return;

    try {
      await api.put('/org/reporting-manager', {
        employeeId: draggedEmpId,
        newManagerId: targetEmpId,
        reason: reason || 'Hierarchy drag & drop adjustment',
        effectiveDate: new Date().toISOString().split('T')[0]
      });
      showToast(`Reassigned reporting manager of ${draggedEmp.name}`, 'success');
      fetchEmployees();
      fetchSpanOfControl();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error reassigning reporting manager', 'error');
    }
  };

  // Zoom / Pan mouse drag listeners
  const startPan = (e) => {
    if (e.target.closest('.tree-card')) return; // ignore clicking on cards
    setIsPanning(true);
    setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const onPan = (e) => {
    if (!isPanning) return;
    setPanX(e.clientX - panStart.x);
    setPanY(e.clientY - panStart.y);
  };

  const endPan = () => {
    setIsPanning(false);
  };

  const handleZoom = (factor) => {
    setZoom(prev => Math.min(2, Math.max(0.5, prev + factor)));
  };

  const resetViewport = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  // Tree Node Renderer
  const ChartNode = ({ emp, depth = 0 }) => {
    const directs = employees.filter(e => e.teamLeadId === emp.id);
    const [isExpanded, setIsExpanded] = useState(true);
    const spanData = spanOfControlList.find(s => s.managerId === emp.id);
    const totalReports = spanData ? spanData.directCount + spanData.indirectCount : directs.length;

    const isMatch = chartSearch && (
      emp.name.toLowerCase().includes(chartSearch.toLowerCase()) ||
      (emp.designation || emp.role).toLowerCase().includes(chartSearch.toLowerCase()) ||
      emp.dept.toLowerCase().includes(chartSearch.toLowerCase())
    );

    return (
      <div style={{ marginLeft: depth > 0 ? '24px' : '0px', marginTop: '14px', position: 'relative' }}>
        <div 
          className={`tree-card ${isMatch ? 'highlight-match' : ''} ${selectedNodeEmp?.id === emp.id ? 'selected-node' : ''}`}
          onClick={() => setSelectedNodeEmp(emp)}
          draggable={isHr}
          onDragStart={(e) => handleDragStart(e, emp.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, emp.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: 'hsl(var(--bg-card))',
            border: selectedNodeEmp?.id === emp.id ? '2px solid hsl(var(--primary))' : '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius-md)',
            cursor: isHr ? 'grab' : 'pointer',
            width: '280px',
            position: 'relative',
            boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
            transition: 'border 0.2s ease, background 0.2s ease'
          }}
        >
          {depth > 0 && <div style={{ position: 'absolute', left: '-16px', top: '50%', width: '16px', height: '2px', background: 'hsl(var(--border))' }}></div>}
          <img src={getAvatarUrl(emp)} alt={emp.name} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--text-primary))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</h5>
            <p style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.designation || emp.role}</p>
            <span className="badge badge-info" style={{ fontSize: '0.65rem', marginTop: '4px' }}>{emp.dept}</span>
          </div>
          {directs.length > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--text-secondary))', cursor: 'pointer', padding: '4px' }}>
              <i className={`fa-solid ${isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
            </button>
          )}
          {totalReports > 0 && (
            <span className="badge badge-primary" style={{ position: 'absolute', top: '-8px', right: '8px', fontSize: '0.65rem', padding: '2px 6px' }}>
              Span: {totalReports}
            </span>
          )}
        </div>

        {directs.length > 0 && isExpanded && (
          <div style={{ borderLeft: '2px solid hsl(var(--border))', paddingLeft: '12px', marginLeft: '16px', position: 'relative' }}>
            {directs.map(child => <ChartNode key={child.id} emp={child} depth={depth + 1} />)}
          </div>
        )}
      </div>
    );
  };

  const chartRoots = employees.filter(e => {
    if (!e.teamLeadId) return true;
    return !employees.some(p => p.id === e.teamLeadId);
  });

  return (
    <div style={{ padding: '24px' }}>
      <SubmoduleHeader 
        title="Organization Chart" 
        description="Interactive visual hierarchy tree showing direct functional reporting lines." 
      />

      <div style={{ display: 'grid', gridTemplateColumns: selectedNodeEmp ? '2.5fr 1fr' : '1fr', gap: '24px' }}>
        <div className="emp-card" style={{ padding: '24px', overflowX: 'auto', minHeight: '65vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Interactive Enterprise Organization Chart</h3>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>Visual navigation tree showing functional reporting mappings across branches</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {chartSubView === 'hierarchy' && (
                <div style={{ display: 'flex', gap: '4px', background: 'hsl(var(--bg-main))', padding: '4px', borderRadius: '8px', marginRight: '10px' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px 10px' }} title="Zoom In" onClick={() => handleZoom(0.1)}><i className="fa-solid fa-plus"></i></button>
                  <button className="btn btn-secondary" style={{ padding: '6px 10px' }} title="Zoom Out" onClick={() => handleZoom(-0.1)}><i className="fa-solid fa-minus"></i></button>
                  <button className="btn btn-secondary" style={{ padding: '6px 10px' }} title="Reset Pan/Zoom" onClick={resetViewport}><i className="fa-solid fa-arrows-to-dot"></i></button>
                </div>
              )}
              <button className="btn btn-secondary" onClick={handleExportCSV}>
                <i className="fa-solid fa-file-export"></i> Export Structure
              </button>
              <div className="nav-search" style={{ margin: 0, width: '220px' }}>
                <i className="fa-solid fa-magnifying-glass"></i>
                <input type="text" placeholder="Search employee..." value={chartSearch} onChange={(e) => setChartSearch(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Sub Tab Navigation */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid hsl(var(--border))', marginBottom: '16px' }}>
            {[
              { id: 'hierarchy', label: 'Hierarchy Tree View', icon: 'fa-network-wired', route: '/organization/org-chart' },
              { id: 'department', label: 'Department Grid', icon: 'fa-table-cells', route: '/organization/org-chart/departments' },
              { id: 'manager', label: 'Span of Control', icon: 'fa-users-viewfinder', route: '/organization/org-chart/span-of-control' }
            ].map(tab => {
              const isActive = chartSubView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.route)}
                  style={{
                    background: isActive ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                    border: 'none',
                    borderBottom: isActive ? '3px solid hsl(var(--primary))' : '3px solid transparent',
                    color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
                    padding: '10px 18px',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderRadius: '6px 6px 0 0',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                >
                  <i className={`fa-solid ${tab.icon}`} style={{ fontSize: '0.85rem' }}></i>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tree View Canvas with Drag Pan & Zoom */}
          {chartSubView === 'hierarchy' && (
            <div 
              onMouseDown={startPan}
              onMouseMove={onPan}
              onMouseUp={endPan}
              onMouseLeave={endPan}
              style={{
                flex: 1,
                overflow: 'hidden',
                position: 'relative',
                background: 'hsl(var(--bg-main))',
                borderRadius: '8px',
                cursor: isPanning ? 'grabbing' : 'grab',
                border: '1px dashed hsl(var(--border))',
                userSelect: 'none'
              }}
            >
              {isHr && (
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(59,130,246,0.1)', color: 'hsl(var(--primary))', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, pointerEvents: 'none' }}>
                  <i className="fa-solid fa-circle-info"></i> Drag and drop nodes to re-parent the reporting structure.
                </div>
              )}
              <div 
                style={{
                  transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                  transformOrigin: '0 0',
                  transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                  padding: '24px',
                  display: 'inline-block',
                  minWidth: '100%',
                  minHeight: '100%'
                }}
              >
                {chartRoots.map(root => <ChartNode key={root.id} emp={root} />)}
              </div>
            </div>
          )}

          {/* Department View */}
          {chartSubView === 'department' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {departments.map(d => {
                const activeCount = employees.filter(e => e.dept === d.name).length;
                const head = getEmpById(d.managerId);
                return (
                  <div key={d._id} className="emp-card" style={{ padding: '20px', borderLeft: '4px solid hsl(var(--primary))' }}>
                    <h4 style={{ fontWeight: 700 }}>{d.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginTop: '2px' }}>Code: {d.code}</p>
                    <div style={{ margin: '14px 0', fontSize: '0.85rem' }}>
                      <div><strong>HOD Manager:</strong> {head ? head.name : 'Unassigned'}</div>
                      <div style={{ marginTop: '2px' }}><strong>Business Unit:</strong> {d.businessUnit || 'General'}</div>
                      <div style={{ marginTop: '2px' }}><strong>Branch Location:</strong> {d.location || 'General'}</div>
                    </div>
                    <span className="badge badge-primary">Strength: {activeCount} Employees</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Manager view */}
          {chartSubView === 'manager' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {spanOfControlList.map(s => {
                const total = s.directCount + s.indirectCount;
                return (
                  <div key={s.managerId} className="emp-card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <img src={getAvatarUrl(s)} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                      <div>
                        <strong style={{ display: 'block' }}>{s.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>{s.designation || s.role}</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem', background: 'hsl(var(--bg-main))', padding: '10px', borderRadius: '8px' }}>
                      <div><strong>Direct Reports:</strong> {s.directCount}</div>
                      <div><strong>Indirect:</strong> {s.indirectCount}</div>
                      <div style={{ gridColumn: '1/-1', color: 'hsl(var(--primary))' }}><strong>Total Span of Control:</strong> {total}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick info panel */}
        {selectedNodeEmp && (
          <div className="emp-card" style={{ padding: '20px', alignSelf: 'start', position: 'sticky', top: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontWeight: 700 }}>Quick Profile</h4>
              <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => setSelectedNodeEmp(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <img src={getAvatarUrl(selectedNodeEmp)} alt="" style={{ width: '70px', height: '70px', borderRadius: '50%', border: '2px solid hsl(var(--primary))' }} />
              <h4 style={{ fontWeight: 700, marginTop: '8px' }}>{selectedNodeEmp.name}</h4>
              <p style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>{selectedNodeEmp.designation || selectedNodeEmp.role}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.825rem' }}>
              <div><strong>Employee ID:</strong> {selectedNodeEmp.id}</div>
              <div><strong>Department:</strong> {selectedNodeEmp.dept}</div>
              <div><strong>Primary Manager:</strong> {selectedNodeEmp.teamLeadId ? getEmpById(selectedNodeEmp.teamLeadId)?.name : 'None'}</div>
              <div><strong>Functional Manager:</strong> {selectedNodeEmp.functionalManagerId ? getEmpById(selectedNodeEmp.functionalManagerId)?.name : 'None'}</div>
              <div><strong>Location Branch:</strong> {selectedNodeEmp.branch || 'Headquarters'}</div>
              <div><strong>Grade / Band:</strong> {selectedNodeEmp.grade || 'None'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgChartPage;
