import { cn } from '@/utils/cn';

export type DeleteOccurrenceChoice = 'single' | 'future';

const DELETE_OPTIONS: Array<{
  value: DeleteOccurrenceChoice;
  label: string;
  description: string;
}> = [
  {
    value: 'single',
    label: 'Eliminar solo esta actividad',
    description: 'Las demás repeticiones se mantienen.',
  },
  {
    value: 'future',
    label: 'Eliminar esta y las próximas',
    description: 'Se quitan las actividades de hoy en adelante. Las anteriores no cambian.',
  },
];

interface DeleteOccurrenceSelectorProps {
  value: DeleteOccurrenceChoice;
  onChange: (choice: DeleteOccurrenceChoice) => void;
  hasTemplate: boolean;
}

export function DeleteOccurrenceSelector({
  value,
  onChange,
  hasTemplate,
}: DeleteOccurrenceSelectorProps) {
  if (!hasTemplate) {
    return (
      <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Esta actividad no tiene repeticiones. Solo se eliminará este día.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">¿Qué quieres eliminar?</p>
      <ul className="space-y-2">
        {DELETE_OPTIONS.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'w-full rounded-2xl bg-white p-4 text-left shadow-sm ring-1 transition-all',
                value === option.value
                  ? 'ring-2 ring-red-400'
                  : 'ring-slate-100 hover:ring-slate-200',
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
