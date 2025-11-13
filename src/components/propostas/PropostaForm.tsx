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
      banco_id: proposta?.banco_id || '',
      produto_id: proposta?.produto_id || '',
      valor: proposta?.valor || 0,
      finalidade: proposta?.finalidade || '',
      observacoes: proposta?.observacoes || '',
      status: proposta?.status || 'rascunho',
    },
    mode: 'onChange',
  });

  const selectedBancoId = methods.watch('banco_id');
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

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
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
