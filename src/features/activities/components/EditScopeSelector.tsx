import type { EditScopeChoice } from '@/features/activities/utils/activity-form.utils';
import { EDIT_SCOPE_OPTIONS } from '@/features/activities/utils/activity-form.utils';
import { cn } from '@/utils/cn';

interface EditScopeSelectorProps {
  value: EditScopeChoice;
  onChange: (scope: EditScopeChoice) => void;
  hasTemplate: boolean;
}

export function EditScopeSelector({ value, onChange, hasTemplate }: EditScopeSelectorProps) {
  if (!hasTemplate) {
    return (
      <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Esta actividad no tiene repeticiones. Los cambios solo afectarán a este día.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">¿Qué quieres modificar?</p>
      <ul className="space-y-2">
        {EDIT_SCOPE_OPTIONS.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              disabled={option.disabled}
              onClick={() => !option.disabled && onChange(option.value)}
              className={cn(
                'w-full rounded-2xl bg-white p-4 text-left shadow-sm ring-1 transition-all',
                value === option.value
                  ? 'ring-2 ring-[var(--color-primary)]'
                  : 'ring-slate-100 hover:ring-slate-200',
                option.disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              <p className="font-semibold text-slate-900">{option.label}</p>
              <p className="mt-0.5 text-sm text-slate-500">{option.description}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
