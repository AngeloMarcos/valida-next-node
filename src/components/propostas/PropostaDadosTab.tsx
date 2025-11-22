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
  FileCheck
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

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getTipoBadge = (tipo: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      credito: { label: 'Crédito', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      consorcio: { label: 'Consórcio', className: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
      seguro: { label: 'Seguro', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
    };
    const config = variants[tipo] || { label: tipo, className: '' };
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const DataItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | React.ReactNode }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium truncate">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Card 1 - Dados da Proposta */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Dados da Proposta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <DataItem icon={Hash} label="Tipo" value={getTipoBadge(proposta.tipo_proposta)} />
          <DataItem 
            icon={Package} 
            label="Produto" 
            value={proposta.produtos?.nome || 'N/A'} 
          />
          <DataItem icon={DollarSign} label="Valor" value={formatCurrency(proposta.valor)} />
          
          {proposta.detalhes_produto?.prazo && (
            <DataItem 
              icon={Clock} 
              label="Prazo" 
              value={`${proposta.detalhes_produto.prazo} meses`} 
            />
          )}
          
          {proposta.produtos?.taxa_juros && (
            <DataItem 
              icon={Percent} 
              label="Taxa" 
              value={`${proposta.produtos.taxa_juros}% a.m.`} 
            />
          )}

          {proposta.finalidade && (
            <DataItem 
              icon={FileCheck} 
              label="Finalidade" 
              value={proposta.finalidade} 
            />
          )}
        </CardContent>
      </Card>

      {/* Card 2 - Dados do Cliente */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <DataItem 
            icon={User} 
            label="Nome" 
            value={proposta.clientes?.nome || 'N/A'} 
          />
          <DataItem 
            icon={Hash} 
            label="CPF" 
            value={formatCPF(proposta.clientes?.cpf || null)} 
          />
          <DataItem 
            icon={FileText} 
            label="Email" 
            value={proposta.clientes?.email || 'N/A'} 
          />
        </CardContent>
      </Card>

      {/* Card 3 - Informações Financeiras */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informações Financeiras
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <DataItem 
            icon={Building2} 
            label="Banco" 
            value={proposta.bancos?.nome || 'N/A'} 
          />
          
          {proposta.bancos?.cnpj && (
            <DataItem 
              icon={Hash} 
              label="CNPJ do Banco" 
              value={proposta.bancos.cnpj} 
            />
          )}
          
          <DataItem 
            icon={Calendar} 
            label="Data de Criação" 
            value={formatDate(proposta.data)} 
          />

          {proposta.observacoes && (
            <div className="p-3 rounded-lg bg-muted/50 mt-2">
              <p className="text-sm text-muted-foreground mb-1">Observações</p>
              <p className="text-sm">{proposta.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
