-- Tabela de conversas
CREATE TABLE IF NOT EXISTS public.conversas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefone TEXT NOT NULL,
  nome TEXT NOT NULL,
  ultimo_texto TEXT,
  ultima_data TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'arquivado')),
  unread INTEGER DEFAULT 0,
  origem TEXT DEFAULT 'wpp' CHECK (origem IN ('site', 'wpp')),
  is_starred BOOLEAN DEFAULT false,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS public.mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversa_id UUID NOT NULL REFERENCES public.conversas(id) ON DELETE CASCADE,
  mensagem TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('usuario', 'agente')),
  data TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'enviado' CHECK (status IN ('enviado', 'lido', 'entregue')),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_conversas_empresa_id ON public.conversas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_conversas_telefone ON public.conversas(telefone);
CREATE INDEX IF NOT EXISTS idx_conversas_status ON public.conversas(status);
CREATE INDEX IF NOT EXISTS idx_mensagens_conversa_id ON public.mensagens(conversa_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_empresa_id ON public.mensagens(empresa_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_data ON public.mensagens(data DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversas_updated_at
  BEFORE UPDATE ON public.conversas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies para conversas
ALTER TABLE public.conversas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversas from their empresa"
  ON public.conversas FOR SELECT
  USING (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create conversas in their empresa"
  ON public.conversas FOR INSERT
  WITH CHECK (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update conversas in their empresa"
  ON public.conversas FOR UPDATE
  USING (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete conversas in their empresa"
  ON public.conversas FOR DELETE
  USING (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies para mensagens
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view mensagens from their empresa"
  ON public.mensagens FOR SELECT
  USING (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create mensagens in their empresa"
  ON public.mensagens FOR INSERT
  WITH CHECK (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));

-- Habilitar Realtime
ALTER TABLE public.conversas REPLICA IDENTITY FULL;
ALTER TABLE public.mensagens REPLICA IDENTITY FULL;