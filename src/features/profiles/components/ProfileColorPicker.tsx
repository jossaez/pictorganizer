import { PROFILE_COLOR_OPTIONS } from '@/features/profiles/constants/profile-colors';
import { cn } from '@/utils/cn';

interface ProfileColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ProfileColorPicker({ value, onChange }: ProfileColorPickerProps) {
  return (
    <div>
      <p className="mb-4 text-sm font-medium text-slate-700">Color principal</p>
      <ul className="flex flex-wrap gap-3">
        {PROFILE_COLOR_OPTIONS.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              aria-label={option.label}
              aria-pressed={value === option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                'h-12 w-12 rounded-full ring-offset-2 transition-transform hover:scale-105',
                value === option.value ? 'ring-2 ring-slate-800' : 'ring-1 ring-slate-200',
              )}
              style={{ backgroundColor: option.value }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
