import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { usePropostaDetalhes } from '@/hooks/usePropostaDetalhes';
import { PropostaHeader } from '@/components/propostas/PropostaHeader';
import { PropostaDadosTab } from '@/components/propostas/PropostaDadosTab';
import { PropostaAtividadesTab } from '@/components/propostas/PropostaAtividadesTab';
import { PropostaAnexos } from '@/components/propostas/PropostaAnexos';
import { PropostaHistoricoTab } from '@/components/propostas/PropostaHistoricoTab';

export default function PropostaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const { proposta, loading, error, refetch } = usePropostaDetalhes(id!);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !proposta) {
    return (
      <DashboardLayout>
        <Card className="border-destructive">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Proposta não encontrada</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'A proposta que você está procurando não existe ou foi removida.'}
            </p>
            <a
              href="/propostas"
              className="text-primary hover:underline"
            >
              Voltar para propostas
            </a>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PropostaHeader proposta={proposta} onUpdate={refetch} />

        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto bg-muted/50 p-1">
            <TabsTrigger value="dados" className="min-h-[44px] px-4">
              Dados
            </TabsTrigger>
            <TabsTrigger value="atividades" className="min-h-[44px] px-4">
              Atividades
            </TabsTrigger>
            <TabsTrigger value="anexos" className="min-h-[44px] px-4">
              Anexos
            </TabsTrigger>
            <TabsTrigger value="historico" className="min-h-[44px] px-4">
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="mt-6">
            <PropostaDadosTab proposta={proposta} />
          </TabsContent>

          <TabsContent value="atividades" className="mt-6">
            <PropostaAtividadesTab propostaId={proposta.id} />
          </TabsContent>

          <TabsContent value="anexos" className="mt-6">
            <PropostaAnexos propostaId={proposta.id} />
          </TabsContent>

          <TabsContent value="historico" className="mt-6">
            <PropostaHistoricoTab propostaId={proposta.id} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
