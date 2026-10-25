#!/data/data/com.termux/files/usr/bin/sh
# Turn an ANDROID PHONE into the game server (Termux from F-Droid). No hosting company needed.
# 1) Copy this whole `server` folder to the phone (e.g. Downloads). 2) In Termux:  sh termux_setup.sh
set -e
pkg update -y
pkg install -y nodejs
command -v termux-wake-lock >/dev/null 2>&1 && termux-wake-lock || true
cd "$(dirname "$0")"
echo
echo "== Server starting. Other players on your hotspot/Wi-Fi use the address printed below (often ws://192.168.43.1:8765 for a phone hotspot). =="
echo "== For internet play with wss://: open a 2nd Termux session and run:  pkg install cloudflared && cloudflared tunnel --url http://localhost:8765 =="
echo
exec node server.js
