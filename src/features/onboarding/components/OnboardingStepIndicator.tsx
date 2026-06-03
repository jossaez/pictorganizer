import { ONBOARDING_STEP_LABELS } from '@/features/onboarding/types/onboarding.types';
import { cn } from '@/utils/cn';

interface OnboardingStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingStepIndicator({ currentStep, totalSteps }: OnboardingStepIndicatorProps) {
  return (
    <div className="w-full" aria-label={`Paso ${currentStep + 1} de ${totalSteps}`}>
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }, (_, index) => (
          <span
            key={index}
            className={cn(
              'h-2 rounded-full transition-all',
              index === currentStep ? 'w-8 bg-[var(--color-primary)]' : 'w-2 bg-slate-200',
              index < currentStep && index !== currentStep && 'bg-[var(--color-primary)]/40',
            )}
            aria-hidden
          />
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-slate-500">
        {ONBOARDING_STEP_LABELS[currentStep]} · {currentStep + 1}/{totalSteps}
      </p>
    </div>
  );
}
