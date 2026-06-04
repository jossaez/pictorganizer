import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import type { ActivityInstance } from '@/domain/types';
import type { ProfileSettings } from '@/domain/types/entities';
import { activityRepository, profileRepository, settingsRepository } from '@/infrastructure/repositories';
import { addDays } from '@/utils/date';
import { todayISODate } from '@/utils/today';
import {
  buildActivityNotificationPayload,
  type ActivityNotificationPayload,
} from './notification-content';
import {
  isSchedulableActivityInstance,
  normalizeNotificationSettings,
} from './notification-eligibility';
import { getNotificationIdForActivityInstance } from './notification-id';

export const NOTIFICATION_ROLLING_DAYS = 7;
export const ACTIVITY_NOTIFICATION_CHANNEL_ID = 'pictorganizer-activities';

export type NotificationPermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

export interface NotificationPlatformInfo {
  supported: boolean;
  platform: 'native' | 'web';
}

export interface PendingNotificationSummary {
  id: number;
  title?: string;
  body?: string;
  scheduleAt?: Date;
  activityInstanceId?: string;
  profileId?: string;
}

let channelReady = false;

function isNativePlatform(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

function mapPermissionStatus(
  status: string | undefined,
): NotificationPermissionState {
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  if (status === 'prompt') return 'prompt';
  return 'unsupported';
}

export function isSupported(): boolean {
  return isNativePlatform();
}

export function getNotificationPlatformInfo(): NotificationPlatformInfo {
  const native = isNativePlatform();
  return {
    supported: native,
    platform: native ? 'native' : 'web',
  };
}

async function ensureNotificationChannel(): Promise<void> {
  if (!isNativePlatform() || channelReady) return;

  try {
    await LocalNotifications.createChannel({
      id: ACTIVITY_NOTIFICATION_CHANNEL_ID,
      name: 'Recordatorios de actividades',
      description: 'Avisos locales cuando toca una actividad programada',
      importance: 4,
      visibility: 1,
    });
    channelReady = true;
  } catch (err) {
    console.warn('[notifications] createChannel failed:', err);
  }
}

export async function checkPermissions(): Promise<NotificationPermissionState> {
  if (!isNativePlatform()) {
    return 'unsupported';
  }

  try {
    const result = await LocalNotifications.checkPermissions();
    return mapPermissionStatus(result.display);
  } catch (err) {
    console.warn('[notifications] checkPermissions failed:', err);
    return 'unsupported';
  }
}

export async function requestPermissions(): Promise<NotificationPermissionState> {
  if (!isNativePlatform()) {
    return 'unsupported';
  }

  try {
    const result = await LocalNotifications.requestPermissions();
    return mapPermissionStatus(result.display);
  } catch (err) {
    console.warn('[notifications] requestPermissions failed:', err);
    return 'denied';
  }
}

async function schedulePayload(payload: ActivityNotificationPayload): Promise<void> {
  if (!isNativePlatform()) return;

  await ensureNotificationChannel();

  const id = getNotificationIdForActivityInstance(payload.activityInstanceId);

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title: payload.title,
          body: payload.body,
          schedule: { at: payload.scheduleAt },
          channelId: ACTIVITY_NOTIFICATION_CHANNEL_ID,
          extra: {
            activityInstanceId: payload.activityInstanceId,
            profileId: payload.profileId,
          },
        },
      ],
    });
  } catch (err) {
    console.warn('[notifications] schedule failed:', payload.activityInstanceId, err);
  }
}

export async function scheduleActivityNotification(
  activity: ActivityInstance,
  settings?: ProfileSettings,
): Promise<void> {
  const profileSettings =
    settings ?? (await profileRepository.getSettingsByProfileId(activity.profileId));
  if (!profileSettings) return;

  const { notificationsEnabled, notificationMinutesBefore } =
    normalizeNotificationSettings(profileSettings);

  if (!notificationsEnabled) return;
  if (!isNativePlatform()) return;
  if (!isSchedulableActivityInstance(activity)) return;

  const payload = buildActivityNotificationPayload(activity, notificationMinutesBefore);
  if (!payload) return;

  await schedulePayload(payload);
}

