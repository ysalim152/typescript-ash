import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/card';
import { Loader, ArrowUpDown, Download, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMembers, getAllMembers, updateMemberRole, deleteMember, Member, PaginatedMembersResponse } from './memberApi';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

type SortConfig = {
  key: 'last_name' | 'email' | 'created_at';
  direction: 'asc' | 'desc';
};

const ROLES = ['member', 'coach', 'admin'];

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

export function Members() {
  const { user: currentUser, token } = useAuth();
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to first page on new search
    }, 500); // 500ms delay

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['members', page, debouncedSearchTerm, sortConfig],
    queryFn: () => {
      if (!token) {
        // Retourner une structure de données cohérente
        return Promise.resolve({ members: [], totalPages: 0, currentPage: 1 });
      }
      return getMembers(token, page, 10, debouncedSearchTerm, sortConfig.key, sortConfig.direction);
    },
    enabled: !!token,
    keepPreviousData: true, // Garde les données précédentes affichées pendant le chargement des nouvelles
  });

  const members = data?.members;
  const totalPages = data?.totalPages;

  const { mutate: handleRoleChange, isPending: isUpdatingRole, variables: updatingRoleVars } = useMutation<
    Member, Error, { memberId: number; role: string }, { previousData: PaginatedMembersResponse | undefined }
  >({
    mutationFn: ({ memberId, role }) => {
      if (!token) throw new Error("Non authentifié");
      return updateMemberRole({ memberId, role, token });
    },
    onMutate: async ({ memberId, role }) => {
      await queryClient.cancelQueries({ queryKey: ['members', page, debouncedSearchTerm, sortConfig] });
      const previousData = queryClient.getQueryData<PaginatedMembersResponse>(['members', page, debouncedSearchTerm, sortConfig]);

      queryClient.setQueryData<PaginatedMembersResponse | undefined>(['members', page, debouncedSearchTerm, sortConfig], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          members: oldData.members.map((member: Member) =>
            member.id === memberId ? { ...member, role } : member
          ),
        };
      });
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['members', page, debouncedSearchTerm, sortConfig], context.previousData);
      }
      toast.error("Échec de la mise à jour du rôle.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['members', page, debouncedSearchTerm, sortConfig] });
    },
  });

  const { mutate: handleDeleteMember, isPending: isDeletingMember } = useMutation<
    void, Error, number, { previousData: PaginatedMembersResponse | undefined }
  >({
    mutationFn: (memberId: number) => {
      if (!token) throw new Error("Non authentifié");
      return deleteMember({ memberId, token });
    },
    onMutate: async (memberId: number) => {
      await queryClient.cancelQueries({ queryKey: ['members', page, debouncedSearchTerm, sortConfig] });
      const previousData = queryClient.getQueryData<PaginatedMembersResponse>(['members', page, debouncedSearchTerm, sortConfig]);

      queryClient.setQueryData<PaginatedMembersResponse | undefined>(['members', page, debouncedSearchTerm, sortConfig], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          members: oldData.members.filter((member: Member) => member.id !== memberId),
        };
      });
      setMemberToDelete(null);
      return { previousData };
    },
    onSuccess: () => {
      toast.success("Membre supprimé avec succès !");
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['members', page, debouncedSearchTerm, sortConfig], context.previousData);
      }
      toast.error("Échec de la suppression du membre.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    }
  });

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key && prevConfig.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleExport = async () => {
    if (!token) {
      toast.error("Vous n'êtes pas authentifié.");
      return;
    }
    setIsExporting(true);
    toast.loading('Préparation de l\'exportation...');

    try {
      const allMembers = await getAllMembers(token);
      const dataToExport = allMembers.map(member => ({
        'Prénom': member.first_name,
        'Nom': member.last_name,
        'Email': member.email,
        'Rôle': member.role,
        'Date d\'inscription': new Date(member.created_at).toLocaleDateString(),
      }));

      const csv = Papa.unparse(dataToExport);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `membres_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.dismiss();
      toast.success('Exportation réussie !');
    } catch (error) {
      toast.dismiss();
      toast.error('Échec de l\'exportation.');
    } finally {
      setIsExporting(false);
    }
  };

  const SortableHeader = ({ columnKey, title }: { columnKey: SortConfig['key'], title: string }) => (
    <th className="px-6 py-3 text-left text-sm font-semibold">
      <button className="flex items-center gap-2" onClick={() => handleSort(columnKey)}>
        {title}
        <ArrowUpDown size={14} className={sortConfig.key === columnKey ? 'text-gray-900' : 'text-gray-400'} />
      </button>
    </th>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Membres</h1>
        <div className="flex items-center gap-4">
          <div className="w-full max-w-xs">
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleExport} disabled={isExporting}>
            <Download size={16} className="mr-2" />
            {isExporting ? 'Exportation...' : 'Exporter en CSV'}
          </Button>
        </div>
      </div>

      {memberToDelete && (
        <ConfirmationDialog
          title="Confirmer la suppression"
          message={`Êtes-vous sûr de vouloir supprimer le membre "${memberToDelete.first_name} ${memberToDelete.last_name}" ? Cette action est irréversible.`}
          onConfirm={() => handleDeleteMember(memberToDelete.id)}
          onCancel={() => setMemberToDelete(null)}
          isPending={isDeletingMember}
        />
      )}

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
                  <SortableHeader columnKey="last_name" title="Nom" />
                  <SortableHeader columnKey="email" title="Email" />
                  <th className="px-6 py-3 text-left text-sm font-semibold">Rôle</th>
                  <SortableHeader columnKey="created_at" title="Rejoint le" />
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{member.first_name} {member.last_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                    <td className="px-6 py-4">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange({ memberId: member.id, role: e.target.value })}
                        disabled={isUpdatingRole && updatingRoleVars?.memberId === member.id || member.id === currentUser?.id}
                        className="capitalize bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm border-transparent focus:border-blue-500 focus:ring-0"
                      >
                        {ROLES.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {member.id !== currentUser?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setMemberToDelete(member)}
                          disabled={isDeletingMember && memberToDelete?.id === member.id}
                        ><Trash2 size={16} /></Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between p-4 border-t">
              <Button
                onClick={() => setPage(old => Math.max(old - 1, 1))}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <span className="text-sm">
                Page {page} sur {totalPages || '...'}
              </span>
              <Button
                onClick={() => setPage(old => (data && !data.members.length ? old : old + 1))}
                disabled={page === totalPages || !members?.length}
              >
                Suivant
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
