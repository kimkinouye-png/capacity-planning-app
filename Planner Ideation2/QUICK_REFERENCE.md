# Capacity Planner Migration: Quick Reference Card

**Print this or keep it open while migrating!**

---

## 📁 File Guide

| File | Purpose | When to Use |
|------|---------|-------------|
| **CURSOR_AGENT_BRIEF.md** | Executive summary + quickstart | First read, high-level overview |
| **MIGRATION_PLAN.md** | Complete step-by-step guide | Main reference during migration |
| **DATA_REFERENCE.md** | Business logic + formulas | When copying calculations |
| **COMPONENT_TRANSLATION_GUIDE.md** | UI component mappings | While translating JSX |
| **EXAMPLE_PAGE_MIGRATION.md** | Complete working example | When starting a new page |
| **MIGRATION_README.md** | Package overview | Project context |

---

## 🎯 Migration Checklist

### Backend (Do First!)
- [ ] Create `scenarios` table in Neon PostgreSQL
- [ ] Create `roadmap_items` table in Neon PostgreSQL
- [ ] Create `settings` table in Neon PostgreSQL
- [ ] Create 11 Netlify Functions (see list below)
- [ ] Test all API endpoints

### Frontend Setup
- [ ] Install Chakra UI dependencies
- [ ] Create `src/types/` folder with interfaces
- [ ] Create `src/services/api.ts`
- [ ] Create `src/utils/calculations.ts`
- [ ] Set up Chakra theme with cyan colors

### Page Migration (In Order)
- [ ] Home.tsx (easy - static)
- [ ] Help.tsx (easy - static)
- [ ] CapacityCalculator.tsx (medium - client-side only)
- [ ] Settings.tsx (medium - API integration)
- [ ] Scenarios.tsx (medium - CRUD)
- [ ] ScenarioDetail.tsx (hard - complex state)
- [ ] Admin.tsx (medium - admin tools)

### Testing
- [ ] All CRUD operations work
- [ ] Calculations match Figma Make
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] Loading/error states display

---

## 🛠️ API Endpoints Needed

Create these in `netlify/functions/`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `get-scenarios` | GET | List all plans |
| `get-scenario` | GET | Get single plan by ID |
| `create-scenario` | POST | Create new plan |
| `update-scenario` | PUT | Update plan |
| `delete-scenario` | DELETE | Delete plan |
| `duplicate-scenario` | POST | Duplicate plan |
| `get-roadmap-items` | GET | Get roadmap items for plan |
| `create-roadmap-item` | POST | Add item to plan |
| `update-roadmap-item` | PUT | Update roadmap item |
| `delete-roadmap-item` | DELETE | Delete roadmap item |
| `get-settings` | GET | Get global settings |
| `update-settings` | PUT | Update global settings |

---

## 🎨 Component Translation Cheat Sheet

| Figma Make (Radix) | Cursor (Chakra) |
|--------------------|-----------------|
| `<Dialog>` | `<Modal>` + `<ModalOverlay>` + `<ModalContent>` |
| `<Card>` | `<Box bg="white" _dark={{ bg: "gray.800" }} borderRadius="lg" shadow="sm">` |
| `<Label>` | `<FormLabel>` |
| `<Tabs>` | `<Tabs>` + `<TabList>` + `<Tab>` + `<TabPanels>` + `<TabPanel>` |
| `<Button variant="outline">` | `<Button variant="outline">` (same!) |
| `<Badge>` | `<Badge>` (same!) |
| `<Input>` | `<Input>` (same!) |
| `className="flex gap-4"` | `<HStack spacing={4}>` |
| `className="space-y-4"` | `<VStack spacing={4}>` |
| `className="grid grid-cols-3"` | `<Grid templateColumns="repeat(3, 1fr)">` |

---

## 🧮 Critical Formulas (DO NOT CHANGE!)

### Capacity Calculation
```typescript
const availableWeeks = (planningPeriodWeeks * 5 - vacationDays - holidays) / 5;
const workstreamImpact = (workstreams - 1) * 0.10; // 10% penalty per workstream
const adjustedFocusTimeRatio = Math.max(0.2, 0.75 - workstreamImpact);
const focusWeeks = availableWeeks * adjustedFocusTimeRatio;
```

### Demand Calculation
```typescript
const BASE_FOCUS_WEEKS = 3.0;
const uxDemand = BASE_FOCUS_WEEKS + 
  (productRisk - 1) * (effortWeights.productRisk / 10) +
  (problemAmbiguity - 1) * (effortWeights.problemAmbiguity / 10);
```

### Utilization Status
```typescript
const utilization = (demand / capacity) * 100;
// ≤80% = Green (Healthy)
// 80-100% = Yellow (At Capacity)
// >100% = Red (Over Capacity)
```

---

## 📊 Database Tables Quick Ref

### scenarios
```sql
id, name, description, status, quarter,
team_size_ux_design, team_size_content_design,
capacity_ux_design, capacity_content_design,
demand_ux_design, demand_content_design,
roadmap_items_count, created_at, updated_at
```

