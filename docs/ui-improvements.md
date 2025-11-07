# UI Improvements Backlog

**Last Updated**: 2025-11-07

## Overview

This document tracks planned UI/UX improvements identified during development and user testing. These enhancements are prioritized to be implemented after the MVP deployment.

---

## Collections Page Enhancements

**Priority**: High
**Effort**: Medium (1-2 days)
**Status**: Backlog

### Current State

The Collections page displays a grid of collection cards with:

- Collection name
- Creation date
- Basic card styling

**Screenshot Reference**: `tmp/screenshot.png` (captured 2025-11-07)

### Identified Improvements

#### 1. Add Item Count to Collection Cards

**Priority**: High
**Effort**: Low

Display the number of items in each collection prominently on the card.

**Implementation**:

- Add item count to API response in `GET /api/collections`
- Display as badge or subtitle on collection card
- Format as "5 items" or "1 item"

**Mockup**:

```
┌─────────────────────────┐
│ Famous Scientists    [12]│
│                          │
│ Created 11/7/2025        │
└─────────────────────────┘
```

---

#### 2. Add "Create Collection" Button

**Priority**: High
**Effort**: Medium

Currently users can only create collections from the search page. Add a prominent button to create collections directly from the Collections page.

**Implementation**:

- Add "+ New Collection" button next to "My Collections" heading
- Create modal or inline form for collection creation
- Support name and optional description fields

**Mockup**:

```
My Collections                [+ New Collection]
─────────────────────────────────────────────
Organize and manage your Wikibase entities
```

---

#### 3. Add Page Statistics

**Priority**: Medium
**Effort**: Low

Show summary statistics at the top of the page.

**Implementation**:

- Calculate total collections count
- Calculate total items across all collections
- Display in header area

**Mockup**:

```
My Collections

3 collections • 24 total items
```

---

#### 4. Enhance Card Information Hierarchy

**Priority**: Medium
**Effort**: Low

Improve visual hierarchy to emphasize important information.

**Changes**:

- Make collection name larger and bolder
- Add item count badge (colorful, prominent)
- Show "Last updated" instead of or in addition to "Created"
- De-emphasize less important dates

**Before**:

```
ML
Created 11/7/2025
```

**After**:

```
ML                          [5 items]

Updated 2 hours ago
Created 11/7/2025
```

---

#### 5. Add Icons and Visual Distinction

**Priority**: Medium
**Effort**: Low

Make collection cards more visually distinctive and easier to scan.

**Implementation**:

- Add collection icon (folder, book, or custom)
- Use colored badges for item counts
- Improve hover state (subtle shadow, scale, or border)
- Add empty state icon if collection has 0 items

---

#### 6. Add Quick Actions to Cards

**Priority**: High
**Effort**: Medium

Allow users to perform actions without opening the collection detail page.

**Actions to Add**:

- View button (explicit CTA)
- Delete icon/button (with confirmation)
- Share button (Phase 3 feature)
- Edit name/description (inline or modal)

**Implementation**:

- Add action buttons in card footer or corner
- Use icon buttons with tooltips
- Ensure delete requires confirmation
- Maintain accessibility (keyboard navigation)

**Mockup**:

```
┌─────────────────────────────────┐
│ Famous Scientists          [12] │
│                                  │
│ Updated 2 hours ago              │
│                                  │
│ [View] [Edit] [Delete]           │
└─────────────────────────────────┘
```

---

#### 7. Add Item Previews

**Priority**: Low
**Effort**: Medium

Show a preview of the first few items in the collection on hover or always visible.

**Implementation**:

- Fetch first 3 items with collection data (or separate hover API call)
- Display as small chips or list
- Show "and X more" if >3 items

**Mockup**:

```
┌─────────────────────────────────────┐
│ Famous Scientists              [12] │
│                                      │
│ Albert Einstein • Marie Curie •      │
│ Isaac Newton • +9 more               │
│                                      │
│ Updated 2 hours ago                  │
└─────────────────────────────────────┘
```

---

## Collection Detail Page Enhancements

**Priority**: Medium
**Effort**: Low (30 mins - 1 hour)
**Status**: Backlog

### Current Issues

- "Added" dates show "Invalid Date" for collection items

### Improvements

#### 1. Fix "Invalid Date" Display

