import { RecurrenceType } from '@/domain/enums';

/** Default anchor times (minutes from midnight) per routine template */
export const ROUTINE_ANCHOR_MINUTES: Record<string, number> = {
  'routine-morning': 8 * 60,
  'routine-night': 20 * 60,
  'routine-leave-home': 8 * 60 + 30,
  'routine-hygiene': 9 * 60,
  'routine-meal': 13 * 60,
  'routine-school': 8 * 60 + 15,
  'routine-doctor': 10 * 60,
  'routine-supermarket': 17 * 60,
  'routine-calm': 18 * 60,
};

export function getRoutineAnchorMinutes(templateId: string, suggested?: number): number {
  return suggested ?? ROUTINE_ANCHOR_MINUTES[templateId] ?? 7 * 60;
}

export const ROUTINE_INSTANCE_DAYS = 90;

export const ROUTINE_RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  [RecurrenceType.Once]: 'Una vez',
  [RecurrenceType.Daily]: 'Cada día',
  [RecurrenceType.Weekdays]: 'Entre semana',
  [RecurrenceType.Weekly]: 'Semanal',
  [RecurrenceType.Custom]: 'Personalizada',
};
