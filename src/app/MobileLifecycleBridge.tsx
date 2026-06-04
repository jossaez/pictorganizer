import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  registerAndroidNavigation,
  startAndroidLifecycleService,
} from '@/infrastructure/mobile/android-lifecycle.service';
import { configureNativeStatusBar, refreshNativeStatusBar } from '@/infrastructure/mobile/status-bar.service';

/** Wires Capacitor lifecycle + Android back button to React Router. */
export function MobileLifecycleBridge() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    registerAndroidNavigation(navigate, () => location.pathname);
  }, [location.pathname, navigate]);

  useEffect(() => {
    void configureNativeStatusBar();
    startAndroidLifecycleService();
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void refreshNativeStatusBar();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  return null;
}
