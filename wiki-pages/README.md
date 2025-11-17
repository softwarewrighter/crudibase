# Wiki Pages for Crudibase

This directory contains comprehensive wiki documentation for the Crudibase project.

## Pages Created

1. **Home.md** - Main wiki overview with navigation
2. **Architecture.md** - System architecture with block diagrams
3. **Authentication-Flow.md** - Detailed auth sequence diagrams
4. **Wikibase-Integration.md** - Wikibase API integration flows
5. **Collections-System.md** - Collections CRUD operations
6. **Database-Schema.md** - Database schema with ER diagrams
7. **API-Reference.md** - Complete REST API documentation
8. **Deployment-Architecture.md** - Production deployment setup
9. **Component-Hierarchy.md** - Frontend component organization
10. **Development-Guide.md** - Setup and development workflow

## Deploying to GitHub Wiki

### Option 1: Via GitHub Web Interface

1. Go to https://github.com/softwarewrighter/crudibase/wiki
2. Click "Create the first page" to initialize the wiki
3. For each markdown file:
   - Click "New Page"
   - Copy the filename (without .md) as the page title
   - Paste the content from the file
   - Save

### Option 2: Via Git (Recommended)

```bash
# 1. Initialize wiki on GitHub first
# Visit https://github.com/softwarewrighter/crudibase/wiki
# Click "Create the first page" and save it

# 2. Clone the wiki repository
git clone https://github.com/softwarewrighter/crudibase.wiki.git
cd crudibase.wiki

# 3. Copy all wiki pages
cp /path/to/crudibase/wiki-pages/*.md .

# 4. Commit and push
git add .
git commit -m "docs: add comprehensive wiki documentation with diagrams"
git push origin master
```

### Option 3: Automated Script

```bash
#!/bin/bash
# deploy-wiki.sh

WIKI_DIR="/path/to/crudibase.wiki"
SOURCE_DIR="/path/to/crudibase/wiki-pages"

# Clone wiki repo if it doesn't exist
if [ ! -d "$WIKI_DIR" ]; then
    git clone https://github.com/softwarewrighter/crudibase.wiki.git "$WIKI_DIR"
fi

cd "$WIKI_DIR"

# Copy all markdown files
cp "$SOURCE_DIR"/*.md .

# Commit and push
git add .
git commit -m "docs: update wiki documentation"
git push origin master

echo "✅ Wiki updated successfully!"
```

## Features

### Mermaid Diagrams

All pages include **Mermaid diagrams** that render automatically on GitHub:

- **Architecture diagrams** - System component interactions
- **Sequence diagrams** - Authentication, search, CRUD flows
- **ER diagrams** - Database schema relationships
- **State diagrams** - Token lifecycle, cache states
- **Flowcharts** - Decision trees and processes

### Navigation

The **Home** page includes comprehensive navigation with links to all other pages using wiki link syntax: `[[Page-Name]]`

### Cross-References

Pages are cross-referenced for easy navigation:
- Architecture → Authentication Flow, Database Schema
- API Reference → Authentication Flow, Collections System
- Development Guide → Architecture, Component Hierarchy

## Maintenance

When updating the wiki:

1. Edit the source files in `wiki-pages/`
2. Test Mermaid syntax locally if possible
3. Push changes to GitHub wiki repository
4. Verify rendering on GitHub

## Preview Locally (Optional)

To preview Mermaid diagrams locally:

```bash
# Install Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Convert diagram to image
mmdc -i diagram.mmd -o diagram.png

# Or use online editor
# https://mermaid.live/
```

## Notes

- All diagrams use **Mermaid syntax** (supported natively by GitHub)
- Pages use **GitHub-flavored Markdown**
- Internal links use `[[Page-Name]]` syntax
- External links use standard `[text](url)` syntax
- Last updated date included in each page footer

---

**Created**: 2025-11-17
**Total Pages**: 10
**Total Diagrams**: 40+
