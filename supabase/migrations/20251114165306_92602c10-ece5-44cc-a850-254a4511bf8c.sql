-- 1. Adicionar campo usuario_id (vendedor) na tabela propostas
ALTER TABLE public.propostas
ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id);

-- 2. Adicionar campo ativo nas tabelas que não têm
ALTER TABLE public.clientes
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

ALTER TABLE public.bancos
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

ALTER TABLE public.produtos
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- 3. Criar tabela proposta_historico (log de mudanças de status)
CREATE TABLE IF NOT EXISTS public.proposta_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposta_id UUID NOT NULL REFERENCES public.propostas(id) ON DELETE CASCADE,
  status_anterior TEXT,
  status_novo TEXT NOT NULL,
  usuario_id UUID REFERENCES auth.users(id),
  usuario_nome TEXT,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  empresa_id UUID REFERENCES public.empresas(id)
);

ALTER TABLE public.proposta_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view historico from their empresa"
ON public.proposta_historico FOR SELECT
USING (empresa_id = get_user_empresa_id(auth.uid()));

CREATE POLICY "Users can create historico in their empresa"
ON public.proposta_historico FOR INSERT
WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

-- 4. Criar tabela proposta_anexos (upload de arquivos)
CREATE TABLE IF NOT EXISTS public.proposta_anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposta_id UUID NOT NULL REFERENCES public.propostas(id) ON DELETE CASCADE,
  nome_arquivo TEXT NOT NULL,
  url_arquivo TEXT NOT NULL,
  tipo_arquivo TEXT,
  tamanho_bytes BIGINT,
  usuario_id UUID REFERENCES auth.users(id),
  usuario_nome TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  empresa_id UUID REFERENCES public.empresas(id)
);

ALTER TABLE public.proposta_anexos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view anexos from their empresa"
ON public.proposta_anexos FOR SELECT
USING (empresa_id = get_user_empresa_id(auth.uid()));

CREATE POLICY "Users can create anexos in their empresa"
ON public.proposta_anexos FOR INSERT
WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

CREATE POLICY "Users can delete anexos in their empresa"
ON public.proposta_anexos FOR DELETE
USING (empresa_id = get_user_empresa_id(auth.uid()));

-- 5. Criar tabela proposta_atividades (log de interações)
CREATE TABLE IF NOT EXISTS public.proposta_atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposta_id UUID NOT NULL REFERENCES public.propostas(id) ON DELETE CASCADE,
  tipo_atividade TEXT NOT NULL, -- 'ligacao', 'tarefa', 'whatsapp', 'email', 'reuniao'
  descricao TEXT NOT NULL,
  data_atividade TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_agendamento TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pendente', -- 'pendente', 'concluida', 'cancelada'
  usuario_id UUID REFERENCES auth.users(id),
  usuario_nome TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  empresa_id UUID REFERENCES public.empresas(id)
);

ALTER TABLE public.proposta_atividades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view atividades from their empresa"
ON public.proposta_atividades FOR SELECT
USING (empresa_id = get_user_empresa_id(auth.uid()));

CREATE POLICY "Users can create atividades in their empresa"
ON public.proposta_atividades FOR INSERT
WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

CREATE POLICY "Users can update atividades in their empresa"
ON public.proposta_atividades FOR UPDATE
USING (empresa_id = get_user_empresa_id(auth.uid()));

CREATE POLICY "Users can delete atividades in their empresa"
ON public.proposta_atividades FOR DELETE
USING (empresa_id = get_user_empresa_id(auth.uid()));

-- 6. Criar tabela proposta_documentos (checklist de documentos)
CREATE TABLE IF NOT EXISTS public.proposta_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposta_id UUID NOT NULL REFERENCES public.propostas(id) ON DELETE CASCADE,
  nome_documento TEXT NOT NULL,
  status_documento TEXT DEFAULT 'pendente', -- 'pendente', 'recebido', 'aprovado', 'reprovado'
  obrigatorio BOOLEAN DEFAULT true,
  observacao TEXT,
  data_recebimento TIMESTAMP WITH TIME ZONE,
  usuario_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  empresa_id UUID REFERENCES public.empresas(id)
);

ALTER TABLE public.proposta_documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documentos from their empresa"
ON public.proposta_documentos FOR SELECT
USING (empresa_id = get_user_empresa_id(auth.uid()));

CREATE POLICY "Users can create documentos in their empresa"
ON public.proposta_documentos FOR INSERT
WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

CREATE POLICY "Users can update documentos in their empresa"
ON public.proposta_documentos FOR UPDATE
USING (empresa_id = get_user_empresa_id(auth.uid()));

CREATE POLICY "Users can delete documentos in their empresa"
ON public.proposta_documentos FOR DELETE
USING (empresa_id = get_user_empresa_id(auth.uid()));

