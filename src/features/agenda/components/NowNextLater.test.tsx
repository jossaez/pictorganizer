import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CelebrationStyle,
  ChildModeDetailLevel,
  TimerStyle,
} from '@/domain/enums';
import { NowNextLater } from './NowNextLater';
import { createMockActivityInstance } from '@/test/factories';
import { cleanup, renderWithProviders, screen } from '@/test/test-utils';

describe('NowNextLater', () => {
  afterEach(() => {
    cleanup();
  });
  it('muestra secciones Ahora, Después y Más tarde', () => {
    const instances = [
      createMockActivityInstance({
        id: 'now-1',
        title: 'Desayuno',
        startTimeMinutes: 480,
      }),
      createMockActivityInstance({
        id: 'next-1',
        title: 'Colegio',
        startTimeMinutes: 540,
      }),
    ];

    renderWithProviders(
      <NowNextLater
        activities={instances}
        currentTimeMinutes={500}
        date="2026-06-03"
        todayDate="2026-06-03"
        profileSettings={{
          id: 's1',
          profileId: 'p1',
          showTimer: false,
          showAnticipation: true,
          celebrationStyle: CelebrationStyle.Smile,
          timerStyle: TimerStyle.Bar,
          childModeDetailLevel: ChildModeDetailLevel.Standard,
          createdAt: '',
          updatedAt: '',
        }}
        userMode="adult"
        onComplete={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Anticipación del día')).toBeInTheDocument();
    expect(screen.getByText('Ahora')).toBeInTheDocument();
    expect(screen.getByText('Después')).toBeInTheDocument();
    expect(screen.getByText('Más tarde')).toBeInTheDocument();
  });

  it('no renderiza nada si showAnticipation está desactivado', () => {
    renderWithProviders(
      <NowNextLater
        activities={[]}
        currentTimeMinutes={500}
        date="2026-06-03"
        todayDate="2026-06-03"
        profileSettings={{
          id: 's1',
          profileId: 'p1',
          showTimer: false,
          showAnticipation: false,
          celebrationStyle: CelebrationStyle.Smile,
          timerStyle: TimerStyle.Bar,
          childModeDetailLevel: ChildModeDetailLevel.Standard,
          createdAt: '',
          updatedAt: '',
        }}
        onComplete={vi.fn()}
      />,
    );

    expect(screen.queryByLabelText('Anticipación del día')).not.toBeInTheDocument();
  });
});
