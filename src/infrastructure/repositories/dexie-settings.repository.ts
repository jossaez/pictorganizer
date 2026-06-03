import { APP_SETTINGS_ID } from '../../domain/enums';
import type { ISettingsRepository, UpdateAppSettingsInput } from '../../domain/repositories/settings.repository';
import type { AppSettings } from '../../domain/types';
import { db } from '../database/dexie.db';
import { createDefaultAppSettings } from '../database/seeds/seedIfEmpty';
import { nowIso } from '../database/sync.helpers';

export class DexieSettingsRepository implements ISettingsRepository {
  async getAppSettings(): Promise<AppSettings> {
    const settings = await db.appSettings.get(APP_SETTINGS_ID);
    if (!settings) {
      throw new Error('AppSettings not initialized — run seedIfEmpty() on boot');
    }
    return settings;
  }

  async getOrCreateAppSettings(): Promise<AppSettings> {
    const existing = await db.appSettings.get(APP_SETTINGS_ID);
    if (existing) return existing;

    const defaults = createDefaultAppSettings();
    await db.appSettings.add(defaults);
    return defaults;
  }

  async updateAppSettings(input: UpdateAppSettingsInput): Promise<AppSettings> {
    const existing = await this.getOrCreateAppSettings();
    const updated: AppSettings = {
      ...existing,
      ...input,
      updatedAt: nowIso(),
    };
    await db.appSettings.put(updated);
    return updated;
  }

  async setActiveProfileId(profileId: string | undefined): Promise<AppSettings> {
    return this.updateAppSettings({ activeProfileId: profileId });
  }

  async setAdultPinHash(hash: string | undefined): Promise<AppSettings> {
    return this.updateAppSettings({ adultPinHash: hash });
  }

  async markOnboardingCompleted(): Promise<AppSettings> {
    return this.updateAppSettings({ onboardingCompleted: true });
  }
}
