import { renderHook, waitFor } from '@testing-library/react';
import { useUsers } from '../useUsers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      signUp: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

describe('useUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUsers', () => {
    it('should fetch users successfully', async () => {
      const mockUsers = [
        {
          id: '1',
          nome: 'User 1',
          email: 'user1@test.com',
          empresa_id: 'empresa-1',
          created_at: '2024-01-01',
          empresas: { nome: 'Empresa Test' },
        },
      ];

      const mockRoles = [
        {
          user_id: '1',
          role: 'admin',
        },
      ];

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { empresa_id: 'empresa-1' },
              error: null,
            }),
            order: jest.fn().mockReturnThis(),
            range: jest.fn().mockResolvedValue({
              data: mockUsers,
              error: null,
              count: 1,
            }),
          };
        }
        if (table === 'user_roles') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({
              data: mockRoles,
              error: null,
            }),
          };
        }
        return {};
      });

      const { result } = renderHook(() => useUsers());

      let response;
      await waitFor(async () => {
        response = await result.current.fetchUsers();
      });

      expect(response).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            nome: 'User 1',
            email: 'user1@test.com',
            role: 'admin',
          }),
        ]),
        count: 1,
        totalPages: 1,
      });
    });

    it('should handle fetch errors', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      });

      const { result } = renderHook(() => useUsers());

      let response;
      await waitFor(async () => {
        response = await result.current.fetchUsers();
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao carregar usuários')
      );
      expect(response).toEqual({
        data: [],
        count: 0,
        totalPages: 0,
      });
    });
  });

  describe('sendPasswordReset', () => {
    it('should send password reset email successfully', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useUsers());

      let success;
      await waitFor(async () => {
        success = await result.current.sendPasswordReset('test@example.com');
      });

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/'),
        })
      );
      expect(toast.success).toHaveBeenCalledWith(
        'E-mail de redefinição de senha enviado!'
      );
      expect(success).toBe(true);
    });

    it('should handle password reset errors', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: new Error('Email service unavailable'),
      });

      const { result } = renderHook(() => useUsers());

      let success;
      await waitFor(async () => {
        success = await result.current.sendPasswordReset('test@example.com');
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao enviar e-mail')
      );
      expect(success).toBe(false);
    });
  });
});
