# Netlify Functions Code Review
## Security, Type Safety, and Error Handling Analysis

**Date:** January 2026  
**Scope:** All Netlify Functions and database types  
**Focus:** SQL injection prevention, input validation, CORS consistency, error handling, type safety

---

## Executive Summary

**Overall Assessment:** Functions are generally well-structured with proper parameterization, but several issues need attention:
- ✅ **SQL Parameterization:** All queries use Neon's `sql` template correctly (no string interpolation)
- ⚠️ **Input Validation:** Some gaps in UUID validation and JSONB structure validation
- ⚠️ **Type Safety:** Several unsafe type casts and non-null assertions
- ⚠️ **Error Response Consistency:** Minor inconsistencies in error response shapes
- ⚠️ **JSONB Handling:** JSON.stringify usage is safe but could be cleaner

**Critical Issues:** 2  
**High Priority:** 5  
**Medium Priority:** 8  
**Low Priority:** 3

---

## Critical Issues

### CRIT-1: Unsafe Type Cast in create-scenario.ts
**File:** `netlify/functions/create-scenario.ts`  
**Line:** 68

**Issue:**
```typescript
planningPeriod: body.planningPeriod || (body.planning_period as any),
```

**Risk:** Using `as any` bypasses TypeScript's type checking. If `body.planning_period` is not a valid `PlanningPeriod`, this could cause runtime errors or data corruption.

**Fix:**
```typescript
// Validate and cast properly
const planningPeriod = body.planningPeriod || body.planning_period
if (!planningPeriod || typeof planningPeriod !== 'string') {
  return {
    statusCode: 400,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error: 'Invalid planning period: must be a string' }),
  }
}
// Use validated value
planningPeriod: planningPeriod as PlanningPeriod,
```

---

### CRIT-2: Non-Null Assertions in create-roadmap-item.ts
**File:** `netlify/functions/create-roadmap-item.ts`  
**Lines:** 95-97

**Issue:**
```typescript
VALUES (
  ${dbFormat.scenario_id!},
  ${dbFormat.key!},
  ${dbFormat.name!},
  ...
)
```

**Risk:** Non-null assertions (`!`) assume values exist, but `createRoadmapItemRequestToDbFormat` returns `Partial<DatabaseRoadmapItem>`. If validation fails silently, undefined values could be inserted, causing database errors or data corruption.

**Fix:**
```typescript
// Validate required fields after transformation
if (!dbFormat.scenario_id || !dbFormat.key || !dbFormat.name) {
  return {
    statusCode: 400,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error: 'Missing required fields after transformation' }),
  }
}

// Now safe to use
VALUES (
  ${dbFormat.scenario_id},
  ${dbFormat.key},
  ${dbFormat.name},
  ...
)
```

---

## High Priority Issues

### HIGH-1: Missing JSONB Structure Validation in update-settings.ts
**File:** `netlify/functions/update-settings.ts`  
**Lines:** 88-98

**Issue:** JSONB fields are merged without validating structure. Malformed JSONB could corrupt settings.

**Risk:** Invalid JSONB structure could break frontend parsing, causing blank pages or runtime errors.

**Fix:**
```typescript
// Validate effort_model structure if provided
if (body.effort_model) {
  if (body.effort_model.ux && typeof body.effort_model.ux !== 'object') {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid effort_model.ux: must be an object' }),
    }
  }
  if (body.effort_model.content && typeof body.effort_model.content !== 'object') {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid effort_model.content: must be an object' }),
    }
  }
  if (body.effort_model.pmIntakeMultiplier !== undefined && 
      typeof body.effort_model.pmIntakeMultiplier !== 'number') {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid effort_model.pmIntakeMultiplier: must be a number' }),
    }
  }
}

// Similar validation for time_model and size_bands...
```

---

### HIGH-2: Hardcoded JSON Strings in get-settings.ts
**File:** `netlify/functions/get-settings.ts`  
**Lines:** 64-92

**Issue:** Default settings are created with hardcoded JSON strings in SQL. While safe, this is harder to maintain and could lead to inconsistencies.

**Risk:** If default values change, they must be updated in multiple places (schema.sql and function).

