#!/bin/sh
# Free wss from your own computer (no domain, no router settings). Needs Node.js and cloudflared (https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/).
cd "$(dirname "$0")"
node server.js &
SRV=$!
trap 'kill $SRV' EXIT INT TERM
sleep 1
echo "Look for the https://xxxx.trycloudflare.com line below, then enter wss://xxxx.trycloudflare.com in the game."
cloudflared tunnel --url http://localhost:8765
