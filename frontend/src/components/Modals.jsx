import React, { useState } from 'react';
import { getAvatarUrl } from '../App';

const getSalaryDetails = (role) => {
  let basic = 65000;
  const lowerRole = (role || '').toLowerCase();
  if (lowerRole.includes('director') || lowerRole === 'hr') {
    basic = 95000;
  } else if (lowerRole.includes('lead') || lowerRole.includes('manager')) {
    basic = 80000;
  } else if (lowerRole.includes('senior') || lowerRole.includes('analyst')) {
    basic = 70000;
  } else if (lowerRole.includes('engineer') || lowerRole.includes('developer')) {
    basic = 65000;
  }
  
  const hra = 15000;
  const other = 5000;
  const gross = basic + hra + other;
  
  const pf = Math.round(basic * 0.12);
  const profTax = 250;
  const tds = Math.round(basic * 0.0723);
  const deductions = pf + profTax + tds;
  const net = gross - deductions;
  
  return { basic, hra, other, gross, pf, profTax, tds, deductions, net };
};

// Wrapper for all modals to apply styling
export const ModalWrapper = ({ id, active, onClose, children }) => {
  return (
    <div className={`modal-overlay ${active ? 'active' : ''}`} id={id}>
      <div className="modal-content" style={id === 'ledger-modal' || id === 'payslip-modal' ? { maxWidth: '700px' } : {}}>
        {children}
      </div>
    </div>
  );
};

