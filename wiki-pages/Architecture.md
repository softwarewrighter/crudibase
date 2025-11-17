# System Architecture

This page provides a comprehensive overview of Crudibase's system architecture, including deployment, component layers, and data flow.

## Table of Contents
- [System Overview](#system-overview)
- [Deployment Architecture](#deployment-architecture)
- [Application Layers](#application-layers)
- [Component Interactions](#component-interactions)
- [Technology Stack](#technology-stack)
- [Security Architecture](#security-architecture)

## System Overview

Crudibase is a full-stack TypeScript application organized as a monorepo with npm workspaces:

```mermaid
graph LR
    subgraph "Monorepo"
        Frontend[Frontend<br/>React SPA]
        Backend[Backend<br/>Express API]
        Frontend -.->|imports types| Backend
    end

    Frontend -->|HTTP/JSON| Backend
    Backend -->|SQL| DB[(SQLite)]
    Backend -->|REST API| Wikidata[Wikidata API]

    style Frontend fill:#fff4e1
    style Backend fill:#e8f5e9
    style DB fill:#f3e5f5
    style Wikidata fill:#fce4ec
```

**Key Characteristics:**
- **Monorepo structure** with shared TypeScript types
- **Strict separation** between frontend and backend
- **RESTful API** for all communication
- **SQLite database** for user data and caching
- **External API integration** with Wikidata

## Deployment Architecture

### Production Setup

```mermaid
graph TB
    Internet[Internet Traffic] -->|HTTPS :443| Proxy

    subgraph "DigitalOcean Droplet"
        Proxy[SSL Proxy Container<br/>nginx + certbot<br/>ports: 80, 443]

        subgraph "Crudibase Network"
            Proxy -->|proxies /| Frontend[Frontend Container<br/>:3000 internal]
            Proxy -->|proxies /api| Backend[Backend Container<br/>:3001 internal]

            Backend -->|reads/writes| Volume[Docker Volume<br/>crudibase.db]
        end
    end

    Backend -.->|caches| Volume
    Backend -->|fetches| Wikidata[Wikidata REST API]

    style Proxy fill:#e1f5ff,stroke:#01579b,stroke-width:3px
    style Frontend fill:#fff4e1
    style Backend fill:#e8f5e9
    style Volume fill:#f3e5f5
    style Wikidata fill:#fce4ec
```

**Key Points:**
- **SSL Proxy** runs from separate repository ([ssl-proxy-for-do](https://github.com/softwarewrighter/ssl-proxy-for-do))
- **No external ports** exposed by application containers
- **Internal Docker network** for communication
- **SSL termination** handled by nginx with Let's Encrypt
- **Database persistence** via Docker volume

### Development Setup

```mermaid
graph LR
    Dev[Developer] -->|localhost:80| DevProxy[Dev Proxy<br/>nginx - no SSL]

    DevProxy -->|:3000| Frontend[Frontend<br/>Vite dev server]
    DevProxy -->|:3001| Backend[Backend<br/>nodemon]

    Backend -->|queries| DB[(Local SQLite<br/>dev.db)]

    style DevProxy fill:#e1f5ff
    style Frontend fill:#fff4e1
    style Backend fill:#e8f5e9
    style DB fill:#f3e5f5
```

**Development Features:**
- Optional **dev proxy** for testing production-like routing
- **Hot reload** on both frontend and backend
- **In-memory database** option for testing
- **Direct port access** (3000, 3001) without proxy

## Application Layers

### Frontend Layer (React SPA)

```mermaid
graph TB
    subgraph "Frontend - Port 3000"
        Router[React Router] --> Pages
        Pages[Pages] --> Components
        Components[Components] --> Hooks[Custom Hooks]

        Pages --> AuthPages[Auth Pages<br/>Login, Register]
        Pages --> Dashboard[Dashboard]
        Pages --> Search[Search Page]
        Pages --> Collections[Collections Pages]

        Components --> Forms[Form Components]
        Components --> UI[UI Components]

        Hooks --> AuthHook[useAuth]
        Hooks --> APIHooks[API Hooks]
    end

    Components -->|API calls| Backend[Backend API]

    style Router fill:#e3f2fd
    style Pages fill:#fff4e1
    style Components fill:#ffe0b2
    style Hooks fill:#ffccbc
```

**Organization:**
- `src/frontend/src/App.tsx` - Root component with routing
- `src/frontend/src/pages/` - Page-level components
- `src/frontend/src/components/` - Reusable UI components
- `src/frontend/src/hooks/` - Custom React hooks (planned)
- `src/frontend/src/test/` - Test utilities

### Backend Layer (Express API)

```mermaid
graph TB
    subgraph "Backend - Port 3001"
        Entry[Express App<br/>index.ts] --> Middleware

        Middleware[Middleware Layer] --> Auth[JWT Auth]
        Middleware --> Validation[Zod Validation]
        Middleware --> ErrorHandler[Error Handler]

        Middleware --> Routes[Route Layer]

        Routes --> AuthRoutes[/api/auth/*]
        Routes --> UserRoutes[/api/user/*]
        Routes --> WikiRoutes[/api/wikibase/*]
        Routes --> CollRoutes[/api/collections/*]

        Routes --> Services[Service Layer]

        Services --> AuthService[AuthService]
        Services --> WikiService[WikibaseService]

        Services --> Models[Model Layer]

        Models --> User[User Model]
        Models --> Collection[Collection Model]

        Models --> DB[(SQLite Database)]
    end

    Services -.->|caching| DB
    Services -->|external API| Wikidata[Wikidata]

    style Entry fill:#e8f5e9
    style Middleware fill:#c8e6c9
    style Routes fill:#a5d6a7
    style Services fill:#81c784
    style Models fill:#66bb6a
    style DB fill:#f3e5f5
```

**Organization:**
- `src/backend/src/index.ts` - Express app setup
- `src/backend/src/routes/` - HTTP route handlers
- `src/backend/src/services/` - Business logic
- `src/backend/src/models/` - Data access layer
- `src/backend/src/utils/` - Utilities (DB, JWT, validation)

### Service Layer Pattern

The backend uses a **Service Layer Pattern** to separate concerns:

```mermaid
sequenceDiagram
    participant Client
    participant Route
    participant Service
    participant Model
    participant DB

    Client->>Route: HTTP Request
    Route->>Route: Validate input (Zod)
    Route->>Service: Call service method
    Service->>Service: Business logic
    Service->>Model: Data operation
    Model->>DB: SQL query
    DB-->>Model: Result
    Model-->>Service: Processed data
    Service-->>Route: Return data
    Route-->>Client: HTTP Response (JSON)
```

**Benefits:**
- **Routes** handle HTTP only (validation, response formatting)
- **Services** contain business logic (reusable, testable)
- **Models** handle data access (SQL abstraction)
- Easy to test each layer independently

## Component Interactions

### Request Flow

```mermaid
graph LR
    User[User Action] -->|1. Click/Submit| Frontend

    subgraph "Frontend"
        Frontend[Component] -->|2. Validate| Form
        Form -->|3. API call| Axios[Axios/Fetch]
    end

    Axios -->|4. HTTP + JWT| Backend

    subgraph "Backend"
        Backend[Route Handler] -->|5. Auth check| JWT[JWT Middleware]
        JWT -->|6. Validate| Zod[Zod Schema]
        Zod -->|7. Execute| Service[Service Layer]
        Service -->|8. Query| Model[Model Layer]
    end

    Model -->|9. SQL| DB[(Database)]
    DB -->|10. Result| Model
    Model -->|11. Data| Service
    Service -->|12. Format| Backend
    Backend -->|13. JSON| Frontend
    Frontend -->|14. Update UI| User

    style Frontend fill:#fff4e1
    style Backend fill:#e8f5e9
    style Service fill:#81c784
    style DB fill:#f3e5f5
```

### Data Flow Patterns

**Pattern 1: Authenticated API Request**
```
Frontend → JWT in header → Backend verifies → Service executes → Model queries DB → Response
```

**Pattern 2: Wikibase Search with Caching**
```
Frontend → Backend → Check cache → [Cache miss] → Fetch from Wikidata → Store in cache → Response
```

**Pattern 3: Collection Operations**
```
Frontend → Backend → Verify ownership → Update DB → Invalidate cache if needed → Response
```

## Technology Stack

### Frontend Technologies

```mermaid
mindmap
  root((Frontend))
    Framework
      React 18
      TypeScript
    Build
      Vite
      esbuild
    Styling
      Tailwind CSS
      PostCSS
    Routing
      React Router v6
    HTTP
      Axios
      JWT in headers
    Testing
      Vitest
      React Testing Library
      Playwright
```

### Backend Technologies

```mermaid
mindmap
  root((Backend))
    Runtime
      Node.js 22 LTS
    Framework
      Express.js
      TypeScript
    Database
      SQLite3
      better-sqlite3
    Authentication
      JWT jsonwebtoken
      bcrypt cost 12
    Validation
      Zod schemas
    Testing
      Vitest
      Supertest
```

## Security Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant DB

    User->>Frontend: Enter credentials
    Frontend->>Backend: POST /api/auth/login
    Backend->>DB: Find user by email
    DB-->>Backend: User record
    Backend->>Backend: Compare password hash<br/>(bcrypt)
    Backend->>Backend: Generate JWT<br/>(1 hour expiry)
    Backend-->>Frontend: Return JWT + user
    Frontend->>Frontend: Store JWT in localStorage
    Frontend-->>User: Redirect to dashboard

    Note over Frontend,Backend: Subsequent requests include JWT in header
```

### Security Layers

```mermaid
graph TB
    subgraph "Network Security"
        SSL[HTTPS/TLS<br/>Let's Encrypt]
    end

    subgraph "Application Security"
        Auth[JWT Authentication<br/>1 hour expiry]
        Hash[Password Hashing<br/>bcrypt cost 12]
        Validate[Input Validation<br/>Zod schemas]
        SQL[SQL Injection Prevention<br/>Parameterized queries]
    end

    subgraph "Data Security"
        Ownership[Resource Ownership<br/>User ID checks]
        Privacy[Private by default<br/>Collections]
    end

    SSL --> Auth
    Auth --> Hash
    Auth --> Validate
    Validate --> SQL
    Validate --> Ownership
    Ownership --> Privacy

    style SSL fill:#e1f5ff
    style Auth fill:#fff4e1
    style Hash fill:#f3e5f5
    style Validate fill:#e8f5e9
```

**Security Measures:**
1. **Transport**: HTTPS with Let's Encrypt certificates
2. **Authentication**: JWT with 1-hour expiration
3. **Passwords**: bcrypt hashing with cost factor 12
4. **Input Validation**: Zod schemas on all inputs
5. **SQL Injection**: Parameterized queries (better-sqlite3)
6. **XSS Protection**: React's built-in escaping
7. **CSRF**: SameSite cookies (planned)
8. **Authorization**: User ID verification on all operations

## Performance Considerations

### Caching Strategy

```mermaid
graph LR
    Request[Search Request] --> Check{Cache<br/>exists?}
    Check -->|Yes| Return[Return cached<br/>results]
    Check -->|No| Fetch[Fetch from<br/>Wikidata]
    Fetch --> Store[Store in<br/>search_cache]
    Store --> Return
    Return --> Response[HTTP Response]

    style Check fill:#fff4e1
    style Fetch fill:#e1f5ff
    style Store fill:#f3e5f5
    style Return fill:#e8f5e9
```

**Cache Implementation:**
- **Location**: SQLite `search_cache` table
- **Key**: SHA-256 hash of query
- **TTL**: Configurable expiration
- **Invalidation**: Automatic on expiry

### Database Optimization

- **SQLite in WAL mode** for better concurrency
- **Indexes** on frequently queried fields
- **Connection pooling** in application layer
- **Prepared statements** for query performance

## Scalability Path

### Current (MVP - SQLite)
```
Single server → SQLite file → Handles 100s of users
```

### Future (If needed)
```mermaid
graph TB
    LB[Load Balancer] --> App1[App Instance 1]
    LB --> App2[App Instance 2]
    LB --> App3[App Instance 3]

    App1 --> PG[(PostgreSQL<br/>Primary)]
    App2 --> PG
    App3 --> PG

    PG --> Replica[(Read Replica)]

    App1 -.->|cache| Redis[(Redis<br/>Session Store)]
    App2 -.->|cache| Redis
    App3 -.->|cache| Redis

    style LB fill:#e1f5ff
    style App1 fill:#e8f5e9
    style App2 fill:#e8f5e9
    style App3 fill:#e8f5e9
    style PG fill:#f3e5f5
```

**Migration Path:**
1. Keep SQLite for MVP (sufficient for 100s of users)
2. If needed: Migrate to PostgreSQL for multi-instance support
3. Add Redis for session storage and caching
4. Implement horizontal scaling with load balancer

## Related Pages

- [[Deployment-Architecture]] - Detailed deployment setup
- [[Database-Schema]] - Database design and models
- [[Authentication-Flow]] - Detailed auth sequences
- [[API-Reference]] - API endpoint documentation

---

**Last Updated**: 2025-11-17
