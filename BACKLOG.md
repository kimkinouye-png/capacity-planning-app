# Capacity Planning App - Development Backlog

Last Updated: 2026-01-13

## In Progress
(Items currently being worked on)

## Phase 2: Post-Figma Implementation (Priority Next)

### Quick Wins - High Value, Low Effort
- [ ] Make header sticky (fixed position across all pages)
- [ ] Add visual distinction between committed/uncommitted scenarios (color, icon)
- [ ] Add edit icon on hover for scenario names
- [ ] Improve empty state messaging across pages

### New Homepage / Landing Page
- [ ] Create welcome page at / with:
  - [ ] Purpose statement
  - [ ] Feature overview (3 main features)
  - [ ] 3 CTA buttons: "Plan Roadmap Scenarios", "Review Capacity vs Demand", "Review Committed Plan"
  - [ ] Add icons for each CTA
- [ ] Move Scenarios List to /scenarios route
- [ ] Update all navigation links

### Header Navigation Updates
- [ ] Make header sticky (fixed position across all pages)
- [ ] Rename "Quarterly Capacity" → "Committed Plan"
- [ ] Add "Home" link (→ landing page)
- [ ] Add "Scenario List" link (→ /scenarios)
- [ ] Ensure header consistency across all pages

### Scenario Management Enhancements
- [ ] Add `committed: boolean` field to scenario data model
- [ ] Update localStorage read/write for new field
- [ ] Default new scenarios to committed: false
- [ ] Migrate existing scenarios (set committed: false)

### Scenario Name Editing
- [ ] Make scenario name editable on Scenarios List (inline edit)
- [ ] Make scenario name editable on Scenario Summary page (click heading to edit)
- [ ] Save on blur or Enter, cancel on Escape
- [ ] Update localStorage on save
- [ ] Add edit icon on hover

### Scenario Commit/Uncommit System
- [ ] Add commit toggle/checkbox to each scenario card
- [ ] Display "Committed" badge on committed scenarios
- [ ] Display "Not Committed" indicator on uncommitted
- [ ] Update scenario committed state on toggle
- [ ] Persist state to localStorage
- [ ] Add visual distinction (color, icon) between committed/uncommitted

### Scenario Deletion
- [ ] Add delete/trash icon to each scenario card on Scenarios List
- [ ] Implement deletion rules:
  - [ ] IF committed: Show error "Cannot delete committed scenarios. Uncommit first."
  - [ ] IF not committed: Show confirmation "Delete [Name]? This cannot be undone."
- [ ] Remove from localStorage on confirm
- [ ] Add success notification after deletion
- [ ] Handle edge cases (last scenario, active scenario)

### Committed Plan View (formerly Quarterly Capacity)
- [ ] Rename page from "Quarterly Capacity" to "Committed Plan"
- [ ] Filter to show ONLY scenarios where committed === true
- [ ] Add indicator: "Viewing X of Y scenarios (committed only)"
- [ ] Update capacity/demand calculations to use committed scenarios only
- [ ] Add empty state: "No committed scenarios yet. Go to Scenario List to commit scenarios."
- [ ] Add link: "View all scenarios" → goes to /scenarios

### UI/UX Improvements from Existing Backlog
- [ ] **Factor score UI improvements**: Better grouping and helper text for factor inputs
- [ ] **Sprint estimate ranges**: Display sprint estimates (e.g., "1-2 sprints") on Item Detail
- [ ] **Start week control**: Add startWeekInPeriod control for future timelines
- [ ] **Visual timelines**: Add small visual timelines or mini bars for focus-time vs work-weeks
- [ ] **Compact summary block**: Show UX and Content size + focus/work weeks in one block on Item Detail
- [ ] **Table column clarity**: Clarify column headings and grouping on Session Summary table
- [ ] **Copy alignment**: Review PM Intake labels to align with focus-time/work-week concepts
- [ ] **Responsive design**: Test and improve mobile/tablet layouts across all pages

## Phase 3: Advanced Features (Future)

