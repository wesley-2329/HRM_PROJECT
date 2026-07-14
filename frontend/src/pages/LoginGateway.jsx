import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { motion } from 'framer-motion';

const LoginGateway = () => {
  const { login, register } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState('hr'); // 'hr' or 'employee'
  const [isSignUp, setIsSignUp] = useState(false);

  // Mascot Eyes & Hands State
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Login States
  const [email, setEmail] = useState('hr@company.com');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up States
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupDept, setSignupDept] = useState('Engineering');
  const [signupRole, setSignupRole] = useState('');
  const [signupAadhaar, setSignupAadhaar] = useState('');
  const [signupPhone, setSignupPhone] = useState('');

  const [authError, setAuthError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);

  const handleRoleSwitch = (selectedRole) => {
    setRole(selectedRole);
    setAuthError('');
    setIsSignUp(false);
    if (selectedRole === 'hr') {
      setEmail('hr@company.com');
      setPassword('admin123');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthenticating(true);

    try {
      await login(email, password, role);
      showToast(`${role === 'hr' ? 'HR Portal' : 'Employee Self-Service'} authenticated.`, 'success');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Authentication failed. Please check credentials.';
      setAuthError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (signupPassword !== signupConfirmPassword) {
      setAuthError('Passwords do not match.');
      showToast('Passwords do not match.', 'error');
      return;
    }

    setAuthenticating(true);

    try {
      await register({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        dept: signupDept,
        role: signupRole,
        aadhaar: signupAadhaar,
        phone: signupPhone
      });
      showToast('Account registered successfully! You can now log in.', 'success');
      setIsSignUp(false);
      setEmail(signupEmail);
      setPassword(signupPassword);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Registration failed. Please check details.';
      setAuthError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setAuthenticating(false);
    }
  };

  return (
    <div id="login-page-wrapper" style={{ display: 'flex', minHeight: '100vh', width: '100%', justifyContent: 'center', alignItems: 'center', background: '#faf8f5', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative light gradient blobs */}
      <div className="blob blob-1" style={{ top: '10%', left: '10%', position: 'absolute', width: '400px', height: '400px', background: 'rgba(79,70,229,0.06)', borderRadius: '50%', filter: 'blur(100px)', zIndex: 1, pointerEvents: 'none' }}></div>
      <div className="blob blob-2" style={{ bottom: '10%', right: '10%', position: 'absolute', width: '400px', height: '400px', background: 'rgba(219,39,119,0.04)', borderRadius: '50%', filter: 'blur(100px)', zIndex: 1, pointerEvents: 'none' }}></div>

      <div id="login-container" style={{ 
        position: 'relative', 
        zIndex: 2, 
        margin: 0, 
        boxShadow: '0 25px 60px rgba(0,0,0,0.04)', 
        border: '1px solid rgba(0,0,0,0.04)', 
        background: '#ffffff', 
        borderRadius: '24px',
        width: '100%',
        maxWidth: '1100px',
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        overflow: 'hidden',
        minHeight: '660px'
      }}>
        
        {/* LEFT COLUMN: Concept Showcase Panel (with dynamic background matching dashboard theme) */}
        <div style={{
          gridColumn: 'span 5',
          background: role === 'hr' 
            ? 'linear-gradient(135deg, #f5f3ff 0%, #faf8f5 100%)' 
            : 'linear-gradient(135deg, #ecfdf5 0%, #faf8f5 100%)',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          color: '#0f172a',
          borderRight: '1px solid rgba(0,0,0,0.04)',
          transition: 'background 0.5s ease'
        }}>
          {/* Dynamic glowing light blobs matching role */}
          <div style={{ 
            position: 'absolute', 
            width: '240px', 
            height: '240px', 
            background: role === 'hr' ? 'rgba(79,70,229,0.08)' : 'rgba(16,185,129,0.08)', 
            borderRadius: '50%', 
            filter: 'blur(60px)', 
            top: '-60px', 
            left: '-60px',
            transition: 'background 0.5s ease'
          }} />
          <div style={{ 
            position: 'absolute', 
            width: '240px', 
            height: '240px', 
            background: role === 'hr' ? 'rgba(219,39,119,0.05)' : 'rgba(4,120,87,0.05)', 
            borderRadius: '50%', 
            filter: 'blur(60px)', 
            bottom: '-60px', 
            right: '-60px',
            transition: 'background 0.5s ease'
          }} />

          {/* Brand header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 5 }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: role === 'hr'
                ? 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.5s ease'
            }}>
              <i className="fa-solid fa-compass" style={{ fontSize: '0.8rem', color: '#ffffff' }} />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '1px', color: '#0f172a' }}>TALENT SPHERE</span>
          </div>

          {/* Dynamic Content Panel based on active Role */}
          <div style={{ zIndex: 5, margin: '40px 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {role === 'hr' ? (
              // HR Portal Concepts (Light Dashboard Theme)
              <motion.div
                key="hr-concepts"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <span style={{ fontSize: '0.7rem', color: '#4f46e5', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                  Workforce Orchestration
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1.2, color: '#0f172a' }}>
                  Statutory Audit & Operations Hub.
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                  Manage department registries, statutory compliance frameworks (PF, ESI, Tax), and real-time security operations control parameters.
                </p>

                {/* Animated Office Desk Working Scene (HR specific checkmarks/stars) */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '16px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                  minHeight: '180px'
                }}>
                  <svg width="240" height="155" viewBox="0 0 240 155" style={{ margin: 'auto' }}>
                    {/* Ground shadow line */}
                    <line x1="20" y1="140" x2="220" y2="140" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
                    
                    {/* Desk Plant Decoration */}
                    <rect x="35" y="115" width="10" height="25" fill="#a7f3d0" rx="2" />
                    <path d="M 32 115 C 28 105 32 100 37 102 C 42 100 46 105 42 115 Z" fill="#10b981" />
                    
                    {/* Office Desk (Slate Wood) */}
                    <rect x="50" y="100" width="160" height="6" rx="3" fill="#64748b" />
                    <line x1="70" y1="106" x2="70" y2="140" stroke="#64748b" strokeWidth="3" />
                    <line x1="190" y1="106" x2="190" y2="140" stroke="#64748b" strokeWidth="3" />
                    
                    {/* Office Chair */}
                    <rect x="122" y="92" width="32" height="6" rx="2" fill="#1e1b4b" />
                    <rect x="146" y="60" width="8" height="34" rx="2" fill="#1e1b4b" />
                    <line x1="138" y1="98" x2="138" y2="130" stroke="#475569" strokeWidth="3.5" />
                    <path d="M 124 130 L 152 130" stroke="#1e1b4b" strokeWidth="2.5" />
                    
                    {/* Person Leaning / Coding / Recruiter Working */}
                    <path d="M 134 88 C 130 74 120 68 123 62" stroke="#312e81" strokeWidth="11" strokeLinecap="round" fill="none" />
                    <circle cx="118" cy="52" r="7.5" fill="#fdba74" />
                    <path d="M 111 52 C 111 45 125 45 125 52 Z" fill="#0f172a" />
                    
                    {/* Typing Arms Animation */}
                    <motion.path 
                      stroke="#312e81" strokeWidth="3.5" fill="none" strokeLinecap="round"
                      animate={{ d: ["M 128 66 Q 112 70 100 92", "M 128 66 Q 112 68 100 91", "M 128 66 Q 112 70 100 92"] }}
                      transition={{ duration: 0.2, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.path 
                      stroke="#312e81" strokeWidth="3.5" fill="none" strokeLinecap="round"
                      animate={{ d: ["M 128 66 Q 115 72 102 92", "M 128 66 Q 115 74 102 93", "M 128 66 Q 115 72 102 92"] }}
                      transition={{ duration: 0.25, repeat: Infinity, ease: 'linear' }}
                    />

                    {/* Laptop Screen & Glowing Rays */}
                    <rect x="80" y="96" width="28" height="4" rx="1" fill="#94a3b8" />
                    <path d="M 98 96 L 108 76 L 106 75 L 96 96 Z" fill="#cbd5e1" />
                    <polygon points="106,76 65,62 65,92" fill="rgba(79, 70, 229, 0.08)" />

                    {/* Floating HR Documents (Hiring contracts / Stars) */}
                    <motion.g 
                      animate={{ y: [0, -26, 0], opacity: [0, 1, 0], scale: [0.8, 1, 0.8] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                      style={{ transformOrigin: '90px 60px' }}
                    >
                      <rect x="80" y="45" width="14" height="18" rx="2" fill="#ffffff" stroke="#4f46e5" strokeWidth="1" />
                      <path d="M 83 54 L 86 57 L 91 51" stroke="#10b981" strokeWidth="1.2" fill="none" />
                    </motion.g>

                    <motion.g 
                      animate={{ y: [0, -20, 0], opacity: [0, 1, 0], scale: [0.8, 1, 0.8] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
                      style={{ transformOrigin: '110px 40px' }}
                    >
                      <polygon points="110,30 112,35 118,36 114,40 115,45 110,42 105,45 106,40 102,36 108,35" fill="#fbbf24" />
                    </motion.g>
                  </svg>
                </div>
              </motion.div>
            ) : (
              // Employee Portal Concepts (Light Dashboard Theme)
              <motion.div
                key="employee-concepts"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                  Employee Self-Service
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1.2, color: '#0f172a' }}>
                  Your Work Directory, Simplified.
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                  Verify your active shift boards, check leave quotas, print audit-verified payslips, and check in to workspaces securely.
                </p>

                {/* Animated Office Desk Working Scene (Employee specific checkins/clocks) */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '16px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                  minHeight: '180px'
                }}>
                  <svg width="240" height="155" viewBox="0 0 240 155" style={{ margin: 'auto' }}>
                    {/* Ground shadow line */}
                    <line x1="20" y1="140" x2="220" y2="140" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
                    
                    {/* Desk Plant Decoration */}
                    <rect x="35" y="115" width="10" height="25" fill="#a7f3d0" rx="2" />
                    <path d="M 32 115 C 28 105 32 100 37 102 C 42 100 46 105 42 115 Z" fill="#10b981" />
                    
                    {/* Office Desk (Slate Wood) */}
                    <rect x="50" y="100" width="160" height="6" rx="3" fill="#64748b" />
                    <line x1="70" y1="106" x2="70" y2="140" stroke="#64748b" strokeWidth="3" />
                    <line x1="190" y1="106" x2="190" y2="140" stroke="#64748b" strokeWidth="3" />
                    
                    {/* Office Chair */}
                    <rect x="122" y="92" width="32" height="6" rx="2" fill="#064e3b" />
                    <rect x="146" y="60" width="8" height="34" rx="2" fill="#064e3b" />
                    <line x1="138" y1="98" x2="138" y2="130" stroke="#475569" strokeWidth="3.5" />
                    <path d="M 124 130 L 152 130" stroke="#064e3b" strokeWidth="2.5" />
                    
                    {/* Person Leaning / Typing */}
                    <path d="M 134 88 C 130 74 120 68 123 62" stroke="#065f46" strokeWidth="11" strokeLinecap="round" fill="none" />
                    <circle cx="118" cy="52" r="7.5" fill="#fdba74" />
                    <path d="M 111 52 C 111 45 125 45 125 52 Z" fill="#1e293b" />
                    
                    {/* Typing Arms Animation */}
                    <motion.path 
                      stroke="#065f46" strokeWidth="3.5" fill="none" strokeLinecap="round"
                      animate={{ d: ["M 128 66 Q 112 70 100 92", "M 128 66 Q 112 78 100 91", "M 128 66 Q 112 70 100 92"] }}
                      transition={{ duration: 0.18, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.path 
                      stroke="#065f46" strokeWidth="3.5" fill="none" strokeLinecap="round"
                      animate={{ d: ["M 128 66 Q 115 82 102 92", "M 128 66 Q 115 84 102 93", "M 128 66 Q 115 82 102 92"] }}
                      transition={{ duration: 0.22, repeat: Infinity, ease: 'linear' }}
                    />

                    {/* Laptop Screen & Glowing Rays */}
                    <rect x="80" y="96" width="28" height="4" rx="1" fill="#94a3b8" />
                    <path d="M 98 96 L 108 76 L 106 75 L 96 96 Z" fill="#cbd5e1" />
                    <polygon points="106,76 65,62 65,92" fill="rgba(16, 185, 129, 0.08)" />

                    {/* Floating Employee Tasks (Shift ticks / Time checks) */}
                    <motion.g 
                      animate={{ y: [0, -28, 0], opacity: [0, 1, 0], scale: [0.8, 1, 0.8] }}
                      transition={{ duration: 3.0, repeat: Infinity, ease: "easeInOut" }}
                      style={{ transformOrigin: '85px 55px' }}
                    >
                      <circle cx="85" cy="45" r="7.5" fill="#10b981" />
                      <path d="M 82 45 L 84 47 L 88 43" stroke="#ffffff" strokeWidth="1.2" fill="none" />
                    </motion.g>

                    <motion.g 
                      animate={{ y: [0, -22, 0], opacity: [0, 1, 0], scale: [0.8, 1, 0.8] }}
                      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                      style={{ transformOrigin: '110px 40px' }}
                    >
                      <rect x="105" y="32" width="12" height="12" rx="2" fill="#3b82f6" />
                      <line x1="108" y1="30" x2="108" y2="33" stroke="#ffffff" strokeWidth="1" />
                      <line x1="112" y1="30" x2="112" y2="33" stroke="#ffffff" strokeWidth="1" />
                    </motion.g>
                  </svg>
                </div>
              </motion.div>
            )}
          </div>

          {/* System Footer information */}
          <div style={{ fontSize: '0.75rem', color: '#64748b', zIndex: 5 }}>
            Talent Sphere AI™ — Operational Security
          </div>
        </div>

        {/* RIGHT COLUMN: The Login Form Panel & Animated Mickey Mouse standing on the right */}
        <div style={{
          gridColumn: 'span 7',
          padding: '40px 48px',
          background: 'rgba(255,255,255,0.95)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {/* Brand header on form */}
          <div className="login-brand" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }} onClick={() => navigate('/')}>
            <i className="fa-solid fa-cube" style={{ color: '#4f46e5' }}></i>
            <span>Talent Sphere</span>
          </div>
          
          <h1 className="login-title" style={{ color: '#0f172a', margin: '0 0 4px 0', fontSize: '1.8rem' }}>
            {isSignUp ? 'Create Employee Account' : 'Welcome Back'}
          </h1>
          <p className="login-subtitle" style={{ marginBottom: '16px', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
            {isSignUp ? 'Registration Form' : (role === 'hr' ? 'HR Director Access' : 'Employee Self-Service')}
          </p>

          {role === 'employee' && (
            <div style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
              {!isSignUp ? (
                <span>New here? <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(true); }} style={{ color: '#4f46e5', fontWeight: 600 }}>Create an account</a></span>
              ) : (
                <span>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(false); }} style={{ color: '#4f46e5', fontWeight: 600 }}>Sign in</a></span>
              )}
            </div>
          )}

          {!isSignUp && (
            <div className="role-toggle" style={{ marginBottom: '16px' }}>
              <button
                type="button"
                className={`role-btn ${role === 'hr' ? 'active' : ''}`}
                onClick={() => handleRoleSwitch('hr')}
              >
                HR Portal
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'employee' ? 'active' : ''}`}
                onClick={() => handleRoleSwitch('employee')}
              >
                Employee Portal
              </button>
            </div>
          )}

          {authError && (
            <div style={{ color: 'hsl(var(--danger))', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
              {authError}
            </div>
          )}

          {/* Form & Mascot Side-by-Side Spacing Container */}
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center', marginTop: '10px' }}>
            
            {/* Left Box: Form fields */}
            <div style={{ flex: '1 1 340px' }}>
              {!isSignUp ? (
                <form onSubmit={handleLoginSubmit}>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label>Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      required
                    />
                  </div>
                  <div className="form-options" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'hsl(var(--text-secondary))', fontSize: '0.8rem' }}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />{' '}
                      Remember me
                    </label>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        showToast('Password reset link sent.', 'info');
                      }}
                      style={{ color: '#4f46e5', fontSize: '0.8rem' }}
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px', background: role === 'hr' ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', borderRadius: '10px', fontWeight: 700, transition: 'background 0.5s ease' }}
                    disabled={authenticating}
                  >
                    {authenticating ? 'Authenticating...' : 'Authenticate & Enter'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignUpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="john@company.com"
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        placeholder="Min 6 chars"
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Confirm Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        placeholder="Confirm"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Department</label>
                      <select
                        className="form-control"
                        value={signupDept}
                        onChange={(e) => setSignupDept(e.target.value)}
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Product">Product</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Operations">Operations</option>
                        <option value="Finance">Finance</option>
                        <option value="Human Resources">Human Resources</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Role</label>
                      <input
                        type="text"
                        className="form-control"
                        value={signupRole}
                        onChange={(e) => setSignupRole(e.target.value)}
                        placeholder="e.g. Developer"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Aadhaar</label>
                      <input
                        type="text"
                        className="form-control"
                        value={signupAadhaar}
                        onChange={(e) => setSignupAadhaar(e.target.value)}
                        placeholder="XXXX-XXXX-XXXX"
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        placeholder="+91 XXXXX"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '6px', padding: '12px', background: role === 'hr' ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', borderRadius: '10px', fontWeight: 700, transition: 'background 0.5s ease' }}
                    disabled={authenticating}
                  >
                    {authenticating ? 'Registering...' : 'Register Account'}
                  </button>
                </form>
              )}
            </div>

            {/* Right Box: standing Mickey Mouse avatar (in the empty space) */}
            <div style={{ 
              flex: '0 0 160px', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              borderLeft: '1px solid rgba(0,0,0,0.05)',
              paddingLeft: '20px',
              minHeight: '260px'
            }}>
              <svg width="120" height="150" viewBox="0 0 120 150" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.06))' }}>
                {/* Mickey Ground Shadow */}
                <ellipse cx="60" cy="120" rx="24" ry="3" fill="rgba(0,0,0,0.08)" />

                {/* Mickey Ears */}
                <circle cx="38" cy="24" r="13" fill="#0f172a" />
                <circle cx="82" cy="24" r="13" fill="#0f172a" />
                
                {/* Mickey Head Background */}
                <circle cx="60" cy="45" r="22" fill="#0f172a" />
                
                {/* Mickey Face Plate */}
                <ellipse cx="60" cy="48" rx="17" ry="13" fill="#ffedd5" />
                <ellipse cx="51" cy="46" rx="9" ry="9" fill="#ffedd5" />
                <ellipse cx="69" cy="46" rx="9" ry="9" fill="#ffedd5" />
                
                {/* Mickey Eyes */}
                {isPasswordFocused ? (
                  <>
                    {/* Closed Eyelids curves */}
                    <path d="M 48 41 Q 53 47 58 41" stroke="#0f172a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                    <path d="M 62 41 Q 67 47 72 41" stroke="#0f172a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    {/* Open Eyes */}
                    <ellipse cx="53" cy="38" rx="4" ry="8" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
                    <ellipse cx="67" cy="38" rx="4" ry="8" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
                    {/* Pupils */}
                    <ellipse cx="53" cy="40" rx="1.8" ry="4.5" fill="#0f172a" />
                    <ellipse cx="67" cy="40" rx="1.8" ry="4.5" fill="#0f172a" />
                  </>
                )}
                
                {/* Nose */}
                <ellipse cx="60" cy="49" rx="4" ry="2.5" fill="#0f172a" />
                
                {/* Smile Mouth */}
                <path d="M 50 53 Q 60 61 70 53" stroke="#0f172a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                
                {/* Cheek folds */}
                <path d="M 48 52 Q 49 54 51 53" stroke="#0f172a" strokeWidth="1" fill="none" />
                <path d="M 72 52 Q 71 54 69 53" stroke="#0f172a" strokeWidth="1" fill="none" />

                {/* Mickey Body Torso (black) */}
                <rect x="53" y="65" width="14" height="25" rx="7" fill="#0f172a" />

                {/* Red Shorts */}
                <path d="M 49 82 L 71 82 Q 73 97 60 97 Q 47 97 49 82" fill="#ef4444" />
                {/* Buttons on Shorts */}
                <ellipse cx="55" cy="89" rx="2" ry="3.2" fill="#ffffff" />
                <ellipse cx="65" cy="89" rx="2" ry="3.2" fill="#ffffff" />

                {/* Legs */}
                <rect x="53" y="96" width="3.5" height="15" fill="#0f172a" />
                <rect x="63.5" y="96" width="3.5" height="15" fill="#0f172a" />

                {/* Yellow Shoes */}
                <ellipse cx="50" cy="112" rx="7.5" ry="4.5" fill="#eab308" stroke="#0f172a" strokeWidth="1" />
                <ellipse cx="70" cy="112" rx="7.5" ry="4.5" fill="#eab308" stroke="#0f172a" strokeWidth="1" />

                {/* Mickey Left Arm and Glove Hand */}
                <motion.path 
                  animate={isPasswordFocused ? { d: "M 53 73 Q 34 52 48 42" } : { d: "M 53 73 Q 32 78 30 84" }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  stroke="#0f172a"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
                <motion.g 
                  animate={isPasswordFocused ? { x: 18, y: -42, rotate: 18 } : { x: 0, y: 0, rotate: -8 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                >
                  <circle cx="30" cy="84" r="6" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
                  <path d="M 28 84 L 26 87" stroke="#0f172a" strokeWidth="0.8" />
                  <path d="M 30 84 L 30 88" stroke="#0f172a" strokeWidth="0.8" />
                  <path d="M 32 84 L 34 87" stroke="#0f172a" strokeWidth="0.8" />
                </motion.g>

                {/* Mickey Right Arm and Glove Hand */}
                <motion.path 
                  animate={isPasswordFocused ? { d: "M 67 73 Q 86 52 72 42" } : { d: "M 67 73 Q 88 78 90 84" }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  stroke="#0f172a"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
                <motion.g 
                  animate={isPasswordFocused ? { x: -18, y: -42, rotate: -18 } : { x: 0, y: 0, rotate: 8 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                >
                  <circle cx="90" cy="84" r="6" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
                  <path d="M 88 84 L 86 87" stroke="#0f172a" strokeWidth="0.8" />
                  <path d="M 90 84 L 90 88" stroke="#0f172a" strokeWidth="0.8" />
                  <path d="M 92 84 L 94 87" stroke="#0f172a" strokeWidth="0.8" />
                </motion.g>
              </svg>
              
              <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '12px', fontWeight: 600, textAlign: 'center' }}>
                {isPasswordFocused ? "Don't peek!" : "Watching..."}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginGateway;
