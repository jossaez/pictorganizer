export { DexieProfileRepository } from './dexie-profile.repository';
export { DexieRoutineRepository } from './dexie-routine.repository';
export { DexieActivityRepository } from './dexie-activity.repository';
export { DexieSettingsRepository } from './dexie-settings.repository';

import { DexieActivityRepository } from './dexie-activity.repository';
import { DexieProfileRepository } from './dexie-profile.repository';
import { DexieRoutineRepository } from './dexie-routine.repository';
import { DexieSettingsRepository } from './dexie-settings.repository';

/** Default repository instances for application layer injection */
export const profileRepository = new DexieProfileRepository();
export const routineRepository = new DexieRoutineRepository();
export const activityRepository = new DexieActivityRepository();
export const settingsRepository = new DexieSettingsRepository();
