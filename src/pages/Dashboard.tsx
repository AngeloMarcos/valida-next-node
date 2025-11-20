import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { QuickActionCard } from "@/components/QuickActionCard";
import { Users, FileText, CheckCircle, DollarSign, FileSearch, TrendingUp, Plus, UserPlus, Search, Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";

interface DashboardKPIs {
  total_clientes: number;
  total_propostas: number;
  propostas_aprovadas: number;
  propostas_pendentes: number;
  propostas_analise: number;
  valor_total_aprovado: number;
  ticket_medio: number;
  taxa_aprovacao: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardKPIs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { trends, statusBreakdown, recentPropostas, loading: dashboardLoading } = useDashboardData();

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      if (!profile?.empresa_id) {
        throw new Error('Empresa não encontrada');
      }

      const { data, error } = await supabase
        .rpc('get_dashboard_kpis', { _empresa_id: profile.empresa_id });

      if (error) throw error;

      if (data && typeof data === 'object') {
        setStats(data as unknown as DashboardKPIs);
      }
    } catch (error: any) {
      toast.error("Erro ao carregar estatísticas: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();

    // Atualizar em tempo real quando houver mudanças
    const channel = supabase
      .channel('dashboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clientes' },
        () => loadStats()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'propostas' },
        () => loadStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Visão geral do seu sistema de CRM</p>
        </div>

        {/* KPI Cards - Grid compacto */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <StatCard
            title="Total Clientes"
            value={stats?.total_clientes || 0}
            icon={Users}
            iconColor="primary"
          />
          <StatCard
            title="Total Propostas"
            value={stats?.total_propostas || 0}
            icon={FileText}
            iconColor="primary"
          />
          <StatCard
            title="Em Análise"
            value={stats?.propostas_analise || 0}
            icon={FileSearch}
            iconColor="warning"
          />
          <StatCard
            title="Aprovadas"
            value={stats?.propostas_aprovadas || 0}
            icon={CheckCircle}
            iconColor="primary"
          />
          <StatCard
            title="Pendentes"
            value={stats?.propostas_pendentes || 0}
            icon={FileText}
            iconColor="muted"
          />
          <StatCard
            title="Taxa Aprovação"
            value={`${(stats?.taxa_aprovacao || 0).toFixed(1)}%`}
            icon={TrendingUp}
            iconColor="primary"
          />
        </div>

        {/* Valores - Segunda linha de KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
          <StatCard
            title="Ticket Médio"
            value={new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(stats?.ticket_medio || 0)}
            icon={DollarSign}
            iconColor="primary"
          />
          <StatCard
            title="Total Aprovado"
            value={new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(stats?.valor_total_aprovado || 0)}
            icon={DollarSign}
            iconColor="primary"
          />
          <div className="flex items-center justify-center gap-2 bg-card border border-border rounded-lg p-3">
            <span className="text-xs text-muted-foreground mr-2">Ações:</span>
            <QuickActionCard
              title="Nova Proposta"
              icon={Plus}
              onClick={() => navigate('/propostas?new=true')}
            />
            <QuickActionCard
              title="Novo Cliente"
              icon={UserPlus}
              onClick={() => navigate('/clientes?new=true')}
            />
            <QuickActionCard
              title="Consultar Propostas"
              icon={Search}
              onClick={() => navigate('/propostas')}
            />
          </div>
        </div>

        {/* Gráficos e Calendário - Layout compacto */}
        <div className="grid gap-3 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-card-foreground">Tendência de Propostas</CardTitle>
              <CardDescription className="text-xs">Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent className="pl-2 pr-4 pb-3">
              {dashboardLoading ? (
                <div className="h-[180px] flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : trends.length === 0 ? (
                <div className="h-[180px] flex flex-col items-center justify-center text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">Sem dados de tendência ainda</p>
                </div>
              ) : (
                <ChartContainer
                  config={{
                    count: { label: "Propostas", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[180px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(value) => {
                          const [year, month] = value.split('-');
                          return format(new Date(parseInt(year), parseInt(month) - 1), 'MMM', { locale: ptBR });
                        }}
                      />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--chart-1))", r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-card-foreground flex items-center gap-2">
                <CalendarIcon className="h-3.5 w-3.5" />
                Calendário
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border-0 [&_.rdp-caption]:text-xs [&_.rdp-head_cell]:text-[10px] [&_.rdp-day]:text-xs [&_.rdp-day]:h-7 [&_.rdp-day]:w-7"
              />
            </CardContent>
          </Card>
        </div>

        {/* Status e Propostas Recentes */}
        <div className="grid gap-3 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-card-foreground">Distribuição por Status</CardTitle>
              <CardDescription className="text-xs">Visão atual</CardDescription>
            </CardHeader>
            <CardContent className="pl-2 pr-4 pb-3">
              {dashboardLoading ? (
                <div className="h-[180px] flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : statusBreakdown.length === 0 ? (
                <div className="h-[180px] flex flex-col items-center justify-center text-muted-foreground">
                  <FileText className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">Sem propostas para exibir</p>
                </div>
              ) : (
                <ChartContainer
                  config={{
                    count: { label: "Quantidade", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[180px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="status" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-card-foreground">Propostas Recentes</CardTitle>
              <CardDescription className="text-xs">Últimas 5</CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              {dashboardLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-muted/20 rounded animate-pulse" />
                  ))}
                </div>
              ) : recentPropostas.length === 0 ? (
                <div className="h-[160px] flex flex-col items-center justify-center text-muted-foreground">
                  <FileSearch className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">Sem propostas recentes</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentPropostas.map((proposta) => (
                    <div
                      key={proposta.id}
                      className="flex items-start justify-between gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors border border-transparent hover:border-border"
                      onClick={() => navigate(`/propostas/${proposta.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate text-foreground">{proposta.cliente_nome}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {proposta.produto_nome}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-semibold">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 0,
                          }).format(proposta.valor)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          proposta.status === 'aprovada'
                            ? 'default'
                            : proposta.status === 'recusada'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="text-[10px] px-1.5 py-0"
                      >
                        {proposta.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
