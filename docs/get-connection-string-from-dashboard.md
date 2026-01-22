# Getting Connection String from Neon Dashboard

## From the Dashboard You're Currently Viewing

### Option 1: From the "Connect" Button (Easiest)

1. Click the **"Connect"** button in the top right of the Neon Console
2. This will show connection details including the connection string
3. Copy the connection string (it will look like: `postgresql://user:pass@ep-xxxx-xxxx.region.aws.neon.tech/dbname?sslmode=require`)

### Option 2: From Branch Settings

1. In the left sidebar, under **BRANCH** section, click on **"main"** (or expand the branch dropdown)
2. Look for connection details or settings
3. The connection string should be visible there

### Option 3: From Project Settings

1. In the left sidebar, click **"Settings"** under the **PROJECT** section
2. Look for **"Connection Details"** or **"Connection String"**
3. Copy the connection string

## Once You Have the Connection String

1. Create a `.env` file in your project root:
   ```bash
   NETLIFY_DATABASE_URL=postgresql://your-connection-string-here
   ```

2. Replace `your-connection-string-here` with the actual string you copied

3. Restart Netlify dev:
   ```bash
   pkill -f "netlify dev"
   npx netlify dev
   ```

## Quick Test

After setting up the `.env` file, you can test the connection by running:
```bash
curl http://localhost:8888/.netlify/functions/get-settings
```

This should return your settings from the database (or create default settings if none exist).
