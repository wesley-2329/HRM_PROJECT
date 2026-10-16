import React, { useState } from 'react';
import { getAvatarUrl } from '../App';
import { formatTimeString } from '../utils/dateUtils';
import { downloadPdfDocument } from '../utils/pdfGenerator';

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
      <div 
        className="modal-content" 
        style={
          id === 'payslip-modal' 
            ? { maxWidth: '750px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' } 
            : (id === 'ledger-modal' ? { maxWidth: '700px' } : {})
        }
      >
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

  // Address States (BUG-010)
  const [door, setDoor] = useState(employee?.address?.door || '');
  const [street, setStreet] = useState(employee?.address?.street || '');
  const [city, setCity] = useState(employee?.address?.city || '');
  const [stateName, setStateName] = useState(employee?.address?.state || '');
  const [pin, setPin] = useState(employee?.address?.pin || '');

  // Emergency Contact States (BUG-010)
  const [emgName, setEmgName] = useState(employee?.emergency?.name || '');
  const [emgRelation, setEmgRelation] = useState(employee?.emergency?.relation || '');
  const [emgPhone, setEmgPhone] = useState(employee?.emergency?.phone || '');

  React.useEffect(() => {
    if (active) {
      setName(employee?.name || '');
      setEmail(employee?.email || '');
      setDept(employee?.dept || 'Engineering');
      setRole(employee?.role || '');
      setAadhaar(employee?.aadhaar || '');
      setPhone(employee?.phone || '');
      setGender(employee?.gender || 'Male');
      setJoined(employee?.joined || '');
      setParentStatus(employee?.parentStatus || 'No');

      setDoor(employee?.address?.door || '');
      setStreet(employee?.address?.street || '');
      setCity(employee?.address?.city || '');
      setStateName(employee?.address?.state || '');
      setPin(employee?.address?.pin || '');

      setEmgName(employee?.emergency?.name || '');
      setEmgRelation(employee?.emergency?.relation || '');
      setEmgPhone(employee?.emergency?.phone || '');
    }
  }, [employee, active]);

  // Phone validation (max 10 numeric digits, auto-trimmed)
  const handlePhoneChange = (e) => {
    const numeric = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(numeric);
  };

  // Aadhaar validation (max 12 numeric digits, auto-trimmed)
  const handleAadhaarChange = (e) => {
    const numeric = e.target.value.replace(/\D/g, '').slice(0, 12);
    setAadhaar(numeric);
  };

  const handleEmgPhoneChange = (e) => {
    const numeric = e.target.value.replace(/\D/g, '').slice(0, 10);
    setEmgPhone(numeric);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      email,
      dept,
      role,
      aadhaar,
      phone,
      gender,
      joined,
      parentStatus,
      address: { door, street, city, state: stateName, pin },
      emergency: { name: emgName, relation: emgRelation, phone: emgPhone }
    });
  };

  return (
    <ModalWrapper id="add-employee-modal" active={active} onClose={onClose}>
      <div className="modal-header">
        <h3 className="modal-title">{employee ? 'Edit Employee Details' : 'Add New Employee'}</h3>
        <button className="close-modal" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
      </div>
      <form onSubmit={handleSubmit} style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: '4px' }}>
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
            <label>Phone Number (10 Digits)</label>
            <input type="text" className="form-control" placeholder="10-digit mobile number" value={phone} onChange={handlePhoneChange} maxLength={10} required />
          </div>
          <div className="form-group">
            <label>Aadhaar Card Number (12 Digits)</label>
            <input type="text" className="form-control" placeholder="12-digit Aadhaar number" value={aadhaar} onChange={handleAadhaarChange} maxLength={12} required />
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

        {/* BUG-010: Address Fields */}
        <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'hsl(var(--primary))', marginTop: '12px', marginBottom: '8px', borderTop: '1px solid hsl(var(--border))', paddingTop: '10px' }}>
          Residential Address
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label>Door / Flat No</label>
            <input type="text" className="form-control" placeholder="Door No" value={door} onChange={(e) => setDoor(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Street / Area</label>
            <input type="text" className="form-control" placeholder="Street Name" value={street} onChange={(e) => setStreet(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <div className="form-group">
            <label>City</label>
            <input type="text" className="form-control" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="form-group">
            <label>State</label>
            <input type="text" className="form-control" placeholder="State" value={stateName} onChange={(e) => setStateName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>PIN Code</label>
            <input type="text" className="form-control" placeholder="PIN Code" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} />
          </div>
        </div>

        {/* BUG-010: Emergency Contact Fields */}
        <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'hsl(var(--primary))', marginTop: '12px', marginBottom: '8px', borderTop: '1px solid hsl(var(--border))', paddingTop: '10px' }}>
          Emergency Contact Details
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <div className="form-group">
            <label>Contact Name</label>
            <input type="text" className="form-control" placeholder="Emergency Contact Name" value={emgName} onChange={(e) => setEmgName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Relationship</label>
            <input type="text" className="form-control" placeholder="e.g. Spouse / Parent" value={emgRelation} onChange={(e) => setEmgRelation(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Contact Phone</label>
            <input type="text" className="form-control" placeholder="10-digit Phone" value={emgPhone} onChange={handleEmgPhoneChange} maxLength={10} />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>Save Employee Record</button>
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
                    <td>{formatTimeString(t.clockIn, t.legacyTimezoneUncertain)}</td>
                    <td>{t.clockOut ? formatTimeString(t.clockOut, t.legacyTimezoneUncertain) : '--'}</td>
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
export const PayslipModal = ({ active, onClose, employee, month, onPrint, showToast }) => {
  if (!employee) return null;

  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const salary = getSalaryDetails(employee.role);
  const cycleMonth = month || 'May 2026';
  const docRef = `PAY-${employee.id}-${cycleMonth.replace(/\s+/g, '')}`;

  const handleDownloadPdf = () => {
    try {
      setDownloading(true);
      const ok = downloadPdfDocument({
        title: 'HR O CORP - OFFICIAL SALARY PAYSLIP',
        subtitle: `Disbursement Period: ${cycleMonth}`,
        docNumber: docRef,
        recipient: `${employee.name} (${employee.id})`,
        metadata: [
          { label: 'Employee Name', value: employee.name },
          { label: 'Employee ID', value: employee.id },
          { label: 'Department', value: employee.dept },
          { label: 'Designation', value: employee.role }
        ],
        sections: [
          {
            heading: '1. Earnings & Allowances',
            table: {
              headers: ['Salary Component', 'Type', 'Amount (INR)'],
              colWidths: [180, 140, 175],
              rows: [
                ['Basic Salary', 'Fixed', `INR ${salary.basic.toLocaleString()}`],
                ['House Rent Allowance (HRA)', 'Allowance', `INR ${salary.hra.toLocaleString()}`],
                ['Special & Other Allowances', 'Variable', `INR ${salary.other.toLocaleString()}`],
                ['GROSS EARNINGS', 'Total', `INR ${salary.gross.toLocaleString()}`]
              ]
            }
          },
          {
            heading: '2. Statutory & Tax Deductions',
            table: {
              headers: ['Deduction Component', 'Category', 'Amount (INR)'],
              colWidths: [180, 140, 175],
              rows: [
                ['Provident Fund (PF)', 'Statutory', `INR ${salary.pf.toLocaleString()}`],
                ['Professional Tax (PT)', 'Statutory', `INR ${salary.profTax.toLocaleString()}`],
                ['TDS / Income Tax', 'Statutory', `INR ${salary.tds.toLocaleString()}`],
                ['TOTAL DEDUCTIONS', 'Total', `INR ${salary.deductions.toLocaleString()}`]
              ]
            }
          },
          {
            heading: '3. Net Disbursed Compensation',
            paragraphs: [
              `Total Net Take-Home Salary for this cycle is INR ${salary.net.toLocaleString()} directly credited to designated salary bank account.`
            ]
          }
        ],
        footer: 'This is a computer-generated official document. No physical signature is required.'
      }, `Payslip_${employee.name.replace(/\s+/g, '_')}_${cycleMonth.replace(/\s+/g, '_')}.pdf`);

      setDownloading(false);
      if (ok !== false) {
        setDownloadSuccess(true);
        if (showToast) {
          showToast(`Payslip PDF downloaded successfully for ${employee.name}!`, 'success');
        }
      }
    } catch (err) {
      console.error('Payslip PDF download failed:', err);
      setDownloading(false);
      if (showToast) {
        showToast('Failed to download PDF. Please try again.', 'error');
      }
    }
  };

  return (
    <ModalWrapper id="payslip-modal" active={active} onClose={onClose}>
      {/* Pinned Header */}
      <div className="modal-header" style={{ marginBottom: '12px' }}>
        <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-file-invoice-dollar" style={{ color: 'hsl(var(--primary))' }}></i>
          <span>Payslip Generated — Official Statement</span>
        </h3>
        <button className="close-modal" onClick={onClose} aria-label="Close modal">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {/* Prominent Confirmation Popup Banner */}
      <div 
        id="payslip-confirmation-banner"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#10b981',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.05rem',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)'
          }}>
            <i className="fa-solid fa-check"></i>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.95rem' }}>
              Payslip Generated Successfully!
            </div>
            <div style={{ fontSize: '0.8rem', color: '#047857' }}>
              Cycle <strong>{cycleMonth}</strong> record for <strong>{employee.name}</strong> ({employee.id}) is verified & ready.
            </div>
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#047857', background: 'rgba(16, 185, 129, 0.18)', padding: '4px 8px', borderRadius: '6px' }}>
          Ref: {docRef}
        </div>
      </div>

      {/* Scrollable Document Preview Body */}
      <div 
        id="payslip-modal-body" 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          background: '#ffffff', 
          color: '#0f172a', 
          padding: '18px', 
          borderRadius: '10px', 
          border: '1px solid #e2e8f0',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ borderBottom: '2px solid hsl(var(--primary))', paddingBottom: '12px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ color: 'hsl(var(--primary))', fontWeight: 800, margin: 0, fontSize: '1.3rem' }}>HR O Corp</h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>Bengaluru Corporate Hub, India</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>PAYSLIP INVOICE</h3>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', margin: '2px 0 0 0' }}>Cycle: {cycleMonth}</p>
          </div>
        </div>
        
        <table style={{ width: '100%', fontSize: '0.85rem', marginBottom: '16px', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '6px 4px', fontWeight: 600, color: '#475569' }}>Employee Name:</td>
              <td style={{ padding: '6px 4px', fontWeight: 700, color: '#0f172a' }}>{employee.name}</td>
              <td style={{ padding: '6px 4px', fontWeight: 600, color: '#475569' }}>Employee ID:</td>
              <td style={{ padding: '6px 4px', fontWeight: 700, color: '#0f172a' }}>{employee.id}</td>
            </tr>
            <tr>
              <td style={{ padding: '6px 4px', fontWeight: 600, color: '#475569' }}>Department:</td>
              <td style={{ padding: '6px 4px' }}>{employee.dept}</td>
              <td style={{ padding: '6px 4px', fontWeight: 600, color: '#475569' }}>Parent Status:</td>
              <td style={{ padding: '6px 4px' }}>{employee.parentStatus || 'No'}</td>
            </tr>
            <tr>
              <td style={{ padding: '6px 4px', fontWeight: 600, color: '#475569' }}>Role Designation:</td>
              <td style={{ padding: '6px 4px' }}>{employee.role}</td>
              <td style={{ padding: '6px 4px', fontWeight: 600, color: '#475569' }}>Net Disbursed:</td>
              <td style={{ padding: '6px 4px', color: '#059669', fontWeight: 800 }}>₹{salary.net.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.875rem', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '8px', color: '#059669', fontWeight: 700, margin: '0 0 8px 0', fontSize: '0.9rem' }}>Earnings</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span>Basic Salary</span><strong>₹{salary.basic.toLocaleString()}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span>HRA Reimbursement</span><strong>₹{salary.hra.toLocaleString()}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span>Other Allowance</span><strong>₹{salary.other.toLocaleString()}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '6px', fontWeight: 700, color: '#0f172a' }}><span>Total Earnings</span><span>₹{salary.gross.toLocaleString()}</span></div>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '8px', color: '#dc2626', fontWeight: 700, margin: '0 0 8px 0', fontSize: '0.9rem' }}>Deductions</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span>Provident Fund (PF)</span><strong>₹{salary.pf.toLocaleString()}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span>Professional Tax</span><strong>₹{salary.profTax.toLocaleString()}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span>TDS Deduction</span><strong>₹{salary.tds.toLocaleString()}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '6px', fontWeight: 700, color: '#0f172a' }}><span>Total Deductions</span><span>₹{salary.deductions.toLocaleString()}</span></div>
          </div>
        </div>

        <div style={{ marginTop: '16px', background: '#ecfdf5', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: '1rem', border: '1px solid #a7f3d0' }}>
          <span style={{ color: '#065f46' }}>NET DISBURSED AMOUNT:</span>
          <span style={{ color: '#059669', fontSize: '1.2rem', fontWeight: 800 }}>₹{salary.net.toLocaleString()}</span>
        </div>
      </div>

      {/* Pinned Action Footer */}
      <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.8rem', color: downloadSuccess ? '#059669' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {downloadSuccess ? (
            <>
              <i className="fa-solid fa-circle-check" style={{ color: '#10b981' }}></i>
              <span style={{ fontWeight: 600 }}>PDF downloaded successfully!</span>
            </>
          ) : (
            <span>Official digital record ready for download</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => {
              window.print();
              if (onPrint) onPrint();
            }}
            title="Print statement"
          >
            <i className="fa-solid fa-print" style={{ marginRight: '6px' }}></i> Print
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            disabled={downloading}
            onClick={handleDownloadPdf}
          >
            <i className={`fa-solid ${downloading ? 'fa-spinner fa-spin' : (downloadSuccess ? 'fa-check' : 'fa-file-arrow-down')}`} style={{ marginRight: '8px' }}></i>
            {downloadSuccess ? 'Download PDF Again' : 'Download PDF'}
          </button>
        </div>
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
export const JoinMeetingModal = ({ active, onClose, onJoin, meeting }) => {
  const meetingUrl = meeting?.link || "https://meet.google.com/new";
  const meetingTitle = meeting?.title || "Virtual Team Session";
  const meetingHost = meeting?.host ? `Hosted by ${meeting.host}` : "Team Sync";

  const handleJoinClick = () => {
    window.open(meetingUrl, '_blank', 'noopener,noreferrer');
    if (onJoin) onJoin(meeting);
  };

  return (
    <ModalWrapper id="join-meeting-modal" active={active} onClose={onClose}>
      <div className="modal-header">
        <h3 className="modal-title">Join Virtual Meeting</h3>
        <button className="close-modal" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
      </div>
      <div style={{ textAlign: 'center', padding: '14px 0' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
          <i className="fa-solid fa-video" style={{ fontSize: '2rem', color: 'hsl(var(--primary))' }}></i>
        </div>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>{meetingTitle}</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>{meetingHost} {meeting?.time ? `• ${meeting.time}` : ''}</p>
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textAlign: 'left', marginBottom: '6px' }}>Meeting Room Link</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" className="form-control" value={meetingUrl} readOnly style={{ fontSize: '0.8rem', background: 'hsl(var(--bg-main))' }} />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                navigator.clipboard.writeText(meetingUrl);
                alert('Meeting link copied to clipboard!');
              }}
              title="Copy Link"
              style={{ padding: '0 12px' }}
            >
              <i className="fa-solid fa-copy"></i>
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleJoinClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px' }}>
            <i className="fa-solid fa-arrow-up-right-from-square"></i> Open & Join
          </button>
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
