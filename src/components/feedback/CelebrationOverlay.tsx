import { useEffect } from 'react';
import { CelebrationStyle } from '@/domain/enums';
import { CelebrationIcon } from '@/components/feedback/CelebrationIcon';
import { useAppStore } from '@/store/app.store';
import { useUiStore } from '@/store/ui.store';
import { useAccessibility } from '@/hooks/useAccessibility';
import { cn } from '@/utils/cn';

const AUTO_DISMISS_MS = {
  child: 1800,
  adult: 2000,
} as const;

export function CelebrationOverlay() {
  const celebration = useUiStore((s) => s.celebration);
  const hideCelebration = useUiStore((s) => s.hideCelebration);
  const userMode = useAppStore((s) => s.userMode);
  const { reduceMotion, largeText, text } = useAccessibility();

  const isChildMode = userMode === 'child';
  const isVisible = celebration?.visible === true && celebration.type !== CelebrationStyle.None;

  useEffect(() => {
    if (!isVisible) return;
    const duration = isChildMode ? AUTO_DISMISS_MS.child : AUTO_DISMISS_MS.adult;
    const timer = window.setTimeout(() => hideCelebration(), duration);
    return () => window.clearTimeout(timer);
  }, [isVisible, hideCelebration, isChildMode, celebration?.message]);

  useEffect(() => {
    if (!isVisible) return;
    function onKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') hideCelebration();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isVisible, hideCelebration]);

  if (!isVisible || !celebration) return null;

  function handleDismiss(): void {
    hideCelebration();
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center p-6',
        'bg-black/25',
        !reduceMotion && 'celebration-backdrop-in',
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-message"
      onClick={handleDismiss}
    >
      <button
        type="button"
        className="sr-only a11y-focus-ring"
        onClick={handleDismiss}
        aria-label="Cerrar celebración"
      >
        Cerrar
      </button>

      <div
        className={cn(
          'relative flex flex-col items-center rounded-3xl bg-white text-center shadow-xl',
          isChildMode ? 'px-10 py-10 md:px-14 md:py-12' : 'px-8 py-8 md:px-10 md:py-9',
          !reduceMotion && 'celebration-panel-in',
        )}
        onClick={(e) => e.stopPropagation()}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <CelebrationIcon
          type={celebration.type}
          childMode={isChildMode}
          reduceMotion={reduceMotion}
        />
        <p
          id="celebration-message"
          className={cn(
            'font-bold text-slate-900',
            isChildMode
              ? cn('mt-6', largeText ? text['3xl'] : 'text-2xl md:text-3xl')
              : cn('mt-4', largeText ? text['2xl'] : 'text-xl md:text-2xl'),
          )}
        >
          {celebration.message}
        </p>
        {celebration.activityTitle && !isChildMode && (
          <p className="mt-2 text-sm text-slate-500">{celebration.activityTitle}</p>
        )}
      </div>
    </div>
  );
}
