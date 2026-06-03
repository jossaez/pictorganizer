import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { RecurrenceType, SyncStatus } from '../../domain/enums';
import { ActivityVisibility } from '../../domain/enums';
import { EditScope } from '../../domain/types/entities';
import type { ActivityTemplate } from '../../domain/types';
import { RecurrenceService } from '../../domain/services/recurrence.service';
import { getISOWeekday } from '../../utils/date';
import { db } from '../database/dexie.db';
import {
  DEFAULT_ROLLING_WINDOW_DAYS,
  DexieActivityRepository,
} from './dexie-activity.repository';

const FIXED_NOW = '2026-06-01T08:00:00.000Z';

async function resetDatabase(): Promise<void> {
  await db.delete();
  await db.open();
}

function baseTemplate(overrides: Partial<ActivityTemplate> = {}): ActivityTemplate {
  return {
    id: 'template-1',
    profileId: 'profile-1',
    title: 'Desayuno',
    categoryId: 'food',
    startTimeMinutes: 480,
    visual: { type: 'pictogram', pictogramId: 'breakfast' },
    recurrence: { type: RecurrenceType.Daily, startDate: '2026-06-01' },
    visibility: ActivityVisibility.Visible,
    sortOrder: 0,
    isActive: true,
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW,
    syncStatus: SyncStatus.Local,
    revision: 1,
    ...overrides,
  };
}

describe('DexieActivityRepository — recurrencias', () => {
  const repository = new DexieActivityRepository();

  beforeEach(async () => {
    await resetDatabase();
  });

  it('genera 90 instancias daily en ventana rolling', async () => {
    const template = baseTemplate();
    await db.activityTemplates.add(template);

    const toDate = RecurrenceService.rollingWindowToDate('2026-06-01', DEFAULT_ROLLING_WINDOW_DAYS);
    const result = await repository.generateInstances('template-1', {
      fromDate: '2026-06-01',
      toDate,
      skipExisting: true,
    });

    expect(result.created).toHaveLength(90);
    expect(await db.activityInstances.count()).toBe(90);
  });

  it('weekdays no genera sábados ni domingos en 14 días', async () => {
    const template = baseTemplate({
      id: 'weekdays-template',
      recurrence: { type: RecurrenceType.Weekdays, startDate: '2026-06-01' },
    });
    await db.activityTemplates.add(template);

    const result = await repository.generateInstances('weekdays-template', {
      fromDate: '2026-06-01',
      toDate: '2026-06-14',
      skipExisting: true,
    });

    expect(result.created).toHaveLength(10);
    const dates = result.created.map((i) => i.date);
    for (const date of dates) {
      const weekday = getISOWeekday(date);
      expect(weekday).toBeGreaterThanOrEqual(1);
      expect(weekday).toBeLessThanOrEqual(5);
    }
  });

  it('segunda generación no duplica instancias', async () => {
    const template = baseTemplate();
    await db.activityTemplates.add(template);

    const opts = { fromDate: '2026-06-01', toDate: '2026-06-07', skipExisting: true as const };
    const first = await repository.generateInstances('template-1', opts);
    expect(first.created).toHaveLength(7);

    const second = await repository.generateInstances('template-1', opts);
    expect(second.created).toHaveLength(0);
    expect(second.skipped).toBe(7);
    expect(await db.activityInstances.count()).toBe(7);
  });

  it('editar solo una instancia no modifica el template', async () => {
    const template = baseTemplate();
    await db.activityTemplates.add(template);
    await repository.generateInstances('template-1', {
      fromDate: '2026-06-01',
      toDate: '2026-06-03',
      skipExisting: true,
    });

    const instances = await db.activityInstances.toArray();
    const target = instances.find((i) => i.date === '2026-06-02')!;

    await repository.updateSingleInstance(target.id, {
      title: 'Desayuno especial',
      startTimeMinutes: 510,
    });

    const updatedTemplate = await db.activityTemplates.get('template-1');
    expect(updatedTemplate?.title).toBe('Desayuno');

    const updatedInstance = await db.activityInstances.get(target.id);
    expect(updatedInstance?.title).toBe('Desayuno especial');
    expect(updatedInstance?.isException).toBe(true);
    expect(updatedInstance?.startTimeMinutes).toBe(510);

    const otherInstance = instances.find((i) => i.date === '2026-06-03')!;
    const unchanged = await db.activityInstances.get(otherInstance.id);
    expect(unchanged?.title).toBe('Desayuno');
  });

  it('editar futuras mantiene instancias pasadas', async () => {
    const template = baseTemplate();
    await db.activityTemplates.add(template);
    await repository.generateInstances('template-1', {
      fromDate: '2026-06-01',
      toDate: '2026-06-10',
      skipExisting: true,
    });

    await repository.updateTemplateAndFutureInstances(
      'template-1',
      { title: 'Desayuno tardío' },
      '2026-06-05',
      EditScope.ThisAndFuture,
    );

    const all = await db.activityInstances.filter((i) => !i.deletedAt).toArray();
    const past = all.filter((i) => i.date < '2026-06-05');
    const future = all.filter((i) => i.date >= '2026-06-05');

    expect(past.every((i) => i.title === 'Desayuno')).toBe(true);
    expect(future.every((i) => i.title === 'Desayuno tardío')).toBe(true);
  });

  it('editar futuras respeta excepciones', async () => {
    const template = baseTemplate();
    await db.activityTemplates.add(template);
    await repository.generateInstances('template-1', {
      fromDate: '2026-06-01',
      toDate: '2026-06-10',
      skipExisting: true,
    });

    const before = await db.activityInstances.toArray();
    const exceptionTarget = before.find((i) => i.date === '2026-06-07')!;

    await repository.updateSingleInstance(exceptionTarget.id, {
      title: 'Excepción domingo',
      startTimeMinutes: 600,
    });

    await repository.updateTemplateAndFutureInstances(
      'template-1',
      { title: 'Nuevo título serie' },
      '2026-06-05',
      EditScope.ThisAndFuture,
    );

    const exception = await db.activityInstances.get(exceptionTarget.id);
    expect(exception?.deletedAt).toBeUndefined();
    expect(exception?.title).toBe('Excepción domingo');
    expect(exception?.startTimeMinutes).toBe(600);
    expect(exception?.isException).toBe(true);

    const regenerated = await db.activityInstances
      .filter((i) => !i.deletedAt && i.date === '2026-06-08')
      .toArray();
    expect(regenerated[0]?.title).toBe('Nuevo título serie');
  });

  it('eliminar futuras hace soft delete y desactiva template', async () => {
    const template = baseTemplate();
    await db.activityTemplates.add(template);
    await repository.generateInstances('template-1', {
      fromDate: '2026-06-01',
      toDate: '2026-06-10',
      skipExisting: true,
    });

    await repository.deleteFutureInstances('template-1', '2026-06-05', true);
    await repository.softDeleteTemplate('template-1');

    const active = await db.activityInstances.filter((i) => !i.deletedAt).toArray();
    expect(active.every((i) => i.date < '2026-06-05')).toBe(true);

    const deletedTemplate = await db.activityTemplates.get('template-1');
    expect(deletedTemplate?.isActive).toBe(false);
    expect(deletedTemplate?.deletedAt).toBeDefined();
  });
});
