// Mock API - Replace with real backend calls

export interface Client {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
}

export interface Proposal {
  id: string;
  title: string;
  status: 'aberta' | 'em_analise' | 'aprovada' | 'reprovada';
  amount: number;
  clientId: string;
  clientName?: string;
  userId: string;
  createdAt: string;
}

export interface Bank {
  id: string;
  name: string;
  code: string;
  logo_url?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  notes?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  type: 'credit' | 'consortium' | 'financing';
  bank_id: string;
  bank_name?: string;
  min_amount: number;
  max_amount: number;
  min_installments: number;
  max_installments: number;
  interest_rate: number;
  description?: string;
  is_active: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalClients: number;
  totalProposals: number;
  openProposals: number;
  approvedProposals: number;
  totalAmount: number;
  inAnalysisProposals: number;
  approvalRate: number;
  avgTicket: number;
}

// Mock data storage
let mockClients: Client[] = [
  {
    id: '1',
    name: 'João Silva Santos',
    document: '123.456.789-00',
    phone: '(11) 98765-4321',
    email: 'joao.silva@email.com',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Maria Oliveira Lima',
    document: '987.654.321-00',
    phone: '(11) 91234-5678',
    email: 'maria.oliveira@email.com',
    address: 'Av. Paulista, 1000 - São Paulo, SP',
    createdAt: new Date().toISOString(),
  },
];

let mockBanks: Bank[] = [
  {
    id: '1',
    name: 'Banco do Brasil',
    code: '001',
    logo_url: 'https://logo.clearbit.com/bb.com.br',
    contact_email: 'parceiros@bb.com.br',
    contact_phone: '(61) 3493-9000',
    is_active: true,
    notes: 'Principal parceiro - taxas competitivas',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Caixa Econômica Federal',
    code: '104',
    logo_url: 'https://logo.clearbit.com/caixa.gov.br',
    contact_email: 'comercial@caixa.gov.br',
    contact_phone: '(61) 3206-9000',
    is_active: true,
    notes: 'Especialista em consórcio imobiliário',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Bradesco',
    code: '237',
    logo_url: 'https://logo.clearbit.com/bradesco.com.br',
    contact_email: 'negocios@bradesco.com.br',
    contact_phone: '(11) 3684-9000',
    is_active: false,
    notes: 'Parceria temporariamente suspensa',
    createdAt: new Date().toISOString(),
  },
];

let mockProducts: Product[] = [
  {
    id: '1',
    name: 'Crédito Pessoal Turbo',
    type: 'credit',
    bank_id: '1',
    bank_name: 'Banco do Brasil',
    min_amount: 5000,
    max_amount: 100000,
    min_installments: 12,
    max_installments: 60,
    interest_rate: 1.99,
    description: 'Crédito rápido com taxas competitivas',
    is_active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Consórcio Imobiliário Premium',
    type: 'consortium',
    bank_id: '2',
    bank_name: 'Caixa Econômica Federal',
    min_amount: 100000,
    max_amount: 500000,
    min_installments: 60,
    max_installments: 180,
    interest_rate: 0,
    description: 'Consórcio para aquisição de imóveis',
    is_active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Financiamento de Veículos',
    type: 'financing',
    bank_id: '1',
    bank_name: 'Banco do Brasil',
    min_amount: 20000,
    max_amount: 150000,
    min_installments: 24,
    max_installments: 72,
    interest_rate: 1.45,
    description: 'Financiamento de veículos novos e seminovos',
    is_active: true,
    createdAt: new Date().toISOString(),
  },
];

let mockProposals: Proposal[] = [
  {
    id: '1',
    title: 'Proposta de Crédito Pessoal',
    status: 'em_analise',
    amount: 50000,
    clientId: '1',
    clientName: 'João Silva Santos',
    userId: '1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Consórcio Imobiliário',
    status: 'aprovada',
    amount: 250000,
    clientId: '2',
    clientName: 'Maria Oliveira Lima',
    userId: '1',
    createdAt: new Date().toISOString(),
  },
];

