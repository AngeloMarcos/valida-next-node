-- Fix Critical Security Issue 1: Drop legacy usuarios table
-- This table is unused and has severe security vulnerabilities
DROP TABLE IF EXISTS public.usuarios CASCADE;

-- Fix Critical Security Issue 2: Secure empresas table with proper RLS policies

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "empresas_select_authenticated" ON public.empresas;
DROP POLICY IF EXISTS "empresas_insert_authenticated" ON public.empresas;
DROP POLICY IF EXISTS "empresas_update_authenticated" ON public.empresas;
DROP POLICY IF EXISTS "empresas_delete_authenticated" ON public.empresas;

-- Create security definer function to get default empresa for new signups
-- This allows signup flow to work without exposing all empresas
CREATE OR REPLACE FUNCTION public.get_default_empresa_for_signup()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.empresas ORDER BY created_at ASC LIMIT 1
$$;

-- Create proper restrictive RLS policies
CREATE POLICY "Users can view their own empresa"
ON public.empresas
FOR SELECT
TO authenticated
USING (id = public.get_user_empresa_id(auth.uid()));

CREATE POLICY "Users can update their own empresa"
ON public.empresas
FOR UPDATE
TO authenticated
USING (id = public.get_user_empresa_id(auth.uid()))
WITH CHECK (id = public.get_user_empresa_id(auth.uid()));

CREATE POLICY "Admins can create empresas"
ON public.empresas
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete empresas"
ON public.empresas
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));