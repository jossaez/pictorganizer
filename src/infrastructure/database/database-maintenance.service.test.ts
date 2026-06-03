import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { APP_SETTINGS_ID, CelebrationStyle, ChildModeDetailLevel, SyncStatus, TimerStyle } from '../../domain/enums';
import { ActivityStatus, ActivityVisibility, RecurrenceType } from '../../domain/enums';
import type { ActivityInstance, ActivityTemplate, Profile, ProfileSettings } from '../../domain/types';
import { db } from './dexie.db';
import { repairAppSettingsIfNeeded } from './database-repair.service';
import {
  cleanupDeletedRecords,
  getDatabaseSummary,
  resetDatabase,
  validateDatabaseIntegrity,
} from './database-maintenance.service';
import { seedIfEmpty } from './seeds/seedIfEmpty';

const NOW = '2026-06-01T10:00:00.000Z';
const OLD_DELETE = '2026-01-01T10:00:00.000Z';

async function resetDb(): Promise<void> {
  await db.delete();
  await db.open();
  await seedIfEmpty();
}

function baseProfile(id: string): Profile {
  return {
    id,
    name: 'Ana',
    color: '#3b82f6',
    sortOrder: 0,
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
    syncStatus: SyncStatus.Local,
    revision: 1,
  };
}

function baseSettings(profileId: string): ProfileSettings {
  return {
    id: `settings-${profileId}`,
    profileId,
    showTimer: true,
    showAnticipation: true,
    celebrationStyle: CelebrationStyle.Smile,
    timerStyle: TimerStyle.Bar,
    childModeDetailLevel: ChildModeDetailLevel.Standard,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function baseTemplate(profileId: string): ActivityTemplate {
  return {
    id: 'template-1',
    profileId,
    title: 'Desayuno',
    categoryId: 'food',
    startTimeMinutes: 480,
    visual: { type: 'pictogram', pictogramId: 'breakfast' },
    recurrence: { type: RecurrenceType.Daily, startDate: '2026-06-01' },
    visibility: ActivityVisibility.Visible,
    sortOrder: 0,
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
    syncStatus: SyncStatus.Local,
    revision: 1,
  };
}

function baseInstance(profileId: string, date: string, overrides: Partial<ActivityInstance> = {}): ActivityInstance {
  return {
    id: `inst-${date}`,
    profileId,
    templateId: 'template-1',
    date,
    title: 'Desayuno',
    categoryId: 'food',
    startTimeMinutes: 480,
    visual: { type: 'pictogram', pictogramId: 'breakfast' },
    visibility: ActivityVisibility.Visible,
    status: ActivityStatus.Pending,
    isException: false,
    sortOrder: 0,
    createdAt: NOW,
    updatedAt: NOW,
    syncStatus: SyncStatus.Local,
    revision: 1,
    ...overrides,
  };
}

describe('repairAppSettingsIfNeeded', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('recrea AppSettings si falta', async () => {
    await db.appSettings.clear();
    const settings = await repairAppSettingsIfNeeded();
    expect(settings.id).toBe(APP_SETTINGS_ID);
  });

  it('corrige activeProfileId inexistente', async () => {
    await db.profiles.add(baseProfile('profile-1'));
    await db.profileSettings.add(baseSettings('profile-1'));
    await db.appSettings.put({
      ...(await db.appSettings.get(APP_SETTINGS_ID))!,
      activeProfileId: 'missing-profile',
    });

    const settings = await repairAppSettingsIfNeeded();
    expect(settings.activeProfileId).toBe('profile-1');
  });

  it('crea ProfileSettings faltantes', async () => {
    await db.profiles.add(baseProfile('profile-1'));
    await db.profileSettings.where('profileId').equals('profile-1').delete();

    await repairAppSettingsIfNeeded();
    const settings = await db.profileSettings.where('profileId').equals('profile-1').first();
    expect(settings).toBeDefined();
  });

  it('deja activeProfileId undefined sin perfiles', async () => {
    await db.profiles.clear();
    await db.profileSettings.clear();
    await db.appSettings.put({
      ...(await db.appSettings.get(APP_SETTINGS_ID))!,
      activeProfileId: 'profile-1',
    });

    const settings = await repairAppSettingsIfNeeded();
    expect(settings.activeProfileId).toBeUndefined();
  });
});

describe('getDatabaseSummary', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('cuenta perfiles, rutinas e instancias', async () => {
    await db.profiles.add(baseProfile('profile-1'));
    await db.routines.add({
      id: 'routine-1',
      profileId: 'profile-1',
      name: 'Mañana',
      sortOrder: 0,
      isActive: true,
      createdAt: NOW,
      updatedAt: NOW,
      syncStatus: SyncStatus.Local,
      revision: 1,
    });
    await db.activityInstances.bulkAdd([
      baseInstance('profile-1', '2026-05-30'),
      baseInstance('profile-1', '2026-06-10', { id: 'inst-future' }),
    ]);

    const summary = await getDatabaseSummary();
    expect(summary.profileCount).toBe(1);
    expect(summary.appliedRoutinesCount).toBe(1);
    expect(summary.historicalActivitiesCount).toBe(1);
    expect(summary.futureActivitiesCount).toBe(1);
    expect(summary.lastLocalUpdateAt).toBeTruthy();
  });
});

