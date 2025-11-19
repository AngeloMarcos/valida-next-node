import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PropostaHistorico {
  id: string;
  proposta_id: string;
  status_anterior: string | null;
  status_novo: string;
  observacao: string | null;
  usuario_id: string | null;
  usuario_nome: string | null;
  created_at: string;
}

export function usePropostaHistorico() {
  const [loading, setLoading] = useState(false);

  const fetchHistorico = async (propostaId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('proposta_historico')
        .select('*')
        .eq('proposta_id', propostaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PropostaHistorico[];
    } catch (error: any) {
      toast.error('Erro ao carregar histórico: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchHistorico,
  };
}
