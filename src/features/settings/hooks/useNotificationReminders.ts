import { useCallback, useEffect, useState } from 'react';
import {
  checkPermissions,
  getNotificationPlatformInfo,
  requestPermissions,
  rescheduleRollingNotifications,
  syncProfileNotifications,
  type NotificationPermissionState,
} from '@/infrastructure/notifications/local-notification.service';

export function useNotificationReminders(
  profileId: string | null,
  notificationsEnabled: boolean,
  onPermissionDenied: () => void,
) {
  const [permission, setPermission] = useState<NotificationPermissionState>('unsupported');
  const [isRequesting, setIsRequesting] = useState(false);
  const platform = getNotificationPlatformInfo();

  useEffect(() => {
    if (!platform.supported) {
      setPermission('unsupported');
      return;
    }
    void checkPermissions().then(setPermission);
  }, [platform.supported]);

  const requestNotificationPermissions = useCallback(async (): Promise<boolean> => {
    if (!platform.supported) return false;

    setIsRequesting(true);
    try {
      const result = await requestPermissions();
      setPermission(result);
      if (result !== 'granted') {
        onPermissionDenied();
        return false;
      }
      if (profileId) {
        await rescheduleRollingNotifications(profileId);
      }
      return true;
    } finally {
      setIsRequesting(false);
    }
  }, [onPermissionDenied, platform.supported, profileId]);

  const handleEnableReminders = useCallback(async (): Promise<boolean> => {
    if (!platform.supported) return false;

    const current = await checkPermissions();
    setPermission(current);

    if (current === 'granted') {
      if (profileId) {
        await rescheduleRollingNotifications(profileId);
      }
      return true;
    }

    return requestNotificationPermissions();
  }, [platform.supported, profileId, requestNotificationPermissions]);

  const handleDisableReminders = useCallback(async (): Promise<void> => {
    if (profileId) {
      await syncProfileNotifications(profileId, { reschedule: false });
    }
  }, [profileId]);

  const handleTimingChange = useCallback(async (): Promise<void> => {
    if (!profileId || !notificationsEnabled || !platform.supported) return;
    await rescheduleRollingNotifications(profileId);
  }, [notificationsEnabled, platform.supported, profileId]);

  return {
    platform,
    permission,
    isRequesting,
    requestNotificationPermissions,
    handleEnableReminders,
    handleDisableReminders,
    handleTimingChange,
  };
}
