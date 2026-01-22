# Using Your Existing Neon Database

Great news! You already have a Neon database connected to your Netlify site. The database `blue-silence-16655516` is already linked.

## Step 1: Verify Environment Variable

The `NETLIFY_DATABASE_URL` should already be automatically set when you connected the database. Let's verify:

1. **Check Environment Variables**:
   - In Netlify Dashboard, go to **Site settings** → **Build & deploy** → **Environment variables**
   - Look for `NETLIFY_DATABASE_URL`
   - It should already be there (automatically added by the Neon extension)

If it's not visible, it might be a protected variable. That's okay - it's still available to your functions.

## Step 2: Get Connection String (if needed)

If you need the connection string to run the schema:

1. **Go to Neon Dashboard**:
   - Click on the database name `blue-silence-16655516` in Netlify
   - Or go to https://console.neon.tech
   - Find your database project

2. **Get Connection String**:
   - In Neon dashboard, go to your project
   - Look for "Connection string" or "Connection details"
   - Copy the connection string

## Step 3: Run Database Schema

Now you need to create the tables in your existing database:

1. **Option A: Use Neon SQL Editor**:
   - Go to https://console.neon.tech
   - Open your database project
   - Click on "SQL Editor" or "Query"
   - Open `database/schema.sql` from your project
   - Copy all the SQL
   - Paste and execute it

2. **Option B: Use psql** (if installed):
   ```bash
   psql "your-connection-string-here" -f database/schema.sql
   ```

3. **Option C: Use a SQL Client**:
   - Use DBeaver, pgAdmin, or VS Code PostgreSQL extension
   - Connect using the connection string
   - Run `database/schema.sql`

## Step 4: Verify Setup

After running the schema:

1. **Test Locally**:
   ```bash
   npm run dev:netlify
   ```

2. **Check Settings Page**:
   - Navigate to `/settings` in your app
   - It should load settings from the database

## Create New Database (Optional)

If you prefer to create a fresh database:

1. **In Netlify Dashboard**:
   - Click "Add new database" button
   - Follow the prompts
   - The connection string will be automatically set

2. **Run Schema**:
   - Get the connection string from Neon dashboard
   - Run `database/schema.sql` on the new database
