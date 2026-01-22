# React Context Layer Code Review

**Date:** 2026-01-19  
**Scope:** All files in `src/context/`  
**Focus:** Reliability, data flow, async handling, type safety, DB ↔ localStorage consistency

---

## Critical Issues

### 1. Stale State in localStorage Save (Race Condition)
**File:** `RoadmapItemsContext.tsx:195`  
**Issue:** In `loadItemsForSession`, after setting new state, the code saves to localStorage using the stale `itemsBySession` from closure instead of the newly set data.

```typescript
setItemsBySession((prev) => ({
  ...prev,
  [sessionId]: normalizedData,
}))
// Also save to localStorage as backup
const updated = { ...itemsBySession, [sessionId]: normalizedData }  // ❌ Uses stale itemsBySession
saveItemsToStorage(updated)
```

**Risk:** localStorage can contain outdated data if multiple rapid loads occur. The `useEffect` at line 168 will eventually save, but there's a window where localStorage is stale.

**Fix:**
```typescript
setItemsBySession((prev) => {
  const updated = { ...prev, [sessionId]: normalizedData }
  // Save immediately with fresh data
  saveItemsToStorage(updated)
  return updated
})
```

---

### 2. Dependency Array Causes Potential Infinite Loop
**File:** `RoadmapItemsContext.tsx:212`  
**Issue:** `loadItemsForSession` has `itemsBySession` in its dependency array, but it also updates `itemsBySession`. This can cause re-renders and potential infinite loops if called from a `useEffect` that depends on `itemsBySession`.

```typescript
const loadItemsForSession = useCallback(async (sessionId: string) => {
  // ... updates itemsBySession ...
}, [itemsBySession])  // ❌ Dependency on state it modifies
```

**Risk:** If a component calls `loadItemsForSession` in a `useEffect` that depends on items, it could trigger infinite re-renders.

**Fix:** Remove `itemsBySession` from dependency array. The function doesn't read from it, only updates it:
```typescript
const loadItemsForSession = useCallback(async (sessionId: string) => {
  // ... existing code ...
}, [])  // ✅ No dependencies needed
```

---

### 3. Stale Sessions Reference in updateSession
**File:** `PlanningSessionsContext.tsx:189`  
**Issue:** `updateSession` uses `sessions.find()` from closure, which may be stale if called before state updates.

```typescript
const updateSession = useCallback(async (id: string, updates: Partial<PlanningSession>): Promise<void> => {
  // ...
  const session = sessions.find((s) => s.id === id)  // ❌ May be stale
  if (session && updates.name !== undefined && updates.name !== session.name) {
    logActivity({ /* ... */ })
  }
  // ...
}, [sessions, logActivity])
```

**Risk:** Activity logging might use outdated session name if multiple updates happen quickly.

**Fix:** Use the `updatedSession` from API response instead:
```typescript
const updatedSession: PlanningSession = await response.json()

// Log activity using updatedSession, not stale sessions.find()
if (updates.name !== undefined) {
  const oldSession = sessions.find((s) => s.id === id)
  if (oldSession && updatedSession.name !== oldSession.name) {
    logActivity({ /* ... */ })
  }
}
```

---

## High Priority Issues

### 4. Missing State Update for Uncommitted Sessions
**File:** `PlanningSessionsContext.tsx:252-258`  
**Issue:** When committing a session, the code uncommits other sessions via API but doesn't update local state if the API calls fail silently.

```typescript
for (const otherSession of otherCommittedSessions) {
  await fetch(`${API_BASE_URL}/update-scenario`, {
    // ...
  }).catch((err) => console.error('Error uncommitting other session:', err))  // ❌ Swallows error
}
```

**Risk:** Local state can show multiple committed sessions for the same quarter if API calls fail, leading to inconsistent UI.

**Fix:** Update local state optimistically, or handle errors properly:
```typescript
// Option 1: Update state optimistically before API calls
setSessions((prev) =>
  prev.map((session) => {
    if (session.id === id) {
      return { ...session, status: 'committed' as const, isCommitted: true }
    } else if ((session.planningPeriod || session.planning_period) === quarter && session.status === 'committed') {
      return { ...session, status: 'draft' as const, isCommitted: false }
    }
    return session
  })
)

// Then make API calls (with proper error handling)
```

---

### 5. Missing Normalization in Fallback Update
**File:** `RoadmapItemsContext.tsx:330`  
**Issue:** When `updateItem` falls back to localStorage, it doesn't normalize the updated item, potentially leaving invalid focus/work weeks.

```typescript
updated[sid] = items.map((item) => {
  if (item.id === itemId) {
    updatedItem = { ...item, ...updates }  // ❌ Not normalized
    sessionId = sid
    return updatedItem
  }
  return item
})
```

**Risk:** Items updated during offline/API failure may have invalid numeric fields.

**Fix:**
```typescript
updated[sid] = items.map((item) => {
  if (item.id === itemId) {
    updatedItem = normalizeRoadmapItem({ ...item, ...updates })  // ✅ Normalize
    sessionId = sid
    return updatedItem
  }
  return item
})
```

---

### 6. No Error State for ItemInputsContext
**File:** `ItemInputsContext.tsx`  
**Issue:** `ItemInputsContext` has no loading or error states, even though it performs localStorage operations that can fail.

