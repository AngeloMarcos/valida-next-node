import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { usePropostaDetalhes } from '@/hooks/usePropostaDetalhes';
import { PropostaHeader } from '@/components/propostas/PropostaHeader';
import { PropostaDadosTab } from '@/components/propostas/PropostaDadosTab';
import { PropostaAtividadesTab } from '@/components/propostas/PropostaAtividadesTab';
import { PropostaAnexos } from '@/components/propostas/PropostaAnexos';
import { PropostaHistoricoTab } from '@/components/propostas/PropostaHistoricoTab';

function LoadingPageSkeleton() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </DashboardLayout>
  );
}

export default function PropostaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { proposta, loading, error, refetch } = usePropostaDetalhes(id!);

  if (loading) return <LoadingPageSkeleton />;

  if (error || !proposta) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Proposta não encontrada</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'A proposta solicitada não existe ou foi removida.'}
            </p>
            <Button onClick={() => navigate('/propostas')}>
              Voltar para Propostas
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PropostaHeader proposta={proposta} onUpdate={refetch} />

        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-0 bg-muted/50 p-1">
            <TabsTrigger value="dados" className="text-xs sm:text-sm min-h-[44px]">
              Dados
            </TabsTrigger>
            <TabsTrigger value="atividades" className="text-xs sm:text-sm min-h-[44px]">
              Atividades
            </TabsTrigger>
            <TabsTrigger value="anexos" className="text-xs sm:text-sm min-h-[44px]">
              Anexos
            </TabsTrigger>
            <TabsTrigger value="historico" className="text-xs sm:text-sm min-h-[44px]">
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
