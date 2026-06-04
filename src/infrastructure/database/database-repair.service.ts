import { APP_SETTINGS_ID, CelebrationStyle, ChildModeDetailLevel, TimerStyle } from '../../domain/enums';
import type { AppSettings, ProfileSettings } from '../../domain/types';
import { DEFAULT_LANGUAGE, isSupportedLanguage } from '@/i18n/languages';
import { generateId } from '../../utils/generateId';
import { db } from './dexie.db';
import { createDefaultAppSettings } from './seeds/seedIfEmpty';
import { nowIso } from './sync.helpers';
import { settingsRepository } from '../repositories';

function defaultProfileSettings(profileId: string, now: string): ProfileSettings {
  return {
    id: generateId(),
    profileId,
    showTimer: true,
    showAnticipation: true,
    celebrationStyle: CelebrationStyle.Smile,
    timerStyle: TimerStyle.Bar,
    childModeDetailLevel: ChildModeDetailLevel.Standard,
    notificationsEnabled: false,
    notificationMinutesBefore: 0,
    createdAt: now,
    updatedAt: now,
  };
}

async function getActiveProfiles() {
  return db.profiles.filter((p) => p.isActive && !p.deletedAt).sortBy('sortOrder');
}

async function ensureProfileSettingsForActiveProfiles(): Promise<number> {
  const now = nowIso();
  const profiles = await getActiveProfiles();
  let created = 0;

  for (const profile of profiles) {
    const existing = await db.profileSettings.where('profileId').equals(profile.id).first();
    if (!existing) {
      await db.profileSettings.add(defaultProfileSettings(profile.id, now));
      created++;
    }
  }

  return created;
}

/**
 * Soft repairs for AppSettings and missing ProfileSettings.
 * Safe to run on every boot.
 */
export async function repairAppSettingsIfNeeded(): Promise<AppSettings> {
  let settings = await db.appSettings.get(APP_SETTINGS_ID);
  if (!settings) {
    settings = createDefaultAppSettings();
    await db.appSettings.add(settings);
  }

  await ensureProfileSettingsForActiveProfiles();

  const activeProfiles = await getActiveProfiles();
  const activeIds = new Set(activeProfiles.map((p) => p.id));

  if (settings.activeProfileId && !activeIds.has(settings.activeProfileId)) {
    return settingsRepository.updateAppSettings({
      activeProfileId: activeProfiles[0]?.id,
    });
  }

  if (!settings.activeProfileId && activeProfiles.length > 0) {
    return settingsRepository.updateAppSettings({
      activeProfileId: activeProfiles[0]!.id,
    });
  }

  if (settings.activeProfileId && activeProfiles.length === 0) {
    return settingsRepository.updateAppSettings({ activeProfileId: undefined });
  }

  if (settings.requirePinForAdultMode === undefined) {
    return settingsRepository.updateAppSettings({ requirePinForAdultMode: false });
  }

  if (!settings.language || !isSupportedLanguage(settings.language)) {
    return settingsRepository.updateAppSettings({ language: DEFAULT_LANGUAGE });
  }

  return settingsRepository.getOrCreateAppSettings();
}
