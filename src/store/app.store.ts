import { create } from 'zustand';
import type { AppSettings } from '@/domain/types';
import { DeviceLayout } from '@/domain/enums';
import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/i18n/languages';
import { todayISODate } from '@/utils/today';

export type UserMode = 'child' | 'adult';

export const ADULT_SESSION_DURATION_MS = 15 * 60 * 1000;

interface AppState {
  isBootstrapped: boolean;
  onboardingCompleted: boolean;
  activeProfileId: string | null;
  selectedDate: string;
  userMode: UserMode;
  preferredDeviceLayout: DeviceLayout;
  reduceMotion: boolean;
  largeText: boolean;
  highContrast: boolean;
  language: SupportedLanguage;
  adultPinHash: string | null;
  requirePinForAdultMode: boolean;
  adultSessionActive: boolean;
  adultSessionExpiresAt: number | null;

  setBootstrapped: (value: boolean) => void;
  hydrateFromSettings: (settings: AppSettings) => void;
  setOnboardingCompleted: (value: boolean) => void;
  setActiveProfileId: (profileId: string | null) => void;
  setSelectedDate: (date: string) => void;
  setUserMode: (mode: UserMode) => void;
  enterChildMode: () => void;
  enterAdultMode: () => void;
  setAccessibilitySettings: (input: {
    reduceMotion?: boolean;
    largeText?: boolean;
    highContrast?: boolean;
    preferredDeviceLayout?: DeviceLayout;
  }) => void;
  setLanguage: (language: SupportedLanguage) => void;
  setPinSettings: (input: { adultPinHash?: string | null; requirePinForAdultMode?: boolean }) => void;
  unlockAdultSession: () => void;
  lockAdultSession: () => void;
  isAdultSessionValid: () => boolean;
}

export const useAppStore = create<AppState>((set, get) => ({
  isBootstrapped: false,
  onboardingCompleted: false,
  activeProfileId: null,
  selectedDate: todayISODate(),
  userMode: 'child',
  preferredDeviceLayout: DeviceLayout.Auto,
  reduceMotion: false,
  largeText: false,
  highContrast: false,
  language: DEFAULT_LANGUAGE,
  adultPinHash: null,
  requirePinForAdultMode: false,
  adultSessionActive: false,
  adultSessionExpiresAt: null,

  setBootstrapped: (value) => set({ isBootstrapped: value }),

  hydrateFromSettings: (settings) =>
    set({
      onboardingCompleted: settings.onboardingCompleted,
      activeProfileId: settings.activeProfileId ?? null,
      preferredDeviceLayout: settings.preferredDeviceLayout,
      reduceMotion: settings.reduceMotion,
      largeText: settings.largeText,
      highContrast: settings.highContrast,
      language: settings.language ?? DEFAULT_LANGUAGE,
      adultPinHash: settings.adultPinHash ?? null,
      requirePinForAdultMode: settings.requirePinForAdultMode ?? false,
    }),

  setOnboardingCompleted: (value) => set({ onboardingCompleted: value }),

  setActiveProfileId: (profileId) => set({ activeProfileId: profileId }),

  setSelectedDate: (date) => set({ selectedDate: date }),

  setUserMode: (mode) => set({ userMode: mode }),

  enterChildMode: () => set({ userMode: 'child' }),

  enterAdultMode: () => set({ userMode: 'adult' }),

  setLanguage: (language) => set({ language }),

  setAccessibilitySettings: (input) =>
    set((state) => ({
      reduceMotion: input.reduceMotion ?? state.reduceMotion,
      largeText: input.largeText ?? state.largeText,
      highContrast: input.highContrast ?? state.highContrast,
      preferredDeviceLayout: input.preferredDeviceLayout ?? state.preferredDeviceLayout,
    })),

  setPinSettings: (input) =>
    set((state) => ({
      adultPinHash:
        input.adultPinHash !== undefined ? input.adultPinHash : state.adultPinHash,
      requirePinForAdultMode:
        input.requirePinForAdultMode !== undefined
          ? input.requirePinForAdultMode
          : state.requirePinForAdultMode,
    })),

  unlockAdultSession: () =>
    set({
      adultSessionActive: true,
      adultSessionExpiresAt: Date.now() + ADULT_SESSION_DURATION_MS,
    }),

  lockAdultSession: () =>
    set({
      adultSessionActive: false,
      adultSessionExpiresAt: null,
    }),

  isAdultSessionValid: () => {
    const { adultSessionActive, adultSessionExpiresAt } = get();
    if (!adultSessionActive || adultSessionExpiresAt == null) return false;
    return Date.now() < adultSessionExpiresAt;
  },
}));
