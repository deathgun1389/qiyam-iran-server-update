# سرور آنلاین «قیام ایرانیان» (v1.6.0) — فقط wss

بازی به هر سروری که اجرا کنی وصل می‌شود. آدرس‌های عمومی همیشه **wss://** هستند (بازی خودش `ws://` را به `wss://` تبدیل می‌کند). فقط برای تست روی همان وای‌فای (IP خانگی مثل 192.168.x.x) `ws://` مجاز مانده، چون برای IP محلی گواهی HTTPS وجود ندارد.

نیازمندی: Node.js 18+ (فقط برای اجرای مستقیم) یا Docker. هیچ پکیجی لازم نیست.

## ⚠ اول این را انجام بده (اندروید)
Godot: `Project → Export → Android → Permissions → ✔ Internet` و دوباره خروجی بگیر. بدون این تیک هیچ اتصال آنلاینی کار نمی‌کند.

## بازی از راه دور (اینترنت) — سریع‌ترین راه
روی گوشی میزبان (Termux) فقط یک دستور: `sh termux_online.sh` — سرور و تونل Cloudflare با هم بالا می‌آیند و آدرس `wss://xxxx.trycloudflare.com` را چاپ می‌کند؛ همان را به همه بده. اگر Cloudflare در کشورت بسته است، VPN روشن کن. راه جایگزین بدون دامنه و بدون تونل: **Tailscale** (رایگان): روی گوشی میزبان و گوشی بقیه نصب کن، همه وارد یک حساب/شبکه شوند و در بازی `100.x.x.x:8765` (آدرس Tailscale میزبان) را بزنند؛ بازی این آدرس را به‌عنوان شبکه‌ی خصوصی می‌پذیرد.

## سرور روی خود گوشی (بدون هیچ شرکت میزبانی) — Termux
1. برنامه‌ی **Termux** را از F-Droid نصب کن، پوشه‌ی `server` را در حافظه‌ی گوشی بگذار.
2. در Termux: `termux-setup-storage` ← `cd storage/downloads/server` ← `sh termux_setup.sh`
3. گوشی‌های دیگر روی **هات‌اسپات یا وای‌فای همان گوشی** وصل شوند و در بازی IP چاپ‌شده را بزنند (معمولاً `192.168.43.1`).
4. برای اینترنت با wss: در یک نشست دوم Termux بزن `pkg install cloudflared && cloudflared tunnel --url http://localhost:8765` و آدرس `trycloudflare.com` را با `wss://` در بازی بنویس. (اگر در کشورت فیلتر است، با VPN.)
تا وقتی Termux باز و گوشی روشن است، دنیا زنده است؛ دنیا در `data/state.json` ذخیره می‌شود.

