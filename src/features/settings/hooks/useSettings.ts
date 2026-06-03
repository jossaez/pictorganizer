import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useState } from 'react';
import type { AppSettings, ProfileSettings } from '@/domain/types';
import type { UpdateAppSettingsInput } from '@/domain/repositories/settings.repository';
import { profileRepository, settingsRepository } from '@/infrastructure/repositories';
import { useAppSettings } from './useAppSettings';

type ProfileSettingsInput = Partial<
  Pick<
    ProfileSettings,
    | 'showTimer'
    | 'showAnticipation'
    | 'celebrationStyle'
    | 'timerStyle'
    | 'childModeDetailLevel'
    | 'notificationsEnabled'
    | 'notificationMinutesBefore'
  >
>;

export function useSettings(activeProfileId: string | null) {
  const { updateSettings, setAccessibility, isSaving: isAppSaving, error: appError } =
    useAppSettings();

  const [profileError, setProfileError] = useState<string | null>(null);
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  const profileSettings = useLiveQuery(
    async () => {
      if (!activeProfileId) return undefined;
      return profileRepository.getSettingsByProfileId(activeProfileId);
    },
    [activeProfileId],
  );

  const getAppSettings = useCallback(async (): Promise<AppSettings> => {
    return settingsRepository.getOrCreateAppSettings();
  }, []);

  const updateAppSettings = useCallback(
    async (input: UpdateAppSettingsInput): Promise<AppSettings | null> => {
      return updateSettings(input);
    },
    [updateSettings],
  );

  const getProfileSettings = useCallback(
    async (profileId: string): Promise<ProfileSettings | undefined> => {
      return profileRepository.getSettingsByProfileId(profileId);
    },
    [],
  );

  const updateProfileSettings = useCallback(
    async (profileId: string, input: ProfileSettingsInput): Promise<ProfileSettings | null> => {
      setIsProfileSaving(true);
      setProfileError(null);
      try {
        const updated = await profileRepository.updateProfileSettings(profileId, input);
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al guardar preferencias';
        console.error('[useSettings] updateProfileSettings:', err);
        setProfileError(message);
        return null;
      } finally {
        setIsProfileSaving(false);
      }
    },
    [],
  );

  return {
    profileSettings,
    isProfileSettingsLoading: activeProfileId != null && profileSettings === undefined,
    error: appError ?? profileError,
    isSaving: isAppSaving || isProfileSaving,
    getAppSettings,
    updateAppSettings,
    getProfileSettings,
    updateProfileSettings,
    setAccessibility,
  };
}
