# Phase 4: Database Integration & Global Settings

**Completion Date:** January 19, 2026  
**App:** Capacity Planning App (UX & Content Capacity Planning)

---

## Overview

Phase 4 introduced a persistent data layer using **Neon Postgres** (via **Netlify DB**) and a global settings framework wired through **Netlify Functions** and a React **SettingsContext**. This replaces ad‑hoc browser state for configuration with a single source of truth backed by Postgres.

---

## What Was Implemented

### 1. Neon Postgres Database Setup

- Provisioned Neon Postgres database using **Netlify DB** (built‑in, managed Postgres powered by Neon).
- Configured automatic `NETLIFY_DATABASE_URL` environment variable via the Netlify DB integration.
- Connected via `@netlify/neon`, which uses the Neon serverless driver optimized for serverless/edge environments.

**Schema**

Four primary tables:

- `settings`
- `scenarios`
- `roadmap_items`
- `activity_log`

Key characteristics:

- UUID primary keys.
- JSONB columns for flexible configuration and model data, including:
  - `effort_model`
  - `time_model`
  - `size_bands`
  - `pm_intake`
  - `ux_factors`
  - `content_factors`
- `updated_at` timestamp triggers for automatic update tracking.
- Indexes for query performance.
- Foreign key relationship: `roadmap_items.scenario_id → scenarios.id`.

---

### 2. Global Settings Page

New route: `/settings`

Features:

- Single, comprehensive settings form for global configuration.
- Configurable **UX factor weights**:
  - Product Risk
  - Problem Ambiguity
  - Discovery Depth
- Configurable **Content factor weights**:
  - Content Surface Area
  - Localization Scope
  - Regulatory & Brand Risk
  - Legal Compliance Dependency
- PM Intake overall multiplier.
- Focus‑time ratio (0.0–1.0, default 0.75).
- Size‑band thresholds (XS, S, M, L, XL) with custom numeric cutoffs.
- "Reset to Defaults" action to restore the baked‑in model.
- Settings are loaded on app start and persisted to the `settings` table.

---

### 3. SettingsContext (React)

New React context: `SettingsContext`

- Exposes a `useSettings()` hook for consuming components.
- On app initialization:
  - Fetches settings from `/.netlify/functions/get-settings`.
  - Creates default settings on first run if none exist.
- On updates:
  - Saves settings through `/.netlify/functions/update-settings`.
- Handles:
  - Loading and error states.
  - Graceful fallback to default settings if the API is unavailable.
- Makes settings available across the app without prop drilling, consistent with React Context best practices.

---

### 4. Netlify Functions (Serverless API)

Backend API implemented with **Netlify Functions** in TypeScript.

Implemented functions:

- `get-settings.ts`
  - Reads global settings from Postgres.
  - If missing, inserts and returns default settings.
- `update-settings.ts`
  - Validates incoming payload.
  - Updates persisted settings record.
- `get-scenarios.ts`
  - Prepared for future frontend integration.
  - Will return scenario data from `scenarios`.
- `create-scenario.ts`
  - Prepared for future frontend integration.
  - Will insert new scenario rows.

Common characteristics:

- All functions use `@netlify/neon` with `NETLIFY_DATABASE_URL` for automatic DB connection.
- CORS headers configured for local development convenience.
- Deployed in `netlify/functions` with standard Netlify functions conventions.

---

### 5. Effort Calculation Integration

Updated calculation pipeline to consume global settings:

- `calculateEffort()` now accepts an optional `settings` parameter.
- `calculateWeightedScore()` uses configured UX/Content factor weights when provided.
- `mapScoreToSizeBand()` uses size‑band thresholds from settings when available.
- `calculateWorkWeeks()` uses the configured focus‑time ratio when available.
- Forms (`PDInputsForm`, `CDInputsForm`) read from `SettingsContext`, ensuring:
  - Inputs reflect current weights and thresholds.
  - All effort outputs stay in sync with global configuration.

---

### 6. Database Schema Details

**Tables**

- `settings`
  - Single‑row or keyed configuration store using JSONB fields.
- `scenarios`
  - Scenario definitions and metadata.
- `roadmap_items`
  - Items linked to scenarios, driven by foreign key.
- `activity_log`
  - Event and audit data for user actions.

**Patterns**

- UUIDs for primary keys.
- JSONB for flexible, schema‑light configuration.
- Indexes on key lookup fields (IDs, foreign keys, timestamps).
- Database‑level triggers to maintain `updated_at`.

---

## Current Status

### Completed

- ✅ Global settings integrated with Neon Postgres.
- ✅ Settings read/write via Netlify Functions.
- ✅ Settings wired to effort calculation and UI forms.
- ✅ Database schema created and deployed.
- ✅ Netlify Functions (`get-settings`, `update-settings`, `get-scenarios`, `create-scenario`) implemented and tested.

### Pending (Phase 5)

- ⏳ Scenarios still persisted in `localStorage` (UI not yet wired to DB).
- ⏳ Roadmap items still in `localStorage`.
- ⏳ Activity log still in `localStorage`.
- ⏳ Data migration path from `localStorage` → Postgres.

---

## Technical Architecture

### High-Level Stack

- **Frontend:**  
  - Vite + React + TypeScript.  
  - Global configuration via `SettingsContext` and `useSettings()`.

- **Backend:**  
  - Netlify Functions (TypeScript) providing a serverless API layer.
  - `@netlify/neon` for Postgres connectivity using Neon's serverless driver.

- **Database:**  
  - Netlify DB (Neon‑backed Postgres) as the primary data store.
  - Managed connection string via `NETLIFY_DATABASE_URL`.

### Data Flow (Settings)

1. App boots and `SettingsContext` requests settings from `get-settings`.  
2. `get-settings` reads from the `settings` table (or creates defaults) and returns JSON.  
3. `SettingsContext` hydrates the app with the returned configuration.  
4. When a user updates settings on `/settings`, `update-settings` persists changes.  
5. Subsequent calculations (`calculateEffort`, etc.) receive up‑to‑date settings via context.

---

## Documentation & Supporting Materials

Created as part of this phase:

- Database setup guide for provisioning Netlify DB / Neon Postgres.  
- QA testing guide for settings lifecycle (load, edit, reset, failure modes).  
- Manual environment setup instructions (Netlify, env vars, local dev).  
- Quick reference checklists for:
  - Running Netlify Functions locally.
  - Verifying DB connectivity.
  - Validating settings behavior end‑to‑end.
