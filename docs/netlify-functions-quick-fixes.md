# Netlify Functions - Quick Fixes Reference
## Critical and High-Priority Issues with Concrete Code Changes

---

## CRITICAL FIXES

### 1. Fix Unsafe Type Cast in create-scenario.ts

**File:** `netlify/functions/create-scenario.ts`  
**Line:** 68

**Replace:**
```typescript
const dbFormat = planningSessionToDbFormat({
  name: body.name,
  planningPeriod: body.planningPeriod || (body.planning_period as any),
  weeks_per_period: body.weeks_per_period ?? 13,
  sprint_length_weeks: body.sprint_length_weeks ?? 2,
  ux_designers: body.ux_designers ?? 0,
  content_designers: body.content_designers ?? 0,
  status: 'draft',
})
```

**With:**
```typescript
// Validate planning period format
const quarterPattern = /^(\d{4})-Q([1-4])$/
const planningPeriodStr = body.planningPeriod || body.planning_period
if (!planningPeriodStr || typeof planningPeriodStr !== 'string' || !quarterPattern.test(planningPeriodStr)) {
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

const dbFormat = planningSessionToDbFormat({
  name: body.name,
  planningPeriod: planningPeriodStr as PlanningPeriod,
  weeks_per_period: body.weeks_per_period ?? 13,
  sprint_length_weeks: body.sprint_length_weeks ?? 2,
  ux_designers: body.ux_designers ?? 0,
  content_designers: body.content_designers ?? 0,
  status: 'draft',
})
```

---

### 2. Fix Non-Null Assertions in create-roadmap-item.ts

**File:** `netlify/functions/create-roadmap-item.ts`  
**Lines:** 78-106

**Replace:**
```typescript
// Map request format to database format
const dbFormat = createRoadmapItemRequestToDbFormat(body)

// Insert new roadmap item (parameterized query)
const result = await sql<DatabaseRoadmapItem>`
  INSERT INTO roadmap_items (
    scenario_id,
    key,
    name,
    initiative,
    priority,
    status,
    pm_intake,
    ux_factors,
    content_factors
  )
  VALUES (
    ${dbFormat.scenario_id!},
    ${dbFormat.key!},
    ${dbFormat.name!},
    ${dbFormat.initiative ?? null},
    ${dbFormat.priority ?? null},
    ${dbFormat.status || 'draft'},
    ${dbFormat.pm_intake ? JSON.stringify(dbFormat.pm_intake) : null}::jsonb,
    ${dbFormat.ux_factors ? JSON.stringify(dbFormat.ux_factors) : null}::jsonb,
    ${dbFormat.content_factors ? JSON.stringify(dbFormat.content_factors) : null}::jsonb
  )
  RETURNING *
`
```

**With:**
```typescript
// Map request format to database format
const dbFormat = createRoadmapItemRequestToDbFormat(body)

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

// Check if scenario exists before inserting
const scenarioCheck = await sql<{ id: string }>`
  SELECT id FROM scenarios WHERE id = ${dbFormat.scenario_id}
`
if (scenarioCheck.length === 0) {
  return {
    statusCode: 404,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error: 'Scenario not found' }),
  }
}

// Insert new roadmap item (parameterized query)
const result = await sql<DatabaseRoadmapItem>`
  INSERT INTO roadmap_items (
    scenario_id,
    key,
    name,
    initiative,
    priority,
    status,
    pm_intake,
    ux_factors,
    content_factors
  )
  VALUES (
    ${dbFormat.scenario_id},
    ${dbFormat.key},
    ${dbFormat.name},
    ${dbFormat.initiative ?? null},
    ${dbFormat.priority ?? null},
    ${dbFormat.status || 'draft'},
    ${dbFormat.pm_intake ? JSON.stringify(dbFormat.pm_intake) : null}::jsonb,
    ${dbFormat.ux_factors ? JSON.stringify(dbFormat.ux_factors) : null}::jsonb,
    ${dbFormat.content_factors ? JSON.stringify(dbFormat.content_factors) : null}::jsonb
  )
  RETURNING *
`
```

---

## HIGH PRIORITY FIXES

### 3. Add Shared Error Response Helper

**File:** `netlify/functions/types.ts`  
**Add at end of file:**

```typescript
/**
 * Standardized error response helper
 */
export function errorResponse(
  statusCode: number,
  message: string,
  details?: string
): {
  statusCode: number
  headers: Record<string, string>
  body: string
} {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      error: message,
      ...(details && { details }),
    }),
  }
}

/**
 * UUID validation helper
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}
```

**Then update all functions to use:**
```typescript
import { errorResponse, isValidUUID } from './types'

// Replace all error returns with:
return errorResponse(400, 'Missing required field: id')
return errorResponse(400, 'Invalid id format')
return errorResponse(404, 'Scenario not found')
return errorResponse(500, 'Failed to create scenario', error instanceof Error ? error.message : 'Unknown error')
```

---

### 4. Add JSONB Structure Validation in update-settings.ts

**File:** `netlify/functions/update-settings.ts`  
**After line 65, add:**

