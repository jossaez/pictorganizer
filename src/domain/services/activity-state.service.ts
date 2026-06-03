import { ActivityStatus } from '../enums';
import type { ActivityInstance } from '../types';

export const DEFAULT_ACTIVITY_DURATION_MINUTES = 30;

export type ComputedActivityState =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'skipped'
  | 'missed';

export interface EnrichedActivityInstance extends ActivityInstance {
  computedState: ComputedActivityState;
}

export function getEndTimeMinutes(activity: ActivityInstance): number {
  if (activity.endTimeMinutes != null) return activity.endTimeMinutes;
  return activity.startTimeMinutes + DEFAULT_ACTIVITY_DURATION_MINUTES;
}

export function getNowMinutesFromMidnight(now: Date = new Date()): number {
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Computes the visual/runtime state of an activity instance.
 *
 * Persisted statuses: pending, completed, skipped (and rarely missed if materialized).
 * Computed only: in_progress (current time within window), missed (past end on today/past days).
 *
 * v1 strategy: missed is NOT written to Dexie automatically — it is derived here when
 * status is pending and the time window has passed. Avoid background materialization.
 */
export function computeActivityState(
  activity: ActivityInstance,
  context: {
    date: string;
    todayDate: string;
    nowMinutes: number;
  },
): ComputedActivityState {
  if (activity.status === ActivityStatus.Completed) return 'completed';
  if (activity.status === ActivityStatus.Skipped) return 'skipped';
  if (activity.status === ActivityStatus.Missed) return 'missed';
  // in_progress is computed below — do not persist InProgress in Dexie for v1
  if (activity.status === ActivityStatus.InProgress) {
    // Legacy rows: treat as pending and recompute
  }

  if (context.date > context.todayDate) return 'pending';
  if (context.date < context.todayDate) return 'missed';

  const end = getEndTimeMinutes(activity);
  if (context.nowMinutes >= activity.startTimeMinutes && context.nowMinutes < end) {
    return 'in_progress';
  }
  if (context.nowMinutes >= end) return 'missed';
  return 'pending';
}

export function enrichActivities(
  activities: ActivityInstance[],
  context: {
    date: string;
    todayDate: string;
    nowMinutes: number;
  },
): EnrichedActivityInstance[] {
  return activities
    .map((activity) => ({
      ...activity,
      computedState: computeActivityState(activity, context),
    }))
    .sort((a, b) => a.startTimeMinutes - b.startTimeMinutes || a.sortOrder - b.sortOrder);
}

/** @deprecated Prefer getStatusLabel from activityStatusPresentation in UI code */
export const COMPUTED_STATE_LABELS: Record<ComputedActivityState, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  completed: 'Hecho',
  skipped: 'Saltada',
  missed: 'No realizada',
};
