import { useEffect, useState } from 'react';
import { usePropostaAtividades, PropostaAtividade } from '@/hooks/usePropostaAtividades';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Calendar as CalendarIcon,
  Phone,
  MessageSquare,
  Mail,
  Video,
  CheckSquare
} from 'lucide-react';
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
import { cn } from '@/lib/utils';

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
    const variants: Record<string, { variant: any; label: string; className: string }> = {
      agendada: { variant: 'outline', label: 'Agendada', className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20' },
      pendente: { variant: 'outline', label: 'Pendente', className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20' },
      concluida: { variant: 'outline', label: 'Concluída', className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' },
      em_andamento: { variant: 'outline', label: 'Em Andamento', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
      cancelada: { variant: 'outline', label: 'Cancelada', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
    };
    const config = variants[status] || variants.pendente;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, any> = {
      ligacao: Phone,
      whatsapp: MessageSquare,
      email: Mail,
      reuniao: Video,
      tarefa: CheckSquare,
      sistema: CalendarIcon,
    };
    const Icon = icons[tipo] || CalendarIcon;
    return <Icon className="h-5 w-5" />;
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      ligacao: 'Ligação',
      whatsapp: 'WhatsApp',
      email: 'E-mail',
      reuniao: 'Reunião',
      tarefa: 'Tarefa',
      sistema: 'Sistema',
    };
    return labels[tipo] || tipo;
  };

  if (loading && atividades.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      {/* Header com botão */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h3 className="text-lg font-semibold">Atividades e Tarefas</h3>
        <Button 
          onClick={() => setIsDialogOpen(true)} 
          size="default"
          className="w-full sm:w-auto min-h-[44px] sm:min-h-[40px]"
        >
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="sm:inline">Nova Atividade</span>
        </Button>
      </div>

      {/* Empty State */}
      {atividades.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CalendarIcon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h4 className="text-lg font-medium mb-2">Nenhuma atividade registrada</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Comece registrando uma nova atividade ou tarefa para esta proposta
            </p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira Atividade
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Timeline vertical */
        <div className="relative space-y-4">
          {/* Linha vertical da timeline */}
          <div className="absolute left-6 top-8 bottom-8 w-px bg-border hidden sm:block" />
          
          {atividades.map((atividade, index) => (
            <Card 
              key={atividade.id}
              className={cn(
                "hover:shadow-md transition-all relative",
                atividade.status === 'concluida' && "opacity-80"
              )}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  {/* Icon circular para timeline */}
                  <div className={cn(
                    "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center relative z-10",
                    atividade.status === 'concluida' 
                      ? "bg-green-500/10 text-green-600 dark:text-green-400 border-2 border-green-500/20" 
                      : atividade.status === 'agendada'
                      ? "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-2 border-gray-500/20"
                      : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-2 border-yellow-500/20"
                  )}>
                    {getTipoIcon(atividade.tipo_atividade)}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    {/* Título e badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm sm:text-base">
                        {getTipoLabel(atividade.tipo_atividade)}
                      </h4>
                      {getStatusBadge(atividade.status)}
                    </div>

                    {/* Descrição */}
                    <p className="text-sm text-foreground/90 mb-3 leading-relaxed whitespace-pre-wrap break-words">
                      {atividade.descricao}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">{atividade.usuario_nome || 'Sistema'}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(atividade.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                      {atividade.data_agendamento && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            Agendado: {new Date(atividade.data_agendamento).toLocaleDateString('pt-BR')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                    <select
                      className="text-xs sm:text-sm border rounded px-2 py-1.5 bg-background min-h-[36px] cursor-pointer hover:bg-accent transition-colors"
                      value={atividade.status}
                      onChange={(e) => handleUpdateStatus(atividade.id, e.target.value)}
                    >
                      <option value="agendada">Agendada</option>
                      <option value="pendente">Pendente</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="concluida">Concluída</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(atividade.id)}
                      className="hover:bg-destructive/10 hover:text-destructive min-h-[36px]"
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

      {/* Dialog Nova Atividade */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Atividade</DialogTitle>
            <DialogDescription>
              Registre uma nova atividade ou tarefa para esta proposta
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
              <FormSelect
                name="tipo_atividade"
                label="Tipo de Atividade *"
                placeholder="Selecione o tipo"
                options={[
                  { value: 'ligacao', label: '📞 Ligação' },
                  { value: 'whatsapp', label: '💬 WhatsApp' },
                  { value: 'email', label: '📧 E-mail' },
                  { value: 'reuniao', label: '🎥 Reunião' },
                  { value: 'tarefa', label: '✅ Tarefa' },
                  { value: 'sistema', label: '⚙️ Sistema' },
                ]}
              />
              
              <FormTextarea
                name="descricao"
                label="Descrição *"
                placeholder="Descreva a atividade em detalhes..."
                rows={4}
                required
              />
              
              <FormSelect
                name="status"
                label="Status Inicial"
                placeholder="Selecione o status"
                options={[
                  { value: 'agendada', label: 'Agendada' },
                  { value: 'pendente', label: 'Pendente' },
                  { value: 'em_andamento', label: 'Em Andamento' },
                  { value: 'concluida', label: 'Concluída' },
                ]}
              />
              
              <FormInput
                name="data_agendamento"
                label="Data de Agendamento"
                type="datetime-local"
                helperText="Opcional - Quando esta atividade está programada"
              />
              
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full sm:w-auto min-h-[44px] sm:min-h-[40px]"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full sm:w-auto min-h-[44px] sm:min-h-[40px]"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Atividade
                    </>
                  )}
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      {/* Botão flutuante mobile (opcional - apenas quando há atividades) */}
      {atividades.length > 0 && (
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="fixed bottom-6 right-6 sm:hidden h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
