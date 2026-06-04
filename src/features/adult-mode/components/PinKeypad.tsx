import { Delete } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';

interface PinKeypadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  disabled?: boolean;
  className?: string;
}

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'] as const;

const keySizeClass = 'size-[4.25rem] md:size-[4.75rem]';

const digitButtonClass = cn(
  keySizeClass,
  'a11y-focus-ring flex shrink-0 items-center justify-center rounded-full',
  'bg-white text-3xl font-semibold tabular-nums text-slate-800 md:text-4xl',
  'shadow-md ring-1 ring-slate-200/90',
  'transition-transform hover:bg-slate-50 active:scale-95',
  'disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100',
);

const deleteButtonClass = cn(
  keySizeClass,
  'a11y-focus-ring flex shrink-0 items-center justify-center rounded-full',
  'bg-slate-100 text-slate-600',
  'shadow-sm ring-1 ring-slate-200/80',
  'transition-transform hover:bg-slate-200 active:scale-95',
  'disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100',
);

export function PinKeypad({ onDigit, onDelete, disabled = false, className }: PinKeypadProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn('mx-auto grid w-fit grid-cols-3 gap-x-5 gap-y-4', className)}
      role="group"
      aria-label={t('pin.keypadAria')}
    >
      {DIGITS.map((key, index) => {
        if (key === '') {
          return <div key={`spacer-${index}`} className={keySizeClass} aria-hidden />;
        }

        if (key === 'delete') {
          return (
            <button
              key="delete"
              type="button"
              disabled={disabled}
              onClick={onDelete}
              aria-label={t('pin.deleteDigit')}
              className={deleteButtonClass}
            >
              <Delete className="h-7 w-7 md:h-8 md:w-8" aria-hidden />
            </button>
          );
        }

        return (
          <button
            key={key}
            type="button"
            disabled={disabled}
            onClick={() => onDigit(key)}
            aria-label={t('pin.digit', { digit: key })}
            className={digitButtonClass}
          >
            <span aria-hidden>{key}</span>
          </button>
        );
      })}
    </div>
  );
}

interface PinDotsProps {
  length: number;
  filled: number;
  className?: string;
}

export function PinDots({ length, filled, className }: PinDotsProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn('flex items-center justify-center gap-4', className)}
      role="status"
      aria-label={t('pin.digitsEntered', { filled, length })}
    >
      {Array.from({ length }, (_, index) => (
        <span
          key={index}
          className={cn(
            'h-5 w-5 rounded-full ring-2 transition-colors',
            index < filled
              ? 'scale-110 bg-[var(--color-primary)] ring-[var(--color-primary)]'
              : 'bg-white ring-slate-300',
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}
