import type { AppSettings } from '../types';

export type UpdateAppSettingsInput = Partial<
  Pick<
    AppSettings,
    | 'onboardingCompleted'
    | 'activeProfileId'
    | 'adultPinHash'
    | 'requirePinForAdultMode'
    | 'preferredDeviceLayout'
    | 'reduceMotion'
    | 'largeText'
    | 'highContrast'
    | 'language'
    | 'schemaVersion'
  >
>;

export interface ISettingsRepository {
  getAppSettings(): Promise<AppSettings>;

  /** Creates default settings if missing */
  getOrCreateAppSettings(): Promise<AppSettings>;

  updateAppSettings(input: UpdateAppSettingsInput): Promise<AppSettings>;

  setActiveProfileId(profileId: string | undefined): Promise<AppSettings>;

  setAdultPinHash(hash: string | undefined): Promise<AppSettings>;

  markOnboardingCompleted(): Promise<AppSettings>;
}
