import { Calendar, Check, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';

interface OnboardingWelcomeIllustrationProps {
  reduceMotion?: boolean;
}

const ACTIVITY_ROWS = [
  { emoji: '🪥', barClass: 'bg-sky-200/70', rowClass: 'bg-sky-50', done: true },
  { emoji: '🍎', barClass: 'bg-violet-200/70', rowClass: 'bg-violet-50', done: false },
  { emoji: '🏠', barClass: 'bg-amber-200/70', rowClass: 'bg-amber-50', done: false },
] as const;

export function OnboardingWelcomeIllustration({
  reduceMotion = false,
}: OnboardingWelcomeIllustrationProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'onboarding-welcome-illustration relative mx-auto w-full max-w-[17rem] sm:max-w-xs',
        !reduceMotion && 'onboarding-welcome-float',
      )}
      aria-hidden
    >
      <div className="onboarding-welcome-card rounded-[1.75rem] bg-white p-5 shadow-lg shadow-blue-900/[0.06] ring-1 ring-slate-100/90 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[var(--color-primary)]">
              <Calendar className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800">{t('onboarding.welcome.illustrationDay')}</p>
              <p className="text-xs text-slate-500">{t('onboarding.welcome.illustrationSubtitle')}</p>
            </div>
          </div>
          <Sparkles className="h-4 w-4 text-amber-400" strokeWidth={2.25} />
        </div>

        <div className="space-y-2.5">
          {ACTIVITY_ROWS.map((row) => (
            <div
              key={row.emoji}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5',
                row.rowClass,
              )}
            >
              <span className="text-xl leading-none">{row.emoji}</span>
              <div className={cn('h-2 flex-1 rounded-full', row.barClass)} />
              {row.done ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              ) : (
                <span className="h-6 w-6 rounded-full bg-white/70 ring-1 ring-slate-200/80" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -bottom-2 -right-1 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl shadow-md ring-4 ring-[#F6F9FF]">
        😊
      </div>
    </div>
  );
}
