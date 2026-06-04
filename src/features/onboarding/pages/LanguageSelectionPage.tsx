import { CalendarHeart, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SupportedLanguage } from '@/i18n/languages';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/utils/cn';

interface LanguageSelectionPageProps {
  selectedLanguage: SupportedLanguage;
  onSelected: (language: SupportedLanguage) => void;
  compact?: boolean;
}

export function LanguageSelectionPage({
  selectedLanguage,
  onSelected,
  compact = false,
}: LanguageSelectionPageProps) {
  const { t } = useTranslation();
  const { availableLanguages, setLanguage } = useLanguage();

  async function handleSelect(code: SupportedLanguage): Promise<void> {
    await setLanguage(code);
    onSelected(code);
  }

  return (
    <div className={cn('flex w-full flex-col items-center text-center', compact && 'items-stretch')}>
      {!compact && (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white shadow-md shadow-blue-900/15">
            <CalendarHeart className="h-7 w-7" strokeWidth={2.25} aria-hidden />
          </div>
          <p className="mt-4 text-sm font-semibold tracking-[0.12em] text-[var(--color-primary)]">
            {t('app.name')}
          </p>
        </>
      )}

      <h1
        className={cn(
          'font-bold text-slate-900',
          compact ? 'text-xl text-left' : 'mt-6 text-2xl sm:text-3xl',
        )}
      >
        {t('language.title')}
      </h1>
      <p
        className={cn(
          'text-slate-600',
          compact ? 'mt-1 text-left text-sm' : 'mt-2 text-base sm:text-lg',
        )}
      >
        {t('language.subtitle')}
      </p>

      <ul
        className={cn(
          'mt-6 w-full space-y-3',
          !compact && 'max-w-md',
        )}
        role="listbox"
        aria-label={t('language.title')}
      >
        {availableLanguages.map((lang) => {
          const isSelected = selectedLanguage === lang.code;
          return (
            <li key={lang.code}>
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                aria-label={t('language.selectAria', { language: lang.nativeName })}
                onClick={() => void handleSelect(lang.code)}
                className={cn(
                  'a11y-focus-ring flex min-h-14 w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition-all',
                  'bg-white shadow-sm ring-1 ring-slate-200/90 hover:bg-slate-50 active:scale-[0.99]',
                  isSelected && 'ring-2 ring-[var(--color-primary)] shadow-md shadow-blue-900/10',
                )}
              >
                <span className="text-2xl leading-none" aria-hidden>
                  {lang.flag}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold text-slate-900 sm:text-lg">
                    {lang.nativeName}
                  </span>
                  <span className="block text-sm text-slate-500">{lang.englishName}</span>
                </span>
                {isSelected && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
                    <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
