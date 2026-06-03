import { useState } from 'react';
import type { Routine } from '@/domain/types';
import { Button } from '@/components/ui/Button';
import { ActivityVisualSelector } from '@/features/activities/components/ActivityVisualSelector';
import { CategorySelector } from '@/features/activities/components/CategorySelector';
import { RecurrenceSelector } from '@/features/activities/components/RecurrenceSelector';
import { useActivityCatalog } from '@/features/activities/hooks/useActivityCatalog';
import {
  DEFAULT_ACTIVITY_FORM_DATA,
  VISIBILITY_OPTIONS,
  type ActivityFormData,
} from '@/features/activities/types/activity-form.types';
import { validateActivityForm, validateActivityFormFields, type ActivityFormFieldErrors } from '@/features/activities/utils/activity-form.utils';
import { cn } from '@/utils/cn';

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-sm font-medium text-red-700" role="alert">
      {message}
    </p>
  );
}

interface ActivityFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<ActivityFormData>;
  routines?: Routine[];
  showRecurrence?: boolean;
  submitLabel?: string;
  isSubmitting?: boolean;
  onSubmit: (data: ActivityFormData) => Promise<void>;
  onCancel: () => void;
}

function buildInitial(initialData?: Partial<ActivityFormData>): ActivityFormData {
  return { ...DEFAULT_ACTIVITY_FORM_DATA, ...initialData };
}

export function ActivityForm({
  mode,
  initialData,
  routines = [],
  showRecurrence = true,
  submitLabel,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: ActivityFormProps) {
  const { categories, pictograms, isLoading } = useActivityCatalog();
  const [form, setForm] = useState<ActivityFormData>(() => buildInitial(initialData));
  const [fieldErrors, setFieldErrors] = useState<ActivityFormFieldErrors>({});

  function updateField<K extends keyof ActivityFormData>(key: K, value: ActivityFormData[K]): void {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key as keyof ActivityFormFieldErrors];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const errors = validateActivityFormFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    await onSubmit(form);
  }

  const label = submitLabel ?? (mode === 'create' ? 'Añadir actividad' : 'Guardar');

  if (isLoading) {
    return <p className="text-slate-500">Cargando formulario…</p>;
  }

  return (
    <form className="space-y-10" onSubmit={(e) => void handleSubmit(e)} noValidate>
      {Object.keys(fieldErrors).length > 0 && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          Revisa los campos marcados antes de guardar.
        </p>
      )}

      <section>
        <h2 className="text-lg font-bold text-slate-900">Qué actividad es</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="activity-title" className="text-sm font-medium text-slate-700">
              Nombre
            </label>
            <input
              id="activity-title"
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Paseo en el parque"
              maxLength={80}
              autoFocus={mode === 'create'}
              aria-invalid={Boolean(fieldErrors.title)}
              aria-describedby={fieldErrors.title ? 'activity-title-error' : undefined}
              className={cn(
                'mt-2 w-full rounded-2xl border bg-white px-5 py-4 text-lg',
                fieldErrors.title ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200',
                'focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20',
              )}
            />
            <FieldError id="activity-title-error" message={fieldErrors.title} />
          </div>
          <div>
            <label htmlFor="activity-description" className="text-sm font-medium text-slate-700">
              Descripción <span className="font-normal text-slate-500">(opcional)</span>
            </label>
            <textarea
              id="activity-description"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={2}
              maxLength={300}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-base"
            />
          </div>
          <div>
            <p id="activity-category-label" className="text-sm font-medium text-slate-700">
              Categoría
            </p>
            <div className="mt-3" aria-labelledby="activity-category-label">
              <CategorySelector
                categories={categories}
                value={form.categoryId}
                onChange={(categoryId) => updateField('categoryId', categoryId)}
              />
            </div>
            <FieldError id="activity-category-error" message={fieldErrors.categoryId} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-900">Cuándo ocurre</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="activity-start-time" className="text-sm font-medium text-slate-700">
              Hora de inicio
            </label>
            <input
              id="activity-start-time"
              type="time"
              value={form.startTime}
              onChange={(e) => updateField('startTime', e.target.value)}
              aria-invalid={Boolean(fieldErrors.startTime)}
              aria-describedby={fieldErrors.startTime ? 'activity-start-time-error' : undefined}
              className={cn(
                'mt-2 w-full rounded-2xl border bg-white px-4 py-3',
                fieldErrors.startTime ? 'border-red-400' : 'border-slate-200',
              )}
            />
            <FieldError id="activity-start-time-error" message={fieldErrors.startTime} />
          </div>
          <div>
            <label htmlFor="activity-end-time" className="text-sm font-medium text-slate-700">
              Hora de fin <span className="font-normal text-slate-500">(opcional)</span>
            </label>
            <input
              id="activity-end-time"
              type="time"
              value={form.endTime}
              onChange={(e) => updateField('endTime', e.target.value)}
              aria-invalid={Boolean(fieldErrors.endTime)}
              aria-describedby={fieldErrors.endTime ? 'activity-end-time-error' : undefined}
              className={cn(
                'mt-2 w-full rounded-2xl border bg-white px-4 py-3',
                fieldErrors.endTime ? 'border-red-400' : 'border-slate-200',
              )}
            />
            <FieldError id="activity-end-time-error" message={fieldErrors.endTime} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-900">Cómo se ve</h2>
        <div className="mt-4">
          <ActivityVisualSelector
            pictograms={pictograms}
            categories={categories}
            visual={form.visual}
            onChange={(visual) => updateField('visual', visual)}
          />
          <FieldError id="activity-visual-error" message={fieldErrors.visual} />
        </div>
        <div className="mt-6">
          <p className="text-sm font-medium text-slate-700">Visibilidad</p>
          <ul className="mt-3 space-y-2">
            {VISIBILITY_OPTIONS.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => updateField('visibility', option.value)}
                  className={cn(
                    'w-full rounded-xl px-4 py-3 text-left text-sm font-medium ring-1',
                    form.visibility === option.value
                      ? 'bg-blue-50 ring-[var(--color-primary)] text-blue-900'
                      : 'bg-white ring-slate-200 text-slate-700',
                  )}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {showRecurrence && (
        <section>
          <h2 className="text-lg font-bold text-slate-900">Repetición</h2>
          <div className="mt-4">
            <RecurrenceSelector
              value={{
                recurrenceType: form.recurrenceType,
                daysOfWeek: form.daysOfWeek,
                startDate: form.startDate,
                endDate: form.endDate,
              }}
              onChange={(patch) => {
                setForm((prev) => ({ ...prev, ...patch }));
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  if (patch.daysOfWeek) delete next.daysOfWeek;
                  if (patch.startDate) delete next.startDate;
                  if (patch.endDate) delete next.endDate;
                  return next;
                });
              }}
            />
            <FieldError id="activity-days-error" message={fieldErrors.daysOfWeek} />
            <FieldError id="activity-start-date-error" message={fieldErrors.startDate} />
            <FieldError id="activity-end-date-error" message={fieldErrors.endDate} />
          </div>
        </section>
      )}

      {routines.length > 0 && mode === 'create' && (
        <section>
          <label htmlFor="activity-routine" className="text-sm font-medium text-slate-700">
            Rutina asociada <span className="font-normal text-slate-500">(opcional)</span>
          </label>
          <select
            id="activity-routine"
            value={form.routineId}
            onChange={(e) => updateField('routineId', e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
          >
            <option value="">Ninguna</option>
            {routines.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </section>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          className="a11y-focus-ring flex-1"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" className="a11y-focus-ring a11y-btn-touch flex-1" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : label}
        </Button>
      </div>
    </form>
  );
}