**Fix:**
```typescript
// Define defaults as TypeScript objects
const defaultEffortModel = {
  ux: {
    productRisk: 1.2,
    problemAmbiguity: 1.0,
    discoveryDepth: 0.9,
  },
  content: {
    contentSurfaceArea: 1.3,
    localizationScope: 1.0,
    regulatoryBrandRisk: 1.2,
    legalComplianceDependency: 1.1,
  },
  pmIntakeMultiplier: 1.0,
}

const defaultTimeModel = { focusTimeRatio: 0.75 }
const defaultSizeBands = { xs: 1.6, s: 2.6, m: 3.6, l: 4.6, xl: 5.0 }

// Use parameterized JSONB
const defaultSettings = await sql`
  INSERT INTO settings (id, effort_model, time_model, size_bands)
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    ${JSON.stringify(defaultEffortModel)}::jsonb,
    ${JSON.stringify(defaultTimeModel)}::jsonb,
    ${JSON.stringify(defaultSizeBands)}::jsonb
  )
  RETURNING *
`
```

---

### HIGH-3: Missing Planning Period Format Validation
**File:** `netlify/functions/create-scenario.ts`  
**Lines:** 65-86

**Issue:** `planningSessionToDbFormat` extracts year from quarter string, but there's no validation that the quarter format is correct (e.g., "2026-Q1").

**Risk:** Invalid quarter formats could result in incorrect year extraction or database errors.

**Fix:**
```typescript
// Validate planning period format before transformation
const quarterPattern = /^(\d{4})-Q([1-4])$/
const planningPeriodStr = body.planningPeriod || body.planning_period
if (!planningPeriodStr || !quarterPattern.test(planningPeriodStr)) {
  return {
    statusCode: 400,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      error: 'Invalid planning period format. Expected format: YYYY-QN (e.g., "2026-Q1")' 
    }),
  }
}
```

---

### HIGH-4: Inconsistent Error Response Shapes
**Files:** All functions

**Issue:** Some error responses include `details`, others don't. Some use `error`, others use different field names.

**Risk:** Frontend error handling may break if it expects consistent error shapes.

**Current Pattern:**
```typescript
// Some functions:
body: JSON.stringify({ error: 'Message' })

// Others:
body: JSON.stringify({ error: 'Message', details: '...' })
```

**Fix:** Standardize on a consistent error response shape:
```typescript
// Create shared error response helper
function errorResponse(statusCode: number, message: string, details?: string) {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      error: message,
      ...(details && { details }),
    }),
  }
}

// Use consistently:
return errorResponse(400, 'Missing required field: id')
return errorResponse(500, 'Failed to create scenario', error.message)
```

---

### HIGH-5: Missing Validation for Calculated Fields in update-roadmap-item.ts
**File:** `netlify/functions/update-roadmap-item.ts`  
**Lines:** 141-148

**Issue:** Calculated fields (ux_score, content_score, ux_size, etc.) can be updated directly without validation. These should typically be calculated, not set manually.

**Risk:** Invalid calculated values could break frontend calculations or display logic.

**Fix:**
```typescript
// Validate numeric fields are numbers if provided
if (body.ux_score !== undefined && (typeof body.ux_score !== 'number' || isNaN(body.ux_score))) {
  return errorResponse(400, 'Invalid ux_score: must be a number')
}

if (body.ux_focus_weeks !== undefined && (typeof body.ux_focus_weeks !== 'number' || body.ux_focus_weeks < 0)) {
  return errorResponse(400, 'Invalid ux_focus_weeks: must be a non-negative number')
}

// Validate size bands are valid enum values
const validSizes = ['XS', 'S', 'M', 'L', 'XL'] as const
if (body.ux_size !== undefined && !validSizes.includes(body.ux_size)) {
  return errorResponse(400, `Invalid ux_size: must be one of ${validSizes.join(', ')}`)
}
```

---

## Medium Priority Issues

### MED-1: UUID Validation Helper Not Shared
**Files:** Multiple functions (update-scenario.ts, delete-scenario.ts, get-roadmap-items.ts, create-roadmap-item.ts, update-roadmap-item.ts, delete-roadmap-item.ts)

**Issue:** UUID validation regex is duplicated across multiple files. If the regex needs to change, it must be updated in many places.

**Risk:** Inconsistent validation or maintenance burden.

