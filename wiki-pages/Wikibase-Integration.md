# Wikibase Integration

This page documents how Crudibase integrates with Wikidata and other Wikibase instances for entity search and data retrieval.

## Table of Contents
- [Overview](#overview)
- [Search Flow](#search-flow)
- [Caching Strategy](#caching-strategy)
- [Entity Data Structure](#entity-data-structure)
- [API Integration](#api-integration)
- [Error Handling](#error-handling)

## Overview

Crudibase integrates with the **Wikidata REST API** to provide entity search functionality with intelligent caching to reduce API load and improve performance.

```mermaid
graph LR
    User[User Search] -->|query| Frontend
    Frontend -->|API call| Backend
    Backend -->|check| Cache{Cache Hit?}

    Cache -->|Yes| Return1[Return Cached<br/>Results]
    Cache -->|No| Fetch[Fetch from<br/>Wikidata API]

    Fetch -->|results| Store[Store in Cache]
    Store --> Return2[Return Results]

    Return1 --> Frontend
    Return2 --> Frontend
    Frontend --> Display[Display Entity<br/>Cards]

    style Cache fill:#fff4e1
    style Fetch fill:#e1f5ff
    style Store fill:#f3e5f5
    style Display fill:#e8f5e9
```

**Key Features:**
- **Real-time search** against Wikidata
- **Intelligent caching** with configurable TTL
- **Debounced input** to reduce API calls
- **Error handling** with graceful degradation
- **Rate limiting awareness**

## Search Flow

### Complete Search Sequence

```mermaid
sequenceDiagram
    actor User
    participant UI as SearchPage
    participant Debounce as Debounce Hook
    participant API as Backend API
    participant Cache as Cache Layer
    participant Wikidata as Wikidata API

    User->>UI: Type "einstein"
    UI->>UI: Update input state
    Note over UI: Each keystroke

    UI->>Debounce: Trigger search
    Note over Debounce: Wait 300ms for<br/>more keystrokes

    User->>UI: Type "s" → "einsteins"
    UI->>Debounce: Reset timer

    Note over Debounce: 300ms pause

    Debounce->>API: GET /api/wikibase/search?q=einsteins
    Note over Debounce,API: Authorization: Bearer <token>

    API->>API: Generate cache key<br/>SHA256(query)

    API->>Cache: Check cache
    Cache->>Cache: SELECT * FROM search_cache<br/>WHERE query_hash = ?<br/>AND expires_at > NOW()

    alt Cache Hit
        Cache-->>API: Cached results
        API-->>UI: 200 OK<br/>{results, cached: true}
        UI->>UI: Render entity cards
        UI-->>User: Show results<br/>(instant)
    else Cache Miss
        API->>Wikidata: GET /wikibase/v0/entities/search?q=einsteins
        Note over API,Wikidata: External API call

        alt Wikidata Success
            Wikidata-->>API: Entity search results
            API->>Cache: Store results
            Cache->>Cache: INSERT INTO search_cache<br/>(query_hash, results, expires_at)
            API-->>UI: 200 OK<br/>{results, cached: false}
            UI->>UI: Render entity cards
            UI-->>User: Show results<br/>(~500ms delay)
        else Wikidata Error
            Wikidata-->>API: Error (rate limit, timeout, etc.)
            API-->>UI: 500 Error<br/>{error: message}
            UI->>UI: Show error state
            UI-->>User: "Failed to fetch results"
        end
    end
```

### Frontend Debouncing

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Typing: User types
    Typing --> Waiting: Debounce timer start
    Waiting --> Waiting: More typing (reset timer)
    Waiting --> Searching: 300ms elapsed
    Searching --> DisplayResults: Results received
    DisplayResults --> Idle
    Searching --> ShowError: Error occurred
    ShowError --> Idle

    note right of Waiting
        300ms debounce
        prevents excessive
        API calls
    end note
```

**Implementation:**
```typescript
// Frontend debounce hook
const [searchQuery, setSearchQuery] = useState('');
const [debouncedQuery, setDebouncedQuery] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedQuery(searchQuery);
  }, 300); // 300ms debounce

  return () => clearTimeout(timer);
}, [searchQuery]);

useEffect(() => {
  if (debouncedQuery) {
    performSearch(debouncedQuery);
  }
}, [debouncedQuery]);
```

## Caching Strategy

### Cache Architecture

```mermaid
graph TB
    Request[Search Request] --> Hash[Generate Hash<br/>SHA256 of query]
    Hash --> Check{Cache Entry<br/>Exists?}

    Check -->|No| Miss[Cache Miss]
    Check -->|Yes| CheckExpiry{Expired?}

    CheckExpiry -->|Yes| Miss
    CheckExpiry -->|No| Hit[Cache Hit]

    Miss --> Fetch[Fetch from Wikidata]
    Fetch --> Store[Store with TTL]
    Store --> Return1[Return Results]

    Hit --> Return2[Return Cached]

    Return1 --> Client[Frontend]
    Return2 --> Client

    style Hash fill:#fff4e1
    style Hit fill:#e8f5e9
    style Miss fill:#fce4ec
    style Store fill:#f3e5f5
```

### Cache Key Generation

```typescript
import crypto from 'crypto';

function generateCacheKey(query: string): string {
  return crypto
    .createHash('sha256')
    .update(query.toLowerCase().trim())
    .digest('hex');
}

// Example:
// "Einstein" → "8f14e45f..."
// "einstein" → "8f14e45f..." (same key, case-insensitive)
// "Einstein " → "8f14e45f..." (same key, trimmed)
```

### Cache Table Schema

```sql
CREATE TABLE search_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query_hash TEXT UNIQUE NOT NULL,
  query TEXT NOT NULL,
  results TEXT NOT NULL,  -- JSON string
  cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL
);

CREATE INDEX idx_search_cache_query_hash ON search_cache(query_hash);
CREATE INDEX idx_search_cache_expires_at ON search_cache(expires_at);
```

### Cache Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Created: First search
    Created --> Valid: TTL = 24 hours

    Valid --> Served: Subsequent searches
    Served --> Valid: Still within TTL

    Valid --> Expired: 24 hours pass
    Expired --> Deleted: Cleanup cron job
    Deleted --> [*]

    Valid --> Invalidated: Manual invalidation
    Invalidated --> Deleted
```

**Cache Configuration:**
```typescript
const CACHE_CONFIG = {
  TTL_HOURS: 24,           // Cache expires after 24 hours
  MAX_ENTRIES: 10000,       // Max cache entries before cleanup
  CLEANUP_INTERVAL: '0 3 * * *'  // Daily at 3 AM
};
```

### Cache Cleanup

```typescript
// Periodic cleanup of expired entries
export async function cleanupExpiredCache() {
  const db = getDatabase();
  const result = db.prepare(`
    DELETE FROM search_cache
    WHERE expires_at < datetime('now')
  `).run();

  console.log(`Cleaned up ${result.changes} expired cache entries`);
}

// Also cleanup if cache grows too large
export async function cleanupOldestEntries(limit: number) {
  const db = getDatabase();
  db.prepare(`
    DELETE FROM search_cache
    WHERE id IN (
      SELECT id FROM search_cache
      ORDER BY cached_at ASC
      LIMIT ?
    )
  `).run(limit);
}
```

## Entity Data Structure

### Wikidata API Response

```json
{
  "id": "Q937",
  "key": "Q937",
  "label": "Albert Einstein",
  "description": "German-born theoretical physicist (1879-1955)",
  "match": {
    "type": "label",
    "language": "en",
    "text": "Albert Einstein"
  },
  "display": {
    "label": {
      "value": "Albert Einstein",
      "language": "en"
    },
    "description": {
      "value": "German-born theoretical physicist (1879-1955)",
      "language": "en"
    }
  }
}
```

### Crudibase Entity Format

```typescript
interface WikibaseEntity {
  id: string;              // Wikidata Q-ID (e.g., "Q937")
  label: string;           // Display name
  description: string;     // Brief description
  url?: string;            // Wikidata URL
  thumbnail?: string;      // Image URL (if available)
}

// Example:
{
  "id": "Q937",
  "label": "Albert Einstein",
  "description": "German-born theoretical physicist (1879-1955)",
  "url": "https://www.wikidata.org/wiki/Q937",
  "thumbnail": null
}
```

### Data Transformation

```mermaid
graph LR
    Raw[Wikidata API<br/>Response] --> Transform[Transform<br/>Function]

    Transform --> Extract1[Extract ID]
    Transform --> Extract2[Extract Label]
    Transform --> Extract3[Extract Description]
    Transform --> Extract4[Build URL]

    Extract1 --> Entity[Crudibase<br/>Entity Object]
    Extract2 --> Entity
    Extract3 --> Entity
    Extract4 --> Entity

    Entity --> Store[Store in Cache]
    Entity --> Return[Return to Frontend]

    style Transform fill:#fff4e1
    style Entity fill:#e8f5e9
```

## API Integration

### Backend Service Implementation

```typescript
// src/backend/src/services/WikibaseService.ts

export class WikibaseService {
  private readonly BASE_URL = 'https://www.wikidata.org/w/rest.php/wikibase/v0';

  async search(query: string, limit: number = 10): Promise<SearchResult> {
    // Generate cache key
    const cacheKey = this.generateCacheKey(query);

    // Check cache
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return { results: cached, cached: true };
    }

    // Fetch from Wikidata
    const url = `${this.BASE_URL}/entities/search`;
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      language: 'en'
    });

    try {
      const response = await axios.get(`${url}?${params}`);
      const entities = this.transformResults(response.data);

      // Store in cache
      await this.storeInCache(cacheKey, query, entities);

      return { results: entities, cached: false };
    } catch (error) {
      throw new Error(`Wikidata API error: ${error.message}`);
    }
  }

  private transformResults(data: any[]): WikibaseEntity[] {
    return data.map(item => ({
      id: item.id,
      label: item.display?.label?.value || item.label || '',
      description: item.display?.description?.value || item.description || '',
      url: `https://www.wikidata.org/wiki/${item.id}`
    }));
  }
}
```

### API Endpoint

**GET `/api/wikibase/search`**

**Query Parameters:**
```typescript
{
  q: string;      // Search query (required)
  limit?: number; // Max results (default: 10, max: 50)
}
```

**Request Example:**
```http
GET /api/wikibase/search?q=einstein&limit=10
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "query": "einstein",
  "results": [
    {
      "id": "Q937",
      "label": "Albert Einstein",
      "description": "German-born theoretical physicist",
      "url": "https://www.wikidata.org/wiki/Q937"
    }
  ],
  "total": 147,
  "cached": false
}
```

### Rate Limiting Awareness

```mermaid
graph TB
    Request[API Request] --> Check{Rate Limit<br/>Exceeded?}

    Check -->|No| Process[Process Request]
    Check -->|Yes| Wait[Exponential<br/>Backoff]

    Wait --> Retry{Max Retries?}
    Retry -->|No| Request
    Retry -->|Yes| Error[Return Error]

    Process --> Success[Return Results]

    style Check fill:#fff4e1
    style Wait fill:#fce4ec
    style Error fill:#ffcdd2
    style Success fill:#e8f5e9
