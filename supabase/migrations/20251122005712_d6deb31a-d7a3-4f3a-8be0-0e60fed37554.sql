-- População de Dados de Exemplo para AprovaCRM
-- Adaptado para o schema atual do banco

DO $$
DECLARE
  v_empresa_id uuid;
  v_bb_id uuid;
  v_caixa_id uuid;
  v_bradesco_id uuid;
  v_itau_id uuid;
  v_santander_id uuid;
  v_nubank_id uuid;
  v_inter_id uuid;
  v_c6_id uuid;
BEGIN
  -- Pegar a primeira empresa (Empresa Padrão)
  SELECT id INTO v_empresa_id FROM public.empresas ORDER BY created_at ASC LIMIT 1;
  
  IF v_empresa_id IS NULL THEN
    RAISE EXCEPTION 'Nenhuma empresa encontrada';
  END IF;

  -- 1. CLIENTES (15) - Verifica se CPF já existe
  -- ═══════════════════════════════════════════════════════
  INSERT INTO public.clientes (empresa_id, nome, cpf, email, ativo)
  SELECT v_empresa_id, 'Silva Santos', '12345678901', 'silva@email.com', true
  WHERE NOT EXISTS (SELECT 1 FROM public.clientes WHERE cpf = '12345678901');

  INSERT INTO public.clientes (empresa_id, nome, cpf, email, ativo)
  SELECT v_empresa_id, 'Maria Oliveira', '23456789012', 'maria@email.com', true
  WHERE NOT EXISTS (SELECT 1 FROM public.clientes WHERE cpf = '23456789012');

  INSERT INTO public.clientes (empresa_id, nome, cpf, email, ativo)
  SELECT v_empresa_id, 'João Costa', '34567890123', 'joao@email.com', true
  WHERE NOT EXISTS (SELECT 1 FROM public.clientes WHERE cpf = '34567890123');

  INSERT INTO public.clientes (empresa_id, nome, cpf, email, ativo)
  SELECT v_empresa_id, 'Ana Ferreira', '45678901234', 'ana@email.com', true
  WHERE NOT EXISTS (SELECT 1 FROM public.clientes WHERE cpf = '45678901234');

  INSERT INTO public.clientes (empresa_id, nome, cpf, email, ativo)
  SELECT v_empresa_id, 'Carlos Mendes', '56789012345', 'carlos@email.com', true
  WHERE NOT EXISTS (SELECT 1 FROM public.clientes WHERE cpf = '56789012345');

  INSERT INTO public.clientes (empresa_id, nome, cpf, email, ativo)
  SELECT v_empresa_id, 'Patricia Lima', '67890123456', 'patricia@email.com', true
  WHERE NOT EXISTS (SELECT 1 FROM public.clientes WHERE cpf = '67890123456');

  INSERT INTO public.clientes (empresa_id, nome, cpf, email, ativo)
  SELECT v_empresa_id, 'Roberto Alves', '78901234567', 'roberto@email.com', true
  WHERE NOT EXISTS (SELECT 1 FROM public.clientes WHERE cpf = '78901234567');

  INSERT INTO public.clientes (empresa_id, nome, cpf, email, ativo)
  SELECT v_empresa_id, 'Fernanda Rocha', '89012345678', 'fernanda@email.com', true
  WHERE NOT EXISTS (SELECT 1 FROM public.clientes WHERE cpf = '89012345678');

  INSERT INTO public.clientes (empresa_id, nome, cpf, email, ativo)
  SELECT v_empresa_id, 'Leonardo Dias', '90123456789', 'leonardo@email.com', true
  WHERE NOT EXISTS (SELECT 1 FROM public.clientes WHERE cpf = '90123456789');

  INSERT INTO public.clientes (empresa_id, nome, cpf, email, ativo)
  SELECT v_empresa_id, 'Camila Moura', '01234567890', 'camila@email.com', true
  WHERE NOT EXISTS (SELECT 1 FROM public.clientes WHERE cpf = '01234567890');

  INSERT INTO public.clientes (empresa_id, nome, cpf, email, ativo)
  SELECT v_empresa_id, 'Marcos Gomes', '12301234567', 'marcos@email.com', true
  WHERE NOT EXISTS (SELECT 1 FROM public.clientes WHERE cpf = '12301234567');

  INSERT INTO public.clientes (empresa_id, nome, cpf, email, ativo)
  SELECT v_empresa_id, 'Juliana Souza', '23412345678', 'juliana@email.com', true
  WHERE NOT EXISTS (SELECT 1 FROM public.clientes WHERE cpf = '23412345678');

  INSERT INTO public.clientes (empresa_id, nome, cpf, email, ativo)
  SELECT v_empresa_id, 'Victor Neves', '34523456789', 'victor@email.com', true
  WHERE NOT EXISTS (SELECT 1 FROM public.clientes WHERE cpf = '34523456789');

  INSERT INTO public.clientes (empresa_id, nome, cpf, email, ativo)
  SELECT v_empresa_id, 'Beatriz Cardoso', '45634567890', 'beatriz@email.com', true
  WHERE NOT EXISTS (SELECT 1 FROM public.clientes WHERE cpf = '45634567890');

  INSERT INTO public.clientes (empresa_id, nome, cpf, email, ativo)
  SELECT v_empresa_id, 'Felipe Barros', '56745678901', 'felipe@email.com', true
  WHERE NOT EXISTS (SELECT 1 FROM public.clientes WHERE cpf = '56745678901');

  RAISE NOTICE '✓ Clientes processados';

  -- 2. BANCOS (8)
  -- ═══════════════════════════════════════════════════════
  INSERT INTO public.bancos (empresa_id, nome, cnpj, email, telefone, ativo)
  SELECT v_empresa_id, 'Banco do Brasil', '00.000.000/0001-91', 'bb@bb.com.br', '(11) 4004-0001', true
  WHERE NOT EXISTS (SELECT 1 FROM public.bancos WHERE nome = 'Banco do Brasil' AND empresa_id = v_empresa_id);

  INSERT INTO public.bancos (empresa_id, nome, cnpj, email, telefone, ativo)
  SELECT v_empresa_id, 'Caixa Econômica Federal', '00.360.305/0001-04', 'caixa@caixa.gov.br', '(11) 4004-0104', true
  WHERE NOT EXISTS (SELECT 1 FROM public.bancos WHERE nome = 'Caixa Econômica Federal' AND empresa_id = v_empresa_id);

  INSERT INTO public.bancos (empresa_id, nome, cnpj, email, telefone, ativo)
  SELECT v_empresa_id, 'Bradesco', '60.746.948/0001-12', 'atendimento@bradesco.com.br', '(11) 4004-2374', true
  WHERE NOT EXISTS (SELECT 1 FROM public.bancos WHERE nome = 'Bradesco' AND empresa_id = v_empresa_id);

  INSERT INTO public.bancos (empresa_id, nome, cnpj, email, telefone, ativo)
  SELECT v_empresa_id, 'Itaú', '60.701.190/0001-04', 'atendimento@itau.com.br', '(11) 4004-4828', true
  WHERE NOT EXISTS (SELECT 1 FROM public.bancos WHERE nome = 'Itaú' AND empresa_id = v_empresa_id);

  INSERT INTO public.bancos (empresa_id, nome, cnpj, email, telefone, ativo)
  SELECT v_empresa_id, 'Santander', '90.400.888/0001-42', 'santander@santander.com.br', '(11) 4004-3535', true
  WHERE NOT EXISTS (SELECT 1 FROM public.bancos WHERE nome = 'Santander' AND empresa_id = v_empresa_id);

  INSERT INTO public.bancos (empresa_id, nome, cnpj, email, telefone, ativo)
  SELECT v_empresa_id, 'Nubank', '18.236.120/0001-58', 'meajuda@nubank.com.br', '(11) 4020-0260', true
  WHERE NOT EXISTS (SELECT 1 FROM public.bancos WHERE nome = 'Nubank' AND empresa_id = v_empresa_id);

  INSERT INTO public.bancos (empresa_id, nome, cnpj, email, telefone, ativo)
  SELECT v_empresa_id, 'Banco Inter', '00.416.968/0001-01', 'faleconosco@bancointer.com.br', '(31) 3003-4070', true
  WHERE NOT EXISTS (SELECT 1 FROM public.bancos WHERE nome = 'Banco Inter' AND empresa_id = v_empresa_id);

  INSERT INTO public.bancos (empresa_id, nome, cnpj, email, telefone, ativo)
  SELECT v_empresa_id, 'C6 Bank', '31.872.495/0001-72', 'falecom@c6bank.com.br', '(11) 3003-6116', true
  WHERE NOT EXISTS (SELECT 1 FROM public.bancos WHERE nome = 'C6 Bank' AND empresa_id = v_empresa_id);

  RAISE NOTICE '✓ Bancos processados';

  -- Pegar IDs dos bancos para os produtos e promotoras
  SELECT id INTO v_bb_id FROM public.bancos WHERE nome = 'Banco do Brasil' AND empresa_id = v_empresa_id LIMIT 1;
  SELECT id INTO v_caixa_id FROM public.bancos WHERE nome = 'Caixa Econômica Federal' AND empresa_id = v_empresa_id LIMIT 1;
  SELECT id INTO v_bradesco_id FROM public.bancos WHERE nome = 'Bradesco' AND empresa_id = v_empresa_id LIMIT 1;
  SELECT id INTO v_itau_id FROM public.bancos WHERE nome = 'Itaú' AND empresa_id = v_empresa_id LIMIT 1;
  SELECT id INTO v_santander_id FROM public.bancos WHERE nome = 'Santander' AND empresa_id = v_empresa_id LIMIT 1;
  SELECT id INTO v_nubank_id FROM public.bancos WHERE nome = 'Nubank' AND empresa_id = v_empresa_id LIMIT 1;
  SELECT id INTO v_inter_id FROM public.bancos WHERE nome = 'Banco Inter' AND empresa_id = v_empresa_id LIMIT 1;
  SELECT id INTO v_c6_id FROM public.bancos WHERE nome = 'C6 Bank' AND empresa_id = v_empresa_id LIMIT 1;

  -- 3. PRODUTOS (12)
  -- ═══════════════════════════════════════════════════════
  INSERT INTO public.produtos (empresa_id, nome, tipo_credito, taxa_juros, banco_id, status, ativo)
  SELECT v_empresa_id, 'Crédito Pessoal Básico', 'pessoal', 2.49, v_bb_id, 'ativo', true
  WHERE NOT EXISTS (SELECT 1 FROM public.produtos WHERE nome = 'Crédito Pessoal Básico' AND empresa_id = v_empresa_id);

  INSERT INTO public.produtos (empresa_id, nome, tipo_credito, taxa_juros, banco_id, status, ativo)
  SELECT v_empresa_id, 'Crédito Pessoal Premium', 'pessoal', 1.89, v_itau_id, 'ativo', true
  WHERE NOT EXISTS (SELECT 1 FROM public.produtos WHERE nome = 'Crédito Pessoal Premium' AND empresa_id = v_empresa_id);

  INSERT INTO public.produtos (empresa_id, nome, tipo_credito, taxa_juros, banco_id, status, ativo)
  SELECT v_empresa_id, 'Crédito Rápido', 'pessoal', 3.49, v_nubank_id, 'ativo', true
  WHERE NOT EXISTS (SELECT 1 FROM public.produtos WHERE nome = 'Crédito Rápido' AND empresa_id = v_empresa_id);

  INSERT INTO public.produtos (empresa_id, nome, tipo_credito, taxa_juros, banco_id, status, ativo)
  SELECT v_empresa_id, 'Consignado Público', 'consignado', 1.29, v_caixa_id, 'ativo', true
  WHERE NOT EXISTS (SELECT 1 FROM public.produtos WHERE nome = 'Consignado Público' AND empresa_id = v_empresa_id);

  INSERT INTO public.produtos (empresa_id, nome, tipo_credito, taxa_juros, banco_id, status, ativo)
  SELECT v_empresa_id, 'Consignado Privado', 'consignado', 1.59, v_bradesco_id, 'ativo', true
  WHERE NOT EXISTS (SELECT 1 FROM public.produtos WHERE nome = 'Consignado Privado' AND empresa_id = v_empresa_id);

  INSERT INTO public.produtos (empresa_id, nome, tipo_credito, taxa_juros, banco_id, status, ativo)
  SELECT v_empresa_id, 'Consignado INSS', 'consignado', 1.39, v_santander_id, 'ativo', true
  WHERE NOT EXISTS (SELECT 1 FROM public.produtos WHERE nome = 'Consignado INSS' AND empresa_id = v_empresa_id);

  INSERT INTO public.produtos (empresa_id, nome, tipo_credito, taxa_juros, banco_id, status, ativo)
  SELECT v_empresa_id, 'Financiamento Auto', 'veicular', 1.89, v_bb_id, 'ativo', true
  WHERE NOT EXISTS (SELECT 1 FROM public.produtos WHERE nome = 'Financiamento Auto' AND empresa_id = v_empresa_id);

  INSERT INTO public.produtos (empresa_id, nome, tipo_credito, taxa_juros, banco_id, status, ativo)
  SELECT v_empresa_id, 'Financiamento Moto', 'veicular', 2.19, v_bradesco_id, 'ativo', true
  WHERE NOT EXISTS (SELECT 1 FROM public.produtos WHERE nome = 'Financiamento Moto' AND empresa_id = v_empresa_id);

  INSERT INTO public.produtos (empresa_id, nome, tipo_credito, taxa_juros, banco_id, status, ativo)
  SELECT v_empresa_id, 'Financiamento Imobiliário', 'imobiliario', 0.99, v_caixa_id, 'ativo', true
  WHERE NOT EXISTS (SELECT 1 FROM public.produtos WHERE nome = 'Financiamento Imobiliário' AND empresa_id = v_empresa_id);

  INSERT INTO public.produtos (empresa_id, nome, tipo_credito, taxa_juros, banco_id, status, ativo)
  SELECT v_empresa_id, 'Crédito Imobiliário Premium', 'imobiliario', 0.89, v_itau_id, 'ativo', true
  WHERE NOT EXISTS (SELECT 1 FROM public.produtos WHERE nome = 'Crédito Imobiliário Premium' AND empresa_id = v_empresa_id);

  INSERT INTO public.produtos (empresa_id, nome, tipo_credito, taxa_juros, banco_id, status, ativo)
  SELECT v_empresa_id, 'Capital de Giro', 'empresarial', 2.89, v_inter_id, 'ativo', true
  WHERE NOT EXISTS (SELECT 1 FROM public.produtos WHERE nome = 'Capital de Giro' AND empresa_id = v_empresa_id);

  INSERT INTO public.produtos (empresa_id, nome, tipo_credito, taxa_juros, banco_id, status, ativo)
  SELECT v_empresa_id, 'Antecipação Recebíveis', 'empresarial', 3.29, v_c6_id, 'ativo', true
  WHERE NOT EXISTS (SELECT 1 FROM public.produtos WHERE nome = 'Antecipação Recebíveis' AND empresa_id = v_empresa_id);

  RAISE NOTICE '✓ Produtos processados';

  -- 4. PROMOTORAS (6)
  -- ═══════════════════════════════════════════════════════
  INSERT INTO public.promotoras (empresa_id, nome, banco_id, email, telefone, contato, comissao_padrao, ativo)
  SELECT v_empresa_id, 'Promotora BB Capital', v_bb_id, 'contato@bbcapital.com.br', '(11) 98765-4321', 'Carlos Silva', 3.5, true
  WHERE NOT EXISTS (SELECT 1 FROM public.promotoras WHERE nome = 'Promotora BB Capital' AND empresa_id = v_empresa_id);

  INSERT INTO public.promotoras (empresa_id, nome, banco_id, email, telefone, contato, comissao_padrao, ativo)
  SELECT v_empresa_id, 'Caixa Promotora', v_caixa_id, 'comercial@caixapromotora.com.br', '(11) 98765-4322', 'Maria Santos', 4.0, true
  WHERE NOT EXISTS (SELECT 1 FROM public.promotoras WHERE nome = 'Caixa Promotora' AND empresa_id = v_empresa_id);

  INSERT INTO public.promotoras (empresa_id, nome, banco_id, email, telefone, contato, comissao_padrao, ativo)
  SELECT v_empresa_id, 'Bradesco Correspondente', v_bradesco_id, 'atendimento@bradescocorresp.com.br', '(11) 98765-4323', 'João Oliveira', 3.8, true
  WHERE NOT EXISTS (SELECT 1 FROM public.promotoras WHERE nome = 'Bradesco Correspondente' AND empresa_id = v_empresa_id);

  INSERT INTO public.promotoras (empresa_id, nome, banco_id, email, telefone, contato, comissao_padrao, ativo)
  SELECT v_empresa_id, 'Itaú Promotora Digital', v_itau_id, 'digital@itaupromotora.com.br', '(11) 98765-4324', 'Ana Costa', 3.2, true
  WHERE NOT EXISTS (SELECT 1 FROM public.promotoras WHERE nome = 'Itaú Promotora Digital' AND empresa_id = v_empresa_id);

  INSERT INTO public.promotoras (empresa_id, nome, banco_id, email, telefone, contato, comissao_padrao, ativo)
  SELECT v_empresa_id, 'Santander Plus', v_santander_id, 'plus@santanderpromotora.com.br', '(11) 98765-4325', 'Roberto Mendes', 4.2, true
  WHERE NOT EXISTS (SELECT 1 FROM public.promotoras WHERE nome = 'Santander Plus' AND empresa_id = v_empresa_id);

  INSERT INTO public.promotoras (empresa_id, nome, banco_id, email, telefone, contato, comissao_padrao, ativo)
  SELECT v_empresa_id, 'Nu Correspondente', v_nubank_id, 'parceiros@nucorrespondente.com.br', '(11) 98765-4326', 'Patricia Lima', 3.0, true
  WHERE NOT EXISTS (SELECT 1 FROM public.promotoras WHERE nome = 'Nu Correspondente' AND empresa_id = v_empresa_id);

  RAISE NOTICE '✓ Promotoras processadas';
  RAISE NOTICE '════════════════════════════════════════════════';
  RAISE NOTICE 'Dados de exemplo inseridos com sucesso!';
  RAISE NOTICE '✓ 15 Clientes | ✓ 8 Bancos | ✓ 12 Produtos | ✓ 6 Promotoras';
  RAISE NOTICE '════════════════════════════════════════════════';
  
END $$;