### Iteration 4: Enhanced Views
- [ ] Item detail improvements (better factor score UI, sprint estimates)
- [ ] Scenario comparison view
- [ ] Export/import scenarios (JSON)
- [ ] Portfolio-style overview for multiple scenarios

### Iteration 5: Multi-Quarter Planning
- [ ] Multi-quarter planning
- [ ] Team allocation and dependencies
- [ ] Historical data and trends
- [ ] Integration with project management tools

### Cut Line Feature
- [ ] Automatic cut line calculation on Session Summary
- [ ] Visual separation showing items within capacity vs overflow
- [ ] Algorithm: Items above cut line = cumulative effort ≤ available capacity
- [ ] Tooltip explaining cut line concept

### Timeline / Gantt View (Future)
- [ ] Single-scenario Gantt view using start week + work-week spans for UX and Content
- [ ] Hover/click into Item Detail from timeline
- [ ] Simple adjustments via drag-and-drop on timeline

### Advanced Visualizations
- [ ] Stacked bars for capacity utilization
- [ ] Utilization heatmap
- [ ] Historical trends visualization

## Completed
- [x] Iteration 3: Core functionality (factor-based sizing, scenarios, persistence)
- [x] Home page routing fix (scenarios list)
- [x] Breadcrumb implementation on Item Detail and Roadmap Items pages
- [x] Navigation structure cleanup (removed unnecessary links)
- [x] Made Session Summary table rows clickable
- [x] Added "Back to roadmap" button to all tabs (PM Intake, Product Design, Content Design)
- [x] Factor weights exposed in UI (e.g., "Product Risk (×1.2)")
- [x] Default factor scores set to 3 for new items
- [x] Work week calculation: focus weeks ÷ 0.75
- [x] Surfaces in Scope: flat checkbox list (Mobile iOS, Mobile Android, Mobile Web, Web)
- [x] Removed Team Name field from roadmap items
- [x] Removed "Other" option from Surfaces in Scope
- [x] Hidden "Goal" field from PM Intake tab UI (kept in data model)
- [x] Left-aligned all form controls on Product Design and Content Design tabs
- [x] Card-based layout for Planning Scenarios list (populated state)
- [x] Empty state design for home page with calendar icon
- [x] PM Intake tab complete redesign (light gray textareas, proper spacing, checkboxes)
- [x] Pill-style tabs with blue outline for active state
- [x] "Desired Launch Date" field with date picker
- [x] "Changes are saved automatically" footer on all tabs
- [x] Global header with proper navigation structure

## Known Issues / Tech Debt
- [ ] **Date input formatting**: HTML5 date input displays in browser locale format, may need custom formatting for MM/DD/YYYY display
- [ ] **Cut line calculation**: Currently manual, needs automatic calculation algorithm
- [ ] **Error handling**: Add error boundaries for better error handling
- [ ] **Loading states**: Add loading indicators for data operations
- [ ] **Data migration**: Need migration path for existing localStorage data when adding new fields (e.g., `committed`)
- [ ] **Performance**: Consider memoization for large scenario/item lists
- [ ] **Accessibility**: Review and improve ARIA labels, keyboard navigation
- [ ] **Browser compatibility**: Test across different browsers (especially date input)

## Design Decisions Log
Reference: See `docs/project-notes.md` and `docs/project-snapshot.md` for detailed design decisions

### Key Decisions
- **Factor-based sizing**: Replaced checkbox-based sizing with weighted factor model
- **Focus-time vs work-weeks**: Clear distinction between dedicated time and calendar span
- **Planning Scenarios**: Terminology changed from "Sessions" to better reflect "what-if" planning
- **Fixed sprint length**: 2-week sprints, not user-configurable
- **Single-quarter focus**: One planning period per scenario
- **localStorage persistence**: Offline-first approach with browser storage

### Data Model
- Scenarios stored with: name, planningPeriod, weeks_per_period, sprint_length_weeks, ux_designers, content_designers
- Items stored with: short_key, name, initiative, priority, status, uxSizeBand, uxFocusWeeks, uxWorkWeeks, contentSizeBand, contentFocusWeeks, contentWorkWeeks
- Inputs stored separately: PM Intake, Product Design, Content Design inputs per item
