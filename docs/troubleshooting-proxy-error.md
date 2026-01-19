# Troubleshooting "Could not proxy request" Error

## Problem

When running `npx netlify dev`, you see "Could not proxy request" error when accessing the app.

## Common Causes

### 1. Missing `NETLIFY_DATABASE_URL` Environment Variable

The Netlify Functions need `NETLIFY_DATABASE_URL` to connect to the database. If it's not set, functions will fail to start.

**Solution:**

#### Option A: Pull from Netlify (Recommended)

```bash
# Pull environment variables from Netlify
npx netlify env:get NETLIFY_DATABASE_URL > .env.local

# Or pull all environment variables
npx netlify env:list
npx netlify env:get NETLIFY_DATABASE_URL
```

Then create a `.env` file in the project root:
```bash
NETLIFY_DATABASE_URL=postgresql://your-connection-string-here
```

#### Option B: Get from Netlify Dashboard

1. Go to https://app.netlify.com/projects/capacity-planner
2. Navigate to **Site settings** → **Build & deploy** → **Environment variables**
3. Find `NETLIFY_DATABASE_URL`
4. Copy the value
5. Create a `.env` file in the project root:
   ```bash
   NETLIFY_DATABASE_URL=postgresql://your-connection-string-here
   ```

#### Option C: Get from Neon Dashboard

1. Go to https://console.neon.tech
2. Select your project
3. Go to **Connection Details**
4. Copy the connection string
5. Create a `.env` file:
   ```bash
   NETLIFY_DATABASE_URL=postgresql://your-connection-string-here
   ```

### 2. Vite Dev Server Not Starting

Netlify dev proxies to Vite on port 5173. If Vite isn't starting, the proxy will fail.

**Solution:**

Check if Vite is running:
```bash
lsof -ti:5173
```

If not, try starting Vite manually first:
```bash
npm run dev
```

Then in another terminal, start Netlify dev:
```bash
npx netlify dev
```

### 3. Port Conflicts

If ports 5173 or 8888 are already in use, Netlify dev might fail.

**Solution:**

```bash
# Kill processes on these ports
lsof -ti:5173 | xargs kill -9
lsof -ti:8888 | xargs kill -9

# Then restart
npx netlify dev
```

### 4. Functions Compilation Errors

If there are TypeScript errors in the functions, they won't compile and the proxy will fail.

**Solution:**

```bash
# Check for TypeScript errors
npm run typecheck

# Check function files specifically
cd netlify/functions
npx tsc --noEmit
```

## Quick Fix

1. **Create `.env` file** in project root:
   ```bash
   NETLIFY_DATABASE_URL=your-database-connection-string
   ```

2. **Restart Netlify dev**:
   ```bash
   pkill -f "netlify dev"
   npx netlify dev
   ```

3. **Verify functions are loading**:
   - Check terminal output for function compilation messages
   - Try accessing: http://localhost:8888/.netlify/functions/get-settings

## Verification

Once fixed, you should see:
- ✅ Netlify dev server starting on port 8888
- ✅ Vite dev server starting on port 5173
- ✅ Functions compiling successfully
- ✅ No "Could not proxy request" errors
