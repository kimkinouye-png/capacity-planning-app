# Data Persistence Issue Summary

## Problem Statement

Inline edits to roadmap items in the grid (name, key, dates, UX/Content focus weeks) are not persisting to the database. Changes appear in the UI immediately but disappear after page refresh.

## Recent Changes Made

### 1. Inline Editing Implementation (January 2026)
- **EditableNumberCell**: Component for inline editing of numeric fields (UX/Content focus weeks)
- **EditableTextCell**: Component for inline editing of text fields (Name, Key)
- **EditableDateCell**: Component for inline editing of date fields (Start, End dates)
- All components follow same interaction model: click to edit, blur/Enter to commit, Escape to cancel
- Comprehensive test coverage (37 tests total)

### 2. Paste Import Enhancements
- Extended paste format to support 5-column format with separate UX and Content effort
- Added date parsing and display for Start/End dates
- Dates stored in `startDate` and `endDate` fields on `RoadmapItem` TypeScript interface

### 3. Field Preservation Fix
- Fixed `updateItem` in `RoadmapItemsContext.tsx` to preserve existing fields when updating
- Problem: API response might not include all fields, causing data loss
- Solution: Merge current item from state + API response + updates (preserves all fields)

## Current Issue: Data Not Persisting

### Symptoms
- Changes appear in UI immediately (local state update works)
- Changes disappear after page refresh
- No visible errors in console or network tab
- Falls back to localStorage silently if API fails

### Potential Root Causes

#### 1. Database Schema Mismatch
**Issue**: `startDate` and `endDate` fields added to TypeScript `RoadmapItem` interface, but database schema may not have corresponding columns.

**Evidence**:
- `src/domain/types.ts` defines `RoadmapItem` with `startDate?: string | null` and `endDate?: string | null`
- `database/schema.sql` shows `roadmap_items` table does NOT have `start_date` or `end_date` columns
- Schema only has: `id`, `scenario_id`, `key`, `name`, `initiative`, `priority`, `status`, JSONB fields, scores, sizes, focus/work weeks, timestamps

**Impact**: Updates including `startDate`/`endDate` may fail silently or be ignored by database.

#### 2. API Function Not Handling Date Fields
**Issue**: `update-roadmap-item.ts` Netlify function may not be mapping `startDate`/`endDate` to database columns.

**Evidence**:
- `netlify/functions/update-roadmap-item.ts` UPDATE statement (lines 119-140) does NOT include `start_date` or `end_date` columns
- Function only updates: `key`, `name`, `initiative`, `priority`, `status`, JSONB fields, scores, sizes, focus/work weeks
- Date fields are not in the UPDATE statement

**Impact**: Even if database schema had date columns, they wouldn't be updated.

#### 3. Field Mapping Function Missing Date Fields
**Issue**: `roadmapItemToDbFormat` function in `netlify/functions/types.ts` may not include date fields in transformation.

**Investigation Needed**: Check if this function maps `startDate` → `start_date` and `endDate` → `end_date`.

#### 4. Silent API Failures
**Issue**: API calls might be failing but falling back to localStorage without visible errors.

**Evidence**:
- `updateItem` in `RoadmapItemsContext.tsx` has try/catch that falls back to localStorage
- Error message: "Failed to update roadmap item in database. Changes saved locally."
- But user may not see this error if toast notifications aren't working

**Impact**: Changes saved to localStorage but not database, so they disappear on refresh.

## Root Cause Identified ✅

**Confirmed Issue**: `startDate` and `endDate` fields were added to the frontend TypeScript interface but were **never integrated into the database layer**.

### Evidence:

1. **Database Schema** (`database/schema.sql`):
   - ❌ `roadmap_items` table does NOT have `start_date` or `end_date` columns
   - Only has: `id`, `scenario_id`, `key`, `name`, `initiative`, `priority`, `status`, JSONB fields, scores, sizes, focus/work weeks, timestamps

2. **Database Interface** (`netlify/functions/types.ts`):
   - ❌ `DatabaseRoadmapItem` interface (lines 119-140) does NOT include `start_date` or `end_date` fields

3. **Field Mapping Functions** (`netlify/functions/types.ts`):
   - ❌ `roadmapItemToDbFormat` (lines 247-264) does NOT map `startDate` → `start_date` or `endDate` → `end_date`
   - ❌ `dbRoadmapItemToRoadmapItemResponse` (lines 204-242) does NOT map `start_date` → `startDate` or `end_date` → `endDate`

