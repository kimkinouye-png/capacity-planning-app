# Capacity Planning App - Development Backlog

Last Updated: 2026-01-13

## In Progress
(Items currently being worked on)

## Phase 2: Post-Figma Implementation ✅ COMPLETE (2026-01-13)

### Quick Wins - High Value, Low Effort
- [x] Add visual distinction between committed/uncommitted scenarios (color, icon)
- [x] Add edit icon on hover for scenario names
- [x] Improve empty state messaging across pages

### New Homepage / Landing Page ✅
- [x] Create welcome page at / with:
  - [x] Purpose statement
  - [x] Feature overview (3 main features)
  - [x] "Open last scenario" button
  - [x] Recent scenarios list (3-5 most recent)
  - [x] Recent activity log (last 10 events)
- [x] Move Scenarios List to /scenarios route
- [x] Update all navigation links

### Header Navigation Updates ✅
- [x] Rename "Quarterly Capacity" → "Committed Plan"
- [x] Add "Home" link (→ landing page)
- [x] Add "Scenarios" link (→ /scenarios)
- [x] Add "Committed Plan" link
- [x] Add "Guide" link
- [x] Ensure header consistency across all pages
- [x] "Capacity Planning" title links to Home

### Scenario Management Enhancements ✅
- [x] Add `status: 'draft' | 'committed'` field to scenario data model
- [x] Add `isCommitted: boolean` field (mirrors status)
- [x] Update localStorage read/write for new fields
- [x] Default new scenarios to status: 'draft'
- [x] Migrate existing scenarios (set status: 'draft', isCommitted: false)

### Scenario Name Editing ✅
- [x] Make scenario name editable on Scenarios List (inline edit)
- [x] Make scenario name editable on Scenario Summary page (click heading to edit)
- [x] Save on blur or Enter, cancel on Escape
- [x] Update localStorage on save
- [x] Add edit icon on hover
- [x] Log activity when scenario is renamed

### Scenario Commit/Uncommit System ✅
- [x] Add radio-style commit control to each scenario card
- [x] Display "Committed plan" badge on committed scenarios
- [x] Display "Commit as plan" option on draft scenarios
- [x] Update scenario committed state on toggle
- [x] Ensure only one scenario per quarter can be committed
- [x] Persist state to localStorage
- [x] Add visual distinction (light background color) for committed scenarios
- [x] Prevent committing scenarios with no roadmap items

### Scenario Deletion ✅
- [x] Add delete/trash icon to each scenario card on Scenarios List
- [x] Implement deletion rules:
  - [x] Only allow deletion of scenarios with no roadmap items
  - [x] Show confirmation "Delete [Name]? This scenario has no roadmap items and will be permanently removed."
- [x] Remove from localStorage on confirm
- [x] Add success notification after deletion
- [x] Log activity when scenario is deleted

### Activity Logging ✅
- [x] Create ActivityContext for global activity tracking
- [x] Log scenario creation events
- [x] Log scenario renaming events
- [x] Log scenario commit/uncommit events
- [x] Log scenario deletion events
- [x] Log roadmap item updates
- [x] Log effort updates
- [x] Display recent activity on homepage (last 10 events)
- [x] Cap activity log at 10 most recent events

### Visual Cleanup ✅
- [x] Remove green shading from capacity cards (use neutral gray)
- [x] Clean up roadmap table styling (remove colored column backgrounds)
- [x] Use neutral gray headers and borders
- [x] Keep green text for surplus indicators only

### Routing Fixes ✅
- [x] New scenarios route to Scenario Summary instead of old Roadmap Items page
- [x] New roadmap items keep users on Scenario Summary instead of routing away
- [x] PM Intake/Product Design/Content Design tab links updated to go to Scenario Summary
- [x] Breadcrumb improvements: Removed "New Scenario Here" link
- [x] Breadcrumbs now show proper hierarchy ending at Scenario Summary

### Sorting Improvements ✅
- [x] Scenarios sort by: committed first, then by quarter, then alphabetically by title
- [x] Apply sorting to homepage recent scenarios
- [x] Apply sorting to scenarios list page
- [x] Apply sorting to quarterly capacity page

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

### Quick Wins - High Value, Low Effort
- [ ] Make header sticky (fixed position across all pages)
- [ ] Improve empty state messaging across pages

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
