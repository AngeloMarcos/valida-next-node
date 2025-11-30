-- Migração completa para atualizar roles: gerente->supervisor, agente->correspondente
-- Esta migração precisa dropar e recriar políticas RLS

-- PASSO 1: Remover função has_role e suas dependências
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;

-- PASSO 2: Criar novo enum
CREATE TYPE public.app_role_new AS ENUM ('admin', 'supervisor', 'correspondente');

-- PASSO 3: Migrar dados da tabela user_roles
ALTER TABLE public.user_roles ADD COLUMN role_new app_role_new;

UPDATE public.user_roles 
SET role_new = CASE 
  WHEN role::text = 'admin' THEN 'admin'::app_role_new
  WHEN role::text = 'gerente' THEN 'supervisor'::app_role_new
  WHEN role::text = 'agente' THEN 'correspondente'::app_role_new
END;

ALTER TABLE public.user_roles DROP COLUMN role;
ALTER TABLE public.user_roles RENAME COLUMN role_new TO role;
ALTER TABLE public.user_roles ALTER COLUMN role SET NOT NULL;
ALTER TABLE public.user_roles ALTER COLUMN role SET DEFAULT 'correspondente'::app_role_new;

-- Recriar unique constraint
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);

-- PASSO 4: Remover enum antigo e renomear novo
DROP TYPE public.app_role;
ALTER TYPE public.app_role_new RENAME TO app_role;

-- PASSO 5: Recriar função has_role com novo tipo
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- PASSO 6: Recriar todas as políticas RLS que usam has_role

-- user_roles policies
CREATE POLICY "Admins can view all roles in their empresa"
ON public.user_roles FOR SELECT
USING (has_role(auth.uid(), 'admin') AND user_in_empresa(auth.uid(), empresa_id));

-- bancos policies  
CREATE POLICY "Admins can delete bancos in their empresa"
ON public.bancos FOR DELETE
USING (empresa_id = get_user_empresa_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

-- clientes policies
CREATE POLICY "Gerentes and Admins can delete clientes in their empresa"
ON public.clientes FOR DELETE
USING (empresa_id = get_user_empresa_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')));

-- produtos policies
CREATE POLICY "Gerentes and Admins can create produtos in their empresa"
ON public.produtos FOR INSERT
WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')));

CREATE POLICY "Gerentes and Admins can update produtos in their empresa"
ON public.produtos FOR UPDATE
USING (empresa_id = get_user_empresa_id(auth.uid()))
WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')));

CREATE POLICY "Admins can delete produtos in their empresa"
ON public.produtos FOR DELETE
USING (empresa_id = get_user_empresa_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

-- propostas policies
CREATE POLICY "Gerentes and Admins can delete propostas in their empresa"
ON public.propostas FOR DELETE
USING (empresa_id = get_user_empresa_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')));

-- empresas policies
CREATE POLICY "Admins can create empresas"
ON public.empresas FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete empresas"
ON public.empresas FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- contratos_apolices policies
CREATE POLICY "Admins can delete contratos in their empresa"
ON public.contratos_apolices FOR DELETE
USING (empresa_id = get_user_empresa_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

-- comissoes policies
CREATE POLICY "Admins can delete comissoes in their empresa"
ON public.comissoes FOR DELETE
USING (empresa_id = get_user_empresa_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

-- promotoras policies
CREATE POLICY "Admins can delete promotoras in their empresa"
ON public.promotoras FOR DELETE
USING (empresa_id = get_user_empresa_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

-- whatsapp_instances policies
CREATE POLICY "Admins can create instances in their empresa"
ON public.whatsapp_instances FOR INSERT
WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update instances in their empresa"
ON public.whatsapp_instances FOR UPDATE
USING (empresa_id = get_user_empresa_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete instances in their empresa"
ON public.whatsapp_instances FOR DELETE
USING (empresa_id = get_user_empresa_id(auth.uid()) AND has_role(auth.uid(), 'admin'));