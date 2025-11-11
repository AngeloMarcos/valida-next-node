# Testing Guide

This document outlines the testing strategy and practices for the ValidaCRM application.

## Table of Contents

- [Overview](#overview)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [E2E Testing](#e2e-testing)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Coverage Reports](#coverage-reports)

## Overview

The application uses a comprehensive testing strategy:

- **Backend**: Jest + Supertest for unit and E2E tests
- **Frontend**: Jest + React Testing Library for component and hook tests
- **E2E**: Planned Playwright/Cypress integration (future)

### Testing Philosophy

1. **Unit Tests**: Test individual functions, hooks, and components in isolation
2. **Integration Tests**: Test how different parts work together
3. **E2E Tests**: Test complete user flows from UI to database

## Backend Testing

### Technology Stack

- **Jest**: Testing framework
- **Supertest**: HTTP assertion library
- **@nestjs/testing**: NestJS testing utilities

### Test Structure

```
server/
├── src/
│   └── **/*.spec.ts          # Unit tests alongside source files
└── test/
    ├── app.e2e-spec.ts        # E2E tests
    └── jest-e2e.json          # E2E Jest configuration
```

### Unit Test Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### E2E Test Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/bancos (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/bancos')
      .expect(200);
  });
});
```

### Running Backend Tests

```bash
# Navigate to server directory
cd server

# Run unit tests
npm run test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e

# Run all tests
npm run test && npm run test:e2e
```

## Frontend Testing

### Technology Stack

- **Jest**: Testing framework
- **React Testing Library**: Component testing utilities
- **@testing-library/react-hooks**: Hook testing utilities

### Test Structure

```
src/
├── components/
│   └── __tests__/
│       ├── StatCard.test.tsx
│       └── ...
├── hooks/
│   └── __tests__/
│       ├── useBancos.test.ts
│       └── ...
└── pages/
    └── __tests__/
        └── ...
```

### Component Test Example

```typescript
import { render, screen } from '@testing-library/react';
import { StatCard } from '../StatCard';
import { Users } from 'lucide-react';

describe('StatCard', () => {
  it('should render title and value', () => {
    render(
      <StatCard
        title="Total Users"
        value={100}
        icon={Users}
        description="Active users"
      />
    );

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});
```

### Hook Test Example

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useBancos } from '../useBancos';

describe('useBancos', () => {
  it('should fetch bancos successfully', async () => {
    const { result } = renderHook(() => useBancos());
    
    const response = await result.current.fetchBancos(1, 10);
    
    expect(response.data).toBeDefined();
  });
});
```

### Running Frontend Tests

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage

# Run specific test file
npm run test -- StatCard.test.tsx
```

## E2E Testing

### Planned Implementation

E2E tests will cover complete user workflows:

1. **Authentication Flow**
   - User signup
   - User login
   - Password reset
   - Session persistence

2. **CRUD Operations**
   - Create banco/produto/proposta
   - Read and list items
   - Update items
   - Delete items (with proper permissions)

3. **Role-Based Access**
   - Admin operations
   - Gerente operations
   - Agente operations
   - Permission denial scenarios

4. **Dashboard & Analytics**
   - KPI loading
   - Chart rendering
   - Data filtering

### Technology Options

- **Playwright**: Modern, fast, reliable
- **Cypress**: Popular, good DX, real browser testing

## Writing Tests

### Best Practices

1. **Follow AAA Pattern**
   ```typescript
   it('should do something', () => {
     // Arrange
     const input = 'test';
     
     // Act
     const result = myFunction(input);
     
     // Assert
     expect(result).toBe('expected');
   });
   ```

2. **Use Descriptive Test Names**
   ```typescript
   // ❌ Bad
   it('works', () => { ... });
   
   // ✅ Good
   it('should create banco when valid data is provided', () => { ... });
   ```

3. **Test Behavior, Not Implementation**
   ```typescript
   // ❌ Bad - testing implementation
   expect(component.state.counter).toBe(1);
   
   // ✅ Good - testing behavior
   expect(screen.getByText('Count: 1')).toBeInTheDocument();
   ```

4. **Mock External Dependencies**
   ```typescript
   jest.mock('@/integrations/supabase/client', () => ({
     supabase: {
       from: jest.fn(),
     },
   }));
   ```

5. **Clean Up After Tests**
   ```typescript
   afterEach(() => {
     jest.clearAllMocks();
   });
   ```

### Testing Checklist

- [ ] Happy path scenarios
- [ ] Error handling
- [ ] Edge cases
- [ ] Loading states
- [ ] Empty states
- [ ] Permission checks (RBAC)
- [ ] Form validation
- [ ] API error responses

## Coverage Reports

### Viewing Coverage

```bash
# Backend
cd server
npm run test:cov
# Open: server/coverage/lcov-report/index.html

# Frontend
npm run test -- --coverage
# Open: coverage/lcov-report/index.html
```

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Coverage in CI/CD

Coverage reports are automatically:
- Generated on every CI run
- Uploaded to Codecov
- Displayed in pull request comments
- Tracked over time for trends

## Continuous Integration

Tests run automatically on:
- Every push to `main` or `develop`
- Every pull request
- Before deployment

### CI Workflow

1. **Lint** → Check code quality
2. **Test** → Run unit and integration tests
3. **Build** → Ensure build succeeds
4. **Deploy** → Deploy if all checks pass

See `.github/workflows/` for complete CI/CD configuration.

## Debugging Tests

### Common Issues

1. **Async Tests Timing Out**
   ```typescript
   // Increase timeout
   it('should fetch data', async () => {
     // ...
   }, 10000); // 10 second timeout
   ```

2. **Mock Not Working**
   ```typescript
   // Clear mocks between tests
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

3. **DOM Queries Failing**
   ```typescript
   // Use debug to see DOM
   import { render, screen } from '@testing-library/react';
   const { debug } = render(<Component />);
   debug();
   ```

4. **State Updates Not Reflecting**
   ```typescript
   // Wait for async updates
   await waitFor(() => {
     expect(screen.getByText('Updated')).toBeInTheDocument();
   });
   ```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest](https://github.com/visionmedia/supertest)

## Next Steps

1. Expand test coverage for all modules
2. Implement E2E tests with Playwright
3. Add visual regression testing
4. Set up performance testing
5. Implement contract testing for API
