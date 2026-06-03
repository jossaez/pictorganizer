import { describe, expect, it, vi } from 'vitest';
import { pickCelebrationMessage } from './celebration-messages';

describe('pickCelebrationMessage', () => {
  it('incluye nombre de perfil en "Muy bien"', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(pickCelebrationMessage({ profileName: 'Lucas' })).toBe('Muy bien, Lucas');
    vi.restoreAllMocks();
  });

  it('modo simple no añade nombre', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(pickCelebrationMessage({ profileName: 'Lucas', simple: true })).toBe('Muy bien');
    vi.restoreAllMocks();
  });
});
