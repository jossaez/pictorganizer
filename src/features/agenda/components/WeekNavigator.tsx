import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useWeekActivitySummary } from '@/features/agenda/hooks/useWeekActivitySummary';
import type { WeekDaySummary } from '@/features/agenda/hooks/useWeekActivitySummary';
import { useAppStore } from '@/store/app.store';
import { useAccessibility } from '@/hooks/useAccessibility';
import { formatDayLabel } from '@/utils/date';
import { todayISODate } from '@/utils/today';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';

interface WeekNavigatorProps {
  profileId: string;
  selectedDate: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

function buildAriaLabel(
  day: WeekDaySummary,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string {
  const parts = [formatDayLabel(day.date)];
  if (day.hasActivities) {
    parts.push(
      t('agenda.dayAriaActivities', { count: day.totalActivities }),
      t('agenda.dayAriaCompleted', { count: day.completedActivities }),
    );
  } else {
    parts.push(t('agenda.dayAriaEmpty'));
  }
  if (day.isToday) parts.push(t('agenda.today'));
  if (day.isSelected) parts.push(t('agenda.dayAriaSelected'));
  return parts.join(', ');
}

function DayButton({
  day,
  onSelect,
  variant,
  buttonRef,
  largeText,
  t,
}: {
  day: WeekDaySummary;
  onSelect: (date: string) => void;
  variant: 'compact' | 'expanded';
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  largeText: boolean;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const isCompact = variant === 'compact';

  return (
    <button
      ref={day.isSelected ? buttonRef : undefined}
      type="button"
      onClick={() => onSelect(day.date)}
      aria-label={buildAriaLabel(day, t)}
      aria-current={day.isSelected ? 'date' : undefined}
      aria-selected={day.isSelected}
      className={cn(
        'a11y-focus-ring flex flex-col items-center rounded-2xl touch-manipulation',
        isCompact
          ? cn('min-w-[3.75rem] shrink-0 px-3 py-2.5', largeText ? 'min-h-[5rem]' : 'min-h-[4.5rem]')
          : cn('w-full px-2 py-3', largeText ? 'min-h-[6.5rem]' : 'min-h-[5.5rem]'),
        day.isSelected
          ? 'a11y-selected bg-[var(--color-primary)] text-white shadow-md ring-2 ring-[var(--color-primary)]'
          : day.isToday
            ? 'bg-blue-50 text-slate-900 ring-2 ring-blue-200'
            : day.hasActivities
              ? 'bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50'
              : 'bg-slate-50/80 text-slate-500 ring-1 ring-slate-100 hover:bg-white',
      )}
    >
      <span className={cn('font-semibold uppercase tracking-wide opacity-90', largeText ? 'text-sm' : 'text-xs')}>
        {day.weekdayLabel}
      </span>
      <span className={cn('mt-0.5 font-bold', isCompact ? (largeText ? 'text-xl' : 'text-lg') : largeText ? 'text-3xl' : 'text-2xl')}>
        {day.dayNumber}
      </span>

      {day.isToday && (
        <span
          className={cn(
            'mt-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase',
            day.isSelected ? 'opacity-90' : 'bg-blue-200 text-blue-800',
          )}
        >
          {t('agenda.today')}
        </span>
      )}

      {!isCompact && day.hasActivities && (
        <span
          className={cn(
            'mt-2 text-center text-[10px] font-medium leading-snug',
            day.isSelected ? 'text-white/90' : 'text-slate-500',
          )}
        >
          {t('agenda.dayActivityCount', { count: day.totalActivities })}
          {day.completedActivities > 0 && (
            <span className={cn('block', day.isSelected ? 'opacity-90' : 'text-emerald-600')}>
              {t('agenda.dayCompletedCount', { count: day.completedActivities })}
            </span>
          )}
        </span>
      )}

      {isCompact && day.hasActivities && (
        <span
          className={cn(
            'mt-1.5 h-1.5 w-1.5 rounded-full',
            day.isSelected ? 'bg-white' : 'bg-[var(--color-primary)]/80',
          )}
          aria-hidden
        />
      )}
    </button>
  );
}

export function WeekNavigator({
  profileId,
  selectedDate,
  onPreviousWeek,
  onNextWeek,
  onToday,
}: WeekNavigatorProps) {
  const { t } = useTranslation();
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const { days, isLoading } = useWeekActivitySummary(profileId, selectedDate);
  const { largeText, reduceMotion } = useAccessibility();
  const selectedRef = useRef<HTMLButtonElement>(null);
  const isOnToday = selectedDate === todayISODate();

  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [selectedDate, reduceMotion]);

  function selectDay(date: string): void {
    setSelectedDate(date);
  }

  return (
    <nav className="space-y-3" aria-label={t('agenda.weekNavAria')}>
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="secondary"
          className="a11y-focus-ring min-h-10 px-3"
          onClick={onPreviousWeek}
          aria-label={t('progress.weekPreviousAria')}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </Button>

        <Button
          variant={isOnToday ? 'secondary' : 'primary'}
          className={cn('a11y-focus-ring min-h-10 gap-1.5 text-sm', isOnToday && 'opacity-60')}
          onClick={onToday}
          disabled={isOnToday}
          aria-label={t('agenda.goToTodayAria')}
        >
          <CalendarDays className="h-4 w-4" aria-hidden />
          {t('agenda.today')}
        </Button>

        <Button
          variant="secondary"
          className="a11y-focus-ring min-h-10 px-3"
          onClick={onNextWeek}
          aria-label={t('progress.weekNextAria')}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </Button>
      </div>

      {isLoading ? (
        <p className="text-center text-sm text-slate-500">{t('agenda.weekLoading')}</p>
      ) : (
        <>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:hidden" role="list">
            {days.map((day) => (
              <div key={day.date} role="listitem">
                <DayButton
                  day={day}
                  onSelect={selectDay}
                  variant="compact"
                  buttonRef={selectedRef}
                  largeText={largeText}
                  t={t}
                />
              </div>
            ))}
          </div>

          <div className="hidden gap-2 md:grid md:grid-cols-7" role="list">
            {days.map((day) => (
              <div key={day.date} role="listitem">
                <DayButton
                  day={day}
                  onSelect={selectDay}
                  variant="expanded"
                  buttonRef={selectedRef}
                  largeText={largeText}
                  t={t}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </nav>
  );
}
