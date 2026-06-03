import { describe, expect, it } from 'vitest';
import { ProfileAvatar } from './ProfileAvatar';
import { createMockProfile } from '@/test/factories';
import { renderWithProviders, screen } from '@/test/test-utils';

describe('ProfileAvatar', () => {
  it('muestra inicial del nombre con aria-label', () => {
    renderWithProviders(
      <ProfileAvatar profile={createMockProfile({ name: 'Lucía', avatarId: undefined })} />,
    );

    expect(screen.getByLabelText('Perfil de Lucía')).toHaveTextContent('L');
  });

  it('muestra emoji de avatar cuando hay avatarId', () => {
    renderWithProviders(
      <ProfileAvatar
        profile={createMockProfile({ name: 'Lucía', avatarId: 'avatar-bear' })}
        avatars={[{ id: 'avatar-bear', label: 'Oso', assetPath: '', sortOrder: 0 }]}
      />,
    );

    expect(screen.getByLabelText(/Avatar de Lucía/i)).toBeInTheDocument();
  });
});
