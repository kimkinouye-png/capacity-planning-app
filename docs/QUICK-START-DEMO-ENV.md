# Quick Start: Separate Demo Environment

## TL;DR - Get capacity-planner-2.netlify.app Running

### Step 1: Create Development Branch

```bash
# Create and switch to development branch
git checkout -b development

# Push to remote
git push -u origin development
```

### Step 2: Create Netlify Site

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your Git repository
4. Configure:
   - **Site name**: `capacity-planner-2`
   - **Branch to deploy**: `development`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

### Step 3: Add Environment Variables

In Netlify dashboard → Site settings → Environment variables:
- `NETLIFY_DATABASE_URL` (same as main site, or use separate database)

### Step 4: Run Database Migration

In Neon Dashboard SQL Editor, run:

```sql
ALTER TABLE roadmap_items 
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;
```

### Step 5: Deploy

Netlify will auto-deploy when you push to `development` branch.

## Result

- **Main site** (`capacity-planner.netlify.app`): Stable, deployed from `main` branch
- **Dev site** (`capacity-planner-2.netlify.app`): Development, deployed from `development` branch

## Testing

On `capacity-planner-2.netlify.app`:
1. Edit UX focus weeks → navigate away → verify it persists ✅
2. Edit Content focus weeks → navigate away → verify it persists ✅
3. Edit Start/End dates → navigate away → verify they persist ✅

## Full Documentation

See `docs/setup-separate-demo-environment.md` for detailed instructions.
