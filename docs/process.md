# Development Process

## Overview

This document defines the development workflow, coding standards, testing practices, and quality assurance processes for the Crudibase project. All contributors must follow these guidelines to maintain code quality and project consistency.

## Core Principles

1. **Test-Driven Development (TDD)**: Write tests before implementation
2. **Continuous Integration**: Automated testing on every commit
3. **Code Quality**: Automated formatting and linting
4. **Documentation**: Keep docs in sync with code
5. **Incremental Delivery**: Small, frequent commits with working features

---

## Test-Driven Development (TDD)

### The Red-Green-Refactor Cycle

Every feature follows this pattern:

```
┌─────────────────────────────────────────┐
│  1. RED: Write failing test             │
│     - Define expected behavior          │
│     - Test fails (no implementation)    │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│  2. GREEN: Write minimal code to pass   │
│     - Implement just enough             │
│     - Test passes                       │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│  3. REFACTOR: Clean up code             │
│     - Remove duplication                │
│     - Improve readability               │
│     - Tests still pass                  │
└─────────────────────────────────────────┘
```

### Backend TDD Example

**Step 1: RED (Write failing test)**
```typescript
// src/services/AuthService.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from './AuthService';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  it('should register a new user with hashed password', async () => {
    const user = await authService.register({
      email: 'test@example.com',
      password: 'SecurePass123!'
    });

    expect(user.email).toBe('test@example.com');
    expect(user.password_hash).toBeDefined();
    expect(user.password_hash).not.toBe('SecurePass123!'); // password should be hashed
    expect(user.id).toBeDefined();
  });
});
```

**Step 2: GREEN (Implement minimal code)**
```typescript
// src/services/AuthService.ts
import bcrypt from 'bcrypt';
import { User } from '../models/User';

export class AuthService {
  async register(data: { email: string; password: string }): Promise<User> {
    const password_hash = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      email: data.email,
      password_hash
    });
    return user;
  }
}
```

**Step 3: REFACTOR (Clean up, add more tests)**
```typescript
// Add more test cases
it('should throw error if email already exists', async () => {
  await authService.register({ email: 'test@example.com', password: 'Pass1!' });

  await expect(
    authService.register({ email: 'test@example.com', password: 'Pass2!' })
  ).rejects.toThrow('Email already exists');
});

it('should validate password strength', async () => {
  await expect(
    authService.register({ email: 'test@example.com', password: 'weak' })
  ).rejects.toThrow('Password must be at least 8 characters');
});
```

### Frontend TDD Example

**Step 1: RED (Write failing test)**
```typescript
// src/components/auth/LoginForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('should call onSubmit with email and password', async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'SecurePass123!' }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'SecurePass123!'
      });
    });
  });
});
```

**Step 2: GREEN (Implement component)**
```typescript
// src/components/auth/LoginForm.tsx
import { useForm } from 'react-hook-form';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const { register, handleSubmit } = useForm<LoginFormData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" {...register('email')} />

      <label htmlFor="password">Password</label>
      <input id="password" type="password" {...register('password')} />

      <button type="submit">Sign In</button>
    </form>
  );
}
```

**Step 3: REFACTOR (Add validation, error handling)**

---

## Testing Frameworks & Tools

### Backend Testing

#### Unit Tests (Vitest)
```bash
npm run test:unit        # Run unit tests
npm run test:unit:watch  # Watch mode for development
npm run test:coverage    # Generate coverage report
```

**What to test:**
- Services (business logic)
- Utilities (helpers, formatters)
- Models (validation, methods)

**Example structure:**
```
src/
├── services/
│   ├── AuthService.ts
│   └── AuthService.test.ts
├── utils/
│   ├── validation.ts
│   └── validation.test.ts
```

#### Integration Tests (Supertest)
```bash
npm run test:integration  # Test API endpoints
```

**What to test:**
- API endpoints (request/response)
- Authentication middleware
- Database operations
- Error handling

**Example:**
```typescript
// src/routes/auth.test.ts
import request from 'supertest';
import { app } from '../app';

describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!'
      })
      .expect(201);

    expect(response.body.user.email).toBe('test@example.com');
    expect(response.body.token).toBeDefined();
  });
});
```

### Frontend Testing

#### Component Tests (React Testing Library)
```bash
npm run test:components  # Test React components
```

**What to test:**
- User interactions (clicks, typing)
- Conditional rendering
- Props handling
- State changes

