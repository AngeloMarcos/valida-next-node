import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/form';
import { Banco, BancoFormData } from '@/hooks/useBancos';

const bancoSchema = yup.object({
  nome: yup
    .string()
    .transform((value) => value?.trim())
    .required('Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  cnpj: yup.string().transform((value) => value?.trim()),
  email: yup.string().transform((value) => value?.trim()).email('E-mail inválido'),
  telefone: yup.string().transform((value) => value?.trim()),
});

interface BancoFormProps {
  banco?: Banco;
  onSubmit: (data: BancoFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function BancoForm({ banco, onSubmit, onCancel, loading }: BancoFormProps) {
  const methods = useForm<BancoFormData>({
    resolver: yupResolver(bancoSchema) as any,
    defaultValues: {
      nome: banco?.nome || '',
      cnpj: banco?.cnpj || '',
      email: banco?.email || '',
      telefone: banco?.telefone || '',
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          name="nome"
          label="Nome do Banco *"
          placeholder="Ex: Banco do Brasil"
        />

        <FormInput
          name="cnpj"
          label="CNPJ"
          placeholder="00.000.000/0000-00"
          maxLength={18}
        />

        <FormInput
          name="email"
          label="E-mail"
          type="email"
          placeholder="contato@banco.com.br"
        />

        <FormInput
          name="telefone"
          label="Telefone"
          placeholder="(00) 00000-0000"
          maxLength={15}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : banco ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
