# Critical Bug Fix: Missing Date Columns in SELECT Statement

## The Problem

**Root Cause**: The `get-roadmap-items.ts` function was NOT selecting `start_date` and `end_date` columns from the database.

### Impact

1. ✅ Dates were being **saved** to the database correctly (UPDATE statement included them)
2. ❌ Dates were **never loaded** back (SELECT statement didn't include them)
3. Result: Dates appeared to not persist, but they were actually in the database!

### Why This Happened

When you:
1. Edit a date → API saves it to database ✅
2. Navigate away → `loadItemsForSession` is called
3. `loadItemsForSession` fetches items from API
4. API SELECT statement didn't include `start_date` and `end_date`
5. Dates are missing from response
6. State is updated with items that don't have dates
7. Dates appear to be lost ❌

## The Fix

**File**: `netlify/functions/get-roadmap-items.ts`

**Before**:
```sql
SELECT 
  id,
  scenario_id,
  ...
  ux_focus_weeks,
  content_focus_weeks,
  ...
  created_at,
  updated_at
FROM roadmap_items
```

**After**:
```sql
SELECT 
  id,
  scenario_id,
  ...
  ux_focus_weeks,
  content_focus_weeks,
  ...
  start_date,    -- ✅ ADDED
  end_date,      -- ✅ ADDED
  created_at,
  updated_at
FROM roadmap_items
```

## Verification

After this fix:
1. Edit Start/End dates → Saved to database ✅
2. Navigate away → `loadItemsForSession` called
3. API SELECT includes `start_date` and `end_date` ✅
4. Dates are in the response ✅
5. State is updated with dates ✅
6. Dates persist correctly ✅

## Additional Fixes

### 1. Prevented Reload Overwriting Updates

**File**: `src/pages/SessionSummaryPage.tsx`

Changed from:
```typescript
useEffect(() => {
  if (id) {
    loadItemsForSession(id)  // Always reloads on navigation
  }
}, [id, loadItemsForSession, location.key])  // location.key changes on navigation
```

To:
```typescript
useEffect(() => {
  if (id) {
    const currentItems = getItemsForSession(id)
    // Only reload if empty - prevents overwriting optimistic updates
    if (currentItems.length === 0) {
      loadItemsForSession(id)
    }
  }
}, [id, loadItemsForSession, getItemsForSession])  // Removed location.key
```

### 2. Enhanced Debug Logging

Added comprehensive logging throughout the update flow to help diagnose issues:
- Handler calls
- API requests/responses
- State updates
- Database operations

## Testing

After deploying:

1. **Edit UX Focus Weeks**: 3.0 → 5.5
   - Navigate away and back
   - Should still show 5.5 ✅

2. **Edit Content Focus Weeks**: 3.0 → 7.0
   - Navigate away and back
   - Should still show 7.0 ✅

3. **Edit Start Date**: Set to 2026-02-15
   - Navigate away and back
   - Should still show 2026-02-15 ✅

4. **Edit End Date**: Set to 2026-03-20
   - Navigate away and back
   - Should still show 2026-03-20 ✅

5. **Refresh Page**: All values should persist ✅

## Files Modified

1. ✅ `netlify/functions/get-roadmap-items.ts` - Added date columns to SELECT
2. ✅ `src/pages/SessionSummaryPage.tsx` - Fixed reload logic
3. ✅ `src/context/RoadmapItemsContext.tsx` - Enhanced logging
4. ✅ `netlify/functions/update-roadmap-item.ts` - Added logging

## Database Migration Required

**Before testing**, ensure the database has the date columns:

```sql
ALTER TABLE roadmap_items 
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;
```

Run in Neon Dashboard SQL Editor.
