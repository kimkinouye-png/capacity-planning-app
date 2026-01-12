# Changelog

All notable changes to the Capacity Planning App will be documented in this file.

## [Unreleased]

### Added
- Language count field to Content Design tab
- Sprint estimate ranges (e.g., "1-2 sprints") on Item Detail
- Factor weights displayed in UI (e.g., "Product Risk (×1.2)")
- Card-based layout for Planning Scenarios list (populated state)
- Scenario count display on home page
- Capacity breakdown cards with surplus/deficit indicators

### Changed
- Default factor scores now set to 3 (was undefined)
- Work week calculation: focus weeks ÷ 0.75 (was ÷ 2)
- Surfaces in Scope: flat checkbox list instead of hierarchical
- Left-aligned all form controls on design tabs
- Home page populated state: replaced table with card-based layout showing scenario cards with status badges, details, and capacity breakdown

### Removed
- Team Name field from roadmap item creation
- "Other" option from Surfaces in Scope
- "Goal" field from PM Intake tab UI (kept in data model)

## [1.3.0] - 2026-01-12

### Completed Iteration 3
- Factor-based sizing for UX and Content
- Focus-time vs work-week distinction
- Planning scenarios with quarterly periods
- Item Detail tabs with factor scoring
- localStorage persistence
- 2-week sprint standardization
