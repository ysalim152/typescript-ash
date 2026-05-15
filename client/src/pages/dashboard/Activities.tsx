import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Loader, Plus, Trash2, Pencil } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActivities, createActivity, deleteActivity, updateActivity, Activity, NewActivityData } from '../../api/activityApi';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import toast from 'react-hot-toast';

const ActivityForm = ({ onCancel, isPending, onSubmit, initialData }: { onCancel: () => void, isPending: boolean, onSubmit: (data: NewActivityData) => void, initialData?: Activity | null }) => {
  const [formData, setFormData] = useState({ name: '', description: '', color: '#4F46E5' });

  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        color: initialData.color,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      description: formData.description || null,
      color: formData.color,
    });
  };

  return (
    <Card className="p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-bold">{isEditMode ? 'Edit Activity' : 'Create New Activity'}</h2>
        <div>
          <Label htmlFor="name">Activity Name</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
        </div>
        <div>
          <Label htmlFor="color">Color</Label>
          <Input id="color" name="color" type="color" value={formData.color} onChange={handleChange} className="w-24" />
        </div>
        <div className="flex gap-4">
          <Button type="submit" disabled={isPending}>{isPending ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create')}</Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
};

const ConfirmationDialog = ({ title, message, onConfirm, onCancel, isPending }: { title: string, message: string, onConfirm: () => void, onCancel: () => void, isPending: boolean }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <Card className="p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? 'Suppression...' : 'Confirmer'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export function ActivitiesList() {
  const { token } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const queryClient = useQueryClient();

  const { data: activities, isLoading: loading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => {
      if (!token) return Promise.resolve([]);
      return getActivities(token);
    },
    enabled: !!token,
  });

  const { mutate: handleCreate, isPending: isCreating } = useMutation({
    mutationFn: (newActivity: NewActivityData) => {
      if (!token) throw new Error('Authentication token is missing.');
      return createActivity({ activityData: newActivity, token });
    },
    onSuccess: () => {
      toast.success('Activity created successfully!');
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      setShowForm(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: handleUpdate, isPending: isUpdating } = useMutation({
    mutationFn: (data: NewActivityData) => {
      if (!token || !activityToEdit) throw new Error('An error occurred.');
      return updateActivity({ activityId: activityToEdit.id, activityData: data, token });
    },
    onSuccess: () => {
      toast.success('Activity updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      setActivityToEdit(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: handleDelete, isPending: isDeleting } = useMutation<void, Error, number, { previousActivities: Activity[] | undefined }>({
    mutationFn: (activityId: number) => {
      if (!token) throw new Error('Authentication token is missing.');
      return deleteActivity({ activityId, token });
    },
    onMutate: async (activityId: number) => {
      await queryClient.cancelQueries({ queryKey: ['activities'] });
      const previousActivities = queryClient.getQueryData<Activity[]>(['activities']);
      queryClient.setQueryData<Activity[]>(['activities'], (old) => old?.filter(a => a.id !== activityId));
      setActivityToDelete(null);
      return { previousActivities };
    },
    onSuccess: () => {
      toast.success('Activité supprimée avec succès !');
    },
    onError: (err, variables, context) => {
      toast.error(err.message);
      if (context?.previousActivities) {
        queryClient.setQueryData(['activities'], context.previousActivities);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const handleFormSubmit = (data: NewActivityData) => {
    if (activityToEdit) {
      handleUpdate(data);
    } else {
      handleCreate(data);
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Activities</h1>
        <Button onClick={() => { setShowForm(!showForm); setActivityToEdit(null); }}>
          <Plus size={16} className="mr-2" />
          {showForm || activityToEdit ? 'Cancel' : 'New Activity'}
        </Button>
      </div>

      {(showForm || activityToEdit) && <ActivityForm onCancel={() => { setShowForm(false); setActivityToEdit(null); }} isPending={isCreating || isUpdating} onSubmit={handleFormSubmit} initialData={activityToEdit} />}

      {activityToDelete && (
        <ConfirmationDialog
          title="Confirmer la suppression"
          message={`Êtes-vous sûr de vouloir supprimer l'activité "${activityToDelete.name}" ? Cette action est irréversible.`}
          onConfirm={() => handleDelete(activityToDelete.id)}
          onCancel={() => setActivityToDelete(null)}
          isPending={isDeleting}
        />
      )}

      {!activities || activities.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600">No activities found.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => {
            return (
              <Card key={activity.id} className="p-6 flex flex-col">
                <div className="flex-grow">
                  <div
                    className="w-12 h-12 rounded-lg mb-4"
                    style={{ backgroundColor: activity.color }}
                  />
                  <h3 className="text-xl font-bold">{activity.name}</h3>
                  <p className="text-gray-600 text-sm mt-2">{activity.description}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setActivityToEdit(activity); setShowForm(false); }}>
                    <Pencil size={16} className="mr-2" /> Modifier
                  </Button>
                  <Button
                    variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setActivityToDelete(activity)}
                  >
                    <Trash2 size={16} className="mr-2" /> Supprimer
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
