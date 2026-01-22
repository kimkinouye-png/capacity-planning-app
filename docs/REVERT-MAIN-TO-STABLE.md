# Revert Main Branch to Stable Version

## Step-by-Step Guide

### Step 1: Find the Last Stable Commit

Run this command to see recent commits:

```bash
git log --oneline -30
```

Look for commits related to inline editing. Common commit messages might include:
- "Add inline editing"
- "EditableNumberCell"
- "EditableDateCell"
- "Fix inline editing"
- "inline editing persistence"

**Find the commit hash BEFORE inline editing was introduced.**

### Step 2: Choose Your Strategy

#### Option A: Revert Main to Stable (Recommended for Demo Site)

This makes `main` branch stable for demonstrations:

```bash
# Switch to main branch
git checkout main

# Reset to the stable commit (replace with actual commit hash)
git reset --hard <commit-hash-before-inline-editing>

# Force push to update remote
git push origin main --force
```

**⚠️ Warning**: Force push rewrites history. Only do this if you're sure!

#### Option B: Keep Main As-Is, Create Development Branch

This keeps current work on main and creates a separate branch:

```bash
# Create development branch from current state
git checkout -b development

# Push to remote
git push -u origin development
```

Then revert main separately if needed.

### Step 3: Create Development Branch (If Using Option A)

After reverting main, create development branch from current work:

```bash
# First, save current work to a branch
git checkout -b development

# Push development branch
git push -u origin development
```

### Step 4: Configure Netlify Sites

#### Site 1: capacity-planner (Stable Demo)

1. Go to https://app.netlify.com
2. Select `capacity-planner` site
3. Go to **Site settings** → **Build & deploy** → **Continuous Deployment**
4. Set **Production branch** to: `main`
5. Save

#### Site 2: capacity-planner-2 (Development)

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your Git repository
4. Configure:
   - **Site name**: `capacity-planner-2`
   - **Branch to deploy**: `development`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
5. Add environment variables (same as main site)

### Step 5: Run Database Migration

**Important**: Run this migration on your database:

```sql
ALTER TABLE roadmap_items 
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;
```

Run in Neon Dashboard SQL Editor.

## Example Workflow

```bash
# 1. Find stable commit
git log --oneline -30
# Example output shows: abc1234 Last stable version

# 2. Revert main to stable
git checkout main
git reset --hard abc1234
git push origin main --force

# 3. Create development branch with current work
git checkout -b development
git push -u origin development

# 4. Configure Netlify (via dashboard)
# - capacity-planner → main branch
# - capacity-planner-2 → development branch
```

## Verification

After setup:

1. **Main site** (`capacity-planner.netlify.app`):
   - Should be stable, no inline editing bugs
   - Safe for demonstrations

2. **Dev site** (`capacity-planner-2.netlify.app`):
   - Has inline editing fixes
   - Test persistence:
     - Edit UX focus weeks → navigate away → verify persists ✅
     - Edit Content focus weeks → navigate away → verify persists ✅
     - Edit Start/End dates → navigate away → verify persists ✅

## Rollback Plan

If you need to revert the revert:

```bash
# Find the commit you reset from
git reflog

# Reset back to that commit
git reset --hard <commit-hash-from-reflog>
git push origin main --force
```

## Safety Tips

1. **Backup first**: Create a backup branch before force pushing
   ```bash
   git branch backup-main-$(date +%Y%m%d)
   ```

2. **Test locally**: Test the stable version locally before pushing
   ```bash
   git checkout main
   git reset --hard <stable-commit>
   npm run build
   npm run preview
   ```

3. **Communicate**: If working with a team, communicate the branch strategy
