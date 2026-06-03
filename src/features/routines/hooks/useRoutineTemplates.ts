import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RoutineTemplate } from '@/domain/types';
import { db } from '@/infrastructure/database/dexie.db';
import { routineRepository } from '@/infrastructure/repositories';
import { useProfiles } from '@/features/profiles/hooks/useProfiles';
import {
  applyRoutineToProfile,
  DuplicateRoutineError,
  type ApplyRoutineResult,
} from '@/features/routines/services/applyRoutineToProfile';
import { useAppStore } from '@/store/app.store';

export interface ApplyRoutineOutcome {
  success: true;
  result: ApplyRoutineResult;
  profileName: string;
}

export interface ApplyRoutineDuplicate {
  success: false;
  duplicate: true;
  existingRoutineId: string;
  templateName: string;
}

export interface ApplyRoutineFailure {
  success: false;
  duplicate: false;
  message: string;
}

export type ApplyRoutineResponse = ApplyRoutineOutcome | ApplyRoutineDuplicate | ApplyRoutineFailure;

export function useRoutineTemplates() {
  const [error, setError] = useState<string | null>(null);

  const routineTemplates = useLiveQuery(() => routineRepository.getAllRoutineTemplates(), [], []);
  const categories = useLiveQuery(() => db.categories.orderBy('sortOrder').toArray(), [], []);
  const pictograms = useLiveQuery(() => db.pictograms.orderBy('sortOrder').toArray(), [], []);

  const isLoading =
    routineTemplates === undefined || categories === undefined || pictograms === undefined;

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const cat of categories ?? []) {
      map.set(cat.id, cat.label);
    }
    return map;
  }, [categories]);

  const pictogramMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const pic of pictograms ?? []) {
      map.set(pic.id, pic.label);
    }
    return map;
  }, [pictograms]);

  const getRoutineTemplateById = useCallback(
    (id: string): RoutineTemplate | undefined =>
      routineTemplates?.find((t) => t.id === id),
    [routineTemplates],
  );

  return {
    routineTemplates: routineTemplates ?? [],
    categoryMap,
    pictogramMap,
    isLoading,
    error,
    setError,
    getRoutineTemplateById,
  };
}

export function useApplyRoutineTemplate() {
  const navigate = useNavigate();
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const { activeProfile } = useProfiles();
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const applyRoutineTemplateToActiveProfile = useCallback(
    async (templateId: string, asCopy = false): Promise<ApplyRoutineResponse> => {
      if (!activeProfileId) {
        navigate('/profiles');
        return { success: false, duplicate: false, message: 'No hay perfil activo' };
      }

      setIsApplying(true);
      setError(null);

      try {
        const result = await applyRoutineToProfile({
          profileId: activeProfileId,
          templateId,
          asCopy,
        });

        return {
          success: true,
          result,
          profileName: activeProfile?.name ?? 'el perfil',
        };
      } catch (err) {
        if (err instanceof DuplicateRoutineError) {
          return {
            success: false,
            duplicate: true,
            existingRoutineId: err.existingRoutineId,
            templateName: err.templateName,
          };
        }

        const message = err instanceof Error ? err.message : 'Error al aplicar rutina';
        console.error('[useApplyRoutineTemplate] apply:', err);
        setError(message);
        return { success: false, duplicate: false, message };
      } finally {
        setIsApplying(false);
      }
    },
    [activeProfile?.name, activeProfileId, navigate],
  );

  return {
    activeProfileId,
    activeProfileName: activeProfile?.name ?? null,
    applyRoutineTemplateToActiveProfile,
    isApplying,
    error,
    setError,
  };
}
