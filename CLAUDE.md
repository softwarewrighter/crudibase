# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Crudibase** is a full-stack TypeScript application for exploring Wikibase knowledge graphs (like Wikidata). It's being developed using strict Test-Driven Development (TDD) principles with comprehensive testing at all levels.

**Current Status**: MVP Phase 1 - Sprints 1-2, 4-5 complete (Sprint 3 deferred). Full working MVP with user authentication, Wikibase search, and collections. Password reset to be added later. Next priority: Deploy to test server.

## Critical: Node.js Version Management

**REQUIRED: Node.js 22 LTS ONLY**

This project uses `better-sqlite3`, a native module that requires exact Node.js version matching.

### Setup Commands

```bash
# First-time setup with automatic Node 22 switching
./scripts/dev-setup.sh

# If you need to rebuild after switching Node versions or encountering native module errors
./scripts/rebuild-all.sh

# Manual Node switching (if you have nvm)
nvm use 22

# Check if Node version is compatible
npm run check-node-version
```

### Version Protection

- **Automatic blocking**: `npm run build` and `npm run test` will fail if Node version ≠ 22
- **`.nvmrc` file**: Specifies Node 22 for auto-switching with nvm
- If tests fail with "NODE_MODULE_VERSION mismatch", run: `npm rebuild better-sqlite3 --workspace=src/backend`

See `docs/node-version-management.md` for troubleshooting.

### ⚠️ CRITICAL: Claude Code Bash Command Pattern

**Claude Code does NOT maintain shell state between Bash tool calls.**

This means `nvm use 22` in one command does NOT affect the next command. You MUST include the nvm prefix in EVERY SINGLE Bash command that runs npm/node:

**CORRECT Pattern (use this ALWAYS):**

```bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 22 && <your command>
```

**Examples:**

```bash
# Run tests
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 22 && npm test

# Run dev server
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 22 && npm run dev

# Rebuild better-sqlite3
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 22 && npm rebuild better-sqlite3 --workspace=src/backend
```

**WRONG (will use system Node, not Node 22):**

```bash
# This is WRONG - do NOT do this:
nvm use 22  # ❌ This runs in one shell
npm test    # ❌ This runs in a different shell with system Node
```

**Why this matters:** If you forget this pattern, npm will use the system Node version (23.x) instead of Node 22, causing better-sqlite3 compilation failures that waste time.

## Architecture

### Monorepo Structure (npm workspaces)

```
crudibase/
├── src/
│   ├── backend/          # Express API (port 3001)
│   │   ├── src/
│   │   │   ├── index.ts           # Express app entry
│   │   │   ├── models/            # Data models (User, etc.)
│   │   │   ├── services/          # Business logic (AuthService, WikibaseService)
│   │   │   ├── routes/            # API routes (/api/auth/*, /api/wikibase/*)
│   │   │   └── utils/             # Database, JWT, validation
│   │   └── __tests__/             # Integration tests
│   └── frontend/         # React SPA (port 3000)
│       ├── src/
│       │   ├── App.tsx            # Main app with routing
│       │   ├── components/        # React components
│       │   └── test/              # Test utilities
│       └── __tests__/             # E2E tests (Playwright)
├── docs/                 # Comprehensive documentation
└── scripts/              # Setup and utility scripts
```

### Tech Stack

- **Backend**: Express.js + TypeScript + SQLite3 (better-sqlite3) + JWT auth
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + React Router v6
- **Testing**: Vitest (unit/integration) + React Testing Library + Playwright (E2E)
- **Auth**: bcrypt (cost 12) + JWT tokens + httpOnly cookies
- **External API**: Wikidata REST API (to be integrated in Sprint 4)

### Database (SQLite)

Database initialization happens via `src/backend/src/utils/database.ts`:

- **Location**: `src/backend/data/crudibase.db` (or `:memory:` in tests)
- **Schema**: Migrations run automatically on init (users, sessions, api_tokens, search_cache, collections, collection_items)
- **Models**: Use synchronous better-sqlite3 API, wrapped in classes (User, etc.)

## Development Commands

### Setup & Build

