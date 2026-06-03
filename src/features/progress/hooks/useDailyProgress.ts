import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { enrichActivities } from '@/domain/services/activity-state.service';
import { calculateDailyProgress, type DailyProgress } from '@/domain/services/progress.service';
import { useCurrentTimeMinutes } from '@/hooks/useCurrentTimeMinutes';
import { activityRepository } from '@/infrastructure/repositories';
import { todayISODate } from '@/utils/today';

const EMPTY_PROGRESS: DailyProgress = {
  total: 0,
  completed: 0,
  pending: 0,
  skipped: 0,
  missed: 0,
  completionRate: 0,
  isComplete: false,
};

export function useDailyProgress(profileId: string | null, date: string) {
  const currentTimeMinutes = useCurrentTimeMinutes();
  const todayDate = todayISODate();

  const activities = useLiveQuery(
    async () => {
      if (!profileId) return [];
      return activityRepository.getInstancesByDate(profileId, date);
    },
    [profileId, date],
    undefined,
  );

  const progress = useMemo((): DailyProgress => {
    if (!activities) return EMPTY_PROGRESS;
    const enriched = enrichActivities(activities, {
      date,
      todayDate,
      nowMinutes: currentTimeMinutes,
    });
    return calculateDailyProgress(enriched);
  }, [activities, currentTimeMinutes, date, todayDate]);

  return {
    progress,
    isLoading: activities === undefined,
    error: null as string | null,
  };
}
