import { useState } from 'react';
import { Camera } from 'lucide-react';
import type { Category, Pictogram } from '@/domain/types';
import type { ActivityVisual } from '@/domain/types/value-objects';
import { QUICK_EMOJI_OPTIONS } from '@/domain/visual/pictogram-registry';
import { PictogramPicker } from '@/components/media/PictogramPicker';
import { cn } from '@/utils/cn';

export type VisualSelectorMode = 'pictogram' | 'emoji' | 'photo';

interface ActivityVisualSelectorProps {
  pictograms: Pictogram[];
  categories: Category[];
  visual: ActivityVisual;
  onChange: (visual: ActivityVisual) => void;
  disabled?: boolean;
}

function getMode(visual: ActivityVisual): VisualSelectorMode {
  if (visual.type === 'emoji') return 'emoji';
  if (visual.type === 'photo') return 'photo';
  return 'pictogram';
}

function getPictogramId(visual: ActivityVisual): string {
  if (visual.type === 'pictogram') return visual.pictogramId;
  return visual.fallbackPictogramId ?? 'wake-up';
}

function getEmoji(visual: ActivityVisual): string {
  return visual.type === 'emoji' ? visual.emoji : '⭐';
}

const MODE_OPTIONS: Array<{ value: VisualSelectorMode; label: string }> = [
  { value: 'pictogram', label: 'Pictograma' },
  { value: 'emoji', label: 'Emoji' },
  { value: 'photo', label: 'Foto' },
];

export function ActivityVisualSelector({
  pictograms,
  categories,
  visual,
  onChange,
  disabled = false,
}: ActivityVisualSelectorProps) {
  const [mode, setMode] = useState<VisualSelectorMode>(() => getMode(visual));

  function selectPictogram(pictogramId: string): void {
    onChange({ type: 'pictogram', pictogramId, fallbackPictogramId: pictogramId });
  }

  function selectEmoji(emoji: string): void {
    onChange({
      type: 'emoji',
      emoji,
      fallbackPictogramId: getPictogramId(visual),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Tipo de imagen">
        {MODE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={mode === option.value}
            disabled={disabled || option.value === 'photo'}
            onClick={() => option.value !== 'photo' && setMode(option.value)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-semibold ring-1 transition-colors',
              mode === option.value
                ? 'bg-[var(--color-primary)] text-white ring-[var(--color-primary)]'
                : 'bg-white text-slate-700 ring-slate-200',
              option.value === 'photo' && 'cursor-not-allowed opacity-50',
            )}
          >
            {option.label}
            {option.value === 'photo' && (
              <span className="ml-1 text-xs font-normal opacity-80">(próximamente)</span>
            )}
          </button>
        ))}
      </div>

      {mode === 'pictogram' && (
        <PictogramPicker
          pictograms={pictograms}
          categories={categories}
          value={getPictogramId(visual)}
          onChange={selectPictogram}
          disabled={disabled}
        />
      )}

      {mode === 'emoji' && (
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6" aria-label="Emojis">
          {QUICK_EMOJI_OPTIONS.map((emoji) => {
            const selected = getEmoji(visual) === emoji && visual.type === 'emoji';
            return (
              <li key={emoji}>
                <button
                  type="button"
                  aria-label={`Emoji ${emoji}`}
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() => selectEmoji(emoji)}
                  className={cn(
                    'flex h-14 w-full items-center justify-center rounded-xl bg-white text-2xl ring-1',
                    selected ? 'ring-2 ring-[var(--color-primary)]' : 'ring-slate-100',
                  )}
                >
                  {emoji}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {mode === 'photo' && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <Camera className="mx-auto h-8 w-8 text-slate-400" aria-hidden />
          <p className="mt-2 font-medium text-slate-700">Añadir foto</p>
          <p className="mt-1 text-sm text-slate-500">Próximamente en una actualización</p>
          <button
            type="button"
            disabled
            className="mt-4 rounded-xl bg-slate-200 px-4 py-2 text-sm font-medium text-slate-500"
          >
            Elegir foto
          </button>
        </div>
      )}
    </div>
  );
}