### roadmap_items
```sql
id, scenario_id, key, name, initiative, priority, quarter, status,
project_type, ux_focus_weeks, content_focus_weeks,
ux_product_risk, ux_problem_ambiguity,
content_surface_area, content_localization_scope,
created_at, updated_at
```

### settings
```sql
id, key, value (JSONB), updated_at
```

---

## 🎨 Design Tokens

### Colors
- **Primary CTA:** `colorScheme="cyan"`
- **Success:** `colorScheme="green"`
- **Warning:** `colorScheme="yellow"`
- **Error:** `colorScheme="red"`
- **Neutral:** `colorScheme="gray"`

### Spacing Scale
- **Tight:** `spacing={2}`
- **Normal:** `spacing={4}`
- **Loose:** `spacing={6}`
- **Extra:** `spacing={8}`

### Border Radius
- **Cards:** `borderRadius="lg"`
- **Buttons:** `borderRadius="md"` (default)
- **Inputs:** `borderRadius="md"` (default)

---

## 🚨 Common Mistakes to Avoid

### ❌ Don't:
1. Change `BASE_FOCUS_WEEKS` from 3.0
2. Forget to divide weights by 10 (not 100!)
3. Skip error handling (no try/catch)
4. Forget loading states (`isLoading`, `<Spinner>`)
5. Use `className` for styling (use Chakra props!)
6. Forget `_dark` props for dark mode
7. Mix localStorage with API calls

### ✅ Do:
1. Copy formulas exactly from DATA_REFERENCE.md
2. Add `useToast()` for notifications
3. Show `<Spinner>` while loading
4. Use `colorScheme="cyan"` for primary actions
5. Use `<VStack>`, `<HStack>`, `<Grid>` for layouts
6. Add `_dark={{ }}` for all colors/backgrounds
7. Replace ALL localStorage with API calls

---

## 📱 Responsive Breakpoints

```typescript
// Chakra breakpoints
base: 0px      // Mobile
sm: 480px      // Small mobile
md: 768px      // Tablet
lg: 992px      // Desktop
xl: 1280px     // Large desktop

// Usage
<Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}>
```

---

## 🔍 Where to Find Things

### In Figma Make:
- **Capacity formulas:** `CapacityCalculator.tsx` lines 56-72
- **Complexity scoring:** `ScenarioDetail.tsx` lines 112-165
- **Settings defaults:** `Settings.tsx` lines 58-89
- **Data models:** `Admin.tsx` lines 23-94
- **Create modal:** `Scenarios.tsx` (tabbed form)
- **Edit modal:** `ScenarioDetail.tsx` (complexity factors)

### In Documentation:
- **SQL schemas:** MIGRATION_PLAN.md Section 1
- **API specs:** MIGRATION_PLAN.md Section 3
- **Formulas:** DATA_REFERENCE.md Section "Calculation Formulas"
- **Component mappings:** COMPONENT_TRANSLATION_GUIDE.md
- **Complete example:** EXAMPLE_PAGE_MIGRATION.md

---

## 🎯 Success Metrics

Your migration is done when:

✅ All pages load without errors  
✅ Calculator produces same results as Figma Make  
✅ Plans can be created, edited, deleted  
✅ Roadmap items can be added/edited  
✅ Settings update global config  
✅ Dark mode works  
✅ Mobile layout works  
✅ API errors show toasts  
✅ Loading states display  

---

## ⏱️ Time Estimates

| Task | Hours |
|------|-------|
| Database setup | 2 |
| API endpoints | 4 |
| Home.tsx | 1 |
| Help.tsx | 1 |
| CapacityCalculator.tsx | 2 |
| Settings.tsx | 3 |
| Scenarios.tsx | 4 |
| ScenarioDetail.tsx | 6 |
| Admin.tsx | 2 |
| Testing | 4 |
| **TOTAL** | **24-28 hours** |

---

## 🆘 Stuck? Check:

1. **Formulas wrong?** → DATA_REFERENCE.md
2. **Component syntax?** → COMPONENT_TRANSLATION_GUIDE.md
3. **API structure?** → MIGRATION_PLAN.md Section 3-4
4. **Example needed?** → EXAMPLE_PAGE_MIGRATION.md
5. **Overview lost?** → CURSOR_AGENT_BRIEF.md

---

## 📦 Install Commands

```bash
# Chakra UI
npm install @chakra-ui/react @emotion/react @emotion/styled

# Icons (already installed in Figma Make)
npm install lucide-react

# Date utilities (already installed in Figma Make)
npm install date-fns

# Router (already installed in Figma Make)
npm install react-router
```

---

## 🎬 Start Here!

1. Read: **CURSOR_AGENT_BRIEF.md**
2. Follow: **MIGRATION_PLAN.md**
3. Reference: **This card + other docs**
4. Code: One page at a time
5. Test: After each page
6. Deploy: When all tests pass

**Good luck! 🚀**
