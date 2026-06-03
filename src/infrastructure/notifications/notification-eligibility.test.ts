import { describe, expect, it } from 'vitest';
import { ActivityStatus, ActivityVisibility, SyncStatus } from '../../domain/enums';
import type { ActivityInstance } from '../../domain/types';
import type { ProfileSettings } from '../../domain/types/entities';
import {
  isSchedulableActivityInstance,
  normalizeNotificationSettings,
} from './notification-eligibility';

function baseInstance(overrides: Partial<ActivityInstance> = {}): ActivityInstance {
  return {
    id: 'inst-1',
    profileId: 'profile-1',
    date: '2026-06-10',
    title: 'Actividad',
    categoryId: 'cat-1',
    startTimeMinutes: 480,
    visual: { type: 'pictogram', pictogramId: 'p1' },
    visibility: ActivityVisibility.Visible,
    status: ActivityStatus.Pending,
    isException: false,
    sortOrder: 0,
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z',
    syncStatus: SyncStatus.Local,
    revision: 1,
    ...overrides,
  };
}

describe('normalizeNotificationSettings', () => {
  it('aplica valores por defecto', () => {
    const settings = {
      notificationsEnabled: undefined,
      notificationMinutesBefore: undefined,
    } as ProfileSettings;

    expect(normalizeNotificationSettings(settings)).toEqual({
      notificationsEnabled: false,
      notificationMinutesBefore: 0,
    });
  });
});

describe('isSchedulableActivityInstance', () => {
  const today = '2026-06-10';

  it('acepta actividad pendiente futura visible', () => {
    expect(isSchedulableActivityInstance(baseInstance(), today)).toBe(true);
  });

  it('rechaza completadas', () => {
    expect(
      isSchedulableActivityInstance(
        baseInstance({ status: ActivityStatus.Completed }),
        today,
      ),
    ).toBe(false);
  });

  it('rechaza saltadas', () => {
    expect(
      isSchedulableActivityInstance(
        baseInstance({ status: ActivityStatus.Skipped }),
        today,
      ),
    ).toBe(false);
  });

  it('rechaza ocultas', () => {
    expect(
      isSchedulableActivityInstance(
        baseInstance({ visibility: ActivityVisibility.Hidden }),
        today,
      ),
    ).toBe(false);
  });

  it('rechaza eliminadas', () => {
    expect(
      isSchedulableActivityInstance(
        baseInstance({ deletedAt: '2026-06-10T08:00:00Z' }),
        today,
      ),
    ).toBe(false);
  });

  it('rechaza días pasados', () => {
    expect(
      isSchedulableActivityInstance(baseInstance({ date: '2026-06-09' }), today),
    ).toBe(false);
  });

  it('rechaza actividades sin hora', () => {
    expect(
      isSchedulableActivityInstance(
        baseInstance({ startTimeMinutes: undefined as unknown as number }),
        today,
      ),
    ).toBe(false);
  });
});
