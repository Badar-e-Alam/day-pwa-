# Supabase Auth Setup Guide

Follow these steps to get real Google & Apple sign-in working.

---

## Step 1: Create Supabase Project (2 minutes)

1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. Click **New Project**
3. Name: `day-planner`
4. Set a database password (save it somewhere)
5. Region: pick closest to your users (e.g., Frankfurt for Germany)
6. Click **Create new project** → wait ~2 minutes

## Step 2: Get Your Keys (30 seconds)

1. In your Supabase dashboard → **Settings** → **API**
2. Copy these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...` (long string)
3. Open `src/supabase.js` and paste them:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGci...YOUR_KEY_HERE';
```

## Step 3: Set Redirect URL (30 seconds)

1. Supabase dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL** to your deployed URL: `https://your-app.vercel.app`
3. Under **Redirect URLs**, add:
   - `https://your-app.vercel.app`
   - `http://localhost:3000` (for local development)

---

## Step 4: Enable Google Sign-In (5 minutes)

### 4a. Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Go to **APIs & Services** → **OAuth consent screen**
   - User type: **External**
   - App name: `day.`
   - Support email: your email
   - Click **Save and Continue** through all steps
4. Go to **APIs & Services** → **Credentials**
5. Click **+ Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `day. PWA`
   - Authorized redirect URIs: add `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
   - Click **Create**
6. Copy the **Client ID** and **Client Secret**

### 4b. Supabase Dashboard

1. Go to **Authentication** → **Providers**
2. Find **Google** → toggle it ON
3. Paste your **Client ID** and **Client Secret**
4. Click **Save**

Google sign-in is now live.

---

## Step 5: Enable Apple Sign-In (10 minutes)

> Requires an Apple Developer account ($99/year)
> Skip this step if you only want Google for now — the app works fine with just Google.

### 5a. Apple Developer Portal

1. Go to [developer.apple.com](https://developer.apple.com)
2. **Certificates, Identifiers & Profiles** → **Identifiers**
3. Click **+** → Register an **App ID**
   - Description: `day planner`
   - Bundle ID: `com.yourname.dayplanner`
   - Enable **Sign In with Apple** → Continue → Register
4. Now create a **Services ID**:
   - Click **+** → **Services IDs**
   - Description: `day. web auth`
   - Identifier: `com.yourname.dayplanner.web`
   - Enable **Sign In with Apple** → Configure:
     - Primary App ID: select the one you just created
     - Domains: `YOUR_PROJECT_ID.supabase.co`
     - Return URLs: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
   - Save → Continue → Register
5. Create a **Key**:
   - Go to **Keys** → Click **+**
   - Name: `day-supabase`
   - Enable **Sign In with Apple** → Configure → Select your App ID
   - Continue → Register → **Download** the `.p8` file (save it!)
   - Note the **Key ID**

### 5b. Supabase Dashboard

1. Go to **Authentication** → **Providers**
2. Find **Apple** → toggle it ON
3. Fill in:
   - **Client ID**: your Services ID (`com.yourname.dayplanner.web`)
   - **Secret Key**: paste contents of the `.p8` file
   - **Key ID**: from step 5a
   - **Team ID**: found at top-right of Apple Developer portal
4. Click **Save**

Apple sign-in is now live.

---

## Step 6: Test

```bash
npm run dev
# Open http://localhost:3000
# Tap "Continue with Google"
# Should redirect to Google → sign in → back to app
```

If it works locally, deploy and test the production URL too.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "Redirect URI mismatch" | Add exact redirect URL in both Google Console AND Supabase URL config |
| "Invalid client_id" | Double-check the Client ID in Supabase matches Google Console |
| Stuck on loading after redirect | Make sure Site URL in Supabase matches your actual deployed URL |
| Apple sign-in not working | Verify the Services ID (not App ID) is used as Client ID |
| Works locally but not in production | Add your production URL to Supabase redirect URLs AND Google authorized URIs |

---

## What Happens Under the Hood

1. User taps "Continue with Google"
2. `supabase.auth.signInWithOAuth({ provider: 'google' })` redirects to Google
3. User signs in with their Google account
4. Google redirects to `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
5. Supabase verifies the token, creates a user record, creates a session
6. Supabase redirects back to your app URL
7. `onAuthStateChange` fires with `SIGNED_IN` event
8. App extracts user name, email, avatar from session
9. User sees the planner

The user's Google/Apple account IS their account. No passwords, no email verification, no extra signup form.

---

## Cost

| Service | Free Tier | When You Pay |
|---|---|---|
| Supabase Auth | 50,000 monthly active users | > 50k MAU → $25/month |
| Google OAuth | Unlimited | Never |
| Apple Developer | — | $99/year (required) |

For Google-only auth, total cost is **$0**.
