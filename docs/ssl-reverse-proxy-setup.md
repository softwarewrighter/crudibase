# SSL and Reverse Proxy Setup for Multiple Subdomains

This guide covers setting up SSL/HTTPS and a reverse proxy to serve your Docker Compose application across multiple subdomains on DigitalOcean.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Option 1: Traefik (Recommended)](#option-1-traefik-recommended)
- [Option 2: Nginx + Certbot](#option-2-nginx--certbot)
- [DNS Configuration](#dns-configuration)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

---

## Overview

### Goal

Serve your application across multiple subdomains with SSL:

- `app.yourdomain.com` → Frontend (port 3000)
- `api.yourdomain.com` → Backend (port 3001)
- `admin.yourdomain.com` → Future admin panel (port 3002)

### Architecture Options

| Feature              | Traefik                | Nginx + Certbot     |
| -------------------- | ---------------------- | ------------------- |
| Setup Complexity     | Medium                 | Medium              |
| Auto SSL             | ✅ Built-in            | Via Certbot         |
| Docker Integration   | ✅ Native              | Manual config       |
| Auto Service Discovery | ✅ Yes                 | ❌ Manual updates    |
| Config Style         | Docker labels          | Config files        |
| Dashboard            | ✅ Yes                 | ❌ No                |
| Best For             | Docker-first workflows | Traditional setups  |

**Recommendation**: Use **Traefik** for easier Docker integration and automatic service discovery.

---

## Prerequisites

### 1. Domain Setup

You need a domain name pointing to your DigitalOcean droplet:

```bash
# Example DNS records (configure at your domain registrar)
A    @              123.45.67.89  (yourdomain.com)
A    app            123.45.67.89  (app.yourdomain.com)
A    api            123.45.67.89  (api.yourdomain.com)
A    admin          123.45.67.89  (admin.yourdomain.com)
CNAME www           @             (www.yourdomain.com)
```

**OR use a wildcard:**

```bash
A    @              123.45.67.89
A    *              123.45.67.89  (catches all subdomains)
```

### 2. Firewall Configuration

```bash
# On your droplet
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (Let's Encrypt challenge)
ufw allow 443/tcp   # HTTPS
ufw enable

# Verify
ufw status
```

### 3. Email for Let's Encrypt

You'll need an email address for Let's Encrypt certificate notifications.

---

## Option 1: Traefik (Recommended)

Traefik is a modern reverse proxy designed for Docker with automatic SSL and service discovery.

### Step 1: Create Traefik Configuration Files

```bash
# On your droplet
cd /opt/crudibase

# Create traefik directory
mkdir -p traefik
cd traefik

# Create traefik.yml (static configuration)
cat > traefik.yml << 'EOF'
# Traefik Static Configuration

api:
  dashboard: true  # Enable dashboard at https://traefik.yourdomain.com
  insecure: false  # Don't expose on :8080

entryPoints:
  web:
    address: ":80"
    # Redirect all HTTP to HTTPS
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https

  websecure:
    address: ":443"
    http:
      tls:
        certResolver: letsencrypt

providers:
  docker:
    exposedByDefault: false  # Only expose services with traefik.enable=true
    network: crudibase-network

certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@example.com  # CHANGE THIS
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web

log:
  level: INFO

accessLog: {}
EOF

# Create dynamic configuration for dashboard
cat > dynamic.yml << 'EOF'
# Traefik Dynamic Configuration

http:
  routers:
    dashboard:
      rule: "Host(`traefik.yourdomain.com`)"  # CHANGE THIS
      service: api@internal
      middlewares:
        - auth
      tls:
        certResolver: letsencrypt

  middlewares:
    auth:
      basicAuth:
        users:
          # Generate with: echo $(htpasswd -nb admin yourpassword) | sed -e s/\\$/\\$\\$/g
          - "admin:$$apr1$$xxxxxxxxxx"  # CHANGE THIS
EOF

# Create directory for SSL certificates
mkdir -p letsencrypt
touch letsencrypt/acme.json
chmod 600 letsencrypt/acme.json
```

### Step 2: Generate Dashboard Password

```bash
# Install htpasswd utility
apt-get update && apt-get install -y apache2-utils

# Generate password (replace 'yourpassword' with a strong password)
echo $(htpasswd -nb admin yourpassword) | sed -e s/\\$/\\$\\$/g

# Copy the output and paste it into dynamic.yml, replacing the placeholder
```

### Step 3: Update docker-compose.yml

Create a new `docker-compose.prod.yml` file with Traefik integration:

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # Traefik reverse proxy
  traefik:
    image: traefik:v3.0
    container_name: traefik
    restart: unless-stopped
    ports:
      - "80:80"     # HTTP
      - "443:443"   # HTTPS
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro  # Docker API access
      - ./traefik/traefik.yml:/traefik.yml:ro
      - ./traefik/dynamic.yml:/dynamic.yml:ro
      - ./traefik/letsencrypt:/letsencrypt
    networks:
      - crudibase-network
    labels:
      - "traefik.enable=true"
      # Dashboard configuration
      - "traefik.http.routers.dashboard.rule=Host(`traefik.yourdomain.com`)"
      - "traefik.http.routers.dashboard.service=api@internal"
      - "traefik.http.routers.dashboard.entrypoints=websecure"
      - "traefik.http.routers.dashboard.tls.certresolver=letsencrypt"

  # Backend API service
  backend:
    build:
      context: .
      dockerfile: src/backend/Dockerfile
    image: registry.digitalocean.com/crudibase-registry/crudibase-backend:latest
    container_name: crudibase-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3001
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=${JWT_EXPIRES_IN:-1h}
      - DATABASE_PATH=/app/src/backend/data/crudibase.db
    volumes:
      - backend-data:/app/src/backend/data
    networks:
      - crudibase-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    labels:
      - "traefik.enable=true"
      # HTTP router
      - "traefik.http.routers.backend.rule=Host(`api.yourdomain.com`)"  # CHANGE THIS
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
      - "traefik.http.services.backend.loadbalancer.server.port=3001"
      # CORS middleware (optional)
      - "traefik.http.middlewares.backend-cors.headers.accesscontrolallowmethods=GET,POST,PUT,DELETE,OPTIONS"
      - "traefik.http.middlewares.backend-cors.headers.accesscontrolalloworiginlist=https://app.yourdomain.com"  # CHANGE THIS
      - "traefik.http.middlewares.backend-cors.headers.accesscontrolmaxage=100"
      - "traefik.http.middlewares.backend-cors.headers.addvaryheader=true"

  # Frontend React app
  frontend:
    build:
      context: .
      dockerfile: src/frontend/Dockerfile
    image: registry.digitalocean.com/crudibase-registry/crudibase-frontend:latest
    container_name: crudibase-frontend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    depends_on:
      - backend
    networks:
      - crudibase-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://127.0.0.1:3000/"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
    labels:
      - "traefik.enable=true"
      # HTTP router
      - "traefik.http.routers.frontend.rule=Host(`app.yourdomain.com`)"  # CHANGE THIS
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
      - "traefik.http.services.frontend.loadbalancer.server.port=3000"
      # Security headers
      - "traefik.http.middlewares.frontend-security.headers.frameDeny=true"
      - "traefik.http.middlewares.frontend-security.headers.contentTypeNosniff=true"
      - "traefik.http.middlewares.frontend-security.headers.browserXssFilter=true"
      - "traefik.http.routers.frontend.middlewares=frontend-security"

volumes:
  backend-data:
    driver: local

networks:
  crudibase-network:
    driver: bridge
```

### Step 4: Configure Environment Variables

```bash
# Update your .env file
cat > .env << 'EOF'
NODE_ENV=production
JWT_SECRET=your-generated-secret-here
JWT_EXPIRES_IN=1h
DATABASE_PATH=/app/src/backend/data/crudibase.db
EOF

chmod 600 .env
```

### Step 5: Update Frontend Configuration

The frontend needs to know the API endpoint. Update the frontend nginx.conf or environment:

```bash
# Option A: Update frontend Dockerfile to accept API URL at build time
# Add to src/frontend/Dockerfile before the build step:
ARG VITE_API_URL=https://api.yourdomain.com
ENV VITE_API_URL=$VITE_API_URL
```

Or create a runtime config:

```javascript
// src/frontend/public/config.js
window.APP_CONFIG = {
  API_URL: 'https://api.yourdomain.com'
};
```

### Step 6: Deploy

```bash
# Stop existing containers
docker-compose down

# Start with production configuration
docker-compose -f docker-compose.prod.yml up -d

# Watch logs
docker-compose -f docker-compose.prod.yml logs -f

# Verify Traefik is getting certificates
docker logs traefik | grep -i certificate
```

### Step 7: Verify

```bash
# Check SSL certificates
curl -I https://app.yourdomain.com
curl -I https://api.yourdomain.com
curl -I https://traefik.yourdomain.com

# Test API
curl https://api.yourdomain.com/api/health

# Access dashboard
# Visit: https://traefik.yourdomain.com (login with admin credentials)
```

### Traefik Dashboard

Access your Traefik dashboard at `https://traefik.yourdomain.com` to:

- Monitor SSL certificates
- View active routes
- Check service health
- Debug routing issues

---

## Option 2: Nginx + Certbot

Traditional reverse proxy setup using Nginx on the host machine.

### Step 1: Install Nginx and Certbot

```bash
# On your droplet
apt update
apt install -y nginx certbot python3-certbot-nginx
```

### Step 2: Remove Port Mappings from docker-compose.yml

Services should NOT expose ports to the host, only to the Docker network:

```yaml
# docker-compose.yml (modified)
services:
  backend:
    # ... other config ...
    # REMOVE: ports section
    # ports:
    #   - "3001:3001"
    networks:
      - crudibase-network

  frontend:
    # ... other config ...
    # REMOVE: ports section
    # ports:
    #   - "3000:3000"
    networks:
      - crudibase-network
```

### Step 3: Create Nginx Configuration

```bash
# Create main config
cat > /etc/nginx/sites-available/crudibase << 'EOF'
# Backend API - api.yourdomain.com
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # CORS headers (if needed)
        add_header Access-Control-Allow-Origin "https://app.yourdomain.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;

        # Handle preflight
        if ($request_method = OPTIONS) {
            return 204;
        }
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}

# Frontend - app.yourdomain.com
server {
    listen 80;
    server_name app.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Main domain redirect to app subdomain
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://app.yourdomain.com$request_uri;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/crudibase /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default  # Remove default site

# Test configuration
nginx -t

# Reload nginx
systemctl reload nginx
```

### Step 4: Update docker-compose.yml for Host Network

```yaml
# docker-compose.yml (for nginx option)
services:
  backend:
    # ... other config ...
    ports:
      - "127.0.0.1:3001:3001"  # Only accessible from localhost
    networks:
      - crudibase-network

  frontend:
    # ... other config ...
    ports:
      - "127.0.0.1:3000:3000"  # Only accessible from localhost
    networks:
      - crudibase-network
```

### Step 5: Obtain SSL Certificates

```bash
# Request certificates for all subdomains
certbot --nginx \
  -d yourdomain.com \
  -d www.yourdomain.com \
  -d app.yourdomain.com \
  -d api.yourdomain.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  --redirect

# Follow prompts
# Certbot will automatically:
# - Request certificates from Let's Encrypt
# - Update nginx config with SSL
# - Setup auto-renewal
```

### Step 6: Verify Auto-Renewal

```bash
# Test renewal (dry run)
certbot renew --dry-run

# Check renewal timer
systemctl status certbot.timer

# Manual renewal (if needed)
certbot renew
```

### Step 7: Enhance Nginx SSL Configuration

```bash
# Add to each server block in /etc/nginx/sites-available/crudibase
# Certbot adds basic SSL, but you can enhance it:

cat > /etc/nginx/snippets/ssl-params.conf << 'EOF'
# SSL Configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_session_timeout 10m;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;

# OCSP stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# Security headers
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
EOF

# Include in your server blocks (after certbot modifies them):
# include snippets/ssl-params.conf;
```

### Step 8: Restart Services

```bash
# Restart nginx
systemctl restart nginx

# Restart Docker containers
cd /opt/crudibase
docker-compose down
docker-compose up -d

# Verify
docker-compose ps
nginx -t
systemctl status nginx
```

---

## DNS Configuration

### Quick Reference

```bash
# At your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare)
# Replace 123.45.67.89 with your droplet IP

Type    Name    Value           TTL
----    ----    -----           ---
A       @       123.45.67.89    3600
A       app     123.45.67.89    3600
A       api     123.45.67.89    3600
A       admin   123.45.67.89    3600
CNAME   www     @               3600

# Or use wildcard:
A       *       123.45.67.89    3600
```

### DNS Propagation

```bash
# Check if DNS is propagated
dig app.yourdomain.com +short
dig api.yourdomain.com +short

# Or use online tools:
# https://dnschecker.org
# https://www.whatsmydns.net
```

**Note**: DNS propagation can take 5 minutes to 48 hours.

---

## Testing

### Test Each Subdomain

```bash
# Test HTTPS and redirects
curl -I http://app.yourdomain.com    # Should redirect to HTTPS
curl -I https://app.yourdomain.com   # Should return 200
curl -I https://api.yourdomain.com   # Should return 200

# Test API endpoint
curl https://api.yourdomain.com/api/health

# Test with browser
# Visit: https://app.yourdomain.com
# Visit: https://api.yourdomain.com/api/health
```

### Verify SSL Certificates

```bash
# Check certificate details
openssl s_client -connect app.yourdomain.com:443 -servername app.yourdomain.com

# Check expiration
echo | openssl s_client -connect app.yourdomain.com:443 -servername app.yourdomain.com 2>/dev/null | openssl x509 -noout -dates

# Online tools:
# https://www.ssllabs.com/ssltest/
```

### Test from Different Locations

```bash
# Use online tools to test from different geographic locations:
# https://www.uptrends.com/tools/uptime-test
# https://tools.keycdn.com/performance
```

---

## Troubleshooting

### Traefik Issues

**SSL certificate not generated:**

```bash
# Check Traefik logs
docker logs traefik | grep -i error
docker logs traefik | grep -i certificate

# Common causes:
# 1. Port 80 not open (needed for Let's Encrypt HTTP challenge)
ufw allow 80/tcp

# 2. DNS not propagated
dig app.yourdomain.com +short

# 3. acme.json wrong permissions
chmod 600 traefik/letsencrypt/acme.json

# 4. Email not set in traefik.yml
# Edit traefik/traefik.yml and set your email

# Force certificate regeneration
rm traefik/letsencrypt/acme.json
touch traefik/letsencrypt/acme.json
chmod 600 traefik/letsencrypt/acme.json
docker-compose -f docker-compose.prod.yml restart traefik
```

**Service not accessible:**

```bash
# Check if service is running
docker-compose -f docker-compose.prod.yml ps

# Check if Traefik sees the service
docker-compose -f docker-compose.prod.yml logs traefik | grep backend

# Verify labels
docker inspect crudibase-backend | grep -A 20 Labels

# Check Traefik dashboard
# Visit: https://traefik.yourdomain.com
```

### Nginx Issues

**502 Bad Gateway:**

```bash
# Check if containers are running
docker-compose ps

# Check if ports are accessible from host
curl http://localhost:3000
curl http://localhost:3001/api/health

# Check nginx error logs
tail -f /var/log/nginx/error.log

# Check Docker network
docker network inspect crudibase_crudibase-network

# Verify nginx can reach containers
docker exec crudibase-frontend wget -O- http://localhost:3000
```

**Certbot fails:**

```bash
# Check logs
journalctl -u certbot -n 50

# Common causes:
# 1. Port 80 not accessible
nc -zv yourdomain.com 80

# 2. DNS not pointing to droplet
dig app.yourdomain.com +short

# 3. Rate limit hit (5 certificates per domain per week)
# Wait or use staging: certbot --nginx --staging

# Manual verification
certbot certonly --manual --preferred-challenges http -d app.yourdomain.com
```

**Certificate renewal fails:**

```bash
# Check renewal configuration
cat /etc/letsencrypt/renewal/app.yourdomain.com.conf

# Test renewal
certbot renew --dry-run

# Force renewal
certbot renew --force-renewal

# Check certbot timer
systemctl list-timers | grep certbot
systemctl status certbot.timer
```

### General Debugging

**Check firewall:**

```bash
ufw status
# Should allow: 22, 80, 443
```

**Check DNS propagation:**

```bash
# From droplet
dig app.yourdomain.com +short

# From different locations
# https://dnschecker.org
```

**Check Docker network:**

```bash
# Services must be on same network
docker network inspect crudibase_crudibase-network

# Check inter-container connectivity
docker exec crudibase-frontend wget -O- http://backend:3001/health
```

**View all logs:**

```bash
# Traefik
docker logs -f traefik

# Application
docker-compose logs -f

# Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# System
journalctl -xe
```

---

## Maintenance

### Update Containers

```bash
# Pull latest images
cd /opt/crudibase
git pull origin main
docker-compose build
docker-compose up -d

# Or with Traefik
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Verify
docker-compose ps
```

### Monitor SSL Certificates

```bash
# Traefik: Check dashboard
# Visit: https://traefik.yourdomain.com

# Nginx: Check expiration
certbot certificates

# Set up monitoring (optional)
# https://www.ssl.com/how-to/set-up-ssl-certificate-expiration-notifications/
```

### Backup Configuration

```bash
# Backup Traefik config
tar -czf traefik-backup-$(date +%Y%m%d).tar.gz traefik/

# Backup Nginx config
tar -czf nginx-backup-$(date +%Y%m%d).tar.gz /etc/nginx/

# Backup SSL certificates (if using Certbot)
tar -czf letsencrypt-backup-$(date +%Y%m%d).tar.gz /etc/letsencrypt/
```

### Rotate Logs

```bash
# Docker logs rotation (add to /etc/docker/daemon.json)
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

systemctl restart docker
```

---

## Security Best Practices

### Traefik Security

1. **Protect the dashboard**:
   - Always use basic auth or external auth
   - Use strong passwords
   - Consider IP whitelisting

2. **Use rate limiting**:

```yaml
# Add to docker-compose.prod.yml labels
- "traefik.http.middlewares.rate-limit.ratelimit.average=100"
- "traefik.http.middlewares.rate-limit.ratelimit.burst=50"
- "traefik.http.routers.backend.middlewares=rate-limit"
```

3. **Security headers** (already configured in example)

### Nginx Security

1. **Hide version**:

```nginx
# In /etc/nginx/nginx.conf
http {
    server_tokens off;
}
```

2. **Rate limiting**:

```nginx
# Add to http block
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

# Add to location block
location /api/ {
    limit_req zone=api burst=20;
    # ... other config
}
```

3. **Fail2ban** (optional):

```bash
apt install fail2ban

# Configure for nginx
cat > /etc/fail2ban/jail.local << 'EOF'
[nginx-http-auth]
enabled = true
[nginx-botsearch]
enabled = true
[nginx-badbots]
enabled = true
EOF

systemctl restart fail2ban
```

### General Security

```bash
# Keep system updated
apt update && apt upgrade -y

# Monitor logs
tail -f /var/log/nginx/access.log | grep -E "40[0-9]|50[0-9]"

# Use monitoring service (optional)
# - UptimeRobot: https://uptimerobot.com
# - Sentry: https://sentry.io
# - DigitalOcean Monitoring (built-in)
```

---

## Adding New Services/Subdomains

### With Traefik

Simply add labels to new service in `docker-compose.prod.yml`:

```yaml
services:
  admin:
    image: your-admin-image
    networks:
      - crudibase-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.admin.rule=Host(`admin.yourdomain.com`)"
      - "traefik.http.routers.admin.entrypoints=websecure"
      - "traefik.http.routers.admin.tls.certresolver=letsencrypt"
      - "traefik.http.services.admin.loadbalancer.server.port=3002"
```

Restart: `docker-compose -f docker-compose.prod.yml up -d`

SSL certificate is generated automatically!

### With Nginx

1. Add DNS record: `admin.yourdomain.com → droplet IP`

2. Add server block to `/etc/nginx/sites-available/crudibase`:

```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;

    location / {
        proxy_pass http://localhost:3002;
        # ... proxy headers
    }
}
```

3. Request SSL certificate:

```bash
certbot --nginx -d admin.yourdomain.com
nginx -t
systemctl reload nginx
```

---

## Performance Optimization

### Enable HTTP/2

**Traefik**: Enabled by default on HTTPS

**Nginx**: Add to SSL server blocks:

```nginx
listen 443 ssl http2;
```

### Enable Compression

**Traefik**: Add middleware:

```yaml
- "traefik.http.middlewares.compress.compress=true"
- "traefik.http.routers.frontend.middlewares=compress"
```

**Nginx**: Already configured in example (gzip)

### Caching

```nginx
# Static assets caching (in nginx config)
location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Next Steps

After completing this setup:

1. ✅ Test all subdomains with SSL
2. ✅ Verify automatic HTTP → HTTPS redirects
3. ✅ Test SSL certificate renewal (dry run)
4. ✅ Setup monitoring and alerts
5. ✅ Configure database backups
6. ✅ Document your custom domain in README
7. ✅ Update CORS settings if using subdomains

---

## Resources

- **Traefik Docs**: https://doc.traefik.io/traefik/
- **Let's Encrypt**: https://letsencrypt.org/docs/
- **Nginx Docs**: https://nginx.org/en/docs/
- **Certbot**: https://certbot.eff.org/
- **SSL Test**: https://www.ssllabs.com/ssltest/
- **DigitalOcean Tutorials**: https://www.digitalocean.com/community/tutorials

---

**Last Updated**: 2025-01-13
