# Issues and Resolutions Report
## Capacity Planning App - Production Bug Fixes & Error Handling

**Date:** January 2026  
**Purpose:** Comprehensive documentation of production issues, root causes, and resolutions for Perplexity analysis

---

## Executive Summary

This report documents critical production bugs discovered in the Capacity Planning App after database integration (Phase 4) and the comprehensive fixes implemented to ensure application stability. All issues have been resolved, and the application is now stable in production.

**Key Issues Resolved:**
1. Blank page crashes when navigating to session summary pages
2. Multiple `TypeError: toFixed is not a function` errors
3. Roadmap items not populating on Committed Plan page
4. Work weeks not updating on Session Summary page
5. Netlify dev server configuration issues

---

## Issue #1: Blank Page on Session Summary (CRITICAL)

### Problem Description
**Symptom:** After creating a scenario and navigating to its summary page (`/sessions/:id`), users encountered completely blank pages in production. No error messages, no content, just a white/blank screen.

**User Impact:** High - Users could not view or interact with their planning scenarios after creation.

**Production URL Example:** `https://capacity-planner.netlify.app/sessions/ae597472-73e8-4687-96aa-1316d8115059`

### Root Causes Identified

1. **Sessions Not Loaded on Direct Navigation**
   - When users navigated directly to a session URL (e.g., via bookmark or after creation), the React app had not yet loaded sessions from the API
   - `PlanningSessionsContext` only loaded sessions on mount if they weren't already in state
   - Direct navigation bypassed the normal flow where sessions would be loaded from the home page first

2. **Race Condition with Newly Created Scenarios**
   - After creating a scenario, the app would navigate to `/sessions/:id`
   - The new scenario might not yet be in the loaded sessions array
   - The page would render with `session = undefined`, causing a crash

3. **Missing Error Boundary**
   - JavaScript errors during rendering would crash the entire app
   - No error boundary to catch and display errors gracefully
   - Errors resulted in blank pages instead of helpful error messages

4. **Insufficient Loading/Error States**
   - No loading indicator while sessions were being fetched
   - No error message if session fetch failed
   - No retry mechanism for failed API calls

### Solutions Implemented

#### 1. ErrorBoundary Component
**File:** `src/components/ErrorBoundary.tsx`

- Created React ErrorBoundary class component to catch JavaScript errors during rendering
- Displays user-friendly error UI with:
  - Error message: "Something went wrong"
  - Error details (in development mode)
  - "Reload Page" button
  - "Go to Home" button
- Wrapped entire app in `src/main.tsx` to catch all errors

**Code Pattern:**
```tsx
class ErrorBoundary extends Component<Props, State> {
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }
  
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    // ... set state with error details
  }
}
```

#### 2. Enhanced Session Loading Logic
**File:** `src/pages/SessionSummaryPage.tsx`

**Auto-load Sessions on Direct Navigation:**
```tsx
// Ensure sessions are loaded when navigating to this page
useEffect(() => {
  if (id && !sessionsLoading && sessions.length === 0) {
    // No sessions loaded, fetch them
    loadSessions()
  }
}, [id, sessionsLoading, sessions.length, loadSessions])
```

**Auto-reload if Session Not Found:**
```tsx
// Reload sessions if we don't find the session (in case it was just created)
const hasTriedReload = useRef(false)
useEffect(() => {
  if (id && !sessionsLoading && sessions.length > 0 && !hasTriedReload.current) {
    const foundSession = getSessionById(id)
    if (!foundSession) {
      // Session not found in loaded sessions, try reloading once
      hasTriedReload.current = true
      loadSessions().finally(() => {
        setTimeout(() => {
          hasTriedReload.current = false
        }, 3000)
      })
    }
  }
}, [id, sessionsLoading, sessions.length, getSessionById, loadSessions])
```

#### 3. Improved Loading/Error UI
- Added loading state: "Loading session..." message
- Added error state: "Error loading session: [message]" with "Retry" button
- Added "Session not found" state with "Reload Sessions" and "Go Home" buttons
- All states use dark mode styling consistent with design system

### Resolution Status
✅ **RESOLVED** - Blank page issue completely fixed. Users now see appropriate loading/error states or the session content.

---

## Issue #2: TypeError - toFixed is not a function (CRITICAL)

