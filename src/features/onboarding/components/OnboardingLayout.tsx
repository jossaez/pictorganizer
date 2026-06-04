import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { OnboardingStepIndicator } from './OnboardingStepIndicator';
import { cn } from '@/utils/cn';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  showBack?: boolean;
  showNext?: boolean;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLoading?: boolean;
  welcomeMode?: boolean;
  onBack?: () => void;
  onNext?: () => void;
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  showBack = true,
  showNext = true,
  nextLabel,
  nextDisabled = false,
  isLoading = false,
  welcomeMode = false,
  onBack,
  onNext,
}: OnboardingLayoutProps) {
  const { t } = useTranslation();
  const resolvedNextLabel = nextLabel ?? t('common.continue');

  return (
    <div
      className={cn(
        'safe-top safe-x safe-bottom flex min-h-[100dvh] flex-col',
        welcomeMode
          ? 'onboarding-welcome-screen bg-gradient-to-b from-[#F6F9FF] to-[#EEF3FA]'
          : 'bg-[var(--color-bg)]',
      )}
    >
      <div
        className={cn(
          'mx-auto flex w-full max-w-lg flex-1 flex-col md:max-w-2xl',
          welcomeMode ? 'px-5 py-5' : 'px-4 py-6 md:px-8 md:py-10',
        )}
      >
        {currentStep > 0 && (
          <div className="mb-8 shrink-0">
            <OnboardingStepIndicator currentStep={currentStep} totalSteps={totalSteps} />
          </div>
        )}

        <div
          className={cn(
            'flex min-h-0 flex-1 flex-col',
            welcomeMode ? 'justify-center overflow-y-auto py-2 sm:py-4' : 'justify-center',
          )}
        >
          {children}
        </div>

        {(showBack || showNext) && (
          <div
            className={cn(
              'shrink-0',
              welcomeMode ? 'mt-6 pt-2 sm:mt-8' : 'mt-8 flex gap-3 pt-4',
            )}
          >
            {welcomeMode ? (
              showNext && (
                <Button
                  fullWidth
                  className="min-h-14 gap-2 rounded-[18px] text-base shadow-lg shadow-blue-900/10"
                  onClick={onNext}
                  disabled={nextDisabled || isLoading}
                >
                  {resolvedNextLabel}
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Button>
              )
            ) : (
              <>
                {showBack && currentStep > 0 ? (
                  <Button variant="secondary" className="flex-1" onClick={onBack} disabled={isLoading}>
                    {t('common.back')}
                  </Button>
                ) : (
                  <div className="flex-1" />
                )}
                {showNext && (
                  <Button
                    className="flex-1"
                    onClick={onNext}
                    disabled={nextDisabled || isLoading}
                  >
                    {resolvedNextLabel}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