**Fix:** Create shared validation helper in `types.ts`:
```typescript
// In types.ts
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

// Use in functions:
import { isValidUUID } from './types'
if (!isValidUUID(body.id)) {
  return errorResponse(400, 'Invalid id format')
}
```

---

### MED-2: Missing Content-Type Header in Some Responses
**Files:** All functions

**Issue:** Some error responses don't include `'Content-Type': 'application/json'` in headers, though most do.

**Risk:** Browsers may not parse JSON correctly, causing frontend parsing errors.

**Fix:** Ensure all responses include Content-Type header (use shared helper).

---

### MED-3: JSONB Fields Not Validated for Structure
**Files:** create-roadmap-item.ts, update-roadmap-item.ts

**Issue:** `pm_intake`, `ux_factors`, and `content_factors` are inserted/updated without validating their structure matches expected types.

**Risk:** Invalid JSONB structure could break frontend parsing or calculations.

**Fix:**
```typescript
// Validate PMIntake structure if provided
if (body.pm_intake) {
  if (typeof body.pm_intake !== 'object' || body.pm_intake === null) {
    return errorResponse(400, 'Invalid pm_intake: must be an object')
  }
  // Validate specific fields if needed
  if (body.pm_intake.quality !== undefined && 
      (typeof body.pm_intake.quality !== 'number' || body.pm_intake.quality < 1 || body.pm_intake.quality > 5)) {
    return errorResponse(400, 'Invalid pm_intake.quality: must be a number between 1 and 5')
  }
}
```

---

### MED-4: No Validation That Scenario Exists Before Creating Roadmap Item
**File:** `netlify/functions/create-roadmap-item.ts`

**Issue:** Function validates UUID format but doesn't check if scenario exists before inserting roadmap item.

**Risk:** Foreign key constraint violation could occur, or orphaned items if scenario is deleted.

**Fix:**
```typescript
// Check if scenario exists before inserting
const scenarioCheck = await sql<{ id: string }>`
  SELECT id FROM scenarios WHERE id = ${body.scenario_id}
`
if (scenarioCheck.length === 0) {
  return errorResponse(404, 'Scenario not found')
}
```

---

### MED-5: Missing Validation for Numeric Ranges
**Files:** create-scenario.ts, update-scenario.ts

**Issue:** Numeric fields (weeks_per_period, sprint_length_weeks, ux_designers, content_designers) are not validated for reasonable ranges.

**Risk:** Invalid values (negative, extremely large) could break calculations or display.

**Fix:**
```typescript
// Validate numeric ranges
if (body.weeks_per_period !== undefined) {
  if (typeof body.weeks_per_period !== 'number' || body.weeks_per_period < 1 || body.weeks_per_period > 52) {
    return errorResponse(400, 'Invalid weeks_per_period: must be between 1 and 52')
  }
}

if (body.ux_designers !== undefined) {
  if (typeof body.ux_designers !== 'number' || body.ux_designers < 0 || body.ux_designers > 100) {
    return errorResponse(400, 'Invalid ux_designers: must be between 0 and 100')
  }
}
```

---

### MED-6: Potential Race Condition in update-scenario.ts
**File:** `netlify/functions/update-scenario.ts`  
**Lines:** 77-91, 117-132

**Issue:** Function fetches current scenario, then updates. Between fetch and update, scenario could be deleted or modified.

**Risk:** Updates could overwrite concurrent changes or fail silently.

**Fix:** Use optimistic locking or check updated_at timestamp:
```typescript
// Add updated_at check to prevent race conditions
const result = await sql<DatabaseScenario>`
  UPDATE scenarios
  SET 
    title = ${finalUpdates.title ?? currentScenario.title},
    ...
    updated_at = NOW()
  WHERE id = ${body.id}
    AND updated_at = ${currentScenario.updated_at}  -- Optimistic locking
  RETURNING *
`

if (result.length === 0) {
  return errorResponse(409, 'Scenario was modified by another request. Please refresh and try again.')
}
```

---

### MED-7: Missing Transaction for Multi-Step Operations
**File:** `netlify/functions/update-roadmap-item.ts`

**Issue:** Function performs multiple operations (fetch current, merge, update) without transaction. If update fails partway, data could be inconsistent.

**Risk:** Partial updates could leave data in invalid state.

