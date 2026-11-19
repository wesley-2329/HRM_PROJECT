// "Night Owl" theme switch. Ollie, the HR Orbit owl from the login page, flies out of the toggle
// and across the screen pulling a sky behind him: a starry night with a crescent moon (to dark)
// or a sunrise (to light). Once the sky covers the page the theme switches underneath, then the
// sky dissolves into the new theme. Plain DOM + Web Animations, so it runs in every browser;
// reduced-motion users get the instant switch.
import { flushSync } from 'react-dom';

const SWEEP_MS = 900;    // owl crosses, sky follows
const FADE_MS = 650;     // sky dissolves into the new theme
let running = false;

// Pure maths, exported for the self-check: owl position on its arc at progress t (0..1).
export const flightPoint = (t, from, to, control) => {
  const u = 1 - t;
  return { x: u * u * from.x + 2 * u * t * control.x + t * t * to.x, y: u * u * from.y + 2 * u * t * control.y + t * t * to.y };
};

const OWL_SVG = (sleepy) => `
<svg viewBox="-30 10 180 120" width="100%" height="100%" aria-hidden="true">
  <g class="tt-wing tt-wing-l"><path d="M 34 70 Q 4 48 -22 62 Q -6 70 -16 82 Q 6 80 2 94 Q 22 86 34 92 Z" fill="var(--c-primary-hover, #17307b)"/></g>
  <g class="tt-wing tt-wing-r"><path d="M 86 70 Q 116 48 142 62 Q 126 70 136 82 Q 114 80 118 94 Q 98 86 86 92 Z" fill="var(--c-primary-hover, #17307b)"/></g>
  <path d="M 38 42 L 33 22 L 50 35 Z" fill="var(--c-primary, #1E3A8A)"/>
  <path d="M 82 42 L 87 22 L 70 35 Z" fill="var(--c-primary, #1E3A8A)"/>
  <path d="M 60 30 C 88 30 94 58 92 82 C 90 106 77 119 60 119 C 43 119 30 106 28 82 C 26 58 32 30 60 30 Z" fill="var(--c-primary, #1E3A8A)"/>
  <ellipse cx="60" cy="92" rx="20" ry="22" fill="#ebf1fc"/>
  <circle cx="48" cy="56" r="14" fill="#fff"/><circle cx="72" cy="56" r="14" fill="#fff"/>
  ${sleepy
    ? '<path d="M 41 57 Q 48 62 55 57" stroke="#0f172a" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M 65 57 Q 72 62 79 57" stroke="#0f172a" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
    : '<circle cx="48" cy="57" r="6.5" fill="#0f172a"/><circle cx="72" cy="57" r="6.5" fill="#0f172a"/><circle cx="50" cy="55" r="2" fill="#fff"/><circle cx="74" cy="55" r="2" fill="#fff"/>'}
  <path d="M 56 66 L 64 66 L 60 74 Z" fill="var(--c-accent, #B8860B)"/>
  <path d="M 52 117 L 50 123 M 60 118 L 60 124 M 68 117 L 70 123" stroke="var(--c-accent, #B8860B)" stroke-width="2.4" stroke-linecap="round"/>
</svg>`;

const buildScene = (toDark, w, h) => {
  const el = document.createElement('div');
  el.className = 'tt-overlay';
  el.setAttribute('aria-hidden', 'true');
  // star positions are random each time so the night never looks stamped
  const stars = toDark ? Array.from({ length: Math.round((w * h) / 9000) }, () =>
    `<i class="tt-star" style="left:${(Math.random() * 100).toFixed(2)}%;top:${(Math.random() * 100).toFixed(2)}%;--d:${(Math.random() * 1.6).toFixed(2)}s;--s:${(1 + Math.random() * 2).toFixed(1)}px"></i>`).join('') : '';
  el.innerHTML = `<div class="tt-sky ${toDark ? 'tt-night' : 'tt-dawn'}">${stars}<div class="${toDark ? 'tt-moon' : 'tt-sun'}"></div></div><div class="tt-owl">${OWL_SVG(!toDark)}</div>`;
  return el;
};

export const switchTheme = (nextDark, setDarkMode, originEl) => {
  const apply = () => {
    document.body.classList.toggle('dark-mode', nextDark);
    flushSync(() => setDarkMode(nextDark));
  };
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || !Element.prototype.animate) return apply();
  if (running) return; // a second click mid-flight is ignored
  running = true;

  const w = window.innerWidth, h = window.innerHeight;
  const size = Math.round(Math.min(150, Math.max(96, w * 0.11)));
  const b = originEl?.getBoundingClientRect();
  const from = b ? { x: b.left + b.width / 2, y: b.top + b.height / 2 } : { x: w - 40, y: 32 };
  const to = { x: -size * 1.5, y: h * 0.78 };
  const control = { x: w * 0.55, y: h * 0.62 };

  const scene = buildScene(nextDark, w, h);
  document.body.appendChild(scene);
  const sky = scene.querySelector('.tt-sky'), owl = scene.querySelector('.tt-owl');
  owl.style.width = owl.style.height = `${size}px`;

  const frames = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24, p = flightPoint(t, from, to, control);
    const ahead = flightPoint(Math.min(1, t + 0.04), from, to, control);
    const tilt = Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180 / Math.PI + 180; // nose along the path
    const grow = 0.35 + 0.65 * Math.min(1, t * 4); // pops out of the toggle
    frames.push({ transform: `translate(${p.x - size / 2}px, ${p.y - size / 2}px) rotate(${Math.max(-25, Math.min(25, tilt > 180 ? tilt - 360 : tilt))}deg) scale(${grow})`, offset: t });
  }
  const ease = 'cubic-bezier(.45,.05,.35,1)';
  owl.animate(frames, { duration: SWEEP_MS + 250, easing: ease, fill: 'both' });
  // the sky's leading edge trails the owl from the toggle corner to the opposite corner
  sky.animate([{ maskPosition: '0% 100%' }, { maskPosition: '100% 0%' }], { duration: SWEEP_MS, easing: ease, fill: 'both' })
    .finished.then(() => {
      apply();
      return sky.animate([{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(6px)' }], { duration: FADE_MS, easing: 'ease-out', fill: 'both' }).finished;
    })
    .catch(() => apply())
    .finally(() => { scene.remove(); running = false; });
};
