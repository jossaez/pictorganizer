import { Outlet } from 'react-router-dom';
import { useProfiles } from '@/features/profiles/hooks/useProfiles';
import { useAppStore } from '@/store/app.store';
import { BottomNav } from './BottomNav';
import { cn } from '@/utils/cn';

export function AppShell() {
  const { activeProfile } = useProfiles();
  const userMode = useAppStore((s) => s.userMode);
  const largeText = useAppStore((s) => s.largeText);

  return (
    <div className={cn('safe-top safe-x flex min-h-full flex-col bg-[var(--color-bg)]', largeText && 'text-lg')}>
      <header className="app-shell-header sticky top-0 z-40 border-b border-slate-200/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 md:max-w-5xl md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
              PICTORGANIZER
            </p>
            <h1 className="text-lg font-bold text-slate-900">
              {activeProfile ? `Hola, ${activeProfile.name}` : 'Agenda visual'}
            </h1>
          </div>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium',
              userMode === 'adult' ? 'bg-violet-100 text-violet-800' : 'bg-blue-100 text-blue-800',
            )}
          >
            {userMode === 'adult' ? 'Modo adulto' : 'Modo niño'}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5 pb-28 md:max-w-5xl md:px-6 md:py-6 md:pb-28">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
