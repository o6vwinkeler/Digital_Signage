# Digital Signage App — Deployment Guide (No Coding Required)

This app is fully built. You just need to create two free accounts and connect
them together with copy/paste. Total time: ~20 minutes.

## What you're deploying
- **Vercel** — hosts the website (free)
- **Supabase** — handles logins, password resets, database, and file storage (free)
- **OpenWeatherMap** — free weather data by zip code
- **TheSportsDB** — free sports scores (no signup needed, uses a shared free key)

---

## Step 1: Create a Supabase project
1. Go to https://supabase.com and sign up (free).
2. Click **New Project**. Name it anything (e.g. "signage"). Set a database password
   (save it somewhere) and pick a region close to you.
3. Wait ~2 minutes for it to finish setting up.
4. In the left sidebar, go to **SQL Editor** → **New Query**.
5. Open the file `supabase-schema.sql` from this project, copy all of its contents,
   paste into the SQL editor, and click **Run**. This creates the database tables,
   security rules, and file storage bucket.
6. In the left sidebar, go to **Project Settings → API**. You'll need two values
   from this page in Step 3: the **Project URL** and the **anon public key**.
7. Go to **Authentication → Settings** (or **URL Configuration**) and make sure
   "Enable email confirmations" is on (it is by default) — this powers the signup
   confirmation and password reset emails automatically. No email server setup
   needed; Supabase sends these for you on the free tier.

## Step 2: Get a free weather API key
1. Go to https://openweathermap.org/api and sign up (free).
2. Go to your account's **API keys** tab and copy the default key.
   (It can take up to an hour to activate after signup — that's normal.)

## Step 3: Push the code to GitHub (so Vercel can deploy it)
1. Go to https://github.com and sign up if you don't have an account.
2. Click **New repository**, name it e.g. `signage-app`, keep it Public or Private,
   click **Create repository**.
3. On the new repo's page, click **uploading an existing file**.
4. Drag in every file and folder from this project (keep the folder structure —
   `app/`, `lib/`, `package.json`, etc.) and click **Commit changes**.

## Step 4: Deploy to Vercel
1. Go to https://vercel.com and sign up using your GitHub account (free).
2. Click **Add New → Project**, then select the `signage-app` repository you just created.
3. Before clicking Deploy, open **Environment Variables** and add these four:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | (Project URL from Supabase Step 1.6) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (anon public key from Supabase Step 1.6) |
   | `OPENWEATHER_API_KEY` | (key from Step 2) |
   | `SPORTSDB_API_KEY` | `3` |

4. Click **Deploy**. In about a minute, Vercel gives you a live URL like
   `https://signage-app-yourname.vercel.app`.

## Step 5: Tell Supabase about your live URL
1. Back in Supabase, go to **Authentication → URL Configuration**.
2. Set **Site URL** to your Vercel URL (e.g. `https://signage-app-yourname.vercel.app`).
3. This makes password reset links point to the right place.

---

## Using the app
- **Sign up:** go to `yourdomain.vercel.app/admin/signup`, create an account with
  your company name — this also creates your unique display URL.
- **Log in / dashboard:** `yourdomain.vercel.app/admin/dashboard` — set your zip
  code, favorite team, upload a logo, and upload stills/videos.
- **Live signage screen:** your dashboard shows your unique URL, something like
  `yourdomain.vercel.app/display/your-company-name` — open that on the TV/screen
  you want to use for signage. No login needed to view it.
- **Forgot password:** `yourdomain.vercel.app/admin/reset-password` sends a reset
  email automatically.

## Free tier limits to be aware of
- **Supabase:** 500MB database, 1GB file storage, 2GB file bandwidth/month
- **Vercel:** 100GB bandwidth/month
- **OpenWeatherMap:** 1,000 calls/day
- Since you're using small video clips, you should stay well within all of these.
  If a screen is idle 24/7 pulling weather/sports every 10 minutes, that's very
  light — the file storage/bandwidth for video is the one to watch as you add
  more signage locations.

## If something doesn't work
- Blank page or errors on the site → double check the 4 environment variables in
  Vercel exactly match Supabase (no extra spaces).
- Not receiving signup/reset emails → check spam folder; Supabase's free tier
  sends a limited number of emails per hour, which is fine for testing/small use.
- Weather not showing → your OpenWeatherMap key may still be activating (can take
  up to an hour after signup).
