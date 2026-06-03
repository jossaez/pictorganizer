import { Navigate } from 'react-router-dom';
import { useAppStore } from '@/store/app.store';

interface AdultOnlyGuardProps {
  children: React.ReactNode;
}

/** Redirects to Modo Niño when the active session is child-facing */
export function AdultOnlyGuard({ children }: AdultOnlyGuardProps) {
  const userMode = useAppStore((s) => s.userMode);

  if (userMode === 'child') {
    return <Navigate to="/child" replace />;
  }

  return children;
}
