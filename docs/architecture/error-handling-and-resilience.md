# Error Handling & Resilience Architecture

This document describes the error handling patterns, error boundaries, and resilience strategies implemented in the Capacity Planning App.

## ErrorBoundary Component

### Purpose

The `ErrorBoundary` component catches JavaScript errors anywhere in the React component tree and displays a fallback UI instead of crashing the entire app.

### Implementation

**Location:** `src/components/ErrorBoundary.tsx`

**Architecture:**
- Class component that implements React's error boundary API
- Catches errors in child components during rendering, lifecycle methods, and constructors
- Does NOT catch errors in event handlers, async code, or server-side rendering

### Integration

**Wired at app root:** `src/main.tsx`

```tsx
<React.StrictMode>
  <ErrorBoundary>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        {/* ... rest of app ... */}
      </BrowserRouter>
    </ChakraProvider>
  </ErrorBoundary>
</React.StrictMode>
```

**Scope:** Catches all errors in the entire application tree, including:
- Context providers (SettingsProvider, PlanningSessionsProvider, etc.)
- All page components
- All child components

### Behavior

**When an error occurs:**
1. `getDerivedStateFromError` is called immediately to update state
2. `componentDidCatch` logs the error to console
3. Fallback UI is rendered instead of the component tree
4. Error details are displayed (error message + stack trace in dev mode)
5. User can click "Reload Page" to reset app state or "Go to Home" to navigate away

**Error UI includes:**
- User-friendly error message
- Error details (message and stack trace in dev mode)
- "Reload Page" button (calls `window.location.reload()`)
- "Go to Home" button (navigates to `/`)

### Limitations

Error boundaries do NOT catch:
- Errors in event handlers (use try/catch)
- Errors in async code (use try/catch)
- Errors during server-side rendering
- Errors thrown in the error boundary itself

## Numeric Formatting Patterns

### Problem

Calling `.toFixed()` on non-numeric values (undefined, null, strings, objects) throws `TypeError: toFixed is not a function`.

### Solution Pattern

**Always check type before calling `.toFixed()`:**

```tsx
// ❌ UNSAFE - Will throw if value is not a number
{capacityMetrics.ux.demand.toFixed(1)}

// ✅ SAFE - Type check with fallback
{typeof capacityMetrics.ux.demand === 'number' 
  ? capacityMetrics.ux.demand.toFixed(1) 
  : '0.0'}
```

### Implementation Examples

**1. Capacity Metrics (SessionSummaryPage.tsx):**

```tsx
// Calculation ensures numbers
const capacityMetrics = useMemo(() => {
  // ... calculations with Number() coercion
  return {
    ux: {
      capacity: Number(uxCapacity) || 0,
      demand: Number(uxDemand) || 0,
      // ...
    }
  }
}, [session, items])

// Rendering with type guards
{typeof capacityMetrics.ux.capacity === 'number' 
  ? capacityMetrics.ux.capacity.toFixed(1) 
  : '0.0'} focus weeks
```

**2. Item Properties (Table Rows):**

```tsx
// Type check before formatting
{typeof item.uxFocusWeeks === 'number' 
  ? item.uxFocusWeeks.toFixed(1) 
  : '—'}
```

### Patterns Used

1. **Calculation-time safety:**
   - Use `typeof value === 'number'` checks when reducing/calculating
   - Coerce to number with `Number(value) || 0`
   - Default to `0` for missing numeric values

2. **Render-time safety:**
   - Always check `typeof value === 'number'` before calling `.toFixed()`
   - Provide fallback display values: `'0.0'` for calculated metrics, `'—'` for missing item data

3. **Consistent fallbacks:**
   - Calculated metrics (capacity, demand, surplus): fallback to `'0.0'`
   - Item properties (uxFocusWeeks, contentFocusWeeks): fallback to `'—'`
   - Utilization percentages: fallback to `'0'`

## Session Loading & Navigation Patterns

### Problem

When navigating directly to a session URL (`/sessions/:id`), sessions might not be loaded yet, causing:
- Blank pages
- "Session not found" errors for valid sessions that just need to be fetched

### Solution: Automatic Loading with Retry

**Location:** `src/pages/SessionSummaryPage.tsx`

**Pattern 1: Load Sessions if Not Loaded**

```tsx
useEffect(() => {
  if (id && !sessionsLoading && sessions.length === 0) {
    // No sessions loaded, fetch them
    loadSessions()
  }
}, [id, sessionsLoading, sessions.length, loadSessions])
```

**Behavior:**
- Triggers when navigating to a session URL
- Only runs if sessions array is empty and not currently loading
- Automatically fetches sessions from API (with localStorage fallback)

**Pattern 2: Auto-Retry if Session Not Found**

