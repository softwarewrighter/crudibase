# Design Document

## UI/UX Design

### Design Principles

1. **Clarity First**: Information-dense but never cluttered
2. **Progressive Disclosure**: Advanced features hidden until needed
3. **Feedback Everywhere**: Loading states, success/error messages, tooltips
4. **Accessibility**: Keyboard navigation, screen reader support, high contrast
5. **Performance**: Perceived speed through optimistic updates and skeletons

### Color Palette

```
Primary: #2563EB (Blue 600) - Actions, links, CTAs
Secondary: #7C3AED (Purple 600) - Highlights, accents
Success: #059669 (Green 600) - Confirmations
Error: #DC2626 (Red 600) - Errors, destructive actions
Warning: #D97706 (Amber 600) - Warnings
Neutral: #64748B (Slate 500) - Text, borders
Background: #F8FAFC (Slate 50) - Page background
Surface: #FFFFFF - Cards, panels
```

### Typography

```
Headings: Inter, system-ui, sans-serif
Body: Inter, system-ui, sans-serif
Monospace: 'JetBrains Mono', 'Fira Code', monospace (for entity IDs, JSON)

Sizes:
h1: 2.25rem (36px) - Page titles
h2: 1.875rem (30px) - Section headers
h3: 1.5rem (24px) - Subsections
h4: 1.25rem (20px) - Card titles
body: 1rem (16px) - Main content
small: 0.875rem (14px) - Captions, metadata
```

## Page Layouts

### 1. Authentication Pages

#### Login Page (`/login`)
```
┌─────────────────────────────────────────────┐
│  [Logo] Crudibase                           │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │   Sign In                             │ │
│  │                                       │ │
│  │   Email: [________________]           │ │
│  │   Password: [________________]        │ │
│  │                                       │ │
│  │   [ ] Remember me                     │ │
│  │                                       │ │
│  │   [    Sign In    ]                   │ │
│  │                                       │ │
│  │   Forgot password? | Create account   │ │
│  │                                       │ │
│  │   ─────── OR ───────                  │ │
│  │   [🔵 Sign in with Google]            │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

#### Register Page (`/register`)
```
┌─────────────────────────────────────────────┐
│  [Logo] Crudibase                           │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │   Create Account                      │ │
│  │                                       │ │
│  │   Email: [________________]           │ │
│  │   Password: [________________]        │ │
│  │   Confirm: [________________]         │ │
│  │                                       │ │
│  │   Password strength: [████░░░░] Weak  │ │
│  │                                       │ │
│  │   [ ] I agree to Terms of Service     │ │
│  │                                       │ │
│  │   [    Create Account    ]            │ │
│  │                                       │ │
│  │   Already have an account? Sign in    │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

#### Forgot Password (`/forgot-password`)
```
┌─────────────────────────────────────────────┐
│  [Logo] Crudibase                           │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │   Reset Password                      │ │
│  │                                       │ │
│  │   Enter your email and we'll send     │ │
│  │   you a reset link.                   │ │
│  │                                       │ │
│  │   Email: [________________]           │ │
│  │                                       │ │
│  │   [    Send Reset Link    ]           │ │
│  │                                       │ │
│  │   Back to sign in                     │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 2. Main Application Layout (Authenticated)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] Crudibase    [Search: _________]  👤 Profile ▾      │
├─────────────────────────────────────────────────────────────┤
│  🏠 Home  🔍 Search  📊 Collections  🔗 Graph  ⚙️ Settings  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    (Page Content Area)                      │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Home/Dashboard (`/`)

```
┌─────────────────────────────────────────────────────────────┐
│  Welcome back, Sarah!                                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Quick Search     │  │ Your Collections │                │
│  │                  │  │                  │                │
│  │ [___________] 🔍 │  │ • Favorite Sci.. │                │
│  │                  │  │ • Historical ... │                │
│  │ Try: "Einstein"  │  │ • To Research    │                │
│  │      "DNA"       │  │                  │                │
│  │      "Tokyo"     │  │ [View All]       │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Trending Today                                       │  │
│  │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                 │  │
│  │ │ Q123 │ │ Q456 │ │ Q789 │ │ Q012 │                 │  │
│  │ │[img] │ │[img] │ │[img] │ │[img] │                 │  │
│  │ │Item1 │ │Item2 │ │Item3 │ │Item4 │                 │  │
│  │ └──────┘ └──────┘ └──────┘ └──────┘                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Recent Activity                                      │  │
│  │ • You saved "Marie Curie" to "Favorite Scientists"   │  │
│  │ • You searched "Quantum mechanics" (2 hours ago)     │  │
│  │ • You created collection "To Research" (yesterday)   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 4. Search Results (`/search?q=einstein`)

