import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, AlertTriangle, CheckCircle2, Lightbulb, ShieldCheck } from 'lucide-react';
import { FlowSummary } from '@/lib/mockApi';

interface CreditValidationCardProps {
  flowSummary: FlowSummary | null;
}

export function CreditValidationCard({ flowSummary }: CreditValidationCardProps) {
  if (!flowSummary || flowSummary.validationScore === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Validação de Crédito
          </CardTitle>
          <CardDescription>
            Inicie o fluxo para ver a validação de crédito
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24 text-muted-foreground">
            Aguardando início do fluxo...
          </div>
        </CardContent>
      </Card>
    );
  }

  const scoreColor = flowSummary.validationScore >= 70 
    ? 'text-green-600' 
    : flowSummary.validationScore >= 50 
    ? 'text-yellow-600' 
    : 'text-red-600';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Validação de Crédito
          </CardTitle>
          <Badge variant={flowSummary.validationEligible ? 'default' : 'destructive'}>
            {flowSummary.validationEligible ? 'Elegível' : 'Não Elegível'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Score de Crédito</span>
            <span className={`text-2xl font-bold ${scoreColor}`}>
              {flowSummary.validationScore}
            </span>
          </div>
          <Progress value={flowSummary.validationScore} className="h-2" />
        </div>

        {/* Errors */}
        {flowSummary.errors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium text-sm">Erros</span>
            </div>
            <ul className="space-y-1">
              {flowSummary.errors.map((error, index) => (
                <li key={index} className="text-sm text-destructive pl-6">
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {flowSummary.warnings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium text-sm">Avisos</span>
            </div>
            <ul className="space-y-1">
              {flowSummary.warnings.map((warning, index) => (
                <li key={index} className="text-sm text-yellow-600 pl-6">
                  • {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {flowSummary.recommendations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600">
              <Lightbulb className="h-4 w-4" />
              <span className="font-medium text-sm">Recomendações</span>
            </div>
            <ul className="space-y-1">
              {flowSummary.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-blue-600 pl-6">
                  • {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Success message if no issues */}
        {flowSummary.errors.length === 0 && 
         flowSummary.warnings.length === 0 && 
         flowSummary.validationEligible && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">
              Validação aprovada sem pendências
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
