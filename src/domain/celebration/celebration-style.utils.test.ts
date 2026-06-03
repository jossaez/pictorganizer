import { describe, expect, it } from 'vitest';
import { CelebrationStyle } from '../enums';
import { normalizeCelebrationStyle, shouldShowCelebration } from './celebration-style.utils';

describe('celebration-style.utils', () => {
  it('normaliza valores legacy', () => {
    expect(normalizeCelebrationStyle('stars')).toBe(CelebrationStyle.Star);
    expect(normalizeCelebrationStyle('faces')).toBe(CelebrationStyle.Smile);
    expect(normalizeCelebrationStyle('mixed')).toBe(CelebrationStyle.ConfettiSoft);
  });

  it('shouldShowCelebration es false para none', () => {
    expect(shouldShowCelebration(CelebrationStyle.None)).toBe(false);
    expect(shouldShowCelebration(CelebrationStyle.Smile)).toBe(true);
  });
});
