# Quick Fix for `.env` Parse Error

## The Problem

Your `.env` file has a connection string with `&` characters that cause a parse error:
```
.env:1: parse error near '&'
```

## Quick Fix (Choose One)

### ✅ Option 1: Use the Helper Script (Recommended)

```bash
./start-dev.sh
```

Or use npm script:
```bash
npm run dev:local
```

### ✅ Option 2: Fix `.env` File Format

Edit your `.env` file and **add quotes** around the connection string:

**Change this:**
```
NETLIFY_DATABASE_URL=postgresql://...?sslmode=require&channel_binding=require
```

**To this:**
```
NETLIFY_DATABASE_URL="postgresql://...?sslmode=require&channel_binding=require"
```

Then:
```bash
source .env && npx netlify dev
```

### ✅ Option 3: Export with Quotes

Just export the variable directly (one-time use):

```bash
export NETLIFY_DATABASE_URL="postgresql://neondb_owner:npg_IXaLd9VOGU8k@ep-broad-credit-ah59j990-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
npx netlify dev
```

## Why This Happens

The `&` character in URLs is a shell operator (runs command in background). Quoting prevents the shell from interpreting it.

## Recommendation

**Use Option 1** (`./start-dev.sh`) - it's the easiest and handles everything automatically!
