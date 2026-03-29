# Phase 1: Gap Analysis Checklist

**Instructions:** Compare this specification against your existing Cursor project's database schema and Netlify functions. Check off what exists, note what's missing, and implement only the gaps.

---

## Part A: Database Schema Comparison

### Table 1: `scenarios` (Plans)

**Expected Columns:**

| Column Name | Type | Constraints | Status | Notes |
|-------------|------|-------------|--------|-------|
| `id` | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | ☐ | |
| `session_id` | VARCHAR/TEXT | (Your existing column - PRESERVE) | ☐ | **Keep as-is** |
| `name` | VARCHAR(255) | NOT NULL | ☐ | |
| `description` | TEXT | | ☐ | |
| `status` | VARCHAR(20) | NOT NULL CHECK (status IN ('draft', 'committed')) | ☐ | |
| `quarter` | VARCHAR(10) | NOT NULL | ☐ | |
| `team_size_ux_design` | INTEGER | NOT NULL | ☐ | |
| `team_size_content_design` | INTEGER | NOT NULL | ☐ | |
| `capacity_ux_design` | DECIMAL(10,2) | NOT NULL | ☐ | |
| `capacity_content_design` | DECIMAL(10,2) | NOT NULL | ☐ | |
| `demand_ux_design` | DECIMAL(10,2) | DEFAULT 0 | ☐ | |
| `demand_content_design` | DECIMAL(10,2) | DEFAULT 0 | ☐ | |
| `roadmap_items_count` | INTEGER | DEFAULT 0 | ☐ | |
| `created_at` | TIMESTAMP | DEFAULT NOW() | ☐ | |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | ☐ | |

**Indexes:**
- ☐ `idx_scenarios_quarter` ON scenarios(quarter)
- ☐ `idx_scenarios_status` ON scenarios(status)
- ☐ `idx_scenarios_session_id` ON scenarios(session_id) _(if using session isolation)_

**Missing Columns to Add:**
```sql
-- Run these ALTER TABLE commands for missing columns only:
-- ALTER TABLE scenarios ADD COLUMN column_name TYPE CONSTRAINTS;
-- Example:
-- ALTER TABLE scenarios ADD COLUMN team_size_ux_design INTEGER NOT NULL DEFAULT 5;
```

---

### Table 2: `roadmap_items`

**Expected Columns:**

| Column Name | Type | Constraints | Status | Notes |
|-------------|------|-------------|--------|-------|
| `id` | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | ☐ | |
| `scenario_id` | UUID | NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE | ☐ | |
| `key` | VARCHAR(50) | NOT NULL | ☐ | e.g., "PROJ-123" |
| `name` | VARCHAR(255) | NOT NULL | ☐ | |
| `initiative` | VARCHAR(255) | NOT NULL | ☐ | |
| `priority` | VARCHAR(50) | NOT NULL | ☐ | e.g., "P0", "P1" |
| `quarter` | VARCHAR(10) | NOT NULL | ☐ | |
| `status` | VARCHAR(20) | NOT NULL CHECK (status IN ('draft', 'committed')) | ☐ | |
| `project_type` | VARCHAR(50) | CHECK (project_type IN ('net-new', 'new-feature', 'enhancement', 'optimization', 'fix-polish')) | ☐ | Nullable |
| `ux_focus_weeks` | DECIMAL(10,2) | NOT NULL DEFAULT 0 | ☐ | |
| `content_focus_weeks` | DECIMAL(10,2) | NOT NULL DEFAULT 0 | ☐ | |
| `ux_product_risk` | INTEGER | CHECK (ux_product_risk BETWEEN 1 AND 5) | ☐ | Nullable, 1-5 scale |
| `ux_problem_ambiguity` | INTEGER | CHECK (ux_problem_ambiguity BETWEEN 1 AND 5) | ☐ | Nullable, 1-5 scale |
| `content_surface_area` | INTEGER | CHECK (content_surface_area BETWEEN 1 AND 5) | ☐ | Nullable, 1-5 scale |
| `content_localization_scope` | INTEGER | CHECK (content_localization_scope BETWEEN 1 AND 5) | ☐ | Nullable, 1-5 scale |
| `created_at` | TIMESTAMP | DEFAULT NOW() | ☐ | |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | ☐ | |

**Indexes:**
- ☐ `idx_roadmap_items_scenario` ON roadmap_items(scenario_id)
- ☐ `idx_roadmap_items_quarter` ON roadmap_items(quarter)

