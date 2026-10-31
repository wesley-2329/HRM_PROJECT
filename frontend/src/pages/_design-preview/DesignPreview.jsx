// Design-direction preview (Step 2). Standalone pages at /design-preview/<a|b|c>/<landing|login|dashboard>.
// Nothing here touches a real page, API, context or state — buttons and forms are visual only.
// All visible text is copied from LandingOverlayUI.jsx, LoginGateway.jsx, HRTopNavbar.jsx and the HR dashboard.
// Employee rows are fictional sample data. Remove this folder and its route in App.jsx before merging to main.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup, useReducedMotion, animate, useInView } from 'framer-motion';
import './designPreview.css';

const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&family=Outfit:wght@500;600;700;800&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap';

const DIRS = {
  a: { name: 'Corporate Premium', short: 'A' },
  b: { name: 'Modern Campus', short: 'B' },
  c: { name: 'Minimal Motion', short: 'C' },
};
const VIEWS = { landing: 'Landing', login: 'Login', dashboard: 'Dashboard' };
// Entrance timing per direction — all within 150–500 ms, no overshoot
const MOTION = {
  a: { y: 14, duration: 0.4, stagger: 0.06 },
  b: { y: 24, duration: 0.5, stagger: 0.08 },
  c: { y: 12, duration: 0.5, stagger: 0.1 },
};
const EASE = [0.2, 0.8, 0.2, 1];

// ---------- Exact text from the app ----------
const MODULES = [
  { title: 'HR O Workspace', icon: 'fa-building', img: 'campus-team', desc: "Centralize your organization's records. Manage company branches, department lines, dynamic team maps, audit logs, and secure cloud credentials from one intuitive dashboard." },
  { title: 'HR O Shift Board', icon: 'fa-calendar-days', img: 'campus-studio', desc: 'Coordinate operational coverage. Configure complex shift timings, map rosters to employee groups, balance leave request quotas, and verify daily timesheets.' },
  { title: 'Compliance Engine', icon: 'fa-scale-balanced', img: 'campus-collab', desc: 'Calculate precise payroll breakdowns. Automated integrations compute PF, ESI, tax slabs, customized allowance categories, and generate compliant banking exports.' },
  { title: 'Talent Orchestration', icon: 'fa-wand-magic-sparkles', img: 'campus-pair', desc: 'Set and forget recurring HR operations. Automate monthly payroll updates, attendance roll-ups, compliance check cycles, and security logs verification.' },
];
const TENETS = [
  { title: 'Security', icon: 'fa-shield-halved', desc: 'Secure document vault file uploads, granular role authorization models, encrypted databases, and locked company profiles data.' },
  { title: 'Autonomy', icon: 'fa-user-gear', desc: 'Enable staff with self-service profiles, automated leave approval parameters, recurring timesheet rollups, and digital compliance ledgers.' },
  { title: 'Accuracy', icon: 'fa-bullseye', desc: 'Synchronize live timesheet check-ins, automated Professional Tax/ESI deduction formulas, and department mapping profiles data.' },
  { title: 'Efficiency', icon: 'fa-bolt', desc: 'Instant single-click bulk payslip distribution, batch banking export files preparation, and zero operational lag in workforce edits logs.' },
];
const STATS = [
  { num: 98.4, decimals: 1, suffix: '%', label: 'Punctuality Average' },
  { num: 12.8, decimals: 1, suffix: ' seconds', label: 'Audit Log Execution' },
  { text: 'Statutory', label: 'PF & ESI Compliance' },
];
const T = {
  capEyebrow: 'Enterprise Capabilities',
  capTitle: 'The unified portals structure.',
  capDesc: 'A complete suite of modules designed to eliminate operational friction and keep compliance, registers, and payroll working seamlessly.',
  tenEyebrow: 'Operational Anchors',
  tenTitle: 'The tenets of HR O architecture.',
  tenDesc: 'Our enterprise system operates under four core anchors to guarantee absolute data security, process autonomy, logs audit trail, and payroll accuracy.',
  orgEyebrow: 'Visual Directory Management',
  orgTitle: 'Unified Org Hierarchy',
  orgDesc: 'Map nested organizational charts, departments, branches, and multi-tier reporting relationships. Instantly query audit trails to track structural transfers, branch updates, and employee profiles changes.',
  orgPoints: [
    ['Real-time Audit Trail Sync', 'Logs all branch, transfer, and employee profile edits in an immutable system audit trail.', 'fa-clock-rotate-left'],
    ['Regional & Branch Isolation', 'Restricts operations to localized legal compliance grids, allowing secure global scaling.', 'fa-earth-asia'],
  ],
  ctaTitle: 'Experience zero friction.',
  ctaDesc: 'Automate your workforce registries, compliance, logs, shift rosters, and payroll ledgers with absolute certainty.',
};
const FOOTER = { Product: ['Download', 'Product', 'Docs', 'Changelog', 'Press', 'Releases'], Resources: ['Blog', 'Pricing', 'Use Cases'], bottom: ['About HR O', 'Products', 'Privacy', 'Terms'] };
const LOGIN_SIDE = {
  hr: { eyebrow: 'Workforce Orchestration', title: 'Statutory Audit & Operations Hub.', desc: 'Manage department registries, statutory compliance frameworks (PF, ESI, Tax), and real-time security operations control parameters.' },
  employee: { eyebrow: 'Employee Self-Service', title: 'Your Work Directory, Simplified.', desc: 'Verify your active shift boards, check leave quotas, print audit-verified payslips, and check in to workspaces securely.' },
};
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
// Fictional sample rows (same data shape as Employee Master)
const EMPLOYEES = [
  { id: 'EMP-1001', name: 'Ananya Rao', email: 'ananya.rao@example.com', dept: 'Engineering', role: 'Senior Developer', status: 'Approved' },
  { id: 'EMP-1002', name: 'Rahul Menon', email: 'rahul.menon@example.com', dept: 'Human Resources', role: 'HR Executive', status: 'Approved' },
  { id: 'EMP-1003', name: 'Sneha Iyer', email: 'sneha.iyer@example.com', dept: 'Finance', role: 'Accounts Lead', status: 'Pending' },
  { id: 'EMP-1004', name: 'Vikram Shah', email: 'vikram.shah@example.com', dept: 'Engineering', role: 'QA Engineer', status: 'Approved' },
  { id: 'EMP-1005', name: 'Meera Pillai', email: 'meera.pillai@example.com', dept: 'Design', role: 'Product Designer', status: 'Rejected' },
];
const STATUS_TONE = { Approved: 'success', Pending: 'warning', Rejected: 'danger' };
const AV_TONES = ['primary', 'success', 'info', 'warning'];

