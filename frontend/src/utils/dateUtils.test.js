// TZ=Asia/Kolkata node --test src/utils/dateUtils.test.js  (run with TZ=Asia/Kolkata to exercise the IST early-morning case)
import { test } from 'node:test';
import assert from 'node:assert';
import { toLocalYmd, formatDateIN } from './dateUtils.js';

test('local calendar day, not the UTC day', () => {
  globalThis.process.env.TZ = 'Asia/Kolkata';
  assert.strictEqual(toLocalYmd(new Date('2026-11-12T18:31:00Z')), '2026-11-13'); // 00:01 IST on 13 Nov
  assert.strictEqual(toLocalYmd(new Date('2026-11-12T23:59:00Z')), '2026-11-13'); // 05:29 IST
  assert.strictEqual(toLocalYmd(new Date('2026-11-12T18:29:00Z')), '2026-11-12'); // 23:59 IST on 12 Nov
  assert.strictEqual(toLocalYmd('not a date'), '');
  assert.strictEqual(formatDateIN(new Date('2026-11-12T18:31:00Z')), '13 Nov 2026');
});
