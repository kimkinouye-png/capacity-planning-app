# Perplexity Prompt: Issues and Resolutions Summary

Copy and paste this prompt into Perplexity to analyze our production issues:

---

**Context:** I'm working on a Capacity Planning App (React + TypeScript + Vite + Chakra UI, deployed on Netlify with Neon Postgres). After implementing database integration (Phase 4), we encountered several critical production bugs that we've now resolved. I'd like you to analyze these issues and provide insights.

## Critical Issues Resolved

### 1. Blank Page Crashes (RESOLVED ✅)
**Problem:** Navigating to session summary pages (`/sessions/:id`) resulted in completely blank pages in production.

**Root Causes:**
- Sessions not loaded when navigating directly to URLs
- Race condition with newly created scenarios
- Missing error boundary to catch React rendering errors
- No loading/error states for failed API calls

**Solutions:**
- Created React ErrorBoundary component to catch JavaScript errors gracefully
- Added auto-load logic: Sessions load automatically when navigating to session URLs
- Added auto-reload logic: If session not found, retry once (handles just-created scenarios)
- Improved UI: Loading states, error states with retry, "Session not found" messages

**Files Changed:**
- `src/components/ErrorBoundary.tsx` (new)
- `src/main.tsx` (wrapped app in ErrorBoundary)
- `src/pages/SessionSummaryPage.tsx` (enhanced loading logic)

### 2. TypeError: toFixed is not a function (RESOLVED ✅)
**Problem:** Multiple `TypeError` errors when displaying capacity metrics:
- `F.ux.demand.toFixed is not a function`
- `L.uxFocusWeeks.toFixed is not a function`
- `o.uxDemand.toFixed is not a function` (Committed Plan page)

**Root Causes:**
- Non-numeric values (`undefined`, `null`, `NaN`) in calculations
- Missing type guards before calling `.toFixed()`
- Database values might be `null` instead of `0`
- Inconsistent data types from JSONB fields

**Solutions:**
- Created safe formatting utilities (`src/utils/safeFormat.ts`):
  - `safeToFixed()` - Type checks before formatting
  - `safeFormatMetric()` - For capacity metrics (fallback: '0.0')
  - `safeFormatItemValue()` - For item properties (fallback: '—')
  - `safeFormatUtilization()` - For percentages (fallback: '0')
- Added type guards in all calculations
- Added `Number()` coercion with fallbacks
- Replaced all `.toFixed()` calls with safe utilities

**Files Changed:**
- `src/utils/safeFormat.ts` (new)
- `src/pages/SessionSummaryPage.tsx` (type guards, safe formatting)
- `src/pages/CommittedPlanPage.tsx` (safe formatting)

### 3. Roadmap Items Not Populating (RESOLVED ✅)
**Problem:** Committed Plan page showed empty "All Roadmap Items" table even when scenarios had items.

**Root Causes:**
- Items not loaded for committed sessions
- Missing `useEffect` to trigger item loading
- Context initialized with empty `itemsBySession` map

**Solutions:**
- Initialize `itemsBySession` from localStorage on mount
- Added `useEffect` to load items for all committed sessions in parallel
- Added `location.key` to dependency array to reload on navigation

**Files Changed:**
- `src/context/RoadmapItemsContext.tsx` (initialize from storage)
- `src/pages/CommittedPlanPage.tsx` (load items for committed sessions)

### 4. Work Weeks Not Updating (RESOLVED ✅)
**Problem:** After updating item effort on detail page, summary page showed old work weeks values.

**Root Causes:**
- Items not reloaded after navigation back to summary
- Missing navigation trigger in `useEffect` dependencies

**Solutions:**
- Added `useLocation` and `location.key` to `useEffect` dependency array
- Items reload automatically when navigating back to summary page

**Files Changed:**
- `src/pages/SessionSummaryPage.tsx` (added location.key to dependencies)

### 5. Netlify Dev Server Issues (RESOLVED ✅)
**Problem:** `npx netlify dev` failed with "Failed retrieving addons" error and exited.

**Root Causes:**
- Netlify CLI tries to fetch addons from API
- Fails if addons not configured or API call fails
- Happens even when `NETLIFY_DATABASE_URL` is in `.env`

**Solutions:**
- Updated `start-dev.sh` to use `--offline` flag (skips addon fetching)
- Robust `.env` file loading with special character handling
- Alternative: Use `npm run dev` for frontend-only testing

**Files Changed:**
- `start-dev.sh` (added `--offline` flag)

## Patterns Established

### Error Handling
- ErrorBoundary at app root
- Try/catch in async functions
- Loading/error states in all data-fetching components
- Retry mechanisms for failed API calls

### Type Safety
- Type guards before method calls
- Safe formatting utilities for numeric display
- Number coercion with fallbacks
- Null checks before nested property access

### Data Loading
- Auto-load on mount if data missing
- Auto-reload on navigation using `location.key`
- Parallel loading with `Promise.all`
- localStorage fallback for resilience

## Testing

- **Unit Tests:** `src/utils/__tests__/safeFormat.test.ts` (19 tests)
- **Integration Tests:** `src/pages/__tests__/SessionSummaryPage.test.tsx`
- **Test Setup:** `src/test/setup.ts` (Vitest + React Testing Library)

## Current Status

✅ **All critical bugs resolved**  
✅ **Production is stable**  
✅ **Error handling comprehensive**  
✅ **User experience improved**

## Questions for Perplexity

1. **Pattern Analysis:** Are these error handling and type safety patterns best practices? Any improvements?
2. **Root Cause Analysis:** Why did these issues emerge after database integration? Common pitfalls?
3. **Prevention:** What could we have done to catch these issues earlier? (Testing strategies, TypeScript config, etc.)
4. **Architecture:** Are there architectural improvements we should consider? (Error logging, monitoring, etc.)
5. **Future Development:** Based on these issues, what recommendations do you have for maintaining stability as we add features?

## Technical Stack

- **Frontend:** React 18 + TypeScript + Vite + Chakra UI
- **Backend:** Netlify Functions (TypeScript)
- **Database:** Neon Postgres via Netlify DB
- **State Management:** React Context API
- **Testing:** Vitest + React Testing Library
- **Deployment:** Netlify (automatic from Git)

---

**Please provide:**
1. Analysis of why these issues occurred
2. Assessment of our solutions (are they robust?)
3. Recommendations for preventing similar issues
4. Suggestions for architectural improvements
5. Best practices for maintaining stability
