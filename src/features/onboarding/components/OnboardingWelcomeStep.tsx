import { CalendarHeart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '@/hooks/useAccessibility';
import { OnboardingWelcomeIllustration } from '@/features/onboarding/components/OnboardingWelcomeIllustration';
import { cn } from '@/utils/cn';

export function OnboardingWelcomeStep() {
  const { t } = useTranslation();
  const { largeText, text, reduceMotion } = useAccessibility();

  return (
    <div className="flex w-full flex-col items-center text-center">
      <OnboardingWelcomeIllustration reduceMotion={reduceMotion} />

      <div className="mt-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white shadow-md shadow-blue-900/15">
        <CalendarHeart className="h-7 w-7" strokeWidth={2.25} aria-hidden />
      </div>

      <p
        className={cn(
          'mt-4 font-semibold tracking-[0.12em] text-[var(--color-primary)]',
          largeText ? text.base : 'text-sm',
        )}
      >
        {t('app.name')}
      </p>

      <h1
        className={cn(
          'mt-2 font-bold text-slate-900',
          largeText ? text['3xl'] : 'text-3xl sm:text-4xl',
        )}
      >
        {t('onboarding.welcome.title')}
      </h1>

      <p
        className={cn(
          'mx-auto mt-4 max-w-[18rem] leading-snug text-slate-600 sm:max-w-xs',
          largeText ? text.lg : 'text-base sm:text-lg',
        )}
      >
        {t('onboarding.welcome.tagline1')}
        <br />
        {t('onboarding.welcome.tagline2')}
      </p>
    </div>
  );
}
