import { beforeEach, describe, expect, it } from 'vitest';
import { ChildModeDetailLevel } from '@/domain/enums';
import { DexieProfileRepository } from './dexie-profile.repository';
import { resetTestDatabase } from '@/test/db-test-utils';

describe('DexieProfileRepository', () => {
  const repository = new DexieProfileRepository();

  beforeEach(async () => {
    await resetTestDatabase();
  });

  it('createProfile crea perfil y settings por defecto', async () => {
    const { profile, settings } = await repository.createProfile({
      name: 'Ana',
      color: '#FFB74D',
    });

    expect(profile.name).toBe('Ana');
    expect(profile.isActive).toBe(true);
    expect(settings.profileId).toBe(profile.id);
    expect(settings.showTimer).toBe(true);
    expect(settings.showAnticipation).toBe(true);
  });

  it('updateProfile modifica datos del perfil', async () => {
    const { profile } = await repository.createProfile({ name: 'Ana', color: '#FFB74D' });

    const updated = await repository.updateProfile(profile.id, { name: 'Ana García' });
    expect(updated.name).toBe('Ana García');
    expect(updated.revision).toBeGreaterThan(profile.revision);
  });

  it('updateProfileSettings persiste preferencias del perfil', async () => {
    const { profile } = await repository.createProfile({ name: 'Ana', color: '#FFB74D' });

    const updated = await repository.updateProfileSettings(profile.id, {
      showTimer: false,
      childModeDetailLevel: ChildModeDetailLevel.Minimal,
    });

    expect(updated.showTimer).toBe(false);
    expect(await repository.getSettingsByProfileId(profile.id)).toMatchObject({
      showTimer: false,
    });
  });

  it('getActiveProfiles excluye perfiles soft-deleted', async () => {
    const first = await repository.createProfile({ name: 'Ana', color: '#FFB74D' });
    await repository.createProfile({ name: 'Luis', color: '#4FC3F7' });

    await repository.softDeleteProfile(first.profile.id);

    const active = await repository.getActiveProfiles();
    expect(active).toHaveLength(1);
    expect(active[0]?.name).toBe('Luis');
  });

  it('softDeleteProfile marca isActive false y deletedAt', async () => {
    const { profile } = await repository.createProfile({ name: 'Ana', color: '#FFB74D' });

    await repository.softDeleteProfile(profile.id);

    const stored = await repository.getProfileById(profile.id);
    expect(stored?.isActive).toBe(false);
    expect(stored?.deletedAt).toBeDefined();
  });
});