**Missing Columns to Add:**
```sql
-- Run these ALTER TABLE commands for missing columns only
```

---

### Table 3: `settings` (Global Configuration)

**Does this table exist?** ☐ Yes ☐ No

If **No**, create it:
```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default config
INSERT INTO settings (key, value) VALUES (
  'capacity_planner_config',
  '{
    "effortWeights": {
      "productRisk": 4,
      "problemAmbiguity": 5,
      "contentSurface": 5,
      "localizationScope": 5
    },
    "effortModelEnabled": true,
    "workstreamPenalty": 0.10,
    "workstreamImpactEnabled": true,
    "focusTimeRatio": 0.75,
    "planningPeriods": {
      "Q2'\''26": {"workWeeks": 13, "holidays": 10, "pto": 5, "focusWeeks": 11},
      "Q3'\''26": {"workWeeks": 13, "holidays": 10, "pto": 5, "focusWeeks": 11},
      "Q4'\''26": {"workWeeks": 13, "holidays": 10, "pto": 5, "focusWeeks": 11},
      "Q1'\''27": {"workWeeks": 13, "holidays": 10, "pto": 5, "focusWeeks": 11}
    },
    "sizeBandThresholds": {
      "xs": {"min": 0, "max": 2},
      "s": {"min": 2, "max": 4},
      "m": {"min": 4, "max": 8},
      "l": {"min": 8, "max": 12},
      "xl": {"min": 12}
    },
    "projectTypeDemand": {
      "net-new": {"ux": "XL", "content": "XL"},
      "new-feature": {"ux": "L", "content": "L"},
      "enhancement": {"ux": "M", "content": "S"},
      "optimization": {"ux": "S", "content": "XS"},
      "fix-polish": {"ux": "XS", "content": "XS"}
    }
  }'::jsonb
);
```

If **Yes**, ensure it has:
- ☐ `id` column (UUID)
- ☐ `key` column (VARCHAR(100) UNIQUE)
- ☐ `value` column (JSONB)
- ☐ Row with key = `'capacity_planner_config'`

---

## Part B: Netlify Functions Comparison

**Expected Endpoints (kebab-case):**

### Scenarios (Plans) Endpoints

| Function File | HTTP Method | Purpose | Status | Notes |
|---------------|-------------|---------|--------|-------|
| `get-scenarios.ts` | GET | List all scenarios (with session filtering) | ☐ | |
| `get-scenario.ts` | GET | Get single scenario by ID | ☐ | |
| `create-scenario.ts` | POST | Create new scenario | ☐ | |
| `update-scenario.ts` | PUT | Update scenario | ☐ | |
| `delete-scenario.ts` | DELETE | Delete scenario | ☐ | |
| `duplicate-scenario.ts` | POST | Duplicate scenario with new ID | ☐ | |

### Roadmap Items Endpoints

| Function File | HTTP Method | Purpose | Status | Notes |
|---------------|-------------|---------|--------|-------|
| `get-roadmap-items.ts` | GET | Get all items for a scenario | ☐ | |
| `create-roadmap-item.ts` | POST | Add item to scenario | ☐ | |
| `update-roadmap-item.ts` | PUT | Update roadmap item | ☐ | |
| `delete-roadmap-item.ts` | DELETE | Delete roadmap item | ☐ | |

### Settings Endpoints

| Function File | HTTP Method | Purpose | Status | Notes |
|---------------|-------------|---------|--------|-------|
| `get-settings.ts` | GET | Get global settings | ☐ | |
| `update-settings.ts` | PUT | Update global settings | ☐ | |

**Missing Functions to Create:**
List any missing endpoints here and implement them.

---

## Part C: API Contracts (Expected Request/Response Formats)

### 1. GET /get-scenarios
```typescript
// Query params: ?session_id={sessionId} (optional, for isolation)
// Response:
{
  scenarios: [
    {
      id: "uuid",
      name: "Q2 2026 Planning",
      description: "Initial planning scenario",
      status: "draft" | "committed",
      quarter: "Q2'26",
      teamSize: { uxDesign: 5, contentDesign: 3 },
      capacity: { uxDesign: 80.0, contentDesign: 40.0 },
      demand: { uxDesign: 95.0, contentDesign: 35.0 },
      roadmapItemsCount: 10,
      createdAt: "2026-03-01T00:00:00Z",
      updatedAt: "2026-03-15T14:30:00Z"
    }
  ]
}
```

