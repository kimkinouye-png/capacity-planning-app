# Separate Databases Setup Guide

**Purpose:** Set up separate Neon databases for `capacity-planner.netlify.app` and `capacity-planner-2.netlify.app` to prevent data conflicts.

**Date:** January 21, 2026

---

## Overview

Currently, both sites likely share the same database via `NETLIFY_DATABASE_URL`. We'll:
1. Create a new Neon database for one site
2. Update Netlify environment variables
3. Run migrations on the new database
4. Verify both sites work independently

---

## Step 1: Create New Neon Database

### Option A: Create New Database in Existing Neon Project

1. Go to [Neon Console](https://console.neon.tech)
2. Select your existing project
3. Click **"Create Branch"** or **"Add Database"**
4. Name it: `capacity-planner-2` (or similar)
5. Copy the connection string

### Option B: Create New Neon Project

1. Go to [Neon Console](https://console.neon.tech)
2. Click **"Create Project"**
3. Name: `capacity-planner-2`
4. Region: Same as your existing project (for consistency)
5. Copy the connection string

**Recommended:** Option A (new database in same project) - easier to manage

---

## Step 2: Get Connection Strings

You'll need connection strings for both databases:

### Current Database (capacity-planner)
1. Go to Netlify Dashboard → `capacity-planner` site
2. Site settings → Environment variables
3. Find `NETLIFY_DATABASE_URL`
4. Copy this value (keep it safe)

### New Database (capacity-planner-2)
1. Go to Neon Console
2. Select your new database/project
3. Go to **Connection Details** or **SQL Editor**
4. Copy the connection string (format: `postgresql://user:password@host/database`)

---

## Step 3: Update Netlify Environment Variables

### For capacity-planner-2 Site

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select **`capacity-planner-2`** site
3. Go to **Site settings** → **Environment variables**
4. Find `NETLIFY_DATABASE_URL`
5. Click **Edit** or **Add variable**
6. Set value to the **new database connection string**
7. Click **Save**

### For capacity-planner Site (Verify)

1. Go to **`capacity-planner`** site
2. Go to **Site settings** → **Environment variables**
3. Verify `NETLIFY_DATABASE_URL` points to the **original database**
4. If it's missing, add it with the original connection string

---

## Step 4: Run Database Migrations

The new database needs the same schema. Run these migrations:

### Migration 1: Base Schema

Run the full schema from `database/schema.sql`:

```sql
-- Create tables: scenarios, roadmap_items, settings, activity_log
-- (Copy contents from database/schema.sql)
```

### Migration 2: Date Columns

```sql
ALTER TABLE roadmap_items 
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;
```

### How to Run Migrations

**Option A: Neon SQL Editor (Easiest)**
1. Go to Neon Console
2. Select your new database
3. Click **SQL Editor**
4. Paste and run the SQL commands
5. Verify tables were created

**Option B: psql Command Line**
```bash
psql "postgresql://user:password@host/database" -f database/schema.sql
psql "postgresql://user:password@host/database" -f database/migrations/add-date-columns.sql
```

---

## Step 5: Verify Setup

### Test capacity-planner (Original Database)
1. Visit `capacity-planner.netlify.app`
2. Create a test scenario
3. Add a roadmap item
4. Verify data persists

### Test capacity-planner-2 (New Database)
1. Visit `capacity-planner-2.netlify.app`
2. Create a test scenario (different name)
3. Add a roadmap item
4. Verify data persists
5. **Important:** Verify data from capacity-planner does NOT appear here

### Verify Isolation
- Data created on `capacity-planner` should NOT appear on `capacity-planner-2`
- Data created on `capacity-planner-2` should NOT appear on `capacity-planner`
- Both sites should work independently

---

## Step 6: Document Configuration

Update this document with your actual connection details (store securely):

```markdown
## Database Configuration

### capacity-planner.netlify.app
- **Database:** [Database name]
- **Project:** [Neon project name]
- **Connection String:** [Store securely, don't commit to git]

### capacity-planner-2.netlify.app
- **Database:** [Database name]
- **Project:** [Neon project name]
- **Connection String:** [Store securely, don't commit to git]
```

---

## Troubleshooting

### Issue: "Database connection failed"
- Verify connection string is correct
- Check database is accessible from Netlify
- Verify environment variable name is `NETLIFY_DATABASE_URL`

### Issue: "Table does not exist"
- Run migrations on the new database
- Verify schema matches between databases

### Issue: "Data appears on both sites"
- Verify environment variables are different
- Check Netlify site settings
- Redeploy both sites after changing environment variables

### Issue: "Migration fails"
- Check SQL syntax
- Verify database permissions
- Try running migrations one at a time

---

## Maintenance

### Keeping Schemas in Sync

When you add new migrations:
1. Run on both databases
2. Update `database/migrations/` folder
3. Document in this guide

### Backup Strategy

- Both databases should be backed up regularly
- Neon provides automatic backups
- Consider manual backups before major changes

---

## Security Notes

- **Never commit connection strings to git**
- Store connection strings securely
- Use environment variables only
- Rotate credentials periodically

---

## Next Steps After Setup

1. ✅ Verify both sites work independently
2. ✅ Test data isolation
3. ✅ Document connection details (securely)
4. ✅ Set up monitoring/alerts
5. ✅ Plan backup strategy
