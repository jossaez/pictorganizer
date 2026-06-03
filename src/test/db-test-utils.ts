import { db } from '@/infrastructure/database/dexie.db';
import { seedIfEmpty } from '@/infrastructure/database/seeds/seedIfEmpty';

/** Wipes all tables and reopens Dexie — use in beforeEach for isolated repository tests. */
export async function resetTestDatabase(): Promise<void> {
  await db.delete();
  await db.open();
}

/** Seeds catalog + default AppSettings (idempotent). */
export async function seedTestDatabase(): Promise<{ seeded: boolean }> {
  return seedIfEmpty();
}

/** Closes Dexie connection — optional cleanup after a test file. */
export async function closeTestDatabase(): Promise<void> {
  db.close();
}
