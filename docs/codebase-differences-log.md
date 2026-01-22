# Codebase Differences Tracking Log

**Purpose:** Track and document differences between `main` and `development` branches to maintain awareness of feature divergence and ensure both sites remain aligned.

**Last Updated:** January 21, 2026

---

## Quick Reference

| Category | Main Branch | Development Branch | Status |
|----------|-------------|-------------------|--------|
| **Inline Editing** | ❌ None | ✅ Full | ✅ Merged |
| **Commit/Uncommit** | ❌ None | ✅ Full | ✅ Merged |
| **Additional Pages** | ❌ Missing 4 pages | ✅ All pages | ✅ Merged |
| **Paste Import** | ❌ None | ✅ Full | ✅ Merged |
| **Date Columns** | ❌ None | ✅ Start/End | ✅ Merged |
| **Navigation** | ✅ Simplified | ✅ Full | ⚠️ Different (by design) |
| **Database Migrations** | ⚠️ May be missing | ✅ Complete | ✅ Merged |
| **Error Handling** | ✅ Basic | ✅ Enhanced | ✅ Merged |

---

## Historical Differences (Pre-Merge)

### 1. Inline Editing Components

#### Before Merge (January 21, 2026)

**Main Branch:**
- ❌ No inline editing components
- ❌ `EditableTextCell.tsx` - Does not exist
- ❌ `EditableNumberCell.tsx` - Does not exist
- ❌ `EditableDateCell.tsx` - Does not exist
- ❌ `InlineEditableText.tsx` - Does not exist

**Development Branch:**
- ✅ `src/components/EditableTextCell.tsx` - Text editing with validation
- ✅ `src/components/EditableNumberCell.tsx` - Numeric editing with precision
- ✅ `src/components/EditableDateCell.tsx` - Date editing with picker
- ✅ `src/components/InlineEditableText.tsx` - Inline scenario name editing

**Status:** ✅ **MERGED** - All components now in main

---

### 2. Pages & Routes

#### Before Merge (January 21, 2026)

**Main Branch (`src/App.tsx`):**
```typescript
// Routes available:
- / → SessionsListPage
- /scenarios → SessionsListPage
- /sessions/:id → SessionSummaryPage
- /sessions/:id/items → SessionItemsPage
- /sessions/:id/items/:itemId → ItemDetailPage
- /quarterly-capacity → QuarterlyCapacityPage

// Missing:
- / → HomePage ❌
- /committed-plan → CommittedPlanPage ❌
- /guide → GuidePage ❌
- /settings → SettingsPage ❌
```

**Development Branch (`src/App.tsx`):**
```typescript
// Routes available:
- / → HomePage ✅
- /scenarios → SessionsListPage ✅
- /committed-plan → CommittedPlanPage ✅
- /guide → GuidePage ✅
- /settings → SettingsPage ✅
- /sessions/:id → SessionSummaryPage ✅
- /sessions/:id/items → SessionItemsPage ✅
- /sessions/:id/items/:itemId → ItemDetailPage ✅
- /quarterly-capacity → QuarterlyCapacityPage ✅
```

**Status:** ✅ **MERGED** - All routes now in main

**Files Added:**
- `src/pages/HomePage.tsx`
- `src/pages/CommittedPlanPage.tsx`
- `src/pages/GuidePage.tsx`
- `src/pages/SettingsPage.tsx`

---

### 3. Navigation Header

#### Before Merge (January 21, 2026)

**Main Branch (`src/components/AppHeader.tsx`):**
```typescript
const navItems = [
  { path: '/scenarios', label: 'Scenarios' },
  // Hidden: Committed Plan, Guide, Settings
  // { path: '/committed-plan', label: 'Committed Plan' },
  // { path: '/guide', label: 'Guide' },
  // { path: '/settings', label: 'Settings' },
]
```

**Development Branch (`src/components/AppHeader.tsx`):**
```typescript
const navItems = [
  { path: '/scenarios', label: 'Scenarios' },
  { path: '/committed-plan', label: 'Committed Plan' },
  { path: '/guide', label: 'Guide' },
  { path: '/settings', label: 'Settings' },
]
```

**Status:** ⚠️ **DIFFERENT BY DESIGN** - Main keeps links hidden for simplified demo

**Decision:** Keep main's simplified navigation (links commented out) as it's intentional for demo site

---

### 4. SessionSummaryPage - Table Structure

#### Before Merge (January 21, 2026)

