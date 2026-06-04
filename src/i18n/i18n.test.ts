import { beforeEach, describe, expect, it } from 'vitest';
import { i18n, initI18n, changeAppLanguage } from '@/i18n';

describe('i18n', () => {
  beforeEach(async () => {
    await initI18n('es');
  });

  it('carga español por defecto', () => {
    expect(i18n.t('onboarding.welcome.title')).toBe('Bienvenida');
    expect(i18n.t('language.title')).toBe('Selecciona tu idioma');
  });

  it('cambia idioma dinámicamente', async () => {
    await changeAppLanguage('en');
    expect(i18n.t('onboarding.welcome.title')).toBe('Welcome');
    expect(i18n.t('nav.settings')).toBe('Settings');

    await changeAppLanguage('fr');
    expect(i18n.t('common.continue')).toBe('Continuer');
  });
});
