import { APP_SETTINGS_ID } from '../../domain/enums';
import type { ActivityInstance, ActivityTemplate } from '../../domain/types';
import { isActivityVisual } from '../../domain/visual/visual-asset.utils';
import { compareISODate } from '../../utils/date';
import { todayISODate } from '../../utils/today';
import { db } from './dexie.db';
import { createDefaultAppSettings, seedIfEmpty } from './seeds/seedIfEmpty';
import {
  activityRepository,
  profileRepository,
} from '../repositories';
import { cancelAllNotifications } from '../notifications/local-notification.service';

export const SOFT_DELETE_RETENTION_DAYS = 30;

export interface DatabaseSummary {
  profileCount: number;
  appliedRoutinesCount: number;
  futureActivitiesCount: number;
  historicalActivitiesCount: number;
  lastLocalUpdateAt: string | null;
}

export interface IntegrityIssue {
  code: string;
  message: string;
  entityType: string;
  entityId?: string;
}

export interface IntegrityReport {
  checkedAt: string;
  issueCount: number;
  issues: IntegrityIssue[];
  isHealthy: boolean;
}

export interface CleanupResult {
  deletedProfiles: number;
  deletedRoutines: number;
  deletedTemplates: number;
  deletedInstances: number;
  deletedProfileSettings: number;
}

const PHOTO_URI_RE = /^(pictorganizer:\/\/|blob:|https?:\/\/)/;

function isValidPhotoUri(uri: string | undefined): boolean {
  if (!uri || uri.trim().length === 0) return false;
  return PHOTO_URI_RE.test(uri.trim());
}

function maxIsoDate(dates: (string | undefined)[]): string | null {
  const valid = dates.filter((d): d is string => Boolean(d));
  if (valid.length === 0) return null;
  return valid.reduce((max, d) => (compareISODate(d, max) > 0 ? d : max));
}

export async function getDatabaseSummary(): Promise<DatabaseSummary> {
  const today = todayISODate();

  const profiles = await db.profiles.filter((p) => p.isActive && !p.deletedAt).toArray();
  const routines = await db.routines.filter((r) => r.isActive && !r.deletedAt).toArray();
  const instances = await db.activityInstances.filter((i) => !i.deletedAt).toArray();

  const futureActivitiesCount = instances.filter((i) => compareISODate(i.date, today) >= 0).length;
  const historicalActivitiesCount = instances.filter((i) => compareISODate(i.date, today) < 0).length;

  const lastLocalUpdateAt = maxIsoDate([
    ...profiles.map((p) => p.updatedAt),
    ...routines.map((r) => r.updatedAt),
    ...instances.map((i) => i.updatedAt),
    ...(await db.appSettings.toArray()).map((s) => s.updatedAt),
  ]);

  return {
    profileCount: profiles.length,
    appliedRoutinesCount: routines.length,
    futureActivitiesCount,
    historicalActivitiesCount,
    lastLocalUpdateAt,
  };
}

export async function validateDatabaseIntegrity(): Promise<IntegrityReport> {
  const issues: IntegrityIssue[] = [];
  const checkedAt = new Date().toISOString();

  const profiles = await db.profiles.toArray();
  const activeProfileIds = new Set(
    profiles.filter((p) => p.isActive && !p.deletedAt).map((p) => p.id),
  );
  const allProfileIds = new Set(profiles.map((p) => p.id));

  const settingsRows = await db.profileSettings.toArray();
  const settingsByProfileId = new Set(settingsRows.map((s) => s.profileId));

  for (const settings of settingsRows) {
    if (!allProfileIds.has(settings.profileId)) {
      issues.push({
        code: 'orphan_profile_settings',
        message: 'ProfileSettings sin perfil asociado',
        entityType: 'ProfileSettings',
        entityId: settings.id,
      });
    }
  }

  for (const profile of profiles.filter((p) => p.isActive && !p.deletedAt)) {
    if (!settingsByProfileId.has(profile.id)) {
      issues.push({
        code: 'missing_profile_settings',
        message: 'Perfil activo sin ProfileSettings',
        entityType: 'Profile',
        entityId: profile.id,
      });
    }

    if (profile.photoUri && !isValidPhotoUri(profile.photoUri)) {
      issues.push({
        code: 'invalid_profile_photo_uri',
        message: 'Foto de perfil con URI vacía o inválida',
        entityType: 'Profile',
        entityId: profile.id,
      });
    }
  }

  const appSettings = await db.appSettings.get(APP_SETTINGS_ID);
  if (appSettings?.activeProfileId && !activeProfileIds.has(appSettings.activeProfileId)) {
    issues.push({
      code: 'invalid_active_profile',
      message: 'AppSettings.activeProfileId apunta a un perfil inexistente o inactivo',
      entityType: 'AppSettings',
      entityId: APP_SETTINGS_ID,
    });
  }

  const routines = await db.routines.filter((r) => !r.deletedAt).toArray();
  for (const routine of routines) {
    if (!activeProfileIds.has(routine.profileId) && allProfileIds.has(routine.profileId)) {
      // profile exists but inactive — still flag if routine is active
    }
    if (!allProfileIds.has(routine.profileId)) {
      issues.push({
        code: 'orphan_routine',
        message: 'Rutina sin profileId válido',
        entityType: 'Routine',
        entityId: routine.id,
      });
    }
  }

  const templates = await db.activityTemplates.filter((t) => !t.deletedAt).toArray();
  for (const template of templates) {
    if (!allProfileIds.has(template.profileId)) {
      issues.push({
        code: 'orphan_template',
        message: 'ActivityTemplate sin profileId válido',
        entityType: 'ActivityTemplate',
        entityId: template.id,
      });
    }
  }

  const instances = await db.activityInstances.filter((i) => !i.deletedAt).toArray();
  const templateIds = new Set(templates.map((t) => t.id));

  for (const instance of instances) {
    if (!allProfileIds.has(instance.profileId)) {
      issues.push({
        code: 'orphan_instance_profile',
        message: 'ActivityInstance sin profileId válido',
        entityType: 'ActivityInstance',
        entityId: instance.id,
      });
    }

    if (instance.templateId && !templateIds.has(instance.templateId)) {
      const templateExists = await db.activityTemplates.get(instance.templateId);
      if (!templateExists || templateExists.deletedAt) {
        issues.push({
          code: 'orphan_instance_template',
          message: 'ActivityInstance con templateId inexistente o eliminado',
          entityType: 'ActivityInstance',
          entityId: instance.id,
        });
      }
    }

    checkInstancePhotoVisual(instance, issues);
  }

  for (const template of templates) {
    checkTemplatePhotoVisual(template, issues);
  }

  return {
    checkedAt,
    issueCount: issues.length,
    issues,
    isHealthy: issues.length === 0,
  };
}

