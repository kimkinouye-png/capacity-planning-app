# Capacity Planner: Figma Make → Cursor Migration Package

This package contains everything needed to migrate the Capacity Planner frontend from Figma Make to your Cursor development environment.

---

## 📦 Package Contents

### Core Documentation
1. **CURSOR_AGENT_BRIEF.md** ⭐ **START HERE**
   - Executive summary for your Cursor AI agent
   - Quick start guide
   - Success criteria
   - Common pitfalls

2. **MIGRATION_PLAN.md** 📋 **COMPLETE SPECIFICATION**
   - Step-by-step migration guide
   - Database schemas (PostgreSQL)
   - API endpoint specifications (Netlify Functions)
   - Component mapping reference
   - Testing checklist

3. **DATA_REFERENCE.md** 🔢 **BUSINESS LOGIC**
   - All calculation formulas (DO NOT CHANGE!)
   - TypeScript interfaces
   - Default settings values
   - Validation rules
   - Mock data examples

4. **COMPONENT_TRANSLATION_GUIDE.md** 🎨 **UI TRANSLATION**
   - Radix UI → Chakra UI component mappings
   - Code snippets for every component
   - Dark mode patterns
   - Layout utilities

5. **EXAMPLE_PAGE_MIGRATION.md** 📖 **WORKING EXAMPLE**
   - Complete before/after comparison
   - Scenarios.tsx page translation
   - localStorage → API conversion
   - Best practices demonstration

---

## 🎯 What This Project Is

A **desktop + mobile web app** for capacity planning with:

- **7 pages:** Home, Plans, Plan Detail, Calculator, Settings, Help, Admin
- **Professional UI:** Light-first theme with cyan accents (Asana/Airtable style)
- **Complex calculations:** Capacity forecasting, complexity-based demand scoring
- **Full CRUD:** Create/read/update/delete plans and roadmap items
- **Settings:** Global configuration for complexity weights, project types, etc.

---

## 🏗️ Architecture Overview

### Current State (Figma Make)
```
Frontend: React 18 + Radix UI + Tailwind v4 + React Router 7
Storage: localStorage (mock persistence)
State: useState/useEffect patterns
```

### Target State (Cursor)
```
Frontend: React 18 + Chakra UI + React Router 7
Backend: Netlify Serverless Functions (Node/TypeScript)
Database: Neon PostgreSQL
State: useState/useEffect + API calls
```

---

## 🚀 Migration Strategy

### Phase 1: Backend (4-6 hours)
1. Create 3 PostgreSQL tables in Neon
2. Create 11 Netlify Functions for API endpoints
3. Test all endpoints with Postman/Insomnia

### Phase 2: Frontend Setup (2-3 hours)
1. Install Chakra UI dependencies
2. Copy TypeScript interfaces from Figma Make
3. Create API service layer (`src/services/api.ts`)
4. Extract calculation utilities to `src/utils/calculations.ts`

### Phase 3: Page Migration (12-16 hours)
Translate 7 pages from Radix UI → Chakra UI:
1. Home.tsx (marketing/onboarding)
2. Help.tsx (FAQ)
3. CapacityCalculator.tsx (standalone tool)
4. Settings.tsx (global config)
5. Scenarios.tsx (plans list + create)
6. ScenarioDetail.tsx (plan detail + roadmap CRUD)
7. Admin.tsx (database admin)

### Phase 4: Testing & Polish (4-6 hours)
1. Test all CRUD operations
2. Verify calculation accuracy
3. Test responsive layouts
4. Test dark mode
5. Deploy to staging

**Total Estimated Time:** 20-28 hours

---

## 📚 How to Use This Package

### For You (Project Owner)
1. Download this entire Figma Make project
2. Share these 5 markdown files with your Cursor AI agent
3. Point Cursor to **CURSOR_AGENT_BRIEF.md** to start

### For Cursor AI Agent
1. Read **CURSOR_AGENT_BRIEF.md** first
2. Refer to **MIGRATION_PLAN.md** for detailed steps
3. Use **DATA_REFERENCE.md** for exact formulas
4. Use **COMPONENT_TRANSLATION_GUIDE.md** while coding
5. Use **EXAMPLE_PAGE_MIGRATION.md** as a template

---

## 🎨 Design System

### Colors
- **Primary:** Cyan (`colorScheme="cyan"` in Chakra)
- **Status Colors:**
  - 🟢 Green = Healthy capacity (≤80% utilization)
  - 🟡 Yellow = At capacity (80-100%)
  - 🔴 Red = Over capacity (>100%)

### Layout
- **Left sidebar navigation** (not top nav)
- **Cards with shadows** for visual depth
- **Light mode default** (dark mode supported)

### Typography
- Uses system fonts (no custom font imports needed)
- Clear visual hierarchy with headings

---

## 🔑 Critical Success Factors

### ✅ DO Preserve:
- All calculation formulas exactly
- Complexity scoring algorithm
- Settings default values
- Data validation rules
- Component naming conventions

### ✅ DO Add:
- API error handling with toast notifications
- Loading states (spinners)
- Empty states (when no data)
- Form validation
- Dark mode support (`_dark` props)

### ❌ DON'T Change:
- Base focus weeks (3.0)
- Workstream penalty formula
- Complexity factor weights
- Size band thresholds
- Capacity calculation logic

---

## 📊 Data Model Summary

### 3 Database Tables

**scenarios** (Plans)
- Core entity: capacity planning scenarios
- Contains: team size, capacity, demand aggregates
- Relationships: Has many roadmap_items

