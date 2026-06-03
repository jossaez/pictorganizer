/**
 * Pure ISO date utilities (YYYY-MM-DD).
 *
 * All calendar math uses UTC to avoid local timezone shifting the day boundary.
 * String comparison is valid for ordering ISO dates lexicographically.
 */

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface ParsedISODate {
  year: number;
  month: number;
  day: number;
}

export function isValidISODate(date: string): boolean {
  const match = ISO_DATE_RE.exec(date);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const utc = new Date(Date.UTC(year, month - 1, day));
  return (
    utc.getUTCFullYear() === year &&
    utc.getUTCMonth() === month - 1 &&
    utc.getUTCDate() === day
  );
}

/** Parses YYYY-MM-DD into numeric components (UTC calendar date). */
export function parseISODate(date: string): ParsedISODate {
  if (!isValidISODate(date)) {
    throw new Error(`Invalid ISO date: ${date}`);
  }
  const match = ISO_DATE_RE.exec(date)!;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

/** Formats a UTC Date as YYYY-MM-DD. */
export function formatISODate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Compare two ISO dates.
 * @returns negative if a < b, 0 if equal, positive if a > b
 */
export function compareISODate(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

/** ISO weekday: 1 = Monday … 7 = Sunday */
export function getISOWeekday(date: string): number {
  const { year, month, day } = parseISODate(date);
  const jsDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return jsDay === 0 ? 7 : jsDay;
}

/** Adds calendar days in UTC. Negative values subtract days. */
export function addDays(date: string, days: number): string {
  const { year, month, day } = parseISODate(date);
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + days);
  return formatISODate(utc);
}

/**
 * Inclusive range of ISO dates from `fromDate` to `toDate`.
 * Returns [] if fromDate > toDate.
 */
export function getDaysBetween(fromDate: string, toDate: string): string[] {
  if (compareISODate(fromDate, toDate) > 0) return [];

  const days: string[] = [];
  let cursor = fromDate;

  while (compareISODate(cursor, toDate) <= 0) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return days;
}

/** Monday of the ISO week containing `date` (week starts Monday). */
export function getStartOfWeek(date: string): string {
  const weekday = getISOWeekday(date);
  return addDays(date, -(weekday - 1));
}

/** Seven ISO dates from Monday through Sunday for the week containing `date`. */
export function getWeekDays(date: string): string[] {
  const start = getStartOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Whether `date` is today's calendar date (UTC ISO). */
export function isToday(date: string): boolean {
  return date === formatISODate(new Date());
}

/** Day of month (1–31) from an ISO date. */
export function getDayNumber(date: string): number {
  return parseISODate(date).day;
}

const SHORT_WEEKDAY_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  timeZone: 'UTC',
};

const FULL_DAY_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
};

function toUtcDate(isoDate: string): Date {
  const { year, month, day } = parseISODate(isoDate);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Short weekday label, e.g. "Lun". */
export function formatShortWeekday(date: string): string {
  const raw = toUtcDate(date).toLocaleDateString('es-ES', SHORT_WEEKDAY_FORMAT);
  const cleaned = raw.replace(/\.$/, '');
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1, 3);
}

/** Full day label for accessibility, e.g. "martes, 4 de junio". */
export function formatDayLabel(date: string): string {
  return toUtcDate(date).toLocaleDateString('es-ES', FULL_DAY_FORMAT);
}
