import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ACTIVITY_FORM_DATA,
  type ActivityFormData,
} from '@/features/activities/types/activity-form.types';
import { validateActivityFormFields } from '@/features/activities/utils/activity-form.utils';

function form(overrides: Partial<ActivityFormData> = {}): ActivityFormData {
  return {
    ...DEFAULT_ACTIVITY_FORM_DATA,
    title: 'Desayuno',
    categoryId: 'cat-1',
    startDate: '2026-06-03',
    ...overrides,
  };
}

describe('validateActivityFormFields', () => {
  it('returns no errors for a valid form', () => {
    expect(validateActivityFormFields(form())).toEqual({});
  });

  it('requires a title', () => {
    expect(validateActivityFormFields(form({ title: '' })).title).toBe('Escribe un nombre');
    expect(validateActivityFormFields(form({ title: 'A' })).title).toBe(
      'El nombre debe tener al menos 2 letras',
    );
  });

  it('requires category and valid start time', () => {
    const errors = validateActivityFormFields(
      form({ categoryId: '', startTime: 'invalid' }),
    );
    expect(errors.categoryId).toBe('Elige una categoría');
    expect(errors.startTime).toBe('Escribe una hora válida (HH:MM)');
  });

  it('requires end time after start time', () => {
    const errors = validateActivityFormFields(form({ endTime: '08:00' }));
    expect(errors.endTime).toBe('La hora de fin debe ser posterior');
  });

  it('requires at least one weekday for weekly recurrence', () => {
    const errors = validateActivityFormFields(
      form({ recurrenceType: 'weekly', daysOfWeek: [] }),
    );
    expect(errors.daysOfWeek).toBe('Elige al menos un día');
  });

  it('validates start date', () => {
    expect(validateActivityFormFields(form({ startDate: '' })).startDate).toBe(
      'Elige una fecha de inicio',
    );
  });
});
