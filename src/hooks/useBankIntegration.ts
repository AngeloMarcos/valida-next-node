import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { mockApi, FlowSummary } from '@/lib/mockApi';
import { bankIntegrationApi } from '@/lib/apiClient';

// Toggle between mock and real API
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export interface BankIntegrationState {
  isLoading: boolean;
  flowSummary: FlowSummary | null;
  supportedBanks: string[];
  selectedBank: string | null;
  error: string | null;
}

export function useBankIntegration() {
  const [state, setState] = useState<BankIntegrationState>({
    isLoading: false,
    flowSummary: null,
    supportedBanks: [],
    selectedBank: null,
    error: null,
  });

  const loadSupportedBanks = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = USE_MOCK 
        ? await mockApi.getSupportedBanks()
        : await bankIntegrationApi.getSupportedBanks();
      setState(prev => ({
        ...prev,
        supportedBanks: response.data.banks,
        isLoading: false,
      }));
    } catch (err) {
      const errorMsg = 'Erro ao carregar bancos suportados';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      toast.error(errorMsg);
    }
  }, []);

  const selectBank = useCallback((bankCode: string) => {
    setState(prev => ({ ...prev, selectedBank: bankCode }));
  }, []);

  const startAuthorizationFlow = useCallback(async (proposalId: number) => {
    if (!state.selectedBank) {
      toast.error('Selecione um banco primeiro');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    toast.info('Iniciando análise bancária...');

    try {
      const response = USE_MOCK
        ? await mockApi.startAuthorizationFlow(proposalId, state.selectedBank)
        : await bankIntegrationApi.startAuthorizationFlow(proposalId, state.selectedBank);
      setState(prev => ({
        ...prev,
        flowSummary: response.data,
        isLoading: false,
      }));
      toast.success('Proposta enviada para análise!');
    } catch (err) {
      const errorMsg = 'Erro ao iniciar fluxo de autorização';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      toast.error(errorMsg);
    }
  }, [state.selectedBank]);

  const refreshFlowSummary = useCallback(async (proposalId: number) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = USE_MOCK
        ? await mockApi.getFlowSummary(proposalId)
        : await bankIntegrationApi.getFlowSummary(proposalId);
      
      const flowData = USE_MOCK ? response.data.data : response.data;
      setState(prev => ({
        ...prev,
        flowSummary: flowData,
        isLoading: false,
      }));
      
      if (flowData.flowStep === 'completed') {
        toast.success('Proposta aprovada pelo banco!');
      }
    } catch (err) {
      const errorMsg = 'Erro ao atualizar status';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      toast.error(errorMsg);
    }
  }, []);

  const cancelFlow = useCallback(async (proposalId: number) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      USE_MOCK
        ? await mockApi.cancelAuthorizationFlow(proposalId)
        : await bankIntegrationApi.cancelAuthorizationFlow(proposalId);
      setState(prev => ({
        ...prev,
        flowSummary: null,
        isLoading: false,
      }));
      toast.info('Fluxo cancelado');
    } catch (err) {
      const errorMsg = 'Erro ao cancelar fluxo';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      toast.error(errorMsg);
    }
  }, []);

  const resetState = useCallback(() => {
    if (USE_MOCK) {
      mockApi.resetFlow();
    }
    setState({
      isLoading: false,
      flowSummary: null,
      supportedBanks: [],
      selectedBank: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    loadSupportedBanks,
    selectBank,
    startAuthorizationFlow,
    refreshFlowSummary,
    cancelFlow,
    resetState,
  };
}
