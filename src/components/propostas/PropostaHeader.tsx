import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PropostaFormDynamic } from './PropostaFormDynamic';
import { PropostaDetalhada } from '@/hooks/usePropostaDetalhes';
import { usePropostas } from '@/hooks/usePropostas';

interface PropostaHeaderProps {
  proposta: PropostaDetalhada;
  onUpdate: () => void;
}

export function PropostaHeader({ proposta, onUpdate }: PropostaHeaderProps) {
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { updateProposta, loading } = usePropostas();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; className?: string }> = {
      em_analise: { variant: 'outline', label: 'Em Análise', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      doc_pendente: { variant: 'outline', label: 'Doc. Pendente', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
      em_processamento: { variant: 'outline', label: 'Em Processamento', className: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
      aprovada: { variant: 'default', label: 'Aprovada', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
      recusada: { variant: 'destructive', label: 'Recusada' },
      cancelada: { variant: 'secondary', label: 'Cancelada' },
      rascunho: { variant: 'secondary', label: 'Rascunho' },
    };

    const config = variants[status] || { variant: 'secondary', label: status };
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const handleUpdate = async (formData: any) => {
    const success = await updateProposta(proposta.id, formData);
    if (success) {
      setEditDialogOpen(false);
      onUpdate();
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate('/propostas')}
            className="hover:text-foreground transition-colors"
          >
            Propostas
          </button>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px] sm:max-w-none">
            #{proposta.id.slice(0, 8)}
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Proposta #{proposta.id.slice(0, 8)}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {getStatusBadge(proposta.status)}
              {proposta.clientes && (
                <span className="text-sm text-muted-foreground">
                  Cliente: <span className="font-medium text-foreground">{proposta.clientes.nome}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button
              onClick={() => setEditDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Proposta</DialogTitle>
          </DialogHeader>
          <PropostaFormDynamic
            onSuccess={() => {
              setEditDialogOpen(false);
              onUpdate();
            }}
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
