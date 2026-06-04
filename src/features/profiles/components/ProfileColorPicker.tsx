import { useTranslation } from 'react-i18next';
import { PROFILE_COLOR_OPTIONS } from '@/features/profiles/constants/profile-colors';
import { cn } from '@/utils/cn';

interface ProfileColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  titleKey?: string;
}

export function ProfileColorPicker({
  value,
  onChange,
  titleKey = 'onboarding.stepPhotoColor.chooseColor',
}: ProfileColorPickerProps) {
  const { t } = useTranslation();

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-slate-700">{t(titleKey)}</p>
      <ul className="flex flex-wrap gap-4">
        {PROFILE_COLOR_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <li key={option.id}>
              <button
                type="button"
                aria-label={t(option.labelKey)}
                aria-pressed={selected}
                onClick={() => onChange(option.value)}
                className={cn(
                  'h-14 w-14 rounded-full ring-offset-2 transition-transform hover:scale-105',
                  selected ? 'ring-2 ring-slate-800' : 'ring-1 ring-slate-200',
                )}
                style={{ backgroundColor: option.value }}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
