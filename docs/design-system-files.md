# Design System Files Inventory

This document identifies all files that contain design system changes (colors, styling, theme) that should be updated on the demo site.

## Core Design System Files (Critical)

These files define the core design system and must be updated:

### 1. `src/theme.ts` ⭐ **CRITICAL**
- **Purpose**: Core Chakra UI theme configuration
- **Contains**: 
  - Dark mode configuration
  - Color palette (`#0a0a0f`, `#141419`, `#1a1a20`, `#00d9ff`)
  - Custom button variants (cyan gradient, outline, ghost)
  - Global body styles
- **Design System Impact**: **100%** - This is the foundation
- **Functional Changes**: None (pure theme)

### 2. `src/components/AppHeader.tsx` ⭐ **CRITICAL**
- **Purpose**: Global navigation header
- **Contains**:
  - Header background (`#141419`)
  - Navigation styling with cyan accent (`#00d9ff`)
  - Button variants using theme
- **Design System Impact**: **100%** - Visible on every page
- **Functional Changes**: None (pure styling)

### 3. `src/App.tsx`
- **Purpose**: Root app component
- **Contains**:
  - Global background (`bg="#0a0a0f"`)
  - Modal/dialog styling (`bg="#141419"`)
- **Design System Impact**: **90%** - Global layout
- **Functional Changes**: Minimal (debug feature for clearing data)

## Component Files with Design System Styling

These components have design system colors but may also have functional changes:

### 4. `src/components/CreateScenarioModal.tsx`
- **Design System Colors**: `#141419`, `#00d9ff`, `rgba(255, 255, 255, 0.1)`
- **Design System Impact**: **80%**
- **Functional Changes**: Modal functionality (can be separated)

### 5. `src/components/PMIntakeForm.tsx`
- **Design System Colors**: `#1a1a20`, `#00d9ff` (focus states)
- **Design System Impact**: **70%**
- **Functional Changes**: Form logic (styling can be extracted)

### 6. `src/components/PDInputsForm.tsx`
- **Design System Colors**: Uses theme colors
- **Design System Impact**: **60%**
- **Functional Changes**: Form logic and calculations

### 7. `src/components/CDInputsForm.tsx`
- **Design System Colors**: Uses theme colors
- **Design System Impact**: **60%**
- **Functional Changes**: Form logic and calculations

### 8. `src/components/ErrorBoundary.tsx`
- **Design System Colors**: `#141419`, `#00d9ff`
- **Design System Impact**: **70%**
- **Functional Changes**: Error handling logic

### 9. `src/components/InlineEditableText.tsx`
- **Design System Colors**: `#00d9ff` (hover states)
- **Design System Impact**: **50%**
- **Functional Changes**: Inline editing functionality

### 10. `src/features/scenarios/pasteTableImport/PasteTableImportModal.tsx`
- **Design System Colors**: `#141419`, `rgba(255, 255, 255, 0.1)`
- **Design System Impact**: **70%**
- **Functional Changes**: Paste import logic (can be separated)

## Page Files with Design System Styling

These pages have extensive design system styling. **Note**: Many of these files also contain functional changes (inline editing, paste import, etc.), so updating them requires careful cherry-picking.

### 11. `src/pages/HomePage.tsx`
- **Design System Colors**: `#0a0a0f`, `#141419`, `#00d9ff`
- **Design System Impact**: **80%**
- **Functional Changes**: Home page logic (can be separated)

### 12. `src/pages/SessionsListPage.tsx`
- **Design System Colors**: `#0a0a0f`, `#141419`, `#00d9ff`, `rgba(255, 255, 255, 0.1)`
- **Design System Impact**: **85%**
- **Functional Changes**: Session management, modals (styling can be extracted)

### 13. `src/pages/SessionSummaryPage.tsx` ⚠️ **COMPLEX**
- **Design System Colors**: `#0a0a0f`, `#141419`, `#1a1a20`, `#00d9ff`
- **Design System Impact**: **90%**
- **Functional Changes**: **EXTENSIVE** - Contains inline editing, paste import, table functionality
- **Recommendation**: Extract styling to separate concerns or cherry-pick carefully

### 14. `src/pages/ItemDetailPage.tsx`
- **Design System Colors**: `#0a0a0f`, `#141419`, `#00d9ff`
- **Design System Impact**: **85%**
- **Functional Changes**: Item detail logic (styling can be extracted)