// ---------- Helpers ----------
function useMotion(dir) {
  const reduce = useReducedMotion();
  return useMemo(() => {
    const m = MOTION[dir];
    return {
      reduce,
      quick: { duration: reduce ? 0 : 0.18, ease: EASE },
      group: { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : m.stagger } } },
      item: { hidden: { opacity: 0, y: reduce ? 0 : m.y }, show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : m.duration, ease: EASE } } },
      tap: reduce ? undefined : { scale: 0.98 },
      hoverLift: reduce || dir === 'c' ? undefined : { y: dir === 'b' ? -4 : -2, transition: { duration: 0.2, ease: EASE } },
    };
  }, [dir, reduce]);
}

// Scroll-reveal group: children with variants={mp.item} fade/slide in once when the group scrolls into view
const Reveal = ({ mp, as = 'div', className, children, amount = 0.2, ...rest }) => {
  const C = motion[as];
  return <C className={className} variants={mp.group} initial="hidden" whileInView="show" viewport={{ once: true, amount }} {...rest}>{children}</C>;
};
const Item = ({ mp, as = 'div', children, ...rest }) => {
  const C = motion[as];
  return <C variants={mp.item} {...rest}>{children}</C>;
};

function Img({ name, alt, eager, sizes = '(max-width: 760px) 100vw, 50vw', small = 800, large = 1600 }) {
  return (
    <img
      src={`/images/${name}-${large}.webp`}
      srcSet={`/images/${name}-${small}.webp ${small}w, /images/${name}-${large}.webp ${large}w`}
      sizes={sizes}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      decoding="async"
    />
  );
}

function CountUp({ to, decimals = 0, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!ref.current) return;
    const fmt = v => v.toFixed(decimals) + suffix;
    if (!inView || reduce) { ref.current.textContent = fmt(to); return; }
    const c = animate(0, to, { duration: 0.5, ease: EASE, onUpdate: v => { if (ref.current) ref.current.textContent = fmt(v); } });
    return () => c.stop();
  }, [inView, reduce, to, decimals, suffix]);
  return <span ref={ref}>{to.toFixed(decimals) + suffix}</span>;
}

const HeroLetters = ({ mp, className }) => (
  <motion.h1 className={`dp-head dp-hero-letters ${className || ''}`} aria-label="HR ORBIT" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: mp.reduce ? 0 : 0.04 } } }}>
    {'HR ORBIT'.split('').map((ch, i) => (
      <motion.span key={i} aria-hidden="true" variants={{ hidden: { opacity: 0, y: mp.reduce ? 0 : 18 }, show: { opacity: 1, y: 0, transition: { duration: mp.reduce ? 0 : 0.45, ease: EASE } } }}>
        {ch === ' ' ? ' ' : ch}
      </motion.span>
    ))}
  </motion.h1>
);

const LandingNav = ({ go, light }) => (
  <nav className="dp-lnav" aria-label="Landing">
    <div className="dp-wrap">
      <a className="dp-brand" onClick={() => window.scrollTo({ top: 0 })}><i className="fa-solid fa-circle-nodes" style={{ color: light ? '#fff' : 'var(--dp-primary)' }} />HR O</a>
      <div className="dp-lnav-links">
        <a onClick={() => document.getElementById('dp-modules')?.scrollIntoView({ behavior: 'smooth' })}>Modules</a>
        <a onClick={() => document.getElementById('dp-tenets')?.scrollIntoView({ behavior: 'smooth' })}>Tenets</a>
        <a onClick={() => go('dashboard')}>Console</a>
      </div>
      <button className={`dp-btn ${light ? 'dp-btn-white' : 'dp-btn-primary'}`} onClick={() => go('login')}>Launch Portal</button>
    </div>
  </nav>
);

const Footer = ({ mp }) => (
  <footer className="dp-footer">
    <Reveal mp={mp} className="dp-wrap">
      <div className="dp-footer-grid">
        <Item mp={mp}><div className="dp-brand dp-head" style={{ fontSize: '2rem' }}>HR O</div></Item>
        <Item mp={mp}><h4>Product</h4><ul>{FOOTER.Product.map(t => <li key={t}><a href="#">{t}</a></li>)}</ul></Item>
        <Item mp={mp}><h4>Resources</h4><ul>{FOOTER.Resources.map(t => <li key={t}><a href="#">{t}</a></li>)}</ul></Item>
        <Item mp={mp}><h4>HR O</h4><ul>{FOOTER.bottom.map(t => <li key={t}><a href="#">{t}</a></li>)}</ul></Item>
      </div>
    </Reveal>
  </footer>
);

const OrgPoints = () => (
  <>
    <div className="dp-org-points">
      {T.orgPoints.map(([h, p, ic]) => (
        <div key={h} className="dp-org-point"><span className="dp-icon-chip" style={{ flex: 'none', width: 38, height: 38 }}><i className={`fa-solid ${ic}`} /></span><div><h4>{h}</h4><p>{p}</p></div></div>
      ))}
    </div>
    <div className="dp-ledger"><span className="dp-pulse-dot" /><span>Active Portal Database</span><b>24 Active Ledgers</b></div>
  </>
);

