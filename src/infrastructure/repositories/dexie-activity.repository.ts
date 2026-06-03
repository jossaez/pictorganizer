import { ActivityStatus, ActivityVisibility, SkippedBy } from '../../domain/enums';
import { RecurrenceType } from '../../domain/enums';
import { RecurrenceService } from '../../domain/services/recurrence.service';
import type {
  GenerateInstancesOptions,
  GenerateInstancesResult,
  IActivityRepository,
} from '../../domain/repositories/activity.repository';
import type {
  ActivityInstance,
  ActivityTemplate,
  CreateActivityTemplateInput,
  UpdateActivityTemplateInput,
  UpdateSingleInstanceInput,
} from '../../domain/types';
import { EditScope } from '../../domain/types/entities';
import { generateId } from '../../utils/generateId';
import { compareISODate, getDaysBetween } from '../../utils/date';
import { todayISODate } from '../../utils/today';
import { db } from '../database/dexie.db';
import { bumpSyncable, createSyncableFields, nowIso } from '../database/sync.helpers';

/** Rolling window defaults — align with domain spec */
export const DEFAULT_ROLLING_WINDOW_DAYS = 90;
export const ROLLING_EXTEND_THRESHOLD_DAYS = 30;

export class DexieActivityRepository implements IActivityRepository {
  async createTemplate(input: CreateActivityTemplateInput): Promise<ActivityTemplate> {
    const now = nowIso();
    const count = await db.activityTemplates.where('profileId').equals(input.profileId).count();

    const template: ActivityTemplate = {
      id: generateId(),
      profileId: input.profileId,
      routineId: input.routineId,
      title: input.title,
      description: input.description,
      categoryId: input.categoryId,
      startTimeMinutes: input.startTimeMinutes,
      endTimeMinutes: input.endTimeMinutes,
      visual: input.visual,
      recurrence: input.recurrence,
      visibility: input.visibility ?? ActivityVisibility.Visible,
      sortOrder: input.sortOrder ?? count,
      isActive: true,
      ...createSyncableFields(now),
    };

    await db.activityTemplates.add(template);
    return template;
  }

  async getTemplateById(id: string): Promise<ActivityTemplate | undefined> {
    return db.activityTemplates.get(id);
  }

  async getActiveTemplatesByProfile(profileId: string): Promise<ActivityTemplate[]> {
    return db.activityTemplates
      .where('profileId')
      .equals(profileId)
      .filter((t) => t.isActive && !t.deletedAt)
      .toArray();
  }

  async getTemplatesByRoutine(routineId: string): Promise<ActivityTemplate[]> {
    return db.activityTemplates.where('routineId').equals(routineId).sortBy('sortOrder');
  }

  async updateTemplate(id: string, input: UpdateActivityTemplateInput): Promise<ActivityTemplate> {
    const existing = await db.activityTemplates.get(id);
    if (!existing) throw new Error(`ActivityTemplate not found: ${id}`);

    const updated = bumpSyncable({ ...existing, ...input });
    await db.activityTemplates.put(updated);
    return updated;
  }

  async softDeleteTemplate(id: string): Promise<void> {
    const now = nowIso();
    const existing = await db.activityTemplates.get(id);
    if (!existing) return;

    await db.activityTemplates.put(
      bumpSyncable({
        ...existing,
        isActive: false,
        deletedAt: now,
      }),
    );
  }

  async generateInstances(
    templateId: string,
    options: GenerateInstancesOptions,
  ): Promise<GenerateInstancesResult> {
    const template = await db.activityTemplates.get(templateId);
    if (!template) {
      throw new Error(`ActivityTemplate not found: ${templateId}`);
    }

    const existing =
      options.skipExisting !== false
        ? await db.activityInstances
            .where('templateId')
            .equals(templateId)
            .filter(
              (i) =>
                !i.deletedAt &&
                i.date >= options.fromDate &&
                i.date <= options.toDate,
            )
            .toArray()
        : [];

    const created = RecurrenceService.generateInstancesFromTemplate({
      template,
      fromDate: options.fromDate,
      toDate: options.toDate,
      existingInstances: existing,
    });

    if (created.length > 0) {
      await db.activityInstances.bulkAdd(created);
    }

    const expectedCount = RecurrenceService.getDaysBetween(options.fromDate, options.toDate).filter(
      (date) => RecurrenceService.shouldOccurOnDate(template.recurrence, date),
    ).length;

    const skipped = Math.max(0, expectedCount - created.length);

    return { created, skipped };
  }

