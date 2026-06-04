import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import type { NavigateFunction } from 'react-router-dom';
import { compactFutureInstancesIfNeeded } from '@/infrastructure/database/database-maintenance.service';
import { syncInstanceWindow } from '@/infrastructure/database/instance-window-sync';
import { syncActiveProfileNotificationsNextDays } from '@/infrastructure/notifications/notification-sync';
import { refreshNativeStatusBar } from '@/infrastructure/mobile/status-bar.service';
import { i18n } from '@/i18n';
import { settingsRepository } from '@/infrastructure/repositories';
import { useAppStore } from '@/store/app.store';
import { todayISODate } from '@/utils/today';

type PathnameResolver = () => string;

let pathnameResolver: PathnameResolver = () => '/';
let navigateRef: NavigateFunction | null = null;
let lifecycleStarted = false;

export function registerAndroidNavigation(
  navigate: NavigateFunction,
  getPathname: PathnameResolver,
): void {
  navigateRef = navigate;
  pathnameResolver = getPathname;
}

function getNavigate(): NavigateFunction | null {
  return navigateRef;
}

function getPathname(): string {
  return pathnameResolver();
}

async function handleForegroundResume(): Promise<void> {
  const store = useAppStore.getState();
  const today = todayISODate();

  if (store.selectedDate !== today) {
    store.setSelectedDate(today);
  }

  if (!store.isAdultSessionValid()) {
    store.lockAdultSession();
  }

  try {
    const settings = await settingsRepository.getOrCreateAppSettings();
    if (settings.activeProfileId) {
      syncInstanceWindow(settings.activeProfileId);
    }
    await compactFutureInstancesIfNeeded();
  } catch (err) {
    console.warn('[android-lifecycle] maintenance on resume failed:', err);
  }

  syncActiveProfileNotificationsNextDays();
  void refreshNativeStatusBar();
}

function handleBackButton(): void {
  const navigate = getNavigate();
  if (!navigate) return;

  const pathname = getPathname();

  if (pathname === '/adult/unlock') {
    navigate('/child', { replace: true });
    return;
  }

  if (pathname === '/child' || pathname === '/child/day') {
    const shouldExit = window.confirm(i18n.t('mobile.exitConfirm'));
    if (shouldExit) {
      void App.exitApp();
    }
    return;
  }

  if (pathname === '/onboarding') {
    void App.exitApp();
    return;
  }

  if (window.history.length > 1) {
    navigate(-1);
    return;
  }

  const userMode = useAppStore.getState().userMode;
  navigate(userMode === 'child' ? '/child' : '/agenda', { replace: true });
}

/**
 * Registers Capacitor App listeners for foreground resume and Android back button.
 * Safe to call once; no-op on web.
 */
export function startAndroidLifecycleService(): void {
  if (lifecycleStarted || !Capacitor.isNativePlatform()) return;
  lifecycleStarted = true;

  void App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      void handleForegroundResume();
    }
  });

  void App.addListener('backButton', () => {
    handleBackButton();
  });
}

export async function runForegroundMaintenance(): Promise<void> {
  await handleForegroundResume();
}
