import { Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Mail, Power } from 'lucide-react';
import { User, UserRole } from '@/hooks/useUsers';
import { EmptyState, LoadingSpinner } from '@/components/shared';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UsersListProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onToggleStatus: (userId: string, currentStatus: string) => void;
  onPasswordReset: (email: string) => void;
}

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  correspondente: 'Correspondente',
};

const roleColors: Record<UserRole, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  admin: 'destructive',
  supervisor: 'secondary',
  correspondente: 'default',
};

export function UsersList({
  users,
  loading,
  onEdit,
  onToggleStatus,
  onPasswordReset,
}: UsersListProps) {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (users.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum usuário encontrado"
        description="Comece convidando um novo usuário para a plataforma."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.nome}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.empresa_nome}</TableCell>
              <TableCell>
                <Badge variant={roleColors[user.role]}>
                  {roleLabels[user.role]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.status === 'active' ? 'default' : 'outline'}>
                  {user.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(user)}
                    title="Editar usuário"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={user.status === 'active' ? 'Desativar usuário' : 'Ativar usuário'}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {user.status === 'active' ? 'Desativar' : 'Ativar'} usuário?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {user.status === 'active'
                            ? 'Este usuário não poderá mais acessar o sistema.'
                            : 'Este usuário poderá acessar o sistema novamente.'}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onToggleStatus(user.id, user.status)}
                        >
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Redefinir senha"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Redefinir senha?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Um e-mail será enviado para <strong>{user.email}</strong> com
                          instruções para redefinir a senha.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onPasswordReset(user.email)}
                        >
                          Enviar E-mail
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
