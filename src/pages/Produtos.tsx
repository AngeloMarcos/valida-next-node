import { useEffect, useState } from 'react';
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
import { Plus, Search, Filter } from 'lucide-react';
import { useProdutos, Produto, ProdutoFormData, ProdutoFilters } from '@/hooks/useProdutos';
import { useBancosSelect } from '@/hooks/useBancosSelect';
import { ProdutoForm } from '@/components/produtos/ProdutoForm';
import { ProdutosList } from '@/components/produtos/ProdutosList';
import { ProdutosPagination } from '@/components/produtos/ProdutosPagination';

export default function Produtos() {
  const {
    loading,
    fetchProdutos,
    createProduto,
    updateProduto,
    deleteProduto,
  } = useProdutos();

  const { bancos } = useBancosSelect();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bancoFilter, setBancoFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | undefined>();

  useEffect(() => {
    const loadProdutos = async () => {
      const result = await fetchProdutos(1, 100, {
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        banco_id: bancoFilter !== 'all' ? bancoFilter : undefined,
      });
      setProdutos(result.data);
    };
    loadProdutos();
  }, [searchTerm, statusFilter, bancoFilter]);

  const handleCreate = () => {
    setEditingProduto(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: ProdutoFormData) => {
    let success = false;

    if (editingProduto) {
      success = await updateProduto(editingProduto.id, data);
    } else {
      success = await createProduto(data);
    }

    if (success) {
      setIsDialogOpen(false);
      setEditingProduto(undefined);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteProduto(id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestão de Produtos</h2>
            <p className="text-muted-foreground">
              Gerencie os produtos financeiros do sistema
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={bancoFilter} onValueChange={setBancoFilter}>
              <SelectTrigger className="w-[200px]">
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

            {(searchTerm || statusFilter !== 'all' || bancoFilter !== 'all') && (
              <Button variant="outline" size="sm" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setBancoFilter('all');
              }}>
                Limpar Filtros
              </Button>
            )}
          </div>
        </div>

        <ProdutosList
          produtos={produtos}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={() => {}}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingProduto ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do produto abaixo. Campos com * são obrigatórios.
              </DialogDescription>
            </DialogHeader>
            <ProdutoForm
              produto={editingProduto}
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
