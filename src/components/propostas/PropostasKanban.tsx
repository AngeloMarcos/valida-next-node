import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Proposta } from '@/hooks/usePropostas';
import { PropostaKanbanCard } from './PropostaKanbanCard';
import { PropostaKanbanColumn } from './PropostaKanbanColumn';
import { useState } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { FileText } from 'lucide-react';

interface PropostasKanbanProps {
  propostas: Proposta[];
  loading: boolean;
  onEdit: (proposta: Proposta) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => Promise<boolean>;
}

const KANBAN_COLUMNS = [
  { id: 'em_analise', title: 'Em Análise', color: 'hsl(var(--primary))' },
  { id: 'doc_pendente', title: 'Doc. Pendente', color: 'hsl(var(--chart-1))' },
  { id: 'em_processamento', title: 'Em Processamento', color: 'hsl(var(--chart-3))' },
  { id: 'aprovada', title: 'Aprovada', color: 'hsl(var(--chart-2))' },
  { id: 'recusada', title: 'Recusada', color: 'hsl(var(--destructive))' },
  { id: 'cancelada', title: 'Cancelada', color: 'hsl(var(--muted-foreground))' },
];

export function PropostasKanban({
  propostas,
  loading,
  onEdit,
  onDelete,
  onStatusChange,
}: PropostasKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const activeProposta = activeId 
    ? propostas.find(p => p.id === activeId) 
    : null;

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const propostaId = active.id as string;
    const newStatus = over.id as string;

    const proposta = propostas.find(p => p.id === propostaId);
    if (!proposta || proposta.status === newStatus) return;

    await onStatusChange(propostaId, newStatus);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" message="Carregando propostas..." />
      </div>
    );
  }

  const propostasByStatus = KANBAN_COLUMNS.reduce((acc, column) => {
    acc[column.id] = propostas.filter(p => p.status === column.id);
    return acc;
  }, {} as Record<string, Proposta[]>);

  if (propostas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
        <FileText className="h-12 w-12 mb-4" />
        <p className="text-lg">Nenhuma proposta encontrada</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map(column => (
          <SortableContext
            key={column.id}
            items={propostasByStatus[column.id].map(p => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <PropostaKanbanColumn
              id={column.id}
              title={column.title}
              color={column.color}
              propostas={propostasByStatus[column.id]}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </SortableContext>
        ))}
      </div>

      <DragOverlay>
        {activeProposta && (
          <PropostaKanbanCard
            proposta={activeProposta}
            onEdit={onEdit}
            onDelete={onDelete}
            isDragging
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}