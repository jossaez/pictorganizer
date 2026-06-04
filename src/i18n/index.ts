import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import {
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
  type SupportedLanguage,
} from './languages';
import de from './locales/de/common.json';
import en from './locales/en/common.json';
import es from './locales/es/common.json';
import fr from './locales/fr/common.json';
import it from './locales/it/common.json';
import pt from './locales/pt/common.json';

export const I18N_NAMESPACE = 'common';

const resources = {
  es: { [I18N_NAMESPACE]: es },
  en: { [I18N_NAMESPACE]: en },
  fr: { [I18N_NAMESPACE]: fr },
  de: { [I18N_NAMESPACE]: de },
  it: { [I18N_NAMESPACE]: it },
  pt: { [I18N_NAMESPACE]: pt },
} as const;

export async function initI18n(language: SupportedLanguage = DEFAULT_LANGUAGE): Promise<typeof i18n> {
  const lng = isSupportedLanguage(language) ? language : DEFAULT_LANGUAGE;

  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      resources,
      lng,
      fallbackLng: DEFAULT_LANGUAGE,
      defaultNS: I18N_NAMESPACE,
      ns: [I18N_NAMESPACE],
      interpolation: { escapeValue: false },
      returnNull: false,
    });
    return i18n;
  }

  if (i18n.language !== lng) {
    await i18n.changeLanguage(lng);
  }

  return i18n;
}

export async function changeAppLanguage(language: SupportedLanguage): Promise<void> {
  const lng = isSupportedLanguage(language) ? language : DEFAULT_LANGUAGE;
  await initI18n(lng);
  await i18n.changeLanguage(lng);
}

export { i18n };
