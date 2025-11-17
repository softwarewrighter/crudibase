# Collections System

This page documents the Collections feature in Crudibase, which allows users to organize and save Wikibase entities into personal collections.

## Table of Contents
- [Overview](#overview)
- [Collection Data Model](#collection-data-model)
- [Create Collection Flow](#create-collection-flow)
- [Add Entity to Collection](#add-entity-to-collection)
- [View Collection Details](#view-collection-details)
- [Delete Operations](#delete-operations)
- [UI Components](#ui-components)

## Overview

Collections provide a way for users to curate and organize entities from Wikibase searches. Each user can create multiple collections and add entities with optional notes.

```mermaid
graph TB
    User[User] -->|creates| Collections[Collections]
    Collections -->|contains| Items[Collection Items]
    Items -->|references| Entities[Wikibase Entities]

    Collections -->|belongs to| User
    Items -->|belongs to| Collections

    style User fill:#e1f5ff
    style Collections fill:#fff4e1
    style Items fill:#e8f5e9
    style Entities fill:#f3e5f5
```

**Key Features:**
- ✅ Create named collections with descriptions
- ✅ Add entities from search results
- ✅ View collection contents
- ✅ Remove items from collections
- ✅ Delete entire collections
- ✅ Duplicate prevention (409 errors)
- 🔄 Private by default (public sharing planned for Phase 3)

## Collection Data Model

### Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ COLLECTIONS : creates
    COLLECTIONS ||--o{ COLLECTION_ITEMS : contains
    COLLECTION_ITEMS }o--|| WIKIBASE_ENTITIES : references

    USERS {
        int id PK
        string email UK
        string password_hash
        datetime created_at
    }

    COLLECTIONS {
        int id PK
        int user_id FK
        string name
        string description
        boolean is_public
        datetime created_at
        datetime updated_at
    }

    COLLECTION_ITEMS {
        int id PK
        int collection_id FK
        string entity_id
        string entity_label
        string entity_description
        string notes
        datetime added_at
    }

    WIKIBASE_ENTITIES {
        string id PK
        string label
        string description
    }
```

### TypeScript Interfaces

```typescript
interface Collection {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface CollectionItem {
  id: number;
  collection_id: number;
  entity_id: string;        // Wikidata Q-ID (e.g., "Q937")
  entity_label: string;     // Display name
  entity_description: string;
  notes: string | null;     // User's personal notes
  added_at: string;
}

interface CollectionWithCount extends Collection {
  item_count: number;       // Number of entities in collection
}
```

## Create Collection Flow

### Creation Sequence

```mermaid
sequenceDiagram
    actor User
    participant UI as Collections Page
    participant Modal as Create Modal
    participant API as Backend API
    participant Validator as Zod Validator
    participant Model as Collection Model
    participant DB as Database

    User->>UI: Click "New Collection"
    UI->>Modal: Show modal
    Modal-->>User: Display form

    User->>Modal: Enter name & description
    User->>Modal: Click "Create"

    Modal->>API: POST /api/collections
    Note over Modal,API: {name, description, is_public}

    API->>Validator: Validate input
    Validator->>Validator: Check name not empty
    Validator->>Validator: Check description length

    alt Validation fails
        Validator-->>API: Error
        API-->>Modal: 400 Bad Request
        Modal-->>User: Show error message
    end

    API->>API: Extract user_id from JWT
    API->>Model: Collection.create({user_id, name, ...})

    Model->>DB: INSERT INTO collections
    DB-->>Model: New collection ID

    Model-->>API: Collection object
    API-->>Modal: 201 Created + Collection
    Modal->>UI: Close modal
    UI->>UI: Refresh collection list
    UI-->>User: Show new collection
```

### API Endpoint

**POST `/api/collections`**

**Request:**
```json
{
  "name": "Favorite Scientists",
  "description": "Scientists I admire",
  "is_public": false
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "user_id": 42,
  "name": "Favorite Scientists",
  "description": "Scientists I admire",
  "is_public": false,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

**Validation Rules:**
```typescript
const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  is_public: z.boolean().default(false)
});
```

## Add Entity to Collection

### Add Entity Sequence

```mermaid
sequenceDiagram
    actor User
    participant Search as Search Page
    participant Modal as Add to Collection Modal
    participant API as Backend API
    participant CollModel as Collection Model
    participant ItemModel as CollectionItem Model
    participant DB as Database

    User->>Search: View search results
    User->>Search: Click "Add to Collection"
    Search->>Modal: Show modal
    Modal->>API: GET /api/collections
    Note over Modal,API: Fetch user's collections

    API->>CollModel: Collection.findByUserId(user_id)
    CollModel->>DB: SELECT * FROM collections<br/>WHERE user_id = ?
    DB-->>CollModel: Collections list
    CollModel-->>API: Collections
    API-->>Modal: 200 OK + Collections
    Modal-->>User: Display collection list

    User->>Modal: Select collection
    User->>Modal: Add optional notes
    User->>Modal: Click "Add"

    Modal->>API: POST /api/collections/:id/items
    Note over Modal,API: {entity_id, entity_label,<br/>entity_description, notes}

    API->>API: Extract user_id from JWT
    API->>CollModel: Verify ownership
    CollModel->>DB: SELECT * FROM collections<br/>WHERE id = ? AND user_id = ?

    alt Not owner
        DB-->>CollModel: No results
        CollModel-->>API: Error: Not found
        API-->>Modal: 404 Not Found
        Modal-->>User: "Collection not found"
    end

    DB-->>CollModel: Collection found
    API->>ItemModel: CollectionItem.create({...})

    ItemModel->>DB: INSERT INTO collection_items
    Note over ItemModel,DB: UNIQUE constraint on<br/>(collection_id, entity_id)

    alt Duplicate entity
        DB-->>ItemModel: UNIQUE constraint violation
        ItemModel-->>API: Error: Duplicate
        API-->>Modal: 409 Conflict
        Modal-->>User: "Entity already in collection"
    end

    DB-->>ItemModel: Item created
    ItemModel-->>API: CollectionItem object
    API-->>Modal: 201 Created
    Modal->>Modal: Close modal
    Modal-->>User: "Added successfully"
```

### Duplicate Prevention

```mermaid
graph TB
    Request[Add Entity Request] --> Check{Entity<br/>already in<br/>collection?}

    Check -->|No| Insert[INSERT INTO<br/>collection_items]
    Check -->|Yes| Error[409 Conflict<br/>Duplicate Error]

    Insert --> Success[201 Created]

    style Check fill:#fff4e1
    style Insert fill:#e8f5e9
    style Error fill:#ffcdd2
    style Success fill:#c8e6c9
```

**Database Constraint:**
```sql
CREATE TABLE collection_items (
  id INTEGER PRIMARY KEY,
  collection_id INTEGER NOT NULL,
  entity_id TEXT NOT NULL,
  -- ... other fields
  UNIQUE(collection_id, entity_id)  -- Prevents duplicates
);
```

### API Endpoint

**POST `/api/collections/:id/items`**

**Request:**
```json
{
  "entity_id": "Q937",
  "entity_label": "Albert Einstein",
  "entity_description": "German-born theoretical physicist",
  "notes": "Research relativity theory"
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "collection_id": 5,
  "entity_id": "Q937",
  "entity_label": "Albert Einstein",
  "entity_description": "German-born theoretical physicist",
  "notes": "Research relativity theory",
  "added_at": "2025-01-15T11:00:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Collection doesn't exist or not owned by user
- `409 Conflict` - Entity already in collection
- `400 Bad Request` - Invalid entity data

## View Collection Details

### View Details Sequence

```mermaid
sequenceDiagram
    actor User
    participant UI as Collection Detail Page
    participant API as Backend API
    participant CollModel as Collection Model
    participant ItemModel as CollectionItem Model
    participant DB as Database

    User->>UI: Click collection card
    UI->>UI: Navigate to /collections/:id

    UI->>API: GET /api/collections/:id
    API->>API: Extract user_id from JWT

    API->>CollModel: Collection.findById(id)
    CollModel->>DB: SELECT * FROM collections<br/>WHERE id = ?
    DB-->>CollModel: Collection

    alt Not found or wrong owner
        CollModel-->>API: null
        API-->>UI: 404 Not Found
        UI-->>User: "Collection not found"
    end

    CollModel-->>API: Collection object

    API->>ItemModel: CollectionItem.findByCollectionId(id)
    ItemModel->>DB: SELECT * FROM collection_items<br/>WHERE collection_id = ?<br/>ORDER BY added_at DESC
    DB-->>ItemModel: Items array

    ItemModel-->>API: CollectionItem[]
    API-->>UI: 200 OK + {collection, items}

    UI->>UI: Render collection header
    UI->>UI: Render items grid
    UI-->>User: Display collection details
```

### Collection Detail Page Layout

```mermaid
graph TB
    Page[Collection Detail Page] --> Header
    Page --> ItemsList

    Header --> Title[Collection Name]
    Header --> Description[Description]
    Header --> Stats[Item Count]
    Header --> Actions[Actions<br/>Edit, Delete]

    ItemsList --> Grid[Items Grid]

    Grid --> Card1[Entity Card 1]
    Grid --> Card2[Entity Card 2]
    Grid --> Card3[Entity Card 3]

    Card1 --> CardContent[Label<br/>Description<br/>Notes<br/>Remove Button]

    style Header fill:#e1f5ff
    style ItemsList fill:#fff4e1
    style Grid fill:#e8f5e9
    style CardContent fill:#f3e5f5
```

### API Endpoint

**GET `/api/collections/:id`**

**Success Response (200):**
```json
{
  "collection": {
    "id": 1,
    "name": "Favorite Scientists",
    "description": "Scientists I admire",
    "item_count": 5,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-20T14:00:00Z"
  },
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

## Delete Operations

### Remove Item from Collection

```mermaid
sequenceDiagram
    actor User
    participant UI as Collection Detail Page
    participant Confirm as Confirmation Dialog
    participant API as Backend API
    participant Model as CollectionItem Model
    participant DB as Database

    User->>UI: Click "Remove" on item
    UI->>Confirm: Show confirmation
    Confirm-->>User: "Are you sure?"

    User->>Confirm: Confirm
    Confirm->>API: DELETE /api/collections/:collId/items/:entityId
    Note over Confirm,API: Authorization: Bearer <token>

    API->>API: Extract user_id from JWT
    API->>Model: Verify ownership

    alt Not owner
        API-->>UI: 404 Not Found
        UI-->>User: "Item not found"
    end

    API->>Model: CollectionItem.delete(collId, entityId)
    Model->>DB: DELETE FROM collection_items<br/>WHERE collection_id = ?<br/>AND entity_id = ?
    DB-->>Model: Deleted

    Model-->>API: Success
    API-->>UI: 204 No Content

    UI->>UI: Remove item from state
    UI->>UI: Re-render items list
    UI-->>User: Item removed
```

### Delete Entire Collection

```mermaid
sequenceDiagram
    actor User
    participant UI as Collections Page
    participant Confirm as Confirmation Dialog
    participant API as Backend API
    participant Model as Collection Model
    participant DB as Database

    User->>UI: Click "Delete" on collection
    UI->>Confirm: Show confirmation
    Confirm-->>User: "This will delete all items"

    User->>Confirm: Confirm deletion
    Confirm->>API: DELETE /api/collections/:id

    API->>API: Extract user_id from JWT
    API->>Model: Collection.delete(id, user_id)

    Model->>DB: DELETE FROM collections<br/>WHERE id = ? AND user_id = ?
    Note over Model,DB: CASCADE deletes all items

    alt Not found or not owner
        DB-->>Model: No rows affected
        Model-->>API: Error: Not found
        API-->>UI: 404 Not Found
        UI-->>User: "Collection not found"
    end

    DB-->>Model: Deleted (with cascade)
    Model-->>API: Success
    API-->>UI: 204 No Content

    UI->>UI: Remove collection from state
    UI->>UI: Re-render collection list
    UI-->>User: "Collection deleted"
```

### Cascade Deletion

```sql
-- Foreign key with CASCADE ensures items are deleted
CREATE TABLE collection_items (
  id INTEGER PRIMARY KEY,
  collection_id INTEGER NOT NULL,
  -- ... other fields
  FOREIGN KEY (collection_id)
    REFERENCES collections(id)
    ON DELETE CASCADE
);
```

### API Endpoints

**DELETE `/api/collections/:collectionId/items/:entityId`**

**Success Response:** `204 No Content`

**DELETE `/api/collections/:id`**

**Success Response:** `204 No Content`

## UI Components

### Component Hierarchy

```mermaid
graph TB
    App[App Router] --> CollectionsPage
    App --> CollectionDetailPage

    CollectionsPage --> CreateButton[Create Collection Button]
    CollectionsPage --> CollectionGrid
    CollectionGrid --> CollectionCard[Collection Card]

    CollectionDetailPage --> DetailHeader[Collection Header]
    CollectionDetailPage --> ItemsGrid[Items Grid]
    ItemsGrid --> ItemCard[Entity Item Card]

    CreateButton -.->|opens| CreateModal[Create Collection Modal]
    CollectionCard -.->|opens| AddModal[Add to Collection Modal]
    ItemCard --> RemoveButton[Remove Button]

    style CollectionsPage fill:#e1f5ff
    style CollectionDetailPage fill:#fff4e1
    style CreateModal fill:#e8f5e9
    style AddModal fill:#f3e5f5
```

### Collections Page

**Route:** `/collections`

**Features:**
- Grid view of all user collections
- "Create Collection" button
- Collection cards showing:
  - Collection name
  - Description (truncated)
  - Item count (planned)
  - Created date
  - Edit/Delete actions

### Collection Detail Page

**Route:** `/collections/:id`

**Features:**
- Collection header with name, description, stats
- Grid of entity items
- Each item shows:
  - Entity label (linked to Wikidata)
  - Entity description
  - User notes
  - Added date
  - "Remove" button
- Back navigation to collections list

### Create Collection Modal

**Triggered by:** "New Collection" button

**Fields:**
- Name (required, max 100 chars)
- Description (optional, max 500 chars)
- Is Public (checkbox, default false)

**Actions:**
- Create (validates and submits)
- Cancel (closes modal)

### Add to Collection Modal

**Triggered by:** "Add to Collection" button on search results

**Features:**
- Fetches user's collections on open
- Dropdown/list to select collection
- "Create New Collection" option
- Notes field (optional)
- Shows duplicate error if entity already in collection

## Future Enhancements

```mermaid
mindmap
  root((Collections<br/>Enhancements))
    Organization
      Folders/Tags
      Sort & filter
      Bulk operations
      Duplicate collection
    Collaboration
      Public collections
      Share via link
      Collaborative editing
      Comments
    Export
      CSV export
      JSON export
      PDF report
      Print view
    Search
      Search within collection
      Filter by property
      Date range filter
    Visualization
      Timeline view
      Graph view
      Map view
      Statistics dashboard
```

## Related Pages

- [[Architecture]] - Overall system design
- [[Authentication-Flow]] - User ownership and authorization
- [[Wikibase-Integration]] - How entities are discovered
- [[Database-Schema]] - Collections table details
- [[API-Reference]] - Complete API documentation

---

**Last Updated**: 2025-11-17
