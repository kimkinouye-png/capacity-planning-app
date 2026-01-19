# How to Run the Database Schema in Neon

## Step 1: Access Neon Dashboard

**Option A: From Netlify (Easiest)**
1. In your Netlify dashboard, go to **Extensions** → **Neon**
2. Click on the database name: **`blue-silence-16655516`** (it's a clickable link)
3. This will open the Neon dashboard for your database

**Option B: Direct Access**
1. Go to https://console.neon.tech
2. Log in (use the same account that's connected to Netlify)
3. Find your project: `blue-silence-16655516`

## Step 2: Open SQL Editor

Once in the Neon dashboard:

1. **Look for "SQL Editor" in the left sidebar**
   - It might be labeled as "SQL Editor", "Query", or "Editor"
   - Usually has an icon like a terminal or code symbol

2. **Or look for a "Query" button/tab**
   - Some Neon interfaces have a "Query" tab at the top
   - Click on it to open the SQL editor

3. **Alternative: Look for a code/terminal icon**
   - In the main dashboard, there's usually a prominent button or section for running SQL queries

## Step 3: Enter and Run the Schema

1. **Open the SQL Editor**
   - You should see a text area or code editor where you can type SQL

2. **Get the Schema SQL**
   - Open `database/schema.sql` from your project
   - Copy ALL the contents (the entire file)

3. **Paste into Neon SQL Editor**
   - Paste the entire schema into the SQL editor
   - It should be one long SQL script with CREATE TABLE statements

4. **Execute the Query**
   - Click the "Run" or "Execute" button (usually green or blue)
   - Or press a keyboard shortcut (often Ctrl+Enter or Cmd+Enter)

5. **Verify Success**
   - You should see a success message
   - The tables should be created: `settings`, `scenarios`, `roadmap_items`, `activity_log`

## Visual Guide

The SQL Editor typically looks like:
```
┌─────────────────────────────────┐
│  SQL Editor                     │
├─────────────────────────────────┤
│                                 │
│  [Text area for SQL queries]    │
│                                 │
│                                 │
├─────────────────────────────────┤
│  [Run] [Clear] [Save]           │
└─────────────────────────────────┘
```

## If You Can't Find SQL Editor

If you don't see a SQL Editor option:

1. **Check if you're in the right project**
   - Make sure you're looking at `blue-silence-16655516`

2. **Try the Neon web interface**
   - Some Neon projects have a "Query" section in the main dashboard
   - Look for tabs like "Dashboard", "Branches", "Query", "Settings"

3. **Use a SQL Client Instead**
   - Download DBeaver (free): https://dbeaver.io
   - Or use VS Code with PostgreSQL extension
   - Connect using the connection string from Netlify
   - Run the schema.sql file

## Alternative: Using psql (Command Line)

If you have `psql` installed:

1. Get connection string from Netlify dashboard
2. Run:
   ```bash
   psql "your-connection-string" -f database/schema.sql
   ```
