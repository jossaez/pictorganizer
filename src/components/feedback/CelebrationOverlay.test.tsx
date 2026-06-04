import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { i18n } from '@/i18n';
import { CelebrationOverlay } from './CelebrationOverlay';
import { CelebrationStyle } from '@/domain/enums';
import { useAppStore } from '@/store/app.store';
import { useUiStore } from '@/store/ui.store';
import { cleanup, renderWithProviders, screen } from '@/test/test-utils';

describe('CelebrationOverlay', () => {
  beforeEach(() => {
    useUiStore.setState({ celebration: null, celebratedDayKeys: [] });
    useAppStore.setState({ userMode: 'child' });
  });

  afterEach(() => {
    cleanup();
    useUiStore.setState({ celebration: null, celebratedDayKeys: [] });
  });

  it('no renderiza cuando no hay celebración visible', () => {
    renderWithProviders(<CelebrationOverlay />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('muestra mensaje de celebración en dialog accesible', () => {
    useUiStore.setState({
      celebration: {
        visible: true,
        type: CelebrationStyle.Smile,
        message: '¡Muy bien!',
        activityTitle: 'Desayuno',
      },
    });
    useAppStore.setState({ userMode: 'adult' });

    renderWithProviders(<CelebrationOverlay />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('¡Muy bien!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: i18n.t('celebration.close') })).toBeInTheDocument();
  });
});
