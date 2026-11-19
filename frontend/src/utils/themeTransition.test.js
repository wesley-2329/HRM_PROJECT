// Run: node --test src/utils/themeTransition.test.js
import { test } from 'node:test';
import assert from 'node:assert';
import { orbitFrame, coverRadius } from './themeTransition.js';

test('eclipse disc starts on the toggle, ends centred and covers every corner', () => {
  const w = 390, h = 844, from = { x: 360, y: 34 }, to = { x: w / 2, y: h * 0.55 }, control = { x: w * 0.18, y: h * 0.95 };
  const maxR = coverRadius(to, w, h);
  const start = orbitFrame(0, from, to, control, maxR), end = orbitFrame(1, from, to, control, maxR);
  assert.deepStrictEqual([start.x, start.y, start.r], [360, 34, 18]);
  assert.deepStrictEqual([end.x, end.y], [to.x, to.y]);
  for (const [cx, cy] of [[0, 0], [w, 0], [0, h], [w, h]]) assert.ok(Math.hypot(cx - end.x, cy - end.y) < end.r * 0.82, 'corner inside the solid part');
  let prev = 0;
  for (let t = 0; t <= 1; t += 0.05) { const { r } = orbitFrame(t, from, to, control, maxR); assert.ok(r >= prev); prev = r; }
  // mid-orbit the disc has swung away from the straight line (it is an arc)
  const mid = orbitFrame(0.5, from, to, control, maxR);
  assert.ok(mid.y > (from.y + to.y) / 2 + 50);
});
