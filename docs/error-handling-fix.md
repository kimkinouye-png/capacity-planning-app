# Error Handling Fix

**Date:** January 21, 2026  
**Issue:** Retry button not working, persistent error banner, poor error differentiation  
**Solution:** Improved error handling with better differentiation, functional retry, and conditional error display

---

## Problems Fixed

### 1. Persistent Error Banner
**Issue:** Error banner showing "Session Error: Failed to load scenarios from database. Using local data." even when data loaded successfully from localStorage fallback.

**Fix:** 
- Error is now only set when **both** API and localStorage fail (no data at all)
- If localStorage has data, fallback succeeded → no error shown
- Error banner only appears when data exists but there was a warning

### 2. Retry Button Not Working
**Issue:** Retry button called `loadSessions()` but didn't help when session didn't exist in database.

**Fix:**
- Retry button now reloads the page (`window.location.reload()`) for full retry
- Added "Go to Scenarios List" button as alternative
- Better handling for session not found case

### 3. Poor Error Differentiation
**Issue:** All errors showed same generic message.

**Fix:** Added specific error types:
- **Session Not Found** → Suggests going to scenarios list
- **Timeout** → Explains database wake-up delay, suggests waiting
- **Connection Error** → Suggests checking internet connection
- **Server Error** → Suggests trying again later

---

## Files Modified

### Core Context
- `src/context/PlanningSessionsContext.tsx`
  - Only set error when both API and localStorage fail
  - Differentiate error types (timeout, connection, server, not found)
  - Clear error when data successfully loads

### Pages Updated
- `src/pages/SessionSummaryPage.tsx`
  - Improved error page with better messaging
  - Functional Retry button (reloads page)
  - Better "Session not found" page
  - Error banner only shows when session exists

- `src/pages/SessionsListPage.tsx`
  - Error banner only shows when sessions exist
  - Added "Retry Sync" button to error banner

- `src/pages/QuarterlyCapacityPage.tsx`
  - Error banner only shows when sessions exist

- `src/pages/HomePage.tsx`
  - Error banner only shows when sessions exist

---

## Changes Made

### 1. PlanningSessionsContext.tsx

**Before:**
```typescript
catch (err) {
  // Always set error in production, even if localStorage has data
  if (!isDevMode) {
    setError('Failed to load scenarios from database. Using local data.')
  }
  const localSessions = loadSessionsFromStorage()
  setSessions(localSessions)
}
```

**After:**
```typescript
catch (err) {
  const localSessions = loadSessionsFromStorage()
  setSessions(localSessions)
  
  // Only set error if we have no data at all
  if (localSessions.length === 0) {
    // Differentiate error types
    if (error.message === 'NOT_FOUND') {
      setError('Scenarios not found in database.')
    } else if (error.message === 'TIMEOUT') {
      setError('Database connection timed out. Please try again.')
    } else if (error.message === 'SERVER_ERROR') {
      setError('Database server error. Please try again later.')
    } else {
      setError('Failed to load scenarios from database.')
    }
  } else {
    // We have local data, so fallback succeeded - don't show error
    setError(null)
  }
}
```

### 2. SessionSummaryPage.tsx

**Error Page (Before):**
```tsx
if (sessionsError) {
  return (
    <Box>
      <Text>Error loading session: {sessionsError}</Text>
      <Button onClick={() => loadSessions()}>Retry</Button>
      <Button onClick={() => navigate('/')}>Go Home</Button>
    </Box>
  )
}
```

**Error Page (After):**
```tsx
if (sessionsError && !session && !isLoading) {
  const isTimeout = sessionsError.toLowerCase().includes('timeout')
  const isConnectionError = sessionsError.toLowerCase().includes('cannot connect')
  
  return (
    <Box>
      <VStack spacing={4}>
        <Text color="red.400">Error Loading Session</Text>
        <Text>{sessionsError}</Text>
        
        {isTimeout && (
          <Box>
            The database connection timed out. This may happen when the database 
            is waking up from inactivity. Please wait a moment and try again.
          </Box>
        )}
        
        <HStack>
          <Button onClick={() => window.location.reload()}>Retry</Button>
          <Button onClick={() => navigate('/')}>Go to Scenarios List</Button>
        </HStack>
      </VStack>
    </Box>
  )
}
```

