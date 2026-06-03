import { Star } from 'lucide-react';
import type { WeeklyProgress } from '@/domain/services/progress.service';
import {
  getWeeklyProgressAriaLabel,
  getWeeklyProgressDaysSummary,
  getWeeklyProgressMessage,
  getWeeklyProgressSummary,
  showWeeklyEncouragement,
} from '@/domain/services/progress.service';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

interface WeeklyProgressCardProps {
  progress: WeeklyProgress;
  isLoading?: boolean;
}

export function WeeklyProgressCard({ progress, isLoading = false }: WeeklyProgressCardProps) {
  const message = getWeeklyProgressMessage(progress);
  const summary = getWeeklyProgressSummary(progress);
  const daysSummary = getWeeklyProgressDaysSummary(progress);
  const ariaLabel = getWeeklyProgressAriaLabel(progress);
  const percent = Math.round(progress.weeklyCompletionRate * 100);
  const showStar = showWeeklyEncouragement(progress);

  if (isLoading) {
    return (
      <Card padding="lg" className="animate-pulse">
        <div className="h-4 w-48 rounded bg-slate-200" />
        <div className="mt-4 h-4 w-full rounded-full bg-slate-100" />
      </Card>
    );
  }

  if (progress.totalActivities === 0) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-base text-slate-600">No hay actividades esta semana</p>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          {showStar && (
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-500"
              aria-hidden
            >
              <Star className="h-7 w-7" fill="currentColor" strokeWidth={1.5} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-slate-900">{message}</h3>
            <p className="mt-1 text-sm text-slate-600">{summary}</p>
            {daysSummary && (
              <p className="mt-1 text-sm font-medium text-[var(--color-primary)]">{daysSummary}</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm font-medium text-slate-600">
            <span>
              {progress.completedActivities} / {progress.totalActivities}
            </span>
            <span>{percent}%</span>
          </div>
          <div
            className="mt-2 h-4 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label={ariaLabel}
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={cn(
                'h-full rounded-full bg-[var(--color-primary)] transition-all duration-500',
                percent === 100 && 'bg-emerald-500',
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="sr-only">{ariaLabel}</p>
        </div>
      </div>
    </Card>
  );
}
