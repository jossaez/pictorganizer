import {
  ActivityStatus,
  ActivityVisibility,
  RecurrenceType,
  SyncStatus,
} from '@/domain/enums';
import type {
  ActivityInstance,
  ActivityTemplate,
  Profile,
  RoutineTemplate,
} from '@/domain/types';

export const FIXED_TEST_NOW = '2026-06-03T08:00:00.000Z';

export function createMockProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'profile-test-1',
    name: 'Lucía',
    color: '#4FC3F7',
    avatarId: 'avatar-1',
    sortOrder: 0,
    isActive: true,
    createdAt: FIXED_TEST_NOW,
    updatedAt: FIXED_TEST_NOW,
    syncStatus: SyncStatus.Local,
    revision: 1,
    ...overrides,
  };
}

export function createMockActivityTemplate(
  overrides: Partial<ActivityTemplate> = {},
): ActivityTemplate {
  return {
    id: 'template-test-1',
    profileId: 'profile-test-1',
    title: 'Desayuno',
    categoryId: 'food',
    startTimeMinutes: 480,
    visual: { type: 'pictogram', pictogramId: 'breakfast' },
    recurrence: { type: RecurrenceType.Daily, startDate: '2026-06-03' },
    visibility: ActivityVisibility.Visible,
    sortOrder: 0,
    isActive: true,
    createdAt: FIXED_TEST_NOW,
    updatedAt: FIXED_TEST_NOW,
    syncStatus: SyncStatus.Local,
    revision: 1,
    ...overrides,
  };
}

export function createMockActivityInstance(
  overrides: Partial<ActivityInstance> = {},
): ActivityInstance {
  return {
    id: 'instance-test-1',
    profileId: 'profile-test-1',
    templateId: 'template-test-1',
    date: '2026-06-03',
    title: 'Desayuno',
    categoryId: 'food',
    startTimeMinutes: 480,
    visual: { type: 'pictogram', pictogramId: 'breakfast' },
    visibility: ActivityVisibility.Visible,
    status: ActivityStatus.Pending,
    isException: false,
    sortOrder: 0,
    createdAt: FIXED_TEST_NOW,
    updatedAt: FIXED_TEST_NOW,
    syncStatus: SyncStatus.Local,
    revision: 1,
    ...overrides,
  };
}

export function createMockRoutineTemplate(
  overrides: Partial<RoutineTemplate> = {},
): RoutineTemplate {
  return {
    id: 'routine-test-template',
    name: 'Rutina de prueba',
    description: 'Para tests',
    categoryId: 'hygiene',
    pictogramId: 'toothbrush',
    steps: [
      {
        title: 'Lavarse los dientes',
        categoryId: 'hygiene',
        pictogramId: 'toothbrush',
        offsetMinutes: 0,
        durationMinutes: 10,
        sortOrder: 0,
      },
    ],
    sortOrder: 0,
    isSystem: true,
    suggestedRecurrenceType: RecurrenceType.Daily,
    ...overrides,
  };
}
