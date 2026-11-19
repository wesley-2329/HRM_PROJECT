// Run: node --test src/utils/themeTransition.test.js
import { test } from 'node:test';
import assert from 'node:assert';
import { flightPoint, sweepPosition } from './themeTransition.js';

const w = 390, h = 844, size = 96;
const from = { x: 360, y: 34 }, to = { x: -size * 1.3, y: h + size * 0.6 }, control = { x: w * 0.7, y: h * 0.78 };

test('sweep position matches the CSS 225deg gradient: 0 at top-right, 1 at bottom-left', () => {
  assert.ok(Math.abs(sweepPosition({ x: w, y: 0 }, w, h)) < 1e-9);
  assert.ok(Math.abs(sweepPosition({ x: 0, y: h }, w, h) - 1) < 1e-9);
  assert.ok(Math.abs(sweepPosition({ x: w / 2, y: h / 2 }, w, h) - 0.5) < 1e-9);
});

test('bird starts on the toggle, its sky edge only moves forward and ends past the far corner', () => {
  assert.deepStrictEqual(flightPoint(0, from, to, control), from);
  let prev = -Infinity;
  for (let t = 0; t <= 1.0001; t += 0.02) {
    const s = sweepPosition(flightPoint(t, from, to, control), w, h);
    assert.ok(s >= prev - 1e-9, `sky would move backwards at t=${t.toFixed(2)}`);
    prev = s;
  }
  assert.ok(prev > 1.1, 'sky must fully cover the screen (edge + soft band past the corner)');
  // a real arc, not a straight line: mid-flight it swoops below the straight path
  const mid = flightPoint(0.5, from, to, control);
  assert.ok(mid.x > (from.x + to.x) / 2);
});
