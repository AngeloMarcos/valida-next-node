// Tipos do banco de dados
export interface ConversaDB {
  id: string;
  telefone: string;
  nome: string;
  ultimo_texto: string | null;
  ultima_data: string;
  status: 'ativo' | 'arquivado';
  unread: number;
  origem: 'site' | 'wpp';
  is_starred: boolean;
  empresa_id: string;
  created_at: string;
  updated_at: string;
}

export interface MensagemDB {
  id: string;
  conversa_id: string;
  mensagem: string;
  tipo: 'usuario' | 'agente';
  data: string;
  status: 'enviado' | 'lido' | 'entregue';
  empresa_id: string;
  created_at: string;
}

// Tipos da aplicação (compatíveis com a UI existente)
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

// Funções de transformação
export function conversaDBToConversation(conversaDB: ConversaDB, messages: MensagemDB[]): Conversation {
  const initials = conversaDB.nome
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return {
    id: conversaDB.id,
    contact: {
      id: conversaDB.id,
      name: conversaDB.nome,
      phone: conversaDB.telefone,
      initials,
      type: 'Cliente ativo'
    },
    lastMessage: conversaDB.ultimo_texto || '',
    timestamp: new Date(conversaDB.ultima_data),
    unreadCount: conversaDB.unread,
    isStarred: conversaDB.is_starred,
    isArchived: conversaDB.status === 'arquivado',
    messages: messages.map(mensagemDBToMessage)
  };
}

export function mensagemDBToMessage(mensagemDB: MensagemDB): Message {
  return {
    id: mensagemDB.id,
    conversationId: mensagemDB.conversa_id,
    text: mensagemDB.mensagem,
    timestamp: new Date(mensagemDB.data),
    sender: mensagemDB.tipo === 'agente' ? 'agent' : 'client',
    status: mensagemDB.status === 'enviado' ? 'sent' : 
            mensagemDB.status === 'lido' ? 'read' : 'delivered'
  };
}

// Payloads para APIs
export interface N8NWebhookPayload {
  telefone: string;
  mensagem: string;
  origem: 'painel';
}
