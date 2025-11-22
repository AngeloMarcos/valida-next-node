import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Promotora {
  id: string;
  nome: string;
  banco_id: string | null;
  telefone: string | null;
  email: string | null;
  contato: string | null;
  comissao_padrao: number | null;
  ativo: boolean | null;
  empresa_id: string | null;
  created_at: string;
  bancos?: { nome: string };
}

export interface PromotoraFormData {
  nome: string;
  banco_id?: string;
  telefone?: string;
  email?: string;
  contato?: string;
  comissao_padrao?: number;
}

export function usePromotoras() {
  const [promotoras, setPromotoras] = useState<Promotora[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotoras = async (searchTerm?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      if (!profile?.empresa_id) throw new Error('Empresa não encontrada');

      let query = supabase
        .from('promotoras')
        .select('*, bancos(nome)')
        .eq('empresa_id', profile.empresa_id)
        .eq('ativo', true);

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,contato.ilike.%${searchTerm}%`);
      }

      const { data, error: err } = await query.order('nome');

      if (err) throw err;
      setPromotoras(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao carregar promotoras: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const createPromotora = async (formData: PromotoraFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      if (!profile?.empresa_id) throw new Error('Empresa não encontrada');

      const { error } = await supabase
        .from('promotoras')
        .insert([{ ...formData, empresa_id: profile.empresa_id }]);

      if (error) throw error;

      toast.success('Promotora cadastrada com sucesso!');
      await fetchPromotoras();
      return true;
    } catch (error: any) {
      toast.error('Erro ao cadastrar promotora: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePromotora = async (id: string, formData: PromotoraFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('promotoras')
        .update(formData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Promotora atualizada com sucesso!');
      await fetchPromotoras();
      return true;
    } catch (error: any) {
      toast.error('Erro ao atualizar promotora: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deletePromotora = async (id: string) => {
    setLoading(true);
    try {
      // No caso das promotoras, sempre fazemos soft delete
      // pois podem estar vinculadas a propostas
      const { error } = await supabase
        .from('promotoras')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;

      toast.success('Promotora desativada com sucesso!');
      await fetchPromotoras();
      return true;
    } catch (error: any) {
      toast.error('Erro ao desativar promotora: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotoras();
  }, []);

  return {
    promotoras,
    loading,
    error,
    fetchPromotoras,
    createPromotora,
    updatePromotora,
    deletePromotora,
  };
}
