# Persistence Strategy

The Capacity Planning App uses a **dual-persistence strategy** for all core data models. This ensures the app remains functional even when the database or network is unavailable, while maintaining data consistency when online.

## Overview

**Primary Source**: Neon Postgres database via Netlify Functions  
**Secondary Source**: Browser `localStorage` as a fallback

This pattern provides:
- **Resilience**: App continues working offline or when DB is unavailable
- **Performance**: Immediate UI updates with optimistic rendering
- **Data Safety**: Changes are never lost, even if DB sync fails
- **User Awareness**: Error states inform users when DB sync fails

## Context-by-Context Breakdown

### SettingsContext

**Primary**: `/.netlify/functions/get-settings` and `/.netlify/functions/update-settings`

**Read Behavior**:
- On mount: Attempts to load from API first
- If API succeeds: Updates state and saves to `localStorage` as backup
- If API fails: Falls back to `localStorage.getItem('designCapacity.settings')`
- If `localStorage` is empty: Uses `DEFAULT_SETTINGS`

**Write Behavior**:
- On save: Attempts to save to API first
- If API succeeds: Updates state and saves to `localStorage` as backup, clears error
- If API fails: Saves to `localStorage` only, sets error: `"Settings saved locally but not synced to database: {error}. Check your connection."`

**Error State**:
- `error`: Set when API save fails (user-visible via Alert banner on Settings page)
- `loading`: Set during initial load and save operations

**localStorage Key**: `designCapacity.settings`

---

### PlanningSessionsContext

**Primary**: `/.netlify/functions/get-scenarios`, `/.netlify/functions/create-scenario`, `/.netlify/functions/update-scenario`, `/.netlify/functions/delete-scenario`

**Read Behavior**:
- On mount: Attempts to load from API via `loadSessions()`
- If API succeeds: Updates state and saves to `localStorage` as backup
- If API fails: Falls back to `localStorage`, sets error: `"Failed to load scenarios from database. Using local data."`
- Also saves to `localStorage` automatically whenever `sessions` state changes (via `useEffect`)

**Write Behavior**:
- **Create**: Attempts API first, falls back to `localStorage` on failure
- **Update**: Attempts API first, falls back to `localStorage` on failure
- **Commit/Uncommit**: Attempts API first, falls back to `localStorage` on failure
- **Delete**: Attempts API first, falls back to `localStorage` on failure
- All operations save to `localStorage` as backup even when API succeeds

**Error State**:
- `error`: Set when API operations fail (user-visible via Alert banners on Home, Sessions List, Summary, Quarterly Capacity pages)
- `isLoading`: Set during load and async operations

**localStorage Key**: `designCapacity.sessions`

---

### RoadmapItemsContext

**Primary**: `/.netlify/functions/get-roadmap-items`, `/.netlify/functions/create-roadmap-item`, `/.netlify/functions/update-roadmap-item`, `/.netlify/functions/delete-roadmap-item`

**Read Behavior**:
- On mount: Initializes from `localStorage` for immediate availability (normalized)
- On `loadItemsForSession(sessionId)`: Attempts to load from API first
- If API succeeds: Updates state and saves to `localStorage` as backup
- If API fails: Falls back to `localStorage` for that session
- Automatically saves to `localStorage` whenever `itemsBySession` or `inputsByItemId` change (via `useEffect`)

**Write Behavior**:
- **Create**: Attempts API first, falls back to `localStorage` on failure (with normalized defaults)
- **Update**: Attempts API first, falls back to `localStorage` on failure (with normalization), sets error if API fails
- **Delete**: Attempts API first, falls back to `localStorage` on failure
- All operations save to `localStorage` as backup even when API succeeds

**Error State**:
- `error`: Set when API update fails (user-visible via Alert banners on Session Summary and Committed Plan pages)
- `isLoading`: Set during load operations

**localStorage Keys**: 
- `designCapacity.roadmapItems` (for items)
- `designCapacity.itemInputs` (for inputs)

**Special Notes**:
- Items are normalized on load to ensure valid `focusWeeks` and `workWeeks` values
- Normalization happens for both API and `localStorage` data

---

### ActivityContext

**Primary**: `/.netlify/functions/get-activity-log` and `/.netlify/functions/create-activity-log-entry`

**Read Behavior**:
- On mount: Attempts to load from API via `loadActivity()`
- If API succeeds: Updates state and saves to `localStorage` as backup
- If API fails: Falls back to `localStorage.getItem('designCapacity.activity')`
- Can filter by `scenarioId` when provided

