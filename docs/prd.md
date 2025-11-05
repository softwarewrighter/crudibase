# Product Requirements Document (PRD)

## Product Vision

**Crudibase** is a user-friendly web application that makes exploring Wikibase knowledge graphs accessible and engaging for everyone. By combining intuitive search, visual discovery tools, and personalized collections, Crudibase transforms raw structured data into meaningful insights.

## Problem Statement

Wikibase (particularly Wikidata) contains vast amounts of structured knowledge, but:
- The official interface is technical and intimidating for casual users
- SPARQL queries require specialized knowledge
- No built-in way to save personal discoveries or organize findings
- Difficult to visualize relationships between entities
- No personalized experience or user accounts

## Target Users

### Primary Personas

**1. The Curious Explorer (Sarah)**
- Age: 25-40
- Background: College-educated, tech-comfortable
- Goals: Learn new things, discover interesting connections
- Pain Points: Overwhelmed by complex interfaces, needs guided exploration
- Use Cases: Exploring topics of interest, discovering related entities

**2. The Research Assistant (Marcus)**
- Age: 22-30
- Background: Graduate student or junior researcher
- Goals: Find and organize factual data for research
- Pain Points: Needs to track sources, compare entities, export data
- Use Cases: Gathering citations, comparing historical figures, timeline analysis

**3. The Data Enthusiast (Priya)**
- Age: 30-50
- Background: Analyst, journalist, or hobbyist data person
- Goals: Uncover patterns, visualize trends, share findings
- Pain Points: Wants visual tools, not just text lists
- Use Cases: Creating visualizations, analyzing trends, building custom datasets

## Core Features

### Phase 1: MVP (Minimum Viable Product)

#### 1. User Authentication
- **Register**: Email + password registration with validation
- **Login**: Secure JWT-based authentication
- **Logout**: Clear session and tokens
- **Password Reset**: Email-based forgot/reset password flow
- **Success Criteria**: Users can create accounts and access protected features

#### 2. Basic Entity Search
- **Text Search**: Search Wikibase entities by name/label
- **Results Display**: Show entity ID, label, description, thumbnail
- **Entity Details**: Click to view full entity page with properties
- **Success Criteria**: Users can find entities within 3 seconds

#### 3. Personal Collections
- **Save Entities**: Bookmark favorite entities to personal collection
- **Organize**: Create named collections (e.g., "Favorite Scientists")
- **Notes**: Add personal notes to saved entities
- **Success Criteria**: Users save at least 3 entities per session

#### 4. API Token Management
- **Store Tokens**: Securely store Wikibase API tokens (if needed)
- **Token Settings**: Simple UI to add/update/remove tokens
- **Success Criteria**: Users can configure tokens without support

### Phase 2: Enhanced Discovery

#### 5. Visual Relationship Explorer
- **Graph View**: Interactive node-graph showing entity relationships
- **Expand Nodes**: Click to explore connected entities
- **Filter Edges**: Show only specific relationship types (e.g., "influenced by")
- **Export**: Download graph as image or data file
- **Success Criteria**: 50% of users interact with graph view

#### 6. Smart Query Builder (No-Code SPARQL)
- **Visual Builder**: Drag-and-drop interface for constructing queries
- **Templates**: Pre-built queries (e.g., "All Nobel Prize winners in Physics")
- **Save Queries**: Store frequently-used queries
- **Share Queries**: Public URL for sharing custom queries
- **Success Criteria**: Non-technical users successfully build queries

#### 7. Timeline Visualizer
- **Historical Events**: Display entities with dates on interactive timeline
- **Filtering**: Filter by entity type, date range, location
- **Narrative Mode**: Auto-scroll through chronological story
- **Success Criteria**: Users spend 5+ minutes exploring timelines

#### 8. Entity Comparison Tool
- **Side-by-Side**: Compare properties of 2-4 entities
- **Highlight Differences**: Visual emphasis on unique attributes
- **Common Connections**: Show shared relationships
- **Export Table**: Download comparison as CSV/JSON
- **Success Criteria**: Used in 20% of sessions

### Phase 3: Advanced Features

#### 9. Trending & Discovery Dashboard
- **Trending Entities**: Most-queried entities this week
- **Random Discovery**: "Surprise me" button for serendipity
- **Recommended**: Personalized suggestions based on saved collections
- **Success Criteria**: 30% click-through on recommendations

#### 10. Collaborative Features
- **Public Collections**: Share collections with public URL
- **Comments**: Community discussion on collections
- **Upvotes**: Vote on interesting collections
- **Success Criteria**: 10% of users create public collections

#### 11. Data Export & Analysis
- **Batch Export**: Download multiple entities as JSON/CSV/RDF
- **API Access**: Personal API for programmatic access
- **Jupyter Integration**: Export to notebook-ready format
- **Success Criteria**: Power users export data weekly

