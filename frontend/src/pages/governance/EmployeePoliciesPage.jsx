import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import { useToast } from '../../components/Toast';

const EmployeePoliciesPage = ({ onStatusChange, inlineMode = false }) => {
  const { showToast } = useToast();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  
  // Checkboxes
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);
  
  // Reading tracking
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const policyTextRef = useRef(null);

  const fetchEmployeePolicies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/policies/employee-status');
      setPolicies(res.data.policies);
      if (onStatusChange) {
        onStatusChange({
          pendingCount: res.data.pendingCount,
          onboardingCompleted: res.data.onboardingCompleted
        });
      }
    } catch (err) {
      showToast('Error loading policies.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeePolicies();
  }, []);

  // When policy changes, reset state
  const handlePolicySelect = (p) => {
    setSelectedPolicy(p);
    setCheckbox1(false);
    setCheckbox2(false);
    setHasScrolledToBottom(false);
    // Self-healing scroll check: if content fits without scrolling, set true
    setTimeout(() => {
      if (policyTextRef.current) {
        const el = policyTextRef.current;
        if (el.scrollHeight <= el.clientHeight) {
          setHasScrolledToBottom(true);
        }
      }
    }, 100);
  };

  // Scroll to bottom verification
  const handleScroll = (e) => {
    const target = e.target;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 15;
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      showToast('Verification: You have scrolled through the policy.', 'info');
    }
  };

  const handleAcceptSubmit = async (e) => {
    e.preventDefault();
    if (!checkbox1 || !checkbox2) {
      showToast('Please check both mandatory validation boxes.', 'warning');
      return;
    }
    try {
      const res = await api.post(`/policies/${selectedPolicy._id}/acknowledge`);
      showToast(`Acknowledged policy "${selectedPolicy.name}" successfully.`, 'success');
      setSelectedPolicy(null);
      fetchEmployeePolicies();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error submitting acknowledgement.', 'error');
    }
  };

  // Classify policies:
  // 1. Company Policies: Active & Accepted
  // 2. New Policies: Active & Pending & Version = 1
  // 3. Updated Policies: Active & Pending & Version > 1 (Needs re-acceptance)
  const acceptedPolicies = policies.filter(p => p.status === 'Accepted');
  const newPolicies = policies.filter(p => p.status === 'Pending' && p.version === 1);
  const updatedPolicies = policies.filter(p => p.status === 'Pending' && p.version > 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Page Title Panel */}
      {!inlineMode && (
        <div className="welcome-card-banner" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #1e1b4b 100%)', color: '#fff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 800 }}>Employee Policy Repository</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginTop: '4px' }}>
              Access corporate code logs, read active rules guidelines, and acknowledge latest documents.
            </p>
          </div>
          <div style={{ fontSize: '2.5rem', opacity: 0.15 }}><i className="fa-solid fa-building-columns"></i></div>
        </div>
      )}

      {/* Main split grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ minHeight: inlineMode ? 'auto' : '500px' }}>
        
        {/* Left Side: Policies Categories and Lists */}
        <div className="card md:col-span-1" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Section: Updated Policies */}
          {updatedPolicies.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--rose-500)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                Updated Policies (Re-accept)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {updatedPolicies.map(p => (
                  <button
                    key={p._id}
                    onClick={() => handlePolicySelect(p)}
                    className="card text-left"
                    style={{
                      padding: '12px',
                      cursor: 'pointer',
                      border: selectedPolicy?._id === p._id ? '2px solid hsl(var(--primary))' : '1px solid var(--border-color)',
                      backgroundColor: 'rgba(244,63,94,0.04)',
                      transition: 'all 0.2s',
                      borderRadius: '8px',
                      width: '100%'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Effective: {new Date(p.effectiveDate).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Version: v{p.version}</span>
                      <span style={{ color: 'var(--rose-500)', fontWeight: 600 }}>Revision Alert</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: New Policies */}
          {newPolicies.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--amber-500)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                New Mandatory Policies
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {newPolicies.map(p => (
                  <button
                    key={p._id}
                    onClick={() => handlePolicySelect(p)}
                    className="card text-left"
                    style={{
                      padding: '12px',
                      cursor: 'pointer',
                      border: selectedPolicy?._id === p._id ? '2px solid hsl(var(--primary))' : '1px solid var(--border-color)',
                      backgroundColor: 'rgba(245,158,11,0.04)',
                      transition: 'all 0.2s',
                      borderRadius: '8px',
                      width: '100%'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Effective: {new Date(p.effectiveDate).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Version: v{p.version}</span>
                      <span style={{ color: 'var(--amber-500)', fontWeight: 600 }}>Action Required</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Company Policies (Accepted) */}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: 'hsl(var(--text-primary))' }}>
              Company Policies (Signed)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {acceptedPolicies.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', padding: '8px', textAlign: 'center' }}>No policies acknowledged yet.</div>
              ) : (
                acceptedPolicies.map(p => (
                  <button
                    key={p._id}
                    onClick={() => handlePolicySelect(p)}
                    className="card text-left"
                    style={{
                      padding: '12px',
                      cursor: 'pointer',
                      border: selectedPolicy?._id === p._id ? '2px solid hsl(var(--primary))' : '1px solid var(--border-color)',
                      backgroundColor: 'rgba(255,255,255,0.01)',
                      transition: 'all 0.2s',
                      borderRadius: '8px',
                      width: '100%'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Effective: {new Date(p.effectiveDate).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Version: v{p.version}</span>
                      <span style={{ color: 'var(--emerald-500)', fontWeight: 600 }}><i className="fa-solid fa-circle-check"></i> Accepted</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Policy Detailed Viewer and Acceptance Screen */}
        <div className="card md:col-span-2" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'hsl(var(--primary))' }}></i>
            </div>
          ) : !selectedPolicy ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, color: 'var(--text-secondary)', gap: '12px' }}>
              <i className="fa-solid fa-folder-open" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
              <span style={{ fontSize: '0.9rem' }}>Select a policy from the list to view and accept.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              {/* Policy Header / View Info & Close Lock */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedPolicy.name}</h3>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px', flexWrap: 'wrap' }}>
                    <span><strong>Version:</strong> v{selectedPolicy.version}</span>
                    <span><strong>Effective Date:</strong> {new Date(selectedPolicy.effectiveDate).toLocaleDateString()}</span>
                    <span><strong>Last Updated:</strong> {new Date(selectedPolicy.lastUpdatedDate).toLocaleDateString()}</span>
                  </div>
                </div>
                {(selectedPolicy.status === 'Accepted' || (checkbox1 && checkbox2)) ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', alignSelf: 'flex-start' }}
                    onClick={() => setSelectedPolicy(null)}
                  >
                    <i className="fa-solid fa-xmark"></i> Close
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: 0.5, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px', alignSelf: 'flex-start' }}
                    title="Acknowledge policy to enable close"
                  >
                    <i className="fa-solid fa-lock"></i> Locked
                  </button>
                )}
              </div>

              {/* Policy Scroll Content */}
              <div
                ref={policyTextRef}
                onScroll={handleScroll}
                style={{
                  maxHeight: '320px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: 'rgba(255,255,255,0.01)',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  marginBottom: '16px',
                  flexGrow: 1
                }}
              >
                {selectedPolicy.content}
              </div>

              {/* Policy Acceptance Block */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                {selectedPolicy.status === 'Accepted' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald-500)', backgroundColor: 'rgba(16,185,129,0.06)', padding: '12px', borderRadius: '8px' }}>
                    <i className="fa-solid fa-circle-check" style={{ fontSize: '1.2rem' }}></i>
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong>Acknowledgement Confirmed</strong>. You read and accepted this policy version on <strong>{new Date(selectedPolicy.acceptedAt).toLocaleString()}</strong>.
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleAcceptSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* Read bottom reminder banner */}
                    {!hasScrolledToBottom && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rose-500)', fontSize: '0.75rem', fontWeight: 600 }}>
                        <i className="fa-solid fa-arrow-down animate-bounce"></i>
                        Please scroll to the bottom of the policy text to unlock acceptance checkmarks.
                      </div>
                    )}

                    {/* Checkbox 1 */}
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: hasScrolledToBottom ? 'pointer' : 'not-allowed', fontSize: '0.85rem', opacity: hasScrolledToBottom ? 1 : 0.5 }}>
                      <input
                        type="checkbox"
                        checked={checkbox1}
                        onChange={(e) => setCheckbox1(e.target.checked)}
                        disabled={!hasScrolledToBottom}
                        style={{ marginTop: '3px' }}
                      />
                      <span>I have read the policy and accept it. <strong style={{ color: 'var(--rose-500)' }}>*</strong></span>
                    </label>

                    {/* Checkbox 2 */}
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: hasScrolledToBottom ? 'pointer' : 'not-allowed', fontSize: '0.85rem', opacity: hasScrolledToBottom ? 1 : 0.5 }}>
                      <input
                        type="checkbox"
                        checked={checkbox2}
                        onChange={(e) => setCheckbox2(e.target.checked)}
                        disabled={!hasScrolledToBottom}
                        style={{ marginTop: '3px' }}
                      />
                      <span>I have understood the terms and conditions of the company policy and will follow them. <strong style={{ color: 'var(--rose-500)' }}>*</strong></span>
                    </label>

                    {/* Submit acceptance button (appears only when both selected, disabled without selection) */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                      {checkbox1 && checkbox2 ? (
                        <button type="submit" className="btn btn-primary animate-fade-in" style={{ padding: '8px 18px', width: '100%', mdWidth: 'auto' }}>
                          <i className="fa-solid fa-file-signature" style={{ marginRight: '6px' }}></i> Submit Acceptance
                        </button>
                      ) : (
                        <button type="button" className="btn btn-secondary" style={{ padding: '8px 18px', opacity: 0.5, cursor: 'not-allowed', width: '100%', mdWidth: 'auto' }} disabled>
                          Submit Acceptance (Locked)
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePoliciesPage;
