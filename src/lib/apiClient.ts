import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to each request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - could redirect to login
      console.error('Unauthorized request');
    }
    return Promise.reject(error);
  }
);

// Bank Integration API endpoints
export const bankIntegrationApi = {
  getSupportedBanks: () => 
    apiClient.get<{ banks: string[] }>('/bank-integration/supported-banks'),
  
  startAuthorizationFlow: (proposalId: number, bankCode: string) =>
    apiClient.post(`/authorization-flow/start/${proposalId}`, { bankCode }),
  
  getFlowSummary: (proposalId: number) =>
    apiClient.get(`/authorization-flow/${proposalId}/summary`),
  
  cancelAuthorizationFlow: (proposalId: number) =>
    apiClient.delete(`/authorization-flow/${proposalId}/cancel`),
};
