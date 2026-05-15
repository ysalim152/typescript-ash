import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Loader, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Session } from '../../types';
import toast from 'react-hot-toast';
import { getMySessions, unregisterFromSession } from '../../api/sessionApi';
import PullToRefresh from 'react-pull-to-refresh';

export function Planning() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data: sessions, isLoading, refetch } = useQuery({
    // Utiliser une clé de query différente pour les sessions de l'utilisateur
    queryKey: ['my-sessions'],
    queryFn: () => {
      if (!token) return Promise.resolve([]); // Return empty array if no token
      return getMySessions(token);
    },
    enabled: !!token,
  });

  const { mutate: handleUnregister, isPending: isRemoving, variables: removingId } = useMutation<
    void, Error, number, { previousSessions: Session[] | undefined }
  >({
    mutationFn: (sessionId: number) => {
      if (!token) throw new Error('Authentication token is missing.');
      return unregisterFromSession({ sessionId, token });
    },
    onMutate: async (sessionId: number) => {
      await queryClient.cancelQueries({ queryKey: ['my-sessions'] });
      const previousSessions = queryClient.getQueryData<Session[]>(['my-sessions']);

      // Mise à jour optimiste : retirer la session de la liste
      queryClient.setQueryData<Session[]>(['my-sessions'], (oldData) => {
        if (!oldData) return [];
        return oldData.filter(session => session.id !== sessionId);
      });

      return { previousSessions };
    },
    onError: (err, variables, context) => {
      toast.error(err.message);
      // En cas d'erreur, restaurer les données précédentes
      if (context?.previousSessions) {
        queryClient.setQueryData(['my-sessions'], context.previousSessions);
      }
    },
    onSuccess: () => {
      toast.success('Désinscription réussie !');
    },
    onSettled: () => {
      // S'assurer que les données sont synchronisées avec le serveur
      queryClient.invalidateQueries({ queryKey: ['my-sessions'] });
    }
  });

  const handleRefresh = async () => {
    await refetch();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Sessions</h1>

        {!sessions || sessions.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600 mb-4">Vous ne vous êtes inscrit à aucune session pour le moment.</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {sessions.map((session) => (
              <Card key={session.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{session.title}</h3>
                    <p className="text-blue-600 text-sm">{session.activity_name}</p>
                  </div>
                  <Button
                    onClick={() => handleUnregister(session.id)}
                    variant="ghost"
                    size="sm"
                    disabled={isRemoving && removingId === session.id}
                  >
                    <X size={16} />
                  </Button>
                </div>

                <p className="text-gray-600 mb-4">{session.description}</p>

                <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <p className="font-semibold">Date et heure</p>
                    <p>{new Date(session.session_date).toLocaleString()}</p>
                  </div>
                  {session.location && (
                    <div>
                      <p className="font-semibold">Emplacement</p>
                      <p>{session.location}</p>
                    </div>
                  )}
                  {session.duration_minutes && (
                    <div>
                      <p className="font-semibold">Durée</p>
                      <p>{session.duration_minutes} minutes</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}
