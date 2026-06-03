import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { AccessibilityProvider } from '@/app/providers/AccessibilityProvider';
import { DeviceProvider } from '@/app/providers/DeviceProvider';

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <AccessibilityProvider>
      <DeviceProvider>{children}</DeviceProvider>
    </AccessibilityProvider>
  );
}

export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
