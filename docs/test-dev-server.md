# Testing Netlify Dev Server

## The Issue

Netlify dev shows "Failed retrieving addons" but may still be working. The error is harmless if you have `.env` file.

## How to Test

### Step 1: Start the Server

Run:
```bash
./start-dev.sh
```

Or:
```bash
npm run dev:local
```

### Step 2: Wait for Startup

Even if you see the "Failed retrieving addons" error, **wait 10-15 seconds**. Netlify dev might still be starting in the background.

### Step 3: Test in Another Terminal

Open a **new terminal** and run:

```bash
# Test if functions are responding
curl http://localhost:8888/.netlify/functions/get-settings

# Or test the React app
curl http://localhost:8888
```

### Step 4: Check the Output

**If the function returns JSON:**
```json
{"effort_model": {...}, "time_model": {...}, ...}
```
✅ **Success!** Netlify dev is working despite the error.

**If you get "Connection refused":**
❌ Netlify dev exited due to the error.

## Alternative: Run Vite Directly

If Netlify dev won't start, run Vite separately:

**Terminal 1:**
```bash
npm run dev
```
React app at: http://localhost:5173

**Terminal 2:**
```bash
source .env
# Test production functions at:
curl https://your-site.netlify.app/.netlify/functions/get-settings
```

## Why This Works

The "Failed retrieving addons" error happens when Netlify tries to fetch environment variables from site addons. However:

1. Your `.env` file has `NETLIFY_DATABASE_URL`
2. The `start-dev.sh` script loads it before Netlify dev starts
3. Netlify Functions read `NETLIFY_DATABASE_URL` from the environment
4. Functions work even if the addon fetch fails

## Next Steps

If Netlify dev continues despite the error:
- ✅ You're all set! Functions will work locally
- Access React app at: http://localhost:8888
- Test functions at: http://localhost:8888/.netlify/functions/get-settings

If Netlify dev exits:
- Try running Vite directly: `npm run dev`
- Functions will work in production (deployed to Netlify)
- For local function testing, you may need to set up the addon in Netlify dashboard
