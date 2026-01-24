# Database Connection Troubleshooting Guide

## Symptoms
- All Netlify functions returning 500 errors
- `db-health` function failing
- "API unavailable, using local data" warnings
- "SERVER_ERROR" messages in console

## Common Causes & Solutions

### 1. Missing Environment Variable (Most Common)

**Problem:** `NETLIFY_DATABASE_URL` is not set in Netlify

**Check:**
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site: `capacity-planning-2`
3. Go to **Site settings** → **Environment variables**
4. Look for `NETLIFY_DATABASE_URL`

**Fix:**
1. Get your Neon database connection string from [Neon Dashboard](https://console.neon.tech)
2. In Netlify, add environment variable:
   - **Key:** `NETLIFY_DATABASE_URL`
   - **Value:** Your Neon connection string (starts with `postgresql://...`)
3. **Redeploy** the site (or trigger a new deploy)

**Verify:**
- Check Netlify function logs after redeploy
- Should see connection logs instead of "environment variable is not set" errors

### 2. Incorrect Connection String Format

**Problem:** Connection string is malformed or missing required parts

**Check Connection String:**
- Should start with: `postgresql://` or `postgres://`
- Should include: username, password, host, database name
- Example format: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`

**Common Issues:**
- Missing `?sslmode=require` (required for Neon)
- Incorrect password (special characters not URL-encoded)
- Wrong database name

**Fix:**
1. Get fresh connection string from Neon Dashboard
2. Copy the **full connection string** (not just parts)
3. Update in Netlify environment variables
4. Redeploy

### 3. Neon Database Suspended

**Problem:** Neon free tier databases suspend after inactivity

**Check:**
1. Go to [Neon Dashboard](https://console.neon.tech)
2. Check your project status
3. Look for "Suspended" or "Paused" status

**Fix:**
1. Click "Resume" or "Wake up" in Neon dashboard
2. Wait 10-30 seconds for database to wake up
3. Try your operations again

**Prevention:**
- Consider upgrading to Neon Pro (no auto-suspend)
- Or implement a keep-alive ping every few minutes

### 4. Network/Firewall Issues

**Problem:** Netlify functions can't reach Neon database

**Check:**
1. Verify Neon database is accessible (try connecting from local machine)
2. Check Neon project settings for IP restrictions
3. Verify SSL/TLS settings

**Fix:**
1. In Neon Dashboard → Project Settings
2. Check "IP Allowlist" - should allow all or include Netlify IPs
3. Ensure SSL is enabled (should be by default)

### 5. Database Connection Timeout

**Problem:** Database takes too long to respond (hitting our 20s timeout)

**Check Netlify Function Logs:**
Look for logs like:
```
🔌 [delete-roadmap-item] Starting database connection...
⏳ [WRITE] Database connection attempt 1/3 failed: timeout...
```

**Possible Causes:**
- Database is suspended (takes 10-20s to wake)
- Network latency
- Database overloaded

**Fix:**
- If suspended: Wake database in Neon dashboard
- If consistently slow: Check Neon metrics for performance issues
- Consider increasing timeout (but we reduced it for faster failures)

## Diagnostic Steps

### Step 1: Check Environment Variable

**In Netlify Dashboard:**
1. Site settings → Environment variables
2. Verify `NETLIFY_DATABASE_URL` exists
3. Check if it's set for correct environment (Production, Deploy preview, Branch deploy)

**In Function Logs:**
Look for error: `NETLIFY_DATABASE_URL environment variable is not set`
- If you see this → Environment variable is missing

### Step 2: Test db-health Function

**Direct URL Test:**
1. Go to: `https://capacity-planning-2.netlify.app/.netlify/functions/db-health`
2. Should return JSON:
   ```json
   {
     "status": "ok",
     "message": "Database connection successful",
     "timestamp": "..."
   }
   ```
3. If returns 500 → Check Netlify function logs for specific error

### Step 3: Check Netlify Function Logs

**Steps:**
1. Netlify Dashboard → Your site → Functions → View logs
2. Trigger a function (e.g., visit scenarios page)
3. Look for error messages

**Common Error Messages:**

| Error | Cause | Fix |
|-------|-------|-----|
| `NETLIFY_DATABASE_URL environment variable is not set` | Missing env var | Add in Netlify dashboard |
| `connect ETIMEDOUT` | Network timeout | Check Neon status, wake database |
| `connect ECONNREFUSED` | Connection refused | Check connection string, database status |
| `password authentication failed` | Wrong credentials | Update connection string |
| `database "..." does not exist` | Wrong database name | Fix connection string |
| `SSL connection required` | SSL not enabled | Add `?sslmode=require` to connection string |

### Step 4: Test Connection String Locally

**Create test script:**
```typescript
// test-db-connection.ts
import { neon } from '@neondatabase/serverless'

const connectionString = process.env.NETLIFY_DATABASE_URL

if (!connectionString) {
  console.error('NETLIFY_DATABASE_URL not set')
  process.exit(1)
}

async function test() {
  try {
    const sql = neon(connectionString)
    const result = await sql`SELECT 1 as test`
    console.log('✅ Connection successful:', result)
  } catch (error) {
    console.error('❌ Connection failed:', error)
    process.exit(1)
  }
}

test()
```

**Run:**
```bash
NETLIFY_DATABASE_URL="your-connection-string" npx tsx test-db-connection.ts
```

## Quick Fix Checklist

- [ ] `NETLIFY_DATABASE_URL` exists in Netlify environment variables
- [ ] Connection string is complete and correct
- [ ] Neon database is active (not suspended)
- [ ] Connection string includes `?sslmode=require`
- [ ] Site has been redeployed after adding env var
- [ ] No IP restrictions blocking Netlify

## Next Steps After Fixing

1. **Verify db-health works:**
   - Visit: `https://capacity-planning-2.netlify.app/.netlify/functions/db-health`
   - Should return `{"status":"ok",...}`

2. **Test a function:**
   - Visit scenarios page
   - Should load data (not show "API unavailable")

3. **Check console logs:**
   - Should see successful API calls
   - No more 500 errors

4. **Monitor function logs:**
   - Watch for connection timing
   - Should see successful connection logs

## Still Not Working?

If none of the above fixes work:

1. **Check Neon Dashboard:**
   - Project status
   - Connection pooling settings
   - Recent activity/errors

2. **Check Netlify Function Logs:**
   - Look for specific error messages
   - Check timing (are timeouts happening?)

3. **Try Fresh Connection String:**
   - Generate new connection string in Neon
   - Update in Netlify
   - Redeploy

4. **Contact Support:**
   - Share Netlify function logs
   - Share Neon project status
   - Share connection string format (without password)
