import { describe, expect, it, vi } from 'vitest';
import { ActivityCard } from './ActivityCard';
import { createMockActivityInstance } from '@/test/factories';
import { renderWithProviders, screen, userEvent } from '@/test/test-utils';

function enrichedActivity(
  overrides: Partial<ReturnType<typeof createMockActivityInstance> & { computedState?: string }> = {},
) {
  const { computedState = 'pending', ...instanceOverrides } = overrides;
  return {
    ...createMockActivityInstance(instanceOverrides),
    computedState: computedState as 'pending',
  };
}

describe('ActivityCard', () => {
  it('renderiza título y estado con aria-label', () => {
    renderWithProviders(
      <ActivityCard
        activity={enrichedActivity({ title: 'Desayuno' })}
        onComplete={vi.fn()}
      />,
    );

    expect(screen.getByRole('article', { name: /Desayuno/i })).toBeInTheDocument();
    expect(screen.getByText('Desayuno')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('llama onComplete al pulsar Hecho', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    renderWithProviders(
      <ActivityCard
        activity={enrichedActivity({ id: 'act-1', title: 'Paseo' })}
        onComplete={onComplete}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Marcar Paseo como hecha/i }));
    expect(onComplete).toHaveBeenCalledWith('act-1');
  });

  it('expone data-activity-state para accesibilidad visual', () => {
    renderWithProviders(
      <ActivityCard
        activity={enrichedActivity({ computedState: 'in_progress' })}
        onComplete={vi.fn()}
      />,
    );

    expect(document.querySelector('[data-activity-state="in_progress"]')).toBeTruthy();
  });
});
