import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

/** Same as --shell-header-bg in safe-area.css */
export const SHELL_HEADER_STATUS_BAR_COLOR = '#ffffff';

let configured = false;

/**
 * Native only: disable status bar overlay, match header background, dark system icons.
 * Call once at app startup (MobileLifecycleBridge).
 */
export async function configureNativeStatusBar(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  if (configured) return;
  configured = true;

  document.documentElement.classList.add('platform-native');

  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setBackgroundColor({ color: SHELL_HEADER_STATUS_BAR_COLOR });
    await StatusBar.setStyle({ style: Style.Dark });
  } catch (err) {
    console.warn('[status-bar] configureNativeStatusBar failed:', err);
  }
}

/** Re-apply after resume (some OEMs reset status bar). */
export async function refreshNativeStatusBar(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setBackgroundColor({ color: SHELL_HEADER_STATUS_BAR_COLOR });
    await StatusBar.setStyle({ style: Style.Dark });
  } catch (err) {
    console.warn('[status-bar] refreshNativeStatusBar failed:', err);
  }
}
