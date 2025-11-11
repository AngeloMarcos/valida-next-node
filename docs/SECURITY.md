# Security Documentation

This document outlines security best practices, implementation details, and guidelines for the ValidaCRM application.

## Table of Contents

- [Overview](#overview)
- [Authentication Security](#authentication-security)
- [Authorization & RBAC](#authorization--rbac)
- [Database Security](#database-security)
- [API Security](#api-security)
- [Frontend Security](#frontend-security)
- [Infrastructure Security](#infrastructure-security)
- [Security Checklist](#security-checklist)
- [Incident Response](#incident-response)

## Overview

ValidaCRM implements a **defense-in-depth** security strategy with multiple layers:

1. **Authentication**: Supabase Auth with JWT tokens
2. **Authorization**: Role-Based Access Control (RBAC)
3. **Data Isolation**: Multi-tenant architecture with Row-Level Security
4. **Input Validation**: Client and server-side validation
5. **Secure Communication**: HTTPS/TLS encryption
6. **Audit Logging**: Track critical operations

## Authentication Security

### JWT Token Management

**Access Tokens**:
- Short-lived (1 hour by default)
- Contains user metadata and roles
- Stored in localStorage
- Auto-refreshed by Supabase client

**Refresh Tokens**:
- Long-lived (7 days default)
- Stored securely by Supabase
- Rotated on each use
- Revocable server-side

### Implementation

```typescript
// ✅ CORRECT - Using Supabase auth
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// ❌ WRONG - Never store passwords or tokens in plain text
localStorage.setItem('password', password); // NEVER DO THIS
```

### Best Practices

1. **Password Requirements**
   - Minimum 8 characters
   - Mix of uppercase, lowercase, numbers
   - Special characters recommended
   - No common passwords

2. **Session Management**
   ```typescript
   // Auto-refresh enabled
   export const supabase = createClient(url, key, {
     auth: {
       storage: localStorage,
       persistSession: true,
       autoRefreshToken: true,
     }
   });
   ```

3. **Email Verification**
   - Enable in Supabase Dashboard
   - Prevents fake account creation
   - Verifies user identity

4. **Password Reset**
   ```typescript
   // Secure password reset flow
   const { error } = await supabase.auth.resetPasswordForEmail(email, {
     redirectTo: `${window.location.origin}/reset-password`
   });
   ```

### Security Considerations

⚠️ **CRITICAL**:
- Never log authentication tokens
- Never send tokens in URL parameters
- Always use HTTPS in production
- Implement rate limiting on auth endpoints
- Monitor failed login attempts

## Authorization & RBAC

### Role Hierarchy

```
admin        → Full access to everything
  ↓
gerente      → Manage products, view all data
  ↓
agente       → Basic CRUD, own data only
```

### Role Storage

**⚠️ CRITICAL SECURITY RULE**: 
Roles MUST be stored in a separate `user_roles` table, NEVER in the profile or users table.

```sql
-- ✅ CORRECT
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  role app_role NOT NULL,
  empresa_id UUID NOT NULL
);

-- ❌ WRONG - Allows privilege escalation
ALTER TABLE profiles ADD COLUMN role TEXT; -- NEVER DO THIS
```

### Security Definer Functions

**Why**: Prevents RLS infinite recursion and ensures consistent permission checks

```sql
-- ✅ CORRECT - Security Definer
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION has_role TO authenticated;
```

### Frontend Permission Checks

```typescript
// ✅ CORRECT - Use auth context
const { hasRole, isAdmin, isGerente } = useAuth();

if (hasRole('admin')) {
  // Show admin features
}

// ❌ WRONG - Never trust client-side storage
const isAdmin = localStorage.getItem('isAdmin'); // NEVER DO THIS
```

### Page-Level Protection

```typescript
// ✅ CORRECT - Server-verified protection
export function AdminPage() {
  useRequireRole('admin'); // Redirects if unauthorized
  
  return <AdminDashboard />;
}
```

### Component-Level Protection

```typescript
// ✅ CORRECT - Conditional rendering
<RoleGuard requiredRole="admin">
  <DeleteButton onClick={handleDelete} />
</RoleGuard>
```

## Database Security

### Row-Level Security (RLS)

**⚠️ CRITICAL**: All tables MUST have RLS enabled

```sql
-- Enable RLS on every table
ALTER TABLE bancos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE propostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
```

### Multi-Tenant Isolation

**Every query is automatically filtered by empresa_id**

```sql
-- SELECT policy example
CREATE POLICY "Users view own empresa data"
ON bancos FOR SELECT
USING (empresa_id = get_user_empresa_id(auth.uid()));

-- INSERT policy example
CREATE POLICY "Users insert own empresa data"
ON bancos FOR INSERT
WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));
```

### Common RLS Patterns

```sql
-- Admin can see all in empresa
CREATE POLICY "Admin view all"
ON propostas FOR SELECT
USING (
  has_role(auth.uid(), 'admin')
  AND empresa_id = get_user_empresa_id(auth.uid())
);

-- Gerente can update in empresa
CREATE POLICY "Gerente update all"
ON propostas FOR UPDATE
USING (
  (has_role(auth.uid(), 'gerente') OR has_role(auth.uid(), 'admin'))
  AND empresa_id = get_user_empresa_id(auth.uid())
);

-- Only admin can delete
CREATE POLICY "Admin delete only"
ON propostas FOR DELETE
USING (
  has_role(auth.uid(), 'admin')
  AND empresa_id = get_user_empresa_id(auth.uid())
);
```

### SQL Injection Prevention

```typescript
// ✅ CORRECT - Parameterized queries
const { data } = await supabase
  .from('bancos')
  .select('*')
  .eq('nome', userInput);

// ❌ WRONG - Never concatenate user input
const query = `SELECT * FROM bancos WHERE nome = '${userInput}'`;
```

## API Security

### Input Validation

**Backend** (NestJS):
```typescript
import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateBancoDto {
  @IsString()
  @MinLength(3)
  nome: string;

  @IsEmail()
  email: string;
}

// Global validation pipe
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,          // Strip unknown properties
    forbidNonWhitelisted: true, // Throw error on unknown properties
    transform: true,          // Auto-transform types
  })
);
```

**Frontend** (React Hook Form + Yup):
```typescript
const schema = yup.object({
  nome: yup.string().min(3).required(),
  email: yup.string().email().required(),
  cnpj: yup.string().matches(/^\d{14}$/, 'CNPJ inválido'),
});
```

### CORS Configuration

```typescript
// ✅ CORRECT - Specific origins
app.enableCors({
  origin: [
    'https://validacrm.com',
    'https://app.validacrm.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
});

// ❌ WRONG - Open to all origins
app.enableCors({ origin: '*' }); // NEVER IN PRODUCTION
```

### Rate Limiting

```typescript
// Recommended: Use @nestjs/throttler
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,      // 60 seconds
      limit: 10,    // 10 requests
    }),
  ],
})
```

### API Authentication

```typescript
// Every API request includes JWT
const { data } = await supabase
  .from('bancos')
  .select('*');
// JWT automatically included in Authorization header
```

## Frontend Security

### XSS Prevention

```typescript
// ✅ CORRECT - React auto-escapes
<div>{userInput}</div>

// ✅ CORRECT - Sanitize HTML if needed
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />

// ❌ WRONG - Direct HTML injection
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // NEVER
```

### CSRF Prevention

- Supabase handles CSRF tokens automatically
- Use SameSite cookies when possible
- Validate Origin header for state-changing operations

### Dependency Security

```bash
# Regular security audits
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated
```

### Content Security Policy

```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://dxuxjwfaqdmjytpxglru.supabase.co">
```

## Infrastructure Security

### Environment Variables

```bash
# ✅ CORRECT - Use .env files
DATABASE_URL=postgresql://...
JWT_SECRET=random_secure_string

# ❌ WRONG - Never commit secrets
# .env files should be in .gitignore
```

### HTTPS/TLS

- **Required** in production
- Use Let's Encrypt for free certificates
- Redirect HTTP to HTTPS
- Enable HSTS header

```typescript
// HSTS example (NestJS)
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));
```

### Database Backups

- Daily automated backups (Supabase handles this)
- Test restore procedures monthly
- Encrypt backups at rest

### Monitoring & Logging

```typescript
// Log security events
logger.warn('Failed login attempt', { 
  email: attempt.email,
  ip: request.ip,
  timestamp: new Date()
});

// Never log sensitive data
logger.info('User logged in', { 
  userId: user.id,
  // ❌ password: user.password, // NEVER LOG PASSWORDS
});
```

## Security Checklist

### Development
- [ ] All dependencies up-to-date
- [ ] No secrets in code
- [ ] Input validation on forms
- [ ] Error messages don't leak info
- [ ] HTTPS in development

### Pre-Deployment
- [ ] RLS enabled on all tables
- [ ] Security definer functions created
- [ ] RBAC policies tested
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] CSP headers configured
- [ ] Secrets rotated

### Production
- [ ] HTTPS enforced
- [ ] Monitoring enabled
- [ ] Backups verified
- [ ] Incident response plan ready
- [ ] Security audit completed
- [ ] Penetration testing done

### Ongoing
- [ ] Weekly dependency audits
- [ ] Monthly security reviews
- [ ] Quarterly penetration tests
- [ ] Annual security training
- [ ] Incident response drills

## Incident Response

### Severity Levels

1. **Critical**: Data breach, authentication bypass
2. **High**: XSS, CSRF, privilege escalation
3. **Medium**: Missing validation, weak encryption
4. **Low**: Information disclosure, minor issues

### Response Steps

1. **Detect**: Monitoring alerts, user reports
2. **Contain**: Disable affected features, revoke tokens
3. **Investigate**: Review logs, identify root cause
4. **Remediate**: Patch vulnerability, update code
5. **Recover**: Restore service, verify fix
6. **Document**: Post-mortem, lessons learned

### Contacts

- **Security Lead**: [Your Email]
- **Supabase Support**: support@supabase.io
- **Emergency**: [Emergency Contact]

## Common Vulnerabilities

### Privilege Escalation

```typescript
// ❌ WRONG - Client-side role check
const isAdmin = localStorage.getItem('role') === 'admin';

// ✅ CORRECT - Server-verified check
const { isAdmin } = useAuth(); // Uses has_role() DB function
```

### Data Leakage

```sql
-- ❌ WRONG - No RLS
CREATE TABLE bancos (...);

-- ✅ CORRECT - With RLS
CREATE TABLE bancos (...);
ALTER TABLE bancos ENABLE ROW LEVEL SECURITY;
```

### Session Hijacking

```typescript
// ✅ CORRECT - Auto-refresh tokens
// Supabase handles this automatically

// ❌ WRONG - Long-lived tokens never rotated
const token = localStorage.getItem('token'); // Without refresh
```

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/auth/security)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [RBAC Guide](https://auth0.com/docs/manage-users/access-control/rbac)

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email: security@validacrm.com
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if known)

We will respond within 48 hours and keep you updated on progress.
