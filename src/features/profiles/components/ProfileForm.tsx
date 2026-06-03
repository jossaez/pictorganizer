import { useState } from 'react';
import type { Profile, ProfileSettings } from '@/domain/types';
import { Button } from '@/components/ui/Button';
import { DetailLevelSelector } from '@/features/onboarding/components/DetailLevelSelector';
import { ProfileAvatarPicker } from '@/features/profiles/components/ProfileAvatarPicker';
import { ProfileColorPicker } from '@/features/profiles/components/ProfileColorPicker';
import { useProfileAvatars } from '@/features/profiles/hooks/useProfileAvatars';
import {
  DEFAULT_PROFILE_FORM_DATA,
  type ProfileFormData,
} from '@/features/profiles/types/profile-form.types';
import { cn } from '@/utils/cn';

interface ProfileFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<ProfileFormData>;
  initialProfile?: Profile;
  initialSettings?: ProfileSettings;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  onCancel: () => void;
}

function buildInitialForm(
  initialData?: Partial<ProfileFormData>,
  profile?: Profile,
  settings?: ProfileSettings,
): ProfileFormData {
  if (initialData) {
    return { ...DEFAULT_PROFILE_FORM_DATA, ...initialData };
  }

  if (profile && settings) {
    return {
      name: profile.name,
      avatarId: profile.avatarId ?? null,
      color: profile.color,
      birthDate: profile.birthDate ?? '',
      childModeDetailLevel: settings.childModeDetailLevel,
      showTimer: settings.showTimer,
      showAnticipation: settings.showAnticipation,
    };
  }

  return DEFAULT_PROFILE_FORM_DATA;
}

function validateForm(data: ProfileFormData): string | null {
  const name = data.name.trim();
  if (!name) return 'Introduce un nombre';
  if (name.length < 2) return 'El nombre debe tener al menos 2 caracteres';
  if (!data.color) return 'Selecciona un color';
  return null;
}

export function ProfileForm({
  mode,
  initialData,
  initialProfile,
  initialSettings,
  isSubmitting = false,
  submitLabel,
  onSubmit,
  onCancel,
}: ProfileFormProps) {
  const { avatars, isLoading: avatarsLoading } = useProfileAvatars();
  const [form, setForm] = useState<ProfileFormData>(() =>
    buildInitialForm(initialData, initialProfile, initialSettings),
  );
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]): void {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  async function handleSubmit(): Promise<void> {
    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    await onSubmit({ ...form, name: form.name.trim() });
  }

  const label = submitLabel ?? (mode === 'create' ? 'Crear perfil' : 'Guardar cambios');

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
    >
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="profile-name" className="text-sm font-medium text-slate-700">
          Nombre
        </label>
        <input
          id="profile-name"
          type="text"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Lucas"
          maxLength={50}
          autoFocus={mode === 'create'}
          className={cn(
            'mt-2 w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-lg',
            'focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20',
          )}
        />
      </div>

      <ProfileColorPicker value={form.color} onChange={(color) => updateField('color', color)} />

      {avatarsLoading ? (
        <p className="text-slate-500">Cargando avatares…</p>
      ) : (
        <ProfileAvatarPicker
          avatars={avatars}
          selectedAvatarId={form.avatarId}
          accentColor={form.color}
          onSelectAvatar={(avatarId) => updateField('avatarId', avatarId)}
        />
      )}

      <div>
        <label htmlFor="profile-birthdate" className="text-sm font-medium text-slate-700">
          Fecha de nacimiento <span className="font-normal text-slate-500">(opcional)</span>
        </label>
        <input
          id="profile-birthdate"
          type="date"
          value={form.birthDate}
          onChange={(e) => updateField('birthDate', e.target.value)}
          className={cn(
            'mt-2 w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base',
            'focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20',
          )}
        />
      </div>

      <div>
        <p className="mb-4 text-sm font-medium text-slate-700">Nivel de detalle visual</p>
        <DetailLevelSelector
          value={form.childModeDetailLevel}
          onChange={(childModeDetailLevel) => updateField('childModeDetailLevel', childModeDetailLevel)}
        />
      </div>

      <div className="space-y-3">
        <ToggleRow
          label="Mostrar temporizador"
          description="Muestra el tiempo restante en las actividades."
          checked={form.showTimer}
          onChange={(checked) => updateField('showTimer', checked)}
        />
        <ToggleRow
          label="Mostrar anticipación"
          description="Avisa antes de que empiece la siguiente actividad."
          checked={form.showAnticipation}
          onChange={(checked) => updateField('showAnticipation', checked)}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : label}
        </Button>
      </div>
    </form>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex w-full items-center justify-between gap-4 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-100',
        checked && 'ring-[var(--color-primary)]/30',
      )}
    >
      <div>
        <p className="font-medium text-slate-900">{label}</p>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>
      <span
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors',
          checked ? 'bg-[var(--color-primary)]' : 'bg-slate-200',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          )}
        />
      </span>
    </button>
  );
}
