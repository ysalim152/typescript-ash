import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { AddSession } from './AddSession';
import { getActivities } from '../../api/activityApi';
import { createSession } from '../../api/sessionApi';

// --- Mocks ---
// On simule les modules externes pour isoler notre composant
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ token: 'fake-token' }),
}));

vi.mock('../../api/activityApi');
vi.mock('../../api/sessionApi');
vi.mock('react-hot-toast');

// --- Test Setup ---
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Désactive les tentatives multiples pour les tests
    },
  },
});

const renderComponent = (client: QueryClient) => {
  return render(
    <QueryClientProvider client={client}>
      <AddSession />
    </QueryClientProvider>
  );
};

describe('AddSession Component', () => {
  let testQueryClient: QueryClient;

  beforeEach(() => {
    // Réinitialise les mocks et le client de query avant chaque test
    vi.clearAllMocks();
    testQueryClient = createTestQueryClient();
  });

  it('should render the form with all fields and load activities', async () => {
    // Arrange: Simuler la réponse de l'API pour les activités
    const mockActivities = [{ id: 1, name: 'Yoga', description: null, color: '#fff' }];
    vi.mocked(getActivities).mockResolvedValue(mockActivities);

    // Act
    renderComponent(testQueryClient);

    // Assert: Vérifier que les éléments principaux sont présents
    expect(screen.getByRole('heading', { name: /Create New Session/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Activity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Session Title/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Session/i })).toBeInTheDocument();

    // Attendre que les activités soient chargées et affichées
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Yoga' })).toBeInTheDocument();
    });
  });

  it('should submit the form with correct data and show success toast', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockActivities = [{ id: 1, name: 'Yoga', description: null, color: '#fff' }];
    vi.mocked(getActivities).mockResolvedValue(mockActivities);
    vi.mocked(createSession).mockResolvedValue({ id: 100, title: 'Morning Yoga', participant_count: 0 } as any);

    renderComponent(testQueryClient);

    // Attendre le chargement des activités
    await screen.findByText('Select an activity');

    // Act: Simuler le remplissage et la soumission du formulaire
    await user.selectOptions(screen.getByLabelText(/Activity/i), '1');
    await user.type(screen.getByLabelText(/Session Title/i), 'Morning Yoga');
    await user.type(screen.getByLabelText(/Date & Time/i), '2026-10-26T09:00');
    await user.click(screen.getByRole('button', { name: /Create Session/i }));

    // Assert
    await waitFor(() => {
      // Vérifier que la fonction de création a été appelée avec les bonnes données
      expect(createSession).toHaveBeenCalledWith(expect.objectContaining({
        sessionData: expect.objectContaining({
          activityId: 1,
          title: 'Morning Yoga',
          sessionDate: '2026-10-26T09:00:00.000Z',
        }),
        token: 'fake-token',
      }));

      // Vérifier que la notification de succès est affichée
      expect(toast.success).toHaveBeenCalledWith('Session created successfully!');
    });
  });

  it('should show an error toast if submission fails', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(getActivities).mockResolvedValue([{ id: 1, name: 'Yoga', description: null, color: '#fff' }]);
    const errorMessage = 'Failed to create session.';
    vi.mocked(createSession).mockRejectedValue(new Error(errorMessage));

    renderComponent(testQueryClient);
    await screen.findByText('Select an activity');

    // Act
    await user.selectOptions(screen.getByLabelText(/Activity/i), '1');
    await user.type(screen.getByLabelText(/Session Title/i), 'Failing Yoga');
    await user.type(screen.getByLabelText(/Date & Time/i), '2026-10-26T09:00');
    await user.click(screen.getByRole('button', { name: /Create Session/i }));

    // Assert
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });
});