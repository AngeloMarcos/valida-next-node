import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  useActivityLog,
  type ActivityLog as ActivityLogType,
  type ActivityLogFilters as Filters,
} from '@/hooks/useActivityLog';
import { ActivityLogList } from '@/components/activity/ActivityLogList';
import { ActivityLogFilters } from '@/components/activity/ActivityLogFilters';
import { ActivityLogPagination } from '@/components/activity/ActivityLogPagination';
import { useRequireAnyRole } from '@/hooks/useRequireRole';

export default function ActivityLog() {
  const { hasAnyRole, loading: authLoading } = useRequireAnyRole(['admin', 'supervisor']);
  const { loading, fetchLogs, fetchUsers } = useActivityLog();

  const [logs, setLogs] = useState<ActivityLogType[]>([]);
  const [users, setUsers] = useState<Array<{ user_id: string; user_name: string; user_email: string }>>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [filters, setFilters] = useState<Filters>({});

  const loadLogs = async (page: number = currentPage, size: number = pageSize) => {
    const result = await fetchLogs(page, size, filters);
    setLogs(result.data);
    setTotalItems(result.count);
    setTotalPages(result.totalPages);
  };

  const loadUsers = async () => {
    const result = await fetchUsers();
    setUsers(result);
  };

  useEffect(() => {
    if (!authLoading && hasAnyRole) {
      loadLogs();
      loadUsers();
    }
  }, [currentPage, pageSize, filters, authLoading, hasAnyRole]);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (authLoading) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Log de Atividades</h2>
          <p className="text-muted-foreground">
            Visualize todas as atividades realizadas no sistema
          </p>
        </div>

        <ActivityLogFilters onFilterChange={handleFilterChange} users={users} />

        <ActivityLogList logs={logs} loading={loading} />

        {totalItems > 0 && (
          <ActivityLogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
