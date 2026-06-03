import { APP_SETTINGS_ID, DeviceLayout, SyncStatus } from '../../../domain/enums';
import type { AppSettings } from '../../../domain/types';
import { db } from '../dexie.db';
import {
  SEED_AVATARS,
  SEED_CATEGORIES,
  SEED_PICTOGRAMS,
  SEED_ROUTINE_TEMPLATES,
} from './seed-data';

export function createDefaultAppSettings(now: string = new Date().toISOString()): AppSettings {
  return {
    id: APP_SETTINGS_ID,
    onboardingCompleted: false,
    requirePinForAdultMode: false,
    preferredDeviceLayout: DeviceLayout.Auto,
    reduceMotion: false,
    largeText: false,
    highContrast: false,
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Idempotent catalog + settings bootstrap.
 *
 * - Runs on first app open when categories table is empty.
 * - Safe to call on every boot (no-op if already seeded).
 * - Does NOT create user profiles or activities.
 */
export async function seedIfEmpty(): Promise<{ seeded: boolean }> {
  const categoryCount = await db.categories.count();

  if (categoryCount > 0) {
    await ensureAppSettingsExist();
    await upsertSystemCatalogEntries(SEED_CATEGORIES, SEED_PICTOGRAMS);
    await upsertSystemRoutineTemplates(SEED_ROUTINE_TEMPLATES);
    return { seeded: false };
  }

  const now = new Date().toISOString();

  await db.transaction(
    'rw',
    [
      db.categories,
      db.pictograms,
      db.avatars,
      db.routineTemplates,
      db.appSettings,
    ],
    async () => {
      await db.categories.bulkAdd(SEED_CATEGORIES);
      await db.pictograms.bulkAdd(SEED_PICTOGRAMS);
      await db.avatars.bulkAdd(SEED_AVATARS);
      await db.routineTemplates.bulkAdd(SEED_ROUTINE_TEMPLATES);
      await ensureAppSettingsExist(now);
    },
  );

  return { seeded: true };
}

async function ensureAppSettingsExist(now?: string): Promise<void> {
  const existing = await db.appSettings.get(APP_SETTINGS_ID);
  if (existing) return;
  await db.appSettings.add(createDefaultAppSettings(now));
}

/**
 * Future migrations may call this to append new system pictograms
 * without clearing user data (v2+).
 */
export async function upsertSystemCatalogEntries(
  categories: typeof SEED_CATEGORIES,
  pictograms: typeof SEED_PICTOGRAMS,
): Promise<void> {
  await db.transaction('rw', [db.categories, db.pictograms], async () => {
    for (const category of categories) {
      await db.categories.put(category);
    }
    for (const pictogram of pictograms) {
      await db.pictograms.put(pictogram);
    }
  });
}

/** Upsert system routine templates without removing user-applied routines */
export async function upsertSystemRoutineTemplates(
  templates: typeof SEED_ROUTINE_TEMPLATES,
): Promise<void> {
  await db.transaction('rw', [db.routineTemplates], async () => {
    for (const template of templates) {
      await db.routineTemplates.put(template);
    }
  });
}
