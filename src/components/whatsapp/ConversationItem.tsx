import { Conversation } from '@/types/whatsapp';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Clock } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

function getAvatarColor(name: string) {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500'
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function formatTimestamp(date: Date) {
  if (isToday(date)) {
    return format(date, 'HH:mm');
  } else if (isYesterday(date)) {
    return 'Ontem';
  } else {
    return format(date, 'dd/MM/yyyy');
  }
}

export function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-4 py-3 flex items-start gap-3 hover:bg-accent/50 transition-colors border-b',
        isSelected && 'bg-accent border-l-4 border-l-primary'
      )}
    >
      <Avatar className="h-12 w-12 shrink-0">
        <AvatarFallback className={cn(getAvatarColor(conversation.contact.name), 'text-white')}>
          {conversation.contact.initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className={cn(
            'font-medium truncate',
            conversation.unreadCount > 0 && 'font-bold'
          )}>
            {conversation.contact.name}
          </h4>
          <div className="flex items-center gap-1 shrink-0">
            {conversation.isStarred && (
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimestamp(conversation.timestamp)}
            </span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground truncate mb-1">
          {conversation.lastMessage}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {conversation.contact.phone}
          </span>
          {conversation.unreadCount > 0 && (
            <Badge className="bg-[#25D366] text-white hover:bg-[#128C7E] h-5 min-w-5 px-1.5">
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}
