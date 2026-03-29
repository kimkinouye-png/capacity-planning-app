# Capacity Planner: Figma Make → Cursor Migration Plan

## Executive Summary

**Goal:** Migrate the fully-designed Capacity Planner frontend from Figma Make into the existing Cursor project with Netlify Functions backend and Neon PostgreSQL database.

**Architecture:**
- **Frontend:** React 18 + React Router 7 + Chakra UI + TypeScript
- **Backend:** Netlify Serverless Functions (Node/TypeScript)
- **Database:** Neon PostgreSQL
- **Current State:** Figma Make has complete UI/UX with localStorage persistence
- **Target State:** Same UI/UX with Chakra components + real database persistence

**Migration Strategy:** Copy business logic and data structures verbatim, translate Radix UI components to Chakra UI equivalents.

---

## 1. Database Schema (Neon PostgreSQL)

### Table: `scenarios` (Plans)
```sql
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'committed')),
  quarter VARCHAR(10) NOT NULL,
  team_size_ux_design INTEGER NOT NULL,
  team_size_content_design INTEGER NOT NULL,
  capacity_ux_design DECIMAL(10,2) NOT NULL,
  capacity_content_design DECIMAL(10,2) NOT NULL,
  demand_ux_design DECIMAL(10,2) DEFAULT 0,
  demand_content_design DECIMAL(10,2) DEFAULT 0,
  roadmap_items_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_scenarios_quarter ON scenarios(quarter);
CREATE INDEX idx_scenarios_status ON scenarios(status);
```

### Table: `roadmap_items`
```sql
CREATE TABLE roadmap_items (
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

CREATE INDEX idx_roadmap_items_scenario ON roadmap_items(scenario_id);
CREATE INDEX idx_roadmap_items_quarter ON roadmap_items(quarter);
```

### Table: `settings` (Global Configuration)
```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Initial settings row
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

---

## 2. TypeScript Interfaces (Copy Verbatim)

```typescript
// src/types/scenario.ts
export interface Scenario {
  id: string;
  name: string;
  description: string;
  status: "draft" | "committed";
  quarter: string;
  teamSize: {
    uxDesign: number;
    contentDesign: number;
  };
  capacity: {
    uxDesign: number;
    contentDesign: number;
  };
  demand: {
    uxDesign: number;
    contentDesign: number;
  };
  roadmapItemsCount: number;
  createdAt: Date;
  updatedAt?: Date;
}

// src/types/roadmap.ts
export interface RoadmapItem {
  id: string;
  scenarioId: string;
  key: string;
  name: string;
  initiative: string;
  priority: string;
  quarter: string;
  status: "draft" | "committed";
  projectType?: "net-new" | "new-feature" | "enhancement" | "optimization" | "fix-polish";
  uxFocusWeeks: number;
  contentFocusWeeks: number;
  uxProductRisk?: number; // 1-5
  uxProblemAmbiguity?: number; // 1-5
  contentSurfaceArea?: number; // 1-5
  contentLocalizationScope?: number; // 1-5
}

