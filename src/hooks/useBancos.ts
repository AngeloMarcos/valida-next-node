import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Banco {
  id: string;
  nome: string;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  ativo: boolean | null;
  empresa_id: string | null;
  created_at: string;
}

export interface BancoFormData {
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
}

export function useBancos() {
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBancos = async (searchTerm?: string) => {
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
        .from('bancos')
        .select('*')
        .eq('empresa_id', profile.empresa_id)
        .eq('ativo', true);

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,cnpj.ilike.%${searchTerm}%`);
      }

      const { data, error: err } = await query.order('nome');

      if (err) throw err;
      setBancos(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao carregar bancos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const createBanco = async (formData: BancoFormData) => {
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
        .from('bancos')
        .insert([{ ...formData, empresa_id: profile.empresa_id }]);

      if (error) throw error;

      toast.success('Banco cadastrado com sucesso!');
      await fetchBancos();
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
      await fetchBancos();
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
      // Check if there are proposals or products linked
      const { data: propostas, error: checkError } = await supabase
        .from('propostas')
        .select('id')
        .eq('banco_id', id)
        .limit(1);

      if (checkError) throw checkError;

      if (propostas && propostas.length > 0) {
        // Soft delete
        const { error } = await supabase
          .from('bancos')
          .update({ ativo: false })
          .eq('id', id);

        if (error) throw error;
        toast.success('Banco desativado com sucesso!');
      } else {
        // Hard delete
        const { error } = await supabase
          .from('bancos')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Banco excluído com sucesso!');
      }

      await fetchBancos();
      return true;
    } catch (error: any) {
      toast.error('Erro ao excluir banco: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBancos();
  }, []);

  return {
    bancos,
    loading,
    error,
    fetchBancos,
    createBanco,
    updateBanco,
    deleteBanco,
  };
}
