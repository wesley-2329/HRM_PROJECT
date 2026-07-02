import React, { useContext, useEffect, useState } from 'react';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import SubmoduleHeader from './SubmoduleHeader';
import Modal from '../../components/Modal';
import api from '../../api';

const AuditTrailsPage = ({ mode }) => {
  const {
    orgAuditLogs,
    fetchOrgAuditLogs
  } = useContext(DataContext);

  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const isHr = mode === 'hr' || user?.role === 'hr';

  const [selectedLog, setSelectedLog] = useState(null);
  const [showCompareModal, setShowCompareModal] = useState(false);

  useEffect(() => {
    if (isHr) {
      fetchOrgAuditLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHr]);

  const handleRollback = async (id) => {
    if (!window.confirm('Are you sure you want to rollback this change? This will revert database properties to the original state.')) return;
    try {
      await api.post(`/org/audit-logs/${id}/rollback`);
      showToast('Rollback executed successfully', 'success');
      fetchOrgAuditLogs();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error processing rollback', 'error');
    }
  };

  const openCompareModal = (log) => {
    setSelectedLog(log);
    setShowCompareModal(true);
  };

  if (!isHr) {
    return (
      <div style={{ padding: '24px' }}>
        <SubmoduleHeader 
          title="Audit Trail" 
          description="Track global organization hierarchy updates and setup action logs." 
        />
        <div className="emp-card" style={{ padding: '24px', color: 'red' }}>
          Access Denied: Only HR representatives can review organizational audit logs.
        </div>
      </div>
    );
  }

  const renderJsonDiff = (oldVal, newVal) => {
    if (!oldVal && !newVal) return <p>No detailed diff available.</p>;
    
    const keys = new Set([...Object.keys(oldVal || {}), ...Object.keys(newVal || {})]);
    const filteredKeys = Array.from(keys).filter(k => k !== 'createdAt' && k !== 'updatedAt' && k !== '__v');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px', fontWeight: 700, paddingBottom: '6px', borderBottom: '2px solid hsl(var(--border))' }}>
          <div>Property</div>
          <div style={{ color: 'hsl(var(--text-secondary))' }}>Old Value</div>
          <div style={{ color: 'hsl(var(--primary))' }}>New Value</div>
        </div>
        {filteredKeys.map(k => {
          const oldStr = oldVal?.[k] !== undefined ? JSON.stringify(oldVal[k]) : 'N/A';
          const newStr = newVal?.[k] !== undefined ? JSON.stringify(newVal[k]) : 'N/A';
          const isChanged = oldStr !== newStr;

          return (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px', fontSize: '0.85rem', padding: '6px 0', borderBottom: '1px solid hsl(var(--border))', background: isChanged ? 'rgba(59,130,246,0.03)' : 'transparent' }}>
              <div style={{ fontWeight: 600 }}>{k}</div>
              <div style={{ textDecoration: isChanged ? 'line-through' : 'none', color: 'hsl(var(--text-secondary))', overflowWrap: 'anywhere' }}>{oldStr}</div>
              <div style={{ fontWeight: isChanged ? 700 : 400, color: isChanged ? 'hsl(var(--primary))' : 'inherit', overflowWrap: 'anywhere' }}>{newStr}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <SubmoduleHeader 
        title="Audit Trail" 
        description="Track global organization hierarchy updates, view state comparison diffs, and perform rollbacks." 
      />

      <div className="emp-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Global Organization Audit Trails</h3>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid hsl(var(--border))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px' }}>Timestamp</th>
                <th style={{ padding: '12px' }}>Actor</th>
                <th style={{ padding: '12px' }}>Action</th>
                <th style={{ padding: '12px' }}>Transaction Log Details</th>
                <th style={{ padding: '12px' }}>Metadata (IP / Reason)</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgAuditLogs.map(log => (
                <tr key={log._id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.85rem' }}>
                  <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{log.actorName} ({log.actorId})</td>
                  <td style={{ padding: '12px' }}><span className="badge badge-info">{log.action}</span></td>
                  <td style={{ padding: '12px', color: 'hsl(var(--text-secondary))' }}>{log.details}</td>
                  <td style={{ padding: '12px', fontSize: '0.78rem' }}>
                    <div><strong>IP:</strong> {log.ipAddress || 'Unknown'}</div>
                    <div style={{ color: 'hsl(var(--text-secondary))', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}><strong>Reason:</strong> {log.reason || 'None provided'}</div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {log.oldValues && (
                        <>
                          <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => openCompareModal(log)}>Compare</button>
                          <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => handleRollback(log._id)}>Rollback</button>
                        </>
                      )}
                      {!log.oldValues && <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.720rem' }}>No diff</span>}
                    </div>
                  </td>
                </tr>
              ))}
              {orgAuditLogs.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>No audit trail entries found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* State Compare Modal */}
      <Modal isOpen={showCompareModal} onClose={() => setShowCompareModal(false)} title="State Comparison Diff View">
        {selectedLog && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'hsl(var(--bg-main))', padding: '14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
              <div><strong>Action:</strong> {selectedLog.action}</div>
              <div><strong>Actor:</strong> {selectedLog.actorName} ({selectedLog.actorId})</div>
              <div style={{ gridColumn: '1/-1' }}><strong>Change Details:</strong> {selectedLog.details}</div>
              {selectedLog.reason && <div style={{ gridColumn: '1/-1' }}><strong>Reported Reason:</strong> {selectedLog.reason}</div>}
              <div><strong>Client UA:</strong> {selectedLog.browser || 'N/A'}</div>
              <div><strong>Client IP:</strong> {selectedLog.ipAddress || 'N/A'}</div>
            </div>
            {renderJsonDiff(selectedLog.oldValues, selectedLog.newValues)}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditTrailsPage;
