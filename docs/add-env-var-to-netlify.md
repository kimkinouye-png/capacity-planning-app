# Add NETLIFY_DATABASE_URL to Netlify Dashboard

## Why This Is Needed

Netlify dev exits when it can't fetch addons. Adding `NETLIFY_DATABASE_URL` as an environment variable in the Netlify dashboard allows Netlify dev to start successfully.

## Step-by-Step Instructions

### 1. Open Netlify Dashboard

Visit: https://app.netlify.com/

### 2. Select Your Site

Click on your site (or search for site ID: `e0e58877-9c44-433d-bbb2-c269cf0bf156`)

### 3. Go to Site Settings

- Click **Site settings** in the top navigation
- Or use the dropdown menu next to your site name

### 4. Navigate to Environment Variables

In the left sidebar:
- Click **Build & deploy**
- Click **Environment variables**

Or directly:
- Click **Environment variables** in the left sidebar

### 5. Add the Variable

Click **Add a variable** button

Fill in:
- **Key**: `NETLIFY_DATABASE_URL`
- **Value**: 
  ```
  postgresql://neondb_owner:npg_IXaLd9VOGU8k@ep-broad-credit-ah59j990-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
  ```
- **Scopes**: 
  - ✅ Check **Local development**
  - ✅ Check **All scopes** (recommended)

### 6. Save

Click **Save variable**

### 7. Test Netlify Dev

Go back to your terminal and run:

```bash
npx netlify dev
```

You should now see:
- ✅ No "Failed retrieving addons" error
- ✅ Server starting successfully
- ✅ "Netlify Dev now running..." message

### 8. Verify It Works

In a new terminal:

```bash
curl http://localhost:8888/.netlify/functions/get-settings
```

Should return JSON with your settings!

## What This Does

- Netlify dev can now fetch `NETLIFY_DATABASE_URL` from the dashboard
- No more addon fetch errors
- Functions can connect to your Neon database
- Both local development and production will use the same connection string

## Troubleshooting

**Still seeing the error?**
- Make sure you saved the variable in the dashboard
- Check that "Local development" scope is selected
- Try logging out and back into Netlify CLI: `npx netlify logout && npx netlify login`

**Connection string not working?**
- Verify the connection string is correct (no extra spaces or quotes)
- Check that your Neon database is accessible
- Test the connection string directly with a Postgres client

## Security Note

Your connection string contains your database password. It's stored securely in Netlify's dashboard and is encrypted. Only users with access to your Netlify site can see it.
