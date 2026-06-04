import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/app.store';

export function LockAdultModeButton({ className }: { className?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const lockAdultSession = useAppStore((s) => s.lockAdultSession);
  const enterChildMode = useAppStore((s) => s.enterChildMode);
  const adultPinHash = useAppStore((s) => s.adultPinHash);
  const requirePinForAdultMode = useAppStore((s) => s.requirePinForAdultMode);

  if (!adultPinHash || !requirePinForAdultMode) {
    return null;
  }

  function handleLock(): void {
    lockAdultSession();
    enterChildMode();
    navigate('/child', { replace: true });
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className={className}
      onClick={handleLock}
    >
      <Lock className="h-5 w-5" aria-hidden />
      {t('adultMode.lock')}
    </Button>
  );
}
