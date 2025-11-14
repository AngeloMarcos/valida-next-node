import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { QuickActionCard } from "@/components/QuickActionCard";
import { Users, FileText, CheckCircle, DollarSign, FileSearch, TrendingUp, Plus, UserPlus, Search, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral do seu sistema de CRM
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Clientes"
            value={stats?.total_clientes || 0}
            icon={Users}
            iconColor="primary"
            description="Clientes cadastrados"
          />
          <StatCard
            title="Total de Propostas"
            value={stats?.total_propostas || 0}
            icon={FileText}
            iconColor="primary"
            description="Propostas cadastradas"
          />
          <StatCard
            title="Propostas em Análise"
            value={stats?.propostas_analise || 0}
            icon={FileSearch}
            iconColor="warning"
            description="Aguardando análise"
          />
          <StatCard
            title="Taxa de Aprovação"
            value={`${(stats?.taxa_aprovacao || 0).toFixed(1)}%`}
            icon={TrendingUp}
            iconColor="primary"
            description="Taxa de aprovação"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Propostas Aprovadas"
            value={stats?.propostas_aprovadas || 0}
            icon={CheckCircle}
            iconColor="primary"
            description="Aprovadas"
          />
          <StatCard
            title="Ticket Médio"
            value={new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(stats?.ticket_medio || 0)}
            icon={DollarSign}
            iconColor="primary"
            description="Valor médio aprovado"
          />
          <StatCard
            title="Valor Total Aprovado"
            value={new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(stats?.valor_total_aprovado || 0)}
            icon={DollarSign}
            iconColor="primary"
            description="Total aprovado"
          />
          <StatCard
            title="Pendentes"
            value={stats?.propostas_pendentes || 0}
            icon={FileText}
            description="Propostas pendentes"
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Ações Rápidas</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard
              title="Nova Proposta"
              icon={Plus}
              onClick={() => navigate('/propostas')}
            />
            <QuickActionCard
              title="Novo Cliente"
              icon={UserPlus}
              onClick={() => navigate('/clientes')}
            />
            <QuickActionCard
              title="Consultar Propostas"
              icon={Search}
              onClick={() => navigate('/propostas')}
            />
            <QuickActionCard
              title="Registrar Atividade"
              icon={Activity}
              onClick={() => navigate('/activity-log')}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Atividades Recentes</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-success rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Nova proposta aprovada</p>
                  <p className="text-xs text-muted-foreground">Consórcio Imobiliário - R$ 250.000</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Novo cliente cadastrado</p>
                  <p className="text-xs text-muted-foreground">Maria Oliveira Lima</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-warning rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Proposta em análise</p>
                  <p className="text-xs text-muted-foreground">Crédito Pessoal - R$ 50.000</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Status das Propostas</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pendentes</span>
                <span className="text-sm font-semibold">{stats?.propostas_pendentes || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Em Análise</span>
                <span className="text-sm font-semibold">{stats?.propostas_analise || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Aprovadas</span>
                <span className="text-sm font-semibold text-success">{stats?.propostas_aprovadas || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
