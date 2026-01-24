# Site Comparison Analysis: capacity-planner vs capacity-planner-2

**Date:** January 21, 2026  
**Purpose:** Compare functionality, design, and features between the two deployed sites

## Executive Summary

**The two sites are NOT mirrors of each other.** They have significant functional and design differences:

- **capacity-planner.netlify.app** (main branch): Stable demo with dark theme, no inline editing
- **capacity-planner-2.netlify.app** (development branch): Full-featured version with inline editing, commit/uncommit, and additional pages

## Current Deployment Status

### capacity-planner.netlify.app (Main Branch)
- **Branch:** `origin/main`
- **Latest Commit:** `f882e56` - "Hide navigation links: Guide, Settings, Committed Plan"
- **Status:** Deployed and stable

### capacity-planner-2.netlify.app (Development Branch)
- **Branch:** `origin/development`
- **Latest Commit:** `1dad168` - "Fix: Add missing date columns to SELECT query and prevent reload overwrites"
- **Status:** Deployed with inline editing features

## Detailed Feature Comparison

### 1. Pages & Routes

#### capacity-planner (main)
- ✅ `/` → `SessionsListPage` (scenarios list)
- ✅ `/scenarios` → `SessionsListPage`
- ✅ `/sessions/:id` → `SessionSummaryPage`
- ✅ `/sessions/:id/items` → `SessionItemsPage`
- ✅ `/sessions/:id/items/:itemId` → `ItemDetailPage`
- ✅ `/quarterly-capacity` → `QuarterlyCapacityPage`
- ❌ `/home` - Does not exist
- ❌ `/guide` - Does not exist
- ❌ `/settings` - Does not exist
- ❌ `/committed-plan` - Does not exist

#### capacity-planner-2 (development)
- ✅ `/` → `HomePage` (new homepage with onboarding)
- ✅ `/scenarios` → `SessionsListPage`
- ✅ `/sessions/:id` → `SessionSummaryPage`
- ✅ `/sessions/:id/items` → `SessionItemsPage`
- ✅ `/sessions/:id/items/:itemId` → `ItemDetailPage`
- ✅ `/quarterly-capacity` → `QuarterlyCapacityPage`
- ✅ `/committed-plan` → `CommittedPlanPage` (new)
- ✅ `/guide` → `GuidePage` (new)
- ✅ `/settings` → `SettingsPage` (new)

**Difference:** Development has 4 additional pages (HomePage, GuidePage, SettingsPage, CommittedPlanPage)

---

### 2. Navigation Header

#### capacity-planner (main)
- **Visible Links:** Only "Scenarios"
- **Hidden Links:** Guide, Settings, Committed Plan (commented out)
- **Root Link:** Points to `/scenarios`

#### capacity-planner-2 (development)
- **Visible Links:** Scenarios, Committed Plan, Guide, Settings
- **Root Link:** Points to `/` (HomePage)

**Difference:** Main has simplified navigation, development has full navigation

---

### 3. Inline Editing Features

#### capacity-planner (main)
- ❌ **No inline editing** for roadmap items
- ❌ Key column: Static text
- ❌ Name column: Static text
- ❌ Start/End dates: Not displayed in table
- ❌ UX Focus Weeks: Static number display
- ❌ Content Focus Weeks: Static number display
- ❌ Scenario names: Static text

#### capacity-planner-2 (development)
- ✅ **Full inline editing** for roadmap items
- ✅ Key column: `EditableTextCell` (click to edit, validates no spaces)
- ✅ Name column: `EditableTextCell` (click to edit)
- ✅ Start date column: `EditableDateCell` (click to edit, date picker)
- ✅ End date column: `EditableDateCell` (click to edit, date picker)
- ✅ UX Focus Weeks: `EditableNumberCell` (click to edit, numeric input)
- ✅ Content Focus Weeks: `EditableNumberCell` (click to edit, numeric input)
- ✅ Scenario names: `InlineEditableText` (click to edit on SessionsListPage and SessionSummaryPage)

**Difference:** Development has complete inline editing, main has none

---

### 4. Commit/Uncommit Functionality

#### capacity-planner (main)
- ❌ **No commit/uncommit functionality**
- ❌ Cannot mark scenarios as "committed plan"
- ❌ No committed plan page

#### capacity-planner-2 (development)
- ✅ **Full commit/uncommit functionality**
- ✅ "Commit this scenario" button on SessionSummaryPage
- ✅ "Uncommit" button for committed scenarios
- ✅ Commit/uncommit on SessionsListPage (with visual indicators)
- ✅ Commit/uncommit on HomePage
- ✅ Commit/uncommit on QuarterlyCapacityPage
- ✅ CommittedPlanPage shows all committed scenarios
- ✅ Visual indicators (cyan border, checkmark) for committed scenarios

**Difference:** Development has full commit workflow, main has none

---

### 5. Paste Table Import

#### capacity-planner (main)
- ❌ **No paste import feature**

#### capacity-planner-2 (development)
- ✅ **Paste Table Import Modal**
- ✅ Import multiple roadmap items from spreadsheet
- ✅ Supports 4-column format (legacy)
- ✅ Supports 5-column format (UX/Content separate)
- ✅ Parses dates (Start/End)
- ✅ Validates and creates items with proper field mapping

**Difference:** Development has paste import, main does not

---

### 6. Design System & Theme

#### capacity-planner (main)
- ✅ **Dark theme** fully implemented
- ✅ Color palette: `#0a0a0f`, `#141419`, `#1a1a20`, `#00d9ff`
- ✅ Dark backgrounds on all pages
- ✅ Dark table headers and cells
- ✅ Color-coded capacity cards (green/red borders)
- ✅ Cyan accent colors for links and buttons