```bash
# Complete setup (handles Node 22 + dependencies)
./scripts/dev-setup.sh

# Development servers (both frontend & backend)
npm run dev

# Individual servers
npm run dev:backend    # Backend only (port 3001)
npm run dev:frontend   # Frontend only (port 3000)

# Build
npm run build          # Build both workspaces
npm run build:backend
npm run build:frontend
```

### Testing

**IMPORTANT**: Always run tests before committing. The project follows strict TDD.

```bash
# All tests (both workspaces)
npm test

# Backend tests
npm run test:backend
cd src/backend && npm run test:watch    # Watch mode for TDD

# Frontend tests
npm run test:frontend
cd src/frontend && npm run test:watch   # Watch mode

# E2E tests (Playwright)
npm run test:e2e
npm run test:e2e:headed                 # See browser
npm run test:e2e:debug                  # Debug mode

# Coverage reports
npm run test:coverage                   # Must be >80%
```

### Code Quality

```bash
# Run all quality checks before commit
npm run lint            # ESLint
npm run lint:fix        # Auto-fix issues
npm run format          # Prettier formatting
npm run build           # Verify builds
npm test                # Verify tests pass
```

**Pre-commit hooks** (Husky) automatically run these checks.

## Test-Driven Development Workflow

This project uses **strict TDD** - write tests first, then implementation.

### RED-GREEN-REFACTOR Cycle

1. **RED**: Write failing test
2. **GREEN**: Write minimal code to pass
3. **REFACTOR**: Clean up while keeping tests green

### Test File Locations

- **Backend unit tests**: Co-located with source (e.g., `User.ts` → `User.test.ts`)
- **Backend integration tests**: `src/backend/__tests__/` or `routes/*.test.ts`
- **Frontend component tests**: Co-located (e.g., `LoginForm.tsx` → `LoginForm.test.tsx`)
- **E2E tests**: `src/frontend/__tests__/e2e/*.spec.ts`

### Example TDD Flow

**Backend Service:**

```typescript
// 1. RED: Write test first (AuthService.test.ts)
it('should register user with hashed password', async () => {
  const result = await authService.register({
    email: 'test@example.com',
    password: 'SecurePass123!'
  });
  expect(result.user.email).toBe('test@example.com');
  expect(result.token).toBeDefined();
});

// 2. GREEN: Implement (AuthService.ts)
async register(input) {
  const password_hash = await bcrypt.hash(input.password, 12);
  const user = await User.create({ ...input, password_hash });
  const token = generateToken(user.id);
  return { user, token };
}

// 3. REFACTOR: Add validation, error handling, more tests
```

**Frontend Component:**

```typescript
// 1. RED: Write test first (LoginForm.test.tsx)
it('should submit form with email and password', async () => {
  const handleSubmit = vi.fn();
  render(<LoginForm onSubmit={handleSubmit} />);

  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'pass123');
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

  expect(handleSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'pass123'
  });
});

// 2. GREEN: Implement component
// 3. REFACTOR: Add validation, styling, error states
```

See `docs/process.md` for detailed TDD examples.

## Key Architectural Patterns

### Backend: Service Layer Pattern

- **Routes** (`src/backend/src/routes/`): Handle HTTP, validate input (Zod), call services
- **Services** (`src/backend/src/services/`): Business logic, no HTTP knowledge
- **Models** (`src/backend/src/models/`): Database operations, validation

```typescript
// Route handles HTTP
authRouter.post('/register', async (req, res) => {
  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json(...);

  const result = await authService.register(validation.data);
  return res.status(201).json(result);
});

// Service has business logic
class AuthService {
  async register(input) {
    const user = await User.create(input);
    const token = generateToken(user.id);
    // Create session in DB
    return { user, token };
  }
}

// Model handles data
class User {
  static async create(input) {
    // Validate, hash password, insert to DB
  }
}
```

### Frontend: Component Composition

- **Pages**: Route-level components (HomePage, LoginPage)
- **Components**: Reusable UI (LoginForm, RegisterForm, Dashboard)
- **No global state yet**: Using React hooks, Context API for auth (Zustand planned if needed)

### Database Access

- **Synchronous better-sqlite3 API** (not async)
- **Models wrap DB operations** in async functions for consistency
- **Test isolation**: Each test gets fresh `:memory:` database

