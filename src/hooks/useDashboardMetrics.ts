import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from 'date-fns';

export interface DashboardFilters {
  startDate: Date;
  endDate: Date;
  usuarioId?: string;
  produtoId?: string;
}

export interface DashboardMetrics {
  kpis: {
    propostas_mes: number;
    propostas_mes_anterior: number;
    valor_mes: number;
    valor_mes_anterior: number;
    em_analise: number;
    taxa_aprovacao_mes: number;
    taxa_aprovacao_mes_anterior: number;
    ticket_medio_mes: number;
    ticket_medio_mes_anterior: number;
    melhor_vendedor?: {
      nome: string;
      valor: number;
    };
  };
  trends: Array<{
    date: string;
    quantidade: number;
    valor: number;
  }>;
  statusFunnel: Array<{
    status: string;
    quantidade: number;
    valor: number;
    percentage: number;
  }>;
  propostasHoje: Array<{
    id: string;
    cliente_nome: string;
    produto_nome: string;
    banco_nome: string;
    valor: number;
    status: string;
    data: string;
  }>;
  ultimasPropostas: Array<{
    id: string;
    cliente_nome: string;
    produto_nome: string;
    valor: number;
    status: string;
    data: string;
  }>;
}

export function useDashboardMetrics(filters: DashboardFilters) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [filters]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      if (!profile?.empresa_id) throw new Error('Empresa não encontrada');

      // Período anterior para comparação
      const mesAnteriorStart = startOfMonth(subMonths(filters.startDate, 1));
      const mesAnteriorEnd = endOfMonth(subMonths(filters.startDate, 1));

      // KPIs do mês atual
      let queryMesAtual = supabase
        .from('propostas')
        .select('id, valor, status, usuario_id', { count: 'exact' })
        .eq('empresa_id', profile.empresa_id)
        .gte('data', filters.startDate.toISOString())
        .lte('data', filters.endDate.toISOString());

      if (filters.usuarioId) queryMesAtual = queryMesAtual.eq('usuario_id', filters.usuarioId);
      if (filters.produtoId) queryMesAtual = queryMesAtual.eq('produto_id', filters.produtoId);

      const { data: propostasMes, count: countMes } = await queryMesAtual;

      // KPIs do mês anterior
      let queryMesAnterior = supabase
        .from('propostas')
        .select('id, valor, status', { count: 'exact' })
        .eq('empresa_id', profile.empresa_id)
        .gte('data', mesAnteriorStart.toISOString())
        .lte('data', mesAnteriorEnd.toISOString());

      if (filters.usuarioId) queryMesAnterior = queryMesAnterior.eq('usuario_id', filters.usuarioId);
      if (filters.produtoId) queryMesAnterior = queryMesAnterior.eq('produto_id', filters.produtoId);

      const { data: propostasMesAnterior, count: countMesAnterior } = await queryMesAnterior;

      // Calcular métricas
      const valorMes = propostasMes?.reduce((sum, p) => sum + (p.valor || 0), 0) || 0;
      const valorMesAnterior = propostasMesAnterior?.reduce((sum, p) => sum + (p.valor || 0), 0) || 0;
      
      const aprovadasMes = propostasMes?.filter(p => p.status === 'aprovada') || [];
      const aprovadasMesAnterior = propostasMesAnterior?.filter(p => p.status === 'aprovada') || [];
      
      const taxaAprovacaoMes = countMes ? (aprovadasMes.length / countMes) * 100 : 0;
      const taxaAprovacaoMesAnterior = countMesAnterior ? (aprovadasMesAnterior.length / countMesAnterior) * 100 : 0;
      
      const ticketMedioMes = aprovadasMes.length 
        ? aprovadasMes.reduce((sum, p) => sum + (p.valor || 0), 0) / aprovadasMes.length 
        : 0;
      const ticketMedioMesAnterior = aprovadasMesAnterior.length
        ? aprovadasMesAnterior.reduce((sum, p) => sum + (p.valor || 0), 0) / aprovadasMesAnterior.length
        : 0;

      // Propostas em análise
      const { count: emAnalise } = await supabase
        .from('propostas')
        .select('id', { count: 'exact', head: true })
        .eq('empresa_id', profile.empresa_id)
        .eq('status', 'em_analise');

      // Melhor vendedor do mês
      const { data: vendedores } = await supabase
        .from('propostas')
        .select('usuario_id, valor')
        .eq('empresa_id', profile.empresa_id)
        .eq('status', 'aprovada')
        .gte('data', filters.startDate.toISOString())
        .lte('data', filters.endDate.toISOString());

      let melhorVendedor = undefined;
      if (vendedores && vendedores.length > 0) {
        const vendedoresMap = vendedores.reduce((acc, v) => {
          if (!v.usuario_id) return acc;
          if (!acc[v.usuario_id]) acc[v.usuario_id] = 0;
          acc[v.usuario_id] += v.valor || 0;
          return acc;
        }, {} as Record<string, number>);

        const topVendedorId = Object.entries(vendedoresMap).sort((a, b) => b[1] - a[1])[0];
        if (topVendedorId) {
          const { data: perfil } = await supabase
            .from('profiles')
            .select('nome')
            .eq('id', topVendedorId[0])
            .single();
          
          if (perfil) {
            melhorVendedor = {
              nome: perfil.nome || 'Sem nome',
              valor: topVendedorId[1]
            };
          }
        }
      }

      // Tendências (últimos 30 dias agrupados por dia)
      const { data: trendsData } = await supabase
        .from('propostas')
        .select('data, valor')
        .eq('empresa_id', profile.empresa_id)
        .gte('data', subMonths(new Date(), 1).toISOString())
        .order('data', { ascending: true });

      const trendsGrouped = trendsData?.reduce((acc, p) => {
        const date = p.data?.split('T')[0] || '';
        if (!acc[date]) acc[date] = { quantidade: 0, valor: 0 };
        acc[date].quantidade++;
        acc[date].valor += p.valor || 0;
        return acc;
      }, {} as Record<string, { quantidade: number; valor: number }>);

      const trends = Object.entries(trendsGrouped || {}).map(([date, data]) => ({
        date,
        ...data
      }));

      // Funil por status
      const { data: statusData } = await supabase
        .from('propostas')
        .select('status, valor')
        .eq('empresa_id', profile.empresa_id);

      const statusGrouped = statusData?.reduce((acc, p) => {
        const status = p.status || 'indefinido';
        if (!acc[status]) acc[status] = { quantidade: 0, valor: 0 };
        acc[status].quantidade++;
        acc[status].valor += p.valor || 0;
        return acc;
      }, {} as Record<string, { quantidade: number; valor: number }>);

      const totalPropostas = statusData?.length || 0;
      const statusFunnel = Object.entries(statusGrouped || {}).map(([status, data]) => ({
        status,
        ...data,
        percentage: totalPropostas ? (data.quantidade / totalPropostas) * 100 : 0
      }));

      // Propostas para hoje (regra: propostas com última atividade hoje ou atrasadas)
      // Como não temos campo específico de "prazo", usamos propostas em aberto criadas há mais de 3 dias
      const tresDiasAtras = subMonths(new Date(), 0);
      tresDiasAtras.setDate(tresDiasAtras.getDate() - 3);
      
      const { data: propostasHoje } = await supabase
        .from('propostas')
        .select(`
          id,
          valor,
          status,
          data,
          clientes(nome),
          produtos(nome),
          bancos(nome)
        `)
        .eq('empresa_id', profile.empresa_id)
        .in('status', ['em_analise', 'doc_pendente', 'em_processamento'])
        .lte('data', tresDiasAtras.toISOString())
        .order('data', { ascending: true })
        .limit(10);

      // Últimas propostas criadas
      const { data: ultimasPropostas } = await supabase
        .from('propostas')
        .select(`
          id,
          valor,
          status,
          data,
          clientes(nome),
          produtos(nome)
        `)
        .eq('empresa_id', profile.empresa_id)
        .order('data', { ascending: false })
        .limit(10);

      setMetrics({
        kpis: {
          propostas_mes: countMes || 0,
          propostas_mes_anterior: countMesAnterior || 0,
          valor_mes: valorMes,
          valor_mes_anterior: valorMesAnterior,
          em_analise: emAnalise || 0,
          taxa_aprovacao_mes: taxaAprovacaoMes,
          taxa_aprovacao_mes_anterior: taxaAprovacaoMesAnterior,
          ticket_medio_mes: ticketMedioMes,
          ticket_medio_mes_anterior: ticketMedioMesAnterior,
          melhor_vendedor: melhorVendedor
        },
        trends,
        statusFunnel,
        propostasHoje: propostasHoje?.map(p => ({
          id: p.id,
          cliente_nome: (p.clientes as any)?.nome || 'Sem cliente',
          produto_nome: (p.produtos as any)?.nome || 'Sem produto',
          banco_nome: (p.bancos as any)?.nome || 'Sem banco',
          valor: p.valor || 0,
          status: p.status || '',
          data: p.data || ''
        })) || [],
        ultimasPropostas: ultimasPropostas?.map(p => ({
          id: p.id,
          cliente_nome: (p.clientes as any)?.nome || 'Sem cliente',
          produto_nome: (p.produtos as any)?.nome || 'Sem produto',
          valor: p.valor || 0,
          status: p.status || '',
          data: p.data || ''
        })) || []
      });
    } catch (error: any) {
      toast.error('Erro ao carregar métricas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return { metrics, loading, refresh: loadMetrics };
}
