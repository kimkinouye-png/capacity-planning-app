# Changelog

All notable changes to the Capacity Planning App will be documented in this file.

## [Unreleased]

### Recent Updates (January 2026)

#### Inline Editing for Roadmap Items Grid
- **Added EditableNumberCell Component**: Reusable component for inline editing of numeric fields (UX/Content focus weeks)
  - Click to edit, blur/Enter to commit, Escape to cancel
  - Validates input and reverts invalid values without calling callbacks
  - Comprehensive test coverage (16 tests)
- **Added EditableTextCell Component**: Reusable component for inline editing of text fields (Name, Key)
  - Same interaction model as EditableNumberCell
  - Supports `maxLength` and custom `validate` function
  - Key column validates: non-empty, no spaces
  - Comprehensive test coverage (11 tests)
- **Added EditableDateCell Component**: Reusable component for inline editing of date fields (Start, End dates)
  - Uses HTML5 date input (`type="date"`)
  - Formats dates as YYYY-MM-DD
  - Handles ISO timestamp strings and invalid dates gracefully
  - Allows clearing dates (empty input → null)
  - Comprehensive test coverage (10 tests)
- **Integrated Inline Editing**: Roadmap Items grid now supports inline editing for:
  - Key (text, with validation)
  - Name (text)
  - Start date (date)
  - End date (date)
  - UX Focus Weeks (number)
  - Content Focus Weeks (number)

#### Paste Import Enhancements
- **Extended Paste Format**: Support for 5-column format with separate UX and Content effort
  - New format: `Title | Start date | End date | UX effort weeks | Content effort weeks`
  - Legacy 4-column format still supported: `Title | Start date | End date | Effort weeks`
  - Header auto-detection for both formats
  - Field-specific validation errors (e.g., "UX effort is not a number")
- **Date Parsing and Display**: Start/End dates from paste are now parsed and displayed in dedicated columns
  - Dates stored in `startDate` and `endDate` fields on `RoadmapItem`
  - Read-only date columns added to grid (now editable via EditableDateCell)

#### Field Preservation Fix
- **Fixed updateItem to Preserve Existing Fields**: Resolved issue where updating one field caused other fields to disappear
  - Problem: API response might not include all fields, causing data loss when merging
  - Solution: Merge current item from state + API response + updates (in that order)
  - Ensures fields like `startDate`, `endDate`, and other unchanged fields are preserved
  - See `docs/fix-field-preservation-on-update.md` for details

### Known Issues

#### Data Persistence Problem ⚠️ **ROOT CAUSE IDENTIFIED**
- **Issue**: Inline edits to roadmap items (name, key, dates, UX/Content focus weeks) are not persisting to the database
- **Symptoms**:
  - Changes appear in UI immediately (local state update works)
  - Changes disappear after page refresh
  - No errors visible in console or network tab
- **Root Cause Confirmed**:
  - `startDate` and `endDate` fields were added to frontend `RoadmapItem` TypeScript interface
  - **Database schema** (`roadmap_items` table) does NOT have `start_date` or `end_date` columns
  - **Database interface** (`DatabaseRoadmapItem`) does NOT include date fields
  - **Field mapping** (`roadmapItemToDbFormat`) does NOT map `startDate` → `start_date`
  - **API function** (`update-roadmap-item.ts`) UPDATE statement does NOT include date columns
  - Result: Date values (and potentially other fields) are lost on every update
- **Required Fixes**:
  1. Add `start_date` and `end_date` DATE columns to `roadmap_items` table (database migration)
  2. Update `DatabaseRoadmapItem` interface to include date fields
  3. Update `roadmapItemToDbFormat` to map `startDate`/`endDate` → `start_date`/`end_date`
  4. Update `dbRoadmapItemToRoadmapItemResponse` to map back
  5. Update `update-roadmap-item.ts` UPDATE statement to include date columns
  6. Verify all other editable fields (name, key, focus weeks) are properly persisted