```typescript
// Database initialization (runs migrations)
import { initDatabase, runMigrations, getDatabase } from './utils/database';

const db = initDatabase(); // Creates/opens DB
runMigrations(db); // Creates tables

// Use in models
const db = getDatabase(); // Singleton
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
```

## Working with Wikibase API (Sprint 4 - Coming Next)

**NOTE**: Wikibase integration is planned but not yet implemented.

### Future WikibaseService Pattern

```typescript
// src/backend/src/services/WikibaseService.ts
class WikibaseService {
  async search(query: string) {
    // 1. Check cache first (search_cache table)
    // 2. If miss, call Wikidata REST API
    // 3. Store in cache, return results
  }

  async getEntity(id: string) {
    // Fetch entity details from Wikibase
  }
}
```

### Wikidata API Endpoints (Reference)

- Search: `https://www.wikidata.org/w/rest.php/wikibase/v0/entities/search?q={query}`
- Entity: `https://www.wikidata.org/w/rest.php/wikibase/v0/entities/items/{id}`

See `docs/architecture.md` for detailed integration plans.

## Common Development Tasks

### Adding a New API Endpoint

1. **Write integration test** (`routes/*.test.ts`):

   ```typescript
   describe('POST /api/auth/forgot-password', () => {
     it('should generate reset token', async () => {
       const res = await request(app)
         .post('/api/auth/forgot-password')
         .send({ email: 'test@example.com' })
         .expect(200);
       expect(res.body.message).toContain('reset link sent');
     });
   });
   ```

2. **Write service unit test** (`services/*.test.ts`)
3. **Implement service method**
4. **Create route with validation** (Zod schema)
5. **Register route** in `src/backend/src/index.ts`
6. **Verify with manual testing** or Playwright MCP

### Adding a New React Component

1. **Write component test** first:

   ```typescript
   // RegisterForm.test.tsx
   it('should show password strength indicator', () => {
     render(<RegisterForm />);
     const input = screen.getByLabelText(/password/i);
     fireEvent.change(input, { target: { value: 'weak' } });
     expect(screen.getByText(/weak/i)).toBeInTheDocument();
   });
   ```

2. **Implement component** with TypeScript interfaces
3. **Add to routing** in `App.tsx` if needed
4. **Style with Tailwind CSS**

### Running a Single Test File

```bash
# Backend
cd src/backend
npx vitest src/services/AuthService.test.ts

# Frontend
cd src/frontend
npx vitest src/components/LoginForm.test.tsx

# E2E specific test
cd src/frontend
npx playwright test registration.spec.ts --headed
```

## Code Style & Standards

### TypeScript

- **Strict mode enabled**: No implicit any, strict null checks
- **Explicit return types** for public functions
- **Interfaces for data shapes**, types for unions/intersections
- **No `any`**: Use `unknown` if truly dynamic

### Testing

- **Coverage requirement**: >80% for all metrics
- **Test naming**: `should <expected behavior> when <condition>`
- **Avoid testing implementation**: Test user-facing behavior
- **Use React Testing Library queries**: `getByRole` > `getByTestId`

### Security

- **Never commit secrets**: Use `.env` files (already gitignored)
- **Always validate input**: Use Zod schemas in routes
- **Parameterized queries**: Never string concat SQL
- **bcrypt cost factor**: 12 (set in User model)
- **JWT expiration**: 1 hour (configurable in `utils/jwt.ts`)

## Documentation

### Where to Look

- **Architecture overview**: `docs/architecture.md`
- **API design**: `docs/design.md` (database schema, endpoints)
- **Development process**: `docs/process.md` (TDD workflow, MCP/Playwright)
- **Implementation roadmap**: `docs/plan.md` (sprint breakdowns)
- **Project status**: `docs/status.md` (current progress, decisions)
- **Node version issues**: `docs/node-version-management.md`

### When to Update Docs

- API endpoints change → Update `docs/design.md` API section
- Architecture changes → Update `docs/architecture.md`
- New dependencies → Update README.md tech stack
- Sprint completion → Update `docs/status.md`

## Debugging & Troubleshooting

### Backend Issues