### Problem Description
**Symptom:** Multiple `TypeError` errors caught by ErrorBoundary:
- `TypeError: F.ux.demand.toFixed is not a function`
- `TypeError: L.uxFocusWeeks.toFixed is not a function`
- `TypeError: o.uxDemand.toFixed is not a function` (on Committed Plan page)

**User Impact:** High - Application would crash when displaying capacity metrics or roadmap item tables.

### Root Causes Identified

1. **Non-Numeric Values in Calculations**
   - Capacity metrics calculations could return `undefined`, `null`, or `NaN` in edge cases
   - Database values might be `null` or missing
   - Type coercion issues when aggregating item properties

2. **Missing Type Guards**
   - Code called `.toFixed()` directly on values without checking if they were numbers
   - No validation that `capacityMetrics` values were numeric before formatting
   - No validation that `item.uxFocusWeeks` and `item.contentFocusWeeks` were numbers

3. **Inconsistent Data Types**
   - Some calculations returned `number | undefined`
   - Database columns might return `null` instead of `0`
   - JSONB fields might have missing properties

### Solutions Implemented

#### 1. Safe Formatting Utilities
**File:** `src/utils/safeFormat.ts`

Created comprehensive utility functions for safe numeric formatting:

```tsx
export function safeToFixed(
  value: unknown,
  decimals: number = 1,
  fallback: string = '0.0'
): string {
  if (typeof value === 'number' && !isNaN(value)) {
    return value.toFixed(decimals)
  }
  return fallback
}

export function safeFormatMetric(value: unknown, decimals: number = 1): string {
  return safeToFixed(value, decimals, '0.0')
}

export function safeFormatItemValue(value: unknown, decimals: number = 1): string {
  return safeToFixed(value, decimals, '—')
}

export function safeFormatUtilization(value: unknown): string {
  return safeToFixed(value, 0, '0')
}
```

#### 2. Type Guards in Capacity Metrics
**File:** `src/pages/SessionSummaryPage.tsx`

**Before:**
```tsx
const uxDemand = items.reduce((sum, item) => sum + item.uxFocusWeeks, 0)
// Later: {uxDemand.toFixed(1)} // ❌ Crashes if uxDemand is not a number
```

**After:**
```tsx
const uxDemand = items.reduce((sum, item) => {
  const weeks = typeof item.uxFocusWeeks === 'number' ? item.uxFocusWeeks : 0
  return sum + weeks
}, 0)

// Later: {typeof capacityMetrics.ux.demand === 'number' 
//   ? capacityMetrics.ux.demand.toFixed(1) 
//   : '0.0'} // ✅ Safe
```

#### 3. Number Coercion in Calculations
**File:** `src/pages/SessionSummaryPage.tsx`

```tsx
return {
  ux: {
    capacity: Number(uxCapacity) || 0,
    demand: Number(uxDemand) || 0,
    surplus: Number(uxSurplus) || 0,
    utilization: Number(uxUtilization) || 0,
  },
  // ...
}
```

#### 4. Safe Formatting in Committed Plan Page
**File:** `src/pages/CommittedPlanPage.tsx`

Replaced all `.toFixed()` calls with safe utilities:
```tsx
// Before: {uxDemand.toFixed(1)} // ❌
// After: {safeFormatMetric(uxDemand, 1)} // ✅
```

### Resolution Status
✅ **RESOLVED** - All `toFixed` errors eliminated. Application now handles non-numeric values gracefully with appropriate fallbacks.

---

## Issue #3: Roadmap Items Not Populating on Committed Plan Page

### Problem Description
**Symptom:** The "All Roadmap Items" table on the `/committed-plan` page was empty, even when committed scenarios had roadmap items.

**User Impact:** Medium - Users could not see their committed work items in the aggregate view.

### Root Causes Identified

1. **Items Not Loaded for Committed Sessions**
   - `RoadmapItemsContext` only loaded items when explicitly requested
   - Committed Plan page displayed committed scenarios but didn't trigger item loading
   - Items were stored in `itemsBySession` map but weren't fetched from API

2. **Missing useEffect Hook**
   - No effect to load items when committed sessions were identified
   - Items needed to be loaded asynchronously from API or localStorage

3. **Context Initialization**
   - `itemsBySession` was initialized as empty object `{}`
   - Items from localStorage weren't loaded on mount

