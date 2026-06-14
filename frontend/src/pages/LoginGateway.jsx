import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const LoginGateway = () => {
  const { login, register } = useContext(AuthContext);
  const { showToast } = useToast();

  const [role, setRole] = useState('hr'); // 'hr' or 'employee'
  const [isSignUp, setIsSignUp] = useState(false);

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

  const handleScrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="landing-wrapper">
      {/* Top Fixed Navbar */}
      <nav id="landing-nav">
        <a href="#" className="landing-nav-logo" onClick={(e) => { e.preventDefault(); handleScrollToSection('landing-hero'); }}>
          <i className="fa-solid fa-layer-group"></i>
          <span>TalentSphere</span>
        </a>
        <button className="btn btn-primary" onClick={() => handleScrollToSection('landing-login')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          Log In Portal
        </button>
      </nav>

      {/* Hero Section */}
      <section id="landing-hero">
        <div className="blob blob-1" style={{ top: '20%', left: '20%' }}></div>
        <div className="blob blob-2" style={{ bottom: '20%', right: '20%' }}></div>

        <div className="falling-word-container">
          {'TALENTSPHERE'.split('').map((letter, idx) => (
            <span
              key={idx}
              className="falling-letter"
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              {letter}
            </span>
          ))}
        </div>
        <p className="hero-subtitle">
          Next-Generation Human Resource Management System
        </p>

        <a href="#" className="scroll-indicator" onClick={(e) => { e.preventDefault(); handleScrollToSection('landing-login'); }}>
          <span>Explore Portals</span>
          <div className="scroll-icon"></div>
        </a>
      </section>

      {/* Login Portal Section */}
      <section id="landing-login">
        <div id="login-container">
          <div className="login-left" style={isSignUp ? { overflowY: 'auto', padding: '30px 40px' } : {}}>
            <div className="login-brand" style={{ cursor: 'pointer' }} onClick={() => handleScrollToSection('landing-hero')}>
              <i className="fa-solid fa-layer-group"></i>
              <span>TalentSphere</span>
            </div>
            <h1 className="login-title">{isSignUp ? 'Create Employee Account' : 'Welcome Back'}</h1>
            <p className="login-subtitle" style={{ marginBottom: '8px' }}>
              {isSignUp ? 'Registration Form' : (role === 'hr' ? 'HR Director Access' : 'Employee Self-Service')}
            </p>

            {role === 'employee' && (
              <div style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
                {!isSignUp ? (
                  <span>New here? <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(true); }} style={{ color: 'hsl(var(--primary))', fontWeight: 600 }}>Create an account</a></span>
                ) : (
                  <span>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(false); }} style={{ color: 'hsl(var(--primary))', fontWeight: 600 }}>Sign in</a></span>
                )}
              </div>
            )}

            {!isSignUp && (
              <div className="role-toggle" style={{ marginBottom: '20px' }}>
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

            {!isSignUp ? (
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-options">
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
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
                  >
                    Forgot Password?
                  </a>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={authenticating}
                >
                  {authenticating ? 'Authenticating...' : 'Authenticate & Enter'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUpSubmit}>
                <div className="form-group">
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

                <div className="form-group">
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Department</label>
                    <select
                      className="form-control"
                      value={signupDept}
                      onChange={(e) => setSignupDept(e.target.value)}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Finance">Finance</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Role Designation</label>
                    <input
                      type="text"
                      className="form-control"
                      value={signupRole}
                      onChange={(e) => setSignupRole(e.target.value)}
                      placeholder="e.g. Software Engineer"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Aadhaar Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={signupAadhaar}
                      onChange={(e) => setSignupAadhaar(e.target.value)}
                      placeholder="XXXX-XXXX-XXXX"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '10px' }}
                  disabled={authenticating}
                >
                  {authenticating ? 'Registering...' : 'Register Account'}
                </button>
              </form>
            )}
          </div>

          <div className="login-right">
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="glass-card">
              <div
                style={{
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  color: '#a5b4fc',
                  marginBottom: '8px',
                }}
              >
                TalentSphere AI™
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>Next-Gen HRM Systems</h2>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#cbd5e1', marginBottom: '24px' }}>
                Transforming resource distribution, employee onboarding metrics, and payroll audit workflows seamlessly.
              </p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <i className="fa-solid fa-users" style={{ marginRight: '6px' }}></i> Active Staff
                  </span>
                  <strong style={{ fontSize: '0.95rem' }}>24 Headcount</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <i className="fa-solid fa-clock" style={{ marginRight: '6px' }}></i> Live Shift Quality
                  </span>
                  <strong style={{ fontSize: '0.95rem', color: '#34d399' }}>98.4% Punctuality</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer id="landing-footer">
        <div className="footer-grid">
          <div className="footer-col">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-layer-group" style={{ color: '#6366f1' }}></i> TalentSphere
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '10px' }}>
              Enterprise-grade Human Resource Management and Operations platform.
            </p>
          </div>
          <div className="footer-col">
            <h3>Portals</h3>
            <ul className="footer-links">
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleRoleSwitch('hr'); handleScrollToSection('landing-login'); }}>HR Director Access</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleRoleSwitch('employee'); handleScrollToSection('landing-login'); }}>Employee Self-Service</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Support & Contact</h3>
            <ul className="footer-links">
              <li><a href="mailto:support@talentsphere.io">support@talentsphere.io</a></li>
              <li><a href="tel:+18005550199">1-800-555-0199</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} TalentSphere Inc. All rights reserved. Powered by TalentSphere AI™.
        </div>
      </footer>
    </div>
  );
};

export default LoginGateway;
