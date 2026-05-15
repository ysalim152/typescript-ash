import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Loader, Plus } from 'lucide-react';
import { useState } from 'react';

interface Activity {
  id: number;
  name: string;
  description: string | null;
  color: string;
}

export function ActivitiesList() {
  const { token } = useAuth();
  const { data: activities, loading } = useFetch<Activity[]>('/api/activities', token);
  const [showForm, setShowForm] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Activities</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-2" />
          {showForm ? 'Cancel' : 'New Activity'}
        </Button>
      </div>

      {!activities || activities.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600">No activities found.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <Card key={activity.id} className="p-6">
              <div
                className="w-12 h-12 rounded-lg mb-4"
                style={{ backgroundColor: activity.color }}
              />
              <h3 className="text-xl font-bold">{activity.name}</h3>
              <p className="text-gray-600 text-sm mt-2">{activity.description}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
