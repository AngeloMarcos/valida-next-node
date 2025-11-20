import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect, SelectOption } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { useClientesSelect } from '@/hooks/useClientesSelect';
import { useBancosSelect } from '@/hooks/useBancosSelect';
import { Loader2 } from 'lucide-react';

// Schema base
const baseSchema = z.object({
  cliente_id: z.string().min(1, 'Cliente é obrigatório'),
  tipo_proposta: z.enum(['credito', 'consorcio', 'seguro'], {
    required_error: 'Tipo de proposta é obrigatório',
  }),
  produto_id: z.string().min(1, 'Produto é obrigatório'),
  banco_id: z.string().min(1, 'Banco é obrigatório'),
  status: z.string().default('em_analise'),
  observacoes: z.string().optional(),
});

// Schemas dinâmicos por tipo
const creditoSchema = z.object({
  tipo_operacao: z.enum(['novo', 'refinanciamento', 'portabilidade'], {
    required_error: 'Tipo de operação é obrigatório',
  }),
  valor_solicitado: z.number().min(0.01, 'Valor solicitado deve ser maior que zero'),
  valor_parcela: z.number().min(0.01, 'Valor da parcela deve ser maior que zero'),
  prazo_meses: z.number().int().min(1, 'Prazo deve ser no mínimo 1 mês'),
  taxa_juros: z.number().min(0, 'Taxa de juros deve ser maior ou igual a zero'),
});

const consorcioSchema = z.object({
  valor_credito: z.number().min(0.01, 'Valor do crédito deve ser maior que zero'),
  valor_bem: z.number().min(0.01, 'Valor do bem deve ser maior que zero'),
  prazo_meses: z.number().int().min(1, 'Prazo deve ser no mínimo 1 mês'),
  taxa_administracao: z.number().min(0, 'Taxa de administração deve ser maior ou igual a zero'),
});

const cartaoSchema = z.object({
  limite_desejado: z.number().min(0.01, 'Limite desejado deve ser maior que zero'),
});

interface PropostaFormDynamicProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PropostaFormDynamic({ onSuccess, onCancel }: PropostaFormDynamicProps) {
  const navigate = useNavigate();
  const { clientes, loading: loadingClientes } = useClientesSelect();
  const { bancos, loading: loadingBancos } = useBancosSelect();
  
