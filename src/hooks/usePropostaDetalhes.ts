import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PropostaDetalhada {
  id: string;
  cliente_id: string | null;
  banco_id: string | null;
  produto_id: string | null;
  valor: number | null;
  data: string;
  empresa_id: string | null;
  observacoes: string | null;
  finalidade: string | null;
  status: string;
  tipo_proposta: 'credito' | 'consorcio' | 'seguro';
  detalhes_produto: any;
  usuario_id: string | null;
  clientes?: {
    id: string;
    nome: string;
    cpf: string | null;
    email: string | null;
  };
  bancos?: {
    id: string;
    nome: string;
    cnpj: string | null;
  };
  produtos?: {
    id: string;
    nome: string;
    tipo_credito: string | null;
    taxa_juros: number | null;
  };
}

export function usePropostaDetalhes(id: string) {
  const [proposta, setProposta] = useState<PropostaDetalhada | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposta = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('propostas')
        .select(`
          *,
          clientes(id, nome, cpf, email),
          bancos(id, nome, cnpj),
          produtos(id, nome, tipo_credito, taxa_juros)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setError('Proposta não encontrada');
        setProposta(null);
      } else {
        setProposta(data as PropostaDetalhada);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Erro ao carregar proposta';
      setError(errorMsg);
      toast.error(errorMsg);
      setProposta(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProposta();
    }
  }, [id]);

  return {
    proposta,
    loading,
    error,
    refetch: fetchProposta,
  };
}
