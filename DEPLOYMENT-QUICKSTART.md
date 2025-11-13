# Deployment Quick Start Guide

Quick guide to deploy Crudibase to your DigitalOcean droplet with SSL.

## Prerequisites

- ✅ DigitalOcean droplet with Docker installed
- ✅ Domain: `codingtech.info` pointing to droplet IP
- ✅ DNS records configured (see below)
- ✅ DigitalOcean Container Registry: `crudibase-registry`

## DNS Configuration

Configure these DNS records at your domain registrar:

```
Type    Name                Value (Droplet IP)   TTL
----    ----                ------------------   ----
A       codingtech.info     YOUR_DROPLET_IP      3600
A       crudibase           YOUR_DROPLET_IP      3600
A       api.crudibase       YOUR_DROPLET_IP      3600
A       traefik             YOUR_DROPLET_IP      3600
A       cruditrack          YOUR_DROPLET_IP      3600  (future)
```

**Or use a wildcard:**
```
A       *                   YOUR_DROPLET_IP      3600
```

Verify DNS propagation:
```bash
dig crudibase.codingtech.info +short
# Should return: YOUR_DROPLET_IP
```

---

## Step 1: Build and Push Images (From Your Mac)

```bash
# Authenticate with DigitalOcean registry
doctl registry login

# Build multi-architecture images (amd64 for server)
./scripts/deploy-to-registry.sh

# This builds for both amd64 and arm64
# Images pushed to: registry.digitalocean.com/crudibase-registry/
```

**For faster AMD64-only builds:**
```bash
# Edit scripts/deploy-to-registry.sh and change:
# --platform linux/amd64,linux/arm64
# to:
# --platform linux/amd64
```

---

## Step 2: Setup Droplet

SSH into your droplet:

```bash
ssh root@YOUR_DROPLET_IP
```

### 2.1: Install Prerequisites

