import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { mockApi, FlowSummary } from '@/lib/mockApi';

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
      const response = await mockApi.getSupportedBanks();
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
      const response = await mockApi.startAuthorizationFlow(proposalId, state.selectedBank);
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
      const response = await mockApi.getFlowSummary(proposalId);
      setState(prev => ({
        ...prev,
        flowSummary: response.data.data,
        isLoading: false,
      }));
      
      if (response.data.data.flowStep === 'completed') {
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
      await mockApi.cancelAuthorizationFlow(proposalId);
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
    mockApi.resetFlow();
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
