import type {
  ApplyRoutineTemplateInput,
  ApplyRoutineTemplateResult,
  IRoutineRepository,
} from '../../domain/repositories/routine.repository';
import { ActivityVisibility, RecurrenceType } from '../../domain/enums';
import type { Routine, RoutineTemplate } from '../../domain/types';
import { generateId } from '../../utils/generateId';
import { db } from '../database/dexie.db';
import { bumpSyncable, createSyncableFields, nowIso } from '../database/sync.helpers';

export class DexieRoutineRepository implements IRoutineRepository {
  async createRoutine(
    input: Pick<Routine, 'profileId' | 'name'> &
      Partial<Pick<Routine, 'description' | 'sourceTemplateId' | 'sortOrder'>>,
  ): Promise<Routine> {
    const now = nowIso();
    const count = await db.routines.where('profileId').equals(input.profileId).count();

    const routine: Routine = {
      id: generateId(),
      profileId: input.profileId,
      name: input.name,
      description: input.description,
      sourceTemplateId: input.sourceTemplateId,
      sortOrder: input.sortOrder ?? count,
      isActive: true,
      ...createSyncableFields(now),
    };

    await db.routines.add(routine);
    return routine;
  }

  async updateRoutine(
    id: string,
    input: Partial<Pick<Routine, 'name' | 'description' | 'sortOrder' | 'isActive'>>,
  ): Promise<Routine> {
    const existing = await db.routines.get(id);
    if (!existing) throw new Error(`Routine not found: ${id}`);

    const updated = bumpSyncable({ ...existing, ...input });
    await db.routines.put(updated);
    return updated;
  }

  async getRoutineById(id: string): Promise<Routine | undefined> {
    return db.routines.get(id);
  }

  async getActiveRoutinesByProfile(profileId: string): Promise<Routine[]> {
    return db.routines
      .where('profileId')
      .equals(profileId)
      .filter((r) => r.isActive && !r.deletedAt)
      .sortBy('sortOrder');
  }

  async softDeleteRoutine(id: string): Promise<void> {
    const now = nowIso();
    const existing = await db.routines.get(id);
    if (!existing) return;

    await db.routines.put(
      bumpSyncable({
        ...existing,
        isActive: false,
        deletedAt: now,
      }),
    );
  }

  async findActiveRoutineBySourceTemplate(
    profileId: string,
    sourceTemplateId: string,
  ): Promise<Routine | undefined> {
    return db.routines
      .where('profileId')
      .equals(profileId)
      .filter(
        (r) => r.isActive && !r.deletedAt && r.sourceTemplateId === sourceTemplateId,
      )
      .first();
  }

  async getRoutineTemplateById(id: string): Promise<RoutineTemplate | undefined> {
    return db.routineTemplates.get(id);
  }

  async getAllRoutineTemplates(): Promise<RoutineTemplate[]> {
    return db.routineTemplates.orderBy('sortOrder').toArray();
  }

  /**
   * Transaction: creates Routine + ActivityTemplates from template steps.
   * Instance generation is delegated to DexieActivityRepository.generateInstances
   * in the application orchestration layer.
   */
  async applyRoutineTemplate(input: ApplyRoutineTemplateInput): Promise<ApplyRoutineTemplateResult> {
    const template = await this.getRoutineTemplateById(input.templateId);
    if (!template) {
      throw new Error(`RoutineTemplate not found: ${input.templateId}`);
    }

    const now = nowIso();
    const templateIds: string[] = [];

    const routine = await db.transaction('rw', [db.routines, db.activityTemplates], async () => {
      const routineCount = await db.routines.where('profileId').equals(input.profileId).count();

      const routine: Routine = {
        id: generateId(),
        profileId: input.profileId,
        name: input.name ?? template.name,
        description: template.description,
        sourceTemplateId: template.id,
        sortOrder: routineCount,
        isActive: true,
        ...createSyncableFields(now),
      };

      await db.routines.add(routine);

      for (let i = 0; i < template.steps.length; i++) {
        const step = template.steps[i];
        const templateId = generateId();
        templateIds.push(templateId);

        const recurrenceType = template.suggestedRecurrenceType ?? RecurrenceType.Daily;

        await db.activityTemplates.add({
          id: templateId,
          profileId: input.profileId,
          routineId: routine.id,
          title: step.title,
          description: step.description,
          categoryId: step.categoryId,
          startTimeMinutes: input.anchorTimeMinutes + step.offsetMinutes,
          endTimeMinutes: step.durationMinutes
            ? input.anchorTimeMinutes + step.offsetMinutes + step.durationMinutes
            : undefined,
          visual: { type: 'pictogram', pictogramId: step.pictogramId },
          recurrence: {
            type: recurrenceType,
            startDate: input.startDate,
          },
          visibility: ActivityVisibility.Visible,
          sortOrder: step.sortOrder ?? i,
          isActive: true,
          ...createSyncableFields(now),
        });
      }

      return routine;
    });

    return { routine, templateIds };
  }
}
