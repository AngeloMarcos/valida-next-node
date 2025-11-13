import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Proposta } from '@/hooks/usePropostas';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Eye, Building2, CreditCard, User } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PropostaKanbanCardProps {
  proposta: Proposta;
  onEdit: (proposta: Proposta) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

export function PropostaKanbanCard({
  proposta,
  onEdit,
  onDelete,
  isDragging = false,
}: PropostaKanbanCardProps) {
  const navigate = useNavigate();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: proposta.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleDelete = () => {
    if (confirm(`Tem certeza que deseja excluir a proposta de "${proposta.clientes?.nome || 'Cliente'}"?`)) {
      onDelete(proposta.id);
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow',
        (isDragging || isSortableDragging) && 'opacity-50 shadow-xl'
      )}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-semibold text-foreground">
                {proposta.clientes?.nome || 'Sem cliente'}
              </span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(proposta.valor)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{proposta.bancos?.nome || 'Sem banco'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{proposta.produtos?.nome || 'Sem produto'}</span>
          </div>
        </div>

        {proposta.finalidade && (
          <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/50 p-2 rounded">
            {proposta.finalidade}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            {format(new Date(proposta.data), 'dd/MM/yyyy')}
          </span>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/propostas/${proposta.id}`);
              }}
              title="Ver Detalhes"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(proposta);
              }}
              title="Editar"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              title="Excluir"
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}