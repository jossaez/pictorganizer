import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  registerAndroidNavigation,
  startAndroidLifecycleService,
} from '@/infrastructure/mobile/android-lifecycle.service';

/** Wires Capacitor lifecycle + Android back button to React Router. */
export function MobileLifecycleBridge() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    registerAndroidNavigation(navigate, () => location.pathname);
  }, [location.pathname, navigate]);

  useEffect(() => {
    startAndroidLifecycleService();
  }, []);

  return null;
}