**Best practices:**
- Query by accessibility roles (getByRole)
- Test user behavior, not implementation
- Use userEvent for realistic interactions

**Example:**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should show error message on failed login', async () => {
  const user = userEvent.setup();
  render(<LoginForm onSubmit={() => Promise.reject('Invalid credentials')} />);

  await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
  await user.type(screen.getByLabelText(/password/i), 'wrong');
  await user.click(screen.getByRole('button', { name: /sign in/i }));

  expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
});
```

#### E2E Tests (Playwright)
```bash
npm run test:e2e         # Run E2E tests headless
npm run test:e2e:headed  # Run with browser visible
npm run test:e2e:debug   # Debug mode
```

**What to test:**
- Complete user workflows
- Multi-page interactions
- Real API calls
- Cross-browser compatibility

**Example:**
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can register, login, and logout', async ({ page }) => {
  // Register
  await page.goto('http://localhost:3000/register');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);

  // Logout
  await page.click('button:has-text("Logout")');
  await expect(page).toHaveURL(/\/login/);

  // Login
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);
});
```

---

## Using MCP/Playwright for UI Verification

### When to Use Playwright MCP

1. **Debugging E2E Test Failures**: Step through test execution
2. **Manual Feature Verification**: Verify features work in real browser
3. **Visual Regression Testing**: Compare screenshots
4. **Performance Profiling**: Analyze page load times

### Playwright MCP Workflow

**Example: Verify Login Feature**
```typescript
// 1. Navigate to login page
await mcp__playwright__playwright_navigate({
  url: 'http://localhost:3000/login',
  browserType: 'chromium',
  headless: false // See browser window
});

// 2. Take screenshot before interaction
await mcp__playwright__playwright_screenshot({
  name: 'login-page-initial',
  savePng: true
});

// 3. Fill form
await mcp__playwright__playwright_fill({
  selector: 'input[name="email"]',
  value: 'test@example.com'
});

await mcp__playwright__playwright_fill({
  selector: 'input[name="password"]',
  value: 'SecurePass123!'
});

// 4. Click login button
await mcp__playwright__playwright_click({
  selector: 'button[type="submit"]'
});

// 5. Wait for redirect and verify
await new Promise(resolve => setTimeout(resolve, 1000));
await mcp__playwright__playwright_screenshot({
  name: 'dashboard-after-login',
  savePng: true
});

// 6. Get page content to verify
const pageText = await mcp__playwright__playwright_get_visible_text({});
console.log('Dashboard loaded:', pageText.includes('Welcome'));

// 7. Close browser
await mcp__playwright__playwright_close({});
```

**Debugging Checklist:**
- [ ] Navigate to page successfully
- [ ] Take "before" screenshot
- [ ] Interact with UI elements
- [ ] Verify expected changes
- [ ] Take "after" screenshot
- [ ] Check console logs for errors
- [ ] Verify network requests succeeded

---

## Pre-Commit Workflow

### Automated Checks (Husky + lint-staged)

Every commit triggers these checks automatically:

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "prettier --write",
      "eslint --fix",
      "vitest related --run"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### Manual Pre-Commit Checklist

Before committing, ensure:

1. **Format Code**
   ```bash
   npm run format
   ```

2. **Lint Code**
   ```bash
   npm run lint
   npm run lint:fix  # Auto-fix issues
   ```

3. **Run Tests**
   ```bash
   npm run test              # All tests
   npm run test:unit         # Unit tests only
   npm run test:integration  # Integration tests only
   npm run test:coverage     # Check coverage (>80%)
   ```

4. **Build Successfully**
   ```bash
   npm run build  # Backend and frontend must build
   ```

5. **Update Documentation**
   - Update README if public API changed
   - Update API docs if endpoints changed
   - Update inline comments for complex logic

6. **Verify Feature Manually**
   - Run app locally (`npm run dev`)
   - Test feature in browser
   - Use Playwright MCP if needed

7. **Commit with Descriptive Message**
   ```bash
   git add .
   git commit -m "feat: add user registration with email validation

   - Implement AuthService.register()
   - Add bcrypt password hashing
   - Create POST /api/auth/register endpoint
   - Add unit and integration tests
   - Update API documentation"
   ```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process, dependencies

**Examples:**
```
feat(auth): add password reset functionality

- Implement forgot-password endpoint
- Generate and store reset tokens
- Send reset email (mocked)
- Add E2E test for complete flow

Closes #42
```

