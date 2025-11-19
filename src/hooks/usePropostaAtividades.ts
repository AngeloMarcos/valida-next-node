import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PropostaAtividade {
  id: string;
  proposta_id: string;
  tipo_atividade: string;
  descricao: string;
  status: string;
  data_atividade: string | null;
  data_agendamento: string | null;
  usuario_id: string | null;
  usuario_nome: string | null;
  created_at: string;
}

export interface PropostaAtividadeFormData {
  tipo_atividade: string;
  descricao: string;
  status: string;
  data_agendamento?: string;
}

export function usePropostaAtividades() {
  const [loading, setLoading] = useState(false);

  const fetchAtividades = async (propostaId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('proposta_atividades')
        .select('*')
        .eq('proposta_id', propostaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PropostaAtividade[];
    } catch (error: any) {
      toast.error('Erro ao carregar atividades: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createAtividade = async (propostaId: string, formData: PropostaAtividadeFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id, nome')
        .eq('id', user.id)
        .single();

      const { data, error } = await supabase
        .from('proposta_atividades')
        .insert([{
          proposta_id: propostaId,
          ...formData,
          usuario_id: user.id,
          usuario_nome: profile?.nome,
          empresa_id: profile?.empresa_id
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Atividade criada com sucesso!');
      return data;
    } catch (error: any) {
      toast.error('Erro ao criar atividade: ' + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateAtividade = async (id: string, formData: Partial<PropostaAtividadeFormData>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('proposta_atividades')
        .update(formData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Atividade atualizada com sucesso!');
      return true;
    } catch (error: any) {
      toast.error('Erro ao atualizar atividade: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAtividade = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('proposta_atividades')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Atividade removida com sucesso!');
      return true;
    } catch (error: any) {
      toast.error('Erro ao remover atividade: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchAtividades,
    createAtividade,
    updateAtividade,
    deleteAtividade,
  };
}
