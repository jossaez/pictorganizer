import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { isAdultPinRequired } from '@/domain/services/adult-pin.utils';
import { settingsRepository } from '@/infrastructure/repositories';
import { useAppStore } from '@/store/app.store';

/**
 * Protects adult-only routes when a PIN is configured and active.
 * Allows /profiles when no active profile is selected (initial pick).
 */
export function AdultRouteGuard() {
  const location = useLocation();
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const isAdultSessionValid = useAppStore((s) => s.isAdultSessionValid);
  const lockAdultSession = useAppStore((s) => s.lockAdultSession);

  const settings = useLiveQuery(() => settingsRepository.getOrCreateAppSettings(), []);

  useEffect(() => {
    if (!isAdultSessionValid()) {
      lockAdultSession();
    }
  }, [isAdultSessionValid, lockAdultSession, location.pathname]);

  if (settings === undefined) {
    return null;
  }

  const profilePickWithoutActive =
    location.pathname === '/profiles' && !activeProfileId;

  if (profilePickWithoutActive) {
    return <Outlet />;
  }

  if (isAdultPinRequired(settings) && !isAdultSessionValid()) {
    return (
      <Navigate
        to="/adult/unlock"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <Outlet />;
}