```
fix(search): handle empty search results gracefully

Previously, empty results caused a blank page.
Now displays "No results found" message.

Fixes #38
```

---

## Code Quality Standards

### ESLint Rules

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "react/prop-types": "off" // Using TypeScript
  }
}
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### TypeScript Standards

- **Strict mode enabled** (`"strict": true` in tsconfig.json)
- **No `any` types** (use `unknown` if needed)
- **Explicit return types** for public functions
- **Interfaces over types** for object shapes

**Example:**
```typescript
// ✅ Good
interface User {
  id: number;
  email: string;
}

function getUser(id: number): Promise<User> {
  return fetchUser(id);
}

// ❌ Bad
function getUser(id: any) {
  return fetchUser(id);
}
```

### Code Coverage Requirements

Minimum coverage thresholds:

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

```json
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80
    }
  }
});
```

---

## Documentation Standards

### Code Comments

- **Functions**: JSDoc comments for public APIs
- **Complex Logic**: Inline comments explaining "why", not "what"
- **TODOs**: Use `// TODO: description` for future work

**Example:**
```typescript
/**
 * Registers a new user with email and password.
 *
 * @param email - User's email address
 * @param password - Plain text password (will be hashed)
 * @returns User object with JWT token
 * @throws {ValidationError} If email is invalid or password is weak
 * @throws {ConflictError} If email already exists
 */
export async function register(
  email: string,
  password: string
): Promise<{ user: User; token: string }> {
  // Validate email format
  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email format');
  }

  // Check password strength (min 8 chars, 1 uppercase, 1 number)
  if (!isStrongPassword(password)) {
    throw new ValidationError('Password is too weak');
  }

  // Hash password before storing
  const password_hash = await bcrypt.hash(password, 12);

  // TODO: Send verification email after MVP
  const user = await User.create({ email, password_hash });
  const token = generateJWT(user.id);

  return { user, token };
}
```

### API Documentation

Update `docs/api.md` when adding/changing endpoints:

```markdown
### POST /api/auth/register

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2025-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400` - Validation error (invalid email, weak password)
- `409` - Email already exists
```

### README Updates

Update README.md when:
- Adding new dependencies
- Changing setup steps
- Adding new npm scripts
- Changing environment variables

---

## Development Workflow Summary

### Daily Development Cycle

```
1. Pull latest changes
   git pull origin main

2. Create feature branch
   git checkout -b feat/user-registration

3. Write failing test (RED)
   # Edit: src/services/AuthService.test.ts
   npm run test:watch

4. Implement feature (GREEN)
   # Edit: src/services/AuthService.ts
   # Test passes!

5. Refactor code (REFACTOR)
   # Clean up, optimize
   # Tests still pass

6. Run all checks
   npm run format
   npm run lint
   npm run test
   npm run build

7. Verify in browser
   npm run dev
   # Manual testing or Playwright MCP

8. Update documentation
   # Update README, API docs

9. Commit changes
   git add .
   git commit -m "feat: add user registration"

10. Push to remote
    git push origin feat/user-registration

11. Create pull request (if collaborative)
    # Review and merge
```

### Sprint Workflow

**Week 1 (Planning):**
- Review sprint goals
- Break down tasks
- Estimate effort
- Assign tasks

**Week 2-3 (Development):**
- Daily: TDD cycle
- Daily: Commit working code
- Daily: Update task board
- Mid-week: Demo progress

**Week 4 (Testing & Review):**
- E2E testing with Playwright
- Bug fixes
- Code review
- Sprint retrospective

---

## Continuous Integration (CI)

### GitHub Actions Workflow (Future)

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      - run: npm run test:e2e
```

---

## Troubleshooting

### Common Issues

**Tests failing locally but pass in CI:**
- Check Node.js version (use `.nvmrc`)
- Clear `node_modules` and reinstall
- Check environment variables

**Playwright tests flaky:**
- Add explicit waits (`waitFor`)
- Increase timeout for slow operations
- Use Playwright MCP to debug

**Build fails:**
- Check TypeScript errors (`npm run type-check`)
- Check for missing dependencies
- Clear build cache (`rm -rf dist`)

**Pre-commit hook fails:**
- Run checks manually to see specific error
- Fix issues, stage changes, commit again
- Bypass hook only if absolutely necessary: `git commit --no-verify`

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [TDD Best Practices](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Last Updated**: 2025-01-15
