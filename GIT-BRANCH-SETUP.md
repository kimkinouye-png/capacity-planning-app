# Git Branch Setup for Separate Demo Environment

## Quick Setup Commands

Run these commands in your terminal (one at a time):

### Step 1: Find the Last Stable Commit

```bash
# Show recent commits
git log --oneline -30

# Or search for inline editing commits
git log --oneline --grep="inline" -20

# Or search for Editable components
git log --oneline --all -- "**/EditableNumberCell*" "**/EditableDateCell*"
```

**Look for the commit BEFORE inline editing was added.** Based on CHANGELOG, inline editing was added in "Recent Updates (January 2026)".

### Step 2: Create Backup Branch (Safety First!)

```bash
# Create backup of current main branch
git checkout main
git branch backup-main-$(date +%Y%m%d)
git push origin backup-main-$(date +%Y%m%d)
```

### Step 3: Option A - Revert Main to Stable

```bash
# Switch to main
git checkout main

# Replace <commit-hash> with the stable commit hash from Step 1
git reset --hard <commit-hash-before-inline-editing>

# Force push (WARNING: This rewrites history)
git push origin main --force
```

### Step 4: Create Development Branch

```bash
# If you reverted main, you need to get back to current work
# First, find the commit hash of your current work
git reflog

# Create development branch from current work (before revert)
# Replace <current-commit-hash> with the hash from reflog
git checkout -b development <current-commit-hash>

# Or if you want to keep main as-is and just create dev branch:
git checkout main
git checkout -b development

# Push development branch
git push -u origin development
```

### Step 5: Configure Netlify

1. **Main Site (capacity-planner)**:
   - Go to https://app.netlify.com
   - Select `capacity-planner` site
   - Site settings → Build & deploy → Continuous Deployment
   - Set **Production branch** to: `main`

2. **New Site (capacity-planner-2)**:
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository
   - Configure:
     - **Site name**: `capacity-planner-2`
     - **Branch to deploy**: `development`
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
     - **Functions directory**: `netlify/functions`
   - Add environment variables (NETLIFY_DATABASE_URL, etc.)

### Step 6: Run Database Migration

In Neon Dashboard SQL Editor:

```sql
ALTER TABLE roadmap_items 
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;
```

## Alternative: Keep Main As-Is (Simpler)

If you don't want to revert main, just create development branch:

```bash
# Create development branch from current main
git checkout main
git checkout -b development
git push -u origin development
```

Then:
- **capacity-planner** → Deploy from `main` (current state)
- **capacity-planner-2** → Deploy from `development` (same as main, but separate)

## Verification

After setup, verify:

1. **Main site** (`capacity-planner.netlify.app`):
   - Should be stable version
   - No inline editing bugs

2. **Dev site** (`capacity-planner-2.netlify.app`):
   - Has inline editing with fixes
   - Test persistence:
     - Edit UX focus weeks → navigate → verify persists ✅
     - Edit Content focus weeks → navigate → verify persists ✅
     - Edit Start/End dates → navigate → verify persists ✅

## Troubleshooting

### If you need to undo the revert:

```bash
# Find the commit you reset from
git reflog

# Reset back
git reset --hard <commit-hash-from-reflog>
git push origin main --force
```

### If development branch doesn't have your fixes:

```bash
# Make sure you're on development branch
git checkout development

# If fixes are on main, merge them
git merge main

# Or cherry-pick specific commits
git cherry-pick <commit-hash-with-fixes>
```