**Priority**: High (Bug Fix)
**Effort**: Very Low

Currently shows "Added Invalid Date" for collection items.

**Root Cause**: Date format parsing issue in CollectionDetailPage.tsx
**Fix**: Update date formatting logic to handle database date format

**File**: `src/frontend/src/pages/CollectionDetailPage.tsx`

---

#### 2. Add Bulk Actions

**Priority**: Medium
**Effort**: Medium

Allow users to select multiple items and perform batch operations.

**Actions**:

- Delete selected items
- Move to another collection
- Export selected items

---

#### 3. Add Search/Filter Within Collection

**Priority**: Low
**Effort**: Medium

For large collections, allow users to search or filter items.

**Implementation**:

- Client-side filtering for <50 items
- Server-side search for larger collections
- Filter by entity type or properties

---

## Search Page Enhancements

**Priority**: Low
**Effort**: Low
**Status**: Backlog

### Improvements

#### 1. Add Search History

**Priority**: Low
**Effort**: Low

Show recent searches for quick access.

---

#### 2. Add Saved Searches

**Priority**: Low
**Effort**: Medium

Allow users to save and name frequently used searches.

---

## Navigation & Global UI

**Priority**: Medium
**Effort**: Low
**Status**: Backlog

### Improvements

#### 1. Add User Menu/Avatar

**Priority**: Medium
**Effort**: Low

Replace plain "Sign Out" button with user menu.

**Menu Items**:

- User email/name
- Settings
- Collections (quick link)
- Sign Out

---

#### 2. Add Breadcrumbs

**Priority**: Low
**Effort**: Low

Add breadcrumb navigation for deeper pages (e.g., Collection Detail).

**Example**: Home > Collections > Famous Scientists

---

## Dashboard/Home Page

**Priority**: Low
**Effort**: Medium
**Status**: Planned (not yet implemented)

### Planned Features

- Recent activity feed
- Quick stats (total collections, items, recent searches)
- Featured collections
- Trending entities (requires analytics)

---

## Implementation Priority Order

### Phase 1: Post-Deployment Quick Wins (1-2 days)

1. ✅ Fix "Invalid Date" bug on collection items
2. Add item counts to collection cards
3. Add "Create Collection" button
4. Improve card visual hierarchy
5. Add page statistics

### Phase 2: Enhanced Interactivity (2-3 days)

6. Add quick actions to collection cards
7. Add user menu/avatar
8. Add item previews on hover
9. Add bulk actions on detail page

### Phase 3: Advanced Features (4-5 days)

10. Add search/filter within collections
11. Add breadcrumbs navigation
12. Add search history
13. Build Dashboard/Home page

---

## Design System Notes

### Colors

- Primary: Blue (current theme color)
- Success: Green (for confirmations)
- Warning: Yellow/Orange (for confirmations)
- Danger: Red (for destructive actions)

### Typography

- Headings: Font weight 700 (bold)
- Body: Font weight 400 (normal)
- Emphasized: Font weight 600 (semi-bold)

### Spacing

- Card padding: 1.5rem (current)
- Grid gap: 1.5rem (current)
- Keep consistent with current Tailwind spacing scale

---

## Accessibility Considerations

All UI improvements must maintain or improve accessibility:

- Maintain keyboard navigation
- Ensure ARIA labels on icon buttons
- Preserve color contrast ratios (WCAG AA)
- Add focus indicators
- Support screen readers

---

## Testing Requirements

Each UI improvement requires:

1. Manual visual testing in browser
2. Responsive design testing (mobile, tablet, desktop)
3. Playwright E2E test for user workflows
4. Accessibility audit (keyboard nav, screen reader)

---

## References

- Screenshot: `tmp/screenshot.png` (Collections page state as of 2025-11-07)
- Relevant files:
  - `src/frontend/src/pages/CollectionsPage.tsx`
  - `src/frontend/src/pages/CollectionDetailPage.tsx`
  - `src/backend/src/routes/collections.ts`

---

## Notes

- These improvements are based on initial review of the Collections page
- Additional improvements may be identified during user testing
- Prioritize user feedback over these planned improvements
- Keep mobile-first responsive design in mind
- Maintain consistency with existing UI patterns

---

**Next Review**: After first round of user testing on deployed MVP
