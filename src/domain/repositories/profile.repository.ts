import type {
  CreateProfileInput,
  Profile,
  ProfileSettings,
  UpdateProfileInput,
} from '../types';

export interface ProfileWithSettings {
  profile: Profile;
  settings: ProfileSettings;
}

export interface IProfileRepository {
  /** Transaction: creates Profile + default ProfileSettings */
  createProfile(input: CreateProfileInput): Promise<ProfileWithSettings>;

  updateProfile(id: string, input: UpdateProfileInput): Promise<Profile>;

  getProfileById(id: string): Promise<Profile | undefined>;

  /** Profiles where isActive=true, ordered by sortOrder */
  getActiveProfiles(): Promise<Profile[]>;

  getAllProfiles(): Promise<Profile[]>;

  getSettingsByProfileId(profileId: string): Promise<ProfileSettings | undefined>;

  updateProfileSettings(
    profileId: string,
    input: Partial<
      Pick<
        ProfileSettings,
        'showTimer' | 'showAnticipation' | 'celebrationStyle' | 'timerStyle' | 'childModeDetailLevel' | 'notificationsEnabled' | 'notificationMinutesBefore'
      >
    >,
  ): Promise<ProfileSettings>;

  /** Soft delete: isActive=false, deletedAt set; cascade handled in implementation */
  softDeleteProfile(id: string): Promise<void>;

  /** Hard delete all profile data — use with caution */
  hardDeleteProfile(id: string): Promise<void>;

  reorderProfiles(orderedIds: string[]): Promise<void>;
}
