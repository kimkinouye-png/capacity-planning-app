# Update Demo Site Design System

This guide explains how to update the design system on the demo site (`capacity-planner.netlify.app`) without including functional features from the development branch.

## Quick Start

Run the automated script:

```bash
./scripts/update-demo-design-system.sh
```

The script will:
1. Create a backup branch of main
2. Switch to main branch
3. Let you choose which tier of files to update
4. Copy design system files from development branch
5. Stage and commit the changes

## Manual Process

If you prefer to do it manually:

### Step 1: Create Backup

```bash
git checkout main
git branch main-backup-$(date +%Y%m%d)
```

### Step 2: Choose Files to Update

**Tier 1 (Core - Recommended for Quick Update):**
```bash
git checkout development -- src/theme.ts
git checkout development -- src/components/AppHeader.tsx
git checkout development -- src/App.tsx
```

**Tier 1 + Tier 2 (Complete Design System):**
```bash
# Core files
git checkout development -- src/theme.ts
git checkout development -- src/components/AppHeader.tsx
git checkout development -- src/App.tsx

# Page files
git checkout development -- src/pages/HomePage.tsx
git checkout development -- src/pages/GuidePage.tsx
git checkout development -- src/pages/SessionsListPage.tsx
git checkout development -- src/pages/ItemDetailPage.tsx
git checkout development -- src/pages/CommittedPlanPage.tsx
git checkout development -- src/pages/SettingsPage.tsx
```

**Tier 1 + Tier 2 + Tier 3 (Full Update):**
```bash
# Add component files
git checkout development -- src/components/CreateScenarioModal.tsx
git checkout development -- src/components/ErrorBoundary.tsx
git checkout development -- src/components/PMIntakeForm.tsx
git checkout development -- src/features/scenarios/pasteTableImport/PasteTableImportModal.tsx
git checkout development -- src/pages/QuarterlyCapacityPage.tsx
```

### Step 3: Review Changes

```bash
git status
git diff --cached
```

### Step 4: Commit

```bash
git add .
git commit -m "Design system update: Update theme and styling from development branch"
```

### Step 5: Push and Deploy

```bash
git push origin main
```

Netlify will automatically deploy to `capacity-planner.netlify.app`.

## Tier Selection Guide

### Tier 1: Core (3 files)
- **Best for**: Quick visual update
- **Impact**: Updates theme and header visible on every page
- **Time**: ~2 minutes
- **Risk**: Low

### Tier 1 + Tier 2: Complete (9 files)
- **Best for**: Full design system consistency
- **Impact**: All pages match the new design system
- **Time**: ~5 minutes
- **Risk**: Low (pages may have some functional changes, but styling is separate)

### Tier 1 + Tier 2 + Tier 3: Full (14 files)
- **Best for**: Maximum design system coverage
- **Impact**: Components and modals also updated
- **Time**: ~10 minutes
- **Risk**: Medium (some components have mixed functionality)

## Important Notes

### ⚠️ SessionSummaryPage.tsx

The `SessionSummaryPage.tsx` file is **NOT included** in the default tiers because it contains extensive functional changes (inline editing, paste import). 

If you want to update its styling:
1. Manually review the file differences
2. Cherry-pick only the styling-related changes
3. Or accept that it will include functional features

### ⚠️ Inline Editing Components

These components are **NOT included** because they are functional features:
- `EditableNumberCell.tsx`
- `EditableTextCell.tsx`
- `EditableDateCell.tsx`

Only include these if you want inline editing on the demo site.

## Rollback

If something goes wrong:

```bash
# Restore from backup branch
git checkout main
git reset --hard main-backup-YYYYMMDD

# Or restore from remote
git fetch origin
git reset --hard origin/main
```

## Testing After Update

1. **Visual Check**: Visit `capacity-planner.netlify.app` and verify:
   - Dark theme is applied (`#0a0a0f` background)
   - Header has new styling (`#141419` background, cyan accents)
   - Cards use new colors (`#141419`)
   - Accent color is electric cyan (`#00d9ff`)

2. **Functionality Check**: Verify existing features still work:
   - Creating scenarios
   - Viewing scenarios
   - Navigation
   - Settings page

3. **Browser Console**: Check for any errors or warnings

## Design System Color Reference

After update, the site should use:

- **Background**: `#0a0a0f` (very dark blue-black)
- **Cards/Panels**: `#141419` (slightly lighter dark)
- **Inputs**: `#1a1a20` (medium dark)
- **Accent**: `#00d9ff` (electric cyan)
- **Borders**: `rgba(255, 255, 255, 0.1)` (subtle white)

## Troubleshooting

### File conflicts
If you get merge conflicts:
```bash
# Abort and try again
git merge --abort
git reset --hard HEAD

# Or manually resolve conflicts
git status
# Edit conflicted files
git add .
git commit
```

### Files not found
If a file doesn't exist in development branch:
- Check if it was renamed or moved
- Verify the file path is correct
- The script will skip missing files and continue

### Styling not applied
If styling doesn't appear after deployment:
1. Clear browser cache (hard refresh: Cmd+Shift+R)
2. Check Netlify build logs
3. Verify files were committed correctly
4. Check browser console for errors

## Next Steps

After updating the design system:

1. ✅ Test the demo site
2. ✅ Verify all pages load correctly
3. ✅ Check that existing functionality still works
4. ✅ Document any issues
5. ✅ Consider updating other design system elements (icons, spacing, etc.)

## Related Documentation

- `docs/design-system-files.md` - Complete file inventory
- `GIT-BRANCH-SETUP.md` - Branch management guide