```
┌─────────────────────────────────────────────────────────────┐
│  Search: "einstein"                         [Filters ▾]     │
├─────────────────────────────────────────────────────────────┤
│  Found 147 results                                          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [img] Albert Einstein (Q937)                    ⭐    │  │
│  │       Theoretical physicist (1879-1955)               │  │
│  │       Known for: theory of relativity, E=mc²...      │  │
│  │       [View Details] [Save to Collection]            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [img] Einstein Observatory (Q171182)            ⭐    │  │
│  │       X-ray telescope (1978-1981)                     │  │
│  │       Space telescope operated by NASA                │  │
│  │       [View Details] [Save to Collection]            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [Load More Results...]                                     │
└─────────────────────────────────────────────────────────────┘
```

### 5. Entity Detail Page (`/entity/Q937`)

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Search                                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  Albert Einstein (Q937)               ⭐ Save  │
│  │  [img]  │                                                │
│  │         │  Theoretical physicist                         │
│  └─────────┘  Born: March 14, 1879, Ulm, Germany           │
│                Died: April 18, 1955, Princeton, NJ, USA     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Properties] [Relationships] [Timeline]                    │
├─────────────────────────────────────────────────────────────┤
│  Properties                                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Occupation:      physicist, university teacher        │  │
│  │ Field of work:   theoretical physics                  │  │
│  │ Notable works:   special relativity, general...       │  │
│  │ Awards:          Nobel Prize in Physics (1921)        │  │
│  │ Influenced by:   Isaac Newton, James Clerk Maxwell    │  │
│  │ Influenced:      many physicists (see graph) →        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [Explore Relationships Graph] [Compare with...] [Export]  │
└─────────────────────────────────────────────────────────────┘
```

### 6. Relationship Graph View (`/entity/Q937/graph`)

```
┌─────────────────────────────────────────────────────────────┐
│  Albert Einstein - Relationship Graph                       │
│  Filter: [All ▾] Depth: [2 ▾]  [Expand All] [Collapse All] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│           [Isaac Newton]                                    │
│                  │                                          │
│            influenced by                                    │
│                  │                                          │
│                  ↓                                          │
│          [Albert Einstein] ← educated at → [ETH Zurich]    │
│           /      |      \                                   │
│      influenced  won     worked at                          │
│         /        |         \                                │
│        ↓         ↓          ↓                               │
│   [Physicist1] [Nobel]  [Princeton]                         │
│   [Physicist2]  1921    University                          │
│                                                             │
│  [Legend: □ Person  ○ Place  ◇ Award  ▽ Work]              │
└─────────────────────────────────────────────────────────────┘
```

### 7. Collections Page (`/collections`)

```
┌─────────────────────────────────────────────────────────────┐
│  My Collections                        [+ New Collection]    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📚 Favorite Scientists (12 items)          [Edit] 🗑  │  │
│  │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                 │  │
│  │ │[img] │ │[img] │ │[img] │ │[img] │  +8 more         │  │
│  │ │Alice │ │Bob   │ │Carol │ │Dave  │                  │  │
│  │ └──────┘ └──────┘ └──────┘ └──────┘                 │  │
│  │ Last updated: 2 hours ago                            │  │
│  │ [View Details] [Share] [Export]                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🏛️ Historical Figures (8 items)           [Edit] 🗑  │  │
│  │ ...                                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🔬 To Research (5 items)                  [Edit] 🗑  │  │
│  │ ...                                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 8. Settings Page (`/settings`)

