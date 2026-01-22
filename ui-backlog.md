# UI/UX Improvement Backlog

## Development Roadmap

### Global Settings & Effort Model (Phase 4) ✅ COMPLETE (2026-01-19)

#### Global Settings: Effort model weights (UX / Content / PM Intake) ✅
- [x] **Settings page for editing effort model weights**
  - Implemented: Settings page at `/settings` with form controls for:
    - UX factor weights (3 factors: Product Risk, Problem Ambiguity, Discovery Depth)
    - Content factor weights (4 factors: Content Surface Area, Localization Scope, Regulatory & Brand Risk, Legal Compliance Dependency)
    - PM Intake overall weight multiplier
  - Behavior: Updates settings row in Neon database; all scenarios use these global values; includes "Reset to defaults" button
  - Priority: [Must] ✅

#### Global Settings: Focus-time ratio ✅
- [x] **Configurable focus-time ratio**
  - Implemented: Settings page exposes "Focus-time Ratio" (0.0-1.0) with NumberInput control
  - Behavior: Recomputes workWeeks = focusWeeks ÷ ratio everywhere; default is 0.75
  - Priority: [Must] ✅

#### Global Settings: Size-band thresholds (XS–XL) ✅
- [x] **Configurable size-band thresholds**
  - Implemented: Settings page with NumberInput controls for XS, S, M, L, XL thresholds
  - Behavior: Global config used in Item Detail, Session Summary, and all effort calculations
  - Priority: [Must] ✅

### Capacity & Designer Count (Phase 5)

#### Global Settings: UX/Content FTE focus weeks per quarter
- [ ] **Settings for FTE focus weeks per quarter**
  - Desired: Settings controls defining how many focus-time weeks 1 FTE can give per quarter (UX and Content separately)
  - Priority: [Must]

#### Designer count calculation on Summary/Committed Plan
- [ ] **Calculate and display designer counts needed**
  - Desired: For each quarter, compute and display:
    - UX designers needed = total UX focus weeks ÷ UX FTE focus weeks per quarter
    - Content designers needed = total Content focus weeks ÷ Content FTE focus weeks per quarter
  - Priority: [Must]

### Bulk Item Entry (Phase 5)

#### Bulk add / import roadmap items via table paste
- [ ] **Table paste import functionality**
  - Desired: Modal where users paste rows from Sheets/Excel; app parses into a preview grid, maps columns, shows validation errors, and on confirm creates multiple items at once
  - Priority: [Should]

#### CSV bulk upload endpoint
- [ ] **CSV bulk upload via Netlify Function**
  - Desired: Netlify Function accepting a CSV file, parsing rows, validating, and inserting items for a scenario
  - Priority: [Nice]

### Persistence & Storage (Phase 4–5 foundation) ✅ PARTIALLY COMPLETE (2026-01-19)

#### Neon schema: settings, scenarios, roadmap_items, activity_log ✅
- [x] **Postgres database schema and migration**
  - Implemented: Complete PostgreSQL schema with all 4 tables
  - Tables: `settings`, `scenarios`, `roadmap_items`, `activity_log`
  - Features: UUID primary keys, JSONB columns, automatic timestamps, indexes, foreign keys
  - Migration: Settings migrated to database; scenarios/items still use localStorage (Phase 5)
  - Priority: [Must] ✅

#### Netlify Functions: basic API ✅ (Settings only)
- [x] **REST API endpoints via Netlify Functions**
  - Implemented:
    - ✅ GET /settings, PUT /settings (fully integrated)
    - ✅ GET /scenarios, POST /scenarios (created but not integrated with React)
    - [ ] PATCH /scenarios/:id (not yet created)
    - [ ] GET /scenarios/:id/items, POST /scenarios/:id/items (not yet created)
  - Priority: [Must] - Settings complete, scenarios/items pending Phase 5

### Exports & Integrations (Phase 6+)

#### Export committed plan to CSV/Excel
- [ ] **CSV/Excel export functionality**
  - Desired: From Committed Plan, export roadmap items and capacity numbers to CSV or .xlsx
  - Priority: [Should]

#### Export committed plan to PDF
- [ ] **PDF report generation**
  - Desired: Nicely formatted PDF report, generated client-side or via a Netlify Function
  - Priority: [Nice]

#### API integration foundation (Asana later)
- [ ] **REST API for external integrations**
  - Desired: Prepare REST endpoints exposing committed plan data; future Netlify Function to push items into Asana via their API
  - Priority: [Nice]

---

## UI Backlog Highlights

### Home / Scenarios
- [ ] **De-emphasize demo sessions; focus on scenarios as primary entry points**
  - Priority: [Should]

- [ ] **Add richer portfolio/compare-scenarios view**
  - Priority: [Nice]

### PM Intake
- [ ] **"Surfaces in Scope" as checkbox list; remove "Goal" section (keep Objectives/KPIs)**
  - Priority: [Must]

