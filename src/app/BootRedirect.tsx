import { Navigate } from 'react-router-dom';
import { useAppStore } from '@/store/app.store';

export function BootRedirect() {
  const isBootstrapped = useAppStore((s) => s.isBootstrapped);
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const userMode = useAppStore((s) => s.userMode);

  if (!isBootstrapped) {
    return null;
  }

  if (!onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!activeProfileId) {
    return <Navigate to="/profiles" replace />;
  }

  if (userMode === 'child') {
    return <Navigate to="/child" replace />;
  }

  return <Navigate to="/agenda" replace />;
}
