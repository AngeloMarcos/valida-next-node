import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrendData {
  month: string;
  count: number;
  total_valor: number;
  avg_valor: number;
}

interface StatusBreakdown {
  status: string;
  count: number;
  total_valor: number;
  avg_valor: number;
  percentage: number;
}

interface RecentProposta {
  id: string;
  cliente_nome: string;
  banco_nome: string;
  produto_nome: string;
  valor: number;
  status: string;
  data: string;
}

export function useDashboardData() {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown[]>([]);
  const [recentPropostas, setRecentPropostas] = useState<RecentProposta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      if (!profile?.empresa_id) throw new Error('Empresa não encontrada');

      // Carregar tendências mensais
      const { data: trendsData, error: trendsError } = await supabase
        .rpc('get_monthly_proposta_trends', { _empresa_id: profile.empresa_id });

      if (trendsError) throw trendsError;
      setTrends(trendsData || []);

      // Carregar breakdown por status
      const { data: statusData, error: statusError } = await supabase
        .rpc('get_proposta_status_breakdown', { _empresa_id: profile.empresa_id });

      if (statusError) throw statusError;
      setStatusBreakdown(statusData || []);

      // Carregar propostas recentes
      const { data: recentData, error: recentError } = await supabase
        .rpc('get_recent_propostas', { _empresa_id: profile.empresa_id, _limit: 5 });

      if (recentError) throw recentError;
      setRecentPropostas(recentData || []);
    } catch (error: any) {
      toast.error('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return { trends, statusBreakdown, recentPropostas, loading };
}
