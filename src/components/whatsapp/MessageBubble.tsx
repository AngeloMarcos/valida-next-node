import { Message } from '@/types/whatsapp';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAgent = message.sender === 'agent';

  return (
    <div className={cn('flex w-full mb-3', isAgent ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2',
          isAgent
            ? 'bg-[#25D366] text-white rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
        <span
          className={cn(
            'text-xs mt-1 block text-right',
            isAgent ? 'text-white/70' : 'text-muted-foreground'
          )}
        >
          {format(message.timestamp, 'HH:mm')}
        </span>
      </div>
    </div>
  );
}