- **Documentation**: See `docs/persistence-issue-summary.md` and `docs/perplexity-persistence-issue.md` for detailed analysis and proposed solutions

### Fixed
- **Blank Page on Session Summary**: Fixed issue where navigating to session summary pages resulted in blank screens
  - Added `ErrorBoundary` component to catch and display React rendering errors gracefully
  - Implemented automatic session loading when navigating directly to session URLs
  - Added auto-reload logic if session not found (handles just-created scenarios)
  - Improved loading states and error messages with retry options
- **TypeError: toFixed is not a function**: Fixed multiple instances where `.toFixed()` was called on non-numeric values
  - Added type checks before calling `.toFixed()` on capacity metrics (demand, capacity, surplus, utilization)
  - Added type checks for item properties (`uxFocusWeeks`, `contentFocusWeeks`) in table rows
  - Ensured all numeric calculations return proper numbers with `Number()` coercion
  - Added null/undefined checks for `capacityMetrics` before rendering
  - Graceful fallbacks: displays "—" or "0.0" instead of crashing when data is invalid
- **Field Loss on Update**: Fixed issue where updating one field (e.g., name) caused other fields (e.g., dates) to disappear
  - Modified `updateItem` in `RoadmapItemsContext` to preserve current item from state before merging with API response
  - Ensures all existing fields are preserved when API response is partial

### Added
- **ErrorBoundary Component**: New React error boundary that catches JavaScript errors and displays helpful error UI
  - Shows error message with "Reload Page" and "Go to Home" buttons
  - Displays error details in development mode
  - Prevents blank pages when unexpected errors occur
- **Enhanced Error Handling**: Improved error states throughout `SessionSummaryPage`
  - Loading state while sessions are being fetched
  - Error state with retry functionality
  - "Session not found" state with reload options
  - Better user feedback for all error scenarios
- **Documentation**: Added `docs/fix-field-preservation-on-update.md` explaining the field preservation fix

## [4.0.0] - 2026-01-19

### Phase 4: Database Integration & Global Settings

**Completion Date:** January 19, 2026

#### Overview

Phase 4 introduced a persistent data layer using **Neon Postgres** (via **Netlify DB**) and a global settings framework wired through **Netlify Functions** and a React **SettingsContext**. This replaces ad‑hoc browser state for configuration with a single source of truth backed by Postgres.

#### Added

##### 1. Neon Postgres Database Setup
- **Database Provisioning**: Neon Postgres database via Netlify DB (built‑in, managed Postgres powered by Neon)
- **Environment Configuration**: Automatic `NETLIFY_DATABASE_URL` environment variable via Netlify DB integration
- **Database Connection**: Connected via `@netlify/neon` package (Neon serverless driver optimized for serverless/edge environments)
- **Database Schema**: Four primary tables:
  - `settings` - Global configuration store
  - `scenarios` - Scenario definitions and metadata
  - `roadmap_items` - Items linked to scenarios via foreign key
  - `activity_log` - Event and audit data for user actions
- **Schema Characteristics**:
  - UUID primary keys
  - JSONB columns for flexible configuration (`effort_model`, `time_model`, `size_bands`, `pm_intake`, `ux_factors`, `content_factors`)
  - Automatic `updated_at` timestamp triggers
  - Indexes for query performance
  - Foreign key relationships (`roadmap_items.scenario_id → scenarios.id`)

##### 2. Global Settings Page
- **New Route**: `/settings` with comprehensive settings form
- **Configurable Parameters**:
  - **UX Factor Weights**: Product Risk, Problem Ambiguity, Discovery Depth
  - **Content Factor Weights**: Content Surface Area, Localization Scope, Regulatory & Brand Risk, Legal Compliance Dependency
  - **PM Intake Overall Multiplier**: Global multiplier for PM intake quality
  - **Focus-time Ratio**: Configurable ratio (0.0–1.0, default 0.75) for converting focus weeks to work weeks
  - **Size-band Thresholds**: Custom numeric cutoffs for XS, S, M, L, XL size bands
