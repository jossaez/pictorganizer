import { DEFAULT_ACTIVITY_DURATION_MINUTES } from '../../../domain/services/activity-state.service';

export type VisualTimerStatus = 'not_started' | 'running' | 'finished' | 'invalid';

export interface VisualTimerInput {
  startTimeMinutes: number;
  endTimeMinutes?: number | null;
  currentTimeMinutes: number;
  defaultDurationMinutes?: number;
}

export interface VisualTimerResult {
  totalMinutes: number;
  elapsedMinutes: number;
  remainingMinutes: number;
  progress: number;
  status: VisualTimerStatus;
  hasDefinedEnd: boolean;
  minutesUntilStart: number;
  message: string;
  ariaLabel: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function resolveEndTimeMinutes(
  startTimeMinutes: number,
  endTimeMinutes: number | null | undefined,
  defaultDurationMinutes: number = DEFAULT_ACTIVITY_DURATION_MINUTES,
): number {
  if (endTimeMinutes != null && endTimeMinutes > startTimeMinutes) {
    return endTimeMinutes;
  }
  return startTimeMinutes + defaultDurationMinutes;
}

export function computeVisualTimer(input: VisualTimerInput): VisualTimerResult {
  const { startTimeMinutes, currentTimeMinutes, defaultDurationMinutes = DEFAULT_ACTIVITY_DURATION_MINUTES } =
    input;

  const hasDefinedEnd = input.endTimeMinutes != null && input.endTimeMinutes > startTimeMinutes;
  const endTimeMinutes = resolveEndTimeMinutes(
    startTimeMinutes,
    input.endTimeMinutes,
    defaultDurationMinutes,
  );

  if (
    !Number.isFinite(startTimeMinutes) ||
    !Number.isFinite(currentTimeMinutes) ||
    startTimeMinutes < 0 ||
    currentTimeMinutes < 0
  ) {
    return {
      totalMinutes: 0,
      elapsedMinutes: 0,
      remainingMinutes: 0,
      progress: 0,
      status: 'invalid',
      hasDefinedEnd,
      minutesUntilStart: 0,
      message: 'Sin tiempo definido',
      ariaLabel: 'Temporizador no disponible',
    };
  }

  const totalMinutes = endTimeMinutes - startTimeMinutes;

  if (totalMinutes <= 0) {
    return {
      totalMinutes: 0,
      elapsedMinutes: 0,
      remainingMinutes: 0,
      progress: 0,
      status: 'invalid',
      hasDefinedEnd,
      minutesUntilStart: 0,
      message: 'Sin tiempo definido',
      ariaLabel: 'Temporizador no disponible',
    };
  }

  const minutesUntilStart = Math.max(0, startTimeMinutes - currentTimeMinutes);

  if (currentTimeMinutes < startTimeMinutes) {
    return {
      totalMinutes,
      elapsedMinutes: 0,
      remainingMinutes: totalMinutes,
      progress: 0,
      status: 'not_started',
      hasDefinedEnd,
      minutesUntilStart,
      message: formatMinutesMessage('Empieza en', minutesUntilStart),
      ariaLabel: `Empieza en ${minutesUntilStart} minutos`,
    };
  }

  if (currentTimeMinutes >= endTimeMinutes) {
    return {
      totalMinutes,
      elapsedMinutes: totalMinutes,
      remainingMinutes: 0,
      progress: 100,
      status: 'finished',
      hasDefinedEnd,
      minutesUntilStart: 0,
      message: 'Actividad finalizada',
      ariaLabel: 'Actividad finalizada',
    };
  }

  const elapsedMinutes = clamp(currentTimeMinutes - startTimeMinutes, 0, totalMinutes);
  const remainingMinutes = clamp(endTimeMinutes - currentTimeMinutes, 0, totalMinutes);
  const progress = clamp((elapsedMinutes / totalMinutes) * 100, 0, 100);

  return {
    totalMinutes,
    elapsedMinutes,
    remainingMinutes,
    progress,
    status: 'running',
    hasDefinedEnd,
    minutesUntilStart: 0,
    message: formatMinutesMessage('Quedan', remainingMinutes),
    ariaLabel: `Quedan ${remainingMinutes} minutos`,
  };
}

function formatMinutesMessage(prefix: string, minutes: number): string {
  const value = Math.max(0, Math.round(minutes));
  return `${prefix} ${value} min`;
}
