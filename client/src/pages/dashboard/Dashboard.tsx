import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Users, Zap, Settings, History } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  const isAdmin = user.role === 'admin';
  const isCoach = user.role === 'coach';

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Welcome, {user.first_name}!</h1>
        <p className="text-gray-600">Gérez vos activités et vos séances</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <Calendar className="w-8 h-8 text-blue-600 mb-4" />
          <h3 className="font-bold text-lg">Upcoming Sessions</h3>
          <p className="text-gray-600 text-sm">Consultez vos séances enregistrées</p>
        </Card>
        <Card className="p-6">
          <Users className="w-8 h-8 text-blue-600 mb-4" />
          <h3 className="font-bold text-lg">Community</h3>
          <p className="text-gray-600 text-sm">Connectez-vous avec d'autres membres</p>
        </Card>
        <Card className="p-6">
          <Zap className="w-8 h-8 text-blue-600 mb-4" />
          <h3 className="font-bold text-lg">Progress</h3>
          <p className="text-gray-600 text-sm">Suivez votre parcours de remise en forme</p>
        </Card>
      </div>

      {/* Navigation */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Tableau de bord</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/dashboard/planning">
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="mr-2 w-4 h-4" />
              My Sessions
            </Button>
          </Link>

          <Link to="/dashboard/sessions">
            <Button variant="outline" className="w-full justify-start">
              <Zap className="mr-2 w-4 h-4" />
              Inscrivez-vous à la session
            </Button>
          </Link>

          {(isAdmin || isCoach) && (
            <Link to="/dashboard/add-session">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 w-4 h-4" />
                Créer une séance
              </Button>
            </Link>
          )}

          {isAdmin && (
            <>
              <Link to="/dashboard/members">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 w-4 h-4" />
                  Gérer les membres
                </Button>
              </Link>

              <Link to="/dashboard/activities">
                <Button variant="outline" className="w-full justify-start">
                  <Zap className="mr-2 w-4 h-4" />
                  Gérer les activités
                </Button>
              </Link>

              <Link to="/dashboard/audit-log">
                <Button variant="outline" className="w-full justify-start">
                  <History className="mr-2 w-4 h-4" />
                  Journal d'audit
                </Button>
              </Link>

              <Link to="/dashboard/settings">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 w-4 h-4" />
                  Paramètres
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Profile Information</h2>
        <div className="space-y-3 text-sm">
          <p><span className="font-semibold">Nom:</span> {user.first_name} {user.last_name}</p>
          <p><span className="font-semibold">Email:</span> {user.email}</p>
          <p><span className="font-semibold">Rôle:</span> <span className="capitalize bg-blue-100 text-blue-700 px-2 py-1 rounded">{user.role}</span></p>
        </div>
      </Card>
    </div>
  );
}
