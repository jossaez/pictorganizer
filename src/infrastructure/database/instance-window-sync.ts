import { extendInstanceWindowForProfile } from '@/infrastructure/database/database-maintenance.service';

export function syncInstanceWindow(profileId: string | null | undefined): void {
  if (!profileId) return;
  void extendInstanceWindowForProfile(profileId).catch((err) => {
    console.warn('[instance-window] sync failed:', err);
  });
}
