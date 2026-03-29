# Capacity Planner: Data Models & Business Logic Reference

This document extracts all the critical business logic and data structures from the Figma Make implementation for easy reference during migration.

---

## Calculation Formulas

### 1. Capacity Calculation (from CapacityCalculator.tsx)

```typescript
// Input Variables
const planningPeriodWeeks = 13; // Quarter length
const daysPerWeek = 5;
const vacationDays = 5;
const companyHolidays = 10;
const focusTimeRatio = 0.75; // 75% of time is "focus time"
const workstreams = 2; // Number of concurrent projects
const workstreamPenalty = 0.10; // 10% reduction per additional workstream

// Calculations
const availableDays = (planningPeriodWeeks * daysPerWeek) - vacationDays - companyHolidays;
const availableWeeks = availableDays / daysPerWeek;
const workWeeks = availableWeeks;

// Workstream Impact
const additionalWorkstreams = Math.max(0, workstreams - 1);
const workstreamImpact = additionalWorkstreams * workstreamPenalty;
const adjustedFocusTimeRatio = Math.max(0.2, focusTimeRatio - workstreamImpact);

// Final Capacity
const focusWeeks = workWeeks * adjustedFocusTimeRatio;
const dailyFocusHours = availableDays > 0 ? (focusWeeks * 5 * 8) / availableDays : 0;
```

**Example:**
- Quarter: 13 weeks
- Vacation: 5 days
- Holidays: 10 days
- Focus Ratio: 75%
- Workstreams: 2
- **Result:** 50 available days = 10 work weeks × 65% adjusted focus = **6.5 focus weeks**

---

### 2. Complexity-Based Demand Calculation (from ScenarioDetail.tsx)

```typescript
// Constants
const BASE_FOCUS_WEEKS = 3.0;

// Size Band to Focus Weeks Mapping (from Settings)
const DEMAND_WEEKS_MAP = {
  "XS": 2.0,   // 0-2 weeks
  "S": 4.0,    // 2-4 weeks
  "M": 8.0,    // 4-8 weeks
  "L": 12.0,   // 8-12 weeks
  "XL": 12.0,  // 12+ weeks
};

// Get UX Complexity Factors from Settings
const uxFactors = {
  productRisk: {
    multiplier: effortWeights.productRisk / 10, // e.g., 4/10 = 0.4
  },
  problemAmbiguity: {
    multiplier: effortWeights.problemAmbiguity / 10, // e.g., 5/10 = 0.5
  },
};

// Get Content Complexity Factors from Settings
const contentFactors = {
  surfaceArea: {
    multiplier: effortWeights.contentSurface / 10, // e.g., 5/10 = 0.5
  },
  localizationScope: {
    multiplier: effortWeights.localizationScope / 10, // e.g., 5/10 = 0.5
  },
};

// Calculate UX Focus Weeks
function calculateUxFocusWeeks(
  projectType: string,
  productRisk: number, // 1-5 scale
  problemAmbiguity: number, // 1-5 scale
  effortModelEnabled: boolean
): number {
  if (!effortModelEnabled) {
    // Use project type demand only
    const demandLevel = projectTypeDemand[projectType].ux; // e.g., "M"
    return DEMAND_WEEKS_MAP[demandLevel];
  }

  // Complexity-based calculation
  const productRiskImpact = (productRisk - 1) * uxFactors.productRisk.multiplier;
  const problemAmbiguityImpact = (problemAmbiguity - 1) * uxFactors.problemAmbiguity.multiplier;
  
  return BASE_FOCUS_WEEKS + productRiskImpact + problemAmbiguityImpact;
}

// Calculate Content Focus Weeks
function calculateContentFocusWeeks(
  projectType: string,
  surfaceArea: number, // 1-5 scale
  localizationScope: number, // 1-5 scale
  effortModelEnabled: boolean
): number {
  if (!effortModelEnabled) {
    const demandLevel = projectTypeDemand[projectType].content;
    return DEMAND_WEEKS_MAP[demandLevel];
  }

  const surfaceAreaImpact = (surfaceArea - 1) * contentFactors.surfaceArea.multiplier;
  const localizationImpact = (localizationScope - 1) * contentFactors.localizationScope.multiplier;
  
  return BASE_FOCUS_WEEKS + surfaceAreaImpact + localizationImpact;
}
```

**Example Calculation (UX):**
- Base: 3.0 weeks
- Product Risk: 4 (scale 1-5) → Impact = (4-1) × 0.4 = 1.2
- Problem Ambiguity: 3 → Impact = (3-1) × 0.5 = 1.0
- **Total UX Demand: 3.0 + 1.2 + 1.0 = 5.2 focus weeks**

---

### 3. Plan-Level Aggregation

