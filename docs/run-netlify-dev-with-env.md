# Running Netlify Dev with .env File

## The Problem

Netlify dev fails with:
```
Error: Failed retrieving addons for site e0e58877-9c44-433d-bbb2-c269cf0bf156: Not Found.
```

This happens when Netlify tries to fetch addon environment variables, but the addon isn't accessible.

## Solution: Load .env Manually

Since your `.env` file exists, load it before running Netlify dev:

### Method 1: Source .env and Run (Recommended)

In your terminal, run:

```bash
source .env
npx netlify dev
```

This loads the `NETLIFY_DATABASE_URL` from your `.env` file before Netlify dev starts.

### Method 2: Export Directly

```bash
export NETLIFY_DATABASE_URL="postgresql://neondb_owner:npg_IXaLd9VOGU8k@ep-broad-credit-ah59j990-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
npx netlify dev
```

### Method 3: One-Line Command

```bash
source .env && npx netlify dev
```

### Method 4: Run Vite Separately (If Netlify Dev Still Fails)

If Netlify dev continues to have issues:

**Terminal 1 - Run Vite:**
```bash
npm run dev
```
This starts Vite on http://localhost:5173

**Terminal 2 - Test Functions:**
```bash
source .env
# Test a function directly
curl http://localhost:8888/.netlify/functions/get-settings
```

## Verification

After running with `source .env && npx netlify dev`, you should see:
- ✅ Functions compiling successfully
- ✅ Vite dev server starting on port 5173
- ✅ Netlify Functions proxy on port 8888
- ✅ No "Could not proxy request" errors

## What's Happening

- The `.env` file contains your database connection string
- `source .env` loads it into your current shell session
- Netlify dev reads environment variables from the shell
- Functions can now connect to the database using `NETLIFY_DATABASE_URL`

## Note About the Addon Error

The "Failed retrieving addons" error is harmless if you're using a local `.env` file. The functions will still work because they read `NETLIFY_DATABASE_URL` from the environment, not from Netlify addons.
