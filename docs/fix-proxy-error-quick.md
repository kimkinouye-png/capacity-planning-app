# Quick Fix: "Could not proxy request" Error

## The Problem

The error occurs because `NETLIFY_DATABASE_URL` is not set for local development. Netlify Functions need this to connect to the database.

## Quick Solution

### Step 1: Get Your Database Connection String

You have two options:

**Option A: From Netlify Dashboard (if already set there)**
1. Go to https://app.netlify.com/projects/capacity-planner
2. Site settings → Build & deploy → Environment variables
3. Find `NETLIFY_DATABASE_URL` and copy the value

**Option B: From Neon Dashboard**
1. Go to https://console.neon.tech
2. Select your project
3. Go to Connection Details
4. Copy the connection string (looks like `postgresql://user:pass@host/db?sslmode=require`)

### Step 2: Create `.env` File

In your project root, create a `.env` file:

```bash
NETLIFY_DATABASE_URL=postgresql://your-connection-string-here
```

**Important:** Replace with your actual connection string from Step 1.

### Step 3: Restart Netlify Dev

```bash
# Stop any running processes
pkill -f "netlify dev"

# Start fresh
npx netlify dev
```

### Step 4: Verify

1. Open http://localhost:8888
2. Check terminal for function compilation messages
3. Try accessing Settings page - it should load without proxy errors

## Example `.env` File

```bash
NETLIFY_DATABASE_URL=postgresql://neondb_owner:password@ep-xxxx-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## Security Note

The `.env` file is already in `.gitignore`, so it won't be committed. Never commit database credentials to git!
