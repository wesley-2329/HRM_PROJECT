// Run: node --test src/utils/themeTransition.test.js
import { test } from 'node:test';
import assert from 'node:assert';
import { flightPoint } from './themeTransition.js';

test('owl leaves from the toggle, arcs through the page and exits off-screen', () => {
  const w = 390, h = 844, from = { x: 360, y: 34 }, to = { x: -105, y: h * 0.78 }, control = { x: w * 0.55, y: h * 0.62 };
  assert.deepStrictEqual(flightPoint(0, from, to, control), from);
  assert.deepStrictEqual(flightPoint(1, from, to, control), to);
  assert.ok(flightPoint(1, from, to, control).x < 0, 'ends outside the screen');
  // it is an arc: halfway it sits below the straight line between start and end
  const mid = flightPoint(0.5, from, to, control);
  assert.ok(mid.y > (from.y + to.y) / 2);
  // it keeps moving left the whole way (never doubles back)
  let prevX = Infinity;
  for (let t = 0; t <= 1.0001; t += 0.05) { const { x } = flightPoint(t, from, to, control); assert.ok(x < prevX); prevX = x; }
});
