import { Check } from 'lucide-react';
import type { RoutineTemplate } from '@/domain/types';
import { cn } from '@/utils/cn';

interface InitialRoutinesSelectorProps {
  templates: RoutineTemplate[];
  selectedIds: string[];
  onToggle: (templateId: string) => void;
}

export function InitialRoutinesSelector({
  templates,
  selectedIds,
  onToggle,
}: InitialRoutinesSelectorProps) {
  if (templates.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-100">
        No hay rutinas disponibles todavía. Podrás añadirlas más tarde.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {templates.map((template) => {
        const selected = selectedIds.includes(template.id);
        return (
          <li key={template.id}>
            <button
              type="button"
              onClick={() => onToggle(template.id)}
              className={cn(
                'flex w-full items-start gap-4 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 transition-all',
                selected
                  ? 'ring-2 ring-[var(--color-primary)]'
                  : 'ring-slate-100 hover:ring-slate-200',
              )}
            >
              <div
                className={cn(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2',
                  selected
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                    : 'border-slate-300 bg-white',
                )}
              >
                {selected && <Check className="h-4 w-4" aria-hidden />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{template.name}</p>
                {template.description && (
                  <p className="mt-1 text-sm text-slate-600">{template.description}</p>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  {template.steps.length} paso{template.steps.length === 1 ? '' : 's'}
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
