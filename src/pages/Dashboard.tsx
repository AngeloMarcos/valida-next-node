import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Users, FileText, TrendingUp, DollarSign, Award, AlertCircle, Clock } from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const navigate = useNavigate();
  const { loading: onboardingLoading, onboardingCompleted } = useOnboarding();
  
  // Filtros do dashboard
  const [periodo, setPeriodo] = useState<string>('mes_atual');
  const [usuarioId, setUsuarioId] = useState<string | undefined>();
  const [produtoId, setProdutoId] = useState<string | undefined>();
  const [usuarios, setUsuarios] = useState<Array<{ id: string; nome: string }>>([]);
  const [produtos, setProdutos] = useState<Array<{ id: string; nome: string }>>([]);
  const [chartMode, setChartMode] = useState<'quantidade' | 'valor'>('quantidade');

  // Calcular datas do filtro de período
  const getFilterDates = () => {
    const now = new Date();
    switch (periodo) {
      case 'mes_atual':
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
      case 'mes_anterior':
        const mesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return { startDate: startOfMonth(mesAnterior), endDate: endOfMonth(mesAnterior) };
      default:
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
    }
  };

  // Memorizar filters para evitar recriação a cada render
  const filters = useMemo(() => ({
    ...getFilterDates(),
    usuarioId,
    produtoId
  }), [periodo, usuarioId, produtoId]);

  const { metrics, loading } = useDashboardMetrics(filters);

  // Verifica se o onboarding foi completado e redireciona se necessário
  useEffect(() => {
    if (!onboardingLoading && !onboardingCompleted) {
      navigate("/onboarding");
    }
  }, [onboardingLoading, onboardingCompleted, navigate]);

  // Carregar lista de usuários e produtos para os filtros
  useEffect(() => {
    const loadFilters = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      if (!profile?.empresa_id) return;

      const { data: usuariosData } = await supabase
        .from('profiles')
        .select('id, nome')
        .eq('empresa_id', profile.empresa_id);

      const { data: produtosData } = await supabase
        .from('produtos')
        .select('id, nome')
        .eq('empresa_id', profile.empresa_id);

      setUsuarios(usuariosData || []);
      setProdutos(produtosData || []);
    };

    loadFilters();
  }, []);

  // Função auxiliar para calcular variação percentual
  const calcularVariacao = (atual: number, anterior: number) => {
    if (anterior === 0) return 0;
    return ((atual - anterior) / anterior) * 100;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
              <div className="h-4 w-64 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-10 w-80 bg-muted rounded animate-pulse" />
          </div>
          <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[110px] min-w-[170px] bg-muted/50 rounded-lg border animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const kpis = metrics?.kpis;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Cabeçalho com filtros */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard de Vendas</h2>
            <p className="text-muted-foreground">
              Visão operacional completa do seu CRM
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mes_atual">Mês Atual</SelectItem>
                <SelectItem value="mes_anterior">Mês Anterior</SelectItem>
              </SelectContent>
            </Select>
            <Select value={usuarioId || 'todos'} onValueChange={(v) => setUsuarioId(v === 'todos' ? undefined : v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {usuarios.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={produtoId || 'todos'} onValueChange={(v) => setProdutoId(v === 'todos' ? undefined : v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {produtos.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cards de KPIs - Topo */}
        <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 overflow-x-auto pb-1">
          <StatCard
            title="Propostas Mês"
            value={kpis?.propostas_mes || 0}
            icon={FileText}
            iconColor="primary"
            description="Total no período"
            trend={{
              value: calcularVariacao(kpis?.propostas_mes || 0, kpis?.propostas_mes_anterior || 0),
              isPositive: (kpis?.propostas_mes || 0) >= (kpis?.propostas_mes_anterior || 0)
            }}
          />
          <StatCard
            title="Valor do Mês"
            value={new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(kpis?.valor_mes || 0)}
            icon={DollarSign}
            iconColor="primary"
            description="Valor total"
            trend={{
              value: calcularVariacao(kpis?.valor_mes || 0, kpis?.valor_mes_anterior || 0),
              isPositive: (kpis?.valor_mes || 0) >= (kpis?.valor_mes_anterior || 0)
            }}
          />
          <StatCard
            title="Em Análise"
            value={kpis?.em_analise || 0}
            icon={AlertCircle}
            iconColor="warning"
            description="Abertas agora"
          />
          <StatCard
            title="Taxa Aprovação"
            value={`${(kpis?.taxa_aprovacao_mes || 0).toFixed(1)}%`}
            icon={TrendingUp}
            iconColor="primary"
            description="Do mês"
            trend={{
              value: (kpis?.taxa_aprovacao_mes || 0) - (kpis?.taxa_aprovacao_mes_anterior || 0),
              isPositive: (kpis?.taxa_aprovacao_mes || 0) >= (kpis?.taxa_aprovacao_mes_anterior || 0)
            }}
          />
          <StatCard
            title="Ticket Médio"
            value={new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(kpis?.ticket_medio_mes || 0)}
            icon={DollarSign}
            iconColor="primary"
            description="Aprovado"
            trend={{
              value: calcularVariacao(kpis?.ticket_medio_mes || 0, kpis?.ticket_medio_mes_anterior || 0),
              isPositive: (kpis?.ticket_medio_mes || 0) >= (kpis?.ticket_medio_mes_anterior || 0)
            }}
          />
          {kpis?.melhor_vendedor && (
            <StatCard
              title="Top Vendedor"
              value={new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(kpis.melhor_vendedor.valor)}
              icon={Award}
              iconColor="primary"
              description={kpis.melhor_vendedor.nome}
            />
          )}
        </div>

        {/* Gráficos - Meio */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Evolução de Vendas</CardTitle>
                  <CardDescription>Últimos 30 dias</CardDescription>
                </div>
                <Select value={chartMode} onValueChange={(v: any) => setChartMode(v)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quantidade">Quantidade</SelectItem>
                    <SelectItem value="valor">Valor (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  quantidade: { label: "Quantidade", color: "hsl(var(--chart-1))" },
                  valor: { label: "Valor", color: "hsl(var(--chart-2))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics?.trends || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      tickFormatter={(value) => format(new Date(value), 'dd/MM', { locale: ptBR })}
                    />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey={chartMode}
                      stroke={chartMode === 'quantidade' ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"}
                      strokeWidth={2}
                      dot={{ fill: chartMode === 'quantidade' ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Funil de Status</CardTitle>
              <CardDescription>Distribuição por etapa</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  quantidade: { label: "Quantidade", color: "hsl(var(--chart-1))" },
                  valor: { label: "Valor Total", color: "hsl(var(--chart-2))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics?.statusFunnel || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="status" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="quantidade" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Listas Operacionais - Bottom */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                <div>
                  <CardTitle>Propostas para Hoje</CardTitle>
                  <CardDescription>Atrasadas ou requerem atenção (criadas há +3 dias em aberto)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics?.propostasHoje && metrics.propostasHoje.length > 0 ? (
                  metrics.propostasHoje.map((proposta) => (
                    <div
                      key={proposta.id}
                      className="flex items-center gap-2.5 cursor-pointer hover:bg-muted/30 p-2 rounded-md transition-all border border-transparent hover:border-border/50"
                      onClick={() => navigate(`/propostas/${proposta.id}`)}
                    >
                      <Badge
                        variant={proposta.status === 'em_analise' ? 'default' : 'secondary'}
                        className="text-[9px] h-5 px-1.5 font-semibold flex-shrink-0 rounded-sm"
                      >
                        {proposta.status}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate leading-tight">{proposta.cliente_nome}</p>
                        <p className="text-[10px] text-muted-foreground/70 truncate leading-tight">
                          {proposta.produto_nome} • {proposta.banco_nome}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            notation: 'compact',
                            maximumFractionDigits: 1
                          }).format(proposta.valor)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(proposta.data), 'dd/MM', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma proposta pendente
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Últimas Propostas Criadas</CardTitle>
              <CardDescription>10 mais recentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics?.ultimasPropostas && metrics.ultimasPropostas.length > 0 ? (
                  metrics.ultimasPropostas.map((proposta) => (
                    <div
                      key={proposta.id}
                      className="flex items-center gap-2.5 cursor-pointer hover:bg-muted/30 p-2 rounded-md transition-all border border-transparent hover:border-border/50"
                      onClick={() => navigate(`/propostas/${proposta.id}`)}
                    >
                      <Badge
                        variant={
                          proposta.status === 'aprovada'
                            ? 'default'
                            : proposta.status === 'recusada'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="text-[9px] h-5 px-1.5 font-semibold flex-shrink-0 rounded-sm"
                      >
                        {proposta.status}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate leading-tight">{proposta.cliente_nome}</p>
                        <p className="text-[10px] text-muted-foreground/70 truncate leading-tight">
                          {proposta.produto_nome}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            notation: 'compact',
                            maximumFractionDigits: 1
                          }).format(proposta.valor)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(proposta.data), 'dd/MM', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma proposta encontrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
