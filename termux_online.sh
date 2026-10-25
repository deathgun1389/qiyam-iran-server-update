#!/data/data/com.termux/files/usr/bin/sh
# One command: server + free internet tunnel (wss) on an Android phone with Termux.   Usage:  sh termux_online.sh
cd "$(dirname "$0")"
pkg update -y && pkg install -y nodejs cloudflared
command -v termux-wake-lock >/dev/null 2>&1 && termux-wake-lock || true
node server.js > server.log 2>&1 &
SRV=$!
cloudflared tunnel --url http://localhost:8765 > tunnel.log 2>&1 &
TUN=$!
trap 'kill $SRV $TUN 2>/dev/null' EXIT INT TERM
echo "Waiting for the tunnel address..."
URL=""
i=0
while [ $i -lt 60 ]; do
  URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' tunnel.log | head -1)
  [ -n "$URL" ] && break
  i=$((i+1)); sleep 1
done
echo
if [ -z "$URL" ]; then
  echo "Tunnel did not start (Cloudflare may be blocked: turn on a VPN) - see tunnel.log"
else
  echo "=============================================="
  echo " Give this address to ALL players (Online world):"
  echo "   wss://${URL#https://}"
  echo "=============================================="
fi
echo "Keep Termux open. Press Ctrl+C to stop."
wait