```tsx
const hasTriedReload = useRef(false)

useEffect(() => {
  if (id && !sessionsLoading && sessions.length > 0 && !hasTriedReload.current) {
    const foundSession = getSessionById(id)
    if (!foundSession) {
      // Session not found in loaded sessions, try reloading once
      hasTriedReload.current = true
      loadSessions().finally(() => {
        // Reset flag after delay to allow state update
        setTimeout(() => {
          hasTriedReload.current = false
        }, 3000)
      })
    }
  }
}, [id, sessionsLoading, sessions.length, getSessionById, loadSessions])
```

**Behavior:**
- Triggers when sessions are loaded but the specific session ID is not found
- Uses `useRef` to prevent infinite reload loops
- Attempts reload once, then resets flag after 3 seconds
- Handles case where session was just created and not yet in loaded list

### Loading States

**Three-state pattern:**

1. **Loading:** `sessionsLoading === true`
   - Show "Loading session..." message
   - Prevent accessing session data

2. **Error:** `sessionsError !== null`
   - Show error message with "Retry" button
   - Provide "Go Home" option

3. **Success:** Session found and loaded
   - Render session summary page
   - Show capacity metrics and roadmap items

**Implementation:**

```tsx
// Show loading state while sessions are loading
if (sessionsLoading) {
  return <Box>Loading session...</Box>
}

// Show error state if sessions failed to load
if (sessionsError) {
  return (
    <Box>
      <Text>Error loading session: {sessionsError}</Text>
      <Button onClick={() => loadSessions()}>Retry</Button>
      <Button onClick={() => navigate('/')}>Go Home</Button>
    </Box>
  )
}

// Handle missing session
if (!session) {
  return (
    <Box>
      <Text>Session not found</Text>
      <Button onClick={() => loadSessions()}>Reload Sessions</Button>
      <Button onClick={() => navigate('/')}>Go Home</Button>
    </Box>
  )
}
```

### Retry Strategy

**API First, localStorage Fallback:**

```tsx
const loadSessions = useCallback(async () => {
  setIsLoading(true)
  setError(null)
  try {
    const response = await fetch(`${API_BASE_URL}/get-scenarios`)
    if (!response.ok) {
      throw new Error(`Failed to fetch scenarios: ${response.statusText}`)
    }
    const data: PlanningSession[] = await response.json()
    setSessions(data)
    saveSessionsToStorage(data) // Backup to localStorage
  } catch (err) {
    console.error('Error loading scenarios from API, falling back to localStorage:', err)
    setError('Failed to load scenarios from database. Using local data.')
    const localSessions = loadSessionsFromStorage() // Fallback
    setSessions(localSessions)
  } finally {
    setIsLoading(false)
  }
}, [])
```

**Characteristics:**
- Always tries API first
- Falls back to localStorage on error
- Sets error state but continues with fallback data
- Saves API data to localStorage as backup

## Error Handling Best Practices

### 1. Always Guard Numeric Operations

```tsx
// ✅ GOOD
const total = items.reduce((sum, item) => {
  const weeks = typeof item.uxFocusWeeks === 'number' ? item.uxFocusWeeks : 0
  return sum + weeks
}, 0)

// ❌ BAD - Will throw if item.uxFocusWeeks is undefined
const total = items.reduce((sum, item) => sum + item.uxFocusWeeks, 0)
```

### 2. Check for Null/Undefined Before Access

```tsx
// ✅ GOOD
if (!session) {
  return <ErrorState />
}

// ✅ GOOD
const period = session?.planning_period || session?.planningPeriod
if (!period) {
  return null
}

// ❌ BAD - Will throw if session is undefined
const period = session.planning_period
```

### 3. Use Type Guards Consistently

```tsx
// ✅ GOOD - Explicit type check
{typeof capacityMetrics?.ux?.demand === 'number' 
  ? capacityMetrics.ux.demand.toFixed(1) 
  : '0.0'}

// ❌ BAD - Relies on truthy check (won't catch strings, objects)
{capacityMetrics?.ux?.demand 
  ? capacityMetrics.ux.demand.toFixed(1) 
  : '0.0'}
```

### 4. Provide User-Friendly Error Messages

```tsx
// ✅ GOOD
catch (err) {
  setError('Failed to load scenarios from database. Using local data.')
  // Continue with fallback
}

// ❌ BAD
catch (err) {
  throw err // Crashes the app
}
```

### 5. Always Have a Fallback UI

Every component that depends on async data should have:
- Loading state
- Error state with retry option
- Empty/null state with helpful message

## Testing Considerations

When testing error handling:

1. **Test type guards:** Verify non-numeric values don't throw
2. **Test loading states:** Verify UI shows loading during fetch
3. **Test error states:** Verify error messages and retry buttons
4. **Test retry logic:** Verify auto-reload doesn't cause infinite loops
5. **Test fallbacks:** Verify localStorage fallback works when API fails

Do NOT rely on unhandled errors for test assertions. All errors should be caught and handled gracefully.
