# Quick Guide: Separate Databases

**Time:** ~10 minutes  
**Difficulty:** Easy

---

## Step-by-Step Instructions

### 1. Create New Neon Database (2 minutes)

1. Go to [Neon Console](https://console.neon.tech)
2. **Option A (Recommended):** Create new database in existing project
   - Select your existing project
   - Click **"Create Branch"** or **"Add Database"**
   - Name: `capacity-planner-2`
   
   **OR**
   
   **Option B:** Create new project
   - Click **"Create Project"**
   - Name: `capacity-planner-2`
   - Same region as existing project

3. Copy the connection string (format: `postgresql://user:password@host/database`)

---

### 2. Run Migrations (3 minutes)

**Option A: Neon SQL Editor (Easiest)**

1. In Neon Console, select your new database
2. Click **"SQL Editor"**
3. Copy entire contents of `database/schema.sql`
4. Paste into SQL Editor and click **Run**
5. Copy contents of `database/migrations/add-date-columns.sql`
6. Paste and click **Run**

**Option B: Command Line**

```bash
# If you have psql installed
./scripts/setup-separate-database.sh "postgresql://user:password@host/database"
```

---

### 3. Update Netlify Environment Variables (2 minutes)

#### For capacity-planner-2 Site:

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select **`capacity-planner-2`** site
3. **Site settings** → **Environment variables**
4. Find or add `NETLIFY_DATABASE_URL`
5. Set value to your **new database connection string**
6. Click **Save**

#### For capacity-planner Site (Verify):

1. Select **`capacity-planner`** site
2. **Site settings** → **Environment variables**
3. Verify `NETLIFY_DATABASE_URL` is set (should be original database)
4. If missing, add it with original connection string

---

### 4. Redeploy Sites (2 minutes)

After changing environment variables:

1. **capacity-planner-2:** Go to **Deploys** → **Trigger deploy** → **Deploy site**
2. **capacity-planner:** Verify it's still working (should be unaffected)

---

### 5. Test Isolation (1 minute)

1. Visit `capacity-planner.netlify.app`
   - Create a test scenario: "Test - Site 1"
   - Add a roadmap item
   
2. Visit `capacity-planner-2.netlify.app`
   - Verify "Test - Site 1" does NOT appear
   - Create a test scenario: "Test - Site 2"
   - Add a roadmap item

3. Go back to `capacity-planner.netlify.app`
   - Verify "Test - Site 2" does NOT appear
   - Verify "Test - Site 1" still exists

✅ **If data is isolated, setup is complete!**

---

## Troubleshooting

### "Database connection failed"
- Double-check connection string is correct
- Verify environment variable name is exactly `NETLIFY_DATABASE_URL`
- Redeploy site after changing environment variable

### "Table does not exist"
- Run migrations on new database (Step 2)
- Verify you ran both `schema.sql` and `add-date-columns.sql`

### Data appears on both sites
- Verify environment variables are different
- Check Netlify site settings
- Redeploy both sites

---

## What You've Accomplished

✅ Two separate databases  
✅ Data isolation between sites  
✅ Independent testing environment  
✅ Safe demo site (won't be affected by testing)

---

## Next Steps

- Test all features on both sites
- Monitor both databases
- Keep schemas in sync when adding new migrations