-- 7. Criar tabela contratos_apolices (pós-venda)
CREATE TABLE IF NOT EXISTS public.contratos_apolices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposta_id UUID NOT NULL REFERENCES public.propostas(id),
  numero_contrato TEXT,
  numero_apolice TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_vigencia_fim DATE,
  valor_contrato NUMERIC,
  status_contrato TEXT DEFAULT 'ativo', -- 'ativo', 'renovado', 'cancelado', 'vencido'
  usuario_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  empresa_id UUID REFERENCES public.empresas(id)
);

ALTER TABLE public.contratos_apolices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view contratos from their empresa"
ON public.contratos_apolices FOR SELECT
USING (empresa_id = get_user_empresa_id(auth.uid()));

CREATE POLICY "Users can create contratos in their empresa"
ON public.contratos_apolices FOR INSERT
WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

CREATE POLICY "Users can update contratos in their empresa"
ON public.contratos_apolices FOR UPDATE
USING (empresa_id = get_user_empresa_id(auth.uid()));

CREATE POLICY "Admins can delete contratos in their empresa"
ON public.contratos_apolices FOR DELETE
USING (empresa_id = get_user_empresa_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

-- 8. Criar tabela comissoes
CREATE TABLE IF NOT EXISTS public.comissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposta_id UUID NOT NULL REFERENCES public.propostas(id),
  contrato_id UUID REFERENCES public.contratos_apolices(id),
  usuario_id UUID REFERENCES auth.users(id),
  valor_comissao NUMERIC NOT NULL,
  percentual_comissao NUMERIC,
  data_previsao DATE,
  data_recebimento DATE,
  status_recebimento TEXT DEFAULT 'pendente', -- 'pendente', 'pago', 'cancelado'
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  empresa_id UUID REFERENCES public.empresas(id)
);

ALTER TABLE public.comissoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comissoes from their empresa"
ON public.comissoes FOR SELECT
USING (empresa_id = get_user_empresa_id(auth.uid()));

CREATE POLICY "Users can create comissoes in their empresa"
ON public.comissoes FOR INSERT
WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

CREATE POLICY "Users can update comissoes in their empresa"
ON public.comissoes FOR UPDATE
USING (empresa_id = get_user_empresa_id(auth.uid()));

CREATE POLICY "Admins can delete comissoes in their empresa"
ON public.comissoes FOR DELETE
USING (empresa_id = get_user_empresa_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

-- 9. Criar trigger para registrar histórico de mudanças de status
CREATE OR REPLACE FUNCTION log_proposta_status_change()
RETURNS TRIGGER AS $$
DECLARE
  _usuario_nome TEXT;
  _empresa_id UUID;
BEGIN
  -- Get user info
  SELECT nome, empresa_id INTO _usuario_nome, _empresa_id 
  FROM public.profiles 
  WHERE id = auth.uid();

  -- Log status change
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.proposta_historico (
      proposta_id,
      status_anterior,
      status_novo,
      usuario_id,
      usuario_nome,
      empresa_id
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      _usuario_nome,
      NEW.empresa_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_proposta_status_change ON public.propostas;
CREATE TRIGGER trigger_proposta_status_change
AFTER UPDATE ON public.propostas
FOR EACH ROW
EXECUTE FUNCTION log_proposta_status_change();

-- 10. Criar função para criar contrato/apólice automaticamente quando proposta é aprovada
CREATE OR REPLACE FUNCTION create_contrato_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando status muda para 'aprovada', criar contrato
  IF (TG_OP = 'UPDATE' AND OLD.status != 'aprovada' AND NEW.status = 'aprovada') THEN
    INSERT INTO public.contratos_apolices (
      proposta_id,
      valor_contrato,
      usuario_id,
      empresa_id
    ) VALUES (
      NEW.id,
      NEW.valor,
      NEW.usuario_id,
      NEW.empresa_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_create_contrato_on_approval ON public.propostas;
CREATE TRIGGER trigger_create_contrato_on_approval
AFTER UPDATE ON public.propostas
FOR EACH ROW
EXECUTE FUNCTION create_contrato_on_approval();

-- 11. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_proposta_historico_proposta ON public.proposta_historico(proposta_id);
CREATE INDEX IF NOT EXISTS idx_proposta_anexos_proposta ON public.proposta_anexos(proposta_id);
CREATE INDEX IF NOT EXISTS idx_proposta_atividades_proposta ON public.proposta_atividades(proposta_id);
CREATE INDEX IF NOT EXISTS idx_proposta_documentos_proposta ON public.proposta_documentos(proposta_id);
CREATE INDEX IF NOT EXISTS idx_contratos_proposta ON public.contratos_apolices(proposta_id);
CREATE INDEX IF NOT EXISTS idx_comissoes_proposta ON public.comissoes(proposta_id);
CREATE INDEX IF NOT EXISTS idx_contratos_vigencia ON public.contratos_apolices(data_vigencia_fim);
CREATE INDEX IF NOT EXISTS idx_propostas_usuario ON public.propostas(usuario_id);