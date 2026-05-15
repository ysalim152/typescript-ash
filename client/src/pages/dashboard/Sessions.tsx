import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Loader } from 'lucide-react';
import { Session } from '../../types';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAvailableSessions, registerForSession } from '../../api/sessionApi';
import { HttpError } from '../../api/HttpError';

export function Sessions() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions'], // Note: This fetches all sessions, not just available ones based on the old code.
    queryFn: () => getAvailableSessions(token),
    enabled: !!token, // La requête ne se lancera que si le token existe
  });

  const { mutate: handleRegister, isPending: isRegistering, variables: registeringId } = useMutation<
    void, // Type de retour de la mutationFn
    Error, // Type de l'erreur
    number, // Type des variables passées à la mutationFn (sessionId)
    { previousSessions: Session[] | undefined } // Type du contexte pour onMutate
  >({
    mutationFn: (sessionId: number) => {
      if (!token) throw new Error('Authentication token is missing.');
      return registerForSession({ sessionId, token });
    },
    // Quand la mutation est appelée :
    onMutate: async (sessionId: number) => {
      // 1. Annuler les requêtes en cours pour éviter qu'elles n'écrasent notre mise à jour optimiste
      await queryClient.cancelQueries({ queryKey: ['sessions'] });

      // 2. Sauvegarder l'état précédent
      const previousSessions = queryClient.getQueryData<Session[]>(['sessions']);

      // 3. Mettre à jour l'UI de manière optimiste
      queryClient.setQueryData<Session[]>(['sessions'], (oldData) => {
        if (!oldData) return [];
        return oldData.map(session =>
          session.id === sessionId
            ? { ...session, participant_count: session.participant_count + 1 }
            : session
        );
      });

      // 4. Retourner le contexte avec l'état précédent
      return { previousSessions };
    },
    // Si la mutation échoue, restaurer l'état précédent
    onError: (err, variables, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(['sessions'], context.previousSessions);
      }

      if (err instanceof HttpError) {
        if (err.status === 409) { // Conflit : l'utilisateur est déjà inscrit
          toast.error("Vous êtes déjà inscrit à cette session.");
        } else {
          toast.error(err.message || "Une erreur est survenue lors de l'inscription.");
        }
      } else {
        // Erreur générique
        toast.error("Une erreur inattendue est survenue.");
      }
    },
    onSuccess: () => {
      toast.success('Inscription réussie !');
    },
    // Toujours refaire un fetch à la fin pour s'assurer de la cohérence des données
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['my-sessions'] }); // Invalider aussi le planning
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Available Sessions</h1>

      {!sessions || sessions.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600">Aucune session disponible pour le moment.</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {sessions.map((session) => {
            const isFull = session.max_participants && session.participant_count >= session.max_participants;

            return (
              <Card key={session.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{session.title}</h3>
                    <p className="text-blue-600 text-sm">{session.activity_name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${isFull
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                    }`}>
                    {session.participant_count}/{session.max_participants || '∞'} Registered
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{session.description}</p>

                <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-6">
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

                <Button
                  onClick={() => handleRegister(session.id)}
                  disabled={isFull || (isRegistering && registeringId === session.id)}
                >
                  {isRegistering && registeringId === session.id ? 'Registering...' : isFull ? 'Session Full' : 'Enregistrer'}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
