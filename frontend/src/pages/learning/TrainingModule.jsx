import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../api';

const TrainingModule = ({ searchQuery = '' }) => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');

  // State
  const [metrics, setMetrics] = useState({
    totalTrainingPrograms: 4,
    completedPrograms: 2,
    tnaRequestsTotal: 3,
    approvedTnaRequests: 2,
    issuedCertificates: 5,
    skillGapClosurePercentage: '88.4%',
    averageAssessmentScore: '86.2%',
    trainingBudgetUtilization: '74.5%'
  });

  const [tnas, setTnas] = useState([]);
  const [annualPlans, setAnnualPlans] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [trainersVenues, setTrainersVenues] = useState([]);
  const [skills, setSkills] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [history, setHistory] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Modals & Form States
  const [showTnaModal, setShowTnaModal] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  // Form inputs
  const [newTna, setNewTna] = useState({ skillGapCategory: 'Technical & Cloud', requestedSkill: '', currentProficiency: 2, targetProficiency: 4, priority: 'High', targetQuarter: 'Q3-2026', justification: '' });
  const [newProgram, setNewProgram] = useState({ title: '', category: 'Technical & Engineering', mode: 'Classroom', durationHours: 8, trainerName: 'Dr. Rajesh Kumar', venueName: 'Auditorium Hall A', capacity: 30 });
  const [newSkill, setNewSkill] = useState({ skillName: '', category: 'Core Technical', department: 'Engineering', requiredLevel: 4, currentLevel: 2 });
  const [selectedItem, setSelectedItem] = useState(null);
  const [enrollingProgId, setEnrollingProgId] = useState(null);

  useEffect(() => {
    fetchModuleData();
  }, [activeTab]);

  const fetchModuleData = async () => {
    try {
      const [mRes, tnaRes, planRes, progRes, tvRes, sklRes, compRes, assRes, histRes, audRes] = await Promise.allSettled([
        api.get('/training/dashboard'),
        api.get('/training/tna'),
        api.get('/training/annual-plan'),
        api.get('/training/programs'),
        api.get('/training/trainers-venues'),
        api.get('/training/skill-matrix'),
        api.get('/training/competency-matrix'),
        api.get('/training/assessments'),
        api.get('/training/learning-history'),
        api.get('/training/audit')
      ]);

      if (mRes.status === 'fulfilled') setMetrics(mRes.value.data);
      if (tnaRes.status === 'fulfilled') setTnas(tnaRes.value.data);
      if (planRes.status === 'fulfilled') setAnnualPlans(planRes.value.data);
      if (progRes.status === 'fulfilled') setPrograms(progRes.value.data);
      if (tvRes.status === 'fulfilled') setTrainersVenues(tvRes.value.data);
      if (sklRes.status === 'fulfilled') setSkills(sklRes.value.data);
      if (compRes.status === 'fulfilled') setCompetencies(compRes.value.data);
      if (assRes.status === 'fulfilled') setAssessments(assRes.value.data);
      if (histRes.status === 'fulfilled') setHistory(histRes.value.data);
      if (audRes.status === 'fulfilled') setAuditLogs(audRes.value.data);
    } catch (e) {
      console.error('Failed to load training module data:', e);
    }
  };

  // Handlers
  const handleCreateTna = async (e) => {
    e.preventDefault();
    try {
      await api.post('/training/tna', newTna);
      showToast('Training Needs Analysis (TNA) requested!', 'success');
      setShowTnaModal(false);
      setNewTna({ skillGapCategory: 'Technical & Cloud', requestedSkill: '', currentProficiency: 2, targetProficiency: 4, priority: 'High', targetQuarter: 'Q3-2026', justification: '' });
      fetchModuleData();
    } catch (err) {
      showToast('Failed to submit TNA request', 'error');
    }
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    try {
      await api.post('/training/programs', {
        ...newProgram,
        trainer: { name: newProgram.trainerName, type: 'Internal' },
        venue: { name: newProgram.venueName, location: 'HQ Bangalore' }
      });
      showToast('Training program scheduled!', 'success');
      setShowProgramModal(false);
      setNewProgram({ title: '', category: 'Technical & Engineering', mode: 'Classroom', durationHours: 8, trainerName: 'Dr. Rajesh Kumar', venueName: 'Auditorium Hall A', capacity: 30 });
      fetchModuleData();
    } catch (err) {
      showToast('Failed to schedule program', 'error');
    }
  };

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    try {
      await api.post('/training/skill-matrix', newSkill);
      showToast('Skill Matrix entry logged!', 'success');
      setShowSkillModal(false);
      setNewSkill({ skillName: '', category: 'Core Technical', department: 'Engineering', requiredLevel: 4, currentLevel: 2 });
      fetchModuleData();
    } catch (err) {
      showToast('Failed to record skill gap', 'error');
    }
  };

  const handleEnrollProgram = async (progId) => {
    if (!progId) {
      showToast('Program identifier is missing', 'error');
      return;
    }
    setEnrollingProgId(progId);
    try {
      await api.post(`/training/programs/${progId}/enroll`, { programId: progId });
      showToast('Enrolled in training program successfully!', 'success');
      await fetchModuleData();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Enrollment failed. Please try again.';
      showToast(errMsg, 'error');
    } finally {
      setEnrollingProgId(null);
    }
  };

  const handleIssueCertificate = async (assId) => {
    try {
      await api.post(`/training/assessments/${assId}/issue-certificate`, { score: 90 });
      showToast('Digital Certificate generated and issued!', 'success');
      setShowCertModal(false);
      fetchModuleData();
    } catch (err) {
      showToast('Failed to issue certificate', 'error');
    }
  };

  return (
    <div className="training-module-container" style={{ padding: '0 0 24px 0', width: '100%', maxWidth: '100%', margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div className="glass-card mb-6" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'hsl(var(--text-primary))', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              background: 'linear-gradient(135deg, #059669, #2563eb)',
              color: '#ffffff',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '1.25rem'
            }}>
              <i className="fa-solid fa-graduation-cap"></i>
            </span>
            Training & Competency Evaluation
          </h1>
          <p style={{ margin: '6px 0 0 0', color: 'hsl(var(--text-secondary))', fontSize: '0.95rem', fontWeight: 500 }}>
            Enterprise L&D Suite — TNA, Annual Plans, Skill & Competency Matrices, Training Calendars & Certificates.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={fetchModuleData} style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="fa-solid fa-rotate"></i> Refresh
          </button>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="sub-nav-tabs" style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '24px',
        borderBottom: '1px solid hsl(var(--border))'
      }}>
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: 'fa-chart-line' },
          { id: 'tna', label: 'Needs Analysis (TNA)', icon: 'fa-magnifying-glass-chart' },
          { id: 'annual-plan', label: 'Annual Training Plan', icon: 'fa-calendar-check' },
          { id: 'calendar', label: 'Training Calendar', icon: 'fa-calendar-days' },
          { id: 'trainers-venues', label: 'Trainers & Venues', icon: 'fa-user-tie' },
          { id: 'skill-matrix', label: 'Skill & Competency Matrix', icon: 'fa-layer-group' },
          { id: 'assessments', label: 'Assessments & Certs', icon: 'fa-certificate' },
          { id: 'portal', label: 'Learning Portal & History', icon: 'fa-book-open' },
          { id: 'analytics', label: 'Reports & Audits', icon: 'fa-file-invoice' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: activeTab === tab.id ? 'none' : '1px solid hsl(var(--border))',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              background: activeTab === tab.id ? 'linear-gradient(135deg, #059669, #047857)' : 'hsl(var(--bg-card))',
              color: activeTab === tab.id ? '#ffffff' : 'hsl(var(--text-primary))',
              boxShadow: activeTab === tab.id ? '0 4px 14px rgba(5,150,105,0.35)' : 'none'
            }}
          >
            <i className={`fa-solid ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'overview' && (
        <div>
          {/* KPI Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="glass-card stat-card-training" style={{ padding: '20px', borderRadius: '14px', borderLeft: '4px solid #047857', backgroundColor: 'hsl(var(--bg-card))' }}>
              <div className="stat-label" style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: 700, letterSpacing: '0.025em' }}>SCHEDULED PROGRAMS</div>
              <div className="stat-value-emerald" style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: '#047857' }}>{metrics.totalTrainingPrograms}</div>
              <div className="stat-sublabel" style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginTop: '4px', fontWeight: 600 }}>{metrics.completedPrograms} Completed this month</div>
            </div>

            <div className="glass-card stat-card-training" style={{ padding: '20px', borderRadius: '14px', borderLeft: '4px solid #1d4ed8', backgroundColor: 'hsl(var(--bg-card))' }}>
              <div className="stat-label" style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: 700, letterSpacing: '0.025em' }}>TNA REQUESTS</div>
              <div className="stat-value-blue" style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: '#1d4ed8' }}>{metrics.tnaRequestsTotal}</div>
              <div className="stat-sublabel" style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginTop: '4px', fontWeight: 600 }}>{metrics.approvedTnaRequests} HR Approved</div>
            </div>

            <div className="glass-card stat-card-training" style={{ padding: '20px', borderRadius: '14px', borderLeft: '4px solid #6d28d9', backgroundColor: 'hsl(var(--bg-card))' }}>
              <div className="stat-label" style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: 700, letterSpacing: '0.025em' }}>ISSUED CERTIFICATES</div>
              <div className="stat-value-purple" style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: '#6d28d9' }}>{metrics.issuedCertificates}</div>
              <div className="stat-sublabel" style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginTop: '4px', fontWeight: 600 }}>Avg Score: {metrics.averageAssessmentScore}</div>
            </div>

            <div className="glass-card stat-card-training" style={{ padding: '20px', borderRadius: '14px', borderLeft: '4px solid #b45309', backgroundColor: 'hsl(var(--bg-card))' }}>
              <div className="stat-label" style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: 700, letterSpacing: '0.025em' }}>SKILL GAP CLOSURE</div>
              <div className="stat-value-amber" style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: '#b45309' }}>{metrics.skillGapClosurePercentage}</div>
              <div className="stat-sublabel" style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginTop: '4px', fontWeight: 600 }}>Budget Utilization: {metrics.trainingBudgetUtilization}</div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="glass-card mb-6" style={{ padding: '20px', borderRadius: '14px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', marginRight: '8px', color: 'hsl(var(--text-primary))' }}><i className="fa-solid fa-bolt text-warning"></i> Quick Actions:</span>
            <button className="btn btn-primary" onClick={() => setShowTnaModal(true)} style={{ borderRadius: '8px', fontSize: '0.85rem' }}>
              <i className="fa-solid fa-magnifying-glass-chart"></i> Submit TNA Request
            </button>
            <button className="btn btn-secondary" onClick={() => setShowProgramModal(true)} style={{ borderRadius: '8px', fontSize: '0.85rem' }}>
              <i className="fa-solid fa-calendar-plus"></i> Schedule Training Program
            </button>
            <button className="btn btn-outline" onClick={() => setShowSkillModal(true)} style={{ borderRadius: '8px', fontSize: '0.85rem' }}>
              <i className="fa-solid fa-layer-group"></i> Record Skill Matrix Entry
            </button>
          </div>

          {/* Upcoming Programs List */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '14px', width: '100%' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>📅 Featured Upcoming Training Workshops</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', width: '100%' }}>
              {programs.map(p => {
                const progIdentifier = p.programId || p._id;
                const isEnrolling = enrollingProgId === progIdentifier;
                const currentUserId = user?.employeeId || user?.id || user?._id;
                const isEnrolled = p.enrolledEmployees && p.enrolledEmployees.some(e =>
                  (e.id && (e.id === currentUserId || e.id === user?.id || e.id === user?.employeeId || e.id === user?._id?.toString())) ||
                  (user?.name && e.name && e.name.toLowerCase() === user.name.toLowerCase())
                );

                return (
                  <div key={p._id || p.programId} style={{ padding: '18px', borderRadius: '12px', background: 'hsl(var(--bg-main))', border: '1px solid hsl(var(--border))', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span className="badge badge-info">{p.category}</span>
                        <span className="badge badge-success">{p.mode}</span>
                      </div>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>{p.title}</h4>
                      <p style={{ margin: '0 0 14px 0', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                        👨‍🏫 Trainer: {p.trainer?.name} | 📍 Venue: {p.venue?.name}
                      </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid hsl(var(--border))', paddingTop: '12px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 600 }}>⏱️ {p.durationHours} Hours | Capacity: {p.capacity}</span>
                      {isEnrolled ? (
                        <button
                          className="btn btn-sm btn-success"
                          disabled
                          style={{ borderRadius: '6px', cursor: 'default', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          <i className="fa-solid fa-check"></i> Enrolled
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleEnrollProgram(progIdentifier)}
                          disabled={isEnrolling}
                          style={{ borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          {isEnrolling ? (
                            <>
                              <i className="fa-solid fa-spinner fa-spin"></i> Enrolling...
                            </>
                          ) : (
                            'Enroll Now'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TNA */}
      {activeTab === 'tna' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '14px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>🔍 Training Needs Analysis (TNA)</h3>
            <button className="btn btn-primary" onClick={() => setShowTnaModal(true)} style={{ borderRadius: '8px' }}>
              <i className="fa-solid fa-plus"></i> Submit TNA Request
            </button>
          </div>

          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(var(--border))', textAlign: 'left', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                  <th style={{ padding: '12px' }}>TNA ID</th>
                  <th style={{ padding: '12px' }}>Employee & Dept</th>
                  <th style={{ padding: '12px' }}>Requested Skill</th>
                  <th style={{ padding: '12px' }}>Proficiency Gap</th>
                  <th style={{ padding: '12px' }}>Priority</th>
                  <th style={{ padding: '12px' }}>Target Quarter</th>
                  <th style={{ padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tnas.map(t => (
                  <tr key={t._id} style={{ borderBottom: '1px solid hsl(var(--border))', color: 'hsl(var(--text-primary))' }}>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{t.tnaId}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600 }}>{t.employee?.name}</div>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>{t.employee?.dept}</span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{t.requestedSkill}</td>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>L{t.currentProficiency} → L{t.targetProficiency} (Gap: {t.targetProficiency - t.currentProficiency})</td>
                    <td style={{ padding: '12px' }}><span className="badge badge-danger">{t.priority}</span></td>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>{t.targetQuarter}</td>
                    <td style={{ padding: '12px' }}><span className="badge badge-success">{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ANNUAL TRAINING PLAN */}
      {activeTab === 'annual-plan' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '14px', width: '100%' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>📋 FY2026 Annual Corporate Training Plan</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {annualPlans.map(plan => (
              <div key={plan._id} style={{ padding: '20px', borderRadius: '12px', background: 'hsl(var(--bg-main))', border: '1px solid hsl(var(--border))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>{plan.title} ({plan.year})</h4>
                  <span className="badge badge-success">{plan.status}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>Allocated Budget</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#047857' }}>₹{plan.allocatedBudget?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>Utilized Budget</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1d4ed8' }}>₹{plan.utilizedBudget?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>Planned Courses</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#b45309' }}>{plan.plannedCoursesCount} Modules</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '14px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>📅 Training Calendar & Scheduling</h3>
            <button className="btn btn-primary" onClick={() => setShowProgramModal(true)} style={{ borderRadius: '8px' }}>
              <i className="fa-solid fa-plus"></i> Schedule Program
            </button>
          </div>

          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(var(--border))', textAlign: 'left', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                  <th style={{ padding: '12px' }}>Program ID</th>
                  <th style={{ padding: '12px' }}>Title & Category</th>
                  <th style={{ padding: '12px' }}>Mode & Duration</th>
                  <th style={{ padding: '12px' }}>Trainer</th>
                  <th style={{ padding: '12px' }}>Venue</th>
                  <th style={{ padding: '12px' }}>Schedule Date</th>
                  <th style={{ padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {programs.map(p => (
                  <tr key={p._id} style={{ borderBottom: '1px solid hsl(var(--border))', color: 'hsl(var(--text-primary))' }}>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{p.programId}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600 }}>{p.title}</div>
                      <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>{p.category}</span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>{p.mode} ({p.durationHours}h)</td>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>{p.trainer?.name}</td>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>{p.venue?.name}</td>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>{new Date(p.scheduleDate).toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}><span className="badge badge-success">{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: TRAINERS & VENUES */}
      {activeTab === 'trainers-venues' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '14px', width: '100%' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>👨‍🏫 Trainer & Venue Repository</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', width: '100%' }}>
            {trainersVenues.map(tv => (
              <div key={tv._id} style={{ padding: '18px', borderRadius: '12px', background: 'hsl(var(--bg-main))', border: '1px solid hsl(var(--border))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge badge-info">{tv.type}</span>
                  <span style={{ color: '#b45309', fontWeight: 700 }}>⭐ {tv.rating} / 5</span>
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>{tv.name}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>{tv.specialization || tv.category}</p>
                <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>📍 {tv.location} | Capacity: {tv.capacity}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SKILL & COMPETENCY MATRIX */}
      {activeTab === 'skill-matrix' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '14px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>📊 Organizational Skill & Competency Matrix</h3>
            <button className="btn btn-primary" onClick={() => setShowSkillModal(true)} style={{ borderRadius: '8px' }}>
              <i className="fa-solid fa-plus"></i> Record Skill Entry
            </button>
          </div>

          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(var(--border))', textAlign: 'left', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                  <th style={{ padding: '12px' }}>Skill ID</th>
                  <th style={{ padding: '12px' }}>Skill Name & Category</th>
                  <th style={{ padding: '12px' }}>Employee</th>
                  <th style={{ padding: '12px' }}>Required Level</th>
                  <th style={{ padding: '12px' }}>Current Level</th>
                  <th style={{ padding: '12px' }}>Gap Score</th>
                  <th style={{ padding: '12px' }}>Evaluator</th>
                </tr>
              </thead>
              <tbody>
                {skills.map(s => (
                  <tr key={s._id} style={{ borderBottom: '1px solid hsl(var(--border))', color: 'hsl(var(--text-primary))' }}>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{s.skillId}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600 }}>{s.skillName}</div>
                      <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>{s.category} ({s.department})</span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>{s.employee?.name}</td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>Level {s.requiredLevel}</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#1d4ed8' }}>Level {s.currentLevel}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${s.gapScore > 1 ? 'badge-danger' : 'badge-success'}`}>Gap: {s.gapScore}</span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>{s.evaluatorName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: ASSESSMENTS & CERTIFICATIONS */}
      {activeTab === 'assessments' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '14px', width: '100%' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>🎓 Online Assessments & Digital Certifications</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', width: '100%' }}>
            {assessments.map(a => (
              <div key={a._id} style={{ padding: '20px', borderRadius: '12px', background: 'hsl(var(--bg-main))', border: '1px solid hsl(var(--border))', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span className="badge badge-info mb-2">Certification Exam</span>
                  <h4 style={{ margin: '4px 0 8px 0', fontSize: '1.1rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>{a.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>Passing Score: {a.passingMarks}% | Questions: {a.totalQuestions}</p>
                </div>
                <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid hsl(var(--border))', paddingTop: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 600 }}>📜 {a.certificateName}</span>
                  <button className="btn btn-sm btn-primary" onClick={() => handleIssueCertificate(a._id)} style={{ borderRadius: '6px' }}>Take Exam & Issue Cert</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: LEARNING PORTAL & HISTORY */}
      {activeTab === 'portal' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '14px', width: '100%' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>📚 My Learning Portal & Completion Records</h3>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(var(--border))', textAlign: 'left', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                  <th style={{ padding: '12px' }}>Program Title</th>
                  <th style={{ padding: '12px' }}>Employee</th>
                  <th style={{ padding: '12px' }}>Completion Date</th>
                  <th style={{ padding: '12px' }}>Score</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Certificate</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h._id} style={{ borderBottom: '1px solid hsl(var(--border))', color: 'hsl(var(--text-primary))' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{h.programTitle}</td>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>{h.employeeName}</td>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>{new Date(h.completionDate).toLocaleDateString()}</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#047857' }}>{h.scoreObtained}%</td>
                    <td style={{ padding: '12px' }}><span className="badge badge-success">{h.status}</span></td>
                    <td style={{ padding: '12px' }}>
                      {h.certificateUrl && <a href={h.certificateUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline" style={{ borderRadius: '6px', fontSize: '0.75rem' }}>View Cert</a>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 9: ANALYTICS & AUDITS */}
      {activeTab === 'analytics' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '14px', width: '100%' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>📊 Training Audit Trail & KPI Analytics</h3>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(var(--border))', textAlign: 'left', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                  <th style={{ padding: '12px' }}>Timestamp</th>
                  <th style={{ padding: '12px' }}>Entity</th>
                  <th style={{ padding: '12px' }}>Entity ID</th>
                  <th style={{ padding: '12px' }}>Action</th>
                  <th style={{ padding: '12px' }}>Performed By</th>
                  <th style={{ padding: '12px' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(l => (
                  <tr key={l._id} style={{ borderBottom: '1px solid hsl(var(--border))', fontSize: '0.85rem', color: 'hsl(var(--text-primary))' }}>
                    <td style={{ padding: '12px' }}>{new Date(l.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{l.entityType}</td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{l.entityId}</td>
                    <td style={{ padding: '12px' }}><span className="badge badge-info">{l.action}</span></td>
                    <td style={{ padding: '12px' }}>{l.performedBy?.name} ({l.performedBy?.role})</td>
                    <td style={{ padding: '12px', color: 'hsl(var(--text-secondary))' }}>{l.comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT TNA */}
      {showTnaModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '500px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ marginTop: 0 }}>🔍 Training Needs Analysis (TNA) Form</h3>
            <form onSubmit={handleCreateTna}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Requested Skill / Topic</label>
                <input type="text" className="input" required value={newTna.requestedSkill} onChange={e => setNewTna({ ...newTna, requestedSkill: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Justification</label>
                <textarea className="input" required rows="3" value={newTna.justification} onChange={e => setNewTna({ ...newTna, justification: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px' }}></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowTnaModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit TNA Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE PROGRAM */}
      {showProgramModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '500px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ marginTop: 0 }}>📅 Schedule Training Program</h3>
            <form onSubmit={handleCreateProgram}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Program Title</label>
                <input type="text" className="input" required value={newProgram.title} onChange={e => setNewProgram({ ...newProgram, title: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Duration (Hours)</label>
                <input type="number" className="input" required value={newProgram.durationHours} onChange={e => setNewProgram({ ...newProgram, durationHours: Number(e.target.value) })} style={{ width: '100%', padding: '8px', borderRadius: '6px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowProgramModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule Workshop</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SKILL ENTRY */}
      {showSkillModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '500px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ marginTop: 0 }}>📊 Record Skill Entry</h3>
            <form onSubmit={handleCreateSkill}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Skill Name</label>
                <input type="text" className="input" required value={newSkill.skillName} onChange={e => setNewSkill({ ...newSkill, skillName: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowSkillModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Skill Matrix</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TrainingModule;
