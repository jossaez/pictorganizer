import { SyncStatus } from '../../domain/enums';

export function nowIso(): string {
  return new Date().toISOString();
}

export function createSyncableFields(now: string = nowIso()) {
  return {
    createdAt: now,
    updatedAt: now,
    syncStatus: SyncStatus.Local,
    revision: 1,
  };
}

export function bumpSyncable<T extends { updatedAt: string; revision: number }>(
  entity: T,
  now: string = nowIso(),
): T {
  return {
    ...entity,
    updatedAt: now,
    revision: entity.revision + 1,
  };
}