```
┌─────────────────────────────────────────────────────────────┐
│  Settings                                                   │
├─────────────────────────────────────────────────────────────┤
│  [Profile] [Security] [API Tokens] [Preferences]            │
├─────────────────────────────────────────────────────────────┤
│  Profile                                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Email: sarah@example.com                             │  │
│  │ [Change Email]                                       │  │
│  │                                                      │  │
│  │ Joined: January 15, 2025                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Security                                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Password: ••••••••                                   │  │
│  │ [Change Password]                                    │  │
│  │                                                      │  │
│  │ Two-Factor Authentication: ⚠️ Not enabled            │  │
│  │ [Enable 2FA] (Coming soon)                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  API Tokens (Optional)                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Wikibase Token: Not configured                       │  │
│  │ [Add Token]                                          │  │
│  │                                                      │  │
│  │ ℹ️ Most features work without a token. Add one for  │  │
│  │   higher rate limits and advanced features.          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Design

### Key React Components

#### 1. AuthForm
```typescript
interface AuthFormProps {
  mode: 'login' | 'register' | 'forgot' | 'reset';
  onSubmit: (data: AuthData) => Promise<void>;
  onModeChange?: (mode: string) => void;
}
```
**Features**: Form validation, password strength indicator, error display, loading state

#### 2. SearchBar
```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}
```
**Features**: Debounced input, clear button, recent searches dropdown, keyboard shortcuts

#### 3. EntityCard
```typescript
interface EntityCardProps {
  entity: WikibaseEntity;
  onSave?: (entity: WikibaseEntity) => void;
  onView?: (entityId: string) => void;
  isSaved?: boolean;
}
```
**Features**: Thumbnail, title, description, actions (save, view, share), hover effects

#### 4. RelationshipGraph
```typescript
interface RelationshipGraphProps {
  centralEntityId: string;
  depth?: number;
  filters?: RelationshipFilter[];
  onNodeClick?: (entityId: string) => void;
}
```
**Features**: D3.js or vis.js powered, zoom/pan, node expansion, export

#### 5. CollectionGrid
```typescript
interface CollectionGridProps {
  collections: Collection[];
  onEdit?: (collectionId: string) => void;
  onDelete?: (collectionId: string) => void;
  onView?: (collectionId: string) => void;
}
```
**Features**: Grid/list toggle, sorting, filtering, drag-and-drop reordering

#### 6. EntityPropertyTable
```typescript
interface EntityPropertyTableProps {
  properties: EntityProperty[];
  onPropertyClick?: (property: EntityProperty) => void;
  expandable?: boolean;
}
```
**Features**: Sortable columns, expandable nested properties, copy values

## Data Models (Database Schema)

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,  -- nullable for OAuth users
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  email_verified BOOLEAN DEFAULT 0,
  reset_token TEXT,
  reset_token_expires DATETIME
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_reset_token ON users(reset_token);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

### API Tokens Table
```sql
CREATE TABLE api_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  service TEXT NOT NULL,  -- 'wikibase', 'google', etc.
  token TEXT NOT NULL,    -- encrypted
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, service)
);

CREATE INDEX idx_api_tokens_user_id ON api_tokens(user_id);
```

### Collections Table
```sql
CREATE TABLE collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collections_public ON collections(is_public);
```

### Collection Items Table
```sql
CREATE TABLE collection_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  collection_id INTEGER NOT NULL,
  entity_id TEXT NOT NULL,  -- Wikibase entity ID (e.g., 'Q937')
  entity_label TEXT,
  entity_description TEXT,
  notes TEXT,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
  UNIQUE(collection_id, entity_id)
);

CREATE INDEX idx_collection_items_collection_id ON collection_items(collection_id);
CREATE INDEX idx_collection_items_entity_id ON collection_items(entity_id);
```

### Search Cache Table
```sql
CREATE TABLE search_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query_hash TEXT UNIQUE NOT NULL,
  query TEXT NOT NULL,
  results TEXT NOT NULL,  -- JSON
  cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL
);

CREATE INDEX idx_search_cache_query_hash ON search_cache(query_hash);
CREATE INDEX idx_search_cache_expires_at ON search_cache(expires_at);
```

## API Design

### Base URL
- Development: `http://localhost:3001/api`
- Production: `https://crudibase.example.com/api`

### Authentication Endpoints

#### POST `/auth/register`
**Request:**
```json
{
  "email": "sarah@example.com",
  "password": "SecurePass123!"
}
```
**Response (201):**
```json
{
  "user": {
    "id": 1,
    "email": "sarah@example.com",
    "created_at": "2025-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/auth/login`
**Request:**
```json
{
  "email": "sarah@example.com",
  "password": "SecurePass123!"
}
```
**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "sarah@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/auth/logout`
**Headers:** `Authorization: Bearer <token>`
**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

#### POST `/auth/forgot-password`
**Request:**
```json
{
  "email": "sarah@example.com"
}
```
**Response (200):**
```json
{
  "message": "Reset email sent if account exists"
}
```

