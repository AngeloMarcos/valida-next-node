-- Add 'cartao_credito' to the tipo_proposta_enum
ALTER TYPE tipo_proposta_enum ADD VALUE 'cartao_credito';

-- No need to modify existing columns - they will automatically support the new enum value