describe('validateDatabaseIntegrity', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('informa instancia sin profileId válido', async () => {
    await db.activityInstances.add(baseInstance('missing-profile', '2026-06-10'));

    const report = await validateDatabaseIntegrity();
    expect(report.isHealthy).toBe(false);
    expect(report.issues.some((i) => i.code === 'orphan_instance_profile')).toBe(true);
  });

  it('informa activeProfileId inválido', async () => {
    await db.appSettings.put({
      ...(await db.appSettings.get(APP_SETTINGS_ID))!,
      activeProfileId: 'ghost',
    });

    const report = await validateDatabaseIntegrity();
    expect(report.issues.some((i) => i.code === 'invalid_active_profile')).toBe(true);
  });

  it('devuelve informe sano con datos coherentes', async () => {
    await db.profiles.add(baseProfile('profile-1'));
    await db.profileSettings.add(baseSettings('profile-1'));
    await db.activityTemplates.add(baseTemplate('profile-1'));
    await db.activityInstances.add(baseInstance('profile-1', '2026-06-10'));

    const report = await validateDatabaseIntegrity();
    expect(report.isHealthy).toBe(true);
  });
});

describe('cleanupDeletedRecords', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('elimina soft-deletes antiguos', async () => {
    await db.activityInstances.add(
      baseInstance('profile-1', '2026-06-01', {
        id: 'old-deleted',
        deletedAt: OLD_DELETE,
      }),
    );

    const result = await cleanupDeletedRecords(30);
    expect(result.deletedInstances).toBe(1);
    expect(await db.activityInstances.get('old-deleted')).toBeUndefined();
  });

  it('conserva soft-deletes recientes', async () => {
    await db.activityInstances.add(
      baseInstance('profile-1', '2026-06-01', {
        id: 'recent-deleted',
        deletedAt: NOW,
      }),
    );

    const result = await cleanupDeletedRecords(30);
    expect(result.deletedInstances).toBe(0);
    expect(await db.activityInstances.get('recent-deleted')).toBeDefined();
  });
});

describe('resetDatabase', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('borra datos de usuario y reinicia AppSettings', async () => {
    await db.profiles.add(baseProfile('profile-1'));
    await db.profileSettings.add(baseSettings('profile-1'));
    await db.appSettings.put({
      ...(await db.appSettings.get(APP_SETTINGS_ID))!,
      onboardingCompleted: true,
      activeProfileId: 'profile-1',
    });

    await resetDatabase();

    expect(await db.profiles.count()).toBe(0);
    expect(await db.categories.count()).toBeGreaterThan(0);
    const settings = await db.appSettings.get(APP_SETTINGS_ID);
    expect(settings?.onboardingCompleted).toBe(false);
    expect(settings?.activeProfileId).toBeUndefined();
  });
});
