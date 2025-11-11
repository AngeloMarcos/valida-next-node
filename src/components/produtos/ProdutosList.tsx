import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Package } from 'lucide-react';
import { Produto } from '@/hooks/useProdutos';
import { format } from 'date-fns';

interface ProdutosListProps {
  produtos: Produto[];
  loading: boolean;
  onEdit: (produto: Produto) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

export function ProdutosList({
  produtos,
  loading,
  onEdit,
  onDelete,
  onStatusChange,
}: ProdutosListProps) {
  const handleDelete = (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${nome}"?`)) {
      onDelete(id);
    }
  };

  const handleStatusToggle = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
    onStatusChange(id, newStatus);
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Package className="h-4 w-4" />
            </TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo de Crédito</TableHead>
            <TableHead>Banco</TableHead>
            <TableHead>Taxa de Juros</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Cadastrado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-32">
                Carregando...
              </TableCell>
            </TableRow>
          ) : produtos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-32">
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Package className="h-8 w-8" />
                  <p>Nenhum produto encontrado</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            produtos.map((produto) => (
              <TableRow key={produto.id}>
                <TableCell>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </TableCell>
                <TableCell className="font-medium">{produto.nome}</TableCell>
                <TableCell className="text-muted-foreground">
                  {produto.tipo_credito || '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {produto.bancos?.nome || '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {produto.taxa_juros ? `${produto.taxa_juros}% a.m.` : '-'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={produto.status === 'ativo' ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => handleStatusToggle(produto.id, produto.status)}
                  >
                    {produto.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(produto.created_at), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(produto)}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(produto.id, produto.nome)}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
