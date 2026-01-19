# Scenarios DB Integration - Security & Type Safety Review

**Date:** January 19, 2026  
**Review Focus:** Parameterized queries, CORS, TypeScript types

## Summary

All scenarios Netlify Functions have been reviewed and updated to ensure:
1. ✅ **Parameterized queries** - All SQL queries use Neon's parameterized template literals
2. ✅ **CORS consistency** - All functions have consistent CORS headers
3. ✅ **Strong typing** - End-to-end TypeScript types from database to React context

## Security Improvements

### Parameterized Queries

All functions use Neon's `sql` template literal syntax, which automatically parameterizes queries and prevents SQL injection:

```typescript
// ✅ Safe - Neon parameterizes these values
const result = await sql`
  SELECT * FROM scenarios WHERE id = ${id}
`

// ✅ Safe - All values are parameterized
const result = await sql`
  INSERT INTO scenarios (title, quarter, year)
  VALUES (${title}, ${quarter}, ${year})
`
```

**Functions reviewed:**
- `get-scenarios.ts` - ✅ Uses parameterized SELECT
- `create-scenario.ts` - ✅ Uses parameterized INSERT
- `update-scenario.ts` - ✅ Uses parameterized UPDATE
- `delete-scenario.ts` - ✅ Uses parameterized DELETE and SELECT

### Input Validation

Added validation for:
- **UUID format** - Basic regex check for UUIDs in `update-scenario.ts` and `delete-scenario.ts`
- **JSON parsing** - Try/catch blocks around `JSON.parse()` with proper error responses
- **Required fields** - Validation before database operations

## CORS Configuration

All functions have consistent CORS headers:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': '<METHOD>, OPTIONS',
}
```

**Methods:**
- `get-scenarios.ts` - `GET, OPTIONS`
- `create-scenario.ts` - `POST, OPTIONS`
- `update-scenario.ts` - `PUT, OPTIONS`
- `delete-scenario.ts` - `DELETE, OPTIONS`

All functions handle OPTIONS preflight requests correctly.

## TypeScript Type Safety

### New Shared Types File

Created `netlify/functions/types.ts` with:

1. **`DatabaseScenario`** - Database schema representation
   ```typescript
   interface DatabaseScenario {
     id: string
     title: string
     quarter: string
     year: number
     committed: boolean
     // ... other fields
   }
   ```

2. **`CreateScenarioRequest`** - API request type
3. **`UpdateScenarioRequest`** - API request type
4. **`ScenarioResponse`** - API response type (alias for `PlanningSession`)
5. **`ErrorResponse`** - Error response type

### Type Transformations

Helper functions ensure type-safe transformations:

- **`dbScenarioToPlanningSession()`** - Transforms database format → PlanningSession
- **`planningSessionToDbFormat()`** - Transforms PlanningSession → database format

### Function Updates

All functions now:
- Use typed database queries: `sql<DatabaseScenario>`
- Return typed responses: `ScenarioResponse`
- Use helper functions for transformations
- Remove `any` types

## Response Shape Verification

### get-scenarios
- **Returns:** `PlanningSession[]` (as `ScenarioResponse[]`)
- **Context expects:** `PlanningSession[]`
- ✅ **Match**

### create-scenario
- **Returns:** `PlanningSession` (as `ScenarioResponse`)
- **Context expects:** `PlanningSession`
- ✅ **Match**

### update-scenario
- **Returns:** `PlanningSession` (as `ScenarioResponse`)
- **Context usage:** Updates state, doesn't use return value
- ✅ **Compatible**

### delete-scenario
- **Returns:** `{ success: true, id: string }`
- **Context usage:** Updates state, doesn't use return value
- ✅ **Compatible**

## Code Quality Improvements

1. **Removed `any` types** - All database results are properly typed
2. **Consistent error handling** - All functions use try/catch with proper error responses
3. **Input validation** - UUID format checks, JSON parsing validation
4. **Documentation** - JSDoc comments on helper functions
5. **Type safety** - End-to-end typing from database to React context

## Testing Recommendations

1. **SQL Injection** - Verify parameterized queries prevent injection
2. **CORS** - Test from different origins (local dev, production)
3. **Type safety** - Verify TypeScript compilation catches type mismatches
4. **Error handling** - Test invalid UUIDs, missing fields, malformed JSON

## Files Changed

- ✅ `netlify/functions/types.ts` - New shared types file
- ✅ `netlify/functions/get-scenarios.ts` - Updated with types
- ✅ `netlify/functions/create-scenario.ts` - Updated with types and validation
- ✅ `netlify/functions/update-scenario.ts` - Updated with types and validation
- ✅ `netlify/functions/delete-scenario.ts` - Updated with types and validation

## Next Steps

- [ ] Add integration tests for type safety
- [ ] Consider stricter CORS in production (replace `*` with specific origins)
- [ ] Add request rate limiting
- [ ] Add request body size limits
