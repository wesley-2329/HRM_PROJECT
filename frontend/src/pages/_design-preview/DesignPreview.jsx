// Design-direction preview (Stage 3). Standalone page at /design-preview — it does not touch any real
// page, API, context or state. Employee rows are fictional sample data. Remove this folder and its
// route in App.jsx before merging the redesign into main.
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup, useReducedMotion, animate } from 'framer-motion';
import './designPreview.css';

const DIRECTIONS = {
  1: {
    name: 'Premium Enterprise',
    concept: 'Calm, trustworthy and dense. White surfaces, a deep indigo accent, crisp 1px borders and soft shadows. Motion is quick and functional (150–250 ms fades) so it never slows power users down.',
    why: 'Feels like Workday / Rippling-class software: HR staff spend hours in it, so clarity and density beat decoration.',
    swatches: ['#f6f7f9', '#ffffff', '#4338ca', '#101828', '#067647', '#b54708'],
    motion: { y: 8, duration: 0.25, stagger: 0.035, hoverY: -2, spring: false },
    navStyle: 'pill',
  },
  2: {
    name: 'Modern Interactive',
    concept: 'Energetic but controlled. A gradient hero, frosted-glass top bar, larger rounded corners, cards that lift and glow under the cursor, springy micro-interactions and counting KPIs.',
    why: 'Most "wow" in a live demo. Gradients are limited to the hero and primary buttons so data screens stay readable.',
    swatches: ['#f5f6fb', '#ffffff', '#5b4ee6', '#3b6ef6', '#14142b', '#0a7d55'],
    motion: { y: 16, duration: 0.45, stagger: 0.06, hoverY: -4, spring: true },
    navStyle: 'pill',
  },
  3: {
    name: 'Minimal + Motion',
    concept: 'Editorial and spacious. Warm off-white, near-black type, one teal accent, hairline borders and almost no shadows. Larger numbers and generous spacing; elegance comes from slower, smooth entrances and an underline that glides between menu items.',
    why: 'Looks the most "designed" and timeless; very easy to keep consistent across 90 modules.',
    swatches: ['#fbfaf8', '#ffffff', '#1c1b19', '#0f6e66', '#57534e', '#2f7a3e'],
    motion: { y: 12, duration: 0.6, stagger: 0.08, hoverY: 0, spring: false },
    navStyle: 'underline',
  },
};

// Real menu groups and items from HRTopNavbar.jsx
const NAV = [
  { group: 'Overview', icon: 'fa-chart-line', items: [['Overview Dashboard', 'HR executive KPIs, live analytics & attendance', 'fa-chart-line']] },
  { group: 'Workforce', icon: 'fa-users-gear', items: [['Employee Master', 'Manage employees, documents & status', 'fa-users'], ['Org Structure', 'Organization hierarchy & reporting lines', 'fa-sitemap']] },
  { group: 'Operations', icon: 'fa-gears', items: [['Attendance Log', 'Real-time punches, biometric logs & regularization', 'fa-clipboard-user'], ['Leave Management', 'Leave requests, quota balances & approvals', 'fa-calendar-check'], ['Timesheet Records', 'Daily work logs, project hours & activity', 'fa-clock'], ['Payroll Processing', 'Salary computation, pay slips & tax deductions', 'fa-file-invoice-dollar']] },
  { group: 'Talent & Growth', icon: 'fa-award', items: [['Recruitment & ATS', 'Job postings, applicant pipeline & stages', 'fa-briefcase'], ['Performance & Goals', 'OKRs, KPIs, appraisals, 360 reviews & PIP', 'fa-bullseye'], ['Training Programs', 'L&D courses, certifications & attendance', 'fa-graduation-cap'], ['Employee Engagement', 'Surveys, polls, rewards & town hall discussions', 'fa-heart']] },
  { group: 'Finance & Exit', icon: 'fa-building-columns', items: [['HR Budgeting & Cost', 'Workforce cost planning, allocations & analytics', 'fa-coins'], ['Statutory Compliance', 'PF, ESI, PT, LWF, challans & statutory returns', 'fa-scale-balanced'], ['Exit Workflow & F&F', 'Resignations, clearances & full-final settlement', 'fa-door-open']] },
  { group: 'Governance', icon: 'fa-shield-halved', items: [['Policy Repository', 'Company policies & employee acknowledgements', 'fa-book-bookmark'], ['Compliance Calendar', 'Filing schedules & statutory deadlines', 'fa-calendar-days'], ['Approval Matrix', 'Multi-level workflow authorizations', 'fa-sitemap']] },
  { group: 'Analytics', icon: 'fa-chart-pie', items: [['HR Analytics', 'Headcount metrics, turnover & compensation', 'fa-chart-pie'], ['Alert Center', 'System notifications, broadcast alerts & logs', 'fa-bell']] },
];

