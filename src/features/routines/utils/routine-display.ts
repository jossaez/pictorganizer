/** Format minutes from midnight as HH:MM */
export function formatTimeMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/** Sum step durations for approximate total length */
export function estimateRoutineDurationMinutes(
  steps: Array<{ durationMinutes?: number }>,
): number {
  return steps.reduce((sum, step) => sum + (step.durationMinutes ?? 0), 0);
}

export function formatDurationMinutes(totalMinutes: number): string {
  if (totalMinutes <= 0) return '—';
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}
