import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Send } from 'lucide-react';
import { Message } from '@/types/whatsapp';

interface ChatInputProps {
  conversationId: string;
  onSendMessage: (message: Message) => void;
  sending?: boolean;
}

export function ChatInput({ conversationId, onSendMessage, sending = false }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: `m-${Date.now()}`,
      conversationId,
      text: inputValue.trim(),
      timestamp: new Date(),
      sender: 'agent',
      status: 'sent'
    };

    onSendMessage(newMessage);
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-card p-4">
      <div className="flex items-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => {}}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma mensagem…"
          className="min-h-[44px] max-h-32 resize-none"
          rows={1}
        />

        <Button
          size="icon"
          className="shrink-0 bg-[#25D366] hover:bg-[#128C7E] text-white"
          onClick={handleSend}
          disabled={!inputValue.trim() || sending}
        >
          {sending ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
