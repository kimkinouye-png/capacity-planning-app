# Design System Update Risk Assessment

This document provides a detailed risk assessment for each tier of design system updates.

## Risk Level Definitions

- **🟢 LOW RISK**: Very unlikely to break functionality, easy rollback, minimal testing needed
- **🟡 MEDIUM RISK**: Some chance of issues, moderate rollback complexity, requires testing
- **🟠 HIGH RISK**: Higher chance of breaking changes, complex rollback, extensive testing required
- **🔴 VERY HIGH RISK**: Significant risk of breaking functionality, difficult rollback, requires careful review

---

## Tier 1: Core Design System Files

### Risk Level: 🟢 **LOW RISK**

**Files (3):**
- `src/theme.ts`
- `src/components/AppHeader.tsx`
- `src/App.tsx`

### Risk Factors

#### ✅ Low Risk Indicators:
- **Pure styling/theme files** - No business logic
- **Isolated changes** - Theme changes don't affect functionality
- **Easy rollback** - Can revert 3 files quickly
- **Visual-only impact** - Worst case: styling looks wrong, app still works
- **No dependencies** - Other files depend on theme, but theme doesn't depend on them

#### ⚠️ Potential Issues:
- **Theme breaking changes**: If theme structure changed significantly, components might not render correctly
- **App.tsx debug feature**: Contains a debug dialog (Shift+Cmd+K) - minimal functional change
- **Browser cache**: Users might need to hard refresh to see changes

### Impact Assessment

| Aspect | Risk Level | Notes |
|--------|-----------|-------|
| **Functionality** | 🟢 Very Low | Theme changes don't affect app logic |
| **Visual Consistency** | 🟢 Low | All pages will have new theme |
| **Rollback Difficulty** | 🟢 Very Easy | 3 files, ~30 seconds to revert |
| **Testing Required** | 🟢 Minimal | Visual check of theme application |
| **User Impact** | 🟢 Low | Users see new design, functionality unchanged |

### Recommended Testing
- ✅ Visual check: Dark theme applied (`#0a0a0f` background)
- ✅ Header styling: Cyan accents visible
- ✅ Navigation: Buttons use new theme variants
- ✅ No console errors

### Rollback Plan
```bash
git checkout main-backup-YYYYMMDD -- src/theme.ts src/components/AppHeader.tsx src/App.tsx
git commit -m "Revert design system update"
```

**Time to rollback**: < 1 minute

---

## Tier 2: Core + Page Files

### Risk Level: 🟡 **MEDIUM RISK**

**Files (9 total):**
- All Tier 1 files (3)
- `src/pages/HomePage.tsx`
- `src/pages/GuidePage.tsx`
- `src/pages/SessionsListPage.tsx`
- `src/pages/ItemDetailPage.tsx`
- `src/pages/CommittedPlanPage.tsx`
- `src/pages/SettingsPage.tsx`

### Risk Factors

#### ✅ Medium Risk Indicators:
- **Mostly styling** - Pages are 80-85% design system, 15-20% functionality
- **Separated concerns** - Styling (colors, spacing) is separate from logic
- **Page-level isolation** - Issues on one page don't affect others
- **Moderate rollback** - 9 files, but straightforward

#### ⚠️ Potential Issues:
- **Functional changes mixed in**: Pages may have received functional updates alongside styling
- **Component dependencies**: Pages use components that might have changed
- **State management**: Some pages have complex state logic that could be affected
- **Form logic**: SettingsPage and ItemDetailPage have form handling

### File-by-File Risk Breakdown

| File | Functional Changes | Risk Level | Notes |
|------|-------------------|------------|-------|
| `HomePage.tsx` | Minimal (home page logic) | 🟢 Low | Mostly display logic |
| `GuidePage.tsx` | Minimal (mostly content) | 🟢 Low | Static content page |
| `SessionsListPage.tsx` | Moderate (session management) | 🟡 Medium | Has modals, calculations |
| `ItemDetailPage.tsx` | Moderate (item detail logic) | 🟡 Medium | Form handling, state management |
| `CommittedPlanPage.tsx` | Moderate (calculations) | 🟡 Medium | Capacity calculations |
| `SettingsPage.tsx` | Moderate (form logic) | 🟡 Medium | Settings form handling |