#### POST `/auth/reset-password`
**Request:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePass456!"
}
```
**Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

### User Endpoints

#### GET `/user/profile`
**Headers:** `Authorization: Bearer <token>`
**Response (200):**
```json
{
  "id": 1,
  "email": "sarah@example.com",
  "created_at": "2025-01-15T10:30:00Z",
  "email_verified": false
}
```

#### PUT `/user/profile`
**Headers:** `Authorization: Bearer <token>`
**Request:**
```json
{
  "email": "newemail@example.com"
}
```
**Response (200):**
```json
{
  "id": 1,
  "email": "newemail@example.com",
  "updated_at": "2025-01-20T14:00:00Z"
}
```

### Wikibase Endpoints

#### GET `/wikibase/search?q=einstein&limit=10`
**Headers:** `Authorization: Bearer <token>` (optional)
**Response (200):**
```json
{
  "query": "einstein",
  "results": [
    {
      "id": "Q937",
      "label": "Albert Einstein",
      "description": "German-born theoretical physicist",
      "thumbnail": "https://commons.wikimedia.org/wiki/Special:FilePath/Einstein_1921.jpg",
      "url": "https://www.wikidata.org/wiki/Q937"
    }
  ],
  "total": 147,
  "cached": false
}
```

#### GET `/wikibase/entity/:id`
**Headers:** `Authorization: Bearer <token>` (optional)
**Response (200):**
```json
{
  "id": "Q937",
  "label": "Albert Einstein",
  "description": "German-born theoretical physicist",
  "properties": {
    "P31": { "label": "instance of", "value": "human" },
    "P106": { "label": "occupation", "value": "physicist" },
    "P569": { "label": "date of birth", "value": "1879-03-14" }
  },
  "relationships": [
    {
      "property": "P737",
      "label": "influenced by",
      "entities": ["Q935", "Q8796"]
    }
  ]
}
```

#### GET `/wikibase/relationships/:id?depth=2`
**Headers:** `Authorization: Bearer <token>` (optional)
**Response (200):**
```json
{
  "central_entity": "Q937",
  "nodes": [
    { "id": "Q937", "label": "Albert Einstein", "type": "person" },
    { "id": "Q935", "label": "Isaac Newton", "type": "person" }
  ],
  "edges": [
    {
      "from": "Q937",
      "to": "Q935",
      "label": "influenced by",
      "property": "P737"
    }
  ]
}
```

### Collection Endpoints

#### GET `/collections`
**Headers:** `Authorization: Bearer <token>`
**Response (200):**
```json
{
  "collections": [
    {
      "id": 1,
      "name": "Favorite Scientists",
      "description": "My favorite scientists",
      "item_count": 12,
      "is_public": false,
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-20T14:00:00Z"
    }
  ]
}
```

#### POST `/collections`
**Headers:** `Authorization: Bearer <token>`
**Request:**
```json
{
  "name": "Historical Figures",
  "description": "Important people in history",
  "is_public": false
}
```
**Response (201):**
```json
{
  "id": 2,
  "name": "Historical Figures",
  "description": "Important people in history",
  "item_count": 0,
  "is_public": false,
  "created_at": "2025-01-20T14:30:00Z"
}
```

#### GET `/collections/:id/items`
**Headers:** `Authorization: Bearer <token>`
**Response (200):**
```json
{
  "collection_id": 1,
  "items": [
    {
      "id": 1,
      "entity_id": "Q937",
      "entity_label": "Albert Einstein",
      "entity_description": "German-born theoretical physicist",
      "notes": "Research relativity theory",
      "added_at": "2025-01-15T11:00:00Z"
    }
  ]
}
```

#### POST `/collections/:id/items`
**Headers:** `Authorization: Bearer <token>`
**Request:**
```json
{
  "entity_id": "Q937",
  "entity_label": "Albert Einstein",
  "entity_description": "German-born theoretical physicist",
  "notes": "Research relativity theory"
}
```
**Response (201):**
```json
{
  "id": 1,
  "entity_id": "Q937",
  "added_at": "2025-01-15T11:00:00Z"
}
```

#### DELETE `/collections/:collectionId/items/:itemId`
**Headers:** `Authorization: Bearer <token>`
**Response (204):** No content

## Error Response Format

All error responses follow this structure:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": {
      "field": "email"
    }
  }
}
```

Common error codes:
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409) - e.g., email already exists
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_SERVER_ERROR` (500)