```typescript
// Sum all roadmap items for a plan
const totalUxDemand = roadmapItems.reduce((sum, item) => sum + item.uxFocusWeeks, 0);
const totalContentDemand = roadmapItems.reduce((sum, item) => sum + item.contentFocusWeeks, 0);

// Calculate utilization
const uxUtilization = (totalUxDemand / capacity.uxDesign) * 100;
const contentUtilization = (totalContentDemand / capacity.contentDesign) * 100;

// Status determination
function getUtilizationStatus(utilization: number) {
  if (utilization <= 80) return { label: "Healthy", color: "green" };
  if (utilization <= 100) return { label: "At Capacity", color: "yellow" };
  return { label: "Over Capacity", color: "red" };
}
```

---

## Default Settings Values

```typescript
const defaultSettings = {
  // Complexity Factor Weights (1-10 scale)
  effortWeights: {
    productRisk: 4,          // UX: Business impact weight
    problemAmbiguity: 5,     // UX: Problem clarity weight
    contentSurface: 5,       // Content: Surface area weight
    localizationScope: 5,    // Content: Localization weight
  },

  // Feature Toggles
  effortModelEnabled: true,           // Use complexity scoring vs project types
  workstreamImpactEnabled: true,      // Apply workstream penalty

  // Workstream Configuration
  workstreamPenalty: 0.10,  // 10% reduction per additional workstream

  // Focus Time Configuration
  focusTimeRatio: 0.75,     // 75% of work time is "focus time"

  // Planning Periods (Quarters)
  planningPeriods: {
    "Q2'26": { workWeeks: 13, holidays: 10, pto: 5, focusWeeks: 11 },
    "Q3'26": { workWeeks: 13, holidays: 10, pto: 5, focusWeeks: 11 },
    "Q4'26": { workWeeks: 13, holidays: 10, pto: 5, focusWeeks: 11 },
    "Q1'27": { workWeeks: 13, holidays: 10, pto: 5, focusWeeks: 11 },
  },

  // Size Band Thresholds (focus weeks)
  sizeBandThresholds: {
    xs: { min: 0, max: 2 },
    s: { min: 2, max: 4 },
    m: { min: 4, max: 8 },
    l: { min: 8, max: 12 },
    xl: { min: 12 },
  },

  // Project Type → Demand Level Mapping
  projectTypeDemand: {
    "net-new": { ux: "XL", content: "XL" },         // New product/feature
    "new-feature": { ux: "L", content: "L" },       // Major feature
    "enhancement": { ux: "M", content: "S" },       // Improve existing
    "optimization": { ux: "S", content: "XS" },     // Performance/usability
    "fix-polish": { ux: "XS", content: "XS" },      // Bug fixes/polish
  },
};
```

---

## Mock Data Examples

### Sample Scenario (Plan)
```typescript
{
  id: "uuid-1",
  name: "Q2 2026 Planning",
  description: "Initial planning scenario for Q2 roadmap",
  status: "draft", // or "committed"
  quarter: "Q2'26",
  teamSize: {
    uxDesign: 5,        // 5 UX designers
    contentDesign: 3,   // 3 content designers
  },
  capacity: {
    uxDesign: 80.0,     // 80 focus weeks available
    contentDesign: 40.0,
  },
  demand: {
    uxDesign: 95.0,     // 95 focus weeks needed
    contentDesign: 35.0,
  },
  roadmapItemsCount: 10,
  createdAt: "2026-03-01T00:00:00Z",
  updatedAt: "2026-03-15T14:30:00Z",
}
```

### Sample Roadmap Item
```typescript
{
  id: "uuid-2",
  scenarioId: "uuid-1",
  key: "PROJ-123",
  name: "New Dashboard Experience",
  initiative: "Analytics Platform",
  priority: "P0",
  quarter: "Q2'26",
  status: "draft",
  projectType: "new-feature",
  
  // Calculated demand
  uxFocusWeeks: 8.5,
  contentFocusWeeks: 4.0,
  
  // UX Complexity Factors (1-5 scale)
  uxProductRisk: 4,           // High business impact
  uxProblemAmbiguity: 3,      // Moderate problem clarity
  
  // Content Complexity Factors (1-5 scale)
  contentSurfaceArea: 3,      // Moderate content surface
  contentLocalizationScope: 2, // Light localization
}
```

---

## Validation Rules

### Scenario Validation
- `name`: Required, max 255 chars
- `quarter`: Required, must match format `Q[1-4]'[YY]`
- `status`: Must be "draft" or "committed"
- `teamSize.*`: Must be >= 0
- `capacity.*`: Must be >= 0

### Roadmap Item Validation
- `key`: Required, max 50 chars
- `name`: Required, max 255 chars
- `uxFocusWeeks`: Must be >= 0
- `contentFocusWeeks`: Must be >= 0
- `uxProductRisk`: If set, must be 1-5
- `uxProblemAmbiguity`: If set, must be 1-5
- `contentSurfaceArea`: If set, must be 1-5
- `contentLocalizationScope`: If set, must be 1-5

