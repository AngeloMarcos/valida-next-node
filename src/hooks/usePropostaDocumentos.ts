import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PropostaDocumento {
  id: string;
  proposta_id: string;
  nome_documento: string;
  obrigatorio: boolean;
  status_documento: string;
  data_recebimento: string | null;
  observacao: string | null;
  usuario_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropostaDocumentoFormData {
  nome_documento: string;
  obrigatorio: boolean;
  status_documento: string;
  data_recebimento?: string;
  observacao?: string;
}

export function usePropostaDocumentos() {
  const [loading, setLoading] = useState(false);

  const fetchDocumentos = async (propostaId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('proposta_documentos')
        .select('*')
        .eq('proposta_id', propostaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PropostaDocumento[];
    } catch (error: any) {
      toast.error('Erro ao carregar documentos: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createDocumento = async (propostaId: string, formData: PropostaDocumentoFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      const { data, error } = await supabase
        .from('proposta_documentos')
        .insert([{
          proposta_id: propostaId,
          ...formData,
          usuario_id: user.id,
          empresa_id: profile?.empresa_id
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Documento adicionado com sucesso!');
      return data;
    } catch (error: any) {
      toast.error('Erro ao adicionar documento: ' + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateDocumento = async (id: string, formData: Partial<PropostaDocumentoFormData>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('proposta_documentos')
        .update(formData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Documento atualizado com sucesso!');
      return true;
    } catch (error: any) {
      toast.error('Erro ao atualizar documento: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocumento = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('proposta_documentos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Documento removido com sucesso!');
      return true;
    } catch (error: any) {
      toast.error('Erro ao remover documento: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchDocumentos,
    createDocumento,
    updateDocumento,
    deleteDocumento,
  };
}
