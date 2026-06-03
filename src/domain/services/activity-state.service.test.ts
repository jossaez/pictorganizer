import { describe, expect, it } from 'vitest';
import { ActivityStatus } from '../enums';
import type { ActivityInstance } from '../types';
import {
  computeActivityState,
  enrichActivities,
  getEndTimeMinutes,
} from './activity-state.service';

function baseInstance(overrides: Partial<ActivityInstance> = {}): ActivityInstance {
  return {
    id: '1',
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

describe('activity-state.service', () => {
  it('uses default 30 min duration when endTime is missing', () => {
    expect(getEndTimeMinutes(baseInstance({ startTimeMinutes: 480 }))).toBe(510);
  });

  it('marks activity in progress during its time window', () => {
    const state = computeActivityState(baseInstance({ startTimeMinutes: 480 }), {
      date: '2026-06-03',
      todayDate: '2026-06-03',
      nowMinutes: 490,
    });
    expect(state).toBe('in_progress');
  });

  it('marks past pending activity as missed on today', () => {
    const state = computeActivityState(baseInstance({ startTimeMinutes: 480 }), {
      date: '2026-06-03',
      todayDate: '2026-06-03',
      nowMinutes: 600,
    });
    expect(state).toBe('missed');
  });

  it('respects completed status', () => {
    const state = computeActivityState(
      baseInstance({ status: ActivityStatus.Completed }),
      { date: '2026-06-03', todayDate: '2026-06-03', nowMinutes: 490 },
    );
    expect(state).toBe('completed');
  });

  it('enriches activities sorted by start time', () => {
    const enriched = enrichActivities(
      [
        baseInstance({ id: 'b', startTimeMinutes: 540 }),
        baseInstance({ id: 'a', startTimeMinutes: 480 }),
      ],
      { date: '2026-06-03', todayDate: '2026-06-03', nowMinutes: 485 },
    );

    expect(enriched[0]?.id).toBe('a');
    expect(enriched[1]?.id).toBe('b');
    expect(enriched[0]?.computedState).toBe('in_progress');
  });
});
