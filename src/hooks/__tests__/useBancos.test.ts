import { renderHook, waitFor } from '@testing-library/react';
import { useBancos } from '../useBancos';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('useBancos', () => {
  const mockSupabaseFrom = supabase.from as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchBancos', () => {
    it('should fetch bancos successfully', async () => {
      const mockData = [
        { id: '1', nome: 'Banco Test', cnpj: '12345678901234', email: 'test@banco.com' },
      ];

      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            range: jest.fn().mockResolvedValue({
              data: mockData,
              error: null,
              count: 1,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useBancos());

      expect(result.current.loading).toBe(false);

      const response = await result.current.fetchBancos(1, 10);

      expect(response.data).toEqual(mockData);
      expect(response.count).toBe(1);
      expect(response.totalPages).toBe(1);
    });

    it('should handle errors when fetching bancos', async () => {
      const mockError = { message: 'Database error' };

      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            range: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
              count: 0,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useBancos());

      const response = await result.current.fetchBancos(1, 10);

      expect(response.data).toEqual([]);
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar bancos: Database error');
    });
  });

  describe('createBanco', () => {
    it('should create banco successfully', async () => {
      mockSupabaseFrom.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      const { result } = renderHook(() => useBancos());

      const formData = { nome: 'Novo Banco', cnpj: '12345678901234' };
      const success = await result.current.createBanco(formData);

      expect(success).toBe(true);
      expect(toast.success).toHaveBeenCalledWith('Banco cadastrado com sucesso!');
    });

    it('should handle errors when creating banco', async () => {
      const mockError = { message: 'Insert failed' };

      mockSupabaseFrom.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: mockError,
        }),
      });

      const { result } = renderHook(() => useBancos());

      const formData = { nome: 'Novo Banco', cnpj: '12345678901234' };
      const success = await result.current.createBanco(formData);

      expect(success).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Erro ao cadastrar banco: Insert failed');
    });
  });

  describe('updateBanco', () => {
    it('should update banco successfully', async () => {
      mockSupabaseFrom.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      const { result } = renderHook(() => useBancos());

      const formData = { nome: 'Banco Atualizado' };
      const success = await result.current.updateBanco('1', formData);

      expect(success).toBe(true);
      expect(toast.success).toHaveBeenCalledWith('Banco atualizado com sucesso!');
    });
  });

  describe('deleteBanco', () => {
    it('should delete banco successfully', async () => {
      mockSupabaseFrom.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      const { result } = renderHook(() => useBancos());

      const success = await result.current.deleteBanco('1');

      expect(success).toBe(true);
      expect(toast.success).toHaveBeenCalledWith('Banco excluído com sucesso!');
    });
  });

  describe('searchBancos', () => {
    it('should search bancos successfully', async () => {
      const mockData = [
        { id: '1', nome: 'Banco Test', cnpj: '12345678901234' },
      ];

      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockData,
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useBancos());

      const results = await result.current.searchBancos('Test');

      expect(results).toEqual(mockData);
    });
  });
});
