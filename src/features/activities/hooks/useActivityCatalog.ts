import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import type { Category, Pictogram } from '@/domain/types';
import { db } from '@/infrastructure/database/dexie.db';
import { SEED_CATEGORIES, SEED_PICTOGRAMS } from '@/infrastructure/database/seeds/seed-data';

export function useActivityCatalog() {
  const categoriesFromDb = useLiveQuery(() => db.categories.orderBy('sortOrder').toArray(), [], []);
  const pictogramsFromDb = useLiveQuery(() => db.pictograms.orderBy('sortOrder').toArray(), [], []);

  const categories: Category[] = useMemo(() => {
    if (categoriesFromDb && categoriesFromDb.length > 0) return categoriesFromDb;
    return SEED_CATEGORIES;
  }, [categoriesFromDb]);

  const pictograms: Pictogram[] = useMemo(() => {
    if (pictogramsFromDb && pictogramsFromDb.length > 0) return pictogramsFromDb;
    return SEED_PICTOGRAMS;
  }, [pictogramsFromDb]);

  return {
    categories,
    pictograms,
    isLoading: categoriesFromDb === undefined || pictogramsFromDb === undefined,
  };
}
