# Implementation Plan

## Overview

This document outlines the implementation roadmap for Crudibase, broken down into phases, sprints, and specific tasks. The plan follows Test-Driven Development (TDD) principles and prioritizes delivering working features incrementally.

## Timeline

- **Phase 1 (MVP)**: 8-10 weeks (Sprints 1-5)
- **Phase 2 (Enhanced Discovery)**: 6-8 weeks (Sprints 6-9)
- **Phase 3 (Advanced Features)**: 8-10 weeks (Sprints 10-13)

**Total Estimated Time**: ~6 months

## Phase 1: MVP (Core Features)

### Sprint 0: Project Setup (Week 1)

#### Backend Setup
- [ ] Initialize Node.js project with Express
- [ ] Configure TypeScript (tsconfig.json)
- [ ] Setup SQLite3 database with better-sqlite3
- [ ] Configure Vitest for backend testing
- [ ] Setup ESLint + Prettier
- [ ] Create database schema with migrations
- [ ] Setup environment variables (.env)
- [ ] Create basic Express server with health check endpoint
- [ ] Write tests: health check endpoint

**Deliverable**: Working backend server on port 3001 with database

#### Frontend Setup
- [ ] Initialize React project with Vite
- [ ] Configure TypeScript
- [ ] Setup React Router v6
- [ ] Configure Vitest + React Testing Library
- [ ] Setup Playwright for E2E tests
- [ ] Configure Tailwind CSS or Material-UI
- [ ] Create basic app structure (App.tsx, routes)
- [ ] Setup Axios for API calls
- [ ] Write tests: basic routing

**Deliverable**: Working React SPA on port 3000

#### DevOps Setup
- [ ] Create npm scripts for dev/build/test
- [ ] Setup pre-commit hooks (Husky + lint-staged)
- [ ] Create .gitignore
- [ ] Setup Playwright MCP connection
- [ ] Document setup in README.md

**Deliverable**: Automated development workflow

---

### Sprint 1: User Registration (Week 2)

#### Backend
- [ ] **TDD**: Write tests for registration endpoint
- [ ] Create User model and table
- [ ] Implement password hashing (bcrypt)
- [ ] Create POST /api/auth/register endpoint
- [ ] Implement email validation
- [ ] Implement password strength validation
- [ ] Handle duplicate email errors
- [ ] Write integration tests with Supertest

**Files**: `src/models/User.ts`, `src/routes/auth.ts`, `src/services/AuthService.ts`

#### Frontend
- [ ] **TDD**: Write tests for RegisterForm component
- [ ] Create RegisterForm component
- [ ] Implement form validation (React Hook Form + Zod)
- [ ] Create password strength indicator
- [ ] Add error display
- [ ] Create /register route
- [ ] Connect to backend API
- [ ] Write component tests (React Testing Library)
- [ ] Write E2E test: successful registration (Playwright)
- [ ] Write E2E test: validation errors (Playwright)

**Files**: `src/components/auth/RegisterForm.tsx`, `src/pages/RegisterPage.tsx`

**Deliverable**: Users can register with email/password

---

### Sprint 2: User Login & JWT (Week 3)

#### Backend
- [ ] **TDD**: Write tests for login endpoint
- [ ] Create Session model and table
- [ ] Implement JWT generation (jsonwebtoken)
- [ ] Create POST /api/auth/login endpoint
- [ ] Verify password with bcrypt
- [ ] Generate and return JWT
- [ ] Create authentication middleware
- [ ] Write integration tests for login
- [ ] Write tests for protected routes

**Files**: `src/middleware/auth.ts`, `src/services/JWTService.ts`

#### Frontend
- [ ] **TDD**: Write tests for LoginForm component
- [ ] Create LoginForm component
- [ ] Create authentication context (AuthContext)
- [ ] Implement token storage (memory + httpOnly cookie)
- [ ] Create /login route
- [ ] Implement automatic token refresh
- [ ] Create ProtectedRoute component
- [ ] Add "Remember me" checkbox
- [ ] Write E2E test: successful login (Playwright)
- [ ] Write E2E test: invalid credentials (Playwright)