```bash
# Check database schema
sqlite3 src/backend/data/crudibase.db ".schema"

# View logs
npm run dev:backend  # Logs to console

# Debug tests
cd src/backend
npx vitest --inspect-brk src/services/AuthService.test.ts
```

### Frontend Issues

```bash
# Check build output
npm run build:frontend

# E2E debugging with Playwright MCP
# Use mcp__playwright__* tools to interactively test UI

# Component testing with debug
cd src/frontend
npx vitest --ui  # Opens Vitest UI
```

### Common Errors

**"NODE_MODULE_VERSION mismatch"**

- Cause: better-sqlite3 compiled for different Node version
- Fix: `nvm use 22 && npm rebuild better-sqlite3 --workspace=src/backend`

**"Database locked"**

- Cause: Multiple processes accessing SQLite
- Fix: Ensure only one dev server running, check for zombie processes

**Tests pass locally but fail in different environment**

- Cause: Node version mismatch
- Fix: Check `.nvmrc`, ensure Node 22

## Sprint Context (Current Work)

**Completed:**

- ✅ Sprint 0: Dev environment setup
- ✅ Sprint 1: User registration (TDD)
- ✅ Sprint 2: Login & JWT authentication
- ✅ Sprint 4-5: Wikibase search integration
- ✅ Sprint 4-5: Collections CRUD with full UI
- ✅ Search page with results and "Add to Collection" functionality
- ✅ Collection detail pages showing items
- ✅ Working MVP deployed locally

**Current Priority: Deployment Spike**

- Deploy MVP to test server
- Configure production environment
- Setup HTTPS/SSL
- Test with real users

**UI Improvements Backlog (Post-Deployment):**

- Collection page enhancements (item counts, create button, statistics)
- Card design improvements
- Quick actions on collection cards

**Long-term Goals:**

- Graph visualization (Phase 2)
- SPARQL query builder (Phase 2)
- Public collections (Phase 3)

See `docs/plan.md` for full roadmap and `docs/ui-improvements.md` for UI backlog.

## Project Philosophy

1. **TDD is non-negotiable**: Tests must be written first
2. **Quality over speed**: 80%+ coverage, clean code, good docs
3. **Incremental delivery**: Small PRs, frequent commits
4. **Documentation in sync**: Update docs with code changes
5. **Security by default**: Validate all inputs, hash all secrets

## Working with This Codebase

### Every Time You Resume Development

**CRITICAL FIRST STEP**: Verify Node.js version before starting work.

```bash
# Check current Node version
node -v                  # Should show v22.x.x

# If wrong version, switch to Node 22
nvm use 22              # Or use ./scripts/dev-setup.sh

# Verify it's correct
npm run check-node-version
```

**⚠️ REMEMBER: Claude Code Bash Pattern**

When using Claude Code, EVERY Bash command that runs npm/node needs the full nvm prefix:

```bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 22 && <command>
```

**Why this matters**:

- Claude Code does NOT maintain shell state between Bash tool calls
- Running `nvm use 22` in one command does NOT affect the next command
- Each Bash invocation is a separate shell session
- Using the wrong Node version will cause:
  - Tests to fail with cryptic native module errors
  - Builds to fail silently or with confusing errors
  - Database operations to crash with "NODE_MODULE_VERSION mismatch"

**Make it automatic**: Add to your shell profile to auto-switch on `cd`:

```bash
# For zsh (add to ~/.zshrc)
autoload -U add-zsh-hook
load-nvmrc() {
  if [[ -f .nvmrc && -r .nvmrc ]]; then
    nvm use
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc
```

### When Implementing New Features

1. ✅ **FIRST**: Verify Node version (`node -v` → should be v22.x.x)
2. ✅ Review relevant docs (`docs/architecture.md`, `docs/design.md`)
3. ✅ Check current sprint goals (`docs/status.md`)
4. ✅ Write tests first (RED)
5. ✅ Implement minimal code (GREEN)
6. ✅ Refactor and add edge cases (REFACTOR)
7. ✅ Run full test suite + build
8. ✅ Update documentation if needed
9. ✅ Commit with conventional commit message

**Remember**: This is a learning project focused on best practices. Take time to write good tests and clean code.
