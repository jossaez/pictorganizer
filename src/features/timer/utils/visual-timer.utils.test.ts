import { describe, expect, it } from 'vitest';
import { computeVisualTimer } from './visual-timer.utils';

describe('computeVisualTimer', () => {
  it('calcula progreso correctamente en actividad en curso', () => {
    const result = computeVisualTimer({
      startTimeMinutes: 480,
      endTimeMinutes: 540,
      currentTimeMinutes: 510,
    });

    expect(result.status).toBe('running');
    expect(result.totalMinutes).toBe(60);
    expect(result.elapsedMinutes).toBe(30);
    expect(result.remainingMinutes).toBe(30);
    expect(result.progress).toBe(50);
    expect(result.message).toBe('Quedan 30 min');
  });

  it('devuelve not_started cuando la actividad no ha empezado', () => {
    const result = computeVisualTimer({
      startTimeMinutes: 600,
      endTimeMinutes: 660,
      currentTimeMinutes: 570,
    });

    expect(result.status).toBe('not_started');
    expect(result.progress).toBe(0);
    expect(result.minutesUntilStart).toBe(30);
    expect(result.message).toBe('Empieza en 30 min');
  });

  it('devuelve running durante la actividad', () => {
    const result = computeVisualTimer({
      startTimeMinutes: 480,
      endTimeMinutes: 510,
      currentTimeMinutes: 490,
    });

    expect(result.status).toBe('running');
    expect(result.remainingMinutes).toBe(20);
  });

  it('devuelve finished cuando la actividad terminó', () => {
    const result = computeVisualTimer({
      startTimeMinutes: 480,
      endTimeMinutes: 510,
      currentTimeMinutes: 520,
    });

    expect(result.status).toBe('finished');
    expect(result.progress).toBe(100);
    expect(result.remainingMinutes).toBe(0);
    expect(result.message).toBe('Actividad finalizada');
  });

  it('usa 30 minutos por defecto sin endTimeMinutes', () => {
    const result = computeVisualTimer({
      startTimeMinutes: 480,
      endTimeMinutes: null,
      currentTimeMinutes: 495,
    });

    expect(result.totalMinutes).toBe(30);
    expect(result.hasDefinedEnd).toBe(false);
    expect(result.status).toBe('running');
    expect(result.elapsedMinutes).toBe(15);
    expect(result.remainingMinutes).toBe(15);
  });

  it('usa duración por defecto cuando endTime es igual a startTime', () => {
    const result = computeVisualTimer({
      startTimeMinutes: 480,
      endTimeMinutes: 480,
      currentTimeMinutes: 485,
    });

    expect(result.status).toBe('running');
    expect(result.totalMinutes).toBe(30);
  });

  it('devuelve invalid con datos no válidos', () => {
    const result = computeVisualTimer({
      startTimeMinutes: Number.NaN,
      endTimeMinutes: 540,
      currentTimeMinutes: 485,
    });

    expect(result.status).toBe('invalid');
    expect(result.message).toBe('Sin tiempo definido');
  });

  it('maneja currentTime fuera de rango', () => {
    const before = computeVisualTimer({
      startTimeMinutes: 480,
      endTimeMinutes: 540,
      currentTimeMinutes: 400,
    });
    expect(before.status).toBe('not_started');

    const after = computeVisualTimer({
      startTimeMinutes: 480,
      endTimeMinutes: 540,
      currentTimeMinutes: 600,
    });
    expect(after.status).toBe('finished');
  });
});
