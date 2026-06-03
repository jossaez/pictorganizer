import { RecurrenceType } from '../enums';

export type { ActivityVisual, ActivityVisualType } from '../visual/visual-asset.utils';
export {
  CATEGORY_FALLBACK_PICTOGRAM,
  DEFAULT_FALLBACK_PICTOGRAM_ID,
  getFallbackPictogramId,
  isActivityVisual,
  normalizeActivityVisual,
} from '../visual/visual-asset.utils';

/** Embedded in ActivityTemplate.recurrence */
export interface RecurrenceRule {
  type: RecurrenceType;
  startDate: string;
  endDate?: string;
  /** ISO weekday 1=Mon … 7=Sun — required for weekly/custom */
  daysOfWeek?: number[];
  /** Every N periods — reserved v2, default 1 */
  interval?: number;
  /** Max occurrences — alternative to endDate, reserved v2 */
  occurrenceCount?: number;
}

/** Step inside a RoutineTemplate (catalog) */
export interface RoutineStep {
  title: string;
  /** Optional short detail shown in template preview */
  description?: string;
  /** Temporary pictogram id — replaceable with ARASAAC or real catalog later */
  pictogramId: string;
  categoryId: string;
  /** Minutes offset from routine anchor time */
  offsetMinutes: number;
  durationMinutes?: number;
  sortOrder?: number;
}
