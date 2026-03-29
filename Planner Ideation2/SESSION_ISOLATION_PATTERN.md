# Session Isolation Pattern (Preserve in Migration)

**Context:** Your existing Cursor project uses `session_id` for data isolation. This must be preserved during migration.

---

## What is Session Isolation?

Session isolation ensures that each user/session only sees their own data, even though all data is in the same database tables.

**Without session isolation:**
- User A creates Plan 1
- User B creates Plan 2
- Both users see both plans ❌

**With session isolation:**
- User A (session_123) creates Plan 1 with session_id = "session_123"
- User B (session_456) creates Plan 2 with session_id = "session_456"
- User A only sees Plan 1 ✅
- User B only sees Plan 2 ✅

---

## Database Pattern

### Table Structure

```sql
CREATE TABLE scenarios (
  id UUID PRIMARY KEY,
  session_id VARCHAR(255), -- Isolation key
  name VARCHAR(255),
  -- ... other columns
);

CREATE INDEX idx_scenarios_session ON scenarios(session_id);
```

### Queries Always Filter by session_id

```sql
-- Reading (GET)
SELECT * FROM scenarios WHERE session_id = $1;

-- Creating (POST)
INSERT INTO scenarios (id, session_id, name, ...) 
VALUES (gen_random_uuid(), $1, $2, ...);

-- Updating (PUT)
UPDATE scenarios 
SET name = $2 
WHERE id = $1 AND session_id = $3; -- Security: can only update own data

-- Deleting (DELETE)
DELETE FROM scenarios 
WHERE id = $1 AND session_id = $2; -- Security: can only delete own data
```

---

## Netlify Functions Pattern

### Example: get-scenarios.ts

```typescript
import { Handler } from '@netlify/functions';
import { Client } from 'pg';

export const handler: Handler = async (event) => {
  // Get session ID from query parameter
  const sessionId = event.queryStringParameters?.sessionId;
  
  if (!sessionId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'sessionId is required' }),
    };
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    // IMPORTANT: Filter by session_id
    const result = await client.query(
      'SELECT * FROM scenarios WHERE session_id = $1 ORDER BY created_at DESC',
      [sessionId]
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarios: result.rows }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    await client.end();
  }
};
```

### Example: create-scenario.ts

```typescript
import { Handler } from '@netlify/functions';
import { Client } from 'pg';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const body = JSON.parse(event.body || '{}');
  const { sessionId, name, description, status, quarter, teamSize, capacity } = body;

  if (!sessionId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'sessionId is required' }),
    };
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    // IMPORTANT: Include session_id in INSERT
    const result = await client.query(
      `INSERT INTO scenarios (
        id, session_id, name, description, status, quarter,
        team_size_ux_design, team_size_content_design,
        capacity_ux_design, capacity_content_design,
        demand_ux_design, demand_content_design,
        roadmap_items_count, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, 0, 0, 0, NOW(), NOW()
      ) RETURNING *`,
      [
        sessionId,
        name,
        description,
        status,
        quarter,
        teamSize.uxDesign,
        teamSize.contentDesign,
        capacity.uxDesign,
        capacity.contentDesign,
      ]
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.rows[0]),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    await client.end();
  }
};
```

### Example: update-scenario.ts

```typescript
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'PUT') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const body = JSON.parse(event.body || '{}');
  const { id, sessionId, name, description, status, quarter, teamSize, capacity } = body;

  if (!sessionId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'sessionId is required' }),
    };
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    // IMPORTANT: Filter by BOTH id AND session_id
    const result = await client.query(
      `UPDATE scenarios SET
        name = $1,
        description = $2,
        status = $3,
        quarter = $4,
        team_size_ux_design = $5,
        team_size_content_design = $6,
        capacity_ux_design = $7,
        capacity_content_design = $8,
        updated_at = NOW()
      WHERE id = $9 AND session_id = $10
      RETURNING *`,
      [
        name,
        description,
        status,
        quarter,
        teamSize.uxDesign,
        teamSize.contentDesign,
        capacity.uxDesign,
        capacity.contentDesign,
        id,
        sessionId,
      ]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Scenario not found or access denied' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.rows[0]),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    await client.end();
  }
};
```

---

## Frontend Pattern (API Client)

### Get Session ID

You likely have a way to get the current session ID. Common patterns:

**Option 1: LocalStorage**
```typescript
function getSessionId(): string | undefined {
  return localStorage.getItem('sessionId') || undefined;
}
```

**Option 2: React Context**
```typescript
import { useContext } from 'react';
import { SessionContext } from './SessionContext';

function useSessionId() {
  const { sessionId } = useContext(SessionContext);
  return sessionId;
}
```

**Option 3: URL Parameter**
```typescript
function getSessionId(): string | undefined {
  const params = new URLSearchParams(window.location.search);
  return params.get('sessionId') || undefined;
}
```

### Update API Client to Include Session ID

**In `src/services/api.ts`:**

