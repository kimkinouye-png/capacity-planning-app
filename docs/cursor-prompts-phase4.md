# Cursor Prompts for Phase 4 Implementation

This document contains concrete, copy‑pasteable prompts you can use in Cursor to implement and wire up Phase 4: Database Integration & Global Settings. Use them in Composer (project‑wide) unless noted as "inline".

---

## 1. Create /docs structure and files

### Prompt 1 – Create docs folders and main Phase 4 doc

```
You are editing a Vite + React + TypeScript app for a UX/Content capacity‑planning tool.
Create a /docs folder (if it doesn't exist) and add a new file docs/PHASE4-UPDATE.md.
Use the following as the full file content, with no extra commentary. Preserve headings and Markdown exactly:

[PASTE THE PHASE4-UPDATE.MD CONTENT FROM docs/phase-4-summary.md]
```

### Prompt 2 – Create an architecture subfolder

```
In this repo, create a documentation structure for architecture docs.

Ensure a docs/architecture folder exists.

Add a new file docs/architecture/database-and-settings.md.

Summarize the Phase 4 database + global settings architecture in 1–2 pages of Markdown: high‑level overview, data flow, table responsibilities, and how SettingsContext + Netlify Functions + Neon Postgres interact.

This is reference documentation for engineers, not a changelog. Assume the tech stack and features described in docs/PHASE4-UPDATE.md.
```

### Prompt 3 – Add changelog entry

```
Add or create docs/CHANGELOG.md for this project.

If it doesn't exist, create it with a standard changelog structure (reverse chronological, headings by date/version).

Add a new entry for 2026‑01‑19 – Phase 4: Database Integration & Global Settings.

Summarize the Phase 4 work in 5–8 bullet points, and include a link reference to PHASE4-UPDATE.md.

Keep the wording concise and suitable for stakeholders scanning changes.
```

---

## 2. Wire docs into README

### Prompt 4 – Update README with docs links

```
Open the root README.md for this project.

Add a "Documentation" section if there isn't one.

Under it, add bullet links to:

docs/PHASE4-UPDATE.md (label: "Phase 4: Database Integration & Global Settings").

docs/architecture/database-and-settings.md (label: "Database & Settings Architecture").

docs/CHANGELOG.md (label: "Changelog").

Keep the style consistent with the existing README.
```

---

## 3. Netlify Functions and Neon integration

### Prompt 5 – Create/verify Netlify Functions structure

```
In this project, ensure the Netlify Functions structure is set up for TypeScript:

Confirm or create a netlify/functions directory.

Make sure TypeScript is configured for functions (tsconfig paths, build output to netlify/functions, and any necessary Netlify config).

If missing, add or update netlify.toml so that TypeScript functions in netlify/functions/*.ts are built correctly.

Keep changes minimal and compatible with current build tooling.
```

### Prompt 6 – Implement settings functions

```
In netlify/functions, implement or refine the following TypeScript Netlify Functions using @netlify/neon and Postgres:

get-settings.ts:

Connect using the NETLIFY_DATABASE_URL via @netlify/neon.

Read from a settings table with JSONB columns that store UX factor weights, content factor weights, PM intake multiplier, focus‑time ratio, and size‑band thresholds.

If no row exists, insert default settings and return them.

update-settings.ts:

Accept JSON in the request body.

Validate that all expected config keys exist and are of the right type.

Update the existing settings row and return the updated record.

Configure CORS for local development.
Keep the implementation small, idiomatic, and typed, using @netlify/functions types for handlers.
```

### Prompt 7 – Stub scenarios and roadmap functions

```
In netlify/functions, implement "prepared" but not yet wired functions:

get-scenarios.ts:

Read scenario data from a scenarios table and return as JSON.

create-scenario.ts:

Accept a JSON payload and insert a new row into scenarios.

For now, keep schemas simple and aligned with the Phase 4 description of scenarios and roadmap_items.
These functions will be wired in Phase 5, so focus on clean, tested serverless handlers that compile.
```

---

## 4. React SettingsContext and settings page

### Prompt 8 – Implement SettingsContext

