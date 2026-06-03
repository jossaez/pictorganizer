import { activityRepository } from '@/infrastructure/repositories';
import { useActivityRecurrence } from '@/features/activities/hooks/useActivityRecurrence';

/**
 * Wrapper around useActivityRecurrence for backward compatibility.
 */
export function useActivities() {
  const recurrence = useActivityRecurrence();

  return {
    error: recurrence.error,
    isMutating: recurrence.isMutating,
    setError: recurrence.setError,
    createActivity: recurrence.createRecurringActivity,
    updateSingleInstance: recurrence.updateSingleOccurrence,
    updateFutureInstances: recurrence.updateFutureOccurrences,
    deleteSingleInstance: recurrence.deleteSingleOccurrence,
    deleteFutureInstances: recurrence.deleteFutureOccurrences,
    getInstanceById: (id: string) => activityRepository.getInstanceById(id),
    getTemplateById: (id: string) => activityRepository.getTemplateById(id),
    isRecurringTemplate: recurrence.isRecurringTemplate,
  };
}
