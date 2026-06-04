import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { hashPin, verifyPin } from '@/domain/services/pin.service';
import { PinDots, PinKeypad } from '@/features/adult-mode/components/PinKeypad';
import { cn } from '@/utils/cn';

const PIN_LENGTH = 4;

type SetupPhase = 'enter' | 'confirm';

interface PinSetupFlowProps {
  title?: string;
  description?: string;
  onComplete: (pinHash: string) => void;
  className?: string;
}

export function PinSetupFlow({
  title,
  description,
  onComplete,
  className,
}: PinSetupFlowProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('pin.setupTitle');
  const resolvedDescription = description ?? t('pin.setupDescription');

  const [phase, setPhase] = useState<SetupPhase>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentPin = phase === 'enter' ? firstPin : confirmPin;

  const finishSetup = useCallback(
    async (confirmed: string) => {
      setIsSaving(true);
      setError(null);
      try {
        const pinHash = await hashPin(confirmed);
        onComplete(pinHash);
      } catch {
        setError(t('pin.setupSaveFailed'));
        setFirstPin('');
        setConfirmPin('');
        setPhase('enter');
      } finally {
        setIsSaving(false);
      }
    },
    [onComplete, t],
  );

  function handleDigit(digit: string): void {
    if (isSaving || currentPin.length >= PIN_LENGTH) return;

    if (phase === 'enter') {
      const next = firstPin + digit;
      setFirstPin(next);
      setError(null);
      if (next.length === PIN_LENGTH) {
        setPhase('confirm');
      }
      return;
    }

    const next = confirmPin + digit;
    setConfirmPin(next);
    setError(null);
    if (next.length === PIN_LENGTH) {
      if (next !== firstPin) {
        setError(t('pin.setupMismatch'));
        setFirstPin('');
        setConfirmPin('');
        setPhase('enter');
        return;
      }
      void finishSetup(next);
    }
  }

  function handleDelete(): void {
    if (isSaving) return;
    setError(null);
    if (phase === 'enter') {
      setFirstPin((prev) => prev.slice(0, -1));
    } else {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-xl font-bold text-slate-900">{resolvedTitle}</h2>
        <p className="mt-2 text-slate-600">{resolvedDescription}</p>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {phase === 'enter' ? t('pin.setupStep1') : t('pin.setupStep2')}
        </p>
      </div>

      <PinDots filled={currentPin.length} length={PIN_LENGTH} />

      {error && (
        <p className="text-center text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}

      <PinKeypad onDigit={handleDigit} onDelete={handleDelete} disabled={isSaving} />
    </div>
  );
}

interface PinVerifyFlowProps {
  title?: string;
  pinHash: string;
  onVerified: () => void;
}

export function PinVerifyFlow({
  title,
  pinHash,
  onVerified,
}: PinVerifyFlowProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('pin.verifyCurrent');

  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const tryVerify = useCallback(
    async (value: string) => {
      setIsVerifying(true);
      setError(null);
      const ok = await verifyPin(value, pinHash);
      setIsVerifying(false);
      if (!ok) {
        setError(t('pin.wrongShort'));
        setPin('');
        return;
      }
      onVerified();
    },
    [onVerified, pinHash, t],
  );

  function handleDigit(digit: string): void {
    if (isVerifying || pin.length >= PIN_LENGTH) return;
    const next = pin + digit;
    setPin(next);
    setError(null);
    if (next.length === PIN_LENGTH) {
      void tryVerify(next);
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">{resolvedTitle}</h3>
      <PinDots filled={pin.length} length={PIN_LENGTH} />
      {error && (
        <p className="text-center text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <PinKeypad
        onDigit={handleDigit}
        onDelete={() => setPin((p) => p.slice(0, -1))}
        disabled={isVerifying}
      />
    </div>
  );
}