// ---------- Landing: A Corporate Premium ----------
function LandingA({ mp, go }) {
  return (
    <>
      <LandingNav go={go} light />
      <header className="dp-a-hero">
        <picture><Img name="corporate-hero" alt="Open-plan corporate office with employees working at rows of desks" eager sizes="100vw" /></picture>
        <div className="dp-wrap">
          <HeroLetters mp={mp} />
          <motion.div className="dp-a-rule" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: mp.reduce ? 0 : 0.5, delay: mp.reduce ? 0 : 0.35, ease: EASE }} style={{ transformOrigin: 'left' }} />
          <motion.div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }} initial={{ opacity: 0, y: mp.reduce ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: mp.reduce ? 0 : 0.4, delay: mp.reduce ? 0 : 0.45, ease: EASE }}>
            <motion.button whileTap={mp.tap} className="dp-btn dp-btn-lg dp-btn-white" onClick={() => go('login')}>Launch Console<i className="fa-solid fa-arrow-right" /></motion.button>
            <motion.button whileTap={mp.tap} className="dp-btn dp-btn-lg dp-btn-onimage" onClick={() => document.getElementById('dp-modules')?.scrollIntoView({ behavior: 'smooth' })}>Explore Modules</motion.button>
          </motion.div>
        </div>
      </header>
      <div className="dp-a-stats dp-wrap">
        <Reveal mp={mp} className="dp-a-stats-card">
          {STATS.map(s => <Item mp={mp} key={s.label}><div className="dp-stat-num">{s.text || <CountUp to={s.num} decimals={s.decimals} suffix={s.suffix} />}</div><div className="dp-stat-label">{s.label}</div></Item>)}
        </Reveal>
      </div>
      <section className="dp-section" id="dp-modules">
        <div className="dp-wrap">
          <Reveal mp={mp} className="dp-section-head">
            <Item mp={mp} className="dp-eyebrow">{T.capEyebrow}</Item>
            <Item mp={mp} as="h2" className="dp-head">{T.capTitle}</Item>
            <Item mp={mp} as="p" className="dp-lead">{T.capDesc}</Item>
          </Reveal>
          <Reveal mp={mp} className="dp-a-modules">
            {MODULES.map(m => (
              <Item mp={mp} key={m.title} className="dp-module-card">
                <span className="dp-icon-chip"><i className={`fa-solid ${m.icon}`} /></span>
                <h3 className="dp-head">{m.title}</h3>
                <p>{m.desc}</p>
              </Item>
            ))}
          </Reveal>
        </div>
      </section>
      <section className="dp-section" id="dp-tenets" style={{ background: 'var(--dp-surface)', borderTop: '1px solid var(--dp-border)', borderBottom: '1px solid var(--dp-border)' }}>
        <div className="dp-wrap dp-a-split">
          <Reveal mp={mp}><Item mp={mp} className="dp-a-photo"><Img name="corporate-meeting" alt="Colleagues discussing work around a desk in a modern office" /></Item></Reveal>
          <div>
            <Reveal mp={mp} className="dp-section-head" style={{ marginBottom: 36 }}>
              <Item mp={mp} className="dp-eyebrow">{T.tenEyebrow}</Item>
              <Item mp={mp} as="h2" className="dp-head">{T.tenTitle}</Item>
              <Item mp={mp} as="p" className="dp-lead">{T.tenDesc}</Item>
            </Reveal>
            <Reveal mp={mp} className="dp-a-tenets">
              {TENETS.map(t => <Item mp={mp} key={t.title} className="dp-tenet"><h3 className="dp-head">{t.title}</h3><p>{t.desc}</p></Item>)}
            </Reveal>
          </div>
        </div>
      </section>
      <section className="dp-section">
        <div className="dp-wrap dp-a-split">
          <Reveal mp={mp}>
            <Item mp={mp} className="dp-eyebrow">{T.orgEyebrow}</Item>
            <Item mp={mp} as="h2" className="dp-head" style={{ fontSize: 'clamp(2rem, 3.6vw, 2.9rem)', margin: '14px 0' }}>{T.orgTitle}</Item>
            <Item mp={mp} as="p" className="dp-lead">{T.orgDesc}</Item>
            <Item mp={mp}><OrgPoints /></Item>
          </Reveal>
          <Reveal mp={mp}><Item mp={mp} className="dp-a-photo"><Img name="corporate-office" alt="Employee working at a dual-monitor desk in a private office" /></Item></Reveal>
        </div>
      </section>
      <section className="dp-a-cta">
        <Reveal mp={mp} className="dp-wrap">
          <Item mp={mp} as="h2" className="dp-head">{T.ctaTitle}</Item>
          <Item mp={mp} as="p">{T.ctaDesc}</Item>
          <Item mp={mp}><motion.button whileTap={mp.tap} className="dp-btn dp-btn-lg dp-btn-white" onClick={() => go('login')}>Launch Portal<i className="fa-solid fa-arrow-right" /></motion.button></Item>
        </Reveal>
      </section>
      <Footer mp={mp} />
    </>
  );
}