```typescript
// Validate effort_model structure if provided
if (body.effort_model) {
  if (body.effort_model.ux && typeof body.effort_model.ux !== 'object') {
    return {
      statusCode: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Invalid effort_model.ux: must be an object' }),
    }
  }
  if (body.effort_model.content && typeof body.effort_model.content !== 'object') {
    return {
      statusCode: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Invalid effort_model.content: must be an object' }),
    }
  }
  if (body.effort_model.pmIntakeMultiplier !== undefined && 
      (typeof body.effort_model.pmIntakeMultiplier !== 'number' || 
       body.effort_model.pmIntakeMultiplier < 0 || 
       body.effort_model.pmIntakeMultiplier > 10)) {
    return {
      statusCode: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Invalid effort_model.pmIntakeMultiplier: must be a number between 0 and 10' }),
    }
  }
}

// Validate size_bands structure if provided
if (body.size_bands) {
  const validKeys = ['xs', 's', 'm', 'l', 'xl']
  for (const key of Object.keys(body.size_bands)) {
    if (!validKeys.includes(key)) {
      return {
        statusCode: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: `Invalid size_bands key: ${key}. Must be one of ${validKeys.join(', ')}` }),
      }
    }
    const value = (body.size_bands as any)[key]
    if (typeof value !== 'number' || value < 0) {
      return {
        statusCode: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: `Invalid size_bands.${key}: must be a non-negative number` }),
      }
    }
  }
}
```

---

### 5. Add Calculated Field Validation in update-roadmap-item.ts

**File:** `netlify/functions/update-roadmap-item.ts`  
**After line 75, add:**

```typescript
// Validate numeric fields if provided
if (body.ux_score !== undefined && (typeof body.ux_score !== 'number' || isNaN(body.ux_score))) {
  return {
    statusCode: 400,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error: 'Invalid ux_score: must be a number' }),
  }
}

if (body.content_score !== undefined && (typeof body.content_score !== 'number' || isNaN(body.content_score))) {
  return {
    statusCode: 400,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error: 'Invalid content_score: must be a number' }),
  }
}

if (body.ux_focus_weeks !== undefined && (typeof body.ux_focus_weeks !== 'number' || body.ux_focus_weeks < 0)) {
  return {
    statusCode: 400,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error: 'Invalid ux_focus_weeks: must be a non-negative number' }),
  }
}

if (body.content_focus_weeks !== undefined && (typeof body.content_focus_weeks !== 'number' || body.content_focus_weeks < 0)) {
  return {
    statusCode: 400,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error: 'Invalid content_focus_weeks: must be a non-negative number' }),
  }
}

// Validate size bands are valid enum values
const validSizes = ['XS', 'S', 'M', 'L', 'XL'] as const
if (body.ux_size !== undefined && !validSizes.includes(body.ux_size)) {
  return {
    statusCode: 400,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error: `Invalid ux_size: must be one of ${validSizes.join(', ')}` }),
  }
}

if (body.content_size !== undefined && !validSizes.includes(body.content_size)) {
  return {
    statusCode: 400,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error: `Invalid content_size: must be one of ${validSizes.join(', ')}` }),
  }
}
```

---

### 6. Add Numeric Range Validation in create-scenario.ts and update-scenario.ts

**File:** `netlify/functions/create-scenario.ts`  
**After line 63, add:**

```typescript
// Validate numeric ranges
if (body.weeks_per_period !== undefined) {
  if (typeof body.weeks_per_period !== 'number' || body.weeks_per_period < 1 || body.weeks_per_period > 52) {
    return {
      statusCode: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Invalid weeks_per_period: must be between 1 and 52' }),
    }
  }
}

if (body.sprint_length_weeks !== undefined) {
  if (typeof body.sprint_length_weeks !== 'number' || body.sprint_length_weeks < 1 || body.sprint_length_weeks > 4) {
    return {
      statusCode: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Invalid sprint_length_weeks: must be between 1 and 4' }),
    }
  }
}

if (body.ux_designers !== undefined) {
  if (typeof body.ux_designers !== 'number' || body.ux_designers < 0 || body.ux_designers > 100) {
    return {
      statusCode: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Invalid ux_designers: must be between 0 and 100' }),
    }
  }
}

if (body.content_designers !== undefined) {
  if (typeof body.content_designers !== 'number' || body.content_designers < 0 || body.content_designers > 100) {
    return {
      statusCode: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Invalid content_designers: must be between 0 and 100' }),
    }
  }
}
```

**Apply same validation to `update-scenario.ts` after line 75.**

---

## Implementation Order

1. **First:** Add shared helpers to `types.ts` (errorResponse, isValidUUID)
2. **Second:** Fix critical issues (1, 2)
3. **Third:** Update all functions to use shared helpers
4. **Fourth:** Add validation fixes (3, 4, 5, 6)
5. **Fifth:** Test all functions with invalid inputs

---

**Note:** After implementing these fixes, run `npm run typecheck` and `npm run build` to ensure no TypeScript errors.
