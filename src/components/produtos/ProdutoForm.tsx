import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Produto, ProdutoFormData } from '@/hooks/useProdutos';
import { useBancosSelect } from '@/hooks/useBancosSelect';
import { useEffect } from 'react';

const produtoSchema = yup.object({
  nome: yup
    .string()
    .required('Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  tipo_credito: yup.string(),
  taxa_juros: yup
    .number()
    .typeError('Taxa de juros deve ser um número')
    .min(0, 'Taxa de juros deve ser maior ou igual a 0')
    .max(100, 'Taxa de juros deve ser menor ou igual a 100'),
  status: yup
    .string()
    .required('Status é obrigatório')
    .oneOf(['ativo', 'inativo'], 'Status inválido'),
  banco_id: yup.string(),
});

interface ProdutoFormProps {
  produto?: Produto;
  onSubmit: (data: ProdutoFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ProdutoForm({ produto, onSubmit, onCancel, loading }: ProdutoFormProps) {
  const { bancos } = useBancosSelect();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProdutoFormData>({
    resolver: yupResolver(produtoSchema) as any,
    defaultValues: {
      nome: produto?.nome || '',
      tipo_credito: produto?.tipo_credito || '',
      taxa_juros: produto?.taxa_juros || undefined,
      status: produto?.status || 'ativo',
      banco_id: produto?.banco_id || '',
    },
  });

  const selectedBanco = watch('banco_id');
  const selectedStatus = watch('status');

  useEffect(() => {
    if (produto?.banco_id) {
      setValue('banco_id', produto.banco_id);
    }
    if (produto?.status) {
      setValue('status', produto.status);
    }
  }, [produto, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome do Produto *</Label>
        <Input
          id="nome"
          placeholder="Ex: Crédito Consignado"
          {...register('nome')}
        />
        {errors.nome && (
          <p className="text-sm text-destructive">{errors.nome.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipo_credito">Tipo de Crédito</Label>
        <Input
          id="tipo_credito"
          placeholder="Ex: Consignado, Pessoal, Empresarial"
          {...register('tipo_credito')}
        />
        {errors.tipo_credito && (
          <p className="text-sm text-destructive">{errors.tipo_credito.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="taxa_juros">Taxa de Juros (% a.m.)</Label>
        <Input
          id="taxa_juros"
          type="number"
          step="0.01"
          placeholder="Ex: 2.5"
          {...register('taxa_juros')}
        />
        {errors.taxa_juros && (
          <p className="text-sm text-destructive">{errors.taxa_juros.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="banco_id">Banco</Label>
        <Select
          value={selectedBanco}
          onValueChange={(value) => setValue('banco_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um banco" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Nenhum</SelectItem>
            {bancos.map((banco) => (
              <SelectItem key={banco.id} value={banco.id}>
                {banco.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.banco_id && (
          <p className="text-sm text-destructive">{errors.banco_id.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status *</Label>
        <Select
          value={selectedStatus}
          onValueChange={(value) => setValue('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-sm text-destructive">{errors.status.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : produto ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
}
