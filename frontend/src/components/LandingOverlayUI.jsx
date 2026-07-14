import React from 'react';
import { motion } from 'framer-motion';
import hrorbitLogo from '../assets/hrorbit_logo.png';

const LandingOverlayUI = ({ scrollProgress, onEnterPortal }) => {
  // Smooth scroll helper
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const modulesData = [
    {
      id: "workspace",
      num: "01",
      title: "HR O Workspace",
      badge: "Core Workforce Directory",
      desc: "Centralize your organization's records. Manage company branches, department lines, dynamic team maps, audit logs, and secure cloud credentials from one intuitive dashboard.",
      features: [
        "Multi-tier company branch directories",
        "Nested department & reporting matrices",
        "Encrypted Document Vault uploads",
        "Live organization audit trail logger"
      ],
      color: "#4f46e5",
      accent: "rgba(79, 70, 229, 0.08)",
      border: "rgba(79, 70, 229, 0.18)",
      graphicLeft: (
        <>
          <div style={{ color: '#4f46e5', fontWeight: 'bold' }}>// directory_audit.log</div>
          <div style={{ marginTop: '8px' }}>{`{`}</div>
          <div style={{ textIndent: '10px' }}>"active_branches": 4,</div>
          <div style={{ textIndent: '10px' }}>"total_employees": 153</div>
          <div>{`}`}</div>
        </>
      ),
      graphicRight: (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '6px' }}>
            <span style={{ fontSize: '0.65rem', color: '#0f172a', fontWeight: 700 }}>Workspace Sync</span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ height: '6px', width: '120px', background: '#e2e8f0', borderRadius: '4px' }} />
            <div style={{ height: '6px', width: '80px', background: '#e2e8f0', borderRadius: '4px' }} />
            <div style={{ height: '6px', width: '100px', background: 'linear-gradient(90deg, #4f46e5, #db2777)', borderRadius: '4px' }} />
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.55rem', color: '#4f46e5', fontWeight: 600 }}>Active Directory</span>
            <span style={{ fontSize: '0.55rem', color: '#db2777', fontWeight: 600 }}>Node #01</span>
          </div>
        </>
      )
    },
    {
      id: "shifts",
      num: "04",
      title: "HR O Shift Board",
      badge: "Time & Attendance Planner",
      desc: "Coordinate operational coverage. Configure complex shift timings, map rosters to employee groups, balance leave request quotas, and verify daily timesheets.",
      features: [
        "Automated shift group allocations",
        "Real-time clock-in timesheet logs",
        "Leave quota balance auditing",
        "Daily attendance status maps"
      ],
      color: "#db2777",
      accent: "rgba(219, 39, 119, 0.08)",
      border: "rgba(219, 39, 119, 0.18)",
      graphicLeft: (
        <>
          <div style={{ color: '#db2777', fontWeight: 'bold' }}>// shift_roster.json</div>
          <div style={{ marginTop: '8px' }}>{`{`}</div>
          <div style={{ textIndent: '10px' }}>"coverage_target": 98.4,</div>
          <div style={{ textIndent: '10px' }}>"active_shifts": "Roster_A"</div>
          <div>{`}`}</div>
        </>
      ),
      graphicRight: (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '6px' }}>
            <span style={{ fontSize: '0.65rem', color: '#0f172a', fontWeight: 700 }}>Timesheet Logs</span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0ea5e9', display: 'inline-block' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ height: '6px', width: '130px', background: '#e2e8f0', borderRadius: '4px' }} />
            <div style={{ height: '6px', width: '70px', background: '#e2e8f0', borderRadius: '4px' }} />
            <div style={{ height: '6px', width: '90px', background: 'linear-gradient(90deg, #db2777, #7c3aed)', borderRadius: '4px' }} />
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.55rem', color: '#db2777', fontWeight: 600 }}>Roster Allocated</span>
            <span style={{ fontSize: '0.55rem', color: '#0ea5e9', fontWeight: 600 }}>98.4% Sync</span>
          </div>
        </>
      )
    },
    {
      id: "compliance",
      title: "Compliance Engine",
      badge: "Statutory Payroll Calculator",
      desc: "Calculate precise payroll breakdowns. Automated integrations compute PF, ESI, tax slabs, customized allowance categories, and generate compliant banking exports.",
      features: [
        "Provident Fund (PF) & ESI calculators",
        "Professional tax and dynamic allowance levels",
        "Single-click bulk payslip generator",
        "Standard bank transfer export logs"
      ],
      color: "#0891b2",
      accent: "rgba(8, 145, 178, 0.08)",
      border: "rgba(8, 145, 178, 0.18)",
      graphicLeft: (
        <>
          <div style={{ color: '#0891b2', fontWeight: 'bold' }}>// statutory_rates.log</div>
          <div style={{ marginTop: '8px' }}>{`{`}</div>
          <div style={{ textIndent: '10px' }}>"pf_deduction": 12.0,</div>
          <div style={{ textIndent: '10px' }}>"esi_contribution": 0.75</div>
          <div>{`}`}</div>
        </>
      ),
      graphicRight: (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '6px' }}>
            <span style={{ fontSize: '0.65rem', color: '#0f172a', fontWeight: 700 }}>Payroll Disbursement</span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ height: '6px', width: '110px', background: '#e2e8f0', borderRadius: '4px' }} />
            <div style={{ height: '6px', width: '90px', background: '#e2e8f0', borderRadius: '4px' }} />
            <div style={{ height: '6px', width: '120px', background: 'linear-gradient(90deg, #0891b2, #4f46e5)', borderRadius: '4px' }} />
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.55rem', color: '#0891b2', fontWeight: 600 }}>100% Calculated</span>
            <span style={{ fontSize: '0.55rem', color: '#10b981', fontWeight: 600 }}>Verified Ledger</span>
          </div>
        </>
      )
    },
    {
      id: "manager",
      title: "Talent Orchestration",
      badge: "Administrative Controller",
      desc: "Set and forget recurring HR operations. Automate monthly payroll updates, attendance roll-ups, compliance check cycles, and security logs verification.",
      features: [
        "Recurring automated payroll scheduling",
        "Real-time visual operations dashboard",
        "Audit approval hooks for regional edits",
        "Dynamic role access controls validation"
      ],
      color: "#a855f7",
      accent: "rgba(168, 85, 247, 0.08)",
      border: "rgba(168, 85, 247, 0.18)",
      graphicLeft: (
        <>
          <div style={{ color: '#a855f7', fontWeight: 'bold' }}>// recurring_cron.yaml</div>
          <div style={{ marginTop: '8px' }}>{`{`}</div>
          <div style={{ textIndent: '10px' }}>"cron": "0 0 1 * *",</div>
          <div style={{ textIndent: '10px' }}>"task": "ledger_rollup"</div>
          <div>{`}`}</div>
        </>
      ),
      graphicRight: (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '6px' }}>
            <span style={{ fontSize: '0.65rem', color: '#0f172a', fontWeight: 700 }}>Access Credentials</span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7', display: 'inline-block' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ height: '6px', width: '100px', background: '#e2e8f0', borderRadius: '4px' }} />
            <div style={{ height: '6px', width: '110px', background: '#e2e8f0', borderRadius: '4px' }} />
            <div style={{ height: '6px', width: '80px', background: 'linear-gradient(90deg, #a855f7, #db2777)', borderRadius: '4px' }} />
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.55rem', color: '#a855f7', fontWeight: 600 }}>Secured Vault Link</span>
            <span style={{ fontSize: '0.55rem', color: '#db2777', fontWeight: 600 }}>Role: Admin</span>
          </div>
        </>
      )
    }
  ];

  // Scroll animations variants
  const fadeInUp = {
    initial: { opacity: 0, y: 35 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: 0.7, ease: "easeOut" }
  };

  const cardSlideIn = {
    initial: { opacity: 0, y: 60, scale: 0.96 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] }
  };

  // Text slide-in letters setup for HR O
  const brandLetters = "HR ORBIT".split("");

  const letterStagger = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };

  const singleLetter = {
    initial: { opacity: 0, y: 12 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <div className="landing-overlay-container" style={{ position: 'relative', width: '100%', zIndex: 10, color: '#0f172a', background: 'transparent' }}>

      {/* 1. Header (Sticky navigation) */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 48px',
        zIndex: 100,
        background: 'rgba(250, 248, 245, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        {/* Brand Logo */}
        <div
          onClick={() => scrollToSection('hero-section')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 700, cursor: 'pointer' }}
        >
          <img src={hrorbitLogo} alt="HR O Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
          <span style={{ letterSpacing: '1px', fontWeight: 800, color: '#0f172a' }}>HR O</span>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span 
            onClick={() => scrollToSection('surfaces-section')} 
            style={{ 
              cursor: 'pointer', 
              color: '#475569', 
              fontSize: '0.82rem', 
              fontWeight: 700, 
              padding: '8px 16px',
              borderRadius: '20px',
              transition: 'all 0.25s ease-out'
            }} 
            className="hover:bg-indigo-500/10 hover:text-indigo-600 hover:-translate-y-0.5 active:translate-y-0"
          >
            Modules
          </span>
          <span 
            onClick={() => scrollToSection('tenets-section')} 
            style={{ 
              cursor: 'pointer', 
              color: '#475569', 
              fontSize: '0.82rem', 
              fontWeight: 700, 
              padding: '8px 16px',
              borderRadius: '20px',
              transition: 'all 0.25s ease-out'
            }} 
            className="hover:bg-indigo-500/10 hover:text-indigo-600 hover:-translate-y-0.5 active:translate-y-0"
          >
            Tenets
          </span>
          <span 
            onClick={() => scrollToSection('usecases-section')} 
            style={{ 
              cursor: 'pointer', 
              color: '#475569', 
              fontSize: '0.82rem', 
              fontWeight: 700, 
              padding: '8px 16px',
              borderRadius: '20px',
              transition: 'all 0.25s ease-out'
            }} 
            className="hover:bg-indigo-500/10 hover:text-indigo-600 hover:-translate-y-0.5 active:translate-y-0"
          >
            Console
          </span>
          <button
            onClick={onEnterPortal}
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              border: 'none',
              color: '#ffffff',
              padding: '8px 20px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(79, 70, 229, 0.25)',
              transition: 'all 0.3s ease',
              marginLeft: '8px'
            }}
            className="hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Launch Portal
          </button>
        </nav>
      </header>

