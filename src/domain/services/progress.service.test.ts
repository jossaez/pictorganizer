import { describe, expect, it } from 'vitest';
import { ActivityStatus } from '../enums';
import type { ActivityInstance } from '../types';
import type { ComputedActivityState } from './activity-state.service';
import { calculateDailyProgress, calculateWeeklyProgress } from './progress.service';
import { getWeekDays } from '../../utils/date';

function instance(
  overrides: Partial<ActivityInstance> & { computedState?: ComputedActivityState } = {},
): ActivityInstance & { computedState?: ComputedActivityState } {
  return {
    id: overrides.id ?? 'test-instance-id',
    profileId: 'p1',
    date: '2026-06-03',
    title: 'Test',
    categoryId: 'food',
    startTimeMinutes: 480,
    visual: { type: 'pictogram', pictogramId: 'breakfast' },
    visibility: 'visible' as ActivityInstance['visibility'],
    status: ActivityStatus.Pending,
    isException: false,
    sortOrder: 0,
    createdAt: '2026-06-03T08:00:00Z',
    updatedAt: '2026-06-03T08:00:00Z',
    syncStatus: 'local' as ActivityInstance['syncStatus'],
    revision: 1,
    ...overrides,
  };
}

describe('progress.service', () => {
  it('calcula total correcto', () => {
    const progress = calculateDailyProgress([
      instance({ id: '1' }),
      instance({ id: '2' }),
      instance({ id: '3' }),
    ]);
    expect(progress.total).toBe(3);
  });

  it('calcula completed correcto', () => {
    const progress = calculateDailyProgress([
      instance({ id: '1', status: ActivityStatus.Completed, computedState: 'completed' }),
      instance({ id: '2' }),
    ]);
    expect(progress.completed).toBe(1);
  });

  it('calcula pending e in_progress', () => {
    const progress = calculateDailyProgress([
      instance({ id: '1', computedState: 'pending' }),
      instance({ id: '2', computedState: 'in_progress' }),
    ]);
    expect(progress.pending).toBe(2);
  });

  it('calcula skipped correcto', () => {
    const progress = calculateDailyProgress([
      instance({ id: '1', status: ActivityStatus.Skipped, computedState: 'skipped' }),
    ]);
    expect(progress.skipped).toBe(1);
  });

  it('ignora deletedAt', () => {
    const progress = calculateDailyProgress([
      instance({ id: '1' }),
      instance({ id: '2', deletedAt: '2026-06-03T10:00:00Z' }),
    ]);
    expect(progress.total).toBe(1);
  });

  it('calcula completionRate correcto', () => {
    const progress = calculateDailyProgress([
      instance({ id: '1', status: ActivityStatus.Completed, computedState: 'completed' }),
      instance({ id: '2' }),
      instance({ id: '3' }),
      instance({ id: '4' }),
    ]);
    expect(progress.completionRate).toBe(0.25);
  });

  it('total 0 no divide por cero', () => {
    const progress = calculateDailyProgress([]);
    expect(progress.completionRate).toBe(0);
    expect(progress.total).toBe(0);
  });

  it('isComplete false si no hay actividades', () => {
    expect(calculateDailyProgress([]).isComplete).toBe(false);
  });

  it('isComplete true si completed + skipped >= total', () => {
    const progress = calculateDailyProgress([
      instance({ id: '1', status: ActivityStatus.Completed, computedState: 'completed' }),
      instance({ id: '2', status: ActivityStatus.Completed, computedState: 'completed' }),
      instance({ id: '3', status: ActivityStatus.Skipped, computedState: 'skipped' }),
    ]);
    expect(progress.isComplete).toBe(true);
  });

  it('cuenta missed desde computedState', () => {
    const progress = calculateDailyProgress([
      instance({ id: '1', computedState: 'missed' }),
      instance({ id: '2', status: ActivityStatus.Missed, computedState: 'missed' }),
    ]);
    expect(progress.missed).toBe(2);
    expect(progress.isComplete).toBe(false);
  });
});

describe('calculateWeeklyProgress', () => {
  const weekDates = getWeekDays('2026-06-03'); // Mon 2026-06-01 … Sun 2026-06-07

  it('genera 7 días', () => {
    const weekly = calculateWeeklyProgress({}, weekDates);
    expect(weekly.days).toHaveLength(7);
    expect(weekly.startDate).toBe('2026-06-01');
    expect(weekly.endDate).toBe('2026-06-07');
  });

  it('agregado total correcto', () => {
    const byDate = {
      '2026-06-01': [
        instance({ id: '1', date: '2026-06-01', status: ActivityStatus.Completed, computedState: 'completed' }),
        instance({ id: '2', date: '2026-06-01' }),
      ],
      '2026-06-02': [instance({ id: '3', date: '2026-06-02' })],
    };
    const weekly = calculateWeeklyProgress(byDate, weekDates);
    expect(weekly.totalActivities).toBe(3);
    expect(weekly.completedActivities).toBe(1);
    expect(weekly.pendingActivities).toBe(2);
  });

  it('weeklyCompletionRate correcto', () => {
    const byDate = {
      '2026-06-01': [
        instance({ id: '1', date: '2026-06-01', status: ActivityStatus.Completed, computedState: 'completed' }),
        instance({ id: '2', date: '2026-06-01', status: ActivityStatus.Completed, computedState: 'completed' }),
      ],
    };
    const weekly = calculateWeeklyProgress(byDate, weekDates);
    expect(weekly.weeklyCompletionRate).toBe(1);
  });

  it('días sin actividades', () => {
    const weekly = calculateWeeklyProgress({}, weekDates);
    expect(weekly.days.every((d) => d.total === 0)).toBe(true);
    expect(weekly.totalActivities).toBe(0);
    expect(weekly.weeklyCompletionRate).toBe(0);
  });

  it('ignora deletedAt', () => {
    const byDate = {
      '2026-06-01': [
        instance({ id: '1', date: '2026-06-01' }),
        instance({ id: '2', date: '2026-06-01', deletedAt: '2026-06-01T10:00:00Z' }),
      ],
    };
    const weekly = calculateWeeklyProgress(byDate, weekDates);
    expect(weekly.totalActivities).toBe(1);
  });

  it('cuenta skipped', () => {
    const byDate = {
      '2026-06-01': [
        instance({ id: '1', date: '2026-06-01', status: ActivityStatus.Skipped, computedState: 'skipped' }),
      ],
    };
    const weekly = calculateWeeklyProgress(byDate, weekDates);
    expect(weekly.skippedActivities).toBe(1);
  });

  it('cuenta missed', () => {
    const byDate = {
      '2026-06-01': [instance({ id: '1', date: '2026-06-01', computedState: 'missed' })],
    };
    const weekly = calculateWeeklyProgress(byDate, weekDates);
    expect(weekly.missedActivities).toBe(1);
  });

  it('completedDays correcto', () => {
    const byDate = {
      '2026-06-01': [
        instance({ id: '1', date: '2026-06-01', status: ActivityStatus.Completed, computedState: 'completed' }),
        instance({ id: '2', date: '2026-06-01', status: ActivityStatus.Skipped, computedState: 'skipped' }),
      ],
      '2026-06-02': [instance({ id: '3', date: '2026-06-02' })],
    };
    const weekly = calculateWeeklyProgress(byDate, weekDates);
    expect(weekly.completedDays).toBe(1);
  });

  it('total 0 no divide por cero', () => {
    const weekly = calculateWeeklyProgress({}, weekDates);
    expect(weekly.weeklyCompletionRate).toBe(0);
    expect(weekly.completedDays).toBe(0);
  });
});
