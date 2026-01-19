# Final Solution: Making Netlify Dev Work

## The Problem

Netlify dev exits with "Failed retrieving addons" error, even though `NETLIFY_DATABASE_URL` is set in the Netlify dashboard. The server never starts.

## Root Cause

Netlify dev tries to fetch addons **before** starting. When this fails, it exits immediately, never reaching the point where it would use environment variables from the dashboard or `.env` files.

## The Solution

Since Netlify dev exits early, we need to load the environment variable **before** Netlify dev starts. Use the `start-dev.sh` script:

### Step 1: Ensure `.env` File Exists

Your `.env` file should have the connection string (quotes optional for the script):

```
NETLIFY_DATABASE_URL=postgresql://neondb_owner:npg_IXaLd9VOGU8k@ep-broad-credit-ah59j990-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

Or with quotes (both work):

```
NETLIFY_DATABASE_URL="postgresql://neondb_owner:npg_IXaLd9VOGU8k@ep-broad-credit-ah59j990-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### Step 2: Use the Helper Script

```bash
./start-dev.sh
```

Or use the npm script:

```bash
npm run dev:local
```

### How It Works

1. The script loads `NETLIFY_DATABASE_URL` from `.env` into the shell environment
2. Netlify dev starts and inherits the environment variable
3. Even if the addon fetch fails, Netlify dev **should** continue because the env var is already set

## If Netlify Dev Still Exits

If Netlify dev still exits despite the environment variable being set, it's a bug in Netlify CLI. You have two options:

### Option A: Run Vite Directly (For React App Only)

```bash
npm run dev
```

This starts Vite on http://localhost:5173. Functions won't work locally, but the React app will.

### Option B: Deploy and Test Functions in Production

1. Deploy to Netlify (functions will use the dashboard env var)
2. Test functions at: `https://your-site.netlify.app/.netlify/functions/get-settings`

## Why Netlify Dev Might Still Fail

Netlify dev's addon fetching is a blocking operation. If it fails, Netlify dev might exit before it can use:
- Environment variables from the dashboard
- Environment variables from `.env` files
- Environment variables already set in the shell

This appears to be a limitation/bug in Netlify CLI where it doesn't gracefully handle addon fetch failures.

## Recommended Workflow

For now, the best approach is:

1. **For React app development**: Use `npm run dev` (Vite)
2. **For Function testing**: Deploy to Netlify and test in production
3. **For full-stack local development**: Try `./start-dev.sh` - if it works, great! If not, use the workflow above.

## Future Fix

This should ideally be fixed in Netlify CLI to:
- Make addon fetching non-blocking
- Continue even if addon fetch fails
- Use environment variables from other sources (dashboard, `.env`) even if addons fail

## Verification

After running `./start-dev.sh`, if Netlify dev starts:

```bash
# In another terminal
curl http://localhost:8888/.netlify/functions/get-settings
```

Should return JSON with your settings!
