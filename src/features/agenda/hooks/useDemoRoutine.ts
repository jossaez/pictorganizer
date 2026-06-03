import { useCallback, useState } from 'react';
import { applyMorningRoutineDemo } from '@/features/routines/services/applyRoutineToProfile';

export function useDemoRoutine() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDemoRoutine = useCallback(async (profileId: string): Promise<boolean> => {
    setIsCreating(true);
    setError(null);
    try {
      const result = await applyMorningRoutineDemo(profileId);
      console.info('[demo] Routine applied, instances:', result.instancesCreated);
      return result.instancesCreated > 0;
    } catch (err) {
      console.error('[useDemoRoutine] createDemoRoutine:', err);
      setError(err instanceof Error ? err.message : 'Error al crear rutina demo');
      return false;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return { createDemoRoutine, isCreating, error };
}
