import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { FormInput, FormSelect, FormTextarea } from '@/components/form';
import { Proposta, PropostaFormData } from '@/hooks/usePropostas';
import { useClientesSelect } from '@/hooks/useClientesSelect';
import { useProdutosSelect } from '@/hooks/useProdutosSelect';
import { useBancosSelect } from '@/hooks/useBancosSelect';
import { useEffect } from 'react';

const propostaSchema = yup.object({
  cliente_id: yup.string().required('Cliente é obrigatório'),
  tipo_proposta: yup
    .string()
    .required('Tipo de proposta é obrigatório')
    .oneOf(['credito', 'consorcio', 'seguro'], 'Tipo inválido'),
  banco_id: yup.string(),
  produto_id: yup.string(),
  valor: yup
    .number()
    .typeError('Valor deve ser um número')
    .required('Valor é obrigatório')
    .min(0.01, 'Valor deve ser maior que zero'),
  finalidade: yup.string().max(200, 'Finalidade deve ter no máximo 200 caracteres'),
  observacoes: yup.string().max(500, 'Observações devem ter no máximo 500 caracteres'),
  status: yup
    .string()
    .required('Status é obrigatório')
    .oneOf(
      ['rascunho', 'em_analise', 'aprovada', 'reprovada', 'cancelada'],
      'Status inválido'
    ),
  detalhes_produto: yup.object().nullable(),
});

interface PropostaFormProps {
  proposta?: Proposta;
  onSubmit: (data: PropostaFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function PropostaForm({ proposta, onSubmit, onCancel, loading }: PropostaFormProps) {
  const { clientes } = useClientesSelect();
  const { bancos } = useBancosSelect();
  
  const methods = useForm<PropostaFormData>({
    resolver: yupResolver(propostaSchema) as any,
    defaultValues: {
      cliente_id: proposta?.cliente_id || '',
      tipo_proposta: proposta?.tipo_proposta || 'credito',
      banco_id: proposta?.banco_id || '',
      produto_id: proposta?.produto_id || '',
      valor: proposta?.valor || 0,
      finalidade: proposta?.finalidade || '',
      observacoes: proposta?.observacoes || '',
      status: proposta?.status || 'rascunho',
      detalhes_produto: proposta?.detalhes_produto || {},
    },
    mode: 'onChange',
  });

  const selectedBancoId = methods.watch('banco_id');
  const tipoProposta = methods.watch('tipo_proposta');
  const { produtos } = useProdutosSelect(selectedBancoId);

  useEffect(() => {
    if (selectedBancoId && methods.getValues('produto_id')) {
      const produtoExists = produtos.find(p => p.value === methods.getValues('produto_id'));
      if (!produtoExists) {
        methods.setValue('produto_id', '');
      }
    }
  }, [selectedBancoId, produtos]);

  const statusOptions = [
    { value: 'rascunho', label: 'Rascunho' },
    { value: 'em_analise', label: 'Em Análise' },
    { value: 'aprovada', label: 'Aprovada' },
    { value: 'reprovada', label: 'Reprovada' },
    { value: 'cancelada', label: 'Cancelada' },
  ];

  const tipoPropostaOptions = [
    { value: 'credito', label: 'Crédito' },
    { value: 'consorcio', label: 'Consórcio' },
    { value: 'seguro', label: 'Seguro' },
  ];

  const tipoSeguroOptions = [
    { value: 'auto', label: 'Auto' },
    { value: 'residencial', label: 'Residencial' },
    { value: 'vida', label: 'Vida' },
    { value: 'saude', label: 'Saúde' },
    { value: 'empresarial', label: 'Empresarial' },
    { value: 'outros', label: 'Outros' },
  ];

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <FormSelect
          name="tipo_proposta"
          label="Tipo de Proposta *"
          placeholder="Selecione o tipo"
          options={tipoPropostaOptions}
        />

        <FormSelect
          name="cliente_id"
          label="Cliente *"
          placeholder="Selecione um cliente"
          options={clientes}
          helperText={clientes.length === 0 ? "Cadastre um cliente primeiro" : undefined}
        />

        <FormSelect
          name="banco_id"
          label="Banco"
          placeholder="Selecione um banco"
          options={bancos}
          helperText={bancos.length === 0 ? "Cadastre um banco primeiro" : undefined}
        />

        <FormSelect
          name="produto_id"
          label="Produto"
          placeholder={selectedBancoId ? "Selecione um produto" : "Selecione primeiro um banco"}
          options={produtos}
          disabled={!selectedBancoId}
        />

        <FormInput
          name="valor"
          label="Valor *"
          type="number"
          step="0.01"
          placeholder="Ex: 50000.00"
        />

        {tipoProposta === 'consorcio' && (
          <>
            <FormInput
              name="detalhes_produto.valor_bem"
              label="Valor do Bem"
              type="number"
              step="0.01"
              placeholder="Ex: 300000.00"
            />
            <FormInput
              name="detalhes_produto.valor_credito"
              label="Valor da Carta de Crédito"
              type="number"
              step="0.01"
              placeholder="Ex: 300000.00"
            />
            <FormInput
              name="detalhes_produto.prazo_grupo"
              label="Prazo do Grupo (meses)"
              type="number"
              placeholder="Ex: 180"
            />
            <FormInput
              name="detalhes_produto.taxa_adm_total"
              label="Taxa Administrativa Total (%)"
              type="number"
              step="0.01"
              placeholder="Ex: 17"
            />
            <FormInput
              name="detalhes_produto.numero_grupo"
              label="Número do Grupo"
              placeholder="Ex: G123"
            />
            <FormInput
              name="detalhes_produto.numero_cota"
              label="Número da Cota"
              placeholder="Ex: C456"
            />
          </>
        )}

        {tipoProposta === 'seguro' && (
          <>
            <FormSelect
              name="detalhes_produto.tipo_seguro"
              label="Tipo de Seguro"
              placeholder="Selecione o tipo"
              options={tipoSeguroOptions}
            />
            <FormInput
              name="detalhes_produto.valor_premio"
              label="Valor do Prêmio"
              type="number"
              step="0.01"
              placeholder="Ex: 2500.00"
            />
            <FormInput
              name="detalhes_produto.valor_cobertura"
              label="Valor da Cobertura (Importância Segurada)"
              type="number"
              step="0.01"
              placeholder="Ex: 500000.00"
            />
            <FormInput
              name="detalhes_produto.numero_apolice"
              label="Número da Apólice"
              placeholder="Ex: AP123456"
            />
            <FormInput
              name="detalhes_produto.vigencia_inicio"
              label="Vigência - Início"
              type="date"
            />
            <FormInput
              name="detalhes_produto.vigencia_fim"
              label="Vigência - Fim"
              type="date"
            />
            <FormTextarea
              name="detalhes_produto.objeto_segurado"
              label="Objeto Segurado"
              placeholder="Ex: Veículo: Placa ABC-1234, Modelo: Corolla"
              rows={3}
            />
          </>
        )}

        <FormInput
          name="finalidade"
          label="Finalidade"
          placeholder="Ex: Compra de veículo"
        />

        <FormTextarea
          name="observacoes"
          label="Observações"
          placeholder="Informações adicionais sobre a proposta"
          rows={4}
        />

        <FormSelect
          name="status"
          label="Status *"
          placeholder="Selecione o status"
          options={statusOptions}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : proposta ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
