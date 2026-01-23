# Write Operations Timeout Fix

**Date:** January 21, 2026  
**Issue:** Database write operations (INSERT, UPDATE, DELETE) timing out after 15 seconds when Neon compute is waking up  
**Solution:** Separate write-specific connection configuration with higher timeout, more retries, and wakeup queries

---

## Problem

Users on `capacity-planner-2` could not create new scenarios - operations were timing out after 15 seconds.

**Root Cause:**
- Database **READ** operations work fine with 15-second timeout
- Database **WRITE** operations (INSERT, UPDATE, DELETE) take longer when Neon compute is waking up
- Write operations need more time to complete than read operations
- Same timeout/retry settings for both read and write operations was insufficient

---

## Solution

### 1. Separate Connection Configurations

Created two distinct connection functions with different configurations:

#### READ Operations (`getDatabaseConnection()`)
- **Timeout:** 15 seconds
- **Retries:** 3 attempts
- **Delays:** 1s → 2s → 4s (exponential backoff, max 5s)
- **Wakeup Query:** No (not needed for reads)

#### WRITE Operations (`getDatabaseConnectionForWrites()`)
- **Timeout:** 30 seconds (2x read timeout)
- **Retries:** 5 attempts (vs 3 for reads)
- **Delays:** 2s → 4s → 8s → 16s → 16s (exponential backoff, max 16s)
- **Wakeup Query:** Yes - sends `SELECT 1` before write to ensure compute is ready

### 2. Wakeup Query for Writes

Before executing write operations, the connection utility:
1. Establishes connection
2. Sends a simple `SELECT 1` query to "wake up" the Neon compute
3. Only proceeds with the actual write if wakeup succeeds
4. Retries the entire connection if wakeup fails

This ensures the compute is fully ready before attempting write operations.

---

## Files Modified

### Core Connection Utility
- `netlify/functions/db-connection.ts`
  - Added `getDatabaseConnectionForWrites()` function
  - Added separate timeout/retry constants for reads vs writes
  - Added wakeup query logic for write operations
  - Refactored internal connection logic to support both configurations

### Write Operations Updated (8 functions)
All write operations now use `getDatabaseConnectionForWrites()`:

1. ✅ `create-scenario.ts` - INSERT
2. ✅ `create-roadmap-item.ts` - INSERT
3. ✅ `update-scenario.ts` - UPDATE
4. ✅ `update-roadmap-item.ts` - UPDATE
5. ✅ `update-settings.ts` - UPDATE
6. ✅ `delete-scenario.ts` - DELETE
7. ✅ `delete-roadmap-item.ts` - DELETE
8. ✅ `create-activity-log-entry.ts` - INSERT

### Read Operations (unchanged)
Read operations continue using `getDatabaseConnection()`:
- `get-scenarios.ts`
- `get-roadmap-items.ts`
- `get-settings.ts`
- `get-activity-log.ts`
- `db-health.ts`

---

## Configuration Details

### Write Operation Settings

```typescript
// Timeout: 30 seconds (allows time for compute wake-up + write execution)
CONNECTION_TIMEOUT_WRITE = 30

// Retries: 5 attempts (more than reads)
MAX_RETRIES_WRITE = 5

// Delays: Longer initial delay and higher max
INITIAL_RETRY_DELAY_WRITE = 2000  // 2 seconds
MAX_RETRY_DELAY_WRITE = 16000      // 16 seconds

// Retry sequence: 2s → 4s → 8s → 16s → 16s
```

### Read Operation Settings (unchanged)

```typescript
// Timeout: 15 seconds
CONNECTION_TIMEOUT_READ = 15

// Retries: 3 attempts
MAX_RETRIES_READ = 3

// Delays: Shorter delays
INITIAL_RETRY_DELAY_READ = 1000  // 1 second
MAX_RETRY_DELAY_READ = 5000       // 5 seconds

// Retry sequence: 1s → 2s → 4s
```

---

## Changes Made

### Before (All Operations)
```typescript
import { getDatabaseConnection } from './db-connection'

const sql = await getDatabaseConnection()
// Timeout: 15s, Retries: 3, Delays: 1s→2s→4s
```

### After (Write Operations)
```typescript
import { getDatabaseConnectionForWrites } from './db-connection'

const sql = await getDatabaseConnectionForWrites()
// Timeout: 30s, Retries: 5, Delays: 2s→4s→8s→16s→16s
// + Wakeup query before write
```

### After (Read Operations - unchanged)
```typescript
import { getDatabaseConnection } from './db-connection'

const sql = await getDatabaseConnection()
// Timeout: 15s, Retries: 3, Delays: 1s→2s→4s
```

---

## Wakeup Query Flow

For write operations, the connection process is:

1. **Attempt Connection**
   - Create connection with 30s timeout
   - Enhance connection string with `connect_timeout=30`

2. **Wakeup Query** (NEW)
   - Execute `SELECT 1` to wake up compute
   - If wakeup succeeds → proceed to write
   - If wakeup fails → retry connection

3. **Execute Write**
   - Proceed with INSERT/UPDATE/DELETE
   - Compute is already awake, so write should succeed

4. **Retry Logic**
   - If connection or wakeup fails, retry with exponential backoff
   - Up to 5 attempts with delays: 2s → 4s → 8s → 16s → 16s

---

## Benefits

1. **Handles Write Timeouts:** 30-second timeout allows time for compute wake-up + write execution
2. **More Retries:** 5 attempts vs 3 for reads gives more chances to succeed
3. **Longer Delays:** 2s initial delay and 16s max delay allow more time between retries
4. **Wakeup Query:** Ensures compute is ready before attempting write
5. **Optimized Reads:** Read operations keep fast 15s timeout (no unnecessary delays)
6. **Better Logging:** Operation type (READ/WRITE) logged for debugging

---

## Testing

After deployment, verify:

1. ✅ **Create Scenario** - Should succeed even after inactivity
2. ✅ **Update Scenario** - Should succeed with 30s timeout
3. ✅ **Create Roadmap Item** - Should succeed with wakeup query
4. ✅ **Update Roadmap Item** - Should succeed with longer timeout
5. ✅ **Delete Operations** - Should succeed with write configuration
6. ✅ **Read Operations** - Should still be fast (15s timeout)

---

## Expected Behavior

### Scenario: User creates scenario after 5 minutes of inactivity

**Before Fix:**
- Connection attempt: 15s timeout
- Write operation starts but compute not fully awake
- Operation times out after 15s
- ❌ User sees timeout error

**After Fix:**
- Connection attempt: 30s timeout
- Wakeup query: `SELECT 1` wakes compute (may take 5-10s)
- Write operation: Compute is ready, INSERT succeeds (2-3s)
- ✅ User sees success response
- Total time: ~10-15s (within 30s timeout)

---

## Notes

- The wakeup query adds minimal overhead (~100ms when compute is awake)
- When compute is suspended, wakeup query takes 5-10s, but ensures write succeeds
- Read operations remain fast (no wakeup query needed)
- All write operations benefit from the same configuration
- Connection string enhancement happens automatically (no env var changes needed)

---

## Monitoring

Watch Netlify function logs for:
- `🟢 [WRITE] Database wakeup successful` - Wakeup succeeded
- `✅ [WRITE] Database connection established` - Connection ready
- `⏳ [WRITE] Database connection attempt X/5 failed` - Retry in progress
- `❌ [WRITE] Database connection failed after X attempts` - All retries exhausted
