import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Produto {
  id: string;
  nome: string;
  tipo_credito: string | null;
  taxa_juros: number | null;
  status: string;
  banco_id: string | null;
  empresa_id: string | null;
  created_at: string;
  bancos?: {
    id: string;
    nome: string;
  };
}

export interface ProdutoFormData {
  nome: string;
  tipo_credito?: string;
  taxa_juros?: number;
  status: string;
  banco_id?: string;
}

export interface ProdutoFilters {
  banco_id?: string;
  status?: string;
  search?: string;
}

export function useProdutos() {
  const [loading, setLoading] = useState(false);

  const fetchProdutos = async (
    page: number = 1,
    pageSize: number = 10,
    filters?: ProdutoFilters
  ) => {
    setLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('produtos')
        .select('*, bancos(id, nome)', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.banco_id) {
        query = query.eq('banco_id', filters.banco_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.or(`nome.ilike.%${filters.search}%,tipo_credito.ilike.%${filters.search}%`);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      return {
        data: data as Produto[],
        count: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    } catch (error: any) {
      toast.error('Erro ao carregar produtos: ' + error.message);
      return { data: [], count: 0, totalPages: 0 };
    } finally {
      setLoading(false);
    }
  };

  const createProduto = async (formData: ProdutoFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('produtos').insert([formData]);

      if (error) throw error;

      toast.success('Produto cadastrado com sucesso!');
      return true;
    } catch (error: any) {
      toast.error('Erro ao cadastrar produto: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProduto = async (id: string, formData: ProdutoFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('produtos')
        .update(formData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Produto atualizado com sucesso!');
      return true;
    } catch (error: any) {
      toast.error('Erro ao atualizar produto: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduto = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('produtos').delete().eq('id', id);

      if (error) throw error;

      toast.success('Produto excluído com sucesso!');
      return true;
    } catch (error: any) {
      toast.error('Erro ao excluir produto: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProdutoStatus = async (id: string, status: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('produtos')
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
    fetchProdutos,
    createProduto,
    updateProduto,
    deleteProduto,
    updateProdutoStatus,
  };
}
