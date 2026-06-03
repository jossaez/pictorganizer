import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { ActivityStatus, ActivityVisibility, SkippedBy, SyncStatus } from '../../domain/enums';
import type { ActivityInstance } from '../../domain/types';
import { db } from '../database/dexie.db';
import { DexieActivityRepository } from './dexie-activity.repository';

const FIXED_NOW = '2026-06-03T10:00:00.000Z';

async function resetDatabase(): Promise<void> {
  await db.delete();
  await db.open();
}

function baseInstance(overrides: Partial<ActivityInstance> = {}): ActivityInstance {
  return {
    id: 'instance-1',
    profileId: 'profile-1',
    templateId: 'template-1',
    date: '2026-06-03',
    title: 'Lavarse los dientes',
    categoryId: 'hygiene',
    startTimeMinutes: 480,
    visual: { type: 'pictogram', pictogramId: 'toothbrush' },
    visibility: ActivityVisibility.Visible,
    status: ActivityStatus.Pending,
    isException: false,
    sortOrder: 0,
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW,
    syncStatus: SyncStatus.Local,
    revision: 1,
    ...overrides,
  };
}

describe('DexieActivityRepository — completado', () => {
  const repository = new DexieActivityRepository();

  beforeEach(async () => {
    await resetDatabase();
    await db.activityInstances.add(baseInstance());
  });

  it('completeInstance actualiza status y completedAt', async () => {
    const completedAt = '2026-06-03T10:05:00.000Z';
    const updated = await repository.completeInstance('instance-1', completedAt);

    expect(updated.status).toBe(ActivityStatus.Completed);
    expect(updated.completedAt).toBe(completedAt);
    expect(updated.skippedAt).toBeUndefined();
    expect(updated.skippedBy).toBeUndefined();
    expect(updated.revision).toBe(2);
    expect(updated.updatedAt).toBeDefined();
  });

  it('skipInstance actualiza status y skippedAt', async () => {
    const skippedAt = '2026-06-03T10:10:00.000Z';
    const updated = await repository.skipInstance('instance-1', SkippedBy.Adult, skippedAt);

    expect(updated.status).toBe(ActivityStatus.Skipped);
    expect(updated.skippedAt).toBe(skippedAt);
    expect(updated.skippedBy).toBe(SkippedBy.Adult);
    expect(updated.completedAt).toBeUndefined();
    expect(updated.revision).toBe(2);
  });

  it('undoInstanceStatus limpia completedAt y skippedAt', async () => {
    await repository.completeInstance('instance-1');
    const undone = await repository.undoInstanceStatus('instance-1');

    expect(undone.status).toBe(ActivityStatus.Pending);
    expect(undone.completedAt).toBeUndefined();
    expect(undone.skippedAt).toBeUndefined();
    expect(undone.skippedBy).toBeUndefined();
    expect(undone.revision).toBe(3);
  });

  it('revision incrementa en cada transición', async () => {
    await repository.completeInstance('instance-1');
    expect((await db.activityInstances.get('instance-1'))?.revision).toBe(2);

    await repository.undoInstanceStatus('instance-1');
    expect((await db.activityInstances.get('instance-1'))?.revision).toBe(3);

    await repository.skipInstance('instance-1', SkippedBy.Adult);
    expect((await db.activityInstances.get('instance-1'))?.revision).toBe(4);
  });

  it('undo falla si la instancia está pending', async () => {
    await expect(repository.undoInstanceStatus('instance-1')).rejects.toThrow(
      'Solo se puede deshacer actividades completadas o saltadas',
    );
  });
});