**Write Behavior**:
- On `logActivity()`: 
  - Optimistically updates UI immediately
  - Saves to `localStorage` immediately
  - Attempts to save to API in background
  - If API succeeds: Replaces temp entry with server-provided ID
  - If API fails: Keeps temp entry, sets error: `"Activity saved locally but not synced: {error}"`
- Duplicate detection prevents rapid duplicate entries (same description within 1 second)

**Error State**:
- `error`: Set when API save fails (currently not displayed in UI, but available in context)
- `isLoading`: Set during load operations

**localStorage Key**: `designCapacity.activity`

**Special Notes**:
- Uses temporary IDs (`temp-{uuid}`) for optimistic updates, replaced with server IDs on success
- Maximum 100 entries kept in memory and `localStorage`

---

### ItemInputsContext

**Primary**: `localStorage` only (no database integration yet)

**Read Behavior**:
- On mount: Loads from `localStorage.getItem('designCapacity.itemInputs')`
- No API fallback (this context is localStorage-only)

**Write Behavior**:
- On `setInputsForItem()`: Updates state immediately
- Automatically saves to `localStorage` whenever `inputsByItemId` changes (via `useEffect`)

**Error State**:
- `error`: Set when `localStorage` save fails (user-visible via Alert banner on Item Detail page)
- No `isLoading` state (synchronous operations)

**localStorage Key**: `designCapacity.itemInputs`

**Special Notes**:
- This context is intentionally localStorage-only for now
- Future: May be migrated to database if needed for cross-device sync

---

## Error Handling Patterns

### When DB/Netlify Functions Fail

1. **User Experience**:
   - Chakra UI `Alert` banners appear at the top of relevant pages
   - Message format: `"{Context} Error: {error message}"` or `"Sync Error: {error message}"`
   - Styling: Dark background (`#141419`), amber border, warning icon

2. **Data Behavior**:
   - All changes are saved to `localStorage` immediately
   - UI updates optimistically (user sees changes right away)
   - Error message indicates data is saved locally but not synced to database
   - When DB comes back online, next API call will sync the data

3. **Error States**:
   - `isLoading`: Indicates async operation in progress
   - `error`: String message describing the failure (null when successful)

### Example Error Messages

- Settings: `"Settings saved locally but not synced to database: {error}. Check your connection."`
- Sessions: `"Failed to load scenarios from database. Using local data."`
- Roadmap Items: `"Failed to update roadmap item in database. Changes saved locally."`
- Activity: `"Activity saved locally but not synced: {error}"`

---

## localStorage as Safety Net

### Current Status

`localStorage` is a **deliberate safety net** that ensures:
- No data loss during network outages
- App remains functional offline
- Graceful degradation when database is unavailable

### Future Considerations

`localStorage` fallback may be removed or reduced when:
- Database reliability is proven in production
- Offline-first architecture is implemented (e.g., Service Workers + IndexedDB)
- Cross-device sync requirements make localStorage insufficient
- Performance optimization requires reducing localStorage writes

**Decision Criteria**:
- Monitor error rates: If DB failures are rare (< 0.1%), consider reducing localStorage writes
- User feedback: If users report data loss, keep localStorage
- Performance: If localStorage writes cause UI lag, optimize or reduce

---

## Verification

### Health Check

A database health check is available at `/.netlify/functions/db-health`:
- Returns `200 OK` if database connection succeeds
- Returns `500` if database connection fails
- Can be called from React components to display connection status

See `src/utils/useDbHealth.ts` for a React hook that polls the health endpoint.

---

## Best Practices

1. **Always use functional `setState`** when reading from state in callbacks to avoid stale closures
2. **Normalize data** when loading from both API and localStorage to ensure consistency
3. **Set error states** when API fails but localStorage succeeds, so users know sync status
4. **Clear errors** on successful API operations
5. **Use optimistic updates** for immediate UI feedback, then sync with server
6. **Handle duplicates** when rapid operations might create duplicate entries

---

## Testing the Fallback

To test localStorage fallback behavior:

1. **Simulate API failure**: Block network requests in DevTools
2. **Check error banners**: Verify Alert banners appear with appropriate messages
3. **Verify data persistence**: Confirm changes are saved to localStorage
4. **Test recovery**: Re-enable network and verify data syncs on next operation

---

## Related Documentation

- [Error Handling and Resilience](./error-handling-and-resilience.md)
- [Context Error Handling](./context-error-handling.md)
- [Database and Settings](./database-and-settings.md)
