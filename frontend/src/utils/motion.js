// Visual-only motion helpers. HRApp.jsx and EmployeeApp.jsx already call window.animateModuleIn(el) and
// window.animateCountUp(el, target) after each module change, but the helpers were never defined, so
// nothing animated. They only animate appearance; the final text is always exactly what React rendered.

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Fade + slide the module's direct children in, staggered. fill: 'backwards' means no transform is
// kept after the animation (a retained transform would offset position:fixed modals inside it).
window.animateModuleIn = (el) => {
  if (!el || reducedMotion() || !el.animate) return;
  const children = Array.from(el.children).slice(0, 12);
  children.forEach((child, i) => {
    child.animate(
      [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 320, delay: Math.min(i, 8) * 45, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'backwards' }
    );
  });
};

// Count the existing number up from 0. Only the existing text node's value is updated, and the
// animation stops immediately if React changes the text meanwhile, so React's value always wins.
window.animateCountUp = (el, target) => {
  if (!el || reducedMotion()) return;
  const node = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.nodeValue.trim() !== '');
  if (!node) return;
  const finalText = node.nodeValue;
  const match = finalText.match(/-?[\d,]*\.?\d+/);
  if (!match || !Number.isFinite(target) || target === 0) return;
  const decimals = (match[0].split('.')[1] || '').length;
  const useCommas = match[0].includes(',');
  const fmt = (v) => {
    const n = v.toFixed(decimals);
    const s = useCommas ? Number(n).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : n;
    return finalText.replace(match[0], s);
  };
  const duration = 700;
  const start = performance.now();
  let lastWritten = fmt(0);
  node.nodeValue = lastWritten;
  const step = (now) => {
    if (node.nodeValue !== lastWritten) return; // React re-rendered: keep its value
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    lastWritten = t < 1 ? fmt(target * eased) : finalText;
    node.nodeValue = lastWritten;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