// ---------- Landing: B Modern Campus ----------
function LandingB({ mp, go }) {
  return (
    <>
      <LandingNav go={go} />
      <header className="dp-b-hero">
        <div className="dp-wrap">
          <div>
            <motion.div className="dp-eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: mp.reduce ? 0 : 0.4 }}>{T.capEyebrow}</motion.div>
            <HeroLetters mp={mp} />
            <motion.div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 30 }} initial={{ opacity: 0, y: mp.reduce ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: mp.reduce ? 0 : 0.45, delay: mp.reduce ? 0 : 0.4, ease: EASE }}>
              <motion.button whileTap={mp.tap} className="dp-btn dp-btn-lg dp-btn-primary" onClick={() => go('login')}>Launch Console<i className="fa-solid fa-arrow-right" /></motion.button>
              <motion.button whileTap={mp.tap} className="dp-btn dp-btn-lg dp-btn-secondary" onClick={() => document.getElementById('dp-modules')?.scrollIntoView({ behavior: 'smooth' })}>Explore Modules</motion.button>
            </motion.div>
          </div>
          <motion.div className="dp-b-hero-img" initial={{ opacity: 0, y: mp.reduce ? 0 : 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: mp.reduce ? 0 : 0.5, delay: mp.reduce ? 0 : 0.15, ease: EASE }}>
            <div className="dp-b-frame"><Img name="campus-hero" alt="Four smiling colleagues gathered around a laptop in a bright office" eager /></div>
            <motion.div className="dp-b-float" style={{ left: -28, bottom: 40 }} initial={{ opacity: 0, x: mp.reduce ? 0 : -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: mp.reduce ? 0 : 0.45, delay: mp.reduce ? 0 : 0.6, ease: EASE }}>
              <span className="dp-icon-chip tone-success"><i className="fa-solid fa-user-clock" /></span><div><div className="dp-stat-num"><CountUp to={98.4} decimals={1} suffix="%" /></div><div className="dp-stat-label">Punctuality Average</div></div>
            </motion.div>
            <motion.div className="dp-b-float" style={{ right: -20, top: 36 }} initial={{ opacity: 0, x: mp.reduce ? 0 : 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: mp.reduce ? 0 : 0.45, delay: mp.reduce ? 0 : 0.7, ease: EASE }}>
              <span className="dp-icon-chip"><i className="fa-solid fa-stopwatch" /></span><div><div className="dp-stat-num"><CountUp to={12.8} decimals={1} suffix=" seconds" /></div><div className="dp-stat-label">Audit Log Execution</div></div>
            </motion.div>
            <motion.div className="dp-b-float" style={{ right: 40, bottom: -24 }} initial={{ opacity: 0, y: mp.reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: mp.reduce ? 0 : 0.45, delay: mp.reduce ? 0 : 0.8, ease: EASE }}>
              <span className="dp-icon-chip tone-info"><i className="fa-solid fa-file-shield" /></span><div><div className="dp-stat-num">Statutory</div><div className="dp-stat-label">PF & ESI Compliance</div></div>
            </motion.div>
          </motion.div>
        </div>
      </header>
      <section className="dp-section" id="dp-modules" style={{ paddingTop: 60 }}>
        <div className="dp-wrap">
          <Reveal mp={mp} className="dp-section-head" style={{ textAlign: 'center', margin: '0 auto 52px' }}>
            <Item mp={mp} as="h2" className="dp-head">{T.capTitle}</Item>
            <Item mp={mp} as="p" className="dp-lead">{T.capDesc}</Item>
          </Reveal>
          <Reveal mp={mp} className="dp-b-modules">
            {MODULES.map(m => (
              <Item mp={mp} key={m.title} className="dp-b-mod" whileHover={mp.hoverLift}>
                <div className="dp-b-mod-img"><Img name={m.img} alt={`Team at work — ${m.title}`} sizes="(max-width: 760px) 100vw, 25vw" /></div>
                <div className="dp-module-card"><h3 className="dp-head">{m.title}</h3><p>{m.desc}</p></div>
              </Item>
            ))}
          </Reveal>
        </div>
      </section>
      <section className="dp-section dp-b-band" id="dp-tenets">
        <div className="dp-wrap">
          <Reveal mp={mp} className="dp-section-head" style={{ textAlign: 'center', margin: '0 auto 52px' }}>
            <Item mp={mp} className="dp-eyebrow">{T.tenEyebrow}</Item>
            <Item mp={mp} as="h2" className="dp-head">{T.tenTitle}</Item>
            <Item mp={mp} as="p" className="dp-lead">{T.tenDesc}</Item>
          </Reveal>
          <Reveal mp={mp} className="dp-b-tenets">
            {TENETS.map(t => (
              <Item mp={mp} key={t.title} className="dp-b-tenet dp-tenet" whileHover={mp.hoverLift}>
                <span className="dp-icon-chip"><i className={`fa-solid ${t.icon}`} /></span><h3 className="dp-head">{t.title}</h3><p>{t.desc}</p>
              </Item>
            ))}
          </Reveal>
        </div>
      </section>
      <section className="dp-section">
        <div className="dp-wrap dp-b-split">
          <Reveal mp={mp} className="dp-b-mosaic">
            <Item mp={mp}><Img name="campus-studio" alt="Bright loft office with staircase and team desks" /></Item>
            <Item mp={mp}><Img name="campus-collab" alt="Colleagues pointing at a monitor while collaborating" /></Item>
            <Item mp={mp}><Img name="campus-pair" alt="Two colleagues reviewing work on a laptop" /></Item>
          </Reveal>
          <Reveal mp={mp}>
            <Item mp={mp} className="dp-eyebrow">{T.orgEyebrow}</Item>
            <Item mp={mp} as="h2" className="dp-head" style={{ fontSize: 'clamp(2rem, 3.6vw, 2.9rem)', margin: '14px 0' }}>{T.orgTitle}</Item>
            <Item mp={mp} as="p" className="dp-lead">{T.orgDesc}</Item>
            <Item mp={mp}><OrgPoints /></Item>
          </Reveal>
        </div>
      </section>
      <section className="dp-b-cta">
        <Reveal mp={mp}>
          <Item mp={mp} as="h2" className="dp-head">{T.ctaTitle}</Item>
          <Item mp={mp} as="p">{T.ctaDesc}</Item>
          <Item mp={mp}><motion.button whileTap={mp.tap} className="dp-btn dp-btn-lg dp-btn-white" onClick={() => go('login')}>Launch Portal<i className="fa-solid fa-arrow-right" /></motion.button></Item>
        </Reveal>
      </section>
      <Footer mp={mp} />
    </>
  );
}

