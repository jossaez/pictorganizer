import type { ProfileSettings } from '@/domain/types/entities';
import type { EnrichedActivityInstance } from '@/domain/services/activity-state.service';
import { ActivityCard } from '@/features/agenda/components/ActivityCard';
import { getChildDetailDisplay } from '@/features/child-mode/utils/child-detail-level';
import type { VisualTimerVariant } from '@/features/timer/components/VisualTimer';
import { formatMinutesAsTime } from '@/utils/formatTime';
import { cn } from '@/utils/cn';

interface DayTimelineProps {
  activities: EnrichedActivityInstance[];
  onComplete: (id: string) => void;
  onEdit?: (id: string) => void;
  onSkip?: (id: string) => void;
  onUndo?: (id: string) => void;
  disabled?: boolean;
  currentTimeMinutes?: number;
  showTimer?: boolean;
  timerVariant?: VisualTimerVariant;
  reduceMotion?: boolean;
  childMode?: boolean;
  profileSettings?: ProfileSettings;
}

export function DayTimeline({
  activities,
  onComplete,
  onEdit,
  onSkip,
  onUndo,
  disabled,
  currentTimeMinutes,
  showTimer = false,
  timerVariant = 'bar',
  reduceMotion = false,
  childMode = false,
  profileSettings,
}: DayTimelineProps) {
  if (activities.length === 0) return null;

  const childDetail = childMode
    ? getChildDetailDisplay(profileSettings?.childModeDetailLevel)
    : null;

  return (
    <div>
      <h3
        className={cn(
          'mb-4 font-semibold uppercase tracking-wide text-slate-500',
          childMode ? 'text-base' : 'text-sm',
        )}
      >
        {childMode ? 'Mi día' : 'Todo el día'}
      </h3>
      <ol className={cn('space-y-6', childMode && 'space-y-8')}>
        {activities.map((activity) => (
          <li
            key={activity.id}
            className={cn('relative', childMode ? 'pl-0' : 'pl-16')}
          >
            {!childMode && (
              <>
                <span
                  className="absolute left-0 top-5 w-14 text-right text-sm font-bold text-slate-500"
                  aria-hidden
                >
                  {formatMinutesAsTime(activity.startTimeMinutes)}
                </span>
                <span
                  className="absolute left-[3.75rem] top-6 h-full w-0.5 bg-slate-200 last:hidden"
                  aria-hidden
                />
              </>
            )}
            <ActivityCard
              activity={activity}
              userMode={childMode ? 'child' : 'adult'}
              onComplete={onComplete}
              onEdit={childMode ? undefined : onEdit}
              onSkip={childMode ? undefined : onSkip}
              onUndo={childMode ? undefined : onUndo}
              disabled={disabled}
              currentTimeMinutes={currentTimeMinutes}
              showTimer={showTimer}
              timerVariant={timerVariant}
              reduceMotion={reduceMotion}
              timerMode={
                showTimer && activity.computedState === 'in_progress'
                  ? 'compact'
                  : 'off'
              }
              hero={childMode}
              showStateBadge={childDetail ? childDetail.showStateBadge : true}
              showDetailToggle={childDetail ? childDetail.showDetailToggle : true}
              showTime={childDetail ? childDetail.showTime : true}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
