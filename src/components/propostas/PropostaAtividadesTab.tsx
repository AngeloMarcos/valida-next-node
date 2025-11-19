import { useEffect, useState } from 'react';
import { usePropostaAtividades, PropostaAtividade } from '@/hooks/usePropostaAtividades';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, CheckCircle2, Clock, Trash2, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormInput, FormSelect, FormTextarea } from '@/components/form';
import { useForm, FormProvider } from 'react-hook-form';
import { LoadingSpinner } from '@/components/shared';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PropostaAtividadesTabProps {
  propostaId: string;
}

export function PropostaAtividadesTab({ propostaId }: PropostaAtividadesTabProps) {
  const { loading, fetchAtividades, createAtividade, updateAtividade, deleteAtividade } = usePropostaAtividades();
  const [atividades, setAtividades] = useState<PropostaAtividade[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const methods = useForm({
    defaultValues: {
      tipo_atividade: 'ligacao',
      descricao: '',
      status: 'pendente',
      data_agendamento: '',
    },
  });

  useEffect(() => {
    loadAtividades();
  }, [propostaId]);

  const loadAtividades = async () => {
    const data = await fetchAtividades(propostaId);
    setAtividades(data);
  };

  const handleSubmit = async (data: any) => {
    const success = await createAtividade(propostaId, data);
    if (success) {
      setIsDialogOpen(false);
      methods.reset();
      loadAtividades();
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const success = await updateAtividade(id, { status });
    if (success) loadAtividades();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente remover esta atividade?')) {
      const success = await deleteAtividade(id);
      if (success) loadAtividades();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      concluida: 'default',
      pendente: 'secondary',
      em_andamento: 'outline',
      cancelada: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    return status === 'concluida' ? (
      <CheckCircle2 className="h-5 w-5 text-green-500" />
    ) : (
      <Clock className="h-5 w-5 text-yellow-500" />
    );
  };

  if (loading && atividades.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Atividades e Tarefas</h3>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nova Atividade
        </Button>
      </div>

      {atividades.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma atividade registrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {atividades.map((atividade) => (
            <Card key={atividade.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(atividade.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{atividade.tipo_atividade}</Badge>
                      {getStatusBadge(atividade.status)}
                    </div>
                    <p className="text-sm mb-2">{atividade.descricao}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{atividade.usuario_nome || 'Sistema'}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(atividade.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                      {atividade.data_agendamento && (
                        <>
                          <span>•</span>
                          <span>Agendado: {new Date(atividade.data_agendamento).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="text-sm border rounded px-2 py-1"
                      value={atividade.status}
                      onChange={(e) => handleUpdateStatus(atividade.id, e.target.value)}
                    >
                      <option value="pendente">Pendente</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="concluida">Concluída</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(atividade.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Atividade</DialogTitle>
            <DialogDescription>
              Registre uma nova atividade ou tarefa para esta proposta
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-4">
              <FormSelect
                name="tipo_atividade"
                label="Tipo de Atividade"
                options={[
                  { value: 'ligacao', label: 'Ligação' },
                  { value: 'email', label: 'E-mail' },
                  { value: 'reuniao', label: 'Reunião' },
                  { value: 'whatsapp', label: 'WhatsApp' },
                  { value: 'tarefa', label: 'Tarefa' },
                  { value: 'follow_up', label: 'Follow-up' },
                ]}
              />
              <FormTextarea
                name="descricao"
                label="Descrição"
                placeholder="Descreva a atividade..."
                rows={3}
                required
              />
              <FormSelect
                name="status"
                label="Status"
                options={[
                  { value: 'pendente', label: 'Pendente' },
                  { value: 'em_andamento', label: 'Em Andamento' },
                  { value: 'concluida', label: 'Concluída' },
                ]}
              />
              <FormInput
                name="data_agendamento"
                label="Data de Agendamento"
                type="datetime-local"
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  Criar
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
}