#### capacity-planner-2 (development)
- ✅ **Dark theme** fully implemented
- ✅ Same color palette as main
- ✅ Same styling approach
- ✅ Additional pages also use dark theme

**Difference:** Both have identical dark theme design system

---

### 7. Database Integration

#### capacity-planner (main)
- ✅ Netlify Functions for database operations
- ✅ Database schema support
- ⚠️ May not have latest migrations (date columns)

#### capacity-planner-2 (development)
- ✅ Netlify Functions for database operations
- ✅ Database schema support
- ✅ **Date columns migration** (`start_date`, `end_date`)
- ✅ **Persistence fixes** for inline editing
- ✅ Field name normalization (camelCase/snake_case)
- ✅ Activity log integration

**Difference:** Development has more complete database integration with date persistence

---

### 8. Error Handling & Resilience

#### capacity-planner (main)
- ✅ ErrorBoundary component
- ✅ Basic error handling

#### capacity-planner-2 (development)
- ✅ ErrorBoundary component
- ✅ Enhanced error handling
- ✅ Type safety for numeric calculations
- ✅ Safe formatting utilities (`safeFormat.ts`)
- ✅ Database health indicator
- ✅ Better error messages and recovery

**Difference:** Development has more robust error handling

---

### 9. Context & State Management

#### capacity-planner (main)
- ✅ PlanningSessionsContext
- ✅ RoadmapItemsContext
- ✅ ItemInputsContext
- ❌ ActivityContext (may not exist)
- ❌ SettingsContext (may not exist)

#### capacity-planner-2 (development)
- ✅ PlanningSessionsContext (enhanced with commit/uncommit)
- ✅ RoadmapItemsContext (enhanced with inline editing persistence)
- ✅ ItemInputsContext
- ✅ **ActivityContext** (activity log tracking)
- ✅ **SettingsContext** (global settings management)

**Difference:** Development has additional contexts for activity logging and settings

---

### 10. Table Structure (SessionSummaryPage)

#### capacity-planner (main)
**Columns:**
1. Key (static)
2. Name (static)
3. Priority
4. Status
5. UX Size
6. UX Focus Weeks (static)
7. UX Sprints
8. Content Size
9. Content Focus Weeks (static)
10. Content Sprints
11. Actions

#### capacity-planner-2 (development)
**Columns:**
1. Key (editable)
2. Name (editable)
3. **Start** (editable date)
4. **End** (editable date)
5. Priority
6. Status
7. UX Size
8. UX Focus Weeks (editable)
9. UX Sprints
10. Content Size
11. Content Focus Weeks (editable)
12. Content Sprints
13. Actions

**Difference:** Development has 2 additional columns (Start/End dates) and 5 editable columns

---

### 11. Scenario List Features

#### capacity-planner (main)
- ✅ Display scenarios
- ✅ Create new scenario
- ✅ Navigate to scenario
- ❌ Cannot edit scenario names inline
- ❌ Cannot delete scenarios
- ❌ Cannot commit/uncommit

#### capacity-planner-2 (development)
- ✅ Display scenarios
- ✅ Create new scenario
- ✅ Navigate to scenario
- ✅ **Edit scenario names inline** (`InlineEditableText`)
- ✅ **Delete scenarios** (if no items)
- ✅ **Commit/uncommit scenarios** (with visual indicators)
- ✅ **Highlight committed scenarios** (green background)
- ✅ **Tooltips and help text**

**Difference:** Development has significantly more interactive features

---

### 12. Homepage Experience

#### capacity-planner (main)
- ❌ **No dedicated homepage**
- ✅ Root path (`/`) goes directly to SessionsListPage

#### capacity-planner-2 (development)
- ✅ **Dedicated HomePage** (`/`)
- ✅ First-time user onboarding
- ✅ Quick actions
- ✅ Recent scenarios
- ✅ Commit/uncommit from homepage
- ✅ Better empty state

**Difference:** Development has a full homepage experience, main goes straight to scenarios

---

## Summary of Key Differences

### Major Functional Differences

1. **Inline Editing:** Development has it, main does not
2. **Commit/Uncommit:** Development has it, main does not
3. **Additional Pages:** Development has 4 extra pages (Home, Guide, Settings, Committed Plan)
4. **Paste Import:** Development has it, main does not
5. **Date Columns:** Development has Start/End date columns in table, main does not
6. **Scenario Management:** Development has delete and inline rename, main does not

### Design Differences

1. **Navigation:** Main has simplified (only Scenarios), development has full navigation
2. **Root Path:** Main goes to `/scenarios`, development goes to `/` (HomePage)
3. **Theme:** Both have identical dark theme

### Database & Backend Differences

1. **Migrations:** Development has date columns migration
2. **Persistence:** Development has fixes for inline editing persistence
3. **Contexts:** Development has ActivityContext and SettingsContext

## Recommendation

**The sites are NOT mirrors.** To make them mirrors, you have two options:

### Option 1: Make Main Match Development (Recommended)
- Complete the merge we started (commit the resolved conflicts)
- Push to main
- Both sites will have identical functionality
- Then separate databases

### Option 2: Keep Main as Stable Demo
- Revert main to pre-merge state
- Keep development as testing site
- Accept that they will have different features
- Separate databases to prevent data conflicts

## Next Steps

1. **Decide on strategy:** Do you want both sites to be identical, or keep main as a simplified stable demo?
2. **Complete merge:** If making them identical, commit the resolved merge conflicts
3. **Separate databases:** Set up different `NETLIFY_DATABASE_URL` for each site
4. **Test thoroughly:** Verify all features work on both sites after changes
