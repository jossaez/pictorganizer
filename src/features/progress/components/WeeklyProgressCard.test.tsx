import { describe, expect, it } from 'vitest';
import { WeeklyProgressCard } from './WeeklyProgressCard';
import type { WeeklyProgress } from '@/domain/services/progress.service';
import { renderWithProviders, screen } from '@/test/test-utils';

const sampleWeekly: WeeklyProgress = {
  startDate: '2026-06-02',
  endDate: '2026-06-08',
  days: [],
  totalActivities: 10,
  completedActivities: 6,
  skippedActivities: 1,
  missedActivities: 1,
  pendingActivities: 2,
  weeklyCompletionRate: 0.6,
  completedDays: 3,
};

describe('WeeklyProgressCard', () => {
  it('renderiza resumen semanal con progressbar', () => {
    renderWithProviders(<WeeklyProgressCard progress={sampleWeekly} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('6 / 10')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('muestra mensaje vacío sin actividades', () => {
    renderWithProviders(
      <WeeklyProgressCard
        progress={{
          ...sampleWeekly,
          totalActivities: 0,
          completedActivities: 0,
          weeklyCompletionRate: 0,
        }}
      />,
    );

    expect(screen.getByText('No hay actividades esta semana')).toBeInTheDocument();
  });
});
