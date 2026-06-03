import { describe, expect, it } from 'vitest';
import { DeviceLayout } from '../domain/enums';
import {
  getDeviceTypeFromWidth,
  getOrientation,
  resolveEffectiveLayout,
} from './device-layout.utils';

describe('device-layout.utils', () => {
  it('clasifica anchos por breakpoint', () => {
    expect(getDeviceTypeFromWidth(390)).toBe('mobile');
    expect(getDeviceTypeFromWidth(768)).toBe('tablet');
    expect(getDeviceTypeFromWidth(1024)).toBe('tablet');
    expect(getDeviceTypeFromWidth(1366)).toBe('desktop');
  });

  it('detecta orientación', () => {
    expect(getOrientation(800, 600)).toBe('landscape');
    expect(getOrientation(600, 800)).toBe('portrait');
  });

  it('respeta preferredDeviceLayout', () => {
    expect(resolveEffectiveLayout('tablet', DeviceLayout.Phone)).toBe('mobile');
    expect(resolveEffectiveLayout('mobile', DeviceLayout.Tablet)).toBe('tablet');
    expect(resolveEffectiveLayout('desktop', DeviceLayout.Auto)).toBe('tablet');
    expect(resolveEffectiveLayout('mobile', DeviceLayout.Auto)).toBe('mobile');
  });
});
