import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import type { Avatar } from '@/domain/types';
import { db } from '@/infrastructure/database/dexie.db';
import { SEED_AVATARS } from '@/infrastructure/database/seeds/seed-data';

export function useProfileAvatars() {
  const avatarsFromDb = useLiveQuery(() => db.avatars.orderBy('sortOrder').toArray(), [], []);

  const avatars: Avatar[] = useMemo(() => {
    if (avatarsFromDb && avatarsFromDb.length > 0) return avatarsFromDb;
    return SEED_AVATARS;
  }, [avatarsFromDb]);

  return {
    avatars,
    isLoading: avatarsFromDb === undefined,
  };
}
