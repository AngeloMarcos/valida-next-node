import { supabase } from '@/integrations/supabase/client';
import { ConversaDB } from '@/types/whatsapp';

export class ConversaService {
  static async getConversas(filters?: {
    status?: 'ativo' | 'arquivado';
    search?: string;
  }) {
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
        .from('conversas')
        .select('*')
        .eq('empresa_id', profile.empresa_id)
        .order('ultima_data', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(
          `nome.ilike.%${filters.search}%,telefone.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      return data as ConversaDB[];
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
      throw error;
    }
  }

  static async createConversa(telefone: string, nome: string, origem: 'site' | 'wpp' = 'wpp') {
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
        .from('conversas')
        .insert({
          telefone,
          nome,
          origem,
          empresa_id: profile.empresa_id
        })
        .select()
        .single();

      if (error) throw error;

      return data as ConversaDB;
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      throw error;
    }
  }

  static async updateStatus(conversaId: string, status: 'ativo' | 'arquivado') {
    try {
      const { data, error } = await supabase
        .from('conversas')
        .update({ status })
        .eq('id', conversaId)
        .select()
        .single();

      if (error) throw error;

      return data as ConversaDB;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  }

  static async toggleStar(conversaId: string, isStarred: boolean) {
    try {
      const { data, error } = await supabase
        .from('conversas')
        .update({ is_starred: isStarred })
        .eq('id', conversaId)
        .select()
        .single();

      if (error) throw error;

      return data as ConversaDB;
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
      throw error;
    }
  }

  static async markAsRead(conversaId: string) {
    try {
      const { data, error } = await supabase
        .from('conversas')
        .update({ unread: 0 })
        .eq('id', conversaId)
        .select()
        .single();

      if (error) throw error;

      return data as ConversaDB;
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      throw error;
    }
  }

  static async updateLastMessage(conversaId: string, texto: string) {
    try {
      const { data, error } = await supabase
        .from('conversas')
        .update({ 
          ultimo_texto: texto,
          ultima_data: new Date().toISOString()
        })
        .eq('id', conversaId)
        .select()
        .single();

      if (error) throw error;

      return data as ConversaDB;
    } catch (error) {
      console.error('Erro ao atualizar última mensagem:', error);
      throw error;
    }
  }
}
