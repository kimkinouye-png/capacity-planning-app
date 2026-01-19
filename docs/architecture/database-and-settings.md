# Database & Settings Architecture

**Last Updated:** January 19, 2026

## Overview

The Capacity Planning App uses **Neon Postgres** (via **Netlify DB**) as its persistent data store, with a global settings framework that provides a single source of truth for effort model configuration. The architecture follows a serverless pattern with Netlify Functions providing the API layer between the React frontend and the Postgres database.

## High-Level Architecture

```
┌─────────────────┐
│  React Frontend │
│  (Vite + TS)    │
└────────┬────────┘
         │
         │ HTTP Requests
         │
┌────────▼─────────────────┐
│  Netlify Functions       │
│  (TypeScript)            │
│  - get-settings          │
│  - update-settings       │
│  - get-scenarios         │
│  - create-scenario       │
└────────┬─────────────────┘
         │
         │ @netlify/neon
         │ (automatic connection)
         │
┌────────▼─────────────────┐
│  Neon Postgres           │
│  (via Netlify DB)        │
│  - settings              │
│  - scenarios             │
│  - roadmap_items         │
│  - activity_log          │
└──────────────────────────┘
```

## Data Flow

### Settings Flow

1. **App Initialization:**
   - `SettingsContext` mounts and calls `/.netlify/functions/get-settings`
   - Function queries `settings` table in Postgres
   - If no row exists, function creates default settings and returns them
   - Settings are stored in React context state

2. **Settings Update:**
   - User modifies settings on `/settings` page
   - Form calls `updateSettings()` from context
   - Context calls `/.netlify/functions/update-settings` with new values
   - Function validates and updates `settings` table
   - Updated settings returned and stored in context

3. **Effort Calculation:**
   - Forms (`PDInputsForm`, `CDInputsForm`) read settings via `useSettings()`
   - Calculation functions (`calculateEffort`, etc.) receive settings as parameter
   - Calculations use configured weights, thresholds, and ratios
   - Results displayed in UI

## Database Schema

### Tables

#### `settings`
**Purpose:** Global configuration store for effort model parameters

**Structure:**
- `id` (UUID, PRIMARY KEY) - Single row identifier
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Auto-updated on changes
- `effort_model` (JSONB) - Contains:
  - `ux`: Factor weights for UX calculations
  - `content`: Factor weights for Content calculations
  - `pmIntakeMultiplier`: Overall PM intake multiplier
- `time_model` (JSONB) - Contains:
  - `focusTimeRatio`: Ratio for converting focus weeks to work weeks
- `size_bands` (JSONB) - Contains:
  - `xs`, `s`, `m`, `l`, `xl`: Threshold values for size band classification

**Usage:** Single row (or keyed) configuration. All scenarios use these global values.

#### `scenarios`
**Purpose:** Planning scenario definitions

**Structure:**
- `id` (UUID, PRIMARY KEY)
- `title` (TEXT) - Scenario name
- `quarter` (TEXT) - Planning period (e.g., "2026-Q1")
- `year` (INT) - Year
- `committed` (BOOLEAN) - Whether scenario is committed plan
- `ux_designers` (INT) - Number of UX designers
- `content_designers` (INT) - Number of Content designers
- `weeks_per_period` (INT) - Available weeks in period
- `sprint_length_weeks` (INT) - Sprint length
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Relationships:** `roadmap_items.scenario_id → scenarios.id`

#### `roadmap_items`
**Purpose:** Individual roadmap items within scenarios

**Structure:**
- `id` (UUID, PRIMARY KEY)
- `scenario_id` (UUID, FOREIGN KEY → scenarios.id)
- `key` (TEXT) - Short identifier
- `name` (TEXT) - Item name
- `initiative` (TEXT) - Initiative name
- `priority` (INT) - Priority level
- `status` (TEXT) - Item status
- `pm_intake` (JSONB) - PM intake data
- `ux_factors` (JSONB) - UX factor scores
- `content_factors` (JSONB) - Content factor scores
- `ux_score`, `content_score` (NUMERIC) - Calculated scores
- `ux_size`, `content_size` (TEXT) - Size bands (XS-XL)
- `ux_focus_weeks`, `content_focus_weeks` (NUMERIC) - Focus time estimates
- `ux_work_weeks`, `content_work_weeks` (NUMERIC) - Work week estimates
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Relationships:** Foreign key to `scenarios` with CASCADE delete

#### `activity_log`
**Purpose:** Event and audit trail

**Structure:**
- `id` (UUID, PRIMARY KEY)
- `timestamp` (TIMESTAMPTZ) - Event time
- `type` (TEXT) - Event type
- `scenario_id` (UUID, FOREIGN KEY → scenarios.id, nullable)
- `scenario_name` (TEXT) - Scenario name at time of event
- `description` (TEXT) - Event description

