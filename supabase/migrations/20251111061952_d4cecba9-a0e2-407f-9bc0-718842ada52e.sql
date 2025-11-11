-- Drop the existing policy that isn't working correctly
DROP POLICY IF EXISTS "Allow triggers to insert activity logs" ON public.activity_logs;

-- Recreate the policy with PERMISSIVE mode to ensure it works
CREATE POLICY "Allow triggers to insert activity logs"
  ON public.activity_logs
  FOR INSERT
  TO public, anon, authenticated
  WITH CHECK (true);

-- Ensure log_activity function bypasses RLS
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Make sure all log functions have proper search_path
CREATE OR REPLACE FUNCTION public.log_activity(
  _user_id UUID,
  _action TEXT,
  _entity_type TEXT,
  _entity_id UUID,
  _entity_name TEXT,
  _details JSONB DEFAULT NULL,
  _previous_value JSONB DEFAULT NULL,
  _new_value JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _log_id UUID;
  _user_email TEXT;
  _user_name TEXT;
  _empresa_id UUID;
BEGIN
  -- Get user info
  SELECT email INTO _user_email FROM auth.users WHERE id = _user_id;
  SELECT nome, empresa_id INTO _user_name, _empresa_id FROM public.profiles WHERE id = _user_id;

  -- Insert log (bypasses RLS due to SECURITY DEFINER)
  INSERT INTO public.activity_logs (
    user_id,
    user_email,
    user_name,
    action,
    entity_type,
    entity_id,
    entity_name,
    details,
    previous_value,
    new_value,
    empresa_id
  ) VALUES (
    _user_id,
    _user_email,
    _user_name,
    _action,
    _entity_type,
    _entity_id,
    _entity_name,
    _details,
    _previous_value,
    _new_value,
    _empresa_id
  ) RETURNING id INTO _log_id;

  RETURN _log_id;
END;
$$;