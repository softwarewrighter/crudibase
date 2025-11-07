# User Acceptance Testing (UAT) - CRUD Operations

## Overview

This document provides a comprehensive UAT test plan for validating the CRUD (Create, Read, Update, Delete) operations in Crudibase, focusing on Collections management and Wikibase entity search.

**Test Environment**: Development (localhost)
**Prerequisites**: Node.js 22, Backend and Frontend servers running
**Test Data**: Wikidata (live API)

---

## Pre-Test Setup

### 1. Environment Verification

```bash
# CRITICAL: Verify Node version
node -v  # Must show v22.x.x

# If wrong version:
nvm use 22
npm rebuild better-sqlite3 --workspace=src/backend
npm run check-node-version
```

### 2. Start Application

```bash
# Terminal 1: Start both servers
npm run dev

# Or separately:
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

### 3. Verify Services

- Backend: http://localhost:3001/health (should return `{"status":"ok"}`)
- Frontend: http://localhost:3000 (should load homepage)

### 4. Create Test User

Navigate to http://localhost:3000/register and create a test account:

- Email: `uat-test@example.com`
- Password: `TestPass123!`

---

## Test Suite 1: Wikibase Search (READ Operations)

### TC-SEARCH-001: Basic Entity Search

**Objective**: Verify users can search for entities

**Steps**:

1. Login with test credentials
2. Navigate to /search
3. Enter "Einstein" in search bar
4. Click "Search" button

**Expected Results**:

- ✅ Search executes without errors
- ✅ Results appear within 3 seconds
- ✅ At least 5 results displayed
- ✅ First result contains "Einstein" in label
- ✅ Entity IDs are displayed (e.g., Q937)
- ✅ Descriptions are shown

**Status**: [ ] Pass [ ] Fail [ ] Blocked

**Notes**: **********************\_\_\_**********************

---

### TC-SEARCH-002: Search with No Results

**Objective**: Verify system handles searches with no matches

**Steps**:

1. Login and navigate to /search
2. Enter "xyzabc123nonexistent999"
3. Click "Search"

**Expected Results**:

- ✅ No crash or error
- ✅ "No results found" message displayed
- ✅ Suggestion to try different keywords

**Status**: [ ] Pass [ ] Fail [ ] Blocked

**Notes**: **********************\_\_\_**********************

---

### TC-SEARCH-003: Search Result Caching

**Objective**: Verify search results are cached

**Steps**:

1. Login and search for "DNA"
2. Note the response time
3. Search for "DNA" again
4. Note the second response time

**Expected Results**:

- ✅ First search takes 500ms-2s
- ✅ Second search < 100ms (cached)
- ✅ Results are identical

**Status**: [ ] Pass [ ] Fail [ ] Blocked

**Notes**: **********************\_\_\_**********************

---

### TC-SEARCH-004: Authentication Requirement

**Objective**: Verify search requires authentication

**Steps**:

1. Logout
2. Navigate to /search
3. Attempt to search

**Expected Results**:

- ✅ Error message: "Please log in to search"
- ✅ Results not displayed
- ✅ No API call made (check network tab)

**Status**: [ ] Pass [ ] Fail [ ] Blocked

**Notes**: **********************\_\_\_**********************

---

## Test Suite 2: Collections - CREATE Operations

### TC-COLL-CREATE-001: Create Collection via API

**Objective**: Verify users can create collections

**Prerequisites**: Login and get JWT token from localStorage

**Steps**:

```bash
# Get token from browser console: localStorage.getItem('token')
TOKEN="<your-token>"

# Create collection
curl -X POST http://localhost:3001/api/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Scientists","description":"Notable scientists and mathematicians"}'
```

**Expected Results**:

- ✅ HTTP Status: 201 Created
- ✅ Response contains `collection` object
- ✅ Collection has `id`, `name`, `description`, `user_id`, `created_at`
- ✅ `name` matches input
- ✅ `user_id` matches authenticated user

**Status**: [ ] Pass [ ] Fail [ ] Blocked

**Actual Response**: **********************\_\_\_**********************

---

### TC-COLL-CREATE-002: Create Collection Without Description

**Objective**: Verify description is optional

**Steps**:

```bash
curl -X POST http://localhost:3001/api/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Collection"}'
```

**Expected Results**:

- ✅ HTTP Status: 201 Created
- ✅ Collection created successfully
- ✅ `description` is null or empty

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### TC-COLL-CREATE-003: Validation - Empty Name

**Objective**: Verify collection name is required

**Steps**:

```bash
curl -X POST http://localhost:3001/api/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"","description":"Test"}'
```

**Expected Results**:

- ✅ HTTP Status: 400 Bad Request
- ✅ Error message contains "required"
- ✅ No collection created

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### TC-COLL-CREATE-004: Authentication Required

**Objective**: Verify collections require authentication

**Steps**:

```bash
curl -X POST http://localhost:3001/api/collections \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
```

**Expected Results**:

- ✅ HTTP Status: 401 Unauthorized
- ✅ Error code: "UNAUTHORIZED"
- ✅ No collection created

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

## Test Suite 3: Collections - READ Operations

### TC-COLL-READ-001: Get All Collections

**Objective**: Verify users can retrieve their collections

**Prerequisites**: Create 2-3 collections using TC-COLL-CREATE-001

**Steps**:

```bash
curl http://localhost:3001/api/collections \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Results**:

