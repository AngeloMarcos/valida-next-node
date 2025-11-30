import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
import { Plus, Search, Filter, LayoutList, Kanban, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { usePropostas, Proposta, PropostaFormData, PropostaFilters } from '@/hooks/usePropostas';
import { useBancosSelect } from '@/hooks/useBancosSelect';
import { PropostaForm } from '@/components/propostas/PropostaForm';
import { PropostaFormDynamic } from '@/components/propostas/PropostaFormDynamic';
import { PropostasList } from '@/components/propostas/PropostasList';
import { PropostasPagination } from '@/components/propostas/PropostasPagination';
import { PropostasKanban } from '@/components/propostas/PropostasKanban';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Propostas() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [consultorFilter, setConsultorFilter] = useState<string>('all');

  const loadPropostas = async (page: number = currentPage, size: number = pageSize, skipPagination: boolean = false) => {
    const filters: PropostaFilters = {
      search: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      banco_id: bancoFilter !== 'all' ? bancoFilter : undefined,
      tipo_proposta: tipoFilter !== 'all' ? (tipoFilter as 'credito' | 'consorcio' | 'seguro') : undefined,
    };

    // Para o Kanban, carregar todas as propostas sem paginação
    const result = skipPagination 
      ? await fetchPropostas(1, 1000, filters)
      : await fetchPropostas(page, size, filters);
    
    setPropostas(result.data);
    setTotalItems(result.count);
    setTotalPages(result.totalPages);
  };

  useEffect(() => {
    // Se estiver em modo kanban, carregar todas as propostas
    const skipPagination = viewMode === 'kanban';
    loadPropostas(currentPage, pageSize, skipPagination);
  }, [currentPage, pageSize, searchTerm, statusFilter, bancoFilter, tipoFilter, viewMode]);

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
    setTipoFilter('all');
    setDataInicio('');
    setDataFim('');
    setConsultorFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || bancoFilter !== 'all' || tipoFilter !== 'all' || dataInicio || dataFim || consultorFilter !== 'all';

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
          <Button onClick={() => navigate('/propostas/criar')}>
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

            <div className="flex gap-2 items-center flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente, banco ou produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                    {hasActiveFilters && (
                      <span className="ml-2 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os status</SelectItem>
                          <SelectItem value="em_analise">Em Análise</SelectItem>
                          <SelectItem value="doc_pendente">Doc. Pendente</SelectItem>
                          <SelectItem value="em_processamento">Em Processamento</SelectItem>
                          <SelectItem value="aprovada">Aprovada</SelectItem>
                          <SelectItem value="recusada">Recusada</SelectItem>
                          <SelectItem value="cancelada">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Banco</Label>
                      <Select value={bancoFilter} onValueChange={setBancoFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os bancos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os bancos</SelectItem>
                          {bancos.map((banco) => (
                            <SelectItem key={banco.value} value={banco.value}>
                              {banco.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo de Produto</Label>
                      <Select value={tipoFilter} onValueChange={setTipoFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os tipos</SelectItem>
                          <SelectItem value="credito">Crédito</SelectItem>
                          <SelectItem value="consorcio">Consórcio</SelectItem>
                          <SelectItem value="seguro">Seguro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Data Início</Label>
                      <Input
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Data Fim</Label>
                      <Input
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                      />
                    </div>

                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        onClick={handleClearFilters}
                        className="w-full"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Limpar Filtros
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProposta ? 'Editar Proposta' : 'Nova Proposta'}
              </DialogTitle>
              <DialogDescription>
                {editingProposta
                  ? 'Atualize os dados da proposta'
                  : 'Preencha os dados para criar uma nova proposta'}
              </DialogDescription>
            </DialogHeader>
            <PropostaFormDynamic
              onSuccess={() => {
                handleDialogClose(false);
                loadPropostas();
              }}
              onCancel={() => handleDialogClose(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