### Settings Validation
- `effortWeights.*`: Must be 1-10
- `workstreamPenalty`: Must be 0-1 (0% to 100%)
- `focusTimeRatio`: Must be 0-1 (0% to 100%)
- `planningPeriods.*.workWeeks`: Must be > 0
- `sizeBandThresholds`: Min must be < Max for each band

---

## Status Indicators

### Utilization Status
```typescript
function getUtilizationStatus(utilization: number) {
  if (utilization <= 80) {
    return {
      label: "Healthy",
      color: "green",
      emoji: "🟢",
      description: "Team has buffer capacity",
    };
  }
  
  if (utilization <= 100) {
    return {
      label: "At Capacity",
      color: "yellow",
      emoji: "🟡",
      description: "Team is fully utilized",
    };
  }
  
  return {
    label: "Over Capacity",
    color: "red",
    emoji: "🔴",
    description: "Demand exceeds capacity",
  };
}
```

### Scenario Status
```typescript
type ScenarioStatus = "draft" | "committed";

// "draft" = Work in progress, can be edited freely
// "committed" = Finalized, should have edit restrictions
```

---

## Key Business Rules

1. **Capacity per Designer:**
   - Formula: `(workWeeks - (holidays + pto) / 5) * focusTimeRatio`
   - Example: (13 - 3) weeks × 0.75 = **7.5 focus weeks per designer**

2. **Team Capacity:**
   - UX Team: `teamSize.uxDesign × focusWeeksPerDesigner`
   - Content Team: `teamSize.contentDesign × focusWeeksPerDesigner`

3. **Complexity Scoring:**
   - Base demand: 3.0 weeks
   - Each complexity factor adds: `(score - 1) × weight/10`
   - Complexity factors range 1-5, weights range 1-10

4. **Workstream Penalty:**
   - 1 workstream: No penalty
   - 2 workstreams: -10% focus time
   - 3 workstreams: -20% focus time
   - Formula: `focusTimeRatio × (1 - ((workstreams - 1) × penalty))`

5. **Demand Aggregation:**
   - Plan demand = Sum of all roadmap item demands
   - Updated automatically when roadmap items change
   - Displayed on plan cards and detail view

---

## UI Component Patterns

### Create Plan Modal - Tab Structure
```
Tab 1: Manual Setup
  - Plan Name (text)
  - Description (textarea)
  - Quarter (select)
  - Team Size (UX Designers, Content Designers)
  - Auto-calculates capacity based on Settings

Tab 2: Paste Roadmap Data
  - Textarea for CSV/TSV data
  - Parse and import roadmap items
  - Auto-populate plan fields

Tab 3: Upload File
  - File upload (CSV/Excel)
  - Same parsing logic as Tab 2
```

### Roadmap Item Edit Modal - Tab Structure
```
Tab 1: PM Intake
  - Key, Name, Initiative, Priority, Quarter, Status, Project Type

Tab 2: Product Design
  - Product Risk (1-5 slider)
  - Problem Ambiguity (1-5 slider)
  - Auto-calculates UX Focus Weeks

Tab 3: Content Design
  - Surface Area (1-5 slider)
  - Localization Scope (1-5 slider)
  - Auto-calculates Content Focus Weeks
```

### Settings Page - Section Structure
```
Section 1: Complexity Weights
  - Product Risk Weight (1-10 slider)
  - Problem Ambiguity Weight (1-10 slider)
  - Content Surface Weight (1-10 slider)
  - Localization Scope Weight (1-10 slider)
  - Toggle: Enable/Disable Effort Model

Section 2: Workstream Configuration
  - Workstream Penalty (0-100% slider)
  - Toggle: Enable/Disable Workstream Impact

Section 3: Planning Periods
  - Q2'26, Q3'26, Q4'26, Q1'27
  - Each: Work Weeks, Holidays, PTO, Focus Weeks (calculated)

Section 4: Size Band Thresholds
  - XS, S, M, L, XL (min/max focus weeks)

Section 5: Project Type Demand
  - Net-New, New Feature, Enhancement, Optimization, Fix/Polish
  - Each: UX Demand Level (XS/S/M/L/XL), Content Demand Level
```

---

## Data Flow Diagram

```
User Creates Plan
  ↓
Enter Team Size → Calculate Capacity → Save to DB
  ↓
Add Roadmap Items → Calculate Demand per Item → Save to DB
  ↓
Aggregate Demand → Update Plan Totals → Display Utilization
  ↓
User Commits Plan → Lock Plan (optional) → Generate Reports
```

---

## localStorage Keys (Figma Make - Replace with API)

- `scenarios`: Array of Scenario objects
- `roadmapItems_{scenarioId}`: Array of RoadmapItem objects per scenario
- `capacityPlannerSettings`: Settings object

**Migration Note:** All of these should be replaced with API calls to Netlify Functions that query Neon PostgreSQL.

---

This reference should help the Cursor agent understand the exact business logic to preserve during migration!
