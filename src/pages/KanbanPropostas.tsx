import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Plus, Search, Filter, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { usePropostas, Proposta, PropostaFilters } from '@/hooks/usePropostas';
import { useBancosSelect } from '@/hooks/useBancosSelect';
import { PropostasKanban } from '@/components/propostas/PropostasKanban';
import { Badge } from '@/components/ui/badge';

export default function KanbanPropostas() {
  const navigate = useNavigate();

  const {
    loading,
    fetchPropostas,
    deleteProposta,
    updatePropostaStatus,
  } = usePropostas();

  const { bancos } = useBancosSelect();

  const [propostas, setPropostas] = useState<Proposta[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bancoFilter, setBancoFilter] = useState<string>('all');
  const [tipoFilter, setTipoFilter] = useState<string>('all');

  const loadPropostas = async () => {
    const filters: PropostaFilters = {
      search: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      banco_id: bancoFilter !== 'all' ? bancoFilter : undefined,
      tipo_proposta: tipoFilter !== 'all' ? (tipoFilter as 'credito' | 'consorcio' | 'seguro' | 'cartao_credito') : undefined,
    };

    // Carregar todas as propostas para o Kanban (sem paginação)
    const result = await fetchPropostas(1, 1000, filters);
    setPropostas(result.data);
  };

  useEffect(() => {
    loadPropostas();
  }, [searchTerm, statusFilter, bancoFilter, tipoFilter]);

  const handleCreate = () => {
    navigate('/propostas/criar');
  };

  const handleEdit = (proposta: Proposta) => {
    navigate(`/propostas/${proposta.id}/detalhes`);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteProposta(id);
    if (success) {
      await loadPropostas();
    }
  };

  const handleStatusChange = async (id: string, newStatus: string): Promise<boolean> => {
    const success = await updatePropostaStatus(id, newStatus);
    if (success) {
      await loadPropostas();
    }
    return success;
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setBancoFilter('all');
    setTipoFilter('all');
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || bancoFilter !== 'all' || tipoFilter !== 'all';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kanban de Propostas</h1>
            <p className="text-muted-foreground mt-1">
              Gestão visual de vendas - Arraste e solte para mudar status
            </p>
          </div>
          <Button onClick={handleCreate} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Nova Proposta
          </Button>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por cliente, produto ou banco..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {[statusFilter !== 'all', bancoFilter !== 'all', tipoFilter !== 'all'].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filtros</h4>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="h-8 px-2"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Limpar
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
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
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {bancos.map((banco) => (
                        <SelectItem key={banco.value} value={banco.value}>
                          {banco.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Proposta</Label>
                  <Select value={tipoFilter} onValueChange={setTipoFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="credito">Crédito</SelectItem>
                      <SelectItem value="consorcio">Consórcio</SelectItem>
                      <SelectItem value="seguro">Seguro</SelectItem>
                      <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Kanban Board */}
        <PropostasKanban
          propostas={propostas}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      </div>
    </DashboardLayout>
  );
}
