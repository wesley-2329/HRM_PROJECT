import React, { useState, useContext, useEffect, useRef } from 'react';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../api';

const DocumentVault = ({ mode }) => {
  const {
    employees,
    vaultDocuments,
    fetchVaultDocuments
  } = useContext(DataContext);

  const { user } = useContext(AuthContext);
  const { showToast } = useToast();

  const isHr = mode === 'hr' || user?.role === 'hr';
  const [activeTab, setActiveTab] = useState(isHr ? 'pending' : 'my-vault');

  // Modal and detail states
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Form states for uploading
  const [uploadDocName, setUploadDocName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Identity');
  const [uploadExpiry, setUploadExpiry] = useState('');
  const [uploadChangelog, setUploadChangelog] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadOnBehalfEmpId, setUploadOnBehalfEmpId] = useState('');

  // Review states
  const [reviewComments, setReviewComments] = useState('');

  // Search & Filter
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // File input ref
  const fileInputRef = useRef(null);

  // Fetch document list on component load
  useEffect(() => {
    fetchVaultDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees]);

  // Expiry Compliance Checker Sweep
  const triggerComplianceScan = async () => {
    try {
      showToast('Running compliance and expiry monitoring scan...', 'info');
      const res = await api.post('/vault/trigger-expiry-checks');
      showToast(res.data.message + `. Checked: ${res.data.checkedCount}, Updated: ${res.data.updatedCount}`, 'success');
      fetchVaultDocuments();
    } catch (err) {
      showToast('Failed to run compliance scan.', 'error');
    }
  };

  // Helper: Get direct download URL
  const handleDownloadFile = async (docId, versionNum, fileName) => {
    try {
      showToast(`Downloading version ${versionNum}...`, 'info');
      // Perform direct GET api download
      const response = await api.get(`/vault/documents/${docId}/download/${versionNum}`, {
        responseType: 'blob'
      });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      // Reload documents to sync view audit entry
      fetchVaultDocuments();
    } catch (err) {
      showToast('Download failed. File might be missing on disk.', 'error');
    }
  };

  // Save/Upload action
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!uploadDocName) return showToast('Document name is required', 'error');
    if (!uploadFile && !selectedDoc) return showToast('Please select a file to upload', 'error');

    const formData = new FormData();
    if (uploadFile) {
      formData.append('file', uploadFile);
    }
    formData.append('documentName', uploadDocName);
    formData.append('category', uploadCategory);
    if (uploadExpiry) {
      formData.append('expiryDate', uploadExpiry);
    }
    formData.append('changeSummary', uploadChangelog || (selectedDoc ? 'Updated version' : 'Initial upload'));
    
    if (isHr && uploadOnBehalfEmpId) {
      formData.append('employeeId', uploadOnBehalfEmpId);
    }

    try {
      showToast('Uploading file securely to vault...', 'info');
      await api.post('/vault/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Secure document uploaded successfully.', 'success');
      fetchVaultDocuments();
      setShowUploadModal(false);
      resetUploadForm();
    } catch (err) {
      showToast(err.response?.data?.message || 'Upload failed.', 'error');
    }
  };

  // Approval Actions
  const handleApproveDoc = async (id) => {
    try {
      await api.put(`/vault/documents/${id}/approve`, { comments: reviewComments });
      showToast('Document approved and verified.', 'success');
      fetchVaultDocuments();
      setShowReviewModal(false);
      setReviewComments('');
      setSelectedDoc(null);
    } catch (err) {
      showToast('Approval action failed.', 'error');
    }
  };

  const handleRejectDoc = async (id) => {
    if (!reviewComments) return showToast('Rejection reason/comments are required', 'error');
    try {
      await api.put(`/vault/documents/${id}/reject`, { comments: reviewComments });
      showToast('Document status marked as Rejected.', 'warning');
      fetchVaultDocuments();
      setShowReviewModal(false);
      setReviewComments('');
      setSelectedDoc(null);
    } catch (err) {
      showToast('Rejection action failed.', 'error');
    }
  };

  const resetUploadForm = () => {
    setUploadDocName('');
    setUploadCategory('Identity');
    setUploadExpiry('');
    setUploadChangelog('');
    setUploadFile(null);
    setUploadOnBehalfEmpId('');
    setSelectedDoc(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // List of pre-defined standard document types
  const standardDocumentTypes = [
    { name: 'Offer Letter', category: 'Employment' },
    { name: 'Appointment Letter', category: 'Employment' },
    { name: 'Experience Letters', category: 'Employment' },
    { name: 'Tax Documents', category: 'Financial' },
    { name: 'ID Proof — Aadhaar Card', category: 'Identity' },
    { name: 'PAN Card', category: 'Identity' },
    { name: 'Driving License', category: 'Identity' },
    { name: 'Previous Company Relieving Letter', category: 'Employment' },
    { name: 'Certifications Log', category: 'Academic' }
  ];

  // Map files for the current employee
  const myVaultDocs = standardDocumentTypes.map(std => {
    const existing = vaultDocuments.find(vd => vd.documentName === std.name && vd.employeeId === user?.id);
    return {
      name: std.name,
      category: std.category,
      record: existing || null
    };
  });

  // HR Data Processing: Pending Approvals
  const pendingDocs = vaultDocuments.filter(vd => vd.status === 'Pending Approval');

  // Filtered list of all documents
  const allFilteredDocs = vaultDocuments.filter(vd => {
    const matchesSearch = vd.employeeName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      vd.documentName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      vd.employeeId.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || vd.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Expiring/Expired list
  const expiringDocs = vaultDocuments.filter(vd => {
    if (!vd.expiryDate) return false;
    const exp = new Date(vd.expiryDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return exp <= thirtyDaysFromNow;
  });

  // Combined Audit Trail for HR logs
  const aggregatedAuditLogs = [];
  vaultDocuments.forEach(doc => {
    doc.auditTrail.forEach(trail => {
      aggregatedAuditLogs.push({
        ...trail,
        documentId: doc._id,
        documentName: doc.documentName,
        employeeName: doc.employeeName,
        employeeId: doc.employeeId
      });
    });
  });
  // Sort descending by timestamp
  aggregatedAuditLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="document-vault-container">
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Confidential Document Vault</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>Secure end-to-end versioned document repository with complete compliance tracking</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isHr && (
            <button className="btn btn-secondary" onClick={triggerComplianceScan}>
              <i className="fa-solid fa-shield-halved"></i> Run Expiry Scan
            </button>
          )}
          <button className="btn btn-primary" onClick={() => { resetUploadForm(); setShowUploadModal(true); }}>
            <i className="fa-solid fa-cloud-arrow-up"></i> Upload Document
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="sub-tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid hsl(var(--border))', marginBottom: '24px' }}>
        {isHr ? (
          <>
            <button className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('pending')}>
              Pending Approvals <span className="badge badge-danger" style={{ marginLeft: '6px' }}>{pendingDocs.length}</span>
            </button>
            <button className={`btn ${activeTab === 'all-docs' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('all-docs')}>
              Employee Vaults
            </button>
            <button className={`btn ${activeTab === 'expiries' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('expiries')}>
              Expiries & Compliance <span className="badge badge-warning" style={{ marginLeft: '6px' }}>{expiringDocs.length}</span>
            </button>
            <button className={`btn ${activeTab === 'audit-trail' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('audit-trail')}>
              Global Vault Audits
            </button>
          </>
        ) : (
          <>
            <button className={`btn ${activeTab === 'my-vault' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('my-vault')}>
              My Verified Vault
            </button>
          </>
        )}
      </div>

      {/* ================= EMPLOYEE VIEW: My Vault ================= */}
      {activeTab === 'my-vault' && !isHr && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {myVaultDocs.map((item, idx) => {
            const isUploaded = !!item.record;
            const currentVer = isUploaded ? item.record.versions[item.record.versions.length - 1] : null;
            
            let statusBadge = <span className="badge badge-secondary">Pending Upload</span>;
            if (isUploaded) {
              if (item.record.status === 'Approved') {
                statusBadge = <span className="badge badge-success">Approved & Verified</span>;
              } else if (item.record.status === 'Pending Approval') {
                statusBadge = <span className="badge badge-warning">Awaiting HR Review</span>;
              } else if (item.record.status === 'Rejected') {
                statusBadge = <span className="badge badge-danger">Rejected</span>;
              } else if (item.record.status === 'Expired') {
                statusBadge = <span className="badge badge-secondary" style={{ background: '#64748b', color: '#fff' }}>Expired</span>;
              }
            }

            return (
              <div key={idx} className="emp-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px', minHeight: '220px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'hsl(var(--text-primary))' }}>{item.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginTop: '2px' }}>Category: {item.category}</p>
                    </div>
                    {statusBadge}
                  </div>

                  {isUploaded ? (
                    <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', margin: '12px 0', background: 'hsl(var(--bg-main))', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                      <div><strong>Active Version:</strong> v{currentVer.versionNumber}</div>
                      <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '2px' }}><strong>Filename:</strong> {currentVer.fileName}</div>
                      {item.record.expiryDate && (
                        <div style={{ marginTop: '2px' }}>
                          <strong>Expiry Date:</strong> {new Date(item.record.expiryDate).toLocaleDateString()}
                          {item.record.status === 'Expired' && <span style={{ color: 'hsl(var(--danger))', marginLeft: '4px', fontWeight: 600 }}>(Expired!)</span>}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p style={{ fontStyle: 'italic', fontSize: '0.825rem', color: 'hsl(var(--text-secondary))', margin: '20px 0' }}>
                      No record uploaded. A secure, signed copy is required for HR verification.
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid hsl(var(--border))', paddingTop: '14px' }}>
                  {isUploaded ? (
                    <>
                      <button 
                        className="btn btn-secondary" 
                        style={{ flex: 1, padding: '6px 12px', fontSize: '0.78rem' }}
                        onClick={() => handleDownloadFile(item.record._id, currentVer.versionNumber, currentVer.fileName)}
                      >
                        <i className="fa-solid fa-download"></i> Get File
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{ flex: 1, padding: '6px 12px', fontSize: '0.78rem' }}
                        onClick={() => { setSelectedDoc(item.record); setShowHistoryModal(true); }}
                      >
                        <i className="fa-solid fa-clock-rotate-left"></i> History & Audits
                      </button>
                    </>
                  ) : (
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%', padding: '8px' }}
                      onClick={() => {
                        resetUploadForm();
                        setUploadDocName(item.name);
                        setUploadCategory(item.category);
                        setShowUploadModal(true);
                      }}
                    >
                      <i className="fa-solid fa-upload"></i> Upload Secure File
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= HR VIEW: Pending Approvals ================= */}
      {activeTab === 'pending' && isHr && (
        <div className="emp-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Vault Files Awaiting HR Verification</h3>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px' }}>Employee</th>
                  <th style={{ padding: '12px' }}>Document Name</th>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>Active Version</th>
                  <th style={{ padding: '12px' }}>Upload Date</th>
                  <th style={{ padding: '12px' }}>Change Summary</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingDocs.length > 0 ? (
                  pendingDocs.map(doc => {
                    const currentVer = doc.versions[doc.versions.length - 1];
                    return (
                      <tr key={doc._id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.9rem' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{doc.employeeName} ({doc.employeeId})</td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{doc.documentName}</td>
                        <td style={{ padding: '12px' }}><span className="badge badge-info">{doc.category}</span></td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>v{currentVer.versionNumber}</td>
                        <td style={{ padding: '12px' }}>{new Date(currentVer.uploadedAt).toLocaleDateString()}</td>
                        <td style={{ padding: '12px', color: 'hsl(var(--text-secondary))', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentVer.changeSummary}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                              onClick={() => handleDownloadFile(doc._id, currentVer.versionNumber, currentVer.fileName)}
                            >
                              <i className="fa-solid fa-download"></i> Download
                            </button>
                            <button 
                              className="btn btn-primary" 
                              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                              onClick={() => { setSelectedDoc(doc); setReviewComments(''); setShowReviewModal(true); }}
                            >
                              Verify
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
                      <i className="fa-solid fa-circle-check fa-2x" style={{ color: 'hsl(var(--success))', marginBottom: '8px' }}></i>
                      <p>Clean Desk! No pending documents require approval.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= HR VIEW: Employee Vault Directory ================= */}
      {activeTab === 'all-docs' && isHr && (
        <div className="emp-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Employee Vault Explorer</h3>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>Browse, filter, and audit secure documents across all employees</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select className="form-control" style={{ width: '160px' }} value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                <option value="All">All Categories</option>
                <option value="Identity">Identity</option>
                <option value="Employment">Employment</option>
                <option value="Financial">Financial</option>
                <option value="Academic">Academic</option>
              </select>
              <div className="nav-search" style={{ margin: 0, width: '220px' }}>
                <i className="fa-solid fa-magnifying-glass"></i>
                <input type="text" placeholder="Search employee/doc..." value={searchFilter} onChange={e => setSearchFilter(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px' }}>Employee</th>
                  <th style={{ padding: '12px' }}>Document Name</th>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>Version</th>
                  <th style={{ padding: '12px' }}>Verification Status</th>
                  <th style={{ padding: '12px' }}>Expiry Date</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allFilteredDocs.length > 0 ? (
                  allFilteredDocs.map(doc => {
                    const currentVer = doc.versions[doc.versions.length - 1];
                    let statusBadge = <span className="badge badge-info">{doc.status}</span>;
                    if (doc.status === 'Approved') statusBadge = <span className="badge badge-success">Approved</span>;
                    if (doc.status === 'Pending Approval') statusBadge = <span className="badge badge-warning">Pending Review</span>;
                    if (doc.status === 'Rejected') statusBadge = <span className="badge badge-danger">Rejected</span>;
                    if (doc.status === 'Expired') statusBadge = <span className="badge badge-secondary" style={{ background: '#64748b', color: '#fff' }}>Expired</span>;

                    return (
                      <tr key={doc._id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.875rem' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{doc.employeeName} ({doc.employeeId})</td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{doc.documentName}</td>
                        <td style={{ padding: '12px' }}>{doc.category}</td>
                        <td style={{ padding: '12px' }}>v{currentVer.versionNumber}</td>
                        <td style={{ padding: '12px' }}>{statusBadge}</td>
                        <td style={{ padding: '12px' }}>{doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'N/A'}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                              onClick={() => handleDownloadFile(doc._id, currentVer.versionNumber, currentVer.fileName)}
                            >
                              <i className="fa-solid fa-download"></i>
                            </button>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                              onClick={() => { setSelectedDoc(doc); setShowHistoryModal(true); }}
                            >
                              <i className="fa-solid fa-clock-rotate-left"></i> History
                            </button>
                            {doc.status === 'Pending Approval' && (
                              <button 
                                className="btn btn-primary" 
                                style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                onClick={() => { setSelectedDoc(doc); setReviewComments(''); setShowReviewModal(true); }}
                              >
                                Verify
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
                      No documents found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= HR VIEW: Expiries & Compliance ================= */}
      {activeTab === 'expiries' && isHr && (
        <div className="emp-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Compliance Checker & Expiry Log</h3>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px' }}>Employee</th>
                  <th style={{ padding: '12px' }}>Document Name</th>
                  <th style={{ padding: '12px' }}>Expiry Date</th>
                  <th style={{ padding: '12px' }}>Current State</th>
                  <th style={{ padding: '12px' }}>Notification Alert</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expiringDocs.length > 0 ? (
                  expiringDocs.map(doc => {
                    const exp = new Date(doc.expiryDate);
                    const today = new Date();
                    const isExpired = exp <= today;

                    let expiryBadge = <span className="badge badge-warning">Expiring Soon</span>;
                    if (isExpired) {
                      expiryBadge = <span className="badge badge-danger">Expired</span>;
                    }

                    return (
                      <tr key={doc._id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.9rem' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{doc.employeeName} ({doc.employeeId})</td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{doc.documentName}</td>
                        <td style={{ padding: '12px', color: isExpired ? 'hsl(var(--danger))' : 'inherit', fontWeight: 600 }}>{exp.toLocaleDateString()}</td>
                        <td style={{ padding: '12px' }}>{expiryBadge}</td>
                        <td style={{ padding: '12px' }}>
                          {doc.expiryNotified ? (
                            <span className="badge badge-success"><i className="fa-solid fa-check"></i> Alert Sent</span>
                          ) : (
                            <span className="badge badge-secondary">Pending Alert</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                            onClick={async () => {
                              try {
                                await api.post('/vault/trigger-expiry-checks');
                                showToast('Compliance notification alert dispatched.', 'success');
                                fetchVaultDocuments();
                              } catch (e) {
                                showToast('Error sending alerts.', 'error');
                              }
                            }}
                          >
                            <i className="fa-solid fa-paper-plane"></i> Send Alert
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
                      No expiring or expired documents detected. Fully compliant!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= HR VIEW: Global Audit Trail ================= */}
      {activeTab === 'audit-trail' && isHr && (
        <div className="emp-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Secure Vault Access Audit Log</h3>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px' }}>Timestamp</th>
                  <th style={{ padding: '12px' }}>User (Actor)</th>
                  <th style={{ padding: '12px' }}>Target Document</th>
                  <th style={{ padding: '12px' }}>Employee Owner</th>
                  <th style={{ padding: '12px' }}>Action</th>
                  <th style={{ padding: '12px' }}>Transaction Details</th>
                </tr>
              </thead>
              <tbody>
                {aggregatedAuditLogs.length > 0 ? (
                  aggregatedAuditLogs.slice(0, 100).map((log, idx) => {
                    let actionBadge = <span className="badge badge-info">{log.action}</span>;
                    if (log.action === 'Upload' || log.action === 'Version Update') actionBadge = <span className="badge badge-primary">{log.action}</span>;
                    if (log.action === 'Approve') actionBadge = <span className="badge badge-success">{log.action}</span>;
                    if (log.action === 'Reject') actionBadge = <span className="badge badge-danger">{log.action}</span>;
                    if (log.action === 'Download') actionBadge = <span className="badge badge-warning">{log.action}</span>;

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.85rem' }}>
                        <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleString()}</td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{log.userName} ({log.userId})</td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{log.documentName}</td>
                        <td style={{ padding: '12px' }}>{log.employeeName}</td>
                        <td style={{ padding: '12px' }}>{actionBadge}</td>
                        <td style={{ padding: '12px', color: 'hsl(var(--text-secondary))' }}>{log.details}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
                      No vault activity recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: Version History & Audits ================= */}
      {showHistoryModal && selectedDoc && (
        <div className="modal-overlay" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="modal-content emp-card" style={{ width: '100%', maxWidth: '650px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Version History: {selectedDoc.documentName}</h3>
              <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => { setShowHistoryModal(false); setSelectedDoc(null); }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '10px' }}>Upload History Logs</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {selectedDoc.versions.map(v => (
                <div key={v.versionNumber} style={{ border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius-sm)', padding: '12px', background: 'hsl(var(--bg-main))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>Version {v.versionNumber}</div>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginTop: '2px' }}>
                      Uploaded: {new Date(v.uploadedAt).toLocaleString()} by User {v.uploadedBy}
                    </div>
                    <div style={{ fontSize: '0.8rem', marginTop: '4px', fontStyle: 'italic' }}>"{v.changeSummary}"</div>
                  </div>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    onClick={() => handleDownloadFile(selectedDoc._id, v.versionNumber, v.fileName)}
                  >
                    <i className="fa-solid fa-download"></i> Get File
                  </button>
                </div>
              ))}
            </div>

            <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '10px' }}>Security Audit Log (VIEWS, DOWNLOADS, APPROVALS)</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius-md)', padding: '12px', fontSize: '0.8rem', background: 'hsl(var(--bg-card))' }}>
              {selectedDoc.auditTrail.map((trail, idx) => (
                <div key={idx} style={{ paddingBottom: '8px', marginBottom: '8px', borderBottom: idx < selectedDoc.auditTrail.length - 1 ? '1px solid hsl(var(--border))' : 'none' }}>
                  <span style={{ color: 'hsl(var(--text-secondary))' }}>[{new Date(trail.timestamp).toLocaleString()}] </span>
                  <strong>{trail.action}</strong> by <strong>{trail.userName}</strong>
                  <div style={{ color: 'hsl(var(--text-secondary))', marginTop: '2px' }}>{trail.details}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: Secure Document Upload ================= */}
      {showUploadModal && (
        <div className="modal-overlay" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="modal-content emp-card" style={{ width: '100%', maxWidth: '500px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Secure Document Vault Uploader</h3>
            <form onSubmit={handleUploadDocument} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {isHr ? (
                <div className="form-group">
                  <label>Select Target Employee*</label>
                  <select className="form-control" value={uploadOnBehalfEmpId} onChange={e => setUploadOnBehalfEmpId(e.target.value)} required>
                    <option value="">Select Employee...</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="form-group">
                <label>Document Name*</label>
                {uploadDocName && !isHr ? (
                  <input type="text" className="form-control" value={uploadDocName} disabled required />
                ) : (
                  <select className="form-control" value={uploadDocName} onChange={e => {
                    setUploadDocName(e.target.value);
                    const std = standardDocumentTypes.find(s => s.name === e.target.value);
                    if (std) setUploadCategory(std.category);
                  }} required>
                    <option value="">Select Document Type...</option>
                    {standardDocumentTypes.map(s => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label>Document Category</label>
                <input type="text" className="form-control" value={uploadCategory} disabled />
              </div>

              <div className="form-group">
                <label>Expiry Date (Optional, e.g. for License or Visa)</label>
                <input type="date" className="form-control" value={uploadExpiry} onChange={e => setUploadExpiry(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Select File* (PDF, Word, Images)</label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="form-control" 
                  onChange={e => setUploadFile(e.target.files[0])} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Version Change Notes / Changelog*</label>
                <textarea 
                  className="form-control" 
                  rows="2" 
                  placeholder="e.g. Initial upload of Aadhaar proof / Renewal upload" 
                  value={uploadChangelog} 
                  onChange={e => setUploadChangelog(e.target.value)} 
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Upload Securely
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowUploadModal(false); resetUploadForm(); }}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: Verify & Review (HR only) ================= */}
      {showReviewModal && selectedDoc && (
        <div className="modal-overlay" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="modal-content emp-card" style={{ width: '100%', maxWidth: '500px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.20rem', fontWeight: 700, marginBottom: '16px' }}>Verify Secure Document</h3>
            
            <div style={{ background: 'hsl(var(--bg-main))', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '20px' }}>
              <div><strong>Employee:</strong> {selectedDoc.employeeName} ({selectedDoc.employeeId})</div>
              <div style={{ marginTop: '3px' }}><strong>Document:</strong> {selectedDoc.documentName}</div>
              <div style={{ marginTop: '3px' }}><strong>Category:</strong> {selectedDoc.category}</div>
              <div style={{ marginTop: '3px' }}><strong>Active Version:</strong> v{selectedDoc.versions[selectedDoc.versions.length - 1].versionNumber}</div>
              {selectedDoc.expiryDate && (
                <div style={{ marginTop: '3px' }}><strong>Expiry Date:</strong> {new Date(selectedDoc.expiryDate).toLocaleDateString()}</div>
              )}
            </div>

            <div className="form-group">
              <label>Approval/Rejection Comments (Required for rejection)</label>
              <textarea 
                className="form-control" 
                rows="3" 
                placeholder="Type audit remarks..." 
                value={reviewComments} 
                onChange={e => setReviewComments(e.target.value)}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ flex: 1, background: 'hsl(var(--success))' }}
                onClick={() => handleApproveDoc(selectedDoc._id)}
              >
                Approve & Verify
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                style={{ flex: 1 }}
                onClick={() => handleRejectDoc(selectedDoc._id)}
              >
                Reject
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => { setShowReviewModal(false); setSelectedDoc(null); setReviewComments(''); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVault;
