@echo off
rem Free wss from your own PC. Needs Node.js + cloudflared.exe (see start_wss_tunnel.sh). Close this window to stop.
cd /d "%~dp0"
start "qiyam-server" cmd /k node server.js
timeout /t 2 >nul
echo Look for the https://xxxx.trycloudflare.com line below, then enter wss://xxxx.trycloudflare.com in the game.
cloudflared tunnel --url http://localhost:8765
pause