const KPIS = [
  { label: 'Total Employees', value: 8, foot: '+12% this quarter', trend: true, icon: 'fa-users', tone: 'primary' },
  { label: 'Present Today', value: 7, foot: 'Live check-in', trend: true, icon: 'fa-user-check', tone: 'success' },
  { label: 'Total Employee Count', value: 8, foot: 'Across all departments', icon: 'fa-people-group', tone: 'info' },
  { label: 'Pending Leaves', value: 2, foot: 'Awaiting approval', icon: 'fa-clock-rotate-left', tone: 'warning' },
];

const ATTENDANCE = [['Jan', 92], ['Feb', 94], ['Mar', 91], ['Apr', 95], ['May', 96], ['Jun', 94], ['Jul', 95], ['Aug', 93], ['Sep', 94], ['Oct', 96], ['Nov', 95], ['Dec', 97]];
const HEADCOUNT = [['Engineering', 12], ['Human Resources', 10], ['Finance', 1], ['Design', 1], ['Marketing', 0]];

// Fictional sample people (same data shape as Employee Master rows)
const EMPLOYEES = [
  { id: 'EMP-1001', name: 'Ananya Rao', email: 'ananya.rao@example.com', dept: 'Engineering', role: 'Senior Developer', status: 'Approved' },
  { id: 'EMP-1002', name: 'Rahul Menon', email: 'rahul.menon@example.com', dept: 'Human Resources', role: 'HR Executive', status: 'Approved' },
  { id: 'EMP-1003', name: 'Sneha Iyer', email: 'sneha.iyer@example.com', dept: 'Finance', role: 'Accounts Lead', status: 'Pending' },
  { id: 'EMP-1004', name: 'Vikram Shah', email: 'vikram.shah@example.com', dept: 'Engineering', role: 'QA Engineer', status: 'Approved' },
  { id: 'EMP-1005', name: 'Meera Pillai', email: 'meera.pillai@example.com', dept: 'Design', role: 'Product Designer', status: 'On Probation' },
  { id: 'EMP-1006', name: 'Arjun Nair', email: 'arjun.nair@example.com', dept: 'Human Resources', role: 'Recruiter', status: 'Rejected' },
];
const STATUS_TONE = { Approved: 'success', Pending: 'warning', 'On Probation': 'info', Rejected: 'danger' };
const AV_TONES = ['primary', 'success', 'info', 'warning'];

const readParam = (k, fallback) => new URLSearchParams(window.location.search).get(k) || fallback;

function useMotionPreset(dir) {
  const reduce = useReducedMotion();
  const m = DIRECTIONS[dir].motion;
  return useMemo(() => {
    const transition = m.spring ? { type: 'spring', stiffness: 260, damping: 26 } : { duration: reduce ? 0 : m.duration, ease: [0.2, 0.8, 0.2, 1] };
    return {
      reduce,
      container: { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : m.stagger } } },
      item: {
        hidden: { opacity: 0, y: reduce ? 0 : m.y },
        show: { opacity: 1, y: 0, transition: reduce ? { duration: 0 } : transition },
      },
      hover: reduce || !m.hoverY ? undefined : { y: m.hoverY },
      tap: reduce ? undefined : { scale: 0.97 },
      quick: { duration: reduce ? 0 : 0.18, ease: [0.2, 0.8, 0.2, 1] },
    };
  }, [m, reduce]);
}

function Counter({ value, run }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!ref.current) return;
    if (!run || reduce) { ref.current.textContent = String(value); return; }
    const c = animate(0, value, { duration: 0.9, ease: [0.2, 0.8, 0.2, 1], onUpdate: v => { if (ref.current) ref.current.textContent = Math.round(v).toLocaleString('en-IN'); } });
    return () => c.stop();
  }, [value, run, reduce]);
  return <span ref={ref}>{value}</span>;
}

const spotlight = e => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
};

