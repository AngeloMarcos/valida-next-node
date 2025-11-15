import { supabase } from '@/integrations/supabase/client';
import { MensagemDB } from '@/types/whatsapp';

export class MensagemService {
  static async getMensagens(conversaId: string) {
    try {
      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .eq('conversa_id', conversaId)
        .order('data', { ascending: true });

      if (error) throw error;

      return data as MensagemDB[];
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      throw error;
    }
  }

  static async createMensagem(
    conversaId: string,
    mensagem: string,
    tipo: 'usuario' | 'agente'
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      if (!profile?.empresa_id) throw new Error('Empresa não encontrada');

      const { data, error } = await supabase
        .from('mensagens')
        .insert({
          conversa_id: conversaId,
          mensagem,
          tipo,
          empresa_id: profile.empresa_id,
          status: 'enviado'
        })
        .select()
        .single();

      if (error) throw error;

      return data as MensagemDB;
    } catch (error) {
      console.error('Erro ao criar mensagem:', error);
      throw error;
    }
  }
}
