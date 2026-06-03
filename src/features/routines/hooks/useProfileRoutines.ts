import { useLiveQuery } from 'dexie-react-hooks';
import type { Routine } from '@/domain/types';
import { routineRepository } from '@/infrastructure/repositories';

export function useProfileRoutines(profileId: string | null) {
  const routines = useLiveQuery(
    () =>
      profileId ? routineRepository.getActiveRoutinesByProfile(profileId) : Promise.resolve([] as Routine[]),
    [profileId],
    [],
  );

  return {
    routines: routines ?? [],
    isLoading: profileId !== null && routines === undefined,
  };
}
