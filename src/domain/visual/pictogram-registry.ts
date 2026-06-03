/** Offline pictogram emoji display — replace with ARASAAC assets in v2 */
export const PICTOGRAM_EMOJI: Record<string, string> = {
  'wake-up': '☀️',
  bathroom: '🚽',
  'wash-face': '💧',
  dress: '👕',
  teeth: '🪥',
  shower: '🚿',
  pajamas: '🌙',
  breakfast: '🥣',
  lunch: '🍽️',
  dinner: '🍲',
  backpack: '🎒',
  school: '🏫',
  coat: '🧥',
  goodbye: '👋',
  home: '🏠',
  doctor: '🩺',
  pharmacy: '💊',
  waiting: '⏳',
  supermarket: '🛒',
  cart: '🛍️',
  car: '🚗',
  bus: '🚌',
  play: '🎮',
  rest: '🛋️',
  book: '📖',
  sleep: '😴',
  breathing: '🌬️',
  music: '🎵',
  water: '💧',
};

export const AVATAR_EMOJI: Record<string, string> = {
  'avatar-boy-1': '👦',
  'avatar-girl-1': '👧',
  'avatar-neutral-1': '🧒',
};

/** Quick emoji options for activity visual selector */
export const QUICK_EMOJI_OPTIONS = ['⭐', '🎯', '🎨', '⚽', '📚', '🎵', '🌈', '💪', '🧩', '🐶', '🌳', '🍎'] as const;

export function getPictogramEmoji(pictogramId: string): string {
  return PICTOGRAM_EMOJI[pictogramId] ?? '⭐';
}

export function getAvatarEmoji(avatarId: string): string {
  return AVATAR_EMOJI[avatarId] ?? '🙂';
}
