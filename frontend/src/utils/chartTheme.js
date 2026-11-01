// Chart.js colours from the active palette. Canvas cannot read CSS variables, so charts get a
// "scriptable" colour that reads the variable each time the chart draws; when the palette or
// dark mode changes, every chart redraws with the new colours. Same data, same chart types.

const readVar = (name) => getComputedStyle(document.body || document.documentElement).getPropertyValue(name).trim();

const toRgba = (color, alpha) => {
  const hex = color.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(hex)) return color;
  const n = parseInt(hex, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

// themeColor('--chart-1', 0.1) -> scriptable option resolving to the palette colour at draw time
export const themeColor = (name, alpha = 1, fallback = '#4f46e5') => () => toRgba(readVar(name) || fallback, alpha);

// themeColors(['--chart-1', '--chart-2']) -> per-slice colours for pie/doughnut charts
export const themeColors = (names, alpha = 1) => (ctx) => toRgba(readVar(names[ctx.dataIndex % names.length]) || '#4f46e5', alpha);

const applyDefaults = () => {
  const Chart = window.Chart;
  if (!Chart?.defaults) return;
  Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
  Chart.defaults.color = readVar('--chart-text') || '#64748b';
  Chart.defaults.borderColor = readVar('--chart-grid') || '#e2e8f0';
};

export const initChartTheme = () => {
  applyDefaults();
  const themeState = () => `${document.documentElement.dataset.palette}|${document.body?.classList.contains('dark-mode')}`;
  let last = themeState();
  const refresh = () => {
    const state = themeState();
    if (state === last) return;
    last = state;
    applyDefaults();
    const instances = window.Chart?.instances ? Object.values(window.Chart.instances) : [];
    const grid = readVar('--chart-grid');
    const text = readVar('--chart-text');
    instances.forEach((chart) => {
      try {
        // Charts keep the grid/label colours they were created with, so set them explicitly
        Object.values(chart.options?.scales || {}).forEach((scale) => {
          if (scale.grid && grid) scale.grid.color = grid;
          if (scale.ticks && text) scale.ticks.color = text;
        });
        if (chart.options?.plugins?.legend?.labels && text) chart.options.plugins.legend.labels.color = text;
        chart.update();
      } catch { /* a chart being destroyed mid-switch is fine to skip */ }
    });
  };
  const observer = new MutationObserver(refresh);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-palette'] });
  if (document.body) observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
};
