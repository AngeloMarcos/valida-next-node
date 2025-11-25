-- Tabela de instâncias WhatsApp (uma por empresa)
CREATE TABLE IF NOT EXISTS whatsapp_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Dados da Instância Evolution
  instance_name VARCHAR(255) NOT NULL UNIQUE,
  instance_id VARCHAR(255) NOT NULL UNIQUE,
  api_key VARCHAR(255) NOT NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, connected, disconnected, error
  phone_number VARCHAR(20),
  
  -- QR Code
  qr_code_url TEXT,
  qr_code_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Configurações
  integration_type VARCHAR(50) DEFAULT 'WHATSAPP-BAILEYS',
  reject_calls BOOLEAN DEFAULT true,
  read_messages BOOLEAN DEFAULT true,
  groups_ignore BOOLEAN DEFAULT false,
  always_online BOOLEAN DEFAULT false,
  
  -- Meta
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  connected_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT empresa_instance_unique UNIQUE(empresa_id, instance_name)
);

-- Índices
CREATE INDEX idx_whatsapp_instances_empresa_id ON whatsapp_instances(empresa_id);
CREATE INDEX idx_whatsapp_instances_status ON whatsapp_instances(status);

-- RLS Policies
ALTER TABLE whatsapp_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view instances from their empresa"
  ON whatsapp_instances FOR SELECT
  USING (empresa_id = get_user_empresa_id(auth.uid()));

CREATE POLICY "Admins can create instances in their empresa"
  ON whatsapp_instances FOR INSERT
  WITH CHECK (
    empresa_id = get_user_empresa_id(auth.uid()) AND 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can update instances in their empresa"
  ON whatsapp_instances FOR UPDATE
  USING (
    empresa_id = get_user_empresa_id(auth.uid()) AND 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can delete instances in their empresa"
  ON whatsapp_instances FOR DELETE
  USING (
    empresa_id = get_user_empresa_id(auth.uid()) AND 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_whatsapp_instances_updated_at
  BEFORE UPDATE ON whatsapp_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Adicionar referência à instância nas conversas existentes (opcional)
ALTER TABLE conversas 
  ADD COLUMN IF NOT EXISTS whatsapp_instance_id UUID REFERENCES whatsapp_instances(id) ON DELETE SET NULL;

-- Adicionar campos extras nas mensagens (se necessário)
ALTER TABLE mensagens
  ADD COLUMN IF NOT EXISTS evolution_message_id VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS evolution_timestamp BIGINT,
  ADD COLUMN IF NOT EXISTS media_url TEXT,
  ADD COLUMN IF NOT EXISTS sender_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS sender_name VARCHAR(255);