// 1. Add / Edit Employee Modal
export const AddEmployeeModal = ({ active, onClose, onSubmit, employee }) => {
  const [name, setName] = useState(employee?.name || '');
  const [email, setEmail] = useState(employee?.email || '');
  const [dept, setDept] = useState(employee?.dept || 'Engineering');
  const [role, setRole] = useState(employee?.role || '');
  const [aadhaar, setAadhaar] = useState(employee?.aadhaar || '');
  const [phone, setPhone] = useState(employee?.phone || '');
  const [gender, setGender] = useState(employee?.gender || 'Male');
  const [joined, setJoined] = useState(employee?.joined || '');
  const [parentStatus, setParentStatus] = useState(employee?.parentStatus || 'No');

  React.useEffect(() => {
    setName(employee?.name || '');
    setEmail(employee?.email || '');
    setDept(employee?.dept || 'Engineering');
    setRole(employee?.role || '');
    setAadhaar(employee?.aadhaar || '');
    setPhone(employee?.phone || '');
    setGender(employee?.gender || 'Male');
    setJoined(employee?.joined || '');
    setParentStatus(employee?.parentStatus || 'No');
  }, [employee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, email, dept, role, aadhaar, phone, gender, joined, parentStatus });
  };

  return (
    <ModalWrapper id="add-employee-modal" active={active} onClose={onClose}>
      <div className="modal-header">
        <h3 className="modal-title">{employee ? 'Edit Employee' : 'Add Employee'}</h3>
        <button className="close-modal" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label>Department</label>
            <select className="form-control" value={dept} onChange={(e) => setDept(e.target.value)}>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
          <div className="form-group">
            <label>Designation Role</label>
            <input type="text" className="form-control" value={role} onChange={(e) => setRole(e.target.value)} required />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" className="form-control" placeholder="+91 XXXXX XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Aadhaar Card Number</label>
            <input type="text" className="form-control" placeholder="XXXX-XXXX-XXXX" value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} required />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label>Joining Date</label>
            <input type="date" className="form-control" value={joined} onChange={(e) => setJoined(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select className="form-control" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Parent Status</label>
          <input type="text" className="form-control" placeholder="e.g. Yes (2 Children) or No" value={parentStatus} onChange={(e) => setParentStatus(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Employee Record</button>
      </form>
    </ModalWrapper>
  );
};

// 2. Employee Ledger Modal
export const LedgerModal = ({ active, onClose, employee, timesheets = [], leaves = [] }) => {
  if (!employee) return null;

  const empTimesheets = timesheets.filter(t => t.empId === employee.id);
  const empLeaves = leaves.filter(l => l.empId === employee.id);

  const salary = getSalaryDetails(employee.role);

  return (
    <ModalWrapper id="ledger-modal" active={active} onClose={onClose}>
      <div className="modal-header">
        <h3 className="modal-title">Employee Ledger View</h3>
        <button className="close-modal" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
          <img src={getAvatarUrl(employee)} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} alt="profile" />
          <div>
            <h3>{employee.name}</h3>
            <p>{employee.role} | Department: {employee.dept}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Emp ID: {employee.id}</p>
          </div>
        </div>

        <h4 style={{ marginBottom: '10px' }}>Recent Attendance Timesheet Logs</h4>
        <div className="table-responsive" style={{ marginBottom: '20px' }}>
          <table className="custom-table" style={{ fontSize: '0.8rem' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {empTimesheets.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>No attendance logged.</td></tr>
              ) : (
                empTimesheets.map((t, idx) => (
                  <tr key={idx}>
                    <td>{t.date}</td>
                    <td>{t.clockIn}</td>
                    <td>{t.clockOut || '--'}</td>
                    <td>{t.hours} Hrs</td>
                    <td><span className={`badge ${t.status === 'Punctual' ? 'badge-success' : 'badge-warning'}`}>{t.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <h4 style={{ marginBottom: '10px' }}>Leave History</h4>
        <ul style={{ marginLeft: '20px', fontSize: '0.875rem', marginBottom: '20px' }}>
          {empLeaves.length === 0 ? (
            <li>No leave logs found.</li>
          ) : (
            empLeaves.map((l, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>
                {l.type} Leave ({l.start} to {l.end}) - <span className={`badge ${l.status === 'Approved' ? 'badge-success' : l.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{l.status}</span>
              </li>
            ))
          )}
        </ul>

        <h4 style={{ marginBottom: '10px' }}>Payroll Summary</h4>
        <div style={{ padding: '12px', background: 'hsl(var(--bg-main))', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
          <span>Gross Basic: <strong>₹{salary.gross.toLocaleString()}</strong></span>
          <span>Deductions: <strong>₹{salary.deductions.toLocaleString()}</strong></span>
          <span>Net Salary Dispense: <strong>₹{salary.net.toLocaleString()}</strong></span>
        </div>
      </div>
    </ModalWrapper>
  );
};

// 3. Employee Stats Modal
export const StatsModal = ({ active, onClose, employee, timesheets = [], leaves = [] }) => {
  if (!employee) return null;
  const empTimesheets = timesheets.filter(t => t.empId === employee.id);
  const presentDays = empTimesheets.filter(t => t.status === 'Punctual' || t.status === 'Late Entry').length;
  const leavesTaken = leaves.filter(l => l.empId === employee.id && l.status === 'Approved').length;

  return (
    <ModalWrapper id="stats-modal" active={active} onClose={onClose}>
      <div className="modal-header">
        <h3 className="modal-title">Employee Statistics Overview</h3>
        <button className="close-modal" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <img src={getAvatarUrl(employee)} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} alt="profile" />
          <div>
            <h4>{employee.name}</h4>
            <p>{employee.role}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.875rem' }}>
          <div style={{ background: 'hsl(var(--bg-main))', padding: '10px', borderRadius: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total Days Present</span>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '4px' }}>{presentDays || 22} Days</p>
          </div>
          <div style={{ background: 'hsl(var(--bg-main))', padding: '10px', borderRadius: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total Leaves Taken</span>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '4px' }}>{leavesTaken || 2} Days</p>
          </div>
          <div style={{ background: 'hsl(var(--bg-main))', padding: '10px', borderRadius: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total Payroll Paid YTD</span>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '4px' }}>₹4,33,500</p>
          </div>
          <div style={{ background: 'hsl(var(--bg-main))', padding: '10px', borderRadius: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Performance Rating</span>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '4px', color: 'hsl(var(--warning))' }}><i className="fa-solid fa-star"></i> 4.2</p>
          </div>
          <div style={{ background: 'hsl(var(--bg-main))', padding: '10px', borderRadius: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Task Completion Rate</span>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '4px' }}>88.2%</p>
          </div>
          <div style={{ background: 'hsl(var(--bg-main))', padding: '10px', borderRadius: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Trainings Completed</span>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '4px' }}>3 Courses</p>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

// 4. Payslip Modal
export const PayslipModal = ({ active, onClose, employee, month, onPrint }) => {
  if (!employee) return null;

  const salary = getSalaryDetails(employee.role);

  return (
    <ModalWrapper id="payslip-modal" active={active} onClose={onClose}>
      <div className="modal-header">
        <h3 className="modal-title">Payslip Invoice Details</h3>
        <button className="close-modal" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
      </div>
      <div id="payslip-modal-body" style={{ background: '#fff', color: '#0f172a', padding: '20px', borderRadius: '8px' }}>
        <div style={{ borderBottom: '2px solid hsl(var(--primary))', paddingBottom: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ color: 'hsl(var(--primary))', fontWeight: 700 }}>HRorbit Corp</h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Bengaluru Office, India</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3>PAYSLIP INVOICE</h3>
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Cycle: {month || 'May 2026'}</p>
          </div>
        </div>
        
        <table style={{ width: '100%', fontSize: '0.85rem', marginBottom: '20px', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px', fontWeight: 600 }}>Employee Name:</td><td>{employee.name}</td>
              <td style={{ padding: '4px', fontWeight: 600 }}>Employee ID:</td><td>{employee.id}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px', fontWeight: 600 }}>Department:</td><td>{employee.dept}</td>
              <td style={{ padding: '4px', fontWeight: 600 }}>Parent Status:</td><td>{employee.parentStatus || 'No'}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px', fontWeight: 600 }}>Role Designation:</td><td>{employee.role}</td>
              <td style={{ padding: '4px', fontWeight: 600 }}>Net Pay:</td><td><strong>₹{salary.net.toLocaleString()}</strong></td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.875rem', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
          <div>
            <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '10px', color: 'hsl(var(--success))' }}>Earnings</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span>Basic Salary</span><strong>₹{salary.basic.toLocaleString()}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span>HRA Reimbursement</span><strong>₹{salary.hra.toLocaleString()}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span>Other Allowance</span><strong>₹{salary.other.toLocaleString()}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '6px', fontWeight: 700 }}><span>Total Earnings</span><span>₹{salary.gross.toLocaleString()}</span></div>
          </div>
          <div>
            <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '10px', color: 'hsl(var(--danger))' }}>Deductions</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span>Provident Fund (PF)</span><strong>₹{salary.pf.toLocaleString()}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span>Professional Tax</span><strong>₹{salary.profTax.toLocaleString()}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span>TDS Deduction</span><strong>₹{salary.tds.toLocaleString()}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '6px', fontWeight: 700 }}><span>Total Deductions</span><span>₹{salary.deductions.toLocaleString()}</span></div>
          </div>
        </div>

        <div style={{ marginTop: '20px', background: '#f1f5f9', padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.05rem', border: '1px solid #cbd5e1' }}>
          <span>NET DISBURSED AMOUNT:</span>
          <span style={{ color: 'hsl(var(--primary))' }}>₹{salary.net.toLocaleString()}</span>
        </div>
      </div>
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button className="btn btn-secondary" onClick={onClose}>Close</button>
        <button className="btn btn-primary" onClick={onPrint}>Print / Download PDF</button>
      </div>
    </ModalWrapper>
  );
};

// 5. Add Walk-in Candidate Modal
export const AddWalkinModal = ({ active, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [notes, setNotes] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [currentPosition, setCurrentPosition] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [lastSalary, setLastSalary] = useState('');
  const [workingStatus, setWorkingStatus] = useState('');
  const [skills, setSkills] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, role, experience, notes, phone, email, currentPosition, currentCompany, lastSalary, workingStatus, skills });
    setName(''); setRole(''); setExperience(''); setNotes('');
    setPhone(''); setEmail(''); setCurrentPosition(''); setCurrentCompany('');
    setLastSalary(''); setWorkingStatus(''); setSkills('');
  };

  return (
    <ModalWrapper id="add-walkin-modal" active={active} onClose={onClose}>
      <div className="modal-header">
        <h3 className="modal-title">Add Recruitment Candidate</h3>
        <button className="close-modal" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Applied Position</label>
            <input type="text" className="form-control" value={role} onChange={(e) => setRole(e.target.value)} required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label>Email ID</label>
            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Mobile Number</label>
            <input type="text" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label>Current Position</label>
            <input type="text" className="form-control" value={currentPosition} onChange={(e) => setCurrentPosition(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Current Company</label>
            <input type="text" className="form-control" value={currentCompany} onChange={(e) => setCurrentCompany(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label>Experience (Years)</label>
            <input type="text" className="form-control" value={experience} onChange={(e) => setExperience(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Last Salary (LPA)</label>
            <input type="text" className="form-control" value={lastSalary} onChange={(e) => setLastSalary(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label>Working Status</label>
            <select className="form-control" value={workingStatus} onChange={(e) => setWorkingStatus(e.target.value)}>
              <option value="">Select Working Status</option>
              <option value="Serving Notice">Serving Notice</option>
              <option value="Immediate Joiner">Immediate Joiner</option>
              <option value="Looking for Change">Looking for Change</option>
              <option value="Currently Employed">Currently Employed</option>
            </select>
          </div>
          <div className="form-group">
            <label>Skills (comma separated)</label>
            <input type="text" className="form-control" placeholder="React, Node, Python" value={skills} onChange={(e) => setSkills(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>Notes / Feedback</label>
          <textarea className="form-control" style={{ height: '70px' }} value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Candidate</button>
      </form>
    </ModalWrapper>
  );
};

// 6. Raise Support Ticket Modal
export const RaiseTicketModal = ({ active, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('HR Query');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Low');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, category, description, priority });
    setTitle(''); setDescription('');
  };

  return (
    <ModalWrapper id="raise-ticket-modal" active={active} onClose={onClose}>
      <div className="modal-header">
        <h3 className="modal-title">Raise Support Ticket</h3>
        <button className="close-modal" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Ticket Subject</label>
          <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="HR Query">HR Query</option>
            <option value="IT Support">IT Support</option>
            <option value="Payroll Issue">Payroll Issue</option>
            <option value="Leave Related">Leave Related</option>
            <option value="Purchase Request">Purchase Request</option>
            <option value="Store / Inventory Requirement">Store / Inventory Requirement</option>
            <option value="Advance Amount Request">Advance Amount Request</option>
            <option value="Employee Feedback">Employee Feedback</option>
          </select>
        </div>
        <div className="form-group">
          <label>Priority</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label><input type="radio" name="priority" value="Low" checked={priority === 'Low'} onChange={() => setPriority('Low')} /> Low</label>
            <label><input type="radio" name="priority" value="Medium" checked={priority === 'Medium'} onChange={() => setPriority('Medium')} /> Medium</label>
            <label><input type="radio" name="priority" value="High" checked={priority === 'High'} onChange={() => setPriority('High')} /> High</label>
          </div>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea className="form-control" style={{ height: '80px' }} value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Ticket</button>
      </form>
    </ModalWrapper>
  );
};

// 7. Virtual Session Meeting Join Modal
export const JoinMeetingModal = ({ active, onClose, onJoin }) => {
  return (
    <ModalWrapper id="join-meeting-modal" active={active} onClose={onClose}>
      <div className="modal-header">
        <h3 className="modal-title">Join Virtual Session</h3>
        <button className="close-modal" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
      </div>
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <i className="fa-solid fa-video" style={{ fontSize: '3rem', color: 'hsl(var(--primary))', marginBottom: '16px' }}></i>
        <p style={{ fontSize: '0.95rem', marginBottom: '16px' }}>You are about to join the team video session.</p>
        <div className="form-group">
          <input type="text" className="form-control" value="https://meet.hrorbit.company/join/tck-standup" readOnly />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => { navigator.clipboard.writeText("https://meet.hrorbit.company/join/tck-standup"); }}>Copy Link</button>
          <button className="btn btn-primary" onClick={onJoin}>Join Meeting</button>
        </div>
      </div>
    </ModalWrapper>
  );
};

// 8. Add Task Modal
export const AddTaskModal = ({ active, onClose, onSubmit, teammates = [] }) => {
  const [title, setTitle] = useState('');
  const [project, setProject] = useState('');
  const [priority, setPriority] = useState('High');
  const [due, setDue] = useState('');
  const [assigneeEmail, setAssigneeEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    let targetEmpId = '';
    if (teammates.length > 0) {
      if (assigneeEmail) {
        const matched = teammates.find(t => t.email.toLowerCase() === assigneeEmail.trim().toLowerCase());
        if (!matched) {
          alert('You can only assign tasks to your direct teammates by entering their email address.');
          return;
        }
        targetEmpId = matched.id;
      }
    }
    onSubmit({ title, project, priority, due, empId: targetEmpId });
    setTitle('');
    setProject('');
    setDue('');
    setAssigneeEmail('');
  };

  const isInvalidEmail = assigneeEmail && teammates.length > 0 && !teammates.some(t => t.email.toLowerCase() === assigneeEmail.trim().toLowerCase());

  return (
    <ModalWrapper id="add-task-modal" active={active} onClose={onClose}>
      <div className="modal-header">
        <h3 className="modal-title">Create New Task</h3>
        <button className="close-modal" type="button" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Task Title</label>
          <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Project Name</label>
          <input type="text" className="form-control" value={project} onChange={(e) => setProject(e.target.value)} required />
        </div>
        {teammates && teammates.length > 0 && (
          <div className="form-group">
            <label>Assignee Email Address (Direct Teammate)</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="teammate@company.com" 
              value={assigneeEmail} 
              onChange={(e) => setAssigneeEmail(e.target.value)}
              list="teammate-emails"
            />
            <datalist id="teammate-emails">
              {teammates.map(t => (
                <option key={t.id} value={t.email}>{t.name}</option>
              ))}
            </datalist>
            {isInvalidEmail && (
              <p style={{ color: 'hsl(var(--danger))', fontSize: '0.75rem', marginTop: '4px' }}>
                ⚠️ Must belong to a direct teammate.
              </p>
            )}
          </div>
        )}
        <div className="form-group">
          <label>Priority</label>
          <select className="form-control" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="form-group">
          <label>Due Date</label>
          <input type="date" className="form-control" value={due} onChange={(e) => setDue(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isInvalidEmail}>Create Task</button>
      </form>
    </ModalWrapper>
  );
};
