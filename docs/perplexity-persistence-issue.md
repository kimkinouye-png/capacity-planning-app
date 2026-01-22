# Data Persistence Issue - Summary for Perplexity

## Problem
Inline edits to roadmap items (name, key, dates, UX/Content focus weeks) in a React + TypeScript + Vite app are not persisting to the database. Changes appear in the UI but disappear after page refresh.

## Tech Stack
- **Frontend**: Vite + React + TypeScript
- **Backend**: Netlify Functions (TypeScript)
- **Database**: Neon Postgres (via Netlify DB)
- **State Management**: React Context API with localStorage fallback

## Root Cause Identified

### The Issue
`startDate` and `endDate` fields were added to the frontend `RoadmapItem` TypeScript interface, but were **never integrated into the database layer**:

1. **Database Schema Missing**: `roadmap_items` table doesn't have `start_date` or `end_date` columns
2. **Database Interface Missing**: `DatabaseRoadmapItem` TypeScript interface doesn't include these fields
3. **Field Mapping Missing**: `roadmapItemToDbFormat` doesn't map `startDate` → `start_date`
4. **API Function Missing**: `update-roadmap-item.ts` UPDATE statement doesn't include date columns

### Impact
- Frontend sends `startDate`/`endDate` in update requests
- API function ignores them (not in UPDATE statement)
- Database has no columns to store them
- Result: Date values are lost on every update

### Additional Concern
Other fields (name, key, uxFocusWeeks, contentFocusWeeks) may have the same issue if they're not properly included in the UPDATE statement.

## Recent Changes Made

### 1. Inline Editing Components (January 2026)
- Created `EditableNumberCell`, `EditableTextCell`, `EditableDateCell` components
- Integrated into Roadmap Items grid for inline editing
- All components follow same pattern: click to edit, blur/Enter to commit, Escape to cancel
- 37 comprehensive tests passing

### 2. Paste Import Enhancements
- Extended to support 5-column format with separate UX/Content effort
- Added date parsing and display for Start/End dates
- Dates stored in `startDate` and `endDate` on frontend `RoadmapItem` interface

### 3. Field Preservation Fix
- Fixed `updateItem` in `RoadmapItemsContext.tsx` to preserve existing fields when updating
- Problem: API response might not include all fields, causing data loss
- Solution: Merge current item from state + API response + updates

## Files Involved

### Frontend
- `src/domain/types.ts` - `RoadmapItem` interface (has `startDate?` and `endDate?`)
- `src/context/RoadmapItemsContext.tsx` - `updateItem` function
- `src/pages/SessionSummaryPage.tsx` - Inline editing handlers
- `src/components/EditableDateCell.tsx` - Date editing component

### Backend
- `database/schema.sql` - Database schema (missing date columns)
- `netlify/functions/types.ts` - Type definitions and field mapping (missing date fields)
- `netlify/functions/update-roadmap-item.ts` - API update function (not handling dates)

## Required Fixes

1. **Database Migration**: Add `start_date` and `end_date` DATE columns to `roadmap_items` table
2. **Update Database Interface**: Add date fields to `DatabaseRoadmapItem` interface
3. **Update Field Mapping**: Map `startDate`/`endDate` in `roadmapItemToDbFormat` and `dbRoadmapItemToRoadmapItemResponse`
4. **Update API Function**: Add date columns to UPDATE statement in `update-roadmap-item.ts`
5. **Verify Other Fields**: Ensure all editable fields (name, key, focus weeks) are properly persisted

## Questions for Perplexity

1. What's the best practice for handling DATE columns in Postgres with TypeScript/JavaScript? Should we use DATE type or TIMESTAMPTZ?

2. Should we create a migration file or just update the schema.sql? What's the recommended approach for Netlify DB/Neon?

3. Are there any gotchas when adding new columns to an existing table with data? Do we need to handle null values differently?

4. How should we handle the case where some items have dates and others don't? Should we allow NULL or use a default value?

5. Is there a way to verify that all fields being sent from the frontend are actually being persisted? Any debugging strategies?

6. Should we add validation on the API side to ensure required fields are present, or is frontend validation sufficient?

## Next Steps

1. Create database migration to add date columns
2. Update TypeScript interfaces and field mapping functions
3. Update API function to handle dates
4. Test inline editing and verify persistence
5. Add better error handling and visibility for API failures