**Note:** Neon serverless may not support transactions. Verify and document if transactions are not available.

**Fix (if transactions supported):**
```typescript
// Wrap in transaction if supported
await sql.begin(async (sql) => {
  const current = await sql`SELECT * FROM roadmap_items WHERE id = ${body.id}`
  // ... merge logic ...
  const result = await sql`UPDATE ... RETURNING *`
  return result[0]
})
```

---

### MED-8: Inconsistent Response Types for Empty Results
**Files:** get-scenarios.ts, get-roadmap-items.ts

**Issue:** Functions return empty arrays `[]` when no results found, which is correct. However, frontend should handle this consistently.

**Risk:** Frontend may not handle empty arrays correctly, causing display issues.

**Fix:** Document expected behavior and ensure frontend handles empty arrays. Consider adding metadata:
```typescript
return {
  statusCode: 200,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: scenarios,
    count: scenarios.length,
  }),
}
```

---

## Low Priority Issues

### LOW-1: CORS Headers Duplicated
**Files:** All functions

**Issue:** CORS headers are defined in each function file. Could be shared.

**Risk:** Maintenance burden if CORS policy changes.

**Fix:** Create shared CORS helper in `types.ts`:
```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}
```

---

### LOW-2: Missing Request Size Limits
**Files:** All POST/PUT functions

**Issue:** No validation of request body size. Extremely large requests could cause memory issues.

**Risk:** DoS vulnerability or memory exhaustion.

**Fix:** Add size check:
```typescript
if (event.body && event.body.length > 100000) { // 100KB limit
  return errorResponse(413, 'Request body too large')
}
```

---

### LOW-3: No Rate Limiting
**Files:** All functions

**Issue:** No rate limiting implemented. Could be abused.

**Risk:** DoS vulnerability or excessive database load.

**Fix:** Implement rate limiting at Netlify level or in functions (consider Netlify's built-in rate limiting).

---

## Recommendations

### 1. Create Shared Utilities Module
Create `netlify/functions/utils.ts` with:
- `errorResponse()` helper for consistent error responses
- `isValidUUID()` validation
- `validatePlanningPeriod()` validation
- `corsHeaders` constant
- `validateJSONB()` helpers

### 2. Add Request/Response Type Guards
Create runtime type validation using Zod or similar:
```typescript
import { z } from 'zod'

const CreateScenarioRequestSchema = z.object({
  name: z.string().min(1).max(200),
  planningPeriod: z.string().regex(/^\d{4}-Q[1-4]$/),
  // ...
})

// Validate in function:
const parseResult = CreateScenarioRequestSchema.safeParse(body)
if (!parseResult.success) {
  return errorResponse(400, 'Invalid request', parseResult.error.message)
}
const validatedBody = parseResult.data
```

### 3. Add Integration Tests
Create tests that verify:
- SQL parameterization (no string interpolation)
- Input validation catches invalid inputs
- Error responses are consistent
- Type transformations are correct

### 4. Add Logging/Monitoring
Add structured logging for:
- All database operations
- Validation failures
- Error occurrences
- Performance metrics

---

## Summary of Required Changes

### Immediate (Critical + High Priority)
1. Fix unsafe type cast in `create-scenario.ts` (CRIT-1)
2. Fix non-null assertions in `create-roadmap-item.ts` (CRIT-2)
3. Add JSONB structure validation in `update-settings.ts` (HIGH-1)
4. Refactor hardcoded JSON in `get-settings.ts` (HIGH-2)
5. Add planning period format validation (HIGH-3)
6. Standardize error response shapes (HIGH-4)
7. Add calculated field validation in `update-roadmap-item.ts` (HIGH-5)

### Short Term (Medium Priority)
8. Create shared UUID validation helper (MED-1)
9. Ensure all responses include Content-Type (MED-2)
10. Add JSONB structure validation (MED-3)
11. Validate scenario exists before creating item (MED-4)
12. Add numeric range validation (MED-5)
13. Consider optimistic locking (MED-6)

### Long Term (Low Priority + Recommendations)
14. Create shared utilities module
15. Add request/response type guards (Zod)
16. Add integration tests
17. Add logging/monitoring

---

**Review Completed:** January 2026  
**Next Steps:** Implement critical and high-priority fixes, then create shared utilities module.
