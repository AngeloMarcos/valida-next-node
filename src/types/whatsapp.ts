export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  initials: string;
  type: 'Cliente ativo' | 'Novo lead' | 'Em negociação';
}

export interface Message {
  id: string;
  conversationId: string;
  text: string;
  timestamp: Date;
  sender: 'client' | 'agent';
  status?: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  contact: Contact;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  isStarred: boolean;
  isArchived: boolean;
  messages: Message[];
}
