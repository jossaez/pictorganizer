import { Check, Pencil, Plus, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ProfileAvatar } from '@/components/media/ProfileAvatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAvatars } from '@/features/profiles/hooks/useAvatars';
import { useProfiles } from '@/features/profiles/hooks/useProfiles';
import { useDevice } from '@/hooks/useDevice';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useAppStore } from '@/store/app.store';
import { cn } from '@/utils/cn';

export function ProfileSelectionPage() {
  const navigate = useNavigate();
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const userMode = useAppStore((s) => s.userMode);
  const { profiles, isLoading, isMutating, error, selectProfile } = useProfiles();
  const { avatars } = useAvatars();
  const { isEffectiveTablet } = useDevice();
  const { largeText, text, buttonTouch } = useAccessibility();

  const isAdultMode = userMode === 'adult';

  async function handleSelect(profileId: string): Promise<void> {
    const ok = await selectProfile(profileId);
    if (ok) navigate(userMode === 'child' ? '/child' : '/agenda');
  }

  return (
    <div className="flex min-h-full flex-col bg-[var(--color-bg)] px-4 py-8 md:px-8">
      <div className={cn('mx-auto w-full', isEffectiveTablet ? 'max-w-4xl' : 'max-w-lg')}>
        <h1 className={cn('font-bold text-slate-900', largeText ? text['3xl'] : 'text-2xl md:text-3xl')}>
          ¿Para quién es la agenda?
        </h1>
        <p className={cn('mt-2 text-slate-600', largeText ? text.lg : 'text-base')}>
          Elige un perfil o crea uno nuevo para la familia.
        </p>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        {isLoading ? (
          <p className="mt-8 text-slate-500">Cargando perfiles…</p>
        ) : profiles.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <UserRound className="h-8 w-8" aria-hidden />
            </div>
            <p className="text-lg text-slate-600">Todavía no hay perfiles creados.</p>
            <Button fullWidth className="mt-6" onClick={() => navigate('/profiles/new')} disabled={isMutating}>
              Crear primer perfil
            </Button>
          </div>
        ) : (
          <ul
            className={cn(
              'mt-8',
              isEffectiveTablet ? 'grid grid-cols-2 gap-4' : 'space-y-4',
            )}
          >
            {profiles.map((profile) => {
              const isActive = activeProfileId === profile.id;
              return (
                <li key={profile.id}>
                  <Card
                    className={cn(
                      'relative overflow-hidden hover:shadow-md',
                      isActive && 'a11y-selected ring-2 ring-[var(--color-primary)]',
                    )}
                    padding="lg"
                    aria-selected={isActive}
                  >
                    <div
                      className="absolute inset-y-0 left-0 w-1.5"
                      style={{ backgroundColor: profile.color }}
                      aria-hidden
                    />

                    <div className="flex items-center gap-4 pl-2">
                      <ProfileAvatar profile={profile} size="lg" avatars={avatars} />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className={cn('font-bold text-slate-900', largeText ? text.xl : 'text-xl')}>{profile.name}</p>
                          {isActive && (
                            <Badge variant="info" className="gap-1">
                              <Check className="h-3 w-3" aria-hidden />
                              Activo
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">Toca para abrir la agenda</p>
                      </div>

                      {isAdultMode && (
                        <Link
                          to={`/profiles/${profile.id}/edit`}
                          className="a11y-focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-800"
                          aria-label={`Editar perfil de ${profile.name}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Pencil className="h-5 w-5" aria-hidden />
                        </Link>
                      )}
                    </div>

                    <Button
                      fullWidth
                      className={cn('mt-4 a11y-focus-ring', buttonTouch)}
                      variant={isActive ? 'secondary' : 'primary'}
                      onClick={() => void handleSelect(profile.id)}
                      disabled={isMutating}
                      aria-label={isActive ? `Abrir agenda de ${profile.name}` : `Seleccionar perfil de ${profile.name}`}
                    >
                      {isActive ? 'Abrir agenda' : 'Seleccionar'}
                    </Button>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}

        {profiles.length > 0 && isAdultMode && (
          <Button
            fullWidth
            variant="secondary"
            className="mt-6 gap-2"
            onClick={() => navigate('/profiles/new')}
            disabled={isMutating}
          >
            <Plus className="h-5 w-5" aria-hidden />
            Añadir perfil
          </Button>
        )}
      </div>
    </div>
  );
}
