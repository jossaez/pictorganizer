import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ProfileForm } from '@/features/profiles/components/ProfileForm';
import { useProfiles } from '@/features/profiles/hooks/useProfiles';
import type { ProfileFormData } from '@/features/profiles/types/profile-form.types';
import { useAppStore } from '@/store/app.store';

export function CreateProfilePage() {
  const navigate = useNavigate();
  const userMode = useAppStore((s) => s.userMode);
  const { profiles, createProfile, isMutating, error } = useProfiles();
  const isAdultMode = userMode === 'adult';
  const isSetupFlow = profiles.length === 0;

  async function handleSubmit(data: ProfileFormData): Promise<void> {
    const profile = await createProfile({
      name: data.name,
      color: data.color,
      avatarId: data.avatarId ?? undefined,
      birthDate: data.birthDate || undefined,
      childModeDetailLevel: data.childModeDetailLevel,
      showTimer: data.showTimer,
      showAnticipation: data.showAnticipation,
    });

    if (profile) {
      navigate(userMode === 'child' ? '/child' : '/agenda', { replace: true });
    }
  }

  if (!isAdultMode && !isSetupFlow) {
    return (
      <div className="flex min-h-full flex-col bg-[var(--color-bg)] px-4 py-8">
        <Button variant="ghost" className="mb-4 gap-2 px-0" onClick={() => navigate('/profiles')}>
          <ArrowLeft className="h-5 w-5" aria-hidden />
          Volver
        </Button>
        <p className="text-slate-600">Crear perfiles está disponible solo en modo adulto.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-[var(--color-bg)] px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-lg md:max-w-xl">
        <Button variant="ghost" className="mb-4 gap-2 px-0" onClick={() => navigate('/profiles')}>
          <ArrowLeft className="h-5 w-5" aria-hidden />
          Volver
        </Button>

        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Nuevo perfil</h1>
        <p className="mt-2 text-slate-600">Crea un perfil para un miembro de la familia.</p>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="mt-8">
          <ProfileForm
            mode="create"
            isSubmitting={isMutating}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/profiles')}
          />
        </div>
      </div>
    </div>
  );
}