**Files**: `src/components/auth/LoginForm.tsx`, `src/context/AuthContext.tsx`

**Deliverable**: Users can log in and access protected routes

---

### Sprint 3: Logout & Password Reset (Week 4)

#### Backend
- [ ] **TDD**: Write tests for logout endpoint
- [ ] Create POST /api/auth/logout endpoint
- [ ] Implement session invalidation
- [ ] **TDD**: Write tests for forgot password
- [ ] Create POST /api/auth/forgot-password endpoint
- [ ] Generate password reset token
- [ ] Store reset token in database
- [ ] Mock email sending (console.log for now)
- [ ] **TDD**: Write tests for reset password
- [ ] Create POST /api/auth/reset-password endpoint
- [ ] Verify reset token
- [ ] Update password
- [ ] Invalidate reset token

**Files**: `src/services/EmailService.ts` (mock)

#### Frontend
- [ ] **TDD**: Write tests for logout functionality
- [ ] Implement logout button in navigation
- [ ] Clear auth state on logout
- [ ] Redirect to login page
- [ ] **TDD**: Write tests for ForgotPasswordForm
- [ ] Create ForgotPasswordForm component
- [ ] Create /forgot-password route
- [ ] **TDD**: Write tests for ResetPasswordForm
- [ ] Create ResetPasswordForm component
- [ ] Create /reset-password/:token route
- [ ] Write E2E test: complete password reset flow (Playwright)

**Files**: `src/components/auth/ForgotPasswordForm.tsx`, `src/components/auth/ResetPasswordForm.tsx`

**Deliverable**: Complete authentication workflow

---

### Sprint 4: Basic Wikibase Search (Week 5-6)

#### Backend
- [ ] **TDD**: Write tests for Wikibase API integration
- [ ] Create WikibaseService for API calls
- [ ] Implement Wikibase entity search
- [ ] Create GET /api/wikibase/search endpoint
- [ ] Implement response caching (SearchCache table)
- [ ] Handle rate limiting
- [ ] Parse and format Wikibase responses
- [ ] Write integration tests

**Files**: `src/services/WikibaseService.ts`, `src/routes/wikibase.ts`

#### Frontend
- [ ] **TDD**: Write tests for SearchBar component
- [ ] Create SearchBar component with debouncing
- [ ] Create SearchResults component
- [ ] Create EntityCard component
- [ ] Create /search route
- [ ] Implement loading states
- [ ] Implement error handling
- [ ] Add pagination ("Load More" button)
- [ ] Write E2E test: search for entity (Playwright)
- [ ] Write E2E test: view search results (Playwright)

**Files**: `src/components/search/SearchBar.tsx`, `src/components/entity/EntityCard.tsx`

**Deliverable**: Users can search Wikibase and view results

---

### Sprint 5: Entity Details & Collections (Week 7-8)

#### Backend
- [ ] **TDD**: Write tests for entity details endpoint
- [ ] Create GET /api/wikibase/entity/:id endpoint
- [ ] Parse entity properties and relationships
- [ ] Create Collection model and table
- [ ] Create CollectionItem model and table
- [ ] **TDD**: Write tests for collections CRUD
- [ ] Create GET /api/collections endpoint
- [ ] Create POST /api/collections endpoint
- [ ] Create POST /api/collections/:id/items endpoint
- [ ] Create DELETE /api/collections/:id/items/:itemId endpoint
- [ ] Write integration tests for all endpoints

**Files**: `src/models/Collection.ts`, `src/services/CollectionService.ts`

#### Frontend
- [ ] **TDD**: Write tests for EntityDetailPage
- [ ] Create EntityDetailPage component
- [ ] Create EntityPropertyTable component
- [ ] Create /entity/:id route
- [ ] Add "Save to Collection" button
- [ ] **TDD**: Write tests for Collections page
- [ ] Create CollectionsPage component
- [ ] Create CollectionGrid component
- [ ] Create CollectionCard component
- [ ] Create /collections route
- [ ] Create "New Collection" modal
- [ ] Write E2E test: view entity details (Playwright)
- [ ] Write E2E test: create collection (Playwright)
- [ ] Write E2E test: save entity to collection (Playwright)

