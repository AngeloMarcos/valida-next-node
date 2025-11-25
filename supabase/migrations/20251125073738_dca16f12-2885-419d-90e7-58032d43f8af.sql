-- Add missing fields to existing tables for Evolution API integration

-- Add fields to conversas table
ALTER TABLE conversas 
ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_group BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_conversas_cliente_id ON conversas(cliente_id);

-- Add fields to mensagens table  
ALTER TABLE mensagens
ADD COLUMN IF NOT EXISTS direction VARCHAR(20) DEFAULT 'incoming',
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;

-- Update whatsapp_instances if needed
ALTER TABLE whatsapp_instances
ADD COLUMN IF NOT EXISTS always_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS groups_ignore BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS read_messages BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reject_calls BOOLEAN DEFAULT true;