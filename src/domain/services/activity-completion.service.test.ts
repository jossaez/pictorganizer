import { describe, expect, it } from 'vitest';
import { ActivityStatus } from '../enums';
import {
  canComplete,
  canSkip,
  canUndo,
  getNextStatus,
} from './activity-completion.service';

const pending = { status: ActivityStatus.Pending, computedState: 'pending' as const };
const inProgress = { status: ActivityStatus.Pending, computedState: 'in_progress' as const };
const completed = { status: ActivityStatus.Completed, computedState: 'completed' as const };
const skipped = { status: ActivityStatus.Skipped, computedState: 'skipped' as const };
const missed = { status: ActivityStatus.Pending, computedState: 'missed' as const };

describe('activity-completion.service', () => {
  it('pending puede completarse', () => {
    expect(canComplete(pending)).toBe(true);
    expect(getNextStatus('complete', pending, 'child')).toBe(ActivityStatus.Completed);
  });

  it('completed puede deshacerse en modo adulto', () => {
    expect(canUndo(completed, 'adult')).toBe(true);
    expect(getNextStatus('undo', completed, 'adult')).toBe(ActivityStatus.Pending);
  });

  it('skipped puede deshacerse en modo adulto', () => {
    expect(canUndo(skipped, 'adult')).toBe(true);
    expect(getNextStatus('undo', skipped, 'adult')).toBe(ActivityStatus.Pending);
  });

  it('child no puede saltar', () => {
    expect(canSkip(pending, 'child')).toBe(false);
    expect(canSkip(inProgress, 'child')).toBe(false);
    expect(canSkip(missed, 'child')).toBe(false);
    expect(getNextStatus('skip', pending, 'child')).toBeNull();
  });

  it('child no puede deshacer', () => {
    expect(canUndo(completed, 'child')).toBe(false);
    expect(canUndo(skipped, 'child')).toBe(false);
    expect(getNextStatus('undo', completed, 'child')).toBeNull();
  });

  it('missed puede completarse', () => {
    expect(canComplete(missed)).toBe(true);
    expect(getNextStatus('complete', missed, 'adult')).toBe(ActivityStatus.Completed);
  });

  it('adult puede saltar pending e in_progress', () => {
    expect(canSkip(pending, 'adult')).toBe(true);
    expect(canSkip(inProgress, 'adult')).toBe(true);
    expect(canSkip(missed, 'adult')).toBe(true);
  });
});
