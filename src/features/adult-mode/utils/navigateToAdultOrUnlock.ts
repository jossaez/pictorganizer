import type { NavigateFunction } from 'react-router-dom';
import { isAdultPinRequired } from '@/domain/services/adult-pin.utils';
import { settingsRepository } from '@/infrastructure/repositories';
import { useAppStore } from '@/store/app.store';

export async function navigateToAdultOrUnlock(
  navigate: NavigateFunction,
  targetPath = '/adult',
): Promise<void> {
  const settings = await settingsRepository.getOrCreateAppSettings();
  const { isAdultSessionValid, enterAdultMode } = useAppStore.getState();

  if (isAdultPinRequired(settings) && !isAdultSessionValid()) {
    navigate('/adult/unlock', { state: { from: targetPath } });
    return;
  }

  enterAdultMode();
  navigate(targetPath, { replace: true });
}