// src/types/settings.ts
export interface Settings {
  effortWeights: {
    productRisk: number;
    problemAmbiguity: number;
    contentSurface: number;
    localizationScope: number;
  };
  effortModelEnabled: boolean;
  workstreamPenalty: number;
  workstreamImpactEnabled: boolean;
  focusTimeRatio: number;
  planningPeriods: {
    [key: string]: {
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
    [key: string]: { ux: string; content: string };
  };
}
```

---

## 3. API Endpoints (Netlify Functions)

Create these serverless functions in `netlify/functions/`:

### `get-scenarios.ts`
```typescript
// GET /.netlify/functions/get-scenarios
// Returns: Scenario[]
```

### `get-scenario.ts`
```typescript
// GET /.netlify/functions/get-scenario?id={scenarioId}
// Returns: Scenario
```

### `create-scenario.ts`
```typescript
// POST /.netlify/functions/create-scenario
// Body: Omit<Scenario, 'id' | 'createdAt'>
// Returns: Scenario
```

### `update-scenario.ts`
```typescript
// PUT /.netlify/functions/update-scenario
// Body: Scenario
// Returns: Scenario
```

### `delete-scenario.ts`
```typescript
// DELETE /.netlify/functions/delete-scenario
// Body: { id: string }
// Returns: { success: boolean }
```

### `duplicate-scenario.ts`
```typescript
// POST /.netlify/functions/duplicate-scenario
// Body: { id: string }
// Returns: Scenario (duplicated with new ID)
```

### `get-roadmap-items.ts`
```typescript
// GET /.netlify/functions/get-roadmap-items?scenarioId={scenarioId}
// Returns: RoadmapItem[]
```

### `create-roadmap-item.ts`
```typescript
// POST /.netlify/functions/create-roadmap-item
// Body: Omit<RoadmapItem, 'id'>
// Returns: RoadmapItem
```

### `update-roadmap-item.ts`
```typescript
// PUT /.netlify/functions/update-roadmap-item
// Body: RoadmapItem
// Returns: RoadmapItem
```

### `delete-roadmap-item.ts`
```typescript
// DELETE /.netlify/functions/delete-roadmap-item
// Body: { id: string }
// Returns: { success: boolean }
```

### `get-settings.ts`
```typescript
// GET /.netlify/functions/get-settings
// Returns: Settings
```

### `update-settings.ts`
```typescript
// PUT /.netlify/functions/update-settings
// Body: Settings
// Returns: Settings
```

---

## 4. Frontend API Service Layer

Create `src/services/api.ts`:

```typescript
const API_BASE = '/.netlify/functions';

export const api = {
  // Scenarios
  getScenarios: async (): Promise<Scenario[]> => {
    const res = await fetch(`${API_BASE}/get-scenarios`);
    return res.json();
  },
  
  getScenario: async (id: string): Promise<Scenario> => {
    const res = await fetch(`${API_BASE}/get-scenario?id=${id}`);
    return res.json();
  },
  
  createScenario: async (data: Omit<Scenario, 'id' | 'createdAt'>): Promise<Scenario> => {
    const res = await fetch(`${API_BASE}/create-scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  updateScenario: async (data: Scenario): Promise<Scenario> => {
    const res = await fetch(`${API_BASE}/update-scenario`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  deleteScenario: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/delete-scenario`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    return res.json();
  },
  
  duplicateScenario: async (id: string): Promise<Scenario> => {
    const res = await fetch(`${API_BASE}/duplicate-scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    return res.json();
  },

  // Roadmap Items
  getRoadmapItems: async (scenarioId: string): Promise<RoadmapItem[]> => {
    const res = await fetch(`${API_BASE}/get-roadmap-items?scenarioId=${scenarioId}`);
    return res.json();
  },
  
  createRoadmapItem: async (data: Omit<RoadmapItem, 'id'>): Promise<RoadmapItem> => {
    const res = await fetch(`${API_BASE}/create-roadmap-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  updateRoadmapItem: async (data: RoadmapItem): Promise<RoadmapItem> => {
    const res = await fetch(`${API_BASE}/update-roadmap-item`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  deleteRoadmapItem: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/delete-roadmap-item`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    return res.json();
  },

  // Settings
  getSettings: async (): Promise<Settings> => {
    const res = await fetch(`${API_BASE}/get-settings`);
    return res.json();
  },
  
  updateSettings: async (data: Settings): Promise<Settings> => {
    const res = await fetch(`${API_BASE}/update-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
```

---

## 5. Component Mapping: Radix UI → Chakra UI

### Dialog → Modal
```tsx
// BEFORE (Radix)
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create Plan</DialogTitle>
    </DialogHeader>
    <div>{/* body */}</div>
    <DialogFooter>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// AFTER (Chakra)
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from "@chakra-ui/react";

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Create Plan</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      {/* body */}
    </ModalBody>
    <ModalFooter>
      <Button>Save</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

### Card → Box
```tsx
// BEFORE (Radix)
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// AFTER (Chakra)
import { Box, Heading, Text } from "@chakra-ui/react";

<Box 
  bg="white" 
  _dark={{ bg: "gray.800" }}
  borderRadius="lg" 
  shadow="sm" 
  border="1px" 
  borderColor="gray.200"
  _dark={{ borderColor: "gray.700" }}
>
  <Box p={6} borderBottom="1px" borderColor="gray.200" _dark={{ borderColor: "gray.700" }}>
    <Heading size="md">Title</Heading>
    <Text color="gray.600" _dark={{ color: "gray.400" }} mt={1}>Description</Text>
  </Box>
  <Box p={6}>Content</Box>
</Box>
```

### Tabs (Direct Match)
```tsx
// BEFORE (Radix)
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>

// AFTER (Chakra) - Very similar!
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";

<Tabs>
  <TabList>
    <Tab>Tab 1</Tab>
    <Tab>Tab 2</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>Content 1</TabPanel>
    <TabPanel>Content 2</TabPanel>
  </TabPanels>
</Tabs>
```

### Select → Chakra Select
```tsx
// BEFORE (Radix)
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Choose..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>

// AFTER (Chakra)
import { Select } from "@chakra-ui/react";

<Select value={value} onChange={(e) => setValue(e.target.value)}>
  <option value="">Choose...</option>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</Select>
```

### Input, Textarea, Button, Badge (Direct Match - Minimal Changes)
```tsx
// These components are nearly identical between Radix and Chakra
import { Input, Textarea, Button, Badge } from "@chakra-ui/react";

// Same props, same usage!
<Input placeholder="Enter text" />
<Textarea placeholder="Enter description" />
<Button colorScheme="cyan">Click me</Button>
<Badge colorScheme="green">Active</Badge>
```

### Label → FormLabel
```tsx
// BEFORE (Radix)
import { Label } from "@/components/ui/label";
<Label htmlFor="name">Name</Label>

// AFTER (Chakra)
import { FormLabel } from "@chakra-ui/react";
<FormLabel htmlFor="name">Name</FormLabel>
```

---

## 6. Routing (React Router 7 - Keep As-Is)

The routing structure can be copied directly:

```typescript
// src/app/routes.ts (same as Figma Make)
import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Scenarios } from "./pages/Scenarios";
import { ScenarioDetail } from "./pages/ScenarioDetail";
import { CapacityCalculator } from "./pages/CapacityCalculator";
import { Settings } from "./pages/Settings";
import { Help } from "./pages/Help";
import { Admin } from "./pages/Admin";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "scenarios", Component: Scenarios },
      { path: "scenarios/:id", Component: ScenarioDetail },
      { path: "calculator", Component: CapacityCalculator },
      { path: "settings", Component: Settings },
      { path: "help", Component: Help },
      { path: "admin", Component: Admin },
    ],
  },
]);
```

---

## 7. Page-by-Page Migration Checklist

### ✅ Can Copy Verbatim (Business Logic Only):
- All TypeScript interfaces
- State management patterns (useState, useEffect)
- Calculation logic (capacity formulas, complexity scoring)
- Data transformation functions
- Navigation structure

### 🔄 Needs Translation (UI Components):

#### **Scenarios.tsx** (Plans List + Create Modal)
- **Keep:** localStorage → API calls, state management, create/delete logic
- **Replace:** Dialog → Modal, Card → Box, Select → Chakra Select
- **Add:** API integration with `api.getScenarios()`, `api.createScenario()`, `api.deleteScenario()`

#### **ScenarioDetail.tsx** (Individual Plan + Roadmap Items)
- **Keep:** All calculation logic, complexity scoring, roadmap CRUD operations
- **Replace:** Dialog → Modal, Tabs (minimal change), Card → Box
- **Add:** API integration with `api.getRoadmapItems()`, `api.createRoadmapItem()`, etc.

#### **Settings.tsx**
- **Keep:** All settings state, default values, validation logic
- **Replace:** Card → Box, Slider (Chakra has Slider), Switch (same)
- **Add:** API integration with `api.getSettings()`, `api.updateSettings()`

#### **CapacityCalculator.tsx** (Standalone Tool)
- **Keep:** All calculation logic (100% reusable)
- **Replace:** Card → Box
- **Add:** Nothing - this is a pure client-side calculator

#### **Home.tsx** (Marketing/Onboarding)
- **Keep:** Content structure, mockup components
- **Replace:** Card → Box, Button (minimal)
- **Add:** Nothing - pure static page

#### **Help.tsx** (FAQ)
- **Keep:** All content
- **Replace:** Accordion (Chakra has Accordion - very similar API)
- **Add:** Nothing - pure static page

#### **Admin.tsx** (Database Info)
- **Keep:** localStorage stats logic
- **Replace:** Card → Box, Badge (same)
- **Add:** API endpoint for database health checks (optional)

#### **Layout.tsx** (Sidebar Navigation)
- **Keep:** Navigation structure, routing logic, theme toggle
- **Replace:** Entire component with Chakra's Drawer/Sidebar patterns
- **Add:** Integrate with Chakra's ColorMode for theme switching

---

## 8. Step-by-Step Migration Plan

### Phase 1: Backend Setup (Do First in Cursor)
1. ✅ Create PostgreSQL schema in Neon
2. ✅ Create all 12 Netlify Functions
3. ✅ Test API endpoints with Postman/Insomnia
4. ✅ Create `src/services/api.ts` service layer

### Phase 2: Copy Core Logic from Figma Make
5. ✅ Copy TypeScript interfaces to `src/types/`
6. ✅ Copy routing configuration (`routes.ts`)
7. ✅ Copy calculation functions (extract to `src/utils/calculations.ts`)

### Phase 3: Rebuild Pages with Chakra
8. 🔄 **Home.tsx** - Translate Radix Cards → Chakra Boxes
9. 🔄 **CapacityCalculator.tsx** - Translate UI, keep all calculation logic
10. 🔄 **Settings.tsx** - Translate UI, add API integration
11. 🔄 **Help.tsx** - Translate Accordion component
12. 🔄 **Scenarios.tsx** - Translate Dialog/Cards, add API integration
13. 🔄 **ScenarioDetail.tsx** - Translate complex modal forms, add API integration
14. 🔄 **Admin.tsx** - Translate UI, optionally add backend health checks
15. 🔄 **Layout.tsx** - Rebuild sidebar with Chakra components

### Phase 4: Testing & Polish
16. ✅ Test all CRUD operations (Create, Read, Update, Delete)
17. ✅ Test dark mode consistency
18. ✅ Test responsive layouts (mobile + desktop)
19. ✅ Test calculation accuracy (use Figma Make as reference)
20. ✅ Deploy to Netlify staging environment

---

## 9. Key Files Reference from Figma Make

### Business Logic to Extract:
- **Complexity Scoring Algorithm:** `ScenarioDetail.tsx` lines 112-122 (DEMAND_WEEKS_MAP)
- **Capacity Calculations:** `CapacityCalculator.tsx` lines 56-72
- **Settings Defaults:** `Settings.tsx` lines 58-89
- **Data Models:** `Admin.tsx` lines 23-94 (comprehensive type definitions)

### Component Patterns to Replicate:
- **Tabbed Modal Form:** `Scenarios.tsx` lines 9-29 (create plan modal with 3 tabs)
- **Editable Table Rows:** `ScenarioDetail.tsx` (inline editing of roadmap items)
- **Dynamic Complexity Form:** `ScenarioDetail.tsx` (complexity factors loaded from Settings)
- **Calculator with Real-time Updates:** `CapacityCalculator.tsx` (all inputs auto-calculate)

---

## 10. Development Tips for Cursor Agent

### Color System Translation:
- **Figma Make:** Uses `cyan-500` for primary actions
- **Chakra:** Use `colorScheme="cyan"` on Buttons, Badges, etc.

### Dark Mode:
- **Figma Make:** Manual class toggling with `dark:` prefixes
- **Chakra:** Use `useColorMode()` hook + `_dark={{ }}` prop syntax

### Icons:
- **Both use:** `lucide-react` (no changes needed!)
- Import: `import { Plus, Trash2, Edit2 } from "lucide-react";`

### Form State:
- **Figma Make:** Individual useState for each form field
- **Recommendation:** Consider react-hook-form for complex forms (optional optimization)

### localStorage → API Pattern:
```typescript
// BEFORE (Figma Make)
const [scenarios, setScenarios] = useState(() => {
  const saved = localStorage.getItem("scenarios");
  return saved ? JSON.parse(saved) : [];
});

// AFTER (Cursor)
const [scenarios, setScenarios] = useState<Scenario[]>([]);

useEffect(() => {
  api.getScenarios().then(setScenarios);
}, []);
```

---

## 11. Testing Checklist

### Functional Testing:
- [ ] Create new plan with all 3 input methods (manual, paste, upload)
- [ ] Edit plan details
- [ ] Delete plan
- [ ] Duplicate plan
- [ ] Add roadmap items to plan
- [ ] Edit roadmap items with complexity factors
- [ ] Delete roadmap items
- [ ] Change settings and verify they apply to new roadmap items
- [ ] Use standalone calculator
- [ ] Navigate between all pages
- [ ] Test mobile responsive layouts

### Data Integrity:
- [ ] Verify capacity calculations match Figma Make
- [ ] Verify complexity scoring matches Settings configuration
- [ ] Verify roadmap items aggregate to plan totals
- [ ] Verify PostgreSQL constraints prevent invalid data

### UI/UX Parity:
- [ ] Light mode matches Figma Make aesthetic
- [ ] Dark mode has proper contrast
- [ ] Sidebar navigation active states work
- [ ] Modals/dialogs have proper z-index layering
- [ ] Forms validate before submission
- [ ] Loading states display during API calls
- [ ] Error states display when API fails

---

## 12. Package Dependencies to Add

In Cursor's `package.json`, add these from Figma Make:

```json
{
  "dependencies": {
    "@chakra-ui/react": "^2.x.x",
    "@emotion/react": "^11.x.x",
    "@emotion/styled": "^11.x.x",
    "react-router": "^7.13.0",
    "lucide-react": "^0.487.0",
    "date-fns": "^3.6.0"
  }
}
```

---

## Summary

**What to Copy Directly:**
- TypeScript interfaces (100%)
- Calculation logic (100%)
- Routing structure (100%)
- State management patterns (95%)

**What to Translate:**
- All UI components (Radix → Chakra)
- localStorage → API calls
- Theme system (Tailwind → Chakra ColorMode)

**Estimated Effort:**
- Backend setup: 4-6 hours
- Frontend migration: 12-16 hours
- Testing & polish: 4-6 hours
- **Total: ~20-28 hours**

**Critical Success Factors:**
1. Test API endpoints thoroughly before migrating pages
2. Migrate pages one at a time (don't do all at once)
3. Use Figma Make as visual reference during translation
4. Keep calculation logic identical (don't "improve" it during migration)

---

## Questions for Cursor Agent

Before starting, confirm:
1. Do you already have Chakra UI installed?
2. What's your current folder structure for pages/components?
3. Do you want to keep React Router 7 or use your existing routing?
4. Should we create a separate `src/utils/calculations.ts` for business logic?
5. Any existing naming conventions (e.g., camelCase vs snake_case for API)?