### Solutions Implemented

#### 1. Initialize Items from Storage on Mount
**File:** `src/context/RoadmapItemsContext.tsx`

```tsx
useEffect(() => {
  // Load items from localStorage on mount to ensure they're available immediately
  const storedItems = loadItemsFromStorage()
  if (Object.keys(storedItems).length > 0) {
    setItemsBySession(storedItems)
  }
}, [])
```

#### 2. Load Items for All Committed Sessions
**File:** `src/pages/CommittedPlanPage.tsx`

```tsx
useEffect(() => {
  // Load items for all committed sessions
  if (committedSessions.length > 0 && loadItemsForSession) {
    // Load items for all committed sessions in parallel
    Promise.all(
      committedSessions.map((session) => loadItemsForSession(session.id))
    ).catch((error) => {
      console.error('Error loading items for committed sessions:', error)
    })
  }
}, [committedSessions, loadItemsForSession, location.key]) // location.key triggers on navigation
```

#### 3. Navigation-Triggered Reload
Added `useLocation` and `location.key` to dependency array to reload items when navigating to the page.

### Resolution Status
✅ **RESOLVED** - Roadmap items now populate correctly on the Committed Plan page.

---

## Issue #4: Work Weeks Not Updating on Session Summary

### Problem Description
**Symptom:** After updating an item's effort on the Item Detail page, the Session Summary page did not reflect the updated "Work Weeks" values. The detail page showed correct values, but the summary table showed old values.

**User Impact:** Medium - Users had to refresh the page to see updated calculations.

### Root Causes Identified

1. **Items Not Reloaded After Navigation**
   - When navigating back from Item Detail to Session Summary, items weren't reloaded
   - Context state persisted old values
   - `useEffect` dependencies didn't include navigation state

2. **Missing Navigation Trigger**
   - No mechanism to detect when user navigated back to the summary page
   - Items were only loaded on initial mount

### Solutions Implemented

**File:** `src/pages/SessionSummaryPage.tsx`

Added `useLocation` and `location.key` to the `useEffect` dependency array:

```tsx
useEffect(() => {
  if (id) {
    loadItemsForSession(id)
  }
}, [id, loadItemsForSession, location.key]) // ✅ location.key triggers on navigation
```

**How it works:**
- `location.key` changes on every navigation
- When user navigates back from Item Detail, `location.key` changes
- `useEffect` detects the change and reloads items
- Summary table displays updated work weeks

### Resolution Status
✅ **RESOLVED** - Work weeks now update immediately when navigating back to the summary page.

---

## Issue #5: Netlify Dev Server Configuration

### Problem Description
**Symptom:** Running `npx netlify dev` resulted in:
- "Failed retrieving addons for site e0e58877-9c44-433d-bbb2-c269cf0bf156: Not Found" error
- Server would exit early, preventing local development

**User Impact:** Low - Local development workflow disrupted, but production unaffected.

### Root Causes Identified

1. **Addon Fetching Failure**
   - Netlify CLI attempts to fetch addons (like Netlify DB) from the API
   - If addons aren't configured or API call fails, CLI exits with error
   - This happens even when `NETLIFY_DATABASE_URL` is set in `.env`

2. **Environment Variable Loading**
   - Netlify CLI doesn't automatically load `.env` files in all cases
   - Special characters in connection strings (like `&`) can cause parsing issues

### Solutions Implemented

#### 1. Updated start-dev.sh Script
**File:** `start-dev.sh`

- Added `--offline` flag to `npx netlify dev` to skip addon fetching
- Robust `.env` file loading with proper handling of special characters
- Clear messaging about expected behavior

```bash
# Start Netlify dev with --offline to skip addon fetching
# This uses environment variables from .env file instead
exec npx netlify dev --offline
```

#### 2. Alternative: Frontend-Only Development
For UI-only testing, users can use:
```bash
npm run dev  # Starts Vite on port 5173
```

### Resolution Status
✅ **RESOLVED** - Local development workflow restored. Users can use `npm run dev:local` or `./start-dev.sh` for full-stack development.

---

## Patterns and Best Practices Established

### 1. Error Handling Pattern
- **ErrorBoundary** at app root to catch rendering errors
- **Try/catch blocks** in async functions
- **Loading/error states** in all data-fetching components
- **Retry mechanisms** for failed API calls

