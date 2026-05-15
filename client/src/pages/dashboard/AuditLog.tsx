import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/card';
import { Loader, ArrowUpDown, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getAuditLogs } from '../../api/auditLogApi';
import { Button } from '../../components/ui/button';

type SortConfig = {
  key: 'user_name' | 'action_type' | 'created_at';
  direction: 'asc' | 'desc';
};

export function AuditLog() {
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['audit-logs', page, sortConfig],
    queryFn: () => {
      if (!token) {
        // Retourner une structure de données cohérente
        return Promise.resolve({ logs: [], totalPages: 0, currentPage: 1 });
      }
      return getAuditLogs(token, page, 15, sortConfig.key, sortConfig.direction);
    },
    enabled: !!token,
    placeholderData: keepPreviousData,
  });

  const logs = data?.logs;
  const totalPages = data?.totalPages;

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
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
    return <div className="flex justify-center items-center h-64"><Loader className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold">Journal d'audit</h1>
        {isFetching && (
          <RefreshCw size={18} className="animate-spin text-gray-500" />
        )}
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="bg-gray-50">
                <SortableHeader columnKey="created_at" title="Date" />
                <SortableHeader columnKey="user_name" title="Utilisateur" />
                <SortableHeader columnKey="action_type" title="Action" />
                <th className="px-6 py-3 text-left text-sm font-semibold">Cible</th>
              </tr>
            </thead>
            <tbody>
              {logs && logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4">{log.user_name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono">{log.action_type}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.target_descriptor}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-gray-500">
                    Aucun journal d'audit trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex items-center justify-between p-4 border-t">
            <Button onClick={() => setPage(old => Math.max(old - 1, 1))} disabled={page === 1}>
              Précédent
            </Button>
            <span className="text-sm">Page {page} sur {totalPages || '...'}</span>
            <Button onClick={() => setPage(old => (data && !data.logs.length ? old : old + 1))} disabled={page === totalPages || !logs?.length}>
              Suivant
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}