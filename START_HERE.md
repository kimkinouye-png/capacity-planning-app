# 🚀 START HERE: Capacity Planner Migration

You're migrating this Figma Make reference project into your Cursor production environment.

---

## ✅ What You Confirmed

- ✅ Chakra UI is already installed in Cursor
- ✅ React Router 7 is already installed in Cursor  
- ✅ Netlify Functions use kebab-case naming
- ✅ Database has `session_id` column (must preserve)
- ✅ Following **Option A**: Copy business logic exactly, rebuild UI in Chakra

---

## 📦 This Project Contains

**This is the Figma Make REFERENCE implementation with:**
- ✅ All business logic (calculations, formulas)
- ✅ Complete UI/UX (Radix UI + Tailwind)
- ✅ 7 working pages using localStorage
- ✅ Full documentation for migration

**Your Cursor project has:**
- ✅ Netlify Functions backend
- ✅ Neon PostgreSQL database
- ✅ Existing session isolation
- ⚠️ May be missing some columns/endpoints (Phase 1 will check)

---

## 🎯 Your Mission

**Phase 1:** Gap analysis - compare your DB/API to requirements, implement gaps  
**Phase 2:** Copy TypeScript types and calculation utilities  
**Phase 3:** Migrate Calculator page (validation gate - must match Figma Make exactly!)  
**Phase 4:** Migrate remaining 6 pages  

**Total Time:** 40-60 hours

---

## 📖 Step-by-Step: What to Do Right Now

### **Step 1: Read the Execution Plan** (5 minutes)
Open: `/MIGRATION_EXECUTION_PLAN.md`

This is your master checklist. It has:
- Phase-by-phase breakdown
- Timeline estimates  
- Daily workflow guidance
- Red flags to watch for

### **Step 2: Start Phase 1 - Gap Analysis** (2-4 hours)
Open: `/PHASE1_GAP_ANALYSIS.md`

**Actions:**
1. Compare your `database/schema.sql` to Part A (Database Schema)
2. List missing columns in `scenarios` table
3. Check if `roadmap_items` table exists
4. Check if `settings` table exists
5. Compare your `netlify/functions/` to Part B (API Endpoints)
6. List missing endpoints
7. Write migration SQL for missing columns/tables
8. Implement missing Netlify Functions
9. Test all 11 endpoints with curl/Postman

**You're done with Phase 1 when:**
- ✅ All database columns exist
- ✅ All 11 Netlify Functions exist and respond correctly
- ✅ Session isolation still works

### **Step 3: Complete Phase 2 - Setup** (1-2 hours)
Open: `/PHASE2_TYPESCRIPT_INTERFACES.md`

**Actions:**
1. Copy TypeScript interfaces to `src/types/`
2. Copy API service to `src/services/api.ts`
3. Copy calculations to `src/utils/calculations.ts`
4. Test API client works
5. Test calculations match expected values

**You're done with Phase 2 when:**
- ✅ `api.getScenarios()` returns data
- ✅ Calculation test outputs match examples in doc

### **Step 4: Complete Phase 3 - Calculator Migration** (3-4 hours) ⚠️ **CRITICAL VALIDATION GATE**
Open: `/src/app/pages/CapacityCalculator.tsx` (Figma Make reference)

**Actions:**
1. Study Figma Make Calculator
2. Create Chakra version in Cursor
3. Use calculations from `src/utils/calculations.ts`
4. Test with same inputs as Figma Make
5. **Verify outputs match EXACTLY**

**You're done with Phase 3 when:**
- ✅ Calculator renders in Chakra
- ✅ Outputs match Figma Make within 0.01 tolerance
- ✅ All inputs work (sliders, numbers)
- ✅ Dark mode works

**⚠️ IF NUMBERS DON'T MATCH: STOP. FIX BEFORE PROCEEDING.**

### **Step 5: Complete Phase 4 - Migrate Remaining Pages** (30-40 hours)
Migrate in this order:
1. **Home.tsx** (easy - static)
2. **Help.tsx** (easy - static)  
3. **Settings.tsx** (medium - API integration)
4. **Scenarios.tsx** (medium - CRUD) - see `/EXAMPLE_PAGE_MIGRATION.md`
5. **ScenarioDetail.tsx** (hard - complex state)
6. **Admin.tsx** (medium - admin tools)

