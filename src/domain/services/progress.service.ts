import { ActivityStatus } from '../enums';
import type { ActivityInstance } from '../types';
import type { ComputedActivityState } from './activity-state.service';

export interface DailyProgress {
  date?: string;
  total: number;
  completed: number;
  pending: number;
  skipped: number;
  missed: number;
  completionRate: number;
  isComplete: boolean;
}

export interface WeeklyProgress {
  startDate: string;
  endDate: string;
  days: DailyProgress[];
  totalActivities: number;
  completedActivities: number;
  skippedActivities: number;
  missedActivities: number;
  pendingActivities: number;
  weeklyCompletionRate: number;
  completedDays: number;
}

export type ActivitiesByDate = Record<string, ActivityForDailyProgress[]>;

export type ActivityForDailyProgress = ActivityInstance & {
  computedState?: ComputedActivityState;
};

function resolveState(activity: ActivityForDailyProgress): ComputedActivityState {
  if (activity.computedState) return activity.computedState;

  switch (activity.status) {
    case ActivityStatus.Completed:
      return 'completed';
    case ActivityStatus.Skipped:
      return 'skipped';
    case ActivityStatus.Missed:
      return 'missed';
    default:
      return 'pending';
  }
}

export function calculateDailyProgress(
  activities: ActivityForDailyProgress[],
): DailyProgress {
  const active = activities.filter((a) => !a.deletedAt);

  let completed = 0;
  let pending = 0;
  let skipped = 0;
  let missed = 0;

  for (const activity of active) {
    const state = resolveState(activity);
    switch (state) {
      case 'completed':
        completed += 1;
        break;
      case 'skipped':
        skipped += 1;
        break;
      case 'missed':
        missed += 1;
        break;
      case 'pending':
      case 'in_progress':
      default:
        pending += 1;
        break;
    }
  }

  const total = active.length;
  const completionRate = total === 0 ? 0 : completed / total;
  const isComplete = total > 0 && completed + skipped >= total;

  return {
    total,
    completed,
    pending,
    skipped,
    missed,
    completionRate,
    isComplete,
  };
}

/** Friendly message based on completion rate and day status */
export function getDailyProgressMessage(progress: DailyProgress): string {
  if (progress.total === 0) {
    return 'No hay actividades programadas hoy';
  }

  if (progress.isComplete) {
    return 'Día completado';
  }

  const rate = Math.round(progress.completionRate * 100);

  if (rate === 0) {
    return 'Empezamos el día';
  }
  if (rate < 50) {
    return 'Vamos avanzando';
  }
  if (rate < 100) {
    return 'Ya queda menos';
  }

  return 'Día completado';
}

export function getDailyProgressSummary(progress: DailyProgress): string {
  if (progress.total === 0) {
    return 'No hay actividades programadas hoy';
  }

  if (progress.isComplete) {
    return `Has completado ${progress.completed} de ${progress.total} actividades`;
  }

  const remaining = progress.total - progress.completed - progress.skipped;
  if (remaining > 0) {
    return `Has completado ${progress.completed} de ${progress.total} actividades. Quedan ${remaining} actividades`;
  }

  return `Has completado ${progress.completed} de ${progress.total} actividades`;
}

export function getDailyProgressAriaLabel(progress: DailyProgress): string {
  if (progress.total === 0) {
    return 'Progreso del día: no hay actividades programadas';
  }

  const percent = Math.round(progress.completionRate * 100);
  return `Progreso del día: ${progress.completed} de ${progress.total} actividades completadas, ${percent} por ciento`;
}

export function calculateWeeklyProgress(
  activitiesByDate: ActivitiesByDate,
  weekDates: string[],
): WeeklyProgress {
  const days: DailyProgress[] = weekDates.map((date) => ({
    date,
    ...calculateDailyProgress(activitiesByDate[date] ?? []),
  }));

  const totals = days.reduce(
    (acc, day) => ({
      totalActivities: acc.totalActivities + day.total,
      completedActivities: acc.completedActivities + day.completed,
      skippedActivities: acc.skippedActivities + day.skipped,
      missedActivities: acc.missedActivities + day.missed,
      pendingActivities: acc.pendingActivities + day.pending,
    }),
    {
      totalActivities: 0,
      completedActivities: 0,
      skippedActivities: 0,
      missedActivities: 0,
      pendingActivities: 0,
    },
  );

  const weeklyCompletionRate =
    totals.totalActivities === 0
      ? 0
      : totals.completedActivities / totals.totalActivities;

  const completedDays = days.filter((day) => day.total > 0 && day.isComplete).length;

  return {
    startDate: weekDates[0] ?? '',
    endDate: weekDates[weekDates.length - 1] ?? '',
    days,
    ...totals,
    weeklyCompletionRate,
    completedDays,
  };
}

export function getWeeklyProgressMessage(progress: WeeklyProgress): string {
  if (progress.totalActivities === 0) {
    return 'No hay actividades esta semana';
  }

  const percent = Math.round(progress.weeklyCompletionRate * 100);

  if (percent === 100) {
    return 'Semana completada';
  }
  if (percent >= 50) {
    return 'Buen avance esta semana';
  }
  if (percent > 0) {
    return 'Quedan actividades por completar';
  }

  return 'Semana en marcha';
}

export function getWeeklyProgressSummary(progress: WeeklyProgress): string {
  if (progress.totalActivities === 0) {
    return 'No hay actividades esta semana';
  }

  return `Esta semana se han completado ${progress.completedActivities} de ${progress.totalActivities} actividades`;
}

export function getWeeklyProgressDaysSummary(progress: WeeklyProgress): string {
  if (progress.totalActivities === 0) {
    return '';
  }

  return `${progress.completedDays} día${progress.completedDays === 1 ? '' : 's'} completado${progress.completedDays === 1 ? '' : 's'}`;
}

export function getWeeklyProgressAriaLabel(progress: WeeklyProgress): string {
  if (progress.totalActivities === 0) {
    return 'Progreso semanal: no hay actividades programadas';
  }

  const percent = Math.round(progress.weeklyCompletionRate * 100);
  return `Progreso semanal: ${progress.completedActivities} de ${progress.totalActivities} actividades completadas, ${percent} por ciento`;
}

export function getWeeklyDayAriaLabel(
  day: DailyProgress,
  formatDateLabel?: (isoDate: string) => string,
): string {
  if (!day.date) {
    return getDailyProgressAriaLabel(day);
  }

  const dateLabel = formatDateLabel ? formatDateLabel(day.date) : day.date;
  if (day.total === 0) {
    return `${dateLabel}: sin actividades programadas`;
  }

  return `${dateLabel}: ${day.completed} de ${day.total} actividades completadas`;
}

export function showWeeklyEncouragement(progress: WeeklyProgress): boolean {
  return progress.totalActivities > 0 && progress.weeklyCompletionRate >= 0.5;
}
