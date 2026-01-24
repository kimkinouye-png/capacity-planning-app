# Quick Fix: Revert App.tsx to Fix Build Error

## Problem
`App.tsx` from development branch imports pages that don't exist on main branch:
- `HomePage` ❌
- `CommittedPlanPage` ❌  
- `GuidePage` ❌
- `SettingsPage` ❌

## Solution
Revert `App.tsx` to the original main branch version. The styling changes in App.tsx are minimal (just background color), so we can keep only `theme.ts` and `AppHeader.tsx` for Tier 1.

## Commands to Run

```bash
cd "/Users/kki/Planning Agent/capacity-planning-app"

# Make sure you're on main branch
git checkout main

# Find your backup branch name
git branch | grep main-backup

# Restore App.tsx from backup (replace YYYYMMDD-HHMMSS with your backup)
git checkout main-backup-YYYYMMDD-HHMMSS -- src/App.tsx

# Verify the file looks correct (should not have those imports)
head -20 src/App.tsx

# Stage and commit the fix
git add src/App.tsx
git commit -m "Fix: Revert App.tsx to maintain compatibility

App.tsx from development branch imports pages that don't exist on main.
Reverting to original main branch version to fix build error.

Tier 1 design system update now includes:
- src/theme.ts: Dark theme with electric cyan accent ✅
- src/components/AppHeader.tsx: Updated header styling ✅
- src/App.tsx: Reverted to original (styling can be added later if needed)"

# Push the fix
git push origin main
```

## Alternative: Check What App.tsx Should Look Like

If you want to see what the original App.tsx looked like:

```bash
# See the original App.tsx from before our changes
git show HEAD~1:src/App.tsx

# Or from the backup branch
git show main-backup-YYYYMMDD-HHMMSS:src/App.tsx
```

## After Fix

1. Netlify will automatically rebuild
2. Build should succeed (only theme.ts and AppHeader.tsx changed)
3. Demo site will have new theme and header styling
4. All existing functionality will work

## Why This Works

- `theme.ts` provides the dark theme colors ✅
- `AppHeader.tsx` provides the new header styling ✅
- `App.tsx` styling (background color) is minimal and can be added later
- The core design system update is still complete
