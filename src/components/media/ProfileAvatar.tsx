import type { Avatar, Profile } from '@/domain/types';
import { getAvatarEmoji } from '@/domain/visual/pictogram-registry';
import { getPhotoUri } from '@/infrastructure/filesystem/photo.storage';
import { cn } from '@/utils/cn';
import { useTranslation } from 'react-i18next';

export type ProfileAvatarSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<ProfileAvatarSize, string> = {
  sm: 'h-10 w-10 text-base',
  md: 'h-14 w-14 text-xl',
  lg: 'h-20 w-20 text-3xl',
  xl: 'h-28 w-28 text-5xl',
};

interface ProfileAvatarProps {
  profile: Pick<Profile, 'name' | 'photoUri' | 'avatarId' | 'color'>;
  size?: ProfileAvatarSize;
  className?: string;
  avatars?: Avatar[];
  /** Vista previa local (p. ej. object URL durante edición) */
  photoPreviewSrc?: string;
}

function getInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed.charAt(0).toUpperCase() || '?';
}

export function ProfileAvatar({
  profile,
  size = 'md',
  className,
  avatars = [],
  photoPreviewSrc,
}: ProfileAvatarProps) {
  const { t } = useTranslation();
  const sizeClass = SIZE_CLASSES[size];
  const photoSrc =
    photoPreviewSrc ?? (profile.photoUri ? getPhotoUri(profile.photoUri) : undefined);
  const avatar = avatars.find((a) => a.id === profile.avatarId);
  const avatarEmoji = profile.avatarId ? getAvatarEmoji(profile.avatarId) : null;
  const photoAlt = t('profiles.photoAlt', { name: profile.name });

  if (photoSrc) {
    return (
      <img
        src={photoSrc}
        alt={photoAlt}
        className={cn('shrink-0 rounded-full object-cover shadow-sm', sizeClass, className)}
      />
    );
  }

  if (avatarEmoji) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full shadow-sm',
          sizeClass,
          className,
        )}
        style={{ backgroundColor: profile.color }}
        role="img"
        aria-label={t('profiles.avatarAria', {
          name: profile.name,
          label: avatar ? `: ${avatar.label}` : '',
        })}
      >
        <span aria-hidden>{avatarEmoji}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm',
        sizeClass,
        className,
      )}
      style={{ backgroundColor: profile.color }}
      aria-label={t('profiles.initialAria', { name: profile.name })}
    >
      {getInitial(profile.name)}
    </div>
  );
}
