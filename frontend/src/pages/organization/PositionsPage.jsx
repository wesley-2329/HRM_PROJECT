import React, { useState, useEffect, useContext } from 'react';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../api';
import SubmoduleHeader from './SubmoduleHeader';
import Modal from '../../components/Modal';

const PositionsPage = ({ mode }) => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const isHr = mode === 'hr' || user?.role === 'hr';

  // State Variables
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [desgFilter, setDesgFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [empTypeFilter, setEmpTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('positionCode');
  const [sortOrder, setSortOrder] = useState('asc');

  // Master Dropdowns
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [gradeBands, setGradeBands] = useState([]);
  const [costCenters, setCostCenters] = useState([]);

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  // Form Fields
  const [positionCode, setPositionCode] = useState('');
  const [positionName, setPositionName] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [approvedHeadcount, setApprovedHeadcount] = useState(1);
  const [filledPositions, setFilledPositions] = useState(0);
  const [employmentType, setEmploymentType] = useState('Full-Time');
  const [grade, setGrade] = useState('');
  const [costCenter, setCostCenter] = useState('');
  const [budget, setBudget] = useState(0);
  const [status, setStatus] = useState('Vacant');

  // Load masters
  const loadMasters = async () => {
    try {
      const deptRes = await api.get('/org/departments');
      setDepartments(deptRes.data || []);
      const desgRes = await api.get('/org/designations');
      setDesignations(desgRes.data || []);
      const gradeRes = await api.get('/org/grade-bands');
      setGradeBands(gradeRes.data || []);
      const ccRes = await api.get('/org/cost-centers');
      setCostCenters(ccRes.data || []);
    } catch (err) {
      console.error('Failed to load dropdown masters:', err);
    }
  };

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/org/positions', {
        params: {
          page,
          limit,
          search,
          status: statusFilter,
          department: deptFilter,
          grade: gradeFilter,
          employmentType: empTypeFilter,
          sortBy,
          sortOrder
        }
      });
      if (res.data && res.data.data) {
        setData(res.data.data);
        setTotal(res.data.total);
      } else {
        setData(res.data || []);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load position logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, statusFilter, deptFilter, desgFilter, gradeFilter, empTypeFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const validateForm = () => {
    if (!positionCode || !positionName || !department || !designation || !grade) {
      showToast('Position Code, Name, Department, Designation, and Grade are required', 'warning');
      return false;
    }
    if (filledPositions > approvedHeadcount) {
      showToast('Filled headcount cannot exceed Approved headcount limit!', 'warning');
      return false;
    }
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      positionCode, positionName, department, designation,
      approvedHeadcount, filledPositions, employmentType,
      grade, costCenter, budget, status
    };

    try {
      if (editingItem) {
        await api.put(`/org/positions/${editingItem._id}`, payload);
        showToast('Position Control updated successfully', 'success');
      } else {
        await api.post('/org/positions', payload);
        showToast('Position registered successfully', 'success');
      }
      fetchData();
      setShowAddEditModal(false);
      resetForm();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save position config', 'error');
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setPositionCode('');
    setPositionName('');
    setDepartment('');
    setDesignation('');
    setApprovedHeadcount(1);
    setFilledPositions(0);
    setEmploymentType('Full-Time');
    setGrade('');
    setCostCenter('');
    setBudget(0);
    setStatus('Vacant');
  };

  const openAdd = () => {
    resetForm();
    setShowAddEditModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setPositionCode(item.positionCode);
    setPositionName(item.positionName);
    setDepartment(item.department);
    setDesignation(item.designation);
    setApprovedHeadcount(item.approvedHeadcount);
    setFilledPositions(item.filledPositions);
    setEmploymentType(item.employmentType || 'Full-Time');
    setGrade(item.grade);
    setCostCenter(item.costCenter || '');
    setBudget(item.budget || 0);
    setStatus(item.status);
    setShowAddEditModal(true);
  };

  const handleDeleteClick = (item) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/org/positions/${deletingItem._id}`);
      showToast('Position deleted successfully', 'success');
      fetchData();
      setShowDeleteModal(false);
      setDeletingItem(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete Position', 'error');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(data.map(d => d._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected records?`)) return;
    try {
      const res = await api.post('/org/positions/bulk-delete', { ids: selectedIds });
      showToast(res.data.message || 'Selected records deleted successfully', 'success');
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Bulk delete failed', 'error');
    }
  };

  const handleBulkStatus = async (newStatus) => {
    try {
      const res = await api.put('/org/positions/bulk-status', { ids: selectedIds, status: newStatus });
      showToast(res.data.message || 'Selected records status updated', 'success');
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Bulk status update failed', 'error');
    }
  };

  // Exports
  const handleExportCSV = () => {
    if (data.length === 0) return showToast('No data to export', 'warning');
    const headers = ['Pos Code', 'Pos Name', 'Department', 'Designation', 'Approved Limit', 'Filled Count', 'Vacant Count', 'Grade', 'Budget', 'Status'];
    const rows = data.map(item => [
      item.positionCode, item.positionName, item.department, item.designation,
      item.approvedHeadcount, item.filledPositions, item.vacantPositions,
      item.grade, item.budget || 0, item.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "position_control.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV exported successfully', 'success');
  };

  const handleExportExcel = () => {
    if (data.length === 0) return showToast('No data to export', 'warning');
    let excelContent = '<table><tr><th>Pos Code</th><th>Pos Name</th><th>Department</th><th>Approved</th><th>Filled</th><th>Vacant</th><th>Status</th></tr>';
    data.forEach(item => {
      excelContent += `<tr><td>${item.positionCode}</td><td>${item.positionName}</td><td>${item.department}</td><td>${item.approvedHeadcount}</td><td>${item.filledPositions}</td><td>${item.vacantPositions}</td><td>${item.status}</td></tr>`;
    });
    excelContent += '</table>';
    const blob = new Blob([excelContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "position_control.xls";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Excel exported successfully', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Breadcrumbs */}
      <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginBottom: '12px' }}>
        <span>Directory</span> / <span style={{ fontWeight: 600, color: 'hsl(var(--primary))' }}>Position Control</span>
      </div>

      <SubmoduleHeader 
        title="Position Control" 
        description="Verify authorized headcounts, track occupant positions, set budgets, and control vacancies with auto-calculated availability."
        actionLabel="Register Position"
        onActionClick={openAdd}
        isHr={isHr}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Search, Filter, Sort and Action Toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'hsl(var(--bg-card))',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid hsl(var(--border))'
        }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '280px' }}>
            <input 
              type="text" 
              placeholder="Search by position name or code..." 
              className="form-control" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="form-control" value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }} style={{ width: '150px' }}>
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d._id} value={d.name}>{d.name}</option>
              ))}
            </select>

            <select className="form-control" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ width: '130px' }}>
              <option value="">All Status</option>
              <option value="Vacant">Vacant</option>
              <option value="Filled">Filled</option>
              <option value="Frozen">Frozen</option>
              <option value="Closed">Closed</option>
            </select>

            <select className="form-control" value={empTypeFilter} onChange={e => { setEmpTypeFilter(e.target.value); setPage(1); }} style={{ width: '140px' }}>
              <option value="">All Job Types</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contractor">Contractor</option>
              <option value="Intern">Intern</option>
            </select>

            <select className="form-control" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: '130px' }}>
              <option value="positionCode">Sort by Code</option>
              <option value="positionName">Sort by Name</option>
              <option value="approvedHeadcount">Sort by Headcount</option>
            </select>

            <select className="form-control" value={sortOrder} onChange={e => setSortOrder(e.target.value)} style={{ width: '100px' }}>
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={handleExportCSV} className="btn btn-secondary" title="Export CSV" style={{ padding: '8px 12px' }}>
                <i className="fa-solid fa-file-csv"></i>
              </button>
              <button onClick={handleExportExcel} className="btn btn-secondary" title="Export Excel" style={{ padding: '8px 12px' }}>
                <i className="fa-solid fa-file-excel"></i>
              </button>
              <button onClick={handlePrint} className="btn btn-secondary" title="Print" style={{ padding: '8px 12px' }}>
                <i className="fa-solid fa-print"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Selected Rows Bulk Toolbar */}
        {selectedIds.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(59, 130, 246, 0.06)',
            padding: '12px 18px',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--primary))' }}>
              {selectedIds.length} records selected
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => handleBulkStatus('Frozen')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Set Frozen</button>
              <button onClick={() => handleBulkStatus('Closed')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Set Closed</button>
              {isHr && (
                <button onClick={handleBulkDelete} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'red' }}>Delete Selected</button>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Table Card */}
        <div className="emp-card" style={{ padding: '24px' }}>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px', width: '40px' }}>
                    <input type="checkbox" onChange={handleSelectAll} checked={data.length > 0 && selectedIds.length === data.length} />
                  </th>
                  <th style={{ padding: '12px' }}>Position Title</th>
                  <th style={{ padding: '12px' }}>Code</th>
                  <th style={{ padding: '12px' }}>Department & Designation</th>
                  <th style={{ padding: '12px' }}>Limit (Appr/Filled/Vac)</th>
                  <th style={{ padding: '12px' }}>Job Type</th>
                  <th style={{ padding: '12px' }}>Grade & Cost Center</th>
                  <th style={{ padding: '12px' }}>Budget</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  // Skeleton Rows
                  [...Array(limit)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                      <td style={{ padding: '12px' }}><div className="skeleton" style={{ height: '16px', width: '16px' }}></div></td>
                      <td style={{ padding: '12px' }}><div className="skeleton" style={{ height: '16px', width: '120px' }}></div></td>
                      <td style={{ padding: '12px' }}><div className="skeleton" style={{ height: '16px', width: '60px' }}></div></td>
                      <td style={{ padding: '12px' }}><div className="skeleton" style={{ height: '16px', width: '140px' }}></div></td>
                      <td style={{ padding: '12px' }}><div className="skeleton" style={{ height: '16px', width: '80px' }}></div></td>
                      <td style={{ padding: '12px' }}><div className="skeleton" style={{ height: '16px', width: '70px' }}></div></td>
                      <td style={{ padding: '12px' }}><div className="skeleton" style={{ height: '16px', width: '100px' }}></div></td>
                      <td style={{ padding: '12px' }}><div className="skeleton" style={{ height: '16px', width: '80px' }}></div></td>
                      <td style={{ padding: '12px' }}><div className="skeleton" style={{ height: '24px', width: '60px', borderRadius: '12px' }}></div></td>
                      <td style={{ padding: '12px' }}><div className="skeleton" style={{ height: '28px', width: '80px', float: 'right' }}></div></td>
                    </tr>
                  ))
                ) : data.length === 0 ? (
                  // Empty State
                  <tr>
                    <td colSpan={10} style={{ padding: '40px', textAlign: 'center' }}>
                      <div style={{ fontSize: '2.5rem', color: 'hsl(var(--text-secondary))', marginBottom: '12px' }}>
                        <i className="fa-solid fa-user-tie"></i>
                      </div>
                      <h4 style={{ margin: '0 0 6px 0', fontWeight: 600 }}>No Positions found</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                        Try search modifications or click the register action above to create a new position.
                      </p>
                    </td>
                  </tr>
                ) : (
                  // Real Data Rows
                  data.map(item => (
                    <tr key={item._id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.9rem' }}>
                      <td style={{ padding: '12px' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(item._id)} 
                          onChange={() => handleSelectOne(item._id)} 
                        />
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600, color: 'hsl(var(--text-primary))' }}>
                        {item.positionName}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className="badge badge-secondary" style={{ fontFamily: 'monospace' }}>{item.positionCode}</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div>{item.department}</div>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>{item.designation}</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ fontWeight: 600 }}>{item.approvedHeadcount}</span> / <span style={{ color: 'green', fontWeight: 600 }}>{item.filledPositions}</span> / <span style={{ color: 'orange', fontWeight: 600 }}>{item.vacantPositions}</span>
                      </td>
                      <td style={{ padding: '12px' }}>{item.employmentType}</td>
                      <td style={{ padding: '12px' }}>
                        <div>{item.grade}</div>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>{item.costCenter || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>
                        ${(item.budget || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${
                          item.status === 'Filled' ? 'badge-success' : 
                          item.status === 'Vacant' ? 'badge-warning' : 
                          item.status === 'Frozen' ? 'badge-secondary' : 'badge-danger'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                            onClick={() => { setViewingItem(item); setShowViewModal(true); }}
                          >
                            View
                          </button>
                          {isHr && (
                            <>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                onClick={() => openEdit(item)}
                              >
                                Edit
                              </button>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'red' }}
                                onClick={() => handleDeleteClick(item)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && data.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '20px',
              borderTop: '1px solid hsl(var(--border))',
              paddingTop: '16px'
            }}>
              <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                Showing {data.length} of {total} positions
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <select 
                  className="form-control" 
                  value={limit} 
                  onChange={e => { setLimit(parseInt(e.target.value)); setPage(1); }} 
                  style={{ width: '80px', padding: '4px 8px' }}
                >
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                </select>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  style={{ padding: '6px 12px' }}
                >
                  Prev
                </button>
                <span style={{ fontSize: '0.9rem', padding: '0 8px' }}>Page {page}</span>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setPage(p => p + 1)} 
                  disabled={page * limit >= total}
                  style={{ padding: '6px 12px' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={showAddEditModal} onClose={() => setShowAddEditModal(false)} title={editingItem ? 'Edit Position Details' : 'Register New Position'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '400px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>Position Title*</label>
              <input type="text" className="form-control" value={positionName} onChange={e => setPositionName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Position Code*</label>
              <input type="text" className="form-control" value={positionCode} onChange={e => setPositionCode(e.target.value)} required disabled={!!editingItem} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>Department*</label>
              <select className="form-control" value={department} onChange={e => setDepartment(e.target.value)} required>
                <option value="">Select Department...</option>
                {departments.map(d => (
                  <option key={d._id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Designation*</label>
              <select className="form-control" value={designation} onChange={e => setDesignation(e.target.value)} required>
                <option value="">Select Designation...</option>
                {designations.map(desg => (
                  <option key={desg._id} value={desg.name}>{desg.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>Approved Headcount*</label>
              <input type="number" className="form-control" value={approvedHeadcount} onChange={e => setApprovedHeadcount(parseInt(e.target.value))} required min={1} />
            </div>
            <div className="form-group">
              <label>Filled Headcount*</label>
              <input type="number" className="form-control" value={filledPositions} onChange={e => setFilledPositions(parseInt(e.target.value))} required min={0} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>Employment Type*</label>
              <select className="form-control" value={employmentType} onChange={e => setEmploymentType(e.target.value)} required>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contractor">Contractor</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
            <div className="form-group">
              <label>Grade Band*</label>
              <select className="form-control" value={grade} onChange={e => setGrade(e.target.value)} required>
                <option value="">Select Grade...</option>
                {gradeBands.map(gb => (
                  <option key={gb._id} value={gb.name}>{gb.name} ({gb.description})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>Associated Cost Center</label>
              <select className="form-control" value={costCenter} onChange={e => setCostCenter(e.target.value)}>
                <option value="">Select Cost Center...</option>
                {costCenters.map(cc => (
                  <option key={cc._id} value={cc.name}>{cc.name} ({cc.code})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Annual Budget ($)</label>
              <input type="number" className="form-control" value={budget} onChange={e => setBudget(parseFloat(e.target.value))} />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="Vacant">Vacant</option>
              <option value="Filled">Filled</option>
              <option value="Frozen">Frozen</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Position</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddEditModal(false)}>Cancel</button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Position Control Log">
        {viewingItem && (
          <div style={{ minWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid hsl(var(--border))', paddingBottom: '12px' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', fontWeight: 700 }}>{viewingItem.positionName}</h3>
              <span className="badge badge-secondary" style={{ fontFamily: 'monospace' }}>Code: {viewingItem.positionCode}</span>
              <span className={`badge ${
                viewingItem.status === 'Filled' ? 'badge-success' : 
                viewingItem.status === 'Vacant' ? 'badge-warning' : 
                viewingItem.status === 'Frozen' ? 'badge-secondary' : 'badge-danger'
              }`} style={{ marginLeft: '8px' }}>{viewingItem.status}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px 16px', fontSize: '0.9rem' }}>
              <strong>Department Name:</strong>
              <div>{viewingItem.department}</div>

              <strong>Designation Code:</strong>
              <div>{viewingItem.designation}</div>

              <strong>Employment Type:</strong>
              <div>{viewingItem.employmentType}</div>

              <strong>Grade Band:</strong>
              <div>{viewingItem.grade}</div>

              <strong>Approved Headcount:</strong>
              <div>{viewingItem.approvedHeadcount} limit</div>

              <strong>Filled Headcount:</strong>
              <div style={{ color: 'green', fontWeight: 600 }}>{viewingItem.filledPositions} filled</div>

              <strong>Vacant Headcount:</strong>
              <div style={{ color: 'orange', fontWeight: 600 }}>{viewingItem.vacantPositions} vacant</div>

              <strong>Associated Cost Center:</strong>
              <div>{viewingItem.costCenter || 'N/A'}</div>

              <strong>Annual Budget:</strong>
              <div>${(viewingItem.budget || 0).toLocaleString()}</div>

              <strong>Audit logs:</strong>
              <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                Created: {new Date(viewingItem.createdAt).toLocaleString()} by {viewingItem.created_by || 'Admin'}<br />
                Last Update: {new Date(viewingItem.updatedAt).toLocaleString()} by {viewingItem.updated_by || 'Admin'}
              </div>
            </div>

            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close Details</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Deletion">
        {deletingItem && (
          <div style={{ minWidth: '320px' }}>
            <p style={{ fontSize: '0.95rem', margin: '0 0 20px 0' }}>
              Are you sure you want to delete the position <strong>{deletingItem.positionName}</strong> ({deletingItem.positionCode})? This will perform a soft-delete and verify occupied records.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" style={{ background: 'red' }} onClick={confirmDelete}>Yes, Delete</button>
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PositionsPage;
