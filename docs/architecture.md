# Architecture

## System Overview

**Crudibase** is a full-stack JavaScript application that enables users to explore and interact with Wikibase knowledge graphs through an intuitive web interface. The system provides user authentication, personal API token management, and interactive search capabilities.

## Tech Stack

### Frontend
- **Framework**: React 18+ (Single Page Application)
- **Routing**: React Router v6
- **State Management**: React Context API + hooks (or Zustand for more complex state)
- **HTTP Client**: Axios or Fetch API
- **UI Components**: Material-UI (MUI) or Tailwind CSS + Headless UI
- **Form Management**: React Hook Form + Zod for validation
- **Testing**: Vitest + React Testing Library + Playwright

### Backend
- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js 4.x (or Fastify for better performance)
- **API Style**: RESTful API
- **Authentication**: JWT (JSON Web Tokens) + bcrypt for password hashing
- **Database ORM**: Better-SQLite3 (synchronous, fast) or Knex.js
- **Validation**: Zod or Joi
- **Testing**: Vitest + Supertest for API testing

### Database
- **Primary Store**: SQLite3
- **Schema Management**: Knex migrations or Prisma
- **Use Cases**: User accounts, password hashes, Wikibase API tokens, cached query results

### External APIs
- **Wikibase**: Wikidata REST API (and potentially other Wikibase instances)
- **Future**: Google OAuth2 for authentication

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │         React SPA (Port 3000)                     │  │
│  │  - Auth Components (Login/Register/Reset)         │  │
│  │  - Search Interface                               │  │
│  │  - Results Visualization                          │  │
│  │  - Token Management                               │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │ HTTPS
                         │ REST API (JSON)
                         ↓
┌─────────────────────────────────────────────────────────┐
│                  Express Server (Port 3001)              │
│  ┌───────────────────────────────────────────────────┐  │
│  │  API Routes                                       │  │
│  │  - /api/auth/* (register, login, logout, reset)  │  │
│  │  - /api/user/* (profile, tokens)                 │  │
│  │  - /api/wikibase/* (search, query proxies)       │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Middleware                                       │  │
│  │  - Authentication (JWT verification)             │  │
│  │  - Request validation                            │  │
│  │  - Error handling                                │  │
│  │  - Rate limiting                                 │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Services                                         │  │
│  │  - UserService (CRUD operations)                 │  │
│  │  - AuthService (password, tokens, sessions)      │  │
│  │  - WikibaseService (API integration)             │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│              SQLite3 Database (crudibase.db)             │
│  - users (id, email, password_hash, created_at, etc.)   │
│  - sessions (id, user_id, token, expires_at)            │
│  - api_tokens (id, user_id, service, token, etc.)       │
│  - search_cache (query_hash, results, cached_at)        │
└─────────────────────────────────────────────────────────┘

                         ↑ (Backend queries)
                         │
┌─────────────────────────────────────────────────────────┐
│            External APIs                                 │
│  - Wikidata REST API (wikidata.org)                     │
│  - Other Wikibase instances                             │
│  - Future: Google OAuth2                                │
└─────────────────────────────────────────────────────────┘
```

## Component Interactions

### Authentication Flow
1. User submits registration/login form (Frontend)
2. Frontend sends credentials to `/api/auth/*` (Backend)
3. Backend validates, hashes password (bcrypt), stores in SQLite
4. Backend generates JWT and returns to Frontend
5. Frontend stores JWT in memory + httpOnly cookie
6. Subsequent requests include JWT in Authorization header

### Wikibase Search Flow
1. User enters search query (Frontend)
2. Frontend sends request to `/api/wikibase/search` with JWT
3. Backend verifies JWT, extracts user_id
4. Backend retrieves user's Wikibase token (if required)
5. Backend queries Wikibase API (with caching)
6. Backend returns formatted results to Frontend
7. Frontend renders results with interactive UI

## Security Considerations

### Current Phase
- **Password Storage**: bcrypt with salt rounds >= 12
- **JWT**: HS256 algorithm, 1-hour expiration, httpOnly cookies
- **Input Validation**: All inputs validated on backend
- **SQL Injection**: Prevented via parameterized queries (ORM)
- **XSS**: React's built-in escaping + Content Security Policy
- **CSRF**: SameSite cookies + CSRF tokens
- **Rate Limiting**: Express-rate-limit on auth endpoints
- **HTTPS**: Development uses self-signed certs, production uses Let's Encrypt

### Future Phase (OAuth2)
- Google OAuth2 provider integration
- Store OAuth tokens encrypted in SQLite
- Support both local and OAuth authentication

## Data Models

### User
```typescript
{
  id: number (primary key)
  email: string (unique)
  password_hash: string (nullable for OAuth users)
  created_at: timestamp
  updated_at: timestamp
  email_verified: boolean
  reset_token: string (nullable)
  reset_token_expires: timestamp (nullable)
}
```

### Session
```typescript
{
  id: number (primary key)
  user_id: number (foreign key)
  token: string (JWT)
  expires_at: timestamp
  created_at: timestamp
}
```

### ApiToken
```typescript
{
  id: number (primary key)
  user_id: number (foreign key)
  service: string ('wikibase', 'google', etc.)
  token: string (encrypted)
  created_at: timestamp
  updated_at: timestamp
}
```

### SearchCache
```typescript
{
  id: number (primary key)
  query_hash: string (unique, indexed)
  query: string
  results: json
  cached_at: timestamp
  expires_at: timestamp
}
```

## Deployment Architecture

### Development
- Frontend: Vite dev server (port 3000)
- Backend: nodemon (port 3001)
- Database: SQLite file (`./data/crudibase.dev.db`)

### Production
- Frontend: Static files served via Nginx or Caddy
- Backend: Node.js behind reverse proxy
- Database: SQLite file with regular backups
- HTTPS: Let's Encrypt certificates (auto-renewal)
- Process Management: PM2 or systemd

## Scalability Considerations

### Short-term (SQLite is sufficient)
- Single-server deployment
- File-based SQLite with WAL mode
- Connection pooling in application layer
- Response caching for Wikibase queries

### Long-term (if needed)
- Migrate to PostgreSQL for multi-instance support
- Add Redis for session storage and caching
- Implement horizontal scaling with load balancer
- Separate read replicas for analytics

## Testing Strategy

### Frontend
- **Unit**: Vitest for hooks, utilities, pure functions
- **Component**: React Testing Library for component behavior
- **E2E**: Playwright for user workflows (login, search, etc.)

### Backend
- **Unit**: Vitest for services, utilities
- **Integration**: Supertest for API endpoints
- **E2E**: Playwright MCP for full-stack workflows

### Database
- **Migrations**: Test up/down migrations
- **Seeds**: Test data for development and testing
