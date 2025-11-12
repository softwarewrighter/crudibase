#!/bin/bash

# Deploy to DigitalOcean Container Registry
# This script builds and pushes Docker images to DO registry

set -e  # Exit on error

REGISTRY="registry.digitalocean.com/crudibase-registry"
BACKEND_IMAGE="${REGISTRY}/crudibase-backend:latest"
FRONTEND_IMAGE="${REGISTRY}/crudibase-frontend:latest"

echo "🚀 Starting deployment to DigitalOcean Container Registry..."
echo ""

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo "❌ Error: doctl is not installed"
    echo "Install it with: brew install doctl"
    exit 1
fi

# Authenticate with registry
echo "🔐 Authenticating with DigitalOcean Container Registry..."
if ! doctl registry login; then
    echo "❌ Failed to authenticate with registry"
    echo "Run 'doctl auth init' first to authenticate with DigitalOcean"
    exit 1
fi
echo "✅ Authentication successful"
echo ""

# Build images
echo "🔨 Building Docker images..."
echo "Building backend..."
docker build -f src/backend/Dockerfile -t "${BACKEND_IMAGE}" .
echo "✅ Backend image built"
echo ""

echo "Building frontend..."
docker build -f src/frontend/Dockerfile -t "${FRONTEND_IMAGE}" .
echo "✅ Frontend image built"
echo ""

# Push images
echo "📤 Pushing images to registry..."
echo "Pushing backend..."
docker push "${BACKEND_IMAGE}"
echo "✅ Backend image pushed"
echo ""

echo "Pushing frontend..."
docker push "${FRONTEND_IMAGE}"
echo "✅ Frontend image pushed"
echo ""

# Verify
echo "🔍 Verifying images in registry..."
doctl registry repository list-v2
echo ""

echo "✅ Deployment complete!"
echo ""
echo "Images deployed:"
echo "  - ${BACKEND_IMAGE}"
echo "  - ${FRONTEND_IMAGE}"
echo ""
echo "To pull these images on your server:"
echo "  docker pull ${BACKEND_IMAGE}"
echo "  docker pull ${FRONTEND_IMAGE}"
