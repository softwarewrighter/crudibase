#!/bin/bash

# Crudibase Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up Crudibase development environment..."
echo ""

# Check Node.js version
echo "📋 Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "   Node.js version: $NODE_VERSION"

if [[ ! "$NODE_VERSION" =~ ^v(18|19|20|21) ]]; then
  echo "   ⚠️  Warning: Node.js 18+ is recommended"
fi

# Install root dependencies
echo ""
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd src/backend
npm install
cd ../..

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd src/frontend
npm install
cd ../..

# Setup Husky
echo ""
echo "🪝 Setting up Husky pre-commit hooks..."
npx husky install

# Create .env files from examples
echo ""
echo "📝 Creating .env files from examples..."

if [ ! -f "src/backend/.env" ]; then
  cp src/backend/.env.example src/backend/.env
  echo "   ✅ Created src/backend/.env"
else
  echo "   ℹ️  src/backend/.env already exists"
fi

if [ ! -f "src/frontend/.env" ]; then
  cp src/frontend/.env.example src/frontend/.env
  echo "   ✅ Created src/frontend/.env"
else
  echo "   ℹ️  src/frontend/.env already exists"
fi

# Create data directory for database
echo ""
echo "📁 Creating data directory..."
mkdir -p src/backend/data
echo "   ✅ Created src/backend/data"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Review and update .env files if needed"
echo "  2. Run 'npm run dev' to start development servers"
echo "  3. Backend will run on http://localhost:3001"
echo "  4. Frontend will run on http://localhost:3000"
echo ""
echo "Useful commands:"
echo "  npm run dev           - Start both servers"
echo "  npm run test          - Run all tests"
echo "  npm run lint          - Lint all code"
echo "  npm run format        - Format all code"
echo ""
