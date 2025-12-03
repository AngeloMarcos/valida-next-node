import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Building2 } from 'lucide-react';
import { useBankIntegration } from '@/hooks/useBankIntegration';
import { BankSelector } from '@/components/bank-integration/BankSelector';
import { CreditValidationCard } from '@/components/bank-integration/CreditValidationCard';
import { AuthorizationFlowCard } from '@/components/bank-integration/AuthorizationFlowCard';

export default function BankIntegration() {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const {
    isLoading,
    flowSummary,
    supportedBanks,
    selectedBank,
    loadSupportedBanks,
    selectBank,
    startAuthorizationFlow,
    refreshFlowSummary,
    cancelFlow,
    resetState,
  } = useBankIntegration();

  const numericProposalId = Number(proposalId) || 1;

  useEffect(() => {
    loadSupportedBanks();
    return () => resetState();
  }, [loadSupportedBanks, resetState]);

  const handleStartFlow = () => {
    startAuthorizationFlow(numericProposalId);
  };

  const handleRefresh = () => {
    refreshFlowSummary(numericProposalId);
  };

  const handleCancel = () => {
    cancelFlow(numericProposalId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Integração Bancária</h2>
            <p className="text-muted-foreground">
              Proposta #{proposalId} - Enviar para análise de crédito
            </p>
          </div>
        </div>

        {/* Proposal Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informações da Proposta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">ID da Proposta</p>
                <p className="font-medium">#{proposalId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{flowSummary?.clientName || 'João da Silva'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Produto</p>
                <p className="font-medium">{flowSummary?.productName || 'Crédito Pessoal'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Solicitado</p>
                <p className="font-medium">
                  R$ {(flowSummary?.requestedAmount || 10000).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Bank Selection & Flow */}
          <div className="space-y-6">
            <BankSelector
              supportedBanks={supportedBanks}
              selectedBank={selectedBank}
              onSelectBank={selectBank}
              onLoadBanks={loadSupportedBanks}
              isLoading={isLoading}
            />

            <AuthorizationFlowCard
              flowSummary={flowSummary}
              isLoading={isLoading}
              selectedBank={selectedBank}
              onStartFlow={handleStartFlow}
              onRefresh={handleRefresh}
              onCancel={handleCancel}
            />
          </div>

          {/* Right Column - Validation Results */}
          <div>
            <CreditValidationCard flowSummary={flowSummary} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
