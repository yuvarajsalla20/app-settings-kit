import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { buildStamp } = require('../build-stamp.js') as typeof import('../build-stamp');

describe('build stamp', () => {
  it('writes Central time as CT, in winter and in summer (same as the apps wrote before)', () => {
    expect(buildStamp(new Date('2026-11-14T16:45:00Z'))).toBe('Nov 14, 2026 | 10:45 AM CT');
    expect(buildStamp(new Date('2026-07-04T19:05:00Z'))).toBe('Jul 4, 2026 | 2:05 PM CT');
  });

  it('takes another time zone from config', () => {
    expect(buildStamp(new Date('2026-11-14T16:45:00Z'), { timeZone: 'UTC' })).toBe('Nov 14, 2026 | 4:45 PM UTC');
    expect(buildStamp(new Date('2026-11-14T16:45:00Z'), { timeZone: 'Asia/Kolkata', zoneNames: { 'GMT+5:30': 'IST' } })).toBe('Nov 14, 2026 | 10:15 PM IST');
  });
});
