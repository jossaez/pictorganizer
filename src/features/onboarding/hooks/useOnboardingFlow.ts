import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChildModeDetailLevel, DeviceLayout } from '@/domain/enums';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import type { RoutineTemplate } from '@/domain/types';
import { completeOnboarding } from '@/features/onboarding/services/completeOnboarding';
import {
  DEFAULT_ONBOARDING_DRAFT,
  ONBOARDING_STEP_COUNT,
  type OnboardingDraft,
  type OnboardingStepIndex,
} from '@/features/onboarding/types/onboarding.types';
import { i18n } from '@/i18n';
import { SEED_ROUTINE_TEMPLATES } from '@/infrastructure/database/seeds/seed-data';
import { routineRepository } from '@/infrastructure/repositories';
import { useAppStore } from '@/store/app.store';

function validateStep(step: OnboardingStepIndex, draft: OnboardingDraft): string | null {
  switch (step) {
    case 0:
    case 1:
      return null;
    case 2: {
      const name = draft.name.trim();
      if (!name) return i18n.t('onboarding.validation.nameRequired');
      if (name.length < 2) return i18n.t('onboarding.validation.nameMin');
      return null;
    }
    case 3:
      if (!draft.color) return i18n.t('onboarding.validation.color');
      return null;
    case 4:
      if (!draft.preferredDeviceLayout) return i18n.t('onboarding.validation.device');
      return null;
    case 5:
      if (!draft.childModeDetailLevel) return i18n.t('onboarding.validation.detail');
      return null;
    case 6:
    case 7:
      return null;
    case 8:
      return (
        validateStep(2, draft) ??
        validateStep(3, draft) ??
        validateStep(4, draft) ??
        validateStep(5, draft)
      );
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

  useEffect(() => {
    return () => {
      if (draft.profilePhotoPreviewUrl) {
        URL.revokeObjectURL(draft.profilePhotoPreviewUrl);
      }
    };
  }, [draft.profilePhotoPreviewUrl]);

  const templatesFromDb = useLiveQuery(() => routineRepository.getAllRoutineTemplates(), [], []);

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

  const updateProfilePhoto = useCallback((file: File | null, previewUrl: string | null) => {
    setDraft((prev) => {
      if (prev.profilePhotoPreviewUrl) {
        URL.revokeObjectURL(prev.profilePhotoPreviewUrl);
      }
      if (!file) {
        return {
          ...prev,
          profilePhotoFile: undefined,
          profilePhotoPreviewUrl: undefined,
        };
      }
      return {
        ...prev,
        profilePhotoFile: file,
        profilePhotoPreviewUrl: previewUrl ?? URL.createObjectURL(file),
        avatarId: null,
      };
    });
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
    for (let i = 2; i <= 5; i++) {
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
      navigate('/child', {
        replace: true,
        state: result.photoSaveWarning ? { photoWarning: result.photoSaveWarning } : undefined,
      });
      return true;
    } catch (err) {
      console.error('[useOnboardingFlow] submit:', err);
      setSubmitError(
        err instanceof Error ? err.message : i18n.t('onboarding.submitError'),
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [draft, enterChildMode, hydrateFromSettings, navigate, setOnboardingCompleted]);

  const routinesRecommended =
    step === 6 && draft.selectedRoutineTemplateIds.length === 0
      ? i18n.t('onboarding.routinesRecommended')
      : null;

  return {
    step,
    draft,
    routineTemplates,
    stepError,
    canGoNext,
    routinesRecommended,
    submitError,
    isSubmitting,
    isLoadingCatalog: templatesFromDb === undefined,
    updateDraft,
    updateProfilePhoto,
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
      return i18n.t('detailLevel.minimal');
    case ChildModeDetailLevel.Standard:
      return i18n.t('detailLevel.standard');
    case ChildModeDetailLevel.Detailed:
      return i18n.t('detailLevel.detailed');
    default:
      return i18n.t('common.dash');
  }
}

export function deviceLayoutLabel(layout: DeviceLayout | null): string {
  switch (layout) {
    case DeviceLayout.Phone:
      return i18n.t('device.phone');
    case DeviceLayout.Tablet:
      return i18n.t('device.tablet');
    case DeviceLayout.Auto:
      return i18n.t('device.auto');
    default:
      return i18n.t('common.dash');
  }
}
