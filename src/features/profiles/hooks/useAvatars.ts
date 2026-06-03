import { useLiveQuery } from 'dexie-react-hooks';
import type { Avatar } from '@/domain/types';
import { db } from '@/infrastructure/database/dexie.db';
import { SEED_AVATARS } from '@/infrastructure/database/seeds/seed-data';

export function useAvatars(): { avatars: Avatar[]; isLoading: boolean } {
  const avatarsFromDb = useLiveQuery(() => db.avatars.orderBy('sortOrder').toArray(), [], []);

  const avatars =
    avatarsFromDb && avatarsFromDb.length > 0 ? avatarsFromDb : SEED_AVATARS;

  return {
    avatars,
    isLoading: avatarsFromDb === undefined,
  };
}
