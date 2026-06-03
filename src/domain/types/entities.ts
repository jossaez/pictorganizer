import {
  ActivityStatus,
  ActivityVisibility,
  CelebrationStyle,
  ChildModeDetailLevel,
  DeviceLayout,
  RecurrenceType,
  SkippedBy,
  SyncStatus,
  TimerStyle,
} from '../enums';
import type { ActivityVisual, RecurrenceRule, RoutineStep } from './value-objects';

/** Shared sync-ready fields on mutable domain entities */
export interface SyncableFields {
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  remoteId?: string;
  syncStatus: SyncStatus;
  lastSyncedAt?: string;
  revision: number;
}

export interface Profile extends SyncableFields {
  id: string;
  name: string;
  photoUri?: string;
  avatarId?: string;
  color: string;
  birthDate?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ProfileSettings {
  id: string;
  profileId: string;
  showTimer: boolean;
  showAnticipation: boolean;
  celebrationStyle: CelebrationStyle;
  timerStyle: TimerStyle;
  childModeDetailLevel: ChildModeDetailLevel;
  /** Local activity reminders — off by default until adult enables */
  notificationsEnabled?: boolean;
  /** Minutes before startTimeMinutes to fire notification (0 = at activity time) */
  notificationMinutesBefore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  labelKey: string;
  label: string;
  color: string;
  iconId: string;
  sortOrder: number;
  isSystem: boolean;
}

export interface Pictogram {
  id: string;
  categoryId: string;
  label: string;
  assetPath: string;
  /** Lucide icon id fallback until SVG assets ship */
  iconId?: string;
  /** Temporary emoji until ARASAAC assets load */
  emoji?: string;
  keywords?: string[];
  sortOrder: number;
  isSystem?: boolean;
}

export interface Avatar {
  id: string;
  label: string;
  assetPath: string;
  sortOrder: number;
}

export interface RoutineTemplate {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  /** Temporary pictogram id for card icon — replaceable with real assets later */
  pictogramId?: string;
  steps: RoutineStep[];
  sortOrder: number;
  isSystem: boolean;
  /** Suggested anchor time in minutes from midnight */
  suggestedAnchorTimeMinutes?: number;
  /** Suggested recurrence applied to generated ActivityTemplates */
  suggestedRecurrenceType?: RecurrenceType;
}

export interface Routine extends SyncableFields {
  id: string;
  profileId: string;
  name: string;
  description?: string;
  sourceTemplateId?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ActivityTemplate extends SyncableFields {
  id: string;
  profileId: string;
  routineId?: string;
  title: string;
  description?: string;
  categoryId: string;
  startTimeMinutes: number;
  endTimeMinutes?: number;
  visual: ActivityVisual;
  recurrence: RecurrenceRule;
  visibility: ActivityVisibility;
  sortOrder: number;
  isActive: boolean;
}

export interface ActivityInstance extends SyncableFields {
  id: string;
  profileId: string;
  templateId?: string;
  routineId?: string;
  date: string;
  title: string;
  description?: string;
  categoryId: string;
  startTimeMinutes: number;
  endTimeMinutes?: number;
  visual: ActivityVisual;
  visibility: ActivityVisibility;
  status: ActivityStatus;
  completedAt?: string;
  skippedAt?: string;
  skippedBy?: SkippedBy;
  isException: boolean;
  sortOrder: number;
}

/** Global singleton — id is always APP_SETTINGS_ID ('app') */
export interface AppSettings {
  id: string;
  onboardingCompleted: boolean;
  activeProfileId?: string;
  adultPinHash?: string;
  /** When true and adultPinHash exists, adult routes require unlock */
  requirePinForAdultMode: boolean;
  preferredDeviceLayout: DeviceLayout;
  reduceMotion: boolean;
  largeText: boolean;
  highContrast: boolean;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
}

/** Input DTOs — omit system-managed fields */
export type CreateProfileInput = Pick<Profile, 'name' | 'color'> &
  Partial<Pick<Profile, 'photoUri' | 'avatarId' | 'birthDate' | 'sortOrder'>>;

export type UpdateProfileInput = Partial<
  Pick<Profile, 'name' | 'color' | 'photoUri' | 'avatarId' | 'birthDate' | 'sortOrder' | 'isActive'>
>;

export type CreateActivityTemplateInput = Pick<
  ActivityTemplate,
  'profileId' | 'title' | 'categoryId' | 'startTimeMinutes' | 'visual' | 'recurrence'
> &
  Partial<
    Pick<
      ActivityTemplate,
      'routineId' | 'description' | 'endTimeMinutes' | 'visibility' | 'sortOrder'
    >
  >;

export type UpdateActivityTemplateInput = Partial<
  Pick<
    ActivityTemplate,
    | 'title'
    | 'description'
    | 'categoryId'
    | 'startTimeMinutes'
    | 'endTimeMinutes'
    | 'visual'
    | 'recurrence'
    | 'visibility'
    | 'sortOrder'
    | 'isActive'
    | 'routineId'
  >
>;

export type UpdateSingleInstanceInput = Partial<
  Pick<
    ActivityInstance,
    | 'title'
    | 'description'
    | 'categoryId'
    | 'startTimeMinutes'
    | 'endTimeMinutes'
    | 'visual'
    | 'visibility'
    | 'sortOrder'
  >
>;

/** Scope when editing a recurring activity */
export enum EditScope {
  ThisInstanceOnly = 'this_instance',
  ThisAndFuture = 'this_and_future',
  All = 'all',
}
