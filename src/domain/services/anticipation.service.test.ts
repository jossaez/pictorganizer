import { describe, expect, it } from 'vitest';
import { ActivityStatus } from '../enums';
import type { ActivityInstance } from '../types';
import { getNowNextLater } from './anticipation.service';

const DATE = '2026-06-03';
const TODAY = '2026-06-03';

function baseInstance(overrides: Partial<ActivityInstance> = {}): ActivityInstance {
  return {
    id: '1',
    profileId: 'p1',
    date: DATE,
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

describe('anticipation.service — getNowNextLater', () => {
  it('devuelve actividad en curso como now', () => {
    const result = getNowNextLater(
      [
        baseInstance({ id: 'a', startTimeMinutes: 480 }),
        baseInstance({ id: 'b', startTimeMinutes: 540 }),
      ],
      490,
      { date: DATE, todayDate: TODAY },
    );

    expect(result.nowActivity?.id).toBe('a');
    expect(result.nowActivity?.computedState).toBe('in_progress');
    expect(result.nextActivity?.id).toBe('b');
  });

  it('si no hay en curso, devuelve próxima pendiente como now', () => {
    const result = getNowNextLater(
      [
        baseInstance({ id: 'a', startTimeMinutes: 480 }),
        baseInstance({ id: 'b', startTimeMinutes: 540 }),
      ],
      460,
      { date: DATE, todayDate: TODAY },
    );

    expect(result.nowActivity?.id).toBe('a');
    expect(result.nowActivity?.computedState).toBe('pending');
  });

  it('ignora completadas', () => {
    const result = getNowNextLater(
      [
        baseInstance({ id: 'a', status: ActivityStatus.Completed, startTimeMinutes: 480 }),
        baseInstance({ id: 'b', startTimeMinutes: 540 }),
      ],
      490,
      { date: DATE, todayDate: TODAY },
    );

    expect(result.nowActivity?.id).toBe('b');
    expect(result.dayCompleted).toBe(false);
  });

  it('ignora saltadas', () => {
    const result = getNowNextLater(
      [
        baseInstance({ id: 'a', status: ActivityStatus.Skipped, startTimeMinutes: 480 }),
        baseInstance({ id: 'b', startTimeMinutes: 540 }),
      ],
      490,
      { date: DATE, todayDate: TODAY },
    );

    expect(result.nowActivity?.id).toBe('b');
  });

  it('ordena por hora', () => {
    const result = getNowNextLater(
      [
        baseInstance({ id: 'c', startTimeMinutes: 600 }),
        baseInstance({ id: 'a', startTimeMinutes: 480 }),
        baseInstance({ id: 'b', startTimeMinutes: 540 }),
      ],
      460,
      { date: DATE, todayDate: TODAY },
    );

    expect(result.nowActivity?.id).toBe('a');
    expect(result.nextActivity?.id).toBe('b');
    expect(result.laterActivity?.id).toBe('c');
  });

  it('devuelve después y más tarde correctamente', () => {
    const result = getNowNextLater(
      [
        baseInstance({ id: 'a', startTimeMinutes: 480 }),
        baseInstance({ id: 'b', startTimeMinutes: 540 }),
        baseInstance({ id: 'c', startTimeMinutes: 600 }),
        baseInstance({ id: 'd', startTimeMinutes: 660 }),
      ],
      485,
      { date: DATE, todayDate: TODAY },
    );

    expect(result.nowActivity?.id).toBe('a');
    expect(result.nextActivity?.id).toBe('b');
    expect(result.laterActivity?.id).toBe('c');
  });

  it('devuelve null si no hay actividades', () => {
    const result = getNowNextLater([], 480, { date: DATE, todayDate: TODAY });

    expect(result.nowActivity).toBeNull();
    expect(result.nextActivity).toBeNull();
    expect(result.laterActivity).toBeNull();
    expect(result.dayCompleted).toBe(false);
  });

  it('no incluye deletedAt', () => {
    const result = getNowNextLater(
      [
        baseInstance({ id: 'a', deletedAt: '2026-06-03T10:00:00Z', startTimeMinutes: 480 }),
        baseInstance({ id: 'b', startTimeMinutes: 540 }),
      ],
      460,
      { date: DATE, todayDate: TODAY },
    );

    expect(result.nowActivity?.id).toBe('b');
  });

  it('marca día completado cuando todas están hechas', () => {
    const result = getNowNextLater(
      [
        baseInstance({ id: 'a', status: ActivityStatus.Completed }),
        baseInstance({ id: 'b', status: ActivityStatus.Skipped, startTimeMinutes: 540 }),
      ],
      600,
      { date: DATE, todayDate: TODAY },
    );

    expect(result.nowActivity).toBeNull();
    expect(result.dayCompleted).toBe(true);
  });
});
