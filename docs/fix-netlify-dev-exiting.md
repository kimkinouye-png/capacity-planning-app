# Fix: Netlify Dev Exiting on Addon Error

## Problem

Netlify dev exits immediately with:
```
Error: Failed retrieving addons for site e0e58877-9c44-433d-bbb2-c269cf0bf156: Not Found.
```

The server never starts, so `curl http://localhost:8888/.netlify/functions/get-settings` fails with "Couldn't connect to server".

## Root Cause

Netlify dev tries to fetch environment variables from site addons before starting. When this fails, it exits early instead of continuing with local `.env` files.

## Solution: Add Environment Variable to Netlify Dashboard

The proper fix is to add `NETLIFY_DATABASE_URL` as an **environment variable** (not an addon) in the Netlify dashboard:

### Steps:

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com/
   - Select your site

2. **Navigate to Environment Variables**
   - Go to: **Site settings** → **Environment variables**

3. **Add the Variable**
   - Click **Add a variable**
   - **Key**: `NETLIFY_DATABASE_URL`
   - **Value**: Your full Neon connection string:
     ```
     postgresql://neondb_owner:npg_IXaLd9VOGU8k@ep-broad-credit-ah59j990-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
     ```
   - **Scopes**: Select **All scopes** (or at least "Local development")

4. **Save**

5. **Try Netlify Dev Again**
   ```bash
   npx netlify dev
   ```

Now Netlify dev should be able to fetch the environment variable and start successfully!

## Alternative: Run Vite Separately

If you can't add the env var to Netlify dashboard right now, run Vite directly for React app development:

```bash
npm run dev
```

This starts Vite on http://localhost:5173. Functions will work when deployed to production on Netlify.

## Why This Works

- Netlify dev fetches environment variables from:
  1. Site addons (fails in your case)
  2. Site environment variables (needs to be added)
  3. Local `.env` files (only used if above succeed or as fallback)

- When addon fetch fails, Netlify dev exits before it can use `.env` files
- Adding the env var to the dashboard allows Netlify dev to fetch it successfully

## Verification

After adding the env var to Netlify dashboard:

1. Run: `npx netlify dev`
2. Should see: "Netlify Dev now running..." (no addon error)
3. Wait for server to start (10-15 seconds)
4. Test: `curl http://localhost:8888/.netlify/functions/get-settings`
5. Should return: JSON with settings data

## Quick Command Reference

```bash
# After adding env var to Netlify dashboard
npx netlify dev

# Or use the helper script (still loads .env as backup)
./start-dev.sh

# For React app only (no functions)
npm run dev
```
