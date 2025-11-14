import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Search, Filter, LayoutList, Kanban } from 'lucide-react';
import { usePropostas, Proposta, PropostaFormData, PropostaFilters } from '@/hooks/usePropostas';
import { useBancosSelect } from '@/hooks/useBancosSelect';
import { PropostaForm } from '@/components/propostas/PropostaForm';
import { PropostasList } from '@/components/propostas/PropostasList';
import { PropostasPagination } from '@/components/propostas/PropostasPagination';
import { PropostasKanban } from '@/components/propostas/PropostasKanban';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Propostas() {
  const [searchParams, setSearchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const openNew = searchParams.get('new');

  const {
    loading,
    fetchPropostas,
    getPropostaById,
    createProposta,
    updateProposta,
    deleteProposta,
    updatePropostaStatus,
  } = usePropostas();

  const { bancos } = useBancosSelect();

  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProposta, setEditingProposta] = useState<Proposta | undefined>();

  // View mode
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bancoFilter, setBancoFilter] = useState<string>('all');

  const loadPropostas = async (page: number = currentPage, size: number = pageSize) => {
    const filters: PropostaFilters = {
      search: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      banco_id: bancoFilter !== 'all' ? bancoFilter : undefined,
    };

    const result = await fetchPropostas(page, size, filters);
    setPropostas(result.data);
    setTotalItems(result.count);
    setTotalPages(result.totalPages);
  };

  useEffect(() => {
    loadPropostas();
  }, [currentPage, pageSize, searchTerm, statusFilter, bancoFilter]);

  useEffect(() => {
    if (editId) {
      handleEditFromUrl(editId);
    } else if (openNew === 'true') {
      handleCreate();
      searchParams.delete('new');
      setSearchParams(searchParams);
    }
  }, [editId, openNew]);

  const handleEditFromUrl = async (id: string) => {
    const proposta = await getPropostaById(id);
    if (proposta) {
      setEditingProposta(proposta);
      setIsDialogOpen(true);
    }
  };

  const handleCreate = () => {
    setEditingProposta(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (proposta: Proposta) => {
    setEditingProposta(proposta);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: PropostaFormData) => {
    let success = false;

    if (editingProposta) {
      success = await updateProposta(editingProposta.id, data);
    } else {
      const result = await createProposta(data);
      success = !!result;
    }

    if (success) {
      setIsDialogOpen(false);
      setEditingProposta(undefined);
      searchParams.delete('edit');
      setSearchParams(searchParams);
      loadPropostas();
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteProposta(id);
    if (success) {
      loadPropostas();
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const success = await updatePropostaStatus(id, status);
    if (success) {
      loadPropostas();
    }
    return success;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setBancoFilter('all');
    setCurrentPage(1);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      searchParams.delete('edit');
      setSearchParams(searchParams);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestão de Propostas</h2>
            <p className="text-muted-foreground">
              Gerencie as propostas comerciais do sistema
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Proposta
          </Button>
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'kanban')} className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="list" className="gap-2">
                <LayoutList className="h-4 w-4" />
                Lista
              </TabsTrigger>
              <TabsTrigger value="kanban" className="gap-2">
                <Kanban className="h-4 w-4" />
                Kanban
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-[250px]"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos status</SelectItem>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="reprovada">Reprovada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>

              <Select value={bancoFilter} onValueChange={setBancoFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Banco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos bancos</SelectItem>
                  {bancos.map((banco) => (
                    <SelectItem key={banco.value} value={banco.value}>
                      {banco.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(searchTerm || statusFilter !== 'all' || bancoFilter !== 'all') && (
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Limpar
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="list" className="space-y-4">
            <PropostasList
              propostas={propostas}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {totalItems > 0 && (
              <PropostasPagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </TabsContent>

          <TabsContent value="kanban">
            <PropostasKanban
              propostas={propostas}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProposta ? 'Editar Proposta' : 'Nova Proposta'}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados da proposta abaixo. Campos com * são obrigatórios.
              </DialogDescription>
            </DialogHeader>
            <PropostaForm
              proposta={editingProposta}
              onSubmit={handleSubmit}
              onCancel={() => handleDialogClose(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
