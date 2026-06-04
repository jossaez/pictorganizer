import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AVAILABLE_LANGUAGES,
  getLanguageDefinition,
  type LanguageDefinition,
  type SupportedLanguage,
} from '@/i18n/languages';
import { changeAppLanguage } from '@/i18n';
import { settingsRepository } from '@/infrastructure/repositories';
import { useAppStore } from '@/store/app.store';

export function useLanguage() {
  const language = useAppStore((s) => s.language);
  const setLanguageInStore = useAppStore((s) => s.setLanguage);
  const { t } = useTranslation();

  const setLanguage = useCallback(
    async (nextLanguage: SupportedLanguage): Promise<void> => {
      await changeAppLanguage(nextLanguage);
      const settings = await settingsRepository.updateAppSettings({ language: nextLanguage });
      setLanguageInStore(settings.language ?? nextLanguage);
    },
    [setLanguageInStore],
  );

  const getLanguageLabel = useCallback(
    (code: SupportedLanguage = language): string => {
      return getLanguageDefinition(code).nativeName;
    },
    [language],
  );

  const getLanguageFlag = useCallback(
    (code: SupportedLanguage = language): string => {
      return getLanguageDefinition(code).flag;
    },
    [language],
  );

  const availableLanguages: LanguageDefinition[] = useMemo(() => AVAILABLE_LANGUAGES, []);

  return {
    language,
    availableLanguages,
    setLanguage,
    getLanguageLabel,
    getLanguageFlag,
    t,
  };
}
