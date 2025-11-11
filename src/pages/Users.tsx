import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Search } from 'lucide-react';
import { useUsers, User, UserFormData } from '@/hooks/useUsers';
import { UserForm } from '@/components/users/UserForm';
import { UsersList } from '@/components/users/UsersList';
import { UsersPagination } from '@/components/users/UsersPagination';
import { useRequireRole } from '@/hooks/useRequireRole';

export default function Users() {
  const { hasRole, loading: authLoading } = useRequireRole('admin');

  const {
    loading,
    fetchUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    sendPasswordReset,
  } = useUsers();

  const [users, setUsers] = useState<User[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();

  const loadUsers = async (page: number = currentPage, size: number = pageSize) => {
    const result = await fetchUsers(page, size);
    setUsers(result.data);
    setTotalItems(result.count);
    setTotalPages(result.totalPages);
  };

  useEffect(() => {
    if (!authLoading && hasRole) {
      loadUsers();
    }
  }, [currentPage, pageSize, authLoading, hasRole]);

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      const result = await fetchUsers(1, 1000, searchTerm);
      setUsers(result.data);
      setTotalItems(result.count);
      setTotalPages(1);
      setCurrentPage(1);
    } else {
      loadUsers(1, pageSize);
      setCurrentPage(1);
    }
  };

  const handleCreate = () => {
    setEditingUser(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: UserFormData) => {
    let success = false;
    
    if (editingUser) {
      success = await updateUser(editingUser.id, data);
    } else {
      success = await createUser(data);
    }

    if (success) {
      setIsDialogOpen(false);
      setEditingUser(undefined);
      loadUsers();
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const success = await toggleUserStatus(userId, currentStatus);
    if (success) {
      loadUsers();
    }
  };

  const handlePasswordReset = async (email: string) => {
    await sendPasswordReset(email);
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h2>
            <p className="text-muted-foreground">
              Gerencie os usuários e suas permissões no sistema
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button variant="secondary" onClick={handleSearch}>
            Buscar
          </Button>
        </div>

        <UsersList
          users={users}
          loading={loading}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onPasswordReset={handlePasswordReset}
        />

        {totalItems > 0 && (
          <UsersPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuário' : 'Convidar Usuário'}
              </DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? 'Atualize os dados do usuário abaixo. Campos com * são obrigatórios.'
                  : 'Convide um novo usuário para a plataforma. Um e-mail de convite será enviado.'}
              </DialogDescription>
            </DialogHeader>
            <UserForm
              user={editingUser}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
