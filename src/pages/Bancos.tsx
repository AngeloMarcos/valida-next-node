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
import { useBancos, Banco, BancoFormData } from '@/hooks/useBancos';
import { BancoForm } from '@/components/bancos/BancoForm';
import { BancosList } from '@/components/bancos/BancosList';
import { BancosPagination } from '@/components/bancos/BancosPagination';

export default function Bancos() {
  const {
    loading,
    fetchBancos,
    createBanco,
    updateBanco,
    deleteBanco,
    searchBancos,
  } = useBancos();

  const [bancos, setBancos] = useState<Banco[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanco, setEditingBanco] = useState<Banco | undefined>();

  const loadBancos = async (page: number = currentPage, size: number = pageSize) => {
    const result = await fetchBancos(page, size);
    setBancos(result.data);
    setTotalItems(result.count);
    setTotalPages(result.totalPages);
  };

  useEffect(() => {
    loadBancos();
  }, [currentPage, pageSize]);

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      const results = await searchBancos(searchTerm);
      setBancos(results);
      setTotalItems(results.length);
      setTotalPages(1);
      setCurrentPage(1);
    } else {
      loadBancos(1, pageSize);
      setCurrentPage(1);
    }
  };

  const handleCreate = () => {
    setEditingBanco(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (banco: Banco) => {
    setEditingBanco(banco);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: BancoFormData) => {
    let success = false;
    
    if (editingBanco) {
      success = await updateBanco(editingBanco.id, data);
    } else {
      success = await createBanco(data);
    }

    if (success) {
      setIsDialogOpen(false);
      setEditingBanco(undefined);
      loadBancos();
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteBanco(id);
    if (success) {
      loadBancos();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestão de Bancos</h2>
            <p className="text-muted-foreground">
              Gerencie os bancos parceiros do sistema
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Banco
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CNPJ ou e-mail..."
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

        <BancosList
          bancos={bancos}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {totalItems > 0 && (
          <BancosPagination
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
                {editingBanco ? 'Editar Banco' : 'Novo Banco'}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do banco abaixo. Campos com * são obrigatórios.
              </DialogDescription>
            </DialogHeader>
            <BancoForm
              banco={editingBanco}
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