// ---------- Landing: C Minimal Motion ----------
function LandingC({ mp, go }) {
  return (
    <>
      <LandingNav go={go} />
      <header className="dp-c-hero">
        <div className="dp-wrap">
          <HeroLetters mp={mp} />
          <motion.div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginTop: 40 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: mp.reduce ? 0 : 0.5, delay: mp.reduce ? 0 : 0.45, ease: EASE }}>
            <motion.button whileTap={mp.tap} className="dp-btn dp-btn-lg dp-btn-primary" onClick={() => go('login')}>Launch Console<i className="fa-solid fa-arrow-right" /></motion.button>
            <motion.button whileTap={mp.tap} className="dp-btn dp-btn-lg dp-btn-ghost" onClick={() => document.getElementById('dp-modules')?.scrollIntoView({ behavior: 'smooth' })}>Explore Modules</motion.button>
          </motion.div>
          <motion.div className="dp-c-illus" initial={{ opacity: 0, y: mp.reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: mp.reduce ? 0 : 0.5, delay: mp.reduce ? 0 : 0.55, ease: EASE }}>
            <Img name="minimal-workspace" alt="Illustration of two people working on laptops at a shared desk" eager small={600} large={1200} sizes="(max-width: 760px) 100vw, 760px" />
          </motion.div>
          <Reveal mp={mp} className="dp-c-stats">
            {STATS.map(s => <Item mp={mp} key={s.label}><div className="dp-stat-num">{s.text || <CountUp to={s.num} decimals={s.decimals} suffix={s.suffix} />}</div><div className="dp-stat-label">{s.label}</div></Item>)}
          </Reveal>
        </div>
      </header>
      <section className="dp-section" id="dp-modules">
        <div className="dp-wrap">
          <Reveal mp={mp} className="dp-section-head">
            <Item mp={mp} className="dp-eyebrow">{T.capEyebrow}</Item>
            <Item mp={mp} as="h2" className="dp-head" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)' }}>{T.capTitle}</Item>
            <Item mp={mp} as="p" className="dp-lead">{T.capDesc}</Item>
          </Reveal>
          <Reveal mp={mp} className="dp-c-list">
            {MODULES.map((m, i) => (
              <Item mp={mp} key={m.title} className="dp-c-row"><span className="dp-c-num">0{i + 1}</span><h3 className="dp-head">{m.title}</h3><p>{m.desc}</p></Item>
            ))}
          </Reveal>
        </div>
      </section>
      <section className="dp-section" id="dp-tenets" style={{ background: 'var(--dp-surface-2)' }}>
        <div className="dp-wrap dp-c-split">
          <div>
            <Reveal mp={mp} className="dp-section-head" style={{ marginBottom: 40 }}>
              <Item mp={mp} className="dp-eyebrow">{T.tenEyebrow}</Item>
              <Item mp={mp} as="h2" className="dp-head" style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.4rem)' }}>{T.tenTitle}</Item>
              <Item mp={mp} as="p" className="dp-lead">{T.tenDesc}</Item>
            </Reveal>
            <Reveal mp={mp} className="dp-c-tenets">
              {TENETS.map(t => <Item mp={mp} key={t.title} className="dp-tenet"><h3>{t.title}</h3><p>{t.desc}</p></Item>)}
            </Reveal>
          </div>
          <Reveal mp={mp}><Item mp={mp}><Img name="minimal-collab" alt="Illustration of two people collaborating in real time" small={600} large={1200} /></Item></Reveal>
        </div>
      </section>
      <section className="dp-section">
        <div className="dp-wrap dp-c-split">
          <Reveal mp={mp}><Item mp={mp}><Img name="minimal-chart" alt="Illustration of a person presenting a pie chart" small={600} large={1200} /></Item></Reveal>
          <Reveal mp={mp}>
            <Item mp={mp} className="dp-eyebrow">{T.orgEyebrow}</Item>
            <Item mp={mp} as="h2" className="dp-head" style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.4rem)', margin: '14px 0' }}>{T.orgTitle}</Item>
            <Item mp={mp} as="p" className="dp-lead">{T.orgDesc}</Item>
            <Item mp={mp}><OrgPoints /></Item>
          </Reveal>
        </div>
      </section>
      <section className="dp-c-cta">
        <Reveal mp={mp} className="dp-wrap">
          <Item mp={mp} as="h2" className="dp-head">{T.ctaTitle}</Item>
          <Item mp={mp} as="p">{T.ctaDesc}</Item>
          <Item mp={mp}><motion.button whileTap={mp.tap} className="dp-btn dp-btn-lg dp-btn-primary" onClick={() => go('login')}>Launch Portal<i className="fa-solid fa-arrow-right" /></motion.button></Item>
        </Reveal>
      </section>
      <Footer mp={mp} />
    </>
  );
}

