import { describe, expect, it } from 'vitest';
import {
  getFallbackPictogramId,
  normalizeActivityVisual,
} from './visual-asset.utils';

describe('visual-asset.utils', () => {
  it('normaliza visual vacío con fallback de categoría', () => {
    const result = normalizeActivityVisual(null, 'food');
    expect(result.type).toBe('pictogram');
    if (result.type === 'pictogram') {
      expect(result.pictogramId).toBe('lunch');
    }
  });

  it('conserva pictograma válido', () => {
    const visual = { type: 'pictogram' as const, pictogramId: 'school' };
    const result = normalizeActivityVisual(visual);
    expect(result.type).toBe('pictogram');
    if (result.type === 'pictogram') {
      expect(result.pictogramId).toBe('school');
    }
  });

  it('conserva emoji válido', () => {
    const visual = { type: 'emoji' as const, emoji: '🎯' };
    const result = normalizeActivityVisual(visual);
    expect(result.type).toBe('emoji');
    if (result.type === 'emoji') {
      expect(result.emoji).toBe('🎯');
    }
  });

  it('resuelve fallback de pictograma desde visual', () => {
    const visual = {
      type: 'photo' as const,
      photoUri: 'pictorganizer://photos/x.jpg',
      fallbackPictogramId: 'sleep',
    };
    expect(getFallbackPictogramId(visual)).toBe('sleep');
  });

  it('usa fallback de categoría si no hay fallback en visual', () => {
    const visual = { type: 'emoji' as const, emoji: '⭐' };
    expect(getFallbackPictogramId(visual, 'health')).toBe('doctor');
  });
});
