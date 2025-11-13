import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Cliente {
  id: string;
  nome: string;
  cpf: string | null;
  email: string | null;
  empresa_id: string | null;
  created_at: string;
}

export interface ClienteFormData {
  nome: string;
  cpf?: string;
  email?: string;
}

export function useClientes() {
  const [loading, setLoading] = useState(false);

  const fetchClientes = async (page: number = 1, pageSize: number = 10, searchTerm?: string) => {
    setLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('clientes')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      return {
        data: data as Cliente[],
        count: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    } catch (error: any) {
      toast.error('Erro ao carregar clientes: ' + error.message);
      return { data: [], count: 0, totalPages: 0 };
    } finally {
      setLoading(false);
    }
  };

  const createCliente = async (formData: ClienteFormData) => {
    setLoading(true);
    try {
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

      const { error } = await supabase
        .from('clientes')
        .insert([{ ...formData, empresa_id: profile.empresa_id }]);

      if (error) throw error;

      toast.success('Cliente cadastrado com sucesso!');
      return true;
    } catch (error: any) {
      toast.error('Erro ao cadastrar cliente: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCliente = async (id: string, formData: ClienteFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('clientes')
        .update(formData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Cliente atualizado com sucesso!');
      return true;
    } catch (error: any) {
      toast.error('Erro ao atualizar cliente: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCliente = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Cliente excluído com sucesso!');
      return true;
    } catch (error: any) {
      toast.error('Erro ao excluir cliente: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
  };
}