  const [produtos, setProdutos] = useState<SelectOption[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Schema dinâmico baseado no tipo de proposta
  const [currentSchema, setCurrentSchema] = useState(baseSchema);
  
  const methods = useForm<any>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      cliente_id: '',
      tipo_proposta: 'credito' as const,
      produto_id: '',
      banco_id: '',
      status: 'em_analise',
      observacoes: '',
    },
  });

  const { watch, setValue, reset } = methods;
  const tipoProposta = watch('tipo_proposta');

  // Atualizar schema quando tipo_proposta mudar
  useEffect(() => {
    let newSchema = baseSchema;
    
    if (tipoProposta === 'credito') {
      newSchema = baseSchema.merge(creditoSchema);
    } else if (tipoProposta === 'consorcio') {
      newSchema = baseSchema.merge(consorcioSchema);
    } else if (tipoProposta === 'seguro') {
      newSchema = baseSchema.merge(cartaoSchema);
    }
    
    setCurrentSchema(newSchema);
  }, [tipoProposta]);

  // Carregar produtos quando tipo_proposta mudar
  useEffect(() => {
    if (tipoProposta) {
      loadProdutos(tipoProposta);
      // Resetar produto quando tipo mudar
      setValue('produto_id', '');
    }
  }, [tipoProposta]);

  const loadProdutos = async (tipo: string) => {
    setLoadingProdutos(true);
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('id, nome, tipo_credito')
        .eq('status', 'ativo')
        .order('nome', { ascending: true });

      if (error) throw error;

      const mappedProdutos = (data || [])
        .filter(produto => produto.id && produto.nome)
        .map(produto => ({
          value: produto.id,
          label: produto.tipo_credito ? `${produto.nome} - ${produto.tipo_credito}` : produto.nome,
        }));

      setProdutos(mappedProdutos);
    } catch (error: any) {
      toast.error('Erro ao carregar produtos: ' + error.message);
    } finally {
      setLoadingProdutos(false);
    }
  };

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      // Obter empresa_id do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('Perfil do usuário não encontrado');

      // Preparar detalhes baseado no tipo
      let detalhes: any = {};
      let valor = 0;

      if (data.tipo_proposta === 'credito') {
        detalhes = {
          tipo_operacao: data.tipo_operacao,
          valor_solicitado: data.valor_solicitado,
          valor_parcela: data.valor_parcela,
          prazo_meses: data.prazo_meses,
          taxa_juros: data.taxa_juros,
        };
        valor = data.valor_solicitado;
      } else if (data.tipo_proposta === 'consorcio') {
        detalhes = {
          valor_credito: data.valor_credito,
          valor_bem: data.valor_bem,
          prazo_meses: data.prazo_meses,
          taxa_administracao: data.taxa_administracao,
        };
        valor = data.valor_credito;
      } else if (data.tipo_proposta === 'seguro') {
        detalhes = {
          limite_desejado: data.limite_desejado,
        };
        valor = data.limite_desejado;
      }

      // 1. Inserir proposta
      const { data: novaProposta, error: propostaError } = await supabase
        .from('propostas')
        .insert({
          cliente_id: data.cliente_id,
          tipo_proposta: data.tipo_proposta,
          produto_id: data.produto_id,
          banco_id: data.banco_id,
          status: data.status,
          observacoes: data.observacoes || null,
          detalhes_produto: detalhes,
          valor: valor,
          empresa_id: profile.empresa_id,
          usuario_id: user.id,
        })
        .select()
        .single();

      if (propostaError) throw propostaError;

      // 2. Inserir histórico de criação
      const { error: historicoError } = await supabase
        .from('proposta_historico')
        .insert({
          proposta_id: novaProposta.id,
          status_novo: data.status,
          status_anterior: null,
          empresa_id: profile.empresa_id,
          usuario_id: user.id,
        });

      if (historicoError) throw historicoError;

      // 3. Criar checklist inicial de documentos
      const documentosIniciais = [
        { nome: 'RG/CNH', obrigatorio: true },
        { nome: 'CPF', obrigatorio: true },
        { nome: 'Comprovante de Residência', obrigatorio: true },
        { nome: 'Comprovante de Renda', obrigatorio: true },
      ];

      const documentosParaInserir = documentosIniciais.map(doc => ({
        proposta_id: novaProposta.id,
        nome_documento: doc.nome,
        obrigatorio: doc.obrigatorio,
        status_documento: 'pendente',
        empresa_id: profile.empresa_id,
        usuario_id: user.id,
      }));

      const { error: documentosError } = await supabase
        .from('proposta_documentos')
        .insert(documentosParaInserir);

      if (documentosError) throw documentosError;

      toast.success('Proposta criada com sucesso!');
      
      // Redirecionar para a página de detalhes
      navigate(`/propostas/${novaProposta.id}`);
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Erro ao criar proposta: ' + error.message);
      console.error('Erro ao criar proposta:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const tipoPropostaOptions: SelectOption[] = [
    { value: 'credito', label: 'Crédito Pessoal' },
    { value: 'consorcio', label: 'Consórcio' },
    { value: 'seguro', label: 'Cartão de Crédito' },
  ];

  const statusOptions: SelectOption[] = [
    { value: 'em_analise', label: 'Em Análise' },
    { value: 'aprovada', label: 'Aprovada' },
    { value: 'reprovada', label: 'Reprovada' },
    { value: 'pendente', label: 'Pendente' },
  ];

  const tipoOperacaoOptions: SelectOption[] = [
    { value: 'novo', label: 'Novo' },
    { value: 'refinanciamento', label: 'Refinanciamento' },
    { value: 'portabilidade', label: 'Portabilidade' },
  ];

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        {/* SEÇÃO 1: DADOS PRINCIPAIS */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Principais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                name="cliente_id"
                label="Cliente"
                placeholder="Selecione o cliente"
                options={clientes}
                disabled={loadingClientes}
              />
              
              <FormSelect
                name="tipo_proposta"
                label="Tipo de Proposta"
                placeholder="Selecione o tipo"
                options={tipoPropostaOptions}
              />
              
              <FormSelect
                name="produto_id"
                label="Produto"
                placeholder="Selecione o produto"
                options={produtos}
                disabled={loadingProdutos || !tipoProposta}
                helperText={!tipoProposta ? 'Selecione o tipo de proposta primeiro' : ''}
              />
            </div>
          </CardContent>
        </Card>

        {/* SEÇÃO 2: DETALHES DA OPERAÇÃO (DINÂMICO) */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Operação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tipoProposta === 'credito' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  name="tipo_operacao"
                  label="Tipo de Operação"
                  placeholder="Selecione o tipo"
                  options={tipoOperacaoOptions}
                />
                
                <FormInput
                  name="valor_solicitado"
                  label="Valor Solicitado (R$)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setValue('valor_solicitado', value, { shouldValidate: true });
                  }}
                />
                
                <FormInput
                  name="valor_parcela"
                  label="Valor da Parcela (R$)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setValue('valor_parcela', value, { shouldValidate: true });
                  }}
                />
                
                <FormInput
                  name="prazo_meses"
                  label="Prazo (meses)"
                  type="number"
                  placeholder="12"
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setValue('prazo_meses', value, { shouldValidate: true });
                  }}
                />
                
                <FormInput
                  name="taxa_juros"
                  label="Taxa de Juros (% a.m.)"
                  type="number"
                  step="0.01"
                  placeholder="1.99"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setValue('taxa_juros', value, { shouldValidate: true });
                  }}
                />
              </div>
            )}

            {tipoProposta === 'consorcio' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  name="valor_credito"
                  label="Valor do Crédito (R$)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setValue('valor_credito', value, { shouldValidate: true });
                  }}
                />
                
                <FormInput
                  name="valor_bem"
                  label="Valor do Bem (R$)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setValue('valor_bem', value, { shouldValidate: true });
                  }}
                />
                
                <FormInput
                  name="prazo_meses"
                  label="Prazo (meses)"
                  type="number"
                  placeholder="120"
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setValue('prazo_meses', value, { shouldValidate: true });
                  }}
                />
                
                <FormInput
                  name="taxa_administracao"
                  label="Taxa de Administração (%)"
                  type="number"
                  step="0.01"
                  placeholder="0.20"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setValue('taxa_administracao', value, { shouldValidate: true });
                  }}
                />
              </div>
            )}

            {tipoProposta === 'seguro' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  name="limite_desejado"
                  label="Limite Desejado (R$)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setValue('limite_desejado', value, { shouldValidate: true });
                  }}
                />
              </div>
            )}

            {!tipoProposta && (
              <div className="text-center py-8 text-muted-foreground">
                Selecione um tipo de proposta para ver os campos específicos
              </div>
            )}
          </CardContent>
        </Card>

        {/* SEÇÃO 3: FINALIZAÇÃO */}
        <Card>
          <CardHeader>
            <CardTitle>Finalização</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                name="banco_id"
                label="Banco"
                placeholder="Selecione o banco"
                options={bancos}
                disabled={loadingBancos}
              />
              
              <FormSelect
                name="status"
                label="Status Inicial"
                placeholder="Selecione o status"
                options={statusOptions}
              />
            </div>
            
            <FormTextarea
              name="observacoes"
              label="Observações"
              placeholder="Observações adicionais sobre a proposta..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* BOTÕES DE AÇÃO */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              if (onCancel) onCancel();
            }}
            disabled={submitting}
            className="w-full sm:w-auto min-h-[44px]"
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto min-h-[44px]"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitting ? 'Salvando...' : 'Criar Proposta'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
