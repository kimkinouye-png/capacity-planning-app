# Cursor Agent: Capacity Planner Migration Brief

## 🎯 Mission

Integrate a fully-designed **Capacity Planner** frontend (currently in Figma Make) with your existing **Netlify Functions + Neon PostgreSQL** backend.

---

## 📦 What You're Receiving

This project contains a complete frontend implementation with:

- ✅ **7 pages** (Home, Plans, Plan Detail, Calculator, Settings, Help, Admin)
- ✅ **Complete UI/UX** matching Asana/Airtable aesthetic
- ✅ **All business logic** for capacity planning calculations
- ✅ **Light/dark theme** with cyan accent colors
- ✅ **Responsive layouts** for desktop and mobile
- ✅ **React Router 7** navigation structure

**Current state:** Uses Radix UI components + localStorage persistence  
**Your goal:** Translate to Chakra UI components + API persistence

---

## 📚 Documentation Provided

1. **MIGRATION_PLAN.md** ⭐ START HERE
   - Complete step-by-step migration guide
   - Database schema for Neon PostgreSQL
   - API endpoint specifications for Netlify Functions
   - Component mapping reference
   - Timeline estimates

2. **DATA_REFERENCE.md**
   - All calculation formulas (preserve exactly!)
   - TypeScript interfaces
   - Default settings values
   - Mock data examples
   - Business rules documentation

3. **COMPONENT_TRANSLATION_GUIDE.md**
   - Radix UI → Chakra UI translations
   - Code snippets for every component type
   - Quick reference for common patterns
   - Dark mode implementation

4. **EXAMPLE_PAGE_MIGRATION.md**
   - Complete before/after example
   - Shows localStorage → API conversion
   - Demonstrates component translation
   - Testing checklist

---

## 🚀 Quick Start Steps

### 1. Review the Architecture
```
Your Current Setup:
├── netlify/functions/     # ✅ Already exists
├── src/                   # Need to add/modify
└── Neon PostgreSQL        # ✅ Already connected

What to Add:
├── src/types/             # TypeScript interfaces
├── src/services/api.ts    # API client layer
├── src/pages/             # 7 page components (translate from Figma Make)
├── src/components/        # Reusable components
└── Database tables        # scenarios, roadmap_items, settings
```

### 2. Phase 1: Backend (Do First!)
```bash
# Create these tables in Neon PostgreSQL
✅ scenarios (plans)
✅ roadmap_items
✅ settings

# Create these Netlify Functions
✅ get-scenarios.ts
✅ create-scenario.ts
✅ update-scenario.ts
✅ delete-scenario.ts
✅ duplicate-scenario.ts
✅ get-roadmap-items.ts
✅ create-roadmap-item.ts
✅ update-roadmap-item.ts
✅ delete-roadmap-item.ts
✅ get-settings.ts
✅ update-settings.ts

# Test all endpoints before migrating frontend!
```

See **MIGRATION_PLAN.md** Section 1 for exact SQL schemas.

### 3. Phase 2: Copy Core Logic
```bash
# Extract from Figma Make, paste into Cursor
src/types/scenario.ts       # TypeScript interfaces
src/types/roadmap.ts
src/types/settings.ts
src/utils/calculations.ts   # All calculation formulas
src/services/api.ts         # API client
```

See **DATA_REFERENCE.md** for exact calculation formulas to preserve.

### 4. Phase 3: Rebuild Pages with Chakra
Start with the simplest pages first:

**Easy (pure static):**
1. Home.tsx - Marketing page
2. Help.tsx - FAQ page
3. CapacityCalculator.tsx - Client-side calculator

**Medium (API integration):**
4. Settings.tsx - Global configuration
5. Scenarios.tsx - Plans list + create modal

**Complex (lots of state):**
6. ScenarioDetail.tsx - Plan detail + roadmap CRUD
7. Admin.tsx - Database admin panel

See **EXAMPLE_PAGE_MIGRATION.md** for a complete page translation.

### 5. Phase 4: Test Everything
See **MIGRATION_PLAN.md** Section 11 for full testing checklist.

---

## 🎨 Key Design Principles to Maintain

### Color System
- **Primary CTA:** `colorScheme="cyan"` (used sparingly!)
- **Status Colors:**
  - Green = Healthy capacity
  - Yellow = At capacity
  - Red = Over capacity
- **Light mode default** (not dark-first)

### Visual Hierarchy
- **Cards have shadows:** `shadow="sm"`
- **Proper borders:** `border="1px" borderColor="gray.200"`
- **Consistent spacing:** Use `spacing={4}` or `spacing={6}`

### Information Architecture
- **Left sidebar navigation** (not top nav)
- **Breadcrumbs on detail pages**
- **Clear section headings**

---

## 🔧 Critical Business Logic

### DO NOT CHANGE These Formulas!

#### Capacity Calculation
```typescript
const focusWeeks = workWeeks * adjustedFocusTimeRatio;
const adjustedFocusTimeRatio = Math.max(0.2, focusTimeRatio - workstreamImpact);
const workstreamImpact = (workstreams - 1) * workstreamPenalty;
```

