import { describe, expect, it } from 'vitest';
import {
  ActivityStatus,
  ActivityVisibility,
  RecurrenceType,
  SyncStatus,
} from '../enums';
import type { ActivityInstance, ActivityTemplate } from '../types';
import { RecurrenceService } from './recurrence.service';
import { addDays, getISOWeekday } from '../../utils/date';

const FIXED_NOW = '2026-06-01T08:00:00.000Z';
let idCounter = 0;

function nextId(): string {
  idCounter += 1;
  return `test-id-${idCounter}`;
}

function createTemplate(
  overrides: Partial<ActivityTemplate> & { recurrence: ActivityTemplate['recurrence'] },
): ActivityTemplate {
  return {
    id: 'template-1',
    profileId: 'profile-1',
    title: 'Test activity',
    categoryId: 'food',
    startTimeMinutes: 480,
    endTimeMinutes: 510,
    visual: { type: 'pictogram', pictogramId: 'breakfast' },
    visibility: ActivityVisibility.Visible,
    sortOrder: 0,
    isActive: true,
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW,
    syncStatus: SyncStatus.Local,
    revision: 1,
    ...overrides,
  };
}

describe('date utils — getISOWeekday', () => {
  it('returns Monday=1 and Sunday=7', () => {
    expect(getISOWeekday('2026-06-01')).toBe(1);
    expect(getISOWeekday('2026-06-07')).toBe(7);
  });
});

describe('RecurrenceService.getDaysBetween', () => {
  it('returns inclusive range', () => {
    expect(RecurrenceService.getDaysBetween('2026-06-01', '2026-06-03')).toEqual([
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
    ]);
  });

  it('returns empty when fromDate > toDate', () => {
    expect(RecurrenceService.getDaysBetween('2026-06-05', '2026-06-01')).toEqual([]);
  });
});

describe('RecurrenceService.shouldOccurOnDate', () => {
  it('once only on exact startDate', () => {
    const recurrence = { type: RecurrenceType.Once, startDate: '2026-06-05' };
    expect(RecurrenceService.shouldOccurOnDate(recurrence, '2026-06-05')).toBe(true);
    expect(RecurrenceService.shouldOccurOnDate(recurrence, '2026-06-06')).toBe(false);
  });

  it('daily occurs every day within bounds', () => {
    const recurrence = {
      type: RecurrenceType.Daily,
      startDate: '2026-06-01',
      endDate: '2026-06-03',
    };
    expect(RecurrenceService.shouldOccurOnDate(recurrence, '2026-06-02')).toBe(true);
    expect(RecurrenceService.shouldOccurOnDate(recurrence, '2026-06-04')).toBe(false);
  });

  it('weekdays occurs Mon-Fri only', () => {
    const recurrence = { type: RecurrenceType.Weekdays, startDate: '2026-06-01' };
    expect(RecurrenceService.shouldOccurOnDate(recurrence, '2026-06-01')).toBe(true);
    expect(RecurrenceService.shouldOccurOnDate(recurrence, '2026-06-06')).toBe(false);
    expect(RecurrenceService.shouldOccurOnDate(recurrence, '2026-06-07')).toBe(false);
  });

  it('weekly occurs on configured ISO weekdays', () => {
    const recurrence = {
      type: RecurrenceType.Weekly,
      startDate: '2026-06-01',
      daysOfWeek: [1],
    };
    expect(RecurrenceService.shouldOccurOnDate(recurrence, '2026-06-01')).toBe(true);
    expect(RecurrenceService.shouldOccurOnDate(recurrence, '2026-06-02')).toBe(false);
    expect(RecurrenceService.shouldOccurOnDate(recurrence, '2026-06-08')).toBe(true);
  });

  it('custom occurs on multiple configured days', () => {
    const recurrence = {
      type: RecurrenceType.Custom,
      startDate: '2026-06-01',
      daysOfWeek: [1, 3, 5],
    };
    expect(RecurrenceService.shouldOccurOnDate(recurrence, '2026-06-01')).toBe(true);
    expect(RecurrenceService.shouldOccurOnDate(recurrence, '2026-06-03')).toBe(true);
    expect(RecurrenceService.shouldOccurOnDate(recurrence, '2026-06-04')).toBe(false);
  });

  it('returns false before startDate', () => {
    const recurrence = { type: RecurrenceType.Daily, startDate: '2026-06-05' };
    expect(RecurrenceService.shouldOccurOnDate(recurrence, '2026-06-04')).toBe(false);
  });

  it('returns false after endDate', () => {
    const recurrence = {
      type: RecurrenceType.Daily,
      startDate: '2026-06-01',
      endDate: '2026-06-05',
    };
    expect(RecurrenceService.shouldOccurOnDate(recurrence, '2026-06-06')).toBe(false);
  });

  it('weekly/custom without daysOfWeek returns false', () => {
    expect(
      RecurrenceService.shouldOccurOnDate(
        { type: RecurrenceType.Weekly, startDate: '2026-06-01' },
        '2026-06-01',
      ),
    ).toBe(false);
    expect(
      RecurrenceService.shouldOccurOnDate(
        { type: RecurrenceType.Custom, startDate: '2026-06-01', daysOfWeek: [] },
        '2026-06-01',
      ),
    ).toBe(false);
  });
});

