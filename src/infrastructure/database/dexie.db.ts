import Dexie, { type EntityTable } from 'dexie';
import type {
  ActivityInstance,
  ActivityTemplate,
  AppSettings,
  Avatar,
  Category,
  Pictogram,
  Profile,
  ProfileSettings,
  Routine,
  RoutineTemplate,
} from '../../domain/types';

/** Dexie schema version — keep in sync with AppSettings.schemaVersion after migrations */
export const DEXIE_SCHEMA_VERSION = 1;

export const DB_NAME = 'pictorganizer_db';

/**
 * Typed Dexie database for PICTORGANIZER v1.
 *
 * Catalog tables (categories, pictograms, avatars, routineTemplates) are seeded
 * once via seedIfEmpty(). User-mutable data lives in profiles/routines/templates/instances.
 */
export class PictorganizerDatabase extends Dexie {
  profiles!: EntityTable<Profile, 'id'>;
  profileSettings!: EntityTable<ProfileSettings, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  pictograms!: EntityTable<Pictogram, 'id'>;
  avatars!: EntityTable<Avatar, 'id'>;
  routineTemplates!: EntityTable<RoutineTemplate, 'id'>;
  routines!: EntityTable<Routine, 'id'>;
  activityTemplates!: EntityTable<ActivityTemplate, 'id'>;
  activityInstances!: EntityTable<ActivityInstance, 'id'>;
  appSettings!: EntityTable<AppSettings, 'id'>;

  constructor() {
    super(DB_NAME);

    this.version(DEXIE_SCHEMA_VERSION).stores({
      profiles: 'id, isActive, sortOrder',
      profileSettings: 'id, profileId',
      categories: 'id, sortOrder, isSystem',
      pictograms: 'id, categoryId, sortOrder',
      avatars: 'id, sortOrder',
      routineTemplates: 'id, sortOrder, isSystem, categoryId',
      routines: 'id, profileId, sourceTemplateId, isActive, [profileId+isActive]',
      activityTemplates:
        'id, profileId, routineId, categoryId, isActive, [profileId+isActive], [profileId+routineId]',
      activityInstances:
        'id, profileId, date, templateId, routineId, status, [profileId+date], [profileId+date+startTimeMinutes], [profileId+status], [profileId+date+status]',
      appSettings: 'id',
    });
  }
}

/** Singleton database instance — import this from repositories and seeds */
export const db = new PictorganizerDatabase();
