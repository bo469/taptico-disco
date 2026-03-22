# Supabase Setup Guide

This guide sets up the database for the Taptico Discovery Platform so interview conversations are saved and nothing gets lost.

No technical experience needed. Follow each step in order. Takes about 10 minutes.

---

## Step 1: Create a Free Supabase Account

1. Open your browser and go to **https://supabase.com**
2. Click **Start your project** (or **Sign Up** in the top right)
3. Sign up with GitHub or your email address
4. Confirm your email if prompted

---

## Step 2: Create a New Project

1. Once logged in, you will see your Supabase dashboard
2. Click the **New project** button (green button, top right or center of screen)
3. Fill in the form:
   - **Organization:** your personal org or create one (just use your name)
   - **Project name:** `taptico-discovery` (or anything you like)
   - **Database password:** Create a strong password and save it in 1Password or your notes. You will not need it often but do not lose it.
   - **Region:** Choose **East US (N. Virginia)** for best performance
4. Click **Create new project**
5. Wait about 60 seconds while Supabase sets everything up. You will see a loading screen.

---

## Step 3: Copy Your Project URL and API Keys

1. Once the project is ready, click **Project Settings** in the left sidebar (the gear icon at the bottom)
2. Click **API** in the settings menu
3. You will see two values you need. Copy each one:

   **Project URL**
   Looks like: `https://abcdefghij.supabase.co`
   This is your `NEXT_PUBLIC_SUPABASE_URL`

   **Project API Keys -- anon / public**
   A long string starting with `eyJ...`
   This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   **Project API Keys -- service_role**
   Another long string starting with `eyJ...`
   This is your `SUPABASE_SERVICE_ROLE_KEY`
   IMPORTANT: keep this one secret. Do not share it or put it in any public files.

4. Keep this browser tab open -- you will need these values in Step 6.

---

## Step 4: Run the Database Schema

This creates the three tables the app needs: `messages`, `user_xp`, and `sessions`.

1. In the left sidebar, click **SQL Editor** (the icon looks like a terminal)
2. Click **New query** (top right of the SQL Editor)
3. Open the file `supabase/schema.sql` in this repo
4. Select all the text in that file (Cmd+A on Mac, Ctrl+A on Windows)
5. Paste it into the SQL Editor in Supabase
6. Click the green **Run** button (or press Cmd+Enter)
7. You should see a success message at the bottom. If you see an error, copy it and send it to Ada.

---

## Step 5: Verify Row Level Security is Enabled

Row Level Security (RLS) protects your data so only the server can read and write it.

The schema you just ran already enables RLS on all three tables. Here is how to confirm:

1. In the left sidebar, click **Table Editor**
2. You should see three tables: `messages`, `user_xp`, and `sessions`
3. Click on any table, then click the **RLS** badge or go to **Auth > Policies** in the sidebar
4. Each table should show RLS as **Enabled** with one policy called "Service role full access"
5. If RLS shows as disabled on any table, click the table name, find the RLS toggle, and turn it on.

---

## Step 6: Add Your Credentials to the App

The app reads its credentials from a file called `.env.local` in the project root.

1. On your computer, open the project folder `taptico-ai-platform`
2. Find the file `.env.local.example` in that folder
3. Make a copy of it and rename the copy to `.env.local` (no `.example` at the end)
4. Open `.env.local` in any text editor (TextEdit on Mac works fine)
5. Replace the placeholder values with your real values:

   - `NEXT_PUBLIC_SUPABASE_URL` -- paste your Project URL from Step 3
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` -- paste your anon key from Step 3
   - `SUPABASE_SERVICE_ROLE_KEY` -- paste your service role key from Step 3
   - `ANTHROPIC_API_KEY` -- this should already be set. If not, get it from https://console.anthropic.com/settings/api-keys

6. Save the file

---

## Step 7: Verify Everything Works

If the app is deployed on Vercel:

1. Go to your Vercel dashboard at https://vercel.com
2. Find the taptico-disco project
3. Click **Settings** then **Environment Variables**
4. Add each variable from your `.env.local` file (same names, same values)
5. Redeploy the app (Deployments > click the three dots on the latest deployment > Redeploy)

If you are running the app locally:
1. Run `npm install` in the project folder (one time only)
2. Run `npm run dev`
3. Open http://localhost:3000
4. Start a conversation. Check the Supabase Table Editor to confirm messages appear in the `messages` table.

---

## Troubleshooting

**"invalid API key" error**
Your Supabase keys are probably pasted incorrectly. Go back to Project Settings > API and re-copy them carefully.

**Tables do not appear in Table Editor**
The schema SQL did not run successfully. Go to SQL Editor, paste the schema again, and click Run.

**Messages are not saving**
Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly. The app uses this key to write to the database.

---

## You Are Done

Once you see messages appearing in the Supabase Table Editor during a test conversation, the platform is live with full message persistence.

Every interview conversation is now saved, searchable, and ready for analysis.
