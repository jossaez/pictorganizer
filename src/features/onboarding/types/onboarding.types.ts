import type { ChildModeDetailLevel, DeviceLayout } from '@/domain/enums';

export const ONBOARDING_STEP_COUNT = 8;

export type OnboardingStepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface OnboardingDraft {
  name: string;
  avatarId: string | null;
  color: string;
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

export const PROFILE_COLOR_OPTIONS = [
  { id: 'blue', value: '#5b8def', label: 'Azul' },
  { id: 'pink', value: '#f472b6', label: 'Rosa' },
  { id: 'green', value: '#34d399', label: 'Verde' },
  { id: 'amber', value: '#fbbf24', label: 'Ámbar' },
  { id: 'violet', value: '#a78bfa', label: 'Violeta' },
] as const;

export const ONBOARDING_STEP_LABELS = [
  'Bienvenida',
  'Nombre',
  'Avatar',
  'Dispositivo',
  'Detalle',
  'Rutinas',
  'PIN',
  'Confirmar',
] as const;
