# Capacity Planning App – Project Notes

## Overview

A React + TypeScript web application for planning design capacity across UX and Content Design teams. The app helps product managers and designers estimate effort, track capacity vs. demand, and make informed decisions about what can be delivered within a planning period (quarter).

**Core Value Proposition:**
- Factor-based effort estimation (replacing gut-feel sizing)
- Clear distinction between focus-time (dedicated designer weeks) and work-weeks (calendar span)
- Visual capacity planning with cut-line analysis
- Persistent storage via localStorage for offline-first workflow

**Tech Stack:**
- Vite + React + TypeScript
- Chakra UI for components
- React Router for navigation
- React Context API for state management
- localStorage for persistence

---

## Architecture & Data Model Decisions

### Effort Model (Factor-Based Sizing)

**Decision:** Replace legacy checkbox-based sizing with a weighted factor model.

**Implementation:**
- **UX Factors** (in `src/config/effortModel.ts`):
  - Product Risk (weight: 1.2) – Higher weight due to review cycles and documentation needs
  - Problem Ambiguity (weight: 1.0) – Base weight, correlates with discovery needs
  - Platform Complexity (weight: 1.1) – Multi-platform increases iteration work
  - Discovery Depth (weight: 0.9) – Important but less directly tied to execution effort

- **Content Factors:**
  - Content Surface Area (weight: 1.3) – Highest weight, volume directly drives effort
  - Localization Scope (weight: 1.0) – Base weight, linear multiplication per language
  - Regulatory & Brand Risk (weight: 1.2) – High-risk content requires careful crafting
  - Legal Compliance Dependency (weight: 1.1) – Legal review cycles add time

**Scoring:** Each factor scored 1–5 per item, weighted average calculated, mapped to size bands (XS, S, M, L, XL).

**Time Mapping:** Each size band maps to:
- Focus weeks (dedicated designer time)
- Work weeks (calendar span, accounts for context switching and dependencies)

### Focus-Time vs. Work-Weeks

**Key Distinction:**
- **Focus weeks** = dedicated designer time (e.g., "3 focus weeks")
- **Work weeks** = calendar span (e.g., "6 work weeks" to complete 3 focus weeks)

**Rationale:** Designers rarely work 100% on one item. Work weeks account for:
- Context switching between items
- Dependencies and waiting time
- Meetings and overhead
- Parallel work streams

**Example:** An item requiring 3 focus weeks might span 6 work weeks if the designer is splitting time across multiple items.

### Planning Scenarios vs. Sessions

**Terminology Change:** "Planning Sessions" → "Planning Scenarios"

**Rationale:** Better reflects that each scenario represents a "what-if" capacity planning exercise for a specific quarter, not a one-time meeting.

**Data Model:**
- Each scenario has:
  - Name (e.g., "Payments Q2 2026")
  - Planning Period (single quarter: `2026-Q1` | `2026-Q2` | `2026-Q3` | `2026-Q4`)
  - Weeks per period (calculated from quarter, default 13 weeks)
  - Sprint length (fixed at 2 weeks, not user-configurable)
  - UX designers count
  - Content designers count

### Planning Periods

**Decision:** Single-select quarter (not multi-select).

**Implementation:**
- Type: `'2026-Q1' | '2026-Q2' | '2026-Q3' | '2026-Q4'`
- Weeks per period calculated via `getWeeksForPeriod()` (default: 13 weeks)
- Configurable per quarter in `src/config/quarterConfig.ts` if needed

### Sprint Assumptions

**Decision:** Fixed 2-week sprints, not user-configurable.

**Rationale:** Simplifies the model and aligns with common agile practices. Assumes ~6 sprints per quarter (13 weeks / 2 weeks).

**Implementation:**
- Constant: `SPRINT_LENGTH_WEEKS = 2` in `src/config/sprints.ts`
- Helper: `estimateSprints(focusWeeks)` for converting focus weeks to sprint estimates
- UI note: "Assumes 2-week sprints (about 6 sprints per quarter)"

### State Management

**Context-Based Architecture:**
- `PlanningSessionsContext` – Manages planning scenarios
- `RoadmapItemsContext` – Manages roadmap items (keyed by `planning_session_id`)
- `ItemInputsContext` – Manages PM/PD/CD inputs (keyed by `itemId`)

**Persistence:**
- All contexts use localStorage:
  - `designCapacity.sessions`
  - `designCapacity.items`
  - `designCapacity.itemInputs`
- Browser-only guards: `typeof window !== 'undefined'`
- Error handling: Graceful fallback to empty arrays/objects on parse failure

### Form Simplifications

**Removed Fields:**
- `created_by` – Not used elsewhere, removed from UI (kept optional in type for backwards compatibility)
- `weeks_per_period` – Calculated from planning period, not user-editable
- `sprint_length_weeks` – Fixed constant, not user-configurable

**Result:** Form now collects only: Name, Planning Period, UX Designers, Content Designers.

---

## Key Use Cases

### 1. Create a Planning Scenario
- User clicks "New scenario" → Modal opens
- Enters scenario name, selects planning period (quarter)
- Sets UX and Content designer counts
- System calculates weeks per period and sets sprint length to 2
- Scenario created and persisted to localStorage

