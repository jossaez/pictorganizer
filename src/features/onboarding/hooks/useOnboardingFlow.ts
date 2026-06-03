import { useCallback, useMemo, useState } from 'react';
import { ChildModeDetailLevel, DeviceLayout } from '@/domain/enums';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import type { Avatar, RoutineTemplate } from '@/domain/types';
import { completeOnboarding } from '@/features/onboarding/services/completeOnboarding';
import {
  DEFAULT_ONBOARDING_DRAFT,
  ONBOARDING_STEP_COUNT,
  type OnboardingDraft,
  type OnboardingStepIndex,
} from '@/features/onboarding/types/onboarding.types';
import { db } from '@/infrastructure/database/dexie.db';
import { SEED_AVATARS, SEED_ROUTINE_TEMPLATES } from '@/infrastructure/database/seeds/seed-data';
import { routineRepository } from '@/infrastructure/repositories';
import { useAppStore } from '@/store/app.store';

function validateStep(step: OnboardingStepIndex, draft: OnboardingDraft): string | null {
  switch (step) {
    case 0:
      return null;
    case 1: {
      const name = draft.name.trim();
      if (!name) return 'Introduce un nombre';
      if (name.length < 2) return 'El nombre debe tener al menos 2 caracteres';
      return null;
    }
    case 2:
      if (!draft.avatarId) return 'Selecciona un avatar';
      if (!draft.color) return 'Selecciona un color';
      return null;
    case 3:
      if (!draft.preferredDeviceLayout) return 'Selecciona un tipo de dispositivo';
      return null;
    case 4:
      if (!draft.childModeDetailLevel) return 'Selecciona un nivel de detalle';
      return null;
    case 5:
      return null;
    case 6:
      return null;
    case 7:
      return validateStep(1, draft) ?? validateStep(2, draft) ?? validateStep(3, draft) ?? validateStep(4, draft);
    default:
      return null;
  }
}

export function useOnboardingFlow() {
  const navigate = useNavigate();
  const hydrateFromSettings = useAppStore((s) => s.hydrateFromSettings);
  const setOnboardingCompleted = useAppStore((s) => s.setOnboardingCompleted);
  const enterChildMode = useAppStore((s) => s.enterChildMode);

  const [step, setStep] = useState<OnboardingStepIndex>(0);
  const [draft, setDraft] = useState<OnboardingDraft>(DEFAULT_ONBOARDING_DRAFT);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatarsFromDb = useLiveQuery(() => db.avatars.orderBy('sortOrder').toArray(), [], []);
  const templatesFromDb = useLiveQuery(() => routineRepository.getAllRoutineTemplates(), [], []);

  const avatars: Avatar[] = useMemo(() => {
    if (avatarsFromDb && avatarsFromDb.length > 0) return avatarsFromDb;
    return SEED_AVATARS;
  }, [avatarsFromDb]);

  const routineTemplates: RoutineTemplate[] = useMemo(() => {
    const fromDb = templatesFromDb ?? [];
    if (fromDb.length > 0) {
      const preferredIds = ['routine-morning', 'routine-night', 'routine-leave-home'];
      const filtered = fromDb.filter((t) => preferredIds.includes(t.id));
      return filtered.length > 0 ? filtered : fromDb;
    }
    return SEED_ROUTINE_TEMPLATES.filter((t) =>
      ['routine-morning', 'routine-night', 'routine-leave-home'].includes(t.id),
    );
  }, [templatesFromDb]);

  const stepError = useMemo(() => validateStep(step, draft), [step, draft]);
  const canGoNext = stepError === null;

  const updateDraft = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setSubmitError(null);
  }, []);

  const goNext = useCallback(() => {
    const error = validateStep(step, draft);
    if (error) return;
    if (step < ONBOARDING_STEP_COUNT - 1) {
      setStep((s) => (s + 1) as OnboardingStepIndex);
    }
  }, [step, draft]);

  const goBack = useCallback(() => {
    if (step > 0) {
      setStep((s) => (s - 1) as OnboardingStepIndex);
      setSubmitError(null);
    }
  }, [step]);

  const toggleRoutine = useCallback((templateId: string) => {
    setDraft((prev) => {
      const selected = prev.selectedRoutineTemplateIds.includes(templateId)
        ? prev.selectedRoutineTemplateIds.filter((id) => id !== templateId)
        : [...prev.selectedRoutineTemplateIds, templateId];
      return { ...prev, selectedRoutineTemplateIds: selected };
    });
    setSubmitError(null);
  }, []);

  const submit = useCallback(async (): Promise<boolean> => {
    for (let i = 1; i <= 4; i++) {
      const err = validateStep(i as OnboardingStepIndex, draft);
      if (err) {
        setSubmitError(err);
        return false;
      }
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await completeOnboarding(draft);
      hydrateFromSettings(result.settings);
      setOnboardingCompleted(true);
      enterChildMode();
      navigate('/child', { replace: true });
      return true;
    } catch (err) {
      console.error('[useOnboardingFlow] submit:', err);
      setSubmitError(
        err instanceof Error ? err.message : 'No se pudo crear la agenda. Inténtalo de nuevo.',
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [draft, enterChildMode, hydrateFromSettings, navigate, setOnboardingCompleted]);

  const routinesRecommended =
    step === 5 && draft.selectedRoutineTemplateIds.length === 0
      ? 'Te recomendamos seleccionar al menos una rutina para empezar.'
      : null;

  return {
    step,
    draft,
    avatars,
    routineTemplates,
    stepError,
    canGoNext,
    routinesRecommended,
    submitError,
    isSubmitting,
    isLoadingCatalog: avatarsFromDb === undefined || templatesFromDb === undefined,
    updateDraft,
    goNext,
    goBack,
    toggleRoutine,
    submit,
    setStep,
  };
}

export function detailLevelLabel(level: ChildModeDetailLevel | null): string {
  switch (level) {
    case ChildModeDetailLevel.Minimal:
      return 'Simple';
    case ChildModeDetailLevel.Standard:
      return 'Medio';
    case ChildModeDetailLevel.Detailed:
      return 'Completo';
    default:
      return '—';
  }
}

export function deviceLayoutLabel(layout: DeviceLayout | null): string {
  switch (layout) {
    case DeviceLayout.Phone:
      return 'Móvil';
    case DeviceLayout.Tablet:
      return 'Tablet';
    case DeviceLayout.Auto:
      return 'Automático';
    default:
      return '—';
  }
}
