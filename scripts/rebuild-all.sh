#!/bin/bash

# Rebuild all dependencies with Node 22
# This script ensures the correct Node version is used for native module compilation

set -e  # Exit on error

echo "🔧 Rebuilding Crudibase dependencies with Node 22..."

# Load nvm
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
else
  echo "❌ nvm not found. Please install nvm first."
  exit 1
fi

# Switch to Node 22
echo "📦 Switching to Node 22..."
nvm use 22

# Verify Node version
NODE_VERSION=$(node -v)
if [[ ! "$NODE_VERSION" =~ ^v22\. ]]; then
  echo "❌ ERROR: Node version is $NODE_VERSION, expected v22.x.x"
  exit 1
fi

echo "✅ Using Node $NODE_VERSION"

# Remove node_modules
echo "🗑️  Removing old node_modules..."
rm -rf node_modules src/backend/node_modules src/frontend/node_modules

# Clean install
echo "📥 Installing dependencies..."
npm install

echo ""
echo "✅ Rebuild complete!"
echo "🚀 You can now run: npm run dev"