### 2. POST /create-scenario
```typescript
// Body:
{
  name: string;
  description: string;
  status: "draft" | "committed";
  quarter: string;
  teamSize: { uxDesign: number; contentDesign: number };
  capacity: { uxDesign: number; contentDesign: number };
  demand?: { uxDesign: number; contentDesign: number };
  roadmapItemsCount?: number;
  sessionId?: string; // For isolation
}

// Response: Same as Scenario object above
```

### 3. PUT /update-scenario
```typescript
// Body: Full Scenario object (include id)

// Response: Updated Scenario object
```

### 4. DELETE /delete-scenario
```typescript
// Body:
{
  id: string;
}

// Response:
{
  success: boolean;
}
```

### 5. POST /duplicate-scenario
```typescript
// Body:
{
  id: string; // ID of scenario to duplicate
}

// Response: New Scenario object with new ID
```

### 6. GET /get-roadmap-items
```typescript
// Query: ?scenarioId={scenarioId}

// Response:
{
  items: [
    {
      id: "uuid",
      scenarioId: "uuid",
      key: "PROJ-123",
      name: "New Dashboard",
      initiative: "Analytics Platform",
      priority: "P0",
      quarter: "Q2'26",
      status: "draft",
      projectType: "new-feature",
      uxFocusWeeks: 8.5,
      contentFocusWeeks: 4.0,
      uxProductRisk: 4,
      uxProblemAmbiguity: 3,
      contentSurfaceArea: 3,
      contentLocalizationScope: 2
    }
  ]
}
```

### 7. POST /create-roadmap-item
```typescript
// Body: Omit<RoadmapItem, 'id'>

// Response: RoadmapItem with generated id
```

### 8. PUT /update-roadmap-item
```typescript
// Body: Full RoadmapItem object (include id)

// Response: Updated RoadmapItem
```

### 9. DELETE /delete-roadmap-item
```typescript
// Body:
{
  id: string;
}

// Response:
{
  success: boolean;
}
```

### 10. GET /get-settings
```typescript
// Response:
{
  effortWeights: {
    productRisk: number; // 1-10
    problemAmbiguity: number; // 1-10
    contentSurface: number; // 1-10
    localizationScope: number; // 1-10
  };
  effortModelEnabled: boolean;
  workstreamPenalty: number; // 0-1
  workstreamImpactEnabled: boolean;
  focusTimeRatio: number; // 0-1
  planningPeriods: {
    [quarter: string]: {
      workWeeks: number;
      holidays: number;
      pto: number;
      focusWeeks: number;
    };
  };
  sizeBandThresholds: {
    xs: { min: number; max: number };
    s: { min: number; max: number };
    m: { min: number; max: number };
    l: { min: number; max: number };
    xl: { min: number };
  };
  projectTypeDemand: {
    [projectType: string]: { ux: string; content: string };
  };
}
```

### 11. PUT /update-settings
```typescript
// Body: Same as GET /get-settings response

// Response: Updated settings object
```

---

## Part D: Session Isolation Pattern (PRESERVE)

**If your existing functions use session-based isolation:**

### Add to Scenarios Queries:
```sql
-- When fetching scenarios:
SELECT * FROM scenarios WHERE session_id = $1; -- If using sessions

-- When creating scenarios:
INSERT INTO scenarios (..., session_id) VALUES (..., $sessionId);
```

### Pass session_id in API calls:
```typescript
// Frontend should send session ID
const scenarios = await api.getScenarios(sessionId);
```

**Update all Netlify Functions to:**
1. Accept `sessionId` as query param or in request body
2. Filter database queries by `session_id` column
3. Set `session_id` when creating new records

---

## Part E: Migration Scripts to Run

### Missing Column Additions
```sql
-- Example template - adjust based on your gaps:

-- ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS team_size_ux_design INTEGER NOT NULL DEFAULT 5;
-- ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS team_size_content_design INTEGER NOT NULL DEFAULT 3;
-- ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS capacity_ux_design DECIMAL(10,2) NOT NULL DEFAULT 0;
-- ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS capacity_content_design DECIMAL(10,2) NOT NULL DEFAULT 0;
-- ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS demand_ux_design DECIMAL(10,2) DEFAULT 0;
-- ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS demand_content_design DECIMAL(10,2) DEFAULT 0;
-- ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS roadmap_items_count INTEGER DEFAULT 0;

-- Add indexes:
-- CREATE INDEX IF NOT EXISTS idx_scenarios_quarter ON scenarios(quarter);
-- CREATE INDEX IF NOT EXISTS idx_scenarios_status ON scenarios(status);
```

