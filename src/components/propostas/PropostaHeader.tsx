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
      em_analise: { variant: 'outline', label: 'Em Análise', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
      doc_pendente: { variant: 'outline', label: 'Doc. Pendente', className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20' },
      em_processamento: { variant: 'outline', label: 'Em Processamento', className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
      aprovada: { variant: 'outline', label: 'Aprovada', className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' },
      recusada: { variant: 'outline', label: 'Recusada', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
      cancelada: { variant: 'outline', label: 'Cancelada', className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20' },
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
        <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <button
            onClick={() => navigate('/propostas')}
            className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded-sm px-1"
          >
            Propostas
          </button>
          <span>/</span>
          <span className="text-foreground truncate max-w-[120px] sm:max-w-none">
            #{proposta.id.slice(0, 8)}
          </span>
        </nav>

        {/* Header - Responsivo */}
        <div className="flex flex-col gap-4">
          {/* Título e Status */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2 flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">
                Proposta #{proposta.id.slice(0, 8)}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                {getStatusBadge(proposta.status)}
                {proposta.clientes && (
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    Cliente: <span className="font-medium text-foreground">{proposta.clientes.nome}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Botões de ação - Stack em mobile */}
            <div className="flex flex-col sm:flex-row gap-2 sm:flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto min-h-[44px] sm:min-h-[40px]"
              >
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="sm:inline">Voltar</span>
              </Button>
              <Button
                onClick={() => setEditDialogOpen(true)}
                className="w-full sm:w-auto min-h-[44px] sm:min-h-[40px]"
                disabled={loading}
              >
                <Edit className="h-4 w-4 sm:mr-2" />
                <span className="sm:inline">Editar</span>
              </Button>
            </div>
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
