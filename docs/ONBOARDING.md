# Developer Onboarding Guide

Welcome to the ValidaCRM development team! This guide will help you get up and running quickly.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Key Concepts](#key-concepts)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

## Prerequisites

### Required Software

Install the following before starting:

1. **Node.js 20+** - [Download](https://nodejs.org/)
   ```bash
   node --version  # Should be v20.x or higher
   ```

2. **npm 10+** - Comes with Node.js
   ```bash
   npm --version   # Should be v10.x or higher
   ```

3. **Git** - [Download](https://git-scm.com/)
   ```bash
   git --version
   ```

4. **PostgreSQL 15+** (for local backend development) - [Download](https://www.postgresql.org/download/)
   ```bash
   psql --version
   ```

5. **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

### Recommended VS Code Extensions

- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- GitLens
- Thunder Client (API testing)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd validacrm
```

### 2. Install Frontend Dependencies

```bash
# Root directory (frontend)
npm install
```

### 3. Install Backend Dependencies

```bash
# Backend directory
cd server
npm install
cd ..
```

### 4. Set Up Environment Variables

#### Frontend (.env)
```bash
cp .env.example .env
```

Edit `.env`:
```bash
VITE_SUPABASE_URL=https://dxuxjwfaqdmjytpxglru.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

#### Backend (server/.env)
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/validacrm"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3333
```

### 5. Set Up Database

```bash
cd server

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run prisma:db:seed
```

### 6. Start Development Servers

**Terminal 1 - Frontend**:
```bash
npm run dev
# Opens at http://localhost:5173
```

**Terminal 2 - Backend** (optional for local development):
```bash
cd server
npm run start:dev
# Runs at http://localhost:3333
```

### 7. Verify Setup

1. Open http://localhost:5173
2. You should see the login page
3. Create a test account or log in with provided credentials

## Project Structure

```
validacrm/
├── .github/
│   └── workflows/          # CI/CD pipelines
├── docs/                   # Documentation
│   ├── API.md
│   ├── RBAC.md
│   ├── AUTHENTICATION.md
│   ├── COMPONENTS.md
│   ├── TESTING.md
│   ├── CI_CD.md
│   ├── SECURITY.md
│   ├── ONBOARDING.md
│   └── CHANGELOG.md
├── public/                 # Static assets
├── server/                 # NestJS backend
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   └── prisma/         # Database service
│   └── test/               # Backend tests
├── src/                    # React frontend
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── shared/        # Shared components
│   │   ├── form/          # Form components
│   │   ├── table/         # Table components
│   │   ├── bancos/        # Banks module
│   │   ├── produtos/      # Products module
│   │   └── propostas/     # Proposals module
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── integrations/      # External integrations
│   │   └── supabase/      # Supabase client
│   ├── lib/               # Utilities
│   ├── pages/             # Page components
│   └── services/          # API services
├── .env.example           # Example environment variables
├── package.json
├── tailwind.config.ts     # Tailwind configuration
└── vite.config.ts         # Vite configuration
```

## Development Workflow

### Branch Strategy

```
main           ← Production (protected)
  ↑
develop        ← Staging (protected)
  ↑
feature/*      ← Your work
bugfix/*
hotfix/*
```

### Creating a Feature

1. **Create branch from develop**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Write code
   - Write tests
   - Update documentation if needed

3. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   **Commit Message Convention**:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation only
   - `style:` Code style (formatting, etc.)
   - `refactor:` Code refactoring
   - `test:` Adding tests
   - `chore:` Maintenance tasks

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create Pull Request on GitHub targeting `develop`

5. **Code Review**
   - Address review comments
   - Update PR as needed
   - Wait for approval

6. **Merge**
   - Squash and merge (preferred)
   - Delete feature branch after merge

## Key Concepts

### 1. Multi-Tenancy

Every data record belongs to an `empresa_id`:

```typescript
// ✅ Automatic in frontend (via RLS)
const { data } = await supabase.from('bancos').select('*');
// Only returns bancos for current user's empresa

// ✅ Manual in backend (if not using Supabase)
const bancos = await prisma.banco.findMany({
  where: { empresa_id: currentUser.empresa_id }
});
```

### 2. Role-Based Access Control (RBAC)

Three roles: `admin`, `gerente`, `agente`

```typescript
// Check permissions
const { hasRole, isAdmin, isGerente } = useAuth();

// Page-level protection
useRequireRole('admin');

// Component-level protection
<RoleGuard requiredRole="gerente">
  <AdminButton />
</RoleGuard>
```

See `docs/RBAC.md` for complete details.

### 3. Form Handling

Use React Hook Form + reusable form components:

```typescript
import { useForm, FormProvider } from 'react-hook-form';
import { FormInput, FormSelect } from '@/components/form';

function MyForm() {
  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormInput name="nome" label="Nome" />
        <FormSelect name="tipo" label="Tipo" options={options} />
      </form>
    </FormProvider>
  );
}
```

### 4. Data Fetching

Use custom hooks for Supabase queries:

```typescript
import { useBancos } from '@/hooks/useBancos';

function BancosPage() {
  const { fetchBancos, createBanco, loading } = useBancos();

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchBancos(1, 10);
      // Handle result
    };
    loadData();
  }, []);
}
```

### 5. Styling

Use Tailwind CSS with semantic design tokens:

```typescript
// ✅ CORRECT - Use design system tokens
<div className="bg-background text-foreground">
<div className="bg-primary text-primary-foreground">

// ❌ WRONG - Direct colors
<div className="bg-white text-black">
```

See `src/index.css` for available tokens.

## Common Tasks

### Adding a New Feature

1. **Plan**: Understand requirements
2. **Design**: Database schema, API, UI
3. **Database**: Create migration if needed
4. **Backend**: Create endpoint (if needed)
5. **Frontend**: Create components/pages
6. **Tests**: Write unit and integration tests
7. **Documentation**: Update relevant docs
8. **Review**: Submit PR

### Creating a Database Migration

```bash
cd server

# Create migration
npx prisma migrate dev --name add_new_table

# Apply migration
npx prisma migrate deploy

# Regenerate client
npm run prisma:generate
```

### Adding a New Component

```bash
# Create component file
touch src/components/MyComponent.tsx

# Create test file
touch src/components/__tests__/MyComponent.test.tsx
```

### Running Tests

```bash
# Frontend tests
npm run test

# Backend tests
cd server
npm run test

# E2E tests
cd server
npm run test:e2e

# With coverage
npm run test -- --coverage
```

### Building for Production

```bash
# Frontend
npm run build

# Backend
cd server
npm run build
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 5173 (frontend)
   lsof -ti:5173 | xargs kill -9
   
   # Kill process on port 3333 (backend)
   lsof -ti:3333 | xargs kill -9
   ```

2. **Database connection failed**
   - Check PostgreSQL is running
   - Verify `DATABASE_URL` in `.env`
   - Check username/password

3. **Prisma Client not found**
   ```bash
   cd server
   npm run prisma:generate
   ```

4. **Module not found**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

5. **TypeScript errors**
   ```bash
   # Restart TypeScript server in VS Code
   Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
   ```

6. **Supabase RLS errors**
   - Ensure user is authenticated
   - Check RLS policies in Supabase Dashboard
   - Verify `empresa_id` is set correctly

### Getting Help

1. **Documentation**: Check `docs/` folder
2. **Code Comments**: Read inline comments
3. **Team**: Ask in Slack/Discord
4. **GitHub Issues**: Search existing issues
5. **Supabase Docs**: https://supabase.com/docs

## Resources

### Documentation

- [API Reference](./API.md)
- [RBAC Guide](./RBAC.md)
- [Authentication](./AUTHENTICATION.md)
- [Components](./COMPONENTS.md)
- [Testing](./TESTING.md)
- [Security](./SECURITY.md)
- [CI/CD](./CI_CD.md)

### External Resources

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/docs)
- [NestJS](https://docs.nestjs.com/)
- [Prisma](https://www.prisma.io/docs)
- [React Hook Form](https://react-hook-form.com/)

### Tools

- [Supabase Dashboard](https://supabase.com/dashboard/project/dxuxjwfaqdmjytpxglru)
- [Prisma Studio](http://localhost:5555) - `npm run prisma:studio`

## Next Steps

Now that you're set up:

1. ✅ Explore the codebase
2. ✅ Read key documentation files
3. ✅ Pick up a "good first issue" from GitHub
4. ✅ Ask questions in team chat
5. ✅ Make your first contribution!

Welcome aboard! 🚀
