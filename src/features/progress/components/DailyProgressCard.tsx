import type { DailyProgress } from '@/domain/services/progress.service';
import {
  getDailyProgressAriaLabel,
  getDailyProgressMessage,
  getDailyProgressSummary,
} from '@/domain/services/progress.service';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

interface DailyProgressCardProps {
  progress: DailyProgress;
  userMode?: 'child' | 'adult';
  isLoading?: boolean;
}

export function DailyProgressCard({
  progress,
  userMode = 'adult',
  isLoading = false,
}: DailyProgressCardProps) {
  const isChildMode = userMode === 'child';
  const message = getDailyProgressMessage(progress);
  const summary = getDailyProgressSummary(progress);
  const ariaLabel = getDailyProgressAriaLabel(progress);
  const percent = Math.round(progress.completionRate * 100);

  if (isLoading) {
    return (
      <Card padding="lg" className="animate-pulse">
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="mt-4 h-4 w-full rounded-full bg-slate-100" />
      </Card>
    );
  }

  if (progress.total === 0) {
    return (
      <Card padding="lg" className="text-center">
        <p className={cn('text-slate-600', isChildMode ? 'text-lg' : 'text-base')}>
          No hay actividades programadas hoy
        </p>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="space-y-4">
        <div>
          <h3
            className={cn(
              'font-bold text-slate-900',
              isChildMode ? 'text-xl' : 'text-lg',
            )}
          >
            {message}
          </h3>
          <p
            className={cn(
              'mt-1 text-slate-600',
              isChildMode ? 'text-base' : 'text-sm',
            )}
          >
            {isChildMode
              ? progress.isComplete
                ? 'Todas hechas'
                : `${progress.completed} de ${progress.total}`
              : summary}
          </p>
        </div>

        <div>
          <div
            className={cn(
              'flex items-center justify-between text-sm font-medium text-slate-600',
              isChildMode && 'text-base',
            )}
          >
            <span>{progress.completed} / {progress.total}</span>
            <span>{percent}%</span>
          </div>
          <div
            className={cn(
              'mt-2 overflow-hidden rounded-full bg-slate-100',
              isChildMode ? 'h-5' : 'h-3',
            )}
            role="progressbar"
            aria-label={ariaLabel}
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={cn(
                'h-full rounded-full bg-[var(--color-primary)] transition-all duration-500',
                progress.isComplete && 'bg-emerald-500',
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="sr-only">{ariaLabel}</p>
        </div>

        {!isChildMode && (
          <ul className="grid grid-cols-2 gap-2 text-sm text-slate-600 sm:grid-cols-4">
            <li>
              <span className="font-semibold text-emerald-700">{progress.completed}</span>{' '}
              completadas
            </li>
            <li>
              <span className="font-semibold text-slate-700">{progress.pending}</span> pendientes
            </li>
            <li>
              <span className="font-semibold text-amber-700">{progress.skipped}</span> saltadas
            </li>
            <li>
              <span className="font-semibold text-red-600">{progress.missed}</span> no realizadas
            </li>
          </ul>
        )}
      </div>
    </Card>
  );
}
