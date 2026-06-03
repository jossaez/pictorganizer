import { useCallback, useState } from 'react';
import type { AppSettings } from '@/domain/types';
import type { UpdateAppSettingsInput } from '@/domain/repositories/settings.repository';
import { DeviceLayout } from '@/domain/enums';
import { settingsRepository } from '@/infrastructure/repositories';
import { syncInstanceWindow } from '@/infrastructure/database/instance-window-sync';
import { useAppStore } from '@/store/app.store';

export function useAppSettings() {
  const hydrateFromSettings = useAppStore((s) => s.hydrateFromSettings);
  const setOnboardingCompleted = useAppStore((s) => s.setOnboardingCompleted);
  const setActiveProfileId = useAppStore((s) => s.setActiveProfileId);
  const setAccessibilitySettings = useAppStore((s) => s.setAccessibilitySettings);

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const applySettings = useCallback(
    (settings: AppSettings) => {
      hydrateFromSettings(settings);
    },
    [hydrateFromSettings],
  );

  const updateSettings = useCallback(
    async (input: UpdateAppSettingsInput): Promise<AppSettings | null> => {
      setIsSaving(true);
      setError(null);
      try {
        const updated = await settingsRepository.updateAppSettings(input);
        applySettings(updated);
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al guardar ajustes';
        console.error('[useAppSettings] updateSettings:', err);
        setError(message);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [applySettings],
  );

  const markOnboardingCompleted = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await settingsRepository.markOnboardingCompleted();
      setOnboardingCompleted(true);
      applySettings(updated);
      return true;
    } catch (err) {
      console.error('[useAppSettings] markOnboardingCompleted:', err);
      setError(err instanceof Error ? err.message : 'Error al completar onboarding');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [applySettings, setOnboardingCompleted]);

  const setActiveProfile = useCallback(
    async (profileId: string | undefined): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      try {
        const updated = await settingsRepository.setActiveProfileId(profileId);
        setActiveProfileId(profileId ?? null);
        applySettings(updated);
        if (profileId) {
          syncInstanceWindow(profileId);
        }
        return true;
      } catch (err) {
        console.error('[useAppSettings] setActiveProfile:', err);
        setError(err instanceof Error ? err.message : 'Error al cambiar perfil activo');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [applySettings, setActiveProfileId],
  );

  const setAccessibility = useCallback(
    async (input: {
      reduceMotion?: boolean;
      largeText?: boolean;
      highContrast?: boolean;
      preferredDeviceLayout?: DeviceLayout;
    }): Promise<boolean> => {
      const updated = await updateSettings(input);
      if (updated) {
        setAccessibilitySettings(input);
        return true;
      }
      return false;
    },
    [setAccessibilitySettings, updateSettings],
  );

  return {
    error,
    isSaving,
    markOnboardingCompleted,
    setActiveProfile,
    setAccessibility,
    updateSettings,
  };
}
