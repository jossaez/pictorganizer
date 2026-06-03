import { ActivityStatus, CelebrationStyle } from '@/domain/enums';
import {
  calculateDailyProgress,
  type ActivityForDailyProgress,
} from '@/domain/services/progress.service';

export function buildDayCompleteKey(profileId: string, date: string): string {
  return `${profileId}:${date}`;
}

export function projectActivityCompleted(
  activities: ActivityForDailyProgress[],
  instanceId: string,
): ActivityForDailyProgress[] {
  return activities.map((activity) =>
    activity.id === instanceId
      ? {
          ...activity,
          status: ActivityStatus.Completed,
          computedState: 'completed' as const,
        }
      : activity,
  );
}

export function projectActivitySkipped(
  activities: ActivityForDailyProgress[],
  instanceId: string,
): ActivityForDailyProgress[] {
  return activities.map((activity) =>
    activity.id === instanceId
      ? {
          ...activity,
          status: ActivityStatus.Skipped,
          computedState: 'skipped' as const,
        }
      : activity,
  );
}

export function willDayBecomeComplete(
  activities: ActivityForDailyProgress[],
  instanceId: string,
  action: 'complete' | 'skip',
): boolean {
  const projected =
    action === 'complete'
      ? projectActivityCompleted(activities, instanceId)
      : projectActivitySkipped(activities, instanceId);

  const before = calculateDailyProgress(activities);
  const after = calculateDailyProgress(projected);

  return !before.isComplete && after.isComplete;
}

export const DAY_COMPLETE_CELEBRATION = {
  type: CelebrationStyle.Smile,
  message: 'Día completado',
  subtitle: 'Muy bien, has terminado tus actividades de hoy',
} as const;
