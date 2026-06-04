import { Camera, ImagePlus, Trash2 } from 'lucide-react';
import { useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ProfileAvatar } from '@/components/media/ProfileAvatar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp,image/gif';

interface ProfilePhotoPickerProps {
  name: string;
  color: string;
  previewUrl?: string | null;
  onPhotoChange: (file: File | null, previewUrl: string | null) => void;
  className?: string;
  /** Prefijo i18n, p. ej. onboarding.stepPhotoColor o profiles.form */
  translationPrefix?: string;
}

export function ProfilePhotoPicker({
  name,
  color,
  previewUrl,
  onPhotoChange,
  className,
  translationPrefix = 'onboarding.stepPhotoColor',
}: ProfilePhotoPickerProps) {
  const { t } = useTranslation();
  const tk = (key: string) => t(`${translationPrefix}.${key}`);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasPhoto = Boolean(previewUrl);
  const displayName = name.trim() || t('common.profile');

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    onPhotoChange(file, URL.createObjectURL(file));
  }

  function handleRemove(): void {
    onPhotoChange(null, null);
  }

  return (
    <div className={cn('space-y-8', className)}>
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          {hasPhoto ? (
            <img
              src={previewUrl!}
              alt={t(`${translationPrefix}.photoAlt`, { name: displayName })}
              className="h-32 w-32 rounded-full object-cover shadow-lg ring-4 ring-white"
            />
          ) : (
            <ProfileAvatar
              profile={{ name: displayName, color, photoUri: undefined, avatarId: undefined }}
              size="xl"
              className="!rounded-full !h-32 !w-32 !text-5xl"
            />
          )}
        </div>

        <p className="mt-4 text-xl font-bold text-slate-900">{displayName}</p>
        <p className="mt-1 text-sm text-slate-600">{tk('previewHint')}</p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-800">{tk('photoSection')}</p>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {tk('optional')}
          </span>
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          className="sr-only"
          onChange={handleFileChange}
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            className="min-h-12 gap-2"
            onClick={() => inputRef.current?.click()}
          >
            {hasPhoto ? (
              <>
                <Camera className="h-5 w-5" aria-hidden />
                {tk('changePhoto')}
              </>
            ) : (
              <>
                <ImagePlus className="h-5 w-5" aria-hidden />
                {tk('addPhoto')}
              </>
            )}
          </Button>

          {hasPhoto && (
            <Button
              type="button"
              variant="ghost"
              className="min-h-12 gap-2 text-slate-700"
              onClick={handleRemove}
            >
              <Trash2 className="h-5 w-5" aria-hidden />
              {tk('removePhoto')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
