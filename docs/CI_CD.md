# CI/CD Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipelines for the ValidaCRM application.

## Table of Contents

- [Overview](#overview)
- [GitHub Actions Workflows](#github-actions-workflows)
- [Backend Pipeline](#backend-pipeline)
- [Frontend Pipeline](#frontend-pipeline)
- [Environment Variables](#environment-variables)
- [Deployment Strategy](#deployment-strategy)
- [Monitoring & Rollback](#monitoring--rollback)

## Overview

The ValidaCRM project uses **GitHub Actions** for automated CI/CD pipelines. We maintain separate workflows for backend and frontend to optimize build times and enable independent deployments.

### Pipeline Philosophy

1. **Fast Feedback**: Fail fast on lint/test errors
2. **Isolated Environments**: Separate dev/staging/production
3. **Automated Testing**: No deployment without passing tests
4. **Security First**: Secrets management and vulnerability scanning

## GitHub Actions Workflows

All workflow files are located in `.github/workflows/`:

- `backend-ci.yml` - Backend CI/CD pipeline
- `frontend-ci.yml` - Frontend CI/CD pipeline

### Workflow Triggers

**Backend Pipeline** triggers on:
```yaml
push:
  branches: [ main, develop ]
  paths:
    - 'server/**'
pull_request:
  branches: [ main, develop ]
  paths:
    - 'server/**'
```

**Frontend Pipeline** triggers on:
```yaml
push:
  branches: [ main, develop ]
  paths:
    - 'src/**'
    - 'public/**'
pull_request:
  branches: [ main, develop ]
  paths:
    - 'src/**'
```

## Backend Pipeline

### Jobs Overview

```
┌─────────┐     ┌─────────┐
│  Lint   │     │  Test   │
└────┬────┘     └────┬────┘
     │               │
     └───────┬───────┘
             │
         ┌───▼────┐
         │ Build  │
         └───┬────┘
             │
         ┌───▼────┐
         │ Deploy │ (main branch only)
         └────────┘
```

### 1. Lint Job

**Purpose**: Ensure code quality and formatting standards

```yaml
- Run ESLint
- Check Prettier formatting
- Validate TypeScript types
```

**Commands**:
```bash
npm run lint
npm run format -- --check
```

### 2. Test Job

**Purpose**: Run unit and E2E tests with database

**Services**:
- PostgreSQL 15 (test database)

**Steps**:
```yaml
1. Setup PostgreSQL service
2. Install dependencies
3. Generate Prisma Client
4. Run migrations
5. Execute unit tests with coverage
6. Execute E2E tests
7. Upload coverage to Codecov
```

**Environment Variables**:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/testdb
```

### 3. Build Job

**Purpose**: Build production artifacts

**Steps**:
```yaml
1. Install dependencies
2. Generate Prisma Client
3. Build NestJS application
4. Upload dist/ artifacts
```

**Outputs**: `server/dist` folder

### 4. Deploy Job

**Purpose**: Deploy to production

**Conditions**:
- Only runs on `main` branch
- Only on push events (not PRs)
- Requires successful build

**Steps**:
```yaml
1. Download build artifacts
2. Deploy to hosting provider
```

**Deployment Options**:
- Heroku
- AWS (ECS, EB, Lambda)
- Google Cloud Run
- Azure App Service
- Custom VPS (Docker)

## Frontend Pipeline

### Jobs Overview

```
┌─────────┐     ┌─────────┐
│  Lint   │     │  Test   │
└────┬────┘     └────┬────┘
     │               │
     └───────┬───────┘
             │
         ┌───▼────┐
         │ Build  │
         └───┬────┘
             │
         ┌───▼────┐
         │ Deploy │ (main branch only)
         └────────┘
```

### 1. Lint Job

**Purpose**: Ensure code quality

```yaml
- Run ESLint
- Check TypeScript compilation
```

**Commands**:
```bash
npm run lint
npx tsc --noEmit
```

### 2. Test Job

**Purpose**: Run unit and component tests

**Steps**:
```yaml
1. Install dependencies
2. Run Jest tests with coverage
3. Upload coverage to Codecov
```

**Commands**:
```bash
npm run test -- --coverage --passWithNoTests
```

### 3. Build Job

**Purpose**: Build production bundle

**Steps**:
```yaml
1. Install dependencies
2. Build Vite application
3. Upload dist/ artifacts
```

**Outputs**: `dist` folder

### 4. Deploy Job

**Purpose**: Deploy to production

**Conditions**:
- Only runs on `main` branch
- Only on push events (not PRs)
- Requires successful build

**Deployment**: Automatic via Lovable platform

## Environment Variables

### Required Secrets (GitHub Secrets)

#### Backend
```bash
DATABASE_URL              # Production database connection
JWT_SECRET               # JWT signing secret
PORT                     # Server port (optional)
```

#### Frontend
```bash
VITE_SUPABASE_URL        # Supabase project URL
VITE_SUPABASE_ANON_KEY   # Supabase anonymous key
```

#### Deployment (Optional)
```bash
# Heroku
HEROKU_API_KEY
HEROKU_EMAIL

# Vercel
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID

# AWS
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
```

### Setting Up Secrets

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each required secret

## Deployment Strategy

### Branching Strategy

```
main (production)
  ↑
develop (staging)
  ↑
feature/* (development)
```

### Deployment Flow

1. **Development**
   - Create feature branch from `develop`
   - Push commits → CI runs (lint + test)
   - Create PR → CI runs + review

2. **Staging**
   - Merge PR to `develop`
   - CI runs full pipeline
   - Auto-deploy to staging environment

3. **Production**
   - Merge `develop` to `main` (via PR)
   - CI runs full pipeline
   - Auto-deploy to production
   - Tag release with version

### Deployment Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Database migrations prepared
- [ ] Environment variables configured
- [ ] Changelog updated
- [ ] Documentation updated
- [ ] Monitoring alerts configured

## Monitoring & Rollback

### Monitoring

**Post-Deployment Checks**:
1. Health check endpoint responds (backend)
2. Application loads (frontend)
3. Database connections work
4. Authentication flows work
5. Critical user paths functional

**Tools** (Recommended):
- **Uptime**: Uptime Robot, Pingdom
- **Errors**: Sentry, Rollbar
- **Performance**: New Relic, Datadog
- **Logs**: CloudWatch, Papertrail

### Rollback Strategy

**Automatic Rollback Triggers**:
- Health check fails
- Error rate > 5%
- Response time > 5s

**Manual Rollback Steps**:

```bash
# Backend (if using Heroku)
heroku releases:rollback v123

# Frontend (Lovable platform)
# Use Lovable's rollback feature in project settings

# Database migrations
cd server
npx prisma migrate resolve --rolled-back "migration_name"
```

**Rollback Checklist**:
- [ ] Notify team of rollback
- [ ] Identify root cause
- [ ] Create hotfix branch if needed
- [ ] Revert problematic changes
- [ ] Re-run CI/CD pipeline
- [ ] Verify production is stable
- [ ] Post-mortem documentation

## CI/CD Best Practices

### 1. Keep Pipelines Fast
- Use caching for dependencies
- Run jobs in parallel
- Only build what changed

### 2. Fail Fast
- Lint before tests
- Unit tests before E2E tests
- Don't deploy if tests fail

### 3. Secure Secrets
- Never commit secrets to code
- Use GitHub Secrets
- Rotate secrets regularly
- Use least-privilege access

### 4. Version Everything
- Tag releases
- Track migrations
- Document changes
- Maintain changelog

### 5. Monitor Everything
- Track deployment success rate
- Monitor application health
- Alert on failures
- Log deployments

## Troubleshooting

### Common Issues

1. **Tests Failing in CI but Passing Locally**
   - Check Node version consistency
   - Verify environment variables
   - Check for race conditions in tests

2. **Build Fails on Dependencies**
   - Clear npm cache: `npm cache clean --force`
   - Delete package-lock.json and reinstall
   - Check for peer dependency conflicts

3. **Database Migration Errors**
   - Ensure migrations run in order
   - Check database connection
   - Verify user permissions

4. **Deployment Timeout**
   - Increase timeout in workflow
   - Check resource limits
   - Verify network connectivity

### Getting Help

- Check workflow logs in GitHub Actions tab
- Review error messages carefully
- Search GitHub Actions docs
- Ask in team Slack/Discord

## Extending CI/CD

### Adding New Jobs

1. Create new job in workflow file
2. Define dependencies (`needs:`)
3. Add necessary steps
4. Test in feature branch first

### Example: Security Scanning

```yaml
security-scan:
  name: Security Scan
  runs-on: ubuntu-latest
  
  steps:
    - uses: actions/checkout@v4
    
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Example: Performance Testing

```yaml
performance:
  name: Performance Tests
  runs-on: ubuntu-latest
  
  steps:
    - uses: actions/checkout@v4
    
    - name: Run Lighthouse CI
      uses: treosh/lighthouse-ci-action@v9
      with:
        urls: |
          https://staging.validacrm.com
        uploadArtifacts: true
```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Codecov Documentation](https://docs.codecov.com/)
- [Heroku Deployment](https://devcenter.heroku.com/categories/deployment)
- [Vercel Deployment](https://vercel.com/docs/deployments/overview)

## Changelog

See `docs/CHANGELOG.md` for deployment history and release notes.
