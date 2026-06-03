import { ActivityStatus, ActivityVisibility } from '@/domain/enums';
import type { ActivityInstance } from '@/domain/types';
import type { ProfileSettings } from '@/domain/types/entities';
import { compareISODate } from '@/utils/date';
import { todayISODate } from '@/utils/today';

export function normalizeNotificationSettings(
  settings: ProfileSettings,
): { notificationsEnabled: boolean; notificationMinutesBefore: number } {
  return {
    notificationsEnabled: settings.notificationsEnabled ?? false,
    notificationMinutesBefore: settings.notificationMinutesBefore ?? 0,
  };
}

export function isSchedulableActivityInstance(
  activity: ActivityInstance,
  todayDate: string = todayISODate(),
): boolean {
  if (activity.deletedAt) return false;
  if (activity.visibility === ActivityVisibility.Hidden) return false;

  if (
    activity.status === ActivityStatus.Completed ||
    activity.status === ActivityStatus.Skipped ||
    activity.status === ActivityStatus.Missed
  ) {
    return false;
  }

  if (compareISODate(activity.date, todayDate) < 0) {
    return false;
  }

  if (activity.startTimeMinutes == null || Number.isNaN(activity.startTimeMinutes)) {
    return false;
  }

  return true;
}
