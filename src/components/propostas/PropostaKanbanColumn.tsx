import { useDroppable } from '@dnd-kit/core';
import { Proposta } from '@/hooks/usePropostas';
import { PropostaKanbanCard } from './PropostaKanbanCard';
import { cn } from '@/lib/utils';

interface PropostaKanbanColumnProps {
  id: string;
  title: string;
  color: string;
  propostas: Proposta[];
  onEdit: (proposta: Proposta) => void;
  onDelete: (id: string) => void;
}

export function PropostaKanbanColumn({
  id,
  title,
  color,
  propostas,
  onEdit,
  onDelete,
}: PropostaKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const formatCurrency = (value: number | null) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const totalValue = propostas.reduce((sum, p) => sum + (p.valor || 0), 0);

  return (
    <div className="flex flex-col min-w-[320px] max-w-[320px]">
      <div 
        className="flex items-center justify-between p-3 rounded-t-lg border border-b-0"
        style={{ 
          borderColor: color,
          backgroundColor: `${color}10`,
        }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="text-xs text-muted-foreground">
            ({propostas.length})
          </span>
        </div>
        <span className="text-xs font-medium">
          {formatCurrency(totalValue)}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-3 space-y-3 rounded-b-lg border border-t-0 min-h-[600px] bg-card transition-colors',
          isOver && 'bg-accent/50'
        )}
      >
        {propostas.map(proposta => (
          <PropostaKanbanCard
            key={proposta.id}
            proposta={proposta}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}