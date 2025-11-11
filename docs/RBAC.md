# Role-Based Access Control (RBAC) Implementation

This document describes the complete RBAC implementation for the application.

## Overview

The system implements a secure, role-based access control system with three roles:
- **admin**: Full access to all features
- **gerente** (manager): Can manage most resources, limited delete permissions
- **agente** (agent): Basic access, can view and create proposals

## Database Schema

### User Roles Table

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'gerente', 'agente');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'agente',
  empresa_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role, empresa_id)
);
```

### Profiles Table

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT,
  empresa_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Security Functions

### Role Checking

```sql
-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

### Multi-Tenant Functions

```sql
-- Get user's empresa_id
CREATE OR REPLACE FUNCTION public.get_user_empresa_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT empresa_id
  FROM public.profiles
  WHERE id = _user_id
  LIMIT 1
$$;

-- Check if user belongs to empresa
CREATE OR REPLACE FUNCTION public.user_in_empresa(_user_id UUID, _empresa_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND empresa_id = _empresa_id
  )
$$;
```

## RLS Policies

### Bancos Table Example

```sql
-- SELECT: All authenticated users in their empresa
CREATE POLICY "Users can view bancos from their empresa"
  ON public.bancos FOR SELECT
  TO authenticated
  USING (empresa_id = public.get_user_empresa_id(auth.uid()));

-- INSERT: All authenticated users
CREATE POLICY "Users can create bancos in their empresa"
  ON public.bancos FOR INSERT
  TO authenticated
  WITH CHECK (empresa_id = public.get_user_empresa_id(auth.uid()));

-- UPDATE: All authenticated users in their empresa
CREATE POLICY "Users can update bancos in their empresa"
  ON public.bancos FOR UPDATE
  TO authenticated
  USING (empresa_id = public.get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = public.get_user_empresa_id(auth.uid()));

-- DELETE: Admin only
CREATE POLICY "Admins can delete bancos in their empresa"
  ON public.bancos FOR DELETE
  TO authenticated
  USING (
    empresa_id = public.get_user_empresa_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );
```

## Frontend Implementation

### AuthContext

The AuthContext provides:
- User session management
- Automatic token refresh
- Role-based permissions
- Profile data

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, profile, roles, hasRole, isAdmin, isGerente } = useAuth();
  
  // Check specific role
  if (hasRole('admin')) {
    // Admin-only code
  }
  
  // Use convenience flags
  if (isAdmin) {
    // Admin code
  }
  
  if (isGerente) {
    // Manager or admin code
  }
}
```

### Role-based Hooks

#### useRequireRole

Enforce page-level access control:

```typescript
import { useRequireRole } from '@/hooks/useRequireRole';

function AdminPage() {
  // Redirects to dashboard if user is not admin
  useRequireRole('admin');
  
  return <div>Admin content</div>;
}
```

#### useRequireAnyRole

Require any of multiple roles:

```typescript
import { useRequireAnyRole } from '@/hooks/useRequireRole';

function ManagerPage() {
  // Redirects if user is neither admin nor gerente
  useRequireAnyRole(['admin', 'gerente']);
  
  return <div>Manager content</div>;
}
```

### Role Guards (Component-level)

#### RoleGuard

Conditionally render UI elements:

```typescript
import { RoleGuard } from '@/components/RoleGuard';

function MyComponent() {
  return (
    <div>
      <RoleGuard requiredRole="admin">
        <button>Admin Only Button</button>
      </RoleGuard>
      
      <RoleGuard 
        requiredRole="gerente"
        fallback={<p>You need manager access</p>}
      >
        <AdminPanel />
      </RoleGuard>
    </div>
  );
}
```

#### AnyRoleGuard

Show content if user has any of the required roles:

```typescript
import { AnyRoleGuard } from '@/components/RoleGuard';

function MyComponent() {
  return (
    <AnyRoleGuard requiredRoles={['admin', 'gerente']}>
      <AdvancedFeatures />
    </AnyRoleGuard>
  );
}
```

## Permission Matrix

| Resource | View | Create | Update | Delete |
|----------|------|--------|--------|--------|
| **Bancos** | All | All | All | Admin |
| **Clientes** | All | All | All | Admin/Gerente |
| **Produtos** | All | Admin/Gerente | Admin/Gerente | Admin |
| **Propostas** | All | All | All | Admin/Gerente |

## Security Best Practices

### ✅ DO

1. **Store roles in separate table**: Never in profiles or auth.users
2. **Use security definer functions**: Prevents RLS recursion issues
3. **Check permissions server-side**: RLS policies enforce access
4. **Validate empresa_id**: All queries filtered by tenant
5. **Use hooks for page protection**: useRequireRole for routes
6. **Use guards for UI elements**: RoleGuard for conditional rendering

### ❌ DON'T

1. **Don't trust client-side checks**: Always enforce on server
2. **Don't store roles in localStorage**: Use AuthContext
3. **Don't hardcode credentials**: Use proper authentication
4. **Don't skip RLS policies**: All tables must have RLS
5. **Don't allow empresa_id to be null**: Enforce in schema

## Testing Roles

### Creating Test Users

```sql
-- Insert test empresa
INSERT INTO public.empresas (id, nome, cnpj)
VALUES ('00000000-0000-0000-0000-000000000001', 'Test Company', '00.000.000/0000-00');

-- Create users via Supabase Auth UI, then assign roles:

-- Make user admin
INSERT INTO public.user_roles (user_id, role, empresa_id)
VALUES ('<user_id>', 'admin', '00000000-0000-0000-0000-000000000001');

-- Make user gerente
INSERT INTO public.user_roles (user_id, role, empresa_id)
VALUES ('<user_id>', 'gerente', '00000000-0000-0000-0000-000000000001');
```

## Troubleshooting

### User can't see data

1. Check if profile exists in `profiles` table
2. Verify `empresa_id` is set correctly
3. Check user has assigned roles in `user_roles`
4. Verify RLS policies are enabled

### Permission denied errors

1. Check RLS policies on the table
2. Verify security definer functions exist
3. Check user's roles in `user_roles` table
4. Ensure empresa_id matches between user and resource

### Token expiration issues

- Supabase automatically refreshes tokens
- Check browser console for TOKEN_REFRESHED events
- Session persists in localStorage automatically
- AuthContext handles refresh transparently