**Files**: `src/pages/EntityDetailPage.tsx`, `src/pages/CollectionsPage.tsx`

**Deliverable**: Users can view entity details and manage collections

---

### Sprint 5.5: MVP Polish & Testing (Week 9-10)

#### Backend
- [ ] Add rate limiting middleware
- [ ] Implement API input validation
- [ ] Add comprehensive error handling
- [ ] Write additional edge case tests
- [ ] Performance testing (load time, query optimization)
- [ ] Security audit (SQL injection, XSS prevention)

#### Frontend
- [ ] Create Home/Dashboard page
- [ ] Create Settings page
- [ ] Add navigation menu
- [ ] Implement responsive design (mobile/tablet)
- [ ] Add loading skeletons
- [ ] Add toast notifications
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Write E2E test: complete user journey (Playwright)
- [ ] Fix any bugs found during testing

#### Documentation
- [ ] Update README with setup instructions
- [ ] Create API documentation
- [ ] Create user guide
- [ ] Document known issues

**Deliverable**: Production-ready MVP

---

## Phase 2: Enhanced Discovery (Sprints 6-9)

### Sprint 6: Relationship Graph Visualizer (Week 11-12)

#### Backend
- [ ] **TDD**: Write tests for relationship graph endpoint
- [ ] Create GET /api/wikibase/relationships/:id endpoint
- [ ] Implement graph traversal (BFS, configurable depth)
- [ ] Filter by relationship types
- [ ] Format graph data (nodes + edges)
- [ ] Cache graph queries

**Files**: `src/services/GraphService.ts`

#### Frontend
- [ ] **TDD**: Write tests for RelationshipGraph component
- [ ] Research graph visualization library (D3.js, vis.js, or react-force-graph)
- [ ] Create RelationshipGraph component
- [ ] Implement zoom, pan controls
- [ ] Add node click handler (open entity)
- [ ] Add expand/collapse nodes
- [ ] Create filter controls
- [ ] Create /entity/:id/graph route
- [ ] Write E2E test: explore relationship graph (Playwright)

**Files**: `src/components/graph/RelationshipGraph.tsx`

**Deliverable**: Interactive relationship graph explorer

---

### Sprint 7: Timeline Visualizer (Week 13-14)

#### Backend
- [ ] **TDD**: Write tests for timeline data endpoint
- [ ] Create GET /api/wikibase/timeline endpoint
- [ ] Filter entities with date properties
- [ ] Sort by date
- [ ] Support date range queries

#### Frontend
- [ ] **TDD**: Write tests for Timeline component
- [ ] Research timeline library (vis-timeline or react-chrono)
- [ ] Create Timeline component
- [ ] Display entities on timeline
- [ ] Add date range filter
- [ ] Add entity type filter
- [ ] Create /timeline route
- [ ] Write E2E test: view timeline (Playwright)

**Files**: `src/components/timeline/Timeline.tsx`

**Deliverable**: Historical timeline visualization

---

### Sprint 8: Entity Comparison Tool (Week 15-16)

#### Backend
- [ ] **TDD**: Write tests for comparison endpoint
- [ ] Create POST /api/wikibase/compare endpoint
- [ ] Accept array of entity IDs
- [ ] Return normalized property comparison
- [ ] Highlight common/unique properties

#### Frontend
- [ ] **TDD**: Write tests for ComparisonTable component
- [ ] Create ComparisonTable component
- [ ] Create entity selector (multi-select)
- [ ] Display side-by-side comparison
- [ ] Highlight differences
- [ ] Add export to CSV
- [ ] Create /compare route
- [ ] Write E2E test: compare entities (Playwright)

**Files**: `src/components/comparison/ComparisonTable.tsx`

**Deliverable**: Side-by-side entity comparison

---

### Sprint 9: No-Code Query Builder (Week 17-18)

