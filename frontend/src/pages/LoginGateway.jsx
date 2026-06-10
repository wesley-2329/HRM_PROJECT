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
      setEmail('emp@company.com');
      setPassword('emp123');
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
    <div id="login-container">
      <div className="login-left" style={isSignUp ? { overflowY: 'auto', padding: '30px 40px' } : {}}>
        <div className="login-brand">
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
  );
};

export default LoginGateway;
