import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Clock, 
  Loader2, 
  RefreshCw, 
  Send, 
  XCircle,
  ArrowRight 
} from 'lucide-react';
import { FlowSummary } from '@/lib/mockApi';

interface AuthorizationFlowCardProps {
  flowSummary: FlowSummary | null;
  isLoading: boolean;
  selectedBank: string | null;
  onStartFlow: () => void;
  onRefresh: () => void;
  onCancel: () => void;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  open: { label: 'Aberta', color: 'bg-gray-100 text-gray-800' },
  in_analysis: { label: 'Em Análise', color: 'bg-blue-100 text-blue-800' },
  approved: { label: 'Aprovada', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejeitada', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelada', color: 'bg-gray-100 text-gray-800' },
};

const stepLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  validation: { label: 'Validando...', icon: <Loader2 className="h-4 w-4 animate-spin" /> },
  awaiting_response: { label: 'Aguardando Banco', icon: <Clock className="h-4 w-4" /> },
  completed: { label: 'Concluído', icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> },
  failed: { label: 'Falhou', icon: <XCircle className="h-4 w-4 text-red-600" /> },
};

export function AuthorizationFlowCard({
  flowSummary,
  isLoading,
  selectedBank,
  onStartFlow,
  onRefresh,
  onCancel,
}: AuthorizationFlowCardProps) {
  const hasActiveFlow = flowSummary && 
    (flowSummary.flowStep === 'validation' || flowSummary.flowStep === 'awaiting_response');
  const isCompleted = flowSummary?.flowStep === 'completed';
  const isFailed = flowSummary?.flowStep === 'failed';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Fluxo de Autorização
            </CardTitle>
            <CardDescription>
              Status da análise bancária em tempo real
            </CardDescription>
          </div>
          {flowSummary && (
            <Badge className={statusLabels[flowSummary.currentStatus]?.color || ''}>
              {statusLabels[flowSummary.currentStatus]?.label || flowSummary.currentStatus}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Flow Steps Visualization */}
        {flowSummary && (
          <div className="flex items-center justify-between py-4">
            <StepIndicator 
              label="Validação" 
              active={flowSummary.flowStep === 'validation'}
              completed={flowSummary.flowStep !== 'validation'}
            />
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <StepIndicator 
              label="Análise Banco" 
              active={flowSummary.flowStep === 'awaiting_response'}
              completed={flowSummary.flowStep === 'completed' || flowSummary.flowStep === 'failed'}
            />
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <StepIndicator 
              label="Resultado" 
              active={flowSummary.flowStep === 'completed' || flowSummary.flowStep === 'failed'}
              completed={false}
              success={flowSummary.flowStep === 'completed'}
              error={flowSummary.flowStep === 'failed'}
            />
          </div>
        )}

        {/* Current Step Info */}
        {flowSummary && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {stepLabels[flowSummary.flowStep]?.icon}
              <span className="font-medium">
                {stepLabels[flowSummary.flowStep]?.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Última atualização: {new Date(flowSummary.timestamp).toLocaleString('pt-BR')}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!flowSummary && (
            <Button 
              onClick={onStartFlow} 
              disabled={!selectedBank || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Iniciar Análise
            </Button>
          )}

          {hasActiveFlow && (
            <>
              <Button 
                variant="outline" 
                onClick={onRefresh} 
                disabled={isLoading}
                className="flex-1"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar Status
              </Button>
              <Button 
                variant="destructive" 
                onClick={onCancel}
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </>
          )}

          {(isCompleted || isFailed) && (
            <Button 
              variant="outline" 
              onClick={onRefresh} 
              disabled={isLoading}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar Novamente
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StepIndicator({ 
  label, 
  active, 
  completed,
  success,
  error 
}: { 
  label: string; 
  active: boolean; 
  completed: boolean;
  success?: boolean;
  error?: boolean;
}) {
  const getStyles = () => {
    if (success) return 'bg-green-100 border-green-500 text-green-700';
    if (error) return 'bg-red-100 border-red-500 text-red-700';
    if (active) return 'bg-primary/10 border-primary text-primary';
    if (completed) return 'bg-green-100 border-green-500 text-green-700';
    return 'bg-muted border-muted-foreground/30 text-muted-foreground';
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getStyles()}`}>
        {completed && !active && <CheckCircle2 className="h-4 w-4" />}
        {active && <Loader2 className="h-4 w-4 animate-spin" />}
        {success && <CheckCircle2 className="h-4 w-4" />}
        {error && <XCircle className="h-4 w-4" />}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
