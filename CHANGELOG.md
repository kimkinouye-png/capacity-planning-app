# Changelog

All notable changes to the Capacity Planning App will be documented in this file.

## [Unreleased]

### Added (Steps 5-8)
- Product Design tab with button-based factor scoring (3 UX factors with weights)
- Content Design tab with button-based factor scoring (4 Content factors with weights)
- Real-time effort calculations on both design tabs
- UX and Content Effort Estimate cards with size badges
- Session Summary page with capacity overview cards
- Full roadmap items table with UX/Content effort columns
- Save and Remove action buttons on Session Summary table
- Quarterly Capacity page with year-at-a-glance overview
- Scenarios grouped by quarter with individual capacity cards
- Sprint estimate range formatting (e.g., "1-2 sprints", "0-1 sprints")

### Changed (Steps 5-8)
- Size badges now display as plain text (no circular background)
- Priority badges remain as yellow rectangular pills
- Capacity cards now stack responsively on narrow screens
- Removed Platform Complexity factor from UX calculations
- Work weeks calculation formula: focus weeks ÷ 0.75
- Size band thresholds corrected: XS(<1.6), S(<2.6), M(<3.6), L(<4.6), XL(≥4.6)
- "+ Add another feature" now creates items directly (no intermediate page)

### Fixed (Steps 5-8)
- Effort model calculations for accurate XS-XL sizing
- Save button icon display on Session Summary
- Remove button functionality with proper confirmation
- Item summary updates after effort level changes
- Session Summary data refresh when returning from Item Detail
- Edge case calculations (all 1s → XS, all 5s → XL)

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

### Completed
- ✅ Iteration 3: Core functionality (factor-based sizing, scenarios, persistence)
- ✅ Figma Design Implementation: Steps 1-8 complete (Jan 11-13, 2026)

## [1.3.0] - 2026-01-12

### Completed Iteration 3
- Factor-based sizing for UX and Content
- Focus-time vs work-week distinction
- Planning scenarios with quarterly periods
- Item Detail tabs with factor scoring
- localStorage persistence
- 2-week sprint standardization
