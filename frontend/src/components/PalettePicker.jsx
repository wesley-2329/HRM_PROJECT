// TEMPORARY (redesign branch only): floating palette switcher so the five palettes can be compared on
// the real pages. Remove this component and its <PalettePicker /> line in App.jsx once a palette is chosen.
import { useEffect, useState } from 'react';

export const PALETTES = [
  { key: 'navy', label: 'Corporate Navy', primary: '#1E3A8A', accent: '#F59E0B' },
  { key: 'indigo', label: 'Royal Indigo', primary: '#4F46E5', accent: '#06B6D4' },
  { key: 'emerald', label: 'Emerald Trust', primary: '#047857', accent: '#0EA5E9' },
  { key: 'maroon', label: 'Academic Maroon', primary: '#7F1D1D', accent: '#D4A017' },
  { key: 'teal', label: 'Slate & Teal', primary: '#0F766E', accent: '#6366F1' },
];
export const PALETTE_STORAGE_KEY = 'hrorbit-palette';

const PalettePicker = () => {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(() => document.documentElement.dataset.palette || 'navy');

  useEffect(() => {
    document.documentElement.dataset.palette = current;
    localStorage.setItem(PALETTE_STORAGE_KEY, current);
  }, [current]);

  const active = PALETTES.find(p => p.key === current) || PALETTES[0];
  return (
    <div className="palette-picker" data-open={open}>
      {open && (
        <div className="palette-picker-panel" role="listbox" aria-label="Colour palette">
          <div className="palette-picker-title">Palette (preview only)</div>
          {PALETTES.map((p, i) => (
            <button
              key={p.key}
              type="button"
              role="option"
              aria-selected={current === p.key}
              className={`palette-picker-option ${current === p.key ? 'active' : ''}`}
              onClick={() => setCurrent(p.key)}
            >
              <span className="palette-picker-swatch" style={{ background: `linear-gradient(135deg, ${p.primary} 0 60%, ${p.accent} 60% 100%)` }} />
              <span>{i + 1}. {p.label}</span>
              {current === p.key && <i className="fa-solid fa-check" />}
            </button>
          ))}
        </div>
      )}
      <button type="button" className="palette-picker-toggle" onClick={() => setOpen(o => !o)} aria-expanded={open} title="Switch colour palette">
        <span className="palette-picker-swatch" style={{ background: `linear-gradient(135deg, ${active.primary} 0 60%, ${active.accent} 60% 100%)` }} />
        Palette
      </button>
    </div>
  );
};

export default PalettePicker;
