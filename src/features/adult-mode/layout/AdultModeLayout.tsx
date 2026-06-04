import { Baby, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { ProfileAvatar } from '@/components/media/ProfileAvatar';
import { AdultNavLinks } from '@/features/adult-mode/components/AdultNavLinks';
import { LockAdultModeButton } from '@/features/adult-mode/components/LockAdultModeButton';
import { useAvatars } from '@/features/profiles/hooks/useAvatars';
import { useProfiles } from '@/features/profiles/hooks/useProfiles';
import { useDevice } from '@/hooks/useDevice';
import { useAppStore } from '@/store/app.store';
import { cn } from '@/utils/cn';

/** Shell layout for Modo Adulto — redirects children to /child */
export function AdultModeLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userMode = useAppStore((s) => s.userMode);
  const setUserMode = useAppStore((s) => s.setUserMode);
  const { activeProfile } = useProfiles();
  const { avatars } = useAvatars();
  const { isEffectiveMobile, isEffectiveTablet } = useDevice();

  if (userMode === 'child') {
    return <Navigate to="/child" replace />;
  }

  function handleEnterChildMode(): void {
    useAppStore.getState().lockAdultSession();
    setUserMode('child');
    navigate('/child');
  }

  return (
    <div className="safe-top safe-x flex min-h-full bg-[var(--color-bg)]">
      <aside
        className={cn(
          'w-56 shrink-0 border-r border-slate-200 bg-white flex-col',
          isEffectiveTablet ? 'flex' : 'hidden',
        )}
        aria-label={t('nav.sideAria')}
      >
        <div className="border-b border-slate-100 px-4 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
            {t('shell.modeAdult')}
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">{t('app.name')}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          <AdultNavLinks layout="sidebar" />
        </nav>
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={handleEnterChildMode}
            className="a11y-focus-ring flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            <Baby className="h-5 w-5" aria-hidden />
            {t('adultMode.childMode')}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="app-shell-header sticky top-0 z-40 border-b border-slate-200/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 md:max-w-none md:px-6">
            <Link
              to="/profiles"
              className="flex min-w-0 items-center gap-3 rounded-xl p-1 hover:bg-slate-50"
            >
              {activeProfile && (
                <ProfileAvatar profile={activeProfile} size="sm" avatars={avatars} />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">
                  {activeProfile?.name ?? t('adultMode.noProfile')}
                </p>
                <p className="text-xs text-slate-500">{t('adultMode.activeProfile')}</p>
              </div>
            </Link>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handleEnterChildMode}
                className="a11y-focus-ring hidden rounded-xl px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 sm:inline-flex sm:items-center sm:gap-2"
              >
                <Baby className="h-4 w-4" aria-hidden />
                {t('adultMode.childMode')}
              </button>
              <Link
                to="/settings"
                className={cn(
                  'a11y-focus-ring flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800',
                  isEffectiveTablet && 'hidden',
                )}
                aria-label={t('nav.settings')}
              >
                <Settings className="h-5 w-5" aria-hidden />
              </Link>
            </div>
          </div>
        </header>

        <main
          className={cn(
            'mx-auto w-full flex-1 px-4 py-5 md:px-6 md:py-6',
            isEffectiveMobile ? 'max-w-3xl pb-with-bottom-nav' : 'max-w-6xl pb-6',
          )}
        >
          <Outlet />
          <div className="mt-8 hidden md:block">
            <LockAdultModeButton className="w-full min-h-12" />
          </div>
        </main>

        <nav
          className={cn(
            'safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 pb-2 backdrop-blur-md',
            isEffectiveTablet && 'hidden',
          )}
          aria-label={t('nav.mainAria')}
        >
          <div className="mx-auto flex max-w-3xl items-stretch justify-around px-2 pt-2">
            <AdultNavLinks layout="bottom" />
          </div>
        </nav>
      </div>
    </div>
  );
}
