# User Management Module

## Overview

The User Management module allows administrators to manage users within their company (empresa). This module implements full CRUD operations with proper role-based access control (RBAC) and multi-tenancy isolation.

## Features

### 1. User List Page (`/users`)
- **Access**: Admin users only
- **Columns**: Name, Email, Company, Role, Status
- **Search**: Filter users by name or email
- **Pagination**: Configurable page size (10, 25, 50, 100 items per page)

### 2. User Actions

#### Create User (Invite)
- Accessible via "Novo Usuário" button
- Opens a modal dialog with the user form
- Sends an invitation email to the new user
- Assigns default role (agente) unless specified otherwise
- User is automatically assigned to the admin's company

**Fields:**
- Nome* (Name) - Required, 3-100 characters, trimmed
- Email* - Required, valid email format, trimmed
- Perfil* (Role) - Required, one of: admin, gerente, agente
- Status* - Required, one of: active, inactive

#### Edit User
- Click the edit icon (pencil) on any user row
- Opens the same form modal with pre-filled data
- Email field is disabled (cannot be changed)
- Updates profile name and role

#### Toggle Status (Activate/Deactivate)
- Click the power icon on any user row
- Confirmation dialog appears
- Currently shows info message (feature to be fully implemented)
- Will enable/disable user access to the system

#### Reset Password
- Click the email icon on any user row
- Confirmation dialog shows the email address
- Sends password reset email to the user
- User receives instructions to create a new password

### 3. Permissions & Security

#### Role-Based Access Control
- **Visibility**: Only admin users can access the User Management page
- **Data Isolation**: Admins only see users from their own company
- **API Enforcement**: All operations are protected by RLS policies

#### Multi-Tenancy
- Users are automatically assigned to the admin's company (`empresa_id`)
- Admins cannot view or manage users from other companies
- RLS policies enforce data isolation at the database level

### 4. User Roles

| Role | Portuguese | Permissions |
|------|-----------|-------------|
| admin | Administrador | Full access to all features including user management |
| gerente | Gerente | Limited delete permissions on some resources |
| agente | Agente | Basic access to create and view records |

## Technical Implementation

### Components

**Page:**
- `src/pages/Users.tsx` - Main user management page

**Components:**
- `src/components/users/UserForm.tsx` - Form for creating/editing users
- `src/components/users/UsersList.tsx` - Table displaying users with actions
- `src/components/users/UsersPagination.tsx` - Pagination controls

**Hooks:**
- `src/hooks/useUsers.ts` - Custom hook for user CRUD operations
- `src/hooks/useRequireRole.ts` - Role-based access control hook

### Database Tables

**profiles:**
```sql
id           | uuid    | Primary key, references auth.users
email        | text    | User email
nome         | text    | User name
empresa_id   | uuid    | Foreign key to empresas table
created_at   | timestamp
updated_at   | timestamp
```

**user_roles:**
```sql
id           | uuid    | Primary key
user_id      | uuid    | Foreign key to auth.users
role         | app_role| Enum: admin, gerente, agente
empresa_id   | uuid    | Foreign key to empresas table
created_at   | timestamp
```

### RLS Policies

**profiles table:**
- Users can view their own profile
- Users can update their own profile
- No direct INSERT/DELETE (handled by triggers)

**user_roles table:**
- Users can view their own roles
- Admins can view all roles in their empresa
- No direct INSERT/UPDATE/DELETE (managed by functions)

### Security Functions

**has_role(_user_id uuid, _role app_role):**
- Checks if a user has a specific role
- Used in RLS policies to enforce permissions
- Security definer function to prevent infinite recursion

**get_user_empresa_id(_user_id uuid):**
- Returns the empresa_id for a given user
- Used for multi-tenancy filtering

**user_in_empresa(_user_id uuid, _empresa_id uuid):**
- Verifies if a user belongs to a specific company
- Prevents cross-company data access

## User Flows

### Invite New User Flow