## کدام راه برای من؟
| وضعیت تو | راه | آدرس در بازی |
|---|---|---|
| دامنه + VPS دارم | **A** (یک دستور) | `wss://دامنه‌ات` |
| فقط کامپیوتر خودم، رایگان | **B** (Cloudflare Tunnel) | `wss://xxxx.trycloudflare.com` |
| سرویس ابری (Render/Railway/Fly…) | **C** | `wss://نام-اپ.onrender.com` |
| فقط تست در خانه | **D** | `192.168.1.5` (خودش ws:// می‌شود) |

### A) VPS + دامنه (سرور ثابت ۲۴ ساعته، با گواهی خودکار)
دامنه‌ات را (A record) به IP سرور بزن، پورت‌های 80 و 443 را باز بگذار و روی سرور:

    sh install_vps.sh qiyam.example.com

(Docker را خودش نصب می‌کند و Caddy گواهی HTTPS را می‌گیرد و تمدید می‌کند.) دامنه نداری؟ از duckdns.org یک دامنه‌ی رایگان بگیر. تست: `https://qiyam.example.com/health`

### B) کامپیوتر خودت، رایگان، wss بدون دامنه
cloudflared را نصب کن و `start_wss_tunnel.bat` (ویندوز) یا `sh start_wss_tunnel.sh` را اجرا کن. آدرس `https://xxxx.trycloudflare.com` چاپ می‌شود؛ در بازی `wss://xxxx.trycloudflare.com` بزن. با هر اجرا آدرس عوض می‌شود و تا وقتی کامپیوتر روشن است سرور هست.

### C) سرویس‌های ابری
پوشه‌ی `server` را در یک مخزن GitHub بگذار. `Dockerfile`، `Procfile`، `render.yaml` و `fly.toml` آماده‌اند. این سرویس‌ها خودشان HTTPS می‌دهند، پس همان آدرسشان با `wss://` کار می‌کند (متغیر `PORT` را خودشان می‌دهند). **حتماً دیسک دائمی (Volume) به `DATA_DIR` وصل کن** وگرنه دنیا با هر ری‌استارت پاک می‌شود؛ پلن‌های رایگانِ بدون دیسک یا با خواب‌رفتن برای بازی دائمی مناسب نیستند.

### D) تست در خانه
`start_server.bat` یا `sh start_server.sh` را اجرا کن؛ IPهای شبکه چاپ می‌شوند. در بازی همان IP را بزن (گوشی و کامپیوتر روی یک وای‌فای، و فایروال ویندوز پورت 8765 را اجازه بدهد).

### TLS مستقیم (بدون پروکسی)
اگر خودت فایل گواهی داری: `TLS_CERT=/path/fullchain.pem TLS_KEY=/path/privkey.pem PORT=443 node server.js` ← `wss://دامنه`.

## اگر وصل نشد
- پیام زیر دکمه‌ی ورود را بخوان. «اتصال امن برقرار نشد» یعنی دامنه/گواهی/پورت.
- در مرورگر گوشی `https://آدرس/health` را باز کن؛ باید `"ok":true` ببینی.
- تیک Internet اندروید (بالا) را بررسی کن.

## بازی
قبیله بساز (۲۰ چوب، ۱۲ سنگ، ۱۰ سکه)، منبع جمع کن، با دکمه‌ی چکش قلعه بچین، رهبر اعلان جنگ می‌دهد. حیوان و دشمن (روباه، گراز، گرگ، راهزن‌ها) بیرون از قلمرو قبیله و میدان مرکزی پراکنده‌اند؛ هرچه دورتر یا شمالی‌تر، خطرناک‌تر.

## تنظیمات (متغیر محیطی)
`PORT`، `DATA_DIR`، `WORLD_SEED`، `MOB_COUNT`، `TLS_CERT`، `TLS_KEY`؛ برای تست: `WAR_PREP_MS`، `WAR_LEN_MS`، `TRUCE_MS`، `NEW_TRIBE_TRUCE_MS`، `HEART_HP`، `WAR_COIN_COST`.
تست‌ها: `node test.js`، `node test_war.js`، `node test_mobs.js`.


## v1.5.3 notes
- Added server-authoritative persistent sword upgrades (5 levels); melee damage rises by 3 per level.
- The online HUD includes a sword button for upgrades.
- World generation uses a per-server persisted `data/world_seed.txt`; different server instances get different worlds, while the same server keeps its generated world across restarts when its data directory is persistent.
- Wood and stone resource nodes are randomly distributed by the generated world and relocate to a new valid position after respawn.
- Voice chat is **not included in this build**. It needs a dedicated audio transport/relay and Android microphone permission handling; the current JSON WebSocket protocol only carries game messages.


## v1.6.0 — یادداشت هماهنگی با کلاینت

این یادداشت بر توضیحات نسخه‌های قبلی مقدم است. کلاینت ۱.۶.۰ نیاز دارد که همین نسخهٔ سرور اجرا شود تا فرمان‌های `dodge`، `mine`، `farm_action` و `voice` پردازش شوند؛ همچنین برج‌ها به مهاجمان نزدیک تیراندازی می‌کنند. endpoint مسیر `/health` نسخهٔ سرور در حال اجرا را نمایش می‌دهد.

ویس‌چت از بسته‌های PCM آزمایشی ۸ کیلوهرتز روی همان WebSocket احراز هویت‌شده استفاده می‌کند. صدای واقعی میکروفون همچنان باید روی دستگاه‌های اندرویدی و با مجوز `Record Audio` آزمایش شود؛ صرف دریافت مجوز به معنی کارکرد ضبط یا رله نیست.

در به‌روزرسانی کد، از داده‌های `DATA_DIR/state.json` و `DATA_DIR/world_seed.txt` پشتیبان بگیر و آن‌ها را حذف نکن.
