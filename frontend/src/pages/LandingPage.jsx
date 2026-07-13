import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingCanvas3D from '../components/LandingCanvas3D';
import LandingOverlayUI from '../components/LandingOverlayUI';

const LandingPage = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const navigate = useNavigate();

  // Custom Cursor Refs
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -100, y: -100 });
  const ringRef = useRef({ x: -100, y: -100 });
  const particlesRef = useRef([]);
  const lastEmitRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // 1. Natural Scroll Progress Tracking
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const progress = window.scrollY / scrollHeight; // Normalized 0.0 to 1.0
      targetProgressRef.current = progress;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Smooth scroll interpolation and cursor animation render loop
    let frameId;
    const canvas = canvasRef.current;
    const ctx = canvas ? canvas.getContext('2d') : null;

    // Resize canvas to match window viewport
    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const updateLoop = () => {
      // Smooth Scroll
      const diff = targetProgressRef.current - currentProgressRef.current;
      currentProgressRef.current += diff * 0.1; // Smooth interpolation
      if (Math.abs(diff) < 0.001) {
        currentProgressRef.current = targetProgressRef.current;
      }
      setScrollProgress(currentProgressRef.current);

      // Smooth Cursor Ring Lerping (Inertia effect)
      if (cursorDotRef.current && cursorRingRef.current) {
        // Dot moves instantly
        cursorDotRef.current.style.transform = `translate3d(${mouseRef.current.x}px, ${mouseRef.current.y}px, 0)`;

        // Ring follows with delay
        const ringDiffX = mouseRef.current.x - ringRef.current.x;
        const ringDiffY = mouseRef.current.y - ringRef.current.y;
        ringRef.current.x += ringDiffX * 0.15;
        ringRef.current.y += ringDiffY * 0.15;
        cursorRingRef.current.style.transform = `translate3d(${ringRef.current.x}px, ${ringRef.current.y}px, 0)`;
      }

      // Draw Cursor Trail Particles (Anti-Gravity upward float)
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const particles = particlesRef.current;

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy; // Floating upward
          p.alpha -= 0.015; // Slow fade out

          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          // Outer glow for each particle
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.restore();
        }
      }

      frameId = requestAnimationFrame(updateLoop);
    };
    
    frameId = requestAnimationFrame(updateLoop);

    // 2. Cursor Event Handlers
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      // Calculate distance from last particle emission
      const lastEmit = lastEmitRef.current;
      const dist = Math.hypot(e.clientX - lastEmit.x, e.clientY - lastEmit.y);

      // Only emit particles if the user moves the mouse beyond threshold
      if (dist > 8 && canvasRef.current) {
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.0,
          vy: -0.8 - Math.random() * 1.5, // Float upwards (anti-gravity)
          size: Math.random() * 2.5 + 1.5,
          alpha: 0.85,
          color: Math.random() > 0.4 ? '#4f46e5' : '#db2777' // Indigo or Pink for light theme
        });
        lastEmitRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    // Event delegation for cursor hovering highlights
    const handleMouseOver = (e) => {
      const target = e.target.closest('a, button, [role="button"], span[onClick], input, textarea, select, .interactive-card');
      if (target && cursorRingRef.current) {
        cursorRingRef.current.classList.add('cursor-hovering');
        cursorDotRef.current.classList.add('cursor-hovering');
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target.closest('a, button, [role="button"], span[onClick], input, textarea, select, .interactive-card');
      if (target && cursorRingRef.current) {
        cursorRingRef.current.classList.remove('cursor-hovering');
        cursorDotRef.current.classList.remove('cursor-hovering');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(frameId);
    };
  }, []);

  const handleEnterPortal = () => {
    navigate('/login');
  };

  return (
    <div className="landing-page-root" style={{
      width: '100%',
      minHeight: '100vh',
      background: 'transparent', // Let body warm light theme mesh gradient show through
      position: 'relative',
      overflowX: 'hidden',
      cursor: 'none' // Hide standard cursor to show the interactive custom cursor
    }}>
      
      {/* 3D Wireframe Mesh Background Layer (Fixed position in background) */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1, pointerEvents: 'none' }}>
        <LandingCanvas3D scrollProgress={scrollProgress} />
      </div>

      {/* Interactive Custom Cursor Elements */}
      <div 
        ref={cursorDotRef} 
        style={{
          width: '6px',
          height: '6px',
          background: '#4f46e5', // Primary Indigo for light theme
          borderRadius: '50%',
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 10000,
          transform: 'translate3d(-10px, -10px, 0) scale(1)',
          transition: 'transform 0.1s ease-out, background-color 0.2s',
          mixBlendMode: 'multiply', // Better visibility on light backdrop
          boxShadow: '0 0 6px rgba(79, 70, 229, 0.4)'
        }}
        className="custom-cursor-dot"
      />
      <div 
        ref={cursorRingRef} 
        style={{
          width: '36px',
          height: '36px',
          border: '1.5px solid rgba(79, 70, 229, 0.4)', // Indigo border
          borderRadius: '50%',
          position: 'fixed',
          top: 0,
          left: 0,
          marginTop: '-15px',
          marginLeft: '-15px',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate3d(-10px, -10px, 0) scale(1)',
          transition: 'width 0.2s, height 0.2s, background-color 0.2s, border-color 0.2s, transform 0.05s ease-out',
          mixBlendMode: 'multiply',
          boxShadow: '0 0 8px rgba(79, 70, 229, 0.15)'
        }}
        className="custom-cursor-ring"
      />

      {/* Cursor trail particle canvas */}
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 9998
        }}
      />

      {/* CSS overrides for hover transformations and custom animations */}
      <style>{`
        /* Hover Scaling overrides for custom cursor elements */
        .custom-cursor-ring.cursor-hovering {
          width: 52px;
          height: 52px;
          margin-top: -23px;
          margin-left: -23px;
          border-color: rgba(219, 39, 119, 0.8);
          background-color: rgba(219, 39, 119, 0.08);
          box-shadow: 0 0 18px rgba(219, 39, 119, 0.3);
        }
        .custom-cursor-dot.cursor-hovering {
          background-color: #db2777;
          transform: scale(1.5);
          box-shadow: 0 0 12px #db2777;
        }

        /* Hide cursor specifically for interactive inputs and buttons */
        a, button, [role="button"], span[onClick], input, textarea, select {
          cursor: none !important;
        }

        /* Keyframes for simple spin & bounce animations */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
          60% { transform: translateY(-2px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        /* Scrollbar styles to match the warm light theme page design */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #faf8f5;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(79, 70, 229, 0.3);
        }
      `}</style>

      {/* Google Antigravity 2D Content Layer (Renders normally in scroll flow) */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <LandingOverlayUI scrollProgress={scrollProgress} onEnterPortal={handleEnterPortal} />
      </div>
      
    </div>
  );
};

export default LandingPage;
