import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyPin } from '@/domain/services/pin.service';
import { PinDots, PinKeypad } from '@/features/adult-mode/components/PinKeypad';
import { settingsRepository } from '@/infrastructure/repositories';
import { useAppStore } from '@/store/app.store';
import { cn } from '@/utils/cn';

const PIN_LENGTH = 4;

export function AdultUnlockPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const unlockAdultSession = useAppStore((s) => s.unlockAdultSession);
  const enterAdultMode = useAppStore((s) => s.enterAdultMode);
  const adultPinHash = useAppStore((s) => s.adultPinHash);
  const requirePinForAdultMode = useAppStore((s) => s.requirePinForAdultMode);

  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const returnTo =
    (location.state as { from?: string } | null)?.from && typeof (location.state as { from?: string }).from === 'string'
      ? (location.state as { from: string }).from
      : '/adult';

  useEffect(() => {
    async function redirectIfUnneeded(): Promise<void> {
      const settings = await settingsRepository.getOrCreateAppSettings();
      const hash = settings.adultPinHash ?? adultPinHash;
      const required = settings.requirePinForAdultMode ?? requirePinForAdultMode;
      if (!hash || !required) {
        enterAdultMode();
        navigate(returnTo, { replace: true });
      }
    }
    void redirectIfUnneeded();
  }, [adultPinHash, enterAdultMode, navigate, requirePinForAdultMode, returnTo]);

  const tryUnlock = useCallback(
    async (value: string) => {
      setIsVerifying(true);
      setError(null);
      try {
        const settings = await settingsRepository.getOrCreateAppSettings();
        const hash = settings.adultPinHash;
        if (!hash) {
          enterAdultMode();
          navigate(returnTo, { replace: true });
          return;
        }

        const ok = await verifyPin(value, hash);
        if (!ok) {
          setError(t('pin.wrong'));
          setPin('');
          return;
        }

        unlockAdultSession();
        enterAdultMode();
        navigate(returnTo, { replace: true });
      } catch (err) {
        console.error('[AdultUnlockPage]', err);
        setError(t('pin.verifyFailed'));
        setPin('');
      } finally {
        setIsVerifying(false);
      }
    },
    [enterAdultMode, navigate, returnTo, t, unlockAdultSession],
  );

  function handleDigit(digit: string): void {
    if (isVerifying || pin.length >= PIN_LENGTH) return;
    const next = pin + digit;
    setPin(next);
    setError(null);
    if (next.length === PIN_LENGTH) {
      void tryUnlock(next);
    }
  }

  function handleDelete(): void {
    if (isVerifying) return;
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  }

  function handleBack(): void {
    setPin('');
    setError(null);
    navigate('/child', { replace: true });
  }

  return (
    <div className="safe-top safe-x safe-bottom flex min-h-full flex-col bg-[var(--color-bg)] px-4 py-10">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center">
        <h1 className="text-center text-2xl font-bold text-slate-900 md:text-3xl">
          {t('pin.unlockTitle')}
        </h1>
        <p className="mt-2 text-center text-slate-600">{t('pin.unlockSubtitle')}</p>

        <PinDots filled={pin.length} length={PIN_LENGTH} className="mt-10" />

        {error && (
          <p className="mt-4 text-center text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        )}

        <PinKeypad
          className={cn('mt-8', isVerifying && 'opacity-60')}
          onDigit={handleDigit}
          onDelete={handleDelete}
          disabled={isVerifying}
        />
      </div>

      <div className="mx-auto mt-10 w-full max-w-sm shrink-0">
        <button
          type="button"
          onClick={handleBack}
          aria-label={t('pin.backAria')}
          className={cn(
            'a11y-focus-ring a11y-btn-touch flex min-h-14 w-full items-center justify-center gap-2',
            'rounded-2xl bg-white text-base font-semibold text-slate-700 ring-1 ring-slate-200',
            'hover:bg-slate-50',
          )}
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
          {t('pin.back')}
        </button>
      </div>
    </div>
  );
}
