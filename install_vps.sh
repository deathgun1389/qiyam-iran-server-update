#!/bin/sh
# Ubuntu/Debian VPS: installs Docker and starts the server with automatic HTTPS.  Usage:  sh install_vps.sh qiyam.example.com
set -e
DOMAIN="$1"
if [ -z "$DOMAIN" ]; then echo "usage: sh install_vps.sh your.domain.com"; exit 1; fi
command -v docker >/dev/null 2>&1 || curl -fsSL https://get.docker.com | sh
cd "$(dirname "$0")"
DOMAIN="$DOMAIN" docker compose up -d --build
echo
echo "Done. In the game enter:  wss://$DOMAIN"
echo "Check:  https://$DOMAIN/health"
