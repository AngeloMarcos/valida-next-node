import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Cliente {
  id: string;
  nome: string;
  cpf: string | null;
  email: string | null;
  ativo: boolean | null;
  empresa_id: string | null;
  created_at: string;
}

export interface ClienteFormData {
  nome: string;
  cpf?: string;
  email?: string;
}

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = async (searchTerm?: string) => {
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
        .from('clientes')
        .select('*')
        .eq('empresa_id', profile.empresa_id)
        .eq('ativo', true);

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error: err } = await query.order('nome');
      
      if (err) throw err;
      setClientes(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao carregar clientes: ' + err.message);
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

      if (!profile?.empresa_id) throw new Error('Empresa não encontrada');

      const { error } = await supabase
        .from('clientes')
        .insert([{ ...formData, empresa_id: profile.empresa_id }]);

      if (error) throw error;

      toast.success('Cliente cadastrado com sucesso!');
      await fetchClientes();
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
      await fetchClientes();
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
      // Check if there are proposals linked to this client
      const { data: propostas, error: checkError } = await supabase
        .from('propostas')
        .select('id')
        .eq('cliente_id', id)
        .limit(1);

      if (checkError) throw checkError;

      if (propostas && propostas.length > 0) {
        // Soft delete - just deactivate
        const { error } = await supabase
          .from('clientes')
          .update({ ativo: false })
          .eq('id', id);

        if (error) throw error;
        toast.success('Cliente desativado com sucesso!');
      } else {
        // Hard delete
        const { error } = await supabase
          .from('clientes')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Cliente excluído com sucesso!');
      }

      await fetchClientes();
      return true;
    } catch (error: any) {
      toast.error('Erro ao excluir cliente: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return {
    clientes,
    loading,
    error,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
  };
}