### Impact Assessment

| Aspect | Risk Level | Notes |
|--------|-----------|-------|
| **Functionality** | 🟡 Medium | Some pages have business logic that might be affected |
| **Visual Consistency** | 🟢 Low | All pages will have consistent design |
| **Rollback Difficulty** | 🟡 Moderate | 9 files, need to verify no conflicts |
| **Testing Required** | 🟡 Moderate | Test each page's functionality |
| **User Impact** | 🟡 Medium | Users see new design, need to verify features work |

### Recommended Testing
- ✅ Visual check: All pages use new design system
- ✅ **HomePage**: Create/view scenarios still works
- ✅ **SessionsListPage**: Create/edit/delete scenarios works
- ✅ **ItemDetailPage**: View/edit item details works
- ✅ **CommittedPlanPage**: Calculations display correctly
- ✅ **SettingsPage**: Settings can be saved/loaded
- ✅ **GuidePage**: Content displays correctly
- ✅ No console errors on any page

### Rollback Plan
```bash
git checkout main-backup-YYYYMMDD -- src/theme.ts src/components/AppHeader.tsx src/App.tsx src/pages/*.tsx
git commit -m "Revert design system update"
```

**Time to rollback**: 2-3 minutes

---

## Tier 3: Core + Pages + Components

### Risk Level: 🟠 **HIGH RISK**

**Files (14 total):**
- All Tier 1 files (3)
- All Tier 2 files (6 pages)
- `src/components/CreateScenarioModal.tsx`
- `src/components/ErrorBoundary.tsx`
- `src/components/PMIntakeForm.tsx`
- `src/features/scenarios/pasteTableImport/PasteTableImportModal.tsx`
- `src/pages/QuarterlyCapacityPage.tsx`

### Risk Factors

#### ⚠️ High Risk Indicators:
- **Component-level changes** - Components have more business logic than pages
- **Form components** - PMIntakeForm has complex form handling
- **Modal components** - CreateScenarioModal and PasteTableImportModal have user interactions
- **Feature components** - PasteTableImportModal is a complete feature
- **Error handling** - ErrorBoundary affects error display logic

#### 🔴 Potential Issues:
- **Functional changes in components**: Components may have received feature updates
- **Form validation**: PMIntakeForm might have validation logic changes
- **Modal interactions**: Modals might have new functionality
- **Paste import feature**: PasteTableImportModal might have new parsing logic
- **Error handling changes**: ErrorBoundary might have new error handling

### File-by-File Risk Breakdown

| File | Functional Changes | Risk Level | Notes |
|------|-------------------|------------|-------|
| `CreateScenarioModal.tsx` | Moderate (modal logic) | 🟡 Medium | Modal interactions |
| `ErrorBoundary.tsx` | Low (error display) | 🟢 Low | Mostly styling |
| `PMIntakeForm.tsx` | High (form logic) | 🟠 High | Complex form handling |
| `PasteTableImportModal.tsx` | High (import feature) | 🟠 High | Complete feature with parsing |
| `QuarterlyCapacityPage.tsx` | Moderate (calculations) | 🟡 Medium | Capacity calculations |

### Impact Assessment

| Aspect | Risk Level | Notes |
|--------|-----------|-------|
| **Functionality** | 🟠 High | Components have significant business logic |
| **Visual Consistency** | 🟢 Low | All components use new design |
| **Rollback Difficulty** | 🟠 High | 14 files, potential merge conflicts |
| **Testing Required** | 🟠 Extensive | Test all component interactions |
| **User Impact** | 🟠 High | Features might break if components have functional changes |

