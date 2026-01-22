# Debug and Fix Persistence Issues - Summary

## Critical Bug Found: Missing Date Columns in SELECT

**Root Cause**: The `get-roadmap-items.ts` function was NOT selecting `start_date` and `end_date` columns from the database, so even though dates were being saved, they were never loaded back!

### Fix Applied

**File**: `netlify/functions/get-roadmap-items.ts`

Added missing columns to SELECT statement:
```sql
SELECT 
  ...
  start_date,  -- ✅ ADDED
  end_date,    -- ✅ ADDED
  ...
FROM roadmap_items
```

## Additional Fixes Applied

### 1. Enhanced Debug Logging

Added comprehensive logging throughout the update flow:

**Files Modified**:
- `src/context/RoadmapItemsContext.tsx` - Added detailed logging for API requests/responses
- `src/pages/SessionSummaryPage.tsx` - Added logging to all update handlers
- `netlify/functions/update-roadmap-item.ts` - Added logging for database updates

**Logging Points**:
- 🔵 Handler called (with parameters)
- 🔵 API request sent (with payload)
- 🟢 API response received (with data)
- 🟡 State update (before/after)
- 🟣 Database update (what's being written)

### 2. Fixed Reload on Navigation

**File**: `src/pages/SessionSummaryPage.tsx`

**Problem**: `loadItemsForSession` was being called on every navigation (via `location.key` dependency), which could overwrite optimistic updates.

**Fix**: Only reload if items are empty:
```typescript
// Only reload if we don't have items for this session
// This prevents overwriting optimistic updates when navigating
if (currentItems.length === 0) {
  loadItemsForSession(id)
}
```

### 3. Enhanced State Update Logging

Added detailed logging to track:
- What's being sent to API
- What's received from API
- What's being written to database
- What's in state before/after update

## Testing Instructions

### 1. Open Browser DevTools Console

You should see detailed logs with emoji prefixes:
- 🔵 = Request/Handler call
- 🟢 = Success/Response
- 🟡 = Loading/State update
- 🟣 = State manipulation
- 🔴 = Error

### 2. Test UX Focus Weeks

1. Edit UX Focus Weeks from 3.0 to 5.5
2. Check console for:
   ```
   🔵 [handleUpdateUXFocusWeeks] Called with: { itemId, newValue: 5.5 }
   🔵 [updateItem] Sending API request: { payload: { uxFocusWeeks: 5.5 } }
   🟢 [updateItem] API response received: { uxFocusWeeks: 5.5 }
   🟣 [updateItem] Replacing item in state
   🟢 [handleUpdateUXFocusWeeks] State after update: { uxFocusWeeks: 5.5 }
   ```
3. Navigate away and back
4. Check console for:
   ```
   🟡 [loadItemsForSession] Loading items for session
   🟡 [loadItemsForSession] Received items from API: { uxFocusWeeks: 5.5 }
   ```
5. Verify value is still 5.5 ✅

### 3. Test Content Focus Weeks

Same process as UX Focus Weeks.

### 4. Test Start/End Dates

1. Edit Start date
2. Check console logs
3. Navigate away and back
4. Verify date persists ✅

### 5. Check Network Tab

In DevTools → Network tab:
1. Filter by "update-roadmap-item"
2. Click on the request
3. Check:
   - **Request Payload**: Should include `uxFocusWeeks`, `contentFocusWeeks`, `startDate`, `endDate`
   - **Response**: Should include updated values

## Expected Console Output

When editing UX Focus Weeks from 3.0 to 5.5:

```
🔵 [handleUpdateUXFocusWeeks] Called with: { itemId: "abc123", newValue: 5.5, sessionId: "xyz789" }
🔵 [handleUpdateUXFocusWeeks] Calling updateItem with: { itemId: "abc123", updates: { uxFocusWeeks: 5.5, uxWorkWeeks: 7.3 } }
🔵 [updateItem] Sending API request: { endpoint: "/.netlify/functions/update-roadmap-item", method: "PUT", payload: { id: "abc123", uxFocusWeeks: 5.5, uxWorkWeeks: 7.3 } }
🔵 [update-roadmap-item] Updating database: { ux_focus_weeks: 5.5, ... }
🟢 [update-roadmap-item] Database update result: { ux_focus_weeks: 5.5, ... }
🟢 [updateItem] API response received: { uxFocusWeeks: 5.5, ... }
🟡 [updateItem] Normalized response: { uxFocusWeeks: 5.5, ... }
🟣 [updateItem] Updating state, current itemsBySession keys: ["xyz789"]
🟣 [updateItem] Found current item: { uxFocusWeeks: 3.0 }
🟣 [updateItem] Final normalized item: { uxFocusWeeks: 5.5 }
🟣 [updateItem] Replacing item in state: { old: { uxFocusWeeks: 3.0 }, new: { uxFocusWeeks: 5.5 } }
🟣 [updateItem] State update complete
🟢 [handleUpdateUXFocusWeeks] Update successful, checking state...
🟢 [handleUpdateUXFocusWeeks] State after update: { uxFocusWeeks: 5.5, expected: 5.5 }
```

## Files Modified

1. **`netlify/functions/get-roadmap-items.ts`** - ✅ Added `start_date` and `end_date` to SELECT
2. **`src/context/RoadmapItemsContext.tsx`** - ✅ Enhanced logging, state update tracking
3. **`src/pages/SessionSummaryPage.tsx`** - ✅ Fixed reload logic, enhanced logging
4. **`netlify/functions/update-roadmap-item.ts`** - ✅ Added database update logging

## Next Steps

1. **Deploy these changes**
2. **Test with console open** to see the debug logs
3. **Verify persistence** by navigating away and back
4. **Check Network tab** to verify API calls
5. **Remove debug logs** once confirmed working (or keep for production debugging)

## If Issues Persist

Check console logs for:
- 🔴 Errors (API failures, state update failures)
- Missing log entries (indicates code path not being executed)
- Mismatched values (API response vs state)

Common issues:
- Database migration not run (dates won't persist)
- API returning old values (database not updated)
- State not updating (React state issue)
- Reload overwriting updates (navigation issue - should be fixed)
