import { UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Avatar } from '@/domain/types';
import { PROFILE_COLOR_OPTIONS } from '@/features/profiles/constants/profile-colors';
import { cn } from '@/utils/cn';

interface AvatarPickerProps {
  avatars: Avatar[];
  selectedAvatarId: string | null;
  selectedColor: string;
  onSelectAvatar: (avatarId: string) => void;
  onSelectColor: (color: string) => void;
}

export function AvatarPicker({
  avatars,
  selectedAvatarId,
  selectedColor,
  onSelectAvatar,
  onSelectColor,
}: AvatarPickerProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-4 text-sm font-medium text-slate-700">{t('onboarding.stepAvatar.chooseAvatar')}</p>
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-3">
          {avatars.map((avatar) => {
            const selected = selectedAvatarId === avatar.id;
            return (
              <li key={avatar.id}>
                <button
                  type="button"
                  onClick={() => onSelectAvatar(avatar.id)}
                  className={cn(
                    'flex w-full flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 transition-all',
                    selected
                      ? 'ring-2 ring-[var(--color-primary)]'
                      : 'ring-slate-100 hover:ring-slate-200',
                  )}
                  style={selected ? { backgroundColor: `${selectedColor}18` } : undefined}
                >
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl text-white"
                    style={{ backgroundColor: selected ? selectedColor : '#94a3b8' }}
                  >
                    <UserRound className="h-8 w-8" aria-hidden />
                  </div>
                  <span className="text-sm font-medium text-slate-800">{avatar.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <p className="mb-4 text-sm font-medium text-slate-700">{t('onboarding.stepAvatar.chooseColor')}</p>
        <ul className="flex flex-wrap gap-3">
          {PROFILE_COLOR_OPTIONS.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                aria-label={t(option.labelKey)}
                onClick={() => onSelectColor(option.value)}
                className={cn(
                  'h-12 w-12 rounded-full ring-offset-2 transition-transform hover:scale-105',
                  selectedColor === option.value ? 'ring-2 ring-slate-800' : 'ring-1 ring-slate-200',
                )}
                style={{ backgroundColor: option.value }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
