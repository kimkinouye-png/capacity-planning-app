# Setup Separate Demo Environment Guide

## Overview

This guide explains how to set up a separate demo environment (`capacity-planner-2.netlify.app`) for development/testing while keeping the main site (`capacity-planner.netlify.app`) stable.

## Current Status

### Fixes Already Applied (in this codebase)

✅ **State Update Fix**: `RoadmapItemsContext.tsx` now uses API response as source of truth  
✅ **Field Name Fix**: API accepts both camelCase (`uxFocusWeeks`) and snake_case (`ux_focus_weeks`)  
✅ **Date Persistence**: Database schema includes `start_date` and `end_date` columns  
✅ **Activity Log Fix**: Removed timestamp from client-side calls (let API set it)

### Files Modified

1. `src/context/RoadmapItemsContext.tsx` - State update logic
2. `src/context/ActivityContext.tsx` - Activity log timestamp fix
3. `netlify/functions/types.ts` - Field name compatibility
4. `netlify/functions/update-roadmap-item.ts` - Validation and normalization
5. `database/schema.sql` - Added date columns
6. `database/migrations/add-date-columns.sql` - Migration script

## Strategy: Git Branch Deployment (Recommended)

### Step 1: Create Development Branch

```bash
# Create and switch to development branch
git checkout -b development

# Push development branch to remote
git push -u origin development
```

### Step 2: Configure Netlify Sites

#### Site 1: Main (Stable Demo)
- **Site Name**: `capacity-planner`
- **Branch**: `main`
- **URL**: `capacity-planner.netlify.app`
- **Purpose**: Stable demo version (no inline editing bugs)

#### Site 2: Development (With Fixes)
- **Site Name**: `capacity-planner-2`
- **Branch**: `development`
- **URL**: `capacity-planner-2.netlify.app`
- **Purpose**: Development version with inline editing fixes

### Step 3: Create New Netlify Site

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git repository
4. Configure:
   - **Site name**: `capacity-planner-2`
   - **Branch to deploy**: `development`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

### Step 4: Configure Environment Variables

For `capacity-planner-2` site:
1. Go to Site settings → Environment variables
2. Add:
   - `NETLIFY_DATABASE_URL` (same as main site, or use separate database)
   - Any other required environment variables

### Step 5: Run Database Migration

**Important**: Run the date columns migration on your database:

```sql
ALTER TABLE roadmap_items 
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;
```

You can run this in:
- Neon Dashboard SQL Editor
- Or via migration script: `database/migrations/add-date-columns.sql`

## Strategy: Revert Main Site to Stable Version

If you need to revert the main site to a version before inline editing changes:

### Option A: Find Last Stable Commit

```bash
# View commit history
git log --oneline

# Find the commit hash before inline editing changes
# Example: abc1234 Last stable version

# Create a revert commit
git checkout main
git revert <commit-hash>
git push origin main
```

### Option B: Reset to Specific Commit

```bash
# WARNING: This rewrites history - only use if you're sure
git checkout main
git reset --hard <stable-commit-hash>
git push --force origin main
```

## Database Considerations

### Option 1: Shared Database (Same Data)
- Both sites use the same `NETLIFY_DATABASE_URL`
- Changes in `capacity-planner-2` will affect `capacity-planner`
- **Use this if**: You want to test with real data

### Option 2: Separate Databases (Isolated)
- Create a new Neon database for `capacity-planner-2`
- Use different `NETLIFY_DATABASE_URL` for each site
- **Use this if**: You want completely isolated testing

### Option 3: Read-Only Demo Site
- Add a flag in code to disable writes for demo site
- Demo site only reads data, never writes
- **Use this if**: You want demo to be completely safe

## Testing Checklist

### Main Site (capacity-planner.netlify.app)
- [ ] Site loads correctly
- [ ] No inline editing bugs visible
- [ ] Stable for demonstrations

### Development Site (capacity-planner-2.netlify.app)
- [ ] Edit UX focus weeks → navigate away → verify persistence ✅
- [ ] Edit Content focus weeks → navigate away → verify persistence ✅
- [ ] Edit Start date → navigate away → verify persistence ✅
- [ ] Edit End date → navigate away → verify persistence ✅
- [ ] Edit Name/Key → navigate away → verify persistence ✅
- [ ] Refresh page → verify all changes persist ✅

## Troubleshooting

### Issue: Changes Not Persisting
1. Check browser console for API errors
2. Verify database migration was run
3. Check Netlify function logs
4. Verify field names match (camelCase vs snake_case)

### Issue: Site Not Deploying
1. Check Netlify build logs
2. Verify branch name matches Netlify configuration
3. Check environment variables are set

### Issue: Database Connection Errors
1. Verify `NETLIFY_DATABASE_URL` is set correctly
2. Check database is accessible from Netlify
3. Verify database schema matches code

## Next Steps

1. **Create development branch** (if not already done)
2. **Create new Netlify site** for `capacity-planner-2`
3. **Run database migration** for date columns
4. **Test inline editing** on development site
5. **Keep main site stable** until development is verified

## Rollback Plan

If issues arise on development site:
1. Fix issues in `development` branch
2. Test thoroughly
3. Once stable, merge `development` → `main`
4. Main site will auto-deploy with fixes

If main site needs to be reverted:
1. Use `git revert` to undo specific commits
2. Or reset to last known good commit
3. Push to `main` branch
4. Netlify will auto-deploy the reverted version