### 2. Add Roadmap Items
- Navigate to scenario → Items list page
- Click "New roadmap item"
- Enter: key, name, initiative, team, priority
- Item created with default size bands (M) and zero focus/work weeks

### 3. Size a Roadmap Item
- Navigate to item detail page
- Fill PM Intake tab (surfaces in scope, requirements, etc.)
- Fill Product Design tab:
  - Checkboxes for complexity factors (IA changes, new patterns, etc.)
  - Factor scores (1–5) for: Product Risk, Problem Ambiguity, Platform Complexity, Discovery Depth
- Fill Content Design tab:
  - Checkboxes for content requirements
  - Factor scores (1–5) for: Content Surface Area, Localization Scope, Regulatory Risk, Legal Dependency
- System calculates:
  - UX size band, focus weeks, work weeks
  - Content size band, focus weeks, work weeks
- Updates displayed in real-time below each tab

### 4. View Scenario Summary
- Navigate to scenario summary page
- See capacity vs. demand:
  - Total UX focus weeks vs. capacity
  - Total Content focus weeks vs. capacity
  - Surplus/deficit and headcount needed
- See items table with:
  - Size bands (UX and Content)
  - Focus/work weeks
  - Cut-line status (above/below capacity)
- Items below cut line visually separated (red background)

### 5. Planning Scenarios Overview
- Home page shows table of all scenarios
- Columns: Name, Planning Period, Capacity vs. Demand (UX/Content, Focus/Work), Status
- Click scenario name to navigate to summary
- "Create demo session" button seeds sample data for exploration

---

## Roadmap (Iterations 3–5)

### Iteration 3: Core Functionality (Current)
- ✅ Factor-based effort model
- ✅ Focus-time vs. work-weeks distinction
- ✅ Planning scenarios with quarters
- ✅ Item sizing with PM/PD/CD inputs
- ✅ Scenario summary with capacity analysis
- ✅ localStorage persistence
- ✅ Form simplifications (removed unused fields)

### Iteration 4: Enhanced Views (Planned)
- [ ] Quarterly capacity view (aggregate across scenarios)
- [ ] Item detail improvements (better factor score UI, sprint estimates)
- [ ] Scenario comparison view
- [ ] Export/import scenarios (JSON)

### Iteration 5: Advanced Features (Future)
- [ ] Multi-quarter planning
- [ ] Team allocation and dependencies
- [ ] Historical data and trends
- [ ] Integration with project management tools

---

## Key Cursor Prompts

### Effort Model & Factor-Based Sizing

**Prompt:** "Create a new file `src/config/effortModel.ts` that defines factor models for UX and Content. For UX, include factors: productRisk, problemAmbiguity, platformComplexity, discoveryDepth. For Content, include: contentSurfaceArea, localizationScope, regulatoryBrandRisk, legalComplianceDependency. Each factor should have: a score from 1–5 (per item), a weight (number), a label and short description for UI help text. Implement pure functions: calculateWeightedScore, mapScoreToSizeBand, mapSizeBandToTime, and export a helper calculateEffort(role, scores) that returns { sizeBand, focusWeeks, workWeeks, weightedScore }."

**Purpose:** Establish the factor-based effort estimation model with weighted scoring.

---

**Prompt:** "In the Product Design and Content Design sections of ItemDetailPage, integrate the new calculateEffort helper: For UX: when UX factors' scores change, compute UX effort and update item.uxSizeBand, item.uxFocusWeeks, and item.uxWorkWeeks. For Content: do the same for contentSizeBand, contentFocusWeeks, and contentWorkWeeks. Make factor scores editable via controlled inputs (dropdowns or radio groups from 1–5) and ensure their state is stored per item. In the UI for each tab, display: the calculated size band, the focus-time weeks and work-week span."

**Purpose:** Wire factor scores into item sizing calculations and display results.

---

### Scenario Home View

**Prompt:** "Update the home/landing view so it is clearly a list of planning scenarios rather than generic sessions: Change the main heading from 'Planning Sessions' to 'Planning Scenarios'. Rename the primary CTA button text from 'New planning session' to 'New scenario'. Replace the current vertical list of sessions with a table. Each row represents a scenario, and columns should include: Scenario name (clickable link), Planning period, UX: focus-time capacity vs demand, Content: focus-time capacity vs demand, UX: work-week capacity vs demand, Content: work-week capacity vs demand, Status column that shows either 'Within capacity' in green text or 'Over capacity' in red text."

**Purpose:** Transform home page into a scenarios overview table with capacity metrics.

---

### New Scenario Form

**Prompt:** "In the new scenario (planning session) creation form and any related types: Remove the 'Created by' field from the UI and from the session type if it is not used anywhere else. Remove the 'Weeks per Period' input/control from the UI. This value should no longer be user-editable. Wherever 'Weeks per Period' was previously displayed, replace it (if needed) with a read-only value derived from the selected planningPeriod using the config that maps quarters to work weeks. Confirm that validation, default values, and submit handlers no longer reference createdBy or a user-entered weeksPerPeriod."

