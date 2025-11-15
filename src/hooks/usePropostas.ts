import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Proposta {
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
  clientes?: {
    id: string;
    nome: string;
    cpf: string | null;
  };
  bancos?: {
    id: string;
    nome: string;
  };
  produtos?: {
    id: string;
    nome: string;
    tipo_credito: string | null;
  };
}

export interface PropostaFormData {
  cliente_id: string;
  banco_id?: string;
  produto_id?: string;
  valor: number;
  finalidade?: string;
  observacoes?: string;
  status: string;
  tipo_proposta: 'credito' | 'consorcio' | 'seguro';
  detalhes_produto?: any;
}

export interface PropostaFilters {
  status?: string;
  banco_id?: string;
  search?: string;
  tipo_proposta?: 'credito' | 'consorcio' | 'seguro';
}

export function usePropostas() {
  const [loading, setLoading] = useState(false);

  const fetchPropostas = async (
    page: number = 1,
    pageSize: number = 10,
    filters?: PropostaFilters
  ) => {
    setLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('propostas')
        .select(
          `
          *,
          clientes(id, nome, cpf),
          bancos(id, nome),
          produtos(id, nome, tipo_credito)
        `,
          { count: 'exact' }
        )
        .order('data', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.banco_id) {
        query = query.eq('banco_id', filters.banco_id);
      }
      if (filters?.tipo_proposta) {
        query = query.eq('tipo_proposta', filters.tipo_proposta);
      }
      if (filters?.search) {
        // Search in related cliente name
        const { data: clienteResults } = await supabase
          .from('clientes')
          .select('id')
          .ilike('nome', `%${filters.search}%`);
        
        if (clienteResults && clienteResults.length > 0) {
          const clienteIds = clienteResults.map(c => c.id);
          query = query.in('cliente_id', clienteIds);
        }
      }

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      return {
        data: data as Proposta[],
        count: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    } catch (error: any) {
      toast.error('Erro ao carregar propostas: ' + error.message);
      return { data: [], count: 0, totalPages: 0 };
    } finally {
      setLoading(false);
    }
  };

  const getPropostaById = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('propostas')
        .select(
          `
          *,
          clientes(id, nome, cpf, email),
          bancos(id, nome, cnpj),
          produtos(id, nome, tipo_credito, taxa_juros)
        `
        )
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      return data as Proposta | null;
    } catch (error: any) {
      toast.error('Erro ao carregar proposta: ' + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createProposta = async (formData: PropostaFormData) => {
    setLoading(true);
    try {
      // Get current user's empresa_id
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
        .from('propostas')
        .insert([{ ...formData, empresa_id: profile.empresa_id }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Proposta cadastrada com sucesso!');
      return data;
    } catch (error: any) {
      toast.error('Erro ao cadastrar proposta: ' + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProposta = async (id: string, formData: PropostaFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('propostas')
        .update(formData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Proposta atualizada com sucesso!');
      return true;
    } catch (error: any) {
      toast.error('Erro ao atualizar proposta: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteProposta = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('propostas').delete().eq('id', id);

      if (error) throw error;

      toast.success('Proposta excluída com sucesso!');
      return true;
    } catch (error: any) {
      toast.error('Erro ao excluir proposta: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePropostaStatus = async (id: string, status: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('propostas')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast.success('Status atualizado com sucesso!');
      return true;
    } catch (error: any) {
      toast.error('Erro ao atualizar status: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchPropostas,
    getPropostaById,
    createProposta,
    updateProposta,
    deleteProposta,
    updatePropostaStatus,
  };
}
