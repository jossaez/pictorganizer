import { BrowserRouter } from 'react-router-dom';
import { AppBootstrap } from './AppBootstrap';
import { AppRouter } from './router';
import { MobileLifecycleBridge } from './MobileLifecycleBridge';
import { DeviceProvider } from './providers/DeviceProvider';
import { AccessibilityProvider } from './providers/AccessibilityProvider';
import { CelebrationOverlay } from '@/components/feedback/CelebrationOverlay';

export function App() {
  return (
    <AppBootstrap>
      <BrowserRouter>
        <MobileLifecycleBridge />
        <AccessibilityProvider>
          <DeviceProvider>
            <AppRouter />
            <CelebrationOverlay />
          </DeviceProvider>
        </AccessibilityProvider>
      </BrowserRouter>
    </AppBootstrap>
  );
}
