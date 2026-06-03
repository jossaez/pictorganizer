import { ChildModeDetailLevel } from '@/domain/enums';
import { cn } from '@/utils/cn';

interface DetailLevelSelectorProps {
  value: ChildModeDetailLevel | null;
  onChange: (value: ChildModeDetailLevel) => void;
}

const OPTIONS = [
  {
    value: ChildModeDetailLevel.Minimal,
    label: 'Simple',
    description: 'Pictograma + título',
  },
  {
    value: ChildModeDetailLevel.Standard,
    label: 'Medio',
    description: 'Pictograma + título + hora',
  },
  {
    value: ChildModeDetailLevel.Detailed,
    label: 'Completo',
    description: 'Pictograma + título + hora + detalle desplegable',
  },
] as const;

export function DetailLevelSelector({ value, onChange }: DetailLevelSelectorProps) {
  return (
    <ul className="space-y-3">
      {OPTIONS.map(({ value: optionValue, label, description }) => {
        const selected = value === optionValue;
        return (
          <li key={optionValue}>
            <button
              type="button"
              onClick={() => onChange(optionValue)}
              className={cn(
                'w-full rounded-2xl bg-white p-5 text-left shadow-sm ring-1 transition-all',
                selected
                  ? 'ring-2 ring-[var(--color-primary)]'
                  : 'ring-slate-100 hover:ring-slate-200',
              )}
            >
              <p className="text-lg font-bold text-slate-900">{label}</p>
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