export const api = {
  // Clients
  getClients: async (): Promise<Client[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockClients;
  },

  getClient: async (id: string): Promise<Client | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockClients.find(c => c.id === id) || null;
  },

  createClient: async (data: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newClient: Client = {
      ...data,
      id: String(mockClients.length + 1),
      createdAt: new Date().toISOString(),
    };
    mockClients.push(newClient);
    return newClient;
  },

  updateClient: async (id: string, data: Partial<Client>): Promise<Client> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockClients.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Cliente não encontrado');
    mockClients[index] = { ...mockClients[index], ...data };
    return mockClients[index];
  },

  deleteClient: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockClients = mockClients.filter(c => c.id !== id);
  },

  // Proposals
  getProposals: async (): Promise<Proposal[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProposals.map(p => ({
      ...p,
      clientName: mockClients.find(c => c.id === p.clientId)?.name,
    }));
  },

  getProposal: async (id: string): Promise<Proposal | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const proposal = mockProposals.find(p => p.id === id);
    if (!proposal) return null;
    return {
      ...proposal,
      clientName: mockClients.find(c => c.id === proposal.clientId)?.name,
    };
  },

  createProposal: async (data: Omit<Proposal, 'id' | 'createdAt' | 'clientName'>): Promise<Proposal> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newProposal: Proposal = {
      ...data,
      id: String(mockProposals.length + 1),
      createdAt: new Date().toISOString(),
      clientName: mockClients.find(c => c.id === data.clientId)?.name,
    };
    mockProposals.push(newProposal);
    return newProposal;
  },

  updateProposal: async (id: string, data: Partial<Proposal>): Promise<Proposal> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockProposals.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Proposta não encontrada');
    mockProposals[index] = { ...mockProposals[index], ...data };
    return {
      ...mockProposals[index],
      clientName: mockClients.find(c => c.id === mockProposals[index].clientId)?.name,
    };
  },

  deleteProposal: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockProposals = mockProposals.filter(p => p.id !== id);
  },

  // Banks
  getBanks: async (): Promise<Bank[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockBanks;
  },

  getBank: async (id: string): Promise<Bank | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockBanks.find(b => b.id === id) || null;
  },

  createBank: async (data: Omit<Bank, 'id' | 'createdAt'>): Promise<Bank> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newBank: Bank = {
      ...data,
      id: String(mockBanks.length + 1),
      createdAt: new Date().toISOString(),
    };
    mockBanks.push(newBank);
    return newBank;
  },

  updateBank: async (id: string, data: Partial<Bank>): Promise<Bank> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockBanks.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Banco não encontrado');
    mockBanks[index] = { ...mockBanks[index], ...data };
    return mockBanks[index];
  },

  deleteBank: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockBanks = mockBanks.filter(b => b.id !== id);
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProducts.map(p => ({
      ...p,
      bank_name: mockBanks.find(b => b.id === p.bank_id)?.name,
    }));
  },

  getProduct: async (id: string): Promise<Product | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const product = mockProducts.find(p => p.id === id);
    if (!product) return null;
    return {
      ...product,
      bank_name: mockBanks.find(b => b.id === product.bank_id)?.name,
    };
  },

  createProduct: async (data: Omit<Product, 'id' | 'createdAt' | 'bank_name'>): Promise<Product> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newProduct: Product = {
      ...data,
      id: String(mockProducts.length + 1),
      createdAt: new Date().toISOString(),
      bank_name: mockBanks.find(b => b.id === data.bank_id)?.name,
    };
    mockProducts.push(newProduct);
    return newProduct;
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Produto não encontrado');
    mockProducts[index] = { ...mockProducts[index], ...data };
    return {
      ...mockProducts[index],
      bank_name: mockBanks.find(b => b.id === mockProducts[index].bank_id)?.name,
    };
  },

  deleteProduct: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockProducts = mockProducts.filter(p => p.id !== id);
  },

  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const approvedCount = mockProposals.filter(p => p.status === 'aprovada').length;
    const totalProposals = mockProposals.length;
    return {
      totalClients: mockClients.length,
      totalProposals: totalProposals,
      openProposals: mockProposals.filter(p => p.status === 'aberta').length,
      approvedProposals: approvedCount,
      totalAmount: mockProposals.reduce((sum, p) => sum + p.amount, 0),
      inAnalysisProposals: mockProposals.filter(p => p.status === 'em_analise').length,
      approvalRate: totalProposals > 0 ? Math.round((approvedCount / totalProposals) * 100) : 0,
      avgTicket: approvedCount > 0 
        ? Math.round(mockProposals.filter(p => p.status === 'aprovada').reduce((sum, p) => sum + p.amount, 0) / approvedCount)
        : 0,
    };
  },
};