- [ ] **Align copy with focus-time/work-week concepts**
  - Priority: [Should]

### Product & Content Design tabs
- [ ] **Factor weights defined centrally in effortModel and surfaced in UI as read-only "Weight: X" next to each factor**
  - Priority: [Must]

- [ ] **Clean layout and grouping of factor inputs; show UX and Content size badges**
  - Priority: [Should]

### Item Detail / Summary
- [ ] **Compact summary showing UX and Content size + focus/work weeks in one block**
  - Priority: [Should]

- [ ] **Add startWeekInPeriod control for future timelines**
  - Priority: [Should]

- [ ] **Add small visual timelines or mini bars**
  - Priority: [Nice]

### Timeline / Gantt (future)
- [ ] **Single-scenario Gantt view using start week + work-week spans for UX and Content, with hover/click into Item Detail and later simple adjustments**
  - Priority: [Nice]

---

## Sessions List Page

### Layout
- [ ] **Overall page structure and spacing**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Sessions list presentation (list vs. cards vs. table)**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Single-roadmap focus: De-emphasize multi-session list visually**
  - Current: Multi-session list is primary focus
  - Desired: Smaller list styling, clearer primary CTA to open the current roadmap. Clarify that users typically work in one active roadmap at a time.
  - Priority: [Should]

- [ ] **Portfolio-style overview for multiple sessions**
  - Current: Simple list view
  - Desired: More advanced overview once single-roadmap flow is solid
  - Priority: [Nice]

- [ ] **Empty state design (no sessions)**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Responsive layout for mobile/tablet**
  - Current: 
  - Desired: 
  - Priority: [ ]

### Buttons & CTAs
- [ ] **"New planning session" button styling and placement**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **"Create demo session" button styling and placement**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Session list item interaction (hover states, click targets)**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Action buttons on session items (edit, delete, duplicate)**
  - Current: 
  - Desired: 
  - Priority: [ ]

### Copy & Text
- [ ] **Page heading and description**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Button labels and tooltips**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Session list item information display (metadata, dates, status)**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Empty state messaging**
  - Current: 
  - Desired: 
  - Priority: [ ]

### Visual Styling
- [ ] **Color scheme and branding**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Typography hierarchy (headings, body text)**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Card/list item visual design (borders, shadows, backgrounds)**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Icon usage and styling**
  - Current: 
  - Desired: 
  - Priority: [ ]

---

## Item Detail Page

### Layout
- [ ] **Overall page structure and spacing**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Breadcrumb navigation placement and styling**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Item header (key, name) presentation**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Tab layout and navigation**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Form sections organization (PM Intake, Product Design, Content Design)**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Size estimates section placement and layout**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Responsive layout for mobile/tablet**
  - Current: 
  - Desired: 
  - Priority: [ ]

### Buttons & CTAs
- [ ] **"Back to session" and "Back to items" link styling**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Form submit/save button (if added)**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Tab navigation interaction (active states, hover)**
  - Current: 
  - Desired: 
  - Priority: [ ]

### Copy & Text

#### PM Intake Tab
- [ ] **Tab label and helper text**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Form field labels and descriptions**
  - Current: 
  - Desired: Review copy for PM Intake labels and descriptions to align with focus-time/work-week conceptual model (clarifying this is about planning effort, not just documenting features)
  - Priority: [Should]

- [ ] **Input placeholders and helper text**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Surfaces in Scope: Convert to checkbox list**
  - Current: Free-text input field
  - Desired: List of checkboxes for common surfaces (checkout, account, emails, notifications, mobile app, web app), storing selections as an array
  - Priority: [Must]

- [ ] **Remove or hide 'Goal' section**
  - Current: 'Goal' field is visible
  - Desired: Remove or hide for now so PMs primarily use 'Objectives and KPIs'. Keep underlying data type available for future use.
  - Priority: [Must]

#### Product Design Tab
- [ ] **Tab label and helper text**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Checkbox labels and descriptions**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **"Other" field label and placeholder**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Make UX factor weights configurable**
  - Current: Factor weights are hardcoded
  - Desired: Configurable via central effortModel config file, with clear labels and comments explaining each factor and its default weight
  - Priority: [Must]

- [ ] **Improve UX factor inputs layout**
  - Current: Factor inputs (1-5 scores) are in a simple list
  - Desired: Grouped sections, consistent control type, helper text under each factor for easier scanning and editing
  - Priority: [Should]

- [ ] **Visual indicator for calculated UX size band**
  - Current: Size band shown in summary box below form
  - Desired: Add small visual indicators (e.g., pill or badge) for calculated UX size band (XS–XL) next to the factor section
  - Priority: [Nice]

#### Content Design Tab
- [ ] **Tab label and helper text**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Select dropdown labels and options**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Checkbox labels and descriptions**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Mirror UX factor model structure for Content**
  - Current: Content factors may not be fully structured
  - Desired: Clearly defined factors and weights in the same config file as UX factors
  - Priority: [Must]

