import { useCallback, useState } from 'react';
import { SkippedBy } from '@/domain/enums';
import {
  normalizeCelebrationStyle,
  shouldShowCelebration,
} from '@/domain/celebration/celebration-style.utils';
import {
  canComplete,
  canSkip,
  canUndo,
} from '@/domain/services/activity-completion.service';
import type { EnrichedActivityInstance } from '@/domain/services/activity-state.service';
import type { ProfileSettings } from '@/domain/types/entities';
import { pickCelebrationMessage } from '@/features/agenda/constants/celebration-messages';
import {
  buildDayCompleteKey,
  DAY_COMPLETE_CELEBRATION,
  willDayBecomeComplete,
} from '@/features/progress/utils/day-complete-celebration';
import { activityRepository } from '@/infrastructure/repositories';
import {
  cancelInstanceNotification,
  syncNotificationsForDate,
  syncNotificationsRolling,
} from '@/infrastructure/notifications/notification-sync';
import { useAppStore } from '@/store/app.store';
import { useUiStore } from '@/store/ui.store';

export interface UseActivityActionsOptions {
  profileId?: string | null;
  date?: string;
  profileSettings?: ProfileSettings;
  profileName?: string;
}

export function useActivityActions(
  enrichedActivities: EnrichedActivityInstance[],
  options: UseActivityActionsOptions = {},
) {
  const { profileId, date, profileSettings, profileName } = options;
  const userMode = useAppStore((s) => s.userMode);
  const showCelebration = useUiStore((s) => s.showCelebration);
  const hasCelebratedDayComplete = useUiStore((s) => s.hasCelebratedDayComplete);
  const markDayCompleteCelebrated = useUiStore((s) => s.markDayCompleteCelebrated);

  const [actionError, setActionError] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);

  const findActivity = useCallback(
    (instanceId: string) => enrichedActivities.find((a) => a.id === instanceId),
    [enrichedActivities],
  );

  const maybeCelebrateDayComplete = useCallback(
    (instanceId: string, action: 'complete' | 'skip', activityCelebrationShown: boolean) => {
      if (!profileId || !date) return;

      if (!willDayBecomeComplete(enrichedActivities, instanceId, action)) return;

      const dayKey = buildDayCompleteKey(profileId, date);
      if (hasCelebratedDayComplete(dayKey)) return;

      markDayCompleteCelebrated(dayKey);

      const showDayComplete = () => {
        showCelebration({
          type: DAY_COMPLETE_CELEBRATION.type,
          message: DAY_COMPLETE_CELEBRATION.message,
          activityTitle: DAY_COMPLETE_CELEBRATION.subtitle,
        });
      };

      if (activityCelebrationShown) {
        window.setTimeout(showDayComplete, 2000);
      } else {
        showDayComplete();
      }
    },
    [
      date,
      enrichedActivities,
      hasCelebratedDayComplete,
      markDayCompleteCelebrated,
      profileId,
      showCelebration,
    ],
  );

  const completeActivity = useCallback(
    async (instanceId: string): Promise<boolean> => {
      const activity = findActivity(instanceId);
      if (!activity) {
        setActionError('Actividad no encontrada');
        return false;
      }

      const ctx = { status: activity.status, computedState: activity.computedState };
      if (!canComplete(ctx)) {
        setActionError('Esta actividad no se puede marcar como hecha');
        return false;
      }

      setIsActing(true);
      setActionError(null);
      try {
        await activityRepository.completeInstance(instanceId);
        cancelInstanceNotification(instanceId);

        const celebrationStyle = normalizeCelebrationStyle(
          profileSettings?.celebrationStyle ?? 'smile',
        );

        let activityCelebrationShown = false;
        if (shouldShowCelebration(celebrationStyle)) {
          showCelebration({
            type: celebrationStyle,
            message: pickCelebrationMessage({
              profileName,
              simple: userMode === 'child',
            }),
            activityTitle: activity.title,
          });
          activityCelebrationShown = true;
        }

        maybeCelebrateDayComplete(instanceId, 'complete', activityCelebrationShown);

        return true;
      } catch (err) {
        console.error('[useActivityActions] completeActivity:', err);
        setActionError(err instanceof Error ? err.message : 'No se pudo completar la actividad');
        return false;
      } finally {
        setIsActing(false);
      }
    },
    [findActivity, maybeCelebrateDayComplete, profileName, profileSettings?.celebrationStyle, showCelebration, userMode],
  );

  const skipActivity = useCallback(
    async (instanceId: string): Promise<boolean> => {
      const activity = findActivity(instanceId);
      if (!activity) {
        setActionError('Actividad no encontrada');
        return false;
      }

      const ctx = { status: activity.status, computedState: activity.computedState };
      if (!canSkip(ctx, userMode)) {
        setActionError('No se puede saltar esta actividad');
        return false;
      }

      setIsActing(true);
      setActionError(null);
      try {
        await activityRepository.skipInstance(instanceId, SkippedBy.Adult);
        cancelInstanceNotification(instanceId);
        maybeCelebrateDayComplete(instanceId, 'skip', false);
        return true;
      } catch (err) {
        console.error('[useActivityActions] skipActivity:', err);
        setActionError(err instanceof Error ? err.message : 'No se pudo saltar la actividad');
        return false;
      } finally {
        setIsActing(false);
      }
    },
    [findActivity, maybeCelebrateDayComplete, userMode],
  );

  const undoActivity = useCallback(
    async (instanceId: string): Promise<boolean> => {
      const activity = findActivity(instanceId);
      if (!activity) {
        setActionError('Actividad no encontrada');
        return false;
      }

      const ctx = { status: activity.status, computedState: activity.computedState };
      if (!canUndo(ctx, userMode)) {
        setActionError('No se puede deshacer esta actividad');
        return false;
      }

      setIsActing(true);
      setActionError(null);
      try {
        const updated = await activityRepository.undoInstanceStatus(instanceId);
        syncNotificationsForDate(updated.profileId, updated.date);
        return true;
      } catch (err) {
        console.error('[useActivityActions] undoActivity:', err);
        setActionError(err instanceof Error ? err.message : 'No se pudo deshacer la acción');
        return false;
      } finally {
        setIsActing(false);
      }
    },
    [findActivity, userMode],
  );

  return {
    actionError,
    isActing,
    completeActivity,
    skipActivity,
    undoActivity,
  };
}
