import { useCallback, useState } from 'react';
import { RecurrenceType } from '@/domain/enums';
import type { ActivityInstance, ActivityTemplate } from '@/domain/types';
import { EditScope } from '@/domain/types/entities';
import { activityRepository } from '@/infrastructure/repositories';
import {
  cancelInstanceNotification,
  syncNotificationsForDate,
  syncNotificationsRolling,
} from '@/infrastructure/notifications/notification-sync';
import { syncInstanceWindow } from '@/infrastructure/database/instance-window-sync';
import { DEFAULT_ROLLING_WINDOW_DAYS } from '@/infrastructure/repositories/dexie-activity.repository';
import type { ActivityFormData } from '@/features/activities/types/activity-form.types';
import type { EditScopeChoice } from '@/features/activities/utils/activity-form.utils';
import {
  formDataToCreateInput,
  formDataToUpdateInstanceInput,
  formDataToUpdateTemplateInput,
} from '@/features/activities/utils/activity-form.utils';

export function useActivityRecurrence() {
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const createRecurringActivity = useCallback(
    async (
      form: ActivityFormData,
      profileId: string,
    ): Promise<{ template: ActivityTemplate; instances: ActivityInstance[] } | null> => {
      setIsMutating(true);
      setError(null);
      try {
        const input = formDataToCreateInput(form, profileId);
        const result = await activityRepository.createTemplateWithInstances(
          input,
          DEFAULT_ROLLING_WINDOW_DAYS,
        );
        syncNotificationsRolling(profileId);
        syncInstanceWindow(profileId);
        return result;
      } catch (err) {
        console.error('[useActivityRecurrence] createRecurringActivity:', err);
        setError(err instanceof Error ? err.message : 'Error al crear actividad');
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [],
  );

  const updateSingleOccurrence = useCallback(
    async (instanceId: string, form: ActivityFormData): Promise<ActivityInstance | null> => {
      setIsMutating(true);
      setError(null);
      try {
        const input = formDataToUpdateInstanceInput(form);
        const updated = await activityRepository.updateSingleInstance(instanceId, input);
        syncNotificationsForDate(updated.profileId, updated.date);
        return updated;
      } catch (err) {
        console.error('[useActivityRecurrence] updateSingleOccurrence:', err);
        setError(err instanceof Error ? err.message : 'Error al actualizar actividad');
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [],
  );

  const updateFutureOccurrences = useCallback(
    async (
      instance: ActivityInstance,
      form: ActivityFormData,
      scope: EditScopeChoice = EditScope.ThisAndFuture,
    ): Promise<{ template: ActivityTemplate; instances: ActivityInstance[] } | null> => {
      if (!instance.templateId) {
        setError('Esta actividad no tiene repeticiones asociadas');
        return null;
      }

      if (scope === EditScope.All) {
        setError('Modificar toda la repetición estará disponible pronto');
        return null;
      }

      setIsMutating(true);
      setError(null);
      try {
        const input = formDataToUpdateTemplateInput(form);
        const result = await activityRepository.updateTemplateAndFutureInstances(
          instance.templateId,
          input,
          instance.date,
          scope,
        );
        syncNotificationsRolling(instance.profileId);
        return result;
      } catch (err) {
        console.error('[useActivityRecurrence] updateFutureOccurrences:', err);
        setError(err instanceof Error ? err.message : 'Error al actualizar repeticiones');
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [],
  );

  const deleteSingleOccurrence = useCallback(async (instanceId: string): Promise<boolean> => {
    setIsMutating(true);
    setError(null);
    try {
      const existing = await activityRepository.getInstanceById(instanceId);
      await activityRepository.softDeleteInstance(instanceId);
      cancelInstanceNotification(instanceId);
      if (existing) {
        syncNotificationsForDate(existing.profileId, existing.date);
      }
      return true;
    } catch (err) {
      console.error('[useActivityRecurrence] deleteSingleOccurrence:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar actividad');
      return false;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const deleteFutureOccurrences = useCallback(
    async (instance: ActivityInstance): Promise<boolean> => {
      if (!instance.templateId) {
        setError('Esta actividad no tiene repeticiones');
        return false;
      }

      setIsMutating(true);
      setError(null);
      try {
        await activityRepository.deleteFutureInstances(instance.templateId, instance.date, true);
        await activityRepository.softDeleteTemplate(instance.templateId);
        syncNotificationsRolling(instance.profileId);
        return true;
      } catch (err) {
        console.error('[useActivityRecurrence] deleteFutureOccurrences:', err);
        setError(err instanceof Error ? err.message : 'Error al eliminar repeticiones');
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [],
  );

  const isRecurringTemplate = useCallback((template?: ActivityTemplate): boolean => {
    if (!template) return false;
    return template.recurrence.type !== RecurrenceType.Once;
  }, []);

  return {
    error,
    isMutating,
    setError,
    createRecurringActivity,
    updateSingleOccurrence,
    updateFutureOccurrences,
    deleteSingleOccurrence,
    deleteFutureOccurrences,
    isRecurringTemplate,
  };
}
