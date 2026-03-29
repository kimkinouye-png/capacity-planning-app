# Phase 1 Gap List — Figma Make vs Current Repo

**Generated from:** `START_HERE.md`, `Planner Ideation2/PHASE1_GAP_ANALYSIS.md`, `Planner Ideation2/SESSION_ISOLATION_PATTERN.md`, `database/schema.sql`, `netlify/functions/`.

**Session isolation:** Your production pattern uses `session_id` on **`scenarios`**, `x-session-id` / `sessionId` query on requests, and roadmap/activity scoped via **scenario ownership** (join to `scenarios.session_id`). **Preserve this** in any new functions or migrations (`SESSION_ISOLATION_PATTERN.md`).

---

## 1. Netlify Functions — Part B vs `netlify/functions/`

| Expected (PHASE1) | Exists? | Notes |
|---------------------|---------|--------|
| `get-scenarios.ts` | ✅ | Returns **JSON array** of sessions, not `{ scenarios: [...] }` per Part C. |
| `get-scenario.ts` | ❌ **Missing** | Single scenario by id (with session check). |
| `create-scenario.ts` | ✅ | |
| `update-scenario.ts` | ✅ | |
| `delete-scenario.ts` | ✅ | |
| `duplicate-scenario.ts` | ❌ **Missing** | Required by Part B / Part C §5. |
| `get-roadmap-items.ts` | ✅ | |
| `create-roadmap-item.ts` | ✅ | |
| `update-roadmap-item.ts` | ✅ | |
| `delete-roadmap-item.ts` | ✅ | |
| `get-settings.ts` | ✅ | Shape differs from Part C §10 (see §3). |
| `update-settings.ts` | ✅ | |

**Also present (outside PHASE1 “11”):** `get-activity-log.ts`, `create-activity-log-entry.ts`, `request-session.ts`, `db-health.ts`, `types.ts`, `db-connection.ts`.

**Phase 1 function gaps (implement):**

1. **`get-scenario.ts`** — `GET` one plan by `id` + session (query/header/body per `request-session.ts`).
2. **`duplicate-scenario.ts`** — `POST` copy scenario (+ optionally roadmap items) under same `session_id`, new id.

**Optional contract alignment:** Part C shows `get-scenarios` returning `{ scenarios: [...] }`. Current API returns a **bare array**. Decide: wrap in `{ scenarios }` for Figma Make client parity **or** document “array only” and adjust Phase 2 client.

---

## 2. Database — `scenarios` (Part A vs `database/schema.sql`)

| Phase1 expects | Current schema | Gap |
|----------------|----------------|-----|
| `session_id` | ✅ `session_id TEXT` | **Keep** — index `idx_scenarios_session_id` exists. |
| `name` | `title` | **Naming mismatch** — same role; map in API/types or add `name` alias column (prefer mapping in app layer). |
| `description` | — | ❌ **Missing column** |
| `status` VARCHAR draft/committed | `committed` BOOLEAN | **Model mismatch** — derivable (`status` = committed ? 'committed' : 'draft') or add column + backfill |
| `quarter` | ✅ `quarter` | OK (format may differ: `2026-Q1` vs `Q2'26`) |
| — | `year` | Extra in current (fine) |
| `team_size_ux_design` | `ux_designers` | **Naming mismatch** — same idea |
| `team_size_content_design` | `content_designers` | **Naming mismatch** |
| `capacity_ux_design` | — | ❌ **Missing** |
| `capacity_content_design` | — | ❌ **Missing** |
| `demand_ux_design` | — | ❌ **Missing** (or compute from roadmap + store snapshot) |
| `demand_content_design` | — | ❌ **Missing** |
| `roadmap_items_count` | — | ❌ **Missing** (or compute `COUNT` from `roadmap_items`) |
| `weeks_per_period`, `sprint_length_weeks` | ✅ | Extra vs Phase1 — keep for existing app unless deprecated |

**Indexes:** `idx_scenarios_quarter` ✅, `idx_scenarios_session_id` ✅. Phase1 `idx_scenarios_status` — partial match (`idx_scenarios_committed` on boolean).

---

## 3. Database — `roadmap_items`

| Phase1 expects | Current schema | Gap |
|----------------|----------------|-----|
| `scenario_id`, `key`, `name` | ✅ | OK |
| `initiative` NOT NULL VARCHAR | `initiative` nullable TEXT | Nullable vs NOT NULL |
| `priority` VARCHAR (P0, P1…) | `priority` INT | **Type mismatch** |
| `quarter` NOT NULL | — | ❌ **Missing column** on items |
| `status` draft/committed | `draft` / `ready_for_sizing` / `sized` / `locked` | **Enum mismatch** — Figma Make uses different lifecycle |
| `project_type` enum | — | ❌ **Missing** |
| `ux_focus_weeks`, `content_focus_weeks` | ✅ NUMERIC | OK |
| `ux_product_risk`, `ux_problem_ambiguity`, `content_surface_area`, `content_localization_scope` | `ux_factors` / `content_factors` **JSONB** | **Shape mismatch** — Phase1 wants scalar columns; current stores structured JSON |
| `idx_roadmap_items_quarter` | — | Missing if `quarter` column added |

