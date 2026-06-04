import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { DeactivateProfileDialog } from '@/features/profiles/components/DeactivateProfileDialog';
import { ProfileForm } from '@/features/profiles/components/ProfileForm';
import { useProfiles } from '@/features/profiles/hooks/useProfiles';
import {
  persistProfilePhoto,
  removeProfilePhoto,
} from '@/features/profiles/services/profile-photo.service';
import type { ProfileFormData } from '@/features/profiles/types/profile-form.types';
import { profileRepository } from '@/infrastructure/repositories';
import { useAppStore } from '@/store/app.store';

export function EditProfilePage() {
  const { t } = useTranslation();
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const userMode = useAppStore((s) => s.userMode);
  const { updateProfile, deactivateProfile, isMutating, error } = useProfiles();
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  const profile = useLiveQuery(
    () => (profileId ? profileRepository.getProfileById(profileId) : undefined),
    [profileId],
  );

  const settings = useLiveQuery(
    () => (profileId ? profileRepository.getSettingsByProfileId(profileId) : undefined),
    [profileId],
  );

  const isLoading = profile === undefined || settings === undefined;
  const isAdultMode = userMode === 'adult';

  if (!profileId) {
    return (
      <div className="px-4 py-8">
        <p className="text-red-700">Perfil no válido.</p>
        <Button className="mt-4" onClick={() => navigate('/profiles')}>
          Volver a perfiles
        </Button>
      </div>
    );
  }

  if (!isLoading && (!profile || !profile.isActive || profile.deletedAt || !settings)) {
    return (
      <div className="px-4 py-8">
        <p className="text-slate-600">Este perfil no existe o ya no está activo.</p>
        <Button className="mt-4" onClick={() => navigate('/profiles')}>
          Volver a perfiles
        </Button>
      </div>
    );
  }

  async function handleSubmit(data: ProfileFormData): Promise<void> {
    if (!profileId || !profile) return;
    const updated = await updateProfile(profileId, {
      name: data.name,
      color: data.color,
      avatarId: data.avatarId ?? undefined,
      birthDate: data.birthDate || undefined,
      childModeDetailLevel: data.childModeDetailLevel,
      showTimer: data.showTimer,
      showAnticipation: data.showAnticipation,
    });

    if (!updated) return;

    let photoWarning: string | undefined;
    try {
      if (data.removePhoto && profile.photoUri) {
        await removeProfilePhoto(profileId, profile.photoUri);
      } else if (data.profilePhotoFile) {
        await persistProfilePhoto(profileId, data.profilePhotoFile, profile.photoUri);
      }
    } catch (err) {
      console.error('[EditProfilePage] photo save:', err);
      photoWarning = t('onboarding.photoSaveFailed');
    }

    navigate('/profiles', { state: photoWarning ? { photoWarning } : undefined });
  }

  async function handleDeactivate(): Promise<void> {
    if (!profileId) return;
    const result = await deactivateProfile(profileId);
    if (result.success) {
      setShowDeactivateDialog(false);
      navigate(result.redirectTo ?? '/profiles', { replace: true });
    }
  }

  if (!isAdultMode) {
    return (
      <div className="safe-top safe-x safe-bottom flex min-h-full flex-col bg-[var(--color-bg)] px-4 py-8">
        <Button variant="ghost" className="mb-4 gap-2 px-0" onClick={() => navigate('/profiles')}>
          <ArrowLeft className="h-5 w-5" aria-hidden />
          Volver
        </Button>
        <p className="text-slate-600">Editar perfiles está disponible solo en modo adulto.</p>
        <p className="mt-2 text-sm text-slate-500">
          Activa el modo adulto en Ajustes para gestionar perfiles.
        </p>
      </div>
    );
  }

  if (isLoading || !profile || !settings) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[var(--color-bg)] px-4 py-8">
        <p className="text-slate-500">Cargando perfil…</p>
      </div>
    );
  }

  return (
    <div className="safe-top safe-x safe-bottom flex min-h-full flex-col bg-[var(--color-bg)] px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-lg md:max-w-xl">
        <Button variant="ghost" className="mb-4 gap-2 px-0" onClick={() => navigate('/profiles')}>
          <ArrowLeft className="h-5 w-5" aria-hidden />
          Volver
        </Button>

        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Editar perfil</h1>
        <p className="mt-2 text-slate-600">Modifica la configuración de {profile.name}.</p>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <div className="mt-8">
          <ProfileForm
            mode="edit"
            initialProfile={profile}
            initialSettings={settings}
            isSubmitting={isMutating}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/profiles')}
          />
        </div>

        {isAdultMode && (
          <div className="mt-10 border-t border-slate-200 pt-8">
            <p className="text-sm font-medium text-slate-700">Zona de adulto</p>
            <p className="mt-1 text-sm text-slate-500">
              Desactivar ocultará este perfil sin borrar sus datos.
            </p>
            <Button
              variant="secondary"
              className="mt-4 gap-2 text-red-600 ring-red-100 hover:bg-red-50"
              onClick={() => setShowDeactivateDialog(true)}
              disabled={isMutating}
            >
              <Trash2 className="h-5 w-5" aria-hidden />
              Desactivar perfil
            </Button>
          </div>
        )}
      </div>

      <DeactivateProfileDialog
        profileName={profile.name}
        isOpen={showDeactivateDialog}
        isLoading={isMutating}
        onConfirm={() => void handleDeactivate()}
        onCancel={() => setShowDeactivateDialog(false)}
      />
    </div>
  );
}
