// Theme switch: Ollie the owl brings the night, Sol the hawk brings the day.
// The bird flies out of the toggle on a slow arc and draws a sky behind it: one clock drives the
// bird, the sky's leading edge (always passing through the bird) and the moon / sun rising, so
// they stay in step. When the sky covers the page the theme changes underneath and the sky
// dissolves into it. Plain DOM + requestAnimationFrame: works in every browser; reduced-motion
// users get the instant switch.
import { flushSync } from 'react-dom';

const FLIGHT_MS = 2000;  // bird crosses, sky follows
const FADE_MS = 1100;    // sky dissolves into the new theme
const EDGE_SOFT = 0.07;  // width of the sky's soft edge, as a share of the sweep
let running = false;

const smooth = (t) => 0.5 - Math.cos(Math.PI * t) / 2; // easeInOutSine
const quad = (t, a, c, b) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;

// Pure maths, exported for the self-check.
export const flightPoint = (t, from, to, control) => ({ x: quad(t, from.x, control.x, to.x), y: quad(t, from.y, control.y, to.y) });

// Where a point sits along the sky's sweep (0 = top-right corner, 1 = bottom-left corner), matching
// CSS linear-gradient(225deg) on a w×h box.
export const sweepPosition = (p, w, h) => {
  const dx = -Math.SQRT1_2, dy = Math.SQRT1_2;               // 225deg: towards bottom-left
  const len = Math.abs(w * dx) + Math.abs(h * dy);
  const sx = w / 2 - dx * len / 2, sy = h / 2 - dy * len / 2; // gradient start point
  return ((p.x - sx) * dx + (p.y - sy) * dy) / len;
};

const OWL = `
<svg viewBox="-30 10 180 120" width="100%" height="100%" aria-hidden="true">
  <g class="tt-wing tt-wing-l"><path d="M 34 70 Q 4 48 -22 62 Q -6 70 -16 82 Q 6 80 2 94 Q 22 86 34 92 Z" fill="#17307b"/></g>
  <g class="tt-wing tt-wing-r"><path d="M 86 70 Q 116 48 142 62 Q 126 70 136 82 Q 114 80 118 94 Q 98 86 86 92 Z" fill="#17307b"/></g>
  <path d="M 38 42 L 33 22 L 50 35 Z" fill="#1E3A8A"/><path d="M 82 42 L 87 22 L 70 35 Z" fill="#1E3A8A"/>
  <path d="M 60 30 C 88 30 94 58 92 82 C 90 106 77 119 60 119 C 43 119 30 106 28 82 C 26 58 32 30 60 30 Z" fill="#1E3A8A"/>
  <ellipse cx="60" cy="92" rx="20" ry="22" fill="#ebf1fc"/>
  <path d="M 52 86 L 55 89 L 58 86 M 62 86 L 65 89 L 68 86 M 55 96 L 58 99 L 61 96 M 59 96 L 62 99 L 65 96" stroke="#1E3A8A" stroke-opacity=".35" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <circle cx="48" cy="56" r="14" fill="#fff"/><circle cx="72" cy="56" r="14" fill="#fff"/>
  <circle cx="48" cy="57" r="6.5" fill="#0f172a"/><circle cx="72" cy="57" r="6.5" fill="#0f172a"/>
  <circle cx="50" cy="55" r="2" fill="#fff"/><circle cx="74" cy="55" r="2" fill="#fff"/>
  <path d="M 56 66 L 64 66 L 60 74 Z" fill="#B8860B"/>
  <path d="M 52 117 L 50 123 M 60 118 L 60 124 M 68 117 L 70 123" stroke="#B8860B" stroke-width="2.4" stroke-linecap="round"/>
</svg>`;

// Original golden hawk: broad fingered wings, fanned tail, hooked beak, sharp brow.
const HAWK = `
<svg viewBox="-30 10 180 120" width="100%" height="100%" aria-hidden="true">
  <g class="tt-wing tt-wing-l"><path d="M 36 66 Q 10 40 -26 50 L -18 56 L -28 62 L -18 66 L -26 74 L -14 76 L -18 86 Q 10 82 36 88 Z" fill="#8a5a2b"/>
    <path d="M 36 70 Q 14 54 -8 58 Q 12 66 36 80 Z" fill="#c8924f"/></g>
  <g class="tt-wing tt-wing-r"><path d="M 84 66 Q 110 40 146 50 L 138 56 L 148 62 L 138 66 L 146 74 L 134 76 L 138 86 Q 110 82 84 88 Z" fill="#8a5a2b"/>
    <path d="M 84 70 Q 106 54 128 58 Q 108 66 84 80 Z" fill="#c8924f"/></g>
  <path d="M 48 108 L 40 128 L 52 124 L 60 132 L 68 124 L 80 128 L 72 108 Z" fill="#a8692f"/>
  <path d="M 60 34 C 84 34 90 60 88 82 C 86 102 75 114 60 114 C 45 114 34 102 32 82 C 30 60 36 34 60 34 Z" fill="#9c6330"/>
  <ellipse cx="60" cy="88" rx="17" ry="21" fill="#f6e7c8"/>
  <path d="M 54 80 l 2 4 M 64 80 l -2 4 M 52 92 l 2 4 M 60 90 l 0 4 M 68 92 l -2 4 M 56 102 l 2 3 M 64 102 l -2 3" stroke="#9c6330" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M 42 52 Q 60 40 78 52 Q 70 50 60 54 Q 50 50 42 52 Z" fill="#5c3a1a"/>
  <circle cx="50" cy="58" r="7.5" fill="#ffd34d"/><circle cx="70" cy="58" r="7.5" fill="#ffd34d"/>
  <circle cx="51" cy="58.5" r="4" fill="#1a1206"/><circle cx="69" cy="58.5" r="4" fill="#1a1206"/>
  <circle cx="52.4" cy="57" r="1.3" fill="#fff"/><circle cx="70.4" cy="57" r="1.3" fill="#fff"/>
  <path d="M 54 64 Q 60 61 66 64 Q 66 72 60 78 Q 61 71 54 64 Z" fill="#f2b632"/><path d="M 60 78 Q 61 74 63 72 Q 62 76 60 78 Z" fill="#3b2a12"/>
  <path d="M 53 113 L 51 120 M 57 114 L 57 121 M 63 114 L 63 121 M 67 113 L 69 120" stroke="#f2b632" stroke-width="2.6" stroke-linecap="round"/>
</svg>`;

