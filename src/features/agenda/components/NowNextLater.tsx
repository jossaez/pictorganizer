import { useMemo } from 'react';
import { ChildModeDetailLevel } from '@/domain/enums';
import { canComplete } from '@/domain/services/activity-completion.service';
import type { ActivityInstance } from '@/domain/types';
import type { ProfileSettings } from '@/domain/types/entities';
import { getNowNextLater } from '@/domain/services/anticipation.service';
import type { EnrichedActivityInstance } from '@/domain/services/activity-state.service';
import { VisualAsset } from '@/components/media/VisualAsset';
import { ActivityCard } from '@/features/agenda/components/ActivityCard';
import { getStatusPresentation } from '@/features/agenda/utils/activityStatusPresentation';
import { getChildDetailDisplay } from '@/features/child-mode/utils/child-detail-level';
import { profileTimerVariant, type VisualTimerVariant } from '@/features/timer/components/VisualTimer';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useDevice } from '@/hooks/useDevice';
import { formatMinutesAsTime } from '@/utils/formatTime';
import { cn } from '@/utils/cn';

interface NowNextLaterProps {
  activities: ActivityInstance[];
  currentTimeMinutes: number;
  date: string;
  todayDate: string;
  profileSettings?: ProfileSettings;
  userMode?: 'child' | 'adult';
  onComplete: (id: string) => void;
  onEdit?: (id: string) => void;
  onSkip?: (id: string) => void;
  onUndo?: (id: string) => void;
  disabled?: boolean;
  reduceMotion?: boolean;
}

interface SlotCardProps {
  label: string;
  activity: EnrichedActivityInstance | null;
  emptyMessage: string;
  childMode: boolean;
  showDetail: boolean;
  onComplete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onSkip?: (id: string) => void;
  onUndo?: (id: string) => void;
  disabled?: boolean;
  userMode: 'child' | 'adult';
  variant: 'hero' | 'compact';
  currentTimeMinutes: number;
  showTimer: boolean;
  timerVariant: VisualTimerVariant;
  reduceMotion: boolean;
  childDetail: ReturnType<typeof getChildDetailDisplay> | null;
  largeText: boolean;
}

