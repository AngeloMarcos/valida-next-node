import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, FileText, Paperclip, History, CheckSquare, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePropostas, Proposta } from '@/hooks/usePropostas';
import { LoadingSpinner } from '@/components/shared';
import { PropostaChecklist } from '@/components/propostas/PropostaChecklist';
import { PropostaAnexos } from '@/components/propostas/PropostaAnexos';
import { PropostaHistoricoTab } from '@/components/propostas/PropostaHistoricoTab';
import { PropostaAtividadesTab } from '@/components/propostas/PropostaAtividadesTab';

export default function PropostaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loading, getPropostaById } = usePropostas();
  const [proposta, setProposta] = useState<Proposta | null>(null);

  useEffect(() => {
    if (id) {
      loadProposta(id);
    }
  }, [id]);

  const loadProposta = async (propostaId: string) => {
    const data = await getPropostaById(propostaId);
    setProposta(data);
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

  const getTipoBadge = (tipo: string) => {
    const colors: Record<string, string> = {
      credito: 'bg-blue-100 text-blue-800',
      consorcio: 'bg-purple-100 text-purple-800',
      seguro: 'bg-green-100 text-green-800',
    };
    return (
      <Badge className={colors[tipo] || 'bg-gray-100 text-gray-800'}>
        {tipo}
      </Badge>
    );
  };

  if (loading) return <LoadingSpinner />;
  if (!proposta) return <div>Proposta não encontrada</div>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/propostas')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Detalhes da Proposta</h2>
              <p className="text-muted-foreground">
                Cliente: {proposta.clientes?.nome || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={`/propostas/${id}/bank-integration`}>
              <Button variant="outline">
                <Building2 className="h-4 w-4 mr-2" />
                Análise Bancária
              </Button>
            </Link>
            <Button onClick={() => navigate(`/propostas?edit=${id}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Informações Gerais</CardTitle>
              <div className="flex gap-2">
                {getTipoBadge(proposta.tipo_proposta)}
                {getStatusBadge(proposta.status)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{proposta.clientes?.nome || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Banco</p>
                <p className="font-medium">{proposta.bancos?.nome || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Produto</p>
                <p className="font-medium">{proposta.produtos?.nome || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="font-medium">
                  {proposta.valor ? `R$ ${proposta.valor.toLocaleString('pt-BR')}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data</p>
                <p className="font-medium">
                  {proposta.data ? new Date(proposta.data).toLocaleDateString('pt-BR') : 'N/A'}
                </p>
              </div>
              {proposta.finalidade && (
                <div className="md:col-span-3">
                  <p className="text-sm text-muted-foreground">Finalidade</p>
                  <p className="font-medium">{proposta.finalidade}</p>
                </div>
              )}
              {proposta.observacoes && (
                <div className="md:col-span-3">
                  <p className="text-sm text-muted-foreground">Observações</p>
                  <p className="font-medium">{proposta.observacoes}</p>
                </div>
              )}
            </div>

            {proposta.detalhes_produto && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-4">Detalhes do Produto</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(proposta.detalhes_produto).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-muted-foreground capitalize">
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className="font-medium">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="checklist" className="space-y-4">
          <TabsList>
            <TabsTrigger value="checklist" className="gap-2">
              <CheckSquare className="h-4 w-4" />
              Checklist
            </TabsTrigger>
            <TabsTrigger value="anexos" className="gap-2">
              <Paperclip className="h-4 w-4" />
              Anexos
            </TabsTrigger>
            <TabsTrigger value="historico" className="gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="atividades" className="gap-2">
              <FileText className="h-4 w-4" />
              Atividades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="checklist">
            <PropostaChecklist propostaId={id!} />
          </TabsContent>

          <TabsContent value="anexos">
            <PropostaAnexos propostaId={id!} />
          </TabsContent>

          <TabsContent value="historico">
            <PropostaHistoricoTab propostaId={id!} />
          </TabsContent>

          <TabsContent value="atividades">
            <PropostaAtividadesTab propostaId={id!} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
