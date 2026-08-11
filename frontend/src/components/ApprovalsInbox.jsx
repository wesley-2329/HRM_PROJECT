import React, { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from './Toast';

const ApprovalsInbox = () => {
  const { showToast } = useToast();
  const [inboxItems, setInboxItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commentsMap, setCommentsMap] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const res = await api.get('/approval-matrix/assignments/inbox');
      setInboxItems(res.data);
    } catch (err) {
      console.error('Error fetching approvals inbox:', err);
      showToast('Error loading approvals inbox.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const handleAction = async (id, action) => {
    const comments = commentsMap[id] || '';
    if (action === 'Rejected' && !comments.trim()) {
      showToast('You must enter comments/remarks when rejecting a request.', 'warning');
      return;
    }

    setSubmittingId(id);
    try {
      await api.put(`/approval-matrix/assignments/${id}/action`, { action, comments });
      showToast(`Request ${action.toLowerCase()} successfully.`, 'success');
      // Clear comments for this item
      setCommentsMap(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      fetchInbox();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error processing approval decision.', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCommentChange = (id, text) => {
    setCommentsMap(prev => ({ ...prev, [id]: text }));
  };

  return (
    <div className="portal-container" style={{ padding: '0 0 24px 0' }}>
      {/* Banner */}
      <div className="welcome-card-banner" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #1e1b4b 100%)', color: '#fff', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>Approvals Workspace</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Review, validate, and sign off transaction workflows pending your level authority.
          </p>
        </div>
        <div style={{ fontSize: '2.5rem', opacity: 0.2 }}><i className="fa-solid fa-stamp"></i></div>
      </div>

      <div className="card">
        <div className="card-title">Pending Action Items ({inboxItems.length})</div>
        
        {loading && inboxItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'hsl(var(--primary))' }}></i>
            <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>Loading pending approvals...</p>
          </div>
        ) : inboxItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
            <i className="fa-solid fa-circle-check" style={{ fontSize: '2.5rem', color: 'var(--emerald-500)', opacity: 0.8, marginBottom: '12px' }}></i>
            <h4 style={{ fontWeight: 700, color: 'hsl(var(--text-primary))' }}>Inbox Clear!</h4>
            <p style={{ fontSize: '0.85rem' }}>No approval requests are currently waiting for your decision.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {inboxItems.map(item => {
              const details = item.details || {};
              return (
                <div key={item._id} className="card" style={{ border: '1px solid var(--border-color)', margin: 0, padding: '20px', background: 'hsla(var(--primary), 0.01)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
                    <div>
                      <span className="badge badge-info" style={{ marginBottom: '6px' }}>{item.processName}</span>
                      <h4 style={{ margin: 0, fontWeight: 700 }}>Submitted by: {item.requesterName}</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Department: {item.requesterDept} | Role: {item.requesterRole} | ID: {item.requesterId}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-warning" style={{ fontSize: '0.85rem' }}>
                        Step {item.currentLevel} Action Required
                      </span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Initiated: {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Transaction context detail card */}
                  {item.transactionSource === 'Leave' && (
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-color)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                        <div><strong>Leave Category:</strong> {details.type} Leave</div>
                        <div><strong>From Date:</strong> {details.start}</div>
                        <div><strong>To Date:</strong> {details.end}</div>
                      </div>
                      <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                        <strong>Reason Applied:</strong> <span style={{ fontStyle: 'italic', opacity: 0.9 }}>"{details.reason || 'None provided'}"</span>
                      </div>
                    </div>
                  )}

                  {/* Comments and Decisions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Approver Remarks / Comments</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Add decision comments, recommendations, or reasons for rejection (Required for rejections)..."
                        value={commentsMap[item._id] || ''}
                        onChange={(e) => handleCommentChange(item._id, e.target.value)}
                        style={{ fontSize: '0.825rem', marginTop: '4px' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ backgroundColor: 'rgba(244,63,94,0.08)', color: 'var(--rose-500)', border: 'none', padding: '8px 20px', fontSize: '0.8rem', fontWeight: 700 }}
                        onClick={() => handleAction(item._id, 'Rejected')}
                        disabled={submittingId === item._id}
                      >
                        {submittingId === item._id ? 'Processing...' : 'Reject Request'}
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '8px 24px', fontSize: '0.8rem', fontWeight: 700 }}
                        onClick={() => handleAction(item._id, 'Approved')}
                        disabled={submittingId === item._id}
                      >
                        {submittingId === item._id ? 'Signing...' : 'Approve & Route'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalsInbox;
