import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'admin' | 'gerente' | 'agente';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  nome: string;
  email: string;
  empresa_id: string;
  empresa_nome?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

export interface UserFormData {
  nome: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export function useUsers() {
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuth();

  const fetchUsers = async (page: number = 1, pageSize: number = 10, searchTerm?: string) => {
    setLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Get current user's empresa_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', currentUser?.id)
        .single();

      if (!profile?.empresa_id) {
        throw new Error('Empresa não encontrada');
      }

      let query = supabase
        .from('profiles')
        .select(`
          id,
          nome,
          email,
          empresa_id,
          created_at,
          empresas!profiles_empresa_id_fkey(nome)
        `, { count: 'exact' })
        .eq('empresa_id', profile.empresa_id)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data: profiles, error: profilesError, count } = await query.range(from, to);

      if (profilesError) throw profilesError;

      // Get roles for each user
      const userIds = profiles?.map(p => p.id) || [];
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      // Combine data
      const users: User[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        return {
          id: profile.id,
          nome: profile.nome || '',
          email: profile.email,
          empresa_id: profile.empresa_id,
          empresa_nome: (profile.empresas as any)?.nome || '',
          role: (userRole?.role as UserRole) || 'agente',
          status: 'active' as UserStatus, // TODO: Add status field to profiles table
          created_at: profile.created_at || '',
        };
      });

      return {
        data: users,
        count: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    } catch (error: any) {
      toast.error('Erro ao carregar usuários: ' + error.message);
      return { data: [], count: 0, totalPages: 0 };
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (formData: UserFormData) => {
    setLoading(true);
    try {
      // Get current user's empresa_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', currentUser?.id)
        .single();

      if (!profile?.empresa_id) {
        throw new Error('Empresa não encontrada');
      }

      // Create user in auth with a temporary password
      const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          data: {
            nome: formData.nome,
            empresa_id: profile.empresa_id,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      // Update role if not default
      if (formData.role !== 'agente') {
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: formData.role })
          .eq('user_id', authData.user.id);

        if (roleError) throw roleError;
      }

      toast.success('Usuário convidado com sucesso! Um e-mail foi enviado.');
      return true;
    } catch (error: any) {
      if (error.message.includes('User already registered')) {
        toast.error('Este e-mail já está cadastrado no sistema');
      } else {
        toast.error('Erro ao criar usuário: ' + error.message);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, formData: UserFormData) => {
    setLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ nome: formData.nome })
        .eq('id', id);

      if (profileError) throw profileError;

      // Update role
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: formData.role })
        .eq('user_id', id);

      if (roleError) throw roleError;

      toast.success('Usuário atualizado com sucesso!');
      return true;
    } catch (error: any) {
      toast.error('Erro ao atualizar usuário: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    setLoading(true);
    try {
      // Note: Supabase doesn't have a built-in way to disable users via client SDK
      // This would need to be implemented via an admin API or edge function
      toast.info('Funcionalidade de ativar/desativar usuário será implementada em breve');
      return false;
    } catch (error: any) {
      toast.error('Erro ao alterar status do usuário: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) throw error;

      toast.success('E-mail de redefinição de senha enviado!');
      return true;
    } catch (error: any) {
      toast.error('Erro ao enviar e-mail de redefinição: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    sendPasswordReset,
  };
}