```bash
# Update system
apt update && apt upgrade -y

# Verify Docker is installed
docker --version
docker compose version

# If not installed:
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### 2.2: Setup Firewall

```bash
# Configure firewall
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (for Let's Encrypt)
ufw allow 443/tcp   # HTTPS
ufw enable

# Verify
ufw status
```

### 2.3: Clone/Transfer Code

**Option A: Clone from Git (Recommended)**
```bash
cd /opt
git clone https://github.com/YOUR_USERNAME/crudibase.git
cd crudibase
git checkout main
```

**Option B: Transfer from local machine**
```bash
# From your Mac
rsync -avz --exclude 'node_modules' --exclude 'dist' \
  ./ root@YOUR_DROPLET_IP:/opt/crudibase/
```

---

## Step 3: Configure on Droplet

```bash
cd /opt/crudibase

# Create .env file
cat > .env << 'EOF'
NODE_ENV=production
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=1h
DATABASE_PATH=/app/src/backend/data/crudibase.db
EOF

# Secure .env
chmod 600 .env

# Verify Traefik config exists
ls -la traefik/

# Update email in traefik.yml
sed -i 's/your-email@example.com/your-real-email@example.com/g' traefik/traefik.yml

# Verify acme.json permissions
chmod 600 traefik/letsencrypt/acme.json
```

---

## Step 4: Authenticate Docker with Registry

```bash
# Install doctl on droplet
wget https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
tar xf doctl-*.tar.gz
mv doctl /usr/local/bin
rm doctl-*.tar.gz

# Authenticate (one-time)
doctl auth init
# Enter your DigitalOcean API token

# Login to registry
doctl registry login
```

---

## Step 5: Deploy

```bash
cd /opt/crudibase

# Pull latest images from registry
docker compose -f docker-compose.prod.yml pull

# Start services
docker compose -f docker-compose.prod.yml up -d

# Watch logs (Ctrl+C to exit)
docker compose -f docker-compose.prod.yml logs -f
```

Watch for:
```
✅ "Server running on port 3001" (backend)
✅ "Configuration loaded successfully" (traefik)
✅ Certificate generation logs from Traefik
```

---

## Step 6: Verify Deployment

### Check containers:
```bash
docker compose -f docker-compose.prod.yml ps

# Should show:
# traefik               running   0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
# crudibase-backend     running   3001/tcp
# crudibase-frontend    running   3000/tcp
```

### Check SSL certificates:
```bash
# Wait 1-2 minutes for certificate generation
docker logs traefik | grep -i certificate

# Should see:
# "Certificate obtained for domains [crudibase.codingtech.info]"
```

### Test endpoints:
```bash
# From droplet
curl -I https://crudibase.codingtech.info
curl https://crudibase.codingtech.info/api/health

# From browser
# Visit: https://crudibase.codingtech.info
# Visit: https://traefik.codingtech.info (login: admin / changeme123)
```

---

## Step 7: Security Hardening

### Change default dashboard password:
```bash
# Generate new password
apt-get install -y apache2-utils
echo $(htpasswd -nb admin YOUR_NEW_PASSWORD) | sed -e s/\\$/\\$\\$/g

# Copy output and update traefik/dynamic.yml
nano traefik/dynamic.yml
# Replace the password hash under middlewares -> dashboard-auth -> basicAuth -> users

# Reload Traefik
docker compose -f docker-compose.prod.yml restart traefik
```

### Generate strong JWT secret (if not done):
```bash
# Generate new secret
openssl rand -hex 32

# Update .env
nano .env
# Update JWT_SECRET value

# Restart backend
docker compose -f docker-compose.prod.yml restart backend
```

---

## Monitoring & Maintenance

### View logs:
```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f traefik
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
```

### Update application:
```bash
# From your Mac: build and push new images
./scripts/deploy-to-registry.sh

# On droplet: pull and restart
cd /opt/crudibase
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Backup database:
```bash
# Create backup
docker exec crudibase-backend \
  sqlite3 /app/src/backend/data/crudibase.db \
  ".backup '/app/src/backend/data/backup-$(date +%Y%m%d).db'"

# Copy to host
docker cp crudibase-backend:/app/src/backend/data/backup-$(date +%Y%m%d).db ./

# Download to local machine
scp root@YOUR_DROPLET_IP:/opt/crudibase/backup-*.db ./backups/
```

### Check certificate expiration:
```bash
# Traefik auto-renews 30 days before expiry
# View dashboard: https://traefik.codingtech.info
# Or check file:
docker exec traefik cat /letsencrypt/acme.json | grep -i '"domain"'
```

---

## Troubleshooting

### SSL certificate not generated:

```bash
# Check logs
docker logs traefik | grep -i error

# Common issues:
# 1. Port 80 not open (needed for Let's Encrypt)
ufw status | grep 80

# 2. DNS not propagated
dig crudibase.codingtech.info +short

# 3. acme.json wrong permissions
chmod 600 traefik/letsencrypt/acme.json
docker compose -f docker-compose.prod.yml restart traefik

# 4. Rate limit hit (5 certs/week)
# Use staging server for testing:
# Edit traefik.yml, add under acme:
#   caServer: https://acme-staging-v02.api.letsencrypt.org/directory
```

### Container not starting:

```bash
# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs backend

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

### 502 Bad Gateway:

```bash
# Check backend health
docker exec crudibase-backend wget -O- http://localhost:3001/health

# Check Traefik routing
docker logs traefik | grep backend

# Verify network
docker network inspect crudibase_crudibase-network
```

---

## Adding Cruditrack (Future)

When ready to add Cruditrack:

### 1. Build and push images:
```bash
# Create Cruditrack repo with similar structure
# Build and push to registry
./scripts/deploy-cruditrack.sh  # (create similar script)
```

### 2. Add to docker-compose.prod.yml:
```yaml
services:
  cruditrack-backend:
    image: registry.digitalocean.com/crudibase-registry/cruditrack-backend:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.cruditrack-backend.rule=Host(`cruditrack.codingtech.info`) && PathPrefix(`/api`)"
      - "traefik.http.routers.cruditrack-backend.entrypoints=websecure"
      - "traefik.http.routers.cruditrack-backend.tls.certresolver=letsencrypt"
      - "traefik.http.services.cruditrack-backend.loadbalancer.server.port=3101"
    # ... other config

  cruditrack-frontend:
    image: registry.digitalocean.com/crudibase-registry/cruditrack-frontend:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.cruditrack-frontend.rule=Host(`cruditrack.codingtech.info`)"
      - "traefik.http.routers.cruditrack-frontend.entrypoints=websecure"
      - "traefik.http.routers.cruditrack-frontend.tls.certresolver=letsencrypt"
      - "traefik.http.services.cruditrack-frontend.loadbalancer.server.port=3100"
    # ... other config
```

### 3. Deploy:
```bash
docker compose -f docker-compose.prod.yml up -d
```

Traefik automatically:
- Discovers new services
- Generates SSL certificates
- Routes traffic to correct containers

---

## Support Resources

- **Full documentation**: `docs/ssl-reverse-proxy-setup.md`
- **Traefik dashboard**: `https://traefik.codingtech.info`
- **Traefik docs**: https://doc.traefik.io/traefik/
- **DigitalOcean docs**: https://docs.digitalocean.com

---

## Quick Commands Reference

```bash
# Deploy from Mac
./scripts/deploy-to-registry.sh

# Deploy on server
cd /opt/crudibase
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f

# Restart services
docker compose -f docker-compose.prod.yml restart

# Stop all
docker compose -f docker-compose.prod.yml down

# View SSL certs
docker exec traefik cat /letsencrypt/acme.json

# Backup database
docker exec crudibase-backend cp /app/src/backend/data/crudibase.db /app/src/backend/data/backup.db
docker cp crudibase-backend:/app/src/backend/data/backup.db ./
```

---

**Last Updated**: 2025-01-13
