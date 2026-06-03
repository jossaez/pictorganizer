import type { AppSettings } from '@/domain/types';

export function isAdultPinRequired(
  settings: Pick<AppSettings, 'adultPinHash' | 'requirePinForAdultMode'>,
): boolean {
  return Boolean(settings.adultPinHash && settings.requirePinForAdultMode);
}

export function hasAdultPin(settings: Pick<AppSettings, 'adultPinHash'>): boolean {
  return Boolean(settings.adultPinHash);
}