function Card({ className = '', interactive, children, mp, dir, ...rest }) {
  return (
    <motion.div
      variants={mp.item}
      whileHover={interactive ? mp.hover : undefined}
      onMouseMove={dir === 2 && interactive ? spotlight : undefined}
      className={`dp-card ${interactive ? 'dp-spot' : ''} ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

function TopBar({ dir, mp, theme, setTheme, onMenu }) {
  const [open, setOpen] = useState(null);
  const [active, setActive] = useState('Overview');
  const navStyle = DIRECTIONS[dir].navStyle;
  return (
    <header className="dp-header" onMouseLeave={() => setOpen(null)}>
      <button className="dp-icon-btn dp-hamburger" aria-label="Open menu" onClick={onMenu}><i className="fa-solid fa-bars" /></button>
      <div className="dp-logo"><span className="dp-logo-mark">HR</span>HR O</div>
      <LayoutGroup id={`nav-${dir}`}>
        <nav className="dp-nav" aria-label="Main">
          {NAV.map(g => (
            <div key={g.group} className="dp-nav-item" onMouseEnter={() => setOpen(g.group)}>
              <button
                className={`dp-nav-btn ${active === g.group ? 'active' : ''}`}
                aria-expanded={open === g.group}
                onClick={() => { setActive(g.group); setOpen(open === g.group ? null : g.group); }}
              >
                {active === g.group && (
                  <motion.span layoutId="nav-indicator" className={navStyle === 'underline' ? 'dp-nav-underline' : 'dp-nav-pill'} transition={mp.reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }} />
                )}
                <i className={`fa-solid ${g.icon} dp-nav-ico`} />
                <span>{g.group}</span>
                {g.items.length > 1 && <i className="fa-solid fa-chevron-down" />}
              </button>
              <AnimatePresence>
                {open === g.group && g.items.length > 1 && (
                  <motion.div
                    className="dp-dropdown"
                    initial={{ opacity: 0, y: mp.reduce ? 0 : -6, scale: mp.reduce ? 1 : 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: mp.reduce ? 0 : -4 }}
                    transition={mp.quick}
                    style={{ transformOrigin: 'top left' }}
                  >
                    {g.items.map(([t, d, ic]) => (
                      <div key={t} className="dp-dd-item" onClick={() => { setActive(g.group); setOpen(null); }}>
                        <span className="dp-dd-icon"><i className={`fa-solid ${ic}`} /></span>
                        <div><div className="dp-dd-title">{t}</div><div className="dp-dd-desc">{d}</div></div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </LayoutGroup>
      <div className="dp-header-right">
        <div className="dp-search"><i className="fa-solid fa-magnifying-glass" /> Search features…<kbd>⌘K</kbd></div>
        <button className="dp-icon-btn" aria-label="Notifications"><i className="fa-regular fa-bell" /><span className="dp-count">14</span></button>
        <button className="dp-icon-btn" aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.i key={theme} className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} initial={{ opacity: 0, rotate: mp.reduce ? 0 : -60 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: mp.reduce ? 0 : 60 }} transition={mp.quick} />
          </AnimatePresence>
        </button>
        <div className="dp-avatar">VR</div>
      </div>
    </header>
  );
}

function MobileDrawer({ open, onClose, mp }) {
  const [expanded, setExpanded] = useState('Operations');
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="dp-drawer-back" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={mp.quick} />
          <motion.aside className="dp-drawer" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={mp.reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 38 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div className="dp-logo"><span className="dp-logo-mark">HR</span>HR O</div>
              <button className="dp-icon-btn" aria-label="Close menu" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
            </div>
            {NAV.map(g => (
              <div key={g.group} className="dp-drawer-group">
                <button className={`dp-drawer-btn ${expanded === g.group ? 'active' : ''}`} onClick={() => setExpanded(expanded === g.group ? null : g.group)}>
                  <span><i className={`fa-solid ${g.icon}`} style={{ width: 22 }} />{g.group}</span>
                  <motion.i className="fa-solid fa-chevron-down" style={{ fontSize: '.7rem' }} animate={{ rotate: expanded === g.group ? 180 : 0 }} transition={mp.quick} />
                </button>
                <AnimatePresence initial={false}>
                  {expanded === g.group && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={mp.quick} style={{ overflow: 'hidden' }}>
                      {g.items.map(([t, d, ic]) => (
                        <div key={t} className="dp-dd-item"><span className="dp-dd-icon"><i className={`fa-solid ${ic}`} /></span><div><div className="dp-dd-title">{t}</div><div className="dp-dd-desc">{d}</div></div></div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// Single-series area chart: 2px line, ~10% area wash, hairline grid, crosshair + tooltip on hover
function AttendanceChart({ mp }) {
  const [hover, setHover] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [W, setW] = useState(640);
  const boxRef = useRef(null);
  useEffect(() => {
    if (!boxRef.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(boxRef.current);
    return () => ro.disconnect();
  }, [showTable]);
  const H = W < 480 ? 200 : 240, P = { l: 40, r: 12, t: 12, b: 28 };
  const months = W < 480 ? ATTENDANCE.map(([m], i) => (i % 2 === 0 ? m : '')) : ATTENDANCE.map(([m]) => m);
  const min = 85, max = 100;
  const x = i => P.l + (i * (W - P.l - P.r)) / (ATTENDANCE.length - 1);
  const y = v => P.t + ((max - v) * (H - P.t - P.b)) / (max - min);
  const line = ATTENDANCE.map(([, v], i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ');
  const area = `${line} L${x(ATTENDANCE.length - 1)},${H - P.b} L${x(0)},${H - P.b} Z`;
  const onMove = e => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.max(0, Math.min(ATTENDANCE.length - 1, Math.round(((px - P.l) / (W - P.l - P.r)) * (ATTENDANCE.length - 1))));
    setHover(i);
  };
  const last = ATTENDANCE.length - 1;
  return (
    <>
      <div className="dp-card-head">
        <div><div className="dp-card-title">Monthly Attendance Trends</div><div className="dp-card-sub">Average daily attendance, % of headcount</div></div>
        <button className="dp-btn dp-btn-ghost dp-btn-sm dp-table-toggle" onClick={() => setShowTable(s => !s)}><i className={`fa-solid ${showTable ? 'fa-chart-area' : 'fa-table'}`} />{showTable ? 'Chart' : 'Table'}</button>
      </div>
      {showTable ? (
        <div className="dp-table-wrap" style={{ margin: 0 }}>
          <table className="dp-table" style={{ minWidth: 0 }}><thead><tr><th>Month</th><th>Attendance</th></tr></thead>
            <tbody>{ATTENDANCE.map(([m, v]) => <tr key={m}><td>{m}</td><td>{v}%</td></tr>)}</tbody></table>
        </div>
      ) : (
        <div className="dp-chart" ref={boxRef}>
          <svg viewBox={`0 0 ${W} ${H}`} onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img" aria-label="Monthly attendance, between 91% and 97%">
            {[85, 90, 95, 100].map(t => (
              <g key={t}><line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="var(--dp-grid)" strokeWidth="1" /><text className="dp-axis" x={P.l - 8} y={y(t) + 4} textAnchor="end">{t}%</text></g>
            ))}
            {months.map((m, i) => m && <text key={m} className="dp-axis" x={x(i)} y={H - 8} textAnchor="middle">{m}</text>)}
            <motion.path d={area} fill="var(--dp-chart)" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} transition={{ duration: mp.reduce ? 0 : 0.8, delay: mp.reduce ? 0 : 0.4 }} />
            <motion.path d={line} fill="none" stroke="var(--dp-chart)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: mp.reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: mp.reduce ? 0 : 1.1, ease: [0.2, 0.8, 0.2, 1] }} />
            <circle cx={x(last)} cy={y(ATTENDANCE[last][1])} r="4" fill="var(--dp-chart)" stroke="var(--dp-surface)" strokeWidth="2" />
            <text x={x(last) - 8} y={y(ATTENDANCE[last][1]) - 10} textAnchor="end" style={{ fontSize: 12, fontWeight: 700, fill: 'var(--dp-text)' }}>97%</text>
            {hover !== null && (
              <g pointerEvents="none">
                <line x1={x(hover)} x2={x(hover)} y1={P.t} y2={H - P.b} stroke="var(--dp-border-strong)" strokeWidth="1" />
                <circle cx={x(hover)} cy={y(ATTENDANCE[hover][1])} r="5" fill="var(--dp-chart)" stroke="var(--dp-surface)" strokeWidth="2" />
              </g>
            )}
            <rect x={P.l} y={0} width={W - P.l - P.r} height={H} fill="transparent" />
          </svg>
          {hover !== null && (
            <div className="dp-tooltip" style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(ATTENDANCE[hover][1]) / H) * 100}%` }}>
              {ATTENDANCE[hover][1]}%<span>{ATTENDANCE[hover][0]} 2026</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function HeadcountBars({ mp }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(...HEADCOUNT.map(h => h[1]));
  return (
    <>
      <div className="dp-card-head"><div><div className="dp-card-title">Headcount by Department</div><div className="dp-card-sub">Active employees</div></div></div>
      <div className="dp-bars">
        {HEADCOUNT.map(([d, v], i) => (
          <div key={d} className="dp-bar-row" onMouseEnter={() => setHover(d)} onMouseLeave={() => setHover(null)} title={`${d}: ${v}`}>
            <span style={{ color: hover === d ? 'var(--dp-text)' : undefined, fontWeight: hover === d ? 600 : 500 }}>{d}</span>
            <div className="dp-bar-track">
              <motion.div className="dp-bar" initial={{ width: mp.reduce ? `${(v / max) * 85}%` : 0 }} animate={{ width: `${(v / max) * 85}%` }} transition={{ duration: mp.reduce ? 0 : 0.7, delay: mp.reduce ? 0 : 0.2 + i * 0.06, ease: [0.2, 0.8, 0.2, 1] }} />
              <span className="dp-bar-val">{v}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function EmployeeTable({ mp, onAdd }) {
  const [dept, setDept] = useState('All');
  const [q, setQ] = useState('');
  const rows = EMPLOYEES.filter(e => (dept === 'All' || e.dept === dept) && (e.name + e.id + e.role).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="dp-card-head">
        <div><div className="dp-card-title">Employee Master</div><div className="dp-card-sub">Manage employees, documents & status</div></div>
        <motion.button whileTap={mp.tap} className="dp-btn dp-btn-primary" onClick={onAdd}><i className="fa-solid fa-plus" />Add Employee</motion.button>
      </div>
      <div className="dp-toolbar">
        <LayoutGroup id="chips">
          {['All', 'Engineering', 'Human Resources', 'Finance', 'Design'].map(d => (
            <button key={d} className={`dp-chip ${dept === d ? 'on' : ''}`} onClick={() => setDept(d)}>
              {dept === d && <motion.span layoutId="chip-bg" className="dp-chip-bg" transition={mp.reduce ? { duration: 0 } : { type: 'spring', stiffness: 450, damping: 36 }} />}
              <span>{d === 'All' ? 'All Departments' : d}</span>
            </button>
          ))}
        </LayoutGroup>
        <input className="dp-input" placeholder="Search name, ID or designation" value={q} onChange={e => setQ(e.target.value)} style={{ marginLeft: 'auto', maxWidth: 280 }} />
      </div>
      <div className="dp-table-wrap">
        <table className="dp-table">
          <thead><tr><th>Employee</th><th>ID</th><th>Department</th><th>Designation</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
          <tbody>
            <AnimatePresence initial={false}>
              {rows.map((e, i) => (
                <motion.tr key={e.id} layout={!mp.reduce} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={mp.quick}>
                  <td><div className="dp-person"><span className={`dp-person-av tone-${AV_TONES[i % 4]}`}>{e.name.split(' ').map(s => s[0]).join('')}</span><div><div className="dp-person-name">{e.name}</div><div className="dp-person-mail">{e.email}</div></div></div></td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{e.id}</td>
                  <td>{e.dept}</td>
                  <td>{e.role}</td>
                  <td><span className={`dp-badge tone-${STATUS_TONE[e.status]}`} style={{ '--dp-badge-c': `var(--dp-${STATUS_TONE[e.status]})` }}><span className="dp-badge-dot" />{e.status}</span></td>
                  <td><div className="dp-row-actions"><button className="dp-btn dp-btn-secondary dp-btn-sm"><i className="fa-regular fa-id-card" />View Details & Docs</button><button className="dp-btn dp-btn-ghost dp-btn-sm">View Ledger</button></div></td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {rows.length === 0 && <div className="dp-empty"><i className="fa-regular fa-folder-open" style={{ marginRight: 8 }} />No employees match these filters.</div>}
      </div>
    </>
  );
}

function ButtonsAndForm({ mp, toast }) {
  const [state, setState] = useState('idle');
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const [notify, setNotify] = useState(true);
  const lock = () => {
    setState('loading');
    setTimeout(() => { setState('done'); toast('F&F settlement approved & locked'); setTimeout(() => setState('idle'), 1600); }, 1200);
  };
  const invalid = touched && reason.trim().length < 5;
  return (
    <>
      <Card mp={mp} dir={0}>
        <div className="dp-card-head"><div><div className="dp-card-title">Buttons & feedback</div><div className="dp-card-sub">Hover, press, loading and success states</div></div></div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <motion.button whileTap={mp.tap} className="dp-btn dp-btn-primary"><i className="fa-solid fa-plus" />Add Employee</motion.button>
          <motion.button whileTap={mp.tap} className="dp-btn dp-btn-secondary"><i className="fa-solid fa-download" />Export</motion.button>
          <motion.button whileTap={mp.tap} className="dp-btn dp-btn-soft">View Ledger</motion.button>
          <motion.button whileTap={mp.tap} className="dp-btn dp-btn-ghost">Cancel</motion.button>
          <motion.button whileTap={mp.tap} className="dp-btn dp-btn-danger"><i className="fa-solid fa-xmark" />Reject</motion.button>
          <motion.button whileTap={mp.tap} className="dp-btn dp-btn-primary" onClick={lock} disabled={state === 'loading'} style={{ minWidth: 190 }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={state} initial={{ opacity: 0, y: mp.reduce ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: mp.reduce ? 0 : -6 }} transition={mp.quick} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {state === 'loading' ? <><span className="dp-spinner" />Locking…</> : state === 'done' ? <><i className="fa-solid fa-check" />Locked</> : <><i className="fa-solid fa-lock" />Approve & Lock F&F</>}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 18 }}>
          {Object.entries(STATUS_TONE).map(([s, t]) => <span key={s} className={`dp-badge tone-${t}`} style={{ '--dp-badge-c': `var(--dp-${t})` }}><span className="dp-badge-dot" />{s}</span>)}
        </div>
      </Card>
      <Card mp={mp} dir={0}>
        <div className="dp-card-head"><div><div className="dp-card-title">Apply Leave</div><div className="dp-card-sub">Form fields, focus ring and validation</div></div></div>
        <div className="dp-form-grid">
          <div className="dp-field"><label className="dp-label">Leave Type</label><select className="dp-input" defaultValue="Casual Leave"><option>Casual Leave</option><option>Sick Leave</option><option>Earned Leave</option></select></div>
          <div className="dp-field"><label className="dp-label">From Date</label><input type="date" className="dp-input" defaultValue="2026-11-10" /></div>
          <div className="dp-field" style={{ gridColumn: '1 / -1' }}>
            <label className="dp-label">Reason</label>
            <textarea className={`dp-input ${invalid ? 'invalid' : ''}`} placeholder="Briefly describe the reason" value={reason} onChange={e => setReason(e.target.value)} onBlur={() => setTouched(true)} />
            <AnimatePresence>{invalid && <motion.div className="dp-error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={mp.quick}><i className="fa-solid fa-circle-exclamation" />Please enter at least 5 characters.</motion.div>}</AnimatePresence>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, gridColumn: '1 / -1' }}>
            <button className={`dp-switch ${notify ? 'on' : ''}`} role="switch" aria-checked={notify} onClick={() => setNotify(n => !n)}>
              <motion.span className="dp-switch-knob" animate={{ x: notify ? 18 : 0 }} transition={mp.reduce ? { duration: 0 } : { type: 'spring', stiffness: 600, damping: 34 }} />
            </button>
            <span style={{ fontSize: '.84rem', color: 'var(--dp-text-2)' }}>Notify my reporting manager</span>
            <motion.button whileTap={mp.tap} className="dp-btn dp-btn-primary" style={{ marginLeft: 'auto' }} onClick={() => { setTouched(true); if (reason.trim().length >= 5) toast('Leave request submitted'); }}>Submit</motion.button>
          </div>
        </div>
      </Card>
    </>
  );
}

function SkeletonDemo({ mp }) {
  const [loading, setLoading] = useState(false);
  return (
    <Card mp={mp} dir={0}>
      <div className="dp-card-head">
        <div><div className="dp-card-title">Loading state</div><div className="dp-card-sub">Skeletons replace spinners while API data loads</div></div>
        <button className="dp-btn dp-btn-secondary dp-btn-sm" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1800); }}><i className="fa-solid fa-rotate" />Reload</button>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={mp.quick} style={{ display: 'grid', gap: 12 }}>
            {[0, 1, 2].map(i => <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}><div className="dp-skel" style={{ width: 32, height: 32, borderRadius: '50%' }} /><div style={{ flex: 1, display: 'grid', gap: 6 }}><div className="dp-skel" style={{ height: 10, width: '45%' }} /><div className="dp-skel" style={{ height: 8, width: '70%' }} /></div></div>)}
          </motion.div>
        ) : (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={mp.quick}>
            {[['Approve Leave for Vikram Shah', 'Casual Leave · 2 days'], ['Review PF challan for October', 'Statutory Compliance'], ['Schedule interview: Frontend Developer', 'Recruitment & ATS']].map(([t, m]) => (
              <div key={t} className="dp-task"><div><div className="dp-task-title">{t}</div><div className="dp-task-meta">{m}</div></div><button className="dp-btn dp-btn-soft dp-btn-sm">Open</button></div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function DesignPreview() {
  const [dir, setDir] = useState(() => Number(readParam('d', '1')) || 1);
  const [theme, setTheme] = useState(() => readParam('theme', 'light'));
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const mp = useMotionPreset(dir);
  const D = DIRECTIONS[dir];

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    p.set('d', dir); p.set('theme', theme);
    window.history.replaceState(null, '', `${window.location.pathname}?${p}`);
    document.title = `HR O — Design ${dir}: ${D.name}`;
  }, [dir, theme, D.name]);

  const toastTimer = useRef(null);
  const toast = msg => { setToastMsg(msg); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToastMsg(null), 2400); };

  return (
    <div className="dp-root" data-dir={dir} data-theme={theme}>
      <TopBar dir={dir} mp={mp} theme={theme} setTheme={setTheme} onMenu={() => setMenu(true)} />
      <MobileDrawer open={menu} onClose={() => setMenu(false)} mp={mp} />

      {/* key={dir} replays the entrance animation each time the direction changes */}
      <motion.main key={`${dir}-${mp.reduce}`} className="dp-main" variants={mp.container} initial="hidden" animate="show">
        <Card mp={mp} dir={dir} className="dp-hero">
          <div>
            <h1>Welcome back, Venkat!</h1>
            <p>You have administrative access to monitor employee directories, manage statutory PF/ESI compliance, approve timesheets, and review candidate applications.</p>
            <div className="dp-hero-actions">
              <motion.button whileTap={mp.tap} className="dp-btn dp-btn-primary" onClick={() => setModal(true)}><i className="fa-solid fa-plus" />Add Employee</motion.button>
              <motion.button whileTap={mp.tap} className="dp-btn dp-btn-secondary"><i className="fa-solid fa-calendar-check" />Review Leaves</motion.button>
            </div>
          </div>
          <div className="dp-hero-meta dp-hide-sm">
            <div className="dp-hero-chip"><i className="fa-solid fa-clock" />Payroll run in 6 days</div>
            <div className="dp-hero-chip"><i className="fa-solid fa-file-shield" />PF challan due 15 Nov</div>
            <div className="dp-hero-chip"><i className="fa-solid fa-user-plus" />3 candidates in Screening</div>
          </div>
        </Card>

        <div className="dp-grid-4">
          {KPIS.map(k => (
            <Card key={k.label} mp={mp} dir={dir} interactive className="dp-kpi">
              <div className="dp-kpi-top"><span className="dp-kpi-label">{k.label}</span><span className={`dp-kpi-icon tone-${k.tone}`}><i className={`fa-solid ${k.icon}`} /></span></div>
              <div className="dp-kpi-val"><Counter value={k.value} run={dir === 2} /></div>
              <div className="dp-kpi-foot">{k.trend ? <span className="dp-trend-up"><i className="fa-solid fa-arrow-trend-up" /> {k.foot}</span> : k.foot}</div>
            </Card>
          ))}
        </div>

        <div className="dp-grid-2-1">
          <Card mp={mp} dir={dir}><AttendanceChart key={`${dir}-${theme}`} mp={mp} /></Card>
          <Card mp={mp} dir={dir}>
            <div className="dp-card-head"><div><div className="dp-card-title">HR O AI™ Insights</div><div className="dp-card-sub">Updated a few minutes ago</div></div></div>
            <div className="dp-insight"><i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--dp-primary)' }} />Attendance is up 4% compared to this day last week. Friday drop is stabilized.</div>
            <div className="dp-insight"><i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--dp-warning)' }} />2 employees have pending leave requests. Resolve soon.</div>
            <div className="dp-insight"><i className="fa-solid fa-circle-check" style={{ color: 'var(--dp-success)' }} />All candidates in Screening have completed HR screening calls.</div>
          </Card>
        </div>

        <Card mp={mp} dir={dir}><EmployeeTable mp={mp} onAdd={() => setModal(true)} /></Card>

        <div className="dp-grid-2">
          <Card mp={mp} dir={dir}><HeadcountBars key={`${dir}-${theme}`} mp={mp} /></Card>
          <SkeletonDemo mp={mp} />
        </div>

        <div className="dp-section-label">Controls</div>
        <div className="dp-grid-2"><ButtonsAndForm mp={mp} toast={toast} /></div>

        <div className="dp-section-label">About this direction</div>
        <Card mp={mp} dir={dir}>
          <div className="dp-card-title">Direction {dir}: {D.name}</div>
          <p className="dp-concept" style={{ marginTop: 8 }}><b>Concept.</b> {D.concept}</p>
          <p className="dp-concept" style={{ marginTop: 6 }}><b>Why it suits HR O.</b> {D.why}</p>
          <div className="dp-swatches">{D.swatches.map(s => <span key={s} className="dp-swatch"><i style={{ background: s }} />{s}</span>)}</div>
        </Card>
      </motion.main>

      <AnimatePresence>
        {modal && (
          <motion.div className="dp-modal-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={mp.quick} onClick={() => setModal(false)}>
            <motion.div className="dp-modal" role="dialog" aria-modal="true" aria-label="Add Employee" onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, y: mp.reduce ? 0 : 16, scale: mp.reduce ? 1 : 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: mp.reduce ? 0 : 8, scale: mp.reduce ? 1 : 0.99 }}
              transition={mp.reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 32 }}>
              <div className="dp-modal-head"><div className="dp-card-title">Add Employee</div><button className="dp-icon-btn" aria-label="Close" onClick={() => setModal(false)}><i className="fa-solid fa-xmark" /></button></div>
              <div className="dp-modal-body">
                <div className="dp-form-grid">
                  <div className="dp-field"><label className="dp-label">Full Name</label><input className="dp-input" placeholder="e.g. Ananya Rao" /></div>
                  <div className="dp-field"><label className="dp-label">Work Email</label><input className="dp-input" placeholder="name@company.com" /></div>
                  <div className="dp-field"><label className="dp-label">Department</label><select className="dp-input"><option>Engineering</option><option>Human Resources</option><option>Finance</option></select></div>
                  <div className="dp-field"><label className="dp-label">Designation</label><input className="dp-input" placeholder="e.g. Senior Developer" /></div>
                </div>
              </div>
              <div className="dp-modal-foot"><button className="dp-btn dp-btn-ghost" onClick={() => setModal(false)}>Cancel</button><motion.button whileTap={mp.tap} className="dp-btn dp-btn-primary" onClick={() => { setModal(false); toast('Employee added (preview only — nothing saved)'); }}>Save Employee</motion.button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMsg && (
          <motion.div className="dp-toast" role="status" initial={{ opacity: 0, y: mp.reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: mp.reduce ? 0 : 8 }} transition={mp.quick}>
            <i className="fa-solid fa-circle-check" />{toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <LayoutGroup id="switcher">
        <div className="dp-switcher" role="toolbar" aria-label="Design direction">
          {Object.entries(DIRECTIONS).map(([k, v]) => (
            <button key={k} className={dir === Number(k) ? 'on' : ''} onClick={() => setDir(Number(k))}>
              {dir === Number(k) && <motion.span layoutId="sw-pill" className="dp-switcher-pill" transition={mp.reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }} />}
              <span><span className="dp-sw-long">{k}. {v.name}</span><span className="dp-sw-short">Design {k}</span></span>
            </button>
          ))}
          <span className="dp-switcher-sep" />
          <button onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}><span><i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} /> {theme === 'dark' ? 'Light' : 'Dark'}</span></button>
        </div>
      </LayoutGroup>
    </div>
  );
}
