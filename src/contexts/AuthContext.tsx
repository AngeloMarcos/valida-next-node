import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'supervisor' | 'correspondente';

export interface UserProfile {
  id: string;
  email: string;
  nome: string | null;
  empresa_id: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  roles: UserRole[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, nome?: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  isAdmin: boolean;
  isSupervisor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user profile and roles
  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      setProfile(profileData);

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        return;
      }

      setRoles(rolesData?.map(r => r.role as UserRole) || []);
    } catch (error) {
      console.error('Error in fetchUserData:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST (critical for proper session handling)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event);
        
        // Update session and user synchronously
        setSession(newSession);
        setUser(newSession?.user ?? null);

        // Defer profile/roles fetch to avoid blocking
        if (newSession?.user) {
          setTimeout(() => {
            fetchUserData(newSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
        }

        // Handle specific auth events
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setRoles([]);
        }

        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        fetchUserData(existingSession.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      // Log login activity using RPC function (bypasses RLS)
      if (data?.user) {
        try {
          await supabase.rpc('log_auth_event', {
            _user_id: data.user.id,
            _action: 'login',
            _user_email: data.user.email,
          });
        } catch (logError) {
          console.error('Failed to log login activity:', logError);
        }
      }

      toast.success('Login realizado com sucesso!');
      return { error: null };
    } catch (error: any) {
      toast.error('Erro ao fazer login');
      return { error };
    }
  };

  const signUp = async (email: string, password: string, nome?: string) => {
    try {
      // Get default empresa_id using secure function
      const { data: empresaId } = await supabase.rpc('get_default_empresa_for_signup');

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome: nome || email,
            empresa_id: empresaId,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      // Auto-login após cadastro (sem necessidade de confirmação de email)
      if (data?.user && data?.session) {
        toast.success('Conta criada e login realizado com sucesso!');
      } else {
        toast.success('Conta criada com sucesso! Faça login para continuar.');
      }
      
      return { error: null };
    } catch (error: any) {
      toast.error('Erro ao criar conta');
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error('Erro ao fazer logout');
        return;
      }

      setUser(null);
      setSession(null);
      setProfile(null);
      setRoles([]);
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return roles.includes(role);
  };

  const isAdmin = roles.includes('admin');
  const isSupervisor = roles.includes('supervisor') || isAdmin;

  const value = {
    user,
    session,
    profile,
    roles,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    isAdmin,
    isSupervisor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