- [ ] **Align layout with Product Design tab**
  - Current: Content Design tab may have different layout/interaction patterns
  - Desired: Consistent experience between UX and Content designers
  - Priority: [Should]

- [ ] **Add explanation of content size band mapping**
  - Current: Size bands are shown but mapping may not be clear
  - Desired: Concise explanation of how content size bands map to focus-time weeks and work-week spans
  - Priority: [Nice]

#### Size Estimates Section
- [ ] **Section heading and description**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Estimate labels (T-shirt size, sprints, designer-weeks)**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Empty state messaging (when estimates aren't available)**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Compact summary block on Item Detail page**
  - Current: Size estimates shown in separate cards below tabs
  - Desired: Add compact summary block showing UX size + weeks and Content size + weeks in plain language (e.g., 'UX: L · ~1.5 focus weeks over 4 work weeks')
  - Priority: [Should]

- [ ] **Visual representation for focus-time vs work-weeks**
  - Current: Text-based display
  - Desired: Explore more visual representation (e.g., mini bars or timeline chips) for focus-time vs work-weeks once base copy is validated
  - Priority: [Nice]

### Visual Styling
- [ ] **Color scheme and branding**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Typography hierarchy**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Form field styling (inputs, textareas, checkboxes, selects)**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Tab styling (active, inactive, hover states)**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Size estimate cards styling**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Badge styling for T-shirt sizes**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Visual feedback for form field changes (dirty state indicators)**
  - Current: 
  - Desired: 
  - Priority: [ ]

---

## Session Summary Page

### Layout
- [ ] **Overall page structure and spacing**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Alert banner placement and styling**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Summary cards layout (UX/Content weeks, capacity, surplus/deficit)**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Roadmap items table layout**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Cut line visual separation**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Empty state design (no items)**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Responsive layout for mobile/tablet**
  - Current: 
  - Desired: 
  - Priority: [ ]

### Buttons & CTAs
- [ ] **"View items" button styling and placement**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **"Recalculate" button styling and placement**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Table row actions (link to item detail)**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Action buttons in summary cards (if any)**
  - Current: 
  - Desired: 
  - Priority: [ ]

### Copy & Text
- [ ] **Page heading and description**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Alert banner text ("Design Capacity Summary")**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Summary card labels and values**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Table column headers**
  - Current: 
  - Desired: Clarify column headings and grouping so PM/UX/Content stakeholders can quickly see which numbers belong to which role
  - Priority: [Should]

- [ ] **Tooltip text for "T-shirt size", "designer-weeks", "cut line"**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Display UX and Content size bands, focus-time weeks, and work-week spans**
  - Current: Table shows size bands and focus/work weeks
  - Desired: Ensure each item row displays UX and Content size bands, focus-time weeks, and work-week spans pulled from the new effort model, even if presentation is simple at first
  - Priority: [Must]

- [ ] **Advanced visualizations for capacity planning**
  - Current: Simple table view
  - Desired: Consider more advanced visualizations (stacked bars, utilization heatmap) after core quarter-capacity view is implemented
  - Priority: [Nice]

- [ ] **Empty state messaging**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Status indicators (above/below cut line)**
  - Current: 
  - Desired: 
  - Priority: [ ]

### Visual Styling
- [ ] **Color scheme and branding**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Typography hierarchy**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Summary cards styling (borders, shadows, backgrounds, hover states)**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Table styling (borders, striping, row hover states)**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Cut line visual treatment (divider, background color change, etc.)**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Badge styling for T-shirt sizes and status indicators**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Color coding for surplus/deficit (positive vs. negative values)**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Icon usage and styling**
  - Current: 
  - Desired: 
  - Priority: [ ]

---

## Global/Cross-Page

### Layout
- [ ] **Navigation bar design and placement**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Page container width and max-width**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Consistent spacing system across pages**
  - Current: 
  - Desired: 
  - Priority: [ ]

### Buttons & CTAs
- [ ] **Consistent button styling across pages**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Modal/dialog styling and interactions**
  - Current: 
  - Desired: 
  - Priority: [ ]

### Copy & Text
- [ ] **Error message styling and placement**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Loading states and messaging**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Success/confirmation messaging**
  - Current: 
  - Desired: 
  - Priority: [ ]

### Visual Styling
- [ ] **Overall color palette and theme**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Typography system (font family, sizes, weights)**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Consistent spacing scale**
  - Current: 
  - Desired: 
  - Priority: [ ]

- [ ] **Icon system and consistency**
  - Current: 
  - Desired: 
  - Priority: [ ]

---

## Priority Legend

- **[Must]** = Critical for usability or functionality
- **[Should]** = Important for better user experience
- **[Nice]** = Enhancement that would be nice to have
