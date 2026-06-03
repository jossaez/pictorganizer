import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useMemo, useState } from 'react';
import type { Profile } from '@/domain/types';
import { profileRepository } from '@/infrastructure/repositories';
import { useAppSettings } from '@/features/settings/hooks/useAppSettings';
import type {
  CreateProfileInput,
  UpdateProfileInput,
} from '@/features/profiles/types/profile-form.types';
import { useAppStore } from '@/store/app.store';

export interface DeactivateProfileResult {
  success: boolean;
  redirectTo?: string;
}

export function useProfiles() {
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const { setActiveProfile } = useAppSettings();
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const profiles = useLiveQuery(() => profileRepository.getActiveProfiles(), [], []);

  const isLoading = profiles === undefined;

  const activeProfile = useMemo(
    () => profiles?.find((p) => p.id === activeProfileId) ?? null,
    [profiles, activeProfileId],
  );

  const selectProfile = useCallback(
    async (profileId: string): Promise<boolean> => {
      setIsMutating(true);
      setError(null);
      try {
        const profile = await profileRepository.getProfileById(profileId);
        if (!profile || !profile.isActive || profile.deletedAt) {
          setError('Perfil no encontrado');
          return false;
        }
        return await setActiveProfile(profileId);
      } catch (err) {
        console.error('[useProfiles] selectProfile:', err);
        setError(err instanceof Error ? err.message : 'Error al seleccionar perfil');
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [setActiveProfile],
  );

  const createProfile = useCallback(
    async (input: CreateProfileInput): Promise<Profile | null> => {
      setIsMutating(true);
      setError(null);
      try {
        const { profile, settings } = await profileRepository.createProfile({
          name: input.name,
          color: input.color,
          avatarId: input.avatarId,
          birthDate: input.birthDate || undefined,
        });

        await profileRepository.updateProfileSettings(profile.id, {
          childModeDetailLevel: input.childModeDetailLevel,
          showTimer: input.showTimer,
          showAnticipation: input.showAnticipation,
        });

        void settings;

        if (!activeProfileId) {
          await setActiveProfile(profile.id);
        }

        return profile;
      } catch (err) {
        console.error('[useProfiles] createProfile:', err);
        setError(err instanceof Error ? err.message : 'Error al crear perfil');
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [activeProfileId, setActiveProfile],
  );

  const updateProfile = useCallback(
    async (profileId: string, input: UpdateProfileInput): Promise<Profile | null> => {
      setIsMutating(true);
      setError(null);
      try {
        const profile = await profileRepository.updateProfile(profileId, {
          name: input.name,
          color: input.color,
          avatarId: input.avatarId,
          birthDate: input.birthDate || undefined,
        });

        await profileRepository.updateProfileSettings(profileId, {
          childModeDetailLevel: input.childModeDetailLevel,
          showTimer: input.showTimer,
          showAnticipation: input.showAnticipation,
        });

        return profile;
      } catch (err) {
        console.error('[useProfiles] updateProfile:', err);
        setError(err instanceof Error ? err.message : 'Error al actualizar perfil');
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [],
  );

  const deactivateProfile = useCallback(
    async (profileId: string): Promise<DeactivateProfileResult> => {
      setIsMutating(true);
      setError(null);
      try {
        const profile = await profileRepository.getProfileById(profileId);
        if (!profile || !profile.isActive) {
          setError('Perfil no encontrado');
          return { success: false };
        }

        await profileRepository.softDeleteProfile(profileId);

        if (activeProfileId === profileId) {
          const remaining = await profileRepository.getActiveProfiles();
          if (remaining.length > 0) {
            await setActiveProfile(remaining[0].id);
            return { success: true };
          }

          await setActiveProfile(undefined);
          return { success: true, redirectTo: '/profiles' };
        }

        return { success: true };
      } catch (err) {
        console.error('[useProfiles] deactivateProfile:', err);
        setError(err instanceof Error ? err.message : 'Error al desactivar perfil');
        return { success: false };
      } finally {
        setIsMutating(false);
      }
    },
    [activeProfileId, setActiveProfile],
  );

  return {
    profiles: profiles ?? [],
    activeProfile,
    isLoading,
    isMutating,
    error,
    selectProfile,
    createProfile,
    updateProfile,
    deactivateProfile,
  };
}