4. **API Update Function** (`netlify/functions/update-roadmap-item.ts`):
   - ❌ UPDATE statement (lines 119-140) does NOT include `start_date` or `end_date` columns
   - Only updates: `key`, `name`, `initiative`, `priority`, `status`, JSONB fields, scores, sizes, focus/work weeks

### Impact:
- Frontend sends `startDate` and `endDate` in update requests
- API function ignores these fields (not in UPDATE statement)
- Database doesn't have columns to store them
- Field mapping functions don't transform them
- Result: Date values are lost on every update

### Additional Issue:
The same problem likely affects **all fields** being updated, not just dates. If the API function's UPDATE statement doesn't include a field, it won't be persisted, even if it's in the request body.

## Investigation Steps Needed

1. **Verify All Fields Are Handled**:
   - Check if `name`, `short_key`, `uxFocusWeeks`, `contentFocusWeeks` are in the UPDATE statement
   - Verify all fields being edited are properly mapped and persisted

2. **Check Network Calls**:
   - Open browser DevTools → Network tab
   - Make an inline edit
   - Check if PUT request to `/update-roadmap-item` is made
   - Check request payload includes all fields
   - Check response status and body
   - Look for any errors

3. **Check Error Handling**:
   - Verify toast notifications are working
   - Check if errors are being logged to console
   - Verify localStorage fallback is actually saving data

## Proposed Solutions

### Solution 1: Add Date Columns to Database Schema
**File**: `database/schema.sql`

```sql
ALTER TABLE roadmap_items 
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE;
```

**Or create a migration file**:
```sql
-- Migration: Add start_date and end_date to roadmap_items
-- Date: 2026-01-XX

ALTER TABLE roadmap_items 
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;
```

### Solution 2: Update Database Interface
**File**: `netlify/functions/types.ts`

Add to `DatabaseRoadmapItem` interface (after line 137):
```typescript
start_date: string | null  // DATE in Postgres, ISO string in TypeScript
end_date: string | null    // DATE in Postgres, ISO string in TypeScript
```

### Solution 3: Update Field Mapping Functions
**File**: `netlify/functions/types.ts`

**In `roadmapItemToDbFormat`** (after line 261):
```typescript
if (item.startDate !== undefined) db.start_date = item.startDate || null
if (item.endDate !== undefined) db.end_date = item.endDate || null
```

**In `dbRoadmapItemToRoadmapItemResponse`** (after line 240):
```typescript
startDate: db.start_date || null,
endDate: db.end_date || null,
```

**In `UpdateRoadmapItemRequest` interface** (after line 177):
```typescript
startDate?: string | null
endDate?: string | null
```

### Solution 4: Update API Function to Handle Dates
**File**: `netlify/functions/update-roadmap-item.ts`

**Add to UPDATE statement** (after line 137):
```typescript
start_date = ${finalUpdates.start_date ?? currentItem.start_date},
end_date = ${finalUpdates.end_date ?? currentItem.end_date},
```

**Add to validation** (after line 68):
```typescript
// Validate date fields if provided
if (body.startDate !== undefined && body.startDate !== null) {
  const startDate = new Date(body.startDate)
  if (isNaN(startDate.getTime())) {
    return errorResponse(400, 'Invalid startDate: must be a valid date string')
  }
}

if (body.endDate !== undefined && body.endDate !== null) {
  const endDate = new Date(body.endDate)
  if (isNaN(endDate.getTime())) {
    return errorResponse(400, 'Invalid endDate: must be a valid date string')
  }
}
```

### Solution 5: Verify All Other Fields Are Handled
**Check**: Ensure `name`, `short_key` (mapped to `key`), `uxFocusWeeks`, `contentFocusWeeks` are all in the UPDATE statement and being persisted correctly.

### Solution 6: Improve Error Visibility
- Ensure toast notifications are displayed for API failures
- Add console.error logging for all API failures
- Consider showing a persistent error banner if localStorage fallback is used
- Add validation to ensure required fields are present before API call

## Files to Review

1. `database/schema.sql` - Check if date columns exist
2. `netlify/functions/update-roadmap-item.ts` - Check if dates are handled
3. `netlify/functions/types.ts` - Check field mapping functions
4. `src/context/RoadmapItemsContext.tsx` - Check error handling and fallback
5. `src/pages/SessionSummaryPage.tsx` - Check how updates are called

## Next Steps

1. Run database migration to add `start_date` and `end_date` columns if missing
2. Update `update-roadmap-item.ts` to handle date fields
3. Update field mapping functions to include dates
4. Test inline editing and verify data persists after refresh
5. Add better error handling and visibility for API failures
