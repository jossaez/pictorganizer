import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { OnboardingStepIndicator } from './OnboardingStepIndicator';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  showBack?: boolean;
  showNext?: boolean;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLoading?: boolean;
  onBack?: () => void;
  onNext?: () => void;
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  showBack = true,
  showNext = true,
  nextLabel = 'Continuar',
  nextDisabled = false,
  isLoading = false,
  onBack,
  onNext,
}: OnboardingLayoutProps) {
  return (
    <div className="flex min-h-full flex-col bg-[var(--color-bg)]">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6 md:max-w-2xl md:px-8 md:py-10">
        {currentStep > 0 && (
          <div className="mb-8">
            <OnboardingStepIndicator currentStep={currentStep} totalSteps={totalSteps} />
          </div>
        )}

        <div className="flex flex-1 flex-col justify-center">{children}</div>

        {(showBack || showNext) && (
          <div className="mt-8 flex gap-3 pt-4">
            {showBack && currentStep > 0 ? (
              <Button variant="secondary" className="flex-1" onClick={onBack} disabled={isLoading}>
                Atrás
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
                {nextLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
