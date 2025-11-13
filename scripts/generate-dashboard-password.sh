#!/bin/bash

# Generate Traefik dashboard password hash
# Usage: ./scripts/generate-dashboard-password.sh username password

set -e

USERNAME="${1:-admin}"
PASSWORD="${2}"

if [ -z "$PASSWORD" ]; then
    echo "Usage: $0 [username] <password>"
    echo ""
    echo "Examples:"
    echo "  $0 mypassword123            # username defaults to 'admin'"
    echo "  $0 admin mypassword123      # specify both username and password"
    exit 1
fi

# Check if htpasswd is installed
if ! command -v htpasswd &> /dev/null; then
    echo "❌ htpasswd is not installed"
    echo ""
    echo "Install it with:"
    echo "  macOS:   brew install httpd"
    echo "  Ubuntu:  sudo apt-get install apache2-utils"
    exit 1
fi

echo "Generating password hash for user: $USERNAME"
echo ""

# Generate hash and escape $ for docker-compose.yml
HASH=$(htpasswd -nb "$USERNAME" "$PASSWORD" | sed -e s/\\$/\\$\\$/g)

echo "✅ Generated hash (copy this to traefik/dynamic.yml):"
echo ""
echo "          - \"$HASH\""
echo ""
echo "Update traefik/dynamic.yml:"
echo "  http:"
echo "    middlewares:"
echo "      dashboard-auth:"
echo "        basicAuth:"
echo "          users:"
echo "            - \"$HASH\""
echo ""
