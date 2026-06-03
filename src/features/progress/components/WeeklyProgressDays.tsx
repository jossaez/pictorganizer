import type { DailyProgress } from '@/domain/services/progress.service';
import { getWeeklyDayAriaLabel } from '@/domain/services/progress.service';
import { useDevice } from '@/hooks/useDevice';
import { formatDayLabel, formatShortWeekday, getDayNumber, isToday } from '@/utils/date';
import { cn } from '@/utils/cn';

interface WeeklyProgressDaysProps {
  days: DailyProgress[];
}

function DayProgressBar({ day }: { day: DailyProgress }) {
  const percent = Math.round(day.completionRate * 100);
  const ariaLabel = day.date ? formatDayLabel(day.date) : '';
  const fullAriaLabel = getWeeklyDayAriaLabel(day, formatDayLabel);

  return (
    <div
      className={cn(
        'rounded-2xl bg-white p-4 ring-1',
        day.isComplete && day.total > 0 ? 'ring-emerald-200' : 'ring-slate-100',
        day.date && isToday(day.date) && 'ring-2 ring-blue-200',
      )}
      aria-label={fullAriaLabel}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {day.date ? formatShortWeekday(day.date) : '—'}
          </p>
          <p className="text-lg font-bold text-slate-900">
            {day.date ? getDayNumber(day.date) : '—'}
          </p>
        </div>
        <div className="text-right">
          {day.total === 0 ? (
            <p className="text-sm text-slate-400">Sin actividades</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-900">
                {day.completed} / {day.total}
              </p>
              <p className="text-xs text-slate-500">{percent}%</p>
            </>
          )}
        </div>
      </div>

      {day.total > 0 && (
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label={fullAriaLabel}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              day.isComplete ? 'bg-emerald-500' : 'bg-[var(--color-primary)]',
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      <p className="sr-only">
        {ariaLabel}: {fullAriaLabel}
      </p>
    </div>
  );
}

export function WeeklyProgressDays({ days }: WeeklyProgressDaysProps) {
  const { isEffectiveTablet } = useDevice();

  if (days.length === 0) return null;

  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Día a día
      </h3>
      <div
        className={cn(
          'grid gap-3',
          isEffectiveTablet ? 'grid-cols-7 gap-2 lg:gap-3' : 'grid-cols-1',
        )}
      >
        {days.map((day) => (
          <DayProgressBar key={day.date} day={day} />
        ))}
      </div>
    </div>
  );
}