**Risk:** If localStorage is full or blocked, operations fail silently. Components can't show loading/error states.

**Fix:** Add optional `isLoading` and `error` states (even if just for localStorage operations):
```typescript
interface ItemInputsContextType {
  getInputsForItem: (itemId: string) => ItemInputs | undefined
  setInputsForItem: (itemId: string, inputs: ItemInputs) => void
  isLoading?: boolean  // ✅ Optional for future DB integration
  error?: string | null
}
```

---

### 7. Inconsistent Error Handling in SettingsContext
**File:** `SettingsContext.tsx:152-154`  
**Issue:** When API save fails, the code falls back to localStorage but doesn't set an error state, making failures invisible to users.

```typescript
} catch (apiError) {
  console.warn('Failed to save settings to API, falling back to localStorage:', apiError)
  // ❌ No error state set, user doesn't know API failed
}
```

**Risk:** Users may think settings are saved to DB when they're only in localStorage.

**Fix:**
```typescript
} catch (apiError) {
  console.warn('Failed to save settings to API, falling back to localStorage:', apiError)
  setError('Settings saved locally but not synced to database. Check your connection.')
  // Continue with localStorage fallback
}
```

---

## Medium / Low Priority Issues

### 8. Redundant localStorage Save in PlanningSessionsContext
**File:** `PlanningSessionsContext.tsx:92, 110-114`  
**Issue:** `loadSessions` saves to localStorage at line 92, and then `useEffect` at line 110 also saves whenever `sessions` changes. This causes duplicate writes.

**Risk:** Minor performance issue, but not a bug.

**Fix:** Remove the save from `loadSessions` and let the `useEffect` handle it:
```typescript
// In loadSessions, remove:
// saveSessionsToStorage(data)  // ❌ Redundant

// Keep only the useEffect save
```

---

### 9. Hardcoded Focus-Time Ratio in Normalization
**File:** `RoadmapItemsContext.tsx:99`  
**Issue:** `normalizeRoadmapItem` uses hardcoded `0.75` instead of reading from settings.

**Risk:** If user changes focus-time ratio in settings, normalization still uses 0.75, causing inconsistency.

**Fix:** Accept `focusTimeRatio` as parameter or read from `SettingsContext`:
```typescript
function normalizeRoadmapItem(
  item: RoadmapItem,
  focusTimeRatio?: number  // ✅ Optional parameter
): RoadmapItem {
  const ratio = focusTimeRatio ?? 0.75
  // ...
}
```

Then in provider, read from settings:
```typescript
const { settings } = useSettings()
const focusTimeRatio = settings?.time_model.focusTimeRatio ?? 0.75
// Pass to normalizeRoadmapItem
```

---

### 10. Type Safety: Implicit Any in Parsed JSON
**File:** `ItemInputsContext.tsx:28, PlanningSessionsContext.tsx:35`  
**Issue:** `JSON.parse()` returns `any`, which is then used without type validation.

**Risk:** If localStorage contains corrupted data, runtime errors can occur.

**Fix:** Add type guards or use a validation library:
```typescript
function loadInputsFromStorage(): Record<string, ItemInputs> {
  // ...
  const parsed = JSON.parse(stored)
  // ✅ Validate structure
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed as Record<string, ItemInputs>
  }
  return {}
}
```

---

### 11. Missing Activity Logging for Item Deletion
**File:** `RoadmapItemsContext.tsx:355-398`  
**Issue:** `removeItem` doesn't log activity, unlike other operations.

**Risk:** Activity feed is incomplete.

**Fix:** Add activity logging:
```typescript
const removeItem = useCallback(async (sessionId: string, itemId: string): Promise<void> => {
  const itemToDelete = itemsBySession[sessionId]?.find((item) => item.id === itemId)
  const session = getSessionById(sessionId)
  
  try {
    // ... API call ...
    
    // Log activity
    if (itemToDelete && session) {
      logActivity({
        type: 'roadmap_item_deleted',
        scenarioId: sessionId,
        scenarioName: session.name,
        description: `Deleted roadmap item '${itemToDelete.name}' from scenario '${session.name}'.`,
      })
    }
    // ...
  }
}, [itemsBySession, getSessionById, logActivity])
```

---

### 12. No Retry Logic for Failed API Calls
**File:** All contexts  
**Issue:** When API calls fail, contexts immediately fall back to localStorage without retry logic.

**Risk:** Transient network errors cause immediate fallback, potentially losing data if user makes changes during fallback period.

**Fix:** Add simple retry logic (e.g., 1-2 retries with exponential backoff) before falling back:
```typescript
async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) return response
      if (i === retries) throw new Error(`Failed after ${retries} retries`)
    } catch (error) {
      if (i === retries) throw error
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
    }
  }
  throw new Error('Unexpected retry loop exit')
}
```

---

## Summary

**Critical:** 3 issues (stale state, infinite loop risk, stale closure)  
**High:** 4 issues (missing state updates, missing normalization, error handling)  
**Medium/Low:** 5 issues (optimization, type safety, missing features)

**Recommended Priority:**
1. Fix critical issues (#1, #2, #3) immediately
2. Address high priority issues (#4, #5, #6, #7) in next sprint
3. Schedule medium/low issues for future improvements
