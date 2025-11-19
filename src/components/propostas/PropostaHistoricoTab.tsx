import { useEffect, useState } from 'react';
import { usePropostaHistorico, PropostaHistorico } from '@/hooks/usePropostaHistorico';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock } from 'lucide-react';

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
        <div className="space-y-3">
          {historico.map((item, index) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {item.status_anterior && (
                        <>
                          {getStatusBadge(item.status_anterior)}
                          <span className="text-muted-foreground">→</span>
                        </>
                      )}
                      {getStatusBadge(item.status_novo)}
                    </div>
                    {item.observacao && (
                      <p className="text-sm text-muted-foreground">{item.observacao}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{item.usuario_nome || 'Sistema'}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(item.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