- **Features**: "Reset to Defaults" action to restore baked‑in model values
- **Persistence**: Settings loaded on app start and persisted to `settings` table

##### 3. SettingsContext (React)
- **New React Context**: `SettingsContext` with `useSettings()` hook
- **Initialization**: Fetches settings from `/.netlify/functions/get-settings` on app start
- **Default Creation**: Creates default settings on first run if none exist
- **Updates**: Saves settings through `/.netlify/functions/update-settings`
- **Error Handling**: Loading and error states with graceful fallback to default settings if API unavailable
- **Global Access**: Makes settings available across app without prop drilling

##### 4. Netlify Functions (Serverless API)
- **Backend API**: Implemented with Netlify Functions in TypeScript
- **Implemented Functions**:
  - `get-settings.ts`: Reads global settings from Postgres, inserts defaults if missing
  - `update-settings.ts`: Validates payload and updates persisted settings record
  - `get-scenarios.ts`: Prepared for future frontend integration (returns scenario data)
  - `create-scenario.ts`: Prepared for future frontend integration (inserts new scenario rows)
- **Common Features**:
  - All functions use `@netlify/neon` with `NETLIFY_DATABASE_URL` for automatic DB connection
  - CORS headers configured for local development
  - Deployed in `netlify/functions` with standard Netlify functions conventions

##### 5. Effort Calculation Integration
- **Updated Pipeline**: Calculation functions now consume global settings
  - `calculateEffort()` accepts optional `settings` parameter
  - `calculateWeightedScore()` uses configured UX/Content factor weights when provided
  - `mapScoreToSizeBand()` uses size‑band thresholds from settings when available
  - `calculateWorkWeeks()` uses configured focus‑time ratio when available
- **Form Integration**: `PDInputsForm` and `CDInputsForm` read from `SettingsContext`
  - Inputs reflect current weights and thresholds
  - All effort outputs stay in sync with global configuration

##### 6. Documentation
- Database setup guide for provisioning Netlify DB / Neon Postgres
- QA testing guide for settings lifecycle (load, edit, reset, failure modes)
- Manual environment setup instructions (Netlify, env vars, local dev)
- Quick reference checklists for running functions locally and verifying connectivity

#### Changed
- **Settings Storage**: Moved from hard-coded values to database-backed settings
  - Settings persist across deployments
  - Settings can be updated via UI
  - Settings affect all effort calculations globally
- **Form Components**: Updated to use settings from `SettingsContext`
  - `PDInputsForm` uses database settings for effort calculations
  - `CDInputsForm` uses database settings for effort calculations
- **Navigation**: Added "Settings" link to global header navigation
- **Build Configuration**: Updated `netlify.toml` for Functions directory
- **Package Dependencies**: Added `@netlify/neon`, `pg` for database connectivity

#### Technical Architecture

**High-Level Stack:**
- **Frontend**: Vite + React + TypeScript with global configuration via `SettingsContext`
- **Backend**: Netlify Functions (TypeScript) providing serverless API layer
- **Database**: Netlify DB (Neon‑backed Postgres) as primary data store with managed connection string

**Data Flow (Settings):**
1. App boots and `SettingsContext` requests settings from `get-settings`
2. `get-settings` reads from `settings` table (or creates defaults) and returns JSON
3. `SettingsContext` hydrates app with returned configuration
4. User updates settings on `/settings`, `update-settings` persists changes
5. Subsequent calculations receive up‑to‑date settings via context

#### Current Status

**Completed:**
- ✅ Global settings integrated with Neon Postgres
- ✅ Settings read/write via Netlify Functions
- ✅ Settings wired to effort calculation and UI forms
- ✅ Database schema created and deployed
- ✅ Netlify Functions implemented and tested

**Pending (Phase 5):**
- ⏳ Scenarios still persisted in `localStorage` (UI not yet wired to DB)
- ⏳ Roadmap items still in `localStorage`
- ⏳ Activity log still in `localStorage`
- ⏳ Data migration path from `localStorage` → Postgres