**Usage:** Tracks user actions for audit and activity feed

## Component Responsibilities

### SettingsContext

**Location:** `src/context/SettingsContext.tsx`

**Responsibilities:**
- Fetch settings from database on mount
- Provide settings to consuming components via `useSettings()` hook
- Handle loading and error states
- Provide `saveSettings()` and `resetToDefaults()` methods
- Fallback to default settings if API unavailable

**API:**
```typescript
interface SettingsContextType {
  settings: GlobalSettings | null
  isLoading: boolean
  error: string | null
  saveSettings: (settings: GlobalSettings) => Promise<void>
  resetToDefaults: () => Promise<void>
}
```

### Netlify Functions

**Location:** `netlify/functions/`

**Responsibilities:**
- Provide serverless API endpoints
- Handle database connections via `@netlify/neon`
- Validate request payloads
- Return JSON responses
- Handle CORS for local development

**Functions:**
- `get-settings.ts`: Read/create default settings
- `update-settings.ts`: Update settings with validation
- `get-scenarios.ts`: Fetch scenarios (prepared, not integrated)
- `create-scenario.ts`: Create scenario (prepared, not integrated)

### Database Connection

**Package:** `@netlify/neon`

**Pattern:**
```typescript
import { neon } from '@netlify/neon'

// Automatically uses NETLIFY_DATABASE_URL from environment
const sql = neon()

// Execute queries
const result = await sql`SELECT * FROM settings LIMIT 1`
```

**Benefits:**
- Automatic connection string management
- Optimized for serverless/edge environments
- No manual connection pooling needed

## Data Patterns

### JSONB Usage

JSONB columns store flexible, schema-light data:

- **Settings:** Effort model configuration (weights, thresholds, ratios)
- **Roadmap Items:** PM intake, UX factors, Content factors (variable structure)
- **Future:** Can evolve without schema migrations

### UUID Primary Keys

All tables use UUIDs for:
- Distributed system compatibility
- Security (non-sequential IDs)
- Future multi-tenant support

### Automatic Timestamps

Database triggers maintain `updated_at`:
- No application-level timestamp management needed
- Consistent across all tables
- Audit trail support

## Integration Points

### Settings → Calculations

1. Settings loaded into `SettingsContext`
2. Forms read settings via `useSettings()`
3. Calculation functions receive settings as parameter
4. Calculations use configured values (weights, thresholds, ratios)
5. Results displayed in UI

### Settings → UI

1. Settings page (`/settings`) reads from context
2. Form inputs bound to settings values
3. Save action calls `updateSettings()`
4. Context persists via Netlify Function
5. All components using settings automatically update

## Future Integration (Phase 5)

### Scenarios Integration

- Update `PlanningSessionsContext` to use `get-scenarios` and `create-scenario`
- Migrate localStorage data to database
- Add `update-scenario` and `delete-scenario` functions

### Roadmap Items Integration

- Create functions: `get-roadmap-items`, `create-roadmap-item`, `update-roadmap-item`, `delete-roadmap-item`
- Update `RoadmapItemsContext` to use database
- Migrate localStorage data

### Activity Log Integration

- Create functions: `get-activity-log`, `create-activity-event`
- Update `ActivityContext` to use database
- Migrate localStorage data

## Performance Considerations

### Indexes

- `scenarios`: Indexed on `quarter`, `committed` for filtering
- `roadmap_items`: Indexed on `scenario_id` for joins
- `activity_log`: Indexed on `timestamp DESC` for recent events

### Query Optimization

- Settings: Single row lookup (very fast)
- Scenarios: Filtered by quarter/year (indexed)
- Roadmap Items: Filtered by scenario_id (indexed)
- Activity Log: Recent events query (indexed by timestamp)

## Security

### Environment Variables

- `NETLIFY_DATABASE_URL`: Managed by Netlify, not exposed to frontend
- Connection string automatically injected into Functions
- No credentials in codebase

### CORS

- Functions include CORS headers for local development
- Production: Same-origin requests (no CORS needed)

### Validation

- Netlify Functions validate request payloads
- Type checking via TypeScript
- Database constraints (foreign keys, NOT NULL)

## Error Handling

### Settings Context

- Falls back to default settings if API fails
- Displays error messages to user
- Loading states prevent UI flicker

### Netlify Functions

- Try/catch blocks around database operations
- Returns appropriate HTTP status codes
- Logs errors for debugging

### Database

- Foreign key constraints prevent orphaned records
- NOT NULL constraints ensure data integrity
- Transaction support for atomic operations
