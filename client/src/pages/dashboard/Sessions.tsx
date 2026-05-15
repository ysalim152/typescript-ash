import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Loader } from 'lucide-react';
import { useState } from 'react';

interface Session {
  id: number;
  title: string;
  description: string | null;
  session_date: string;
  duration_minutes: number | null;
  location: string | null;
  activity_name: string;
  participant_count: number;
  max_participants: number | null;
}

export function Sessions() {
  const { token } = useAuth();
  const { data: sessions, loading, refetch } = useFetch<Session[]>('/api/sessions', token);
  const [registeringId, setRegisteringId] = useState<number | null>(null);

  const handleRegister = async (sessionId: number) => {
    if (!token) return;
    setRegisteringId(sessionId);

    try {
      const response = await fetch(`/api/sessions/${sessionId}/register`, {
        method: 'POST',
        headers: { 'x-auth-token': token }
      });

      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setRegisteringId(null);
    }
  };

  if (loading) {
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
                  disabled={isFull || registeringId === session.id}
                >
                  {registeringId === session.id ? 'Registering...' : isFull ? 'Session Full' : 'Enregistrer'}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
