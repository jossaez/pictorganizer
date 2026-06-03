import { ActivityStatus, RecurrenceType, SyncStatus } from '../enums';
import type { ActivityInstance, ActivityTemplate } from '../types';
import type { RecurrenceRule } from '../types/value-objects';
import { addDays, compareISODate, getDaysBetween, getISOWeekday, isValidISODate } from '../../utils/date';
import { generateId } from '../../utils/generateId';

export interface GenerateInstancesFromTemplateParams {
  template: ActivityTemplate;
  fromDate: string;
  toDate: string;
  existingInstances?: ActivityInstance[];
  /** Injectable for tests */
  now?: string;
  createId?: () => string;
}

const WEEKDAYS_ISO = [1, 2, 3, 4, 5] as const;

function defaultCreateId(): string {
  return generateId();
}

function instanceKey(templateId: string, date: string): string {
  return `${templateId}::${date}`;
}

function isWithinRecurrenceBounds(recurrence: RecurrenceRule, date: string): boolean {
  if (!recurrence.startDate || !isValidISODate(recurrence.startDate)) return false;
  if (!isValidISODate(date)) return false;
  if (compareISODate(date, recurrence.startDate) < 0) return false;
  if (recurrence.endDate && isValidISODate(recurrence.endDate) && compareISODate(date, recurrence.endDate) > 0) {
    return false;
  }
  return true;
}

function hasValidDaysOfWeek(daysOfWeek: number[] | undefined): daysOfWeek is number[] {
  return Array.isArray(daysOfWeek) && daysOfWeek.length > 0;
}

function isAllowedWeekday(date: string, daysOfWeek: number[]): boolean {
  const weekday = getISOWeekday(date);
  return daysOfWeek.includes(weekday);
}

export class RecurrenceService {
  /**
   * Returns true if an activity with the given recurrence should occur on `date`.
   * Does not consider template active state — use generateInstancesFromTemplate for that.
   */
  static shouldOccurOnDate(recurrence: RecurrenceRule, date: string): boolean {
    if (!isWithinRecurrenceBounds(recurrence, date)) return false;

    switch (recurrence.type) {
      case RecurrenceType.Once:
        return date === recurrence.startDate;

      case RecurrenceType.Daily:
        return true;

      case RecurrenceType.Weekdays:
        return isAllowedWeekday(date, [...WEEKDAYS_ISO]);

      case RecurrenceType.Weekly:
        if (!hasValidDaysOfWeek(recurrence.daysOfWeek)) return false;
        return isAllowedWeekday(date, recurrence.daysOfWeek);

      case RecurrenceType.Custom:
        if (!hasValidDaysOfWeek(recurrence.daysOfWeek)) return false;
        return isAllowedWeekday(date, recurrence.daysOfWeek);

      default:
        return false;
    }
  }

  /** Inclusive ISO date range — delegates to date utils. */
  static getDaysBetween(fromDate: string, toDate: string): string[] {
    return getDaysBetween(fromDate, toDate);
  }

  /**
   * Creates a new ActivityInstance snapshot from a template for a specific date.
   * Does not persist — caller/repository handles storage.
   */
  static createInstanceFromTemplate(
    template: ActivityTemplate,
    date: string,
    options?: { now?: string; createId?: () => string },
  ): ActivityInstance {
    const now = options?.now ?? new Date().toISOString();
    const createId = options?.createId ?? defaultCreateId;

    return {
      id: createId(),
      profileId: template.profileId,
      templateId: template.id,
      routineId: template.routineId,
      date,
      title: template.title,
      description: template.description,
      categoryId: template.categoryId,
      startTimeMinutes: template.startTimeMinutes,
      endTimeMinutes: template.endTimeMinutes,
      visual: structuredClone(template.visual),
      visibility: template.visibility,
      status: ActivityStatus.Pending,
      isException: false,
      sortOrder: template.sortOrder,
      createdAt: now,
      updatedAt: now,
      syncStatus: SyncStatus.Local,
      revision: 1,
    };
  }

  /**
   * Generates ActivityInstance snapshots for a template within [fromDate, toDate].
   * Skips duplicates when existingInstances contains the same templateId + date.
   */
  static generateInstancesFromTemplate(params: GenerateInstancesFromTemplateParams): ActivityInstance[] {
    const {
      template,
      fromDate,
      toDate,
      existingInstances = [],
      now,
      createId,
    } = params;

    if (!template.isActive || template.deletedAt) return [];
    if (!template.recurrence?.startDate || !isValidISODate(template.recurrence.startDate)) return [];
    if (!isValidISODate(fromDate) || !isValidISODate(toDate)) return [];
    if (compareISODate(fromDate, toDate) > 0) return [];

    const existingKeys = new Set(
      existingInstances
        .filter((i) => i.templateId === template.id && !i.deletedAt)
        .map((i) => instanceKey(template.id, i.date)),
    );

    const instances: ActivityInstance[] = [];
    const days = RecurrenceService.getDaysBetween(fromDate, toDate);

    for (const date of days) {
      if (!RecurrenceService.shouldOccurOnDate(template.recurrence, date)) continue;
      if (existingKeys.has(instanceKey(template.id, date))) continue;

      instances.push(
        RecurrenceService.createInstanceFromTemplate(template, date, { now, createId }),
      );
    }

    return instances;
  }

  /** Computes inclusive toDate for a rolling window of N days starting at fromDate. */
  static rollingWindowToDate(fromDate: string, windowDays: number): string {
    if (windowDays <= 0) return fromDate;
    return addDays(fromDate, windowDays - 1);
  }
}
