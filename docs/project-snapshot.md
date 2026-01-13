# Capacity Planning App – Working Snapshot

## Current Status

**What's Already Implemented:**

- ✅ **Single-scenario focus** – Each 'session' is a planning scenario for a specific quarter
- ✅ **UX/Content effort model per item** – Factor-based sizing (XS–XL) with focus-time weeks and work-week spans
- ✅ **Item Detail tabs** – PM Intake, Product Design, Content Design with factor-based sizing (1–5 scores)
- ✅ **Scenario home page** – "Planning Scenarios" table showing scenarios with planning period
- ✅ **New Scenario modal** – Single-select 2026-Q1..2026-Q4, fixed 2-week sprint assumption, UX/Content designer counts
- ✅ **localStorage persistence** – Sessions, items, and inputs persist across browser refreshes
- ✅ **Form simplifications** – Removed `created_by`, user-editable `weeks_per_period`, and `sprint_length_weeks` (now calculated/fixed)

---

## Implementation Status (Updated: January 13, 2026)

**Iteration 3:** ✅ Complete  
**Figma Implementation:** ✅ Complete (Steps 1-8)

### Completed Steps
- ✅ Step 1-2: Home page with scenario cards (empty and populated states)
- ✅ Step 3: Roadmap Items list with breadcrumb navigation
- ✅ Step 4: PM Intake tab with form improvements
- ✅ Step 5: Product Design tab with 3-factor button scoring
- ✅ Step 6: Content Design tab with 4-factor button scoring
- ✅ Step 7: Session Summary with capacity cards and full table
- ✅ Step 8: Quarterly Capacity with year overview

### Key Features Delivered
- Factor-based effort estimation (weighted scoring)
- Real-time calculation of size bands (XS-XL)
- Focus weeks vs work weeks distinction (0.75 ratio)
- Sprint estimate ranges
- Capacity vs demand analysis
- Multi-scenario planning support
- localStorage persistence
- Responsive design

**Next Phase:** Phase 2 Enhancements (see BACKLOG.md)

---

## Near-Term Roadmap (Iterations 3–5)

### Iteration 3: Core Functionality (Current)
**Goal:** Establish factor-based effort model and scenario management.

**Key Tasks:**
- ✅ Factor-based sizing (UX: productRisk, problemAmbiguity, platformComplexity, discoveryDepth)
- ✅ Factor-based sizing (Content: contentSurfaceArea, localizationScope, regulatoryBrandRisk, legalComplianceDependency)
- ✅ Focus-time vs. work-weeks distinction
- ✅ Planning scenarios with single-select quarters
- ✅ Item sizing with PM/PD/CD inputs
- ✅ Scenario summary with capacity analysis
- ✅ Form simplifications

### Iteration 4: Enhanced Views (Next)
**Goal:** Improve item detail UI and add quarterly capacity view.

**Key Tasks:**
- [ ] Quarterly capacity view (aggregate across scenarios)
- [ ] Item detail improvements (better factor score UI, sprint estimates)
- [ ] Scenario comparison view
- [ ] Export/import scenarios (JSON)

### Iteration 5: Advanced Features (Future)
**Goal:** Multi-quarter planning and team dependencies.

**Key Tasks:**
- [ ] Multi-quarter planning
- [ ] Team allocation and dependencies
- [ ] Historical data and trends
- [ ] Integration with project management tools

---

## Key Concepts

### Focus-Time Capacity vs. Work-Week Span

- **Focus weeks** = Dedicated designer time (e.g., "3 focus weeks")
- **Work weeks** = Calendar span (e.g., "6 work weeks" to complete 3 focus weeks)

**Why the distinction?** Designers rarely work 100% on one item. Work weeks account for context switching, dependencies, meetings, and parallel work streams.

**Example:** An item requiring 3 focus weeks might span 6 work weeks if the designer splits time across multiple items.

### UX and Content Factor Models

**UX Factors** (weighted scoring 1–5):
- Product Risk (1.2) – Higher weight due to review cycles
- Problem Ambiguity (1.0) – Base weight, correlates with discovery
- Platform Complexity (1.1) – Multi-platform increases iteration
- Discovery Depth (0.9) – Important but less tied to execution

