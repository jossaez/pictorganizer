import type { ActivityFormData, RecurrenceFormType } from '@/features/activities/types/activity-form.types';
import { RECURRENCE_FORM_OPTIONS } from '@/features/activities/types/activity-form.types';
import { WeekdaySelector } from '@/features/activities/components/WeekdaySelector';
import { cn } from '@/utils/cn';

interface RecurrenceSelectorProps {
  value: Pick<
    ActivityFormData,
    'recurrenceType' | 'daysOfWeek' | 'startDate' | 'endDate'
  >;
  onChange: (patch: Partial<ActivityFormData>) => void;
  showDateFields?: boolean;
}

function showsDayPicker(type: RecurrenceFormType): boolean {
  return type === 'weekly' || type === 'custom';
}

export function RecurrenceSelector({
  value,
  onChange,
  showDateFields = true,
}: RecurrenceSelectorProps) {
  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {RECURRENCE_FORM_OPTIONS.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              onClick={() =>
                onChange({
                  recurrenceType: option.value,
                  daysOfWeek: showsDayPicker(option.value) ? value.daysOfWeek : [],
                })
              }
              className={cn(
                'w-full rounded-2xl bg-white p-4 text-left shadow-sm ring-1 transition-all',
                value.recurrenceType === option.value
                  ? 'ring-2 ring-[var(--color-primary)]'
                  : 'ring-slate-100 hover:ring-slate-200',
              )}
            >
              <p className="font-semibold text-slate-900">{option.label}</p>
              <p className="mt-0.5 text-sm text-slate-500">{option.description}</p>
            </button>
          </li>
        ))}
      </ul>

      {showsDayPicker(value.recurrenceType) && (
        <WeekdaySelector
          value={value.daysOfWeek}
          onChange={(daysOfWeek) => onChange({ daysOfWeek })}
        />
      )}

      {showDateFields && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="activity-start-date" className="text-sm font-medium text-slate-700">
              Fecha de inicio
            </label>
            <input
              id="activity-start-date"
              type="date"
              value={value.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            />
          </div>
          <div>
            <label htmlFor="activity-end-date" className="text-sm font-medium text-slate-700">
              Fecha de fin <span className="font-normal text-slate-500">(opcional)</span>
            </label>
            <input
              id="activity-end-date"
              type="date"
              value={value.endDate}
              min={value.startDate || undefined}
              onChange={(e) => onChange({ endDate: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            />
            {!value.endDate && value.recurrenceType !== 'once' && (
              <p className="mt-1.5 text-xs text-slate-500">
                Sin fecha de fin, se planificarán los próximos 90 días.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
