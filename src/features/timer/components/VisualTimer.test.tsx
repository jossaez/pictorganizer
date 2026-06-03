import { describe, expect, it } from 'vitest';
import { VisualTimer } from './VisualTimer';
import { renderWithProviders, screen } from '@/test/test-utils';

describe('VisualTimer', () => {
  it('renderiza barra de progreso con aria-label', () => {
    renderWithProviders(
      <VisualTimer
        startTimeMinutes={480}
        endTimeMinutes={510}
        currentTimeMinutes={495}
        title="Desayuno"
        variant="bar"
      />,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByLabelText(/Temporizador de Desayuno/i)).toBeInTheDocument();
  });

  it('renderiza bloques en variante blocks', () => {
    renderWithProviders(
      <VisualTimer
        startTimeMinutes={480}
        endTimeMinutes={540}
        currentTimeMinutes={500}
        variant="blocks"
      />,
    );

    expect(screen.getByRole('group', { name: 'Progreso en bloques' })).toBeInTheDocument();
  });
});