### Create roadmap_items Table (if missing)
```sql
CREATE TABLE IF NOT EXISTS roadmap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  key VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  initiative VARCHAR(255) NOT NULL,
  priority VARCHAR(50) NOT NULL,
  quarter VARCHAR(10) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'committed')),
  project_type VARCHAR(50) CHECK (project_type IN ('net-new', 'new-feature', 'enhancement', 'optimization', 'fix-polish')),
  ux_focus_weeks DECIMAL(10,2) NOT NULL DEFAULT 0,
  content_focus_weeks DECIMAL(10,2) NOT NULL DEFAULT 0,
  ux_product_risk INTEGER CHECK (ux_product_risk BETWEEN 1 AND 5),
  ux_problem_ambiguity INTEGER CHECK (ux_problem_ambiguity BETWEEN 1 AND 5),
  content_surface_area INTEGER CHECK (content_surface_area BETWEEN 1 AND 5),
  content_localization_scope INTEGER CHECK (content_localization_scope BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmap_items_scenario ON roadmap_items(scenario_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_items_quarter ON roadmap_items(quarter);
```

### Create settings Table (if missing)
```sql
-- See Part A, Table 3 above for full CREATE statement
```

---

## Part F: Your Action Items

### Step 1: Run Gap Analysis
- [ ] Compare your `database/schema.sql` against Part A
- [ ] List all missing columns in `GAP_MISSING_COLUMNS.txt`
- [ ] List all missing tables in `GAP_MISSING_TABLES.txt`

### Step 2: Compare Netlify Functions
- [ ] Check `netlify/functions/` against Part B
- [ ] List all missing endpoints in `GAP_MISSING_ENDPOINTS.txt`

### Step 3: Create Migration SQL
- [ ] Write `migrations/001_add_missing_columns.sql`
- [ ] Write `migrations/002_create_missing_tables.sql`
- [ ] Write `migrations/003_add_indexes.sql`

### Step 4: Implement Missing Endpoints
- [ ] Create missing Netlify Functions (use Part C for contracts)
- [ ] Ensure all functions preserve `session_id` isolation
- [ ] Test each endpoint with Postman/curl

### Step 5: Validate Phase 1 Complete
- [ ] All database columns exist
- [ ] All 11 endpoints respond correctly
- [ ] Session isolation still works
- [ ] Sample CRUD operations work end-to-end

---

## Part G: Testing Checklist (Before Phase 2)

### Database Tests
- [ ] Can insert a scenario with all required fields
- [ ] Can insert a roadmap_item linked to a scenario
- [ ] Cascade delete works (deleting scenario deletes items)
- [ ] Settings table has default config row
- [ ] All indexes exist and improve query performance

### API Tests
```bash
# Example test commands:

# Get scenarios (should return empty array initially)
curl http://localhost:8888/.netlify/functions/get-scenarios

# Create scenario
curl -X POST http://localhost:8888/.netlify/functions/create-scenario \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Plan",
    "description": "Test",
    "status": "draft",
    "quarter": "Q2'\''26",
    "teamSize": {"uxDesign": 5, "contentDesign": 3},
    "capacity": {"uxDesign": 80, "contentDesign": 40}
  }'

# Get settings
curl http://localhost:8888/.netlify/functions/get-settings
```

- [ ] All 11 endpoints return 200 OK
- [ ] Error handling works (404, 400, 500)
- [ ] CORS headers are set correctly
- [ ] Response formats match Part C

---

## Part H: Once Phase 1 is Complete

**You're ready to proceed to Phase 2 when:**

✅ All database columns exist  
✅ All 11 Netlify Functions exist and tested  
✅ Session isolation is preserved  
✅ Sample data can be created/read/updated/deleted  
✅ Settings endpoint returns default config  

**Next Steps:**
1. Copy TypeScript interfaces from Figma Make
2. Create `src/services/api.ts` API client
3. Extract calculation utilities
4. Begin page migration starting with CapacityCalculator.tsx (validation gate!)

---

**This is your Phase 1 checklist. Fill it out, implement gaps, then proceed to Phase 2.**