export async function cancelActivityNotification(activityInstanceId: string): Promise<void> {
  if (!isNativePlatform()) return;

  const id = getNotificationIdForActivityInstance(activityInstanceId);
  try {
    await LocalNotifications.cancel({ notifications: [{ id }] });
  } catch (err) {
    console.warn('[notifications] cancel failed:', activityInstanceId, err);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (!isNativePlatform()) return;

  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length === 0) return;
    await LocalNotifications.cancel({
      notifications: pending.notifications.map((n) => ({ id: n.id })),
    });
  } catch (err) {
    console.warn('[notifications] cancelAll failed:', err);
  }
}

async function cancelNotificationsForInstances(instances: ActivityInstance[]): Promise<void> {
  await Promise.all(instances.map((i) => cancelActivityNotification(i.id)));
}

export async function rescheduleNotificationsForDate(
  profileId: string,
  date: string,
): Promise<void> {
  const settings = await profileRepository.getSettingsByProfileId(profileId);
  const instances = await activityRepository.getInstancesByDate(profileId, date);

  await cancelNotificationsForInstances(instances);

  if (!settings) return;

  const { notificationsEnabled, notificationMinutesBefore } =
    normalizeNotificationSettings(settings);

  if (!notificationsEnabled || !isNativePlatform()) return;

  const todayDate = todayISODate();

  for (const instance of instances) {
    if (!isSchedulableActivityInstance(instance, todayDate)) continue;

    const payload = buildActivityNotificationPayload(
      instance,
      notificationMinutesBefore,
    );
    if (!payload) continue;

    await schedulePayload(payload);
  }
}

export async function rescheduleRollingNotifications(profileId: string): Promise<void> {
  const startDate = todayISODate();
  for (let i = 0; i < NOTIFICATION_ROLLING_DAYS; i++) {
    const date = addDays(startDate, i);
    await rescheduleNotificationsForDate(profileId, date);
  }
}

/** Alias for rolling 7-day reschedule per profile. */
export const rescheduleNotificationsForProfile = rescheduleRollingNotifications;

export async function rescheduleNotificationsForDates(
  profileId: string,
  dates: string[],
): Promise<void> {
  const uniqueDates = [...new Set(dates)];
  for (const date of uniqueDates) {
    await rescheduleNotificationsForDate(profileId, date);
  }
}

/**
 * Reprograms the next 7 days for the active profile on app start/resume.
 * Skips when reminders are disabled or permissions are not granted.
 */
export async function rescheduleNotificationsForActiveProfileNextDays(): Promise<void> {
  if (!isNativePlatform()) return;

  const appSettings = await settingsRepository.getOrCreateAppSettings();
  const profileId = appSettings.activeProfileId;
  if (!profileId) return;

  const profileSettings = await profileRepository.getSettingsByProfileId(profileId);
  if (!profileSettings) return;

  const { notificationsEnabled } = normalizeNotificationSettings(profileSettings);
  if (!notificationsEnabled) return;

  const permission = await checkPermissions();
  if (permission !== 'granted') return;

  await rescheduleRollingNotifications(profileId);
}

export async function getPendingNotificationSummaries(): Promise<PendingNotificationSummary[]> {
  if (!isNativePlatform()) return [];

  try {
    const pending = await LocalNotifications.getPending();
    return pending.notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      body: notification.body,
      scheduleAt: notification.schedule?.at
        ? new Date(notification.schedule.at)
        : undefined,
      activityInstanceId:
        typeof notification.extra?.activityInstanceId === 'string'
          ? notification.extra.activityInstanceId
          : undefined,
      profileId:
        typeof notification.extra?.profileId === 'string'
          ? notification.extra.profileId
          : undefined,
    }));
  } catch (err) {
    console.warn('[notifications] getPending failed:', err);
    return [];
  }
}

/** Cancels all pending notifications for a profile when reminders are disabled. */
export async function syncProfileNotifications(
  profileId: string,
  options: { reschedule?: boolean } = {},
): Promise<void> {
  if (!isNativePlatform()) return;

  const settings = await profileRepository.getSettingsByProfileId(profileId);
  const notificationsEnabled = settings?.notificationsEnabled ?? false;

  if (!notificationsEnabled) {
    try {
      const pending = await LocalNotifications.getPending();
      const toCancel = pending.notifications.filter(
        (n) => n.extra?.profileId === profileId,
      );
      if (toCancel.length > 0) {
        await LocalNotifications.cancel({
          notifications: toCancel.map((n) => ({ id: n.id })),
        });
      }
    } catch (err) {
      console.warn('[notifications] syncProfile cancel failed:', err);
    }
    return;
  }

  if (options.reschedule !== false) {
    await rescheduleRollingNotifications(profileId);
  }
}
