// Mock API for Bank Integration - simulates backend calls

export interface FlowSummary {
  proposalId: number;
  clientName: string;
  productName: string;
  requestedAmount: number;
  currentStatus: 'open' | 'in_analysis' | 'approved' | 'rejected' | 'cancelled';
  flowStep: 'validation' | 'awaiting_response' | 'completed' | 'failed';
  validationScore: number;
  validationEligible: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  timestamp: string;
}

const mockValidationResult = {
  eligible: true,
  score: 85,
  errors: [] as string[],
  warnings: ["Cliente com poucas propostas no sistema"],
  recommendations: ["Considere solicitar documentação adicional"],
};

let mockFlowSummary: FlowSummary = {
  proposalId: 1,
  clientName: "João da Silva",
  productName: "Crédito Pessoal",
  requestedAmount: 10000,
  currentStatus: "open",
  flowStep: "validation",
  validationScore: 0,
  validationEligible: false,
  errors: [],
  warnings: [],
  recommendations: [],
  timestamp: new Date().toISOString(),
};

export const mockApi = {
  startAuthorizationFlow: (proposalId: number, bankCode: string): Promise<{ data: FlowSummary }> => {
    console.log(`Iniciando fluxo para proposta ${proposalId} no banco ${bankCode}`);
    mockFlowSummary = {
      ...mockFlowSummary,
      proposalId,
      flowStep: "validation",
      currentStatus: "open",
      timestamp: new Date().toISOString(),
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        mockFlowSummary = {
          ...mockFlowSummary,
          validationScore: mockValidationResult.score,
          validationEligible: mockValidationResult.eligible,
          warnings: mockValidationResult.warnings,
          recommendations: mockValidationResult.recommendations,
          errors: mockValidationResult.errors,
          flowStep: "awaiting_response",
          currentStatus: "in_analysis",
          timestamp: new Date().toISOString(),
        };
        resolve({ data: { ...mockFlowSummary } });
      }, 2000);
    });
  },

  getFlowSummary: (proposalId: number): Promise<{ data: { success: boolean; data: FlowSummary } }> => {
    console.log(`Obtendo resumo para proposta ${proposalId}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (mockFlowSummary.flowStep === "awaiting_response" && Math.random() > 0.5) {
          mockFlowSummary = {
            ...mockFlowSummary,
            flowStep: "completed",
            currentStatus: "approved",
            timestamp: new Date().toISOString(),
          };
        }
        resolve({ data: { success: true, data: { ...mockFlowSummary } } });
      }, 1000);
    });
  },

  cancelAuthorizationFlow: (proposalId: number): Promise<{ data: { message: string } }> => {
    console.log(`Cancelando fluxo para proposta ${proposalId}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        mockFlowSummary = {
          ...mockFlowSummary,
          flowStep: "failed",
          currentStatus: "rejected",
          timestamp: new Date().toISOString(),
        };
        resolve({ data: { message: "Fluxo cancelado com sucesso" } });
      }, 500);
    });
  },

  getSupportedBanks: (): Promise<{ data: { banks: string[] } }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { banks: ["bradesco", "itau", "bb", "santander", "caixa"] } });
      }, 500);
    });
  },

  resetFlow: () => {
    mockFlowSummary = {
      proposalId: 1,
      clientName: "João da Silva",
      productName: "Crédito Pessoal",
      requestedAmount: 10000,
      currentStatus: "open",
      flowStep: "validation",
      validationScore: 0,
      validationEligible: false,
      errors: [],
      warnings: [],
      recommendations: [],
      timestamp: new Date().toISOString(),
    };
  },
};
