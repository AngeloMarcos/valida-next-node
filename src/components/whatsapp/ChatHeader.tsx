import { Contact } from '@/types/whatsapp';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Archive, CheckCircle, Info, ArrowLeft } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatHeaderProps {
  contact: Contact;
  onBack?: () => void;
}

export function ChatHeader({ contact, onBack }: ChatHeaderProps) {
  return (
    <div className="border-b bg-card px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="md:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-[#25D366] text-white">
              {contact.initials}
            </AvatarFallback>
          </Avatar>

          <div>
            <h3 className="font-semibold text-foreground">{contact.name}</h3>
            <p className="text-sm text-muted-foreground">{contact.phone}</p>
            <Badge variant="secondary" className="mt-1 text-xs">
              {contact.type}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Archive className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Arquivar conversa</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <CheckCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Marcar como resolvida</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Detalhes do cliente</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
