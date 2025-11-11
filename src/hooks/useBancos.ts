import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Banco {
  id: string;
  nome: string;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  empresa_id: string | null;
  created_at: string;
}

export interface BancoFormData {
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  empresa_id?: string;
}

export function useBancos() {
  const [loading, setLoading] = useState(false);

  const fetchBancos = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('bancos')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        data: data as Banco[],
        count: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    } catch (error: any) {
      toast.error('Erro ao carregar bancos: ' + error.message);
      return { data: [], count: 0, totalPages: 0 };
    } finally {
      setLoading(false);
    }
  };

  const createBanco = async (formData: BancoFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bancos')
        .insert([formData]);

      if (error) throw error;

      toast.success('Banco cadastrado com sucesso!');
      return true;
    } catch (error: any) {
      toast.error('Erro ao cadastrar banco: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateBanco = async (id: string, formData: BancoFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bancos')
        .update(formData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Banco atualizado com sucesso!');
      return true;
    } catch (error: any) {
      toast.error('Erro ao atualizar banco: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteBanco = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bancos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Banco excluído com sucesso!');
      return true;
    } catch (error: any) {
      toast.error('Erro ao excluir banco: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const searchBancos = async (searchTerm: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bancos')
        .select('*')
        .or(`nome.ilike.%${searchTerm}%,cnpj.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as Banco[];
    } catch (error: any) {
      toast.error('Erro ao buscar bancos: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchBancos,
    createBanco,
    updateBanco,
    deleteBanco,
    searchBancos,
  };
}
