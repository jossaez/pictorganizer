export type SupportedLanguage = 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt';

export const DEFAULT_LANGUAGE: SupportedLanguage = 'es';

export interface LanguageDefinition {
  code: SupportedLanguage;
  nativeName: string;
  englishName: string;
  flag: string;
}

export const AVAILABLE_LANGUAGES: LanguageDefinition[] = [
  { code: 'es', nativeName: 'Español', englishName: 'Spanish', flag: '🇪🇸' },
  { code: 'en', nativeName: 'English', englishName: 'English', flag: '🇬🇧' },
  { code: 'fr', nativeName: 'Français', englishName: 'French', flag: '🇫🇷' },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German', flag: '🇩🇪' },
  { code: 'it', nativeName: 'Italiano', englishName: 'Italian', flag: '🇮🇹' },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese', flag: '🇵🇹' },
];

export function isSupportedLanguage(value: string | undefined | null): value is SupportedLanguage {
  return AVAILABLE_LANGUAGES.some((lang) => lang.code === value);
}

export function getLanguageDefinition(code: SupportedLanguage): LanguageDefinition {
  return AVAILABLE_LANGUAGES.find((lang) => lang.code === code) ?? AVAILABLE_LANGUAGES[0]!;
}