```typescript
// Get session ID (update this function based on your pattern)
function getSessionId(): string | undefined {
  // Replace with your actual session logic
  return localStorage.getItem('sessionId') || undefined;
}

export const api = {
  async getScenarios(): Promise<Scenario[]> {
    const sessionId = getSessionId();
    
    if (!sessionId) {
      throw new Error('No session ID available');
    }
    
    // Include session ID in query
    const response = await fetch(`${API_BASE}/get-scenarios?sessionId=${sessionId}`);
    const data = await handleResponse<{ scenarios: Scenario[] }>(response);
    
    return data.scenarios.map(s => ({
      ...s,
      createdAt: new Date(s.createdAt),
      updatedAt: s.updatedAt ? new Date(s.updatedAt) : undefined,
    }));
  },

  async createScenario(data: CreateScenarioInput): Promise<Scenario> {
    const sessionId = getSessionId();
    
    if (!sessionId) {
      throw new Error('No session ID available');
    }
    
    // Include session ID in body
    const payload = { ...data, sessionId };
    
    const response = await fetch(`${API_BASE}/create-scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    const scenario = await handleResponse<Scenario>(response);
    return {
      ...scenario,
      createdAt: new Date(scenario.createdAt),
      updatedAt: scenario.updatedAt ? new Date(scenario.updatedAt) : undefined,
    };
  },
  
  // Similar for updateScenario, deleteScenario, etc.
  // Always include sessionId in payload
};
```

---

## Migration Checklist

When implementing new endpoints or updating existing ones:

### Database Migration
- [ ] `scenarios` table has `session_id` column (VARCHAR or TEXT)
- [ ] `roadmap_items` table has `session_id` column (optional, can inherit from scenario)
- [ ] Index exists on `session_id` for performance
- [ ] All SELECT queries filter by `session_id`
- [ ] All INSERT queries include `session_id`
- [ ] All UPDATE queries filter by `id AND session_id`
- [ ] All DELETE queries filter by `id AND session_id`

### Netlify Functions
- [ ] All functions accept `sessionId` parameter
- [ ] All functions validate `sessionId` is present
- [ ] All functions pass `sessionId` to database queries
- [ ] Error returned if `sessionId` is missing

### Frontend API Client
- [ ] `getSessionId()` function implemented
- [ ] All API calls include `sessionId`
- [ ] Error handling for missing session ID
- [ ] Session ID persists across page reloads

---

## Security Benefits

Session isolation provides:

1. **Data Privacy:** Users can't see each other's data
2. **Access Control:** Users can only modify their own data
3. **Multi-tenancy:** Same database, isolated data
4. **Testing:** Easy to create test sessions
5. **Cleanup:** Easy to delete all data for a session

---

## Testing Session Isolation

### Test 1: Create Data with Different Sessions

```bash
# Create scenario with session A
curl -X POST http://localhost:8888/.netlify/functions/create-scenario \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_A",
    "name": "Plan A",
    "status": "draft",
    "quarter": "Q2'\''26",
    "teamSize": {"uxDesign": 5, "contentDesign": 3},
    "capacity": {"uxDesign": 80, "contentDesign": 40}
  }'

# Create scenario with session B
curl -X POST http://localhost:8888/.netlify/functions/create-scenario \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_B",
    "name": "Plan B",
    "status": "draft",
    "quarter": "Q2'\''26",
    "teamSize": {"uxDesign": 5, "contentDesign": 3},
    "capacity": {"uxDesign": 80, "contentDesign": 40}
  }'
```

### Test 2: Verify Isolation

```bash
# Get scenarios for session A (should only return Plan A)
curl "http://localhost:8888/.netlify/functions/get-scenarios?sessionId=session_A"

# Get scenarios for session B (should only return Plan B)
curl "http://localhost:8888/.netlify/functions/get-scenarios?sessionId=session_B"
```

### Test 3: Verify Update Security

```bash
# Try to update Plan A using session B (should fail)
curl -X PUT http://localhost:8888/.netlify/functions/update-scenario \
  -H "Content-Type: application/json" \
  -d '{
    "id": "<plan_a_id>",
    "sessionId": "session_B",
    "name": "Hacked Plan",
    ...
  }'

# Should return 404 or "access denied"
```

---

## Common Mistakes to Avoid

### ❌ Don't:
1. Forget to include `session_id` in INSERT
2. Filter only by `id` in UPDATE/DELETE (must include `session_id`)
3. Return all rows without filtering by `session_id`
4. Allow missing `sessionId` parameter
5. Hard-code a session ID

### ✅ Do:
1. Always filter by `session_id` in SELECT
2. Always include `session_id` in INSERT
3. Always filter by `id AND session_id` in UPDATE/DELETE
4. Validate `sessionId` is present in all functions
5. Get session ID dynamically from request

---

## roadmap_items Isolation

**Option 1: Inherit from scenario (recommended)**

```sql
-- No session_id column needed on roadmap_items
-- Isolation enforced via foreign key to scenarios

SELECT ri.* 
FROM roadmap_items ri
JOIN scenarios s ON ri.scenario_id = s.id
WHERE s.session_id = $1;
```

**Option 2: Duplicate session_id (simpler queries)**

```sql
-- Add session_id to roadmap_items table
ALTER TABLE roadmap_items ADD COLUMN session_id VARCHAR(255);

-- Direct filtering
SELECT * FROM roadmap_items WHERE session_id = $1;
```

Choose based on your existing pattern.

---

## settings Table Isolation

**Settings are typically global (not session-specific):**

```sql
-- Settings table doesn't need session_id
CREATE TABLE settings (
  id UUID PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Single row for global config
SELECT value FROM settings WHERE key = 'capacity_planner_config';
```

**If you need per-session settings:**

```sql
-- Add session_id to settings
ALTER TABLE settings ADD COLUMN session_id VARCHAR(255);

-- Composite unique key
ALTER TABLE settings ADD CONSTRAINT unique_session_key UNIQUE (session_id, key);

-- Query per session
SELECT value FROM settings 
WHERE key = 'capacity_planner_config' AND session_id = $1;
```

---

## Summary

**Session isolation is simple:**

1. Add `session_id` column to tables
2. Always filter by `session_id` in queries
3. Always include `session_id` in INSERT
4. Always validate `sessionId` parameter in functions
5. Get session ID from request (query param or body)
6. Pass session ID from frontend API client

**This ensures:** Users only see and modify their own data.

**Already implemented in your Cursor project - just preserve the pattern when adding new columns/endpoints!**
