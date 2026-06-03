import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { enrichActivities } from '@/domain/services/activity-state.service';
import {
  calculateWeeklyProgress,
  type ActivitiesByDate,
  type WeeklyProgress,
} from '@/domain/services/progress.service';
import { useCurrentTimeMinutes } from '@/hooks/useCurrentTimeMinutes';
import { activityRepository } from '@/infrastructure/repositories';
import { getWeekDays } from '@/utils/date';
import { todayISODate } from '@/utils/today';

const EMPTY_WEEKLY: WeeklyProgress = {
  startDate: '',
  endDate: '',
  days: [],
  totalActivities: 0,
  completedActivities: 0,
  skippedActivities: 0,
  missedActivities: 0,
  pendingActivities: 0,
  weeklyCompletionRate: 0,
  completedDays: 0,
};

export function useWeeklyProgress(profileId: string | null, anchorDate: string) {
  const currentTimeMinutes = useCurrentTimeMinutes();
  const todayDate = todayISODate();

  const weekDates = useMemo(() => getWeekDays(anchorDate), [anchorDate]);
  const startDate = weekDates[0] ?? anchorDate;
  const endDate = weekDates[weekDates.length - 1] ?? anchorDate;

  const activities = useLiveQuery(
    async () => {
      if (!profileId) return [];
      return activityRepository.getInstancesByDateRange(profileId, startDate, endDate);
    },
    [profileId, startDate, endDate],
    undefined,
  );

  const weeklyProgress = useMemo((): WeeklyProgress => {
    if (!activities || weekDates.length === 0) return EMPTY_WEEKLY;

    const activitiesByDate: ActivitiesByDate = {};
    for (const date of weekDates) {
      const dayActivities = activities.filter((a) => a.date === date && !a.deletedAt);
      activitiesByDate[date] = enrichActivities(dayActivities, {
        date,
        todayDate,
        nowMinutes: currentTimeMinutes,
      });
    }

    return calculateWeeklyProgress(activitiesByDate, weekDates);
  }, [activities, currentTimeMinutes, todayDate, weekDates]);

  return {
    weeklyProgress,
    weekDates,
    isLoading: activities === undefined,
    error: null as string | null,
  };
}