#### Backend
- [ ] **TDD**: Write tests for SPARQL generation
- [ ] Create query builder service
- [ ] Generate SPARQL from visual query
- [ ] Execute SPARQL queries against Wikibase
- [ ] Create POST /api/wikibase/query endpoint
- [ ] Save user queries to database

#### Frontend
- [ ] **TDD**: Write tests for QueryBuilder component
- [ ] Create QueryBuilder component (drag-and-drop)
- [ ] Create query templates
- [ ] Preview generated SPARQL
- [ ] Execute query and display results
- [ ] Save/load queries
- [ ] Create /query-builder route
- [ ] Write E2E test: build and execute query (Playwright)

**Files**: `src/components/query/QueryBuilder.tsx`

**Deliverable**: Visual SPARQL query builder

---

## Phase 3: Advanced Features (Sprints 10-13)

### Sprint 10: Trending Dashboard (Week 19-20)

#### Backend
- [ ] **TDD**: Write tests for analytics tracking
- [ ] Create SearchLog table
- [ ] Track search queries and entity views
- [ ] Create GET /api/analytics/trending endpoint
- [ ] Calculate trending entities
- [ ] Implement time-based aggregation

#### Frontend
- [ ] **TDD**: Write tests for TrendingDashboard
- [ ] Create TrendingDashboard component
- [ ] Display trending entities
- [ ] Add "Random Discovery" button
- [ ] Show personalized recommendations
- [ ] Update Home page with dashboard
- [ ] Write E2E test: view trending (Playwright)

**Files**: `src/pages/DashboardPage.tsx`

**Deliverable**: Trending and discovery dashboard

---

### Sprint 11: Public Collections & Sharing (Week 21-22)

#### Backend
- [ ] **TDD**: Write tests for public collections
- [ ] Add is_public flag to collections
- [ ] Create GET /api/collections/public endpoint
- [ ] Create GET /api/collections/shared/:shareId endpoint
- [ ] Generate shareable links
- [ ] Implement collection views counter

#### Frontend
- [ ] **TDD**: Write tests for collection sharing
- [ ] Add "Make Public" toggle
- [ ] Generate share link
- [ ] Create public collection view
- [ ] Add social sharing buttons
- [ ] Create /collections/public route
- [ ] Write E2E test: share collection (Playwright)

**Files**: `src/pages/PublicCollectionPage.tsx`

**Deliverable**: Shareable public collections

---

### Sprint 12: Data Export & API Access (Week 23-24)

#### Backend
- [ ] **TDD**: Write tests for export endpoints
- [ ] Create GET /api/export/collection/:id endpoint
- [ ] Support JSON, CSV, RDF formats
- [ ] Create personal API keys
- [ ] Document REST API for programmatic access

#### Frontend
- [ ] **TDD**: Write tests for export functionality
- [ ] Add export buttons to collections
- [ ] Create format selector (JSON/CSV/RDF)
- [ ] Create API key management UI
- [ ] Add API documentation page
- [ ] Write E2E test: export collection (Playwright)

**Files**: `src/pages/ApiDocsPage.tsx`

**Deliverable**: Data export and API access

---

### Sprint 13: Google OAuth Integration (Week 25-26)

#### Backend
- [ ] **TDD**: Write tests for OAuth flow
- [ ] Setup Google OAuth credentials
- [ ] Create GET /api/auth/google callback endpoint
- [ ] Link OAuth accounts to existing users
- [ ] Store OAuth tokens encrypted
- [ ] Update authentication middleware

#### Frontend
- [ ] **TDD**: Write tests for OAuth flow
- [ ] Add "Sign in with Google" button
- [ ] Implement OAuth redirect flow
- [ ] Handle OAuth errors
- [ ] Update settings page (linked accounts)
- [ ] Write E2E test: OAuth login (Playwright)

**Files**: `src/services/OAuthService.ts`

**Deliverable**: Google OAuth authentication

---

## Testing Strategy per Sprint

### Red/Green/Refactor Cycle (TDD)

Each feature follows this pattern:

