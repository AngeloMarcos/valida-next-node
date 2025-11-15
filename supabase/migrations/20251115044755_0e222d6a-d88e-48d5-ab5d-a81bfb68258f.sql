-- Criar ENUM para tipo_proposta
CREATE TYPE tipo_proposta_enum AS ENUM ('credito', 'consorcio', 'seguro');

-- Adicionar colunas à tabela propostas
ALTER TABLE public.propostas
ADD COLUMN tipo_proposta tipo_proposta_enum DEFAULT 'credito' NOT NULL,
ADD COLUMN detalhes_produto jsonb;

-- Adicionar colunas à tabela contratos_apolices
ALTER TABLE public.contratos_apolices
ADD COLUMN tipo_proposta tipo_proposta_enum,
ADD COLUMN detalhes_produto jsonb,
ADD COLUMN status_cota text DEFAULT 'ativa';

-- Atualizar trigger para copiar dados para contratos_apolices
CREATE OR REPLACE FUNCTION public.create_contrato_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status != 'aprovada' AND NEW.status = 'aprovada') THEN
    INSERT INTO public.contratos_apolices (
      proposta_id,
      valor_contrato,
      usuario_id,
      empresa_id,
      tipo_proposta,
      detalhes_produto
    ) VALUES (
      NEW.id,
      NEW.valor,
      NEW.usuario_id,
      NEW.empresa_id,
      NEW.tipo_proposta,
      NEW.detalhes_produto
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS on_proposta_approved ON public.propostas;
CREATE TRIGGER on_proposta_approved
  AFTER UPDATE ON public.propostas
  FOR EACH ROW
  EXECUTE FUNCTION public.create_contrato_on_approval();

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_propostas_tipo ON public.propostas(tipo_proposta);
CREATE INDEX IF NOT EXISTS idx_contratos_tipo ON public.contratos_apolices(tipo_proposta);
CREATE INDEX IF NOT EXISTS idx_contratos_status_cota ON public.contratos_apolices(status_cota);