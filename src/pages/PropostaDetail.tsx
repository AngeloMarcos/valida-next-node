import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ArrowLeft, Edit, Trash2, FileText, History } from 'lucide-react';
import { usePropostas, Proposta } from '@/hooks/usePropostas';
import { PropostaTimeline } from '@/components/propostas/PropostaTimeline';
import { format } from 'date-fns';

const statusConfig = {
  rascunho: { label: 'Rascunho', variant: 'secondary' as const },
  em_analise: { label: 'Em Análise', variant: 'default' as const },
  aprovada: { label: 'Aprovada', variant: 'default' as const },
  reprovada: { label: 'Reprovada', variant: 'destructive' as const },
  cancelada: { label: 'Cancelada', variant: 'outline' as const },
};

export default function PropostaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loading, getPropostaById, deleteProposta } = usePropostas();
  const [proposta, setProposta] = useState<Proposta | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadProposta();
    }
  }, [id]);

  const loadProposta = async () => {
    if (!id) return;
    const data = await getPropostaById(id);
    setProposta(data);
  };

  const handleDelete = async () => {
    if (!id) return;
    if (confirm('Tem certeza que deseja excluir esta proposta?')) {
      const success = await deleteProposta(id);
      if (success) {
        navigate('/propostas');
      }
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!proposta) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Proposta não encontrada</p>
          <Button onClick={() => navigate('/propostas')}>Voltar para Propostas</Button>
        </div>
      </DashboardLayout>
    );
  }

  const statusInfo = statusConfig[proposta.status as keyof typeof statusConfig] || {
    label: proposta.status,
    variant: 'secondary' as const,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/propostas')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Detalhes da Proposta</h2>
              <p className="text-muted-foreground">
                Cadastrada em {format(new Date(proposta.data), "dd/MM/yyyy 'às' HH:mm")}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/propostas?edit=${proposta.id}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            
            <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <History className="h-4 w-4 mr-2" />
                  Histórico
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Histórico de Alterações</SheetTitle>
                  <SheetDescription>
                    Todas as alterações feitas nesta proposta
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <PropostaTimeline propostaId={proposta.id} />
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="outline" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2 text-destructive" />
              Excluir
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{proposta.clientes?.nome || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CPF</p>
                <p className="font-medium">{(proposta.clientes as any)?.cpf || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">E-mail</p>
                <p className="font-medium">{(proposta.clientes as any)?.email || '-'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Financeiras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Valor Solicitado</p>
                <p className="text-2xl font-bold">{formatCurrency(proposta.valor)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={statusInfo.variant} className="mt-1">
                  {statusInfo.label}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Finalidade</p>
                <p className="font-medium">{proposta.finalidade || '-'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Banco e Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Banco</p>
                <p className="font-medium">{proposta.bancos?.nome || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CNPJ do Banco</p>
                <p className="font-medium">{(proposta.bancos as any)?.cnpj || '-'}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Produto</p>
                <p className="font-medium">{proposta.produtos?.nome || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Crédito</p>
                <p className="font-medium">{proposta.produtos?.tipo_credito || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Juros</p>
                <p className="font-medium">
                  {(proposta.produtos as any)?.taxa_juros
                    ? `${(proposta.produtos as any).taxa_juros}% a.m.`
                    : '-'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">
                {proposta.observacoes || 'Nenhuma observação registrada.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
