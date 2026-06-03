import { TimerStyle } from '@/domain/enums';
import { useVisualTimer } from '@/features/timer/hooks/useVisualTimer';
import { useAccessibility } from '@/hooks/useAccessibility';
import { cn } from '@/utils/cn';

export type VisualTimerVariant = 'bar' | 'circle' | 'blocks';

interface VisualTimerProps {
  startTimeMinutes: number;
  endTimeMinutes?: number | null;
  currentTimeMinutes: number;
  title?: string;
  variant?: VisualTimerVariant;
  reduceMotion?: boolean;
  compact?: boolean;
}

const BLOCK_COUNT = 8;

function timerStyleToVariant(style?: TimerStyle): VisualTimerVariant {
  if (style === TimerStyle.Clock) return 'circle';
  return 'bar';
}

export function profileTimerVariant(style?: TimerStyle): VisualTimerVariant {
  return timerStyleToVariant(style);
}

interface TimerBarProps {
  progress: number;
  reduceMotion: boolean;
  compact: boolean;
  status: string;
}

function TimerBar({ progress, reduceMotion, compact, status, largeText }: TimerBarProps & { largeText: boolean }) {
  const fillWidth = status === 'finished' ? 100 : progress;

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-full bg-slate-200',
        compact ? (largeText ? 'h-4' : 'h-3') : largeText ? 'h-7 md:h-8' : 'h-5 md:h-6',
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(fillWidth)}
    >
      <div
        className={cn(
          'h-full rounded-full bg-[var(--color-primary)]',
          !reduceMotion && 'transition-[width] duration-700 ease-out',
        )}
        style={{ width: `${fillWidth}%` }}
      />
    </div>
  );
}

interface TimerBlocksProps {
  progress: number;
  status: string;
  compact: boolean;
}

function TimerBlocks({ progress, status, compact, largeText }: TimerBlocksProps & { largeText: boolean }) {
  return (
    <div
      className={cn('flex flex-wrap gap-1.5 md:gap-2', compact && 'gap-1')}
      role="group"
      aria-label="Progreso en bloques"
    >
      {Array.from({ length: BLOCK_COUNT }, (_, index) => {
        const blockStart = (index / BLOCK_COUNT) * 100;
        const blockEnd = ((index + 1) / BLOCK_COUNT) * 100;
        const effectiveProgress = status === 'finished' ? 100 : progress;

        let state: 'done' | 'current' | 'empty' = 'empty';
        if (effectiveProgress >= blockEnd) state = 'done';
        else if (effectiveProgress > blockStart) state = 'current';

        return (
          <span
            key={index}
            className={cn(
              'rounded-lg',
              compact
                ? largeText
                  ? 'h-5 w-5'
                  : 'h-4 w-4 md:h-5 md:w-5'
                : largeText
                  ? 'h-8 w-8 md:h-10 md:w-10'
                  : 'h-6 w-6 md:h-8 md:w-8',
              state === 'done' && 'bg-emerald-500',
              state === 'current' && 'bg-amber-400',
              state === 'empty' && 'bg-slate-200',
            )}
            aria-hidden
          />
        );
      })}
    </div>
  );
}

function TimerCirclePlaceholder({ compact }: { compact: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500',
        compact ? 'h-12 w-12 text-xs' : 'h-20 w-20 text-sm md:h-24 md:w-24',
      )}
      aria-hidden
    >
      ◷
    </div>
  );
}

export function VisualTimer({
  startTimeMinutes,
  endTimeMinutes,
  currentTimeMinutes,
  title,
  variant = 'bar',
  reduceMotion: reduceMotionProp = false,
  compact = false,
}: VisualTimerProps) {
  const { largeText, reduceMotion: reduceMotionPref, text } = useAccessibility();
  const reduceMotion = reduceMotionProp || reduceMotionPref;
  const timer = useVisualTimer({ startTimeMinutes, endTimeMinutes, currentTimeMinutes });

  if (timer.status === 'invalid') {
    return (
      <div className={cn('rounded-2xl bg-slate-50 px-4 py-3', compact && 'px-3 py-2')}>
        <p className={cn('font-medium text-slate-600', compact ? 'text-sm' : largeText ? text.lg : 'text-base')}>
          {timer.message}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn('rounded-2xl bg-slate-50 px-4 py-3 md:px-5 md:py-4', compact && 'px-3 py-2')}
      aria-label={title ? `Temporizador de ${title}: ${timer.ariaLabel}` : timer.ariaLabel}
    >
      <p
        className={cn(
          'font-bold text-slate-800',
          compact ? 'text-sm' : largeText ? text.lg : 'text-base md:text-lg',
          timer.status === 'running' && 'text-[var(--color-primary)]',
          timer.status === 'finished' && 'text-emerald-700',
        )}
      >
        {timer.message}
      </p>

      <div className={cn('mt-3', compact && 'mt-2')}>
        {variant === 'blocks' && (
          <TimerBlocks progress={timer.progress} status={timer.status} compact={compact} largeText={largeText} />
        )}
        {variant === 'bar' && (
          <TimerBar
            progress={timer.progress}
            reduceMotion={reduceMotion}
            compact={compact}
            status={timer.status}
            largeText={largeText}
          />
        )}
        {variant === 'circle' && (
          <div className="flex items-center gap-4">
            <TimerCirclePlaceholder compact={compact} />
            {!compact && (
              <p className="text-sm text-slate-500">Vista circular próximamente</p>
            )}
          </div>
        )}
      </div>

      {!compact && !timer.hasDefinedEnd && (
        <p className="mt-2 text-xs text-slate-500">Duración estimada de 30 min</p>
      )}
    </div>
  );
}
