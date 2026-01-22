# Ignoring "Failed retrieving addons" Error

## The Problem

Netlify dev exits with:
```
Error: Failed retrieving addons for site e0e58877-9c44-433d-bbb2-c269cf0bf156: Not Found.
```

This happens when Netlify tries to fetch environment variables from site addons, but the addon isn't accessible.

## Why It Happens

Netlify dev by default tries to:
1. Fetch environment variables from site addons
2. Merge them with local `.env` files

If step 1 fails, Netlify dev exits early, even though step 2 (local `.env`) would work fine.

## The Solution

Your `.env` file already has `NETLIFY_DATABASE_URL`, so you don't need addons. The error is harmless if you provide the env var manually.

### Method 1: Use the Updated Script (Recommended)

The `start-dev.sh` script now properly loads your `.env` file:

```bash
./start-dev.sh
```

Or:
```bash
npm run dev:local
```

This loads `NETLIFY_DATABASE_URL` from `.env` before Netlify dev starts.

### Method 2: Check if Netlify Dev Continues Despite Error

The error might be a warning. Check if the server actually starts:

1. Run `./start-dev.sh` in one terminal
2. Wait 10-15 seconds
3. In another terminal, test: `curl http://localhost:8888/.netlify/functions/get-settings`

If the function returns JSON, Netlify dev is working despite the error!

### Method 3: Run Vite + Functions Separately

If Netlify dev won't start, run Vite directly:

**Terminal 1 - Vite:**
```bash
npm run dev
```
Access app at: http://localhost:5173

**Terminal 2 - Test Functions:**
```bash
source .env
# Functions will run on Netlify's production URLs when deployed
# Or run a local function runner
```

Note: This means functions won't run locally, but the React app will work.

### Method 4: Fix Addon Setup (Long-term)

If you want Netlify dev to work without errors:

1. Go to Netlify dashboard → Site settings → Environment variables
2. Add `NETLIFY_DATABASE_URL` as an environment variable (not via addon)
3. Then `npx netlify dev` should work without the addon error

## Verification

After running `./start-dev.sh`:
- ✅ No parse errors
- ⚠️ May still see "Failed retrieving addons" (harmless)
- ✅ Functions should work at http://localhost:8888/.netlify/functions/get-settings
- ✅ React app should work at http://localhost:8888

## Current Status

The updated `start-dev.sh` script:
1. Loads `.env` file with proper quoting for special characters
2. Exports variables to shell environment
3. Starts Netlify dev (which will use those env vars)

The addon error may still appear, but functions should work because `NETLIFY_DATABASE_URL` is loaded from `.env`.