```

**Wikidata Rate Limits:**
- **Anonymous**: ~200 requests/minute
- **Authenticated**: Higher limits (token-based)

**Mitigation Strategies:**
1. **Caching** - Primary strategy (24-hour TTL)
2. **Debouncing** - Reduce search frequency
3. **Exponential Backoff** - Retry on rate limit errors
4. **User Feedback** - Show "too many requests" message

## Error Handling

### Error Flow

```mermaid
sequenceDiagram
    participant Frontend
    participant Backend
    participant Wikidata

    Frontend->>Backend: Search request
    Backend->>Wikidata: API call

    alt Network Error
        Wikidata-->>Backend: Timeout/Connection error
        Backend-->>Frontend: 500 Error<br/>"Network error"
        Frontend->>Frontend: Show retry button
    else Rate Limited
        Wikidata-->>Backend: 429 Too Many Requests
        Backend-->>Frontend: 429 Error<br/>"Rate limit exceeded"
        Frontend->>Frontend: Show "Try again later"
    else Invalid Response
        Wikidata-->>Backend: Malformed data
        Backend-->>Frontend: 500 Error<br/>"Invalid response"
        Frontend->>Frontend: Show generic error
    else Success
        Wikidata-->>Backend: Results
        Backend-->>Frontend: 200 OK + Results
        Frontend->>Frontend: Display entities
    end
