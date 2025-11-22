import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ClienteForm } from '@/components/clientes/ClienteForm';
import { ClientesList } from '@/components/clientes/ClientesList';
import { ClientesPagination } from '@/components/clientes/ClientesPagination';
import { useClientes, Cliente, ClienteFormData } from '@/hooks/useClientes';

export default function Clientes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const openNew = searchParams.get('new');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    clientes,
    loading,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
  } = useClientes();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    fetchClientes(value);
  };

  useEffect(() => {
    if (openNew === 'true') {
      handleOpenDialog();
      searchParams.delete('new');
      setSearchParams(searchParams);
    }
  }, [openNew]);

  const handleSubmit = async (data: ClienteFormData) => {
    let success: boolean;
    
    if (editingCliente) {
      success = await updateCliente(editingCliente.id, data);
    } else {
      success = await createCliente(data);
    }

    if (success) {
      setIsDialogOpen(false);
      setEditingCliente(undefined);
    }
    
    return success;
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteCliente(id);
  };

  const handleOpenDialog = () => {
    setEditingCliente(undefined);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCliente(undefined);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie os clientes da sua empresa
            </p>
          </div>
          <Button onClick={handleOpenDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF ou e-mail..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {clientes.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {clientes.length} {clientes.length === 1 ? 'cliente' : 'clientes'}
            </div>
          )}
        </div>

        <ClientesList
          clientes={clientes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={loading}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
              <DialogDescription>
                {editingCliente
                  ? 'Atualize as informações do cliente'
                  : 'Preencha os dados para cadastrar um novo cliente'}
              </DialogDescription>
            </DialogHeader>
            <ClienteForm
              cliente={editingCliente}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
              isLoading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