```
In the React app (Vite + TS), create a new SettingsContext:

Add a SettingsContext and SettingsProvider that:

On mount, calls /.netlify/functions/get-settings.

Stores settings, isLoading, error, and an updateSettings function in context.

Falls back to default settings if the API fails.

Export a useSettings() hook for consuming components.

Types should match the schema implied by the Phase 4 description (UX factors, Content factors, PM intake multiplier, focus‑time ratio, size bands).
Place this in a reasonable location such as src/context/SettingsContext.tsx, and wrap the app root in SettingsProvider.
```

### Prompt 9 – Create /settings route and page

```
Implement a new /settings route with a comprehensive settings form.

The page should read from useSettings() and display:

UX factor weights (Product Risk, Problem Ambiguity, Discovery Depth).

Content factor weights (Content Surface Area, Localization Scope, Regulatory & Brand Risk, Legal Compliance Dependency).

PM Intake overall multiplier.

Focus‑time ratio (0.0–1.0, default 0.75).

Size‑band thresholds for XS, S, M, L, XL.

When the user saves, call updateSettings and persist via /.netlify/functions/update-settings.

Add a "Reset to Defaults" button that resets to the app's default model and persists it.
Use the app's existing form and layout patterns. Don't introduce a new design system.
```

---

## 5. Effort calculation wiring

### Prompt 10 – Update calculation utilities to use settings

```
Find the effort calculation code (calculateEffort, calculateWeightedScore, mapScoreToSizeBand, calculateWorkWeeks) and update it to integrate with global settings:

calculateEffort() should accept an optional settings parameter.

calculateWeightedScore() should use weights from settings when provided; otherwise use the existing hardcoded defaults.

mapScoreToSizeBand() should base size band decisions on thresholds in settings when provided.

calculateWorkWeeks() should use the focus‑time ratio from settings when provided.
Keep existing behavior as the fallback when settings is undefined, and avoid breaking existing call sites.
```

### Prompt 11 – Wire forms to SettingsContext

```
Update PDInputsForm and CDInputsForm to consume useSettings():

Read UX and Content factor weights from settings instead of hardcoded values or local state.

Pass settings down to the calculation utilities where necessary.

Ensure the UI stays responsive while settings is loading (e.g., show a loading state or disable the form until ready).
```

---

## 6. Database schema and migrations

### Prompt 12 – Add schema/migration files

```
Add database schema/migration documentation for the Neon Postgres / Netlify DB setup:

Create a docs/architecture/schema.sql.md file.

Document the settings, scenarios, roadmap_items, and activity_log tables: columns, types, JSONB fields, indexes, and foreign keys.

This should be copy‑pasteable into a .sql file if needed, but is primarily documentation for now.

If you use actual SQL migrations in the repo (e.g., db/migrations), follow up with:

Based on docs/architecture/schema.sql.md, generate SQL migration files in the project's migrations folder to create the settings, scenarios, roadmap_items, and activity_log tables. Ensure they are idempotent or follow the project's existing migration conventions.
```

---

## 7. LocalStorage → DB (Phase 5 prep)

### Prompt 13 – Identify localStorage usages

```
Scan the codebase and list all places where localStorage is used for scenarios, roadmap items, or activity logs (likely in PlanningSessionsContext and related files).

Produce a short Markdown report summarizing each usage: key names, data shape, and which UI components depend on it.

This is preparatory work for Phase 5, no code changes yet.
```

---

## Meta Prompt for Ongoing Work

If you want, the next step can be a single "meta" prompt you keep pinned in Cursor's Composer, and then you paste individual tasks as you work:

```
You are helping maintain a Vite + React + TypeScript capacity‑planning app deployed on Netlify, using Neon Postgres via Netlify DB and Netlify Functions.
I will paste specific tasks (docs, React code, Netlify Functions, database schema). For each task, make focused, minimal edits that fit the existing patterns in this repo, and show me diffs.
```

---

## Usage Instructions

1. **Copy the prompt** you need from this document
2. **Paste into Cursor Composer** (project-wide mode recommended)
3. **Execute** and review the changes
4. **Test** the implementation
5. **Move to next prompt** as needed

## Notes

- Prompts are designed to be used sequentially, but can be adapted based on your current state
- Some prompts assume previous work is complete (e.g., Prompt 8 assumes Prompt 6 is done)
- Adjust prompts as needed for your specific codebase patterns
- All prompts assume you're working in the capacity-planning-app repository