```

### Error States in Frontend

```typescript
interface SearchState {
  query: string;
  results: WikibaseEntity[];
  loading: boolean;
  error: string | null;
  cached: boolean;
}

// Error handling
try {
  const response = await axios.get('/api/wikibase/search', { params: { q: query } });
  setState({
    results: response.data.results,
    loading: false,
    error: null,
    cached: response.data.cached
  });
} catch (error) {
  if (error.response?.status === 429) {
    setState({
      error: 'Too many requests. Please try again in a moment.',
      loading: false
    });
  } else {
    setState({
      error: 'Failed to search. Please try again.',
      loading: false
    });
  }
}
```

## Future Enhancements

### Planned Features

```mermaid
mindmap
  root((Future<br/>Enhancements))
    Advanced Search
      Filter by type
      Filter by property
      Date range filters
      Multi language support
    Entity Details
      Full property list
      Relationship graph
      Timeline view
      Image gallery
    Performance
      Server-side pagination
      Infinite scroll
      Progressive loading
      WebSocket updates
    Multiple Instances
      Connect to any Wikibase
      Instance switching
      Custom endpoints
      Federated search
```

### Phase 2 Features

1. **Relationship Graph** - Visualize entity connections
2. **Timeline View** - Chronological entity data
3. **Property Explorer** - Detailed property inspection
4. **SPARQL Integration** - Advanced query support

## Related Pages

- [[Architecture]] - Overall system architecture
- [[Collections-System]] - How entities are saved to collections
- [[API-Reference]] - Complete API documentation
- [[Database-Schema]] - Cache table schema details

---

**Last Updated**: 2025-11-17
