-- Corrigir o trigger handle_new_user para sempre usar uma empresa padrão
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  default_empresa_id UUID;
BEGIN
  -- Tenta pegar empresa_id dos metadados, senão usa a empresa padrão
  default_empresa_id := (new.raw_user_meta_data->>'empresa_id')::UUID;
  
  -- Se não existe empresa_id nos metadados, pegar a empresa padrão
  IF default_empresa_id IS NULL THEN
    default_empresa_id := get_default_empresa_for_signup();
  END IF;
  
  -- Insert profile
  INSERT INTO public.profiles (id, email, nome, empresa_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'nome', new.email),
    default_empresa_id
  );
  
  -- Assign default role
  INSERT INTO public.user_roles (user_id, role, empresa_id)
  VALUES (new.id, 'agente', default_empresa_id);
  
  RETURN new;
END;
$$;