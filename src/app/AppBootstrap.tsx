import { useEffect, useState, type ReactNode } from 'react';
import { initApp } from './initApp';
import { DatabaseErrorState } from '@/components/feedback/DatabaseErrorState';
import { syncActiveProfileNotificationsNextDays } from '@/infrastructure/notifications/notification-sync';
import { useAppStore } from '@/store/app.store';

type BootstrapStatus = 'loading' | 'ready' | 'error';

interface AppBootstrapProps {
  children: ReactNode;
}

function LoadingScreen() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-[var(--color-bg)] px-6">
      <div className="h-10 w-10 animate-pulse rounded-full bg-[var(--color-primary)]/30" />
      <p className="mt-4 text-slate-600">Cargando PICTORGANIZER…</p>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <DatabaseErrorState
      title="No se pudo iniciar la app"
      message={message}
      onRetry={onRetry}
      showSettingsLink={false}
    />
  );
}

export function AppBootstrap({ children }: AppBootstrapProps) {
  const [status, setStatus] = useState<BootstrapStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const hydrateFromSettings = useAppStore((s) => s.hydrateFromSettings);
  const setBootstrapped = useAppStore((s) => s.setBootstrapped);
  const enterChildMode = useAppStore((s) => s.enterChildMode);
  const lockAdultSession = useAppStore((s) => s.lockAdultSession);

  async function bootstrap(): Promise<void> {
    setStatus('loading');
    setErrorMessage('');

    const result = await initApp();

    if (result.ok) {
      hydrateFromSettings(result.settings);
      enterChildMode();
      lockAdultSession();
      setBootstrapped(true);
      setStatus('ready');
      if (result.seeded) {
        console.info('[bootstrap] Catalog seeded on first run');
      }
      syncActiveProfileNotificationsNextDays();
      return;
    }

    setErrorMessage(result.error);
    setStatus('error');
  }

  useEffect(() => {
    void bootstrap();
  }, []);

  if (status === 'loading') return <LoadingScreen />;
  if (status === 'error') {
    return <ErrorScreen message={errorMessage} onRetry={() => void bootstrap()} />;
  }

  return <>{children}</>;
}