  async createTemplateWithInstances(
    input: CreateActivityTemplateInput,
    windowDays: number = DEFAULT_ROLLING_WINDOW_DAYS,
  ): Promise<{ template: ActivityTemplate; instances: ActivityInstance[] }> {
    return db.transaction('rw', [db.activityTemplates, db.activityInstances], async () => {
      const template = await this.createTemplate(input);
      const toDate =
        input.recurrence.endDate ??
        RecurrenceService.rollingWindowToDate(input.recurrence.startDate, windowDays);
      const result = await this.generateInstances(template.id, {
        fromDate: input.recurrence.startDate,
        toDate,
        skipExisting: true,
      });
      return { template, instances: result.created };
    });
  }

  async getInstanceById(id: string): Promise<ActivityInstance | undefined> {
    return db.activityInstances.get(id);
  }

  async getInstancesByDate(profileId: string, date: string): Promise<ActivityInstance[]> {
    const rows = await db.activityInstances
      .where('[profileId+date]')
      .equals([profileId, date])
      .sortBy('startTimeMinutes');
    return rows.filter((i) => !i.deletedAt);
  }

  async getInstancesByDateRange(
    profileId: string,
    fromDate: string,
    toDate: string,
  ): Promise<ActivityInstance[]> {
    const rows = await db.activityInstances
      .where('[profileId+date]')
      .between([profileId, fromDate], [profileId, toDate], true, true)
      .sortBy('startTimeMinutes');
    return rows.filter((i) => !i.deletedAt);
  }

  async updateSingleInstance(id: string, input: UpdateSingleInstanceInput): Promise<ActivityInstance> {
    const existing = await db.activityInstances.get(id);
    if (!existing) throw new Error(`ActivityInstance not found: ${id}`);

    const updated = bumpSyncable({
      ...existing,
      ...input,
      isException: true,
    });

    await db.activityInstances.put(updated);
    return updated;
  }

  async updateTemplateAndFutureInstances(
    templateId: string,
    input: UpdateActivityTemplateInput,
    effectiveFromDate: string,
    scope: EditScope,
  ): Promise<{ template: ActivityTemplate; instances: ActivityInstance[] }> {
    return db.transaction('rw', [db.activityTemplates, db.activityInstances], async () => {
      const existing = await db.activityTemplates.get(templateId);
      if (!existing) throw new Error(`ActivityTemplate not found: ${templateId}`);

      const deleteFromDate =
        scope === EditScope.All ? existing.recurrence.startDate : effectiveFromDate;

      const template = await this.updateTemplate(templateId, input);

      await this.deleteFutureInstances(templateId, deleteFromDate, true);

      const toDate =
        template.recurrence.endDate ??
        RecurrenceService.rollingWindowToDate(deleteFromDate, DEFAULT_ROLLING_WINDOW_DAYS);

      const { created } = await this.generateInstances(templateId, {
        fromDate: deleteFromDate,
        toDate,
        skipExisting: true,
      });

      return { template, instances: created };
    });
  }

  async regenerateFutureInstances(
    templateId: string,
    fromDate: string,
    windowDays: number = DEFAULT_ROLLING_WINDOW_DAYS,
  ): Promise<ActivityInstance[]> {
    const template = await db.activityTemplates.get(templateId);
    if (!template) throw new Error(`ActivityTemplate not found: ${templateId}`);

    await this.deleteFutureInstances(templateId, fromDate, true);
    const toDate =
      template.recurrence.endDate ?? RecurrenceService.rollingWindowToDate(fromDate, windowDays);
    const { created } = await this.generateInstances(templateId, {
      fromDate,
      toDate,
      skipExisting: true,
    });
    return created;
  }

