# API Reference

Complete REST API documentation for Crudibase backend.

## Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://crudibase.codingtech.info/api`

## Authentication

All protected endpoints require JWT authentication:

```http
Authorization: Bearer <jwt_token>
```

## Endpoints Overview

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/register` | POST | No | Register new user |
| `/auth/login` | POST | No | Login and get JWT |
| `/auth/logout` | POST | Yes | Invalidate session |
| `/user/profile` | GET | Yes | Get user profile |
| `/wikibase/search` | GET | Optional | Search Wikibase entities |
| `/collections` | GET | Yes | List user's collections |
| `/collections` | POST | Yes | Create new collection |
| `/collections/:id` | GET | Yes | Get collection details |
| `/collections/:id` | DELETE | Yes | Delete collection |
| `/collections/:id/items` | POST | Yes | Add entity to collection |
| `/collections/:id/items/:entityId` | DELETE | Yes | Remove entity from collection |

## Authentication Endpoints

### Register User

**POST** `/api/auth/register`

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
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**
- `400` - Validation error
- `409` - Email already exists

### Login

**POST** `/api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**
- `400` - Missing credentials
- `401` - Invalid credentials

### Logout

**POST** `/api/auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

## User Endpoints

### Get Profile

**GET** `/api/user/profile`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "created_at": "2025-01-15T10:30:00Z",
  "email_verified": false
}
```

**Errors:**
- `401` - Unauthorized

## Wikibase Endpoints

### Search Entities

**GET** `/api/wikibase/search`

**Query Parameters:**
- `q` (string, required) - Search query
- `limit` (number, optional) - Max results (default: 10, max: 50)

**Headers:** `Authorization: Bearer <token>` (optional)

**Request:**
```http
GET /api/wikibase/search?q=einstein&limit=10
```

**Response (200):**
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

**Errors:**
- `400` - Missing query parameter
- `429` - Rate limit exceeded
- `500` - Wikidata API error

## Collections Endpoints

### List Collections

**GET** `/api/collections`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "collections": [
    {
      "id": 1,
      "name": "Favorite Scientists",
      "description": "Scientists I admire",
      "item_count": 12,
      "is_public": false,
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-20T14:00:00Z"
    }
  ]
}
```

### Create Collection

**POST** `/api/collections`

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
  "created_at": "2025-01-20T14:30:00Z",
  "updated_at": "2025-01-20T14:30:00Z"
}
```

**Errors:**
- `400` - Validation error
- `401` - Unauthorized

### Get Collection Details

**GET** `/api/collections/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "collection": {
    "id": 1,
    "name": "Favorite Scientists",
    "description": "Scientists I admire",
    "item_count": 5,
    "created_at": "2025-01-15T10:30:00Z"
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

**Errors:**
- `401` - Unauthorized
- `404` - Collection not found or not owned by user

### Delete Collection

**DELETE** `/api/collections/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

**Errors:**
- `401` - Unauthorized
- `404` - Collection not found

### Add Item to Collection

**POST** `/api/collections/:id/items`

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
  "collection_id": 1,
  "entity_id": "Q937",
  "entity_label": "Albert Einstein",
  "entity_description": "German-born theoretical physicist",
  "notes": "Research relativity theory",
  "added_at": "2025-01-15T11:00:00Z"
}
```

**Errors:**
- `401` - Unauthorized
- `404` - Collection not found
- `409` - Entity already in collection

### Remove Item from Collection

**DELETE** `/api/collections/:collectionId/items/:entityId`

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

**Errors:**
- `401` - Unauthorized
- `404` - Collection or item not found

## Error Response Format

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Authentication required or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

## Rate Limiting

Currently no rate limiting implemented. Planned for future:

- Auth endpoints: 5 requests/minute
- Search endpoint: 20 requests/minute
- Other endpoints: 100 requests/minute

## Pagination

Not yet implemented. All list endpoints return full results. Planned for Phase 2.

## Related Pages

- [[Authentication-Flow]] - Detailed auth flows
- [[Wikibase-Integration]] - Search implementation
- [[Collections-System]] - Collections CRUD flows
- [[Database-Schema]] - Data models

---

**Last Updated**: 2025-11-17
