# Authentication Flow

This page details the authentication system in Crudibase, including registration, login, JWT handling, and authorization.

## Table of Contents
- [Overview](#overview)
- [User Registration](#user-registration)
- [User Login](#user-login)
- [JWT Token Management](#jwt-token-management)
- [Protected Route Access](#protected-route-access)
- [Logout Flow](#logout-flow)
- [Security Considerations](#security-considerations)

## Overview

Crudibase uses **JWT (JSON Web Tokens)** for stateless authentication with the following characteristics:

| Feature | Implementation |
|---------|----------------|
| **Token Type** | JWT (HS256 algorithm) |
| **Storage** | localStorage (client-side) |
| **Expiration** | 1 hour (configurable) |
| **Password Hashing** | bcrypt with cost factor 12 |
| **Session Management** | Database-backed (sessions table) |

```mermaid
graph TB
    User[User] -->|Credentials| Auth[Auth System]
    Auth -->|Verify| DB[(Database)]
    Auth -->|Generate| JWT[JWT Token]
    JWT -->|Stored in| LocalStorage[localStorage]

    LocalStorage -->|Attached to| Requests[API Requests]
    Requests -->|Verified by| Middleware[JWT Middleware]
    Middleware -->|Extracts| UserID[User ID]
    UserID -->|Used by| Services[Services]

    style Auth fill:#fff4e1
    style JWT fill:#e1f5ff
    style Middleware fill:#e8f5e9
```

## User Registration

### Registration Sequence

```mermaid
sequenceDiagram
    actor User
    participant UI as RegisterForm
    participant API as Backend API
    participant Validator as Zod Validator
    participant Service as AuthService
    participant Model as User Model
    participant DB as SQLite DB

    User->>UI: Enter email & password
    UI->>UI: Client-side validation
    User->>UI: Submit form
    UI->>API: POST /api/auth/register
    Note over UI,API: {email, password}

    API->>Validator: Validate input
    Validator->>Validator: Check email format
    Validator->>Validator: Check password strength

    alt Validation fails
        Validator-->>API: Validation error
        API-->>UI: 400 Bad Request
        UI-->>User: Show error message
    end

    Validator-->>API: Valid input
    API->>Service: register(email, password)

    Service->>Model: User.findByEmail(email)
    Model->>DB: SELECT * FROM users WHERE email = ?
    DB-->>Model: Query result

    alt User already exists
        Model-->>Service: User found
        Service-->>API: Error: Email exists
        API-->>UI: 409 Conflict
        UI-->>User: "Email already registered"
    end

    Model-->>Service: No user found
    Service->>Service: Hash password<br/>(bcrypt cost 12)
    Note over Service: This takes ~100ms<br/>intentionally slow

    Service->>Model: User.create({email, password_hash})
    Model->>DB: INSERT INTO users
    DB-->>Model: New user ID

    Service->>Service: Generate JWT token
    Service->>Model: Session.create({user_id, token})
    Model->>DB: INSERT INTO sessions
    DB-->>Model: Session ID

    Service-->>API: {user, token}
    API-->>UI: 201 Created<br/>{user, token}
    UI->>UI: Store token in localStorage
    UI->>UI: Redirect to dashboard
    UI-->>User: "Welcome!"
```

### Registration Validation Rules

**Email:**
```typescript
{
  format: "email",
  required: true,
  unique: true
}
```

**Password:**
```typescript
{
  minLength: 8,
  required: true,
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*/  // At least one lowercase, uppercase, and digit
}
```

### API Endpoint

**POST `/api/auth/register`**

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (201):**
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

**Error Responses:**
- `400 Bad Request` - Validation error
- `409 Conflict` - Email already exists
- `500 Internal Server Error` - Server error

## User Login

### Login Sequence

```mermaid
sequenceDiagram
    actor User
    participant UI as LoginForm
    participant API as Backend API
    participant Service as AuthService
    participant Model as User Model
    participant DB as SQLite DB

    User->>UI: Enter email & password
    User->>UI: Click "Sign In"
    UI->>API: POST /api/auth/login
    Note over UI,API: {email, password}

    API->>Service: login(email, password)
    Service->>Model: User.findByEmail(email)
    Model->>DB: SELECT * FROM users WHERE email = ?
    DB-->>Model: User record (with password_hash)

    alt User not found
        Model-->>Service: null
        Service-->>API: Error: Invalid credentials
        API-->>UI: 401 Unauthorized
        UI-->>User: "Invalid email or password"
    end

    Model-->>Service: User record
    Service->>Service: Compare passwords<br/>bcrypt.compare(password, hash)
    Note over Service: Constant time comparison<br/>prevents timing attacks

    alt Password incorrect
        Service-->>API: Error: Invalid credentials
        API-->>UI: 401 Unauthorized
        UI-->>User: "Invalid email or password"
    end

    Service->>Service: Generate JWT token
    Note over Service: Payload: {userId, iat, exp}

    Service->>Model: Session.create({user_id, token, expires_at})
    Model->>DB: INSERT INTO sessions
    DB-->>Model: Session ID

    Service-->>API: {user, token}
    API-->>UI: 200 OK<br/>{user, token}

    UI->>UI: Store token in localStorage
    UI->>UI: Store user in state
    UI->>UI: Redirect to dashboard

    UI-->>User: Logged in successfully
```

### Login Implementation Details

**Password Comparison:**
```typescript
// Constant-time comparison prevents timing attacks
const isValid = await bcrypt.compare(plainPassword, passwordHash);
```

**JWT Generation:**
```typescript
const token = jwt.sign(
  { userId: user.id },
  JWT_SECRET,
  { expiresIn: '1h' }  // Token expires in 1 hour
);
```

**Session Storage:**
```sql
INSERT INTO sessions (user_id, token, expires_at, created_at)
VALUES (?, ?, datetime('now', '+1 hour'), datetime('now'));
```

### API Endpoint

**POST `/api/auth/login`**

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request` - Missing email or password
- `401 Unauthorized` - Invalid credentials
- `500 Internal Server Error` - Server error

## JWT Token Management

### Token Structure

```mermaid
graph LR
    JWT[JWT Token] --> Header
    JWT --> Payload
    JWT --> Signature

    Header --> Algo[Algorithm: HS256]
    Header --> Type[Type: JWT]

    Payload --> UserID[userId: 123]
    Payload --> IAT[iat: issued at]
    Payload --> EXP[exp: expires at]

    Signature --> Secret[HMAC SHA256<br/>with JWT_SECRET]

    style JWT fill:#e1f5ff
    style Header fill:#fff4e1
    style Payload fill:#e8f5e9
    style Signature fill:#f3e5f5
```

### Token Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Generated: User logs in
    Generated --> Valid: Token created<br/>(1 hour TTL)
    Valid --> Used: Attached to requests
    Used --> Valid: Token still valid
    Valid --> Expired: 1 hour passes
    Expired --> [*]: User must login again

    Valid --> Revoked: User logs out
    Revoked --> [*]: Token deleted from DB

    note right of Generated
        Stored in:
        - Client: localStorage
        - Server: sessions table
    end note

    note right of Expired
        Server rejects with 401
        Client redirects to login
    end note
```

### Token Storage

**Client-side (Frontend):**
```typescript
// Store token after login
localStorage.setItem('token', token);

// Retrieve for API requests
const token = localStorage.getItem('token');
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Clear on logout
localStorage.removeItem('token');
```

**Server-side (Database):**
```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

## Protected Route Access

### Authorization Middleware Flow

```mermaid
sequenceDiagram
    participant Client
    participant Route as Protected Route
    participant Middleware as JWT Middleware
    participant DB as Database
    participant Handler as Route Handler

    Client->>Route: GET /api/collections
    Note over Client,Route: Authorization: Bearer <token>

    Route->>Middleware: Check authentication
    Middleware->>Middleware: Extract token from header

    alt No token provided
        Middleware-->>Route: 401 Unauthorized
        Route-->>Client: "Authentication required"
    end

    Middleware->>Middleware: Verify JWT signature
    Note over Middleware: jwt.verify(token, JWT_SECRET)

    alt Invalid signature
        Middleware-->>Route: 401 Unauthorized
        Route-->>Client: "Invalid token"
    end

    alt Token expired
        Middleware-->>Route: 401 Unauthorized
        Route-->>Client: "Token expired"
    end

    Middleware->>DB: Check session exists<br/>and not expired
    DB-->>Middleware: Session record

    alt Session not found or expired
        Middleware-->>Route: 401 Unauthorized
        Route-->>Client: "Session invalid"
    end

    Middleware->>Middleware: Extract user ID from payload
    Middleware->>Route: req.user = {userId}
    Note over Route: User authenticated

    Route->>Handler: Execute route logic
    Handler->>Handler: Use req.user.userId
    Handler-->>Client: 200 OK + Data
```

### Middleware Implementation

```typescript
// JWT Authentication Middleware
export const authenticateJWT = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify JWT signature and expiration
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check session in database
    const session = await Session.findByToken(token);
    if (!session || new Date() > session.expires_at) {
      return res.status(401).json({ error: 'Session expired' });
    }

    // Attach user ID to request
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Protected Routes

**Backend routes requiring authentication:**
```typescript
// All collection endpoints require auth
router.get('/collections', authenticateJWT, listCollections);
router.post('/collections', authenticateJWT, createCollection);
router.get('/collections/:id', authenticateJWT, getCollection);
router.delete('/collections/:id', authenticateJWT, deleteCollection);

// User profile endpoints
router.get('/user/profile', authenticateJWT, getProfile);
router.put('/user/profile', authenticateJWT, updateProfile);
```

**Frontend protected routes:**
```typescript
// Protected routes (redirect to login if not authenticated)
<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
<Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
<Route path="/collections" element={<ProtectedRoute><CollectionsPage /></ProtectedRoute>} />
```

## Logout Flow

### Logout Sequence

```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend
    participant API as Backend API
    participant Model as Session Model
    participant DB as Database

    User->>UI: Click "Sign Out"
    UI->>API: POST /api/auth/logout
    Note over UI,API: Authorization: Bearer <token>

    API->>Model: Session.deleteByToken(token)
    Model->>DB: DELETE FROM sessions<br/>WHERE token = ?
    DB-->>Model: Deleted

    Model-->>API: Success
    API-->>UI: 200 OK

    UI->>UI: Remove token from localStorage
    UI->>UI: Clear user state
    UI->>UI: Redirect to home/login
    UI-->>User: "Logged out"
```

### Logout Implementation

**Backend:**
```typescript
// POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    // Delete session from database
    await Session.deleteByToken(token);

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
};
```

**Frontend:**
```typescript
const handleLogout = async () => {
  try {
    // Call logout endpoint
    await axios.post('/api/auth/logout');

    // Clear local storage
    localStorage.removeItem('token');

    // Clear user state
    setUser(null);

    // Redirect to home
    navigate('/');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
```

## Security Considerations

### Authentication Security Measures

```mermaid
mindmap
  root((Auth Security))
    Password Security
      bcrypt hashing
      Cost factor 12
      Salt per password
      No plaintext storage
    Token Security
      HS256 signing
      1 hour expiration
      Secret key rotation
      Secure random secret
    Session Security
      Database backed
      Expiry tracking
      Cleanup cron job
      Single device logout
    Transport Security
      HTTPS only
      Secure headers
      CORS configured
      No HTTP fallback
    Input Validation
      Zod schemas
      Email format check
      Password strength
      SQL injection prevention
```

### Security Best Practices

**1. Password Storage:**
- ✅ Never store plaintext passwords
- ✅ Use bcrypt with high cost factor (12)
- ✅ Unique salt per password (automatic with bcrypt)
- ✅ Constant-time comparison to prevent timing attacks

**2. JWT Security:**
- ✅ Use strong secret key (256-bit random)
- ✅ Short expiration time (1 hour)
- ✅ Verify signature on every request
- ✅ Store sessions in database for revocation

**3. Token Storage:**
- ⚠️ localStorage (vulnerable to XSS)
- 🔄 **Future**: Consider httpOnly cookies for better security

**4. Rate Limiting:**
- 🔄 **Planned**: Limit login attempts (5 per minute)
- 🔄 **Planned**: Account lockout after failed attempts

**5. HTTPS:**
- ✅ All production traffic over HTTPS
- ✅ HTTP redirects to HTTPS
- ✅ HSTS headers enabled

### Known Security Limitations

| Issue | Risk Level | Mitigation | Status |
|-------|------------|------------|--------|
| localStorage for JWT | Medium | Move to httpOnly cookies | 🔄 Planned |
| No rate limiting | Medium | Add express-rate-limit | 🔄 Planned |
| No 2FA support | Low | Add TOTP in Phase 3 | 📋 Backlog |
| No email verification | Low | Add email service | 📋 Backlog |
| No password reset | Medium | Implement in Sprint 3 | ⏭️ Deferred |

## Related Pages

- [[Architecture]] - Overall system architecture
- [[API-Reference]] - All API endpoints including auth
- [[Database-Schema]] - Users and sessions tables
- [[Development-Guide]] - Testing authentication locally

---

**Last Updated**: 2025-11-17
