# Manual Database Setup (Alternative to netlify db init)

Since `netlify db init` is encountering issues, we'll set up the database manually. This works just as well!

## Step 1: Create a Neon Database

1. **Sign up for Neon** (if you haven't already):
   - Go to https://neon.tech
   - Sign up with your email or GitHub account

2. **Create a Project**:
   - Click "Create a project"
   - Choose a project name (e.g., "capacity-planner")
   - Select a region (closest to you)
   - Click "Create project"

3. **Get Your Connection String**:
   - Neon will show you a connection string immediately
   - It looks like: `postgresql://username:password@host/database?sslmode=require`
   - Click the "Copy" button next to it

## Step 2: Add Connection String to Netlify

1. **Go to Netlify Dashboard**:
   - Visit https://app.netlify.com/projects/capacity-planner
   - Go to **Site settings** → **Build & deploy** → **Environment variables**

2. **Add Environment Variable**:
   - Click **"Add a variable"**
   - **Key**: `NETLIFY_DATABASE_URL`
   - **Value**: Paste your Neon connection string
   - **Scopes**: Select "All scopes" (or check "Production", "Deploy previews", "Branch deploys" as needed)
   - Click **"Add variable"**

## Step 3: Run Database Schema

Now you need to create the tables in your database:

1. **Connect to Your Database**:
   - Use a SQL client (like DBeaver, pgAdmin, or VS Code's PostgreSQL extension)
   - Or use `psql` if you have it installed:
     ```bash
     psql "your-connection-string-here"
     ```

2. **Run the Schema**:
   - Open `database/schema.sql` from your project
   - Copy all the SQL
   - Paste and execute it in your SQL client
   - Or via psql:
     ```bash
     psql "your-connection-string-here" -f database/schema.sql
     ```

## Step 4: Verify Setup

1. **Test Locally**:
   ```bash
   npm run dev:netlify
   ```

2. **Check Functions**:
   - Navigate to the Settings page in your app
   - It should load settings from the database
   - If you see errors, check the terminal output

## Alternative: Use Netlify Dashboard SQL Editor

If Neon provides a web-based SQL editor:
- Go to your Neon dashboard
- Open the SQL editor
- Paste and run `database/schema.sql`

## Benefits of Manual Setup

- ✅ Full control over database setup
- ✅ Works regardless of `netlify db init` issues
- ✅ Same end result as automated setup
- ✅ You have direct access to your database
