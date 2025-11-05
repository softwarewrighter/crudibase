# Crudibase Setup Guide

This guide will help you set up the Crudibase development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 22 LTS** (Required - see [NODEJS.md](NODEJS.md) for installation)
- **npm** 9+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

Verify installations:
```bash
node -v   # Must show v22.x.x
npm -v    # Should show 9.x.x or higher
git --version
```

**Important:** Node.js 22 is required because:
- better-sqlite3 requires Node.js 22 for native bindings
- Node.js 23 is not LTS and has compatibility issues
- Node.js 24 is not yet supported by better-sqlite3

See [NODEJS.md](NODEJS.md) for detailed installation instructions.

## Quick Setup (Automated)

The easiest way to set up the project:

```bash
# Clone the repository
git clone https://github.com/wrightmikea/crudibase.git
cd crudibase

# Run the setup script
./scripts/setup.sh
```

The setup script will:
1. Install all dependencies (root, backend, frontend)
2. Setup Husky pre-commit hooks
3. Create `.env` files from examples
4. Create the database data directory

## Manual Setup

If you prefer to set up manually:

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd src/backend
npm install
cd ../..

# Install frontend dependencies
cd src/frontend
npm install
cd ../..
```

### 2. Setup Environment Variables

Create `.env` files from examples:

```bash
# Backend
cp src/backend/.env.example src/backend/.env

# Frontend
cp src/frontend/.env.example src/frontend/.env
```

Edit the `.env` files if you need to change default values.

### 3. Setup Husky

```bash
npx husky install
```

### 4. Create Database Directory

```bash
mkdir -p src/backend/data
```

## Running the Application

### Development Mode

Start both frontend and backend servers:

```bash
npm run dev
```

This will start:
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:3000

Or run them separately:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

## Running Tests

```bash
# Run all tests (backend + frontend)
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Run E2E tests with Playwright
npm run test:e2e

# Run tests in watch mode (for development)
npm run test:watch --workspace=src/backend
npm run test:watch --workspace=src/frontend

# Generate coverage report
npm run test:coverage
```

## Code Quality

### Linting

```bash
# Lint all code
npm run lint

# Lint and auto-fix issues
npm run lint:fix
```

### Formatting

```bash
# Format all code with Prettier
npm run format

# Check formatting without changing files
npm run format:check
```

### Pre-commit Hooks

Git pre-commit hooks are automatically set up via Husky. Before every commit:
1. Code is formatted with Prettier
2. Code is linted with ESLint
3. Related tests are run

To bypass hooks (not recommended):
```bash
git commit --no-verify
```

## Building for Production

```bash
# Build both backend and frontend
npm run build

# Build backend only
npm run build:backend

# Build frontend only
npm run build:frontend
```

Build outputs:
- Backend: `src/backend/dist/`
- Frontend: `src/frontend/dist/`

## Database Management

The SQLite database is automatically created when you first run the backend server.

### Database Location

- Development: `src/backend/data/crudibase.db`

### Database Migrations

Migrations run automatically on server start. To run manually:

```bash
cd src/backend
npm run migrate
```

### Database Schema

See `src/backend/src/utils/database.ts` for the complete schema definition.

## Project Structure

```
crudibase/
├── docs/                    # Documentation
├── scripts/                 # Setup and utility scripts
├── src/
│   ├── backend/            # Express API server
│   │   ├── src/
│   │   │   ├── index.ts    # Server entry point
│   │   │   ├── routes/     # API routes
│   │   │   ├── services/   # Business logic
│   │   │   ├── models/     # Data models
│   │   │   ├── middleware/ # Express middleware
│   │   │   └── utils/      # Utilities (database, etc.)
│   │   └── __tests__/      # Backend tests
│   └── frontend/           # React SPA
│       ├── src/
│       │   ├── main.tsx    # React entry point
│       │   ├── App.tsx     # Main app component
│       │   ├── components/ # React components
│       │   ├── pages/      # Page components
│       │   ├── context/    # React context
│       │   ├── hooks/      # Custom hooks
│       │   └── utils/      # Utilities
│       └── __tests__/      # Frontend tests
├── .gitignore
├── .prettierrc
├── LICENSE
├── README.md
├── SETUP.md               # This file
└── package.json
```

## Available Scripts

### Root Level

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both servers in development mode |
| `npm run build` | Build both backend and frontend |
| `npm test` | Run all tests |
| `npm run lint` | Lint all code |
| `npm run lint:fix` | Lint and auto-fix issues |
| `npm run format` | Format all code with Prettier |

### Backend (`src/backend`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start backend server with hot reload |
| `npm run build` | Build backend to dist/ |
| `npm start` | Run built backend |
| `npm test` | Run backend tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |
| `npm run migrate` | Run database migrations |

### Frontend (`src/frontend`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start frontend dev server |
| `npm run build` | Build frontend to dist/ |
| `npm run preview` | Preview production build |
| `npm test` | Run frontend tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run E2E tests with Playwright |
| `npm run test:e2e:headed` | Run E2E tests with visible browser |

## Troubleshooting

### Port Already in Use

If ports 3000 or 3001 are already in use:

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

Or change the port in `.env` files.

### Dependencies Installation Issues

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules src/*/node_modules
npm install
```

### Database Errors

If you encounter database errors, delete and recreate it:

```bash
rm -rf src/backend/data/
mkdir -p src/backend/data/
npm run dev:backend  # Recreates database
```

### ESLint Errors

If you see TypeScript or ESLint errors after installation:

```bash
# Restart your IDE/editor
# Or rebuild TypeScript info
npm run build --workspace=src/backend
npm run build --workspace=src/frontend
```

## Next Steps

After setup is complete:

1. **Review Documentation**: Read the comprehensive docs in the `docs/` folder:
   - `docs/architecture.md` - System design
   - `docs/prd.md` - Product requirements
   - `docs/design.md` - UI/UX design
   - `docs/plan.md` - Implementation roadmap
   - `docs/process.md` - Development workflow

2. **Start Development**: Follow the Test-Driven Development (TDD) workflow described in `docs/process.md`

3. **Sprint 1**: Begin implementing user registration (see `docs/plan.md`)

## Getting Help

- **Documentation**: See the `docs/` directory
- **Issues**: Report bugs at [GitHub Issues](TBD)
- **Process**: Follow TDD guidelines in `docs/process.md`

## License

MIT License - Copyright (c) 2025 Michael A. Wright

See [LICENSE](LICENSE) file for details.
