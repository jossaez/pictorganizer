import type { ChildModeDetailLevel, DeviceLayout } from '@/domain/enums';

export const ONBOARDING_STEP_COUNT = 9;

export type OnboardingStepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface OnboardingDraft {
  name: string;
  /** Legacy; no longer required in onboarding */
  avatarId: string | null;
  color: string;
  profilePhotoFile?: File;
  profilePhotoPreviewUrl?: string;
  preferredDeviceLayout: DeviceLayout | null;
  childModeDetailLevel: ChildModeDetailLevel | null;
  selectedRoutineTemplateIds: string[];
  /** SHA-256 hash — never plain PIN */
  adultPinHash?: string | null;
  pinSkipped?: boolean;
}

export const DEFAULT_ONBOARDING_DRAFT: OnboardingDraft = {
  name: '',
  avatarId: null,
  color: '#5b8def',
  preferredDeviceLayout: null,
  childModeDetailLevel: null,
  selectedRoutineTemplateIds: [],
};

export const ONBOARDING_STEP_LABELS = [
  'language',
  'welcome',
  'name',
  'photoColor',
  'device',
  'detail',
  'routines',
  'pin',
  'confirm',
] as const;
