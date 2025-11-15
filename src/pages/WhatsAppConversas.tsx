import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ConversationList } from '@/components/whatsapp/ConversationList';
import { ChatWindow } from '@/components/whatsapp/ChatWindow';
import { Conversation, Message } from '@/types/whatsapp';
import { mockConversations } from '@/data/mockWhatsApp';

export default function WhatsAppConversas() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId) || null;

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setShowChatOnMobile(true);
  };

  const handleSendMessage = (message: Message) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === message.conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, message],
            lastMessage: message.text,
            timestamp: message.timestamp
          };
        }
        return conv;
      })
    );
  };

  const handleBackToList = () => {
    setShowChatOnMobile(false);
  };

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
            conversation={selectedConversation}
            onSendMessage={handleSendMessage}
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
              conversation={selectedConversation}
              onSendMessage={handleSendMessage}
              onBack={handleBackToList}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