{/* 2. Centered Hero Section */}
      <section id="hero-section" style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '140px 8% 50px 8%',
        position: 'relative',
        zIndex: 5,
        textAlign: 'center',
        boxSizing: 'border-box'
      }}>
        {/* Upper content (centered vertically in remaining space) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', maxWidth: '800px', margin: 'auto 0' }}>

          {/* Large Floating animated brand letters header */}
          <motion.h1
            animate={{
              y: [0, -14, 0]
            }}
            transition={{
              y: { repeat: Infinity, duration: 6, ease: "easeInOut" }
            }}
            style={{
              fontSize: 'clamp(3rem, 7.5vw, 6.2rem)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-2px',
              background: 'linear-gradient(135deg, #0f172a 30%, #4f46e5 70%, #db2777 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 24px 0',
              display: 'flex',
              gap: '4px',
              justifyContent: 'center'
            }}
          >
            <motion.span
              variants={letterStagger}
              initial="initial"
              animate="animate"
              style={{ display: 'inline-flex', gap: '2px' }}
            >
              {brandLetters.map((char, index) => (
                <motion.span key={index} variants={singleLetter}>
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.span>
          </motion.h1>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <button
              onClick={onEnterPortal}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                border: 'none',
                color: '#ffffff',
                padding: '14px 36px',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(79, 70, 229, 0.25)',
                transition: 'all 0.3s'
              }}
              className="hover:scale-[1.03] hover:shadow-[0_8px_35px_rgba(79,70,229,0.4)]"
            >
              Launch Console
              <i className="fa-solid fa-arrow-right" style={{ marginLeft: '10px' }}></i>
            </button>

            <button
              onClick={() => scrollToSection('surfaces-section')}
              style={{
                background: 'rgba(0, 0, 0, 0.03)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                color: '#334155',
                padding: '14px 28px',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              className="hover:bg-black/5 hover:border-black/10"
            >
              Explore Modules
            </button>
          </div>

          {/* System Info */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '64px',
            marginTop: '24px',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            width: '100%',
            paddingTop: '18px'
          }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>98.4%</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Punctuality Average</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4f46e5' }}>12.8 seconds</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Audit Log Execution</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#db2777' }}>Statutory</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>PF & ESI Compliance</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Surfaces Breakdowns (Overhauled to 2x2 Grid of Separate Cards) */}
      <section id="surfaces-section" style={{
        minHeight: '100vh',
        padding: '100px 8%',
        background: 'rgba(255, 255, 255, 0.25)',
        borderTop: '1px solid rgba(0,0,0,0.03)',
        borderBottom: '1px solid rgba(0,0,0,0.03)'
      }}>
        {/* Title Section */}
        <motion.div
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            initial: {},
            whileInView: { transition: { staggerChildren: 0.1 } }
          }}
          style={{ textAlign: 'center', marginBottom: '70px' }}
        >
          <motion.span
            variants={fadeInUp}
            style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}
          >
            Enterprise Capabilities
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            style={{ fontSize: '3rem', fontWeight: 800, marginTop: '10px', color: '#0f172a' }}
          >
            The unified portals structure.
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            style={{ color: '#475569', maxWidth: '600px', margin: '16px auto 0 auto', fontSize: '0.95rem', lineHeight: 1.6 }}
          >
            A complete suite of modules designed to eliminate operational friction and keep compliance, registers, and payroll working seamlessly.
          </motion.p>
        </motion.div>

        {/* 2x2 Responsive Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '40px',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {modulesData.map((module) => (
            <motion.div
              key={module.id}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, amount: 0.15 }}
              variants={cardSlideIn}
              whileHover={{
                y: -10,
                scale: 1.018,
                borderColor: module.color === "#4f46e5" ? "rgba(79, 70, 229, 0.35)" :
                  module.color === "#db2777" ? "rgba(219, 39, 119, 0.35)" :
                    module.color === "#0891b2" ? "rgba(8, 145, 178, 0.35)" :
                      "rgba(168, 85, 247, 0.35)",
                boxShadow: module.color === "#4f46e5" ? "0 20px 45px rgba(79, 70, 229, 0.08)" :
                  module.color === "#db2777" ? "0 20px 45px rgba(219, 39, 119, 0.08)" :
                    module.color === "#0891b2" ? "0 20px 45px rgba(8, 145, 178, 0.08)" :
                      "0 20px 45px rgba(168, 85, 247, 0.08)"
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.72)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                borderRadius: '24px',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '32px',
                boxShadow: '0 15px 35px rgba(0,0,0,0.04)',
                backdropFilter: 'blur(20px)',
                transition: 'border-color 0.3s, box-shadow 0.3s'
              }}
              className="interactive-card"
            >
              {/* Card Header & Text Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <span style={{ color: module.color, fontSize: '0.7rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {module.badge}
                </span>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {module.title}
                </h3>
                <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                  {module.desc}
                </p>

                {/* Features Checkmarks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  {module.features.map((feat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <i className="fa-solid fa-circle-check" style={{ color: module.color, fontSize: '0.9rem' }} />
                      <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 500 }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Interactive Graphic Area (Mockup) */}
              <div style={{
                background: 'rgba(0,0,0,0.01)',
                border: '1px solid rgba(0,0,0,0.04)',
                borderRadius: '16px',
                height: '220px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Floating Glass Log Card */}
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                    rotate: [-3, -4, -3]
                  }}
                  transition={{
                    y: { repeat: Infinity, duration: 6, ease: "easeInOut" },
                    rotate: { repeat: Infinity, duration: 8, ease: "easeInOut" }
                  }}
                  style={{
                    position: 'absolute',
                    width: '150px',
                    height: '110px',
                    background: `linear-gradient(135deg, ${module.color}11 0%, rgba(255,255,255,0.4) 100%)`,
                    border: `1px solid ${module.border}`,
                    borderRadius: '10px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
                    padding: '12px',
                    fontSize: '0.58rem',
                    fontFamily: 'monospace',
                    color: '#475569',
                    backdropFilter: 'blur(4px)',
                    transform: 'rotate(-3deg) translate(-25px, -10px)'
                  }}
                >
                  {module.graphicLeft}
                </motion.div>

                {/* Floating Detail Sync Card */}
                <motion.div
                  animate={{
                    y: [0, 8, 0],
                    rotate: [3, 4, 3]
                  }}
                  transition={{
                    y: { repeat: Infinity, duration: 5, ease: "easeInOut" },
                    rotate: { repeat: Infinity, duration: 7, ease: "easeInOut" }
                  }}
                  style={{
                    position: 'absolute',
                    width: '160px',
                    height: '120px',
                    background: 'rgba(255, 255, 255, 0.96)',
                    border: `1px solid ${module.border}`,
                    borderRadius: '10px',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    transform: 'rotate(3deg) translate(25px, 10px)'
                  }}
                >
                  {module.graphicRight}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Core Tenets */}
      <section id="tenets-section" style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '100px 8%'
      }}>
        <div style={{ maxWidth: '650px', marginBottom: '60px' }}>
          <span style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Operational Anchors</span>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, marginTop: '10px', color: '#0f172a' }}>The tenets of HR O architecture.</h2>
          <p style={{ color: '#475569', marginTop: '16px', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Our enterprise system operates under four core anchors to guarantee absolute data security, process autonomy, logs audit trail, and payroll accuracy.
          </p>
        </div>

        {/* Tenets Grid with viewport animation */}
        <motion.div
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            initial: {},
            whileInView: { transition: { staggerChildren: 0.1 } }
          }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', width: '100%' }}
        >
          {/* Card 1 */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -8, scale: 1.018, borderColor: 'rgba(79, 70, 229, 0.35)', boxShadow: '0 15px 30px rgba(79, 70, 229, 0.06)' }}
            style={{
              background: 'rgba(255, 255, 255, 0.72)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              borderRadius: '20px',
              padding: '32px',
              cursor: 'pointer',
              transition: 'border-color 0.3s, box-shadow 0.3s'
            }}
            className="interactive-card"
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'rgba(79, 70, 229, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              border: '1px solid rgba(79, 70, 229, 0.15)'
            }}>
              <i className="fa-solid fa-lock" style={{ color: '#4f46e5', fontSize: '1.15rem' }}></i>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>Security</h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              Secure document vault file uploads, granular role authorization models, encrypted databases, and locked company profiles data.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -8, scale: 1.018, borderColor: 'rgba(219, 39, 119, 0.35)', boxShadow: '0 15px 30px rgba(219, 39, 119, 0.06)' }}
            style={{
              background: 'rgba(255, 255, 255, 0.72)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              borderRadius: '20px',
              padding: '32px',
              cursor: 'pointer',
              transition: 'border-color 0.3s, box-shadow 0.3s'
            }}
            className="interactive-card"
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'rgba(219, 39, 119, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              border: '1px solid rgba(219, 39, 119, 0.15)'
            }}>
              <i className="fa-solid fa-arrows-spin" style={{ color: '#db2777', fontSize: '1.15rem' }}></i>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>Autonomy</h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              Enable staff with self-service profiles, automated leave approval parameters, recurring timesheet rollups, and digital compliance ledgers.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -8, scale: 1.018, borderColor: 'rgba(79, 70, 229, 0.35)', boxShadow: '0 15px 30px rgba(79, 70, 229, 0.06)' }}
            style={{
              background: 'rgba(255, 255, 255, 0.72)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              borderRadius: '20px',
              padding: '32px',
              cursor: 'pointer',
              transition: 'border-color 0.3s, box-shadow 0.3s'
            }}
            className="interactive-card"
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'rgba(79, 70, 229, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              border: '1px solid rgba(79, 70, 229, 0.15)'
            }}>
              <i className="fa-solid fa-list-check" style={{ color: '#4f46e5', fontSize: '1.15rem' }}></i>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>Accuracy</h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              Synchronize live timesheet check-ins, automated Professional Tax/ESI deduction formulas, and department mapping profiles data.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -8, scale: 1.018, borderColor: 'rgba(219, 39, 119, 0.35)', boxShadow: '0 15px 30px rgba(219, 39, 119, 0.06)' }}
            style={{
              background: 'rgba(255, 255, 255, 0.72)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              borderRadius: '20px',
              padding: '32px',
              cursor: 'pointer',
              transition: 'border-color 0.3s, box-shadow 0.3s'
            }}
            className="interactive-card"
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'rgba(219, 39, 119, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              border: '1px solid rgba(219, 39, 119, 0.15)'
            }}>
              <i className="fa-solid fa-gauge-high" style={{ color: '#db2777', fontSize: '1.15rem' }}></i>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>Efficiency</h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              Instant single-click bulk payslip distribution, batch banking export files preparation, and zero operational lag in workforce edits logs.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* 5. Interactive Use Cases */}
      <section id="usecases-section" style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '100px 8%',
        background: 'rgba(255, 255, 255, 0.2)',
        borderTop: '1px solid rgba(0,0,0,0.03)',
        borderBottom: '1px solid rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '64px', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Visual Directory Management</span>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, marginTop: '10px', color: '#0f172a', lineHeight: 1.1 }}>Unified Org Hierarchy</h2>
            <p style={{ color: '#475569', marginTop: '20px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Map nested organizational charts, departments, branches, and multi-tier reporting relationships. Instantly query audit trails to track structural transfers, branch updates, and employee profiles changes.
            </p>
            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-check" style={{ color: '#4f46e5', fontSize: '0.7rem' }} />
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>Real-time Audit Trail Sync</span>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>Logs all branch, transfer, and employee profile edits in an immutable system audit trail.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(219, 39, 119, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-check" style={{ color: '#db2777', fontSize: '0.7rem' }} />
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>Regional & Branch Isolation</span>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>Restricts operations to localized legal compliance grids, allowing secure global scaling.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Showcase Card */}
          <div style={{ position: 'relative' }}>
            {/* Background glowing sphere */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(219, 39, 119, 0.05) 0%, rgba(79, 70, 229, 0.03) 50%, transparent 100%)',
              filter: 'blur(30px)',
              pointerEvents: 'none'
            }} />

            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Workspace Dashboard Preview */}
              <img
                src="/src/assets/software_work_environment.png"
                alt="HR O Dashboard"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '12px',
                  display: 'block',
                  border: '1px solid rgba(0,0,0,0.06)'
                }}
              />
              {/* Badge overlay */}
              <div style={{
                position: 'absolute',
                bottom: '36px',
                right: '36px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(79, 70, 229, 0.25)',
                boxShadow: '0 8px 24px rgba(79, 70, 229, 0.15)',
                borderRadius: '12px',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <i className="fa-solid fa-circle-check" style={{ color: '#4f46e5', fontSize: '1.1rem' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>Active Portal Database</div>
                  <div style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 800 }}>24 Active Ledgers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. High-Tech Google Antigravity-Style Footer */}
      <footer style={{
        background: '#faf8f5',
        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
        padding: '100px 8% 40px 8%',
        position: 'relative',
        zIndex: 5,
        overflow: 'hidden'
      }}>
        {/* Glow Accent Divider Line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '1px',
          background: 'linear-gradient(90deg, rgba(79, 70, 229, 0) 0%, rgba(79, 70, 229, 0.3) 50%, rgba(219, 39, 119, 0) 100%)'
        }} />

        {/* Footer Top Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr',
          gap: '64px',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          paddingBottom: '80px'
        }}>
          {/* Brand Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
              Experience zero friction.
            </h3>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '340px' }}>
              Automate your workforce registries, compliance, logs, shift rosters, and payroll ledgers with absolute certainty.
            </p>
            <button
              onClick={onEnterPortal}
              style={{
                background: '#0f172a',
                border: 'none',
                color: '#ffffff',
                padding: '10px 24px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                width: 'max-content',
                marginTop: '12px',
                boxShadow: '0 4px 15px rgba(15, 23, 42, 0.15)',
                transition: 'all 0.3s'
              }}
              className="hover:scale-[1.03] hover:shadow-[0_4px_20px_rgba(15, 23, 42, 0.3)]"
            >
              Launch Portal
            </button>
          </div>

          {/* Links Column 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Product</span>
            {["Download", "Product", "Docs", "Changelog", "Press", "Releases"].map((text) => (
              <span key={text} style={{ cursor: 'pointer', fontSize: '0.85rem', color: '#64748b', width: 'max-content', transition: 'color 0.2s' }} className="hover:text-indigo-600">
                {text}
              </span>
            ))}
          </div>

          {/* Links Column 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Resources</span>
            {["Blog", "Pricing", "Use Cases"].map((text) => (
              <span key={text} style={{ cursor: 'pointer', fontSize: '0.85rem', color: '#64748b', width: 'max-content', transition: 'color 0.2s' }} className="hover:text-indigo-600">
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Giant Branded Logo Typography */}
        <div style={{
          width: '100%',
          textAlign: 'center',
          overflow: 'hidden',
          userSelect: 'none',
          pointerEvents: 'none',
          paddingBottom: '20px'
        }}>
          <h1 style={{
            fontSize: '11vw',
            fontWeight: 800,
            color: '#0f172a',
            margin: 0,
            letterSpacing: '-6px',
            lineHeight: 0.85,
            opacity: 0.96,
            background: 'linear-gradient(180deg, #0f172a 40%, rgba(15, 23, 42, 0.82) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            HR O
          </h1>
        </div>

        {/* Bottom Legal bar */}
        <div style={{
          borderTop: '1px solid rgba(0, 0, 0, 0.05)',
          paddingTop: '32px',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          {/* Wordmark logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
            <span style={{ letterSpacing: '1px' }}>HR O</span>
          </div>
          {/* Legal Links */}
          <div style={{ display: 'flex', gap: '24px' }}>
            {["About HR O", "Products", "Privacy", "Terms"].map((text) => (
              <span key={text} style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="hover:text-indigo-600">
                {text}
              </span>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingOverlayUI;
