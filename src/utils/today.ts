import { formatISODate } from './date';

export function todayISODate(): string {
  return formatISODate(new Date());
}