function checkInstancePhotoVisual(instance: ActivityInstance, issues: IntegrityIssue[]): void {
  const visual = instance.visual;
  if (visual?.type === 'photo' && !isValidPhotoUri(visual.photoUri)) {
    issues.push({
      code: 'invalid_instance_photo_uri',
      message: 'Actividad con foto URI vacía o inválida',
      entityType: 'ActivityInstance',
      entityId: instance.id,
    });
  } else if (visual && !isActivityVisual(visual)) {
    issues.push({
      code: 'invalid_instance_visual',
      message: 'Actividad con visual inválido',
      entityType: 'ActivityInstance',
      entityId: instance.id,
    });
  }
}

function checkTemplatePhotoVisual(template: ActivityTemplate, issues: IntegrityIssue[]): void {
  const visual = template.visual;
  if (visual?.type === 'photo' && !isValidPhotoUri(visual.photoUri)) {
    issues.push({
      code: 'invalid_template_photo_uri',
      message: 'Plantilla con foto URI vacía o inválida',
      entityType: 'ActivityTemplate',
      entityId: template.id,
    });
  }
}

function isOlderThanRetention(deletedAt: string, retentionDays: number): boolean {
  const deletedMs = new Date(deletedAt).getTime();
  const cutoffMs = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  return deletedMs < cutoffMs;
}

export async function cleanupDeletedRecords(
  retentionDays: number = SOFT_DELETE_RETENTION_DAYS,
): Promise<CleanupResult> {
  const result: CleanupResult = {
    deletedProfiles: 0,
    deletedRoutines: 0,
    deletedTemplates: 0,
    deletedInstances: 0,
    deletedProfileSettings: 0,
  };

  await db.transaction(
    'rw',
    [
      db.profiles,
      db.profileSettings,
      db.routines,
      db.activityTemplates,
      db.activityInstances,
    ],
    async () => {
      const profiles = await db.profiles.filter((p) => Boolean(p.deletedAt)).toArray();
      for (const row of profiles) {
        if (row.deletedAt && isOlderThanRetention(row.deletedAt, retentionDays)) {
          await db.profiles.delete(row.id);
          result.deletedProfiles++;
        }
      }

      const settings = await db.profileSettings.toArray();
      for (const row of settings) {
        const profile = await db.profiles.get(row.profileId);
        if (!profile) {
          await db.profileSettings.delete(row.id);
          result.deletedProfileSettings++;
        }
      }

      const routines = await db.routines.filter((r) => Boolean(r.deletedAt)).toArray();
      for (const row of routines) {
        if (row.deletedAt && isOlderThanRetention(row.deletedAt, retentionDays)) {
          await db.routines.delete(row.id);
          result.deletedRoutines++;
        }
      }

      const templates = await db.activityTemplates.filter((t) => Boolean(t.deletedAt)).toArray();
      for (const row of templates) {
        if (row.deletedAt && isOlderThanRetention(row.deletedAt, retentionDays)) {
          await db.activityTemplates.delete(row.id);
          result.deletedTemplates++;
        }
      }

      const instances = await db.activityInstances.filter((i) => Boolean(i.deletedAt)).toArray();
      for (const row of instances) {
        if (row.deletedAt && isOlderThanRetention(row.deletedAt, retentionDays)) {
          await db.activityInstances.delete(row.id);
          result.deletedInstances++;
        }
      }
    },
  );

  return result;
}

export async function extendInstanceWindowForProfile(profileId: string): Promise<void> {
  await activityRepository.extendRollingWindowForProfile(profileId);
}

export async function compactFutureInstancesIfNeeded(): Promise<void> {
  const profiles = await profileRepository.getActiveProfiles();
  for (const profile of profiles) {
    await activityRepository.extendRollingWindowForProfile(profile.id);
  }
}

export async function resetDatabase(): Promise<void> {
  await cancelAllNotifications();
  await db.delete();
  await db.open();
  await seedIfEmpty();

  const defaults = createDefaultAppSettings();
  await db.appSettings.put({
    ...defaults,
    onboardingCompleted: false,
    activeProfileId: undefined,
    updatedAt: new Date().toISOString(),
  });
}
