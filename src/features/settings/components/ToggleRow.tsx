import { cn } from '@/utils/cn';

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ToggleRow({ label, description, checked, onChange, disabled }: ToggleRowProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-900">{label}</p>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-9 w-16 shrink-0 rounded-full transition-colors disabled:opacity-50',
          checked ? 'bg-[var(--color-primary)]' : 'bg-slate-200',
        )}
      >
        <span
          className={cn(
            'absolute top-1 h-7 w-7 rounded-full bg-white shadow transition-transform',
            checked ? 'left-8' : 'left-1',
          )}
        />
      </button>
    </label>
  );
}
