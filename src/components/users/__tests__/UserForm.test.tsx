import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserForm } from '../UserForm';
import { User } from '@/hooks/useUsers';

// Mock FormProvider and related components
jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  FormProvider: ({ children }: any) => <div>{children}</div>,
}));

describe('UserForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly for new user', () => {
    render(
      <UserForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/perfil/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /convidar/i })).toBeInTheDocument();
  });

  it('renders form fields with existing user data', () => {
    const mockUser: User = {
      id: '123',
      nome: 'João Silva',
      email: 'joao@empresa.com',
      empresa_id: '456',
      empresa_nome: 'Empresa Teste',
      role: 'supervisor',
      status: 'active',
      created_at: '2024-01-01',
    };

    render(
      <UserForm
        user={mockUser}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument();
  });

  it('disables email field when editing existing user', () => {
    const mockUser: User = {
      id: '123',
      nome: 'João Silva',
      email: 'joao@empresa.com',
      empresa_id: '456',
      role: 'admin',
      status: 'active',
      created_at: '2024-01-01',
    };

    render(
      <UserForm
        user={mockUser}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const emailInput = screen.getByLabelText(/e-mail/i);
    expect(emailInput).toBeDisabled();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <UserForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when loading prop is true', () => {
    render(
      <UserForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading={true}
      />
    );

    expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();

    render(
      <UserForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole('button', { name: /convidar/i });
    await user.click(submitButton);

    // Form validation should prevent submission
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
});
