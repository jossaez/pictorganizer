import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Forward,
  Pencil,
  RotateCcw,
  Smile,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  canComplete,
  canSkip,
  canUndo,
} from '@/domain/services/activity-completion.service';
import type { EnrichedActivityInstance } from '@/domain/services/activity-state.service';
import { Button } from '@/components/ui/Button';
import { VisualAsset, type VisualAssetSize } from '@/components/media/VisualAsset';
import { VisualTimer, type VisualTimerVariant } from '@/features/timer/components/VisualTimer';
import {
  getCompletedEmoji,
  getStatusPresentation,
} from '@/features/agenda/utils/activityStatusPresentation';
import { useAccessibility } from '@/hooks/useAccessibility';
import { formatMinutesAsTime } from '@/utils/formatTime';
import { cn } from '@/utils/cn';

function cardVisualSize(hero: boolean, compact: boolean): VisualAssetSize {
  if (hero) return 'xl';
  if (compact) return 'md';
  return 'lg';
}

interface ActivityCardProps {
  activity: EnrichedActivityInstance;
  userMode?: 'child' | 'adult';
  onComplete: (id: string) => void;
  onEdit?: (id: string) => void;
  onSkip?: (id: string) => void;
  onUndo?: (id: string) => void;
  disabled?: boolean;
  compact?: boolean;
  hero?: boolean;
  showStateBadge?: boolean;
  showDetailToggle?: boolean;
  showTime?: boolean;
  currentTimeMinutes?: number;
  showTimer?: boolean;
  timerVariant?: VisualTimerVariant;
  reduceMotion?: boolean;
  timerMode?: 'full' | 'compact' | 'off';
}

