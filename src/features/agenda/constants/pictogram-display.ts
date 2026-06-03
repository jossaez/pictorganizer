import { getPictogramEmoji, PICTOGRAM_EMOJI } from '@/domain/visual/pictogram-registry';

export { getPictogramEmoji, PICTOGRAM_EMOJI };

/** @deprecated Use getPictogramEmoji */
export function pictogramEmoji(pictogramId: string): string {
  return getPictogramEmoji(pictogramId);
}
