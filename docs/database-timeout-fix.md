# Database Connection Timeout Fix

**Date:** January 21, 2026  
**Issue:** Neon database compute suspension causes connection timeouts  
**Solution:** Added connection timeout configuration and retry logic

---

## Problem

The `capacity-planner-2` site was failing to connect to its Neon database because:
- Neon compute suspends after inactivity
- Takes several seconds to wake up
- Connection timeout was too short (default ~5 seconds)
- No retry logic for transient connection failures

---

## Solution

### 1. Created Database Connection Utility

**File:** `netlify/functions/db-connection.ts`

**Features:**
- ✅ Connection timeout: 15 seconds (allows time for Neon compute wake-up)
- ✅ Retry logic: 3 attempts with exponential backoff
- ✅ Connection string enhancement: Adds `connect_timeout` and `sslmode` parameters
- ✅ Error detection: Identifies retryable errors (timeout, connection, suspended, etc.)
- ✅ Uses `@neondatabase/serverless` directly for better configuration support

**Connection String Enhancement:**
- Adds `?sslmode=require&connect_timeout=15` to connection string
- Handles existing query parameters gracefully

**Retry Logic:**
- Initial delay: 1 second
- Exponential backoff: 1s → 2s → 4s (max 5s)
- Maximum retries: 3 attempts

---

## Files Modified

### New File
- `netlify/functions/db-connection.ts` - Database connection utility with timeout and retry

### Updated Functions (13 files)
All Netlify Functions now use `getDatabaseConnection()` instead of `neon()`:

1. `get-scenarios.ts`
2. `get-roadmap-items.ts`
3. `create-scenario.ts`
4. `create-roadmap-item.ts`
5. `update-scenario.ts`
6. `update-roadmap-item.ts`
7. `update-settings.ts`
8. `get-settings.ts`
9. `delete-scenario.ts`
10. `delete-roadmap-item.ts`
11. `get-activity-log.ts`
12. `create-activity-log-entry.ts`
13. `db-health.ts`

---

## Changes Made

### Before (Each Function)
```typescript
import { neon } from '@netlify/neon'

// In handler:
const sql = neon()
```

### After (Each Function)
```typescript
import { getDatabaseConnection } from './db-connection'

// In handler:
const sql = await getDatabaseConnection()
```

---

## Connection String Format

The connection string is automatically enhanced:

**Original:**
```
postgresql://user:password@host/database
```

**Enhanced:**
```
postgresql://user:password@host/database?sslmode=require&connect_timeout=15
```

---

## Configuration

### Timeout Settings (in `db-connection.ts`)
- `CONNECTION_TIMEOUT`: 15 seconds
- `MAX_RETRIES`: 3 attempts
- `INITIAL_RETRY_DELAY`: 1000ms (1 second)
- `MAX_RETRY_DELAY`: 5000ms (5 seconds)

### Retryable Error Patterns
- timeout
- connection
- econnrefused
- econnreset
- etimedout
- network
- suspended
- waking
- compute
- econnaborted
- enotfound

---

## Testing

After deployment, verify:
1. ✅ First request after inactivity succeeds (allows time for wake-up)
2. ✅ Connection retries on transient failures
3. ✅ Non-retryable errors fail immediately
4. ✅ All database operations work correctly

---

## Benefits

1. **Handles Neon Suspension:** 15-second timeout allows compute to wake up
2. **Automatic Retry:** Transient failures are retried automatically
3. **Better Error Handling:** Distinguishes retryable vs non-retryable errors
4. **Consistent:** All functions use the same connection logic
5. **Configurable:** Easy to adjust timeout and retry settings

---

## Notes

- The connection string enhancement happens automatically
- No changes needed to Netlify environment variables
- Works with existing `NETLIFY_DATABASE_URL`
- Backward compatible with existing connection strings
