import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { DeviceLayout } from '@/domain/enums';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useAppStore } from '@/store/app.store';
import {
  resolveEffectiveLayout,
  type DeviceOrientation,
  type DeviceType,
  type EffectiveLayout,
} from '@/utils/device-layout.utils';

export interface DeviceContextValue {
  deviceType: DeviceType;
  effectiveLayout: EffectiveLayout;
  orientation: DeviceOrientation;
  preferredDeviceLayout: DeviceLayout;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isEffectiveMobile: boolean;
  isEffectiveTablet: boolean;
}

const DeviceContext = createContext<DeviceContextValue | null>(null);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const preferredDeviceLayout = useAppStore((s) => s.preferredDeviceLayout);
  const { deviceType, orientation, isMobile, isTablet, isDesktop } = useDeviceType();

  const value = useMemo((): DeviceContextValue => {
    const effectiveLayout = resolveEffectiveLayout(deviceType, preferredDeviceLayout);
    return {
      deviceType,
      effectiveLayout,
      orientation,
      preferredDeviceLayout,
      isMobile,
      isTablet,
      isDesktop,
      isEffectiveMobile: effectiveLayout === 'mobile',
      isEffectiveTablet: effectiveLayout === 'tablet',
    };
  }, [deviceType, isDesktop, isMobile, isTablet, orientation, preferredDeviceLayout]);

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}

export function useDevice(): DeviceContextValue {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within DeviceProvider');
  }
  return context;
}
