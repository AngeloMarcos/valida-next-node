import { useState, useEffect } from 'react';
import { MensagemService } from '@/services/whatsapp/MensagemService';
import { ConversaService } from '@/services/whatsapp/ConversaService';
import { N8NService } from '@/services/whatsapp/N8NService';
import { supabase } from '@/integrations/supabase/client';
import { Message, MensagemDB, mensagemDBToMessage } from '@/types/whatsapp';
import { toast } from 'sonner';

export function useMensagens(conversaId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadMensagens = async (id: string) => {
    try {
      setLoading(true);
      const mensagensDB = await MensagemService.getMensagens(id);
      const messagesConverted = mensagensDB.map(mensagemDBToMessage);
      setMessages(messagesConverted);
    } catch (error: any) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (texto: string, telefone: string) => {
    if (!conversaId) return;

    try {
      setSending(true);

      const mensagemDB = await MensagemService.createMensagem(
        conversaId,
        texto,
        'agente'
      );

      await ConversaService.updateLastMessage(conversaId, texto);

      try {
        await N8NService.sendMessage({
          telefone,
          mensagem: texto,
          origem: 'painel'
        });
      } catch (n8nError) {
        console.error('Erro ao enviar para N8N:', n8nError);
        toast.error('Mensagem salva, mas houve erro ao enviar via WhatsApp');
      }

      const newMessage = mensagemDBToMessage(mensagemDB);
      setMessages(prev => [...prev, newMessage]);

      toast.success('Mensagem enviada!');
      return true;
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem: ' + error.message);
      return false;
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!conversaId) {
      setMessages([]);
      return;
    }

    loadMensagens(conversaId);

    const channel = supabase
      .channel(`mensagens-${conversaId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens',
          filter: `conversa_id=eq.${conversaId}`
        },
        (payload) => {
          console.log('Nova mensagem recebida:', payload);
          const newMensagem = payload.new as MensagemDB;
          const newMessage = mensagemDBToMessage(newMensagem);
          
          setMessages(prev => {
            if (prev.some(m => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversaId]);

  return {
    messages,
    loading,
    sending,
    sendMessage,
    loadMensagens
  };
}