const orbSizeFor = (toDark, w) => (toDark ? Math.round(Math.min(120, Math.max(60, w * 0.08))) : Math.round(Math.min(340, Math.max(160, w * 0.26))));

const buildScene = (toDark, w, h) => {
  const el = document.createElement('div');
  el.className = 'tt-overlay';
  el.setAttribute('aria-hidden', 'true');
  // random stars each time so the night never looks stamped
  const stars = toDark ? Array.from({ length: Math.round((w * h) / 8000) }, () =>
    `<i class="tt-star" style="left:${(Math.random() * 100).toFixed(2)}%;top:${(Math.random() * 92).toFixed(2)}%;--d:${(Math.random() * 2).toFixed(2)}s;--s:${(1 + Math.random() * 2).toFixed(1)}px"></i>`).join('') : '';
  el.innerHTML = `<div class="tt-sky ${toDark ? 'tt-night' : 'tt-dawn'}"><div class="tt-stars">${stars}</div><div class="tt-orb ${toDark ? 'tt-moon' : 'tt-sun'}"></div></div><div class="tt-bird">${toDark ? OWL : HAWK}</div>`;
  return el;
};

export const switchTheme = (nextDark, setDarkMode, originEl) => {
  const apply = () => {
    document.body.classList.toggle('dark-mode', nextDark);
    flushSync(() => setDarkMode(nextDark));
  };
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || !window.requestAnimationFrame) return apply();
  if (running) return; // a second click mid-flight is ignored
  running = true;

  const w = window.innerWidth, h = window.innerHeight;
  const size = Math.round(Math.min(150, Math.max(96, w * 0.11)));
  const b = originEl?.getBoundingClientRect();
  const from = b ? { x: b.left + b.width / 2, y: b.top + b.height / 2 } : { x: w - 40, y: 32 };
  const to = { x: -size * 1.3, y: h + size * 0.6 };   // past the bottom-left corner, so the sky ends fully drawn
  const control = { x: w * 0.7, y: h * 0.78 };        // swoops down before crossing
  const orbSize = orbSizeFor(nextDark, w);
  // moon rises up the left side; sun climbs out of the bottom centre
  const orbFrom = nextDark ? { x: w * 0.08, y: h + orbSize } : { x: w / 2 - orbSize / 2, y: h + orbSize * 0.2 };
  const orbTo = nextDark ? { x: w * 0.14, y: h * 0.1 } : { x: w / 2 - orbSize / 2, y: h * 0.58 };
  const orbCtl = nextDark ? { x: w * 0.02, y: h * 0.35 } : { x: w / 2 - orbSize / 2, y: h * 0.62 };

  const scene = buildScene(nextDark, w, h);
  document.body.appendChild(scene);
  const sky = scene.querySelector('.tt-sky'), bird = scene.querySelector('.tt-bird');
  const stars = scene.querySelector('.tt-stars'), orb = scene.querySelector('.tt-orb');
  bird.style.width = bird.style.height = `${size}px`;
  orb.style.width = orb.style.height = `${orbSize}px`;

  let edge = -EDGE_SOFT, start = null, applied = false;
  const finish = () => { scene.remove(); running = false; };
  const frame = (now) => {
    if (start === null) start = now;
    const el = now - start;
    const t = Math.min(1, el / FLIGHT_MS), e = smooth(t);
    // bird, banking with its direction of travel
    const p = flightPoint(e, from, to, control);
    const ahead = flightPoint(Math.min(1, e + 0.02), from, to, control);
    const bank = Math.max(-22, Math.min(22, (ahead.y - p.y) * 0.9 - (ahead.x - p.x) * 0.15));
    const grow = 0.4 + 0.6 * Math.min(1, t * 5);
    bird.style.transform = `translate(${p.x - size / 2}px, ${p.y - size / 2}px) rotate(${bank}deg) scale(${grow})`;
    // the sky's edge runs through the bird and never moves backwards
    edge = Math.max(edge, sweepPosition(p, w, h) - 0.015);
    const solid = (edge * 100).toFixed(2), clear = ((edge + EDGE_SOFT) * 100).toFixed(2);
    sky.style.webkitMaskImage = sky.style.maskImage = `linear-gradient(225deg, #000 ${solid}%, transparent ${clear}%)`;
    // moon / sun rise on the same clock; stars come out as the night spreads
    const o = flightPoint(smooth(Math.min(1, el / (FLIGHT_MS + FADE_MS * 0.6))), orbFrom, orbTo, orbCtl);
    orb.style.transform = `translate(${o.x}px, ${o.y}px)`;
    stars.style.opacity = Math.min(1, t * 1.3).toFixed(3);

    if (t >= 1 && !applied) {
      applied = true;
      apply();
      sky.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE_MS, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    }
    if (el < FLIGHT_MS + FADE_MS) requestAnimationFrame(frame);
    else finish();
  };
  try { requestAnimationFrame(frame); } catch { apply(); finish(); }
};
