-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'gerente', 'agente');

-- Create user_roles table (roles MUST be stored separately for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'agente',
  empresa_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role, empresa_id)
);

-- Create profiles table for additional user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT,
  empresa_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Security definer function to get user's empresa_id
CREATE OR REPLACE FUNCTION public.get_user_empresa_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT empresa_id
  FROM public.profiles
  WHERE id = _user_id
  LIMIT 1
$$;

-- Security definer function to check if user belongs to empresa
CREATE OR REPLACE FUNCTION public.user_in_empresa(_user_id UUID, _empresa_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND empresa_id = _empresa_id
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles in their empresa"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    AND public.user_in_empresa(auth.uid(), empresa_id)
  );

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_empresa_id UUID;
BEGIN
  -- Get empresa_id from metadata or use a default
  default_empresa_id := (new.raw_user_meta_data->>'empresa_id')::UUID;
  
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for all tables to enforce empresa_id filtering

-- Bancos policies
DROP POLICY IF EXISTS bancos_select_authenticated ON public.bancos;
DROP POLICY IF EXISTS bancos_insert_authenticated ON public.bancos;
DROP POLICY IF EXISTS bancos_update_authenticated ON public.bancos;
DROP POLICY IF EXISTS bancos_delete_authenticated ON public.bancos;

CREATE POLICY "Users can view bancos from their empresa"
  ON public.bancos FOR SELECT
  TO authenticated
  USING (
    empresa_id = public.get_user_empresa_id(auth.uid())
    OR empresa_id IS NULL
  );

CREATE POLICY "Users can create bancos in their empresa"
  ON public.bancos FOR INSERT
  TO authenticated
  WITH CHECK (empresa_id = public.get_user_empresa_id(auth.uid()));

CREATE POLICY "Users can update bancos in their empresa"
  ON public.bancos FOR UPDATE
  TO authenticated
  USING (empresa_id = public.get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = public.get_user_empresa_id(auth.uid()));

CREATE POLICY "Admins can delete bancos in their empresa"
  ON public.bancos FOR DELETE
  TO authenticated
  USING (
    empresa_id = public.get_user_empresa_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

-- Clientes policies
DROP POLICY IF EXISTS clientes_select_authenticated ON public.clientes;
DROP POLICY IF EXISTS clientes_insert_authenticated ON public.clientes;
DROP POLICY IF EXISTS clientes_update_authenticated ON public.clientes;
DROP POLICY IF EXISTS clientes_delete_authenticated ON public.clientes;

CREATE POLICY "Users can view clientes from their empresa"
  ON public.clientes FOR SELECT
  TO authenticated
  USING (empresa_id = public.get_user_empresa_id(auth.uid()));

CREATE POLICY "Users can create clientes in their empresa"
  ON public.clientes FOR INSERT
  TO authenticated
  WITH CHECK (empresa_id = public.get_user_empresa_id(auth.uid()));

CREATE POLICY "Users can update clientes in their empresa"
  ON public.clientes FOR UPDATE
  TO authenticated
  USING (empresa_id = public.get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = public.get_user_empresa_id(auth.uid()));

CREATE POLICY "Gerentes and Admins can delete clientes in their empresa"
  ON public.clientes FOR DELETE
  TO authenticated
  USING (
    empresa_id = public.get_user_empresa_id(auth.uid())
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gerente'))
  );

-- Produtos policies
DROP POLICY IF EXISTS produtos_select_authenticated ON public.produtos;
DROP POLICY IF EXISTS produtos_insert_authenticated ON public.produtos;
DROP POLICY IF EXISTS produtos_update_authenticated ON public.produtos;
DROP POLICY IF EXISTS produtos_delete_authenticated ON public.produtos;

CREATE POLICY "Users can view produtos from their empresa"
  ON public.produtos FOR SELECT
  TO authenticated
  USING (empresa_id = public.get_user_empresa_id(auth.uid()));

CREATE POLICY "Gerentes and Admins can create produtos in their empresa"
  ON public.produtos FOR INSERT
  TO authenticated
  WITH CHECK (
    empresa_id = public.get_user_empresa_id(auth.uid())
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gerente'))
  );

CREATE POLICY "Gerentes and Admins can update produtos in their empresa"
  ON public.produtos FOR UPDATE
  TO authenticated
  USING (empresa_id = public.get_user_empresa_id(auth.uid()))
  WITH CHECK (
    empresa_id = public.get_user_empresa_id(auth.uid())
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gerente'))
  );

CREATE POLICY "Admins can delete produtos in their empresa"
  ON public.produtos FOR DELETE
  TO authenticated
  USING (
    empresa_id = public.get_user_empresa_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

-- Propostas policies
DROP POLICY IF EXISTS propostas_select_authenticated ON public.propostas;
DROP POLICY IF EXISTS propostas_insert_authenticated ON public.propostas;
DROP POLICY IF EXISTS propostas_update_authenticated ON public.propostas;
DROP POLICY IF EXISTS propostas_delete_authenticated ON public.propostas;

CREATE POLICY "Users can view propostas from their empresa"
  ON public.propostas FOR SELECT
  TO authenticated
  USING (empresa_id = public.get_user_empresa_id(auth.uid()));

CREATE POLICY "Users can create propostas in their empresa"
  ON public.propostas FOR INSERT
  TO authenticated
  WITH CHECK (empresa_id = public.get_user_empresa_id(auth.uid()));

CREATE POLICY "Users can update propostas in their empresa"
  ON public.propostas FOR UPDATE
  TO authenticated
  USING (empresa_id = public.get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = public.get_user_empresa_id(auth.uid()));

CREATE POLICY "Gerentes and Admins can delete propostas in their empresa"
  ON public.propostas FOR DELETE
  TO authenticated
  USING (
    empresa_id = public.get_user_empresa_id(auth.uid())
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gerente'))
  );

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();