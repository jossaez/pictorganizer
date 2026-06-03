import { useLiveQuery } from 'dexie-react-hooks';
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { ChildModeDetailLevel } from '@/domain/enums';
import { profileRepository } from '@/infrastructure/repositories';
import { useAppStore } from '@/store/app.store';
import { cn } from '@/utils/cn';

export interface AccessibilityContextValue {
  largeText: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
  childModeDetailLevel: ChildModeDetailLevel;
  /** Root wrapper classes derived from preferences */
  rootClassName: string;
  /** Typography helpers */
  text: {
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  buttonTouch: string;
}

const defaultContext: AccessibilityContextValue = {
  largeText: false,
  reduceMotion: false,
  highContrast: false,
  childModeDetailLevel: ChildModeDetailLevel.Standard,
  rootClassName: '',
  text: {
    base: 'a11y-text-base',
    lg: 'a11y-text-lg',
    xl: 'a11y-text-xl',
    '2xl': 'a11y-text-2xl',
    '3xl': 'a11y-text-3xl',
  },
  buttonTouch: 'a11y-btn-touch',
};

const AccessibilityContext = createContext<AccessibilityContextValue>(defaultContext);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const largeText = useAppStore((s) => s.largeText);
  const reduceMotion = useAppStore((s) => s.reduceMotion);
  const highContrast = useAppStore((s) => s.highContrast);
  const activeProfileId = useAppStore((s) => s.activeProfileId);

  const profileSettings = useLiveQuery(
    async () => {
      if (!activeProfileId) return undefined;
      return profileRepository.getSettingsByProfileId(activeProfileId);
    },
    [activeProfileId],
  );

  const childModeDetailLevel =
    profileSettings?.childModeDetailLevel ?? ChildModeDetailLevel.Standard;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.largeText = String(largeText);
    root.dataset.reduceMotion = String(reduceMotion);
    root.dataset.highContrast = String(highContrast);
  }, [largeText, reduceMotion, highContrast]);

  const value = useMemo(
    (): AccessibilityContextValue => ({
      largeText,
      reduceMotion,
      highContrast,
      childModeDetailLevel,
      rootClassName: cn(
        largeText && 'text-lg',
        highContrast && 'high-contrast',
      ),
      text: defaultContext.text,
      buttonTouch: 'a11y-btn-touch',
    }),
    [childModeDetailLevel, highContrast, largeText, reduceMotion],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      <div className={value.rootClassName}>{children}</div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextValue {
  return useContext(AccessibilityContext);
}