**Isolation:** No `session_id` on `roadmap_items` in current schema — **correct** per `SESSION_ISOLATION_PATTERN.md` Option 1 (join via `scenarios`).

---

## 4. Database — `settings`

| Phase1 expects | Current schema | Gap |
|----------------|----------------|-----|
| Table `settings` with `key` + `value` JSONB rows | Single row `id` fixed UUID, columns `effort_model`, `time_model`, `size_bands` | **Different model** |
| Row `key = 'capacity_planner_config'` with nested `effortWeights`, `planningPeriods`, etc. | Defaults in separate JSONB columns | **Contract mismatch** with Part C §10–11 |

**Session:** Current settings are **global** (no `session_id`). Phase1 / `SESSION_ISOLATION_PATTERN.md` allow global settings — **OK to keep** unless you need per-visitor settings later.

---

## 5. API response shapes (Part C vs current)

| Endpoint | Part C expectation | Current behavior (verify in code) |
|----------|-------------------|-----------------------------------|
| GET get-scenarios | `{ scenarios: [...] }` | Likely **array only** |
| GET get-settings | Flat `effortWeights`, `planningPeriods`, … | **`effort_model`, `time_model`, `size_bands`** snake_case nested |
| Roadmap items | Fields like `uxProductRisk` | DB uses JSONB factors + different status values |

**Phase 1 recommendation:** Document “adapter layer” in Phase 2 (`mapDbToFigmaMakeScenario`) instead of breaking existing app until UI migration lands.

---

## 6. Session isolation — checklist (preserve)

Per `SESSION_ISOLATION_PATTERN.md` + existing code:

- [x] `scenarios.session_id` + index  
- [x] `getSessionIdFromRequest` / `x-session-id` / `sessionId` query  
- [x] Roadmap functions verify scenario belongs to session  
- [ ] **New** `get-scenario.ts` / `duplicate-scenario.ts` must use **same** pattern (filter `id` + `session_id`, insert with `session_id`)

---

## 7. Recommended Phase 1 implementation order

1. **Decide schema strategy**  
   - **A — Additive:** `ALTER TABLE scenarios` add `description`, capacity/demand columns, `roadmap_items_count` (or computed in API only). Add roadmap columns (`quarter`, `project_type`, priority text) with migrations.  
   - **B — Adapter-only first:** No DB change; map Figma Make fields ↔ existing columns in functions + Phase 2 types (faster, some Figma fields stubbed or stored in JSONB).

2. **Implement missing functions**  
   - `get-scenario.ts`, `duplicate-scenario.ts` with session isolation.

3. **Align contracts (optional in Phase 1)**  
   - Wrap get-scenarios response / add compatibility fields for Figma Make client.  
   - Or document differences in `PHASE2_TYPESCRIPT_INTERFACES.md`.

4. **Test**  
   - curl/Postman with `x-session-id` + `sessionId` query per existing pattern.  
   - Confirm isolation still holds after new endpoints.

---

## 8. Files to create (suggested)

| File | Purpose |
|------|---------|
| `database/migrations/00X_figma_make_phase1_scenarios.sql` | Optional `ALTER TABLE scenarios ADD COLUMN ...` |
| `database/migrations/00X_figma_make_phase1_roadmap_items.sql` | Optional columns for Figma Make parity |
| `netlify/functions/get-scenario.ts` | GET single scenario |
| `netlify/functions/duplicate-scenario.ts` | POST duplicate |

---

## 9. Summary counts

| Area | Status |
|------|--------|
| Netlify functions from Part B | **9/11** present — **missing: `get-scenario`, `duplicate-scenario`** |
| DB vs Part A `scenarios` | **Major semantic/column gaps** (name/title, capacity/demand, description, counts) |
| DB vs Part A `roadmap_items` | **Major gaps** (priority type, quarter, project_type, status enum, factor columns vs JSONB) |
| DB `settings` | **Different shape** than Part C — adapter or migration |
| Session isolation | **Implemented for scenarios** — **preserve** in new endpoints |

**Phase 1 is “complete” when you:** (1) resolve function gaps or explicitly defer with doc, (2) choose and apply schema/adapter strategy, (3) re-test session isolation, (4) update `PHASE1_GAP_ANALYSIS.md` checkboxes to match this doc.
