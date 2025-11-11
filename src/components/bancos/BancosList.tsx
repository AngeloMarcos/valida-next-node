import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Building2 } from 'lucide-react';
import { Banco } from '@/hooks/useBancos';
import { format } from 'date-fns';

interface BancosListProps {
  bancos: Banco[];
  loading: boolean;
  onEdit: (banco: Banco) => void;
  onDelete: (id: string) => void;
}

export function BancosList({ bancos, loading, onEdit, onDelete }: BancosListProps) {
  const handleDelete = (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir o banco "${nome}"?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Building2 className="h-4 w-4" />
            </TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Cadastrado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-32">
                Carregando...
              </TableCell>
            </TableRow>
          ) : bancos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-32">
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Building2 className="h-8 w-8" />
                  <p>Nenhum banco encontrado</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            bancos.map((banco) => (
              <TableRow key={banco.id}>
                <TableCell>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </TableCell>
                <TableCell className="font-medium">{banco.nome}</TableCell>
                <TableCell className="text-muted-foreground">
                  {banco.cnpj || '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {banco.email || '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {banco.telefone || '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(banco.created_at), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(banco)}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(banco.id, banco.nome)}
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
