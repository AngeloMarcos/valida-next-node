import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Users, FileText, CheckCircle, DollarSign, FileSearch, TrendingUp } from "lucide-react";
import { api, DashboardStats } from "@/lib/api";
import { toast } from "sonner";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (error) {
        toast.error("Erro ao carregar estatísticas");
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
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
            value={stats?.totalClients || 0}
            icon={Users}
            description="Clientes cadastrados"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Total de Propostas"
            value={stats?.totalProposals || 0}
            icon={FileText}
            description="Propostas cadastradas"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Propostas em Análise"
            value={stats?.inAnalysisProposals || 0}
            icon={FileSearch}
            description="Aguardando análise"
          />
          <StatCard
            title="Taxa de Aprovação"
            value={`${stats?.approvalRate || 0}%`}
            icon={TrendingUp}
            description="Taxa de aprovação"
            trend={{ value: 5, isPositive: true }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Propostas Aprovadas"
            value={stats?.approvedProposals || 0}
            icon={CheckCircle}
            description="Aprovadas este mês"
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Ticket Médio"
            value={new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(stats?.avgTicket || 0)}
            icon={DollarSign}
            description="Valor médio aprovado"
          />
          <StatCard
            title="Valor Total"
            value={new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(stats?.totalAmount || 0)}
            icon={DollarSign}
            description="Em propostas ativas"
          />
          <StatCard
            title="Abertas"
            value={stats?.openProposals || 0}
            icon={FileText}
            description="Propostas abertas"
          />
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
                <span className="text-sm">Abertas</span>
                <span className="text-sm font-semibold">{stats?.openProposals || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Em Análise</span>
                <span className="text-sm font-semibold">
                  {(stats?.totalProposals || 0) - (stats?.openProposals || 0) - (stats?.approvedProposals || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Aprovadas</span>
                <span className="text-sm font-semibold text-success">{stats?.approvedProposals || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
