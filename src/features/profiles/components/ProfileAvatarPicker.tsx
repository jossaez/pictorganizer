import { UserRound } from 'lucide-react';
import type { Avatar } from '@/domain/types';
import { cn } from '@/utils/cn';

interface ProfileAvatarPickerProps {
  avatars: Avatar[];
  selectedAvatarId: string | null;
  accentColor: string;
  onSelectAvatar: (avatarId: string) => void;
}

export function ProfileAvatarPicker({
  avatars,
  selectedAvatarId,
  accentColor,
  onSelectAvatar,
}: ProfileAvatarPickerProps) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium text-slate-700">Avatar</p>
      <p className="mb-4 text-xs text-slate-500">Opcional, pero recomendado para identificar el perfil.</p>
      <ul className="grid grid-cols-3 gap-3">
        {avatars.map((avatar) => {
          const selected = selectedAvatarId === avatar.id;
          return (
            <li key={avatar.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelectAvatar(avatar.id)}
                className={cn(
                  'flex w-full flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 transition-all',
                  selected
                    ? 'ring-2 ring-[var(--color-primary)]'
                    : 'ring-slate-100 hover:ring-slate-200',
                )}
                style={selected ? { backgroundColor: `${accentColor}18` } : undefined}
              >
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-white"
                  style={{ backgroundColor: selected ? accentColor : '#94a3b8' }}
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
  );
}
