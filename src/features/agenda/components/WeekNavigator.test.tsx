import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WeekNavigator } from './WeekNavigator';
import { renderWithProviders, screen } from '@/test/test-utils';

const mockDays = [
  {
    date: '2026-06-02',
    weekdayLabel: 'LUN',
    dayNumber: 2,
    isToday: false,
    isSelected: false,
    totalActivities: 2,
    completedActivities: 1,
    hasActivities: true,
  },
  {
    date: '2026-06-03',
    weekdayLabel: 'MAR',
    dayNumber: 3,
    isToday: true,
    isSelected: true,
    totalActivities: 3,
    completedActivities: 0,
    hasActivities: true,
  },
];

vi.mock('@/features/agenda/hooks/useWeekActivitySummary', () => ({
  useWeekActivitySummary: vi.fn(() => ({
    days: mockDays,
    isLoading: false,
  })),
}));

describe('WeekNavigator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza navegación semanal con aria-label', () => {
    renderWithProviders(
      <WeekNavigator
        profileId="profile-1"
        selectedDate="2026-06-03"
        onPreviousWeek={vi.fn()}
        onNextWeek={vi.fn()}
        onToday={vi.fn()}
      />,
    );

    expect(screen.getByRole('navigation', { name: 'Navegación semanal' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Semana anterior' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Semana siguiente' })).toBeInTheDocument();
  });

  it('marca el día seleccionado con aria-selected', () => {
    renderWithProviders(
      <WeekNavigator
        profileId="profile-1"
        selectedDate="2026-06-03"
        onPreviousWeek={vi.fn()}
        onNextWeek={vi.fn()}
        onToday={vi.fn()}
      />,
    );

    const selectedDays = screen.getAllByRole('button', { name: /seleccionado/i });
    expect(selectedDays.length).toBeGreaterThan(0);
    expect(selectedDays[0]).toHaveAttribute('aria-selected', 'true');
  });
});