## [3.0.0] - 2026-01-XX

### Phase 3: Dark Mode Design System & Enhanced Features

#### Added
- **Dark Mode Design System**: Complete transformation to modern dark mode with electric cyan accents (#00d9ff), blue gradients, and glowing effects
- **Guide Page**: Comprehensive documentation page (`/guide`) covering capacity planning concepts, scoring guides, workflows, best practices, and FAQs
- **Committed Plan Page**: New dedicated page (`/committed-plan`) showing aggregate capacity metrics across all committed scenarios, quarterly breakdown visualization placeholder, and complete roadmap items table
- **Global AppHeader Component**: Unified header navigation with "Capacity Planner" branding, Home/Scenarios/Committed Plan/Guide links, and active state indicators
- **Uncommit Functionality**: Ability to easily deselect commitment from scenarios via toggle controls in list views and dedicated "Uncommit" button in summary view
- **Activity Logging**: Enhanced activity tracking for scenario renaming and deletion events

#### Changed
- **Application Name**: Changed from "Capacity Planning" to "Capacity Planner" throughout the application
- **Color Palette**: 
  - Primary background: `#0a0a0f`
  - Secondary background (cards): `#141419`
  - Tertiary background (inputs): `#1a1a20`
  - Primary accent: Electric Cyan `#00d9ff`
  - Status colors: Emerald (success), Amber (warning), Red (danger)
- **Component Styling**: All components updated with dark mode colors, borders, shadows, and hover effects
  - Buttons: Gradient primary buttons with cyan/blue, outline secondary buttons
  - Cards: Dark backgrounds with subtle borders and hover lift effects
  - Inputs: Dark backgrounds with cyan focus states
  - Tables: Dark headers and rows with hover states
  - Modals: Dark overlays with blur, dark content panels
- **Navigation**: 
  - Removed "Home" button from header navigation (title serves as home link)
  - Active navigation items use cyan gradient buttons
  - Inactive items use styled link boxes
- **CreateScenarioModal**: Updated to full dark mode design system with dark form inputs, selects, and number inputs
- **Scenario Cards**: 
  - Capacity indicators use small colored dots with "Within"/"Over" text
  - Commit controls are radio-style buttons that toggle commit/uncommit
  - Delete buttons for empty scenarios with confirmation dialogs
- **HomePage**: 
  - First-time user experience with hero section, feature cards, and key features
  - Returning user experience with "Welcome back", recent scenarios, and recent activity
  - "Recent activity" section hidden for first-time users
- **SessionSummaryPage**: 
  - "Committed" badge replaced with "Uncommit" button for committed scenarios
  - Dark mode styling throughout
- **ItemDetailPage**: Complete dark mode transformation for all tabs (PM Intake, Product Design, Content Design)
- **Form Components**: All form components (PMIntakeForm, PDInputsForm, CDInputsForm) updated with dark mode styling

#### Fixed
- Fixed gradient contrast on primary buttons for better text readability
- Fixed commit control to properly toggle between committed and uncommitted states
- Fixed scenario list view to allow easy deselection of commitment
- Fixed CreateScenarioModal to match dark mode design system

## [2.0.0] - 2026-01-13

### Phase 2: Enhanced User Experience and Workflow

#### Added
- **New Homepage**: Contextual homepage with "Open last scenario" button, recent scenarios list (sorted by last updated), and recent activity log (last 10 events)
- **Activity Logging**: Tracks scenario creation, renaming, committing, deletion, and roadmap item updates with timestamps
- **Committed Plan Concept**: Scenarios can now be committed as the official quarterly plan; only one scenario per quarter can be committed
- **Scenario Commit Controls**: Radio-style commit control on scenario cards; scenarios must have at least one roadmap item to be committed
- **Scenario Deletion**: Empty scenarios (with no roadmap items) can now be deleted with confirmation dialog
- **Inline Editing**: Scenario names can be edited inline directly from scenario cards and summary page
- **Activity Context**: New ActivityContext for global activity tracking with automatic event logging

#### Changed
- **Navigation**: New header with Home, Scenarios, Committed Plan, and Guide links; "Capacity Planning" title links to Home
- **Visual Refinements**:
  - Committed scenarios display with light background color and sort to the top of lists
  - Capacity status indicators redesigned as small dots next to scenario names ("Within" with green dot, "Over" with orange dot)
  - Removed green shading from capacity cards, using neutral gray instead
  - Cleaned up roadmap table styling (removed colored column backgrounds, using neutral gray headers)
- **Routing Improvements**:
  - New scenarios route to Scenario Summary instead of old Roadmap Items page
  - New roadmap items keep users on Scenario Summary instead of routing away
  - PM Intake/Product Design/Content Design tab links updated to go to Scenario Summary
- **Breadcrumb Improvements**: Removed "New Scenario Here" link; breadcrumbs now show proper hierarchy ending at Scenario Summary
- **Sorting**: Scenarios sort by: committed first, then by quarter, then alphabetically by title

#### Fixed
- Fixed routing after creating new scenarios to go to Scenario Summary
- Fixed routing after creating new roadmap items to stay on Scenario Summary
- Fixed scenario card commit controls to prevent committing empty scenarios
- Fixed activity log to cap at 10 most recent events

### Added (Steps 5-8)
- Product Design tab with button-based factor scoring (3 UX factors with weights)
- Content Design tab with button-based factor scoring (4 Content factors with weights)
- Real-time effort calculations on both design tabs
- UX and Content Effort Estimate cards with size badges
- Session Summary page with capacity overview cards
- Full roadmap items table with UX/Content effort columns
- Save and Remove action buttons on Session Summary table
- Quarterly Capacity page with year-at-a-glance overview
- Scenarios grouped by quarter with individual capacity cards
- Sprint estimate range formatting (e.g., "1-2 sprints", "0-1 sprints")

### Changed (Steps 5-8)
- Size badges now display as plain text (no circular background)
- Priority badges remain as yellow rectangular pills
- Capacity cards now stack responsively on narrow screens
- Removed Platform Complexity factor from UX calculations
- Work weeks calculation formula: focus weeks ÷ 0.75
- Size band thresholds corrected: XS(<1.6), S(<2.6), M(<3.6), L(<4.6), XL(≥4.6)
- "+ Add another feature" now creates items directly (no intermediate page)

### Fixed (Steps 5-8)
- Effort model calculations for accurate XS-XL sizing
- Save button icon display on Session Summary
- Remove button functionality with proper confirmation
- Item summary updates after effort level changes
- Session Summary data refresh when returning from Item Detail
- Edge case calculations (all 1s → XS, all 5s → XL)

### Added
- Language count field to Content Design tab
- Sprint estimate ranges (e.g., "1-2 sprints") on Item Detail
- Factor weights displayed in UI (e.g., "Product Risk (×1.2)")
- Card-based layout for Planning Scenarios list (populated state)
- Scenario count display on home page
- Capacity breakdown cards with surplus/deficit indicators

### Changed
- Default factor scores now set to 3 (was undefined)
- Work week calculation: focus weeks ÷ 0.75 (was ÷ 2)
- Surfaces in Scope: flat checkbox list instead of hierarchical
- Left-aligned all form controls on design tabs
- Home page populated state: replaced table with card-based layout showing scenario cards with status badges, details, and capacity breakdown

### Removed
- Team Name field from roadmap item creation
- "Other" option from Surfaces in Scope
- "Goal" field from PM Intake tab UI (kept in data model)

### Completed
- ✅ Iteration 3: Core functionality (factor-based sizing, scenarios, persistence)
- ✅ Figma Design Implementation: Steps 1-8 complete (Jan 11-13, 2026)

## [1.3.0] - 2026-01-12

### Completed Iteration 3
- Factor-based sizing for UX and Content
- Focus-time vs work-week distinction
- Planning scenarios with quarterly periods
- Item Detail tabs with factor scoring
- localStorage persistence
- 2-week sprint standardization