- ✅ HTTP Status: 200 OK
- ✅ Response contains `collections` array
- ✅ Response contains `count` field
- ✅ All created collections returned
- ✅ Collections ordered by `created_at` DESC

**Status**: [ ] Pass [ ] Fail [ ] Blocked

**Collection Count**: **********************\_\_\_**********************

---

### TC-COLL-READ-002: Get Collection by ID

**Objective**: Verify retrieval of specific collection

**Prerequisites**: Note a collection ID from TC-COLL-READ-001

**Steps**:

```bash
COLL_ID=1  # Replace with actual ID
curl http://localhost:3001/api/collections/$COLL_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Results**:

- ✅ HTTP Status: 200 OK
- ✅ Response contains `collection` object
- ✅ Correct collection data returned
- ✅ All fields populated

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### TC-COLL-READ-003: Get Non-Existent Collection

**Objective**: Verify 404 handling

**Steps**:

```bash
curl http://localhost:3001/api/collections/999999 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Results**:

- ✅ HTTP Status: 404 Not Found
- ✅ Error message: "Collection not found"

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

## Test Suite 4: Collections - UPDATE Operations

### TC-COLL-UPDATE-001: Update Collection Name

**Objective**: Verify collection name can be updated

**Prerequisites**: Note a collection ID

**Steps**:

```bash
COLL_ID=1  # Replace with actual ID
curl -X PUT http://localhost:3001/api/collections/$COLL_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'
```

**Expected Results**:

- ✅ HTTP Status: 200 OK
- ✅ Response contains updated collection
- ✅ `name` changed to "Updated Name"
- ✅ Other fields unchanged
- ✅ `updated_at` timestamp updated

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### TC-COLL-UPDATE-002: Update Description

**Objective**: Verify description can be updated

**Steps**:

```bash
curl -X PUT http://localhost:3001/api/collections/$COLL_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"New description text"}'
```

**Expected Results**:

- ✅ HTTP Status: 200 OK
- ✅ Description updated
- ✅ Name unchanged

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### TC-COLL-UPDATE-003: Update Both Name and Description

**Objective**: Verify multiple fields can be updated

**Steps**:

```bash
curl -X PUT http://localhost:3001/api/collections/$COLL_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Final Name","description":"Final description"}'
```

**Expected Results**:

- ✅ HTTP Status: 200 OK
- ✅ Both fields updated correctly

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### TC-COLL-UPDATE-004: Cannot Update Another User's Collection

**Objective**: Verify ownership enforcement

**Prerequisites**: Create second test user, get their collection ID

**Steps**:

```bash
# Try to update first user's collection with second user's token
curl -X PUT http://localhost:3001/api/collections/$COLL_ID \
  -H "Authorization: Bearer $TOKEN_USER2" \
  -H "Content-Type: application/json" \
  -d '{"name":"Hacked"}'
```

**Expected Results**:

- ✅ HTTP Status: 403 Forbidden
- ✅ Error: "Access denied"
- ✅ Collection not modified

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

## Test Suite 5: Collections - DELETE Operations

### TC-COLL-DELETE-001: Delete Collection

**Objective**: Verify collection can be deleted

**Prerequisites**: Create a test collection

**Steps**:

```bash
COLL_ID=2  # Use test collection ID
curl -X DELETE http://localhost:3001/api/collections/$COLL_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Results**:

- ✅ HTTP Status: 200 OK
- ✅ Success message returned
- ✅ Subsequent GET returns 404

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### TC-COLL-DELETE-002: Delete Non-Existent Collection

**Objective**: Verify error handling

**Steps**:

```bash
curl -X DELETE http://localhost:3001/api/collections/999999 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Results**:

- ✅ HTTP Status: 404 Not Found
- ✅ No crash

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### TC-COLL-DELETE-003: Cascade Delete of Items

**Objective**: Verify items are deleted with collection

**Prerequisites**: Create collection, add items (see TC-ITEM-CREATE-001)

**Steps**:

1. Add 2-3 entities to collection
2. Delete the collection
3. Attempt to get collection items

**Expected Results**:

- ✅ Collection deleted
- ✅ Items automatically deleted (cascade)
- ✅ No orphaned records in database

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

## Test Suite 6: Collection Items - CRUD Operations

### TC-ITEM-CREATE-001: Add Entity to Collection

**Objective**: Verify entities can be added to collections

**Prerequisites**: Have a collection ID

**Steps**:

