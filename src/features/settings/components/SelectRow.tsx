import { cn } from '@/utils/cn';

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectRowProps<T extends string> {
  label: string;
  description?: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
}

export function SelectRow<T extends string>({
  label,
  description,
  value,
  options,
  onChange,
  disabled,
}: SelectRowProps<T>) {
  return (
    <label className="block py-3">
      <div className="mb-2">
        <p className="font-medium text-slate-900">{label}</p>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900',
          'focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20',
          'disabled:opacity-50',
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
