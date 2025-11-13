#!/bin/bash

# Deploy to DigitalOcean Container Registry (AMD64 only - faster builds)
# Use this for server-only deployment (no ARM64 support needed)

set -e  # Exit on error

REGISTRY="registry.digitalocean.com/crudibase-registry"
BACKEND_IMAGE="${REGISTRY}/crudibase-backend:latest"
FRONTEND_IMAGE="${REGISTRY}/crudibase-frontend:latest"

echo "🚀 Starting AMD64-only deployment to DigitalOcean Container Registry..."
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

# Build AMD64-only images using buildx
echo "🔨 Building AMD64 Docker images (linux/amd64)..."
echo ""

# Create buildx builder if it doesn't exist
if ! docker buildx inspect crudibase-builder &> /dev/null; then
    echo "Creating buildx builder..."
    docker buildx create --name crudibase-builder --use
    docker buildx inspect --bootstrap
fi

echo "Building and pushing backend..."
docker buildx build \
    --platform linux/amd64 \
    --file src/backend/Dockerfile \
    --tag "${BACKEND_IMAGE}" \
    --push \
    .
echo "✅ Backend image built and pushed"
echo ""

echo "Building and pushing frontend..."
docker buildx build \
    --platform linux/amd64 \
    --file src/frontend/Dockerfile \
    --tag "${FRONTEND_IMAGE}" \
    --push \
    .
echo "✅ Frontend image built and pushed"
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
echo "To deploy on your server:"
echo "  ssh root@YOUR_DROPLET_IP"
echo "  cd /opt/crudibase"
echo "  docker compose -f docker-compose.prod.yml pull"
echo "  docker compose -f docker-compose.prod.yml up -d"
echo ""
