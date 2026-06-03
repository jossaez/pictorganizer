import { describe, expect, it } from 'vitest';
import { DailyProgressCard } from './DailyProgressCard';
import type { DailyProgress } from '@/domain/services/progress.service';
import { renderWithProviders, screen } from '@/test/test-utils';

const sampleProgress: DailyProgress = {
  date: '2026-06-03',
  total: 4,
  completed: 2,
  pending: 2,
  skipped: 0,
  missed: 0,
  completionRate: 0.5,
  isComplete: false,
};

describe('DailyProgressCard', () => {
  it('renderiza progreso con barra accesible', () => {
    renderWithProviders(<DailyProgressCard progress={sampleProgress} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('2 / 4')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('muestra mensaje cuando no hay actividades', () => {
    renderWithProviders(
      <DailyProgressCard
        progress={{
          ...sampleProgress,
          total: 0,
          completed: 0,
          pending: 0,
          completionRate: 0,
          isComplete: false,
        }}
      />,
    );

    expect(screen.getByText('No hay actividades programadas hoy')).toBeInTheDocument();
  });
});