// ---------- Login (visual only — does not call the API) ----------
function Login({ dir, mp, go }) {
  const [role, setRole] = useState('hr');
  const [busy, setBusy] = useState(false);
  const side = LOGIN_SIDE[role];
  const submit = e => { e.preventDefault(); setBusy(true); setTimeout(() => { setBusy(false); go('dashboard'); }, 900); };
  return (
    <div className="dp-login">
      <aside className="dp-login-side">
        {dir !== 'c' && <picture><Img name={dir === 'a' ? 'corporate-office' : 'campus-pair'} alt={dir === 'a' ? 'Employee working in a modern private office' : 'Two colleagues reviewing work on a laptop'} eager sizes="50vw" /></picture>}
        <a className="dp-brand" style={{ cursor: 'pointer' }} onClick={() => go('landing')}><i className="fa-solid fa-circle-nodes" />HR O</a>
        <div>
          {dir === 'c' && <div className="dp-c-login-illus"><Img name="minimal-security" alt="Illustration of a person managing user permissions on a dashboard" eager small={600} large={1200} sizes="440px" /></div>}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={role} initial={{ opacity: 0, y: mp.reduce ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: mp.reduce ? 0 : -6 }} transition={{ duration: mp.reduce ? 0 : 0.3, ease: EASE }}>
              <div className="dp-eyebrow" style={dir === 'c' ? undefined : { color: 'rgba(255,255,255,.75)' }}>{side.eyebrow}</div>
              <h2 className="dp-head">{side.title}</h2>
              <p>{side.desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="dp-login-foot"><i className="fa-solid fa-shield-halved" />HR O AI™ — Operational Security</div>
      </aside>
      <main className="dp-login-main">
        <motion.div className="dp-login-card" variants={mp.group} initial="hidden" animate="show">
          <Item mp={mp} className="dp-seg" role="tablist">
            <LayoutGroup id="seg">
              {[['hr', 'HR Portal', 'fa-user-tie'], ['employee', 'Employee Portal', 'fa-user']].map(([k, label, ic]) => (
                <button key={k} type="button" role="tab" aria-selected={role === k} className={role === k ? 'on' : ''} onClick={() => setRole(k)}>
                  {role === k && <motion.span layoutId="seg-pill" className="dp-seg-pill" transition={{ duration: mp.reduce ? 0 : 0.25, ease: EASE }} />}
                  <span><i className={`fa-solid ${ic}`} />{label}</span>
                </button>
              ))}
            </LayoutGroup>
          </Item>
          <Item mp={mp} as="h1" className="dp-head">Welcome Back</Item>
          <Item mp={mp} as="p" className="dp-login-sub">{role === 'hr' ? 'HR Director Access' : 'Employee Self-Service'}</Item>
          <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
            <Item mp={mp} className="dp-field"><label className="dp-label">Email Address</label><div className="dp-input-icon"><i className="fa-regular fa-envelope" /><input className="dp-input" type="email" autoComplete="off" /></div></Item>
            <Item mp={mp} className="dp-field"><label className="dp-label">Password</label><div className="dp-input-icon"><i className="fa-solid fa-lock" /><input className="dp-input" type="password" autoComplete="new-password" /></div></Item>
            <Item mp={mp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.84rem' }}>
              <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--dp-text-2)', cursor: 'pointer' }}><input type="checkbox" defaultChecked style={{ accentColor: 'var(--dp-primary)' }} />Remember me</label>
              <a style={{ color: 'var(--dp-primary)', fontWeight: 600, cursor: 'pointer' }}>Forgot Password?</a>
            </Item>
            <Item mp={mp}>
              <motion.button whileTap={mp.tap} type="submit" className="dp-btn dp-btn-lg dp-btn-primary" style={{ width: '100%' }} disabled={busy}>
                {busy ? <><span className="dp-spinner" />Authenticating...</> : 'Authenticate & Enter'}
              </motion.button>
            </Item>
          </form>
          <Item mp={mp} className="dp-login-links"><span>New here? <a>Create an account</a></span></Item>
        </motion.div>
      </main>
    </div>
  );
}

// ---------- Dashboard ----------
function TopBar({ dir, mp, theme, setTheme, onMenu }) {
  const [open, setOpen] = useState(null);
  const [active, setActive] = useState('Overview');
  const underline = dir !== 'b';
  return (
    <header className="dp-header" onMouseLeave={() => setOpen(null)}>
      <button className="dp-icon-btn dp-hamburger" aria-label="Open menu" onClick={onMenu}><i className="fa-solid fa-bars" /></button>
      <div className="dp-brand"><i className="fa-solid fa-circle-nodes" style={{ color: dir === 'a' ? 'var(--dp-accent)' : 'var(--dp-primary)' }} />HR O</div>
      <LayoutGroup id={`nav-${dir}`}>
        <nav className="dp-nav" aria-label="Main">
          {NAV.map(g => (
            <div key={g.group} className="dp-nav-item" onMouseEnter={() => setOpen(g.group)}>
              <button className={`dp-nav-btn ${active === g.group ? 'active' : ''}`} aria-expanded={open === g.group} onClick={() => { setActive(g.group); setOpen(open === g.group ? null : g.group); }}>
                {active === g.group && <motion.span layoutId="nav-ind" className={underline ? 'dp-nav-underline' : 'dp-nav-pill'} transition={{ duration: mp.reduce ? 0 : 0.3, ease: EASE }} />}
                <i className={`fa-solid ${g.icon} dp-nav-ico`} /><span>{g.group}</span>{g.items.length > 1 && <i className="fa-solid fa-chevron-down" />}
              </button>
              <AnimatePresence>
                {open === g.group && g.items.length > 1 && (
                  <motion.div className="dp-dropdown" initial={{ opacity: 0, y: mp.reduce ? 0 : -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: mp.reduce ? 0 : -4 }} transition={mp.quick}>
                    {g.items.map(([t, d, ic]) => (
                      <div key={t} className="dp-dd-item" onClick={() => { setActive(g.group); setOpen(null); }}><span className="dp-dd-icon"><i className={`fa-solid ${ic}`} /></span><div><div className="dp-dd-title">{t}</div><div className="dp-dd-desc">{d}</div></div></div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </LayoutGroup>
      <div className="dp-header-right">
        <div className="dp-search"><i className="fa-solid fa-magnifying-glass" />Search features, tools or c…</div>
        <button className="dp-icon-btn" aria-label="Notifications"><i className="fa-regular fa-bell" /><span className="dp-count">14</span></button>
        <button className="dp-icon-btn" aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}><i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} /></button>
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
          <motion.aside className="dp-drawer" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: mp.reduce ? 0 : 0.3, ease: EASE }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div className="dp-brand"><i className="fa-solid fa-circle-nodes" style={{ color: 'var(--dp-primary)' }} />HR O</div>
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
                      {g.items.map(([t, d, ic]) => <div key={t} className="dp-dd-item"><span className="dp-dd-icon"><i className={`fa-solid ${ic}`} /></span><div><div className="dp-dd-title">{t}</div><div className="dp-dd-desc">{d}</div></div></div>)}
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

function AttendanceChart({ mp }) {
  const [hover, setHover] = useState(null);
  const [W, setW] = useState(640);
  const boxRef = useRef(null);
  useEffect(() => {
    if (!boxRef.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(boxRef.current);
    return () => ro.disconnect();
  }, []);
  const H = W < 480 ? 200 : 240, P = { l: 40, r: 12, t: 12, b: 28 }, min = 85, max = 100;
  const x = i => P.l + (i * (W - P.l - P.r)) / (ATTENDANCE.length - 1);
  const y = v => P.t + ((max - v) * (H - P.t - P.b)) / (max - min);
  const line = ATTENDANCE.map(([, v], i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ');
  const area = `${line} L${x(ATTENDANCE.length - 1)},${H - P.b} L${x(0)},${H - P.b} Z`;
  const last = ATTENDANCE.length - 1;
  const onMove = e => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    setHover(Math.max(0, Math.min(last, Math.round(((px - P.l) / (W - P.l - P.r)) * last))));
  };
  return (
    <>
      <div className="dp-card-head"><div><div className="dp-card-title">Monthly Attendance Trends</div></div></div>
      <div className="dp-chart" ref={boxRef}>
        <svg viewBox={`0 0 ${W} ${H}`} onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img" aria-label="Monthly attendance trend, between 91% and 97%">
          {[85, 90, 95, 100].map(t => <g key={t}><line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="var(--dp-grid)" strokeWidth="1" /><text className="dp-axis" x={P.l - 8} y={y(t) + 4} textAnchor="end">{t}%</text></g>)}
          {ATTENDANCE.map(([m], i) => (W >= 480 || i % 2 === 0) && <text key={m} className="dp-axis" x={x(i)} y={H - 8} textAnchor="middle">{m}</text>)}
          <motion.path d={area} fill="var(--dp-chart)" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} transition={{ duration: mp.reduce ? 0 : 0.5, delay: mp.reduce ? 0 : 0.3 }} />
          <motion.path d={line} fill="none" stroke="var(--dp-chart)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: mp.reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: mp.reduce ? 0 : 0.5, ease: EASE }} />
          <circle cx={x(last)} cy={y(ATTENDANCE[last][1])} r="4" fill="var(--dp-chart)" stroke="var(--dp-surface)" strokeWidth="2" />
          <text x={x(last) - 8} y={y(ATTENDANCE[last][1]) - 10} textAnchor="end" style={{ fontSize: 12, fontWeight: 700, fill: 'var(--dp-text)' }}>97%</text>
          {hover !== null && <g pointerEvents="none"><line x1={x(hover)} x2={x(hover)} y1={P.t} y2={H - P.b} stroke="var(--dp-border-strong)" strokeWidth="1" /><circle cx={x(hover)} cy={y(ATTENDANCE[hover][1])} r="5" fill="var(--dp-chart)" stroke="var(--dp-surface)" strokeWidth="2" /></g>}
        </svg>
        {hover !== null && <div className="dp-tooltip" style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(ATTENDANCE[hover][1]) / H) * 100}%` }}>{ATTENDANCE[hover][1]}%<span>{ATTENDANCE[hover][0]}</span></div>}
      </div>
    </>
  );
}

function Dashboard({ dir, mp, theme, setTheme, toast }) {
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState(false);
  const [dept, setDept] = useState('All Departments');
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const [notify, setNotify] = useState(true);
  const rows = EMPLOYEES.filter(e => dept === 'All Departments' || e.dept === dept);
  const invalid = touched && reason.trim().length < 5;
  const card = (extra = '') => `dp-card ${extra}`;
  return (
    <>
      <TopBar dir={dir} mp={mp} theme={theme} setTheme={setTheme} onMenu={() => setMenu(true)} />
      <MobileDrawer open={menu} onClose={() => setMenu(false)} mp={mp} />
      <motion.main key={dir} className="dp-main" variants={mp.group} initial="hidden" animate="show">
        <Item mp={mp} className={card('dp-welcome')}>
          <div>
            <h1 className="dp-head">Welcome back, Venkat!</h1>
            <p>You have administrative access to monitor employee directories, manage statutory PF/ESI compliance, approve timesheets, and review candidate applications.</p>
          </div>
          <div className="dp-welcome-img">{dir === 'c' ? <Img name="minimal-workspace" alt="" small={600} large={1200} sizes="320px" /> : <Img name={dir === 'a' ? 'corporate-meeting' : 'campus-hero'} alt="" sizes="260px" />}</div>
        </Item>
        <div className="dp-grid-4">
          {KPIS.map(k => (
            <Item mp={mp} key={k.label} className={card('dp-kpi dp-lift')} whileHover={mp.hoverLift}>
              <div className="dp-kpi-top"><span className="dp-kpi-label">{k.label}</span><span className={`dp-kpi-icon tone-${k.tone}`}><i className={`fa-solid ${k.icon}`} /></span></div>
              <div className="dp-kpi-val"><CountUp to={k.value} /></div>
              <div className="dp-kpi-foot">{k.trend ? <span className="dp-trend-up"><i className="fa-solid fa-arrow-up" /> {k.foot}</span> : k.foot}</div>
            </Item>
          ))}
        </div>
        <div className="dp-grid-2-1">
          <Item mp={mp} className={card()}><AttendanceChart key={`${dir}-${theme}`} mp={mp} /></Item>
          <Item mp={mp} className={card()}>
            <div className="dp-card-head"><div className="dp-card-title">HR O AI™ Insights</div></div>
            <div className="dp-insight"><i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--dp-primary)' }} />Attendance is up 4% compared to this day last week. Friday drop is stabilized.</div>
            <div className="dp-insight"><i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--dp-warning)' }} />2 employees have pending leave requests. Resolve soon.</div>
            <div className="dp-insight"><i className="fa-solid fa-circle-check" style={{ color: 'var(--dp-success)' }} />All candidates in Screening have completed HR screening calls.</div>
          </Item>
        </div>
        <Item mp={mp} className={card()}>
          <div className="dp-card-head">
            <div><div className="dp-card-title">Core Employees Grid</div></div>
            <motion.button whileTap={mp.tap} className="dp-btn dp-btn-primary" onClick={() => setModal(true)}><i className="fa-solid fa-plus" />Add Employee</motion.button>
          </div>
          <div className="dp-toolbar">
            <LayoutGroup id="chips">
              {['All Departments', 'Engineering', 'Human Resources', 'Finance', 'Design'].map(d => (
                <button key={d} className={`dp-chip ${dept === d ? 'on' : ''}`} onClick={() => setDept(d)}>
                  {dept === d && <motion.span layoutId="chip-bg" className="dp-chip-bg" transition={{ duration: mp.reduce ? 0 : 0.25, ease: EASE }} />}<span>{d}</span>
                </button>
              ))}
            </LayoutGroup>
          </div>
          <div className="dp-table-wrap">
            <table className="dp-table">
              <thead><tr><th>Employee</th><th>ID</th><th>Department</th><th>Designation</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {rows.map((e, i) => (
                    <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={mp.quick}>
                      <td><div className="dp-person"><span className={`dp-person-av tone-${AV_TONES[i % 4]}`}>{e.name.split(' ').map(s => s[0]).join('')}</span><div><div className="dp-person-name">{e.name}</div><div className="dp-person-mail">{e.email}</div></div></div></td>
                      <td>{e.id}</td><td>{e.dept}</td><td>{e.role}</td>
                      <td><span className={`dp-badge tone-${STATUS_TONE[e.status]}`} style={{ '--dp-badge-c': `var(--dp-${STATUS_TONE[e.status]})` }}><span className="dp-badge-dot" />{e.status.toUpperCase()}</span></td>
                      <td><div className="dp-row-actions"><button className="dp-btn dp-btn-secondary dp-btn-sm"><i className="fa-regular fa-id-card" />View Details & Docs</button><button className="dp-btn dp-btn-ghost dp-btn-sm">View Ledger</button></div></td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Item>
        <div className="dp-grid-2">
          <Item mp={mp} className={card()}>
            <div className="dp-card-head"><div><div className="dp-card-title">Apply Leave</div><div className="dp-card-sub">Sample form: focus ring and validation</div></div></div>
            <div className="dp-form-grid">
              <div className="dp-field"><label className="dp-label">Leave Type</label><select className="dp-input" defaultValue="Casual Leave"><option>Casual Leave</option><option>Sick Leave</option><option>Earned Leave</option></select></div>
              <div className="dp-field"><label className="dp-label">From Date</label><input type="date" className="dp-input" defaultValue="2026-11-10" /></div>
              <div className="dp-field" style={{ gridColumn: '1 / -1' }}>
                <label className="dp-label">Reason</label>
                <textarea className={`dp-input ${invalid ? 'invalid' : ''}`} value={reason} onChange={e => setReason(e.target.value)} onBlur={() => setTouched(true)} />
                <AnimatePresence>{invalid && <motion.div className="dp-error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={mp.quick}><i className="fa-solid fa-circle-exclamation" />Please enter at least 5 characters.</motion.div>}</AnimatePresence>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, gridColumn: '1 / -1' }}>
                <button className={`dp-switch ${notify ? 'on' : ''}`} role="switch" aria-checked={notify} aria-label="Notify" onClick={() => setNotify(n => !n)}><motion.span className="dp-switch-knob" animate={{ x: notify ? 18 : 0 }} transition={{ duration: mp.reduce ? 0 : 0.2, ease: EASE }} /></button>
                <motion.button whileTap={mp.tap} className="dp-btn dp-btn-primary" style={{ marginLeft: 'auto' }} onClick={() => { setTouched(true); if (reason.trim().length >= 5) toast('Leave request submitted'); }}>Submit</motion.button>
              </div>
            </div>
          </Item>
          <Item mp={mp} className={card()}>
            <div className="dp-card-head"><div className="dp-card-title">Upcoming Tasks & Actions</div></div>
            {[['Approve Leave for Vikram Shah', 'Casual Leave · 2 days'], ['Review PF challan for October', 'Statutory Compliance'], ['Schedule interview: Frontend Developer', 'Recruitment & ATS']].map(([t, m]) => (
              <div key={t} className="dp-task"><div><div className="dp-task-title">{t}</div><div className="dp-task-meta">{m}</div></div><button className="dp-btn dp-btn-soft dp-btn-sm">Open</button></div>
            ))}
            <div style={{ display: 'grid', gap: 8, marginTop: 16 }} aria-label="Loading skeleton example">
              <div className="dp-skel" style={{ height: 10, width: '55%' }} /><div className="dp-skel" style={{ height: 8, width: '80%' }} />
            </div>
          </Item>
        </div>
      </motion.main>
      <AnimatePresence>
        {modal && (
          <motion.div className="dp-modal-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={mp.quick} onClick={() => setModal(false)}>
            <motion.div className="dp-modal" role="dialog" aria-modal="true" aria-label="Add Employee" onClick={e => e.stopPropagation()} initial={{ opacity: 0, y: mp.reduce ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: mp.reduce ? 0 : 8 }} transition={{ duration: mp.reduce ? 0 : 0.25, ease: EASE }}>
              <div className="dp-modal-head"><div className="dp-card-title">Add Employee</div><button className="dp-icon-btn" aria-label="Close" onClick={() => setModal(false)}><i className="fa-solid fa-xmark" /></button></div>
              <div className="dp-modal-body">
                <div className="dp-form-grid">
                  <div className="dp-field"><label className="dp-label">Full Name</label><input className="dp-input" placeholder="John Doe" /></div>
                  <div className="dp-field"><label className="dp-label">Email Address</label><input className="dp-input" placeholder="john@company.com" /></div>
                  <div className="dp-field"><label className="dp-label">Department</label><select className="dp-input"><option>Engineering</option><option>Product</option><option>Design</option><option>Marketing</option><option>Operations</option><option>Finance</option><option>Human Resources</option></select></div>
                  <div className="dp-field"><label className="dp-label">Role</label><input className="dp-input" placeholder="e.g. Developer" /></div>
                </div>
              </div>
              <div className="dp-modal-foot"><button className="dp-btn dp-btn-ghost" onClick={() => setModal(false)}>Cancel</button><motion.button whileTap={mp.tap} className="dp-btn dp-btn-primary" onClick={() => { setModal(false); toast('Preview only — nothing was saved'); }}>Save</motion.button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ---------- Page ----------
export default function DesignPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [, , dirSeg, viewSeg] = location.pathname.split('/');
  const dir = DIRS[dirSeg] ? dirSeg : 'a';
  const view = VIEWS[viewSeg] ? viewSeg : 'landing';
  const [theme, setTheme] = useState(() => new URLSearchParams(location.search).get('theme') || 'light');
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef(null);
  const mp = useMotion(dir);

  useEffect(() => {
    if (document.getElementById('dp-fonts')) return;
    const l = document.createElement('link');
    l.id = 'dp-fonts'; l.rel = 'stylesheet'; l.href = FONT_HREF;
    document.head.appendChild(l);
  }, []);
  useEffect(() => { document.title = `HR O — Design ${DIRS[dir].short}: ${DIRS[dir].name} · ${VIEWS[view]}`; window.scrollTo(0, 0); }, [dir, view]);

  const go = (v, d = dir) => navigate(`/design-preview/${d}/${v}${theme === 'dark' ? '?theme=dark' : ''}`);
  const toast = msg => { setToastMsg(msg); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToastMsg(null), 2400); };
  const Landing = { a: LandingA, b: LandingB, c: LandingC }[dir];

  return (
    <div className="dp-root" data-dir={dir} data-theme={theme}>
      <div key={`${dir}-${view}`}>
        {view === 'landing' && <Landing mp={mp} go={go} />}
        {view === 'login' && <Login dir={dir} mp={mp} go={go} />}
        {view === 'dashboard' && <Dashboard dir={dir} mp={mp} theme={theme} setTheme={setTheme} toast={toast} />}
      </div>

      <AnimatePresence>
        {toastMsg && (
          <motion.div className="dp-toast" role="status" initial={{ opacity: 0, y: mp.reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={mp.quick}><i className="fa-solid fa-circle-check" />{toastMsg}</motion.div>
        )}
      </AnimatePresence>

      <div className="dp-switcher" role="toolbar" aria-label="Preview controls">
        <LayoutGroup id="sw-dir">
          {Object.entries(DIRS).map(([k, v]) => (
            <button key={k} className={dir === k ? 'on' : ''} onClick={() => go(view, k)}>
              {dir === k && <motion.span layoutId="sw-dir" className="dp-switcher-pill" transition={{ duration: mp.reduce ? 0 : 0.25, ease: EASE }} />}
              <span><span className="dp-sw-long">{v.short}. {v.name}</span><span className="dp-sw-short">{v.short}</span></span>
            </button>
          ))}
        </LayoutGroup>
        <span className="dp-switcher-sep" />
        <LayoutGroup id="sw-view">
          {Object.entries(VIEWS).map(([k, v]) => (
            <button key={k} className={view === k ? 'on' : ''} onClick={() => go(k)}>
              {view === k && <motion.span layoutId="sw-view" className="dp-switcher-pill" transition={{ duration: mp.reduce ? 0 : 0.25, ease: EASE }} />}
              <span>{v}</span>
            </button>
          ))}
        </LayoutGroup>
        <span className="dp-switcher-sep" />
        <button onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))} aria-label="Toggle dark mode"><span><i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} /></span></button>
      </div>
    </div>
  );
}