describe('RecurrenceService.generateInstancesFromTemplate', () => {
  it('once generates only one instance on startDate', () => {
    const template = createTemplate({
      recurrence: { type: RecurrenceType.Once, startDate: '2026-06-05' },
    });

    const instances = RecurrenceService.generateInstancesFromTemplate({
      template,
      fromDate: '2026-06-01',
      toDate: '2026-06-10',
      now: FIXED_NOW,
      createId: nextId,
    });

    expect(instances).toHaveLength(1);
    expect(instances[0].date).toBe('2026-06-05');
  });

  it('daily generates all days in range', () => {
    const template = createTemplate({
      recurrence: { type: RecurrenceType.Daily, startDate: '2026-06-01' },
    });

    const instances = RecurrenceService.generateInstancesFromTemplate({
      template,
      fromDate: '2026-06-01',
      toDate: '2026-06-07',
      now: FIXED_NOW,
      createId: nextId,
    });

    expect(instances).toHaveLength(7);
    expect(instances.map((i) => i.date)).toEqual([
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
      '2026-06-04',
      '2026-06-05',
      '2026-06-06',
      '2026-06-07',
    ]);
  });

  it('weekdays generates Mon-Fri only', () => {
    const template = createTemplate({
      recurrence: { type: RecurrenceType.Weekdays, startDate: '2026-06-01' },
    });

    const instances = RecurrenceService.generateInstancesFromTemplate({
      template,
      fromDate: '2026-06-01',
      toDate: '2026-06-07',
      now: FIXED_NOW,
      createId: nextId,
    });

    expect(instances.map((i) => i.date)).toEqual([
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
      '2026-06-04',
      '2026-06-05',
    ]);
  });

  it('weekly generates correct weekday occurrences', () => {
    const template = createTemplate({
      recurrence: {
        type: RecurrenceType.Weekly,
        startDate: '2026-06-01',
        daysOfWeek: [3],
      },
    });

    const instances = RecurrenceService.generateInstancesFromTemplate({
      template,
      fromDate: '2026-06-01',
      toDate: '2026-06-14',
      now: FIXED_NOW,
      createId: nextId,
    });

    expect(instances.map((i) => i.date)).toEqual(['2026-06-03', '2026-06-10']);
  });

  it('custom generates configured weekdays', () => {
    const template = createTemplate({
      recurrence: {
        type: RecurrenceType.Custom,
        startDate: '2026-06-01',
        daysOfWeek: [1, 5],
      },
    });

    const instances = RecurrenceService.generateInstancesFromTemplate({
      template,
      fromDate: '2026-06-01',
      toDate: '2026-06-07',
      now: FIXED_NOW,
      createId: nextId,
    });

    expect(instances.map((i) => i.date)).toEqual(['2026-06-01', '2026-06-05']);
  });

  it('does not generate before startDate', () => {
    const template = createTemplate({
      recurrence: { type: RecurrenceType.Daily, startDate: '2026-06-05' },
    });

    const instances = RecurrenceService.generateInstancesFromTemplate({
      template,
      fromDate: '2026-06-01',
      toDate: '2026-06-04',
      now: FIXED_NOW,
      createId: nextId,
    });

    expect(instances).toHaveLength(0);
  });

  it('does not generate after endDate', () => {
    const template = createTemplate({
      recurrence: {
        type: RecurrenceType.Daily,
        startDate: '2026-06-01',
        endDate: '2026-06-05',
      },
    });

    const instances = RecurrenceService.generateInstancesFromTemplate({
      template,
      fromDate: '2026-06-01',
      toDate: '2026-06-10',
      now: FIXED_NOW,
      createId: nextId,
    });

    expect(instances).toHaveLength(5);
    expect(instances.at(-1)?.date).toBe('2026-06-05');
  });

  it('does not generate when template is inactive', () => {
    const template = createTemplate({
      isActive: false,
      recurrence: { type: RecurrenceType.Daily, startDate: '2026-06-01' },
    });

    const instances = RecurrenceService.generateInstancesFromTemplate({
      template,
      fromDate: '2026-06-01',
      toDate: '2026-06-03',
      now: FIXED_NOW,
      createId: nextId,
    });

    expect(instances).toHaveLength(0);
  });

  it('does not duplicate existingInstances for templateId+date', () => {
    const template = createTemplate({
      recurrence: { type: RecurrenceType.Daily, startDate: '2026-06-01' },
    });

    const existing: ActivityInstance[] = [
      {
        id: 'existing-1',
        profileId: template.profileId,
        templateId: template.id,
        date: '2026-06-02',
        title: template.title,
        categoryId: template.categoryId,
        startTimeMinutes: template.startTimeMinutes,
        visual: template.visual,
        visibility: template.visibility,
        status: ActivityStatus.Pending,
        isException: false,
        sortOrder: 0,
        createdAt: FIXED_NOW,
        updatedAt: FIXED_NOW,
        syncStatus: SyncStatus.Local,
        revision: 1,
      },
    ];

    const instances = RecurrenceService.generateInstancesFromTemplate({
      template,
      fromDate: '2026-06-01',
      toDate: '2026-06-03',
      existingInstances: existing,
      now: FIXED_NOW,
      createId: nextId,
    });

    expect(instances).toHaveLength(2);
    expect(instances.map((i) => i.date)).toEqual(['2026-06-01', '2026-06-03']);
  });

  it('returns empty array when fromDate > toDate', () => {
    const template = createTemplate({
      recurrence: { type: RecurrenceType.Daily, startDate: '2026-06-01' },
    });

    expect(
      RecurrenceService.generateInstancesFromTemplate({
        template,
        fromDate: '2026-06-10',
        toDate: '2026-06-01',
        now: FIXED_NOW,
        createId: nextId,
      }),
    ).toEqual([]);
  });
});

