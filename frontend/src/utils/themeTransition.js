// "Orbit Eclipse" theme switch: the new theme is revealed through a disc that leaves the toggle,
// swings along an orbit toward the screen centre and swells (an approaching moon) with a soft
// penumbra edge, while the old page dims (to dark) or glows (to light) as it is eclipsed.
// Falls back to an instant switch without the View Transitions API or with reduced motion.
import { flushSync } from 'react-dom';

const DURATION = 1150;
const STEPS = 36;

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); // easeInOutCubic

// Pure maths, exported for the self-check: disc centre and radius at progress t (0..1).
export const orbitFrame = (t, from, to, control, maxR) => {
  const u = 1 - t;
  return {
    x: u * u * from.x + 2 * u * t * control.x + t * t * to.x,
    y: u * u * from.y + 2 * u * t * control.y + t * t * to.y,
    // stays moon-sized while orbiting, then swells to cover the screen
    r: 18 + (maxR - 18) * Math.pow(t, 2.4)
  };
};

// Final radius whose solid core (82%, matching the mask in index.css) reaches every corner.
export const coverRadius = (to, w, h) => Math.hypot(Math.max(to.x, w - to.x), Math.max(to.y, h - to.y)) / 0.82 + 24;

export const switchTheme = (nextDark, setDarkMode, originEl) => {
  const apply = () => {
    document.body.classList.toggle('dark-mode', nextDark);
    flushSync(() => setDarkMode(nextDark)); // the toggle icon must be in the new snapshot too
  };
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduce) return apply();

  const w = window.innerWidth, h = window.innerHeight;
  const b = originEl?.getBoundingClientRect();
  const from = b ? { x: b.left + b.width / 2, y: b.top + b.height / 2 } : { x: w - 40, y: 32 };
  const to = { x: w / 2, y: h * 0.55 };
  // swing out the opposite way from the button so the path reads as an orbit, not a straight line
  const control = { x: from.x > w / 2 ? w * 0.18 : w * 0.82, y: h * 0.95 };
  const maxR = coverRadius(to, w, h);

  const root = document.documentElement;
  root.classList.add('theme-eclipse');
  const vt = document.startViewTransition(apply);

  vt.ready.then(() => {
    const frames = [];
    for (let i = 0; i <= STEPS; i++) {
      const { x, y, r } = orbitFrame(ease(i / STEPS), from, to, control, maxR);
      frames.push({ '--ecl-x': `${x}px`, '--ecl-y': `${y}px`, '--ecl-r': `${r}px`, offset: i / STEPS });
    }
    root.animate(frames, { duration: DURATION, easing: 'linear', fill: 'both', pseudoElement: '::view-transition-new(root)' });
    root.animate(
      nextDark
        ? [{ filter: 'none' }, { filter: 'brightness(0.55) saturate(0.7)' }]
        : [{ filter: 'none' }, { filter: 'brightness(1.25) saturate(1.1)' }],
      { duration: DURATION, easing: 'ease-in', fill: 'both', pseudoElement: '::view-transition-old(root)' }
    );
  }).catch(() => {});

  vt.finished.finally(() => root.classList.remove('theme-eclipse'));
};
