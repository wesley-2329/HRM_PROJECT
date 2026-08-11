import React, { useState, useEffect, useContext } from 'react';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../api';
import SubmoduleHeader from './SubmoduleHeader';
import Modal from '../../components/Modal';

const LegalEntitiesPage = ({ mode }) => {
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
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

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
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [gst, setGst] = useState('');
  const [pan, setPan] = useState('');
  const [cin, setCin] = useState('');
  const [tan, setTan] = useState('');
  const [businessRegNumber, setBusinessRegNumber] = useState('');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [registeredAddress, setRegisteredAddress] = useState('');
  const [corporateAddress, setCorporateAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');
  const [status, setStatus] = useState('Active');

  // Load Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/org/legal-entities', {
        params: {
          page,
          limit,
          search,
          status: statusFilter,
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
      showToast(err.response?.data?.message || 'Failed to load Legal Entities', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, statusFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  // Validations
  const validateForm = () => {
    if (!name || !code || !gst || !pan || !cin) {
      showToast('All fields marked with * are required', 'warning');
      return false;
    }
    // GST validation
    const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
    if (!gstRegex.test(gst)) {
      showToast('Invalid GST Format! (e.g. 29AAAAA1111A1Z1)', 'warning');
      return false;
    }
    // PAN validation
    const panRegex = /^[A-Z]{5}\d{4}[A-Z]{1}$/;
    if (!panRegex.test(pan)) {
      showToast('Invalid PAN Format! (e.g. ABCDE1234F)', 'warning');
      return false;
    }
    // CIN validation
    const cinRegex = /^[U|L]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/;
    if (!cinRegex.test(cin)) {
      showToast('Invalid CIN Format! (e.g. U12345KA2020PTC123456)', 'warning');
      return false;
    }
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name, code, gst, pan, cin, tan, businessRegNumber,
      country, state, city, registeredAddress, corporateAddress,
      email, phone, website, registrationDate, status
    };

    try {
      if (editingItem) {
        await api.put(`/org/legal-entities/${editingItem._id}`, payload);
        showToast('Legal Entity updated successfully', 'success');
      } else {
        await api.post('/org/legal-entities', payload);
        showToast('Legal Entity registered successfully', 'success');
      }
      fetchData();
      setShowAddEditModal(false);
      resetForm();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save Legal Entity', 'error');
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setName('');
    setCode('');
    setGst('');
    setPan('');
    setCin('');
    setTan('');
    setBusinessRegNumber('');
    setCountry('India');
    setState('');
    setCity('');
    setRegisteredAddress('');
    setCorporateAddress('');
    setEmail('');
    setPhone('');
    setWebsite('');
    setRegistrationDate('');
    setStatus('Active');
  };

  const openAdd = () => {
    resetForm();
    setShowAddEditModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setName(item.name);
    setCode(item.code);
    setGst(item.gst);
    setPan(item.pan);
    setCin(item.cin);
    setTan(item.tan || '');
    setBusinessRegNumber(item.businessRegNumber || '');
    setCountry(item.country || 'India');
    setState(item.state || '');
    setCity(item.city || '');
    setRegisteredAddress(item.registeredAddress || '');
    setCorporateAddress(item.corporateAddress || '');
    setEmail(item.email || '');
    setPhone(item.phone || '');
    setWebsite(item.website || '');
    setRegistrationDate(item.registrationDate || '');
    setStatus(item.status);
    setShowAddEditModal(true);
  };

  const handleDeleteClick = (item) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/org/legal-entities/${deletingItem._id}`);
      showToast('Legal Entity deleted successfully', 'success');
      fetchData();
      setShowDeleteModal(false);
      setDeletingItem(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete Legal Entity', 'error');
    }
  };

  const toggleStatus = async (item) => {
    const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.put(`/org/legal-entities/${item._id}`, { status: newStatus });
      showToast(`Legal Entity status updated to ${newStatus}`, 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to toggle status', 'error');
    }
  };

  // Bulk Operations
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
      const res = await api.post('/org/legal-entities/bulk-delete', { ids: selectedIds });
      showToast(res.data.message || 'Selected records deleted successfully', 'success');
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Bulk delete failed', 'error');
    }
  };

  const handleBulkStatus = async (newStatus) => {
    try {
      const res = await api.put('/org/legal-entities/bulk-status', { ids: selectedIds, status: newStatus });
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
    const headers = ['Name', 'Code', 'GST', 'PAN', 'CIN', 'Country', 'State', 'Email', 'Phone', 'Status'];
    const rows = data.map(item => [
      item.name, item.code, item.gst, item.pan, item.cin,
      item.country, item.state, item.email, item.phone, item.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "legal_entities.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV exported successfully', 'success');
  };

  const handleExportExcel = () => {
    // Generate simple HTML-based spreadsheet
    if (data.length === 0) return showToast('No data to export', 'warning');
    let excelContent = '<table><tr><th>Name</th><th>Code</th><th>GST</th><th>PAN</th><th>CIN</th><th>Status</th></tr>';
    data.forEach(item => {
      excelContent += `<tr><td>${item.name}</td><td>${item.code}</td><td>${item.gst}</td><td>${item.pan}</td><td>${item.cin}</td><td>${item.status}</td></tr>`;
    });
    excelContent += '</table>';
    const blob = new Blob([excelContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "legal_entities.xls";
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
        <span>Directory</span> / <span style={{ fontWeight: 600, color: 'hsl(var(--primary))' }}>Legal Entities</span>
      </div>

      <SubmoduleHeader 
        title="Legal Entities" 
        description="Configure registered legal structures, company tax IDs, corporate office details, and compliance settings."
        actionLabel="Register Legal Entity"
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
              placeholder="Search by Name, Code, GST, PAN, CIN..." 
              className="form-control" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="form-control" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ width: '130px' }}>
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select className="form-control" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: '130px' }}>
              <option value="name">Sort by Name</option>
              <option value="code">Sort by Code</option>
              <option value="createdAt">Sort by Date</option>
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
              <button onClick={() => handleBulkStatus('Active')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Set Active</button>
              <button onClick={() => handleBulkStatus('Inactive')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Set Inactive</button>
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
                  <th style={{ padding: '12px' }}>Entity Details</th>
                  <th style={{ padding: '12px' }}>Code</th>
                  <th style={{ padding: '12px' }}>GST & PAN</th>
                  <th style={{ padding: '12px' }}>Location</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  // Skeleton Loader Rows
                  [...Array(limit)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                      <td style={{ padding: '12px' }}><div className="skeleton" style={{ height: '16px', width: '16px' }}></div></td>
                      <td style={{ padding: '12px' }}>
                        <div className="skeleton" style={{ height: '16px', width: '120px', marginBottom: '6px' }}></div>
                        <div className="skeleton" style={{ height: '12px', width: '180px' }}></div>
                      </td>
                      <td style={{ padding: '12px' }}><div className="skeleton" style={{ height: '16px', width: '60px' }}></div></td>
                      <td style={{ padding: '12px' }}><div className="skeleton" style={{ height: '16px', width: '100px' }}></div></td>
                      <td style={{ padding: '12px' }}><div className="skeleton" style={{ height: '16px', width: '80px' }}></div></td>
                      <td style={{ padding: '12px' }}><div className="skeleton" style={{ height: '24px', width: '60px', borderRadius: '12px' }}></div></td>
                      <td style={{ padding: '12px' }}><div className="skeleton" style={{ height: '28px', width: '80px', float: 'right' }}></div></td>
                    </tr>
                  ))
                ) : data.length === 0 ? (
                  // Empty State
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center' }}>
                      <div style={{ fontSize: '2.5rem', color: 'hsl(var(--text-secondary))', marginBottom: '12px' }}>
                        <i className="fa-solid fa-building-circle-exclamation"></i>
                      </div>
                      <h4 style={{ margin: '0 0 6px 0', fontWeight: 600 }}>No Legal Entities found</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                        Try search modifications or click the register action above to create a new entity.
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
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600, color: 'hsl(var(--text-primary))' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>CIN: {item.cin}</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className="badge badge-secondary" style={{ fontFamily: 'monospace' }}>{item.code}</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontSize: '0.85rem' }}>GST: <strong>{item.gst}</strong></div>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>PAN: {item.pan}</div>
                      </td>
                      <td style={{ padding: '12px' }}>{item.city}, {item.state || item.country}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`badge ${item.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                            {item.status}
                          </span>
                          {isHr && (
                            <label className="switch" style={{ margin: 0 }}>
                              <input 
                                type="checkbox" 
                                checked={item.status === 'Active'} 
                                onChange={() => toggleStatus(item)} 
                              />
                              <span className="slider round"></span>
                            </label>
                          )}
                        </div>
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
                Showing {data.length} of {total} entities
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
      <Modal isOpen={showAddEditModal} onClose={() => setShowAddEditModal(false)} title={editingItem ? 'Edit Legal Entity' : 'Register Legal Entity'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '600px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>Entity Name*</label>
              <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Entity Code*</label>
              <input type="text" className="form-control" value={code} onChange={e => setCode(e.target.value)} required disabled={!!editingItem} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label>GST Number*</label>
              <input type="text" placeholder="29AAAAA1111A1Z1" className="form-control" value={gst} onChange={e => setGst(e.target.value.toUpperCase())} required />
            </div>
            <div className="form-group">
              <label>PAN Number*</label>
              <input type="text" placeholder="ABCDE1234F" className="form-control" value={pan} onChange={e => setPan(e.target.value.toUpperCase())} required />
            </div>
            <div className="form-group">
              <label>CIN Number*</label>
              <input type="text" placeholder="U12345KA..." className="form-control" value={cin} onChange={e => setCin(e.target.value.toUpperCase())} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>TAN Number</label>
              <input type="text" className="form-control" value={tan} onChange={e => setTan(e.target.value.toUpperCase())} />
            </div>
            <div className="form-group">
              <label>Business Registration No.</label>
              <input type="text" className="form-control" value={businessRegNumber} onChange={e => setBusinessRegNumber(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label>Country</label>
              <input type="text" className="form-control" value={country} onChange={e => setCountry(e.target.value)} />
            </div>
            <div className="form-group">
              <label>State</label>
              <input type="text" className="form-control" value={state} onChange={e => setState(e.target.value)} />
            </div>
            <div className="form-group">
              <label>City</label>
              <input type="text" className="form-control" value={city} onChange={e => setCity(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Registered Address</label>
            <textarea className="form-control" rows="2" value={registeredAddress} onChange={e => setRegisteredAddress(e.target.value)}></textarea>
          </div>
          <div className="form-group">
            <label>Corporate Office Address</label>
            <textarea className="form-control" rows="2" value={corporateAddress} onChange={e => setCorporateAddress(e.target.value)}></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>Website URL</label>
              <input type="text" className="form-control" value={website} onChange={e => setWebsite(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Registration Date</label>
              <input type="date" className="form-control" value={registrationDate} onChange={e => setRegistrationDate(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Entity</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddEditModal(false)}>Cancel</button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Legal Entity Profile">
        {viewingItem && (
          <div style={{ minWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid hsl(var(--border))', paddingBottom: '12px' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', fontWeight: 700 }}>{viewingItem.name}</h3>
              <span className="badge badge-secondary" style={{ fontFamily: 'monospace' }}>Code: {viewingItem.code}</span>
              <span className={`badge ${viewingItem.status === 'Active' ? 'badge-success' : 'badge-danger'}`} style={{ marginLeft: '8px' }}>{viewingItem.status}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px 16px', fontSize: '0.9rem' }}>
              <strong>GST Number:</strong>
              <div>{viewingItem.gst}</div>

              <strong>PAN Number:</strong>
              <div>{viewingItem.pan}</div>

              <strong>CIN Number:</strong>
              <div>{viewingItem.cin}</div>

              <strong>TAN Number:</strong>
              <div>{viewingItem.tan || 'N/A'}</div>

              <strong>Business Reg:</strong>
              <div>{viewingItem.businessRegNumber || 'N/A'}</div>

              <strong>Email:</strong>
              <div>{viewingItem.email || 'N/A'}</div>

              <strong>Phone:</strong>
              <div>{viewingItem.phone || 'N/A'}</div>

              <strong>Website:</strong>
              <div>{viewingItem.website || 'N/A'}</div>

              <strong>Registered Addr:</strong>
              <div>{viewingItem.registeredAddress || 'N/A'}</div>

              <strong>Corporate Addr:</strong>
              <div>{viewingItem.corporateAddress || 'N/A'}</div>

              <strong>Geography:</strong>
              <div>{viewingItem.city}, {viewingItem.state}, {viewingItem.country}</div>

              <strong>Reg Date:</strong>
              <div>{viewingItem.registrationDate || 'N/A'}</div>

              <strong>Audit Fields:</strong>
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
              Are you sure you want to delete the legal entity <strong>{deletingItem.name}</strong> ({deletingItem.code})? This will perform a soft-delete (mark it as Inactive and flag it).
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

export default LegalEntitiesPage;
