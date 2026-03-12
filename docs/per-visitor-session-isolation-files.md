# Per-visitor session isolation — key files

Use this list to open and copy/paste into Perplexity (or Cursor) when implementing per-visitor session isolation. Each file has a **summary comment at the top** describing Neon/Netlify DB usage and how data is currently identified (no `session_id` yet).

---

## 1. Database schema

| File | Purpose |
|------|--------|
| `database/schema.sql` | Tables: `settings`, `scenarios`, `roadmap_items`, `activity_log`. No `session_id` column yet. |

---

## 2. Netlify functions (read/write roadmap & scenarios)

| File | Purpose |
|------|--------|
| `netlify/functions/db-connection.ts` | Neon client via `NETLIFY_DATABASE_URL`, `@neondatabase/serverless`. No session filtering. |
| `netlify/functions/get-scenarios.ts` | **Loads all scenarios** (no filter). |
| `netlify/functions/create-scenario.ts` | Creates scenario (no `session_id` on insert). |
| `netlify/functions/update-scenario.ts` | Updates by `id` only. |
| `netlify/functions/delete-scenario.ts` | Deletes by `id` only. |
| `netlify/functions/get-roadmap-items.ts` | Gets items by `scenarioId` query param. |
| `netlify/functions/create-roadmap-item.ts` | Creates item for `scenario_id` (no session check). |
| `netlify/functions/update-roadmap-item.ts` | Updates by item `id` only. |
| `netlify/functions/delete-roadmap-item.ts` | Deletes by item `id` only. |
| `netlify/functions/get-settings.ts` | Single global settings row. |
| `netlify/functions/update-settings.ts` | Updates global settings row. |
| `netlify/functions/get-activity-log.ts` | Optional `scenarioId` filter; no visitor session. |
| `netlify/functions/create-activity-log-entry.ts` | Inserts activity (optional scenarioId). |

---

## 3. Frontend — where API is called

There is **no separate API helper**; each context calls `fetch()` to `/.netlify/functions/<name>`.

| File | Calls | Initial load |
|------|--------|---------------|
| `src/context/PlanningSessionsContext.tsx` | `get-scenarios`, `create-scenario`, `update-scenario`, `delete-scenario` | `loadSessions()` on mount |
| `src/context/RoadmapItemsContext.tsx` | `get-roadmap-items?scenarioId=`, `create-roadmap-item`, `update-roadmap-item`, `delete-roadmap-item` | `loadItemsForSession(sessionId)` when opening a scenario |
| `src/context/SettingsContext.tsx` | `get-settings`, `update-settings` | `loadSettings()` in provider |
| `src/context/ActivityContext.tsx` | `get-activity-log`, `create-activity-log-entry` | `loadActivity(scenarioId?)` |

**Note:** In the frontend, “session” often means **planning scenario** (backend `scenario_id`). For per-visitor isolation you will add a **visitor session id** (e.g. from localStorage) and send it with every request.

---

## 4. Implementation checklist

- [x] Add `session_id` column to `scenarios` (see `database/migrations/add-session-id-to-scenarios.sql`; run in Neon).
- [x] Generate visitor `sessionId` in frontend (`src/utils/session.ts`), store in localStorage, send as `x-session-id` header with every request.
- [x] In each Netlify function: read `sessionId` via `request-session.ts`, filter scenarios and derived data by `session_id`.
- [ ] Optional: backfill existing rows (e.g. `UPDATE scenarios SET session_id = 'legacy' WHERE session_id IS NULL`) if you want them visible to a default session; otherwise new visitors only see new scenarios.
