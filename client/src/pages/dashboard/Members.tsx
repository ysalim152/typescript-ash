import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/card';
import { Loader } from 'lucide-react';

interface Member {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

export function Members() {
  const { token } = useAuth();
  const { data: members, loading } = useFetch<Member[]>('/api/members', token);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Members</h1>

      {!members || members.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600">Aucun membre trouvé.</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold">Nom</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Rôle</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Rejoint</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{member.first_name} {member.last_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                    <td className="px-6 py-4">
                      <span className="capitalize bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
