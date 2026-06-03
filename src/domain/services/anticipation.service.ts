import type { ActivityInstance } from '../types';
import {
  enrichActivities,
  type EnrichedActivityInstance,
} from './activity-state.service';

export interface AnticipationContext {
  date: string;
  todayDate: string;
}

export interface NowNextLaterResult {
  nowActivity: EnrichedActivityInstance | null;
  nextActivity: EnrichedActivityInstance | null;
  laterActivity: EnrichedActivityInstance | null;
  /** True when all activities for the day are completed or skipped */
  dayCompleted: boolean;
}

function isUpcoming(state: EnrichedActivityInstance['computedState']): boolean {
  return state === 'pending' || state === 'in_progress';
}

function resolveContext(
  activities: ActivityInstance[],
  context?: Partial<AnticipationContext>,
): AnticipationContext {
  const date = context?.date ?? activities[0]?.date ?? '';
  const todayDate = context?.todayDate ?? date;
  return { date, todayDate };
}

export function getNowNextLater(
  activities: ActivityInstance[],
  currentTimeMinutes: number,
  context?: Partial<AnticipationContext>,
): NowNextLaterResult {
  const { date, todayDate } = resolveContext(activities, context);

  const active = activities
    .filter((a) => !a.deletedAt)
    .sort((a, b) => a.startTimeMinutes - b.startTimeMinutes || a.sortOrder - b.sortOrder);

  if (active.length === 0) {
    return {
      nowActivity: null,
      nextActivity: null,
      laterActivity: null,
      dayCompleted: false,
    };
  }

  const enriched = enrichActivities(active, {
    date,
    todayDate,
    nowMinutes: currentTimeMinutes,
  });

  const upcoming = enriched.filter((a) => isUpcoming(a.computedState));

  if (upcoming.length === 0) {
    const dayCompleted = enriched.every(
      (a) => a.computedState === 'completed' || a.computedState === 'skipped',
    );
    return {
      nowActivity: null,
      nextActivity: null,
      laterActivity: null,
      dayCompleted,
    };
  }

  const inProgress = upcoming.find((a) => a.computedState === 'in_progress');
  const nowActivity = inProgress ?? upcoming[0];
  const nowIndex = upcoming.indexOf(nowActivity);
  const remaining = upcoming.slice(nowIndex + 1);

  return {
    nowActivity,
    nextActivity: remaining[0] ?? null,
    laterActivity: remaining[1] ?? null,
    dayCompleted: false,
  };
}
