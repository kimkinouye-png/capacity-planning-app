# Fix Build Error: Missing Page Imports

## Problem

The Netlify build failed with TypeScript errors:
```
error TS2307: Cannot find module './pages/HomePage'
error TS2307: Cannot find module './pages/CommittedPlanPage'
error TS2307: Cannot find module './pages/GuidePage'
error TS2307: Cannot find module './pages/SettingsPage'
```

## Root Cause

When we copied `App.tsx` from the `development` branch, it includes imports for pages that may not exist on the `main` branch, or the file structure is different.

## Solution

We need to restore the original `App.tsx` from main branch and only apply the styling changes (background color, modal styling), not the entire file.

## Fix Steps

### Option 1: Restore Original App.tsx and Apply Styling Manually

1. **Check what App.tsx looked like on main before our change:**
   ```bash
   git show main-backup-YYYYMMDD-HHMMSS:src/App.tsx
   ```

2. **Restore the original App.tsx:**
   ```bash
   git checkout main-backup-YYYYMMDD-HHMMSS -- src/App.tsx
   ```

3. **Manually update only the styling parts:**
   - Change `bg` prop to `bg="#0a0a0f"` in the main Box
   - Update modal styling: `bg="#141419"` and `borderColor="rgba(255, 255, 255, 0.1)"`
   - Keep all imports as they were

### Option 2: Check if Pages Exist and Fix Imports

1. **Check what pages exist on main branch:**
   ```bash
   git ls-tree -r main --name-only | grep "src/pages"
   ```

2. **If pages exist but imports are wrong, fix the import paths in App.tsx**

3. **If pages don't exist, we need to either:**
   - Remove those routes from App.tsx
   - Or copy the missing page files from development

### Option 3: Revert App.tsx Change Entirely

If the styling changes in App.tsx are minimal, we can revert it and keep only theme.ts and AppHeader.tsx:

```bash
git checkout main-backup-YYYYMMDD-HHMMSS -- src/App.tsx
git add src/App.tsx
git commit --amend -m "Design system update: Tier 1 (Core) - theme and header only

Updated core design system files from development branch:
- src/theme.ts: Dark theme with electric cyan accent
- src/components/AppHeader.tsx: Updated header styling

Note: App.tsx reverted to maintain compatibility with main branch page structure"
git push origin main --force
```

## Recommended Approach

**Option 3 is safest** - revert App.tsx and keep only theme.ts and AppHeader.tsx. The App.tsx styling changes are minimal (just background color and modal styling), and we can add those later if needed.

The core design system (theme and header) will still be updated, which is the most important part.
