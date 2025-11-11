# Authentication & Authorization System

Complete guide to the JWT-based authentication system with role-based access control and multi-tenant support.

## Table of Contents

1. [Overview](#overview)
2. [JWT Token Management](#jwt-token-management)
3. [Session Persistence](#session-persistence)
4. [Authentication Flow](#authentication-flow)
5. [Role-Based Access Control](#role-based-access-control)
6. [Multi-Tenant Security](#multi-tenant-security)
7. [Usage Examples](#usage-examples)
8. [Security Best Practices](#security-best-practices)
9. [Troubleshooting](#troubleshooting)

## Overview

The system implements a comprehensive authentication solution with:

- **JWT-based authentication** via Supabase Auth
- **Automatic token refresh** (tokens renewed before expiration)
- **Secure session persistence** using localStorage
- **Role-based access control** (admin, gerente, agente)
- **Multi-tenant isolation** via empresa_id
- **Row-Level Security** enforcement on all tables

## JWT Token Management

### How Tokens Work

Supabase issues two tokens per session:

1. **Access Token** (JWT): Short-lived (~1 hour), used for API requests
2. **Refresh Token**: Long-lived (~30 days), used to obtain new access tokens

### Automatic Token Refresh

The AuthContext automatically handles token refresh:

```typescript
// Handled internally by Supabase client
// You don't need to implement this manually
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }
      setSession(session);
      setUser(session?.user ?? null);
    }
  );
  
  return () => subscription.unsubscribe();
}, []);
```

### Token Contents

Access tokens contain:

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "authenticated",
  "iat": 1234567890,
  "exp": 1234571490,
  "user_metadata": {
    "nome": "User Name",
    "empresa_id": "empresa-uuid"
  }
}
```

## Session Persistence

### Storage Mechanism

Sessions are stored in **localStorage** by default:

- **Key**: `sb-<project-ref>-auth-token`
- **Contents**: Full session object including both tokens
- **Managed by**: Supabase client (automatic)

### Session Lifecycle

1. **Login**: Session created and stored in localStorage
2. **Page Refresh**: Session restored from localStorage
3. **Token Expiry**: New token obtained using refresh token
4. **Logout**: Session removed from localStorage

### HttpOnly Cookies (Optional)

For enhanced security, you can configure Supabase to use HttpOnly cookies:

```typescript
// In supabase client config
const supabase = createClient(url, key, {
  auth: {
    storage: cookieStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
```

## Authentication Flow

### Complete Sign Up Flow

```typescript
import { useAuth } from '@/contexts/AuthContext';

function SignUpForm() {
  const { signUp } = useAuth();
  
  const handleSubmit = async (email: string, password: string, nome: string) => {
    const { error } = await signUp(email, password, nome);
    
    if (!error) {
      // 1. User created in auth.users
      // 2. Trigger fires: handle_new_user()
      // 3. Profile created in profiles table
      // 4. Default role 'agente' assigned in user_roles
      // 5. Email verification sent
    }
  };
}
```

### Sign In Flow

```typescript
import { useAuth } from '@/contexts/AuthContext';

function LoginForm() {
  const { signIn } = useAuth();
  
  const handleSubmit = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    
    if (!error) {
      // 1. Credentials verified
      // 2. Session created with JWT tokens
      // 3. Session stored in localStorage
      // 4. Profile/roles fetched
      // 5. User redirected to dashboard
    }
  };
}
```

### Sign Out Flow

```typescript
import { useAuth } from '@/contexts/AuthContext';

function LogoutButton() {
  const { signOut } = useAuth();
  
  const handleLogout = async () => {
    await signOut();
    // 1. Session invalidated on server
    // 2. Tokens removed from localStorage
    // 3. Auth state cleared
    // 4. User redirected to login
  };
}
```

### Protected Routes

```typescript
// Automatic protection for authenticated routes
import { ProtectedRoute } from '@/components/ProtectedRoute';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

## Role-Based Access Control

For complete RBAC documentation, see [RBAC.md](./RBAC.md).

### Role Hierarchy

- **admin**: Full system access
- **gerente**: Manage most resources, limited delete permissions
- **agente**: Basic access, can create proposals

### Database Schema

```sql
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'gerente', 'agente');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'agente',
  empresa_id UUID NOT NULL,
  UNIQUE(user_id, role, empresa_id)
);
```

### Using Roles in Components

```typescript
import { useAuth } from '@/contexts/AuthContext';

function AdminPanel() {
  const { hasRole, isAdmin, isGerente, roles } = useAuth();
  
  // Method 1: Check specific role
  if (hasRole('admin')) {
    return <FullAdminPanel />;
  }
  
  // Method 2: Use convenience flags
  if (isAdmin) {
    return <AdminTools />;
  }
  
  if (isGerente) {
    return <ManagerTools />;
  }
  
  // Method 3: Check roles array
  if (roles.includes('agente')) {
    return <BasicTools />;
  }
}
```

### Page-Level Protection

```typescript
import { useRequireRole } from '@/hooks/useRequireRole';

function AdminPage() {
  // Redirects to dashboard if user lacks admin role
  useRequireRole('admin');
  
  return <AdminContent />;
}
```

### Component-Level Protection

```typescript
import { RoleGuard, AnyRoleGuard } from '@/components/RoleGuard';

function Toolbar() {
  return (
    <div>
      {/* Only admins can see this */}
      <RoleGuard requiredRole="admin">
        <button>Delete All</button>
      </RoleGuard>
      
      {/* Admins or gerentes can see this */}
      <AnyRoleGuard requiredRoles={['admin', 'gerente']}>
        <button>Export Data</button>
      </AnyRoleGuard>
    </div>
  );
}
```

## Multi-Tenant Security

### empresa_id Enforcement

All data is automatically filtered by the user's empresa_id through RLS policies:

```sql
-- Example RLS policy
CREATE POLICY "Users can view bancos from their empresa"
  ON public.bancos FOR SELECT
  TO authenticated
  USING (empresa_id = public.get_user_empresa_id(auth.uid()));
```

### Security Definer Functions

Prevent RLS recursion and ensure consistent security:

```sql
-- Get user's empresa_id
CREATE OR REPLACE FUNCTION public.get_user_empresa_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER  -- Executes with elevated privileges
SET search_path = public  -- Prevents SQL injection
AS $$
  SELECT empresa_id
  FROM public.profiles
  WHERE id = _user_id
  LIMIT 1
$$;
```

### Profile Setup on Signup

The `handle_new_user()` trigger automatically:

1. Creates profile with empresa_id from metadata
2. Assigns default 'agente' role
3. Links user to their company

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_empresa_id UUID;
BEGIN
  default_empresa_id := (new.raw_user_meta_data->>'empresa_id')::UUID;
  
  INSERT INTO public.profiles (id, email, nome, empresa_id)
  VALUES (new.id, new.email, 
          COALESCE(new.raw_user_meta_data->>'nome', new.email),
          default_empresa_id);
  
  INSERT INTO public.user_roles (user_id, role, empresa_id)
  VALUES (new.id, 'agente', default_empresa_id);
  
  RETURN new;
END;
$$;
```

## Usage Examples

### Complete AuthContext Usage

```typescript
import { useAuth } from '@/contexts/AuthContext';

function UserDashboard() {
  const {
    user,        // Supabase User object with auth info
    session,     // Full session including JWT tokens
    profile,     // User profile (nome, email, empresa_id)
    roles,       // Array of roles: ['agente', 'gerente']
    loading,     // Auth state loading
    signIn,      // Function to log in
    signUp,      // Function to register
    signOut,     // Function to log out
    hasRole,     // Function to check specific role
    isAdmin,     // Boolean: is user admin?
    isGerente,   // Boolean: is user gerente or admin?
  } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoginPrompt />;
  }

  return (
    <div>
      <h1>Welcome, {profile?.nome}!</h1>
      <p>Email: {user.email}</p>
      <p>Company: {profile?.empresa_id}</p>
      <p>Roles: {roles.join(', ')}</p>
      
      {isAdmin && <AdminBadge />}
      {isGerente && <ManagerBadge />}
      
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

### Login Page Example

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message);
    } else {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
```

## Security Best Practices

### ✅ DO

1. **Always use AuthContext** for authentication state
2. **Store session object** (not just user)
3. **Set up listener before checking session** (prevents race conditions)
4. **Use useRequireRole** for page-level protection
5. **Use RoleGuard** for component-level protection
6. **Validate all inputs** with Yup or Zod
7. **Enable RLS on all tables**
8. **Use security definer functions** to prevent recursion
9. **Store roles in separate table** (never in profiles)
10. **Use HTTPS in production**

### ❌ DON'T

1. **Don't use async functions directly** in onAuthStateChange callback
2. **Don't trust client-side role checks** (always enforce with RLS)
3. **Don't store passwords** in state or localStorage
4. **Don't skip error handling**
5. **Don't expose sensitive data** in console.log (production)
6. **Don't hardcode credentials** or redirect URLs
7. **Don't disable RLS policies**
8. **Don't allow empresa_id to be null**

## Troubleshooting

### Session Not Persisting

**Symptoms**: User logged out on page refresh

**Solutions**:
1. Check localStorage for `sb-*-auth-token`
2. Verify `persistSession: true` in Supabase client
3. Check browser console for errors
4. Ensure auth listener is set up correctly

### Token Expired Errors

**Symptoms**: Unexpected logouts, 401 errors

**Solutions**:
1. Check TOKEN_REFRESHED events in console
2. Verify refresh token hasn't expired (30 days)
3. Manually refresh: `await auth.refreshSession()`
4. Check Supabase project settings for JWT expiry

### Permission Denied Errors

**Symptoms**: Can't see/modify data despite being logged in

**Solutions**:
1. Verify profile exists: `SELECT * FROM profiles WHERE id = auth.uid()`
2. Check roles: `SELECT * FROM user_roles WHERE user_id = auth.uid()`
3. Verify empresa_id is set
4. Check RLS policies on the table
5. Test with service role key (temporarily) to isolate RLS issues

### Infinite Redirect Loop

**Symptoms**: Bouncing between login and protected pages

**Solutions**:
1. Check ProtectedRoute logic
2. Verify loading state handling
3. Add console.logs to track auth state changes
4. Ensure session is set before rendering protected content

### Users Can See Other Companies' Data

**Symptoms**: Data leakage between tenants

**Solutions**:
1. Verify RLS policies filter by empresa_id
2. Check security definer function: `get_user_empresa_id()`
3. Ensure empresa_id is NOT nullable
4. Test with multiple users from different companies
5. Run: `SELECT * FROM user_roles WHERE user_id = auth.uid()`

## Configuration Checklist

### Supabase Dashboard Settings

1. **Authentication > URL Configuration**
   - Site URL: `https://yourdomain.com`
   - Redirect URLs: Add all allowed URLs

2. **Authentication > Email Templates**
   - Customize confirmation email
   - Customize password reset email

3. **Authentication > Settings**
   - JWT expiry: 3600 seconds (1 hour)
   - Refresh token expiry: 2592000 seconds (30 days)
   - Enable email confirmation (production)
   - Disable email confirmation (development, optional)

4. **Database > Roles**
   - Verify `authenticated` role exists
   - Check service_role has proper permissions

### Environment Variables

None required in frontend (Supabase URLs are safe to expose).

For edge functions, secrets are managed via Supabase Dashboard.

## Related Documentation

- **[RBAC.md](./RBAC.md)**: Complete role-based access control guide
- **[SUPABASE.md](./SUPABASE.md)**: Supabase integration details
- **[API.md](./API.md)**: API endpoints and custom hooks
- **[COMPONENTS.md](./COMPONENTS.md)**: Reusable component documentation
