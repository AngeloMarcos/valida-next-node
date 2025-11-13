-- Criar triggers para registrar alterações nas tabelas

-- Trigger para clientes
DROP TRIGGER IF EXISTS trigger_log_clientes_changes ON public.clientes;
CREATE TRIGGER trigger_log_clientes_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.log_clientes_changes();

-- Trigger para bancos
DROP TRIGGER IF EXISTS trigger_log_bancos_changes ON public.bancos;
CREATE TRIGGER trigger_log_bancos_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.bancos
  FOR EACH ROW EXECUTE FUNCTION public.log_bancos_changes();

-- Trigger para propostas (ESTE É O MAIS IMPORTANTE)
DROP TRIGGER IF EXISTS trigger_log_propostas_changes ON public.propostas;
CREATE TRIGGER trigger_log_propostas_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.propostas
  FOR EACH ROW EXECUTE FUNCTION public.log_propostas_changes();

-- Trigger para produtos
DROP TRIGGER IF EXISTS trigger_log_produtos_changes ON public.produtos;
CREATE TRIGGER trigger_log_produtos_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.produtos
  FOR EACH ROW EXECUTE FUNCTION public.log_produtos_changes();