#### Complexity-Based Demand
```typescript
const BASE_FOCUS_WEEKS = 3.0;
const uxDemand = BASE_FOCUS_WEEKS + 
  (productRisk - 1) * (effortWeights.productRisk / 10) +
  (problemAmbiguity - 1) * (effortWeights.problemAmbiguity / 10);
```

See **DATA_REFERENCE.md** Section "Calculation Formulas" for complete details.

---

## 📋 Component Translation Quick Reference

| Figma Make (Radix) | Cursor (Chakra) | Complexity |
|--------------------|-----------------|------------|
| Dialog | Modal + ModalOverlay + ModalContent | Medium |
| Card | Box with styling props | Easy |
| Tabs | Tabs (very similar!) | Easy |
| Select | Select (simpler!) | Easy |
| Button | Button with colorScheme | Easy |
| Label | FormLabel | Easy |
| Input/Textarea | Input/Textarea (same!) | Easy |
| Badge | Badge (same!) | Easy |

See **COMPONENT_TRANSLATION_GUIDE.md** for code snippets.

---

## 🐛 Common Migration Pitfalls

### ❌ Don't Do This:
1. Change calculation formulas "because it seems simpler"
2. Remove complexity factors (they're intentional!)
3. Skip API error handling
4. Forget dark mode support
5. Use different status colors
6. Remove loading states

### ✅ Do This Instead:
1. Copy formulas exactly from **DATA_REFERENCE.md**
2. Keep all complexity factors as-is
3. Add try/catch + toast notifications
4. Use `_dark={{ }}` props everywhere
5. Use exact colors: green/yellow/red for capacity status
6. Show `<Spinner>` while API calls are pending

---

## 🔍 Where to Find Things in Figma Make

### Business Logic
- **Capacity formulas:** `CapacityCalculator.tsx` lines 56-72
- **Complexity scoring:** `ScenarioDetail.tsx` lines 112-165
- **Settings defaults:** `Settings.tsx` lines 58-89
- **Data models:** `Admin.tsx` lines 23-94

### Component Patterns
- **Tabbed modal form:** `Scenarios.tsx` (create plan modal)
- **Inline editing:** `ScenarioDetail.tsx` (roadmap items table)
- **Dynamic forms:** `ScenarioDetail.tsx` (complexity factors from Settings)
- **Real-time calculations:** `CapacityCalculator.tsx`

---

## 📊 Database Schema Summary

### Table: `scenarios`
Primary entity for capacity plans. Contains team size, calculated capacity, aggregated demand.

### Table: `roadmap_items`
Work items within a plan. Each has complexity factors that calculate demand.

### Table: `settings`
Global configuration stored as JSONB. Single row, key = 'capacity_planner_config'.

**See MIGRATION_PLAN.md Section 1 for complete CREATE TABLE statements.**

---

## 🎯 Success Criteria

Your migration is complete when:

- [ ] All 7 pages render without errors
- [ ] Plans can be created, viewed, edited, deleted
- [ ] Roadmap items can be added to plans
- [ ] Complexity factors calculate demand correctly
- [ ] Settings page updates global configuration
- [ ] Calculator produces same results as Figma Make
- [ ] Dark mode works throughout
- [ ] Mobile layouts are responsive
- [ ] API calls have loading/error states
- [ ] All formulas match Figma Make exactly

---

## 💡 Pro Tips

### Start Small
Don't try to migrate all pages at once. Do one page, test it, then move to the next.

### Test Calculations Early
Compare your Calculator page results with Figma Make. If numbers don't match, formulas are wrong.

### Reuse Components
Create a `<Card>` wrapper component instead of repeating Box props everywhere.

### Use TypeScript
The interfaces in **DATA_REFERENCE.md** will catch type errors during migration.

### Keep Figma Make Open
Use it as a visual reference while translating components.

---

## 📞 Questions to Confirm Before Starting

1. **Do you already have Chakra UI installed?**
   - If not: `npm install @chakra-ui/react @emotion/react @emotion/styled`

2. **What's your current folder structure?**
   - Confirm where pages/components should live

3. **Do you want to keep React Router 7?**
   - Or use your existing routing solution?

4. **Any naming conventions for API endpoints?**
   - e.g., `get-scenarios` vs `getScenarios` vs `scenarios/list`

5. **Should we create shared calculation utilities?**
   - Recommend: `src/utils/calculations.ts` for reusability

---

## 📈 Estimated Timeline

- **Backend setup:** 4-6 hours (database + 11 Netlify Functions)
- **Frontend migration:** 12-16 hours (7 pages + components)
- **Testing & polish:** 4-6 hours
- **Total:** ~20-28 hours

---

## 🎬 Ready to Start?

1. Read **MIGRATION_PLAN.md** in full
2. Set up database schema in Neon
3. Create Netlify Functions
4. Test API endpoints with Postman
5. Migrate pages one at a time
6. Test each page before moving to next
7. Deploy to staging when complete

**Good luck! The design work is done - you just need to connect the dots.** 🚀

---

## 📝 Final Notes

- All calculation logic is **battle-tested** in Figma Make
- The UI/UX is **validated** with stakeholders
- The data model is **normalized** and ready for PostgreSQL
- The component structure is **modular** and maintainable

**Your job:** Translate the UI library and add database persistence. Everything else is ready to go!