**Purpose:** Simplify form by removing unused fields and making weeks per period calculated.

---

**Prompt:** "In the 'Create New Scenario' modal: Remove the editable 'Sprint Length (weeks)' numeric input. The sprint length should no longer be user-configurable. If the session type or calculations currently store/use a sprintLengthWeeks field, set it to a constant value of 2 internally and do not expose it in the form. Under the Planning Period / work weeks text, add a small, read-only note such as: 'Assumes 2-week sprints (about 6 sprints per quarter).'"

**Purpose:** Fix sprint length at 2 weeks and add informational note.

---

### Timing & Timeline

**Prompt:** "When creating a new scenario (new planning session), update the form so that: The 'Planning period' field becomes a multi-choice selection where the user can choose one or more quarters from {Q1, Q2, Q3, Q4} for the year 2026. Store this as a data structure on the session, for example planningPeriods: ('2026-Q1' | '2026-Q2' | '2026-Q3' | '2026-Q4')[]. Ensure the selected planning period(s) are shown in the home 'Planning Scenarios' table and wherever else the session is summarized."

**Note:** Later refined to single-select quarter (not multi-select) for simplicity.

---

**Prompt:** "Create a new file at docs/project-notes.md that will hold consolidated notes from the Capacity Planning App thread. Add sections: 'Overview', 'Architecture & Data Model Decisions', 'Key Use Cases', 'Roadmap (Iterations 3–5)', 'Key Cursor Prompts', and 'UI Backlog Summary'. Under each section, summarize the decisions and examples from our recent work in clear bullet points and short paragraphs."

**Purpose:** Document project decisions and patterns for future reference.

---

## UI Backlog Summary

### High Priority ([Must])

**PM Intake Tab:**
- Change 'Surfaces in Scope' from free-text to checkbox list (Mobile: iOS, Android, Mobile Web; Web; Other)
- Remove or hide 'Goal' section (keep data property for backwards compatibility)

**Product Design Tab:**
- Make UX factor weights configurable via central effortModel config file
- Improve layout of UX factor inputs (1–5 scores) for easier scanning

**Content Design Tab:**
- Mirror UX factor model structure for Content with clearly defined factors and weights

**Session Summary Page:**
- Ensure each item row displays UX and Content size bands, focus-time weeks, and work-week spans from effort model

### Medium Priority ([Should])

**Planning Scenarios (Home):**
- De-emphasize multi-session list visually (smaller styling, clearer primary CTA)
- Clarify that users typically work in one active roadmap at a time

**Item Detail:**
- Add compact summary block showing UX size + weeks and Content size + weeks in plain language
- Review copy for PM Intake labels to align with focus-time/work-week model

**Session Summary:**
- Clarify column headings and grouping so stakeholders can quickly see which numbers belong to which role

### Low Priority ([Nice])

**Planning Scenarios:**
- Portfolio-style overview for multiple sessions (once single-roadmap flow is solid)

**Item Detail:**
- Add visual indicators (pill or badge) for calculated UX size band next to factor section
- Explore visual representation (mini bars or timeline chips) for focus-time vs work-weeks

**Session Summary:**
- Consider advanced visualizations (stacked bars, utilization heatmap) after core quarter-capacity view is implemented

---

## Technical Notes

### File Structure
```
src/
  config/
    effortModel.ts      # Factor models and effort calculation
    quarterConfig.ts    # Quarter to weeks mapping
    sprints.ts          # Sprint constants and helpers
  context/
    PlanningSessionsContext.tsx
    RoadmapItemsContext.tsx
    ItemInputsContext.tsx
  domain/
    types.ts            # Core TypeScript interfaces
  estimation/
    logic.ts            # Legacy sizing logic (sizeUx, sizeContent, summarizeSession)
  pages/
    SessionsListPage.tsx      # Home / scenarios overview
    SessionSummaryPage.tsx    # Scenario capacity summary
    SessionItemsPage.tsx       # Items list for a scenario
    ItemDetailPage.tsx         # Item sizing forms
```

### Key Constants
- `SPRINT_LENGTH_WEEKS = 2` (fixed, not configurable)
- Standard quarter = 13 weeks (configurable per quarter)
- Default size band = 'M' for new items
- Default factor scores = 3 (medium) if not provided

### Data Flow
1. User creates scenario → `PlanningSessionsContext.createSession()`
2. User adds item → `RoadmapItemsContext.createItem()`
3. User fills PM/PD/CD inputs → `ItemInputsContext.setInputsForItem()`
4. Factor scores change → `calculateEffort()` → Updates item size bands and weeks
5. Summary view → `summarizeSession()` → Calculates capacity vs. demand

### Persistence Strategy
- All data stored in localStorage (browser-only)
- Keys: `designCapacity.sessions`, `designCapacity.items`, `designCapacity.itemInputs`
- Load on context initialization, save on every state change (via `useEffect`)
- No backend required (offline-first)

---

*Last updated: Based on work through Iteration 3 (factor-based effort model, scenario management, form simplifications)*
