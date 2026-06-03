import { ChildModeDetailLevel } from '@/domain/enums';
import type { AppSettings } from '@/domain/types';
import type { OnboardingDraft } from '@/features/onboarding/types/onboarding.types';
import { applyRoutineToProfile } from '@/features/routines/services/applyRoutineToProfile';
import { getRoutineAnchorMinutes } from '@/features/routines/constants/routine-config';
import { profileRepository, settingsRepository } from '@/infrastructure/repositories';

const ONBOARDING_INSTANCE_DAYS = 90;

function timerSettingsForDetailLevel(level: ChildModeDetailLevel): {
  showTimer: boolean;
  showAnticipation: boolean;
} {
  switch (level) {
    case ChildModeDetailLevel.Minimal:
      return { showTimer: false, showAnticipation: true };
    case ChildModeDetailLevel.Standard:
      return { showTimer: true, showAnticipation: true };
    case ChildModeDetailLevel.Detailed:
      return { showTimer: true, showAnticipation: true };
    default:
      return { showTimer: true, showAnticipation: true };
  }
}

export interface CompleteOnboardingResult {
  profileId: string;
  settings: AppSettings;
  instancesCreated: number;
}

export async function completeOnboarding(
  draft: OnboardingDraft,
): Promise<CompleteOnboardingResult> {
  if (!draft.avatarId) throw new Error('Selecciona un avatar');
  if (!draft.preferredDeviceLayout) throw new Error('Selecciona un tipo de dispositivo');
  if (!draft.childModeDetailLevel) throw new Error('Selecciona un nivel de detalle');

  const { profile } = await profileRepository.createProfile({
    name: draft.name.trim(),
    color: draft.color,
    avatarId: draft.avatarId,
  });

  const timerPrefs = timerSettingsForDetailLevel(draft.childModeDetailLevel);
  await profileRepository.updateProfileSettings(profile.id, {
    childModeDetailLevel: draft.childModeDetailLevel,
    ...timerPrefs,
  });

  const settings = await settingsRepository.updateAppSettings({
    onboardingCompleted: true,
    activeProfileId: profile.id,
    preferredDeviceLayout: draft.preferredDeviceLayout,
    ...(draft.adultPinHash
      ? { adultPinHash: draft.adultPinHash, requirePinForAdultMode: true }
      : {}),
  });

  let instancesCreated = 0;
  for (const templateId of draft.selectedRoutineTemplateIds) {
    const result = await applyRoutineToProfile({
      profileId: profile.id,
      templateId,
      anchorTimeMinutes: getRoutineAnchorMinutes(templateId),
      instanceDays: ONBOARDING_INSTANCE_DAYS,
    });
    instancesCreated += result.instancesCreated;
  }

  return { profileId: profile.id, settings, instancesCreated };
}
