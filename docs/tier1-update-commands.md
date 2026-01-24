# Tier 1 Design System Update - Step-by-Step Commands

Run these commands in your terminal to update Tier 1 (Core Design System) files.

## Step 1: Check Current Status

```bash
cd "/Users/kki/Planning Agent/capacity-planning-app"
git branch --show-current
git status
```

## Step 2: Stash Any Uncommitted Changes (if any)

```bash
git stash push -m "Stash before Tier 1 design system update"
```

## Step 3: Switch to Main Branch

```bash
git checkout main
```

## Step 4: Create Backup Branch

```bash
git branch main-backup-$(date +%Y%m%d-%H%M%S)
```

This creates a branch like `main-backup-20241220-143022` for easy rollback.

## Step 5: Copy Tier 1 Files from Development Branch

```bash
git checkout development -- src/theme.ts src/components/AppHeader.tsx src/App.tsx
```

## Step 6: Review Changes

```bash
git status
git diff --stat
```

To see detailed changes:
```bash
git diff src/theme.ts
git diff src/components/AppHeader.tsx
git diff src/App.tsx
```

## Step 7: Stage and Commit

```bash
git add src/theme.ts src/components/AppHeader.tsx src/App.tsx
git commit -m "Design system update: Tier 1 (Core)

Updated core design system files from development branch:
- src/theme.ts: Dark theme with electric cyan accent (#00d9ff)
- src/components/AppHeader.tsx: Updated header styling
- src/App.tsx: Global background and modal styling

Risk: Low - Pure styling/theme changes, no functional impact"
```

## Step 8: Push to Main (Deploys to Demo Site)

```bash
git push origin main
```

## Step 9: Verify Deployment

1. Wait for Netlify to deploy (check Netlify dashboard)
2. Visit https://capacity-planner.netlify.app
3. Verify:
   - Dark theme is applied (`#0a0a0f` background)
   - Header has new styling (`#141419` background, cyan accents)
   - Navigation buttons use new theme
   - No console errors

## Rollback (if needed)

If something goes wrong:

```bash
# Find your backup branch
git branch | grep main-backup

# Restore from backup (replace YYYYMMDD-HHMMSS with your backup branch name)
git reset --hard main-backup-YYYYMMDD-HHMMSS
git push origin main --force
```

## Restore Stashed Changes (if you stashed)

```bash
git stash pop
```