function SlotCard({
  label,
  activity,
  emptyMessage,
  childMode,
  showDetail,
  onComplete,
  onEdit,
  onSkip,
  onUndo,
  disabled,
  userMode,
  variant,
  currentTimeMinutes,
  showTimer,
  timerVariant,
  reduceMotion,
  childDetail,
  largeText,
}: SlotCardProps) {
  const isHero = variant === 'hero';

  if (!activity) {
    return (
      <div
        className={cn(
          'rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-5 text-center',
          isHero && 'py-8',
        )}
        role="region"
        aria-label={label}
      >
        <p
          className={cn(
            'font-bold uppercase tracking-wide text-slate-400',
            isHero ? (childMode ? (largeText ? 'text-2xl' : 'text-xl md:text-2xl') : 'text-base md:text-lg') : childMode ? (largeText ? 'text-lg' : 'text-base') : 'text-sm',
          )}
        >
          {label}
        </p>
        <p className={cn('mt-2 text-slate-500', isHero ? 'text-base' : 'text-sm')}>
          {emptyMessage}
        </p>
      </div>
    );
  }

  if (isHero) {
    const ctx = { status: activity.status, computedState: activity.computedState };
    const actionable = canComplete(ctx) || (userMode === 'adult' && onUndo);

    return (
      <div role="region" aria-label={`${label}: ${activity.title}`}>
        <p
          className={cn(
            'mb-3 font-bold uppercase tracking-wide text-[var(--color-primary)]',
            childMode ? (largeText ? 'text-2xl' : 'text-xl md:text-2xl') : 'text-sm md:text-base',
          )}
        >
          {label}
        </p>
        <ActivityCard
          activity={activity}
          userMode={userMode}
          onComplete={onComplete!}
          onEdit={childMode ? undefined : onEdit}
          onSkip={childMode ? undefined : onSkip}
          onUndo={childMode ? undefined : onUndo}
          disabled={disabled}
          compact={false}
          showStateBadge={childDetail ? childDetail.showStateBadge : !childMode}
          showDetailToggle={
            childDetail
              ? childDetail.showDetailToggle && !!activity.description
              : showDetail && !!activity.description
          }
          showTime={childDetail ? childDetail.showTime : true}
          currentTimeMinutes={currentTimeMinutes}
          showTimer={showTimer}
          timerVariant={timerVariant}
          reduceMotion={reduceMotion}
          timerMode={showTimer ? 'full' : 'off'}
          hero={childMode || isHero}
        />
        {childMode && actionable && canComplete(ctx) && (
          <p className="sr-only">
            Pulsa el botón grande para marcar {activity.title} como completada
          </p>
        )}
      </div>
    );
  }

  const ctx = { status: activity.status, computedState: activity.computedState };
  const statusPresentation = getStatusPresentation(activity.computedState);

  return (
    <article
      data-activity-state={activity.computedState}
      className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
      role="region"
      aria-label={`${label}: ${activity.title}, ${statusPresentation.label}`}
    >
      <p className={cn('font-bold uppercase tracking-wide text-slate-500', largeText ? 'text-base' : 'text-sm')}>{label}</p>

      <div className="mt-3 flex items-center gap-3">
        <VisualAsset
          visual={activity.visual}
          size={childMode ? 'lg' : 'sm'}
          alt={activity.title}
          categoryId={activity.categoryId}
        />
        <div className="min-w-0 flex-1">
          {(childDetail?.showTime ?? !childMode) && (
            <p className={cn('font-bold text-[var(--color-primary)]', childMode ? 'text-lg' : 'text-sm')}>
              {formatMinutesAsTime(activity.startTimeMinutes)}
            </p>
          )}
          <h3 className={cn('font-bold text-slate-900', childMode ? (largeText ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl') : largeText ? 'text-lg' : 'text-base')}>
            {activity.title}
          </h3>
          {!childMode && (
            <span
              className={cn(
                'mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold',
                largeText ? 'text-sm' : 'text-xs',
                statusPresentation.badgeClass,
              )}
            >
              {statusPresentation.label}
            </span>
          )}
        </div>
      </div>

      {!childMode && canComplete(ctx) && onComplete && (
        <div className="mt-3 flex gap-2">
          {onEdit && (
            <button
              type="button"
              className="a11y-focus-ring min-h-10 rounded-xl px-3 text-sm font-medium text-[var(--color-primary)] ring-1 ring-slate-200"
              disabled={disabled}
              onClick={() => onEdit(activity.id)}
              aria-label={`Editar ${activity.title}`}
            >
              Editar
            </button>
          )}
          {onSkip && (
            <button
              type="button"
              className="a11y-focus-ring min-h-10 rounded-xl px-3 text-sm font-medium text-slate-600 ring-1 ring-slate-200"
              disabled={disabled}
              onClick={() => onSkip(activity.id)}
              aria-label={`Saltar ${activity.title}`}
            >
              Saltar
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export function NowNextLater({
  activities,
  currentTimeMinutes,
  date,
  todayDate,
  profileSettings,
  userMode = 'child',
  onComplete,
  onEdit,
  onSkip,
  onUndo,
  disabled,
  reduceMotion: reduceMotionProp = false,
}: NowNextLaterProps) {
  const { largeText, reduceMotion: reduceMotionPref } = useAccessibility();
  const reduceMotion = reduceMotionProp || reduceMotionPref;
  const childMode = userMode === 'child';
  const childDetail = childMode
    ? getChildDetailDisplay(profileSettings?.childModeDetailLevel)
    : null;
  const showDetail =
    !childMode ||
    profileSettings?.childModeDetailLevel === ChildModeDetailLevel.Detailed;

  const showTimer = profileSettings?.showTimer ?? true;
  const timerVariant: VisualTimerVariant = childMode
    ? 'blocks'
    : profileTimerVariant(profileSettings?.timerStyle);
  const { isEffectiveTablet } = useDevice();

  const { nowActivity, nextActivity, laterActivity, dayCompleted } = useMemo(
    () =>
      getNowNextLater(activities, currentTimeMinutes, {
        date,
        todayDate,
      }),
    [activities, currentTimeMinutes, date, todayDate],
  );

  if (profileSettings && !profileSettings.showAnticipation) {
    return null;
  }

  if (dayCompleted) {
    return (
      <div
        className="rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 p-8 text-center ring-1 ring-emerald-100"
        role="status"
      >
        <p className={cn('font-bold text-emerald-900', childMode ? 'text-2xl' : 'text-xl')}>
          Hoy ya está todo completado
        </p>
        {!childMode && (
          <p className="mt-2 text-sm text-emerald-700">Todas las actividades del día están hechas.</p>
        )}
      </div>
    );
  }

  const hasAnySlot = nowActivity || nextActivity || laterActivity;

  if (!hasAnySlot && activities.filter((a) => !a.deletedAt).length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'grid gap-4',
        childMode && isEffectiveTablet && 'grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-6',
        childMode && !isEffectiveTablet && 'gap-6',
        !childMode && isEffectiveTablet && 'grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4',
        !childMode && !isEffectiveTablet && 'gap-4',
      )}
      aria-label="Anticipación del día"
    >
      <SlotCard
          label="Ahora"
          activity={nowActivity}
          emptyMessage="No hay actividad ahora"
          childMode={childMode}
          userMode={userMode}
          showDetail={showDetail}
          onComplete={onComplete}
          onEdit={onEdit}
          onSkip={onSkip}
          onUndo={onUndo}
          disabled={disabled}
          variant="hero"
          currentTimeMinutes={currentTimeMinutes}
          showTimer={showTimer}
          timerVariant={timerVariant}
          reduceMotion={reduceMotion}
          childDetail={childDetail}
          largeText={largeText}
        />

      <SlotCard
        label="Después"
        activity={nextActivity}
        emptyMessage="No hay más actividades programadas"
        childMode={childMode}
        userMode={userMode}
        showDetail={false}
        onComplete={onComplete}
        onSkip={onSkip}
        disabled={disabled}
        variant="compact"
        currentTimeMinutes={currentTimeMinutes}
        showTimer={false}
        timerVariant={timerVariant}
        reduceMotion={reduceMotion}
        childDetail={childDetail}
        largeText={largeText}
      />

      <SlotCard
        label="Más tarde"
        activity={laterActivity}
        emptyMessage="No hay más actividades programadas"
        childMode={childMode}
        userMode={userMode}
        showDetail={false}
        onComplete={onComplete}
        onSkip={onSkip}
        disabled={disabled}
        variant="compact"
        currentTimeMinutes={currentTimeMinutes}
        showTimer={false}
        timerVariant={timerVariant}
        reduceMotion={reduceMotion}
        childDetail={childDetail}
        largeText={largeText}
      />
    </div>
  );
}