**For each page:**
- Read Figma Make version  
- Copy business logic
- Translate UI per `/COMPONENT_TRANSLATION_GUIDE.md`
- Replace localStorage with API calls
- Test CRUD operations

### **Step 6: Final Testing & Deployment** (4-6 hours)
- ✅ All pages work
- ✅ Calculator matches Figma Make
- ✅ Dark mode throughout
- ✅ Mobile responsive
- ✅ API errors handled
- ✅ Deploy to staging

---

## 📚 Documentation Quick Reference

| Document | Use When |
|----------|----------|
| **MIGRATION_EXECUTION_PLAN.md** | Overall strategy, timeline, daily workflow |
| **PHASE1_GAP_ANALYSIS.md** | Phase 1: Database + API gaps |
| **PHASE2_TYPESCRIPT_INTERFACES.md** | Phase 2: Setting up types + API client |
| **DATA_REFERENCE.md** | Need exact formula or business rule |
| **COMPONENT_TRANSLATION_GUIDE.md** | Translating Radix → Chakra UI |
| **EXAMPLE_PAGE_MIGRATION.md** | Full working example of page migration |
| **QUICK_REFERENCE.md** | Quick lookup cheat sheet |

---

## 🧮 The Golden Rule

**NEVER modify calculation formulas.**

If numbers don't match Figma Make:
1. You copied the formula wrong
2. You changed a constant
3. You added/removed rounding

→ Compare line-by-line with `/DATA_REFERENCE.md`

---

## 🎯 Success Criteria Recap

### Phase 1 Success:
- All database columns exist
- All 11 API endpoints work
- Session isolation preserved

### Phase 3 Success (Validation Gate):
- Calculator outputs match Figma Make **exactly**
- This proves formulas are copied correctly

### Phase 4 Success:
- All 7 pages work in Chakra
- All CRUD operations work
- Dark mode + mobile responsive

---

## ⚠️ Common Pitfalls

### ❌ Don't Do This:
1. Skip Phase 1 validation
2. Modify formulas "to make them simpler"
3. Migrate all pages at once
4. Skip Calculator validation gate
5. Forget session_id in queries
6. Use Radix components in production code

### ✅ Do This Instead:
1. Complete Phase 1 fully before Phase 2
2. Copy formulas exactly from DATA_REFERENCE.md
3. Migrate one page at a time
4. Verify Calculator matches before proceeding
5. Preserve session_id in all API calls
6. Use only Chakra UI components

---

## 🚦 Your Next Action

**Right now, open these 3 files:**

1. `/MIGRATION_EXECUTION_PLAN.md` - Read fully (15 mins)
2. `/PHASE1_GAP_ANALYSIS.md` - Start filling out (2-4 hours)
3. Your Cursor project's `database/schema.sql` - Compare to requirements

**Then:**
- Create `GAP_MISSING_DB.md` in Cursor project
- Create `GAP_MISSING_ENDPOINTS.md` in Cursor project
- Write migration SQL
- Implement missing endpoints
- Test with curl

**Timeline:**
- Phase 1 should take 6-8 hours total
- Aim to complete it in 1 day
- Then take a break before Phase 2

---

## 💡 Pro Tips

1. **Keep Figma Make running** as visual reference
2. **Don't rush the Calculator phase** - it's your validation
3. **Test each page before moving to next**
4. **Commit frequently** with clear messages
5. **Use TypeScript errors as guardrails**

---

## 📞 Getting Help

Stuck? Check these in order:

1. Is it a component question? → `/COMPONENT_TRANSLATION_GUIDE.md`
2. Is it a formula question? → `/DATA_REFERENCE.md`  
3. Is it a pattern question? → `/EXAMPLE_PAGE_MIGRATION.md`
4. Is it a strategy question? → `/MIGRATION_EXECUTION_PLAN.md`
5. Need calculator reference? → `/src/app/pages/CapacityCalculator.tsx`

---

## ✨ You Got This!

**The hard work (design, business logic) is done.**

You're just:
1. Checking what's missing (Phase 1)
2. Copying types and formulas (Phase 2)
3. Translating UI components (Phases 3-4)

**Everything you need is documented.**

**Ready? Open `/MIGRATION_EXECUTION_PLAN.md` and start Phase 1! 🚀**
