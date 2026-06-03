import type { ActivityInstance, ActivityTemplate, CreateActivityTemplateInput } from '@/domain/types';
import { EditScope } from '@/domain/types/entities';
import type { UpdateActivityTemplateInput, UpdateSingleInstanceInput } from '@/domain/types';
import {
  buildActivityVisual,
  type ActivityFormData,
  DEFAULT_ACTIVITY_VISUAL,
  recurrenceFormToRule,
  recurrenceRuleToFormType,
} from '@/features/activities/types/activity-form.types';
import { normalizeActivityVisual } from '@/domain/visual/visual-asset.utils';
import { formatMinutesAsTime, parseTimeToMinutes } from '@/utils/formatTime';
import { isValidISODate } from '@/utils/date';

export type ActivityFormField =
  | 'title'
  | 'categoryId'
  | 'startTime'
  | 'endTime'
  | 'startDate'
  | 'endDate'
  | 'visual'
  | 'daysOfWeek';

export type ActivityFormFieldErrors = Partial<Record<ActivityFormField, string>>;

export function validateActivityFormFields(form: ActivityFormData): ActivityFormFieldErrors {
  const errors: ActivityFormFieldErrors = {};

  const title = form.title.trim();
  if (!title) {
    errors.title = 'Escribe un nombre';
  } else if (title.length < 2) {
    errors.title = 'El nombre debe tener al menos 2 letras';
  }

  if (!form.categoryId) {
    errors.categoryId = 'Elige una categoría';
  }

  const startMinutes = parseTimeToMinutes(form.startTime);
  if (startMinutes === null) {
    errors.startTime = 'Escribe una hora válida (HH:MM)';
  }

  if (form.endTime.trim()) {
    const endMinutes = parseTimeToMinutes(form.endTime);
    if (endMinutes === null) {
      errors.endTime = 'Escribe una hora válida (HH:MM)';
    } else if (startMinutes !== null && endMinutes <= startMinutes) {
      errors.endTime = 'La hora de fin debe ser posterior';
    }
  }

  if (!form.startDate || !isValidISODate(form.startDate)) {
    errors.startDate = 'Elige una fecha de inicio';
  }

  if (form.endDate) {
    if (!isValidISODate(form.endDate)) {
      errors.endDate = 'La fecha no es válida';
    } else if (form.startDate && form.endDate < form.startDate) {
      errors.endDate = 'Debe ser igual o posterior al inicio';
    }
  }

  if (form.visual.type === 'pictogram' && !form.visual.pictogramId) {
    errors.visual = 'Elige un pictograma';
  }
  if (form.visual.type === 'emoji' && !form.visual.emoji) {
    errors.visual = 'Elige un emoji';
  }

  if (
    (form.recurrenceType === 'weekly' || form.recurrenceType === 'custom') &&
    form.daysOfWeek.length === 0
  ) {
    errors.daysOfWeek = 'Elige al menos un día';
  }

  return errors;
}

export function validateActivityForm(form: ActivityFormData): string | null {
  const errors = validateActivityFormFields(form);
  const first = Object.values(errors)[0];
  return first ?? null;
}

export function formDataToCreateInput(
  form: ActivityFormData,
  profileId: string,
): CreateActivityTemplateInput {
  const startTimeMinutes = parseTimeToMinutes(form.startTime)!;
  const endTimeMinutes = form.endTime.trim() ? parseTimeToMinutes(form.endTime)! : undefined;

  return {
    profileId,
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    categoryId: form.categoryId,
    startTimeMinutes,
    endTimeMinutes,
    visual: buildActivityVisual(form.visual),
    recurrence: recurrenceFormToRule(form),
    visibility: form.visibility,
    routineId: form.routineId || undefined,
  };
}

export function formDataToUpdateTemplateInput(form: ActivityFormData): UpdateActivityTemplateInput {
  const startTimeMinutes = parseTimeToMinutes(form.startTime)!;
  const endTimeMinutes = form.endTime.trim() ? parseTimeToMinutes(form.endTime)! : undefined;

  return {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    categoryId: form.categoryId,
    startTimeMinutes,
    endTimeMinutes,
    visual: buildActivityVisual(form.visual),
    recurrence: recurrenceFormToRule(form),
    visibility: form.visibility,
    routineId: form.routineId || undefined,
  };
}

export function formDataToUpdateInstanceInput(form: ActivityFormData): UpdateSingleInstanceInput {
  const startTimeMinutes = parseTimeToMinutes(form.startTime)!;
  const endTimeMinutes = form.endTime.trim() ? parseTimeToMinutes(form.endTime)! : undefined;

  return {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    categoryId: form.categoryId,
    startTimeMinutes,
    endTimeMinutes,
    visual: buildActivityVisual(form.visual),
    visibility: form.visibility,
  };
}

export function instanceToFormData(instance: ActivityInstance, template?: ActivityTemplate): ActivityFormData {
  const recurrence = template?.recurrence;

  return {
    title: instance.title,
    description: instance.description ?? '',
    categoryId: instance.categoryId,
    startTime: formatMinutesAsTime(instance.startTimeMinutes),
    endTime: instance.endTimeMinutes != null ? formatMinutesAsTime(instance.endTimeMinutes) : '',
    visual: normalizeActivityVisual(instance.visual, instance.categoryId) ?? DEFAULT_ACTIVITY_VISUAL,
    recurrenceType: recurrence ? recurrenceRuleToFormType(recurrence) : 'once',
    daysOfWeek: recurrence?.daysOfWeek ? [...recurrence.daysOfWeek] : [],
    startDate: recurrence?.startDate ?? instance.date,
    endDate: recurrence?.endDate ?? '',
    visibility: instance.visibility,
    routineId: instance.routineId ?? template?.routineId ?? '',
  };
}

export type EditScopeChoice =
  | EditScope.ThisInstanceOnly
  | EditScope.ThisAndFuture
  | EditScope.All;

export const EDIT_SCOPE_OPTIONS: Array<{
  value: EditScopeChoice;
  label: string;
  description: string;
  disabled?: boolean;
}> = [
  {
    value: EditScope.ThisInstanceOnly,
    label: 'Solo esta actividad',
    description: 'Cambia solo este día. El resto de la repetición no se modifica.',
  },
  {
    value: EditScope.ThisAndFuture,
    label: 'Esta y las próximas',
    description: 'Los cambios se aplican desde este día en adelante. Los días anteriores no cambian.',
  },
  {
    value: EditScope.All,
    label: 'Toda la repetición',
    description: 'Próximamente: modificar toda la serie incluyendo días pasados.',
    disabled: true,
  },
];
