import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ConversationList } from '@/components/whatsapp/ConversationList';
import { ChatWindow } from '@/components/whatsapp/ChatWindow';
import { Message } from '@/types/whatsapp';
import { useConversas } from '@/hooks/useConversas';
import { useMensagens } from '@/hooks/useMensagens';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function WhatsAppConversas() {
  const { conversations, loading, markAsRead } = useConversas();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId) || null;
  
  const { messages, sending, sendMessage } = useMensagens(selectedConversationId);

  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      const updatedConversation = {
        ...selectedConversation,
        messages
      };
    }
  }, [messages, selectedConversation]);

  const handleSelectConversation = async (id: string) => {
    setSelectedConversationId(id);
    setShowChatOnMobile(true);
    
    await markAsRead(id);
  };

  const handleSendMessage = async (message: Message) => {
    if (!selectedConversation) return;

    const success = await sendMessage(
      message.text,
      selectedConversation.contact.phone
    );

    if (!success) {
      console.error('Falha ao enviar mensagem');
    }
  };

  const handleBackToList = () => {
    setShowChatOnMobile(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-6rem)] flex overflow-hidden rounded-lg border bg-background">
        {/* Desktop: sempre mostra ambas as colunas */}
        <div className="hidden md:flex w-full">
          <div className="w-[380px]">
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
            />
          </div>
          <ChatWindow
            conversation={selectedConversation ? { ...selectedConversation, messages } : null}
            onSendMessage={handleSendMessage}
            sending={sending}
          />
        </div>

        {/* Mobile: alterna entre lista e chat */}
        <div className="flex md:hidden w-full">
          {!showChatOnMobile ? (
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
            />
          ) : (
            <ChatWindow
              conversation={selectedConversation ? { ...selectedConversation, messages } : null}
              onSendMessage={handleSendMessage}
              onBack={handleBackToList}
              sending={sending}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
