import { useFetch } from '../../hooks/useFetch';
import { Card } from '../../components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Loader } from 'lucide-react';
import { Session } from '../../types';

export function Activities() {
  const { data: sessions, loading, error } = useFetch<Session[]>('/api/sessions');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Activités et séances</h1>
        <p className="text-gray-600">Consultez les sessions de formation à venir et inscrivez-vous.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {!sessions || sessions.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600 mb-4">Aucune session disponible pour le moment.</p>
          <p className="text-sm text-gray-500">Revenez bientôt pour découvrir les nouvelles activités !</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {sessions.map((session) => (
            <Card key={session.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{session.title}</h3>
                  <p className="text-blue-600 font-semibold text-sm">{session.activity_name}</p>
                </div>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {session.participant_count}/{session.max_participants || '∞'} Participants
                </span>
              </div>

              <p className="text-gray-600 mb-4">{session.description}</p>

              <div className="grid md:grid-cols-2 gap-4 mb-6 text-sm text-gray-600">
                <div>
                  <p className="font-semibold text-gray-900">Date & Time</p>
                  <p>{new Date(session.session_date).toLocaleString()}</p>
                </div>
                {session.location && (
                  <div>
                    <p className="font-semibold text-gray-900">Location</p>
                    <p>{session.location}</p>
                  </div>
                )}
                {session.duration_minutes && (
                  <div>
                    <p className="font-semibold text-gray-900">Duration</p>
                    <p>{session.duration_minutes} minutes</p>
                  </div>
                )}
              </div>

              <Link to={`/activities/${session.id}`}>
                <Button>View Details</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