### 15. `src/pages/CommittedPlanPage.tsx`
- **Design System Colors**: `#0a0a0f`, `#141419`, `#00d9ff`
- **Design System Impact**: **80%**
- **Functional Changes**: Committed plan calculations (styling can be extracted)

### 16. `src/pages/GuidePage.tsx`
- **Design System Colors**: `#0a0a0f`, `#141419`, `#00d9ff`
- **Design System Impact**: **85%**
- **Functional Changes**: Minimal (mostly content)

### 17. `src/pages/SettingsPage.tsx`
- **Design System Colors**: `#0a0a0f`, `#141419`, `#00d9ff`
- **Design System Impact**: **80%**
- **Functional Changes**: Settings form logic (styling can be extracted)

### 18. `src/pages/QuarterlyCapacityPage.tsx`
- **Design System Colors**: `#141419`
- **Design System Impact**: **70%**
- **Functional Changes**: Quarterly capacity logic (styling can be extracted)

## Inline Editing Components (New - May Not Be on Main)

These are new components added in development branch. They use design system colors but are functional features:

- `src/components/EditableNumberCell.tsx` - Uses `#00d9ff` for focus
- `src/components/EditableTextCell.tsx` - Uses `#00d9ff` for focus
- `src/components/EditableDateCell.tsx` - Uses `#00d9ff` for focus

**Note**: These are functional features, not just design system updates. Only include if you want inline editing on demo site.

## Summary by Priority

### Tier 1: Must Update (Core Design System)
1. `src/theme.ts` - **100% design system**
2. `src/components/AppHeader.tsx` - **100% design system**
3. `src/App.tsx` - **90% design system** (minimal functional changes)

### Tier 2: High Impact (Mostly Styling)
4. `src/pages/HomePage.tsx` - **80% design system**
5. `src/pages/GuidePage.tsx` - **85% design system**
6. `src/pages/SessionsListPage.tsx` - **85% design system**
7. `src/pages/ItemDetailPage.tsx` - **85% design system**
8. `src/pages/CommittedPlanPage.tsx` - **80% design system**
9. `src/pages/SettingsPage.tsx` - **80% design system**

### Tier 3: Medium Impact (Mixed Styling/Functionality)
10. `src/components/CreateScenarioModal.tsx` - **80% design system**
11. `src/components/ErrorBoundary.tsx` - **70% design system**
12. `src/components/PMIntakeForm.tsx` - **70% design system**
13. `src/features/scenarios/pasteTableImport/PasteTableImportModal.tsx` - **70% design system**
14. `src/pages/QuarterlyCapacityPage.tsx` - **70% design system**

### Tier 4: Complex (Extensive Functional Changes)
15. `src/pages/SessionSummaryPage.tsx` - **90% design system** but **EXTENSIVE functional changes**
16. `src/components/PDInputsForm.tsx` - **60% design system**
17. `src/components/CDInputsForm.tsx` - **60% design system**

## Recommended Approach

### Option A: Quick Win (Tier 1 Only)
Update only the core files:
- `src/theme.ts`
- `src/components/AppHeader.tsx`
- `src/App.tsx`

**Result**: Core design system updated, but pages may still have old styling.

### Option B: Complete Update (Tier 1 + Tier 2)
Update core files + all page files:
- All Tier 1 files
- All Tier 2 files (pages)

**Result**: Full design system update across all pages.

### Option C: Full Merge
Merge entire `development` branch to `main`:
- Includes all design system updates
- Includes all functional features (inline editing, etc.)

**Result**: Demo site matches development site exactly.

## Design System Color Palette

Current design system uses these colors consistently:

- **Background**: `#0a0a0f` (very dark blue-black)
- **Card/Panel**: `#141419` (slightly lighter dark)
- **Input/Panel**: `#1a1a20` (medium dark)
- **Accent**: `#00d9ff` (electric cyan)
- **Borders**: `rgba(255, 255, 255, 0.1)` (subtle white)
- **Text**: `white`, `gray.300`, `gray.400` (Chakra defaults)

## Next Steps

1. **Review this list** to confirm which files need updating
2. **Choose an approach** (Option A, B, or C)
3. **Create a cherry-pick script** or merge strategy
4. **Test on demo site** after deployment
