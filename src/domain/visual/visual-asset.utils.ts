/** Embedded visual reference for activities and templates */
export type ActivityVisual =
  | {
      type: 'pictogram';
      pictogramId: string;
      fallbackPictogramId?: string;
    }
  | {
      type: 'photo';
      photoUri: string;
      fallbackPictogramId?: string;
    }
  | {
      type: 'emoji';
      emoji: string;
      fallbackPictogramId?: string;
    }
  | {
      type: 'icon';
      iconId: string;
      fallbackPictogramId?: string;
    };

export type ActivityVisualType = ActivityVisual['type'];

/** Default pictogram when nothing else resolves */
export const DEFAULT_FALLBACK_PICTOGRAM_ID = 'wake-up';

/** Pictogram id used per category when activity visual is missing */
export const CATEGORY_FALLBACK_PICTOGRAM: Record<string, string> = {
  hygiene: 'wash-face',
  food: 'lunch',
  leisure: 'play',
  school: 'school',
  health: 'doctor',
  shopping: 'supermarket',
  calm: 'breathing',
  home: 'home',
  transport: 'car',
};

export function isActivityVisual(value: unknown): value is ActivityVisual {
  if (!value || typeof value !== 'object') return false;
  const v = value as ActivityVisual;
  switch (v.type) {
    case 'pictogram':
      return typeof v.pictogramId === 'string' && v.pictogramId.length > 0;
    case 'photo':
      return typeof v.photoUri === 'string' && v.photoUri.length > 0;
    case 'emoji':
      return typeof v.emoji === 'string' && v.emoji.length > 0;
    case 'icon':
      return typeof v.iconId === 'string' && v.iconId.length > 0;
    default:
      return false;
  }
}

/** Normalize legacy or partial visual data into a valid ActivityVisual */
export function normalizeActivityVisual(
  visual: ActivityVisual | undefined | null,
  categoryId?: string,
): ActivityVisual {
  if (isActivityVisual(visual)) return visual;

  const fallbackId =
    (categoryId && CATEGORY_FALLBACK_PICTOGRAM[categoryId]) ?? DEFAULT_FALLBACK_PICTOGRAM_ID;

  return {
    type: 'pictogram',
    pictogramId: fallbackId,
    fallbackPictogramId: fallbackId,
  };
}

export function getFallbackPictogramId(
  visual: ActivityVisual,
  categoryId?: string,
): string {
  if (visual.fallbackPictogramId) return visual.fallbackPictogramId;
  if (categoryId && CATEGORY_FALLBACK_PICTOGRAM[categoryId]) {
    return CATEGORY_FALLBACK_PICTOGRAM[categoryId];
  }
  return DEFAULT_FALLBACK_PICTOGRAM_ID;
}
