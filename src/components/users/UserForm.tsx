import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { FormInput, FormSelect } from '@/components/form';
import { User, UserFormData, UserRole } from '@/hooks/useUsers';

const userSchema = yup.object({
  nome: yup
    .string()
    .transform((value) => value?.trim())
    .required('Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: yup
    .string()
    .transform((value) => value?.trim())
    .required('E-mail é obrigatório')
    .email('E-mail inválido'),
  role: yup
    .string()
    .required('Perfil é obrigatório')
    .oneOf(['admin', 'supervisor', 'correspondente'], 'Perfil inválido'),
  status: yup
    .string()
    .required('Status é obrigatório')
    .oneOf(['active', 'inactive'], 'Status inválido'),
});

interface UserFormProps {
  user?: User;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'correspondente', label: 'Correspondente' },
];

const statusOptions = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
];

export function UserForm({ user, onSubmit, onCancel, loading }: UserFormProps) {
  const methods = useForm<UserFormData>({
    resolver: yupResolver(userSchema) as any,
    defaultValues: {
      nome: user?.nome || '',
      email: user?.email || '',
      role: user?.role || 'correspondente',
      status: user?.status || 'active',
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          name="nome"
          label="Nome *"
          placeholder="Ex: João Silva"
        />

        <FormInput
          name="email"
          label="E-mail *"
          type="email"
          placeholder="usuario@empresa.com.br"
          disabled={!!user}
          helperText={user ? 'O e-mail não pode ser alterado' : undefined}
        />

        <FormSelect
          name="role"
          label="Perfil *"
          options={roleOptions}
          placeholder="Selecione o perfil"
        />

        <FormSelect
          name="status"
          label="Status *"
          options={statusOptions}
          placeholder="Selecione o status"
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : user ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
