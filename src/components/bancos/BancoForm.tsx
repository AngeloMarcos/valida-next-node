import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Banco, BancoFormData } from '@/hooks/useBancos';

const bancoSchema = yup.object({
  nome: yup
    .string()
    .required('Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  cnpj: yup.string(),
  email: yup.string().email('E-mail inválido'),
  telefone: yup.string(),
});

interface BancoFormProps {
  banco?: Banco;
  onSubmit: (data: BancoFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function BancoForm({ banco, onSubmit, onCancel, loading }: BancoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BancoFormData>({
    resolver: yupResolver(bancoSchema) as any,
    defaultValues: {
      nome: banco?.nome || '',
      cnpj: banco?.cnpj || '',
      email: banco?.email || '',
      telefone: banco?.telefone || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome do Banco *</Label>
        <Input
          id="nome"
          placeholder="Ex: Banco do Brasil"
          {...register('nome')}
        />
        {errors.nome && (
          <p className="text-sm text-destructive">{errors.nome.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ</Label>
        <Input
          id="cnpj"
          placeholder="00.000.000/0000-00"
          maxLength={18}
          {...register('cnpj')}
        />
        {errors.cnpj && (
          <p className="text-sm text-destructive">{errors.cnpj.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="contato@banco.com.br"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          placeholder="(00) 00000-0000"
          maxLength={15}
          {...register('telefone')}
        />
        {errors.telefone && (
          <p className="text-sm text-destructive">{errors.telefone.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : banco ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
}
