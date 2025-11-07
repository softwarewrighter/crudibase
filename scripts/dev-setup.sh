#!/bin/bash

# Crudibase Development Setup with NVM
# This script ensures Node.js 22 is used via nvm before setup

set -e

echo "🚀 Crudibase Development Setup with NVM"
echo ""

# Check if nvm is installed
if ! command -v nvm &> /dev/null; then
  # Try to load nvm from common locations
  if [ -f "$HOME/.nvm/nvm.sh" ]; then
    echo "📦 Loading nvm from ~/.nvm/nvm.sh..."
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  elif [ -f "/usr/local/opt/nvm/nvm.sh" ]; then
    echo "📦 Loading nvm from /usr/local/opt/nvm/nvm.sh..."
    export NVM_DIR="/usr/local/opt/nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  else
    echo "❌ Error: nvm not found"
    echo ""
    echo "Please install nvm first:"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash"
    echo ""
    echo "Or install Node.js 22 LTS manually:"
    echo "  https://nodejs.org/"
    exit 1
  fi
fi

# Check current Node version
CURRENT_NODE_VERSION=$(node -v 2>/dev/null || echo "none")
CURRENT_NODE_MAJOR=$(echo "$CURRENT_NODE_VERSION" | cut -d'.' -f1 | sed 's/v//')

echo "📋 Current Node.js version: $CURRENT_NODE_VERSION"
echo ""

# Check if Node 22 is already active
if [[ "$CURRENT_NODE_MAJOR" -eq 22 ]]; then
  echo "✅ Node.js 22 is already active"
  echo ""
else
  echo "🔄 Switching to Node.js 22 LTS..."

  # Check if Node 22 is installed
  if ! nvm ls 22 &> /dev/null; then
    echo "📥 Node.js 22 not found, installing..."
    nvm install 22
  fi

  # Switch to Node 22
  nvm use 22

  NEW_NODE_VERSION=$(node -v)
  echo "✅ Switched to Node.js $NEW_NODE_VERSION"
  echo ""
fi

# Verify we're on Node 22
NODE_VERSION=$(node -v)
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'.' -f1 | sed 's/v//')

if [[ "$NODE_MAJOR" -ne 22 ]]; then
  echo "❌ Error: Failed to switch to Node.js 22 (current: $NODE_VERSION)"
  exit 1
fi

# Check if better-sqlite3 needs rebuilding
echo "🔍 Checking better-sqlite3 compatibility..."
NEEDS_REBUILD=false

# Check if node_modules exists
if [ -d "src/backend/node_modules/better-sqlite3" ]; then
  # Try to require better-sqlite3 and check for version mismatch
  cd src/backend
  if ! node -e "require('better-sqlite3')" 2>/dev/null; then
    echo "⚠️  better-sqlite3 needs to be rebuilt for Node.js $NODE_VERSION"
    NEEDS_REBUILD=true
  else
    echo "✅ better-sqlite3 is compatible"
  fi
  cd ../..
else
  echo "ℹ️  better-sqlite3 not yet installed"
fi

# Rebuild better-sqlite3 if needed
if [ "$NEEDS_REBUILD" = true ]; then
  echo ""
  echo "🔨 Rebuilding better-sqlite3..."
  npm rebuild better-sqlite3 --workspace=src/backend
  echo "✅ better-sqlite3 rebuilt successfully"
fi

echo ""
echo "🎯 Running main setup script..."
echo ""

# Run the main setup script
./scripts/setup.sh

echo ""
echo "✅ Development setup complete with Node.js $NODE_VERSION!"
echo ""
echo "⚠️  IMPORTANT: To ensure you always use Node.js 22, add this to your shell profile:"
echo ""
echo "  # Auto-load correct Node version when entering crudibase directory"
echo "  echo '22' > .nvmrc"
echo "  # Then nvm will auto-switch when you cd into this directory"
echo ""
