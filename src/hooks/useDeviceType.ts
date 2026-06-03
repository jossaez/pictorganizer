import { useEffect, useState } from 'react';
import {
  getDeviceTypeFromWidth,
  getOrientation,
  isDesktopDeviceType,
  isMobileDeviceType,
  isTabletDeviceType,
  type DeviceOrientation,
  type DeviceType,
} from '@/utils/device-layout.utils';

function readViewport() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const deviceType = getDeviceTypeFromWidth(width);
  return {
    deviceType,
    orientation: getOrientation(width, height),
    isMobile: isMobileDeviceType(deviceType),
    isTablet: isTabletDeviceType(deviceType),
    isDesktop: isDesktopDeviceType(deviceType),
  };
}

export function useDeviceType() {
  const [state, setState] = useState(readViewport);

  useEffect(() => {
    function handleResize(): void {
      setState(readViewport());
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return state;
}

export type { DeviceOrientation, DeviceType };