1. **RED**: Write failing tests first
   - Backend: Vitest unit tests + Supertest integration tests
   - Frontend: Vitest + React Testing Library tests
2. **GREEN**: Write minimal code to pass tests
3. **REFACTOR**: Clean up code, optimize, add documentation

### E2E Testing with Playwright

At the end of each sprint:
- Write Playwright E2E tests for user workflows
- Use Playwright MCP to debug failing tests
- Verify features work end-to-end in browser

### Pre-Commit Checks

Before every commit:
1. Run `npm run format` (Prettier)
2. Run `npm run lint` (ESLint)
3. Run `npm run test` (all tests pass)
4. Run `npm run build` (builds successfully)
5. Update documentation if APIs changed

Automated via Husky pre-commit hook.

---

## Definition of Done (DoD)

A task/story is "done" when:

- [ ] Code written and passes tests (RED → GREEN → REFACTOR)
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Integration tests written (if applicable)
- [ ] E2E test written with Playwright (for user-facing features)
- [ ] Code reviewed (self-review or peer review)
- [ ] Code formatted (Prettier) and linted (ESLint)
- [ ] Builds successfully (`npm run build`)
- [ ] Documentation updated (README, API docs, inline comments)
- [ ] Feature verified in browser (manual testing)
- [ ] Playwright MCP used to verify/debug UI (if applicable)
- [ ] No critical bugs
- [ ] Committed to git with descriptive message

---

## Risk Mitigation

### Technical Risks

| Risk | Mitigation |
|------|-----------|
| Wikibase API rate limits | Implement aggressive caching, optional user API tokens |
| SQLite scalability | Use WAL mode, consider PostgreSQL migration path |
| Complex graph visualization | Use proven libraries (D3.js, vis.js), limit depth |
| OAuth integration complexity | Start simple (Google only), use Passport.js |

### Schedule Risks

| Risk | Mitigation |
|------|-----------|
| Underestimated complexity | 20% buffer built into estimates, prioritize ruthlessly |
| Scope creep | Strict sprint planning, defer non-MVP features |
| Testing takes longer than coding | Automate with Playwright, parallelize test runs |

### Quality Risks

| Risk | Mitigation |
|------|-----------|
| Bugs slip into production | TDD + E2E testing, staging environment |
| Security vulnerabilities | Security audit after Phase 1, follow OWASP guidelines |
| Poor performance | Performance testing in Sprint 5.5, optimize early |

---

## Deployment Plan

### Staging Environment (After Sprint 5)
- Deploy to staging server
- Test with real Wikibase API
- Invite beta testers
- Gather feedback

### Production Deployment (After Sprint 5.5)
- Deploy to production server
- Setup Let's Encrypt HTTPS
- Configure PM2 for process management
- Setup daily database backups
- Monitor with logging (Winston + Sentry)

### Continuous Deployment (Phase 2+)
- Automate deployments with GitHub Actions
- Blue-green deployment strategy
- Automatic rollback on errors

---

## Success Metrics (Review After Each Phase)

### Phase 1 (MVP)
- [ ] All authentication flows work (register, login, logout, reset)
- [ ] Users can search Wikibase and get results in <2 seconds
- [ ] Users can create collections and save entities
- [ ] Zero critical bugs
- [ ] 5+ beta testers provide positive feedback

### Phase 2 (Enhanced Discovery)
- [ ] Relationship graph renders in <3 seconds
- [ ] Timeline visualization works for historical entities
- [ ] Comparison tool supports 2-4 entities
- [ ] Query builder generates valid SPARQL
- [ ] User engagement increases (session length, return rate)

### Phase 3 (Advanced Features)
- [ ] Trending dashboard updates daily
- [ ] Users share public collections
- [ ] Data export works for all formats
- [ ] OAuth login success rate >95%
- [ ] 50+ DAU (Daily Active Users)

---

## Next Steps

1. Review this plan with stakeholders
2. Finalize tech stack choices (UI library, graph library)
3. Setup development environment (Sprint 0)
4. Begin Sprint 1: User Registration

**Last Updated**: 2025-01-15
