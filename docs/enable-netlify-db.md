# Enabling Netlify DB on Your Site

The `netlify db init` command might be failing because Netlify DB needs to be enabled on your site first. Here's how to check and enable it:

## Option 1: Check Netlify Dashboard

1. **Go to your Netlify Dashboard**
   - Visit https://app.netlify.com
   - Open your site: `capacity-planner`

2. **Check Site Settings**
   - Go to **Site settings** → **General**
   - Look for **"Netlify DB"** or **"Database"** section
   - If it's not enabled, there should be an option to enable it

3. **Enable Netlify DB**
   - Click **"Enable Netlify DB"** or similar button
   - This will provision your Neon database automatically

## Option 2: Use Netlify API Directly

If the dashboard doesn't show the option, Netlify DB might need to be enabled via the API or might not be available yet for your account/region.

## Option 3: Manual Database Setup (Alternative)

If `netlify db init` continues to fail, you can set up the database manually:

1. **Get Database Connection String**
   - In Netlify Dashboard, go to **Site settings** → **Environment variables**
   - Look for `NETLIFY_DATABASE_URL` (it might be auto-generated)
   - Or create it manually if you have a Neon database connection string

2. **Run Schema Manually**
   - Connect to your database using the connection string
   - Run `database/schema.sql` to create the tables

3. **Test Connection**
   - Your Netlify Functions should work once `NETLIFY_DATABASE_URL` is set
   - The `@netlify/neon` package will automatically use this environment variable

## Troubleshooting

If Netlify DB isn't available:
- It might be in beta/early access
- Check Netlify's documentation for current availability
- Your existing setup with manual connection string should still work