**Session Not Found Page (After):**
```tsx
if (!session && !isLoading && !sessionsError) {
  return (
    <Box>
      <VStack spacing={4}>
        <Text color="red.400">Session Not Found</Text>
        <Text>
          The session with ID "{id}" could not be found. It may have been deleted, 
          or you may be accessing a session from a different database.
        </Text>
        <Box>
          💡 Tip: If you're switching between different database environments, 
          make sure you're accessing the correct site URL.
        </Box>
        <HStack>
          <Button onClick={() => loadSessions().then(...)}>Reload Sessions</Button>
          <Button onClick={() => navigate('/')}>Go to Scenarios List</Button>
        </HStack>
      </VStack>
    </Box>
  )
}
```

**Error Banner (After):**
```tsx
{/* Only show if session exists (data loaded) */}
{sessionsError && session && (
  <Alert status="warning">
    <AlertTitle>Warning:</AlertTitle>
    <AlertDescription>{sessionsError}</AlertDescription>
    <Button onClick={() => loadSessions()}>Retry Sync</Button>
  </Alert>
)}
```

### 3. Other Pages

**Error Banner (Before):**
```tsx
{sessionsError && (
  <Alert status="warning">
    <AlertTitle>Session Error:</AlertTitle>
    <AlertDescription>{sessionsError}</AlertDescription>
  </Alert>
)}
```

**Error Banner (After):**
```tsx
{/* Only show if sessions exist (fallback succeeded) */}
{sessionsError && sessions.length > 0 && (
  <Alert status="warning">
    <AlertTitle>Warning:</AlertTitle>
    <AlertDescription>{sessionsError}</AlertDescription>
    <Button onClick={() => loadSessions()}>Retry Sync</Button>
  </Alert>
)}
```

---

## Error Types

### 1. Session Not Found
- **When:** Session ID doesn't exist in database
- **Message:** "Session Not Found"
- **Action:** Suggests going to scenarios list, explains database environment differences

### 2. Timeout
- **When:** Database connection times out (often during wake-up)
- **Message:** "Database connection timed out. Please try again."
- **Action:** Explains wake-up delay, suggests waiting and retrying

### 3. Connection Error
- **When:** Cannot connect to database (network issue)
- **Message:** "Cannot connect to database. Check your connection and try again."
- **Action:** Suggests checking internet connection

### 4. Server Error
- **When:** Database server returns 500+ error
- **Message:** "Database server error. Please try again later."
- **Action:** Suggests trying again in a few moments

### 5. Generic Error
- **When:** Other API failures
- **Message:** "Failed to load scenarios from database."
- **Action:** Generic retry

---

## Behavior Changes

### Before
- ❌ Error banner always shown when API fails, even if localStorage has data
- ❌ Retry button didn't work (just called loadSessions which didn't help)
- ❌ All errors showed same generic message
- ❌ No differentiation between error types

### After
- ✅ Error banner only shown when data exists but there was a warning
- ✅ Retry button reloads page (full retry)
- ✅ Specific error messages for different error types
- ✅ Better user guidance based on error type
- ✅ "Session not found" page with helpful tips
- ✅ Error banner has "Retry Sync" button

---

## Testing

After deployment, verify:

1. ✅ **API fails, localStorage has data** → No error banner (fallback succeeded)
2. ✅ **API fails, localStorage empty** → Error page with specific message
3. ✅ **Session not found** → "Session Not Found" page with helpful message
4. ✅ **Timeout error** → Shows timeout-specific message and guidance
5. ✅ **Retry button** → Reloads page successfully
6. ✅ **Error banner** → Only shows when data exists, has "Retry Sync" button

---

## Notes

- Error banner changed from "Session Error:" to "Warning:" to reflect that it's a warning, not a critical error
- Retry button now uses `window.location.reload()` for full page reload (more reliable than just calling loadSessions)
- Error differentiation helps users understand what went wrong and what to do
- "Session not found" page explains database environment differences (helpful for multi-database setups)
