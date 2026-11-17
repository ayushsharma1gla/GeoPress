# GeoPress – Supabase Setup Guide

## ⏱ Takes about 5 minutes

---

## Step 1 – Create a Free Supabase Account

1. Go to **https://supabase.com** → click **Start your project**
2. Sign in with GitHub (easiest) or create an account
3. Click **New project**
4. Fill in:
   - **Name**: `geopress`
   - **Database Password**: choose a strong password (save it!)
   - **Region**: South Asia (Mumbai) — closest to India
5. Click **Create new project** and wait ~1 minute for provisioning

---

## Step 2 – Run the Database Schema

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open `server/supabase_setup.sql` from this project
4. Paste the entire contents into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see: `Success. No rows returned`

---

## Step 3 – Get Your API Keys

1. Click **Project Settings** (gear icon) in the left sidebar
2. Click **API** tab
3. Copy these two values:

| Value | Where to find it |
|-------|-----------------|
| **Project URL** | Under "Project URL" |
| **service_role** key | Under "Project API Keys" → `service_role` (click "Reveal") |

---

## Step 4 – Fill in `server/.env`

Open `server/.env` and replace the placeholder values:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=replace-with-a-unique-secret-at-least-32-characters
PORT=5000
CLIENT_URL=http://localhost:5173
```

For production, set these values in the Render dashboard instead of committing them. Use the `CLIENT_URL` of the deployed Vercel site.

---

## Step 5 – Start the App

Open **two terminals**:

**Terminal 1 – Backend:**
```bash
cd server
npm run dev
```
You should see:
```
✅ Supabase (PostgreSQL) Connected Successfully
🚀 Server running on http://localhost:5000
```

**Terminal 2 – Frontend:**
```bash
cd client
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## ✅ What's Working

| Feature | Status |
|---------|--------|
| User Signup | ✅ Saves to Supabase PostgreSQL |
| User Login | ✅ JWT authentication |
| Profile page | ✅ Loads from database |
| Profile image upload | ✅ Stored in Supabase Storage |
| News feed | ✅ Free RSS feeds (no API key!) |
| Map view | ✅ Geocoding via OpenStreetMap |
| Forgot password | ✅ Works with Supabase |
