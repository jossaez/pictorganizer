import type { AppSettings } from '@/domain/types';
import { db } from '@/infrastructure/database/dexie.db';
import { compactFutureInstancesIfNeeded } from '@/infrastructure/database/database-maintenance.service';
import { repairAppSettingsIfNeeded } from '@/infrastructure/database/database-repair.service';
import { seedIfEmpty } from '@/infrastructure/database/seeds/seedIfEmpty';

export type InitAppResult =
  | { ok: true; settings: AppSettings; seeded: boolean }
  | { ok: false; error: string };

/**
 * Opens Dexie, seeds catalog if empty, repairs settings, extends instance windows.
 * Called once on app bootstrap before rendering routes.
 */
export async function initApp(): Promise<InitAppResult> {
  try {
    await db.open();
    const { seeded } = await seedIfEmpty();
    const settings = await repairAppSettingsIfNeeded();
    await compactFutureInstancesIfNeeded();
    return { ok: true, settings, seeded };
  } catch (error) {
    console.error('[initApp] Failed to initialize application:', error);
    const message =
      error instanceof Error ? error.message : 'No se pudo inicializar la base de datos local';
    return { ok: false, error: message };
  }
}
