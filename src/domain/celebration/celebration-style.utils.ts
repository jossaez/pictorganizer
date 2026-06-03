import { CelebrationStyle } from '../enums';

/** Maps legacy persisted values to the current CelebrationStyle enum */
export function normalizeCelebrationStyle(value: string | CelebrationStyle): CelebrationStyle {
  switch (value) {
    case CelebrationStyle.None:
    case CelebrationStyle.Smile:
    case CelebrationStyle.Star:
    case CelebrationStyle.ConfettiSoft:
      return value;
    case 'stars':
      return CelebrationStyle.Star;
    case 'faces':
      return CelebrationStyle.Smile;
    case 'mixed':
      return CelebrationStyle.ConfettiSoft;
    default:
      return CelebrationStyle.Smile;
  }
}

export function shouldShowCelebration(style: CelebrationStyle): boolean {
  return style !== CelebrationStyle.None;
}
