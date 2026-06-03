import { routineRepository, activityRepository } from '@/infrastructure/repositories';
import { syncNotificationsRolling } from '@/infrastructure/notifications/notification-sync';
import { syncInstanceWindow } from '@/infrastructure/database/instance-window-sync';
import {
  getRoutineAnchorMinutes,
  ROUTINE_INSTANCE_DAYS,
} from '@/features/routines/constants/routine-config';
import { addDays } from '@/utils/date';
import { todayISODate } from '@/utils/today';

export interface ApplyRoutineOptions {
  profileId: string;
  templateId: string;
  anchorTimeMinutes?: number;
  startDate?: string;
  instanceDays?: number;
  /** Skip duplicate check and apply with "(copia)" suffix */
  asCopy?: boolean;
}

export interface ApplyRoutineResult {
  routineId: string;
  templateIds: string[];
  instancesCreated: number;
  routineName: string;
}

export class DuplicateRoutineError extends Error {
  readonly existingRoutineId: string;
  readonly templateName: string;

  constructor(existingRoutineId: string, templateName: string) {
    super('Esta rutina ya está añadida a este perfil.');
    this.name = 'DuplicateRoutineError';
    this.existingRoutineId = existingRoutineId;
    this.templateName = templateName;
  }
}

/**
 * Applies a RoutineTemplate to a profile and generates ActivityInstances.
 */
export async function applyRoutineToProfile(
  options: ApplyRoutineOptions,
): Promise<ApplyRoutineResult> {
  const template = await routineRepository.getRoutineTemplateById(options.templateId);
  if (!template) {
    throw new Error('Plantilla de rutina no encontrada');
  }

  if (!options.asCopy) {
    const existing = await routineRepository.findActiveRoutineBySourceTemplate(
      options.profileId,
      options.templateId,
    );
    if (existing) {
      throw new DuplicateRoutineError(existing.id, template.name);
    }
  }

  const startDate = options.startDate ?? todayISODate();
  const instanceDays = options.instanceDays ?? ROUTINE_INSTANCE_DAYS;
  const toDate = addDays(startDate, instanceDays - 1);
  const anchorTimeMinutes = getRoutineAnchorMinutes(
    options.templateId,
    options.anchorTimeMinutes ?? template.suggestedAnchorTimeMinutes,
  );
  const routineName = options.asCopy ? `${template.name} (copia)` : template.name;

  const { routine, templateIds } = await routineRepository.applyRoutineTemplate({
    profileId: options.profileId,
    templateId: options.templateId,
    anchorTimeMinutes,
    startDate,
    name: routineName,
  });

  let instancesCreated = 0;
  for (const activityTemplateId of templateIds) {
    const { created } = await activityRepository.generateInstances(activityTemplateId, {
      fromDate: startDate,
      toDate,
      skipExisting: true,
    });
    instancesCreated += created.length;
  }

  syncNotificationsRolling(options.profileId);
  syncInstanceWindow(options.profileId);

  return {
    routineId: routine.id,
    templateIds,
    instancesCreated,
    routineName: routine.name,
  };
}

/** Dev helper: morning routine for active profile */
export async function applyMorningRoutineDemo(profileId: string): Promise<ApplyRoutineResult> {
  return applyRoutineToProfile({
    profileId,
    templateId: 'routine-morning',
    asCopy: true,
  });
}
