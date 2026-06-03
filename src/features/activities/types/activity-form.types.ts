import { ActivityVisibility, RecurrenceType } from '@/domain/enums';
import type { ActivityVisual } from '@/domain/types/value-objects';
import { DEFAULT_FALLBACK_PICTOGRAM_ID } from '@/domain/visual/visual-asset.utils';
import type { RecurrenceRule } from '@/domain/types/value-objects';

export type RecurrenceFormType = 'once' | 'daily' | 'weekdays' | 'weekly' | 'custom';

export interface ActivityFormData {
  title: string;
  description: string;
  categoryId: string;
  startTime: string;
  endTime: string;
  visual: ActivityVisual;
  recurrenceType: RecurrenceFormType;
  daysOfWeek: number[];
  startDate: string;
  endDate: string;
  visibility: ActivityVisibility;
  routineId: string;
}

export const DEFAULT_ACTIVITY_VISUAL: ActivityVisual = {
  type: 'pictogram',
  pictogramId: DEFAULT_FALLBACK_PICTOGRAM_ID,
  fallbackPictogramId: DEFAULT_FALLBACK_PICTOGRAM_ID,
};

export const DEFAULT_ACTIVITY_FORM_DATA: ActivityFormData = {
  title: '',
  description: '',
  categoryId: '',
  startTime: '09:00',
  endTime: '',
  visual: DEFAULT_ACTIVITY_VISUAL,
  recurrenceType: 'once',
  daysOfWeek: [],
  startDate: '',
  endDate: '',
  visibility: ActivityVisibility.Visible,
  routineId: '',
};

export const RECURRENCE_FORM_OPTIONS: Array<{
  value: RecurrenceFormType;
  label: string;
  description: string;
}> = [
  { value: 'once', label: 'Solo una vez', description: 'Solo en la fecha elegida' },
  { value: 'daily', label: 'Todos los días', description: 'Se repite cada día' },
  { value: 'weekdays', label: 'De lunes a viernes', description: 'Solo entre semana' },
  { value: 'weekly', label: 'Cada semana', description: 'Elige los mismos días cada semana' },
  {
    value: 'custom',
    label: 'Elegir días concretos',
    description: 'Combina los días que quieras',
  },
];

export const WEEKDAY_OPTIONS = [
  { value: 1, label: 'L' },
  { value: 2, label: 'M' },
  { value: 3, label: 'X' },
  { value: 4, label: 'J' },
  { value: 5, label: 'V' },
  { value: 6, label: 'S' },
  { value: 7, label: 'D' },
] as const;

export const VISIBILITY_OPTIONS: Array<{ value: ActivityVisibility; label: string }> = [
  { value: ActivityVisibility.Visible, label: 'Visible para todos' },
  { value: ActivityVisibility.AdultOnly, label: 'Solo modo adulto' },
  { value: ActivityVisibility.Hidden, label: 'Oculta' },
];

export function recurrenceFormToRule(form: ActivityFormData): RecurrenceRule {
  const endDate = form.endDate || undefined;
  const startDate = form.startDate;

  switch (form.recurrenceType) {
    case 'once':
      return { type: RecurrenceType.Once, startDate, endDate };
    case 'daily':
      return { type: RecurrenceType.Daily, startDate, endDate };
    case 'weekdays':
      return { type: RecurrenceType.Weekdays, startDate, endDate };
    case 'weekly':
      return { type: RecurrenceType.Weekly, startDate, endDate, daysOfWeek: [...form.daysOfWeek] };
    case 'custom':
      return { type: RecurrenceType.Custom, startDate, endDate, daysOfWeek: [...form.daysOfWeek] };
    default:
      return { type: RecurrenceType.Once, startDate, endDate };
  }
}

export function recurrenceRuleToFormType(rule: RecurrenceRule): RecurrenceFormType {
  switch (rule.type) {
    case RecurrenceType.Once:
      return 'once';
    case RecurrenceType.Daily:
      return 'daily';
    case RecurrenceType.Weekdays:
      return 'weekdays';
    case RecurrenceType.Weekly:
      return 'weekly';
    case RecurrenceType.Custom:
      return 'custom';
    default:
      return 'once';
  }
}

export function buildActivityVisual(visual: ActivityVisual): ActivityVisual {
  return visual;
}
