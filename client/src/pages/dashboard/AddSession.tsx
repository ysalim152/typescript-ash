import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

interface Activity {
  id: number;
  name: string;
}

export function AddSession() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { data: activities } = useFetch<Activity[]>('/api/activities', token);

  const [formData, setFormData] = useState({
    activityId: '',
    title: '',
    description: '',
    sessionDate: '',
    durationMinutes: '',
    location: '',
    maxParticipants: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          activityId: Number(formData.activityId),
          title: formData.title,
          description: formData.description,
          sessionDate: formData.sessionDate,
          durationMinutes: formData.durationMinutes ? Number(formData.durationMinutes) : null,
          location: formData.location,
          maxParticipants: formData.maxParticipants ? Number(formData.maxParticipants) : null
        })
      });

      if (response.ok) {
        navigate('/dashboard/planning');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create session');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8">
        <h1 className="text-2xl font-bold mb-6">Create New Session</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="activityId">Activity</Label>
            <select
              id="activityId"
              name="activityId"
              value={formData.activityId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select an activity</option>
              {activities?.map(activity => (
                <option key={activity.id} value={activity.id}>{activity.name}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="title">Session Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <Label htmlFor="sessionDate">Date & Time</Label>
            <Input
              id="sessionDate"
              name="sessionDate"
              type="datetime-local"
              value={formData.sessionDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="durationMinutes">Duration (minutes)</Label>
              <Input
                id="durationMinutes"
                name="durationMinutes"
                type="number"
                value={formData.durationMinutes}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                name="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Session'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
