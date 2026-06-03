export const CELEBRATION_MESSAGES = [
  'Muy bien',
  'Lo has conseguido',
  'Actividad hecha',
  'Genial',
  'Buen trabajo',
] as const;

export interface PickCelebrationMessageOptions {
  profileName?: string;
  /** When true, prefer shorter messages without name suffix */
  simple?: boolean;
}

export function pickCelebrationMessage(options: PickCelebrationMessageOptions = {}): string {
  const { profileName, simple = false } = options;
  const index = Math.floor(Math.random() * CELEBRATION_MESSAGES.length);
  const base = CELEBRATION_MESSAGES[index] ?? 'Muy bien';

  if (simple || !profileName?.trim()) {
    return base;
  }

  if (base === 'Muy bien') {
    return `Muy bien, ${profileName.trim()}`;
  }

  return base;
}
