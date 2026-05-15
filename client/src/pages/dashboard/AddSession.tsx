import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createSession, NewSessionData } from '../../api/sessionApi';
import { getActivities } from '../../api/activityApi';
import toast from 'react-hot-toast';

export function AddSession() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    activityId: '',
    title: '',
    description: '',
    sessionDate: '',
    durationMinutes: '',
    location: '',
    maxParticipants: ''
  });

  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['activities'],
    queryFn: () => {
      if (!token) return Promise.resolve([]);
      return getActivities(token);
    },
    enabled: !!token,
  });

  const { mutate: handleCreateSession, isPending } = useMutation({
    mutationFn: (sessionData: NewSessionData) => {
      if (!token) throw new Error('Authentication token is missing.');
      return createSession({ sessionData, token });
    },
    onSuccess: () => {
      toast.success('Session created successfully!');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      navigate('/dashboard/planning');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sessionData: NewSessionData = {
      activityId: Number(formData.activityId),
      title: formData.title,
      description: formData.description,
      sessionDate: new Date(formData.sessionDate).toISOString(),
      durationMinutes: formData.durationMinutes ? Number(formData.durationMinutes) : null,
      location: formData.location,
      maxParticipants: formData.maxParticipants ? Number(formData.maxParticipants) : null,
    };
    
    handleCreateSession(sessionData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8">
        <h1 className="text-2xl font-bold mb-6">Create New Session</h1>

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
              {isLoadingActivities ? <option>Loading...</option> : activities?.map(activity => (
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

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Session'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
