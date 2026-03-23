# day. — Daily Planner PWA

A bullet journal-style daily planner that runs as a Progressive Web App.
No accounts, no cloud — all data stays on the user's device.

---

## Prerequisites

- **Node.js** 18+ → [nodejs.org](https://nodejs.org)
- **Git** → [git-scm.com](https://git-scm.com)
- A free **Vercel** or **Netlify** account for hosting

---

## Deploy in 5 Commands

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USER/day-planner.git
cd day-planner

# 2. Install dependencies
npm install

# 3. Test locally
npm run dev
# → Opens at http://localhost:3000

# 4. Build for production
npm run build
# → Output in /dist

# 5. Deploy (pick one)

# Option A: Vercel (recommended)
npx vercel --prod

# Option B: Netlify
npx netlify deploy --prod --dir=dist
```

Your app is now live. Share the URL — users install it from the browser.

---

## How Users Install

### Android (Chrome)
1. Visit your URL in Chrome
2. Tap the "Add to Home Screen" banner (or ⋮ → Install app)
3. App appears on home screen, opens fullscreen

### iPhone (Safari)
1. Visit your URL in **Safari**
2. Tap Share → "Add to Home Screen"
3. App appears on home screen, opens standalone

### Desktop
1. Visit URL in Chrome/Edge
2. Click install icon in address bar

---

## Project Structure

```
day-planner/
├── index.html              ← HTML shell with PWA meta tags
├── package.json            ← Dependencies (React + Vite)
├── vite.config.js          ← Build config
├── vercel.json             ← Vercel SPA routing
├── netlify.toml            ← Netlify SPA routing
├── public/
│   ├── manifest.json       ← PWA identity (name, icons, theme)
│   ├── sw.js               ← Service worker (offline cache)
│   ├── favicon.svg         ← Browser tab icon
│   └── icons/
│       ├── icon-192.svg    ← Home screen icon
│       └── icon-512.svg    ← Splash screen icon
└── src/
    ├── main.jsx            ← React entry point
    └── App.jsx             ← Entire planner application
```

---

## What Each File Does

| File | Purpose |
|---|---|
| `manifest.json` | Tells the browser this is installable (name, icon, colors, display mode) |
| `sw.js` | Caches the app for offline use. Network-first with cache fallback |
| `index.html` | iOS safe-area padding, splash screen, service worker registration |
| `App.jsx` | The complete planner — grid layout, time blocks, habits, trackers, drawing canvas, history |
| `vercel.json` | Ensures all routes serve `index.html` (SPA behavior) |
| `netlify.toml` | Same for Netlify |

---

## Data Storage

Everything is in `localStorage`. No backend, no API calls.

| Key | What it stores |
|---|---|
| `du` | Auth session (which provider was used) |
| `dd` | All day entries — time blocks, tasks, todos, trackers, habits, notes, drawings |
| `dm` | Section customizations — renamed headers, custom colors |

Data persists until the user clears browser data or uninstalls the PWA.

---

## Custom Domain (Optional)

### Vercel
1. `vercel domains add yourdomain.com`
2. Add DNS: CNAME → `cname.vercel-dns.com`
3. SSL is automatic

### Netlify
1. Site settings → Domain management → Add custom domain
2. Add DNS: CNAME → `your-site.netlify.app`
3. SSL is automatic

---

## Environment Checklist

Before going live, verify:

- [ ] `npm run build` succeeds with no errors
- [ ] `npm run preview` shows the app at localhost:4173
- [ ] Manifest loads (DevTools → Application → Manifest)
- [ ] Service worker registers (DevTools → Application → Service Workers)
- [ ] App works offline (DevTools → Network → toggle Offline → reload)
- [ ] Install prompt appears on Android Chrome
- [ ] "Add to Home Screen" works on iOS Safari
- [ ] Lighthouse PWA audit passes (DevTools → Lighthouse → check PWA)

---

## Updating After Deploy

```bash
# Make changes to src/App.jsx
# Then:
npm run build
npx vercel --prod     # or: npx netlify deploy --prod --dir=dist
```

The service worker will auto-update for returning users. They get the new version on next visit.

---

## Adding Real Authentication (Future)

The Google/Apple buttons currently create a local session. To add real OAuth:

```bash
# Option 1: Supabase (free tier)
npm install @supabase/supabase-js

# Option 2: Firebase
npm install firebase
```

Then wire the auth buttons to the provider SDK.
The app itself works fully without real auth — it's a local-first tool.

---

## Adding to Google Play Store (Optional, $25)

```bash
# Use PWABuilder to wrap as Trusted Web Activity
# 1. Go to pwabuilder.com
# 2. Enter your deployed URL
# 3. Download Android package
# 4. Upload to Google Play Console ($25 one-time fee)
```

Note: Apple App Store does NOT accept PWA wrappers.

---

## Tech Stack

| Layer | Tool |
|---|---|
| UI | React 18 |
| Build | Vite 6 |
| Font | Caveat (Google Fonts) |
| Storage | localStorage (device-only) |
| Offline | Service Worker |
| Hosting | Vercel / Netlify (free) |

---

## License

MIT
