import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PropostaAnexo {
  id: string;
  proposta_id: string;
  nome_arquivo: string;
  url_arquivo: string;
  tipo_arquivo: string | null;
  tamanho_bytes: number | null;
  usuario_id: string | null;
  usuario_nome: string | null;
  created_at: string;
}

export function usePropostaAnexos() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchAnexos = async (propostaId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('proposta_anexos')
        .select('*')
        .eq('proposta_id', propostaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PropostaAnexo[];
    } catch (error: any) {
      toast.error('Erro ao carregar anexos: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const uploadAnexo = async (propostaId: string, file: File) => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id, nome')
        .eq('id', user.id)
        .single();

      if (!profile?.empresa_id) throw new Error('Empresa não encontrada');

      // Upload para storage
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${profile.empresa_id}/${propostaId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('proposta-anexos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('proposta-anexos')
        .getPublicUrl(filePath);

      // Salvar registro na tabela
      const { data, error } = await supabase
        .from('proposta_anexos')
        .insert([{
          proposta_id: propostaId,
          nome_arquivo: file.name,
          url_arquivo: filePath,
          tipo_arquivo: file.type,
          tamanho_bytes: file.size,
          usuario_id: user.id,
          usuario_nome: profile.nome,
          empresa_id: profile.empresa_id
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Arquivo enviado com sucesso!');
      return data;
    } catch (error: any) {
      toast.error('Erro ao enviar arquivo: ' + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const downloadAnexo = async (anexo: PropostaAnexo) => {
    try {
      const { data, error } = await supabase.storage
        .from('proposta-anexos')
        .download(anexo.url_arquivo);

      if (error) throw error;

      // Criar URL temporária e fazer download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = anexo.nome_arquivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Download iniciado!');
    } catch (error: any) {
      toast.error('Erro ao baixar arquivo: ' + error.message);
    }
  };

  const deleteAnexo = async (anexo: PropostaAnexo) => {
    setLoading(true);
    try {
      // Deletar do storage
      const { error: storageError } = await supabase.storage
        .from('proposta-anexos')
        .remove([anexo.url_arquivo]);

      if (storageError) throw storageError;

      // Deletar registro da tabela
      const { error } = await supabase
        .from('proposta_anexos')
        .delete()
        .eq('id', anexo.id);

      if (error) throw error;

      toast.success('Arquivo removido com sucesso!');
      return true;
    } catch (error: any) {
      toast.error('Erro ao remover arquivo: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    uploading,
    fetchAnexos,
    uploadAnexo,
    downloadAnexo,
    deleteAnexo,
  };
}
