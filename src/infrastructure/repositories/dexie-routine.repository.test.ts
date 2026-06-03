import { beforeEach, describe, expect, it } from 'vitest';
import { ActivityStatus, RecurrenceType } from '@/domain/enums';
import { DexieActivityRepository } from './dexie-activity.repository';
import { DexieProfileRepository } from './dexie-profile.repository';
import { DexieRoutineRepository } from './dexie-routine.repository';
import { resetTestDatabase, seedTestDatabase } from '@/test/db-test-utils';

describe('DexieRoutineRepository', () => {
  const profileRepo = new DexieProfileRepository();
  const routineRepo = new DexieRoutineRepository();
  const activityRepo = new DexieActivityRepository();

  beforeEach(async () => {
    await resetTestDatabase();
    await seedTestDatabase();
  });

  it('applyRoutineTemplate crea rutina y plantillas de actividad', async () => {
    const { profile } = await profileRepo.createProfile({ name: 'Ana', color: '#FFB74D' });

    const result = await routineRepo.applyRoutineTemplate({
      profileId: profile.id,
      templateId: 'routine-morning',
      startDate: '2026-06-03',
      anchorTimeMinutes: 420,
    });

    expect(result.routine.profileId).toBe(profile.id);
    expect(result.routine.sourceTemplateId).toBe('routine-morning');
    expect(result.templateIds.length).toBeGreaterThan(0);

    const routines = await routineRepo.getActiveRoutinesByProfile(profile.id);
    expect(routines).toHaveLength(1);
  });

  it('findActiveRoutineBySourceTemplate detecta rutina duplicada', async () => {
    const { profile } = await profileRepo.createProfile({ name: 'Ana', color: '#FFB74D' });

    await routineRepo.applyRoutineTemplate({
      profileId: profile.id,
      templateId: 'routine-morning',
      startDate: '2026-06-03',
      anchorTimeMinutes: 420,
    });

    const existing = await routineRepo.findActiveRoutineBySourceTemplate(
      profile.id,
      'routine-morning',
    );
    expect(existing?.sourceTemplateId).toBe('routine-morning');
  });

  it('flujo aplicar rutina + generar instancias + leer agenda', async () => {
    const { profile } = await profileRepo.createProfile({ name: 'Ana', color: '#FFB74D' });

    const { templateIds } = await routineRepo.applyRoutineTemplate({
      profileId: profile.id,
      templateId: 'routine-hygiene',
      startDate: '2026-06-03',
      anchorTimeMinutes: 480,
    });

    for (const templateId of templateIds) {
      await activityRepo.generateInstances(templateId, {
        fromDate: '2026-06-03',
        toDate: '2026-06-05',
        skipExisting: true,
      });
    }

    const agenda = await activityRepo.getInstancesByDate(profile.id, '2026-06-03');
    expect(agenda.length).toBeGreaterThan(0);

    const first = agenda[0]!;
    const completed = await activityRepo.completeInstance(first.id);
    expect(completed.status).toBe(ActivityStatus.Completed);

    const updatedAgenda = await activityRepo.getInstancesByDate(profile.id, '2026-06-03');
    expect(updatedAgenda.find((i) => i.id === first.id)?.status).toBe(ActivityStatus.Completed);
  });

  it('softDeleteRoutine desactiva la rutina', async () => {
    const { profile } = await profileRepo.createProfile({ name: 'Ana', color: '#FFB74D' });
    const { routine } = await routineRepo.applyRoutineTemplate({
      profileId: profile.id,
      templateId: 'routine-meal',
      startDate: '2026-06-03',
      anchorTimeMinutes: 720,
    });

    await routineRepo.softDeleteRoutine(routine.id);

    const active = await routineRepo.getActiveRoutinesByProfile(profile.id);
    expect(active).toHaveLength(0);
  });
});

describe('DexieActivityRepository — agenda por fecha', () => {
  const activityRepo = new DexieActivityRepository();

  beforeEach(async () => {
    await resetTestDatabase();
  });

  it('getInstancesByDate devuelve instancias ordenadas sin soft-deleted', async () => {
    const template = await activityRepo.createTemplate({
      profileId: 'profile-1',
      title: 'Merienda',
      categoryId: 'food',
      startTimeMinutes: 960,
      visual: { type: 'pictogram', pictogramId: 'snack' },
      recurrence: { type: RecurrenceType.Daily, startDate: '2026-06-03' },
    });

    await activityRepo.generateInstances(template.id, {
      fromDate: '2026-06-03',
      toDate: '2026-06-03',
      skipExisting: true,
    });

    const rows = await activityRepo.getInstancesByDate('profile-1', '2026-06-03');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.title).toBe('Merienda');
  });
});
