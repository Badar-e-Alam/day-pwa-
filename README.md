# day.

**Your day. Your plan. Your control.**

A free, open-source daily planner that puts you in charge of your schedule. No subscriptions, no paywalls, no data harvesting. Just a clean tool to plan your day with intention.

> *"Software is like sex: it's better when it's free."*
> — Linus Torvalds

> *"Either write something worth reading or do something worth writing."*
> — Benjamin Franklin

---

## Why day.?

Most planning apps want your money, your data, or both. **day.** wants neither.

- **Plan your day** with time blocks, tasks, habits, trackers, notes, and a drawing canvas
- **Sign in with Google** — your data syncs across all your devices via Supabase
- **Works offline** — plan on a plane, in the mountains, wherever
- **Install on any device** — phone, tablet, desktop. No app store needed
- **Dark theme** — easy on the eyes, day or night

> *"The best way to predict the future is to create it."*
> — Peter Drucker

---

## Free. Forever.

This project is MIT licensed. It was born free and it will stay free.

No "premium tiers." No "upgrade to unlock." No bait-and-switch.

> *"Free software is a matter of liberty, not price. To understand the concept, you should think of free as in free speech, not as in free beer."*
> — Richard Stallman

If a planning tool helps people take control of their day, it should be available to everyone — not just those who can afford a subscription.

---

## Get Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- A free [Supabase](https://supabase.com) project (for auth & sync)
- A free [Vercel](https://vercel.com) or [Netlify](https://netlify.com) account (for hosting)

### Setup

```bash
# Clone the repo
git clone https://github.com/Badar-e-Alam/day-pwa-.git
cd day-pwa-

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
# Edit .env with your Supabase credentials

# Run locally
npm run dev
```

### Environment Variables

Create a `.env` file in the root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
```

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for the full auth setup guide.

---

## Deploy

```bash
# Build for production
npm run build

# Deploy to Vercel
npx vercel --prod

# Or deploy to Netlify
npx netlify deploy --prod --dir=dist
```

Add your Supabase env vars in your hosting provider's dashboard.

---

## Install as an App

### Android (Chrome)
Visit your URL > tap **"Add to Home Screen"** or the install banner

### iPhone (Safari)
Visit your URL > tap **Share** > **"Add to Home Screen"**

### Desktop (Chrome/Edge)
Visit your URL > click the **install icon** in the address bar

---

## How It Works

| Feature | How |
|---|---|
| **Auth** | Google OAuth via Supabase |
| **Cloud sync** | Data saved to Supabase on every change (debounced) |
| **Offline** | localStorage + Service Worker — works without internet |
| **Merge** | On login, local and cloud data merge so nothing is lost |

Your data lives in two places: **locally** on your device (always available) and **in the cloud** (synced when online). You're never locked out of your own plans.

---

## Project Structure

```
day-pwa/
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
    ├── supabase.js         ← Supabase client
    └── App.jsx             ← Entire planner application
```

---

## Tech Stack

| Layer | Tool |
|---|---|
| UI | React 18 |
| Build | Vite 6 |
| Auth & Database | Supabase (free tier) |
| Font | Caveat (Google Fonts) |
| Storage | localStorage + Supabase cloud sync |
| Offline | Service Worker |
| Hosting | Vercel / Netlify (free) |

---

## Contributing

This is an open-source project. If you want to make it better, you're welcome.

1. Fork the repo
2. Create a branch (`git checkout -b feature/your-idea`)
3. Commit your changes
4. Push and open a Pull Request

> *"Talk is cheap. Show me the code."*
> — Linus Torvalds

---

## License

**MIT** — Do whatever you want with it. Free as in freedom.

> *"Give ordinary people the right tools, and they will design and build the most extraordinary things."*
> — Neil Gershenfeld

---

**Plan your day. Own your time. Share the tool.**