  async completeInstance(id: string, completedAt?: string): Promise<ActivityInstance> {
    const existing = await db.activityInstances.get(id);
    if (!existing) throw new Error(`ActivityInstance not found: ${id}`);

    const at = completedAt ?? nowIso();
    const updated = bumpSyncable({
      ...existing,
      status: ActivityStatus.Completed,
      completedAt: at,
      skippedAt: undefined,
      skippedBy: undefined,
    });

    await db.activityInstances.put(updated);
    return updated;
  }

  async skipInstance(
    id: string,
    skippedBy: SkippedBy,
    skippedAt?: string,
  ): Promise<ActivityInstance> {
    const existing = await db.activityInstances.get(id);
    if (!existing) throw new Error(`ActivityInstance not found: ${id}`);

    const at = skippedAt ?? nowIso();
    const updated = bumpSyncable({
      ...existing,
      status: ActivityStatus.Skipped,
      skippedAt: at,
      skippedBy,
      completedAt: undefined,
    });

    await db.activityInstances.put(updated);
    return updated;
  }

  async undoInstanceStatus(id: string): Promise<ActivityInstance> {
    const existing = await db.activityInstances.get(id);
    if (!existing) throw new Error(`ActivityInstance not found: ${id}`);

    if (
      existing.status !== ActivityStatus.Completed &&
      existing.status !== ActivityStatus.Skipped
    ) {
      throw new Error('Solo se puede deshacer actividades completadas o saltadas');
    }

    const updated = bumpSyncable({
      ...existing,
      status: ActivityStatus.Pending,
      completedAt: undefined,
      skippedAt: undefined,
      skippedBy: undefined,
    });

    await db.activityInstances.put(updated);
    return updated;
  }

  async undoCompleteOrSkip(id: string): Promise<ActivityInstance> {
    return this.undoInstanceStatus(id);
  }

  async softDeleteInstance(id: string): Promise<void> {
    const now = nowIso();
    const existing = await db.activityInstances.get(id);
    if (!existing) return;

    await db.activityInstances.put(
      bumpSyncable({
        ...existing,
        deletedAt: now,
      }),
    );
  }

  async extendRollingWindowForProfile(
    profileId: string,
    thresholdDays: number = ROLLING_EXTEND_THRESHOLD_DAYS,
  ): Promise<void> {
    const today = todayISODate();
    const templates = await this.getActiveTemplatesByProfile(profileId);
    const extendTarget = RecurrenceService.rollingWindowToDate(
      today,
      DEFAULT_ROLLING_WINDOW_DAYS,
    );

    for (const template of templates) {
      if (template.recurrence.type === RecurrenceType.Once) continue;

      const instances = await db.activityInstances
        .where('templateId')
        .equals(template.id)
        .filter((row) => !row.deletedAt)
        .toArray();

      let furthestFuture = today;
      for (const instance of instances) {
        if (compareISODate(instance.date, today) >= 0 && compareISODate(instance.date, furthestFuture) > 0) {
          furthestFuture = instance.date;
        }
      }

      const futureDayCount =
        compareISODate(furthestFuture, today) >= 0
          ? getDaysBetween(today, furthestFuture).length
          : 0;

      if (futureDayCount >= thresholdDays) continue;

      const toDate =
        template.recurrence.endDate &&
        compareISODate(template.recurrence.endDate, extendTarget) < 0
          ? template.recurrence.endDate
          : extendTarget;

      if (compareISODate(toDate, today) < 0) continue;

      await this.generateInstances(template.id, {
        fromDate: today,
        toDate,
        skipExisting: true,
      });
    }
  }

  async deleteFutureInstances(
    templateId: string,
    fromDate: string,
    preserveExceptions = true,
  ): Promise<number> {
    const now = nowIso();
    const rows = await db.activityInstances
      .where('templateId')
      .equals(templateId)
      .filter((row) => row.date >= fromDate && !row.deletedAt)
      .toArray();

    const toSoftDelete = rows.filter((row) => !preserveExceptions || !row.isException);
    for (const row of toSoftDelete) {
      await db.activityInstances.put(
        bumpSyncable({
          ...row,
          deletedAt: now,
        }),
      );
    }
    return toSoftDelete.length;
  }
}
