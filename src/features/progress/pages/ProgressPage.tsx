import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DailyProgressCard } from '@/features/progress/components/DailyProgressCard';
import { WeeklyProgressCard } from '@/features/progress/components/WeeklyProgressCard';
import { WeeklyProgressDays } from '@/features/progress/components/WeeklyProgressDays';
import { useDailyProgress } from '@/features/progress/hooks/useDailyProgress';
import { useWeeklyProgress } from '@/features/progress/hooks/useWeeklyProgress';
import { useAppStore } from '@/store/app.store';
import { useDevice } from '@/hooks/useDevice';
import { addDays, getStartOfWeek, getWeekDays } from '@/utils/date';
import { formatDisplayDate } from '@/utils/formatDate';
import { todayISODate } from '@/utils/today';
import { cn } from '@/utils/cn';

function formatWeekRange(startDate: string, endDate: string): string {
  const start = formatDisplayDate(startDate);
  const end = formatDisplayDate(endDate);
  return `${start} — ${end}`;
}

export function ProgressPage() {
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const selectedDate = useAppStore((s) => s.selectedDate);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const userMode = useAppStore((s) => s.userMode);
  const { isEffectiveTablet } = useDevice();

  const [weekAnchorDate, setWeekAnchorDate] = useState(selectedDate);

  const isToday = selectedDate === todayISODate();
  const currentWeekStart = getStartOfWeek(todayISODate());
  const viewedWeekStart = getStartOfWeek(weekAnchorDate);
  const isCurrentWeek = viewedWeekStart === currentWeekStart;

  const { progress, isLoading: isDailyLoading } = useDailyProgress(
    activeProfileId,
    selectedDate,
  );

  const { weeklyProgress, isLoading: isWeeklyLoading } = useWeeklyProgress(
    activeProfileId,
    weekAnchorDate,
  );

  const weekLabel = useMemo(() => {
    if (weeklyProgress.startDate && weeklyProgress.endDate) {
      return formatWeekRange(weeklyProgress.startDate, weeklyProgress.endDate);
    }
    const days = getWeekDays(weekAnchorDate);
    return formatWeekRange(days[0]!, days[6]!);
  }, [weekAnchorDate, weeklyProgress.endDate, weeklyProgress.startDate]);

  function goToPreviousWeek(): void {
    setWeekAnchorDate((d) => addDays(getStartOfWeek(d), -7));
  }

  function goToNextWeek(): void {
    setWeekAnchorDate((d) => addDays(getStartOfWeek(d), 7));
  }

  function goToCurrentWeek(): void {
    const today = todayISODate();
    setWeekAnchorDate(today);
    setSelectedDate(today);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Progreso</h2>
        <p className="mt-1 text-slate-600">
          {isToday
            ? 'Resumen de hoy y de la semana, calculado desde tu agenda.'
            : `Resumen del ${formatDisplayDate(selectedDate)}.`}
        </p>
      </div>

      <div
        className={cn(
          isEffectiveTablet ? 'grid grid-cols-2 items-start gap-6 md:gap-8' : 'space-y-6',
        )}
      >
        <section aria-label="Progreso diario">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Hoy
          </h3>
          <DailyProgressCard progress={progress} userMode={userMode} isLoading={isDailyLoading} />
        </section>

        <section aria-label="Resumen semanal" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Semana
              </h3>
              <p className="mt-1 text-sm capitalize text-slate-600">{weekLabel}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                className="min-h-11 gap-1 px-3"
                onClick={goToPreviousWeek}
                aria-label="Semana anterior"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
                Anterior
              </Button>
              {!isCurrentWeek && (
                <Button variant="ghost" className="min-h-11" onClick={goToCurrentWeek}>
                  Esta semana
                </Button>
              )}
              <Button
                variant="secondary"
                className="min-h-11 gap-1 px-3"
                onClick={goToNextWeek}
                aria-label="Semana siguiente"
              >
                Siguiente
                <ChevronRight className="h-5 w-5" aria-hidden />
              </Button>
            </div>
          </div>

          <WeeklyProgressCard progress={weeklyProgress} isLoading={isWeeklyLoading} />
        </section>
      </div>

      <section aria-label="Desglose semanal por días">
        <WeeklyProgressDays days={weeklyProgress.days} />
      </section>
    </div>
  );
}
