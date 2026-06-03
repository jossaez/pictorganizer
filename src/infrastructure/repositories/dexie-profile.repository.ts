import {
  CelebrationStyle,
  ChildModeDetailLevel,
  SyncStatus,
  TimerStyle,
} from '../../domain/enums';
import type { IProfileRepository, ProfileWithSettings } from '../../domain/repositories/profile.repository';
import type { CreateProfileInput, Profile, ProfileSettings, UpdateProfileInput } from '../../domain/types';
import { generateId } from '../../utils/generateId';
import { db } from '../database/dexie.db';
import { bumpSyncable, createSyncableFields, nowIso } from '../database/sync.helpers';

function defaultProfileSettings(profileId: string, now: string): ProfileSettings {
  return {
    id: generateId(),
    profileId,
    showTimer: true,
    showAnticipation: true,
    celebrationStyle: CelebrationStyle.Smile,
    timerStyle: TimerStyle.Bar,
    childModeDetailLevel: ChildModeDetailLevel.Standard,
    notificationsEnabled: false,
    notificationMinutesBefore: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export class DexieProfileRepository implements IProfileRepository {
  async createProfile(input: CreateProfileInput): Promise<ProfileWithSettings> {
    const now = nowIso();
    const profileId = generateId();

    const profile: Profile = {
      id: profileId,
      name: input.name,
      color: input.color,
      photoUri: input.photoUri,
      avatarId: input.avatarId,
      birthDate: input.birthDate,
      sortOrder: input.sortOrder ?? (await db.profiles.count()),
      isActive: true,
      ...createSyncableFields(now),
    };

    const settings = defaultProfileSettings(profileId, now);

    await db.transaction('rw', [db.profiles, db.profileSettings], async () => {
      await db.profiles.add(profile);
      await db.profileSettings.add(settings);
    });

    return { profile, settings };
  }

  async updateProfile(id: string, input: UpdateProfileInput): Promise<Profile> {
    const existing = await db.profiles.get(id);
    if (!existing || !existing.isActive) {
      throw new Error(`Profile not found: ${id}`);
    }

    const updated = bumpSyncable({
      ...existing,
      ...input,
    });

    await db.profiles.put(updated);
    return updated;
  }

  async getProfileById(id: string): Promise<Profile | undefined> {
    return db.profiles.get(id);
  }

  async getActiveProfiles(): Promise<Profile[]> {
    return db.profiles.filter((p) => p.isActive && !p.deletedAt).sortBy('sortOrder');
  }

  async getAllProfiles(): Promise<Profile[]> {
    return db.profiles.orderBy('sortOrder').toArray();
  }

  async getSettingsByProfileId(profileId: string): Promise<ProfileSettings | undefined> {
    return db.profileSettings.where('profileId').equals(profileId).first();
  }

  async updateProfileSettings(
    profileId: string,
    input: Partial<
      Pick<
        ProfileSettings,
        'showTimer' | 'showAnticipation' | 'celebrationStyle' | 'timerStyle' | 'childModeDetailLevel' | 'notificationsEnabled' | 'notificationMinutesBefore'
      >
    >,
  ): Promise<ProfileSettings> {
    const existing = await this.getSettingsByProfileId(profileId);
    if (!existing) {
      throw new Error(`ProfileSettings not found for profile: ${profileId}`);
    }

    const updated: ProfileSettings = {
      ...existing,
      ...input,
      updatedAt: nowIso(),
    };

    await db.profileSettings.put(updated);
    return updated;
  }

  async softDeleteProfile(id: string): Promise<void> {
    const now = nowIso();
    const profile = await db.profiles.get(id);
    if (!profile) return;

    await db.profiles.put({
      ...profile,
      isActive: false,
      deletedAt: now,
      updatedAt: now,
      syncStatus: SyncStatus.Pending,
      revision: profile.revision + 1,
    });
  }

  /**
   * Transaction: soft-delete profile and cascade to routines, templates, instances.
   * Photos on filesystem must be deleted by PhotoStorage in application layer.
   */
  async hardDeleteProfile(id: string): Promise<void> {
    const now = nowIso();

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
        const profile = await db.profiles.get(id);
        if (!profile) return;

        await db.profiles.put({
          ...profile,
          isActive: false,
          deletedAt: now,
          updatedAt: now,
          syncStatus: SyncStatus.Pending,
          revision: profile.revision + 1,
        });

        await db.profileSettings.where('profileId').equals(id).delete();

        const routineIds = await db.routines.where('profileId').equals(id).primaryKeys();
        await db.routines.where('profileId').equals(id).modify({
          isActive: false,
          deletedAt: now,
          updatedAt: now,
        });

        await db.activityTemplates.where('profileId').equals(id).modify({
          isActive: false,
          deletedAt: now,
          updatedAt: now,
        });

        await db.activityInstances.where('profileId').equals(id).modify({
          deletedAt: now,
          updatedAt: now,
        });

        void routineIds;
      },
    );
  }

  async reorderProfiles(orderedIds: string[]): Promise<void> {
    await db.transaction('rw', [db.profiles], async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        const profile = await db.profiles.get(orderedIds[i]);
        if (!profile) continue;
        await db.profiles.put(bumpSyncable({ ...profile, sortOrder: i }));
      }
    });
  }
}
