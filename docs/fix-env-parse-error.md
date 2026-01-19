# Fix `.env` Parse Error

## Problem

When running `source .env && npx netlify dev`, you get:
```
.env:1: parse error near '&'
```

This happens because the connection string contains `&` characters (like `&sslmode=require&channel_binding=require`), which the shell interprets as operators.

## Solution

### Option 1: Use the Helper Script (Easiest)

I've created a `start-dev.sh` script that properly loads the `.env` file:

```bash
./start-dev.sh
```

This script handles special characters in the connection string.

### Option 2: Fix `.env` Format (Manual)

Edit your `.env` file and make sure the connection string is properly quoted:

**Before (causes error):**
```
NETLIFY_DATABASE_URL=postgresql://user:pass@host/db?sslmode=require&channel_binding=require
```

**After (fixed):**
```
NETLIFY_DATABASE_URL="postgresql://user:pass@host/db?sslmode=require&channel_binding=require"
```

Or:
```
NETLIFY_DATABASE_URL='postgresql://user:pass@host/db?sslmode=require&channel_binding=require'
```

Then you can use:
```bash
source .env && npx netlify dev
```

### Option 3: Export Directly (Quick Fix)

Just export the variable with quotes:

```bash
export NETLIFY_DATABASE_URL="postgresql://neondb_owner:npg_IXaLd9VOGU8k@ep-broad-credit-ah59j990-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
npx netlify dev
```

### Option 4: Use dotenv-cli (Alternative)

Install and use `dotenv-cli`:

```bash
npm install -g dotenv-cli
dotenv -e .env -- npx netlify dev
```

## Recommended: Use the Helper Script

Just run:
```bash
./start-dev.sh
```

This handles all the complexity for you!
