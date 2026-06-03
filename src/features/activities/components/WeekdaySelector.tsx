import { cn } from '@/utils/cn';
import { WEEKDAY_OPTIONS } from '@/features/activities/types/activity-form.types';

interface WeekdaySelectorProps {
  value: number[];
  onChange: (daysOfWeek: number[]) => void;
  disabled?: boolean;
}

export function WeekdaySelector({ value, onChange, disabled = false }: WeekdaySelectorProps) {
  function toggleDay(day: number): void {
    if (disabled) return;
    const selected = value.includes(day);
    const next = selected
      ? value.filter((d) => d !== day)
      : [...value, day].sort((a, b) => a - b);
    onChange(next);
  }

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-slate-700">Días</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Seleccionar días de la semana">
        {WEEKDAY_OPTIONS.map(({ value: day, label }) => {
          const selected = value.includes(day);
          return (
            <button
              key={day}
              type="button"
              aria-pressed={selected}
              aria-label={`${label}, día ${day}`}
              disabled={disabled}
              onClick={() => toggleDay(day)}
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
                selected
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
                disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