**Main Branch:**
```typescript
// Table columns:
1. Key (static text)
2. Name (static text)
3. Priority
4. Status
5. UX Size
6. UX Focus Weeks (static number)
7. UX Sprints
8. Content Size
9. Content Focus Weeks (static number)
10. Content Sprints
11. Actions
```

**Development Branch:**
```typescript
// Table columns:
1. Key (EditableTextCell)
2. Name (EditableTextCell)
3. Start (EditableDateCell) ← NEW
4. End (EditableDateCell) ← NEW
5. Priority
6. Status
7. UX Size
8. UX Focus Weeks (EditableNumberCell)
9. UX Sprints
10. Content Size
11. Content Focus Weeks (EditableNumberCell)
12. Content Sprints
13. Actions
```

**Status:** ✅ **MERGED** - All editable columns and date columns now in main

**Key Changes:**
- Added Start/End date columns
- Made Key, Name, UX Focus Weeks, Content Focus Weeks editable
- Added date persistence handlers

---

### 5. Commit/Uncommit Functionality

#### Before Merge (January 21, 2026)

**Main Branch:**
- ❌ No commit/uncommit functionality
- ❌ No `commitSession()` calls
- ❌ No `uncommitSession()` calls
- ❌ No committed plan page
- ❌ No visual indicators for committed scenarios

**Development Branch:**
- ✅ `commitSession()` function in PlanningSessionsContext
- ✅ `uncommitSession()` function in PlanningSessionsContext
- ✅ "Commit this scenario" button on SessionSummaryPage
- ✅ "Uncommit" button for committed scenarios
- ✅ Commit/uncommit on SessionsListPage
- ✅ Commit/uncommit on HomePage
- ✅ Commit/uncommit on QuarterlyCapacityPage
- ✅ CommittedPlanPage shows all committed scenarios
- ✅ Visual indicators (cyan border, checkmark) for committed scenarios

**Status:** ✅ **MERGED** - All commit/uncommit functionality now in main

**Files Modified:**
- `src/context/PlanningSessionsContext.tsx` - Added commit/uncommit methods
- `src/pages/SessionSummaryPage.tsx` - Added commit/uncommit buttons
- `src/pages/SessionsListPage.tsx` - Added commit/uncommit UI
- `src/pages/HomePage.tsx` - Added commit/uncommit UI
- `src/pages/QuarterlyCapacityPage.tsx` - Added commit/uncommit UI

---

### 6. Paste Table Import Feature

#### Before Merge (January 21, 2026)

**Main Branch:**
- ❌ No paste import feature
- ❌ No `PasteTableImportModal.tsx`
- ❌ No `parsePastedRoadmapItems.ts`

**Development Branch:**
- ✅ `src/features/scenarios/pasteTableImport/PasteTableImportModal.tsx`
- ✅ `src/features/scenarios/pasteTableImport/parsePastedRoadmapItems.ts`
- ✅ Supports 4-column format (legacy)
- ✅ Supports 5-column format (UX/Content separate)
- ✅ Parses dates (Start/End)
- ✅ Validates and creates items with proper field mapping

**Status:** ✅ **MERGED** - Paste import feature now in main

**Files Added:**
- `src/features/scenarios/pasteTableImport/PasteTableImportModal.tsx`
- `src/features/scenarios/pasteTableImport/parsePastedRoadmapItems.ts`
- `src/features/scenarios/pasteTableImport/__tests__/parsePastedRoadmapItems.test.ts`

---

### 7. Database Schema & Migrations

#### Before Merge (January 21, 2026)

**Main Branch:**
- ⚠️ May not have date columns migration
- ⚠️ Database schema may be missing `start_date` and `end_date` columns

**Development Branch:**
- ✅ `database/migrations/add-date-columns.sql`
- ✅ `database/schema.sql` includes date columns
- ✅ `start_date DATE` column in `roadmap_items` table
- ✅ `end_date DATE` column in `roadmap_items` table

**Status:** ✅ **MERGED** - Migration files now in main

**Files Added:**
- `database/migrations/add-date-columns.sql`
- `database/schema.sql`

**Action Required:** Run migration on production database:
```sql
ALTER TABLE roadmap_items 
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;
```

---

### 8. Context & State Management

#### Before Merge (January 21, 2026)

**Main Branch:**
- ✅ PlanningSessionsContext
- ✅ RoadmapItemsContext
- ✅ ItemInputsContext
- ❌ ActivityContext - May not exist
- ❌ SettingsContext - May not exist

**Development Branch:**
- ✅ PlanningSessionsContext (enhanced with commit/uncommit)
- ✅ RoadmapItemsContext (enhanced with inline editing persistence)
- ✅ ItemInputsContext
- ✅ ActivityContext (activity log tracking)
- ✅ SettingsContext (global settings management)

