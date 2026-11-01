// Navbar colour-palette picker (sits next to the dark/light toggle in both portals).
// The choice is stored in localStorage and applied as <html data-palette="..."> before first paint (index.html).
import { useEffect, useRef, useState } from 'react';

export const PALETTES = [
  { key: 'navy', label: 'Corporate Navy', primary: '#1E3A8A', accent: '#B8860B' },
  { key: 'indigo', label: 'Royal Indigo', primary: '#4F46E5', accent: '#06B6D4' },
  { key: 'emerald', label: 'Emerald Trust', primary: '#047857', accent: '#0EA5E9' },
  { key: 'maroon', label: 'Academic Maroon', primary: '#7F1D1D', accent: '#D4A017' },
  { key: 'teal', label: 'Slate & Teal', primary: '#0F766E', accent: '#6366F1' },
];
export const PALETTE_STORAGE_KEY = 'hrorbit-palette';

const swatchStyle = (p) => ({ background: `linear-gradient(135deg, ${p.primary} 0 62%, ${p.accent} 62% 100%)` });

const PalettePicker = () => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const [current, setCurrent] = useState(() => document.documentElement.dataset.palette || 'navy');
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  const choose = (key) => {
    setCurrent(key);
    document.documentElement.dataset.palette = key;
    try { localStorage.setItem(PALETTE_STORAGE_KEY, key); } catch { /* storage blocked: choice lasts for this visit */ }
  };

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 8, right: Math.max(8, window.innerWidth - r.right) });
    }
    setOpen(o => !o);
  };

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector('[aria-checked="true"]')?.focus();
    const onDown = (e) => {
      if (!panelRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); }
    };
    const onScroll = () => setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  // Arrow keys move between swatches (radio-group pattern)
  const onPanelKey = (e) => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault();
    const i = PALETTES.findIndex(p => p.key === current);
    const next = PALETTES[(i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : PALETTES.length - 1)) % PALETTES.length];
    choose(next.key);
    panelRef.current?.querySelector(`[data-key="${next.key}"]`)?.focus();
  };

  const active = PALETTES.find(p => p.key === current) || PALETTES[0];
  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="palette-toggle-btn"
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Colour palette: ${active.label}`}
        title="Colour palette"
      >
        <i className="fa-solid fa-palette"></i>
      </button>
      {open && (
        <div
          ref={panelRef}
          className="palette-popover"
          role="radiogroup"
          aria-label="Colour palette"
          style={{ top: pos.top, right: pos.right }}
          onKeyDown={onPanelKey}
        >
          <div className="palette-popover-title">Colour palette</div>
          <div className="palette-popover-swatches">
            {PALETTES.map(p => (
              <button
                key={p.key}
                data-key={p.key}
                type="button"
                role="radio"
                aria-checked={current === p.key}
                aria-label={p.label}
                title={p.label}
                tabIndex={current === p.key ? 0 : -1}
                className={`palette-swatch-btn ${current === p.key ? 'active' : ''}`}
                onClick={() => choose(p.key)}
              >
                <span className="palette-swatch" style={swatchStyle(p)} />
              </button>
            ))}
          </div>
          <div className="palette-popover-name">{active.label}</div>
        </div>
      )}
    </>
  );
};

export default PalettePicker;
