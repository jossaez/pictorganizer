import { describe, expect, it } from 'vitest';
import {
  addDays,
  formatShortWeekday,
  getISOWeekday,
  getStartOfWeek,
  getWeekDays,
} from './date';

describe('week date utilities', () => {
  it('getStartOfWeek returns Monday for a Wednesday', () => {
    expect(getStartOfWeek('2026-06-03')).toBe('2026-06-01');
    expect(getISOWeekday('2026-06-03')).toBe(3);
  });

  it('getWeekDays returns 7 days Mon–Sun', () => {
    const days = getWeekDays('2026-06-03');
    expect(days).toHaveLength(7);
    expect(days[0]).toBe('2026-06-01');
    expect(days[6]).toBe('2026-06-07');
  });

  it('getStartOfWeek on Monday stays same day', () => {
    expect(getStartOfWeek('2026-06-01')).toBe('2026-06-01');
  });

  it('getStartOfWeek on Sunday goes to previous Monday', () => {
    expect(getStartOfWeek('2026-06-07')).toBe('2026-06-01');
  });

  it('formatShortWeekday returns capitalized short label', () => {
    expect(formatShortWeekday('2026-06-03')).toMatch(/^Mi/);
  });

  it('addDays across week boundary', () => {
    expect(addDays('2026-06-07', 1)).toBe('2026-06-08');
  });
});