1. Admin clicks "Novo Usuário" button
2. Modal opens with empty form
3. Admin fills in user details (name, email, role, status)
4. On submit:
   - Validates form data (required fields, email format, etc.)
   - Creates user in Supabase Auth with temporary password
   - Assigns user to admin's company
   - Creates profile record with user metadata
   - Assigns specified role (or default 'agente')
   - Sends invitation email
5. Success toast notification
6. Modal closes and list refreshes

### Reset Password Flow

1. Admin clicks password reset icon for a user
2. Confirmation dialog shows user's email
3. On confirm:
   - Calls `supabase.auth.resetPasswordForEmail()`
   - Sets redirect URL to application root
   - Sends email with password reset link
4. User receives email with instructions
5. User clicks link and creates new password
6. User can log in with new password

## Form Validation

All form fields use Yup schema validation:

```typescript
{
  nome: string()
    .transform(trim)
    .required()
    .min(3)
    .max(100),
  
  email: string()
    .transform(trim)
    .required()
    .email(),
  
  role: string()
    .required()
    .oneOf(['admin', 'gerente', 'agente']),
  
  status: string()
    .required()
    .oneOf(['active', 'inactive'])
}
```

## Error Handling

**Common Errors:**
- "User already registered" - Email is already in use
- "Empresa não encontrada" - Admin user has no company assigned
- "Erro ao carregar usuários" - Database query failed
- "Erro ao criar usuário" - Auth signup or profile creation failed
- "Erro ao atualizar usuário" - Profile or role update failed

**Error Display:**
- Field-specific errors shown below each input
- General errors shown as toast notifications
- Loading states prevent double-submissions

## Testing

### Unit Tests

Test files to create:
- `src/hooks/__tests__/useUsers.test.ts` - Test CRUD operations
- `src/components/users/__tests__/UserForm.test.tsx` - Test form validation
- `src/components/users/__tests__/UsersList.test.tsx` - Test list rendering

### Test Scenarios

1. **Form Validation:**
   - Required field validation
   - Email format validation
   - Whitespace trimming
   - Minimum/maximum length validation

2. **CRUD Operations:**
   - Create user successfully
   - Handle duplicate email error
   - Update user successfully
   - Send password reset email

3. **Access Control:**
   - Redirect non-admin users
   - Show only users from same company
   - Prevent cross-company access

4. **UI Interactions:**
   - Open/close modal
   - Search functionality
   - Pagination
   - Action confirmations

## Future Enhancements

1. **User Status Implementation:**
   - Add `status` column to profiles table
   - Implement edge function to disable/enable auth users
   - Update RLS policies to block inactive users

2. **Bulk Operations:**
   - Select multiple users
   - Bulk status toggle
   - Bulk delete (with confirmation)

3. **Advanced Filters:**
   - Filter by role
   - Filter by status
   - Filter by registration date

4. **User Activity Log:**
   - Track user actions
   - Display last login date
   - Show activity history

5. **Email Customization:**
   - Custom invitation email templates
   - Company branding in emails
   - Configurable email content

## Best Practices

1. **Always validate input** - Use schema validation for all forms
2. **Trim whitespace** - Apply `.transform(trim)` to string fields
3. **Check permissions** - Use `useRequireRole` hook for page access
4. **Show loading states** - Disable buttons during async operations
5. **Confirm destructive actions** - Use AlertDialog for delete/disable
6. **Provide feedback** - Show toast notifications for all actions
7. **Handle errors gracefully** - Display user-friendly error messages
8. **Maintain data isolation** - Always filter by empresa_id
9. **Use security functions** - Leverage RLS and security definer functions
10. **Document changes** - Update this documentation when adding features

## Related Documentation

- [RBAC.md](./RBAC.md) - Role-Based Access Control implementation
- [AUTHENTICATION.md](./AUTHENTICATION.md) - Authentication system
- [SECURITY.md](./SECURITY.md) - Security best practices
- [COMPONENTS.md](./COMPONENTS.md) - Reusable component library
