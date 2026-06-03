import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { ProfileAvatar } from '@/components/media/ProfileAvatar';
import { navigateToAdultOrUnlock } from '@/features/adult-mode/utils/navigateToAdultOrUnlock';
import { useAvatars } from '@/features/profiles/hooks/useAvatars';
import { useProfiles } from '@/features/profiles/hooks/useProfiles';
import { useDevice } from '@/hooks/useDevice';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useAppStore } from '@/store/app.store';
import { cn } from '@/utils/cn';

export function ChildModeLayout() {
  const navigate = useNavigate();
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const { activeProfile } = useProfiles();
  const { avatars } = useAvatars();
  const { isEffectiveTablet } = useDevice();
  const { largeText, text } = useAccessibility();

  if (!activeProfileId) {
    return <Navigate to="/profiles" replace />;
  }

  function handleEnterAdultMode(): void {
    void navigateToAdultOrUnlock(navigate, '/adult');
  }

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-blue-50/80 to-[var(--color-bg)]">
      <header className="sticky top-0 z-40 border-b border-blue-100/80 bg-white/95 backdrop-blur-md">
        <div className={cn('mx-auto flex w-full items-center justify-between gap-4 px-4 py-4 md:px-6', isEffectiveTablet ? 'max-w-6xl' : 'max-w-3xl')}>
          <div className="flex min-w-0 items-center gap-3">
            {activeProfile && (
              <ProfileAvatar profile={activeProfile} size="md" avatars={avatars} />
            )}
            <div className="min-w-0">
              <p className={cn('truncate font-bold text-slate-900', largeText ? text['2xl'] : 'text-xl md:text-2xl')}>
                {activeProfile ? `Hola, ${activeProfile.name}` : 'Hola'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleEnterAdultMode}
            className="a11y-focus-ring shrink-0 rounded-xl px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Modo adulto"
          >
            Modo adulto
          </button>
        </div>
      </header>

      <main
        className={cn(
          'mx-auto w-full flex-1 px-4 py-6 md:px-6 md:py-8',
          isEffectiveTablet ? 'max-w-6xl' : 'max-w-3xl',
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}
