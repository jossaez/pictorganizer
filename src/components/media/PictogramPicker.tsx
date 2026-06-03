import { useMemo, useState } from 'react';
import type { Category, Pictogram } from '@/domain/types';
import { getPictogramEmoji } from '@/domain/visual/pictogram-registry';
import { cn } from '@/utils/cn';

interface PictogramPickerProps {
  pictograms: Pictogram[];
  categories: Category[];
  value: string;
  onChange: (pictogramId: string) => void;
  disabled?: boolean;
}

export function PictogramPicker({
  pictograms,
  categories,
  value,
  onChange,
  disabled = false,
}: PictogramPickerProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return pictograms.filter((pic) => {
      if (categoryFilter !== 'all' && pic.categoryId !== categoryFilter) return false;
      if (!query) return true;
      const inLabel = pic.label.toLowerCase().includes(query);
      const inKeywords = pic.keywords?.some((k) => k.toLowerCase().includes(query));
      return inLabel || inKeywords;
    });
  }, [pictograms, search, categoryFilter]);

  const selected = pictograms.find((p) => p.id === value);

  return (
    <div className="space-y-4">
      {selected && (
        <p className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-900" role="status">
          Seleccionado: {selected.label}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="pictogram-search" className="text-sm font-medium text-slate-700">
            Buscar
          </label>
          <input
            id="pictogram-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Desayuno, colegio…"
            disabled={disabled}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
          />
        </div>
        <div>
          <label htmlFor="pictogram-category" className="text-sm font-medium text-slate-700">
            Categoría
          </label>
          <select
            id="pictogram-category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            disabled={disabled}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <option value="all">Todas</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          No hay pictogramas con ese filtro.
        </p>
      ) : (
        <ul
          className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
          role="listbox"
          aria-label="Pictogramas"
        >
          {filtered.map((pic) => {
            const isSelected = value === pic.id;
            const emoji = pic.emoji ?? getPictogramEmoji(pic.id);
            return (
              <li key={pic.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  aria-label={pic.label}
                  disabled={disabled}
                  onClick={() => onChange(pic.id)}
                  className={cn(
                    'flex w-full flex-col items-center gap-1 rounded-xl bg-white p-2 shadow-sm ring-1 transition-all',
                    'min-h-[5.5rem] md:min-h-[6rem]',
                    isSelected
                      ? 'ring-2 ring-[var(--color-primary)]'
                      : 'ring-slate-100 hover:ring-slate-200',
                    disabled && 'cursor-not-allowed opacity-50',
                  )}
                >
                  <span className="text-2xl md:text-3xl" aria-hidden>
                    {emoji}
                  </span>
                  <span className="line-clamp-2 text-center text-[10px] font-medium leading-tight text-slate-600 md:text-xs">
                    {pic.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
