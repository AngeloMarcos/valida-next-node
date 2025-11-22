-- Create promotoras table
CREATE TABLE IF NOT EXISTS public.promotoras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  banco_id UUID REFERENCES public.bancos(id) ON DELETE SET NULL,
  telefone TEXT,
  email TEXT,
  contato TEXT,
  comissao_padrao NUMERIC(5,2),
  ativo BOOLEAN DEFAULT true,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.promotoras ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view promotoras from their empresa"
  ON public.promotoras FOR SELECT
  USING (empresa_id = get_user_empresa_id(auth.uid()));

CREATE POLICY "Users can create promotoras in their empresa"
  ON public.promotoras FOR INSERT
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

CREATE POLICY "Users can update promotoras in their empresa"
  ON public.promotoras FOR UPDATE
  USING (empresa_id = get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

CREATE POLICY "Admins can delete promotoras in their empresa"
  ON public.promotoras FOR DELETE
  USING (empresa_id = get_user_empresa_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

-- Add index for performance
CREATE INDEX idx_promotoras_empresa ON public.promotoras(empresa_id);
CREATE INDEX idx_promotoras_banco ON public.promotoras(banco_id);

-- Activity log trigger
CREATE OR REPLACE FUNCTION log_promotoras_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM log_activity(
      auth.uid(),
      'create',
      'promotora',
      NEW.id,
      NEW.nome,
      jsonb_build_object('email', NEW.email, 'telefone', NEW.telefone),
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    PERFORM log_activity(
      auth.uid(),
      'update',
      'promotora',
      NEW.id,
      NEW.nome,
      NULL,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM log_activity(
      auth.uid(),
      'delete',
      'promotora',
      OLD.id,
      OLD.nome,
      to_jsonb(OLD),
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_log_promotoras_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.promotoras
  FOR EACH ROW EXECUTE FUNCTION log_promotoras_changes();