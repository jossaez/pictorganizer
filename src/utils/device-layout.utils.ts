import { DeviceLayout } from '@/domain/enums';

export const DEVICE_BREAKPOINTS = {
  mobileMax: 767,
  tabletMax: 1199,
} as const;

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type EffectiveLayout = 'mobile' | 'tablet';
export type DeviceOrientation = 'portrait' | 'landscape';

export function getDeviceTypeFromWidth(width: number): DeviceType {
  if (width <= DEVICE_BREAKPOINTS.mobileMax) return 'mobile';
  if (width <= DEVICE_BREAKPOINTS.tabletMax) return 'tablet';
  return 'desktop';
}

export function getOrientation(width: number, height: number): DeviceOrientation {
  return width >= height ? 'landscape' : 'portrait';
}

export function resolveEffectiveLayout(
  deviceType: DeviceType,
  preferred: DeviceLayout,
): EffectiveLayout {
  if (preferred === DeviceLayout.Phone) return 'mobile';
  if (preferred === DeviceLayout.Tablet) return 'tablet';
  return deviceType === 'mobile' ? 'mobile' : 'tablet';
}

export function isMobileDeviceType(deviceType: DeviceType): boolean {
  return deviceType === 'mobile';
}

export function isTabletDeviceType(deviceType: DeviceType): boolean {
  return deviceType === 'tablet';
}

export function isDesktopDeviceType(deviceType: DeviceType): boolean {
  return deviceType === 'desktop';
}
