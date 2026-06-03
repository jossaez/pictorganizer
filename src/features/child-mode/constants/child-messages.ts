export const CHILD_CELEBRATION_MESSAGES = [
  'Muy bien',
  'Lo has conseguido',
  'Actividad hecha',
] as const;

/** @deprecated Use pickCelebrationMessage from celebration-messages */
export function pickChildCelebrationMessage(): string {
  const index = Math.floor(Math.random() * CHILD_CELEBRATION_MESSAGES.length);
  return CHILD_CELEBRATION_MESSAGES[index] ?? 'Muy bien';
}
