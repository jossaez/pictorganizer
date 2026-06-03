import type { Category } from '@/domain/types';
import { cn } from '@/utils/cn';

interface CategorySelectorProps {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
}

export function CategorySelector({ categories, value, onChange }: CategorySelectorProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {categories.map((category) => {
        const selected = value === category.id;
        return (
          <li key={category.id}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(category.id)}
              className={cn(
                'flex w-full flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 transition-all',
                selected
                  ? 'ring-2 ring-[var(--color-primary)]'
                  : 'ring-slate-100 hover:ring-slate-200',
              )}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white"
                style={{ backgroundColor: category.color }}
                aria-hidden
              >
                {category.label.charAt(0)}
              </div>
              <span className="text-center text-sm font-medium text-slate-800">{category.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
