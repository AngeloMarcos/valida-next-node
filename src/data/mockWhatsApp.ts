import { Conversation } from '@/types/whatsapp';

export const mockConversations: Conversation[] = [
  {
    id: '1',
    contact: {
      id: 'c1',
      name: 'João Silva',
      phone: '+55 11 99999-1234',
      initials: 'JS',
      type: 'Cliente ativo'
    },
    lastMessage: 'Obrigado pelo excelente atendimento!',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    unreadCount: 3,
    isStarred: false,
    isArchived: false,
    messages: [
      {
        id: 'm1',
        conversationId: '1',
        text: 'Olá, tudo bem? Gostaria de falar sobre um orçamento.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        sender: 'client'
      },
      {
        id: 'm2',
        conversationId: '1',
        text: 'Olá, tudo bem sim! Claro, posso te ajudar. Qual é a sua necessidade?',
        timestamp: new Date(Date.now() - 1000 * 60 * 55),
        sender: 'agent'
      },
      {
        id: 'm3',
        conversationId: '1',
        text: 'Quero uma proposta para financiamento empresarial.',
        timestamp: new Date(Date.now() - 1000 * 60 * 50),
        sender: 'client'
      },
      {
        id: 'm4',
        conversationId: '1',
        text: 'Perfeito, me passe o CNPJ e o valor aproximado que você pretende.',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        sender: 'agent'
      },
      {
        id: 'm5',
        conversationId: '1',
        text: 'CNPJ: 12.345.678/0001-90, valor aproximado de R$ 500.000',
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        sender: 'client'
      },
      {
        id: 'm6',
        conversationId: '1',
        text: 'Obrigado pelo excelente atendimento!',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        sender: 'client'
      }
    ]
  },
  {
    id: '2',
    contact: {
      id: 'c2',
      name: 'Maria Santos',
      phone: '+55 11 98888-5678',
      initials: 'MS',
      type: 'Novo lead'
    },
    lastMessage: 'Quando vocês podem enviar o orçamento?',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    unreadCount: 0,
    isStarred: false,
    isArchived: false,
    messages: [
      {
        id: 'm7',
        conversationId: '2',
        text: 'Boa tarde! Vi vocês no Google e gostaria de mais informações.',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        sender: 'client'
      },
      {
        id: 'm8',
        conversationId: '2',
        text: 'Boa tarde, Maria! Que bom que nos encontrou. Em que posso ajudar?',
        timestamp: new Date(Date.now() - 1000 * 60 * 115),
        sender: 'agent'
      },
      {
        id: 'm9',
        conversationId: '2',
        text: 'Preciso de um empréstimo consignado. Como funciona?',
        timestamp: new Date(Date.now() - 1000 * 60 * 110),
        sender: 'client'
      },
      {
        id: 'm10',
        conversationId: '2',
        text: 'Vou preparar um orçamento personalizado para você. Pode me passar seu CPF?',
        timestamp: new Date(Date.now() - 1000 * 60 * 105),
        sender: 'agent'
      },
      {
        id: 'm11',
        conversationId: '2',
        text: 'Quando vocês podem enviar o orçamento?',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        sender: 'client'
      }
    ]
  },
  {
    id: '3',
    contact: {
      id: 'c3',
      name: 'Empresa ABC Ltda',
      phone: '+55 11 97777-9999',
      initials: 'EA',
      type: 'Em negociação'
    },
    lastMessage: 'Precisamos discutir o contrato.',
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    unreadCount: 1,
    isStarred: true,
    isArchived: false,
    messages: [
      {
        id: 'm12',
        conversationId: '3',
        text: 'Bom dia! Recebemos a proposta de vocês.',
        timestamp: new Date(Date.now() - 1000 * 60 * 180),
        sender: 'client'
      },
      {
        id: 'm13',
        conversationId: '3',
        text: 'Bom dia! Que ótimo! Ficou alguma dúvida?',
        timestamp: new Date(Date.now() - 1000 * 60 * 175),
        sender: 'agent'
      },
      {
        id: 'm14',
        conversationId: '3',
        text: 'Precisamos discutir o contrato.',
        timestamp: new Date(Date.now() - 1000 * 60 * 90),
        sender: 'client'
      }
    ]
  },
  {
    id: '4',
    contact: {
      id: 'c4',
      name: 'Pedro Costa',
      phone: '+55 11 96666-3333',
      initials: 'PC',
      type: 'Cliente ativo'
    },
    lastMessage: 'Tudo certo com a documentação?',
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    unreadCount: 0,
    isStarred: false,
    isArchived: false,
    messages: [
      {
        id: 'm15',
        conversationId: '4',
        text: 'Oi! Enviei os documentos por e-mail.',
        timestamp: new Date(Date.now() - 1000 * 60 * 200),
        sender: 'client'
      },
      {
        id: 'm16',
        conversationId: '4',
        text: 'Perfeito, Pedro! Vou analisar e te retorno em breve.',
        timestamp: new Date(Date.now() - 1000 * 60 * 195),
        sender: 'agent'
      },
      {
        id: 'm17',
        conversationId: '4',
        text: 'Tudo certo com a documentação?',
        timestamp: new Date(Date.now() - 1000 * 60 * 180),
        sender: 'client'
      }
    ]
  },
  {
    id: '5',
    contact: {
      id: 'c5',
      name: 'Ana Rodrigues',
      phone: '+55 11 95555-7777',
      initials: 'AR',
      type: 'Novo lead'
    },
    lastMessage: 'Vocês conseguem me retornar ainda hoje?',
    timestamp: new Date(Date.now() - 1000 * 60 * 240),
    unreadCount: 2,
    isStarred: false,
    isArchived: false,
    messages: [
      {
        id: 'm18',
        conversationId: '5',
        text: 'Olá! Preciso de crédito imobiliário urgente.',
        timestamp: new Date(Date.now() - 1000 * 60 * 260),
        sender: 'client'
      },
      {
        id: 'm19',
        conversationId: '5',
        text: 'Olá, Ana! Vamos te ajudar. Qual o valor do imóvel?',
        timestamp: new Date(Date.now() - 1000 * 60 * 255),
        sender: 'agent'
      },
      {
        id: 'm20',
        conversationId: '5',
        text: 'Vocês conseguem me retornar ainda hoje?',
        timestamp: new Date(Date.now() - 1000 * 60 * 240),
        sender: 'client'
      }
    ]
  }
];
