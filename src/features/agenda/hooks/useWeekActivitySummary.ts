import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { ActivityStatus } from '@/domain/enums';
import { activityRepository } from '@/infrastructure/repositories';
import {
  addDays,
  formatShortWeekday,
  getDayNumber,
  getStartOfWeek,
  getWeekDays,
  isToday,
} from '@/utils/date';

export interface WeekDaySummary {
  date: string;
  weekdayLabel: string;
  dayNumber: number;
  isToday: boolean;
  isSelected: boolean;
  totalActivities: number;
  completedActivities: number;
  hasActivities: boolean;
}

export function useWeekActivitySummary(profileId: string | null, selectedDate: string) {
  const weekStart = useMemo(() => getStartOfWeek(selectedDate), [selectedDate]);
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  const instances = useLiveQuery(
    async () => {
      if (!profileId) return [];
      const rows = await activityRepository.getInstancesByDateRange(
        profileId,
        weekStart,
        weekEnd,
      );
      return rows.filter((i) => !i.deletedAt);
    },
    [profileId, weekStart, weekEnd],
    [],
  );

  const isLoading = instances === undefined;

  const days: WeekDaySummary[] = useMemo(() => {
    const weekDays = getWeekDays(selectedDate);
    const byDate = new Map<string, { total: number; completed: number }>();

    for (const instance of instances ?? []) {
      const entry = byDate.get(instance.date) ?? { total: 0, completed: 0 };
      entry.total += 1;
      if (instance.status === ActivityStatus.Completed) {
        entry.completed += 1;
      }
      byDate.set(instance.date, entry);
    }

    return weekDays.map((date) => {
      const stats = byDate.get(date) ?? { total: 0, completed: 0 };
      return {
        date,
        weekdayLabel: formatShortWeekday(date),
        dayNumber: getDayNumber(date),
        isToday: isToday(date),
        isSelected: date === selectedDate,
        totalActivities: stats.total,
        completedActivities: stats.completed,
        hasActivities: stats.total > 0,
      };
    });
  }, [instances, selectedDate]);

  return { days, weekStart, weekEnd, isLoading };
}
