import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { User, Edit, Trash2, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { ActivityLog } from '@/hooks/useActivityLog';

interface PropostaTimelineProps {
  propostaId: string;
}

const actionConfig = {
  create: {
    label: 'Criada',
    icon: PlusCircle,
    color: 'text-green-600',
    bg: 'bg-green-100 dark:bg-green-900/20',
  },
  update: {
    label: 'Atualizada',
    icon: Edit,
    color: 'text-blue-600',
    bg: 'bg-blue-100 dark:bg-blue-900/20',
  },
  delete: {
    label: 'Excluída',
    icon: Trash2,
    color: 'text-red-600',
    bg: 'bg-red-100 dark:bg-red-900/20',
  },
};

export function PropostaTimeline({ propostaId }: PropostaTimelineProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, [propostaId]);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('entity_type', 'proposta')
        .eq('entity_id', propostaId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Erro ao carregar histórico:', error);
        throw error;
      }
      
      console.log('Timeline data loaded:', data); // Debug log
      setLogs((data as ActivityLog[]) || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setLogs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const renderChangeDetails = (log: ActivityLog) => {
    if (log.action === 'create') {
      return (
        <div className="text-sm text-muted-foreground mt-2">
          Proposta criada com sucesso
        </div>
      );
    }

    if (log.action === 'update' && log.details?.status_change) {
      return (
        <div className="text-sm mt-2">
          <span className="text-muted-foreground">Status alterado: </span>
          <Badge variant="outline" className="ml-1">
            {log.details.status_change}
          </Badge>
        </div>
      );
    }

    if (log.previous_value && log.new_value) {
      const changes = [];
      const oldValue = log.previous_value;
      const newValue = log.new_value;

      // Compare specific fields
      if (oldValue.valor !== newValue.valor) {
        changes.push({
          field: 'Valor',
          old: new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(oldValue.valor || 0),
          new: new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(newValue.valor || 0),
        });
      }

      if (oldValue.status !== newValue.status) {
        changes.push({
          field: 'Status',
          old: oldValue.status,
          new: newValue.status,
        });
      }

      if (oldValue.finalidade !== newValue.finalidade) {
        changes.push({
          field: 'Finalidade',
          old: oldValue.finalidade || '-',
          new: newValue.finalidade || '-',
        });
      }

      if (changes.length > 0) {
        return (
          <div className="mt-3 space-y-2">
            {changes.map((change, idx) => (
              <div key={idx} className="text-sm bg-muted/50 rounded-md p-2">
                <span className="font-medium text-foreground">{change.field}:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-muted-foreground line-through">{change.old}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-foreground font-medium">{change.new}</span>
                </div>
              </div>
            ))}
          </div>
        );
      }
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-sm text-muted-foreground">Carregando histórico...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <p className="text-sm text-muted-foreground">Nenhuma alteração registrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {logs.length} {logs.length === 1 ? 'registro' : 'registros'}
      </p>
      
      <div className="relative space-y-4">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

            {logs.map((log, index) => {
              const config = actionConfig[log.action as keyof typeof actionConfig];
              const Icon = config?.icon;
              const isLast = index === logs.length - 1;

              return (
                <div key={log.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-background ${config?.bg}`}>
                    {Icon && <Icon className={`h-5 w-5 ${config?.color}`} />}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 pb-8 ${isLast ? 'pb-0' : ''}`}>
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={config?.color}>
                              {config?.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(log.timestamp), "dd/MM/yyyy 'às' HH:mm", {
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium">{log.user_name || 'Usuário não identificado'}</span>
                            {log.user_email && (
                              <span className="text-muted-foreground">({log.user_email})</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {renderChangeDetails(log)}
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
