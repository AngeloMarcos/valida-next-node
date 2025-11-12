-- Criar usuário admin inicial
-- Primeiro, precisamos inserir diretamente no auth.users (isso será feito manualmente pelo administrador do Supabase)
-- Esta migration cria apenas os dados auxiliares

-- Função para criar usuário admin inicial (será chamada após criar o usuário no Supabase Auth)
CREATE OR REPLACE FUNCTION public.create_initial_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _empresa_id UUID;
  _user_id UUID;
BEGIN
  -- Pegar a primeira empresa (ou criar uma padrão)
  SELECT id INTO _empresa_id FROM public.empresas ORDER BY created_at ASC LIMIT 1;
  
  -- Se não existir empresa, criar uma padrão
  IF _empresa_id IS NULL THEN
    INSERT INTO public.empresas (nome, cnpj)
    VALUES ('Empresa Padrão', '00000000000000')
    RETURNING id INTO _empresa_id;
  END IF;

  -- Buscar o usuário teste@teste.com no auth.users
  SELECT id INTO _user_id FROM auth.users WHERE email = 'teste@teste.com' LIMIT 1;
  
  -- Se o usuário existir, configurar perfil e role
  IF _user_id IS NOT NULL THEN
    -- Inserir ou atualizar perfil
    INSERT INTO public.profiles (id, email, nome, empresa_id)
    VALUES (_user_id, 'teste@teste.com', 'Administrador', _empresa_id)
    ON CONFLICT (id) DO UPDATE 
    SET nome = 'Administrador', empresa_id = _empresa_id;
    
    -- Inserir ou atualizar role
    INSERT INTO public.user_roles (user_id, role, empresa_id)
    VALUES (_user_id, 'admin', _empresa_id)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Usuário admin configurado com sucesso!';
  ELSE
    RAISE NOTICE 'Usuário teste@teste.com não encontrado. Por favor, crie-o manualmente no Supabase Auth primeiro.';
  END IF;
END;
$$;

-- Comentário explicativo
COMMENT ON FUNCTION public.create_initial_admin_user() IS 
'Função para configurar o usuário admin inicial. 
IMPORTANTE: Primeiro crie o usuário teste@teste.com com senha 12345678 no Supabase Auth Dashboard, 
depois execute: SELECT create_initial_admin_user();';