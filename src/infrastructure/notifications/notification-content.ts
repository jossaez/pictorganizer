import type { ActivityInstance } from '@/domain/types';
import { parseISODate } from '@/utils/date';

export const NOTIFICATION_DEFAULT_BODY = 'Abre PICTORGANIZER para ver la actividad.';
export const NOTIFICATION_ADVANCE_BODY =
  'Prepárate con calma para la próxima actividad.';

export function buildNotificationBody(minutesBefore: number): string {
  if (minutesBefore <= 0) {
    return NOTIFICATION_DEFAULT_BODY;
  }
  return NOTIFICATION_ADVANCE_BODY;
}

export interface ActivityNotificationPayload {
  id: number;
  title: string;
  body: string;
  scheduleAt: Date;
  activityInstanceId: string;
  profileId: string;
}

/** Builds local Date from ISO calendar date + minutes from midnight (device timezone). */
export function buildScheduleDate(
  isoDate: string,
  startTimeMinutes: number,
  minutesBefore: number,
): Date {
  const { year, month, day } = parseISODate(isoDate);
  const notifyMinutes = startTimeMinutes - minutesBefore;
  const hours = Math.floor(notifyMinutes / 60);
  const minutes = notifyMinutes % 60;
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

export function buildNotificationTitle(activityTitle: string, minutesBefore: number): string {
  if (minutesBefore <= 0) {
    return `Ahora toca: ${activityTitle}`;
  }
  return `En ${minutesBefore} minutos: ${activityTitle}`;
}

export function buildActivityNotificationPayload(
  activity: ActivityInstance,
  minutesBefore: number,
  now: Date = new Date(),
): ActivityNotificationPayload | null {
  const scheduleAt = buildScheduleDate(activity.date, activity.startTimeMinutes, minutesBefore);
  if (scheduleAt.getTime() <= now.getTime()) {
    return null;
  }

  return {
    id: 0, // filled by service
    title: buildNotificationTitle(activity.title, minutesBefore),
    body: buildNotificationBody(minutesBefore),
    scheduleAt,
    activityInstanceId: activity.id,
    profileId: activity.profileId,
  };
}