**Status:** ✅ **MERGED** - All contexts now in main

**Files Added:**
- `src/context/ActivityContext.tsx`
- `src/context/SettingsContext.tsx`

**Files Modified:**
- `src/context/PlanningSessionsContext.tsx` - Added commit/uncommit
- `src/context/RoadmapItemsContext.tsx` - Added inline editing persistence fixes

---

### 9. Error Handling & Resilience

#### Before Merge (January 21, 2026)

**Main Branch:**
- ✅ ErrorBoundary component
- ✅ Basic error handling

**Development Branch:**
- ✅ ErrorBoundary component
- ✅ Enhanced error handling
- ✅ Type safety for numeric calculations
- ✅ Safe formatting utilities (`safeFormat.ts`)
- ✅ Database health indicator
- ✅ Better error messages and recovery

**Status:** ✅ **MERGED** - Enhanced error handling now in main

**Files Added:**
- `src/utils/safeFormat.ts`
- `src/utils/formatTime.ts`
- `src/utils/useDbHealth.ts`
- `src/components/DbHealthIndicator.tsx`
- `src/components/ErrorBoundary.tsx`

---

### 10. Netlify Functions

#### Before Merge (January 21, 2026)

**Main Branch:**
- ⚠️ May have basic functions only
- ⚠️ May be missing date column support

**Development Branch:**
- ✅ Complete function set:
  - `create-activity-log-entry.ts`
  - `create-roadmap-item.ts`
  - `create-scenario.ts`
  - `delete-roadmap-item.ts`
  - `delete-scenario.ts`
  - `get-activity-log.ts`
  - `get-roadmap-items.ts` (with date columns)
  - `get-scenarios.ts`
  - `get-settings.ts`
  - `update-roadmap-item.ts` (with date support)
  - `update-scenario.ts`
  - `update-settings.ts`
  - `db-health.ts`

**Status:** ✅ **MERGED** - All functions now in main

**Key Functions:**
- `get-roadmap-items.ts` - Now includes `start_date` and `end_date` in SELECT
- `update-roadmap-item.ts` - Now handles date fields and field name normalization

---

## Post-Merge Status (January 21, 2026)

### Merge Commit
- **Commit:** `4e17b5e` - "Merge development into main: Make both sites identical"
- **Date:** January 21, 2026
- **Status:** ✅ Committed locally, pending push to origin/main

### Current State
- **Main Branch:** Contains all features from development
- **Development Branch:** Contains all features
- **Difference:** Navigation header (main keeps links hidden by design)

---

## Future Difference Tracking

### Template for New Differences

When a new difference emerges, document it using this template:

```markdown
### [Feature Name] - [Date]

**Main Branch:**
- [Description of main branch state]

**Development Branch:**
- [Description of development branch state]

**Status:** [MERGED | DIFFERENT | PENDING]

**Files Affected:**
- [List of files]

**Decision:** [Why they differ or merge plan]
```

---

## Ongoing Monitoring Checklist

Use this checklist to verify both branches remain aligned:

### Code Structure
- [ ] All pages exist in both branches
- [ ] All components exist in both branches
- [ ] All contexts exist in both branches
- [ ] All utilities exist in both branches

### Functionality
- [ ] Inline editing works on both
- [ ] Commit/uncommit works on both
- [ ] Paste import works on both
- [ ] Date columns work on both
- [ ] All routes accessible on both

### Database
- [ ] Schema matches between environments
- [ ] Migrations applied to both databases
- [ ] Field mappings consistent

### Design
- [ ] Theme matches (dark theme)
- [ ] Colors match
- [ ] Navigation structure matches (except hidden links)

---

## Known Intentional Differences

### 1. Navigation Links (By Design)
- **Main:** Links to Guide, Settings, Committed Plan are hidden (commented out)
- **Development:** All navigation links visible
- **Reason:** Main is simplified demo, development is full-featured
- **Status:** Intentional, no action needed

---

## Merge History

### January 21, 2026 - Major Merge
- **Type:** Development → Main
- **Purpose:** Make both sites identical
- **Changes:** All inline editing, commit/uncommit, additional pages, paste import
- **Status:** ✅ Committed, pending push

---

## Notes

- This log should be updated whenever differences are identified or merged
- Check this log before making changes that might diverge the branches
- When merging, update the "Historical Differences" section to reflect what was merged
- Keep "Future Difference Tracking" section for ongoing monitoring
