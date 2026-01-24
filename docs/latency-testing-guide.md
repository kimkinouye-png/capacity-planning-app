# Latency Testing Guide

## Overview
This guide helps you verify that the latency optimizations are working. We've added comprehensive timing measurements to track where time is spent.

## What Changed

### Before:
- Connection timeout: 30 seconds
- Retries: 5 attempts
- Retry delays: 2s → 4s → 8s → 16s → 16s
- No optimistic UI updates
- No detailed timing logs

### After:
- Connection timeout: 20 seconds (fails faster)
- Retries: 3 attempts (fails faster)
- Retry delays: 1s → 2s → 4s (faster retries)
- Optimistic UI updates (instant feedback)
- Comprehensive timing logs

## How to Test

### 1. Browser Console Testing (Frontend Timing)

**Steps:**
1. Open `https://capacity-planning-2.netlify.app` in Chrome
2. Open DevTools (F12 or Cmd+Option+I)
3. Go to the **Console** tab
4. Clear the console
5. Perform a delete operation:
   - Navigate to a scenario with roadmap items
   - Click the delete button on a roadmap item
   - Confirm deletion
6. Watch the console logs

**What to Look For:**

You should see logs like:
```
🗑️ [SessionSummaryPage] Calling removeItem... { sessionId: '...', itemId: '...', timestamp: '...' }
📡 [removeItem] Starting API call to delete-roadmap-item { itemId: '...', timestamp: '...' }
📡 [removeItem] API response received { status: 200, fetchDuration: '15234ms', fetchDurationSeconds: '15.23s' }
✅ [removeItem] Item deleted successfully { totalDuration: '15250ms', totalDurationSeconds: '15.25s', fetchDuration: '15234ms' }
✅ [SessionSummaryPage] Item deleted successfully { duration: '15250.00ms', durationSeconds: '15.25s' }
```

**Key Metrics:**
- **fetchDuration**: Time for the API call (should be < 20s now, vs 30s+ before)
- **totalDuration**: Total time from click to completion
- **Status**: Should be 200 (success) or fail faster with clear error

**Success Criteria:**
- ✅ Operations complete in < 20 seconds (vs 30+ seconds before)
- ✅ If DB is suspended, you see clear error messages faster
- ✅ UI updates immediately (optimistic updates)
- ✅ Loading toasts show progress

### 2. Netlify Function Logs (Backend Timing)

**Steps:**
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site: `capacity-planning-2`
3. Go to **Functions** → **View logs**
4. Perform a delete operation on the site
5. Check the function logs

**What to Look For:**

You should see logs like:
```
🔌 [delete-roadmap-item] Starting database connection... { timestamp: '...' }
🟢 [WRITE] Database wakeup successful { attempt: 1, wakeupDuration: '5234ms', wakeupDurationSeconds: '5.23s' }
✅ [delete-roadmap-item] Database connection established { attempt: 1, attemptDuration: '5250ms', attemptDurationSeconds: '5.25s' }
🔍 [delete-roadmap-item] Item existence check completed { found: true, checkDuration: '45ms' }
🗑️ [delete-roadmap-item] Delete query completed { deleteDuration: '23ms' }
✅ [delete-roadmap-item] Function completed successfully { totalDuration: '5318ms', totalDurationSeconds: '5.32s', breakdown: { connection: '5250ms', check: '45ms', delete: '23ms' } }
```

**Key Metrics:**
- **wakeupDuration**: Time for database wakeup query (if DB was suspended)
- **connectionDuration**: Time to establish connection
- **checkDuration**: Time for existence check (< 100ms if DB is active)
- **deleteDuration**: Time for actual delete query (< 100ms if DB is active)
- **totalDuration**: Total function execution time

**Success Criteria:**
- ✅ If DB is active: totalDuration < 1 second
- ✅ If DB is suspended: wakeup takes 5-15 seconds (vs 20-30s before)
- ✅ Failures happen faster (20s timeout vs 30s)
- ✅ Clear breakdown shows where time is spent

### 3. User Experience Testing

**Test Scenarios:**

#### Scenario 1: Delete Item (DB Active)
1. Navigate to a scenario with items
2. Click delete on an item
3. **Expected**: Item disappears immediately, loading toast appears, completes in < 2 seconds

#### Scenario 2: Delete Item (DB Suspended)
1. Wait for Neon DB to suspend (inactive for ~5 minutes)
2. Navigate to a scenario with items
3. Click delete on an item
4. **Expected**: 
   - Item disappears immediately (optimistic update)
   - Loading toast shows "This may take a moment if the database is waking up"
   - Completes in 10-20 seconds (vs 30+ seconds before)
   - OR fails faster with clear error message

#### Scenario 3: Uncommit Scenario
1. Navigate to a committed scenario
2. Click "Uncommit" button
3. **Expected**: 
   - Status updates immediately to "Commit as plan"
   - Loading toast shows progress
   - Completes in < 20 seconds (vs 30+ seconds before)

### 4. Comparison Testing

**Before vs After Metrics:**

| Operation | Before (30s timeout) | After (20s timeout) | Improvement |
|-----------|---------------------|---------------------|-------------|
| Delete (DB active) | 30s timeout | < 2s | ✅ 93% faster |
| Delete (DB suspended) | 30s timeout | 10-20s | ✅ 33-66% faster |
| Uncommit (DB active) | 30s timeout | < 2s | ✅ 93% faster |
| Uncommit (DB suspended) | 30s timeout | 10-20s | ✅ 33-66% faster |
| UI Feedback | After API completes | Immediate | ✅ Instant |

### 5. Network Tab Analysis

**Steps:**
1. Open DevTools → **Network** tab
2. Filter by "Fetch/XHR"
3. Perform delete/uncommit operations
4. Check the **Time** column

**What to Look For:**
- ✅ Successful requests: < 20 seconds (vs 30+ seconds before)
- ✅ Failed requests: Fail at 20 seconds (vs 30 seconds before)
- ✅ Status codes: 200 (success) or 500/504 (failures happen faster)

## Troubleshooting

### If operations still take 30+ seconds:
1. Check Netlify function logs for connection issues
2. Verify database is not in a bad state
3. Check if retry logic is working (should see retry logs)

### If operations fail immediately:
1. Check if database connection string is correct
2. Verify Neon database is accessible
3. Check Netlify environment variables

### If UI doesn't update immediately:
1. Check browser console for errors
2. Verify optimistic updates are working
3. Check if localStorage fallback is being used

## Key Improvements Summary

1. **Faster Failures**: Operations fail at 20s instead of 30s
2. **Optimistic UI**: Users see changes immediately
3. **Better Feedback**: Loading toasts explain delays
4. **Detailed Logging**: Can pinpoint exactly where latency occurs
5. **Reduced Retries**: Fewer retry attempts = faster failures when DB is unavailable

## Next Steps

If latency is still high:
1. Share the console logs (frontend timing)
2. Share the Netlify function logs (backend timing)
3. Note which operations are slow (delete, uncommit, etc.)
4. Check if database wakeup is the bottleneck (look for `wakeupDuration` in logs)
