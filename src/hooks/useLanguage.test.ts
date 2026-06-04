import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLanguage } from './useLanguage';
import { resetTestDatabase } from '@/test/db-test-utils';
import { settingsRepository } from '@/infrastructure/repositories';
import { useAppStore } from '@/store/app.store';
import { initI18n, i18n } from '@/i18n';

describe('useLanguage', () => {
  beforeEach(async () => {
    await resetTestDatabase();
    await initI18n('es');
    useAppStore.setState({ language: 'es' });
  });

  it('persiste idioma en Dexie al cambiar', async () => {
    const { result } = renderHook(() => useLanguage());

    await act(async () => {
      await result.current.setLanguage('en');
    });

    const settings = await settingsRepository.getAppSettings();
    expect(settings.language).toBe('en');
    expect(useAppStore.getState().language).toBe('en');
    expect(i18n.language).toBe('en');
  });

  it('expone etiquetas y banderas del catálogo', () => {
    const { result } = renderHook(() => useLanguage());

    expect(result.current.availableLanguages).toHaveLength(6);
    expect(result.current.getLanguageLabel('de')).toBe('Deutsch');
    expect(result.current.getLanguageFlag('it')).toBe('🇮🇹');
  });
});
