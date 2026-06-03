import { ActivityStatus } from '../enums';
import type { ComputedActivityState } from './activity-state.service';

export type CompletionUserMode = 'child' | 'adult';
export type CompletionAction = 'complete' | 'skip' | 'undo';

export interface ActivityForCompletion {
  status: ActivityStatus;
  computedState: ComputedActivityState;
}

export function canComplete(activity: ActivityForCompletion): boolean {
  const { computedState } = activity;
  return (
    computedState === 'pending' ||
    computedState === 'in_progress' ||
    computedState === 'missed'
  );
}

export function canSkip(activity: ActivityForCompletion, userMode: CompletionUserMode): boolean {
  if (userMode === 'child') return false;
  const { computedState } = activity;
  return (
    computedState === 'pending' ||
    computedState === 'in_progress' ||
    computedState === 'missed'
  );
}

export function canUndo(activity: ActivityForCompletion, userMode: CompletionUserMode): boolean {
  if (userMode === 'child') return false;
  const { computedState } = activity;
  return computedState === 'completed' || computedState === 'skipped';
}

export function getNextStatus(
  action: CompletionAction,
  activity: ActivityForCompletion,
  userMode: CompletionUserMode,
): ActivityStatus | null {
  switch (action) {
    case 'complete':
      return canComplete(activity) ? ActivityStatus.Completed : null;
    case 'skip':
      return canSkip(activity, userMode) ? ActivityStatus.Skipped : null;
    case 'undo':
      return canUndo(activity, userMode) ? ActivityStatus.Pending : null;
    default:
      return null;
  }
}
