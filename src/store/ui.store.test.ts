import { beforeEach, describe, expect, it } from 'vitest';
import { CelebrationStyle } from '../domain/enums';
import { useUiStore } from './ui.store';

describe('ui.store — celebration', () => {
  beforeEach(() => {
    useUiStore.setState({ celebration: null, celebratedDayKeys: [] });
  });

  it('showCelebration guarda payload', () => {
    useUiStore.getState().showCelebration({
      type: CelebrationStyle.Smile,
      message: 'Muy bien, Lucas',
      activityTitle: 'Desayuno',
    });

    const state = useUiStore.getState().celebration;
    expect(state).toEqual({
      visible: true,
      type: CelebrationStyle.Smile,
      message: 'Muy bien, Lucas',
      activityTitle: 'Desayuno',
    });
  });

  it('hideCelebration limpia estado', () => {
    useUiStore.getState().showCelebration({
      type: CelebrationStyle.Star,
      message: 'Genial',
    });
    useUiStore.getState().hideCelebration();
    expect(useUiStore.getState().celebration).toBeNull();
  });

  it('markDayCompleteCelebrated evita duplicados', () => {
    const { markDayCompleteCelebrated, hasCelebratedDayComplete } = useUiStore.getState();
    markDayCompleteCelebrated('p1:2026-06-03');
    expect(hasCelebratedDayComplete('p1:2026-06-03')).toBe(true);
    markDayCompleteCelebrated('p1:2026-06-03');
    expect(useUiStore.getState().celebratedDayKeys).toHaveLength(1);
  });
});
