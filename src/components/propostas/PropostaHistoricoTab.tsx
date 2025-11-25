import { useEffect, useState } from 'react';
import { usePropostaHistorico, PropostaHistorico } from '@/hooks/usePropostaHistorico';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared';
import { formatDistanceToNow, format, isAfter, subHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Clock, 
  FileText, 
  Edit2, 
  ArrowRightCircle, 
  Upload, 
  CheckCircle, 
  Plus, 
  DollarSign, 
  Settings 
} from 'lucide-react';

interface PropostaHistoricoTabProps {
  propostaId: string;
}

export function PropostaHistoricoTab({ propostaId }: PropostaHistoricoTabProps) {
  const { loading, fetchHistorico } = usePropostaHistorico();
  const [historico, setHistorico] = useState<PropostaHistorico[]>([]);

  useEffect(() => {
    loadHistorico();
  }, [propostaId]);

  const loadHistorico = async () => {
    const data = await fetchHistorico(propostaId);
    setHistorico(data);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      aprovada: 'default',
      rascunho: 'secondary',
      em_analise: 'outline',
      reprovada: 'destructive',
      cancelada: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getActionIcon = (statusNovo: string) => {
    const icons: Record<string, any> = {
      criacao: FileText,
      edicao: Edit2,
      status_alterado: ArrowRightCircle,
      documento_enviado: Upload,
      documento_aprovado: CheckCircle,
      atividade_criada: Plus,
      comissao_registrada: DollarSign,
      sistema: Settings,
    };
    const Icon = icons[statusNovo] || ArrowRightCircle;
    return <Icon className="h-4 w-4" />;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const twentyFourHoursAgo = subHours(now, 24);

    if (isAfter(date, twentyFourHoursAgo)) {
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
    }
    return format(date, "dd/MM HH:mm");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Histórico de Alterações</h3>

      {historico.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma alteração registrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative space-y-0">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden sm:block" />
          
          {historico.map((item, index) => (
            <div key={item.id} className="relative">
              <Card className="ml-0 sm:ml-14 mb-3 shadow-none border sm:border">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon Circle */}
                    <div className="hidden sm:flex absolute left-4 -ml-14 h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-primary">
                      {getActionIcon(item.status_novo)}
                    </div>

                    {/* Icon Mobile */}
                    <div className="sm:hidden p-2 rounded-md bg-primary/10 text-primary">
                      {getActionIcon(item.status_novo)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Status Badges */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {item.status_anterior && (
                          <>
                            {getStatusBadge(item.status_anterior)}
                            <span className="text-muted-foreground text-xs sm:text-sm">→</span>
                          </>
                        )}
                        {getStatusBadge(item.status_novo)}
                      </div>

                      {/* Observação */}
                      {item.observacao && (
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                          {item.observacao}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span className="font-medium">{item.usuario_nome || 'Sistema'}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
