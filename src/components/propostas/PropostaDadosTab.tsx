import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PropostaDetalhada } from '@/hooks/usePropostaDetalhes';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FileText, 
  User, 
  DollarSign, 
  Building2, 
  Package, 
  Calendar,
  Hash,
  Percent,
  Clock,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

interface PropostaDadosTabProps {
  proposta: PropostaDetalhada;
}

export function PropostaDadosTab({ proposta }: PropostaDadosTabProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatCPF = (cpf: string | null) => {
    if (!cpf) return 'N/A';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return 'N/A';
    // Remove non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    // Format: (11) 98765-4321
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return 'N/A';
    }
  };

  const formatPercent = (value: number | null) => {
    if (!value) return 'N/A';
    return `${value.toFixed(2)}%`;
  };

  const getTipoBadge = (tipo: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      credito: { label: 'Crédito', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
      credito_pessoal: { label: 'Crédito Pessoal', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
      consorcio: { label: 'Consórcio', className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
      cartao_credito: { label: 'Cartão de Crédito', className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' },
      seguro: { label: 'Seguro', className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' },
    };
    const config = variants[tipo] || { label: tipo, className: '' };
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      em_analise: { label: 'Em Análise', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
      doc_pendente: { label: 'Doc. Pendente', className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20' },
      em_processamento: { label: 'Em Processamento', className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
      aprovada: { label: 'Aprovada', className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' },
      recusada: { label: 'Recusada', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
      cancelada: { label: 'Cancelada', className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20' },
      rascunho: { label: 'Rascunho', className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20' },
    };
    const config = variants[status] || { label: status, className: '' };
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const DataItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | React.ReactNode }) => (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
      <Icon className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="font-medium text-sm mt-0.5">{value}</div>
      </div>
    </div>
  );

  // Extrair detalhes específicos do tipo de proposta
  const detalhes = proposta.detalhes_produto || {};
  const valor = proposta.valor || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* CARD 1 - DADOS DA PROPOSTA */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Dados da Proposta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <DataItem icon={Hash} label="Tipo de Proposta" value={getTipoBadge(proposta.tipo_proposta)} />
          <DataItem 
            icon={Package} 
            label="Produto" 
            value={proposta.produtos?.nome || 'N/A'} 
          />
          <DataItem icon={DollarSign} label="Valor" value={formatCurrency(valor)} />
          
          {/* Campos específicos por tipo */}
          {proposta.tipo_proposta === 'credito' && (
            <>
              {detalhes.prazo_meses && (
                <DataItem 
                  icon={Clock} 
                  label="Prazo" 
                  value={`${detalhes.prazo_meses} meses`} 
                />
              )}
              {detalhes.taxa_juros && (
                <DataItem 
                  icon={Percent} 
                  label="Taxa de Juros" 
                  value={`${formatPercent(detalhes.taxa_juros)} a.m.`} 
                />
              )}
              {detalhes.valor_parcela && (
                <DataItem 
                  icon={DollarSign} 
                  label="Valor da Parcela" 
                  value={formatCurrency(detalhes.valor_parcela)} 
                />
              )}
              {detalhes.tipo_operacao && (
                <DataItem 
                  icon={FileText} 
                  label="Tipo de Operação" 
                  value={detalhes.tipo_operacao === 'novo' ? 'Novo' : detalhes.tipo_operacao === 'refinanciamento' ? 'Refinanciamento' : 'Portabilidade'} 
                />
              )}
            </>
          )}

          {proposta.tipo_proposta === 'consorcio' && (
            <>
              {detalhes.valor_bem && (
                <DataItem 
                  icon={DollarSign} 
                  label="Valor do Bem" 
                  value={formatCurrency(detalhes.valor_bem)} 
                />
              )}
              {detalhes.prazo_meses && (
                <DataItem 
                  icon={Clock} 
                  label="Prazo" 
                  value={`${detalhes.prazo_meses} meses`} 
                />
              )}
              {detalhes.taxa_administracao && (
                <DataItem 
                  icon={Percent} 
                  label="Taxa de Administração" 
                  value={formatPercent(detalhes.taxa_administracao)} 
                />
              )}
            </>
          )}

          {proposta.tipo_proposta === 'seguro' && detalhes.limite_desejado && (
            <DataItem 
              icon={DollarSign} 
              label="Limite/Cobertura" 
              value={formatCurrency(detalhes.limite_desejado)} 
            />
          )}
        </CardContent>
      </Card>

      {/* CARD 2 - DADOS DO CLIENTE */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Dados do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <DataItem 
            icon={User} 
            label="Nome Completo" 
            value={proposta.clientes?.nome || 'N/A'} 
          />
          <DataItem 
            icon={Hash} 
            label="CPF" 
            value={formatCPF(proposta.clientes?.cpf || null)} 
          />
          {proposta.clientes?.email && (
            <DataItem 
              icon={Mail} 
              label="Email" 
              value={<span className="break-all">{proposta.clientes.email}</span>} 
            />
          )}
          
          {/* Nota: Telefone e cidade/estado não estão no schema atual de clientes */}
          <div className="pt-2 text-xs text-muted-foreground italic">
            * Mais informações podem ser adicionadas ao cadastro do cliente
          </div>
        </CardContent>
      </Card>

      {/* CARD 3 - INFORMAÇÕES OPERACIONAIS */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Informações Operacionais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <DataItem 
            icon={Building2} 
            label="Banco" 
            value={proposta.bancos?.nome || 'N/A'} 
          />
          
          <DataItem 
            icon={FileText} 
            label="Promotora" 
            value="-" 
          />
          
          <DataItem 
            icon={Calendar} 
            label="Data de Criação" 
            value={formatDate(proposta.data)} 
          />

          <DataItem 
            icon={Hash} 
            label="Status Atual" 
            value={getStatusBadge(proposta.status)} 
          />

          {proposta.observacoes && (
            <div className="p-3 rounded-lg bg-muted/50 mt-3 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1.5 font-medium">Observações</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{proposta.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
