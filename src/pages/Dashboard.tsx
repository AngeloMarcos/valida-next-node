import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AdvancedStatCard } from "@/components/AdvancedStatCard";
import { QuickActionCard } from "@/components/QuickActionCard";
import { Users, FileText, CheckCircle, DollarSign, FileSearch, TrendingUp, Clock, Target, Calendar as CalendarIcon, Plus, UserPlus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
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

  // Generate mock sparkline data for demonstration
  const generateSparklineData = (base: number) => {
    return Array.from({ length: 7 }, () => base + Math.random() * base * 0.3);
  };

  return (
    <DashboardLayout>
      <div className="space-y-2.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">Dashboard</h2>
            <p className="text-[10px] text-muted-foreground">Visão geral em tempo real</p>
          </div>
          <div className="flex items-center gap-1.5">
            <QuickActionCard title="Nova Proposta" icon={Plus} onClick={() => navigate('/propostas?new=true')} />
            <QuickActionCard title="Novo Cliente" icon={UserPlus} onClick={() => navigate('/clientes?new=true')} />
            <QuickActionCard title="Consultar Propostas" icon={Search} onClick={() => navigate('/propostas')} />
          </div>
        </div>

        {/* KPI Cards - Grid tight exatos 170px width, 6 por linha */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          <AdvancedStatCard
            title="Total Clientes"
            value={stats?.total_clientes || 0}
            icon={Users}
            iconColor="text-chart-1"
            sparklineData={generateSparklineData(stats?.total_clientes || 10)}
            trend={{ value: 12.5, isPositive: true }}
          />
          <AdvancedStatCard
            title="Total Propostas"
            value={stats?.total_propostas || 0}
            icon={FileText}
            iconColor="text-chart-2"
            sparklineData={generateSparklineData(stats?.total_propostas || 20)}
            trend={{ value: 8.3, isPositive: true }}
          />
          <AdvancedStatCard
            title="Aprovadas"
            value={stats?.propostas_aprovadas || 0}
            icon={CheckCircle}
            iconColor="text-chart-1"
            trend={{ value: 15.2, isPositive: true }}
            badge="Mês"
            sparklineData={generateSparklineData(stats?.propostas_aprovadas || 5)}
          />
          <AdvancedStatCard
            title="Pendentes"
            value={stats?.propostas_pendentes || 0}
            icon={Clock}
            iconColor="text-chart-4"
            progress={stats?.propostas_pendentes ? (stats.propostas_pendentes / (stats.total_propostas || 1)) * 100 : 0}
            trend={{ value: -2.1, isPositive: false }}
          />
          <AdvancedStatCard
            title="Taxa Aprovação"
            value={`${(stats?.taxa_aprovacao || 0).toFixed(1)}%`}
            icon={Target}
            iconColor="text-chart-1"
            progress={stats?.taxa_aprovacao || 0}
            trend={{ value: 3.2, isPositive: true }}
          />
          <AdvancedStatCard
            title="Ticket Médio"
            value={new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(stats?.ticket_medio || 0)}
            icon={DollarSign}
            iconColor="text-chart-5"
            sparklineData={generateSparklineData(stats?.ticket_medio || 5000)}
            trend={{ value: 5.7, isPositive: true }}
          />
        </div>

        {/* Gráficos e Calendário - Layout ultra compacto */}
        <div className="grid gap-2 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-border/50 bg-card">
            <CardHeader className="pb-1.5 px-3 pt-2.5">
              <CardTitle className="text-[10px] font-bold text-card-foreground uppercase tracking-wide">Tendência de Propostas</CardTitle>
              <CardDescription className="text-[9px]">Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent className="pl-1 pr-2 pb-2">
              {dashboardLoading ? (
                <div className="h-[140px] flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : trends.length === 0 ? (
                <div className="h-[140px] flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded border border-dashed border-border">
                  <TrendingUp className="h-6 w-6 mb-1.5 opacity-20" />
                  <p className="text-[9px] font-medium">Sem dados de tendência</p>
                </div>
              ) : (
                <ChartContainer
                  config={{
                    count: { label: "Propostas", color: "oklch(var(--chart-1))" },
                  }}
                  className="h-[140px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="2 2" stroke="oklch(var(--border))" opacity={0.15} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 8, fill: "oklch(var(--muted-foreground))" }}
                        tickFormatter={(value) => {
                          const [year, month] = value.split('-');
                          return format(new Date(parseInt(year), parseInt(month) - 1), 'MMM', { locale: ptBR });
                        }}
                      />
                      <YAxis tick={{ fontSize: 8, fill: "oklch(var(--muted-foreground))" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="oklch(var(--chart-1))"
                        strokeWidth={1.5}
                        dot={{ fill: "oklch(var(--chart-1))", r: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-1.5 px-2.5 pt-2.5">
              <CardTitle className="text-[10px] font-bold text-card-foreground flex items-center gap-1 uppercase tracking-wide">
                <CalendarIcon className="h-3 w-3" />
                Calendário
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0.5 pb-1.5">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border-0 scale-[0.80] origin-top [&_.rdp-caption]:text-[9px] [&_.rdp-head_cell]:text-[8px] [&_.rdp-day]:text-[9px] [&_.rdp-day]:h-5 [&_.rdp-day]:w-5 [&_.rdp-day]:text-[8px]"
              />
            </CardContent>
          </Card>
        </div>

        {/* Status e Propostas Recentes */}
        <div className="grid gap-2 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-border/50 bg-card">
            <CardHeader className="pb-1.5 px-3 pt-2.5">
              <CardTitle className="text-[10px] font-bold text-card-foreground uppercase tracking-wide">Distribuição por Status</CardTitle>
              <CardDescription className="text-[9px]">Visão atual</CardDescription>
            </CardHeader>
            <CardContent className="pl-1 pr-2 pb-2">
              {dashboardLoading ? (
                <div className="h-[140px] flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : statusBreakdown.length === 0 ? (
                <div className="h-[140px] flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded border border-dashed border-border">
                  <FileText className="h-6 w-6 mb-1.5 opacity-20" />
                  <p className="text-[9px] font-medium">Sem propostas para exibir</p>
                </div>
              ) : (
                <ChartContainer
                  config={{
                    count: { label: "Quantidade", color: "oklch(var(--chart-1))" },
                  }}
                  className="h-[140px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusBreakdown}>
                      <CartesianGrid strokeDasharray="2 2" stroke="oklch(var(--border))" opacity={0.15} />
                      <XAxis dataKey="status" tick={{ fontSize: 8, fill: "oklch(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 8, fill: "oklch(var(--muted-foreground))" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                        {statusBreakdown.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`oklch(var(--chart-${(index % 5) + 1}))`} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-1.5 px-2.5 pt-2.5">
              <CardTitle className="text-[10px] font-bold text-card-foreground uppercase tracking-wide">Propostas Recentes</CardTitle>
              <CardDescription className="text-[9px]">Últimas 5</CardDescription>
            </CardHeader>
            <CardContent className="pb-2 px-2.5">
              {dashboardLoading ? (
                <div className="space-y-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-muted/20 rounded animate-pulse" />
                  ))}
                </div>
              ) : recentPropostas.length === 0 ? (
                <div className="h-[130px] flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded border border-dashed border-border">
                  <FileSearch className="h-6 w-6 mb-1.5 opacity-20" />
                  <p className="text-[9px] font-medium">Sem propostas recentes</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentPropostas.map((proposta) => (
                    <div
                      key={proposta.id}
                      className="flex items-start justify-between gap-2 cursor-pointer hover:bg-accent/50 p-1.5 rounded transition-all border border-transparent hover:border-border group"
                      onClick={() => navigate(`/propostas/${proposta.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold truncate text-card-foreground group-hover:text-primary transition-colors leading-tight">{proposta.cliente_nome}</p>
                        <p className="text-[8px] text-muted-foreground truncate leading-tight mt-0.5">
                          {proposta.produto_nome}
                        </p>
                        <p className="text-[9px] text-card-foreground font-semibold mt-0.5 leading-tight">
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
                        className="text-[8px] px-1.5 py-0 h-4 shrink-0 leading-none"
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
