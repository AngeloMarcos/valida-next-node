import { Conversation, Message } from '@/types/whatsapp';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { EmptyState } from '@/components/shared/EmptyState';
import { MessageCircle } from 'lucide-react';

interface ChatWindowProps {
  conversation: Conversation | null;
  onSendMessage: (message: Message) => void;
  onBack?: () => void;
  sending?: boolean;
}

export function ChatWindow({ conversation, onSendMessage, onBack, sending = false }: ChatWindowProps) {
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/10">
        <EmptyState
          icon={MessageCircle}
          title="Nenhuma conversa selecionada"
          description="Escolha uma conversa na lista para começar"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <ChatHeader contact={conversation.contact} onBack={onBack} />
      <ChatMessages messages={conversation.messages} />
      <ChatInput
        conversationId={conversation.id}
        onSendMessage={onSendMessage}
        sending={sending}
      />
    </div>
  );
}