#### 12. Google OAuth Integration
- **Social Login**: "Sign in with Google" button
- **Faster Onboarding**: Reduce registration friction
- **Success Criteria**: 60% of new users choose OAuth

## Valuable UI Ideas for Wikibase

### 1. Knowledge Graph Explorer (Priority: High)
**Visual network diagram showing:**
- Central entity as main node
- Connected entities as surrounding nodes
- Relationship types as labeled edges
- Interactive zoom, pan, expand/collapse
- Color coding by entity type (person, place, concept)

**Value**: Makes abstract relationships tangible and explorable

### 2. "Six Degrees of Separation" Tool (Priority: Medium)
**Find shortest path between any two entities:**
- Input: Two entity names
- Output: Visual chain showing connections
- Example: "Connect Albert Einstein to Taylor Swift"

**Value**: Gamified learning, surprising discoveries

### 3. Timeline Story Builder (Priority: High)
**Create narratives from historical data:**
- Select entities with time properties
- Auto-generate chronological visualization
- Add custom annotations
- Export as presentation or video

**Value**: Educational tool for teachers, students, content creators

### 4. Entity "DNA" View (Priority: Medium)
**Radial visualization of entity properties:**
- Center: Entity name/image
- Rings: Property categories (biographical, works, relationships)
- Segments: Individual properties
- Interactive drill-down

**Value**: Quickly grasp entity's essential characteristics

### 5. Comparison Matrix (Priority: High)
**Compare multiple entities side-by-side:**
- Table view with entity columns
- Property rows (birth date, nationality, occupation)
- Visual indicators for shared/unique properties
- Sort and filter properties

**Value**: Research, decision-making, learning

### 6. "Rabbit Hole" Mode (Priority: Low)
**Guided serendipitous exploration:**
- Start with any entity
- System suggests interesting connected entities
- Breadcrumb trail shows exploration path
- "Go deeper" or "start over" options

**Value**: Entertainment, accidental learning

### 7. Trending Topics Dashboard (Priority: Medium)
**Real-time popularity metrics:**
- Most-searched entities today/this week
- Rising topics
- Seasonal trends (e.g., historical figures on anniversaries)
- Geographic heat map of popular queries

**Value**: Cultural awareness, news context

### 8. Personal Knowledge Map (Priority: High)
**Your saved entities as a graph:**
- All bookmarked entities connected by relationships
- Identify clusters and patterns in your interests
- Share your knowledge map publicly
- Discover what you haven't explored yet

**Value**: Self-reflection, portfolio building, social sharing

## Non-Functional Requirements

### Performance
- Page load time < 2 seconds
- Search results appear < 1 second
- Graph visualizations render < 3 seconds
- Support 100 concurrent users (Phase 1)

### Security
- All passwords hashed with bcrypt (cost >= 12)
- JWT tokens expire after 1 hour
- HTTPS only in production
- Rate limiting on auth endpoints (5 attempts/15 minutes)
- Input validation on all forms
- SQL injection protection via parameterized queries

### Usability
- Mobile-responsive design (works on phones/tablets)
- WCAG 2.1 AA accessibility compliance
- No more than 3 clicks to any feature
- Inline help text and tooltips

### Reliability
- 99% uptime
- Automated daily database backups
- Graceful error handling with user-friendly messages
- Fallback for Wikibase API downtime (cached data)

## Success Metrics (KPIs)

### Engagement
- **Daily Active Users (DAU)**: 50+ by end of Phase 1
- **Session Length**: Average 8+ minutes
- **Return Rate**: 40% of users return within 7 days

### Feature Adoption
- **Collections**: 70% of registered users save at least one entity
- **Graph Explorer**: 50% of users try visual graph
- **Query Builder**: 20% of users create custom query

### Growth
- **New Registrations**: 10+ per week (Phase 1)
- **Referral Rate**: 15% of users share public collections

### Quality
- **Error Rate**: < 1% of requests fail
- **Search Satisfaction**: 80% find desired entity in first 3 results
- **NPS Score**: 40+ (Net Promoter Score)

## Out of Scope (For Now)

- Real-time collaboration (multi-user editing)
- Mobile native apps (iOS/Android)
- Wikibase hosting/editing (read-only access)
- Machine learning recommendations (simple heuristics OK)
- Multi-language UI (English only initially)
- Enterprise features (teams, SSO, audit logs)

## Launch Criteria

### Phase 1 (MVP) Ready When:
- All core features (1-4) implemented and tested
- Zero critical bugs, < 5 minor bugs
- Documentation complete (user guide, API docs)
- Performance benchmarks met
- Security audit passed
- 5 beta testers provide positive feedback

## Timeline Estimate

- **Phase 1 (MVP)**: 8-10 weeks
- **Phase 2 (Enhanced)**: 6-8 weeks
- **Phase 3 (Advanced)**: 8-10 weeks

Total: ~6 months for full feature set
