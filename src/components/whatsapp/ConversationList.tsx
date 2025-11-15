import { useState } from 'react';
import { Conversation } from '@/types/whatsapp';
import { ConversationItem } from './ConversationItem';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.contact.phone.includes(searchQuery);
    const matchesTab = activeTab === 'active' ? !conv.isArchived : conv.isArchived;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="h-full flex flex-col border-r bg-card">
      <div className="p-4 border-b space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Conversas WhatsApp</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie todas as conversas da sua empresa
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar conversas…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'active' | 'archived')}>
          <TabsList className="w-full">
            <TabsTrigger value="active" className="flex-1">
              Ativas
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex-1">
              Arquivadas
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-sm">Nenhuma conversa encontrada</p>
          </div>
        ) : (
          <div>
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedConversationId}
                onClick={() => onSelectConversation(conversation.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
