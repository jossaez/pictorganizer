import {
  cancelActivityNotification,
  rescheduleNotificationsForActiveProfileNextDays,
  rescheduleNotificationsForDate,
  rescheduleRollingNotifications,
} from './local-notification.service';

/** Fire-and-forget notification sync — never blocks UI. */
export function syncNotificationsRolling(profileId: string | null | undefined): void {
  if (!profileId) return;
  void rescheduleRollingNotifications(profileId).catch((err) => {
    console.warn('[notifications] syncNotificationsRolling:', err);
  });
}

export function syncNotificationsForDate(
  profileId: string | null | undefined,
  date: string | undefined,
): void {
  if (!profileId || !date) return;
  void rescheduleNotificationsForDate(profileId, date).catch((err) => {
    console.warn('[notifications] syncNotificationsForDate:', err);
  });
}

export function cancelInstanceNotification(activityInstanceId: string): void {
  void cancelActivityNotification(activityInstanceId).catch((err) => {
    console.warn('[notifications] cancelInstanceNotification:', err);
  });
}

/** Called on bootstrap and foreground resume when profile + permissions allow. */
export function syncActiveProfileNotificationsNextDays(): void {
  void rescheduleNotificationsForActiveProfileNextDays().catch((err) => {
    console.warn('[notifications] syncActiveProfileNotificationsNextDays:', err);
  });
}
