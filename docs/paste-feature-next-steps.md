# Paste Roadmap Items Feature - Next Development Steps

## Current Status

The paste-from-table feature status:
- ✅ **Paste mechanics and validation:** Pass
  - 5-column format (UX/Content effort) is accepted and parsed correctly
  - 4-column format (legacy) still supported for backward compatibility
  - Field-specific error messages work correctly
- ⚠️ **Data wiring into roadmap grid and summaries:** Incomplete
  - Pasted UX/Content effort values are saved to `uxFocusWeeks`/`contentFocusWeeks` fields
  - However, these values are not yet displayed in:
    - Roadmap Items grid (UX/Content Focus Weeks columns show defaults)
    - Item detail page effort estimate cards (show model-based defaults)
  - Scenario summary and Committed Plan totals may reflect values, but per-item display needs work
- ⚠️ **Start/end dates:** Stored in initiative field (temporary workaround)
- ⚠️ **Calculator integration:** Complexity calculators do not read from pasted values

## Proposed Next Development Slices

### A) Add Real Start/End Date Fields to Roadmap Items

**Goal:** Replace the temporary workaround of storing dates in the `initiative` field with proper `startDate` and `endDate` fields on roadmap items, and display them in the Committed Plan table.

**Key Areas to Touch:**
- `src/domain/types.ts` - Add `startDate?: string` and `endDate?: string` to `RoadmapItem` interface
- `database/schema.sql` - Add `start_date` and `end_date` columns to `roadmap_items` table (migration)
- `netlify/functions/types.ts` - Update DB-to-TypeScript mapping to include date fields
- `src/features/scenarios/pasteTableImport/PasteTableImportModal.tsx` - Map pasted dates to new fields instead of initiative
- `src/pages/CommittedPlanPage.tsx` - Display start/end dates in table columns (replace or supplement "Initiative" column)
- `src/pages/SessionItemsPage.tsx` - Optionally show dates in roadmap items grid
- `src/context/RoadmapItemsContext.tsx` - Ensure date fields are persisted in create/update operations

**Estimated Complexity:** Medium
- Requires database migration
- UI updates in multiple places
- Need to handle date formatting/parsing

---

### B) Split UX vs Content Effort in Paste Format

**Goal:** Allow users to paste separate UX and Content effort values instead of a single "Effort weeks" column that gets split 50/50.

**Key Areas to Touch:**
- `src/features/scenarios/pasteTableImport/parsePastedRoadmapItems.ts` - Update parser to handle 5 columns: Title | Start date | End date | UX Effort weeks | Content Effort weeks
- `src/features/scenarios/pasteTableImport/PasteTableImportModal.tsx` - Update preview table to show separate UX/Content columns, update help text
- `src/pages/SessionSummaryPage.tsx` - Update `handlePasteImport` to use separate UX/Content values instead of splitting
- `src/features/scenarios/pasteTableImport/__tests__/parsePastedRoadmapItems.test.ts` - Update tests for new column format

**Estimated Complexity:** Low-Medium
- Parser changes are straightforward
- Need to maintain backward compatibility or provide migration path for existing paste format
- UI updates are localized to paste modal

**Considerations:**
- Should we support both formats (4-column legacy, 5-column new)?
- Or make a clean break and update all documentation?

---

### C) UX Improvements to Paste Modal

**Goal:** Enhance the paste modal with better hints, clearer error messages, and improved column detection.

**Key Areas to Touch:**
- `src/features/scenarios/pasteTableImport/PasteTableImportModal.tsx` - Enhance UI/UX:
  - Add example data in placeholder or help text
  - Improve error messages (show which column has issues)
  - Add column mapping hints/visual indicators
  - Better formatting for preview table (highlight issues more clearly)
  - Add "Copy example format" button
- `src/features/scenarios/pasteTableImport/parsePastedRoadmapItems.ts` - Improve validation messages to be more specific

**Estimated Complexity:** Low
- Mostly UI/UX improvements
- No data model changes
- Can be done incrementally

**Specific Improvements:**
- Show example format: `Title	Start date	End date	Effort weeks`
- Highlight invalid cells in preview table
- Add tooltips explaining what each column should contain
- Better error aggregation (e.g., "3 rows missing titles, 1 row has invalid effort")

---

## Recommended Order

1. **Start with C (UX Improvements)** - Low risk, immediate user value, no breaking changes
2. **Then A (Date Fields)** - Medium complexity, addresses a known limitation
3. **Finally B (Split Effort)** - Requires decision on backward compatibility, but provides most flexibility

## Notes

- All three slices can be done independently
- Slice A and B can be done in parallel if desired
- Consider user feedback before implementing B (split effort) - the 50/50 split may be sufficient for most use cases
