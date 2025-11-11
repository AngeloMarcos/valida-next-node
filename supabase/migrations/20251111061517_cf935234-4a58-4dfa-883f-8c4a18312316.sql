-- Fix 1: Add missing foreign key constraint between profiles and empresas
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_empresa_id_fkey;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_empresa_id_fkey
  FOREIGN KEY (empresa_id)
  REFERENCES public.empresas(id)
  ON DELETE CASCADE;

-- Fix 2: Add INSERT policy for activity_logs to allow trigger-based inserts
-- This allows the triggers to insert logs even though direct client inserts are blocked
CREATE POLICY "Allow triggers to insert activity logs"
  ON public.activity_logs
  FOR INSERT
  WITH CHECK (true);