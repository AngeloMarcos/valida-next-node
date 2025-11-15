import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { FileText, AlertCircle, Calendar, User, Phone } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Renovacao {
  id: string;
  numero_apolice: string;
  proposta_id: string;
  valor_contrato: number;
  detalhes_produto: any;
  data_inicio: string;
  propostas: {
    clientes: {
      nome: string;
      email: string;
      cpf: string;
    };
    bancos: {
      nome: string;
    };
  };
}

export default function Renovacoes() {
  const [renovacoes, setRenovacoes] = useState<Renovacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRenovacoes();
  }, []);

  const loadRenovacoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contratos_apolices')
        .select(`
          id,
          numero_apolice,
          proposta_id,
          valor_contrato,
          detalhes_produto,
          data_inicio,
          propostas(
            clientes(nome, email, cpf),
            bancos(nome)
          )
        `)
        .eq('tipo_proposta', 'seguro')
        .order('detalhes_produto->vigencia_fim', { ascending: true });

      if (error) throw error;

      setRenovacoes(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar renovações: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilExpiry = (vigenciaFim: string) => {
    if (!vigenciaFim) return null;
    return differenceInDays(new Date(vigenciaFim), new Date());
  };

  const getExpiryBadge = (days: number | null) => {
    if (days === null) return null;
    
    if (days < 0) {
      return <Badge variant="destructive">Vencido</Badge>;
    } else if (days <= 30) {
      return <Badge className="bg-warning text-warning-foreground">Vence em {days} dias</Badge>;
    } else if (days <= 60) {
      return <Badge variant="outline">Vence em {days} dias</Badge>;
    }
    return <Badge variant="secondary">Vence em {days} dias</Badge>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel de Renovações</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as renovações de apólices de seguro
          </p>
        </div>

        {renovacoes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhuma apólice encontrada"
            description="Não há apólices de seguro cadastradas no sistema."
          />
        ) : (
          <div className="grid gap-4">
            {renovacoes.map((renovacao) => {
              const vigenciaFim = renovacao.detalhes_produto?.vigencia_fim;
              const vigenciaInicio = renovacao.detalhes_produto?.vigencia_inicio;
              const daysUntilExpiry = getDaysUntilExpiry(vigenciaFim);
              const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30;

              return (
                <Card 
                  key={renovacao.id} 
                  className={isExpiringSoon ? 'border-warning shadow-lg' : ''}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Apólice: {renovacao.numero_apolice || 'Sem número'}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          {renovacao.propostas?.clientes?.nome}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {getExpiryBadge(daysUntilExpiry)}
                        {isExpiringSoon && (
                          <div className="flex items-center gap-1 text-sm text-warning">
                            <AlertCircle className="h-4 w-4" />
                            Atenção: Renovação próxima
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Tipo de Seguro:</span>
                          <span className="capitalize">
                            {renovacao.detalhes_produto?.tipo_seguro || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Valor do Prêmio:</span>
                          <span>
                            {renovacao.detalhes_produto?.valor_premio
                              ? `R$ ${Number(renovacao.detalhes_produto.valor_premio).toLocaleString('pt-BR', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Valor da Cobertura:</span>
                          <span>
                            {renovacao.detalhes_produto?.valor_cobertura
                              ? `R$ ${Number(renovacao.detalhes_produto.valor_cobertura).toLocaleString('pt-BR', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Seguradora:</span>
                          <span>{renovacao.propostas?.bancos?.nome || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">Vigência Início:</span>
                          <span>
                            {vigenciaInicio
                              ? format(new Date(vigenciaInicio), 'dd/MM/yyyy', { locale: ptBR })
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">Vigência Fim:</span>
                          <span>
                            {vigenciaFim
                              ? format(new Date(vigenciaFim), 'dd/MM/yyyy', { locale: ptBR })
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <span className="font-medium">Objeto Segurado:</span>
                          <span className="text-muted-foreground">
                            {renovacao.detalhes_produto?.objeto_segurado || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>Email: {renovacao.propostas?.clientes?.email || 'N/A'}</span>
                        <span className="ml-4">CPF: {renovacao.propostas?.clientes?.cpf || 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