export function ActivityCard({
  activity,
  userMode = 'child',
  onComplete,
  onEdit,
  onSkip,
  onUndo,
  disabled = false,
  compact = false,
  hero = false,
  showStateBadge = true,
  showDetailToggle = true,
  showTime = true,
  currentTimeMinutes,
  showTimer = false,
  timerVariant = 'bar',
  reduceMotion: reduceMotionProp = false,
  timerMode = 'off',
}: ActivityCardProps) {
  const { t } = useTranslation();
  const [detailOpen, setDetailOpen] = useState(false);
  const { largeText, reduceMotion: reduceMotionPref, text, buttonTouch } = useAccessibility();
  const effectiveReduceMotion = reduceMotionProp || reduceMotionPref;
  const presentation = getStatusPresentation(activity.computedState);
  const StatusIcon = presentation.icon;

  const ctx = { status: activity.status, computedState: activity.computedState };
  const showComplete = canComplete(ctx);
  const showSkip = canSkip(ctx, userMode) && !!onSkip;
  const showUndo = canUndo(ctx, userMode) && !!onUndo;

  const isTerminal =
    activity.computedState === 'completed' || activity.computedState === 'skipped';

  const canShowTimer =
    activity.computedState === 'pending' || activity.computedState === 'in_progress';

  const showFullTimer =
    showTimer && timerMode === 'full' && currentTimeMinutes != null && canShowTimer;

  const showCompactTimer =
    showTimer &&
    timerMode === 'compact' &&
    currentTimeMinutes != null &&
    activity.computedState === 'in_progress';

  const visualSize = cardVisualSize(hero, compact);

  const completeLabel =
    activity.computedState === 'missed' ? t('activity.markAsDone') : t('activity.done');

  const completeAriaLabel = t('activity.markCompleteAria', { title: activity.title });

  return (
    <article
      data-activity-state={activity.computedState}
      aria-label={`${activity.title}, ${presentation.label}`}
      className={cn(
        'rounded-3xl bg-white shadow-sm ring-1',
        hero ? 'p-6 md:p-8' : 'p-4 md:p-5',
        presentation.ringClass,
        isTerminal && 'opacity-90',
        (activity.computedState === 'in_progress' || hero) &&
          !isTerminal &&
          'activity-card-emphasis ring-2 ring-[var(--color-primary)] shadow-lg',
        !effectiveReduceMotion &&
          (activity.computedState === 'in_progress' || hero) &&
          !isTerminal &&
          'scale-[1.01]',
      )}
    >
      <div className="flex gap-4">
        <VisualAsset
          visual={activity.visual}
          size={visualSize}
          alt={activity.title}
          categoryId={activity.categoryId}
          className={presentation.pictogramClass}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {showTime && (
              <span
                className={cn(
                  'font-bold text-[var(--color-primary)]',
                  hero ? 'text-xl md:text-2xl' : 'text-sm md:text-base',
                )}
              >
                {formatMinutesAsTime(activity.startTimeMinutes)}
              </span>
            )}
            {showStateBadge && (
              <span
                className={cn(
                  'a11y-status-badge inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold',
                  largeText ? 'text-sm' : 'text-xs',
                  presentation.badgeClass,
                )}
              >
                {activity.computedState === 'completed' ? (
                  <span className="text-base" aria-hidden>
                    {getCompletedEmoji()}
                  </span>
                ) : (
                  <StatusIcon className="h-3.5 w-3.5" aria-hidden />
                )}
                {presentation.label}
              </span>
            )}
          </div>

          <h3
            className={cn(
              'mt-1 font-bold text-slate-900',
              hero
                ? cn(largeText ? text['3xl'] : 'text-2xl md:text-3xl')
                : cn(largeText ? text.xl : 'text-lg md:text-xl'),
              activity.computedState === 'completed' && 'text-emerald-900',
            )}
          >
            {activity.title}
          </h3>

          {activity.computedState === 'completed' && (
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <Smile className="h-5 w-5" aria-hidden />
              {t('activity.done')}
            </p>
          )}

          {activity.isException && !hero && (
            <p className="mt-1 text-xs font-medium text-amber-600">{t('activity.onlyToday')}</p>
          )}

          {activity.description && showDetailToggle && (
            <div className="mt-2">
              <button
                type="button"
                className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-[var(--color-primary)]"
                onClick={() => setDetailOpen((o) => !o)}
                aria-expanded={detailOpen}
              >
                {detailOpen ? (
                  <>
                    {t('activity.hideDetail')} <ChevronUp className="h-4 w-4" aria-hidden />
                  </>
                ) : (
                  <>
                    {t('activity.showDetail')} <ChevronDown className="h-4 w-4" aria-hidden />
                  </>
                )}
              </button>
              {detailOpen && (
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{activity.description}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {showFullTimer && (
        <div className="mt-4">
          <VisualTimer
            startTimeMinutes={activity.startTimeMinutes}
            endTimeMinutes={activity.endTimeMinutes}
            currentTimeMinutes={currentTimeMinutes}
            title={activity.title}
            variant={timerVariant}
            reduceMotion={effectiveReduceMotion}
          />
        </div>
      )}

      {showCompactTimer && (
        <div className="mt-3">
          <VisualTimer
            startTimeMinutes={activity.startTimeMinutes}
            endTimeMinutes={activity.endTimeMinutes}
            currentTimeMinutes={currentTimeMinutes}
            title={activity.title}
            variant="bar"
            reduceMotion={effectiveReduceMotion}
            compact
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {showComplete && (
          <Button
            variant="success"
            fullWidth={!compact && !showSkip}
            className={cn(
              'flex-1 gap-2 a11y-focus-ring',
              hero
                ? cn(buttonTouch, largeText ? 'text-2xl md:min-h-20' : 'min-h-16 text-xl md:min-h-20 md:text-2xl')
                : cn(buttonTouch, largeText ? 'text-lg' : 'min-h-14 text-base'),
              compact && 'min-h-12',
            )}
            disabled={disabled}
            onClick={() => onComplete(activity.id)}
            aria-label={completeAriaLabel}
          >
            <CheckCircle2 className={cn(hero ? 'h-8 w-8' : 'h-6 w-6')} aria-hidden />
            {completeLabel}
          </Button>
        )}

        {showSkip && (
          <Button
            variant="secondary"
            className="min-h-14 gap-2 text-base"
            disabled={disabled}
            onClick={() => onSkip!(activity.id)}
            aria-label={t('activity.skipActivityAria', { title: activity.title })}
          >
            <Forward className="h-5 w-5" aria-hidden />
            {t('activity.skip')}
          </Button>
        )}

        {showUndo && (
          <Button
            variant="secondary"
            fullWidth={!compact}
            className={cn('min-h-14 gap-2 text-base', !compact && 'flex-1')}
            disabled={disabled}
            onClick={() => onUndo!(activity.id)}
            aria-label={t('activity.undoActivityAria', { title: activity.title })}
          >
            <RotateCcw className="h-5 w-5" aria-hidden />
            {t('activity.undo')}
          </Button>
        )}

        {onEdit && userMode === 'adult' && !isTerminal && (
          <Button
            variant="ghost"
            className="min-h-14 gap-2"
            disabled={disabled}
            onClick={() => onEdit(activity.id)}
            aria-label={t('activity.editAria', { title: activity.title })}
          >
            <Pencil className="h-5 w-5" aria-hidden />
            {t('activity.edit')}
          </Button>
        )}
      </div>
    </article>
  );
}
