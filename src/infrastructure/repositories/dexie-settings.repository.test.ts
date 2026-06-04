import { beforeEach, describe, expect, it } from 'vitest';
import { APP_SETTINGS_ID } from '@/domain/enums';
import { DexieSettingsRepository } from './dexie-settings.repository';
import { db } from '@/infrastructure/database/dexie.db';
import { resetTestDatabase, seedTestDatabase } from '@/test/db-test-utils';

describe('DexieSettingsRepository', () => {
  const repository = new DexieSettingsRepository();

  beforeEach(async () => {
    await resetTestDatabase();
  });

  it('getOrCreateAppSettings crea valores por defecto', async () => {
    const settings = await repository.getOrCreateAppSettings();

    expect(settings.id).toBe(APP_SETTINGS_ID);
    expect(settings.onboardingCompleted).toBe(false);
    expect(settings.language).toBe('es');
    expect(settings.largeText).toBe(false);
    expect(settings.reduceMotion).toBe(false);
    expect(settings.requirePinForAdultMode).toBe(false);
  });

  it('updateAppSettings persiste idioma', async () => {
    await repository.getOrCreateAppSettings();

    const updated = await repository.updateAppSettings({ language: 'en' });
    expect(updated.language).toBe('en');
  });

  it('updateAppSettings persiste preferencias globales', async () => {
    await repository.getOrCreateAppSettings();

    const updated = await repository.updateAppSettings({
      largeText: true,
      highContrast: true,
    });

    expect(updated.largeText).toBe(true);
    expect(updated.highContrast).toBe(true);

    const stored = await db.appSettings.get(APP_SETTINGS_ID);
    expect(stored?.largeText).toBe(true);
  });

  it('setActiveProfileId guarda el perfil activo', async () => {
    await repository.getOrCreateAppSettings();

    const updated = await repository.setActiveProfileId('profile-abc');
    expect(updated.activeProfileId).toBe('profile-abc');
  });

  it('markOnboardingCompleted marca onboarding como completado', async () => {
    await repository.getOrCreateAppSettings();

    const updated = await repository.markOnboardingCompleted();
    expect(updated.onboardingCompleted).toBe(true);
  });

  it('seedTestDatabase inicializa catálogo y settings', async () => {
    const { seeded } = await seedTestDatabase();
    expect(seeded).toBe(true);

    const categories = await db.categories.count();
    const settings = await repository.getAppSettings();
    expect(categories).toBeGreaterThan(0);
    expect(settings.onboardingCompleted).toBe(false);
  });
});
