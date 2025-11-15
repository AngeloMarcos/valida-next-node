import { useState, useEffect } from 'react';
import { ConversaService } from '@/services/whatsapp/ConversaService';
import { MensagemService } from '@/services/whatsapp/MensagemService';
import { supabase } from '@/integrations/supabase/client';
import { 
  Conversation, 
  ConversaDB, 
  MensagemDB,
  conversaDBToConversation 
} from '@/types/whatsapp';
import { toast } from 'sonner';

export function useConversas() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversas = async (filters?: {
    status?: 'ativo' | 'arquivado';
    search?: string;
  }) => {
    try {
      setLoading(true);
      const conversasDB = await ConversaService.getConversas(filters);

      const conversationsWithMessages = await Promise.all(
        conversasDB.map(async (conversaDB) => {
          const mensagens = await MensagemService.getMensagens(conversaDB.id);
          return conversaDBToConversation(conversaDB, mensagens);
        })
      );

      setConversations(conversationsWithMessages);
    } catch (error: any) {
      console.error('Erro ao carregar conversas:', error);
      toast.error('Erro ao carregar conversas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleArchive = async (conversaId: string, isArchived: boolean) => {
    try {
      const status = isArchived ? 'arquivado' : 'ativo';
      await ConversaService.updateStatus(conversaId, status);
      
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversaId ? { ...conv, isArchived } : conv
        )
      );

      toast.success(isArchived ? 'Conversa arquivada' : 'Conversa restaurada');
    } catch (error: any) {
      toast.error('Erro ao atualizar conversa: ' + error.message);
    }
  };

  const toggleStar = async (conversaId: string, isStarred: boolean) => {
    try {
      await ConversaService.toggleStar(conversaId, isStarred);
      
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversaId ? { ...conv, isStarred } : conv
        )
      );

      toast.success(isStarred ? 'Conversa marcada' : 'Marca removida');
    } catch (error: any) {
      toast.error('Erro ao atualizar conversa: ' + error.message);
    }
  };

  const markAsRead = async (conversaId: string) => {
    try {
      await ConversaService.markAsRead(conversaId);
      
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversaId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (error: any) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  useEffect(() => {
    loadConversas();

    const channel = supabase
      .channel('conversas-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversas'
        },
        (payload) => {
          console.log('Conversa alterada:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
            loadConversas();
          } else if (payload.eventType === 'UPDATE') {
            const updatedConversa = payload.new as ConversaDB;
            setConversations(prev => {
              const index = prev.findIndex(c => c.id === updatedConversa.id);
              if (index === -1) return prev;
              
              const updated = [...prev];
              updated[index] = {
                ...updated[index],
                lastMessage: updatedConversa.ultimo_texto || '',
                timestamp: new Date(updatedConversa.ultima_data),
                unreadCount: updatedConversa.unread,
                isStarred: updatedConversa.is_starred,
                isArchived: updatedConversa.status === 'arquivado'
              };
              
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    conversations,
    loading,
    loadConversas,
    toggleArchive,
    toggleStar,
    markAsRead
  };
}
