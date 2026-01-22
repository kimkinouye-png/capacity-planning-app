# Fix "Failed retrieving addons" Error

## Problem

Netlify dev fails with:
```
Error: Failed retrieving addons for site e0e58877-9c44-433d-bbb2-c269cf0bf156: Not Found.
```

This happens when Netlify tries to fetch environment variables from site addons, but the addon isn't properly configured.

## Solution

Since you already have a `.env` file with `NETLIFY_DATABASE_URL`, Netlify dev will automatically use it. The error is just a warning about addons - it won't prevent the dev server from working.

### Option 1: Ignore the Error (Recommended)

The `.env` file will still be read. Try accessing http://localhost:8888 even if you see the error - it might still work.

### Option 2: Run Vite Separately (Alternative)

If Netlify dev continues to fail, run Vite directly:

```bash
# Terminal 1: Run Vite dev server
npm run dev

# Terminal 2: Test functions directly
# Functions will need NETLIFY_DATABASE_URL from .env
```

### Option 3: Set Environment Variable Directly

Run Netlify dev with the environment variable set explicitly:

```bash
source .env
npx netlify dev
```

Or on a single line:
```bash
export NETLIFY_DATABASE_URL="$(grep NETLIFY_DATABASE_URL .env | cut -d'=' -f2-)" && npx netlify dev
```

## Verification

After running Netlify dev, check:
1. Open http://localhost:8888
2. Try accessing http://localhost:8888/.netlify/functions/get-settings
3. If it returns settings JSON, everything is working!

## Next Steps

If the addon error persists but functions work:
- The error is harmless - Netlify dev is still using your `.env` file
- You can ignore it or suppress it by not linking to the site in development
