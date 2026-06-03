import { describe, expect, it, vi } from 'vitest';
import { ActivityStatus, ActivityVisibility, SyncStatus } from '../../domain/enums';
import type { ActivityInstance } from '../../domain/types';
import {
  buildActivityNotificationPayload,
  buildNotificationBody,
  buildNotificationTitle,
  buildScheduleDate,
} from './notification-content';

function baseInstance(overrides: Partial<ActivityInstance> = {}): ActivityInstance {
  return {
    id: 'inst-1',
    profileId: 'profile-1',
    date: '2026-06-10',
    title: 'Lavarse los dientes',
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

describe('buildNotificationTitle', () => {
  it('a la hora de la actividad', () => {
    expect(buildNotificationTitle('Desayunar', 0)).toBe('Ahora toca: Desayunar');
  });

  it('minutos antes', () => {
    expect(buildNotificationTitle('Salir de casa', 5)).toBe('En 5 minutos: Salir de casa');
  });
});

describe('buildNotificationBody', () => {
  it('a la hora de la actividad', () => {
    expect(buildNotificationBody(0)).toContain('PICTORGANIZER');
  });

  it('minutos antes', () => {
    expect(buildNotificationBody(5)).toBe('Prepárate con calma para la próxima actividad.');
  });
});

describe('buildScheduleDate', () => {
  it('combina fecha y hora local', () => {
    const date = buildScheduleDate('2026-06-10', 480, 0);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(5);
    expect(date.getDate()).toBe(10);
    expect(date.getHours()).toBe(8);
    expect(date.getMinutes()).toBe(0);
  });

  it('resta minutos de aviso', () => {
    const date = buildScheduleDate('2026-06-10', 480, 15);
    expect(date.getHours()).toBe(7);
    expect(date.getMinutes()).toBe(45);
  });
});

describe('buildActivityNotificationPayload', () => {
  it('genera payload para actividad futura', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-10T07:00:00'));

    const payload = buildActivityNotificationPayload(baseInstance(), 0);
    expect(payload?.title).toBe('Ahora toca: Lavarse los dientes');
    expect(payload?.body).toContain('PICTORGANIZER');
    expect(payload?.activityInstanceId).toBe('inst-1');

    vi.useRealTimers();
  });

  it('devuelve null si la hora ya pasó', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-10T09:00:00'));

    const payload = buildActivityNotificationPayload(baseInstance(), 0);
    expect(payload).toBeNull();

    vi.useRealTimers();
  });
});
