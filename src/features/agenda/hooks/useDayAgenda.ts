import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useMemo } from 'react';
import {
  enrichActivities,
  type EnrichedActivityInstance,
} from '@/domain/services/activity-state.service';
import { calculateDailyProgress, type DailyProgress } from '@/domain/services/progress.service';
import { useActivityActions } from '@/features/agenda/hooks/useActivityActions';
import { useCurrentTimeMinutes } from '@/hooks/useCurrentTimeMinutes';
import { activityRepository, profileRepository } from '@/infrastructure/repositories';
import { useProfiles } from '@/features/profiles/hooks/useProfiles';
import { useAppStore } from '@/store/app.store';
import { addDays, getStartOfWeek } from '@/utils/date';
import { todayISODate } from '@/utils/today';

export function useDayAgenda(profileId: string | null) {
  const date = useAppStore((s) => s.selectedDate);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const currentTimeMinutes = useCurrentTimeMinutes();
  const { activeProfile } = useProfiles();

  const activities = useLiveQuery(
    async () => {
      if (!profileId) return [];
      return activityRepository.getInstancesByDate(profileId, date);
    },
    [profileId, date],
    [],
  );

  const profileSettings = useLiveQuery(
    async () => {
      if (!profileId) return undefined;
      return profileRepository.getSettingsByProfileId(profileId);
    },
    [profileId],
    undefined,
  );

  const isLoading = activities === undefined;

  const enrichedActivities: EnrichedActivityInstance[] = useMemo(() => {
    if (!activities) return [];
    return enrichActivities(activities, {
      date,
      todayDate: todayISODate(),
      nowMinutes: currentTimeMinutes,
    });
  }, [activities, date, currentTimeMinutes]);

  const progress: DailyProgress = useMemo(
    () => calculateDailyProgress(enrichedActivities),
    [enrichedActivities],
  );

  const { actionError, isActing, completeActivity, skipActivity, undoActivity } =
    useActivityActions(enrichedActivities, {
      profileId,
      date,
      profileSettings,
      profileName: activeProfile?.name,
    });

  const goToPreviousDay = useCallback(() => {
    setSelectedDate(addDays(date, -1));
  }, [date, setSelectedDate]);

  const goToNextDay = useCallback(() => {
    setSelectedDate(addDays(date, 1));
  }, [date, setSelectedDate]);

  const goToToday = useCallback(() => {
    setSelectedDate(todayISODate());
  }, [setSelectedDate]);

  const goToPreviousWeek = useCallback(() => {
    setSelectedDate(addDays(getStartOfWeek(date), -7));
  }, [date, setSelectedDate]);

  const goToNextWeek = useCallback(() => {
    setSelectedDate(addDays(getStartOfWeek(date), 7));
  }, [date, setSelectedDate]);

  return {
    date,
    todayDate: todayISODate(),
    currentTimeMinutes,
    activities: activities ?? [],
    enrichedActivities,
    progress,
    profileSettings,
    isLoading,
    error: actionError,
    isActing,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    goToPreviousWeek,
    goToNextWeek,
    completeActivity,
    skipActivity,
    undoActivity,
  };
}
