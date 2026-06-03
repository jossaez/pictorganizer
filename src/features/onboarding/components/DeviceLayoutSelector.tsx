import { DeviceLayout } from '@/domain/enums';
import { Monitor, Smartphone, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DeviceLayoutSelectorProps {
  value: DeviceLayout | null;
  onChange: (value: DeviceLayout) => void;
}

const OPTIONS = [
  {
    value: DeviceLayout.Phone,
    label: 'Móvil',
    description: 'Pantalla vertical, tarjetas grandes',
    icon: Smartphone,
  },
  {
    value: DeviceLayout.Tablet,
    label: 'Tablet',
    description: 'Más espacio y vista amplia',
    icon: Monitor,
  },
  {
    value: DeviceLayout.Auto,
    label: 'Automático',
    description: 'Se adapta al dispositivo',
    icon: Sparkles,
  },
] as const;

export function DeviceLayoutSelector({ value, onChange }: DeviceLayoutSelectorProps) {
  return (
    <ul className="space-y-3">
      {OPTIONS.map(({ value: optionValue, label, description, icon: Icon }) => {
        const selected = value === optionValue;
        return (
          <li key={optionValue}>
            <button
              type="button"
              onClick={() => onChange(optionValue)}
              className={cn(
                'flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 transition-all',
                selected
                  ? 'ring-2 ring-[var(--color-primary)]'
                  : 'ring-slate-100 hover:ring-slate-200',
              )}
            >
              <div
                className={cn(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                  selected ? 'bg-blue-100 text-[var(--color-primary)]' : 'bg-slate-100 text-slate-600',
                )}
              >
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{label}</p>
                <p className="text-sm text-slate-500">{description}</p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