**Content Factors** (weighted scoring 1–5):
- Content Surface Area (1.3) – Highest weight, volume drives effort
- Localization Scope (1.0) – Base weight, linear per language
- Regulatory & Brand Risk (1.2) – High-risk requires careful crafting
- Legal Compliance Dependency (1.1) – Legal review cycles add time

**Calculation:** Weighted average of factor scores → Size band (XS, S, M, L, XL) → Maps to focus weeks and work weeks.

### Scenarios as Saved What-If Plans

- Each scenario = A "what-if" capacity planning exercise for a specific quarter
- Scenarios are saved, persistent (localStorage), and can be compared
- Each scenario contains: planning period, designer counts, roadmap items with sizing
- Users typically work in one active roadmap at a time, but can create multiple scenarios to compare options

---

## Next Actions

**Immediate Next Steps (Priority Order):**

1. [ ] **Finalize scenario table capacity columns** – Ensure UX/Content focus/work capacity vs. demand calculations are accurate and display correctly
2. [ ] **Build simple per-scenario capacity math** – Verify capacity calculations (designers × weeks) match demand (sum of item focus weeks)
3. [ ] **Start quarterly view** – Aggregate capacity/demand across all scenarios for a given quarter
4. [ ] **Improve Item Detail factor score UI** – Better layout, grouping, and visual indicators for factor scores
5. [ ] **Add sprint estimates to Item Detail** – Display estimated sprints (focus weeks / 2) alongside focus/work weeks

---

## Useful Prompts

### Effort Model Types
```
"Extend the RoadmapItem interface in src/domain/types.ts to include: 
uxSizeBand: 'XS' | 'S' | 'M' | 'L' | 'XL', uxFocusWeeks: number, 
uxWorkWeeks: number, contentSizeBand: same union type, 
contentFocusWeeks: number, contentWorkWeeks: number. 
Ensure any initial/demo data and factory functions are updated so new items 
have sensible defaults."
```

### Effort Model Config
```
"Create a new file src/config/effortModel.ts that defines factor models for 
UX and Content. For UX, include factors: productRisk, problemAmbiguity, 
platformComplexity, discoveryDepth. For Content, include: contentSurfaceArea, 
localizationScope, regulatoryBrandRisk, legalComplianceDependency. 
Each factor should have: a score from 1–5 (per item), a weight (number), 
a label and short description for UI help text. Implement pure functions: 
calculateWeightedScore, mapScoreToSizeBand, mapSizeBandToTime, and export 
a helper calculateEffort(role, scores)."
```

### Item Detail Integration
```
"In the Product Design and Content Design sections of ItemDetailPage, 
integrate the new calculateEffort helper: For UX: when UX factors' scores 
change, compute UX effort and update item.uxSizeBand, item.uxFocusWeeks, 
and item.uxWorkWeeks. For Content: do the same for contentSizeBand, 
contentFocusWeeks, and contentWorkWeeks. Make factor scores editable via 
controlled inputs (dropdowns or radio groups from 1–5) and ensure their 
state is stored per item."
```

### Planning Scenarios Table
```
"Update the home/landing view so it is clearly a list of planning scenarios: 
Change the main heading from 'Planning Sessions' to 'Planning Scenarios'. 
Replace the current vertical list of sessions with a table. Each row represents 
a scenario, and columns should include: Scenario name (clickable link), 
Planning period, UX: focus-time capacity vs demand, Content: focus-time 
capacity vs demand, UX: work-week capacity vs demand, Content: work-week 
capacity vs demand, Status column that shows either 'Within capacity' or 
'Over capacity'."
```

### New Scenario Form
```
"In the 'Create New Scenario' modal: Remove the editable 'Sprint Length (weeks)' 
numeric input. The sprint length should no longer be user-configurable. 
Set it to a constant value of 2 internally. Under the Planning Period / work 
weeks text, add a small, read-only note: 'Assumes 2-week sprints (about 6 
sprints per quarter).'"
```

### Quarter Config
```
"Create a new file src/config/quarterConfig.ts that maps planning quarters 
to their corresponding number of weeks. Standard quarters are 13 weeks, but 
this can be adjusted per quarter if needed. Export a function getWeeksForPeriod(period) 
that returns the number of weeks for a given planning period."
```

---

*Last updated: Iteration 3 (factor-based effort model, scenario management, form simplifications)*