describe('RecurrenceService.createInstanceFromTemplate', () => {
  it('copies snapshot fields from template and sets defaults', () => {
    const template = createTemplate({
      id: 'tpl-99',
      profileId: 'prof-42',
      routineId: 'routine-7',
      title: 'Desayuno',
      description: 'Con leche',
      categoryId: 'food',
      startTimeMinutes: 480,
      endTimeMinutes: 510,
      sortOrder: 3,
      recurrence: { type: RecurrenceType.Daily, startDate: '2026-06-01' },
    });

    const instance = RecurrenceService.createInstanceFromTemplate(template, '2026-06-02', {
      now: FIXED_NOW,
      createId: () => 'inst-1',
    });

    expect(instance).toMatchObject({
      id: 'inst-1',
      profileId: 'prof-42',
      templateId: 'tpl-99',
      routineId: 'routine-7',
      date: '2026-06-02',
      title: 'Desayuno',
      description: 'Con leche',
      categoryId: 'food',
      startTimeMinutes: 480,
      endTimeMinutes: 510,
      visibility: ActivityVisibility.Visible,
      sortOrder: 3,
      status: ActivityStatus.Pending,
      isException: false,
      syncStatus: SyncStatus.Local,
      revision: 1,
      createdAt: FIXED_NOW,
      updatedAt: FIXED_NOW,
    });
    expect(instance.completedAt).toBeUndefined();
    expect(instance.skippedAt).toBeUndefined();
    expect(instance.skippedBy).toBeUndefined();
    expect(instance.visual).toEqual(template.visual);
    expect(instance.visual).not.toBe(template.visual);
  });
});

describe('RecurrenceService.rollingWindowToDate', () => {
  it('computes inclusive rolling window end date', () => {
    expect(RecurrenceService.rollingWindowToDate('2026-06-01', 7)).toBe('2026-06-07');
    expect(RecurrenceService.rollingWindowToDate('2026-06-01', 1)).toBe('2026-06-01');
    expect(addDays('2026-06-01', 6)).toBe('2026-06-07');
  });
});