### 2. Type Safety Pattern
- **Type guards** before calling methods on potentially undefined values
- **Safe formatting utilities** for numeric display
- **Number coercion** with fallbacks (`Number(value) || 0`)
- **Null checks** before accessing nested properties

### 3. Data Loading Pattern
- **Auto-load on mount** if data is missing
- **Auto-reload on navigation** using `location.key`
- **Parallel loading** with `Promise.all` for multiple resources
- **localStorage fallback** for offline/resilience

### 4. State Management Pattern
- **Context providers** for global state
- **Loading/error states** exposed from contexts
- **Optimistic updates** with rollback on error
- **Dual persistence** (DB primary, localStorage fallback)

---

## Testing Coverage

### Unit Tests
- **File:** `src/utils/__tests__/safeFormat.test.ts`
  - 19 tests covering all safe formatting utilities
  - Tests for numbers, null, undefined, strings, NaN
  - Ensures no errors are thrown

### Integration Tests
- **File:** `src/pages/__tests__/SessionSummaryPage.test.tsx`
  - Tests session loading logic
  - Tests retry mechanism for missing sessions
  - Tests API failure handling
  - Tests non-numeric value handling

### Test Setup
- **File:** `src/test/setup.ts`
  - Vitest configuration
  - React Testing Library setup
  - Console error suppression for expected warnings

---

## Current Application State

### ✅ Resolved Issues
- Blank page crashes
- All `toFixed` errors
- Roadmap items not populating
- Work weeks not updating
- Netlify dev server configuration

### ✅ Production Status
- Application is stable in production
- All critical bugs resolved
- Error handling comprehensive
- User experience improved

### ⏳ Remaining Work
- Phase 5: Complete database integration for Scenarios and Roadmap Items (currently using localStorage fallback)
- Phase 5: Activity log integration
- Phase 5: Capacity & Designer Count features
- Phase 6+: Bulk item entry, exports, integrations

---

## Recommendations for Future Development

### 1. Type Safety
- Continue using safe formatting utilities for all numeric display
- Add TypeScript strict mode if not already enabled
- Validate API responses with runtime type checking (e.g., Zod)

### 2. Error Handling
- Add error logging service (e.g., Sentry) for production error tracking
- Implement retry logic with exponential backoff for API calls
- Add user-friendly error messages for all error states

### 3. Data Loading
- Consider implementing React Query or SWR for better caching and loading states
- Add optimistic updates for better perceived performance
- Implement pagination for large datasets

### 4. Testing
- Increase test coverage for critical user flows
- Add end-to-end tests for session creation and navigation
- Test error scenarios (network failures, invalid data)

### 5. Performance
- Implement code splitting for route-based chunks
- Add loading skeletons instead of "Loading..." text
- Optimize bundle size (currently shows warning about large chunks)

---

## Files Modified

### New Files
- `src/components/ErrorBoundary.tsx` - Error boundary component
- `src/utils/safeFormat.ts` - Safe numeric formatting utilities
- `src/utils/__tests__/safeFormat.test.ts` - Unit tests
- `src/pages/__tests__/SessionSummaryPage.test.tsx` - Integration tests
- `src/test/setup.ts` - Test configuration
- `docs/architecture/error-handling-and-resilience.md` - Architecture documentation

### Modified Files
- `src/main.tsx` - Added ErrorBoundary wrapper
- `src/pages/SessionSummaryPage.tsx` - Enhanced loading logic, type safety, error handling
- `src/pages/CommittedPlanPage.tsx` - Safe formatting, item loading
- `src/context/RoadmapItemsContext.tsx` - Initialize items from storage
- `start-dev.sh` - Added `--offline` flag
- `CHANGELOG.md` - Documented all fixes
- `vite.config.ts` - Added Vitest configuration

---

## Conclusion

All critical production bugs have been resolved. The application now has:
- Comprehensive error handling with ErrorBoundary
- Type-safe numeric formatting throughout
- Robust data loading with retry mechanisms
- Improved user experience with loading/error states
- Stable production deployment

The patterns established in these fixes should be followed for all future development to maintain application stability and user experience.

---

**Report Generated:** January 2026  
**For Use With:** Perplexity AI for issue analysis and recommendations