```bash
COLL_ID=1  # Replace with actual ID
curl -X POST http://localhost:3001/api/collections/$COLL_ID/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entity_id":"Q937",
    "entity_label":"Albert Einstein",
    "entity_description":"German-born theoretical physicist"
  }'
```

**Expected Results**:

- ✅ HTTP Status: 201 Created
- ✅ Response contains `item` object
- ✅ Item has `id`, `collection_id`, `entity_id`, `entity_label`, `added_at`
- ✅ Data matches input

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### TC-ITEM-CREATE-002: Prevent Duplicate Entities

**Objective**: Verify duplicate prevention

**Prerequisites**: Use collection from TC-ITEM-CREATE-001

**Steps**:

```bash
# Try to add Q937 again
curl -X POST http://localhost:3001/api/collections/$COLL_ID/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entity_id":"Q937","entity_label":"Albert Einstein"}'
```

**Expected Results**:

- ✅ HTTP Status: 409 Conflict
- ✅ Error: "Entity already in collection"
- ✅ No duplicate created

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### TC-ITEM-READ-001: Get All Items in Collection

**Objective**: Verify retrieval of collection items

**Prerequisites**: Add 2-3 entities to collection

**Steps**:

```bash
curl http://localhost:3001/api/collections/$COLL_ID/items \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Results**:

- ✅ HTTP Status: 200 OK
- ✅ Response contains `items` array
- ✅ Response contains `count` field
- ✅ All added items returned
- ✅ Items ordered by `added_at` DESC

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

### TC-ITEM-DELETE-001: Remove Entity from Collection

**Objective**: Verify entity removal

**Prerequisites**: Collection with entities

**Steps**:

```bash
curl -X DELETE http://localhost:3001/api/collections/$COLL_ID/items/Q937 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Results**:

- ✅ HTTP Status: 200 OK
- ✅ Success message
- ✅ Item no longer in collection (verify with GET)

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

## Test Suite 7: End-to-End User Workflows

### TC-E2E-001: Complete CRUD Workflow

**Objective**: Test full user journey

**Steps**:

1. Register new user
2. Login
3. Search for "Einstein"
4. Create collection "Physicists"
5. Add Einstein (Q937) to collection
6. Add Newton (Q7186) to collection
7. Get all collections
8. Get collection items
9. Remove Newton from collection
10. Update collection name to "Famous Physicists"
11. Delete collection

**Expected Results**:

- ✅ All operations succeed
- ✅ No errors in console
- ✅ Data integrity maintained
- ✅ Final state: collection deleted

**Status**: [ ] Pass [ ] Fail [ ] Blocked

**Notes**: **********************\_\_\_**********************

---

### TC-E2E-002: Multiple Collections Management

**Objective**: Test managing multiple collections

**Steps**:

1. Create 3 collections: "Scientists", "Cities", "Concepts"
2. Add 2 entities to each collection
3. Verify all collections appear in list
4. Update one collection
5. Delete one collection
6. Verify other collections unaffected

**Expected Results**:

- ✅ All collections independent
- ✅ No cross-contamination
- ✅ Correct counts maintained

**Status**: [ ] Pass [ ] Fail [ ] Blocked

---

## Test Summary Report

### Execution Summary

| Test Suite        | Total  | Passed | Failed | Blocked | Pass %  |
| ----------------- | ------ | ------ | ------ | ------- | ------- |
| Search (READ)     | 4      | \_     | \_     | \_      | \_%     |
| Collection CREATE | 4      | \_     | \_     | \_      | \_%     |
| Collection READ   | 3      | \_     | \_     | \_      | \_%     |
| Collection UPDATE | 4      | \_     | \_     | \_      | \_%     |
| Collection DELETE | 3      | \_     | \_     | \_      | \_%     |
| Items CRUD        | 4      | \_     | \_     | \_      | \_%     |
| E2E Workflows     | 2      | \_     | \_     | \_      | \_%     |
| **TOTAL**         | **24** | **\_** | **\_** | **\_**  | **\_%** |

### Critical Issues Found

1. ***
2. ***
3. ***

### Non-Critical Issues

1. ***
2. ***

### Recommendations

1. ***
2. ***
3. ***

### Sign-Off

- Tester Name: **********************\_\_\_**********************
- Date: **********************\_\_\_**********************
- Environment: Development (Node 22, localhost)
- Overall Assessment: [ ] Ready for Production [ ] Needs Work [ ] Major Issues

---

## Appendix: Quick Reference

### Get JWT Token

```javascript
// In browser console after login:
localStorage.getItem('token');
```

### Create Test Data Script

```bash
#!/bin/bash
TOKEN="your-token-here"
BASE_URL="http://localhost:3001"

# Create collections
curl -X POST $BASE_URL/api/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Collection 1"}'

curl -X POST $BASE_URL/api/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Collection 2"}'

echo "Test data created"
```

### Cleanup Script

```bash
#!/bin/bash
# Reset test database
rm src/backend/data/crudibase.db
npm run dev:backend
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-07
**Author**: Michael A. Wright