### Recommended Testing
- ✅ All Tier 2 tests
- ✅ **CreateScenarioModal**: Create scenario flow works
- ✅ **PMIntakeForm**: Form inputs, validation, submission work
- ✅ **PasteTableImportModal**: Paste import feature works (if on main)
- ✅ **ErrorBoundary**: Error display works correctly
- ✅ **QuarterlyCapacityPage**: Calculations display correctly
- ✅ No console errors
- ✅ **Integration testing**: Test full user flows

### Rollback Plan
```bash
git checkout main-backup-YYYYMMDD -- src/theme.ts src/components/AppHeader.tsx src/App.tsx src/pages/*.tsx src/components/*.tsx src/features/**/*.tsx
git commit -m "Revert design system update"
```

**Time to rollback**: 5-10 minutes (may require conflict resolution)

---

## Excluded Files (Not in Any Tier)

### `src/pages/SessionSummaryPage.tsx`

**Risk Level: 🔴 VERY HIGH RISK**

**Why excluded:**
- Contains **extensive functional changes**:
  - Inline editing (EditableNumberCell, EditableTextCell, EditableDateCell)
  - Paste import functionality
  - Complex state management
  - Table interactions
- **90% design system** but **EXTENSIVE functional changes**
- Would introduce new features to demo site

**Recommendation**: 
- ❌ **Do NOT include** in design system update
- ✅ Update styling manually if needed
- ✅ Or accept that demo site won't have inline editing

---

## Summary Risk Matrix

| Tier | Files | Risk Level | Rollback Time | Testing Time | Recommended For |
|------|-------|------------|---------------|--------------|------------------|
| **Tier 1** | 3 | 🟢 Low | < 1 min | 5 min | Quick visual update |
| **Tier 2** | 9 | 🟡 Medium | 2-3 min | 30 min | Complete design system |
| **Tier 3** | 14 | 🟠 High | 5-10 min | 1-2 hours | Full update with components |

---

## Risk Mitigation Strategies

### For All Tiers:
1. ✅ **Create backup branch** before starting
2. ✅ **Test locally** before pushing to main
3. ✅ **Deploy to preview** first (if available)
4. ✅ **Monitor Netlify build** for errors
5. ✅ **Test on demo site** after deployment
6. ✅ **Have rollback plan ready**

### For Tier 2:
- Review git diff for each page file to check for functional changes
- Test each page individually
- Check for TypeScript errors

### For Tier 3:
- **Carefully review** component files for functional changes
- **Test all user interactions** (forms, modals, buttons)
- **Check dependencies** - ensure components work with existing code
- **Consider staging** - test on a separate branch first

---

## Recommended Approach by Use Case

### Use Case 1: Quick Visual Update
**Choose**: Tier 1 only
- **Risk**: 🟢 Low
- **Time**: 5 minutes
- **Best for**: Quick demo site refresh

### Use Case 2: Complete Design System
**Choose**: Tier 2
- **Risk**: 🟡 Medium
- **Time**: 30 minutes testing
- **Best for**: Full design system consistency

### Use Case 3: Maximum Coverage
**Choose**: Tier 3
- **Risk**: 🟠 High
- **Time**: 1-2 hours testing
- **Best for**: When you want everything updated and can test thoroughly

---

## Decision Tree

```
Start
  │
  ├─ Need quick update? → Tier 1 (🟢 Low Risk)
  │
  ├─ Want full page consistency? → Tier 2 (🟡 Medium Risk)
  │
  └─ Need component updates too? → Tier 3 (🟠 High Risk)
       │
       └─ Can test thoroughly? → Proceed
       └─ Cannot test? → Consider Tier 2 instead
```

---

## Final Recommendation

**For demo site update**: Start with **Tier 2** (Core + Pages)

**Reasoning:**
- ✅ Good balance of visual impact and risk
- ✅ Updates all user-facing pages
- ✅ Medium risk is manageable with proper testing
- ✅ Excludes high-risk components
- ✅ Can always add Tier 3 later if needed

**If risk-averse**: Start with **Tier 1**, then add Tier 2 after confirming Tier 1 works.

**If you need components**: Use **Tier 3** but plan for extensive testing.
