# Supabase Setup Guide

## 1. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign in (free account).
2. Click **New project**.
3. Give it a name (e.g. `leetcode-tracker`), set a database password, pick the region closest to you.
4. Wait ~1 minute for the project to provision.

## 2. Run the schema

1. In your Supabase project, go to **SQL Editor** (left sidebar).
2. Click **New query**.
3. Open `supabase/schema.sql` from this repo, copy the entire contents, paste it in, and click **Run**.
4. You should see "Success. No rows returned." — all 5 tables are now created with default settings seeded.

## 3. Get your API keys

1. Go to **Project Settings** (gear icon, bottom-left) → **Data API** tab.
2. Copy:
   - **Project URL** → this is your `VITE_SUPABASE_URL`
   - **anon / public** key → this is your `VITE_SUPABASE_ANON_KEY`

## 4. Configure the app

1. In the `leetcode-tracker/` folder, copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
2. Open `.env` and paste in your values:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 5. Get your Gemini API key (for AI features — Phase 5)

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
2. Click **Create API key** → select your Google Cloud project (or create one).
3. Copy the key.
4. In the app, go to **Settings** and paste it into the Gemini API Key field. It is stored only in your browser's `localStorage` and never sent to Supabase.

## 6. Start the dev server

```bash
npm run dev
```

App runs at `http://localhost:5173`.