**roadmap_items** (Work Items)
- Individual work items within a plan
- Contains: complexity factors, calculated demand
- Relationships: Belongs to scenario

**settings** (Global Config)
- Single row with JSONB value
- Contains: complexity weights, project types, planning periods
- Used by: All plans for calculations

---

## 🧮 Key Calculations

### Capacity Formula
```
Available Weeks = Planning Period - (Holidays + PTO) / 5
Workstream Impact = (Workstreams - 1) × Penalty
Adjusted Focus Ratio = Focus Time Ratio - Workstream Impact
Focus Weeks = Available Weeks × Adjusted Focus Ratio
```

### Demand Formula (Complexity-Based)
```
Base = 3.0 weeks
Product Risk Impact = (Score - 1) × (Weight / 10)
Problem Ambiguity Impact = (Score - 1) × (Weight / 10)
Total UX Demand = Base + Product Risk + Problem Ambiguity
```

**See DATA_REFERENCE.md for complete formulas.**

---

## 🧪 Testing Checklist

### Functional Tests
- [ ] Create plan (all 3 methods: manual, paste, upload)
- [ ] Edit plan details
- [ ] Delete plan
- [ ] Duplicate plan
- [ ] Add roadmap items
- [ ] Edit roadmap items with complexity factors
- [ ] Delete roadmap items
- [ ] Update settings
- [ ] Use standalone calculator
- [ ] Navigate all pages

### Data Integrity Tests
- [ ] Capacity calculations match Figma Make
- [ ] Complexity scoring matches settings
- [ ] Roadmap items aggregate to plan totals
- [ ] Database constraints prevent invalid data

### UI/UX Tests
- [ ] Light mode aesthetic matches Figma Make
- [ ] Dark mode has proper contrast
- [ ] Sidebar navigation works
- [ ] Modals/dialogs display correctly
- [ ] Forms validate
- [ ] Loading states display
- [ ] Error states display

---

## 📱 Responsive Design

All pages work on:
- 📱 **Mobile:** Single column, hamburger menu
- 📱 **Tablet:** 2-column grids
- 💻 **Desktop:** 3-column grids, persistent sidebar

---

## 🔧 Technologies

### Frontend
- React 18.3.1
- React Router 7.13.0
- Chakra UI 2.x
- TypeScript
- Lucide React (icons)
- date-fns (date formatting)

### Backend
- Netlify Functions (Node.js)
- Neon PostgreSQL
- TypeScript

---

## 📞 Pre-Migration Questions

Ask your Cursor agent to confirm:

1. **Is Chakra UI already installed?**
   - If not, needs: `@chakra-ui/react @emotion/react @emotion/styled`

2. **What's the folder structure?**
   - Where should pages/components live?

3. **Keep React Router 7?**
   - Or use existing routing?

4. **API naming convention?**
   - `get-scenarios` vs `getScenarios` vs `scenarios/list`?

5. **Shared utilities location?**
   - Recommend: `src/utils/calculations.ts`

---

## 🎬 Getting Started (For Cursor Agent)

```bash
# 1. Start with the brief
Read: CURSOR_AGENT_BRIEF.md

# 2. Follow the detailed plan
Read: MIGRATION_PLAN.md Section by Section

# 3. Set up backend first
- Create database tables (Section 1)
- Create Netlify Functions (Section 3)
- Test all endpoints

# 4. Migrate frontend
- Copy types (Section 2)
- Create API service (Section 4)
- Translate pages one by one (Section 7)

# 5. Test everything
Follow: MIGRATION_PLAN.md Section 11
```

---

## 🆘 Troubleshooting

### Calculations Don't Match
- Check **DATA_REFERENCE.md** for exact formulas
- Verify settings are loaded correctly
- Ensure weights are divided by 10 (not 100)

### API Errors
- Check Netlify Function logs
- Verify database connection
- Check CORS settings
- Ensure JSON body parsing

### UI Looks Wrong
- Compare with Figma Make screenshots
- Check dark mode props (`_dark`)
- Verify spacing values (4, 6, not 3, 5)
- Check cyan colorScheme is applied

### Components Not Rendering
- Verify Chakra imports
- Ensure ChakraProvider wraps app
- Check theme configuration

---

## 📈 Post-Migration Tasks

Once migration is complete:

1. **Deploy to staging**
2. **Run full test suite**
3. **Get stakeholder approval**
4. **Document any deviations**
5. **Deploy to production**
6. **Archive Figma Make version**

---

## 🎓 Learning Resources

### Chakra UI
- Docs: https://chakra-ui.com/docs
- Component Gallery: https://chakra-ui.com/docs/components

### React Router 7
- Docs: https://reactrouter.com/

### Netlify Functions
- Docs: https://docs.netlify.com/functions/overview/

---

## 📄 License & Credits

**Frontend Design:** Built in Figma Make  
**UI Library:** Radix UI → Chakra UI  
**Icons:** Lucide React  
**Backend:** Netlify + Neon

---

## ✅ Final Checklist

Before you start, ensure you have:

- [ ] Downloaded all 5 markdown files from this package
- [ ] Read CURSOR_AGENT_BRIEF.md
- [ ] Access to Neon PostgreSQL database
- [ ] Access to Netlify Functions
- [ ] Cursor project is set up
- [ ] Chakra UI can be installed
- [ ] Time allocated (20-28 hours)

---

**You're ready to migrate! Good luck! 🚀**

For questions, refer back to the relevant documentation file. Everything you need is in this package.
